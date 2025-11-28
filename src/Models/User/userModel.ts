import mongoose, { Schema, Document } from 'mongoose';
import { UserType } from '../enums/userType';
import { PixKeyType } from '../enums/pixKeyType';

export interface IIAAgent {
  attributes: {
    [key: string]: any;
  };
}

export interface IConfiguration {
  [key: string]: any;
}

export interface IUser extends Document {
  id: number;
  type: UserType | string;
  name: string;
  email: string;
  pixKeys?: { type: PixKeyType | string; key: string }[];
  password: string;
  balance: number;
  creditScore: number;
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
    pixKeys: {
      type: [
        {
          type: { type: String, enum: Object.values(PixKeyType) },
          key: { type: String },
        }
      ],
      required: false,
      default: [],
    },
    password: {
      type: String,
      required: true,
      select: false,
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

UserSchema.index({ email: 1 });
UserSchema.index({ id: 1 });

export const UserModel = mongoose.model<IUser>('User', UserSchema);

