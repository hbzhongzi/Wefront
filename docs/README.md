# 部署与使用文档入口

`docs/` 只保存微信小程序的开发、构建、部署、运行和故障处理文档。框架精简、架构调整和优化记录统一放在 [`doce/`](../doce/)。

## 阅读顺序

1. [快速参考](./quick-reference.md)：查看环境变量、公共能力、代码入口和常用命令。
2. [构建与处理规范](./framework-handling.md)：执行开发构建、生产构建、微信开发者工具导入和故障排查。
3. [框架优化总览](../doce/framework-overview.md)：了解精简后的目录、启动链路和模块边界。
4. [精简方案与落地结果](../doce/framework-slimming-plan.md)：查看已删除模块和后续优化策略。

## 当前平台

- 构建目标：微信小程序 `mp-weixin`
- 开发产物：`dist/dev/mp-weixin`
- 生产产物：`dist/build/mp-weixin`
- 后端地址：通过 `VITE_SERVER_BASEURL` 配置，不使用内置固定域名

代码规范以 `.ai/rules/` 为准。新增或删除能力后，应同步更新 `doce/` 中的架构和优化记录；构建和部署流程变更时，更新本目录对应文档。
