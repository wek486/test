<script setup>
// 状态页面：区分无权限和未知地址，提供回到社区及切换账号入口。
import { computed } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
// 明确区分权限错误与不存在页面，避免所有错误都显示为 404。
const forbidden = computed(() => route.name === 'forbidden')
</script>
<template>
  <!-- 错误页提供明确返回入口，不把用户留在死路。 -->
  <section class="status-page">
    <span>{{ forbidden ? '403' : '404' }}</span>
    <h1>{{ forbidden ? '这里需要相应的访问权限。' : '这一页，暂时迷路了。' }}</h1>
    <p>
      {{
        forbidden
          ? '请使用对应身份访问；账号受限时请联系管理员。'
          : '链接可能已失效，去发现更多美好作品吧。'
      }}
    </p>
    <RouterLink to="/" class="primary-link">回到发现 →</RouterLink
    ><RouterLink to="/login" class="text-link">切换账号</RouterLink>
  </section>
</template>
<style scoped>
/* 错误页轻量居中布局，与公共状态组件保持视觉一致。 */
.status-page {
  padding: 70px 20px;
  text-align: center;
}
.status-page > span {
  font-family: var(--serif);
  font-size: 90px;
  color: #c8d4c7;
}
.status-page h1 {
  font-family: var(--serif);
  font-size: 27px;
  font-weight: 400;
  margin: 20px 0;
}
.status-page p {
  font-size: 13px;
  color: var(--muted);
  line-height: 1.8;
  margin-bottom: 30px;
}
.status-page .text-link {
  display: block;
  margin-top: 20px;
}
</style>
