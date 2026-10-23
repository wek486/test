<script setup>
// 根组件只承载路由；布局、登录状态与具体业务由各自模块管理。
</script>
<template>
  <!-- 路由出口：由 router 决定展示社区、创作、后台或认证布局。 -->
  <RouterView />
</template>
<style scoped>
/* 根组件不限制宽度，响应式尺寸交给各布局与全局设计变量。 */
</style>
