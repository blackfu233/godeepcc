# Go Deep Get Bigger - Share Link Deployment

This project can be shared without pushing the full workspace to Git.

## Recommended No-Git Flow

1. Run a production build:

   ```bash
   npm run build
   ```

2. Upload the `dist/` folder to one of these static hosts:

   - Netlify Drop: https://app.netlify.com/drop
   - Vercel: create a project and upload/import the static output
   - Cloudflare Pages: upload static assets

3. The host will give you a public HTTPS link. Anyone can open that link from any network.

## Ready Package

Use:

```text
release/go-deep-get-bigger-static.zip
```

This zip contains only the built web demo files from `dist/`.

It does not include:

- `node_modules/`
- `.git/`
- `.agents/`
- `tmp/`
- source documents
- workspace hidden files

## If You Still Want Git Later

The added `.gitignore` prevents common oversized/generated files from being committed.

Commit only source files, `public/audio/`, `src/assets/`, config files, and documentation you actually want in the repo.

## GitHub Pages Notes

For GitHub Pages, do not upload the zip file itself as the website.

Upload or commit the contents inside `dist/` so that `index.html`, `assets/`, and `audio/` are at the selected Pages root.

The build uses relative asset paths (`./assets/...` and `./audio/...`) so it works under project pages such as:

```text
https://your-name.github.io/your-repo/
```

The `public/.nojekyll` file is included so GitHub Pages serves the built static files directly.
