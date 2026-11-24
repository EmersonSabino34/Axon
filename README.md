<div align="center">

# AXON · Suplementos Naturais

**Site institucional, catálogo, conta de cliente e painel do administrador**

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite%20%2F%20PostgreSQL-banco%20de%20dados-003B57?logo=sqlite&logoColor=white)

<img src="docs/capturas/inicio.webp" alt="Página inicial do site AXON" width="100%">

</div>

---

## Sumário

- [Sobre o projeto](#sobre-o-projeto)
- [Capturas de tela](#capturas-de-tela)
  - [Site](#site)
  - [Cadastro, login e Minha conta](#cadastro-login-e-minha-conta)
  - [Painel do administrador](#painel-do-administrador)
  - [No celular](#no-celular)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Como rodar no seu computador](#como-rodar-no-seu-computador)
- [Variáveis de ambiente e scripts](#variáveis-de-ambiente-e-scripts)
- [Antes de publicar](#antes-de-publicar)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Identidade visual](#identidade-visual)
- [Versões do projeto](#versões-do-projeto)

---

## Sobre o projeto

Site da **AXON Suplementos Naturais**, feito em **Next.js 16** (App Router e TypeScript). Reúne num só projeto:

- o **site público**, com catálogo dos 8 produtos, página de cada produto, Sobre e Contato;
- a **conta do cliente**, com cadastro, login, Minha conta e troca de senha;
- o **painel do administrador** (`/admin`), com dashboard de vendas, pedidos, produtos, clientes, mensagens e configurações.

As vendas são feitas pelo **WhatsApp**: o botão "Comprar pelo WhatsApp" já leva a mensagem escrita, e o administrador registra os pedidos no painel para acompanhar status, faturamento e estoque. O banco de dados usa **Prisma** (SQLite no desenvolvimento, PostgreSQL em produção) e o login é próprio, sem serviços pagos.

---

## Capturas de tela

> As capturas foram feitas com os dados de demonstração (`npm run seed:demo`) e um cliente fictício. Nenhum dado real aparece nelas.

### Site

<table>
  <tr>
    <td width="50%"><img src="docs/capturas/inicio.webp" alt="Início"><br><sub><b>Início</b>: apresentação da marca e chamada para os produtos.</sub></td>
    <td width="50%"><img src="docs/capturas/produto.webp" alt="Página do produto"><br><sub><b>Página do produto</b>: foto, descrição, formato e botão de compra pelo WhatsApp.</sub></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/capturas/sobre.webp" alt="Sobre"><br><sub><b>Sobre</b>: a apresentação da marca AXON.</sub></td>
    <td width="50%"><img src="docs/capturas/contato.webp" alt="Contato"><br><sub><b>Contato</b>: a mensagem fica gravada no painel e pode continuar no WhatsApp.</sub></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/capturas/produtos.webp" alt="Catálogo de produtos"><br><sub><b>Catálogo</b>: os 8 produtos, com filtro por formato.</sub></td>
    <td width="50%"><img src="docs/capturas/pagina-404.webp" alt="Página não encontrada"><br><sub><b>Página 404</b>: com atalho para os produtos.</sub></td>
  </tr>
</table>

<details>
<summary><b>Ver a página inicial completa</b></summary>
<br>
<img src="docs/capturas/pagina-inicial-completa.webp" alt="Página inicial completa" width="100%">
</details>

### Cadastro, login e Minha conta

<table>
  <tr>
    <td width="50%"><img src="docs/capturas/cadastro.webp" alt="Cadastro"><br><sub><b>Cadastro</b> (<code>/cadastro</code>): nome, e-mail, telefone (WhatsApp) e senha.</sub></td>
    <td width="50%"><img src="docs/capturas/entrar.webp" alt="Entrar"><br><sub><b>Login</b> (<code>/entrar</code>): acesso com e-mail e senha.</sub></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/capturas/minha-conta.webp" alt="Minha conta"><br><sub><b>Minha conta</b> (<code>/conta</code>): pedidos do cliente, edição dos dados e troca de senha.</sub></td>
    <td width="50%"><img src="docs/capturas/contato-com-conta.webp" alt="Contato com a conta aberta"><br><sub><b>Contato com login</b>: o formulário já vem preenchido com os dados da conta.</sub></td>
  </tr>
</table>

### Painel do administrador

<img src="docs/capturas/admin-dashboard.webp" alt="Dashboard do painel" width="100%">
<p align="center"><sub><b>Dashboard</b>: faturamento, pedidos, ticket médio e cliques no WhatsApp dos últimos 30 dias, gráfico diário, mais vendidos, mais vistos, pedidos por status e estoque baixo.</sub></p>

<table>
  <tr>
    <td width="50%"><img src="docs/capturas/admin-login.webp" alt="Login do painel"><br><sub><b>Login do painel</b> (<code>/admin/login</code>): acesso restrito à equipe.</sub></td>
    <td width="50%"><img src="docs/capturas/admin-pedidos.webp" alt="Pedidos"><br><sub><b>Pedidos</b>: filtro por status e busca por cliente, telefone ou número.</sub></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/capturas/admin-pedido.webp" alt="Detalhe do pedido"><br><sub><b>Pedido</b>: itens, status, observações, conta do cliente e atalho para o WhatsApp.</sub></td>
    <td width="50%"><img src="docs/capturas/admin-novo-pedido.webp" alt="Registrar pedido"><br><sub><b>Registrar pedido</b>: o total é calculado e o estoque é descontado.</sub></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/capturas/admin-produtos.webp" alt="Produtos"><br><sub><b>Produtos</b>: preço, estoque (+ e −) e publicar ou ocultar.</sub></td>
    <td width="50%"><img src="docs/capturas/admin-editar-produto.webp" alt="Editar produto"><br><sub><b>Editar produto</b>: todos os textos, a foto e os dados da embalagem.</sub></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/capturas/admin-clientes.webp" alt="Clientes"><br><sub><b>Clientes</b>: contas criadas no site, com WhatsApp e link de nova senha.</sub></td>
    <td width="50%"><img src="docs/capturas/admin-mensagens.webp" alt="Mensagens"><br><sub><b>Mensagens</b>: o que chega pelo formulário de contato.</sub></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/capturas/admin-configuracoes.webp" alt="Configurações"><br><sub><b>Configurações</b>: WhatsApp, e-mail, Instagram, horário, senha e administradores.</sub></td>
    <td width="50%"></td>
  </tr>
</table>

### No celular

<table>
  <tr>
    <td width="33%"><img src="docs/capturas/celular-inicio.webp" alt="Início no celular"><br><sub><b>Início</b></sub></td>
    <td width="33%"><img src="docs/capturas/celular-produtos.webp" alt="Produtos no celular"><br><sub><b>Produtos</b></sub></td>
    <td width="33%"><img src="docs/capturas/celular-cadastro.webp" alt="Cadastro no celular"><br><sub><b>Cadastro</b></sub></td>
  </tr>
</table>

---

## Funcionalidades

### Site público

- Início, catálogo com filtro por formato, uma página por produto, Sobre, Contato e página 404.
- Os 8 produtos: Lugol, Própolis, Cravinho, Desintoxicação pelos Pés, Emagrecedor, Foco Estudos, Libido Feminina e Desparasitante, com as fotos dos frascos em `public/produtos` (fundo transparente). Produtos sem foto mostram uma embalagem desenhada em SVG.
- Botão "Comprar pelo WhatsApp" com a mensagem já escrita.
- Formulário de contato: grava a mensagem no painel e oferece continuar no WhatsApp.
- SEO: títulos e descrições por página, `sitemap.xml`, `robots.txt` e favicon com o símbolo da marca.

### Conta do cliente

- **Cadastro** (`/cadastro`), **login** (`/entrar`) e **Minha conta** (`/conta`), onde o cliente vê os pedidos, edita os dados e troca a senha.
- Para quem está logado, o formulário de contato já vem preenchido.
- **Esqueci a senha:** o cliente pede pelo WhatsApp, o administrador gera no painel um link de nova senha (vale 24 horas e só uma vez) e envia de volta. Não precisa de serviço de e-mail.

### Painel do administrador (`/admin`)

- **Dashboard:** faturamento, pedidos, ticket médio e cliques no WhatsApp dos últimos 30 dias, com comparação ao período anterior. Também mostra o gráfico de faturamento diário, os mais vendidos, os mais vistos, os pedidos por status, os últimos pedidos e o estoque baixo.
- **Pedidos:** lista com filtro por status e busca, registro de novos pedidos (o total é calculado e o estoque descontado), mudança de status (cancelar devolve o estoque), observações e atalho para o WhatsApp do cliente.
- **Produtos:** preço, estoque (botões + e −), publicar ou ocultar, edição de todos os textos e criação de novos produtos.
- **Clientes:** quem criou conta no site, com e-mail, telefone, data do cadastro, número de pedidos, atalho para o WhatsApp e o link de nova senha.
- **Pedidos e contas:** ao registrar um pedido, ou na página do pedido, escolha a conta do cliente para o pedido aparecer em Minha conta. O painel sugere primeiro as contas com o mesmo e-mail ou telefone.
- **Mensagens:** o que chega pelo formulário de contato, para marcar como lida, responder no WhatsApp ou excluir.
- **Configurações:** WhatsApp, e-mail, Instagram e horário que aparecem no site, troca de senha e novos administradores.

---

## Tecnologias

| Camada | Tecnologia |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router, Server Actions) |
| Interface | React 19 e CSS próprio (`app/globals.css`, `app/admin/admin.css`) |
| Linguagem | TypeScript |
| Banco de dados | [Prisma 6](https://www.prisma.io) com SQLite (desenvolvimento) ou PostgreSQL (produção) |
| Autenticação | Login próprio: sessões de cliente e de administrador separadas, em cookies assinados com `AUTH_SECRET` |
| Fontes | Playfair Display e Montserrat, via `next/font` |

---

## Como rodar no seu computador

Precisa do [Node.js](https://nodejs.org) 20 ou superior.

```bash
npm install
cp .env.example .env        # depois edite AUTH_SECRET, ADMIN_EMAIL e ADMIN_PASSWORD
npm run setup               # cria o banco de dados, os 8 produtos e o administrador
npm run dev
```

- Site: <http://localhost:3000>
- Painel: <http://localhost:3000/admin> (entre com o `ADMIN_EMAIL` e o `ADMIN_PASSWORD` do `.env`)

Para ver o dashboard com dados de exemplo, rode `npm run seed:demo`. Não use em produção.

---

## Variáveis de ambiente e scripts

| Variável | Para que serve |
| --- | --- |
| `DATABASE_URL` | Endereço do banco de dados (`file:./dev.db` no SQLite local; uma URL PostgreSQL em produção) |
| `AUTH_SECRET` | Segredo que assina as sessões (mínimo 16 caracteres). Gere com `openssl rand -hex 32` |
| `ADMIN_EMAIL` e `ADMIN_PASSWORD` | Primeiro administrador, criado pelo `npm run setup` |
| `NEXT_PUBLIC_SITE_URL` | Endereço público do site (usado no SEO e no sitemap) |

| Script | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` / `npm start` | Versão otimizada para produção |
| `npm run setup` | Cria as tabelas e roda o seed (produtos e administrador) |
| `npm run seed:demo` | Pedidos, visitas e mensagens de exemplo para o dashboard |
| `npm run lint` | Verificação do código com ESLint |

---

## Antes de publicar

1. **Banco de dados:** o projeto usa SQLite, que funciona bem num servidor próprio (VPS, Railway, Render com disco). Na **Vercel**, use PostgreSQL (Neon, Supabase ou Vercel Postgres). Em `prisma/schema.prisma`, troque `provider = "sqlite"` por `provider = "postgresql"` e defina `DATABASE_URL`.
2. **Variáveis de ambiente:** `DATABASE_URL`, `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` e `NEXT_PUBLIC_SITE_URL` (o seu domínio).
3. Rode `npm run setup` uma vez no servidor e depois `npm run build && npm start`.
4. No painel, em **Configurações**, coloque o WhatsApp, o e-mail e o Instagram reais. Em **Produtos**, defina os preços e o estoque.
5. Revise os textos dos produtos com quem responde pela regulamentação (ANVISA). Os textos evitam alegações de tratamento ou cura.

---

## Estrutura de pastas

```
app/(site)/          páginas públicas (início, produtos, sobre, contato, entrar, cadastro, conta, nova-senha)
app/admin/           painel: login, dashboard, pedidos, produtos, clientes, mensagens, configurações
app/admin/actions.ts todas as ações do painel (server actions)
app/api/track/       registra visualizações e cliques no WhatsApp
components/          Header, Footer, Logo, Pack (embalagens), cards e formulários
components/admin/    barra lateral, gráfico e formulários do painel
lib/                 banco de dados, autenticação, catálogo, configurações e formatação
prisma/              schema, seed (produtos e administrador) e demo (dados de exemplo)
docs/capturas/       capturas de tela usadas neste README
```

---

## Identidade visual

| Cor | Código |
| --- | --- |
| Verde floresta | `#10291F` |
| Dourado | `#D6AE65` |
| Creme | `#F7F3E9` |
| Bege | `#E8DCC6` |
| Cinza | `#8C928D` |

As fontes são **Playfair Display** nos títulos e **Montserrat** nos textos, carregadas pelo `next/font`. Tudo segue o manual de identidade da AXON.

---

## Versões do projeto

Este repositório guarda duas versões do site da AXON, em branches separadas:

| Branch | Versão | Vendas |
| --- | --- | --- |
| [`main`](../../tree/main) | **Brasil** (pt-BR): esta versão | Pelo WhatsApp, com pedidos registrados no painel |
| [`versao-portugal`](../../tree/versao-portugal) | **Portugal / União Europeia** (pt-PT) | Loja online com MB WAY, Multibanco e cartão (ifthenpay) |

As duas não se misturam: cada uma tem o seu código, o seu README e as suas capturas.
