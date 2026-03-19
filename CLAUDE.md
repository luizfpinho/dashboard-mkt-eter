# ETER Dashboard MKT - Project Context

## Overview
Dashboard de Analise de MQLs (Marketing Qualified Leads) para ETER Company. Next.js 16 + React 19 + TypeScript + Tailwind CSS + shadcn/ui + Recharts.

## Tech Stack
- **Framework:** Next.js 16.1.1 (App Router)
- **UI:** React 19.2.3, Tailwind CSS 4, shadcn/ui (Radix UI), Lucide icons
- **Charts:** Recharts 3.6
- **Data:** Google Sheets API (CSV fetch), React Query, PapaParse
- **Language:** TypeScript (strict)
- **Port:** 4000 (dev and prod)

## Project Structure
```
app/
  api/leads/route.ts  - API route que busca dados do Google Sheets
  page.tsx             - Pagina principal do dashboard
  layout.tsx           - Layout global
components/            - Componentes visuais (shadcn/ui + custom)
lib/                   - Logica de negocio e utilitarios
types/                 - Tipos TypeScript
public/                - Assets estaticos
```

## Commands
```bash
npm run dev    # Dev server na porta 4000
npm run build  # Build de producao
npm start      # Start producao
npm run lint   # ESLint
```

## Business Rules
- **Consultoria** (>= R$100k/mes): ICP 1/2/3 por faturamento
- **Aceleradora** (R$10k-100k/mes): ICP 1/2/3 por faturamento
- **Nao Qualificado**: < R$10k/mes
- **Metas semanais:** Consultoria 20, Aceleradora 38, Total 57
- Deduplicacao por email
- Atualizacao automatica a cada 5 minutos

## Guidelines for Teammates
- Responda sempre em portugues brasileiro
- Use TypeScript strict - sem `any` types
- Siga os patterns existentes do shadcn/ui para novos componentes
- API routes ficam em `app/api/`
- Componentes reutilizaveis em `components/`
- Logica de negocio em `lib/`
- Tipos em `types/`
- Mantenha a responsividade (mobile, tablet, desktop)
- Nao altere regras de classificacao sem confirmar com o usuario
