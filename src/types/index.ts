export type ApiProductResponse = {
  code?: string;
  status: number;
  product?: {
    product_name: string;
    brands: string;
    categories_tags: string[];
    image_front_url: string;
    compared_to_category: string;
  };
};

export type ProductEntity = {
  id: string;
  barcode?: string;
  name?: string;
  brand?: string;
  categories?: string[];
  imageUrl?: string;
  localImageUri?: string;
  bestBefore?: string;
};

export type AppStore = {
  products: ProductEntity[];
};
