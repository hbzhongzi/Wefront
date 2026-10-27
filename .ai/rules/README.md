# 小程序规则入口

涉及小程序开发或修改时，按任务读取本目录的最小规则集合。

## 职责边界

- `docs/` 负责说明项目已支持能力、入口和完整用法。
- `.ai/rules/` 只负责约束代码产出风格，采用标准代码示例 + 薄文字说明。
- 规则文件优先给可复制的正确骨架，少写背景解释；需要能力背景时回到 `docs/`。

## 任务索引

- 接口/API、`src/api/**`、上传接口、`useRequest`：`.ai/rules/mp-api.md`
- 页面/Vue、页面布局、跳转收参、下拉刷新、弹层、样式/SCSS：`.ai/rules/mp-page.md`
- 公共组件、store、hook、utils、路由工具、上传组件、`uni_modules` 复用：`.ai/rules/mp-framework.md`
- Script 注释、项目自定义组件的模板注释、业务分块、异步副作用、平台分支：`.ai/rules/mp-framework.md`

## 组合读取

- 改页面且涉及接口：读 `mp-page.md` + `mp-api.md`
- 改页面且涉及公共组件、Store、Hook、Utils、上传组件：读 `mp-page.md` + `mp-framework.md`
- 改 utils/hooks/store/组件逻辑：读 `mp-framework.md`
- 纯接口任务：只读 `mp-api.md`
- 纯公共能力复用任务：只读 `mp-framework.md`

## 扩展约定

- 后续新增小程序专项规则时，放在本目录内。
- 新增文件后，在本 README 的任务索引中补充读取条件。
- IDE 入口、Agent 入口和工具入口只引用本 README，不直接分散引用具体规则文件。
