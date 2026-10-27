# 小程序 AI 协作入口

本目录是 `unibest-uv-ai` 小程序模板的 AI 规则入口。开发前先用 `docs/` 识别项目已支持能力，再按任务类型读取本目录规则；专项 Skill 统一从 `toolkit/skills` 读取。

## 先读顺序

1. `.ai/rules/README.md`
2. 按任务类型读取对应规则文件，不默认全量读取。

## 任务索引

| 任务 | 必读 |
| --- | --- |
| 小程序接口/API | 修改 API 模块时，必须读取并遵守 `.ai/rules/mp-api.md` |
| 小程序页面/Vue | 修改页面时，必须读取并遵守 `.ai/rules/mp-page.md` |
| Script 注释、模板组件调用注释与业务分块 | 修改页面/组件/hooks/utils/store 逻辑时，必须读取并遵守 `.ai/rules/mp-framework.md` |
| 小程序样式/SCSS | 修改样式时，必须读取并遵守 `.ai/rules/mp-page.md` |
| 页面排版 / UI 组件选型 | **必须先读** `toolkit/skills/uv-ui/SKILL.md`，查 uv-ui 是否有现成组件 |
| MasterGo 链接 / DSL / 按设计稿还原 | `toolkit/skills/mastergo-to-code/SKILL.md` |
| 广告组件 / 原生广告 | `toolkit/skills/mp-component-ad/SKILL.md` |
| 小程序规范审查 | `toolkit/skills/mp-standard-check/SKILL.md` |
| 小程序专项能力 | `toolkit/skills/<skill-name>/SKILL.md` |

## 文档分层

- `docs/`：项目已支持能力的说明、使用入口和完整示例。
- `.ai/rules/`：小程序必须遵守的代码规范，采用标准代码示例 + 薄文字说明。
- `toolkit/skills/`：跨项目集中维护的小程序专项 Skill。
- `.cursor/rules/`：Cursor 入口适配，只引用 `.ai/rules/`。
- `.trae/rules/`：Trae 入口适配，只引用 `.ai/rules/`。

小程序规则只维护在本目录；Skill 只维护在 `toolkit/skills/`，项目内不保留副本。
