<div align="center">

# Exix · 画师图片互动社区

从发现作品到创作发布，体验一个完整的图片社区前端演示。

![Vue 3](https://img.shields.io/badge/Vue%203-42b883?style=flat-square) ![Pinia](https://img.shields.io/badge/Pinia-ffd859?style=flat-square) ![Vite](https://img.shields.io/badge/Vite-646cff?style=flat-square) ![离线演示](https://img.shields.io/badge/%E7%A6%BB%E7%BA%BF%E6%BC%94%E7%A4%BA-64748b?style=flat-square)

</div>

---

<p align="center"><a href="./Exix">进入源码目录</a> · <a href="./Exix/README.md">完整使用与开发文档</a></p>

## 作品素材预览

以下图片直接来自项目的本地 SVG 示例画作，属于演示素材预览。

<p align="center"><img src="./Exix/public/art/work-1.svg" alt="Exix 示例画作 1" width="30%">&nbsp;<img src="./Exix/public/art/work-2.svg" alt="Exix 示例画作 2" width="30%">&nbsp;<img src="./Exix/public/art/work-3.svg" alt="Exix 示例画作 3" width="30%"></p>

## 可以体验什么

| 身份 / 场景 | 功能 |
| --- | --- |
| 浏览作品 | 发现页、作品详情、作者主页 |
| 社区互动 | 关注、收藏、评论、通知与私信 |
| 画师创作 | 申请画师、发布和编辑作品 |
| 管理员 | 申请审核、举报与作品账号管理 |
| 个人设置 | 资料、隐私、拉黑与演示数据重置 |

## 快速启动

**应用位于 `Exix/` 子目录。** Node.js 要求 `^22.18.0 || >=24.12.0`。

```sh
git clone https://github.com/wek486/test.git
cd test/Exix
npm install
npm run dev
```

登录页可直接填入内置演示账号。账号列表、页面路由、部署和后端接入契约均见 [完整文档](./Exix/README.md)。

```sh
npm run build
npm run preview
npm run test:e2e
```

端到端测试默认使用系统 Edge，环境要求见 `playwright.config.js`。本次文档整理未重新执行构建与测试。

## 演示边界

当前版本使用浏览器本地模拟服务；登录、消息和互动均为演示流程，尚未接入真实后端。新上传图片仅在当前会话有效，刷新后转为占位图。原有本地 SVG 示例素材持续可用。

核心修改入口是 `src/services/community.js`，接入真实后端时可从该业务接口层替换。
