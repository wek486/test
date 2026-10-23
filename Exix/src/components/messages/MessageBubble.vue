<script setup>
import { computed } from 'vue'
import { formatDate } from '../../utils/format'
// 消息以纯文本渲染，只有本站作品路径转换为路由卡片，避免任意 HTML 注入。
const props = defineProps({ message: Object, mine: Boolean })
const workId = computed(() => props.message.text.match(/^\/works\/([a-zA-Z0-9-]+)$/)?.[1])
</script>
<template>
  <!-- 自己的消息靠右；时间与已读状态位于气泡下方。 -->
  <div class="message" :class="{ mine }">
    <div class="bubble">
      <RouterLink v-if="workId" :to="{ name: 'work', params: { id: workId } }" class="work-link"
        >▧ 分享一件作品<br /><small>点击查看 →</small></RouterLink
      ><span v-else>{{ message.text }}</span>
    </div>
    <small
      >{{ formatDate(message.createdAt) }}
      <span v-if="mine">· {{ message.readBy.length > 1 ? '已读' : '已发送' }}</span></small
    >
  </div>
</template>
<style scoped>
/* 气泡限制宽度并允许长文本断行，手机端不会撑出屏幕。 */
.message {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  margin: 18px 0;
}
.mine {
  align-items: flex-end;
}
.bubble {
  padding: 14px 18px;
  background: white;
  border: 1px solid var(--line);
  border-radius: 14px 14px 14px 3px;
  max-width: 85%;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-size: 14px;
  line-height: 1.7;
}
.mine .bubble {
  background: var(--accent);
  color: white;
  border-radius: 14px 14px 3px 14px;
}
.message > small {
  font-size: 10px;
  color: var(--muted);
  margin-top: 6px;
}
.work-link {
  display: block;
  min-width: 150px;
}
.work-link small {
  opacity: 0.75;
}
</style>
