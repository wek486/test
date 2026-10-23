<script setup>
import { computed, ref } from 'vue'
import UserAvatar from '../common/UserAvatar.vue'
import { formatDate } from '../../utils/format'
// 父页面执行评论请求；此组件只处理输入与回复目标，失败时保留输入。
const props = defineProps({
  comments: { type: Array, default: () => [] },
  user: Object,
  busy: Boolean,
})
const emit = defineEmits(['submit', 'delete', 'login'])
const content = ref(''),
  reply = ref(null)
const roots = computed(() => props.comments.filter((c) => !c.parentId))
function submit() {
  if (!props.user) return emit('login')
  if (!content.value.trim()) return
  emit('submit', {
    content: content.value,
    parentId: reply.value?.id || null,
    done: () => {
      content.value = ''
      reply.value = null
    },
  })
}
</script>
<template>
  <!-- 输入位于评论前，登录状态决定可编辑性；回复保持单层结构。 -->
  <section class="comments">
    <h3>
      一起聊聊 <span>{{ comments.length }}</span>
    </h3>
    <form @submit.prevent="submit">
      <div v-if="reply" class="reply-hint">
        回复 {{ reply.user?.name }} <button type="button" @click="reply = null">取消</button>
      </div>
      <label class="sr-only" for="comment-input">评论内容</label
      ><textarea
        id="comment-input"
        v-model="content"
        maxlength="1000"
        :placeholder="user ? '分享你的感受，给创作一点回响…' : '登录后，与画师交流你的想法'"
        :disabled="!user"
        rows="3"
      ></textarea>
      <div class="comment-submit">
        <span>友善交流，尊重原创</span
        ><el-button type="primary" :loading="busy" native-type="submit">{{
          user ? '发表评论' : '登录后评论'
        }}</el-button>
      </div>
    </form>
    <p v-if="!comments.length" class="field-hint">还没有评论，来留下第一份回响。</p>
    <article v-for="c in roots" :key="c.id" class="comment">
      <UserAvatar :user="c.user" />
      <div class="comment-body">
        <div class="comment-name">
          {{ c.user?.name }} <time>{{ formatDate(c.createdAt) }}</time>
        </div>
        <p>{{ c.text }}</p>
        <div class="comment-actions">
          <button @click="user ? (reply = c) : emit('login')">回复</button
          ><button v-if="user?.id === c.userId" :disabled="busy" @click="emit('delete', c.id)">
            删除
          </button>
        </div>
        <div
          v-for="child in comments.filter((x) => x.parentId === c.id)"
          :key="child.id"
          class="reply"
        >
          <strong>{{ child.user?.name }}</strong>
          <p>{{ child.text }}</p>
          <button
            v-if="user?.id === child.userId"
            :disabled="busy"
            @click="emit('delete', child.id)"
          >
            删除
          </button>
        </div>
      </div>
    </article>
  </section>
</template>
<style scoped>
/* 评论正文允许长文本换行；回复缩进保持浅层阅读结构。 */
.comments h3 {
  margin-bottom: 22px;
}
.comments h3 span {
  color: var(--muted);
  font-weight: 400;
  margin-left: 6px;
}
textarea {
  width: 100%;
}
.comment-submit {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 12px 0 26px;
  gap: 8px;
}
.comment-submit > span {
  font-size: 11px;
  color: var(--muted);
}
.comment {
  display: flex;
  gap: 12px;
  padding: 20px 0;
  border-top: 1px solid var(--line);
}
.comment-body {
  flex: 1;
  min-width: 0;
}
.comment-name {
  font-size: 13px;
  font-weight: 600;
}
.comment-name time {
  display: block;
  font-size: 11px;
  color: var(--muted);
  font-weight: 400;
  margin-top: 4px;
}
.comment p {
  font-size: 13px;
  line-height: 1.8;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  margin-top: 10px;
}
.comment-actions {
  display: flex;
  gap: 14px;
  margin-top: 8px;
}
.comment button {
  border: 0;
  background: none;
  color: var(--muted);
  cursor: pointer;
  font-size: 12px;
}
.reply {
  padding: 12px;
  background: var(--paper);
  margin-top: 12px;
  border-radius: 8px;
  font-size: 12px;
}
.reply-hint {
  font-size: 12px;
  margin-bottom: 8px;
}
.reply-hint button {
  margin-left: 10px;
}
</style>
