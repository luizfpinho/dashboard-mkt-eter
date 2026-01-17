# Documentação Técnica - Dashboard MQLs ETER Company

## Visão Geral do Projeto

Dashboard desenvolvido em Next.js 14 com TypeScript para análise em tempo real de leads qualificados (MQLs) da ETER Company, com integração direta com Google Sheets.

## Arquitetura

### Stack Tecnológico

```
Frontend:
- Next.js 14 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 4

UI Components:
- shadcn/ui (Radix UI)
- Recharts (gráficos)
- Lucide React (ícones)

Data Processing:
- Papa Parse (CSV parsing)
- date-fns (manipulação de datas)
- TanStack React Query (cache e estado)
```

### Fluxo de Dados

```
Google Sheets (CSV Export)
         ↓
API Route (/api/leads)
         ↓
Parse CSV (Papa Parse)
         ↓
Classificação de Leads (lib/classificacao.ts)
         ↓
Cálculo de Métricas (lib/metricas.ts)
         ↓
State Management (React Hooks)
         ↓
Componentes UI
```

## Estrutura de Componentes

### Hierarquia de Componentes

```
Dashboard (page.tsx)
├── Header
│   ├── Logo/Título
│   ├── Última Atualização
│   └── Botão Atualizar
│
├── Filtros
│   ├── Date Range Picker
│   ├── Filtro de Semana
│   ├── Multi-select Origens
│   ├── Multi-select BUs
│   ├── Multi-select ICPs
│   └── Botões (Aplicar/Limpar)
│
├── CardsResumo
│   ├── Card Total Leads
│   ├── Card Total MQLs
│   ├── Card Consultoria
│   ├── Card Aceleradora
│   └── Card Taxa Qualificação
│
├── Alertas
│   ├── Alerta Taxa Crítica
│   ├── Alerta Metas
│   └── Alerta Variação Semanal
│
├── Grid Principal
│   ├── Coluna Esquerda
│   │   ├── TabelaMetas
│   │   └── TabelaConsolidada
│   │
│   └── Coluna Direita
│       └── Graficos
│           ├── Evolução Temporal (Line)
│           ├── Distribuição BU (Pie)
│           ├── ICP Consultoria (Bar)
│           ├── ICP Aceleradora (Bar)
│           └── MQLs por Canal (Bar)
│
├── ComparativoSemanal
│
├── MatrizCruzada
│
└── TabelaLeads
    ├── Busca
    ├── Tabela com Ordenação
    ├── Paginação
    └── Exportar CSV
```

## Módulos Principais

### 1. lib/classificacao.ts

**Responsabilidades:**
- Classificar leads em Business Units
- Atribuir ICP baseado em faturamento
- Identificar canal/origem
- Deduplicar leads por email
- Filtrar leads por critérios múltiplos

**Funções principais:**
```typescript
classificarLead(lead: Lead): LeadClassificado
classificarOrigem(utm: string): string
deduplicarLeads(leads: LeadClassificado[]): LeadClassificado[]
filtrarLeads(leads: LeadClassificado[], filtros: Filtros): LeadClassificado[]
```

### 2. lib/metricas.ts

**Responsabilidades:**
- Calcular métricas agregadas
- Gerar dados para gráficos
- Calcular distribuições
- Comparativos temporais

**Funções principais:**
```typescript
calcularMetricas(leads: LeadClassificado[]): Metricas
calcularDistribuicaoPorCanal(leads: LeadClassificado[]): Record<string, number>
calcularMatrizCruzada(leads: LeadClassificado[]): Record<string, Record<string, number>>
calcularEvolucaoTemporal(leads: LeadClassificado[]): EvolucaoData[]
calcularComparativoSemanal(atual: LeadClassificado[], anterior: LeadClassificado[]): ComparativoSemanal[]
obterLeadsDaSemana(leads: LeadClassificado[], semana: number, mes: number, ano: number): LeadClassificado[]
```

### 3. app/api/leads/route.ts

**Responsabilidades:**
- Buscar dados do Google Sheets via CSV export
- Parsear CSV para objetos JavaScript
- Mapear colunas para tipos TypeScript
- Tratar erros de rede e parsing

**Endpoint:**
```
GET /api/leads

Response:
{
  "leads": Lead[]
}
```

## Sistema de Tipos

### Tipos Principais

```typescript
// Lead bruto da planilha
interface Lead {
  nome: string;
  email: string;
  telefone: string;
  faturamento: string;
  colaboradores: string;
  instagram: string;
  investimentoMarketing: string;
  origem: string;
  dataHora: Date;
}

// Lead com classificação aplicada
interface LeadClassificado extends Lead {
  bu: 'Consultoria' | 'Aceleradora' | 'Não Qualificado';
  icp: 'ICP1' | 'ICP2' | 'ICP3' | null;
  canal: string;
}

// Métricas calculadas
interface Metricas {
  totalLeads: number;
  totalMQLs: number;
  consultoria: number;
  aceleradora: number;
  naoQualificado: number;
  taxaQualificacao: number;
  consultoriaICP1: number;
  consultoriaICP2: number;
  consultoriaICP3: number;
  aceleradoraICP1: number;
  aceleradoraICP2: number;
  aceleradoraICP3: number;
}

// Metas configuráveis
interface Metas {
  consultoriaTotal: number;
  aceleradoraTotal: number;
  total: number;
}

// Filtros aplicados
interface Filtros {
  dataInicio: Date | null;
  dataFim: Date | null;
  origens: string[];
  bus: string[];
  icps: string[];
  semana: number | null;
}
```

## Regras de Negócio

### Classificação de Business Unit

```javascript
// CONSULTORIA (>= R$ 100k/mês)
"mais de 10 milhões"       → Consultoria ICP3  (> R$ 833k/mês)
"5 a 10 milhões"          → Consultoria ICP2  (R$ 416k-833k/mês)
"1 milhão a 5 milhões"    → Consultoria ICP1  (R$ 83k-416k/mês)

// ACELERADORA (R$ 10k-100k/mês)
"700 mil a 1 milhão"      → Aceleradora ICP3  (R$ 58k-83k/mês)
"500 a 700 mil"           → Aceleradora ICP2  (R$ 42k-58k/mês)
"30 a 50 mil"             → Aceleradora ICP2  (R$ 30k-50k/mês)
"20 a 30 mil"             → Aceleradora ICP1  (R$ 20k-30k/mês)
"10 a 20 mil"             → Aceleradora ICP1  (R$ 10k-20k/mês)

// NÃO QUALIFICADO
< R$ 10k/mês              → Não Qualificado
```

### Mapeamento de Canais

```javascript
"bio-eter"           → Canal: bio-eter
"bio"                → Canal: bio
"storys"/"stories"   → Canal: storys
outro valor válido   → Canal: Tráfego Pago
vazio/null           → Canal: Não identificado
```

## Performance e Otimizações

### Estratégias Implementadas

1. **Memoização de Dados**
   - `useMemo` para cálculos pesados
   - Evita recálculos desnecessários

2. **Deduplicação Eficiente**
   - Set() para verificação O(1)
   - Mantém lead mais recente

3. **Paginação**
   - 20 itens por página
   - Reduz DOM rendering

4. **Lazy Loading**
   - Gráficos renderizados sob demanda
   - Code splitting automático (Next.js)

5. **Caching**
   - React Query para cache de API
   - Revalidação automática

### Métricas de Performance

```
Build Time: ~2.3s
Initial Load: < 2s
Time to Interactive: < 3s
Bundle Size: Otimizado com Tree Shaking
```

## Responsividade

### Breakpoints

```css
mobile:  < 768px   (sm)
tablet:  768-1024px (md)
desktop: > 1024px  (lg, xl, 2xl)
```

### Adaptações por Dispositivo

**Mobile:**
- Layout vertical
- Cards empilhados
- Tabelas com scroll horizontal
- Filtros em accordion

**Tablet:**
- Grid 2 colunas
- Gráficos redimensionados
- Tabelas responsivas

**Desktop:**
- Layout completo em grid 3 colunas
- Todas as visualizações visíveis
- Máxima densidade de informação

## Segurança

### Medidas Implementadas

1. **API Routes**
   - Server-side rendering
   - Sem exposição de credenciais

2. **Validação de Dados**
   - Type checking com TypeScript
   - Sanitização de inputs

3. **CORS**
   - Controlado pelo Next.js
   - Apenas domínios autorizados

4. **Rate Limiting**
   - Atualização máxima a cada 5 min
   - Previne sobrecarga da API

## Troubleshooting

### Problemas Comuns

**1. Erro ao buscar planilha**
```
Causa: Planilha não pública ou URL incorreta
Solução: Verificar permissões do Google Sheets
```

**2. Dados não atualizando**
```
Causa: Cache do navegador ou API
Solução: Limpar cache ou forçar atualização
```

**3. Classificação incorreta**
```
Causa: Formato de resposta diferente do esperado
Solução: Verificar lib/classificacao.ts e adicionar variação
```

**4. Gráficos não renderizando**
```
Causa: Dados vazios ou formato incorreto
Solução: Verificar console para erros de Recharts
```

## Manutenção

### Atualizações Frequentes

**Adicionar nova faixa de faturamento:**
1. Editar `lib/classificacao.ts`
2. Atualizar função `classificarLead()`
3. Adicionar caso no switch/if

**Mudar metas:**
1. Editar constante `metas` em `app/page.tsx`
2. Ou criar interface de configuração

**Adicionar novo filtro:**
1. Atualizar interface `Filtros` em `types/lead.ts`
2. Adicionar UI em `components/Filtros.tsx`
3. Implementar lógica em `lib/classificacao.ts`

**Adicionar novo gráfico:**
1. Criar componente em `components/Graficos.tsx`
2. Adicionar dados calculados em `lib/metricas.ts`
3. Integrar em `app/page.tsx`

## Deploy

### Checklist de Deploy

- [ ] Build sem erros (`npm run build`)
- [ ] Testes de responsividade
- [ ] Validar URL do Google Sheets
- [ ] Configurar variáveis de ambiente (se necessário)
- [ ] Testar em produção
- [ ] Monitorar logs

### Variáveis de Ambiente (Futuro)

```env
# .env.local
NEXT_PUBLIC_SHEETS_ID=1eiImA4miDAgoGpUcxo20EbRmWsuMldY4LbrKTEARACg
NEXT_PUBLIC_SHEET_GID=996023627
```

## Melhorias Futuras

### Roadmap

1. **Autenticação**
   - Login com Google
   - Diferentes níveis de acesso

2. **Configuração Dinâmica**
   - Interface para editar metas
   - Customizar cores e temas

3. **Exportações Avançadas**
   - PDF com relatório completo
   - Excel com múltiplas abas

4. **Notificações**
   - Email quando meta atingida
   - Alertas push

5. **Integrações**
   - CRM (RD Station, HubSpot)
   - Google Analytics
   - Meta Ads

6. **Analytics Avançado**
   - Machine Learning para previsões
   - Análise de tendências
   - Recomendações automáticas

## Licença e Créditos

**Desenvolvido para:** ETER Company
**Desenvolvedor:** Luiz Felipe
**Data:** Dezembro 2025
**Versão:** 1.0.0
**Stack:** Next.js + TypeScript + Tailwind CSS + shadcn/ui

---

Para suporte técnico, consulte o time de desenvolvimento da ETER Company.
