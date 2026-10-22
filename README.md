# AXON · Site e painel do administrador

Site da AXON Suplementos Naturais feito em **Next.js 16** (App Router, TypeScript), com painel do administrador, base de dados **Prisma** e login próprio.

## O que tem

**Site público**
- Início, catálogo com filtro por formato, uma página por produto, Sobre, Contato e página 404.
- Os 8 produtos: Lugol, Própolis, Cravinho, Desintoxicação pelos Pés, Emagrecedor, Foco Estudos, Libido Feminina e Desparasitante, com as fotos dos frascos em `public/produtos` (fundo transparente). Produtos sem foto mostram uma embalagem desenhada em SVG.
- Botão "Comprar pelo WhatsApp" com a mensagem já escrita.
- Formulário de contato: grava a mensagem no painel e oferece continuar no WhatsApp.
- SEO: títulos e descrições por página, `sitemap.xml`, `robots.txt`, favicon com o símbolo.

**Painel (`/admin`)**
- **Dashboard:** faturamento, pedidos, ticket médio e cliques no WhatsApp dos últimos 30 dias, com comparação ao período anterior. Também tem o gráfico de faturamento diário, os mais vendidos, os mais vistos, os pedidos por status, os últimos pedidos e o estoque baixo.
- **Pedidos:** lista com filtro por status e busca, registo de novos pedidos (o total é calculado e o estoque descontado), mudança de status (cancelar devolve o estoque), observações e atalho para o WhatsApp do cliente.
- **Produtos:** preço, estoque (botões + e −), publicar ou ocultar, edição de todos os textos, criação de novos produtos.
- **Mensagens:** o que chega pelo formulário de contato, para marcar como lida, responder no WhatsApp ou excluir.
- **Configurações:** WhatsApp, e-mail, Instagram e horário que aparecem no site, troca de senha e novos administradores.

## Como correr no seu computador

Precisa do Node.js 20 ou superior.

```bash
npm install
cp .env.example .env        # depois edite AUTH_SECRET, ADMIN_EMAIL e ADMIN_PASSWORD
npm run setup               # cria a base de dados e os 8 produtos e o administrador
npm run dev
```

- Site: http://localhost:3000
- Painel: http://localhost:3000/admin (entre com o ADMIN_EMAIL e o ADMIN_PASSWORD do `.env`)

Para ver o dashboard com dados de exemplo: `npm run seed:demo`. Não use em produção.

## Antes de publicar

1. **Base de dados:** o projeto usa SQLite, que funciona bem num servidor próprio (VPS, Railway, Render com disco). Na **Vercel**, use PostgreSQL (Neon, Supabase ou Vercel Postgres). Em `prisma/schema.prisma`, troque `provider = "sqlite"` por `provider = "postgresql"` e defina `DATABASE_URL`.
2. **Variáveis de ambiente:** `DATABASE_URL`, `AUTH_SECRET` (gere com `openssl rand -hex 32`), `ADMIN_EMAIL`, `ADMIN_PASSWORD` e `NEXT_PUBLIC_SITE_URL` (o seu domínio).
3. Rode `npm run setup` uma vez no servidor e depois `npm run build && npm start`.
4. No painel, em **Configurações**, coloque o WhatsApp, o e-mail e o Instagram reais. Em **Produtos**, defina os preços e o estoque.
5. Revise os textos dos produtos com quem responde pela regulamentação (ANVISA). Os textos evitam alegações de tratamento ou cura.

## Estrutura

```
app/(site)/          páginas públicas (início, produtos, sobre, contato)
app/admin/           painel: login, dashboard, pedidos, produtos, mensagens, configurações
app/admin/actions.ts todas as ações do painel (server actions)
app/api/track/       regista visualizações e cliques no WhatsApp
components/          Header, Footer, Logo, Pack (embalagens), cards, formulários
components/admin/    barra lateral, gráfico, formulários do painel
lib/                 base de dados, autenticação, catálogo, configurações, formatação
prisma/              schema, seed (produtos e administrador) e demo (dados de exemplo)
```

## Identidade visual

As cores são o verde floresta #10291F, o dourado #D6AE65, o creme #F7F3E9, o bege #E8DCC6 e o cinza #8C928D. As fontes são Playfair Display nos títulos e Montserrat nos textos, carregadas pelo `next/font`. Tudo segue o manual de identidade da AXON.
