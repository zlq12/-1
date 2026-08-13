# 亚马逊合伙经营分析系统

这是一个面向“两位合伙人共同经营亚马逊业务”的轻量级 Web 应用，按总站可接入方式拆成两个业务模块：

- `合伙记账模块`：入口 `/ledger`，包含投资管理 `/ledger/investments` 和支出管理 `/ledger/expenses`。
- `销售分析模块`：入口 `/analytics`，包含数据导入 `/analytics/imports`、销售分析 `/analytics/sales`、产品管理 `/analytics/products`。

旧需求中的 `/investments`、`/expenses`、`/imports`、`/sales`、`/products` 已保留为重定向，后续总站可以直接挂新模块入口。

## 技术栈

- Next.js App Router + TypeScript
- Tailwind CSS + shadcn/ui 风格基础组件
- Recharts
- Prisma ORM
- PostgreSQL
- xlsx + papaparse
- Zod

## 本地运行

1. 安装依赖

```bash
npm install
```

2. 创建 `.env`

```bash
cp .env.example .env
```

3. 初始化数据库

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

4. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:3000`。

## 关键目录

```text
app/
  dashboard/                 总站看板
  ledger/                    合伙记账模块
  analytics/                 销售分析模块
  api/                       投资、支出、导入 API
components/                  基础 UI、表单、图表、字段映射组件
lib/
  calculations.ts            核心统计计算函数
  import/                    文件解析、字段映射、重复键逻辑
  modules.ts                 总站可挂载模块定义
prisma/
  schema.prisma              数据模型
  seed.ts                    示例数据
```

## 后续扩展建议

- 把 `/lib/modules.ts` 暴露给总站读取，统一生成模块导航。
- 给投资和支出列表补充编辑、删除、分页和高级筛选的客户端表格。
- 导入模块增加多 Sheet 选择和 GBK 自动转码。
- 增加权限模块，让合伙人、运营和只读角色看到不同菜单。
- API 接入时保留当前 `SalesRecord.rawData`，新增同步批次表即可。
