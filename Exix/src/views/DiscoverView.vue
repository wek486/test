<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { community } from '../services/community'
import { useAsync } from '../composables/useAsync'
import DiscoverWaterfall from '../components/discover/DiscoverWaterfall.vue'
import DiscoverEditorial from '../components/discover/DiscoverEditorial.vue'
import DiscoverCatalog from '../components/discover/DiscoverCatalog.vue'

const variants = [
  { id: 'waterfall', label: '01 瀑布流探索', title: '下一份灵感，就在这里。', subtitle: '随心浏览，让喜欢的画面与你相遇。', component: DiscoverWaterfall },
  { id: 'editorial', label: '02 专题精选', title: '给想象力，一点新的视角。', subtitle: '像翻阅一本画册，从作品中发现故事。', component: DiscoverEditorial },
  { id: 'catalog', label: '03 分类图库', title: '找到属于你的灵感坐标。', subtitle: '按主题寻找作品，建立自己的视觉收藏。', component: DiscoverCatalog },
]
const selected = ref('waterfall'), query = ref(''), tag = ref('全部'), sort = ref('latest'), limit = ref(12)
const active = computed(() => variants.find(item => item.id === selected.value))
const { data, loading, error, refresh } = useAsync(() => community.listWorks({ feed: 'latest' }))
const tags = computed(() => ['全部', ...new Set((data.value || []).flatMap(work => work.tags || []))])
const filtered = computed(() => {
  const search = query.value.trim().toLocaleLowerCase()
  const result = (data.value || []).filter(work =>
    (tag.value === '全部' || work.tags?.includes(tag.value)) &&
    (!search || [work.title, work.author?.name, ...(work.tags || [])].join(' ').toLocaleLowerCase().includes(search)),
  )
  return result.slice().sort((a, b) => sort.value === 'popular' ? b.likes - a.likes : new Date(b.createdAt) - new Date(a.createdAt))
})
watch([query, tag, sort, selected], () => { limit.value = 12 })
function resetFilters() { query.value = ''; tag.value = '全部'; sort.value = 'latest' }
onMounted(refresh)
</script>

<template>
  <section class="discover-page">
    <nav class="variant-switch" aria-label="发现页方案">
      <button v-for="variant in variants" :key="variant.id" :aria-pressed="selected === variant.id" :class="{ active: selected === variant.id }" @click="selected = variant.id">{{ variant.label }}</button>
    </nav>
    <header class="discover-hero">
      <div><p class="eyebrow">EXIX / DISCOVER SOMETHING NEW</p><h1>{{ active.title }}</h1><p class="subtitle">{{ active.subtitle }}</p></div>
      <div class="hero-symbol" aria-hidden="true">✳<span>每日一点新灵感</span></div>
    </header>
    <div class="discovery-controls">
      <label class="search"><span aria-hidden="true">⌕</span><input v-model="query" type="search" placeholder="搜索作品、作者或标签" aria-label="搜索作品、作者或标签" /></label>
      <label class="sort">排序<select v-model="sort"><option value="latest">最新发布</option><option value="popular">最多点赞</option></select></label>
    </div>
    <div class="tag-list" aria-label="作品分类"><button v-for="item in tags" :key="item" :aria-pressed="tag === item" :class="{ chosen: tag === item }" @click="tag = item">{{ item === '全部' ? '全部作品' : `# ${item}` }}</button></div>
    <div class="result-line"><strong>{{ selected === 'editorial' ? '本期精选' : selected === 'catalog' ? '探索主题' : '发现好作品' }}</strong><span>{{ filtered.length }} 件作品</span></div>
    <div v-if="loading" class="state" role="status">正在寻找新的灵感…</div>
    <div v-else-if="error" class="state" role="alert"><p>{{ error }}</p><button @click="refresh">重新加载</button></div>
    <div v-else-if="!filtered.length" class="state"><span class="empty-symbol">⌕</span><h2>还没有找到相关作品</h2><p>换个关键词，或试试其他分类。</p><button @click="resetFilters">查看全部作品</button></div>
    <template v-else>
      <component :is="active.component" :works="filtered.slice(0, limit)" />
      <div class="feed-end"><button v-if="filtered.length > limit" @click="limit += 12">加载更多作品 ↓</button><span v-else>你已看完这些作品 · 换个分类继续探索 ✧</span></div>
    </template>
  </section>
</template>

<style scoped>
.discover-page { --accent: #409eff; --ink: #25374f; --muted: #7c8b9e; color: #25374f; font-family: 'Microsoft YaHei', system-ui, sans-serif; }
.discover-page button, .discover-page input, .discover-page select { font: inherit; }
.discover-page button { cursor: pointer; }
.variant-switch { display: inline-flex; flex-wrap: wrap; padding: 5px; gap: 4px; border: 1px solid #e4ebf5; border-radius: 13px; background: #f6f9fd; }
.variant-switch button { border: 0; padding: 11px 16px; border-radius: 9px; color: #7c8b9e; background: transparent; font-size: 12px; }
.variant-switch button.active { color: #2787eb; background: white; box-shadow: 0 3px 12px #28558a10; }
.discover-hero { display: flex; justify-content: space-between; gap: 20px; align-items: center; padding: 34px 0 28px; }
.eyebrow { color: #409eff; letter-spacing: 2px; font-size: 10px; font-weight: 600; }
h1 { font-size: clamp(25px, 3vw, 38px); letter-spacing: -1px; margin: 16px 0 12px; }
.subtitle { font-size: 13px; color: #7c8b9e; line-height: 1.8; }
.hero-symbol { color: #409eff; font-size: 68px; line-height: 1; display: flex; align-items: center; flex-direction: column; padding-inline: 28px; }
.hero-symbol span { font-size: 10px; margin-top: 14px; letter-spacing: 2px; }
.discovery-controls { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.search { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: #f5f8fc; border: 1px solid #e5ecf5; border-radius: 12px; width: min(100%, 440px); box-sizing: border-box; }
.search > span { font-size: 24px; color: #8896a8; line-height: 1; }
.search input { background: transparent; border: 0; outline: 0; width: 100%; min-width: 0; color: #25374f; font-size: 13px; }
.search:focus-within { border-color: #409eff; }
.sort { display: flex; align-items: center; gap: 10px; color: #7c8b9e; font-size: 12px; flex-shrink: 0; }
.sort select { border: 1px solid #e5ecf5; border-radius: 9px; padding: 10px; background: white; color: #25374f; }
.tag-list { display: flex; flex-wrap: wrap; gap: 9px; padding: 22px 0; }
.tag-list button { padding: 9px 15px; border: 1px solid #e6edf5; border-radius: 24px; color: #7c8b9e; background: white; font-size: 12px; }
.tag-list button.chosen { background: #409eff; color: white; border-color: #409eff; }
.result-line { display: flex; justify-content: space-between; align-items: center; margin: 3px 0 20px; }
.result-line strong { font-size: 16px; }
.result-line > span, .feed-end { font-size: 12px; color: #7c8b9e; }
.feed-end { padding: 40px 0 10px; text-align: center; }
.feed-end button, .state button { border: 1px solid #cce2ff; border-radius: 10px; background: #eff6ff; color: #2787eb; padding: 12px 24px; font-size: 13px; }
.state { text-align: center; padding: 70px 20px; background: #f7faff; border-radius: 20px; color: #7c8b9e; }
.state h2 { color: #25374f; font-size: 20px; }
.state p { font-size: 13px; margin-bottom: 24px; }
.empty-symbol { font-size: 48px; color: #409eff; }
button:focus-visible, select:focus-visible { outline: 2px solid #409eff; outline-offset: 3px; }
@media (max-width: 650px) { .hero-symbol { display: none; } .discovery-controls { align-items: stretch; flex-direction: column; } .sort { justify-content: flex-end; } .variant-switch { display: flex; } .variant-switch button { flex: 1; padding: 10px 6px; font-size: 11px; } .discover-hero { padding-top: 24px; } }
</style>
