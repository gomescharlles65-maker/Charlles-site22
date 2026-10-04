# Site — Charlles · Desenvolvimento Web & Marketing Digital

Site de uma página (Vite + JavaScript) com experiência cinematográfica:
**Lenis** (smooth scroll) + **GSAP** + **ScrollTrigger** (animações) e um cursor 3D em CSS que acompanha a rolagem.

## Rodar localmente
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # gera a pasta dist/
npm run preview    # testa o build
```

## Deploy (GitHub + Vercel)
1. Crie um repositório no GitHub e envie **o conteúdo desta pasta** (sem `node_modules` e sem `dist`, já ignorados no `.gitignore`).
2. Na Vercel: **Add New → Project** → importe o repositório.
3. A Vercel detecta **Vite** sozinha (o `vercel.json` já define: build `npm run build`, saída `dist`). Clique em **Deploy**.

## Estrutura
```
index.html              marcação do site (textos, links, WhatsApp, projetos)
src/main.js             animações (GSAP, ScrollTrigger, Lenis) e cursor 3D
src/styles/main.css     estilos (identidade visual)
public/images/          foto de perfil e capas dos projetos
package.json / package-lock.json
vite.config.js · vercel.json · .gitignore · CLAUDE.md
```
