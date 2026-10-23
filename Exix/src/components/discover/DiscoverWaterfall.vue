<script setup>
import WorkCard from '../works/WorkCard.vue'
defineProps({ works: { type: Array, default: () => [] } })
</script>

<template>
  <div class="waterfall">
    <div v-for="(work, index) in works" :key="work.id" class="waterfall-item" :class="`height-${index % 3}`">
      <WorkCard :work="work" />
    </div>
  </div>
</template>

<style scoped>
.waterfall { columns: 4; column-gap: 22px; }
.waterfall-item { break-inside: avoid; margin-bottom: 28px; }
.waterfall-item :deep(.cover) { aspect-ratio: auto; background: #f2f6fc; border-radius: 16px; }
.waterfall-item :deep(.cover img) { height: auto; display: block; }
.height-1 :deep(.cover img) { padding-block: 26px; box-sizing: border-box; }
.height-2 :deep(.cover img) { padding-block: 12px; box-sizing: border-box; }
.waterfall-item :deep(.work-title) { margin-top: 12px; }
@media (max-width: 1250px) { .waterfall { columns: 3; } }
@media (max-width: 900px) { .waterfall { columns: 2; } }
@media (max-width: 480px) { .waterfall { columns: 1; } }
</style>
