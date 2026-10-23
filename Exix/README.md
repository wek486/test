# Exix · 画师图片互动社区

Vue 3 + JavaScript + Vite + Element Plus + Vue Router + Pinia 的前端演示项目。

## 启动

```sh
npm install
npm run dev
npm run build
npm run preview
```

Node 版本沿用 package.json 的 engines 要求。初始画作均为本地原创 SVG 演示素材，无外部图片依赖。

## 演示账号

| 身份 | 邮箱 | 密码 |
| --- | --- | --- |
| 普通用户 | user@exix.demo | Exix2026! |
| 画师 | artist@exix.demo | Exix2026! |
| 管理员 | admin@exix.demo | Exix2026! |

登录页可点击填入账号，再点击登录。注册账号自动登录。普通用户可以申请画师，退出后用管理员审核，再切回用户发布。

## 分层与修改位置

- `router/`：具名路由、标题、登录与角色访问守卫。
- `layouts/`：社区布局和创作/管理双栏布局。
- `views/`：页面组合，调用业务服务和交互 composable。
- `components/`：公共状态、头像、导航、作品网格、上传、评论、消息；展示组件通过 props / emit 通信。
- `composables/`：加载与错误、操作中状态、确认交互。
- `stores/`：只保存当前账号，不存密码与作品副本。
- `services/community.js`：所有数据操作的业务接口，后续后端替换入口。
- `mocks/`：演示数据及持久化适配器，页面不得直接操作浏览器存储。
- `assets/main.css`：设计变量、表单、公共排版与响应式基础。
- `public/art/`：本地示例画作，可替换为真实素材。
- `utils/`：日期、身份名称与返回路径校验。

每个新增 Vue 组件的 script、template、style 均用中文说明职责与交互区域。组件局部样式使用 scoped。

## 页面路由

| 路由 | 页面 | 权限 |
| --- | --- | --- |
| `/` | 最新作品 | 公开 |
| `/following` | 关注动态 | 登录 |
| `/works/:id` | 作品详情 | 公开；互动需登录 |
| `/users/:id` | 个人主页 | 公开 |
| `/me`、`/collections` | 我的、私人收藏 | 登录 |
| `/login`、`/register` | 登录注册 | 公开 |
| `/artist/apply` | 画师申请与状态 | 登录 |
| `/studio` | 作品管理 | 画师 |
| `/studio/works/new`、`/studio/works/:id/edit` | 发布编辑 | 画师且编辑需为作品作者 |
| `/messages`、`/messages/:id` | 通知与私信 | 登录且只能访问自己的会话 |
| `/settings` | 资料、隐私、拉黑、重置 | 登录 |
| `/admin/applications` | 画师审核 | 管理员 |
| `/admin/reports` | 举报处理 | 管理员 |
| `/admin/works`、`/admin/users` | 作品与账号管理 | 管理员 |
| `/forbidden`、其他地址 | 无权限、404 | 公开 |

## 后端接入

保持 services 中的业务方法签名，替换为真实 HTTP 请求。建议基础路径 `/api/v1`，本地开发配置 Vite 代理，生产通过反向代理访问独立后端。

1. 账号：currentUser、login、register、logout，生产使用后端 HttpOnly Cookie 会话及 CSRF 防护。
2. 作品：listWorks、getWork、saveWork、deleteWork；列表后端改为游标分页并同步调整 FeedView 的加载更多逻辑。
3. 互动：toggleFollow、toggleReaction、评论增删、举报与拉黑。
4. 上传：将 ImageUploader 的本地预览接入 uploads，返回资源 ID 与预览地址，再提交有序图片资源 ID。当前仅本地预览，不伪装上传进度。
5. 消息：inbox、getConversation、sendMessage、markRead；当前会话每 5 秒轮询，未读每 30 秒刷新，页面不可见暂停。发送携带 clientId 供后端去重。
6. 管理：画师申请审核、隐藏作品、限制账号及处理举报。服务端必须独立验证权限，不信任前端路由和存储。

返回字段以模拟服务为契约参考，ID 使用字符串，时间使用 ISO 8601。真实错误转换为可读消息。正式构建应移除模拟适配器和演示账号入口后再上线；当前构建是明确的离线演示版本。

## 演示限制

- 业务内容保存在 localStorage 的 exix-demo-v1，当前身份保存在 sessionStorage。设置页可重置，仅影响 Exix 数据。
- 演示密码校验并非真实认证；注册密码只存加盐 SHA-256 摘要，这是模拟用实现，生产密码应由后端使用专门的密码哈希算法处理。
- 新上传图片使用 Blob URL，在当前会话可用；持久化时变为占位图，刷新后需重新上传。已有示例图片一直可用。
- 尚无后端、真实上传、邮件、支付和实时服务器；不包含验证码、第三方登录及密码找回。
- 画作列表在演示中读取全部本地记录，页面每次显示 8 件；生产需服务端分页。
- UI 不自动删除用户数据；编辑未提交离开页面需确认，删除和管理敏感操作也需确认。

## 部署

发布 dist 静态目录。History 路由要求服务器把非静态资源地址回退到 index.html，例如 Nginx：

```nginx
location / { try_files $uri $uri/ /index.html; }
```

API 使用单独 `/api/` 代理配置，不能回退为 index.html。此项目默认根路径部署；更换子路径时需同步 Vite base、路由 base 和图片资源路径。

## 验收与代码排版

`npm run test:e2e` 使用系统 Edge 运行浏览器流程测试（无 Edge 的环境请调整 playwright.config.js 的 channel）。`npm run format` 统一排版源码。测试覆盖登录、注册、权限、收藏评论、申请审核发布、私信拉黑及手机布局。
