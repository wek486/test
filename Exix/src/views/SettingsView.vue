<script setup>
// 设置页面：管理资料、隐私、拉黑列表和演示数据重置。
import { onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '../stores/session'
import { community } from '../services/community'
import { useAsync, useAction, confirmAction } from '../composables/useAsync'
import AsyncState from '../components/common/AsyncState.vue'
import UserAvatar from '../components/common/UserAvatar.vue'
const form = reactive({ name: '', bio: '', allowStrangers: true }),
  session = useSessionStore(),
  router = useRouter(),
  { busy, run } = useAction()
const { data, loading, error, refresh } = useAsync(async () => {
  const result = await community.settings()
  Object.assign(form, result.user)
  return result
})
onMounted(refresh)
async function save() {
  await run(async () => {
    await community.saveSettings(form)
    await session.refresh()
  }, '资料已保存')
}
async function unblock(id) {
  await run(async () => {
    await community.unblock(id)
    await refresh()
  }, '已解除拉黑')
}
// 重置只作用于本应用演示数据，不删除浏览器其他数据。
async function reset() {
  await run(async () => {
    await confirmAction('重置所有本地演示内容并退出登录？')
    await community.resetDemo()
    await session.refresh()
    await router.push('/')
  }, '演示数据已重置')
}
</script>
<template>
  <!-- 资料、隐私与拉黑列表分区，避免一张表单承载全部行为。 -->
  <section class="narrow-page">
    <p class="eyebrow">MAKE YOURSELF AT HOME</p>
    <h1 class="page-title">个人设置</h1>
    <AsyncState :loading="loading" :error="error" @retry="refresh"
      ><template v-if="data"
        ><form class="panel" @submit.prevent="save">
          <h3>个人资料</h3>
          <div class="avatar-setting">
            <UserAvatar :user="session.user" large />
            <p>头像使用昵称首字与账号专属配色。</p>
          </div>
          <label class="field-label" for="settings-name">昵称</label
          ><input id="settings-name" v-model="form.name" maxlength="24" required /><label
            class="field-label"
            for="settings-bio"
            >个人简介</label
          ><textarea
            id="settings-bio"
            v-model="form.bio"
            maxlength="300"
            rows="3"
            placeholder="介绍一下你自己…"
          ></textarea>
          <div class="privacy-row">
            <div>
              <h4>接收陌生人私信</h4>
              <p>关闭后，仅接收你已关注用户的消息。</p>
            </div>
            <el-switch v-model="form.allowStrangers" aria-label="接收陌生人私信" />
          </div>
          <div class="form-actions">
            <el-button type="primary" :loading="busy" native-type="submit">保存设置</el-button>
          </div>
        </form>
        <div class="panel settings-section">
          <h3>拉黑管理</h3>
          <p v-if="!data.blocks.length" class="field-hint">没有拉黑的用户。</p>
          <div v-for="user in data.blocks" :key="user.id" class="block-row">
            <UserAvatar :user="user" /><span>{{ user.name }}</span
            ><el-button :disabled="busy" @click="unblock(user.id)">解除拉黑</el-button>
          </div>
        </div>
        <div class="panel settings-section demo-reset">
          <div>
            <h3>演示数据</h3>
            <p>恢复初始作品与账号，清除本地互动记录。</p>
          </div>
          <el-button :disabled="busy" @click="reset">重置演示</el-button>
        </div></template
      ></AsyncState
    >
  </section>
</template>
<style scoped>
/* 设置分区共享表单样式，隐私开关和重置区在手机上允许换行。 */
.panel h3 {
  font-size: 16px;
}
.avatar-setting {
  display: flex;
  align-items: center;
  gap: 20px;
  margin: 24px 0;
}
.avatar-setting p {
  font-size: 11px;
  color: var(--muted);
}
.privacy-row {
  margin-top: 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-top: 1px solid var(--line);
  padding-top: 24px;
}
.privacy-row h4 {
  font-size: 13px;
  font-weight: 500;
}
.privacy-row p {
  font-size: 11px;
  color: var(--muted);
  margin-top: 8px;
  line-height: 1.8;
}
.settings-section {
  margin-top: 20px;
}
.block-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
  font-size: 13px;
}
.block-row .el-button {
  margin-left: auto;
}
.demo-reset {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}
.demo-reset p {
  font-size: 11px;
  line-height: 1.8;
  color: var(--muted);
  margin-top: 10px;
}
@media (max-width: 600px) {
  .demo-reset {
    flex-wrap: wrap;
  }
}
</style>
