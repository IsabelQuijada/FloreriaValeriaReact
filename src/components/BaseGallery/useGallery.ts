import { useState, useCallback } from 'react';

export type GalleryProduct = {
  id: string;
  name: string;
  image: string;
  description?: string;
  category?: string;
};

export interface UseGalleryConfig {
  products: GalleryProduct[];
  initialFilter?: string;
}

export function useGallery({ products, initialFilter = 'all' }: UseGalleryConfig) {
  const [currentFilter, setCurrentFilter] = useState(initialFilter);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentProductIndex, setCurrentProductIndex] = useState<number | null>(null);

  const filteredProducts = currentFilter === 'all'
    ? products
    : products.filter(p => p.category === currentFilter);

  const openModal = useCallback((index: number) => {
    setCurrentProductIndex(index);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setCurrentProductIndex(null);
  }, []);

  const navigatePrev = useCallback(() => {
    if (currentProductIndex !== null && currentProductIndex > 0) {
      setCurrentProductIndex(currentProductIndex - 1);
    }
  }, [currentProductIndex]);

  const navigateNext = useCallback(() => {
    if (
      currentProductIndex !== null &&
      currentProductIndex < filteredProducts.length - 1
    ) {
      setCurrentProductIndex(currentProductIndex + 1);
    }
  }, [currentProductIndex, filteredProducts.length]);

  return {
    products: filteredProducts,
    currentFilter,
    setCurrentFilter,
    modalOpen,
    currentProductIndex,
    openModal,
    closeModal,
    navigatePrev,
    navigateNext,
    currentProduct: currentProductIndex !== null ? filteredProducts[currentProductIndex] : null,
  };
}
