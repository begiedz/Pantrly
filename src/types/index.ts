export type ApiProductResponse = {
  code?: string;
  status: number;
  product?: {
    product_name: string;
    brands_tags: string[];
    categories_tags: string[];
    image_front_url: string;
    compared_to_category: string;
  };
};

export type ProductEntity = {
  id: string;
  barcode?: string;
  name?: string;
  description?: string;
  brand?: string;
  categories?: string[];
  imageUrl?: string;
};

export type PantryStore = {
  products: ProductEntity[];
};
