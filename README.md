# Dashboard de Análise de MQLs - ETER Company

Dashboard interativo em tempo real para análise de leads qualificados (MQLs) da ETER Company, com classificação automática por Business Unit (Consultoria/Aceleradora) e ICP (1, 2, 3).

## Características

- Conexão em tempo real com Google Sheets
- Classificação automática de leads em BUs e ICPs
- Deduplicação inteligente por email
- Filtros avançados (Data, Origem, BU, ICP, Semana)
- Visualizações completas com gráficos interativos
- Sistema de alertas automático
- Comparativo semanal
- Exportação de dados para CSV
- Interface responsiva (Desktop, Tablet, Mobile)
- Atualização automática a cada 5 minutos

## Tecnologias

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes UI
- **Recharts** - Gráficos interativos
- **date-fns** - Manipulação de datas
- **Papa Parse** - Parse de CSV
- **React Query** - Gerenciamento de estado

## Instalação

```bash
# Instalar dependências
npm install

# Rodar em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar servidor de produção
npm start
```

O dashboard estará disponível em: **http://localhost:4000**

## Estrutura de Pastas

```
eter-dashboard/
├── app/
│   ├── api/
│   │   └── leads/
│   │       └── route.ts          # API route para buscar dados do Google Sheets
│   ├── layout.tsx                # Layout global
│   ├── page.tsx                  # Página principal do dashboard
│   └── globals.css               # Estilos globais
├── components/
│   ├── ui/                       # Componentes shadcn/ui
│   ├── Alertas.tsx              # Sistema de alertas
│   ├── CardsResumo.tsx          # Cards de métricas
│   ├── ComparativoSemanal.tsx   # Tabela comparativa
│   ├── Filtros.tsx              # Componente de filtros
│   ├── Graficos.tsx             # Gráficos (Recharts)
│   ├── MatrizCruzada.tsx        # Matriz Origem × BU × ICP
│   ├── TabelaConsolidada.tsx    # Tabela de métricas consolidadas
│   ├── TabelaLeads.tsx          # Tabela de leads detalhada
│   └── TabelaMetas.tsx          # Tabela de metas vs realizado
├── lib/
│   ├── classificacao.ts         # Lógica de classificação de leads
│   ├── metricas.ts              # Cálculo de métricas
│   └── utils.ts                 # Utilitários
├── types/
│   └── lead.ts                  # Definições de tipos TypeScript
└── package.json
```

## Regras de Classificação

### Business Units (BUs)

**Consultoria** (faturamento >= R$ 100k/mês):
- "mais de 10 milhões" → ICP 3
- "5 a 10 milhões" → ICP 2
- "1 milhão a 5 milhões" → ICP 1

**Aceleradora** (faturamento R$ 10k - 100k/mês):
- "700 mil a 1 milhão" → ICP 3
- "500 a 700 mil" → ICP 2
- "30 a 50 mil" → ICP 2
- "20 a 30 mil" → ICP 1
- "10 a 20 mil" → ICP 1

**Não Qualificado**:
- Faturamento < R$ 10k/mês

### Canais/Origens

- `bio-eter` - Link na bio do Instagram da ETER
- `bio` - Links em outras bios
- `storys` - Stories do Instagram
- `Tráfego Pago` - Outros canais pagos
- `Não identificado` - Origem desconhecida

## Funcionalidades do Dashboard

### 1. Cards de Resumo
- Total de Leads
- Total de MQLs
- Consultoria
- Aceleradora
- Taxa de Qualificação (%)

### 2. Filtros Disponíveis

**Período:**
- Hoje
- Últimos 7 dias
- Esta semana
- Este mês
- Últimos 30 dias
- Range customizado

**Semana do Mês:**
- Semana 1 (dias 1-7)
- Semana 2 (dias 8-14)
- Semana 3 (dias 15-21)
- Semana 4 (dias 22-28)
- Semana 5 (dias 29-31)

**Origem/Canal:**
- bio-eter
- bio
- storys
- Tráfego Pago
- Não identificado

**Business Unit:**
- Consultoria
- Aceleradora
- Não Qualificado

**ICP:**
- ICP 1
- ICP 2
- ICP 3

### 3. Tabelas

**Tabela de Metas vs Realizado:**
- Metas semanais configuráveis
- Status de atingimento
- Percentual de progresso

**Tabela Consolidada:**
- Total de leads
- Taxa de qualificação por BU
- Taxa geral

**Matriz Origem × BU × ICP:**
- Visualização cruzada de todos os dados
- Heatmap com cores por volume

**Tabela de Leads Detalhada:**
- Busca por texto
- Ordenação por qualquer coluna
- Paginação (20 itens por página)
- Exportação para CSV

### 4. Gráficos

- **Evolução Temporal** - Line chart mostrando crescimento de MQLs
- **Distribuição por BU** - Pie chart com percentuais
- **Distribuição por ICP (Consultoria)** - Bar chart horizontal
- **Distribuição por ICP (Aceleradora)** - Bar chart horizontal
- **MQLs por Canal** - Bar chart

### 5. Alertas Automáticos

- Taxa de qualificação crítica (< 40%)
- Metas não atingidas
- Queda vs semana anterior (> 20%)
- Canais inativos

### 6. Comparativo Semanal

- Total de Leads
- Total MQLs
- Consultoria
- Aceleradora
- Taxa de Qualificação
- Variação absoluta e percentual
- Indicadores visuais de tendência

## Metas Padrão

| Métrica | Meta Semanal |
|---------|--------------|
| Consultoria | 20 MQLs |
| Aceleradora | 38 MQLs |
| **Total** | **57 MQLs** |

## Fonte de Dados

O dashboard consome dados diretamente da planilha pública do Google Sheets:

**URL:** https://docs.google.com/spreadsheets/d/1eiImA4miDAgoGpUcxo20EbRmWsuMldY4LbrKTEARACg/edit?gid=996023627

### Estrutura Esperada da Planilha

| Coluna | Campo | Uso |
|--------|-------|-----|
| A | Nome | Identificação |
| B | Email | Deduplicação |
| C | Telefone | Contato |
| D | Faturamento | **Classificação BU/ICP** |
| E | Colaboradores | Info adicional |
| F | Instagram | Info adicional |
| H | Investimento Marketing | Upgrade ICP |
| J | UTM/Origem | **Filtro de Canal** |
| K | Data/Hora | **Filtro de Data** |

## Atualização de Dados

- **Automática:** A cada 5 minutos
- **Manual:** Botão "Atualizar" no header
- **Indicador:** Mostra horário da última atualização

## Responsividade

O dashboard é totalmente responsivo:

- **Desktop (> 1024px):** Layout completo em grid
- **Tablet (768px - 1024px):** Cards e tabelas empilhados
- **Mobile (< 768px):** Layout vertical otimizado

## Exportação de Dados

A tabela de leads permite exportar os dados filtrados para CSV, incluindo:
- Nome
- Email
- Telefone
- Faturamento
- BU
- ICP
- Canal
- Data/Hora

## Troubleshooting

### Erro ao carregar dados

Se aparecer "Erro ao buscar dados da planilha":

1. Verifique se a planilha está pública
2. Confirme a URL e o GID corretos
3. Verifique a conexão com internet
4. Veja os logs no console do navegador

### Portas em uso

O projeto está configurado para rodar na porta **4000**. As portas 3000, 3001, 3003, 8000, 8001, 8002 foram evitadas conforme solicitado.

Para mudar a porta, edite `package.json`:

```json
"scripts": {
  "dev": "next dev -p PORTA_DESEJADA",
  "start": "next start -p PORTA_DESEJADA"
}
```

## Deploy

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Outras plataformas

O projeto é compatível com:
- Netlify
- Railway
- Render
- AWS Amplify

## Licença

Propriedade da ETER Company

## Suporte

Para dúvidas ou problemas, entre em contato com o time de Marketing da ETER Company.

---

**Desenvolvido com Next.js + TypeScript para ETER Company**
