import React, { useEffect, useRef } from 'react';
import { useLazyLoaderObserver, type LazyLoaderConfig } from './useLazyLoader';

export interface LazyLoaderProps extends LazyLoaderConfig {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Componente LazyLoader que observa múltiples imágenes en sus hijos
 * Reemplazo de la clase LazyLoader original
 */
const LazyLoader: React.FC<LazyLoaderProps> = ({
  children,
  className = '',
  style,
  ...config
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { observeElement } = useLazyLoaderObserver(config);

  // Observar imágenes dinámicamente cuando se agregan al DOM
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            
            // Buscar imágenes con data-src en el elemento agregado
            const lazyImages = element.querySelectorAll('img[data-src]:not(.lazy-observed)');
            lazyImages.forEach((img) => {
              img.classList.add('lazy-observed');
              observeElement(img as HTMLImageElement);
            });

            // También verificar si el elemento mismo es una imagen lazy
            if (element.tagName === 'IMG' && 
                element.hasAttribute('data-src') && 
                !element.classList.contains('lazy-observed')) {
              element.classList.add('lazy-observed');
              observeElement(element as HTMLImageElement);
            }
          }
        });
      });
    });

    // Observar cambios en el contenedor
    observer.observe(containerRef.current, {
      childList: true,
      subtree: true
    });

    // Observar imágenes existentes
    const existingLazyImages = containerRef.current.querySelectorAll('img[data-src]:not(.lazy-observed)');
    existingLazyImages.forEach((img) => {
      img.classList.add('lazy-observed');
      observeElement(img as HTMLImageElement);
    });

    return () => {
      observer.disconnect();
    };
  }, [observeElement]);

  return (
    <div ref={containerRef} className={className} style={style}>
      {children}
    </div>
  );
};

export default LazyLoader;