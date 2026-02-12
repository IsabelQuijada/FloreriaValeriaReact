import { useMemo } from 'react';

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
  [category: string]: string[];
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

  // Generar nombre del producto
  const generateProductName = (filename: string, category: string): string => {
    const match = filename.match(/(\d+)/);
    const number = match ? match[1] : '1';
    const categoryDisplayName = categoryConfig.categoryDisplayNames?.[category] || category;
    
    return `${categoryDisplayName} ${number}`;
  };

  // Obtener descripción por defecto
  const getDefaultDescription = (category: string, index: number): string => {
    return `${categoryConfig.categoryDisplayNames?.[category] || category} ${index} - ${
      categoryConfig.defaultDescription || 'Producto de calidad premium'
    }`;
  };

  // Obtener ruta de categoría
  const getCategoryPath = (category: string): string => {
    const basePath = './assets/';
    const subPath = categoryConfig.subcategories?.[category] || '';
    return `${basePath}${subPath}`;
  };

  // Generar productos para una categoría
  const generateCategoryProducts = (category: string): Product[] => {
    const images = imageDatabase[category];
    
    if (!images || images.length === 0) {
      console.warn(`Category ${category} not found in imageDatabase`);
      return [];
    }

    const basePath = getCategoryPath(category);

    return images.map((filename, index) => ({
      id: `${categoryConfig.name.toLowerCase().replace(/\s+/g, '-')}-${category}-${index + 1}`,
      name: generateProductName(filename, category),
      description: descriptions[filename] || getDefaultDescription(category, index + 1),
      image: `${basePath}${filename}`,
      category: category,
      price: '',
      link: categoryConfig.link || '#'
    }));
  };

  // Obtener todos los productos
  const allProducts = useMemo(() => {
    return Object.keys(imageDatabase).reduce((acc, category) => {
      return [...acc, ...generateCategoryProducts(category)];
    }, [] as Product[]);
  }, [imageDatabase, categoryConfig, descriptions]);

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
  const getProductsByCategory = (category: string): Product[] => {
    return generateCategoryProducts(category);
  };

  return {
    allProducts,
    availableCategories,
    productStats,
    getProductsByCategory,
    getCategoryPath,
    generateProductName,
    getDefaultDescription
  };
}