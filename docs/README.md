# 部署与使用文档入口

`docs/` 只保存微信小程序的开发、构建、部署、运行和故障处理文档。框架精简、架构调整和优化记录统一放在 [`doce/`](../doce/)。

## 文档索引

- [快速参考](./quick-reference.md)：源码入口索引。
- [构建与处理规范](./framework-handling.md)：环境配置、命令、产物与故障处理的唯一操作说明。
- [框架总览](../doce/framework-overview.md)：当前架构和模块边界。
- [精简记录](../doce/framework-slimming-plan.md)：保留已移除能力及历史改动，不重复构建说明。
- [整体排查与优化建议](../doce/framework-optimization-audit.md)：问题状态、整改优先级和验收清单。

## 当前平台

- 构建目标：微信小程序 `mp-weixin`
- 开发产物：`dist/dev/mp-weixin`
- 生产产物：`dist/build/mp-weixin`
- 后端地址：通过 `VITE_SERVER_BASEURL` 配置，不使用内置固定域名

代码规范以 `.ai/rules/` 为准。新增或删除能力后，应同步更新 `doce/` 中的架构和优化记录；构建和部署流程变更时，更新本目录对应文档。
