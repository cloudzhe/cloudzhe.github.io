# CloudCity 项目 Code Wiki

> 本文档面向需要理解、维护或扩展该项目的开发者，系统梳理项目整体架构、模块职责、关键类与函数、依赖关系及运行方式。

---

## 1. 项目概述

| 项目 | 说明 |
|------|------|
| 项目名称 | CloudCity（CloudZhe 的博客） |
| 站点域名 | `wangyuzhe.top` |
| 生成框架 | Hexo 8.1.1 |
| 使用主题 | Solitude 3.0.21 |
| 仓库类型 | Hexo 构建后的**静态站点输出目录**（`public` / `dist`） |
| 主要技术 | HTML、CSS、原生 JavaScript、Pjax、LazyLoad、KaTeX 等 |

**重要说明**：本仓库不包含 Hexo 源文件（如 `_config.yml`、Markdown 文章、主题源码），仅包含 Hexo 渲染后可直接部署的静态产物。因此在本仓库内**无法直接运行 `hexo server` 或 `hexo generate`**，需要配合外部 Hexo 源码工程使用。

---

## 2. 项目整体架构

```
/workspace
├── index.html                 # 首页
├── 404.html                   # 404 页面
├── CNAME                      # 自定义域名配置：wangyuzhe.top
├── search.xml                 # 本地搜索数据源（Hexo 生成的 RSS/Atom 格式）
├── about/index.html           # 关于页面
├── archives/                  # 文章归档页面
├── categories/index.html      # 分类页面
├── links/index.html           # 友链页面
├── tags/index.html            # 标签页面
├── kit/index.html             # 装备页面
├── 2026/                      # 按日期组织的文章目录
│   ├── 04/30/hello-world/
│   └── 05/01/发发发/
├── css/
│   ├── index.css              # 主题主样式表（包含所有组件样式）
│   ├── var.css                # CSS 变量文件（当前为空）
│   └── third_party/           # 第三方 CSS
├── js/
│   ├── main.js                # 核心交互逻辑
│   ├── utils.js               # 通用工具函数
│   ├── right_menu.js          # 右键菜单
│   ├── post_ai.js             # 文章 AI 摘要动画
│   ├── music.js               # 音乐播放器扩展
│   ├── tw_cn.js               # 简繁体转换
│   ├── covercolor/            # 封面取色模块
│   │   ├── api.js             # 通过远端 API 取色
│   │   ├── ave.js             # 通过 ?imageAve 接口取色
│   │   └── local.js           # 本地 ColorThief 取色
│   ├── search/                # 搜索模块
│   │   ├── local.js           # 本地 XML 搜索
│   │   └── algolia.js         # Algolia 搜索
│   └── third_party/           # 第三方 JS 插件
└── img/                       # 图片、图标、PWA 图标等
```

### 2.1 页面类型

所有页面均为 Hexo 渲染生成的静态 HTML，按类型可分为：

| 页面类型 | 代表文件 | 特点 |
|----------|----------|------|
| 首页 | `index.html` | 展示最近文章列表、顶部 Banner、侧边栏 |
| 文章页 | `2026/05/01/发发发/index.html` | 展示正文、目录、上一篇/下一篇、版权信息 |
| 独立页面 | `about/`, `links/`, `kit/` | 由 Hexo 页面模板生成 |
| 聚合页 | `archives/`, `categories/`, `tags/` | 文章归档、分类、标签云 |
| 404 页 | `404.html` | 错误页面 |

---

## 3. 主要模块职责

### 3.1 全局配置模块（内嵌于 HTML）

每个 HTML 页面头部都会注入两个全局配置对象，是整个前端系统的运行参数。

#### `GLOBAL_CONFIG`

定义在 `index.html` 及所有页面头部内联脚本中，包含站点级配置：

| 字段 | 说明 |
|------|------|
| `root` | 站点根路径，默认 `/` |
| `algolia` | Algolia 搜索配置（当前 `undefined`，未启用） |
| `localsearch` | 本地搜索配置，`{ preload, path }` |
| `runtime` | 站点运行起始时间，用于显示“建站天数” |
| `lazyload` | 图片懒加载配置 |
| `copyright` | 复制版权信息（当前 `false`） |
| `highlight` | 代码高亮配置：`{ limit, expand, copy, syntax }` |
| `lang` | 多语言提示文本 |
| `aside` | 侧边栏问候语、俏皮话 |
| `right_menu` | 右键菜单配置 |
| `translate` | 简繁转换配置 |
| `lure` | 切换标签页标题玩笑 |
| `covercolor` | 封面主题色提取开关 |

#### `PAGE_CONFIG`

每个页面不同，用于区分页面类型并控制功能加载：

| 字段 | 说明 |
|------|------|
| `is_post` | 是否为文章页 |
| `is_page` | 是否为独立页面 |
| `is_home` | 是否为首页 |
| `page` | 页面标识，如 `solitude` 或空 |
| `toc` | 是否启用目录 |
| `comment` | 是否启用评论 |
| `ai_text` | 是否启用 AI 摘要动画 |
| `color` | 是否指定页面主题色 |

### 3.2 CSS 层

| 文件 | 职责 |
|------|------|
| `css/index.css` | 主题唯一主样式文件，包含基础重置、布局、动画、组件、响应式等全部样式。通过 `?v=3.0.21` 做缓存控制。 |
| `css/var.css` | 预留的 CSS 变量文件，当前内容为空。 |
| `css/third_party/snackbar.min.css` | Snackbar 提示组件样式。 |
| CDN FontAwesome | 图标字体库。 |
| CDN KaTeX | 数学公式渲染样式。 |

### 3.3 JavaScript 层

#### 核心模块

| 文件 | 职责 |
|------|------|
| `js/utils.js` | 全局工具函数库，包括节流、淡入淡出、剪贴板、滚动、懒加载、灯箱、时间差计算等。 |
| `js/main.js` | 站点核心逻辑，包含 `sco` 对象、目录/标签/滚动/代码高亮等初始化。 |
| `js/right_menu.js` | 自定义右键菜单，封装为 `rm` 对象。 |

#### 功能模块

| 文件 | 职责 |
|------|------|
| `js/search/local.js` | `LocalSearch` 类：基于 `search.xml` 的本地全文搜索。 |
| `js/search/algolia.js` | `AlgoliaSearch` 类：Algolia 搜索集成（当前未启用）。 |
| `js/post_ai.js` | `AIPostRenderer` 类：文章 AI 摘要逐字打印动画。 |
| `js/music.js` | `MusicPlayer` 类：音乐播放器页面键盘控制、背景切换。 |
| `js/tw_cn.js` | 简繁体转换，基于内置大字表。 |
| `js/covercolor/api.js` | 通过远端接口提取图片主题色。 |
| `js/covercolor/ave.js` | 通过图片 `?imageAve` 接口取色。 |
| `js/covercolor/local.js` | 通过 `ColorThief` 本地取色。 |

#### 第三方脚本

| 文件 | 来源/用途 |
|------|----------|
| `js/third_party/waterfall.min.js` | 瀑布流布局 |
| `js/third_party/barrage.min.js` | 评论弹幕 |
| `js/third_party/envelope.min.js` | 信封特效 |
| `js/third_party/universe.min.js` | 宇宙/星空特效 |

---

## 4. 关键类与函数说明

### 4.1 `utils.js` 工具函数

挂载到全局 `window.utils`，主要函数：

| 函数/方法 | 说明 |
|-----------|------|
| `throttle(func, wait, options)` | 节流函数，支持 leading/trailing 控制 |
| `fadeIn(ele, time)` / `fadeOut(ele, time)` | CSS 动画淡入淡出 |
| `snackbarShow(text, showAction, duration)` | 顶部 Snackbar 提示 |
| `copy(text)` | 使用 `navigator.clipboard` 写入剪贴板 |
| `getEleTop(ele)` | 计算元素相对于文档顶部的偏移 |
| `siblings(ele, selector)` | 获取兄弟元素 |
| `scrollToDest(pos, time)` | 平滑滚动到指定位置 |
| `isMobile()` | 移动端 UA 检测 |
| `isHidden(e)` | 判断元素是否隐藏 |
| `wrap(selector, eleType, options)` | 用新元素包裹目标元素 |
| `lazyloadImg()` | 初始化 `LazyLoad` 实例 |
| `lightbox(selector)` | 初始化图片灯箱（mediumZoom / fancybox） |
| `diffDate(d, more)` | 计算相对时间（刚刚、N 天前等） |
| `loadComment(dom, callback)` | 基于 IntersectionObserver 懒加载评论 |
| `escapeHtml(unsafe)` | HTML 实体转义 |
| `saveToLocal.set/get` | 带过期时间的 `localStorage` 读写 |
| `getCSS(url, id)` / `getScript(url, attr)` | 动态加载样式/脚本 |
| `addGlobalFn(key, fn, name, parent)` | 全局事件函数注册 |
| `addEventListenerPjax(ele, event, fn, option)` | 绑定事件并在 Pjax 切换时自动解绑 |

### 4.2 `main.js` 核心对象 `sco`

`sco` 是站点最核心的交互对象，主要方法：

| 方法 | 说明 |
|------|------|
| `scrollTo(elementId)` | 平滑滚动到指定 ID 元素 |
| `musicBind()` / `musicToggle()` / `musicSkipBack()` / `musicSkipForward()` | 音乐播放器控制 |
| `switchCommentBarrage()` | 评论弹幕显隐切换 |
| `switchHideAside()` | 切换侧边栏隐藏状态 |
| `switchDarkMode()` | 切换深色/浅色模式 |
| `toTop()` | 返回顶部 |
| `showConsole()` / `hideConsole()` | 显示/隐藏控制台 |
| `refreshWaterFall()` | 瀑布流布局刷新 |
| `addRuntime()` | 更新“建站天数” |
| `toTalk(txt)` | 将文本引用到评论框 |
| `addPhotoFigcaption()` | 为文章图片添加 alt 标题 |
| `setTimeState()` | 根据时间显示问候语 |
| `tagPageActive()` / `categoriesBarActive()` | 标签/分类导航高亮 |
| `openAllTags()` | 展开所有标签 |
| `listenToPageInputPress()` | 分页输入框事件 |
| `toPage()` | 分页跳转链接生成 |
| `changeTimeFormat(selector)` | 将时间格式化为相对时间 |
| `switchComments()` | 双评论系统切换 |
| `homeTypeit()` | 首页副标题打字机动画 |

#### 其他重要函数

| 函数/类 | 说明 |
|---------|------|
| `sidebarFn()` | 移动端侧边栏开关逻辑 |
| `scrollFn()` | 滚动时导航栏显隐/固定逻辑 |
| `percent()` | 计算并显示滚动百分比 |
| `addHighlight()` | 代码块工具栏、复制、展开功能 |
| `class toc` | 文章目录生成与滚动高亮 |
| `class tabs` | 文章内 Tab 切换、页面标题诱饵、文章过期提示 |
| `window.refreshFn()` | 页面刷新/切换后统一初始化入口 |

### 4.3 `right_menu.js` 右键菜单对象 `rm`

| 属性/方法 | 说明 |
|-----------|------|
| `menuItems` | 缓存各个菜单项 DOM |
| `showRightMenu(e, x, y)` | 显示菜单 |
| `hideRightMenu()` | 隐藏菜单 |
| `reLoadSize()` | 预计算菜单尺寸，用于边界判断 |
| `copyText(e)` | 复制文本 |
| `downloadImage()` | 下载图片 |
| `copyImage()` | 打开图片（当前实现为 `window.open`） |
| `mode(darkmode)` | 切换深色模式菜单文本 |
| `barrage(enable)` | 切换弹幕菜单文本 |
| `window.oncontextmenu` | 全局右键拦截与菜单项显隐逻辑 |

### 4.4 `search/local.js` 本地搜索 `LocalSearch`

| 方法 | 说明 |
|------|------|
| `cacheElements()` | 缓存搜索相关 DOM |
| `loadSearchData()` | 拉取 `search.xml` |
| `parseSearchData(xmlData)` | 解析 XML 构建索引 |
| `performSearch(query)` | 多关键词 AND 匹配并按相关度排序 |
| `calculateRelevanceScore(item, keywords)` | 标题完全匹配+10，包含+5，内容+1 |
| `renderResults(results, page, searchTime)` | 渲染结果与统计 |
| `renderPagination(totalResults)` | 渲染分页按钮 |
| `highlightKeywords(text, query)` | 关键词高亮 |
| `openSearch()` / `closeSearch()` | 打开/关闭搜索弹窗 |
| 快捷键 | `Ctrl+K` 打开，`ESC` 关闭 |

### 4.5 `search/algolia.js` Algolia 搜索 `AlgoliaSearch`

基于 `instantsearch.js` 封装，当前配置未启用（`GLOBAL_CONFIG.algolia` 为 `undefined`）。主要方法包括：

| 方法 | 说明 |
|------|------|
| `validateConfig()` | 校验 `appId/apiKey/indexName` |
| `setupSearchInstance()` | 初始化 `instantsearch` 实例 |
| `addWidgets()` | 添加搜索框、统计、结果、分页组件 |
| `bindEvents()` / `bindPjaxEvents()` | 事件绑定与 PJAX 兼容 |
| `openSearch()` / `closeSearch()` | 搜索弹窗控制 |

### 4.6 `post_ai.js` AI 摘要 `AIPostRenderer`

| 方法 | 说明 |
|------|------|
| `init()` | 等待 DOM 就绪后初始化 |
| `validateContent()` | 校验必要元素与内容 |
| `renderAIContent()` | 启动逐字动画 |
| `startTextAnimation(index)` | `requestAnimationFrame` 驱动逐字输出 |
| `completeAnimation()` | 动画完成并派发 `aiRenderComplete` 事件 |
| `aiContent` | 读取 `PAGE_CONFIG.ai_text` |

### 4.7 `music.js` 音乐播放器 `MusicPlayer`

| 方法 | 说明 |
|------|------|
| `init()` | 初始化视口变量、获取播放列表、绑定事件 |
| `changeMusicBg()` | 切换音乐背景 |
| `lrcUpdate()` | 歌词滚动定位 |
| `handleKeydown(event)` | 空格播放/暂停、方向键切歌/音量 |
| `initializeMusicPlayer()` | 入口函数，负责销毁旧实例并创建新实例 |

### 4.8 `covercolor` 取色模块

三个文件提供同一功能的不同实现，由主题配置选择加载：

| 文件 | 取色方式 | 关键函数 |
|------|----------|----------|
| `api.js` | 远端取色 API | `coverColor()`, `img2color()`, `setThemeColors()` |
| `ave.js` | 图片 `?imageAve` | `coverColor()`, `img2color()`, `setThemeColors()` |
| `local.js` | `ColorThief` 本地 | `coverColor()`, `localColor()`, `rgbToHex()`, `setThemeColors()` |

通用逻辑：提取主题色后写入 CSS 变量 `--efu-main` 系列，并调用 `initThemeColor()` 更新状态栏。

---

## 5. 依赖关系

### 5.1 外部 CDN 依赖

页面通过 CDN 引入以下库（部分为条件加载）：

| 库名 | 用途 |
|------|------|
| `@fortawesome/fontawesome-free` | 图标字体 |
| `pjax@0.2.8` | 无刷新页面切换 |
| `vanilla-lazyload@19.1.3` | 图片懒加载 |
| `node-snackbar@0.1.16` | 顶部提示 |
| `pace-js@1.2.4` | 页面加载进度条 |
| `katex@0.16.9` | 数学公式渲染 |
| `instantsearch.js` / `algoliasearch` | Algolia 搜索（未启用） |
| `aplayer` / `metingjs` | 音乐播放器（未在当前页面启用） |
| `fancybox` / `medium-zoom` | 图片灯箱（未启用） |
| `color-thief` | 本地主题色提取（`covercolor/local.js` 使用） |

### 5.2 模块间依赖关系

```
HTML 页面
├── GLOBAL_CONFIG / PAGE_CONFIG
├── css/index.css
├── utils.js  ──────┬── main.js
│                   ├── right_menu.js
│                   ├── search/local.js
│                   ├── search/algolia.js
│                   ├── post_ai.js
│                   ├── music.js
│                   ├── tw_cn.js
│                   └── covercolor/*.js
├── main.js  ───────┬── (依赖 utils、Pjax、LazyLoad)
│                   └── (调度各功能初始化)
├── pjax.min.js     ← 所有页面无刷新切换
└── third_party/*.js ← 特效插件
```

### 5.3 数据流

1. Hexo 渲染生成 HTML 与 `search.xml`。
2. 浏览器加载页面时注入 `GLOBAL_CONFIG` 与 `PAGE_CONFIG`。
3. `utils.js` 初始化全局工具函数。
4. `main.js` 在 `DOMContentLoaded` 时执行 `refreshFn()`，根据页面类型初始化不同功能。
5. Pjax 拦截站内链接，切换页面后重新调用 `window.refreshFn()` 与相关初始化逻辑。

---

## 6. 项目运行方式

### 6.1 直接预览

由于本仓库是静态站点产物，可直接通过任意静态服务器托管：

```bash
# 使用 Python 临时服务器
python3 -m http.server 8000 --directory /workspace

# 使用 Node.js serve
npx serve /workspace

# 使用 Nginx / Apache / GitHub Pages / Vercel 等
```

访问 `http://localhost:8000` 即可预览。

### 6.2 开发/修改流程

本仓库为构建产物，**不建议直接修改 HTML/CSS/JS**（下次 Hexo 构建会覆盖）。正确流程：

1. 在外部 Hexo 源码工程中修改 `_config.yml`、主题配置或 Markdown 文章。
2. 执行 `hexo clean && hexo generate` 重新生成。
3. 将新的 `public/` 内容同步到本仓库。
4. 提交并部署到静态托管平台。

### 6.3 部署方式

| 方式 | 说明 |
|------|------|
| GitHub Pages | 将本仓库推送到对应分支 |
| Vercel / Netlify | 直接导入本仓库作为静态站点 |
| 自有服务器 / CDN | 将 `/workspace` 目录上传到 Web 服务器根目录 |

---

## 7. 关键文件速查

| 文件路径 | 作用 |
|----------|------|
| `index.html` | 站点首页 |
| `404.html` | 404 错误页 |
| `CNAME` | 自定义域名 |
| `search.xml` | 本地搜索数据 |
| `css/index.css` | 全局样式 |
| `js/main.js` | 核心交互 |
| `js/utils.js` | 工具函数 |
| `js/right_menu.js` | 右键菜单 |
| `js/search/local.js` | 本地搜索 |
| `js/post_ai.js` | AI 摘要动画 |
| `js/tw_cn.js` | 简繁转换 |
| `js/covercolor/*.js` | 主题色提取 |

---

## 8. 注意事项

- 当前站点**未启用评论、Algolia 搜索、音乐播放器、灯箱**等功能（配置项多为 `false` / `undefined`）。
- `var.css` 当前为空，若需覆盖主题变量，可在 Hexo 源主题配置中定义或向该文件注入 CSS 变量。
- 所有 HTML 页面共用同一份 `js/main.js` 与 `js/utils.js`，通过 `PAGE_CONFIG` 实现差异化初始化。
- 右键菜单、搜索弹窗等组件依赖页面 DOM 结构存在，修改 HTML 模板时需同步更新对应 JS 选择器。

---

> 文档版本：基于仓库当前状态生成  
> 生成时间：2026-07-11
