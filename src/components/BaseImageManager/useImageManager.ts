import { useMemo, useCallback } from 'react';

export interface ImageItem {
  name: string;
  image: string;
}

export interface ImageManagerConfig {
  name: string;
  baseRoute: string;
  categoryDisplayNames?: Record<string, string>;
  defaultDescription?: string;
  subcategories?: Record<string, string>;
  link?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  price: string;
  link: string;
}

export interface ImageDatabase {
  [category: string]: (string | ImageItem)[];
}

export interface ProductStats {
  total: number;
  byCategory: Record<string, number>;
}

export interface UseImageManagerConfig {
  categoryConfig: ImageManagerConfig;
  imageDatabase: ImageDatabase;
  descriptions?: Record<string, string>;
}

/**
 * Hook para gestionar imágenes y productos por categoría
 * Reemplaza la lógica de BaseImageManager en React
 */
export function useImageManager({
  categoryConfig,
  imageDatabase,
  descriptions = {}
}: UseImageManagerConfig) {

  // Generar productos para una categoría
  const generateCategoryProducts = useCallback((category: string): Product[] => {
    const images = imageDatabase[category];
    
    if (!images || images.length === 0) {
      console.warn(`Category ${category} not found in imageDatabase`);
      return [];
    }

    const basePath = './assets/';
    const subPath = categoryConfig.subcategories?.[category] || '';
    const categoryPath = `${basePath}${subPath}`;

    const products = images.map((item, index) => {
      // Verificar si es un objeto con name e image, o solo un string (nombre de archivo)
      const isObject = typeof item === 'object' && item !== null;
      const imageItem = item as ImageItem;
      const stringItem = item as string;
      const filename = isObject ? imageItem.name : stringItem;
      const imageUrl = isObject ? imageItem.image : `${categoryPath}${stringItem}`;
      
      // Generar nombre si es string
      let productName: string;
      if (isObject) {
        productName = imageItem.name;
      } else {
        const match = filename.match(/(\d+)/);
        const number = match ? match[1] : '1';
        const categoryDisplayName = categoryConfig.categoryDisplayNames?.[category] || category;
        productName = `${categoryDisplayName} ${number}`;
      }

      // Generar descripción
      const defaultDesc = `${categoryConfig.categoryDisplayNames?.[category] || category} ${index + 1} - ${
        categoryConfig.defaultDescription || 'Producto de calidad premium'
      }`;
      const description = descriptions[filename] || defaultDesc;
      
      const product = {
        id: `${categoryConfig.name.toLowerCase().replace(/\s+/g, '-')}-${category}-${index + 1}`,
        name: productName,
        description: description,
        image: imageUrl,
        category: category,
        price: '',
        link: categoryConfig.link || '#'
      };

      return product;
    });

    return products;
  }, [imageDatabase, categoryConfig, descriptions]);

  // Obtener todos los productos
  const allProducts = useMemo(() => {
    return Object.keys(imageDatabase).reduce((acc, category) => {
      return [...acc, ...generateCategoryProducts(category)];
    }, [] as Product[]);
  }, [generateCategoryProducts, imageDatabase]);

  // Obtener categorías disponibles
  const availableCategories = useMemo(() => {
    return Object.keys(imageDatabase);
  }, [imageDatabase]);

  // Obtener estadísticas
  const productStats = useMemo((): ProductStats => {
    const stats: ProductStats = { total: 0, byCategory: {} };

    Object.entries(imageDatabase).forEach(([category, images]) => {
      const count = images.length;
      stats.byCategory[category] = count;
      stats.total += count;
    });

    return stats;
  }, [imageDatabase]);

  // Obtener productos por categoría
  const getProductsByCategory = useCallback((category: string): Product[] => {
    return generateCategoryProducts(category);
  }, [generateCategoryProducts]);

  return {
    allProducts,
    availableCategories,
    productStats,
    getProductsByCategory
  };
}