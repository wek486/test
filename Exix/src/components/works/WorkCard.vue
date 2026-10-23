<script setup>
import UserAvatar from '../common/UserAvatar.vue'
// 卡片只展示作品，导航由 RouterLink 完成；不直接访问数据服务。
defineProps({ work: { type: Object, required: true } })
</script>
<template>
  <!-- 图片和标题进入详情；作者拥有独立的主页入口。 -->
  <article class="work-card">
    <RouterLink :to="{ name: 'work', params: { id: work.id } }" class="cover"
      ><img :src="work.images[0]" :alt="work.title" loading="lazy" width="600" height="720" /><span
        class="image-count"
        v-if="work.images.length > 1"
        >{{ work.images.length }} 张</span
      ><span class="view-label">查看作品 ↗</span></RouterLink
    >
    <RouterLink :to="{ name: 'work', params: { id: work.id } }" class="work-title">{{
      work.title
    }}</RouterLink>
    <div class="meta">
      <RouterLink :to="{ name: 'profile', params: { id: work.authorId } }" class="author"
        ><UserAvatar :user="work.author" />{{ work.author?.name }}</RouterLink
      ><span class="likes" aria-label="点赞数">♡ {{ work.likes }}</span>
    </div>
  </article>
</template>
<style scoped>
/* 卡片使用统一画幅，完整插画以 contain 展示；悬停只改变图片轻微缩放。 */
.cover {
  position: relative;
  display: block;
  overflow: hidden;
  border-radius: 12px;
  background: #eae8e1;
  aspect-ratio: 5/6;
}
.cover img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.45s;
}
.cover:hover img {
  transform: scale(1.025);
}
.work-title {
  display: block;
  margin: 17px 0 11px;
  font-size: 15px;
  font-weight: 600;
}
.meta,
.author {
  display: flex;
  align-items: center;
  gap: 8px;
}
.meta {
  justify-content: space-between;
}
.author,
.likes {
  font-size: 12px;
  color: var(--muted);
}
.author .avatar {
  width: 24px;
  height: 24px;
  font-size: 11px;
}
.image-count {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #ffffffcc;
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 11px;
}
.view-label {
  position: absolute;
  bottom: 14px;
  right: 14px;
  background: #ffffffeb;
  padding: 8px 12px;
  border-radius: 24px;
  font-size: 11px;
  opacity: 0;
  transition: opacity 0.2s;
}
.cover:hover .view-label,
.cover:focus-visible .view-label {
  opacity: 1;
}
@media (max-width: 600px) {
  .work-title {
    font-size: 13px;
  }
  .likes {
    font-size: 11px;
  }
  .author {
    gap: 4px;
  }
}
</style>
