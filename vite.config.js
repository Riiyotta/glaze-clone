import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { build as esbuild } from 'esbuild'
import fs from 'node:fs'
import path from 'node:path'

// Static-host status codes. The app is a client-routed SPA, so a plain static build answers every
// path with index.html (200). After `vite build` this plugin writes, into dist/:
//   - 404.html: byte-for-byte copy of the SPA shell. Hosts that serve a custom 404 page (Netlify,
//     GitHub Pages, Cloudflare Pages, S3/CloudFront error documents, nginx error_page) return it with
//     status 404 for any path that has no file, and the client router then renders the Not Found page.
//   - <route>/index.html: the same shell for every route the router knows (static pages, categories,
//     blog posts, personas, app slugs), so real routes keep status 200 and only unknown paths 404.
// This only helps on hosts that map "no file -> 404.html" and do NOT have an SPA catch-all rewrite
// (`/* -> /index.html 200`). It does nothing for `vite dev` / `vite preview`.
// /app/<unknown> cannot be a 404 on a static host that lacks the slug, which is the intended result:
// the client still shows the "App not found" template for it.
function spaStatusFiles() {
  let outDir = 'dist'
  let root = process.cwd()
  return {
    name: 'spa-status-files',
    apply: 'build',
    configResolved(c) {
      outDir = c.build.outDir
      root = c.root
    },
    async closeBundle() {
      const dist = path.resolve(root, outDir)
      const shell = path.join(dist, 'index.html')
      if (!fs.existsSync(shell)) return
      const r = await esbuild({
        stdin: {
          contents: `export { POSTS } from './src/data/blog'
export { PERSONA_PAGES } from './src/data/personas'
export { STORE_HEAD_INDEX } from './src/data/store-head-index'
export { CATEGORY_META } from './src/data/store-meta'`,
          resolveDir: root,
          loader: 'js',
        },
        bundle: true,
        write: false,
        format: 'esm',
        platform: 'node',
        loader: { '.js': 'jsx' },
      })
      const code = r.outputFiles[0].text
      const d = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)
      const paths = [
        '/pricing', '/download', '/awards', '/awards/terms', '/changelog', '/blog', '/store', '/terms', '/privacy', '/aup',
        ...Object.keys(d.PERSONA_PAGES).map((s) => `/${s}`),
        ...d.POSTS.map((p) => `/blog/${p.slug}`),
        ...Object.keys(d.CATEGORY_META).map((c) => `/store/${c}`),
        ...Object.keys(d.STORE_HEAD_INDEX).map((s) => `/app/${s}`),
      ]
      const html = fs.readFileSync(shell)
      fs.writeFileSync(path.join(dist, '404.html'), html)
      for (const p of paths) {
        const dir = path.join(dist, p)
        fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(path.join(dir, 'index.html'), html)
      }
      console.log(`spa-status-files: wrote 404.html and ${paths.length} route shells`)
    },
  }
}

export default defineConfig({ plugins: [react(), spaStatusFiles()] })
