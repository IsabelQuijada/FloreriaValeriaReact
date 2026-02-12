import { useState, useCallback, useEffect } from 'react';

export interface Product {
  id: string;
  name: string;
  image: string;
  description?: string;
  category?: string;
  price?: string;
  actions?: ProductActions;
}

export interface ProductActions {
  onQuickView?: (product: Product, manager?: any) => void;
  onAddToCart?: (product: Product, manager?: any) => void;
  onContact?: (product: Product, manager?: any) => void;
}

export interface GlobalActions {
  onQuickView?: (product: Product, manager?: any) => void;
  onAddToCart?: (product: Product, manager?: any) => void;
  onContact?: (product: Product, manager?: any) => void;
}

export interface ProductManagerOptions {
  enableLazyLoading?: boolean;
  animationDelay?: number;
  gridColumns?: string;
}

export interface UseProductManagerConfig {
  products: Product[];
  globalActions?: GlobalActions;
  options?: ProductManagerOptions;
}

export function useProductManager({ 
  products, 
  globalActions = {}, 
  options = {}
}: UseProductManagerConfig) {
  const [currentFilter, setCurrentFilter] = useState<string>('all');
  const [currentSearch, setCurrentSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const defaultOptions: ProductManagerOptions = {
    enableLazyLoading: true,
    animationDelay: 100,
    gridColumns: 'auto',
    ...options
  };

  // Obtener productos filtrados
  const getFilteredProducts = useCallback(() => {
    let filtered = [...products];

    // Filtrar por categoría
    if (currentFilter && currentFilter !== 'all') {
      filtered = filtered.filter(product => 
        product.category === currentFilter
      );
    }

    // Filtrar por búsqueda
    if (currentSearch) {
      const searchTerm = currentSearch.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description?.toLowerCase().includes(searchTerm) ||
        product.category?.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  }, [products, currentFilter, currentSearch]);

  const filteredProducts = getFilteredProducts();

  // Crear configuración de producto con acciones globales
  const createProductConfig = useCallback((product: Product) => {
    return {
      ...product,
      actions: {
        ...globalActions,
        ...product.actions,
        onQuickView: (config: Product, element?: any) => {
          globalActions.onQuickView?.(config, element);
          product.actions?.onQuickView?.(config, element);
        },
        onAddToCart: (config: Product, element?: any) => {
          globalActions.onAddToCart?.(config, element);
          product.actions?.onAddToCart?.(config, element);
        },
        onContact: (config: Product, element?: any) => {
          globalActions.onContact?.(config, element);
          product.actions?.onContact?.(config, element);
        }
      }
    };
  }, [globalActions]);

  // Aplicar filtro
  const applyFilter = useCallback((filter: string) => {
    setCurrentFilter(filter);
  }, []);

  // Aplicar búsqueda
  const applySearch = useCallback((searchTerm: string) => {
    setCurrentSearch(searchTerm);
  }, []);

  // Limpiar filtros
  const clearFilters = useCallback(() => {
    setCurrentFilter('all');
    setCurrentSearch('');
  }, []);

  // Obtener todas las categorías únicas
  const getCategories = useCallback(() => {
    const categories = new Set(products.map(p => p.category).filter(Boolean));
    return Array.from(categories);
  }, [products]);

  return {
    // Estado
    filteredProducts,
    currentFilter,
    currentSearch,
    isLoading,
    options: defaultOptions,

    // Métodos
    applyFilter,
    applySearch,
    clearFilters,
    getCategories,
    createProductConfig,

    // Estadísticas
    totalProducts: products.length,
    filteredCount: filteredProducts.length,
    isEmpty: filteredProducts.length === 0
  };
}