export interface ProductDimension {
  weight: number;
  width: number;
  height: number;
  length: number;
}

export interface ProductDetail {
  name: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  brand: string;
  categoryId: number;
  categoryName?: string; // For display purposes
  listPrice: number;
  discount: number;
  isEnabled: boolean;
  inStock: boolean;
  creationTime: string;
  updateTime: string;
  dimensions: ProductDimension;
  cost: number;
  details: ProductDetail[];
  imageUrl?: string;
}

export interface ProductFormData {
  name: string;
  shortDescription: string;
  fullDescription: string;
  brand: string;
  categoryId: string;
  listPrice: string;
  discount: string;
  isEnabled: boolean;
  inStock: boolean;
  weight: string;
  width: string;
  height: string;
  length: string;
  cost: string;
}

export const categories = [
  { id: 1, name: 'Vestuário' },
  { id: 2, name: 'Calçados' },
  { id: 3, name: 'Acessórios' },
  { id: 4, name: 'Eletrônicos' },
  { id: 5, name: 'Casa & Decoração' },
];

export const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Camiseta BlueVelvet Classic',
    shortDescription: 'Camiseta premium de algodão',
    fullDescription: 'Camiseta de algodão premium com acabamento de alta qualidade. Ideal para uso casual e confortável.',
    brand: 'BlueVelvet',
    categoryId: 1,
    categoryName: 'Vestuário',
    listPrice: 89.90,
    discount: 0,
    isEnabled: true,
    inStock: true,
    creationTime: '2024-01-15T10:00:00',
    updateTime: '2024-01-15T10:00:00',
    dimensions: { weight: 0.2, width: 30, height: 40, length: 2 },
    cost: 35.00,
    details: [{ name: 'Material', value: '100% Algodão' }],
  },
  {
    id: '2',
    name: 'Calça Jeans Slim',
    shortDescription: 'Calça jeans corte slim fit',
    fullDescription: 'Calça jeans com corte slim fit moderno. Tecido stretch para maior conforto.',
    brand: 'DenimCo',
    categoryId: 1,
    categoryName: 'Vestuário',
    listPrice: 199.90,
    discount: 10,
    isEnabled: true,
    inStock: true,
    creationTime: '2024-01-10T14:30:00',
    updateTime: '2024-02-01T09:00:00',
    dimensions: { weight: 0.5, width: 35, height: 100, length: 3 },
    cost: 80.00,
    details: [{ name: 'Material', value: 'Jeans Stretch' }],
  },
  {
    id: '3',
    name: 'Tênis Sport Runner',
    shortDescription: 'Tênis esportivo para corrida',
    fullDescription: 'Tênis desenvolvido para alta performance em corridas. Solado com tecnologia de amortecimento.',
    brand: 'SportMax',
    categoryId: 2,
    categoryName: 'Calçados',
    listPrice: 299.90,
    discount: 15,
    isEnabled: true,
    inStock: false,
    creationTime: '2024-01-05T08:00:00',
    updateTime: '2024-01-20T16:45:00',
    dimensions: { weight: 0.35, width: 12, height: 10, length: 30 },
    cost: 120.00,
    details: [{ name: 'Tecnologia', value: 'AirCushion' }],
  },
  {
    id: '4',
    name: 'Bolsa Elegance',
    shortDescription: 'Bolsa de couro sintético',
    fullDescription: 'Bolsa elegante em couro sintético de alta qualidade. Perfeita para ocasiões especiais.',
    brand: 'Elegance',
    categoryId: 3,
    categoryName: 'Acessórios',
    listPrice: 159.90,
    discount: 0,
    isEnabled: false,
    inStock: true,
    creationTime: '2024-01-08T11:20:00',
    updateTime: '2024-01-08T11:20:00',
    dimensions: { weight: 0.4, width: 35, height: 25, length: 12 },
    cost: 60.00,
    details: [{ name: 'Material', value: 'Couro Sintético' }],
  },
  {
    id: '5',
    name: 'Relógio Minimalista',
    shortDescription: 'Relógio com pulseira de aço',
    fullDescription: 'Relógio com design minimalista e pulseira de aço inoxidável. Resistente à água.',
    brand: 'TimePlus',
    categoryId: 3,
    categoryName: 'Acessórios',
    listPrice: 349.90,
    discount: 5,
    isEnabled: true,
    inStock: true,
    creationTime: '2024-01-12T15:00:00',
    updateTime: '2024-01-25T10:30:00',
    dimensions: { weight: 0.1, width: 4, height: 4, length: 1 },
    cost: 150.00,
    details: [{ name: 'Resistência', value: '30m' }],
  },
];
