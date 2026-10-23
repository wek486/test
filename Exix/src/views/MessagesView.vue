<script setup>
// 消息中心：组织私信列表与站内通知，查看通知后更新已读。
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { community } from '../services/community'
import { useAsync, useAction } from '../composables/useAsync'
import AsyncState from '../components/common/AsyncState.vue'
import UserAvatar from '../components/common/UserAvatar.vue'
import { formatDate } from '../utils/format'
const tab = ref('conversations'),
  router = useRouter(),
  { run } = useAction()
const { data, loading, error, refresh } = useAsync(() => community.inbox())
onMounted(refresh)
// 先标记通知已读，再跳转关联作品或申请页。
async function openNotification(n) {
  await run(async () => {
    await community.readNotification(n.id)
    await router.push(n.path)
  })
}
</script>
<template>
  <!-- 私信与通知共用消息中心，但各自有独立列表及空状态。 -->
  <section class="narrow-page">
    <p class="eyebrow">GOOD CONVERSATIONS START HERE</p>
    <h1 class="page-title">每一份回响，都在这里。</h1>
    <div class="message-tabs">
      <button :class="{ chosen: tab === 'conversations' }" @click="tab = 'conversations'">
        私信</button
      ><button :class="{ chosen: tab === 'notifications' }" @click="tab = 'notifications'">
        通知
      </button>
    </div>
    <AsyncState :loading="loading" :error="error" @retry="refresh"
      ><div v-if="data" class="panel inbox">
        <template v-if="tab === 'conversations'"
          ><AsyncState :empty="!data.conversations.length" empty-text="从画师主页发起一段对话。"
            ><RouterLink
              v-for="c in data.conversations"
              :key="c.id"
              :to="{ name: 'conversation', params: { id: c.id } }"
              class="inbox-row"
              ><UserAvatar :user="c.peer" />
              <div>
                <strong>{{ c.peer.name }}</strong>
                <p>{{ c.last?.text || '打个招呼吧' }}</p>
              </div>
              <span v-if="c.unread" class="count-badge">{{ c.unread }}</span
              ><time>{{ formatDate(c.last?.createdAt) }}</time></RouterLink
            ></AsyncState
          ></template
        ><template v-else
          ><AsyncState
            :empty="!data.notifications.length"
            empty-text="新的关注与交流会在这里通知你。"
            ><button
              v-for="n in data.notifications"
              :key="n.id"
              class="inbox-row notification"
              @click="openNotification(n)"
            >
              <span class="notification-icon">✧</span>
              <div>
                <strong>{{ n.text }}</strong
                ><time>{{ formatDate(n.createdAt) }}</time>
              </div>
              <span v-if="!n.read" class="dot"></span></button></AsyncState
        ></template></div
    ></AsyncState>
  </section>
</template>
<style scoped>
/* 列表行整体可点击，预览文字单行省略，未读标记不依赖颜色独立存在。 */
.message-tabs {
  display: flex;
  gap: 28px;
  margin: 28px 0;
}
.message-tabs button {
  background: none;
  border: 0;
  border-bottom: 2px solid transparent;
  padding: 10px 0;
  color: var(--muted);
  cursor: pointer;
}
.message-tabs .chosen {
  color: var(--accent);
  border-color: var(--accent);
  font-weight: 600;
}
.inbox {
  padding: 0 24px;
}
.inbox-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 0;
  border-bottom: 1px solid var(--line);
  width: 100%;
}
.inbox-row:last-child {
  border-bottom: 0;
}
.inbox-row > div {
  flex: 1;
  min-width: 0;
}
.inbox-row strong {
  font-size: 13px;
  font-weight: 500;
}
.inbox-row p {
  font-size: 12px;
  color: var(--muted);
  margin-top: 9px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.inbox-row time {
  font-size: 10px;
  color: var(--muted);
}
.notification {
  background: none;
  border: 0;
  border-bottom: 1px solid var(--line);
  text-align: left;
  cursor: pointer;
}
.notification strong {
  overflow-wrap: anywhere;
}
.notification time {
  display: block;
  margin-top: 8px;
}
.notification-icon {
  font-size: 26px;
  color: var(--accent);
}
.dot {
  width: 7px;
  height: 7px;
  background: var(--accent);
  border-radius: 50%;
}
.count-badge {
  background: var(--accent);
  color: white;
  padding: 3px 7px;
  font-size: 10px;
  border-radius: 20px;
}
@media (max-width: 600px) {
  .inbox {
    padding: 0 16px;
  }
  .inbox-row {
    gap: 10px;
  }
  .inbox-row > time {
    display: none;
  }
}
</style>
