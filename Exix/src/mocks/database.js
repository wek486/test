import { createSeed } from './seed'
// 持久化仅存在于模拟适配器。页面与业务服务不能直接访问 localStorage。
const KEY = 'exix-demo-v1'
const SESSION = 'exix-demo-session'
let memory
export function readDatabase() {
  if (memory) return memory
  try {
    const cached = JSON.parse(localStorage.getItem(KEY))
    memory = cached?.version === 1 ? cached : createSeed()
  } catch {
    memory = createSeed()
  }
  return memory
}
export function saveDatabase() {
  // Blob 图片仅在当前内存会话有效；持久化时替换为本地占位图。
  const json = JSON.stringify(readDatabase(), (_, value) =>
    typeof value === 'string' && value.startsWith('blob:') ? '/art/upload-placeholder.svg' : value,
  )
  localStorage.setItem(KEY, json)
}
export function getSessionId() {
  return sessionStorage.getItem(SESSION)
}
export function setSessionId(id) {
  id ? sessionStorage.setItem(SESSION, id) : sessionStorage.removeItem(SESSION)
}
export function resetDatabase() {
  memory = createSeed()
  setSessionId(null)
  saveDatabase()
}
