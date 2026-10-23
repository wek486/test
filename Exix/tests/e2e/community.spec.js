import { test, expect } from '@playwright/test'

// 每个流程同时捕获运行时异常，避免页面看似正常但组件内部出错。
test.beforeEach(async ({ page }) => {
  page.__errors = []
  page.on('pageerror', (error) => page.__errors.push(error.message))
})
test.afterEach(async ({ page }) => {
  expect(page.__errors).toEqual([])
})

async function login(page, identity = 'user', redirect = '') {
  await page.goto('/login' + (redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''))
  await page.getByLabel('邮箱', { exact: true }).fill(`${identity}@exix.demo`)
  await page.getByLabel('密码', { exact: true }).fill('Exix2026!')
  await page.getByRole('button', { name: '登录社区' }).click()
  await expect(page).not.toHaveURL(/\/login/)
}
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jVAAAAABJRU5ErkJggg==',
  'base64',
)

test('登录校验、失败反馈、返回原页面及角色拦截', async ({ page }) => {
  await page.goto('/collections')
  await expect(page).toHaveURL(/login.*redirect/)
  await page.getByRole('button', { name: '登录社区' }).click()
  await expect(page.getByText('请填写邮箱', { exact: true })).toBeVisible()
  await page.getByLabel('邮箱', { exact: true }).fill('user@exix.demo')
  await page.getByLabel('密码', { exact: true }).fill('wrong-password')
  await page.getByRole('button', { name: '登录社区' }).click()
  await expect(page.getByText('邮箱或密码不正确', { exact: true })).toBeVisible()
  await page.getByLabel('密码', { exact: true }).fill('Exix2026!')
  await page.getByRole('button', { name: '登录社区' }).click()
  await expect(page).toHaveURL(/\/collections$/)
  await page.goto('/studio')
  await expect(page).toHaveURL(/\/forbidden$/)
  await page.goto('/me')
  await page.getByRole('button', { name: '退出登录' }).click()
  await expect(page).toHaveURL(/5175\/$/)
  await page.goto('/collections')
  await expect(page).toHaveURL(/\/login/)
})

test('注册校验和新账号登录，密码不以明文持久化', async ({ page }) => {
  await page.goto('/register')
  await page.getByLabel('昵称', { exact: true }).fill('新来的画笔')
  await page.getByLabel('邮箱', { exact: true }).fill('new@exix.demo')
  await page.getByLabel('密码', { exact: true }).fill('MyPassword2026!')
  await page.getByLabel('确认密码', { exact: true }).fill('different')
  await page.getByRole('button', { name: '创建账号' }).click()
  await expect(page.getByText('两次输入的密码不一致')).toBeVisible()
  await page.getByLabel('确认密码', { exact: true }).fill('MyPassword2026!')
  await page.getByRole('button', { name: '创建账号' }).click()
  await expect(page).toHaveURL(/5175\/$/)
  const storage = await page.evaluate(() => localStorage.getItem('exix-demo-v1'))
  expect(storage).not.toContain('MyPassword2026!')
  await page.goto('/me')
  await page.getByRole('button', { name: '退出登录' }).click()
  await page.goto('/login')
  await page.getByLabel('邮箱', { exact: true }).fill('new@exix.demo')
  await page.getByLabel('密码', { exact: true }).fill('MyPassword2026!')
  await page.getByRole('button', { name: '登录社区' }).click()
  await expect(page).toHaveURL(/5175\/$/)
})

test('作品详情、评论回复、收藏持久化与大图', async ({ page }) => {
  await login(page, 'user', '/works/w1')
  await page.getByRole('button', { name: '☆ 收藏' }).click()
  await expect(page.getByRole('button', { name: '★ 已收藏' })).toBeVisible()
  await page.getByLabel('评论内容').fill('这一片山色很温柔。')
  await page.getByRole('button', { name: '发表评论' }).click()
  await expect(page.getByText('这一片山色很温柔。', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: '回复', exact: true }).first().click()
  await page.getByLabel('评论内容').fill('希望看到更多作品！')
  await page.getByRole('button', { name: '发表评论' }).click()
  await expect(page.getByText('希望看到更多作品！', { exact: true })).toBeVisible()
  await page.locator('.art-image').first().click()
  await expect(page.locator('.el-image-viewer__wrapper')).toBeVisible()
  await page.keyboard.press('Escape')
  await page.goto('/collections')
  await expect(page.locator('.work-card')).toHaveCount(1)
  await page.reload()
  await expect(page.locator('.work-card')).toHaveCount(1)
})

test('普通用户申请、管理员审核、原账号发布编辑的完整闭环', async ({ page }) => {
  await login(page, 'user', '/artist/apply')
  await page.getByLabel('创作介绍').fill('喜欢山海与植物，分享原创插画。')
  await page
    .getByLabel('上传图片')
    .setInputFiles({ name: 'sample.png', mimeType: 'image/png', buffer: png })
  await page.getByRole('button', { name: '提交申请' }).click()
  await expect(page.getByText('审核中', { exact: true })).toBeVisible()
  await login(page, 'admin', '/admin/applications')
  await page.getByRole('button', { name: '通过审核' }).click()
  await page.getByRole('button', { name: '确认', exact: true }).click()
  await expect(page.getByText('已通过', { exact: true })).toBeVisible()
  await login(page, 'user', '/studio/works/new')
  await page
    .getByLabel('上传图片')
    .setInputFiles({ name: 'my-work.png', mimeType: 'image/png', buffer: png })
  await page.getByLabel('作品标题').fill('我的第一幅画')
  await page.getByLabel('作品说明').fill('一次新的开始。')
  await page.getByLabel('标签', { exact: true }).fill('原创，风景')
  await page.getByRole('button', { name: '发布作品' }).click()
  await expect(page.getByRole('heading', { name: '我的第一幅画', exact: true })).toBeVisible()
  await page.goto('/studio')
  await page.getByRole('link', { name: '编辑', exact: true }).click()
  await page.getByLabel('作品标题').fill('我的第一幅画 · 修改')
  await page.getByRole('button', { name: '保存修改' }).click()
  await expect(
    page.getByRole('heading', { name: '我的第一幅画 · 修改', exact: true }),
  ).toBeVisible()
  await page.reload()
  await expect(page.locator('.art-image img')).toHaveAttribute('src', '/art/upload-placeholder.svg')
})

test('私信已读、拉黑限制、解除拉黑和失败保留输入', async ({ page }) => {
  await login(page, 'user', '/messages/conv1')
  await page.getByLabel('私信内容').fill('你好，很喜欢你的作品！')
  await page.getByRole('button', { name: '发送', exact: false }).click()
  await expect(page.getByText('你好，很喜欢你的作品！', { exact: true })).toBeVisible()
  await login(page, 'artist', '/messages/conv1')
  await expect(page.getByText('你好，很喜欢你的作品！', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: '会话操作' }).click()
  await page.getByRole('menuitem', { name: '拉黑用户' }).click()
  await page.getByRole('button', { name: '确认', exact: true }).click()
  await page.getByLabel('私信内容').fill('这条不会发送')
  await page.getByRole('button', { name: '发送', exact: false }).click()
  await expect(page.locator('.send-error')).toContainText('无法发送消息')
  await expect(page.getByLabel('私信内容')).toHaveValue('这条不会发送')
  await page.goto('/settings')
  await page.getByRole('button', { name: '解除拉黑' }).click()
  await expect(page.getByText('没有拉黑的用户。')).toBeVisible()
})

test('手机页面无横向溢出，失效作品及404可返回', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await login(page, 'artist')
  for (const path of [
    '/',
    '/works/w1',
    '/users/a1',
    '/me',
    '/studio',
    '/studio/works/new',
    '/messages',
    '/settings',
    '/missing',
  ]) {
    await page.goto(path)
    await expect(page.locator('body')).toBeVisible()
    await page.waitForTimeout(120)
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      `页面不应横向溢出：${path}`,
    ).toBeTruthy()
  }
  await page.goto('/works/not-existing')
  await expect(page.getByText('作品不存在或已下架')).toBeVisible()
  await page.goto('/login')
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    '登录页不应横向溢出',
  ).toBeTruthy()
})

test('后台隐藏作品后公开不可访问，限制账号后不能重新登录', async ({ page }) => {
  await login(page, 'admin', '/admin/works')
  await page.getByRole('button', { name: '隐藏作品', exact: true }).first().click()
  await page.getByRole('button', { name: '确认', exact: true }).click()
  await page.goto('/works/w1')
  await expect(page.getByText('作品不存在或已下架')).toBeVisible()
  await page.goto('/admin/users')
  await page.getByRole('button', { name: '限制账号', exact: true }).first().click()
  await page.getByRole('button', { name: '确认', exact: true }).click()
  await page.goto('/login')
  await page.getByLabel('邮箱', { exact: true }).fill('user@exix.demo')
  await page.getByLabel('密码', { exact: true }).fill('Exix2026!')
  await page.getByRole('button', { name: '登录社区' }).click()
  await expect(page.getByText('账号已被限制，请联系管理员', { exact: true })).toBeVisible()
})

test('服务权限、陌生人消息限制与错误重试不丢失评论', async ({ page }) => {
  await login(page, 'user', '/works/w1')
  const denied = await page.evaluate(async () => {
    const { community } = await import('/src/services/community.js')
    const errors = []
    for (const task of [
      () => community.adminData('users'),
      () => community.saveWork({ title: '越权作品', images: ['/art/work-1.svg'], tags: [] }),
      () => community.getConversation('unknown'),
    ]) {
      try {
        await task()
      } catch (e) {
        errors.push(e.message)
      }
    }
    const original = community.addComment
    community.addComment = async () => {
      community.addComment = original
      throw new Error('模拟请求失败，请重试')
    }
    return errors
  })
  expect(denied).toHaveLength(3)
  await page.getByLabel('评论内容').fill('失败后也要保留这段文字')
  await page.getByRole('button', { name: '发表评论' }).click()
  await expect(page.getByText('模拟请求失败，请重试', { exact: true })).toBeVisible()
  await expect(page.getByLabel('评论内容')).toHaveValue('失败后也要保留这段文字')
  await page.getByRole('button', { name: '发表评论' }).click()
  await expect(page.getByText('失败后也要保留这段文字', { exact: true })).toBeVisible()
  await login(page, 'artist', '/settings')
  await page.locator('.el-switch').click()
  await page.getByRole('button', { name: '保存设置' }).click()
  await login(page, 'user', '/messages/conv1')
  await page.getByLabel('私信内容').fill('陌生人消息测试')
  await page.getByRole('button', { name: '发送', exact: false }).click()
  await expect(page.locator('.send-error')).toContainText('对方仅接收已关注用户的私信')
})

test('界面截图与本地图片加载验收', async ({ page }) => {
  const output = 'D:/Software/ai/codex/2026-10-08/new-chat/outputs'
  await page.setViewportSize({ width: 1440, height: 1080 })
  await page.goto('/')
  await expect(page.locator('.work-card')).toHaveCount(8)
  await expect
    .poll(() =>
      page
        .locator('.work-card img')
        .evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0)),
    )
    .toBeTruthy()
  await page.screenshot({ path: `${output}/exix-gallery-desktop.png`, fullPage: true })
  await page.goto('/login')
  await expect(page.getByRole('heading', { name: '好久不见，欢迎回来。' })).toBeVisible()
  await page.screenshot({ path: `${output}/exix-login-desktop.png`, fullPage: true })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await expect(page.locator('.work-card')).toHaveCount(8)
  await page.screenshot({ path: `${output}/exix-gallery-mobile.png`, fullPage: true })
  await page.goto('/login')
  await page.screenshot({ path: `${output}/exix-login-mobile.png`, fullPage: true })
})
