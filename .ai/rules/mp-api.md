# API 模块开发规范

目标：用标准代码骨架约束 `src/api/**`。

## 硬规则

- 只要接口是“列表 / 分页 / 记录集”语义，查询参数必须优先复用 `List.Query<...>`，返回结果必须优先复用 `List.Result<...>`；禁止在业务模块里重复手写 `page_no`、`page_size`、`count`、`lists` 这一套分页骨架。
- 只有详情、创建、编辑、删除、动作类接口，或服务端返回明确不是分页结构时，才使用普通 `interface` / `type` 单独定义。
- 默认入口先读 `docs/api/<模块>.md`；只有当文档未展开到叶子字段、存在动态配置/逻辑拼装，或与服务端实现冲突时，才升级读取服务端源码。
- `types.ts` 中的字段注释、字段名、可选性和结构层级，必须依据服务端真实实现生成；优先来源只能是 `controller` 注解、`validate` 场景、`logic/service` 返回结构、格式化函数或真实返回组装代码。
- 禁止为了“补全描述”去推测字段语义、默认值、状态含义、业务用途；源码只能确认“字段存在”时，注释只写中性描述，不扩写业务解释。
- `src/api/**/index.ts` 中每个导出的接口函数都必须写 `/** ... */` 注释；禁止省略函数注释再只靠函数名表达含义。
- `src/api/**/index.ts` 的导出函数必须使用函数块和两空格缩进；禁止将函数体或 `return http.*` 与函数声明写在同一行。
- `src/api/**/types.ts` 中每个导出的 `interface`、`type`、`namespace` 以及字段都必须写中文 `/** ... */` 注释；禁止只给类型名写注释、不写字段注释。
- 新对话中产出 API 模块代码时，若生成了 `types.ts`，默认按“类型注释完整 + 字段注释完整”执行，不得输出裸字段类型定义。
- `src/api/**` 默认禁止配置 `needAuth: false`、`meta.ignoreAuth: true` 或其他等价的认证跳过字段。
- 禁止仅因服务端 `notNeedLogin`、接口文档标注“无需登录”或当前服务端允许匿名访问，而跳过小程序认证流程。
- 只有小程序 HTTP 封装明确指定的认证前置接口才可配置认证跳过字段；必须以 HTTP 封装或既有认证模块为依据，并在导出接口函数注释中说明原因。

## 推荐检索链路

### 第 1 层：先读 `docs/api`

- 先读 `docs/api/index.md` 定位模块，再读 `docs/api/<模块>.md`。
- 用文档先确认接口路径、HTTP 方法、显式 query/body 参数、已展开的响应字段和分页骨架。
- 若文档已经展开到叶子字段，例如 `data.xxx[].id`、`data.xxx[].title` 这类粒度，可据此生成初版类型，再做源码快速核对。

### 第 2 层：命中以下任一条件时，升级到服务端源码

- 文档里只写 `object` / `array`，没有继续展开子字段。
- 文档里虽然写了数组，但没有 `data.xxx[].field` 这一层叶子字段。
- 返回值来自配置表、`json_decode`、`SiteSetting::item()`、字典、动态 JSON 字段等非显式 DTO 结构。
- 返回值是 `logic/service` 里拼装、重命名、合并后的结构，不是控制器注释里直接写明的结构。
- 分页不是标准顶层 `lists/count/page_no/page_size`，而是嵌套分页，如 `data.list.lists`。
- 文档与页面既有消费、PRD、联调结果或服务端实际实现出现冲突。

### 第 3 层：服务端最小读取顺序

- 先看 `controller` 的 `@OA\Parameter`、`@OA\RequestBody`、接口摘要和路径，确认接口职责与显式入参。
- 再看对应 `validate` 场景，确认真实允许字段、必填性、枚举范围和基础格式约束。
- 再看 `logic/service` 当前 action 对应方法的 `return` 结构、字段重命名和组装代码。
- 若 `logic/service` 又引用了配置来源、格式化函数、resource、enum 或 mapper，再最多向下追一跳，确认字段最终形状后就停止，不做全模块漫游。

## 真值裁决规则

- `docs/api` 是默认入口和高性价比检索层，不是最终裁决层。
- 服务端代码仍旧是最准确依据；当 `docs/api` 与服务端实现冲突时，以服务端真实实现为准。
- 不得优先相信 PRD、占位文档或想当然的前端常见写法，尤其不能在文档未明确时直接补 `unknown` 之外的猜测字段。
- 必须核对实际 HTTP method、query/body 序列化方式、字段名、可选性、枚举值和响应层级；不得只因前端变量名或报错文案看起来合理就跳过 `validate` 与返回组装代码。
- 服务端真实契约可读时，`src/api/**` 的请求参数、响应类型、字段名、枚举值和层级必须直接镜像服务端；不得为 PRD、占位接口或旧页面推测出的契约保留别名、改名或枚举翻译，页面应随之改造。
- adapter 仅可处理服务端已存在且有源码证据的多版本、确定性兼容或默认值适配；不得用于维持前端旧调用。展示文案、距离格式和 UI 状态转换归页面或 Hook。

## 分页接口默认口径

这是小程序 API 模块的默认执行口径，不是“推荐写法”：

- 看到服务端接口含 `page_no`、`page_size`、`count`、`lists` 等分页语义时，第一反应就是套 `List.Query` 和 `List.Result`。
- 业务筛选字段只放进 `List.Query<业务字段>` 的泛型里，不要把分页公共字段再手写一遍。
- 即使当前接口筛选字段很少，也不要为了“看起来简单”退回裸 `interface`；分页公共结构统一交给全局类型。

## 正确：分页接口骨架

```typescript
// src/api/order/types.ts
export namespace OrderTypes {
  /** 订单项 */
  export interface OrderItem {
    /** 订单ID */
    id: number
    /** 订单编号 */
    order_no: string
  }

  /** 订单列表查询参数：列表接口优先复用全局分页参数 */
  export interface OrderListQuery extends List.Query<{
    /** 订单状态 */
    status?: number
  }> {}

  /** 订单列表响应：列表接口优先复用全局分页结果 */
  export type OrderListRes = List.Result<OrderItem>
}
```

```typescript
// src/api/order/index.ts
import type { OrderTypes } from './types'
import { http } from '@/http/alova'

/** 订单列表 */
export function fetchOrderList(params: OrderTypes.OrderListQuery) {
  return http.Get<OrderTypes.OrderListRes>('/order/lists', { params })
}

/** 订单详情 */
export function fetchOrderDetail(params: { id: number }) {
  return http.Get<OrderTypes.OrderItem>('/order/detail', { params })
}

/** 取消订单 */
export function fetchCancelOrder(data: { id: number }) {
  return http.Post('/order/cancel', data)
}
```

以上示例不是“推荐写法”，而是默认执行口径：

- `types.ts` 里的字段注释要像 `id`、`order_no` 一样逐字段补齐。
- `index.ts` 里的接口函数注释要像 `fetchOrderList`、`fetchOrderDetail`、`fetchCancelOrder` 一样逐个补齐。
- 分页接口要像 `OrderListQuery` / `OrderListRes` 一样复用全局分页类型；不要在业务模块重新声明分页公共字段。

## 正确：非分页动作接口骨架

```typescript
/** 删除订单：动作类接口使用普通入参类型 */
export function fetchDeleteOrder(data: { id: number }) {
  return http.Post('/order/delete', data)
}
```

```typescript
/** 登录：认证前置接口，按项目 HTTP 封装约定跳过认证。 */
export function fetchLogin(data: { code: string }) {
  return http.Post('/login', data, {
    meta: {
      ignoreAuth: true,
      report: false,
    },
  })
}
```
