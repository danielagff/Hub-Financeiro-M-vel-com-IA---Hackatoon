import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hackatoon FMU API',
      version: '1.0.0',
      description: 'API para sistema financeiro com transferências PIX, transações e despesas',
      contact: {
        name: 'Hackatoon FMU',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Servidor de desenvolvimento',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            type: { type: 'string', enum: ['ADMIN', 'NORMAL'] },
            name: { type: 'string' },
            email: { type: 'string' },
            pixKeys: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string', enum: ['EMAIL', 'CPF', 'PHONE', 'RANDOM', 'OTHER'] },
                  key: { type: 'string' },
                },
              },
            },
            balance: { type: 'number', format: 'decimal' },
            creditScore: { type: 'integer', minimum: 0, maximum: 1000 },
            configuration: { type: 'object' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateUser: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
            type: { type: 'string', enum: ['ADMIN', 'NORMAL'], default: 'NORMAL' },
            balance: { type: 'number', format: 'decimal', minimum: 0 },
            creditScore: { type: 'integer', minimum: 0, maximum: 1000 },
          },
        },
        Login: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                name: { type: 'string' },
                email: { type: 'string' },
                type: { type: 'string' },
              },
            },
            token: { type: 'string' },
          },
        },
        Transaction: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            type: { type: 'string', enum: ['DEBIT', 'CREDIT'] },
            date: { type: 'string', format: 'date-time' },
            amount: { type: 'number', format: 'decimal' },
            details: { type: 'string' },
            userId: { type: 'integer' },
            category: {
              type: 'string',
              enum: ['FOOD', 'TRANSPORT', 'ENTERTAINMENT', 'EXPENSES', 'OTHER'],
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateTransaction: {
          type: 'object',
          required: ['type', 'amount'],
          properties: {
            type: { type: 'string', enum: ['DEBIT', 'CREDIT'] },
            amount: { type: 'number', format: 'decimal', minimum: 0 },
            details: { type: 'string' },
            category: {
              type: 'string',
              enum: ['FOOD', 'TRANSPORT', 'ENTERTAINMENT', 'EXPENSES', 'OTHER'],
            },
          },
        },
        Expense: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            userId: { type: 'integer' },
            isRecurringPayment: { type: 'boolean' },
            isActive: { type: 'boolean' },
            amount: { type: 'number', format: 'decimal' },
            description: { type: 'string' },
            executionDate: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['PENDING', 'FAILED', 'SUCCESS'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateExpense: {
          type: 'object',
          required: ['isRecurringPayment', 'isActive', 'amount', 'description', 'executionDate'],
          properties: {
            isRecurringPayment: { type: 'boolean' },
            isActive: { type: 'boolean' },
            amount: { type: 'number', format: 'decimal', minimum: 0 },
            description: { type: 'string' },
            executionDate: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['PENDING', 'FAILED', 'SUCCESS'] },
          },
        },
        TransferPIX: {
          type: 'object',
          required: ['toPixKey', 'amount'],
          properties: {
            toPixKey: { type: 'string', description: 'Chave PIX do destinatário' },
            amount: { type: 'number', format: 'decimal', minimum: 0 },
            description: { type: 'string' },
          },
        },
        TransferResponse: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            id: { type: 'integer' },
            fromUserId: { type: 'integer' },
            toUserId: { type: 'integer' },
            amount: { type: 'number', format: 'decimal' },
            description: { type: 'string' },
            debitTransactionId: { type: 'integer' },
            creditTransactionId: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/Controller/*.ts'], // Caminho para os arquivos com anotações
};

export const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express): void {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Hackatoon FMU API Documentation',
  }));
}

