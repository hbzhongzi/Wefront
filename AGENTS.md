# 小程序 AI Agent 入口

本文件随 `unibest-uv-ai` 小程序模板分发，按 uni-app + Vue 3 + TypeScript 小程序项目处理。模板复制到业务项目后，仍以本文件所在目录为小程序根目录，并沿用本文件规则。

## 路径基准（必须遵守）

- **小程序根目录**：以本文件所在目录作为 `<MINIPROGRAM_ROOT>`；不得假定或写死模板仓库、本机磁盘或用户目录的绝对路径。
- 本文件、`.ai/rules/**` 与 `docs/**` 中出现的项目相对路径，**一律相对于 `<MINIPROGRAM_ROOT>` 解析**，不得相对于仓库根目录或当前 shell 工作目录解析。
- **产品 PRD 与工作流文档例外**：模板复制到业务项目后，若 `docs/prd/**`、`docs/superpowers/**` 实际位于小程序目录之外，读取时应使用其所在工作区的实际路径，不得与小程序内的 `docs/**` 混淆。
- **服务端路径例外**：三端项目中的 `server/**` 指 `<MINIPROGRAM_ROOT>` 同级的服务端目录；项目根直接为小程序时，只有真实存在服务端目录才允许读取。读取服务端只用于接口真值核对，修改仍需用户确认。
- 在 PowerShell 中读取本目录规则或文档时，先进入本文件所在目录，再使用原有相对路径：

  ```powershell
  Get-Content .\docs\README.md -Raw
  Get-Content .\docs\quick-reference.md -Raw
  ```

- 若相对路径读取失败，不得直接判定文件不存在；先以本文件所在目录为基准通过 `Test-Path` / `rg --files` 复核，并在结果中记录实际解析路径。

## 服务端开发约定

- 当需要修改 `server` 代码，需要先经过用户确认。
- 当小程序或前端涉及接口对齐，且后续已经出现真正的服务端接口实现时，必须以 `server` 中真实接口代码为最高真值来对齐小程序内容；`docs/api`、PRD/API 占位文档、联调口头说明只能作为检索线索和辅助证据。
- 若 `docs/api` 或 PRD 与服务端真实代码冲突，以服务端 route/controller/request/validate/service/resource/entity/enum/error code 等实际实现为准，并在结论中说明文档可能滞后。
- 若怀疑服务端已开发但文档未更新，应通过 `git log` / `git diff` / `rg` 在 `server` 相关提交和源码中只读定位实际接口变更，再回到小程序 `src/api/**`、`types.ts`、页面调用方做对齐。
- 读取、分析、对齐服务端接口代码不等于授权修改 `server`；需要写入 `server` 代码时仍必须先经过用户确认。

## 阅读顺序

1. `docs/README.md`：了解项目已支持能力和文档入口。
2. `docs/quick-reference.md`：先查是否已有可复用组件、Hook、Store、Utils 或 API 能力。
3. `.ai/rules/README.md`：按当前任务选择最小规则集合。
4. 命中当前运行环境已安装的专项 Skill 时，读取该 Skill 的 `SKILL.md`。

## 职责边界

- `docs/`：项目已支持能力的说明、使用入口和完整示例。
- `.ai/rules/`：开发时必须遵循的代码规范，采用标准代码示例 + 薄文字说明。
- 当前运行环境配置的集中 Skill 源：跨项目复用的专项流程、参考资料、脚本和资产。

排版页面、写 UI 或选用组件前，先检查当前运行环境是否提供匹配的 UI 或组件 Skill，并按其说明执行。

小程序规则只维护在本目录 `.ai/rules/`；跨项目 Skill 只维护在当前环境配置的集中 Skill 源，不在业务项目内保留副本。

## 小程序

- 不需要进行 `pnpm build:mp` 来检验。
