# 📚 Documentação da API de Usuários

## Estrutura do Objeto User

```typescript
{
  id: number;                    // ID único (long)
  type: "ADMIN" | "NORMAL";      // Tipo de usuário (enum)
  name: string;                  // Nome do usuário
  email: string;                  // Email (único)
  chavePix: string;               // Chave PIX (única)
  password: string;                // Senha (criptografada com bcrypt)
  balance: number;                // Saldo (BigDecimal como number)
  creditScore: number;            // Score de crédito (0-1000)
  configuration: object;         // Configurações do usuário
  iaAgent: {                      // Agente IA (salvo no MongoDB)
    attributes: object;
  };
  createdAt: Date;
  updatedAt: Date;
  // transactions: [] - Comentado por enquanto
  // expenses: [] - Comentado por enquanto
}
```

## Endpoints Disponíveis

### 1. Listar Todos os Usuários
```http
GET /users
```

**Resposta:**
```json
[
  {
    "id": 1,
    "type": "NORMAL",
    "name": "João Silva",
    "email": "joao@example.com",
    "chavePix": "joao@example.com",
    "balance": 1000.50,
    "creditScore": 750,
    "configuration": {},
    "iaAgent": {
      "attributes": {}
    },
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
]
```

---

### 2. Buscar Usuário por ID
```http
GET /users/:id
```

**Exemplo:**
```bash
curl http://localhost:3000/users/1
```

**Resposta:**
```json
{
  "id": 1,
  "type": "NORMAL",
  "name": "João Silva",
  "email": "joao@example.com",
  "chavePix": "joao@example.com",
  "balance": 1000.50,
  "creditScore": 750,
  "configuration": {},
  "iaAgent": {
    "attributes": {}
  },
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

---

### 3. Buscar Usuário por Email
```http
GET /users/email/:email
```

**Exemplo:**
```bash
curl http://localhost:3000/users/email/joao@example.com
```

---

### 4. Buscar Usuário por Chave PIX
```http
GET /users/pix/:chavePix
```

**Exemplo:**
```bash
curl http://localhost:3000/users/pix/joao@example.com
```

---

### 5. Criar Novo Usuário
```http
POST /users
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Maria Santos",
  "email": "maria@example.com",
  "chavePix": "maria@example.com",
  "password": "senha123",
  "type": "NORMAL",
  "balance": 0,
  "creditScore": 0,
  "configuration": {
    "theme": "dark",
    "notifications": true
  },
  "iaAgent": {
    "attributes": {
      "preferences": "financial",
      "language": "pt-BR"
    }
  }
}
```

**Exemplo com cURL:**
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Santos",
    "email": "maria@example.com",
    "chavePix": "maria@example.com",
    "password": "senha123",
    "type": "NORMAL"
  }'
```

**Resposta (201 Created):**
```json
{
  "id": 2,
  "type": "NORMAL",
  "name": "Maria Santos",
  "email": "maria@example.com",
  "chavePix": "maria@example.com",
  "balance": 0,
  "creditScore": 0,
  "configuration": {},
  "iaAgent": {
    "attributes": {}
  },
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

**Validações:**
- ✅ Nome é obrigatório
- ✅ Email deve ser válido e único
- ✅ Chave PIX é obrigatória e única
- ✅ Senha deve ter no mínimo 6 caracteres
- ✅ Balance não pode ser negativo
- ✅ CreditScore deve estar entre 0 e 1000

---

### 6. Atualizar Usuário
```http
PUT /users/:id
Content-Type: application/json
```

**Body (todos os campos são opcionais):**
```json
{
  "name": "Maria Santos Silva",
  "balance": 500.75,
  "creditScore": 800,
  "configuration": {
    "theme": "light"
  }
}
```

**Exemplo com cURL:**
```bash
curl -X PUT http://localhost:3000/users/2 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Santos Silva",
    "creditScore": 800
  }'
```

**Resposta (200 OK):**
```json
{
  "id": 2,
  "type": "NORMAL",
  "name": "Maria Santos Silva",
  "email": "maria@example.com",
  "chavePix": "maria@example.com",
  "balance": 500.75,
  "creditScore": 800,
  "configuration": {
    "theme": "light"
  },
  "iaAgent": {
    "attributes": {}
  },
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:30:00.000Z"
}
```

---

### 7. Deletar Usuário
```http
DELETE /users/:id
```

**Exemplo:**
```bash
curl -X DELETE http://localhost:3000/users/2
```

**Resposta (200 OK):**
```json
{
  "message": "Usuário deletado com sucesso"
}
```

---

## Exemplos de Uso

### Criar Usuário ADMIN
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "chavePix": "admin@example.com",
  "password": "admin123",
  "type": "ADMIN",
  "balance": 0,
  "creditScore": 1000
}
```

### Criar Usuário com IAAgent
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "chavePix": "joao@example.com",
  "password": "senha123",
  "type": "NORMAL",
  "iaAgent": {
    "attributes": {
      "riskProfile": "moderate",
      "investmentPreferences": ["stocks", "bonds"],
      "financialGoals": ["retirement", "house"],
      "aiModel": "gpt-4"
    }
  }
}
```

### Atualizar CreditScore
```json
{
  "creditScore": 850
}
```

### Atualizar Balance
```json
{
  "balance": 2500.99
}
```

---

## Códigos de Status HTTP

- `200 OK` - Requisição bem-sucedida
- `201 Created` - Usuário criado com sucesso
- `400 Bad Request` - Dados inválidos ou erro de validação
- `404 Not Found` - Usuário não encontrado
- `500 Internal Server Error` - Erro interno do servidor

---

## Observações Importantes

1. **Senha**: A senha é automaticamente criptografada com bcrypt antes de ser salva
2. **ID**: O ID é gerado automaticamente (sequencial)
3. **Email e Chave PIX**: Devem ser únicos no sistema
4. **Balance**: Representado como `number` (pode ser convertido para Decimal128 se necessário)
5. **CreditScore**: Valor entre 0 e 1000
6. **IAAgent**: Objeto salvo no MongoDB com atributos flexíveis
7. **Transactions e Expenses**: Comentados por enquanto, serão implementados depois

---

## Testes Rápidos

### 1. Criar um usuário
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","chavePix":"test@test.com","password":"123456"}'
```

### 2. Listar todos
```bash
curl http://localhost:3000/users
```

### 3. Buscar por ID
```bash
curl http://localhost:3000/users/1
```

### 4. Atualizar
```bash
curl -X PUT http://localhost:3000/users/1 \
  -H "Content-Type: application/json" \
  -d '{"creditScore":900}'
```

### 5. Deletar
```bash
curl -X DELETE http://localhost:3000/users/1
```

