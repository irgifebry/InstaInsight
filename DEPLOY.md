# Deploy ke GitHub Pages

Layar hitam + error `index.tsx 404` / `%BASE_URL%site.webmanifest` = GitHub Pages menyajikan **source**, bukan hasil **build**.

## Cara deploy (disarankan)

### 1. Build ke folder `docs/`

```bash
npm run build:pages
```

### 2. Commit & push

```bash
git add docs/
git commit -m "Update GitHub Pages build"
git push origin main
```

### 3. Setting GitHub Pages

1. Repo **InstaInsight** → **Settings** → **Pages**
2. **Source**: Deploy from a branch
3. **Branch**: `main`
4. **Folder**: `/docs`
5. Save

### 4. Buka situs

https://irgifebry.github.io/InstaInsight/

Tunggu 1–2 menit.

## Alternatif: branch `gh-pages`

```bash
npm run deploy
```

Lalu Pages → branch `gh-pages` → `/ (root)`.

## Jangan pakai

- Branch `main` + folder **`/ (root)`** — ini yang memicu layar hitam dan error 404.
