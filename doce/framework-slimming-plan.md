# 框架精简记录

本文仅保留从通用 uni-app 模板收敛为个人微信小程序底座的历史范围和结果。当前结构见 [`framework-overview.md`](./framework-overview.md)，构建/部署流程见 [`docs/framework-handling.md`](../docs/framework-handling.md)，后续风险整改见 [`framework-optimization-audit.md`](./framework-optimization-audit.md)。

## 精简目标

只维护微信小程序所需的构建和运行能力，移除当前业务不使用的通用模板模块；保留登录、请求、状态管理、基础工具和当前水印能力。

## 已移除范围

- API：`common`、`expiry`、`feedback`、`kv`、`platform`、`tracking`
- 组件：`ad`、`add-miniprogram`、`fixed-bottom-wrapper`、`subscribe-popup`
- 页面/分包：网页容器页、模板示例分包
- 工具：`report.ts`、`lodash.ts`
- 运行时：启动埋点、远程应用配置与分享配置请求、H5 代理及非目标平台适配

## 保留约定

- 用户、上传、请求、应用状态和刷新状态按需保留；删除某项能力时同时清理其 API、Store、页面入口和依赖引用。
- 水印功能当前存在于 `src/subpackages/watermark/`；是否继续保留由实际产品需要决定。
- 后端地址使用环境变量，不在源码中写入具体服务域名。

本记录不再重复列出目录树、命令表、env 样例或逐项优化建议；这些内容各自以框架总览、构建说明和整体审计为准。
