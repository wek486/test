<script setup>
// 作品详情页面：编排作品、作者与评论数据，统一执行登录检查及业务操作。
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { community } from '../services/community'
import { useAsync, useAction, confirmAction } from '../composables/useAsync'
import { useSessionStore } from '../stores/session'
import AsyncState from '../components/common/AsyncState.vue'
import UserAvatar from '../components/common/UserAvatar.vue'
import CommentList from '../components/comments/CommentList.vue'
import { formatDate } from '../utils/format'
const route = useRoute(),
  router = useRouter(),
  session = useSessionStore(),
  preview = ref(false),
  initialIndex = ref(0)
const { busy, run } = useAction()
const { data, loading, error, refresh } = useAsync(async () => ({
  work: await community.getWork(route.params.id),
  comments: await community.listComments(route.params.id),
  profile: await community.getProfile((await community.getWork(route.params.id)).authorId),
}))
onMounted(refresh)
// 单独处理大图打开事件，避免模板内多语句在格式化后产生解析歧义。
function openPreview(index) {
  initialIndex.value = index
  preview.value = true
}
function login() {
  router.push({ name: 'login', query: { redirect: route.fullPath } })
}
function withUser(task) {
  if (!session.user) return login()
  return run(task)
}
async function react(type) {
  await withUser(async () => {
    data.value.work = await community.toggleReaction(route.params.id, type)
  })
}
async function follow() {
  await withUser(async () => {
    await community.toggleFollow(data.value.work.authorId)
    data.value.profile = await community.getProfile(data.value.work.authorId)
  })
}
async function comment({ content, parentId, done }) {
  await withUser(async () => {
    await community.addComment({ workId: route.params.id, content, parentId })
    data.value.comments = await community.listComments(route.params.id)
    done()
  })
}
async function removeComment(id) {
  await run(async () => {
    await confirmAction('删除这条评论及其回复？')
    await community.deleteComment(id)
    data.value.comments = await community.listComments(route.params.id)
  })
}
async function report() {
  await withUser(async () => {
    const { value } = await ElMessageBox.prompt('请说明举报原因', '举报作品', {
      inputValidator: (v) => !!v?.trim() || '请填写原因',
      confirmButtonText: '提交',
      cancelButtonText: '取消',
    })
    await community.report({ type: 'work', targetId: route.params.id, reason: value })
  })
}
</script>
<template>
  <!-- 大图与信息双栏，手机按作者、图片、说明、互动、评论顺序展示。 -->
  <RouterLink to="/" class="back-link">← 返回发现</RouterLink
  ><AsyncState :loading="loading" :error="error" @retry="refresh"
    ><div v-if="data" class="detail-grid">
      <div class="art-column">
        <button
          v-for="(image, index) in data.work.images"
          :key="index"
          class="art-image"
          @click="openPreview(index)"
        >
          <img :src="image" :alt="`${data.work.title} · 第 ${index + 1} 张`" /><span
            >点击查看大图 ↗</span
          >
        </button>
      </div>
      <aside class="detail-info">
        <div class="artist-row">
          <RouterLink
            :to="{ name: 'profile', params: { id: data.work.authorId } }"
            class="artist-link"
            ><UserAvatar :user="data.work.author" />
            <div>
              <strong>{{ data.work.author.name }}</strong
              ><small>原创画师</small>
            </div></RouterLink
          ><el-button
            v-if="session.user?.id !== data.work.authorId"
            :loading="busy"
            @click="follow"
            >{{ data.profile.following ? '已关注' : '＋ 关注' }}</el-button
          >
        </div>
        <div class="work-description">
          <p class="eyebrow">ORIGINAL ARTWORK</p>
          <h1>{{ data.work.title }}</h1>
          <p class="description">{{ data.work.description }}</p>
          <div class="tags">
            <span v-for="tag in data.work.tags" :key="tag"># {{ tag }}</span>
          </div>
          <time>{{ formatDate(data.work.createdAt) }} 发布</time>
        </div>
        <div class="reaction-row">
          <el-button :class="{ selected: data.work.liked }" :disabled="busy" @click="react('likes')"
            >{{ data.work.liked ? '♥' : '♡' }} {{ data.work.likes }}</el-button
          ><el-button
            :class="{ selected: data.work.collected }"
            :disabled="busy"
            @click="react('collections')"
            >{{ data.work.collected ? '★ 已收藏' : '☆ 收藏' }}</el-button
          ><button class="report-button" :disabled="busy" @click="report">举报</button>
        </div>
        <CommentList
          :comments="data.comments"
          :user="session.user"
          :busy="busy"
          @login="login"
          @submit="comment"
          @delete="removeComment"
        />
      </aside></div></AsyncState
  ><el-image-viewer
    v-if="preview && data"
    :url-list="data.work.images"
    :initial-index="initialIndex"
    hide-on-click-modal
    @close="preview = false"
  />
</template>
<style scoped>
/* 图片区不裁切原作，信息区宽度独立；大图按钮可用键盘访问。 */
.detail-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(300px, 1fr);
  gap: 46px;
  margin-top: 28px;
}
.art-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.art-image {
  position: relative;
  border: 0;
  background: var(--paper);
  padding: 28px;
  border-radius: 12px;
  cursor: zoom-in;
  width: 100%;
  align-self: start;
}
.art-image img {
  width: 100%;
  max-height: 800px;
  object-fit: contain;
}
.art-image > span {
  position: absolute;
  bottom: 12px;
  right: 16px;
  font-size: 10px;
  color: var(--muted);
}
.artist-row,
.artist-link {
  display: flex;
  align-items: center;
  gap: 12px;
}
.artist-row {
  justify-content: space-between;
  padding: 4px 0 24px;
  border-bottom: 1px solid var(--line);
}
.artist-link strong {
  font-size: 14px;
  display: block;
}
.artist-link small {
  font-size: 10px;
  color: var(--muted);
  display: block;
  margin-top: 4px;
}
.work-description {
  padding: 28px 0;
}
.work-description h1 {
  font-family: var(--serif);
  font-size: 30px;
  font-weight: 400;
  margin: 14px 0 20px;
}
.description {
  font-size: 13px;
  white-space: pre-wrap;
  line-height: 1.9;
  color: var(--muted);
  overflow-wrap: anywhere;
}
.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin: 20px 0;
}
.tags span {
  background: var(--paper);
  padding: 5px 9px;
  font-size: 11px;
  border-radius: 5px;
  color: var(--accent);
}
time {
  font-size: 10px;
  color: var(--muted);
}
.reaction-row {
  display: flex;
  align-items: center;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  padding: 18px 0;
  margin-bottom: 28px;
  gap: 8px;
}
.reaction-row .el-button + .el-button {
  margin-left: 0;
}
.selected {
  color: var(--accent);
  background: var(--accent-soft);
}
.report-button {
  border: 0;
  background: none;
  margin-left: auto;
  font-size: 11px;
  color: var(--muted);
  cursor: pointer;
}
@media (max-width: 800px) {
  .detail-grid {
    grid-template-columns: 1fr;
    gap: 28px;
  }
  .art-image {
    padding: 15px;
  }
  .detail-info {
    display: contents;
  }
  .artist-row {
    grid-row: 1;
  }
  .art-column {
    grid-row: 2;
  }
  .work-description {
    grid-row: 3;
    padding: 0;
  }
  .reaction-row {
    grid-row: 4;
    margin: 0;
  }
  .work-description h1 {
    font-size: 27px;
  }
}
</style>
