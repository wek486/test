<script setup>
// 认证页面：管理登录与注册表单校验、演示账号填入和返回地址，不直接访问存储。
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSessionStore } from '../stores/session'
import { safeReturnPath } from '../utils/format'
import { demoAccounts } from '../mocks/seed'
const route = useRoute(),
  router = useRouter(),
  session = useSessionStore()
const registering = computed(() => route.name === 'register')
const form = reactive({ name: '', email: '', password: '', confirm: '' })
const formRef = ref(),
  busy = ref(false),
  error = ref('')
// 校验在输入项内展示；认证失败单独显示，不清空用户输入。
const rules = computed(() => ({
  name: [
    { required: true, message: '请填写昵称', trigger: 'blur' },
    { max: 24, message: '昵称最多 24 字', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请填写邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效邮箱', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请填写密码', trigger: 'blur' },
    { min: registering.value ? 8 : 1, max: 128, message: '密码长度需为 8–128 位', trigger: 'blur' },
  ],
  confirm: [
    {
      validator: (_, value, callback) =>
        value === form.password ? callback() : callback(new Error('两次输入的密码不一致')),
      trigger: 'blur',
    },
  ],
}))
async function submit() {
  if (busy.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  busy.value = true
  error.value = ''
  try {
    await session[registering.value ? 'register' : 'login'](form)
    await router.replace(safeReturnPath(route.query.redirect))
  } catch (e) {
    error.value = e.message || '暂时无法登录，请重试'
  } finally {
    busy.value = false
  }
}
function fillDemo(email) {
  form.email = email
  form.password = 'Exix2026!'
  error.value = ''
}
</script>
<template>
  <!-- 电脑品牌介绍与认证表单并排；手机保留精简品牌区和完整表单。 -->
  <main class="auth-page">
    <section class="auth-story">
      <RouterLink to="/" class="auth-brand">exix</RouterLink>
      <div class="story-copy">
        <p class="eyebrow">A LITTLE SPACE FOR BIG IDEAS</p>
        <h1>让想象落笔，<br />让我们相遇。</h1>
        <p>在这里分享你的创作，<br />也发现另一个人的小小宇宙。</p>
      </div>
      <img src="/art/work-1.svg" alt="层叠山峦与日光的插画" class="story-art" /><span
        class="story-credit"
        >原创表达 · 自由交流 · 灵感发生</span
      >
    </section>
    <section class="auth-form">
      <RouterLink to="/" class="back-link">← 返回社区</RouterLink>
      <div class="form-inner" :key="route.name">
        <p class="eyebrow">{{ registering ? 'START YOUR STORY' : 'WELCOME BACK' }}</p>
        <h2>{{ registering ? '从这里，开始创作。' : '好久不见，欢迎回来。' }}</h2>
        <p class="auth-subtitle">
          {{ registering ? '成为社区的一员，发现与分享美好。' : '你喜欢的作品和画师，正在等你。' }}
        </p>
        <el-alert
          v-if="error"
          :title="error"
          type="error"
          :closable="false"
          show-icon
          class="auth-error"
        /><el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          @submit.prevent="submit"
          ><el-form-item v-if="registering" label="昵称" prop="name"
            ><el-input
              v-model="form.name"
              placeholder="大家怎么称呼你"
              autocomplete="nickname"
              maxlength="24" /></el-form-item
          ><el-form-item label="邮箱" prop="email"
            ><el-input
              v-model="form.email"
              placeholder="you@example.com"
              autocomplete="email"
              type="email" /></el-form-item
          ><el-form-item label="密码" prop="password"
            ><el-input
              v-model="form.password"
              :placeholder="registering ? '设置至少 8 位密码' : '输入你的密码'"
              type="password"
              show-password
              :autocomplete="registering ? 'new-password' : 'current-password'" /></el-form-item
          ><el-form-item v-if="registering" label="确认密码" prop="confirm"
            ><el-input
              v-model="form.confirm"
              placeholder="再输入一次密码"
              type="password"
              show-password
              autocomplete="new-password" /></el-form-item
          ><el-button class="auth-submit" type="primary" native-type="submit" :loading="busy">{{
            registering ? '创建账号 →' : '登录社区 →'
          }}</el-button></el-form
        >
        <p class="switch-auth">
          {{ registering ? '已经有账号？' : '还没有账号？' }}
          <RouterLink :to="{ name: registering ? 'login' : 'register', query: route.query }">{{
            registering ? '立即登录' : '加入 Exix'
          }}</RouterLink>
        </p>
        <div v-if="!registering" class="demo-accounts">
          <p>体验前端演示 · 点击填入账号</p>
          <div>
            <button
              v-for="(u, i) in demoAccounts.slice(0, 3)"
              :key="u.id"
              type="button"
              @click="fillDemo(u.email)"
            >
              {{ ['普通用户', '画师', '管理员'][i] }} ↗
            </button>
          </div>
          <small>演示密码：Exix2026! · 仅用于本地模拟</small>
        </div>
      </div>
      <p class="auth-footnote">尊重原创，让每一次交流都温柔而有意义。</p>
    </section>
  </main>
</template>
<style scoped>
/* 认证页独立全屏布局，与社区导航解耦；表单宽度固定上限，手机自动缩放。 */
.auth-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
}
.auth-story {
  position: relative;
  overflow: hidden;
  min-height: 850px;
  background: #e9ede5;
  padding: 46px 64px;
}
.auth-brand {
  font-size: 48px;
  font-family: var(--serif);
  letter-spacing: -4px;
  position: relative;
  z-index: 2;
}
.story-copy {
  position: relative;
  z-index: 2;
  margin: 60px 0 0;
}
.story-copy h1 {
  font-family: var(--serif);
  font-size: clamp(32px, 3.8vw, 58px);
  font-weight: 400;
  line-height: 1.4;
  margin: 24px 0;
}
.story-copy > p:last-child {
  font-size: 14px;
  line-height: 2;
  color: #637365;
}
.story-art {
  position: absolute;
  bottom: -230px;
  right: -30px;
  width: 70%;
  max-width: 520px;
  transform: rotate(-10deg);
  border: 10px solid #fff9;
  box-shadow: 0 30px 90px #334d3c20;
}
.story-credit {
  position: absolute;
  bottom: 28px;
  left: 64px;
  font-size: 10px;
  letter-spacing: 2px;
  z-index: 2;
}
.auth-form {
  padding: 48px 60px 28px;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.back-link {
  font-size: 12px;
  color: var(--muted);
}
.form-inner {
  width: 100%;
  max-width: 360px;
  margin: auto;
  padding: 48px 0;
}
.form-inner h2 {
  font-family: var(--serif);
  font-size: 29px;
  font-weight: 400;
  margin: 16px 0;
}
.auth-subtitle {
  color: var(--muted);
  font-size: 12px;
  margin-bottom: 36px;
}
.auth-error {
  margin-bottom: 20px;
}
.auth-submit {
  width: 100%;
  height: 46px;
  margin-top: 12px;
}
.switch-auth {
  font-size: 12px;
  text-align: center;
  color: var(--muted);
  margin-top: 24px;
}
.switch-auth a {
  color: var(--accent);
  font-weight: 600;
  margin-left: 5px;
}
.demo-accounts {
  margin-top: 35px;
  padding-top: 24px;
  border-top: 1px solid var(--line);
  font-size: 11px;
  color: var(--muted);
}
.demo-accounts > div {
  display: flex;
  gap: 8px;
  margin: 12px 0;
}
.demo-accounts button {
  border: 1px solid var(--line);
  background: white;
  padding: 9px 12px;
  border-radius: 6px;
  font-size: 11px;
  cursor: pointer;
  color: var(--ink);
}
.demo-accounts small {
  font-size: 10px;
}
.auth-footnote {
  font-size: 10px;
  text-align: center;
  color: var(--muted);
}
@media (max-width: 900px) {
  .auth-story {
    padding: 38px;
    min-height: 780px;
  }
  .auth-form {
    padding: 38px;
  }
  .story-credit {
    left: 38px;
  }
  .story-art {
    width: 90%;
  }
}
@media (max-width: 680px) {
  .auth-page {
    grid-template-columns: 1fr;
  }
  .auth-story {
    min-height: 190px;
    padding: 20px 24px;
  }
  .auth-brand {
    font-size: 34px;
  }
  .story-copy {
    margin: 12px 0;
  }
  .story-copy .eyebrow,
  .story-copy > p:last-child,
  .story-credit {
    display: none;
  }
  .story-copy h1 {
    font-size: 25px;
    margin: 8px 0;
  }
  .story-art {
    width: 160px;
    right: 8px;
    bottom: -55px;
  }
  .auth-form {
    padding: 24px;
  }
  .form-inner {
    padding: 30px 0;
  }
  .form-inner h2 {
    font-size: 25px;
  }
  .auth-subtitle {
    margin-bottom: 24px;
  }
  .auth-footnote {
    margin-top: 16px;
  }
}
</style>
