<script setup>
// 私人中心：按身份组合导航入口，账号信息来自 session store。
import { useRouter } from 'vue-router'
import { useSessionStore } from '../stores/session'
import UserAvatar from '../components/common/UserAvatar.vue'
import { roleLabel } from '../utils/format'
const session = useSessionStore(),
  router = useRouter()
// 私人中心仅组合账号与导航入口，资料修改在设置页完成。
async function logout() {
  await session.logout()
  router.push('/')
}
</script>
<template>
  <!-- 功能入口依据身份显示，真正访问权限仍由路由和服务校验。 -->
  <section v-if="session.user" class="me-page">
    <p class="eyebrow">YOUR LITTLE CORNER</p>
    <h1 class="page-title">我的空间</h1>
    <div class="panel me-card">
      <UserAvatar :user="session.user" large />
      <h2>{{ session.user.name }}</h2>
      <p>{{ roleLabel(session.user.role) }}</p>
      <RouterLink :to="{ name: 'profile', params: { id: session.user.id } }" class="text-link"
        >查看个人主页 ↗</RouterLink
      >
    </div>
    <div class="panel menu-list">
      <RouterLink to="/collections">我的收藏 <span>↗</span></RouterLink
      ><RouterLink to="/messages">消息通知 <span>↗</span></RouterLink
      ><RouterLink v-if="session.user.role === 'artist'" to="/studio"
        >创作中心 <span>↗</span></RouterLink
      ><RouterLink v-else-if="session.user.role === 'admin'" to="/admin"
        >管理后台 <span>↗</span></RouterLink
      ><RouterLink v-else to="/artist/apply">申请成为画师 / 查看申请 <span>↗</span></RouterLink
      ><RouterLink to="/settings">资料、隐私与拉黑管理 <span>↗</span></RouterLink
      ><button @click="logout">退出登录 <span>→</span></button>
    </div>
  </section>
</template>
<style scoped>
/* 个人中心控制阅读宽度；菜单整行可点击，方便手机操作。 */
.me-page {
  max-width: 650px;
  margin: auto;
}
.me-card {
  text-align: center;
  padding: 32px;
}
.me-card h2 {
  margin: 18px 0 9px;
  font-family: var(--serif);
  font-weight: 400;
}
.me-card p {
  font-size: 12px;
  color: var(--muted);
  margin-bottom: 18px;
}
.menu-list {
  margin-top: 20px;
  padding: 8px 24px;
}
.menu-list a,
.menu-list button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 21px 0;
  font-size: 13px;
  border: 0;
  border-bottom: 1px solid var(--line);
  background: none;
  text-align: left;
  color: var(--ink);
  cursor: pointer;
}
.menu-list button {
  border-bottom: 0;
  color: var(--muted);
}
.menu-list span {
  color: var(--muted);
}
</style>
