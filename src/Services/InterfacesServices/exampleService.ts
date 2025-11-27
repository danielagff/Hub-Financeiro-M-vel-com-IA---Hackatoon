// Exemplo de interface de serviço
export interface IExampleService {
  getData(): Promise<any>;
  createData(data: any): Promise<any>;
  updateData(id: string, data: any): Promise<any>;
  deleteData(id: string): Promise<void>;
}

