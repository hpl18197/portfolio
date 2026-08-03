# 航野视界

大疆、极飞、影石个人作品集网站，已部署到 GitHub Pages。

- 正式网址：https://hpl18197.github.io/portfolio/
- 代码仓库：https://github.com/hpl18197/portfolio

## 页面内容

- 三个项目方向：大疆航拍影像、极飞智慧农业、影石全景影像
- 产品档案：19 款产品
  - 大疆：Mavic 4 Pro、Air 3S、Mini 4 Pro、Mini 5 Pro、Avata 2、Avata 360、Neo 2
  - 极飞：P100 Pro 2023、V50 Pro 2023、M500、P200 2026、P150 Ultra 2026、P120 2026
  - 影石：X5、X4、X3、Ace Pro 2、Ace Pro、GO 3S
- 独立参数页：每个产品可打开单独页面，查看完整参数、价格方案与相关素材
- 管理中心：`admin.html`，可连接 GitHub 仓库并新增、编辑、上架、下架、删除产品
- 官方素材画廊：200 张图片，支持按品牌筛选
- 联系方式：邮箱、电话、地址

## 本地预览

```bash
cd outputs/portfolio
python -m http.server 8000
```

打开 http://localhost:8000 即可预览。

## GitHub Pages 部署

```bash
git add .
git commit -m "Update portfolio"
git push origin main
```

推送后，仓库 Settings 中的 Pages 使用 `main` 分支的根目录构建。
