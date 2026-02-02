import React from 'react';
import { useGallery } from './useGallery';
import type { GalleryProduct } from './useGallery';

interface GalleryProps {
  products: GalleryProduct[];
  initialFilter?: string;
}

const Gallery: React.FC<GalleryProps> = ({ products, initialFilter }) => {
  const {
    products: filteredProducts,
    currentFilter,
    setCurrentFilter,
    modalOpen,
    currentProductIndex,
    openModal,
    closeModal,
    navigatePrev,
    navigateNext,
    currentProduct,
  } = useGallery({ products, initialFilter });

  return (
    <div>
      {/* Filtros (ejemplo simple) */}
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => setCurrentFilter('all')}>Todos</button>
        {/* Agrega más filtros según categorías */}
      </div>

      {/* Lista de productos */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {filteredProducts.map((product, idx) => (
          <div key={product.id} style={{ cursor: 'pointer' }} onClick={() => openModal(idx)}>
            <img src={product.image} alt={product.name} style={{ width: 200, borderRadius: 8 }} />
            <h3>{product.name}</h3>
          </div>
        ))}
      </div>

      {/* Modal de producto */}
      {modalOpen && currentProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 12, minWidth: 320 }}>
            <img src={currentProduct.image} alt={currentProduct.name} style={{ width: '100%', borderRadius: 8 }} />
            <h2>{currentProduct.name}</h2>
            <p>{currentProduct.description}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
              <button onClick={navigatePrev} disabled={currentProductIndex === 0}>Anterior</button>
              <button onClick={navigateNext} disabled={currentProductIndex === filteredProducts.length - 1}>Siguiente</button>
              <button onClick={closeModal}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
