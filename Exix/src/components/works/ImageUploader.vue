<script setup>
import { onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
// 受控上传组件：父级拥有图片数组，组件只产出预览 URL，不涉及作品发布。
const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  max: { type: Number, default: 9 },
})
const emit = defineEmits(['update:modelValue'])
const ownedUrls = new Set()
function choose(event) {
  const next = [...props.modelValue]
  for (const file of event.target.files || []) {
    if (next.length >= props.max) {
      ElMessage.warning(`最多 ${props.max} 张图片`)
      break
    }
    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
      file.size > 20 * 1024 * 1024
    ) {
      ElMessage.error(`${file.name}：请选择 20MB 以内的 JPG、PNG、WebP 图片`)
      continue
    }
    const url = URL.createObjectURL(file)
    ownedUrls.add(url)
    next.push(url)
  }
  emit('update:modelValue', next)
  event.target.value = ''
}
function remove(index) {
  emit(
    'update:modelValue',
    props.modelValue.filter((_, i) => i !== index),
  )
}
function move(index, direction) {
  const next = [...props.modelValue]
  const target = index + direction
  if (target < 0 || target >= next.length) return
  ;[next[index], next[target]] = [next[target], next[index]]
  emit('update:modelValue', next)
}
// 已被提交的 URL 仍由当前会话使用，仅释放已从列表移除的本组件 URL。
onBeforeUnmount(() => {
  ownedUrls.forEach((url) => {
    if (!props.modelValue.includes(url)) URL.revokeObjectURL(url)
  })
})
</script>
<template>
  <!-- 文件输入保留原生键盘访问；每张图片可以调整顺序或删除。 -->
  <div class="uploads">
    <div v-for="(image, i) in modelValue" :key="image" class="upload-item">
      <img :src="image" :alt="`第 ${i + 1} 张图片`" /><span class="cover-tag" v-if="i === 0"
        >封面</span
      >
      <div class="tools">
        <button type="button" :disabled="i === 0" aria-label="前移图片" @click="move(i, -1)">
          ←</button
        ><button
          type="button"
          :disabled="i === modelValue.length - 1"
          aria-label="后移图片"
          @click="move(i, 1)"
        >
          →</button
        ><button type="button" aria-label="删除图片" @click="remove(i)">×</button>
      </div>
    </div>
    <label v-if="modelValue.length < max" class="upload-add"
      ><span>＋</span><span>添加图片</span
      ><input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        aria-label="上传图片"
        @change="choose"
    /></label>
  </div>
  <p class="field-hint">JPG / PNG / WebP，单张不超过 20MB，最多 {{ max }} 张。第一张作为封面。</p>
  <p class="demo-note">
    演示上传仅在当前会话预览；刷新后会替换为占位图。真实上传将在接入后端时实现。
  </p>
</template>
<style scoped>
/* 上传网格自适应，不固定页面宽度；工具按钮始终可见便于手机操作。 */
.uploads {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 12px;
}
.upload-item,
.upload-add {
  aspect-ratio: 1;
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  background: var(--paper);
}
.upload-item img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.cover-tag {
  position: absolute;
  top: 8px;
  left: 8px;
  background: white;
  border-radius: 5px;
  padding: 3px 7px;
  font-size: 11px;
}
.tools {
  position: absolute;
  bottom: 5px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 5px;
}
.tools button {
  border: 0;
  border-radius: 5px;
  background: white;
  width: 30px;
  height: 28px;
  cursor: pointer;
}
.tools button:disabled {
  opacity: 0.45;
}
.upload-add {
  border: 1px dashed #a7b8ae;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--accent);
  cursor: pointer;
}
.upload-add > span:first-child {
  font-size: 28px;
}
.upload-add input {
  position: absolute;
  inset: 0;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
</style>
