import React from 'react';
import { useImageManager } from './useImageManager';
import type { ImageManagerConfig, ImageDatabase, Product } from './useImageManager';

interface ImageManagerProps {
  categoryConfig: ImageManagerConfig;
  imageDatabase: ImageDatabase;
  descriptions?: Record<string, string>;
  renderProduct?: (product: Product) => React.ReactNode;
}

/**
 * Componente para gestionar y mostrar imágenes organizadas por categoría
 */
const ImageManager: React.FC<ImageManagerProps> = ({
  categoryConfig,
  imageDatabase,
  descriptions,
  renderProduct
}) => {
  const {
    allProducts,
    availableCategories,
    productStats,
    getProductsByCategory
  } = useImageManager({
    categoryConfig,
    imageDatabase,
    descriptions
  });

  // Renderizado por defecto para productos
  const defaultRender = (product: Product) => (
    <div key={product.id} style={{ 
      border: '1px solid #ddd', 
      borderRadius: '8px', 
      padding: '1rem',
      textAlign: 'center'
    }}>
      <img 
        src={product.image} 
        alt={product.name}
        style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '6px' }}
      />
      <h3 style={{ marginTop: '0.5rem' }}>{product.name}</h3>
      <p style={{ fontSize: '0.9rem', color: '#666' }}>{product.description}</p>
    </div>
  );

  return (
    <div>
      {/* Estadísticas */}
      <div style={{ 
        marginBottom: '2rem', 
        padding: '1rem', 
        background: '#f8f9fa', 
        borderRadius: '8px' 
      }}>
        <h3>Estadísticas</h3>
        <p><strong>Total de productos:</strong> {productStats.total}</p>
        <div>
          <strong>Por categoría:</strong>
          <ul style={{ marginTop: '0.5rem' }}>
            {Object.entries(productStats.byCategory).map(([category, count]) => (
              <li key={category}>
                {category}: {count} productos
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Productos por categoría */}
      {availableCategories.map(category => {
        const products = getProductsByCategory(category);
        
        return (
          <div key={category} style={{ marginBottom: '3rem' }}>
            <h2>{categoryConfig.categoryDisplayNames?.[category] || category}</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '1.5rem',
              marginTop: '1rem'
            }}>
              {products.map(product => 
                renderProduct ? renderProduct(product) : defaultRender(product)
              )}
            </div>
          </div>
        );
      })}

      {/* Mensaje vacío */}
      {allProducts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          <p>No hay imágenes disponibles</p>
        </div>
      )}
    </div>
  );
};

export default ImageManager;