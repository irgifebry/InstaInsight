# Deploy ke GitHub Pages

Error `index.tsx 404` dan `site.webmanifest 404` terjadi karena GitHub Pages menyajikan **source code** (`index.html` + `index.tsx`), bukan hasil **build** (`dist/`).

## Langkah deploy (benar)

### 1. Build & push ke branch `gh-pages`

```bash
npm run deploy
```

Perintah ini menjalankan `vite build` lalu mengunggah isi folder `dist/` ke branch `gh-pages`.

### 2. Atur GitHub Pages

1. Buka repo **InstaInsight** di GitHub
2. **Settings** → **Pages**
3. **Source**: Deploy from a branch
4. **Branch**: `gh-pages` → folder `/ (root)`
5. Save

### 3. Buka situs

https://irgifebry.github.io/InstaInsight/

Tunggu 1–2 menit setelah deploy.

## Jangan pakai ini

- **Jangan** set Pages source ke branch `main` + folder `/ (root)` — itu yang memicu error 404.
- **Jangan** upload file `index.tsx` / `App.tsx` langsung ke Pages.

## Deploy manual (tanpa npx)

```bash
npm run build
cd dist
git init
git checkout -b gh-pages
git add -A
git commit -m "Deploy"
git remote add origin https://github.com/irgifebry/InstaInsight.git
git push -f origin gh-pages
```
