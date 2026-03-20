# Plataforma de Inteligência de Mercado

Ferramenta de inteligência de mercado para planejamento de expansão no varejo. Filtre empresas por segmento, visualize o potencial de mercado geograficamente, identifique oportunidades de expansão por análise de similaridade e analise o cenário competitivo — tudo em um mapa interativo do Brasil.

**Demo**: https://driva-web.pages.dev

## Início Rápido

```bash
git clone https://github.com/caiopizzol/market-intelligence.git
cd market-intelligence
docker compose up --build
open http://localhost:3000
```

## Arquitetura

Monorepo com três pacotes:

```
├── apps/web          React + Vite + Leaflet (Cloudflare Pages)
├── apps/api          API REST com Hono.js (Cloudflare Workers)
├── packages/shared   Tipos TypeScript compartilhados entre apps
├── docker-compose.yml
└── biome.json
```

**Frontend**: React 19, TypeScript, Leaflet com react-leaflet para o mapa interativo, react-leaflet-cluster para agrupamento de marcadores. Deploy via Cloudflare Pages.

**Backend**: Hono.js rodando em Bun (local) e Cloudflare Workers (produção). Serve dados de empresas, filiais, concorrentes, scores de expansão e estimativas de demanda via endpoints REST.

**Shared**: Interfaces TypeScript para State, Company, Branch, Competitor, FilterState e outros tipos de domínio consumidos por ambos frontend e backend.

## Camadas de Dados

A plataforma possui duas categorias de visualização no mapa:

### Modos de visualização (radio — um por vez)

| Camada | Descrição |
|---|---|
| **Potencial de mercado** | Heatmap colorindo estados pela densidade de empresas que correspondem aos filtros ativos. Verde = alta concentração, vermelho = baixa. Alimentado pelo banco de dados de empresas da plataforma. |
| **Oportunidades de expansão** | Análise de similaridade inspirada na metodologia de expansão da Cortex Geofusion. Analisa o perfil das lojas existentes do usuário (PIB, população, densidade de empresas) e destaca estados sem presença que compartilham um perfil similar. Intensidade âmbar = score de similaridade. |

### Marcadores (checkboxes — sobreponíveis)

| Camada | Descrição |
|---|---|
| **Filiais** | Marcadores azuis mostrando as lojas próprias da empresa. Em produção, importadas via CRM; no demo, mockadas com 24 localizações. Clique para ver nome, cidade e data de abertura. |
| **Concorrência** | Marcadores vermelhos mostrando localizações de concorrentes conhecidos. 39 localizações de grandes redes varejistas. Clique para ver nome e cidade. |
| **Demanda estimada** | Bolhas proporcionais roxas centralizadas em cada estado. O tamanho representa a oportunidade de receita estimada (quantidade de empresas × ponto médio de faturamento). Clique para ver o valor em R$. Reativo aos filtros. |

## Filtros

Painel de filtros no estilo Apollo que restringe o universo de empresas em tempo real:

- **Setor**: Varejo, Tecnologia, Saúde, Indústria, Serviços, Educação
- **Porte**: Faixas de funcionários (1-10 até 500+)
- **Faturamento**: Faixas de receita (R$ 0-100k até R$ 50M+)
- **Região**: Norte, Nordeste, Centro-Oeste, Sudeste, Sul

O contador mostra o afunilamento do TAM: `850 → 80 empresas`. O mapa, scores de expansão e bolhas de demanda reagem às mudanças de filtro (debounce de 200ms).

## Painel de Detalhes do Estado

Clique em qualquer estado no mapa para ver métricas contextuais. O painel se adapta com base nas camadas ativas:

- Sempre: População, PIB per capita, contagem de empresas filtradas
- Com Filiais: quantidade de filiais
- Com Concorrência: quantidade de concorrentes
- Com Expansão: score de similaridade + banner de insight
- Com Demanda: valor estimado de demanda
- Mini gráfico de barras comparando distribuição de empresas pelas 5 regiões

## Atalhos de Teclado

| Tecla | Ação |
|---|---|
| `1` | Potencial de mercado |
| `2` | Oportunidades de expansão |
| `3` | Nenhum (limpar visualização) |
| `Q` | Alternar Filiais |
| `W` | Alternar Concorrência |
| `E` | Alternar Demanda |
| `/` | Focar na busca |
| `Esc` | Fechar dropdown / limpar busca |

## Decisões Técnicas

**Hono ao invés de Express**: Hono roda tanto em Bun (dev local) quanto em Cloudflare Workers (produção) sem alteração de código. Entry point único com guard `typeof Bun` para o servidor local.

**Leaflet ao invés de MapLibre/Deck.gl**: Leaflet é a escolha mais simples para choropleth + marcadores. react-leaflet oferece bindings declarativos para React. react-leaflet-cluster lida com agrupamento de marcadores quando muitos pontos se sobrepõem.

**Filtros no servidor, não no cliente**: A filtragem de empresas acontece server-side via query parameters. Isso espelha o comportamento real onde o banco de dados faz a filtragem, e evita enviar o dataset completo ao cliente a cada mudança de filtro.

**Expansão como análise de similaridade**: Ao invés de simplesmente destacar "estados sem lojas", a camada de expansão analisa o perfil das lojas existentes e calcula scores de similaridade contra estados sem presença. Essa abordagem é inspirada na metodologia de expansão da Cortex Geofusion e fornece recomendações baseadas em dados ao invés de classificações binárias.

**Painel contextual**: O painel de detalhes adapta suas métricas com base nas camadas ativas, mostrando apenas informações relevantes. Isso evita sobrecarregar o usuário com números que não se aplicam ao seu modo de análise atual.

**Dados mockados com distribuição realista**: 850 empresas distribuídas entre 27 estados ponderadas por população. 24 filiais concentradas no corredor Sudeste/Sul. 39 concorrentes de grandes redes varejistas. Faixas de receita correlacionadas com porte da empresa.

## Endpoints da API

| Endpoint | Descrição |
|---|---|
| `GET /health` | Health check |
| `GET /states/geojson` | GeoJSON dos estados do Brasil com dados demográficos |
| `GET /states` | Lista de propriedades dos estados |
| `GET /companies/count?sector=...&porte=...` | Contagem total + filtrada de empresas |
| `GET /companies/by-state?sector=...` | Contagem de empresas por estado (para heatmap) |
| `GET /branches` | Localizações de filiais como GeoJSON points |
| `GET /competitors` | Localizações de concorrentes como GeoJSON points |
| `GET /expansion?sector=...` | Scores de similaridade por estado |
| `GET /demand?sector=...` | Demanda de receita estimada por estado |

## Desenvolvimento Local

```bash
bun install
bun run dev          # inicia API (4000) e web (3000)
bun run lint         # biome check
bun run lint:fix     # biome check --fix
```

## Deploy

CI/CD via GitHub Actions. Push para `main` dispara deploys em paralelo:
- API → Cloudflare Workers (`wrangler deploy`)
- Web → Cloudflare Pages (`vite build` + `wrangler pages deploy`)
