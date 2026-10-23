<script setup>
// 纯展示状态组件：不取数据，通过 retry 事件通知父页面重新加载。
defineProps({
  loading: Boolean,
  error: String,
  empty: Boolean,
  emptyText: { type: String, default: '这里还很安静，新的故事即将发生。' },
})
defineEmits(['retry'])
</script>
<template>
  <!-- 互斥显示加载、错误、空状态；成功时渲染页面传入的内容。 -->
  <div v-if="loading" class="state" role="status">
    <span class="spinner"></span>
    <p>正在加载灵感…</p>
  </div>
  <div v-else-if="error" class="state" role="alert">
    <h3>暂时无法展示</h3>
    <p>{{ error }}</p>
    <el-button @click="$emit('retry')">重新加载</el-button>
  </div>
  <div v-else-if="empty" class="state">
    <span class="state-mark">✧</span>
    <h3>留一点空间给新的相遇</h3>
    <p>{{ emptyText }}</p>
    <slot name="empty-action" />
  </div>
  <slot v-else />
</template>
<style scoped>
/* 状态占位保留足够高度，防止内容加载时大幅跳动。 */
.state {
  min-height: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  text-align: center;
  padding: 32px;
  color: var(--muted);
}
.state h3 {
  color: var(--ink);
}
.state-mark {
  font-size: 40px;
  color: var(--accent);
}
.spinner {
  width: 25px;
  height: 25px;
  border: 2px solid var(--line);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
