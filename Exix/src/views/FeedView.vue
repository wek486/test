<script setup>
// 作品流页面：选择最新/关注/收藏数据源，管理显示数量，网格组件只负责展示。
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { community } from '../services/community'
import { useAsync } from '../composables/useAsync'
import WorkGrid from '../components/works/WorkGrid.vue'
import AsyncState from '../components/common/AsyncState.vue'
const route = useRoute(),
  limit = ref(8)
const mode = computed(() =>
  route.name === 'following'
    ? 'following'
    : route.name === 'collections'
      ? 'collections'
      : 'latest',
)
const copy = computed(
  () =>
    ({
      latest: ['在这里，与灵感相遇。', '每一种想象，都有自己的颜色。发现画师们正在创造的世界。'],
      following: ['喜欢的创作，持续发生。', '你关注的画师，他们的每一次新表达。'],
      collections: ['把喜欢的瞬间，留在这里。', '属于你的灵感收藏夹，仅自己可见。'],
    })[mode.value],
)
const { data, loading, error, refresh } = useAsync(() => community.listWorks({ feed: mode.value }))
onMounted(refresh)
</script>
<template>
  <!-- 画廊首屏先传递社区气质，下方进入稳定顺序的图片网格。 -->
  <section>
    <div class="gallery-hero">
      <div>
        <p class="eyebrow">A HOME FOR YOUR IMAGINATION</p>
        <h1>{{ copy[0] }}</h1>
        <p class="hero-description">{{ copy[1] }}</p>
      </div>
      <div class="hero-stamp" aria-hidden="true">
        <span>✳</span><small>MADE TO<br />INSPIRE.</small>
      </div>
    </div>
    <div class="feed-toolbar">
      <div class="feed-tabs">
        <RouterLink to="/" exact-active-class="chosen">最新作品</RouterLink
        ><RouterLink to="/following" active-class="chosen">关注动态</RouterLink
        ><RouterLink v-if="mode === 'collections'" to="/collections" class="chosen"
          >我的收藏</RouterLink
        >
      </div>
      <span class="feed-count">{{ data?.length || 0 }} 件作品 · 按发布时间</span>
    </div>
    <AsyncState
      :loading="loading"
      :error="error"
      :empty="data?.length === 0"
      :empty-text="
        mode === 'following'
          ? '关注喜欢的画师，新的作品会出现在这里。'
          : '还没有作品，去发现一点新灵感吧。'
      "
      @retry="refresh"
      ><template #empty-action
        ><RouterLink to="/" class="text-link">发现作品 ↗</RouterLink></template
      ><WorkGrid :works="data?.slice(0, limit) || []" />
      <div class="feed-end">
        <el-button v-if="data?.length > limit" @click="limit += 8">加载更多作品 ↓</el-button
        ><span v-else>已经看完啦，灵感仍在继续。 <span>✧</span></span>
      </div></AsyncState
    >
  </section>
</template>
<style scoped>
/* 首屏用文字与印章形成留白，作品网格保持主视觉地位。 */
.gallery-hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 35px 0 58px;
}
.gallery-hero h1 {
  font-size: clamp(27px, 3vw, 43px);
  font-family: var(--serif);
  font-weight: 400;
  letter-spacing: 1px;
  margin: 20px 0 18px;
}
.hero-description {
  color: var(--muted);
  font-size: 13px;
  line-height: 1.8;
}
.hero-stamp {
  width: 110px;
  height: 110px;
  border: 1px solid #ccd5c9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: var(--accent);
  transform: rotate(12deg);
  margin-right: 22px;
}
.hero-stamp > span {
  font-size: 43px;
  line-height: 48px;
}
.hero-stamp small {
  font-size: 8px;
  letter-spacing: 2px;
  text-align: center;
  line-height: 1.5;
}
.feed-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--line);
  margin-bottom: 28px;
}
.feed-tabs {
  display: flex;
  gap: 28px;
}
.feed-tabs a {
  font-size: 13px;
  color: var(--muted);
  padding-bottom: 17px;
  position: relative;
}
.feed-tabs .chosen {
  color: var(--ink);
  font-weight: 600;
}
.chosen:after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--accent);
}
.feed-count {
  font-size: 10px;
  color: var(--muted);
  padding-bottom: 16px;
}
.feed-end {
  text-align: center;
  padding: 55px 0 0;
  font-size: 11px;
  color: var(--muted);
}
.feed-end > span > span {
  margin-left: 10px;
  color: var(--accent);
}
@media (max-width: 680px) {
  .gallery-hero {
    padding: 18px 0 36px;
  }
  .gallery-hero h1 {
    font-size: 26px;
    letter-spacing: 0;
    margin: 17px 0 13px;
  }
  .hero-description {
    font-size: 12px;
    max-width: 245px;
  }
  .hero-stamp {
    display: none;
  }
  .feed-count {
    font-size: 9px;
  }
  .feed-tabs {
    gap: 20px;
  }
  .feed-tabs a {
    font-size: 12px;
  }
}
</style>
