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
  categoryName?: string;
  list_price: number;
  discount: number;
  isEnabled: boolean;
  inStock: boolean;
  creationTime: string;
  updateTime: string;
  dimension: ProductDimension;
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
  list_price: string;
  discount: string;
  isEnabled: boolean;
  inStock: boolean;
  weight: string;
  width: string;
  height: string;
  length: string;
  cost: string;
  imageUrl?: string;
}