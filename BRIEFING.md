# Gestão na Mão — Landing Page

Documento de referência do projeto da landing institucional.

---

## Produto

**Gestão na Mão** é um app web mobile-first de gestão financeira para motoristas autônomos que operam o próprio veículo:

- Caminhoneiros autônomos
- Motoristas de app de carga
- Entregadores Mercado Livre / Shopee
- Motoboys

O app já existe e roda em produção. Atualmente o domínio raiz `gestaonamao.app.br` aponta para o app (`/dashboard`). A intenção é que, no futuro, o raiz sirva esta landing e o app rode em subdomínio (`app.gestaonamao.app.br`).

### Dor que resolve

O motorista trabalha o mês inteiro sem saber se está tendo lucro ou prejuízo. Gasta combustível "sem perceber", roda muito sem perceber, e descobre tarde que rodou pra prejuízo.

### Diferenciais

| Diferencial | O que faz |
|---|---|
| **KM Morto** | Rastreia trajetos sem receita (ida pra carga, retorno vazio) |
| **Análise didática** | Conta a história em texto, não joga só números/gráficos |
| **Dashboard simples** | Sem termo contábil; linguagem que o motorista entende |
| **Cobrança PIX** | Recorrência via PIX no Mercado Pago, sem cartão obrigatório |

---

## Modelo de negócio

- **Plano Grátis** — limitado (limites a definir)
- **Plano Premium** — recorrente mensal (valor a definir, placeholder `R$ XX,XX/mês`)

---

## CTAs da landing

- **CTA principal** — "Começar grátis" → `#app` (placeholder de âncora). Aparece em: Nav, Hero, card Premium da seção Preço, e CTA Final. Trocar pela URL definitiva quando definida.
- **WhatsApp** — **não é CTA**. Aparece somente no Footer como link discreto secundário ("Fale conosco no WhatsApp"). Placeholder: `https://wa.me/55XXXXXXXXX`.

---

## Tom de voz

Direto, simples, sem corpo-rativês. Linguagem que motorista/entregador entende:

- "Rodar no prejuízo"
- "Frete sem volta"
- "Combustível que some"
- "KM morto"

**Evitar**: jargão de tecnologia ("plataforma SaaS"), jargão contábil ("DRE", "fluxo de caixa"), termos genéricos de marketing ("solução completa", "experiência única").

---

## Stack & deploy

- HTML + CSS + JS puro, **sem build, sem bundler, sem React**
- **Tailwind Play CDN** (`https://cdn.tailwindcss.com`)
- **Alpine.js v3** via CDN (somente onde precisar — accordion FAQ e menu mobile)
- **Mobile-first**: público lê do celular
- Deploy: **Cloudflare Pages** (estático puro)

---

## Paleta de cores

Sóbria, profissional, com destaque dourado. Definida como `tailwind.config.theme.extend.colors` inline em `index.html`.

| Token | Hex | Uso |
|---|---|---|
| `brand-gold` | `#F5B544` | CTA primário, ícones de destaque, badges |
| `brand-gold-dark` | `#D4940A` | hover do CTA |
| `ink-900` | `#0F0F10` | títulos H1/H2 |
| `ink-700` | `#3A3A3D` | texto corpo |
| `ink-500` | `#6B6B70` | texto secundário, captions |
| `bg-soft` | `#FAFAF7` | fundo de seções alternadas |
| `bg-card` | `#FFFFFF` | cards |
| `border-soft` | `#EAEAE6` | divisores, bordas |
| `success` | `#1F9D55` | checkmarks da lista de benefícios |
| `danger-soft` | `#C0392B` | destaque "prejuízo" |

---

## Decisões conscientes do v1

- **Sem depoimentos** — substituídos pela seção "Por que o Gestão na Mão" com 4 garantias reais. Razão: depoimentos fake violam CONAR/CDC. Reativar quando houver clientes reais autorizando uso de imagem/nome.
- **Sem CNPJ/razão social no footer** — footer minimalista até o produto ter PJ formalizada e termos legais escritos.
- **SEO enxuto** — só `title`, `description` e OG básico. Sem `keywords` (deprecated), sem `canonical` (decidir só quando tiver URL final).
- **Mockup do hero é CSS-frame** — não tem screenshot real ainda. Trocar por `<img>` quando tiver.

---

## TODOs (decisões pendentes)

- [ ] Definir e trocar URL final do CTA principal (atualmente `#app`)
- [ ] Trocar WhatsApp `wa.me/55XXXXXXXXX` pelo número real
- [ ] Definir e trocar valor do Premium (`R$ XX,XX/mês`)
- [ ] Definir limitações reais do plano Grátis e atualizar a seção Preço
- [ ] **Substituir `/assets/logo.svg` pela águia real e trocar wordmark por `<img src='/assets/logo.svg'>` nos elementos marcados com `data-logo='true'` no HTML (Nav e Footer)**
- [ ] Substituir `og-image.svg` por imagem real (PNG 1200x630 com mockup do app)
- [ ] Adicionar favicon
- [ ] Redigir Termos de Uso e Política de Privacidade (links no footer apontam pra `#`)
- [ ] Substituir mockup CSS do hero por screenshot real do dashboard
- [ ] Reativar seção de depoimentos quando houver clientes reais com autorização
