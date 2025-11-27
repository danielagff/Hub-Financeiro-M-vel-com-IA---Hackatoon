# Hackatoon FMU - API Node.js com TypeScript

API desenvolvida em Node.js com TypeScript, integrando MongoDB e PostgreSQL.

## 🚀 Tecnologias

- **Node.js** com **TypeScript**
- **Express.js** - Framework web
- **MongoDB** - Banco de dados NoSQL
- **PostgreSQL** - Banco de dados relacional
- **Docker** e **Docker Compose** - Containerização

## 📁 Estrutura do Projeto

```
src/
├── Controller/          # Controladores das rotas
├── Services/            # Lógica de negócio
│   └── InterfacesServices/  # Interfaces dos serviços
├── Repository/          # Camada de acesso a dados
│   └── InterfacesRepository/  # Interfaces dos repositórios
├── Models/              # Modelos de dados
│   └── dto/             # Data Transfer Objects
├── Utils/               # Utilitários (conexões DB, helpers)
└── Security/            # Autenticação e segurança
```

## 🛠️ Instalação e Execução

### ⚡ Execução Rápida com Docker (Recomendado)

```bash
# Subir todos os serviços (MongoDB, PostgreSQL e App)
docker-compose up

# Ou em background
docker-compose up -d

# Ver logs
docker-compose logs -f app
```

**Pronto!** Acesse: http://localhost:3000/ping

### 💻 Execução Local

```bash
# 1. Instalar dependências
npm install

# 2. Criar arquivo .env (copie do env.example)
# Configure as variáveis de ambiente

# 3. Executar em desenvolvimento
npm run dev

# Ou compilar e executar em produção
npm run build
npm start
```

📖 **Para mais detalhes, consulte o [GUIA_EXECUCAO.md](./GUIA_EXECUCAO.md)**

## 🔌 Endpoints

### Health Check
- `GET /health` - Verifica status da aplicação e conexões

### Ping
- `GET /ping` - Retorna `{"message": "pong"}`

## 🐳 Docker

O projeto inclui:
- **MongoDB** na porta `27017`
- **PostgreSQL** na porta `5432`
- **Aplicação** na porta `3000`

### Comandos Docker

```bash
# Iniciar serviços
docker-compose up -d

# Parar serviços
docker-compose down

# Parar e remover volumes
docker-compose down -v

# Ver logs
docker-compose logs -f

# Rebuild da aplicação
docker-compose build app
docker-compose up -d app
```

## 📝 Variáveis de Ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```env
PORT=3000
NODE_ENV=development

MONGODB_URI=mongodb://localhost:27017/hackatoon_fmu
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=hackatoon_fmu

JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
```

## 🧪 Testando

Após iniciar os serviços, teste o endpoint:

```bash
curl http://localhost:3000/ping
```

Resposta esperada:
```json
{
  "message": "pong"
}
```

## 📚 Scripts Disponíveis

- `npm run dev` - Inicia em modo desenvolvimento com hot-reload
- `npm run build` - Compila TypeScript para JavaScript
- `npm start` - Inicia a aplicação em produção
- `npm run lint` - Executa o linter

## 🔒 Segurança

O projeto inclui:
- **Helmet** - Headers de segurança
- **CORS** - Configuração de CORS
- **JWT** - Autenticação via tokens
- **bcrypt** - Hash de senhas

## 📄 Licença

ISC

