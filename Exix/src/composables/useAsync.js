import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
// 请求状态与错误展示统一处理；序号避免旧请求覆盖新页面的数据。
export function useAsync(loader) {
  const data = ref(null),
    loading = ref(false),
    error = ref('')
  let sequence = 0
  async function refresh() {
    const current = ++sequence
    loading.value = true
    error.value = ''
    try {
      const value = await loader()
      if (current === sequence) data.value = value
    } catch (e) {
      if (current === sequence) {
        data.value = null
        error.value = e.message || '加载失败，请重试'
      }
    } finally {
      if (current === sequence) loading.value = false
    }
  }
  return { data, loading, error, refresh }
}
export function useAction() {
  const busy = ref(false)
  async function run(task, success = '') {
    if (busy.value) return
    busy.value = true
    try {
      const result = await task()
      if (success) ElMessage.success(success)
      return result === undefined ? true : result
    } catch (e) {
      if (e !== 'cancel' && e !== 'close') ElMessage.error(e.message || '操作失败，请重试')
      return undefined
    } finally {
      busy.value = false
    }
  }
  return { busy, run }
}
export async function confirmAction(message) {
  await ElMessageBox.confirm(message, '确认操作', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  })
}
