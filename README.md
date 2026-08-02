# 个人作品集

这是一个可直接部署到 GitHub Pages 的静态作品集网站。

## 网页上传方式

1. 登录 GitHub，新建一个名为 `portfolio` 的公开仓库。
2. 在仓库页面选择上传文件，把本目录下的 `index.html`、`styles.css`、`script.js`、`assets` 文件夹上传进去。
3. 进入仓库 Settings，打开 Pages。
4. 在 Build and deployment 中选择 `Deploy from a branch`。
5. 分支选择 `main`，目录选择 `/ (root)`，点击 Save。
6. 等待 1 到 3 分钟，访问 `https://你的GitHub用户名.github.io/portfolio/`。

## 命令行方式

```bash
cd outputs/portfolio
git remote add origin https://github.com/你的GitHub用户名/portfolio.git
git branch -M main
git push -u origin main
```

推送后在仓库 Settings 的 Pages 中按上面的方式启用即可。
