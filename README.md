# 作品集档案

大疆、极飞、影石个人作品集网站，已部署到 GitHub Pages。

- 正式网址：https://hpl18197.github.io/portfolio/
- 代码仓库：https://github.com/hpl18197/portfolio

## 页面内容

- 三个项目方向：大疆航拍影像、极飞智慧农业、影石全景影像
- 产品档案：DJI Mavic 4 Pro、XAG P100 Pro 2023、Insta360 X5
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
