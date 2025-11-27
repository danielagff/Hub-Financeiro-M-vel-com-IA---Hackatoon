import { IExampleService } from './InterfacesServices/exampleService';
import { IExampleRepository } from '../Repository/InterfacesRepository/exampleRepository';
import { ExampleRepository } from '../Repository/exampleRepository';

export class ExampleService implements IExampleService {
  private repository: IExampleRepository;

  constructor() {
    this.repository = new ExampleRepository();
  }

  async getData(): Promise<any> {
    // Lógica de negócio aqui
    return await this.repository.findAll();
  }

  async createData(data: any): Promise<any> {
    // Validações e lógica de negócio
    return await this.repository.create(data);
  }

  async updateData(id: string, data: any): Promise<any> {
    return await this.repository.update(id, data);
  }

  async deleteData(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}

