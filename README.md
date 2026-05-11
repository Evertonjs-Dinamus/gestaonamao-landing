# Gestão na Mão — Landing

Landing institucional do app **Gestão na Mão**. Site estático (HTML + CSS + JS) sem build, pronto pra hospedar no Cloudflare Pages.

> Para contexto completo do produto, ver [`BRIEFING.md`](./BRIEFING.md).

---

## Stack

- HTML5
- [Tailwind CSS](https://tailwindcss.com/) via Play CDN
- [Alpine.js](https://alpinejs.dev/) v3 via CDN (FAQ accordion + menu mobile)
- Sem build, sem bundler, sem dependências instaláveis

---

## Como rodar localmente

**Opção 1 — abrir o arquivo direto:**

Dê duplo clique em `index.html` ou abra no navegador. Funciona porque tudo é carregado via CDN.

**Opção 2 — servidor local (recomendado para testar âncoras e OG image):**

```powershell
# Python (já vem no Windows 11)
python -m http.server 8000
```

Depois abra http://localhost:8000.

---

## Como deployar no Cloudflare Pages

**Opção 1 — drag-and-drop (mais rápido, sem Git):**

1. Acesse o dashboard do Cloudflare → Pages → Create a project → Direct Upload
2. Arraste a pasta inteira do projeto
3. Configure o domínio customizado (`gestaonamao.app.br`) na aba *Custom domains*

**Opção 2 — conectar a um repositório Git:**

1. Suba o projeto pra GitHub/GitLab
2. Cloudflare Pages → Connect to Git → selecione o repo
3. Build settings:
   - **Framework preset**: None
   - **Build command**: (deixar vazio)
   - **Build output directory**: `/`
4. Deploy

Cada push pra main vira um deploy automático.

---

## Estrutura

```
gestaonamao-landing/
├── BRIEFING.md          # contexto do produto e decisões de design
├── README.md            # este arquivo
├── .gitignore
├── index.html           # landing single-page
├── og-image.svg         # imagem Open Graph (1200x630)
└── assets/
    └── logo.svg         # placeholder pra logo final (águia)
```

---

## Notas

- **Não há etapa de build.** Tudo é HTML/CSS/JS puro carregado por CDN.
- Tailwind Play CDN imprime um warning no console em produção — é esperado e não afeta funcionamento. Numa eventual v2 podemos migrar pra Tailwind CLI compilado se quisermos eliminar o warning e melhorar Performance no Lighthouse.
- A landing é pensada para o domínio raiz (`gestaonamao.app.br`). O app fica em subdomínio (`app.gestaonamao.app.br`) — migração planejada.
