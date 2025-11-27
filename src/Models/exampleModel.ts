import mongoose, { Schema, Document } from 'mongoose';

// Exemplo de modelo MongoDB
export interface IExample extends Document {
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExampleSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export const ExampleModel = mongoose.model<IExample>('Example', ExampleSchema);

