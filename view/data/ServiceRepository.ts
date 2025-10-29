import { Service } from '../domain/entities';
import { IServiceRepository } from '../domain/repositories';

const SERVICES: Service[] = [
  {
    id: 'basic-grooming',
    name: 'Banho Básico',
    description: 'Banho com shampoo premium, secagem e escovação',
    price: 60,
    duration: '1h',
  },
  {
    id: 'premium-grooming',
    name: 'Banho Premium',
    description: 'Banho premium com hidratação, tosa higiênica e perfume',
    price: 90,
    duration: '1h30',
  },
  {
    id: 'full-grooming',
    name: 'Banho e Tosa Completa',
    description: 'Banho premium, tosa completa, hidratação e acabamento',
    price: 120,
    duration: '2h',
  },
];

//  const SERVICES: Service[] = [
//   {
//     id: '1',
//     name: 'Banho',
//     description: 'Banho completo com produtos de alta qualidade.',
//     price: 50,
//     duration: '30',
//   },
//   {
//     id: '2',
//     name: 'Tosa',
//     description: 'Tosa na tesoura ou na máquina, conforme preferência.',
//     price: 70,
//     duration: '60',
//   },
//   {
//     id: '3',
//     name: 'Banho e Tosa',
//     description: 'Pacote completo de banho e tosa.',
//     price: 110,
//     duration: '90',
//   },
//   {
//     id: '4',
//     name: 'Consulta Veterinária',
//     description: 'Consulta com um de nossos veterinários experientes.',
//     price: 150,
//     duration: '45',
//   },
// ];

export class ServiceRepository implements IServiceRepository {
  async getServices(): Promise<Service[]> {
    // In a real application, this would fetch data from an API
    return Promise.resolve(SERVICES);
  }
}
