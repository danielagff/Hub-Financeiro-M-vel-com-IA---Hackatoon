import mongoose, { Schema, Document } from 'mongoose';
import { UserType } from '../enums/userType';

// Interface para IAAgent (salvo no MongoDB)
export interface IIAAgent {
  attributes: {
    [key: string]: any;
  };
}

// Interface para Configuration
export interface IConfiguration {
  [key: string]: any;
}

// Interface principal do User
export interface IUser extends Document {
  id: number;
  type: UserType | string;
  name: string;
  email: string;
  chavePix: string;
  password: string; // Será criptografado com bcrypt
  balance: number; // BigDecimal representado como number (pode usar Decimal128 se necessário)
  creditScore: number; // int32
  // []Transaction - One to many (comentado por enquanto)
  // transactions: mongoose.Types.ObjectId[];
  // []Expenses - One to many (comentado por enquanto)
  // expenses: mongoose.Types.ObjectId[];
  configuration: IConfiguration | Map<string, any>;
  iaAgent?: IIAAgent;
  createdAt: Date;
  updatedAt: Date;
}

const IAAgentSchema: Schema = new Schema(
  {
    attributes: {
      type: Map,
      of: Schema.Types.Mixed,
      required: false,
    },
  },
  { _id: false }
);

const UserSchema: Schema = new Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: Object.values(UserType),
      required: true,
      default: UserType.NORMAL,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    chavePix: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // Não retorna a senha por padrão nas queries
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    creditScore: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 1000,
    },
    // Transactions - One to many (comentado por enquanto)
    // transactions: [{
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'Transaction'
    // }],
    // Expenses - One to many (comentado por enquanto)
    // expenses: [{
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'Expense'
    // }],
    configuration: {
      type: Map,
      of: Schema.Types.Mixed,
      required: false,
      default: {},
    },
    iaAgent: {
      type: IAAgentSchema,
      required: false,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Índices para melhor performance
UserSchema.index({ email: 1 });
UserSchema.index({ chavePix: 1 });
UserSchema.index({ id: 1 });

export const UserModel = mongoose.model<IUser>('User', UserSchema);

