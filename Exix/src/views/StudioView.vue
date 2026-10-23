<script setup>
// 创作列表：读取本人作品，确认后删除，通过路由进入发布和编辑页。
import { onMounted } from 'vue'
import { community } from '../services/community'
import { useAsync, useAction, confirmAction } from '../composables/useAsync'
import AsyncState from '../components/common/AsyncState.vue'
import { formatDate } from '../utils/format'
const { data, loading, error, refresh } = useAsync(() => community.myWorks()),
  { busy, run } = useAction()
onMounted(refresh)
// 删除必须确认，完成后从服务重新读取列表，避免本地状态与数据源不一致。
async function remove(id) {
  await run(async () => {
    await confirmAction('确定删除这件作品？此操作无法撤销。')
    await community.deleteWork(id)
    await refresh()
  }, '作品已删除')
}
</script>
<template>
  <!-- 作品管理使用纵向列表，手机保持相同操作顺序。 -->
  <div class="page-heading">
    <div>
      <p class="eyebrow">YOUR ORIGINALS</p>
      <h1 class="page-title">我的作品</h1>
    </div>
    <RouterLink to="/studio/works/new" class="primary-link">＋ 发布作品</RouterLink>
  </div>
  <AsyncState
    :loading="loading"
    :error="error"
    :empty="data?.length === 0"
    empty-text="第一件作品，就从这里开始。"
    @retry="refresh"
    ><template #empty-action
      ><RouterLink to="/studio/works/new" class="text-link">发布第一件作品 →</RouterLink></template
    >
    <div class="panel studio-list">
      <article v-for="work in data" :key="work.id">
        <img :src="work.images[0]" :alt="work.title" />
        <div class="work-summary">
          <h3>{{ work.title }}</h3>
          <p>{{ formatDate(work.createdAt) }} · {{ work.hidden ? '已被隐藏' : '已公开' }}</p>
        </div>
        <div class="row-actions">
          <RouterLink :to="{ name: 'work-edit', params: { id: work.id } }" class="text-link"
            >编辑</RouterLink
          ><button :disabled="busy" @click="remove(work.id)">删除</button>
        </div>
      </article>
    </div></AsyncState
  >
</template>
<style scoped>
/* 缩略图与操作按钮独立，标题过长时换行，不挤出屏幕。 */
.studio-list {
  padding: 0 24px;
}
.studio-list article {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 22px 0;
  border-bottom: 1px solid var(--line);
}
.studio-list article:last-child {
  border-bottom: 0;
}
.studio-list img {
  width: 70px;
  height: 84px;
  object-fit: contain;
  background: var(--paper);
  border-radius: 6px;
}
.work-summary {
  flex: 1;
  min-width: 0;
}
.work-summary h3 {
  font-size: 15px;
  overflow-wrap: anywhere;
}
.work-summary p {
  font-size: 11px;
  color: var(--muted);
  margin-top: 10px;
}
.row-actions {
  display: flex;
  gap: 20px;
  font-size: 12px;
}
.row-actions button {
  border: 0;
  background: none;
  color: #9b6658;
  cursor: pointer;
}
@media (max-width: 600px) {
  .studio-list {
    padding: 0 16px;
  }
  .studio-list article {
    gap: 12px;
    flex-wrap: wrap;
  }
  .row-actions {
    width: 100%;
    padding-left: 82px;
  }
  .page-heading {
    gap: 12px;
  }
  .primary-link {
    font-size: 12px;
  }
}
</style>
