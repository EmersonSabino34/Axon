# AXON — Uma Vida Extraordinária

Site da marca AXON com loja de demonstração, contas de cliente e painel de gestão:

- **Loja (`/`):** página pensada para despertar o desejo de compra — área principal escura com a fotografia da coleção (brilho dourado e partículas animadas), faixa dourada em movimento, «Ao pormenor» (a fotografia muda ao percorrer a página), coleção com filtros e botão de adicionar ao carrinho em cada cartão, um slide por produto com 6 fotografias, «Ingredientes com história» (Própolis e Cravinho), A Marca, newsletter, perguntas frequentes, convite final, contactos e rodapé legal. No telemóvel, um atalho fixo leva à coleção. As animações respeitam a opção «reduzir movimento» do sistema.
- **Contas:** criar conta (`/criar-conta`), entrar (`/entrar`) e «A minha conta» (`/conta`), onde o cliente altera o nome e a palavra-passe ou elimina a conta.
- **Compra (`/checkout`):** dados do cliente, morada em Portugal, NIF opcional e pagamento por **MB WAY**, **Multibanco (entidade e referência)** ou **cartão**. Página da encomenda (`/encomenda/<número>`) com as instruções de pagamento, atualizada sozinha quando o pagamento entra.
- **Painel (`/painel`, só administradores):** visão geral (faturação, encomendas, clientes, gráfico de novos clientes), encomendas (estado, envio com nota, cancelamento, confirmação manual), produtos (preço, stock, estado e textos), clientes, lista de lançamento e definições (loja online, contactos, empresa e páginas legais).

Feito em **Next.js 16** (App Router, React 19, TypeScript) com CSS próprio. A base de dados é o SQLite incluído no Node.js: não há serviços pagos nem chaves externas.

> **Estado:** pré-lançamento. As encomendas estão **fechadas por omissão** e só abrem em Painel › Definições › Loja online quando todos os requisitos estão cumpridos. Sem chaves da ifthenpay, os pagamentos funcionam em **modo de teste** (simulados). As contas e as encomendas guardam dados pessoais — publique a Política de Privacidade antes de abrir ao público.

## Como executar no Visual Studio Code

1. Instale o [Node.js](https://nodejs.org) **22.13 ou superior** (recomendado: 24 LTS). O módulo `node:sqlite` não existe em versões anteriores.
2. No VS Code, abra esta pasta (`File › Open Folder…`) e o terminal integrado (`Ctrl + '`).
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Crie o administrador: copie `.env.example` para `.env.local` e troque o e-mail e a palavra-passe.
   ```bash
   cp .env.example .env.local
   ```
5. Arranque o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
6. Abra <http://localhost:3000>. O painel está em <http://localhost:3000/painel> (entre com o `ADMIN_EMAIL` e o `ADMIN_PASSWORD` do `.env.local`).

Versão final (otimizada): `npm run build` e depois `npm start`. Verificações: `npm run lint` e `npx tsc --noEmit`.

## Pagamentos (MB WAY, Multibanco e cartão)

O checkout usa a **ifthenpay**, que junta os três métodos num só contrato. Os preços, a disponibilidade e o stock são sempre recalculados no servidor; o stock só baixa quando o pagamento é confirmado.

**Testar já (modo de teste)** — sem contrato nem dinheiro real:
1. Em `.env.local`, deixe `PAYMENTS_PROVIDER=teste` (é o valor por omissão em `npm run dev`).
2. No painel: preencha a denominação e o NIPC da empresa e os links dos Termos e da Política de Privacidade (Definições); defina os portes e ligue **Aceitar encomendas** (Definições › Loja online); marque pelo menos um produto como **Disponível** com stock (Produtos).
3. Na loja, adicione o produto, finalize a encomenda e escolha o método. Na página da encomenda (e na página de cartão simulada) há botões para **simular o pagamento aprovado ou recusado**. A referência de teste usa a entidade 00000, que não existe, por isso não pode ser paga por engano.

**Passar a pagamentos reais:**
1. Contrate a ifthenpay e peça as chaves **MB WAY KEY**, **MB KEY** (referências dinâmicas) e **CCARD KEY**. Pode pedir primeiro chaves de teste.
2. Escolha uma **chave anti-phishing** (texto secreto, até 50 caracteres) e peça à ifthenpay para ativar a notificação de pagamento («callback») de cada método com o endereço respetivo (cada um até 300 caracteres):
   ```
   MB WAY:     https://O-SEU-DOMINIO/api/pagamentos/ifthenpay?key=[ANTI_PHISHING_KEY]&orderId=[ORDER_ID]&amount=[AMOUNT]&requestId=[REQUEST_ID]&method=mbway
   Multibanco: https://O-SEU-DOMINIO/api/pagamentos/ifthenpay?key=[ANTI_PHISHING_KEY]&orderId=[ORDER_ID]&amount=[AMOUNT]&requestId=[REQUEST_ID]&entity=[ENTITY]&reference=[REFERENCE]&method=multibanco
   Cartão:     https://O-SEU-DOMINIO/api/pagamentos/ifthenpay?key=[ANTI_PHISHING_KEY]&orderId=[ORDER_ID]&amount=[AMOUNT]&requestId=[REQUEST_ID]&method=cartao
   ```
3. No servidor, defina `PAYMENTS_PROVIDER=ifthenpay`, `IFTHENPAY_MBWAY_KEY`, `IFTHENPAY_MB_KEY`, `IFTHENPAY_CCARD_KEY`, `IFTHENPAY_ANTI_PHISHING_KEY` e `SITE_URL` (o seu domínio, com https). As chaves nunca vão para o navegador.
4. **Teste primeiro na sandbox** com `IFTHENPAY_SANDBOX=1` (a ifthenpay pede que os testes não sejam feitos em produção). O Multibanco e o cartão passam a usar a sandbox; o cartão de teste aprovado é `4012 0010 3714 1112` (CVC 212, validade 12/27) e o recusado `4761 7390 0101 0135` (CVC 608, validade 12/29). O MB WAY não tem sandbox e fica desligado nesse modo: teste-o já em produção com um valor baixo e reembolse no backoffice. As notificações testam-se com o [Webhook Tester](https://ifthenpay.com/docs/tools/webhook-tester/) (o site tem de estar num endereço público). Retire `IFTHENPAY_SANDBOX` para abrir ao público.
5. A integração está em `lib/server/payments/ifthenpay.ts`, conforme a documentação da ifthenpay de maio de 2026 (<https://ifthenpay.com/docs/en/>).

**Como cada método funciona:**
- **Multibanco:** é gerada uma referência dinâmica (entidade e referência) com a validade definida no painel (3 dias por omissão). A encomenda fica paga quando chega a notificação da ifthenpay. Depois da validade, a encomenda passa a «Pagamento não concluído» e o cliente pode gerar outra referência ou mudar de método.
- **MB WAY:** o pedido é enviado para o telemóvel indicado (`351#número`) e o cliente tem 4 minutos para aprovar na app. A página consulta o estado e, se o pedido expirar ou for recusado, oferece uma nova tentativa ou outro método.
- **Cartão:** o cliente é encaminhado para a página segura da ifthenpay (3-D Secure). No regresso, a assinatura `sk` é verificada; a notificação confirma também o pagamento. Se o cliente sair da página do cartão a meio, pode tentar de novo na página da encomenda.
- Um pagamento que chegue para uma encomenda cancelada, ou um segundo pagamento da mesma encomenda, fica no histórico da encomenda como «pagamento-a-verificar», para reembolsar.
- No painel, «Confirmar pagamento manualmente» serve para quando um pagamento aparece no backoffice da ifthenpay mas a notificação não chegou. Reembolsos fazem-se no backoffice da ifthenpay.

**Ainda não incluído** (necessário antes de vender ao público): faturação com programa certificado pela AT (cada venda tem de ter fatura), e-mails de confirmação de encomenda (precisa de um serviço de e-mail) e escolha da transportadora.

## Base de dados e contas

- O ficheiro da base de dados é criado automaticamente em `data/axon.db` (ou no caminho de `DATABASE_PATH`). Está no `.gitignore`: não vai para o Git. **Faça cópias de segurança deste ficheiro.**
- O primeiro administrador é criado a partir de `ADMIN_EMAIL` e `ADMIN_PASSWORD` quando ainda não existe nenhum. Depois de criado, pode remover a palavra-passe do `.env.local`.
- Palavras-passe guardadas com scrypt e sal aleatório. A sessão é um token aleatório num cookie `httpOnly`; a base de dados guarda só o hash do token. Sessões duram 30 dias.
- Cinco tentativas de login falhadas bloqueiam esse e-mail durante 15 minutos (em memória do servidor).
- Cada ação do painel volta a verificar no servidor se quem a faz é administrador.
- Ainda **não há recuperação de palavra-passe**: precisa de um serviço de e-mail. Até lá, a página de entrar explica isso.
- **Alojamento:** o SQLite precisa de um servidor com disco persistente (VPS, Railway, Render com disco, etc.). Em plataformas sem disco persistente, como as funções da Vercel, os dados perdem-se — aí é preciso trocar `lib/server/db.ts` por uma base de dados gerida (por exemplo, PostgreSQL).

## O que se edita no painel e no código

| O quê | Onde |
| --- | --- |
| Preço, stock, estado (em preparação / disponível), frase, descrição, pontos fortes e alegações validadas | Painel › Produtos (os valores de base estão em [lib/collection.ts](lib/collection.ts)) |
| Contactos, identificação da empresa e páginas legais | Painel › Definições |
| Tarefas antes do lançamento | Painel › Lançamento (lista em [lib/launch-checklist.ts](lib/launch-checklist.ts)) |
| Nome, formato, embalagem e avisos regulamentares dos produtos | [lib/collection.ts](lib/collection.ts) |
| Textos de «Ao pormenor», «Ingredientes com história» e do convite final | [components/Ritual.tsx](components/Ritual.tsx), [components/Origins.tsx](components/Origins.tsx), [components/Invitation.tsx](components/Invitation.tsx) |
| Palavras da faixa dourada | [components/Marquee.tsx](components/Marquee.tsx) |
| Fotografias (6 por produto) | `public/produtos/<produto>/1.webp` … `6.webp` |
| Fotografia da coleção na área principal | `public/marca/colecao-axon.webp` |
| Logótipo (emblema) | [components/BrandEmblem.tsx](components/BrandEmblem.tsx) e [components/brand-paths.ts](components/brand-paths.ts); opções em `brandConfig` ([lib/site-config.ts](lib/site-config.ts)) |
| Newsletter e indexação nos motores de pesquisa | [lib/site-config.ts](lib/site-config.ts) |
| Estilos | [app/globals.css](app/globals.css), [app/contas.css](app/contas.css), [app/painel/painel.css](app/painel/painel.css) |

- **Preços e estado:** os preços de lançamento estão em `lib/collection.ts` (`priceCents`, em cêntimos) e podem ser alterados no painel; um valor gravado no painel prevalece sobre o do código. Um produto só pode ficar «Disponível» com preço definido. Mesmo disponível, as encomendas online continuam inativas; o carrinho calcula o subtotal quando todos os artigos têm preço.
- **Textos:** a frase, a descrição e os pontos fortes falam da experiência, da embalagem e da tradição de cada ingrediente, sem dizer o que o produto faz no organismo. O campo «Alegações validadas» é só para alegações autorizadas e validadas por quem responde pela regulamentação; aparece nos slides e na ficha com o título «O que faz».
- **Fotografias:** as atuais foram recortadas da imagem-resumo dos 8 produtos. A foto 1 tem qualidade aceitável; as fotos 2 a 6 vêm das miniaturas (cerca de 44 × 66 píxeis) e ficam desfocadas. Substitua-as pelos originais com os mesmos nomes (de preferência com 1200 px ou mais no lado maior). A ordem e as legendas estão em `photoViews`, em `lib/collection.ts`.
- **Fotografia da coleção:** é uma composição feita a partir das fotos 1 de cinco produtos, com uma faixa de fundo no topo para o logótipo, que o site coloca por cima. Pode ser trocada por uma fotografia de grupo real com as mesmas proporções (1380 × 906).
- **Logótipo:** emblema vetorial desenhado a partir do logótipo da marca — disco verde, anel dourado duplo, «AXON» com o raminho a nascer do «O» e, na versão completa, «Uma Vida Extraordinária». As letras são contornos do tipo de letra Cinzel (SIL Open Font License) e as cores vêm dos tokens do site (`--forest`, `--gold`, `--sage`…). A versão compacta está nos cabeçalhos; a completa na fotografia principal, no rodapé e nas páginas de acesso. A linha «Suplementos naturais» e o «®» estão desligados em `brandConfig`: ative a primeira só depois de confirmada a classificação de todos os produtos, e o «®» só com a marca registada. Quando houver o ficheiro oficial, substitua `BrandEmblem.tsx`, `app/icon.svg` e `app/favicon.ico`.
- **Páginas legais:** crie as páginas (ex.: `app/privacidade/page.tsx`) e indique o caminho em Painel › Definições. Sem endereço, o rodapé mostra «Pendente».
- **Newsletter:** defina `newsletter.endpoint` com um Route Handler próprio que fale com o serviço escolhido no servidor. As chaves ficam em variáveis de ambiente do servidor, nunca no navegador.
- **Indexação:** `indexable: false` mantém o site fora dos motores de pesquisa. Mude para `true` só no lançamento. O painel nunca é indexado.

## Estrutura

```
app/
  page.tsx                 loja (página única)
  (acesso)/entrar          entrar
  (acesso)/criar-conta     criar conta
  conta/                   «A minha conta» e ações de conta (actions.ts)
  painel/                  painel: visão geral, produtos, clientes, lançamento, definições, ações (actions.ts)
  globals.css · contas.css · painel/painel.css
components/                loja, formulários (forms/), conta (account/), painel (admin/)
lib/
  collection.ts            os 8 produtos, fotografias e dados por confirmar
  launch-checklist.ts      tarefas antes do lançamento
  site-config.ts           configuração fixa e valores de partida das definições
  server/                  só no servidor: base de dados, sessões, palavras-passe, utilizadores, catálogo e definições
data/axon.db               base de dados (criada automaticamente, fora do Git)
```

## Antes de abrir a loja ao público

A loja destina-se a Portugal, com possível expansão para a União Europeia. A mesma lista existe em Painel › Lançamento. Antes de vender é necessário confirmar, com apoio jurídico e regulamentar:

**Produtos**
- [ ] Classificação regulamentar de cada produto (suplemento alimentar, cosmético, medicamento ou outra).
- [ ] **Lugol, Emagrecedor e Desparasitante:** verificar o enquadramento específico. Não assumir que podem ser vendidos como suplementos alimentares.
- [ ] Composição, documentação técnica e fornecedores.
- [ ] Rotulagem e alegações permitidas. As designações «Emagrecedor», «Desparasitante», «Desintoxicação do sistema linfático», «Foco Estudos» e «Libido Feminino» podem ser lidas como alegações e têm de ser validadas.
- [ ] Requisitos de notificação e de comercialização aplicáveis a cada categoria.
- [ ] Formato da Desintoxicação do sistema linfático (as imagens mostram-no em líquido; o site segue as imagens).
- [ ] Indicações impressas nos rótulos das imagens («Suplemento alimentar», «50 mL», «60 cápsulas»): só podem ficar se forem confirmadas.
- [ ] Embalagens finais aprovadas e fotografias originais em alta resolução (6 por produto).

**Loja**
- [ ] Contrato e chaves da ifthenpay; notificações (callback) ativadas e testadas.
- [ ] Stock de cada produto e produtos marcados como disponíveis.
- [ ] Portes, transportadora, prazos e política de devoluções, incluindo o direito de livre resolução.
- [ ] Faturação com programa certificado pela AT.
- [ ] E-mails de confirmação de encomenda.
- [ ] Identificação da empresa (denominação, NIPC, sede) e contactos oficiais.

**Legal e dados pessoais**
- [ ] Termos e Condições, Política de Privacidade e Política de Cookies (RGPD) — antes de abrir o registo de contas ao público.
- [ ] Livro de Reclamações Eletrónico e informação sobre Resolução Alternativa de Litígios.
- [ ] Recuperação de palavra-passe por e-mail (serviço de e-mail transacional).
- [ ] Serviço de newsletter com consentimento registado.
- [ ] Logótipo oficial em ficheiro e registo da marca (necessário para usar «®»).

Enquanto as encomendas estiverem fechadas, o botão «Finalizar encomenda» mostra apenas o aviso do que falta configurar, e o checkout explica que a loja ainda não está aberta.

O texto do site evita alegações de prevenção, tratamento ou cura de doenças e não garante resultados (emagrecimento, desintoxicação, efeitos cognitivos ou sobre a libido). Qualquer texto novo deve seguir a mesma regra.
