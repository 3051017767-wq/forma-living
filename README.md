# FORMA 家居

以自然光、亚麻和胡桃木为视觉语言的家居品牌概念官网。

## 功能

- 适配电脑与手机的品牌首页，滚动动效与减少动态效果支持。
- 产品分类筛选、收藏、详情弹窗。
- 可键盘操作的材质灵感切换。
- 空间计划表单、本地摘要与 TXT 下载。

品牌、产品及规格为概念设计，图片为 AI 生成。本页面不销售商品，不会发送咨询信息或创建预约。收藏保存在访问者的浏览器中，空间计划内容只用于本地生成文件。

## 本地预览

无需安装依赖或构建。直接打开 `dist/index.html`，或运行：

```sh
python -m http.server 4175 --directory dist
```

然后在浏览器打开 `http://localhost:4175`。

## 编辑与发布

- 内容：`dist/index.html`
- 样式和响应式布局：`dist/styles.css`
- 产品数据与交互：`dist/app.js`
- 图片：`dist/assets/`

通过 GitHub Actions 部署 `dist` 到 GitHub Pages。推送到 `main` 分支后自动发布；也可在 Actions 中手动运行 `Deploy FORMA to GitHub Pages`。仓库的 Settings → Pages → Source 应设置为 GitHub Actions。

## 上线前验证

原始网站已通过 27 项浏览器交互检查，包含产品筛选、收藏持久化、弹窗、表单校验、文件下载、材质键盘切换，以及 1366px / 390px / 320px 横向溢出检查。
