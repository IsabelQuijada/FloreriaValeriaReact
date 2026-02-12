import React from 'react';
import ProductCard from '../ProductCard/ProductCard';
import { useProductManager } from './useProductManager';
import type { Product, GlobalActions, ProductManagerOptions } from './useProductManager';
import styles from './ProductManager.module.css';

interface ProductManagerProps {
  products: Product[];
  globalActions?: GlobalActions;
  options?: ProductManagerOptions;
  showFilters?: boolean;
  showSearch?: boolean;
}

const ProductManager: React.FC<ProductManagerProps> = ({
  products,
  globalActions,
  options,
  showFilters = true,
  showSearch = true
}) => {
  const {
    filteredProducts,
    currentFilter,
    currentSearch,
    isLoading,
    applyFilter,
    applySearch,
    clearFilters,
    getCategories,
    createProductConfig,
    totalProducts,
    filteredCount,
    isEmpty
  } = useProductManager({ products, globalActions, options });

  const categories = getCategories();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    applySearch(e.target.value);
  };

  const handleFilterChange = (filter: string) => {
    applyFilter(filter);
  };

  return (
    <div className={styles.container}>
      {/* Controles de filtrado y búsqueda */}
      {(showFilters || showSearch) && (
        <div className={styles.controls}>
          {showSearch && (
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Buscar productos..."
                value={currentSearch}
                onChange={handleSearchChange}
                className={styles.searchInput}
              />
            </div>
          )}

          {showFilters && categories.length > 0 && (
            <div className={styles.filtersContainer}>
              <button
                onClick={() => handleFilterChange('all')}
                className={`${styles.filterButton} ${currentFilter === 'all' ? styles.active : ''}`}
              >
                Todos ({totalProducts})
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => handleFilterChange(category)}
                  className={`${styles.filterButton} ${currentFilter === category ? styles.active : ''}`}
                >
                  {category} ({products.filter(p => p.category === category).length})
                </button>
              ))}
            </div>
          )}

          {(currentFilter !== 'all' || currentSearch) && (
            <button onClick={clearFilters} className={styles.clearFilters}>
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Información de resultados */}
      <div className={styles.resultsInfo}>
        Mostrando {filteredCount} de {totalProducts} productos
      </div>

      {/* Grid de productos */}
      {isLoading ? (
        <div className={styles.loading}>Cargando productos...</div>
      ) : isEmpty ? (
        <div className={styles.emptyState}>
          <h3>No se encontraron productos</h3>
          <p>Intenta ajustar tus filtros de búsqueda</p>
        </div>
      ) : (
        <div className={styles.productGrid}>
          {filteredProducts.map((product) => {
            const productConfig = createProductConfig(product);
            return (
              <div key={product.id} className={styles.productItem}>
                <ProductCard
                  title={productConfig.name}
                  imageUrl={productConfig.image}
                  price={productConfig.price}
                  description={productConfig.description}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductManager;