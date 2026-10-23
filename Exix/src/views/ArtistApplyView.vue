<script setup>
// 画师资格页：管理申请表及审核状态，上传与审核数据由独立模块处理。
import { onMounted, reactive } from 'vue'
import { community } from '../services/community'
import { useSessionStore } from '../stores/session'
import { useAsync, useAction } from '../composables/useAsync'
import AsyncState from '../components/common/AsyncState.vue'
import ImageUploader from '../components/works/ImageUploader.vue'
const session = useSessionStore(),
  form = reactive({ bio: '', link: '', images: [] }),
  { busy, run } = useAction()
const { data, loading, error, refresh } = useAsync(() => community.getApplication())
onMounted(refresh)
// 审核结果由服务读取，驳回后允许重新提交，审核中隐藏重复申请表单。
async function submit() {
  await run(async () => {
    await community.applyArtist(form)
    await refresh()
  }, '申请已提交，等待管理员审核')
}
</script>
<template>
  <!-- 资格、审核状态与申请表互斥展示。 -->
  <section class="narrow-page">
    <p class="eyebrow">BECOME A CREATOR</p>
    <h1 class="page-title">让你的创作，被更多人看见。</h1>
    <p class="page-description">提交代表作品与创作介绍，通过人工审核后即可发布。</p>
    <AsyncState :loading="loading" :error="error" @retry="refresh"
      ><div v-if="session.user?.role !== 'user'" class="panel">
        <h3>{{ session.user?.role === 'artist' ? '你已经是认证画师了' : '管理员账号无需申请' }}</h3>
        <RouterLink :to="session.user?.role === 'artist' ? '/studio' : '/admin'" class="text-link"
          >进入工作区 →</RouterLink
        >
      </div>
      <div v-else-if="data?.status === 'pending'" class="panel">
        <span class="status-pill">审核中</span>
        <h3 class="mt">作品已收到，请耐心等待。</h3>
        <p class="page-description">审核结果会通过站内通知告诉你。</p>
      </div>
      <template v-else
        ><el-alert
          v-if="data?.status === 'rejected'"
          :title="`上次申请未通过：${data.reason}`"
          type="warning"
          :closable="false"
          class="mb"
        />
        <form class="panel" @submit.prevent="submit">
          <label class="field-label" for="artist-bio">创作介绍 *</label
          ><textarea
            id="artist-bio"
            v-model="form.bio"
            required
            maxlength="1000"
            rows="4"
            placeholder="介绍你的创作方向、经历或喜欢的主题…"
          ></textarea
          ><label class="field-label">代表作品 *</label
          ><ImageUploader v-model="form.images" :max="3" /><label
            class="field-label"
            for="artist-link"
            >作品主页链接（可选）</label
          ><input
            id="artist-link"
            v-model="form.link"
            type="url"
            placeholder="https://"
            maxlength="500"
          />
          <div class="form-actions">
            <el-button type="primary" native-type="submit" :loading="busy">提交申请 →</el-button>
          </div>
        </form></template
      ></AsyncState
    >
  </section>
</template>
<style scoped>
/* 申请表限制行宽，上传区使用组件自身响应式网格。 */
.mt {
  margin-top: 18px;
}
.mb {
  margin-bottom: 20px;
}
.panel h3 {
  font-family: var(--serif);
  font-size: 24px;
  font-weight: 400;
}
.panel .text-link {
  display: inline-block;
  margin-top: 22px;
}
</style>
