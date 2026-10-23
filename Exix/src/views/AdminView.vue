<script setup>
// 后台管理页面：根据路由模块读取列表，执行带确认的审核与管理操作。
import { computed, onMounted } from 'vue'
import { ElMessageBox } from 'element-plus'
import { community } from '../services/community'
import { useAsync, useAction, confirmAction } from '../composables/useAsync'
import AsyncState from '../components/common/AsyncState.vue'
import UserAvatar from '../components/common/UserAvatar.vue'
import { formatDate, roleLabel } from '../utils/format'
// 同一后台页面以 section 选择业务列表，审核和管理仍走独立服务方法。
const props = defineProps({ section: String }),
  { busy, run } = useAction()
const titles = {
  applications: '画师审核',
  reports: '举报处理',
  works: '作品管理',
  users: '账号管理',
}
const title = computed(() => titles[props.section])
const { data, loading, error, refresh } = useAsync(() => community.adminData(props.section))
onMounted(refresh)
async function review(id, approve) {
  await run(async () => {
    let reason = ''
    if (!approve) {
      const result = await ElMessageBox.prompt('请填写具体原因，帮助申请者完善作品', '驳回申请', {
        inputValidator: (v) => !!v?.trim() || '请填写原因',
        confirmButtonText: '确认驳回',
        cancelButtonText: '取消',
      })
      reason = result.value
    } else await confirmAction('确认通过画师申请并开放发布权限？')
    await community.reviewApplication({ id, approve, reason })
    await refresh()
  }, '审核已完成')
}
async function resolve(id) {
  await run(async () => {
    await confirmAction('确认此举报已经检查并处理？')
    await community.resolveReport(id)
    await refresh()
  }, '举报已标记处理')
}
async function hide(work) {
  await run(async () => {
    await confirmAction(work.hidden ? '恢复该作品公开展示？' : '隐藏后，该作品将不再对外展示。')
    await community.toggleHidden(work.id)
    await refresh()
  }, '作品状态已更新')
}
async function restrict(user) {
  await run(async () => {
    await confirmAction(user.restricted ? '解除该账号限制？' : '限制后，该账号无法进行发布和互动。')
    await community.toggleRestricted(user.id)
    await refresh()
  }, '账号状态已更新')
}
</script>
<template>
  <!-- 后台用卡片列表兼容手机；代表作品直接展示，管理员可据此审核。 -->
  <div class="page-heading">
    <div>
      <p class="eyebrow">COMMUNITY MANAGEMENT</p>
      <h1 class="page-title">{{ title }}</h1>
    </div>
    <span class="muted small">{{ data?.length || 0 }} 条记录</span>
  </div>
  <AsyncState
    :loading="loading"
    :error="error"
    :empty="data?.length === 0"
    empty-text="暂无待展示的记录。"
    @retry="refresh"
    ><div class="admin-list">
      <article v-for="item in data" :key="item.id" class="panel admin-card">
        <template v-if="section === 'applications'"
          ><div class="admin-row">
            <UserAvatar :user="item.user" /><strong>{{ item.user.name }}</strong
            ><span class="status-pill">{{
              { pending: '待审核', approved: '已通过', rejected: '已驳回' }[item.status]
            }}</span>
          </div>
          <p class="record-text">{{ item.bio }}</p>
          <p v-if="item.link" class="record-text">作品主页：{{ item.link }}</p>
          <div class="sample-images">
            <img
              v-for="(image, i) in item.images"
              :key="i"
              :src="image"
              :alt="`代表作品 ${i + 1}`"
            />
          </div>
          <p v-if="item.reason" class="field-hint">驳回原因：{{ item.reason }}</p>
          <div v-if="item.status === 'pending'" class="form-actions">
            <el-button :disabled="busy" @click="review(item.id, false)">驳回</el-button
            ><el-button type="primary" :disabled="busy" @click="review(item.id, true)"
              >通过审核</el-button
            >
          </div></template
        ><template v-else-if="section === 'reports'"
          ><div class="admin-row">
            <span class="status-pill">{{ item.status === 'pending' ? '待处理' : '已处理' }}</span
            ><strong
              >{{ item.type === 'work' ? '作品举报' : '用户举报' }} · {{ item.targetLabel }}</strong
            >
          </div>
          <p class="record-text">{{ item.reason }}</p>
          <p class="field-hint">举报人：{{ item.user.name }} · {{ formatDate(item.createdAt) }}</p>
          <div class="form-actions">
            <RouterLink
              :to="item.type === 'work' ? `/works/${item.targetId}` : `/users/${item.targetId}`"
              class="text-link"
              >查看内容 ↗</RouterLink
            ><el-button v-if="item.status === 'pending'" :disabled="busy" @click="resolve(item.id)"
              >标记已处理</el-button
            >
          </div></template
        ><template v-else-if="section === 'works'"
          ><div class="admin-row work-record">
            <img :src="item.images[0]" :alt="item.title" />
            <div>
              <strong>{{ item.title }}</strong>
              <p class="field-hint">
                {{ item.author.name }} · {{ item.hidden ? '已隐藏' : '公开展示' }}
              </p>
            </div>
            <el-button :disabled="busy" @click="hide(item)">{{
              item.hidden ? '恢复展示' : '隐藏作品'
            }}</el-button>
          </div></template
        ><template v-else
          ><div class="admin-row">
            <UserAvatar :user="item" />
            <div>
              <strong>{{ item.name }}</strong>
              <p class="field-hint">
                {{ roleLabel(item.role) }} · {{ item.restricted ? '已限制' : '正常' }}
              </p>
            </div>
            <el-button v-if="item.role !== 'admin'" :disabled="busy" @click="restrict(item)">{{
              item.restricted ? '解除限制' : '限制账号'
            }}</el-button>
          </div></template
        >
      </article>
    </div></AsyncState
  >
</template>
<style scoped>
/* 列表记录允许长文本断行，代表作品不裁切，方便审核细节。 */
.admin-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.admin-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.admin-row strong {
  font-size: 14px;
  overflow-wrap: anywhere;
}
.admin-row > .el-button,
.admin-row > .status-pill {
  margin-left: auto;
}
.record-text {
  font-size: 13px;
  line-height: 1.9;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  margin: 18px 0;
  color: var(--muted);
}
.sample-images {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.sample-images img {
  width: min(100%, 220px);
  height: 240px;
  object-fit: contain;
  background: var(--paper);
  border-radius: 8px;
}
.work-record > img {
  width: 64px;
  height: 76px;
  object-fit: contain;
  background: var(--paper);
  border-radius: 6px;
}
.work-record > div {
  min-width: 0;
}
.admin-card .form-actions {
  align-items: center;
  gap: 16px;
}
@media (max-width: 600px) {
  .admin-row {
    flex-wrap: wrap;
  }
  .admin-card {
    padding: 18px;
  }
  .sample-images img {
    height: 190px;
  }
  .admin-row > .el-button {
    margin-left: 0;
  }
}
</style>
