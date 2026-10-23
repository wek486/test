import { defineStore } from 'pinia'
import { ref } from 'vue'
import { community } from '../services/community'
// 只保存当前身份，不把作品、评论或密码塞入全局状态。
export const useSessionStore = defineStore('session', () => {
  const user = ref(null)
  async function refresh() {
    user.value = await community.currentUser()
  }
  async function login(payload) {
    user.value = await community.login(payload)
  }
  async function register(payload) {
    user.value = await community.register(payload)
  }
  async function logout() {
    await community.logout()
    user.value = null
  }
  return { user, refresh, login, register, logout }
})
