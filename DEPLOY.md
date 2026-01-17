# Guia de Deploy - ETER Dashboard no Render

Este documento contém instruções completas para fazer deploy do ETER MQLs Dashboard no Render.com.

## Pré-requisitos

- Conta no GitHub
- Conta no Render.com (gratuita)
- Chave da API do Gamma (https://gamma.app/)

## Passo 1: Criar Repositório no GitHub

### 1.1 Criar o repositório no GitHub

Acesse https://github.com/new e crie um novo repositório:
- **Nome**: `eter-dashboard` (ou nome de sua preferência)
- **Visibilidade**: Private ou Public (sua escolha)
- **NÃO inicialize** com README, .gitignore ou license (já temos esses arquivos)

### 1.2 Conectar o repositório local ao GitHub

Após criar o repositório, execute os comandos abaixo no terminal (substitua `SEU_USUARIO` pelo seu username do GitHub):

```bash
cd "/Users/luizfilippemedeirosdepinho/Library/Mobile Documents/6HB5Y2QTA3~com~hp~printer~control/Documents/eter-dashboard"

# Adicionar o remote do GitHub
git remote add origin https://github.com/SEU_USUARIO/eter-dashboard.git

# Verificar se foi adicionado corretamente
git remote -v

# Fazer push do código
git push -u origin main
```

Se você usar SSH ao invés de HTTPS, use:
```bash
git remote add origin git@github.com:SEU_USUARIO/eter-dashboard.git
```

## Passo 2: Configurar Deploy no Render

### 2.1 Criar Web Service

1. Acesse https://dashboard.render.com/
2. Clique em **"New +"** > **"Web Service"**
3. Conecte sua conta do GitHub se ainda não conectou
4. Selecione o repositório **eter-dashboard**
5. Clique em **"Connect"**

### 2.2 Configurar o Web Service

Na tela de configuração, preencha:

**Basic**
- **Name**: `eter-dashboard` (ou nome de sua preferência)
- **Region**: `Oregon (US West)` (ou região mais próxima)
- **Branch**: `main`
- **Root Directory**: (deixe em branco)
- **Runtime**: `Node`

**Build & Deploy**
- **Build Command**:
  ```
  npm install && npm run build
  ```
- **Start Command**:
  ```
  npm start
  ```

**Plan**
- Selecione **Free** (ou plano de sua preferência)

### 2.3 Configurar Variáveis de Ambiente

Role até a seção **Environment Variables** e adicione:

1. **NODE_VERSION**
   - Key: `NODE_VERSION`
   - Value: `20.11.0`

2. **GAMMA_API_KEY** (OBRIGATÓRIO)
   - Key: `GAMMA_API_KEY`
   - Value: `sua_chave_gamma_aqui`
   - ⚠️ **IMPORTANTE**: Cole sua chave real da API do Gamma

Para obter sua chave do Gamma:
- Acesse https://gamma.app/
- Vá em Settings/API
- Copie sua API key

### 2.4 Configurações Avançadas (Opcional)

Se desejar, configure:
- **Auto-Deploy**: Yes (deploy automático a cada push)
- **Health Check Path**: `/` (já configurado no render.yaml)

### 2.5 Iniciar Deploy

1. Clique em **"Create Web Service"**
2. O Render iniciará automaticamente o build e deploy
3. Aguarde a conclusão (pode levar 3-5 minutos)

## Passo 3: Verificar o Deploy

### 3.1 Acompanhar Logs

Na página do seu Web Service no Render:
- Clique na aba **"Logs"** para ver o progresso
- Procure por mensagens indicando sucesso:
  ```
  ==> Build successful 🎉
  ==> Starting service with 'npm start'
  ▲ Next.js started on 0.0.0.0:XXXX
  ```

### 3.2 Acessar o Dashboard

Após o deploy ser concluído:
1. O Render mostrará a URL do seu dashboard (formato: `https://eter-dashboard-xxx.onrender.com`)
2. Clique na URL ou copie e cole no navegador
3. O dashboard deve carregar mostrando os dados da planilha do Google Sheets

### 3.3 Verificar Funcionalidades

Teste se tudo está funcionando:
- ✅ Dashboard carrega com dados da planilha
- ✅ Filtros funcionam (Data, Canal, BU, ICP)
- ✅ Gráficos são renderizados
- ✅ Tabela de leads exibe dados
- ✅ Gerador de apresentação Gamma funciona
- ✅ Análise comparativa funciona

## Troubleshooting

### Problema: Build falha com erro "MODULE_NOT_FOUND"

**Causa**: Dependências não instaladas corretamente

**Solução**:
1. Verifique se o `package.json` está no repositório
2. No Render, vá em Settings > Build Command
3. Certifique-se de que está: `npm install && npm run build`
4. Clique em "Manual Deploy" > "Clear build cache & deploy"

### Problema: Deploy funciona mas página retorna erro 503

**Causa**: Porta não configurada corretamente ou aplicação não iniciou

**Solução**:
1. Verifique os logs no Render
2. Certifique-se de que o Start Command é: `npm start`
3. Verifique se a variável `PORT` está sendo usada (já configurado no package.json)
4. Aguarde 1-2 minutos após deploy (cold start no plano free)

### Problema: Dashboard carrega mas não mostra dados

**Causa**: Falha ao buscar dados do Google Sheets

**Solução**:
1. Verifique se a planilha é pública (sem necessidade de login)
2. Teste a URL da planilha manualmente:
   ```
   https://docs.google.com/spreadsheets/d/1eiImA4miDAgoGpUcxo20EbRmWsuMldY4LbrKTEARACg/export?format=csv&gid=996023627
   ```
3. Verifique os logs para ver se há erro na API `/api/leads`
4. Se necessário, clique em "Manual Deploy" para forçar rebuild

### Problema: Gerador Gamma não funciona

**Causa**: GAMMA_API_KEY não configurada ou inválida

**Solução**:
1. No Render, vá em Environment > Environment Variables
2. Verifique se `GAMMA_API_KEY` existe e tem valor correto
3. Se adicionar/atualizar, o Render fará redeploy automático
4. Teste sua chave diretamente no Gamma.app primeiro

### Problema: Application Error ou Crashed

**Causa**: Erro no código ou falta de variável de ambiente

**Solução**:
1. Verifique os logs detalhadamente
2. Procure por stack traces ou mensagens de erro
3. Certifique-se de que todas as variáveis de ambiente estão configuradas
4. Se necessário, reverta para commit anterior funcional

### Problema: Deploy lento ou timeout

**Causa**: Plano Free do Render tem limitações

**Solução**:
- Plano Free: cold start (15-30 segundos na primeira requisição)
- Após 15 minutos de inatividade, o serviço "dorme"
- Considere upgrade para plano pago se precisar de performance constante
- Ou use serviço de "ping" para manter aplicação ativa

## Atualizações Futuras

### Para fazer deploy de novas alterações:

```bash
cd "/Users/luizfilippemedeirosdepinho/Library/Mobile Documents/6HB5Y2QTA3~com~hp~printer~control/Documents/eter-dashboard"

# Adicionar mudanças
git add .

# Criar commit
git commit -m "Descrição das alterações"

# Fazer push
git push origin main
```

Se **Auto-Deploy** estiver ativado, o Render detectará o push e fará deploy automático.

Se não estiver ativado:
1. Acesse o dashboard do Render
2. Clique em "Manual Deploy" > "Deploy latest commit"

## Comandos Git Úteis

```bash
# Ver status das mudanças
git status

# Ver histórico de commits
git log --oneline

# Ver diff das mudanças
git diff

# Desfazer mudanças não commitadas
git restore .

# Ver branches
git branch -a

# Criar nova branch
git checkout -b nome-da-branch

# Voltar para main
git checkout main
```

## Monitoramento

O Render oferece:
- **Logs em tempo real**: Aba "Logs"
- **Métricas**: Aba "Metrics" (CPU, memória, requisições)
- **Eventos**: Aba "Events" (histórico de deploys)

## Backup e Segurança

- ✅ Código versionado no GitHub
- ✅ Variáveis de ambiente seguras no Render (não expostas nos logs)
- ✅ HTTPS automático fornecido pelo Render
- ✅ Planilha Google Sheets como fonte de dados (backup externo)

## Suporte

- **Render Docs**: https://render.com/docs
- **Render Community**: https://community.render.com/
- **Next.js Docs**: https://nextjs.org/docs

## Custos

**Plano Free do Render inclui:**
- 750 horas/mês de runtime
- Build automático
- HTTPS gratuito
- Domínio .onrender.com

**Limitações do Free:**
- Cold start após 15 minutos de inatividade
- 512 MB RAM
- 0.1 CPU compartilhado

Para mais recursos, considere planos pagos a partir de $7/mês.
