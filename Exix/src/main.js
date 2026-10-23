// 应用入口：只注册实际使用的 UI 组件，减少首屏代码；页面不重复注册插件。
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import {
  ElAlert,
  ElButton,
  ElDialog,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElForm,
  ElFormItem,
  ElImageViewer,
  ElInput,
  ElSwitch,
} from 'element-plus'
import 'element-plus/dist/index.css'
import './assets/main.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)
const components = [
  ElAlert,
  ElButton,
  ElDialog,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElForm,
  ElFormItem,
  ElImageViewer,
  ElInput,
  ElSwitch,
]
components.forEach((component) => app.component(component.name, component))
app.use(createPinia()).use(router).mount('#app')
