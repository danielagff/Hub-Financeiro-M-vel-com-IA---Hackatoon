# 🚀 Guia de Execução - Hackatoon FMU

## Opção 1: Executar com Docker (Recomendado) 🐳

### Passo a passo:

1. **Certifique-se de ter Docker e Docker Compose instalados**
   ```bash
   docker --version
   docker-compose --version
   ```

2. **Execute o projeto**
   ```bash
   docker-compose up
   ```
   
   Ou para executar em background:
   ```bash
   docker-compose up -d
   ```

3. **Aguarde os serviços iniciarem**
   - MongoDB na porta `27017`
   - PostgreSQL na porta `5432`
   - Aplicação na porta `3000`

4. **Teste o endpoint**
   ```bash
   curl http://localhost:3000/ping
   ```
   
   Ou abra no navegador: http://localhost:3000/ping

### Comandos úteis Docker:

```bash
# Ver logs em tempo real
docker-compose logs -f app

# Parar os serviços
docker-compose down

# Parar e remover volumes (limpa dados)
docker-compose down -v

# Rebuild da aplicação
docker-compose build app
docker-compose up -d app

# Ver status dos containers
docker-compose ps
```

---

## Opção 2: Executar Localmente 💻

### Pré-requisitos:
- Node.js 18+ instalado
- MongoDB rodando localmente (ou use Docker apenas para MongoDB)
- PostgreSQL rodando localmente (ou use Docker apenas para PostgreSQL)

### Passo a passo:

1. **Instalar dependências**
   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente**
   
   Crie um arquivo `.env` na raiz do projeto:
   ```env
   PORT=3000
   NODE_ENV=development
   
   # MongoDB (se rodando localmente)
   MONGODB_URI=mongodb://localhost:27017/hackatoon_fmu
   MONGODB_DB_NAME=hackatoon_fmu
   
   # PostgreSQL (se rodando localmente)
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=postgres
   POSTGRES_DB=hackatoon_fmu
   
   # JWT
   JWT_SECRET=your-secret-key-change-in-production
   JWT_EXPIRES_IN=24h
   ```

3. **Executar em modo desenvolvimento**
   ```bash
   npm run dev
   ```

4. **Ou compilar e executar em produção**
   ```bash
   npm run build
   npm start
   ```

---

## Opção 3: Apenas Bancos de Dados no Docker 🗄️

Se preferir rodar apenas MongoDB e PostgreSQL no Docker e a aplicação localmente:

1. **Iniciar apenas os bancos**
   ```bash
   docker-compose up -d mongo postgres
   ```

2. **Configurar `.env` com hosts do Docker**
   ```env
   MONGODB_URI=mongodb://localhost:27017/hackatoon_fmu
   POSTGRES_HOST=localhost
   ```

3. **Executar a aplicação localmente**
   ```bash
   npm install
   npm run dev
   ```

---

## ✅ Verificar se está funcionando

### 1. Testar endpoint `/ping`
```bash
curl http://localhost:3000/ping
```

**Resposta esperada:**
```json
{
  "message": "pong"
}
```

### 2. Testar health check
```bash
curl http://localhost:3000/health
```

**Resposta esperada:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "mongodb": "connected",
  "postgresql": "connected"
}
```

### 3. Verificar logs
- **Docker**: `docker-compose logs -f app`
- **Local**: Os logs aparecem no terminal onde executou `npm run dev`

---

## 🔧 Troubleshooting

### Erro de conexão com MongoDB
- Verifique se o MongoDB está rodando
- Confira a URI no `.env` ou `docker-compose.yml`
- Para Docker: use `mongo` como host
- Para local: use `localhost` como host

### Erro de conexão com PostgreSQL
- Verifique se o PostgreSQL está rodando
- Confira as credenciais no `.env` ou `docker-compose.yml`
- Para Docker: use `postgres` como host
- Para local: use `localhost` como host

### Porta já em uso
- Altere a porta no `.env` (ex: `PORT=3001`)
- Ou pare o serviço que está usando a porta

### Erro ao instalar dependências
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

---

## 📝 Próximos passos

Após executar com sucesso:
1. ✅ Endpoint `/ping` funcionando
2. ✅ MongoDB conectado
3. ✅ PostgreSQL conectado
4. 🚀 Pronto para desenvolver novas funcionalidades!

