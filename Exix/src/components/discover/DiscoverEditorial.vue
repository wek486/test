<script setup>
import { computed } from 'vue'
import WorkCard from '../works/WorkCard.vue'
const props = defineProps({ works: { type: Array, default: () => [] } })
const featured = computed(() => props.works[0])
const supporting = computed(() => props.works.slice(1, 3))
const remaining = computed(() => props.works.slice(3))
</script>

<template>
  <div class="editorial">
    <div class="feature-layout" v-if="featured">
      <RouterLink :to="{ name: 'work', params: { id: featured.id } }" class="feature">
        <img :src="featured.images[0]" :alt="featured.title" />
        <div class="feature-copy"><span>本期灵感 · 01</span><h2>{{ featured.title }}</h2><p>{{ featured.description }}</p><strong>走进这个世界 ↗</strong></div>
      </RouterLink>
      <div class="supporting">
        <RouterLink v-for="(work, index) in supporting" :key="work.id" :to="{ name: 'work', params: { id: work.id } }" class="story">
          <img :src="work.images[0]" :alt="work.title" loading="lazy" />
          <div><small>灵感片段 / 0{{ index + 2 }}</small><h3>{{ work.title }}</h3><span>{{ work.author?.name }} ↗</span></div>
        </RouterLink>
      </div>
    </div>
    <div v-if="remaining.length" class="section-title"><h2>更多值得停留的画面</h2><span>从一幅作品，遇见一个世界</span></div>
    <div class="editorial-grid"><WorkCard v-for="work in remaining" :key="work.id" :work="work" /></div>
  </div>
</template>

<style scoped>
.feature-layout { display: grid; grid-template-columns: 1.7fr 1fr; gap: 22px; }
.feature { position: relative; min-height: 390px; overflow: hidden; border-radius: 22px; background: #eef3fc; color: white; display: block; }
.feature > img { width: 100%; height: 100%; position: absolute; object-fit: cover; }
.feature::after { content: ''; position: absolute; inset: 0; background: linear-gradient(transparent 15%, #122742dc); }
.feature-copy { position: relative; z-index: 1; padding: 160px 30px 30px; }
.feature-copy span { font-size: 12px; letter-spacing: 2px; }
.feature-copy h2 { font-size: 32px; margin: 14px 0; }
.feature-copy p { font-size: 13px; line-height: 1.8; max-width: 390px; opacity: .85; }
.feature-copy strong { display: inline-block; margin-top: 20px; font-size: 13px; }
.supporting { display: grid; gap: 22px; }
.story { display: grid; grid-template-columns: 45% 1fr; align-items: center; background: #f4f7fc; border-radius: 20px; overflow: hidden; color: #24364c; }
.story img { width: 100%; height: 100%; min-height: 170px; object-fit: cover; }
.story > div { padding: 18px; }
.story small, .story span { color: #738298; font-size: 11px; }
.story h3 { font-size: 17px; margin: 15px 0; }
.section-title { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin: 35px 0 20px; }
.section-title h2 { font-size: 19px; margin: 0; }
.section-title span { font-size: 12px; color: #7c8b9e; }
.editorial-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 22px; }
@media (max-width: 900px) { .feature-layout { grid-template-columns: 1fr; } .supporting { grid-template-columns: 1fr 1fr; } .story { grid-template-columns: 1fr; } .story img { height: 160px; } }
@media (max-width: 600px) { .editorial-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .section-title { align-items: flex-start; flex-direction: column; } .feature-copy { padding-inline: 22px; } .feature-copy h2 { font-size: 26px; } }
@media (max-width: 380px) { .supporting, .editorial-grid { grid-template-columns: 1fr; } }
</style>
