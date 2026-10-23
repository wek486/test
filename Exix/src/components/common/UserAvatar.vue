<script setup>
// 统一用户头像展示，使用昵称首字与用户色彩，无需依赖远程头像。
defineProps({ user: Object, large: Boolean })
</script>
<template>
  <!-- 头像属于装饰信息，用户名由周边文字提供。 -->
  <span
    class="avatar"
    :class="{ large }"
    :style="{ background: user?.hue || '#e8e4dc' }"
    aria-hidden="true"
    >{{ user?.avatar || user?.name?.slice(0, 1) || 'E' }}</span
  >
</template>
<style scoped>
/* 固定尺寸避免列表头像被挤压；个人主页使用大尺寸。 */
.avatar {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #33443e;
  flex-shrink: 0;
  font-family: var(--serif);
  font-weight: 600;
}
.large {
  width: 88px;
  height: 88px;
  font-size: 32px;
}
</style>
