<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSessionStore } from '../../stores/session'
import { community } from '../../services/community'
import UserAvatar from '../common/UserAvatar.vue'
const route = useRoute(),
  router = useRouter(),
  session = useSessionStore()
const unread = ref(0)
let timer,
  sequence = 0
// 未读只在可见页面轮询；身份切换后清空旧值，避免泄露前一个账号状态。
async function loadUnread() {
  const current = ++sequence
  if (!session.user) {
    unread.value = 0
    return
  }
  try {
    const inbox = await community.inbox()
    if (current === sequence)
      unread.value =
        inbox.notifications.filter((n) => !n.read).length +
        inbox.conversations.reduce((sum, c) => sum + c.unread, 0)
  } catch {
    if (current === sequence) unread.value = 0
  }
}
function visibleRefresh() {
  if (!document.hidden) loadUnread()
}
watch(() => [session.user?.id, route.fullPath], loadUnread)
onMounted(() => {
  loadUnread()
  timer = setInterval(visibleRefresh, 30000)
  document.addEventListener('visibilitychange', visibleRefresh)
})
onBeforeUnmount(() => {
  sequence++
  clearInterval(timer)
  document.removeEventListener('visibilitychange', visibleRefresh)
})
async function logout() {
  await session.logout()
  unread.value = 0
  router.push({ name: 'discover' })
}
</script>
<template>
  <!-- 电脑顶部主导航与手机底部导航共用路由，激活状态由 RouterLink 管理。 -->
  <header class="site-header">
    <div class="header-inner">
      <RouterLink to="/" class="brand">exix<span>创作，让我们相遇。</span></RouterLink>
      <nav class="desktop-nav" aria-label="主导航">
        <RouterLink to="/" exact-active-class="active">发现</RouterLink
        ><RouterLink to="/following" active-class="active">关注</RouterLink>
      </nav>
      <div class="header-actions">
        <RouterLink class="message-nav" to="/messages"
          >消息<span v-if="unread" class="unread">{{
            unread > 99 ? '99+' : unread
          }}</span></RouterLink
        ><RouterLink v-if="session.user?.role === 'artist'" class="publish-link" to="/studio"
          >＋ 创作中心</RouterLink
        ><RouterLink v-if="session.user?.role === 'admin'" class="publish-link" to="/admin"
          >管理后台</RouterLink
        ><el-dropdown v-if="session.user" trigger="click"
          ><button class="avatar-trigger" aria-label="账号菜单">
            <UserAvatar :user="session.user" /></button
          ><template #dropdown
            ><el-dropdown-menu
              ><el-dropdown-item @click="router.push('/me')">我的主页</el-dropdown-item
              ><el-dropdown-item @click="router.push('/settings')">账号设置</el-dropdown-item
              ><el-dropdown-item divided @click="logout"
                >退出登录</el-dropdown-item
              ></el-dropdown-menu
            ></template
          ></el-dropdown
        ><RouterLink v-else to="/login" class="login-link">登录 / 注册 ↗</RouterLink>
      </div>
    </div>
  </header>
  <nav class="mobile-nav" aria-label="手机导航">
    <RouterLink to="/" exact-active-class="active"><span>◈</span>发现</RouterLink
    ><RouterLink to="/following" active-class="active"><span>♡</span>关注</RouterLink
    ><RouterLink to="/messages" active-class="active"
      ><span>▤<i v-if="unread"></i></span>消息</RouterLink
    ><RouterLink to="/me" active-class="active"><span>◯</span>我的</RouterLink>
  </nav>
</template>
<style scoped>
/* 顶栏保持轻薄留白；手机底栏预留安全区，实际内容留白由布局负责。 */
.site-header {
  height: 88px;
  border-bottom: 1px solid var(--line);
  background: var(--surface);
}
.header-inner {
  max-width: var(--max-width);
  padding: 0 36px;
  height: 100%;
  margin: auto;
  display: flex;
  align-items: center;
  gap: 48px;
}
.brand {
  font-family: var(--serif);
  font-size: 38px;
  letter-spacing: -3px;
  display: flex;
  align-items: center;
  gap: 22px;
}
.brand span {
  font-family: var(--sans);
  font-size: 11px;
  color: var(--muted);
  letter-spacing: 1px;
}
.desktop-nav {
  display: flex;
  gap: 30px;
  align-self: stretch;
}
.desktop-nav a {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: var(--muted);
  position: relative;
}
.desktop-nav .active {
  color: var(--ink);
}
.desktop-nav .active:after {
  content: '';
  position: absolute;
  bottom: 0;
  height: 2px;
  left: 0;
  right: 0;
  background: var(--accent);
}
.header-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 24px;
  font-size: 13px;
}
.publish-link {
  padding: 10px 16px;
  background: var(--accent);
  color: white;
  border-radius: 7px;
}
.message-nav {
  position: relative;
}
.unread {
  position: absolute;
  top: -10px;
  right: -15px;
  font-size: 9px;
  background: var(--accent);
  color: white;
  padding: 2px 5px;
  border-radius: 10px;
}
.avatar-trigger {
  border: 0;
  padding: 0;
  background: none;
  cursor: pointer;
}
.login-link {
  font-weight: 600;
}
.mobile-nav {
  display: none;
}
@media (max-width: 900px) {
  .brand span {
    display: none;
  }
  .header-inner {
    gap: 30px;
    padding: 0 24px;
  }
}
@media (max-width: 680px) {
  .site-header {
    height: 70px;
  }
  .header-inner {
    padding: 0 20px;
  }
  .brand {
    font-size: 34px;
  }
  .desktop-nav,
  .message-nav {
    display: none;
  }
  .header-actions {
    gap: 12px;
    font-size: 12px;
  }
  .publish-link {
    padding: 8px 10px;
  }
  .mobile-nav {
    display: flex;
    position: fixed;
    z-index: 30;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 8px 8px calc(8px + env(safe-area-inset-bottom));
    background: #fffefbf5;
    border-top: 1px solid var(--line);
    backdrop-filter: blur(12px);
    justify-content: space-around;
  }
  .mobile-nav a {
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 4px;
    color: var(--muted);
    font-size: 10px;
    min-width: 52px;
  }
  .mobile-nav a > span {
    font-size: 21px;
    position: relative;
    line-height: 24px;
  }
  .mobile-nav .active {
    color: var(--accent);
    font-weight: 600;
  }
  .mobile-nav i {
    position: absolute;
    right: -5px;
    top: 0;
    background: var(--accent);
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }
}
</style>
