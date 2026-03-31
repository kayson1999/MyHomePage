# CodeBuddy Project Rules

## 项目简介

这是 **MambaCoder** 个人主页项目，使用 Vue 3 + Vite 构建，包含首页、项目展示、知识库、工具/游戏、博客等模块。

---

## 项目架构

```
MyHomePage/
├── index.html                       # HTML 入口文件
├── package.json                     # 项目配置和依赖
├── vite.config.js                   # Vite 构建配置
├── README.md                        # 项目说明文档（⚠️ 需自动维护）
├── .codebuddy/
│   └── rules.md                     # CodeBuddy 规则配置（本文件）
└── src/
    ├── main.js                      # 应用入口
    ├── App.vue                      # 根组件（导航栏 + 页脚 + 路由视图）
    ├── config/
    │   ├── site.config.js           # 站点全局配置（品牌、导航、页面标题）
    │   └── content.config.js        # 内容管理配置中心（上架/下架/置顶/排序）
    ├── data/
    │   ├── home.data.js             # 首页数据
    │   ├── projects.data.js         # 项目数据
    │   ├── knowledge.data.js        # 知识库数据
    │   ├── tools.data.js            # 工具数据
    │   ├── games.data.js            # 游戏数据
    │   ├── blog.data.js             # 博客数据
    │   └── about.data.js            # 关于页数据
    ├── components/
    │   ├── common/                  # 通用组件（PageHero, FilterBar, SectionHeader 等）
    │   ├── tools/                   # 工具相关组件
    │   └── games/                   # 游戏相关组件
    ├── views/                       # 页面组件（Home, Projects, Knowledge, Tools, Blog, About）
    ├── router/                      # 路由配置
    ├── services/                    # 数据服务层
    └── styles/
        └── global.css               # 全局样式和 CSS 变量
```

---

## 核心设计原则

1. **配置与数据分离**：`src/config/` 存放站点配置和管理配置，`src/data/` 存放各模块的业务数据
2. **内容管理配置中心**：通过 `content.config.js` 的 `enabled/pinned/order` 字段控制各条目的上架、下架、置顶和排序
3. **模块化架构**：每个页面对应一个 View 组件，数据在专属的 `*.data.js` 中管理
4. **通用组件复用**：`src/components/common/` 下的组件跨页面共享

---

## 编码规范

1. 使用 **Vue 3 Composition API**（`<script setup>` 语法）
2. 样式使用 `<style scoped>` 进行组件隔离
3. 全局 CSS 变量定义在 `src/styles/global.css` 的 `:root` 中
4. 新增数据条目需同时在 `data/*.data.js` 添加数据，并在 `content.config.js` 添加管理配置
5. 路由路径常量定义在 `src/router/routes.js` 中
6. 站点文案（标题、副标题、描述等）统一在 `src/config/site.config.js` 中管理，不硬编码到组件中

---

## ⚠️ README.md 自动更新规则（重要）

**每次完成功能开发、代码修改或迭代后，必须同步更新 `README.md`**，确保文档始终与代码保持一致。

### 需要更新 README 的场景

- ✅ 新增/删除/修改页面或模块
- ✅ 新增/删除工具或游戏
- ✅ 调整项目结构（新增/删除/移动文件或目录）
- ✅ 修改技术栈或依赖
- ✅ 新增/修改功能特性
- ✅ 调整配色方案或设计系统
- ✅ 修改构建配置或开发流程

### README 更新内容对照表

| 变更类型 | 需要更新的 README 章节 |
|---------|----------------------|
| 新增/删除页面 | 📁 项目结构、✨ 特性 |
| 新增/删除文件 | 📁 项目结构 |
| 新增功能特性 | ✨ 特性 |
| 修改依赖/技术栈 | 🚀 快速开始 |
| 调整设计系统 | 🎨 设计系统 |
| 修改扩展方式 | 📝 如何扩展 |

### README 结构模板

README.md 应始终包含以下章节（按此顺序）：

1. **项目标题与描述** — 项目名称、简介、设计灵感
2. **✨ 特性** — 功能亮点列表
3. **📁 项目结构** — 完整的目录树（与实际文件结构保持一致）
4. **🚀 快速开始** — 环境要求、安装、开发、构建命令
5. **🎨 设计系统** — 配色方案、CSS 变量说明
6. **📝 如何扩展** — 添加新页面、自定义样式、数据管理的指引
7. **📄 License**

---

## 文件修改注意事项

- 修改 `site.config.js` 后，检查是否影响 README 中的品牌名称或导航描述
- 修改 `content.config.js` 后，检查功能说明是否需要更新
- 新增 `data/*.data.js` 后，README 的项目结构和模块说明需要同步
- 新增 `views/*.vue` 或 `components/**/*.vue` 后，README 的项目结构需要同步
- 删除任何模块后，README 中相关的描述和结构树都要同步移除
