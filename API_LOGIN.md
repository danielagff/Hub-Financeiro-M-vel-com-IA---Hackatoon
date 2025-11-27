# 🔐 Documentação da API de Login

## Endpoint de Login

### POST /auth/login

Realiza autenticação do usuário e retorna um token JWT.

**URL:** `http://localhost:3000/auth/login`

**Método:** `POST`

**Content-Type:** `application/json`

---

## Request Body

```json
{
  "email": "usuario@example.com",
  "password": "senha123"
}
```

**Campos obrigatórios:**
- `email` (string): Email do usuário
- `password` (string): Senha do usuário

---

## Response Success (200 OK)

```json
{
  "message": "Login realizado com sucesso",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@example.com",
    "type": "NORMAL"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Campos da resposta:**
- `message`: Mensagem de sucesso
- `user`: Dados do usuário autenticado
  - `id`: ID do usuário
  - `name`: Nome do usuário
  - `email`: Email do usuário
  - `type`: Tipo do usuário (ADMIN ou NORMAL)
- `token`: Token JWT para autenticação em requisições futuras

---

## Response Error (401 Unauthorized)

```json
{
  "message": "Email ou senha inválidos"
}
```

**Possíveis mensagens de erro:**
- `"Email inválido"` - Email não está no formato correto
- `"Senha é obrigatória"` - Senha não foi fornecida
- `"Email ou senha inválidos"` - Email não encontrado ou senha incorreta

---

## Exemplos de Uso

### cURL

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "password": "senha123"
  }'
```

### JavaScript (Fetch)

```javascript
const response = await fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'joao@example.com',
    password: 'senha123'
  })
});

const data = await response.json();
console.log(data.token); // Token JWT
```

### Axios

```javascript
const axios = require('axios');

const response = await axios.post('http://localhost:3000/auth/login', {
  email: 'joao@example.com',
  password: 'senha123'
});

console.log(response.data.token); // Token JWT
```

### Postman

1. Método: `POST`
2. URL: `http://localhost:3000/auth/login`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "email": "joao@example.com",
  "password": "senha123"
}
```

---

## Usando o Token JWT

Após realizar o login, você receberá um token JWT. Use este token nas requisições que requerem autenticação:

### Exemplo com cURL

```bash
curl -X GET http://localhost:3000/users/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Exemplo com Fetch

```javascript
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

const response = await fetch('http://localhost:3000/users/1', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## Fluxo Completo de Autenticação

### 1. Criar um usuário

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "chavePix": "joao@example.com",
    "password": "senha123"
  }'
```

### 2. Fazer login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "password": "senha123"
  }'
```

**Resposta:**
```json
{
  "message": "Login realizado com sucesso",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@example.com",
    "type": "NORMAL"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiZW1haWwiOiJqb2FvQGV4YW1wbGUuY29tIiwiaWF0IjoxNjE2MjM5MDIyfQ..."
}
```

### 3. Usar o token em requisições autenticadas

```bash
# Salvar o token em uma variável
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Usar o token
curl -X GET http://localhost:3000/users/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## Validações

O serviço de login realiza as seguintes validações:

1. ✅ Email deve estar no formato válido (contém @)
2. ✅ Senha é obrigatória
3. ✅ Usuário deve existir no banco de dados
4. ✅ Senha fornecida deve corresponder à senha criptografada

---

## Segurança

- ✅ Senhas são criptografadas com bcrypt (10 rounds)
- ✅ Tokens JWT são assinados com uma chave secreta
- ✅ Tokens expiram após o tempo configurado (padrão: 24h)
- ✅ Senha não é retornada nas respostas
- ✅ Mensagens de erro genéricas para evitar enumeração de usuários

---

## Configuração do Token

O token JWT é configurado através das variáveis de ambiente:

```env
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h
```

**Formato do expiresIn:**
- `"24h"` - 24 horas
- `"7d"` - 7 dias
- `"3600"` - 3600 segundos (1 hora)
- `"2 days"` - 2 dias

---

## Teste Rápido

```bash
# 1. Criar usuário
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","chavePix":"test@test.com","password":"123456"}'

# 2. Fazer login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'
```

