<script setup>
import { computed } from 'vue'
import WorkCard from '../works/WorkCard.vue'
const props = defineProps({ works: { type: Array, default: () => [] } })
const groups = computed(() => {
  const map = new Map()
  for (const work of props.works) {
    const label = work.tags?.[0] || '其他作品'
    if (!map.has(label)) map.set(label, [])
    map.get(label).push(work)
  }
  return [...map].map(([label, works]) => ({ label, works }))
})
</script>

<template>
  <div class="catalog">
    <section v-for="(group, index) in groups" :key="group.label" class="category-section">
      <header><div><span class="number">0{{ index + 1 }}</span><h2>{{ group.label }}</h2></div><span>{{ group.works.length }} 件作品</span></header>
      <div class="category-grid"><WorkCard v-for="work in group.works" :key="work.id" :work="work" /></div>
    </section>
  </div>
</template>

<style scoped>
.category-section { padding: 24px; border: 1px solid #e5ecf6; border-radius: 20px; margin-bottom: 24px; background: white; }
header, header > div { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
header { margin-bottom: 22px; }
header h2 { margin: 0; font-size: 20px; color: #23374d; }
header > span { font-size: 12px; color: #7d8ba0; }
.number { background: #edf5ff; color: #409eff; width: 36px; height: 36px; display: grid; place-items: center; border-radius: 11px; font-size: 12px; }
.category-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 22px; }
.category-grid :deep(.cover) { aspect-ratio: 4/3; background: #f4f7fc; }
@media (max-width: 800px) { .category-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .category-section { padding: 16px; } }
@media (max-width: 440px) { .category-grid { grid-template-columns: 1fr; } }
</style>
