import { createRouter, createWebHistory } from 'vue-router'
import { useSessionStore } from '../stores/session'
// meta 统一描述访问要求；具名路由让组件不依赖具体 URL 拼接。
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('../layouts/CommunityLayout.vue'),
      children: [
        {
          path: '',
          name: 'discover',
          component: () => import('../views/DiscoverView.vue'),
          meta: { title: '发现' },
        },
        {
          path: 'following',
          name: 'following',
          component: () => import('../views/FeedView.vue'),
          meta: { title: '关注', auth: true },
        },
        {
          path: 'collections',
          name: 'collections',
          component: () => import('../views/FeedView.vue'),
          meta: { title: '我的收藏', auth: true },
        },
        {
          path: 'works/:id',
          name: 'work',
          component: () => import('../views/WorkDetailView.vue'),
          meta: { title: '作品详情' },
        },
        {
          path: 'users/:id',
          name: 'profile',
          component: () => import('../views/ProfileView.vue'),
          meta: { title: '画师主页' },
        },
        {
          path: 'me',
          name: 'me',
          component: () => import('../views/MeView.vue'),
          meta: { title: '我的', auth: true },
        },
        {
          path: 'artist/apply',
          name: 'apply',
          component: () => import('../views/ArtistApplyView.vue'),
          meta: { title: '画师申请', auth: true },
        },
        {
          path: 'messages',
          name: 'messages',
          component: () => import('../views/MessagesView.vue'),
          meta: { title: '消息', auth: true },
        },
        {
          path: 'messages/:id',
          name: 'conversation',
          component: () => import('../views/ConversationView.vue'),
          meta: { title: '私信', auth: true },
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('../views/SettingsView.vue'),
          meta: { title: '账号设置', auth: true },
        },
        {
          path: 'forbidden',
          name: 'forbidden',
          component: () => import('../views/StatusView.vue'),
          meta: { title: '无权访问' },
        },
        {
          path: ':pathMatch(.*)*',
          name: 'not-found',
          component: () => import('../views/StatusView.vue'),
          meta: { title: '页面不存在' },
        },
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/AuthView.vue'),
      meta: { title: '登录' },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/AuthView.vue'),
      meta: { title: '注册' },
    },
    {
      path: '/studio',
      component: () => import('../layouts/WorkspaceLayout.vue'),
      meta: { auth: true, role: 'artist' },
      children: [
        {
          path: '',
          name: 'studio',
          component: () => import('../views/StudioView.vue'),
          meta: { title: '创作中心' },
        },
        {
          path: 'works/new',
          name: 'work-new',
          component: () => import('../views/WorkEditorView.vue'),
          meta: { title: '发布作品' },
        },
        {
          path: 'works/:id/edit',
          name: 'work-edit',
          component: () => import('../views/WorkEditorView.vue'),
          meta: { title: '编辑作品' },
        },
      ],
    },
    {
      path: '/admin',
      component: () => import('../layouts/WorkspaceLayout.vue'),
      meta: { auth: true, role: 'admin' },
      children: [
        { path: '', redirect: { name: 'admin-applications' } },
        ...['applications', 'reports', 'works', 'users'].map((section, i) => ({
          path: section,
          name: `admin-${section}`,
          component: () => import('../views/AdminView.vue'),
          props: { section },
          meta: { title: ['画师审核', '举报处理', '作品管理', '账号管理'][i] },
        })),
      ],
    },
  ],
  scrollBehavior(to, from, saved) {
    return saved || { top: 0 }
  },
})
router.beforeEach(async (to) => {
  const session = useSessionStore()
  await session.refresh()
  if (to.meta.auth && !session.user) return { name: 'login', query: { redirect: to.fullPath } }
  if (to.meta.auth && session.user?.restricted) return { name: 'forbidden' }
  if (to.meta.role && session.user?.role !== to.meta.role) return { name: 'forbidden' }
  document.title = `${to.meta.title || '创作社区'} · Exix`
})
export default router
