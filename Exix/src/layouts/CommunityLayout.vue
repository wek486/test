<script setup>
import AppNavigation from '../components/navigation/AppNavigation.vue'
// 社区布局负责全站导航、公共宽度和底栏，不包含任何业务请求。
</script>
<template>
  <!-- 路由按完整路径刷新页面实例，避免不同作品或会话残留旧数据。 -->
  <AppNavigation />
  <main class="community-main"><RouterView :key="$route.fullPath" /></main>
  <footer class="site-footer">
    <span class="footer-logo">exix</span><span>每一份创作，都值得被看见。</span
    ><span>© 2026 Exix · 原创绘画社区</span>
  </footer>
</template>
<style scoped>
/* 公共最大宽度与手机边距集中在布局中维护。 */
.community-main {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 44px 36px 80px;
  min-height: calc(100vh - 220px);
}
.site-footer {
  max-width: var(--max-width);
  margin: auto;
  border-top: 1px solid var(--line);
  padding: 28px 36px;
  display: flex;
  align-items: center;
  gap: 24px;
  font-size: 11px;
  color: var(--muted);
}
.site-footer > span:last-child {
  margin-left: auto;
}
.footer-logo {
  font-family: var(--serif);
  font-size: 25px;
  letter-spacing: -2px;
  color: var(--ink);
}
@media (max-width: 680px) {
  .community-main {
    padding: 26px 20px 40px;
  }
  .site-footer {
    margin-bottom: 76px;
    padding: 22px 20px;
    gap: 12px;
    flex-wrap: wrap;
  }
  .site-footer > span:last-child {
    margin-left: 0;
    width: 100%;
  }
}
</style>
