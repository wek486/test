import {
  readDatabase,
  saveDatabase,
  getSessionId,
  setSessionId,
  resetDatabase,
} from '../mocks/database'
// 模拟服务是唯一数据访问入口。接入后端时保留这些方法的参数和返回形状，替换实现。
// 这里的权限校验只服务演示，正式上线必须由后端再次验证。
const db = () => readDatabase()
const uid = () => crypto.randomUUID()
const now = () => new Date().toISOString()
const cleanUser = (user) =>
  user
    ? Object.fromEntries(
        Object.entries(user).filter(([key]) => !['passwordHash', 'salt'].includes(key)),
      )
    : null
const me = () => db().users.find((u) => u.id === getSessionId())
function requireUser() {
  const u = me()
  if (!u) throw new Error('请先登录')
  if (u.restricted) throw new Error('账号已被限制，请联系管理员')
  return u
}
function requireAdmin() {
  const u = requireUser()
  if (u.role !== 'admin') throw new Error('没有管理权限')
  return u
}
function text(value, label, max = 2000) {
  const result = String(value || '').trim()
  if (!result) throw new Error(`请填写${label}`)
  if (result.length > max) throw new Error(`${label}最多 ${max} 字`)
  return result
}
function userView(id) {
  return cleanUser(db().users.find((u) => u.id === id))
}
function workView(w) {
  const id = me()?.id
  return {
    ...w,
    author: userView(w.authorId),
    liked: db().likes.some((x) => x.userId === id && x.workId === w.id),
    collected: db().collections.some((x) => x.userId === id && x.workId === w.id),
    likes: w.baseLikes + db().likes.filter((x) => x.workId === w.id).length,
  }
}
function visibleWork(id) {
  const w = db().works.find((w) => w.id === id)
  if (!w || w.hidden) throw new Error('作品不存在或已下架')
  return w
}
function notify(userId, message, path) {
  if (userId !== me()?.id)
    db().notifications.unshift({
      id: uid(),
      userId,
      text: message,
      path,
      read: false,
      createdAt: now(),
    })
}
function changed(result) {
  saveDatabase()
  return result
}
async function digest(password, salt) {
  const data = new TextEncoder().encode(salt + password)
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', data)), (n) =>
    n.toString(16).padStart(2, '0'),
  ).join('')
}
function conversation(id) {
  const u = requireUser()
  const c = db().conversations.find((c) => c.id === id && c.members.includes(u.id))
  if (!c) throw new Error('会话不存在或无权访问')
  return c
}
function canMessage(from, to) {
  if (!to || to.restricted) throw new Error('对方暂时无法接收消息')
  if (
    db().blocks.some(
      (b) =>
        (b.userId === from.id && b.targetId === to.id) ||
        (b.userId === to.id && b.targetId === from.id),
    )
  )
    throw new Error('已拉黑或被对方拉黑，无法发送消息')
  if (!to.allowStrangers && !db().follows.some((f) => f.userId === to.id && f.targetId === from.id))
    throw new Error('对方仅接收已关注用户的私信')
}

export const community = {
  async currentUser() {
    return cleanUser(me())
  },
  async login({ email, password }) {
    const user = db().users.find((u) => u.email === email.trim().toLowerCase())
    const valid = user?.passwordHash
      ? (await digest(password, user.salt)) === user.passwordHash
      : user && ['u1', 'a1', 'admin'].includes(user.id) && password === 'Exix2026!'
    if (!valid) throw new Error('邮箱或密码不正确')
    if (user.restricted) throw new Error('账号已被限制，请联系管理员')
    setSessionId(user.id)
    return cleanUser(user)
  },
  async register({ name, email, password }) {
    email = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('请输入有效邮箱')
    if (db().users.some((u) => u.email === email)) throw new Error('邮箱已注册')
    if (password.length < 8 || password.length > 128) throw new Error('密码长度需为 8–128 位')
    const salt = uid()
    const passwordHash = await digest(password, salt)
    const user = {
      id: uid(),
      name: text(name, '昵称', 24),
      email,
      salt,
      passwordHash,
      role: 'user',
      bio: '',
      avatar: name.trim().slice(0, 1),
      hue: '#d6e4df',
      allowStrangers: true,
      restricted: false,
    }
    db().users.push(user)
    changed()
    setSessionId(user.id)
    return cleanUser(user)
  },
  async logout() {
    setSessionId(null)
  },
  async listWorks({ feed = 'latest', authorId } = {}) {
    const u = feed === 'following' || feed === 'collections' ? requireUser() : me()
    return db()
      .works.filter((w) => !w.hidden && (!authorId || w.authorId === authorId))
      .filter(
        (w) =>
          feed !== 'following' ||
          db().follows.some((f) => f.userId === u.id && f.targetId === w.authorId),
      )
      .filter(
        (w) =>
          feed !== 'collections' ||
          db().collections.some((c) => c.userId === u.id && c.workId === w.id),
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(workView)
  },
  async getWork(id) {
    return workView(visibleWork(id))
  },
  async getProfile(id) {
    const user = userView(id)
    if (!user) throw new Error('用户不存在')
    return {
      ...user,
      following: db().follows.some((f) => f.userId === me()?.id && f.targetId === id),
      followers: db().follows.filter((f) => f.targetId === id).length,
      followingCount: db().follows.filter((f) => f.userId === id).length,
    }
  },
  async toggleFollow(targetId) {
    const u = requireUser()
    if (u.id === targetId || !userView(targetId)) throw new Error('无法关注此用户')
    const found = db().follows.findIndex((f) => f.userId === u.id && f.targetId === targetId)
    found < 0 ? db().follows.push({ userId: u.id, targetId }) : db().follows.splice(found, 1)
    if (found < 0) notify(targetId, `${u.name} 关注了你`, `/users/${u.id}`)
    return changed(found < 0)
  },
  async toggleReaction(id, type) {
    const u = requireUser()
    visibleWork(id)
    if (!['likes', 'collections'].includes(type)) throw new Error('无效操作')
    const list = db()[type]
    const i = list.findIndex((x) => x.userId === u.id && x.workId === id)
    i < 0 ? list.push({ userId: u.id, workId: id }) : list.splice(i, 1)
    return changed(workView(visibleWork(id)))
  },
  async listComments(workId) {
    visibleWork(workId)
    return db()
      .comments.filter((c) => c.workId === workId)
      .map((c) => ({ ...c, user: userView(c.userId) }))
  },
  async addComment({ workId, content, parentId = null }) {
    const u = requireUser()
    const w = visibleWork(workId)
    const parent = parentId
      ? db().comments.find((c) => c.id === parentId && c.workId === workId && !c.parentId)
      : null
    if (parentId && !parent) throw new Error('回复的评论已不存在')
    db().comments.push({
      id: uid(),
      workId,
      userId: u.id,
      text: text(content, '评论', 1000),
      parentId,
      createdAt: now(),
    })
    notify(
      parent?.userId || w.authorId,
      `${u.name} ${parent ? '回复了你的评论' : '评论了你的作品'}`,
      `/works/${workId}`,
    )
    changed()
  },
  async deleteComment(id) {
    const u = requireUser()
    const c = db().comments.find((c) => c.id === id)
    if (!c || (c.userId !== u.id && u.role !== 'admin')) throw new Error('无法删除此评论')
    db().comments = db().comments.filter((c) => c.id !== id && c.parentId !== id)
    changed()
  },
  async saveWork(payload) {
    const u = requireUser()
    if (u.role !== 'artist') throw new Error('通过画师审核后才能发布')
    const existing = payload.id && db().works.find((w) => w.id === payload.id)
    if (payload.id && (!existing || existing.authorId !== u.id)) throw new Error('无权编辑此作品')
    if (!payload.images?.length || payload.images.length > 9) throw new Error('请上传 1–9 张图片')
    const fields = {
      title: text(payload.title, '标题', 80),
      description: String(payload.description || '').slice(0, 2000),
      tags: payload.tags.slice(0, 5),
      images: [...payload.images],
    }
    const w = existing || {
      id: uid(),
      authorId: u.id,
      hidden: false,
      createdAt: now(),
      baseLikes: 0,
    }
    Object.assign(w, fields)
    if (!existing) db().works.unshift(w)
    return changed(workView(w))
  },
  async myWorks() {
    const u = requireUser()
    return db()
      .works.filter((w) => w.authorId === u.id)
      .map(workView)
  },
  async deleteWork(id) {
    const u = requireUser()
    const w = db().works.find((w) => w.id === id)
    if (!w || (w.authorId !== u.id && u.role !== 'admin')) throw new Error('无法删除此作品')
    db().works = db().works.filter((w) => w.id !== id)
    changed()
  },
  async getApplication() {
    const u = requireUser()
    return db().applications.find((a) => a.userId === u.id) || null
  },
  async applyArtist(payload) {
    const u = requireUser()
    if (u.role !== 'user') throw new Error('当前身份无需申请')
    const old = db().applications.find((a) => a.userId === u.id)
    if (old?.status === 'pending') throw new Error('申请正在审核中')
    if (!payload.images?.length) throw new Error('请上传代表作品')
    const a = {
      id: old?.id || uid(),
      userId: u.id,
      bio: text(payload.bio, '创作介绍', 1000),
      link: String(payload.link || '').slice(0, 500),
      images: [...payload.images],
      status: 'pending',
      reason: '',
      createdAt: now(),
    }
    db().applications = db().applications.filter((a) => a.userId !== u.id)
    db().applications.push(a)
    changed()
  },
  async startConversation(targetId) {
    const u = requireUser()
    if (targetId === u.id) throw new Error('不能给自己发送私信')
    canMessage(
      u,
      db().users.find((u) => u.id === targetId),
    )
    let c = db().conversations.find((c) => c.members.includes(u.id) && c.members.includes(targetId))
    if (!c) {
      c = { id: uid(), members: [u.id, targetId] }
      db().conversations.push(c)
    }
    return changed(c.id)
  },
  async inbox() {
    const u = requireUser()
    return {
      notifications: db().notifications.filter((n) => n.userId === u.id),
      conversations: db()
        .conversations.filter((c) => c.members.includes(u.id))
        .map((c) => {
          const messages = db().messages.filter((m) => m.conversationId === c.id)
          return {
            ...c,
            peer: userView(c.members.find((id) => id !== u.id)),
            last: messages.at(-1),
            unread: messages.filter((m) => !m.readBy.includes(u.id)).length,
          }
        }),
    }
  },
  async getConversation(id) {
    const c = conversation(id)
    return {
      ...c,
      peer: userView(c.members.find((id) => id !== me().id)),
      messages: db().messages.filter((m) => m.conversationId === id),
    }
  },
  async sendMessage({ conversationId, content, clientId }) {
    const u = requireUser()
    const c = conversation(conversationId)
    canMessage(
      u,
      db().users.find((u) => u.id === c.members.find((id) => id !== me().id)),
    )
    if (db().messages.some((m) => m.id === clientId)) return
    db().messages.push({
      id: clientId || uid(),
      conversationId,
      senderId: u.id,
      text: text(content, '消息', 2000),
      createdAt: now(),
      readBy: [u.id],
    })
    changed()
  },
  async markRead(id) {
    const u = requireUser()
    conversation(id)
    db()
      .messages.filter((m) => m.conversationId === id)
      .forEach((m) => {
        if (!m.readBy.includes(u.id)) m.readBy.push(u.id)
      })
    changed()
  },
  async readNotification(id) {
    const u = requireUser()
    const n = db().notifications.find((n) => n.id === id && n.userId === u.id)
    if (n) n.read = true
    changed()
  },
  async block(targetId) {
    const u = requireUser()
    if (!userView(targetId) || targetId === u.id) throw new Error('无法拉黑此用户')
    if (!db().blocks.some((b) => b.userId === u.id && b.targetId === targetId))
      db().blocks.push({ userId: u.id, targetId })
    changed()
  },
  async unblock(targetId) {
    const u = requireUser()
    db().blocks = db().blocks.filter((b) => !(b.userId === u.id && b.targetId === targetId))
    changed()
  },
  async settings() {
    const u = requireUser()
    return {
      user: cleanUser(u),
      blocks: db()
        .blocks.filter((b) => b.userId === u.id)
        .map((b) => userView(b.targetId)),
    }
  },
  async saveSettings(payload) {
    const u = requireUser()
    u.name = text(payload.name, '昵称', 24)
    u.avatar = u.name.slice(0, 1)
    u.bio = String(payload.bio || '').slice(0, 300)
    u.allowStrangers = !!payload.allowStrangers
    return changed(cleanUser(u))
  },
  async report({ type, targetId, reason }) {
    const u = requireUser()
    db().reports.unshift({
      id: uid(),
      userId: u.id,
      type,
      targetId,
      reason: text(reason, '举报原因', 500),
      status: 'pending',
      createdAt: now(),
    })
    changed()
  },
  async adminData(type) {
    requireAdmin()
    if (type === 'applications')
      return db().applications.map((a) => ({ ...a, user: userView(a.userId) }))
    if (type === 'reports')
      return db().reports.map((r) => ({
        ...r,
        user: userView(r.userId),
        targetLabel:
          r.type === 'work'
            ? db().works.find((w) => w.id === r.targetId)?.title || '作品已删除'
            : userView(r.targetId)?.name || r.targetId,
      }))
    if (type === 'works') return db().works.map(workView)
    if (type === 'users') return db().users.map(cleanUser)
    throw new Error('管理模块不存在')
  },
  async reviewApplication({ id, approve, reason }) {
    requireAdmin()
    const a = db().applications.find((a) => a.id === id)
    if (!a || a.status !== 'pending') throw new Error('申请已处理')
    a.status = approve ? 'approved' : 'rejected'
    a.reason = approve ? '' : text(reason, '驳回原因', 500)
    if (approve) db().users.find((u) => u.id === a.userId).role = 'artist'
    notify(
      a.userId,
      approve ? '你的画师申请已通过，开始创作吧！' : `画师申请未通过：${a.reason}`,
      '/artist/apply',
    )
    changed()
  },
  async resolveReport(id) {
    requireAdmin()
    const r = db().reports.find((r) => r.id === id)
    if (!r) throw new Error('举报不存在')
    r.status = 'resolved'
    changed()
  },
  async toggleHidden(id) {
    requireAdmin()
    const w = db().works.find((w) => w.id === id)
    if (!w) throw new Error('作品不存在')
    w.hidden = !w.hidden
    changed()
  },
  async toggleRestricted(id) {
    const u = requireAdmin()
    if (id === u.id) throw new Error('不能限制自己的账号')
    const target = db().users.find((u) => u.id === id)
    if (!target) throw new Error('用户不存在')
    target.restricted = !target.restricted
    changed()
  },
  async resetDemo() {
    resetDatabase()
  },
}
