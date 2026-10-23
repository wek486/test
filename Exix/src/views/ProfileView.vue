<script setup>
// 用户主页：读取公开资料与作品，执行关注和创建私信会话。
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSessionStore } from '../stores/session'
import { community } from '../services/community'
import { useAsync, useAction } from '../composables/useAsync'
import UserAvatar from '../components/common/UserAvatar.vue'
import AsyncState from '../components/common/AsyncState.vue'
import WorkGrid from '../components/works/WorkGrid.vue'
import { roleLabel } from '../utils/format'
const route = useRoute(),
  router = useRouter(),
  session = useSessionStore(),
  { busy, run } = useAction()
const { data, loading, error, refresh } = useAsync(async () => ({
  profile: await community.getProfile(route.params.id),
  works: await community.listWorks({ authorId: route.params.id }),
}))
onMounted(refresh)
function auth() {
  if (session.user) return true
  router.push({ name: 'login', query: { redirect: route.fullPath } })
  return false
}
async function follow() {
  if (auth())
    await run(async () => {
      await community.toggleFollow(route.params.id)
      await refresh()
    })
}
async function message() {
  if (auth())
    await run(async () => {
      const id = await community.startConversation(route.params.id)
      router.push({ name: 'conversation', params: { id } })
    })
}
</script>
<template>
  <!-- 主页资料与公开作品分区，自己的主页展示编辑入口。 -->
  <AsyncState :loading="loading" :error="error" @retry="refresh"
    ><template v-if="data"
      ><header class="profile-header">
        <UserAvatar :user="data.profile" large />
        <div class="profile-copy">
          <span class="eyebrow">{{ roleLabel(data.profile.role) }}</span>
          <h1>{{ data.profile.name }}</h1>
          <p>{{ data.profile.bio || '还没有填写简介，作品会替我说话。' }}</p>
          <div class="profile-stats">
            {{ data.works.length }} 件作品 <span>·</span> {{ data.profile.followers }} 位粉丝
            <span>·</span> {{ data.profile.followingCount }} 个关注
          </div>
        </div>
        <div class="profile-actions">
          <RouterLink
            v-if="session.user?.id === data.profile.id"
            to="/settings"
            class="outline-link"
            >编辑资料 ↗</RouterLink
          ><template v-else
            ><el-button type="primary" :loading="busy" @click="follow">{{
              data.profile.following ? '已关注' : '＋ 关注'
            }}</el-button
            ><el-button :disabled="busy" @click="message">私信</el-button></template
          >
        </div>
      </header>
      <div class="section-heading">
        <h2>作品</h2>
        <span>每一幅，都是一个小小世界。</span>
      </div>
      <AsyncState :empty="!data.works.length" empty-text="这位用户还没有公开作品。"
        ><WorkGrid :works="data.works" /></AsyncState></template
  ></AsyncState>
</template>
<style scoped>
/* 资料横向排列，手机按钮独占一行，避免昵称与操作挤压。 */
.profile-header {
  display: flex;
  gap: 26px;
  align-items: center;
  padding: 30px 0 52px;
}
.profile-copy {
  min-width: 0;
}
.profile-copy h1 {
  font-family: var(--serif);
  font-size: 34px;
  margin: 8px 0 12px;
  font-weight: 400;
}
.profile-copy > p {
  font-size: 13px;
  color: var(--muted);
  line-height: 1.8;
  max-width: 560px;
  overflow-wrap: anywhere;
}
.profile-stats {
  margin-top: 16px;
  font-size: 11px;
  color: var(--muted);
}
.profile-stats span {
  margin: 0 10px;
}
.profile-actions {
  margin-left: auto;
  display: flex;
  white-space: nowrap;
}
.section-heading {
  border-bottom: 1px solid var(--line);
  padding-bottom: 16px;
  margin-bottom: 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.section-heading h2 {
  font-size: 15px;
}
.section-heading span {
  font-size: 11px;
  color: var(--muted);
}
@media (max-width: 680px) {
  .profile-header {
    gap: 18px;
    flex-wrap: wrap;
    padding: 10px 0 32px;
  }
  .profile-copy {
    flex: 1;
  }
  .profile-copy h1 {
    font-size: 27px;
  }
  .profile-actions {
    margin-left: 106px;
  }
  .section-heading span {
    font-size: 10px;
  }
  .profile-stats {
    line-height: 1.8;
  }
  .profile-stats span {
    margin: 0 4px;
  }
}
</style>
