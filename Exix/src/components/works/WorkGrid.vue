<script setup>
import WorkCard from './WorkCard.vue'
// 网格只负责排列，数据筛选与分页由页面负责。
defineProps({ works: { type: Array, default: () => [] } })
</script>
<template>
  <!-- 稳定作品 ID 保证列表更新时组件不会错位。 -->
  <div class="work-grid"><WorkCard v-for="work in works" :key="work.id" :work="work" /></div>
</template>
<style scoped>
/* 电脑四列、平板三列、手机两列，阅读顺序与 DOM 顺序一致。 */
.work-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 36px 24px;
}
@media (max-width: 1000px) {
  .work-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
@media (max-width: 680px) {
  .work-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 26px 14px;
  }
}
</style>
