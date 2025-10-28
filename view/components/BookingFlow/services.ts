import { Service } from './types';

export const SERVICES: Service[] = [
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

export default SERVICES;
