# 🚀 INSTRUÇÕES DE USO - Dashboard MQLs ETER Company

## ✅ PROJETO CONCLUÍDO COM SUCESSO!

O Dashboard de Análise de MQLs está **100% funcional** e pronto para uso!

---

## 📋 O QUE FOI ENTREGUE

### ✨ Funcionalidades Implementadas

- [x] Conexão em tempo real com Google Sheets
- [x] Classificação automática de leads (Consultoria/Aceleradora + ICP 1/2/3)
- [x] Deduplicação por email
- [x] Cards de resumo (Leads, MQLs, Consultoria, Aceleradora, Taxa)
- [x] Tabela de Metas vs Realizado
- [x] Tabela Consolidada
- [x] 5 Gráficos interativos (Evolução, BU, ICPs, Canal)
- [x] Matriz Cruzada Origem × BU × ICP
- [x] Tabela de leads detalhada com busca e exportação CSV
- [x] Sistema de alertas visuais
- [x] Comparativo semanal
- [x] Filtros avançados (Data, Origem, BU, ICP, Semana)
- [x] Atualização automática a cada 5 minutos
- [x] Interface 100% responsiva
- [x] Persistência de filtros na URL

---

## 🏃 COMO USAR

### 1️⃣ Iniciar o Dashboard

```bash
# Entrar no diretório
cd eter-dashboard

# Instalar dependências (apenas na primeira vez)
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

O dashboard estará disponível em: **http://localhost:4000**

### 2️⃣ Parar o Dashboard

Pressione `Ctrl + C` no terminal onde o servidor está rodando.

### 3️⃣ Build para Produção

```bash
# Criar build otimizado
npm run build

# Iniciar servidor de produção
npm start
```

---

## 📊 COMO USAR O DASHBOARD

### Tela Inicial

Ao abrir o dashboard, você verá:

1. **Header** - Título, última atualização e botão de refresh
2. **Filtros** - Barra completa de filtros (Data, Origem, BU, ICP, Semana)
3. **Cards** - 5 cards com métricas principais
4. **Alertas** - Status das metas e alertas importantes
5. **Tabelas + Gráficos** - Layout em grid com todas as visualizações
6. **Comparativo Semanal** - Análise vs semana anterior
7. **Matriz Cruzada** - Heatmap Origem × BU × ICP
8. **Tabela Detalhada** - Todos os leads com busca e export

### Usando os Filtros

**1. Filtro de Data:**
- Clique nos botões de período rápido (Hoje, Últimos 7 dias, etc.)
- Ou selecione datas customizadas nos campos "Data Início" e "Data Fim"

**2. Filtro de Semana:**
- Dropdown para selecionar semana específica do mês (1-5)

**3. Filtros de Origem, BU e ICP:**
- Clique nos botões para ativar/desativar (ficam azuis quando ativos)
- Pode selecionar múltiplos valores

**4. Aplicar/Limpar:**
- **Aplicar Filtros** - Atualiza o dashboard com os filtros
- **Limpar** - Remove todos os filtros

### Exportar Dados

Na tabela de leads detalhada:
1. Use a busca para filtrar leads específicos
2. Clique em "Exportar CSV"
3. Arquivo será baixado automaticamente

---

## 🎯 REGRAS DE CLASSIFICAÇÃO

### Business Units

**Consultoria** (>= R$ 100k/mês):
- "mais de 10 milhões" → **ICP 3** (Verde Escuro)
- "5 a 10 milhões" → **ICP 2** (Azul)
- "1 milhão a 5 milhões" → **ICP 1** (Verde Claro)

**Aceleradora** (R$ 10k-100k/mês):
- "700 mil a 1 milhão" → **ICP 3** (Roxo)
- "500 a 700 mil" → **ICP 2** (Azul)
- "30 a 50 mil" → **ICP 2** (Azul)
- "20 a 30 mil" → **ICP 1** (Verde)
- "10 a 20 mil" → **ICP 1** (Verde)

**Não Qualificado**:
- Faturamento < R$ 10k/mês (Cinza)

### Metas Semanais

- **Consultoria:** 20 MQLs/semana
- **Aceleradora:** 38 MQLs/semana
- **Total:** 57 MQLs/semana

---

## 📈 COMO LER OS GRÁFICOS

### 1. Evolução de MQLs por Dia
- **Linha Roxa:** Total de MQLs
- **Linha Verde:** Consultoria
- **Linha Azul:** Aceleradora

### 2. Distribuição por Business Unit
- **Gráfico de Pizza** mostrando % de cada BU

### 3. Distribuição por ICP (Consultoria/Aceleradora)
- **Barras Horizontais** com quantidade de leads por ICP

### 4. MQLs por Canal
- **Barras Verticais** mostrando volume por origem

---

## 🚨 ALERTAS AUTOMÁTICOS

O dashboard mostra alertas quando:

- ❌ **Taxa de Qualificação < 40%** (Crítico - Vermelho)
- ⚠️ **Meta não atingida** (Atenção - Laranja)
- ✅ **Meta atingida** (Sucesso - Verde)
- 📉 **Queda > 20% vs semana anterior** (Crítico - Vermelho)

---

## 🔄 ATUALIZAÇÃO DE DADOS

### Automática
- Dashboard busca novos dados **a cada 5 minutos** automaticamente

### Manual
- Clique no botão **"Atualizar"** no header para forçar refresh

### Última Atualização
- Horário da última atualização aparece no header

---

## 📱 RESPONSIVIDADE

O dashboard funciona perfeitamente em:

- **Desktop** - Layout completo em grid
- **Tablet** - Adaptado com scroll
- **Mobile** - Layout vertical otimizado

---

## ⚙️ CONFIGURAÇÕES

### Mudar Porta do Servidor

Edite `package.json`:

```json
"scripts": {
  "dev": "next dev -p 5000",
  "start": "next start -p 5000"
}
```

### Mudar Metas

Edite `app/page.tsx` na linha ~30:

```typescript
const metas: Metas = {
  consultoriaTotal: 25,  // Nova meta
  aceleradoraTotal: 45,  // Nova meta
  total: 70              // Nova meta total
};
```

---

## 🐛 PROBLEMAS COMUNS

### "Erro ao buscar dados da planilha"

**Causas:**
- Planilha não está pública
- URL ou GID incorretos
- Sem internet

**Solução:**
1. Abra a planilha no Google Sheets
2. Clique em "Compartilhar"
3. Mude para "Qualquer pessoa com o link"
4. Permissão: "Visualizador"

### Porta 4000 já em uso

**Solução:**
```bash
# Descobrir processo na porta 4000
lsof -i :4000

# Matar processo
kill -9 [PID]

# Ou mudar porta no package.json
```

### Dados desatualizados

**Solução:**
1. Clique no botão "Atualizar"
2. Limpe cache do navegador (Cmd+Shift+R ou Ctrl+Shift+R)
3. Verifique se a planilha foi atualizada

---

## 📁 ESTRUTURA DE ARQUIVOS

```
eter-dashboard/
├── app/
│   ├── api/leads/route.ts    # ← API que busca dados do Sheets
│   ├── page.tsx              # ← Página principal
│   └── layout.tsx            # ← Layout global
├── components/               # ← Todos os componentes visuais
├── lib/                      # ← Lógica de negócio
├── types/                    # ← Tipos TypeScript
├── README.md                 # ← Documentação geral
├── DOCUMENTACAO.md           # ← Documentação técnica
└── INSTRUCOES.md            # ← Este arquivo
```

---

## 🚀 DEPLOY

### Vercel (Recomendado)

1. Criar conta no [Vercel](https://vercel.com)
2. Conectar repositório GitHub
3. Deploy automático!

### Manual

```bash
# Build
npm run build

# Copiar pasta .next e node_modules para servidor
# Rodar: npm start
```

---

## 📞 SUPORTE

Para problemas ou dúvidas:
- Consulte `DOCUMENTACAO.md` para detalhes técnicos
- Verifique `README.md` para informações gerais
- Entre em contato com o time de Marketing da ETER Company

---

## ✅ CHECKLIST DE USO

Antes de começar, verifique:

- [x] Node.js instalado (versão 18+)
- [x] Dependências instaladas (`npm install`)
- [x] Planilha do Google Sheets pública
- [x] Porta 4000 livre (ou outra configurada)

Para rodar:

```bash
cd eter-dashboard
npm run dev
```

Acesse: **http://localhost:4000**

---

## 🎉 PRONTO PARA USO!

O dashboard está **100% funcional** e pronto para analisar seus MQLs!

**Desenvolvido com ❤️ para ETER Company**

---

_Última atualização: 31/12/2025_
