<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppNavigation from '../components/navigation/AppNavigation.vue'
const route = useRoute()
// 后台与创作区共用布局，通过路由切换菜单，不把业务模块混入布局。
const admin = computed(() => route.path.startsWith('/admin'))
const links = computed(() =>
  admin.value
    ? [
        ['画师审核', '/admin/applications'],
        ['举报处理', '/admin/reports'],
        ['作品管理', '/admin/works'],
        ['账号管理', '/admin/users'],
      ]
    : [
        ['我的作品', '/studio'],
        ['发布作品', '/studio/works/new'],
        ['个人设置', '/settings'],
      ],
)
</script>
<template>
  <!-- 电脑侧栏与手机横向菜单使用同一组导航配置。 -->
  <AppNavigation />
  <div class="workspace">
    <aside>
      <p class="eyebrow">{{ admin ? 'COMMUNITY CARE' : 'CREATOR SPACE' }}</p>
      <h2>{{ admin ? '管理后台' : '创作中心' }}</h2>
      <nav aria-label="工作区导航">
        <RouterLink
          v-for="[label, path] in links"
          :key="path"
          :to="path"
          exact-active-class="selected"
          >{{ label }} <span>↗</span></RouterLink
        >
      </nav>
      <p class="aside-note">
        {{ admin ? '维护友善交流，守护原创表达。' : '让灵感慢慢发生，让作品与世界相遇。' }}
      </p>
    </aside>
    <main><RouterView :key="$route.fullPath" /></main>
  </div>
</template>
<style scoped>
/* 工作区使用独立双栏；小屏折叠为可横向滚动菜单。 */
.workspace {
  display: grid;
  grid-template-columns: 210px minmax(0, 1fr);
  gap: 48px;
  max-width: var(--max-width);
  padding: 48px 36px 90px;
  margin: auto;
  min-height: calc(100vh - 88px);
}
/* 防止手机横向菜单的最小内容宽度撑大外层网格。 */
.workspace > * {
  min-width: 0;
}
aside h2 {
  font-family: var(--serif);
  font-size: 28px;
  margin: 12px 0 28px;
}
aside nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
aside nav a {
  padding: 13px 15px;
  border-radius: 7px;
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--muted);
}
aside nav a.selected {
  background: var(--accent-soft);
  color: var(--accent);
}
.aside-note {
  font-size: 12px;
  color: var(--muted);
  line-height: 1.8;
  margin: 40px 12px;
}
main {
  min-width: 0;
}
@media (max-width: 800px) {
  .workspace {
    grid-template-columns: minmax(0, 1fr);
    gap: 24px;
    padding: 26px 20px 110px;
  }
  /* 防止手机横向菜单的最小内容宽度撑大外层网格。 */
  .workspace > * {
    min-width: 0;
  }
  aside h2 {
    margin: 8px 0 16px;
  }
  aside nav {
    flex-direction: row;
    overflow: auto;
  }
  aside nav a {
    white-space: nowrap;
    gap: 18px;
  }
  .aside-note {
    display: none;
  }
}
</style>
