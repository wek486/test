<script setup>
// 会话页面：管理发送、失败重试、可见页面轮询和拉黑举报，并清理定时器。
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { community } from '../services/community'
import { useAsync, useAction, confirmAction } from '../composables/useAsync'
import { useSessionStore } from '../stores/session'
import AsyncState from '../components/common/AsyncState.vue'
import UserAvatar from '../components/common/UserAvatar.vue'
import MessageBubble from '../components/messages/MessageBubble.vue'
const route = useRoute(),
  session = useSessionStore(),
  content = ref(''),
  body = ref(),
  sendError = ref(''),
  { busy, run } = useAction()
let timer,
  pendingId = null,
  pendingText = '',
  alive = true,
  polling = false
const { data, loading, error, refresh } = useAsync(async () => {
  await community.markRead(route.params.id)
  return community.getConversation(route.params.id)
})
async function scrollBottom() {
  await nextTick()
  if (body.value) body.value.scrollTop = body.value.scrollHeight
}
// 静默轮询不闪烁加载状态；仅新消息到来且用户接近底部时自动滚动。
async function poll() {
  if (document.hidden || !alive || polling) return
  polling = true
  try {
    const result = await community.getConversation(route.params.id)
    if (!alive) return
    const nearBottom =
      !body.value || body.value.scrollHeight - body.value.scrollTop - body.value.clientHeight < 100
    const changed = result.messages.length !== data.value?.messages.length
    await community.markRead(route.params.id)
    data.value = await community.getConversation(route.params.id)
    if (changed && nearBottom) await scrollBottom()
  } catch {
    /* 定时刷新失败保留当前会话，主动发送仍展示错误。 */
  } finally {
    polling = false
  }
}
onMounted(async () => {
  await refresh()
  await scrollBottom()
  if (alive) timer = setInterval(poll, 5000)
  document.addEventListener('visibilitychange', poll)
})
onBeforeUnmount(() => {
  alive = false
  clearInterval(timer)
  document.removeEventListener('visibilitychange', poll)
})
async function send() {
  if (!content.value.trim() || busy.value) return
  if (pendingText !== content.value) {
    pendingText = content.value
    pendingId = crypto.randomUUID()
  }
  sendError.value = ''
  const result = await run(async () => {
    try {
      await community.sendMessage({
        conversationId: route.params.id,
        content: pendingText,
        clientId: pendingId,
      })
      content.value = ''
      pendingId = null
      pendingText = ''
      await refresh()
      await scrollBottom()
    } catch (e) {
      sendError.value = e.message
      throw e
    }
  })
  return result
}
async function block() {
  await run(async () => {
    await confirmAction('拉黑后，双方将无法继续发送私信。')
    await community.block(data.value.peer.id)
  }, '已拉黑，可在设置中解除')
}
async function report() {
  await run(async () => {
    const { value } = await ElMessageBox.prompt('请说明举报原因', '举报用户', {
      inputValidator: (v) => !!v?.trim() || '请填写原因',
      confirmButtonText: '提交',
      cancelButtonText: '取消',
    })
    await community.report({ type: 'user', targetId: data.value.peer.id, reason: value })
  }, '举报已提交')
}
</script>
<template>
  <!-- 发送区位于会话容器底部，失败保留输入并提供重试。 -->
  <section class="conversation-page">
    <RouterLink to="/messages" class="back-link">← 返回消息</RouterLink
    ><AsyncState :loading="loading && !data" :error="error" @retry="refresh"
      ><div v-if="data" class="chat panel">
        <header class="chat-header">
          <RouterLink :to="{ name: 'profile', params: { id: data.peer.id } }" class="peer"
            ><UserAvatar :user="data.peer" />
            <div>
              <strong>{{ data.peer.name }}</strong
              ><small>友善交流，尊重彼此</small>
            </div></RouterLink
          ><el-dropdown trigger="click"
            ><button class="more-button" aria-label="会话操作">···</button
            ><template #dropdown
              ><el-dropdown-menu
                ><el-dropdown-item @click="report">举报用户</el-dropdown-item
                ><el-dropdown-item @click="block">拉黑用户</el-dropdown-item></el-dropdown-menu
              ></template
            ></el-dropdown
          >
        </header>
        <div ref="body" class="chat-body" aria-live="polite">
          <p class="chat-hint">你们的对话，从这里开始。</p>
          <MessageBubble
            v-for="message in data.messages"
            :key="message.id"
            :message="message"
            :mine="message.senderId === session.user.id"
          />
        </div>
        <form class="chat-compose" @submit.prevent="send">
          <label class="sr-only" for="message-input">私信内容</label
          ><textarea
            id="message-input"
            v-model="content"
            maxlength="2000"
            rows="2"
            placeholder="说点什么…（分享作品可输入 /works/作品ID）"
          ></textarea>
          <div v-if="sendError" class="send-error" role="alert">
            {{ sendError }} · 输入已保留，可点击重试
          </div>
          <div class="compose-bottom">
            <span>支持文字及站内作品链接</span
            ><el-button
              type="primary"
              :loading="busy"
              :disabled="!content.trim()"
              native-type="submit"
              >{{ sendError ? '重试发送' : '发送' }} →</el-button
            >
          </div>
        </form>
      </div></AsyncState
    >
  </section>
</template>
<style scoped>
/* 会话内部滚动，输入区域保持可见；手机使用动态视口高度适应键盘。 */
.conversation-page {
  max-width: 850px;
  margin: auto;
}
.chat {
  padding: 0;
  margin-top: 20px;
  overflow: hidden;
}
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--line);
}
.peer {
  display: flex;
  gap: 12px;
  align-items: center;
}
.peer strong {
  font-size: 14px;
  display: block;
}
.peer small {
  font-size: 10px;
  color: var(--muted);
  display: block;
  margin-top: 5px;
}
.more-button {
  border: 0;
  background: none;
  font-size: 26px;
  cursor: pointer;
  color: var(--muted);
}
.chat-body {
  height: 420px;
  overflow-y: auto;
  padding: 16px 28px;
  background: var(--paper);
  overscroll-behavior: contain;
}
.chat-hint {
  text-align: center;
  font-size: 10px;
  color: var(--muted);
  padding: 15px 0;
}
.chat-compose {
  padding: 18px 24px;
}
.chat-compose textarea {
  border: 0;
  background: none;
  padding: 0;
  box-shadow: none;
}
.compose-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  gap: 8px;
}
.compose-bottom span {
  font-size: 10px;
  color: var(--muted);
}
.send-error {
  font-size: 12px;
  color: #a85342;
  margin-top: 10px;
}
@media (max-width: 680px) {
  .chat-body {
    height: max(220px, calc(100dvh - 415px));
    padding: 12px 16px;
  }
  .chat-header,
  .chat-compose {
    padding: 16px;
  }
}
</style>
