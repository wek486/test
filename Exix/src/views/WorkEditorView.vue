<script setup>
// 作品编辑器：管理本地表单、预览和离开确认，保存时调用业务服务。
import { computed, onMounted, reactive, ref } from 'vue'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import { community } from '../services/community'
import { useAsync, useAction, confirmAction } from '../composables/useAsync'
import { useSessionStore } from '../stores/session'
import ImageUploader from '../components/works/ImageUploader.vue'
import AsyncState from '../components/common/AsyncState.vue'
const route = useRoute(),
  router = useRouter(),
  session = useSessionStore(),
  { busy, run } = useAction()
const form = reactive({ title: '', description: '', tagsText: '', images: [] }),
  baseline = ref(''),
  saved = ref(false),
  preview = ref(false)
const dirty = computed(() => baseline.value && JSON.stringify(form) !== baseline.value)
const { loading, error, refresh } = useAsync(async () => {
  if (route.params.id) {
    const work = (await community.myWorks()).find((w) => w.id === route.params.id)
    if (!work) throw new Error('作品不存在或无权编辑')
    Object.assign(form, {
      title: work.title,
      description: work.description,
      tagsText: work.tags.join('，'),
      images: [...work.images],
    })
  }
  baseline.value = JSON.stringify(form)
  return true
})
onMounted(refresh)
onBeforeRouteLeave(async () => {
  if (dirty.value && !saved.value) {
    try {
      await confirmAction('内容还没有提交，确定离开吗？')
      return true
    } catch {
      return false
    }
  }
})
// 提交仅通过业务服务；上传与编辑状态不混入全局账号状态。
async function submit() {
  await run(async () => {
    const tags = [
      ...new Set(
        form.tagsText
          .split(/[,，]/)
          .map((s) => s.trim())
          .filter(Boolean),
      ),
    ]
    const work = await community.saveWork({ id: route.params.id, ...form, tags })
    saved.value = true
    await router.push({ name: 'work', params: { id: work.id } })
  }, '作品已发布')
}
</script>
<template>
  <!-- 表单分为图片、文字与操作区；预览弹窗不改变实际保存状态。 -->
  <section class="editor-page">
    <p class="eyebrow">MAKE SOMETHING BEAUTIFUL</p>
    <h1 class="page-title">{{ route.params.id ? '编辑作品' : '发布新作品' }}</h1>
    <p class="page-description">让灵感拥有自己的位置。</p>
    <AsyncState :loading="loading" :error="error" @retry="refresh"
      ><form class="panel" @submit.prevent="submit">
        <label class="field-label">作品图片 *</label><ImageUploader v-model="form.images" /><label
          class="field-label"
          for="work-title"
          >作品标题 *</label
        ><input
          id="work-title"
          v-model="form.title"
          required
          maxlength="80"
          placeholder="为这件作品起个名字"
        /><label class="field-label" for="work-description">作品说明</label
        ><textarea
          id="work-description"
          v-model="form.description"
          rows="5"
          maxlength="2000"
          placeholder="聊聊这件作品背后的灵感或故事…"
        ></textarea
        ><label class="field-label" for="work-tags">标签</label
        ><input
          id="work-tags"
          v-model="form.tagsText"
          maxlength="150"
          placeholder="原创插画，风景，数字绘画"
        />
        <p class="field-hint">用逗号分隔，最多保留 5 个标签。</p>
        <div class="form-actions">
          <el-button :disabled="!form.images.length || busy" @click="preview = true">预览</el-button
          ><el-button type="primary" :loading="busy" native-type="submit"
            >{{ route.params.id ? '保存修改' : '发布作品' }} →</el-button
          >
        </div>
      </form></AsyncState
    ><el-dialog v-model="preview" title="作品预览" width="min(640px, 94vw)"
      ><div class="preview-content">
        <p>{{ session.user?.name }}</p>
        <h2>{{ form.title || '未命名作品' }}</h2>
        <img v-for="image in form.images" :key="image" :src="image" alt="作品预览" />
        <p>{{ form.description }}</p>
      </div></el-dialog
    >
  </section>
</template>
<style scoped>
/* 编辑器适合长表单阅读；预览图片保持完整画幅。 */
.editor-page {
  max-width: 850px;
}
.preview-content img {
  width: 100%;
  max-height: 500px;
  object-fit: contain;
  margin: 18px 0;
  background: var(--paper);
}
.preview-content p {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  color: var(--muted);
  line-height: 1.8;
}
.preview-content h2 {
  margin: 12px 0;
  font-family: var(--serif);
  font-weight: 400;
}
</style>
