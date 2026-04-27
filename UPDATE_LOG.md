# Sintu 主题优化更新日志

**更新日期:** 2026-04-13  
**更新内容:** 导航栏滚动隐藏 + 暗黑模式 + Logo 组件化

---

## 🎯 更新内容

### 1. Logo 尺寸优化
- Logo 高度从 40px 缩小到 **32px**
- 导航栏整体更简洁

### 2. 暗黑模式按钮移至底部
- 从导航栏移至 **页面右下角固定位置**
- 按钮样式：圆角胶囊状，带阴影
- 包含图标 + "暗黑模式"文字
- 移动端自动隐藏文字，只显示图标
- 悬停时有轻微上浮动画

### 3. 导航栏滚动隐藏（JavaScript + CSS）

**功能:** 向下滚动时自动隐藏导航栏，向上滚动时重新显示

**实现方式:**
- JavaScript 检测滚动方向和位置
- CSS 处理 `.is-hidden` 类的过渡动画
- 使用 `requestAnimationFrame` 优化性能
- 滚动阈值：150px（超过才开始隐藏）
- 方向阈值：10px（防止误触发）

**CSS 关键代码:**
```css
.cd-auto-hide-header {
  transition: transform 0.3s ease;
}

.cd-auto-hide-header.is-hidden {
  transform: translateY(-100%);
}
```

**JavaScript 逻辑:**
```javascript
// 向上滚动 - 显示 header
if (previousTop - currentTop > scrollDelta) {
  mainHeader.removeClass('is-hidden');
} 
// 向下滚动且超过阈值 - 隐藏 header
else if (currentTop - previousTop > scrollDelta && currentTop > scrollOffset) {
  mainHeader.addClass('is-hidden');
}
```

---

### 2. 暗黑模式切换

**功能:** 导航栏添加暗黑模式切换按钮，支持持久化偏好

**特性:**
- 太阳/月亮图标切换
- 本地存储记住用户偏好
- 自动检测系统主题偏好
- 平滑过渡动画

**按钮位置:** 导航栏右侧，"About"链接旁边

**数据存储:** `localStorage.theme` (`"light"` 或 `"dark"`)

---

### 3. Logo 组件化

**文件:** `src/components/Logo.astro`

**Props:**
- `href` - 链接地址（默认：`/`）
- `src` - Logo 图片路径（默认：`/logo.svg`）
- `alt` - 替代文本（默认：`"KRYA"`）
- `width/height` - 尺寸

**使用示例:**
```astro
<Logo href="/" src="/logo.svg" alt="KRYA" />
```

---

## 📁 新增/修改文件

### 新增文件
```
src/components/
├── Logo.astro          # Logo 组件
├── NavBar.astro        # 导航栏组件
└── ThemeSwitcher.astro # 暗黑模式切换按钮（底部）
```

### 修改文件
```
src/layouts/
├── BaseLayout.astro    # 改为使用 slot 方式插入导航栏
├── HomeLayout.astro    # 导入并使用 NavBar 组件
└── PostLayout.astro    # 导入并使用 NavBar 组件

src/pages/
├── about.astro         # 添加 NavBar 组件
└── archives.astro      # 添加 NavBar 组件

public/
├── style.css           # 添加 Scroll-Driven Animations + 暗黑模式样式
└── js/main.js          # 移除滚动检测逻辑，保留导航菜单
```

### 备份文件
```
public/style.css.bak    # 原始 CSS 备份
```

---

## 🎨 暗黑模式样式变量

| 元素 | 浅色模式 | 暗黑模式 |
|------|---------|---------|
| 背景色 | `#fff` | `#1a1a1a` |
| 文字色 | `#444` | `#e0e0e0` |
| 链接色 | `#3354AA` | `#6b9eff` |
| 代码背景 | `#F9F9F9` | `#2a2a2a` |
| 导航栏背景 | `#f9f9f9` | `#1a1a1a` |
| 边框色 | `#EEE` | `#3a3a3a` |

---

## 🔧 技术细节

### Scroll-Driven Animations 兼容性

- ✅ Chrome 115+
- ✅ Edge 115+
- ⚠️ Firefox: 需启用实验性功能
- ⚠️ Safari: 暂不支持（使用 CSS transition 降级）

### 暗黑模式实现

```javascript
// 主题切换逻辑（在 NavBar.astro 中）
function getPreferredTheme() {
  const stored = localStorage.getItem('theme');
  if (stored) return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: string) {
  if (theme === 'dark') {
    html.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  } else {
    html.removeAttribute('data-theme');
    localStorage.setItem('theme', 'light');
  }
}
```

---

## ✅ 验证

构建测试通过：
```bash
cd /home/jin/work/theme/astrotheme/sintu
npm run build
# ✓ 35 page(s) built in 1.55s
```

---

## 📝 后续优化建议

1. **添加更多暗黑模式样式** - 目前覆盖了主要内容区域，可扩展到更多组件
2. **添加过渡动画** - 暗黑模式切换时添加淡入淡出效果
3. **移动端优化** - 暗黑模式按钮在移动端的样式调整
4. **添加快捷键** - 例如按 `D` 键快速切换暗黑模式

---

**更新完成!** 🎉
