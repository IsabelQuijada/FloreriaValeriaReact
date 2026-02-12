import { useState, useRef, useCallback, useEffect } from 'react';

export interface UseLazyLoaderConfig {
  fallbackSrc?: string;
  placeholder?: string;
  timeout?: number;
  generatePlaceholder?: (src: string) => string;
  onLoad?: (src: string) => void;
  onError?: (error: string) => void;
}

export interface LazyLoaderConfig {
  rootMargin?: string;
  threshold?: number;
  timeout?: number;
}

interface ImageState {
  isLoading: boolean;
  isLoaded: boolean;
  hasError: boolean;
  error?: string;
  src?: string;
}

// Hook para lazy loading de una sola imagen
export function useLazyLoader({
  fallbackSrc,
  placeholder,
  timeout = 10000,
  onLoad,
  onError,
}: UseLazyLoaderConfig = {}) {
  const [imageState, setImageState] = useState<ImageState>({
    isLoading: false,
    isLoaded: false,
    hasError: false,
  });
  
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const fallbackTriedRef = useRef(false);

  // Generar placeholder SVG por defecto
  const generatePlaceholder = useCallback(() => {
    return placeholder || `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"%3E%3Crect width="400" height="400" fill="%23f0f0f0"/%3E%3Ctext x="200" y="200" text-anchor="middle" fill="%23999" font-family="Arial" font-size="16"%3EImagen no disponible%3C/text%3E%3C/svg%3E`;
  }, [placeholder]);

  // Cargar imagen - función principal
  const loadImage = useCallback((imageSrc: string) => {
    if (imageState.isLoading || imageState.isLoaded) {
      return;
    }

    setImageState(prev => ({ ...prev, isLoading: true, hasError: false }));

    const imageLoader = new Image();
    
    // Configurar timeout
    timeoutRef.current = window.setTimeout(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setImageState(prev => ({
        ...prev,
        isLoading: false,
        hasError: true,
        error: 'Timeout de carga',
        src: generatePlaceholder()
      }));
      onError?.('Timeout de carga');
    }, timeout);

    imageLoader.onload = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setImageState({
        isLoading: false,
        isLoaded: true,
        hasError: false,
        src: imageSrc
      });
      onLoad?.(imageSrc);
    };

    imageLoader.onerror = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Intentar fallback si está disponible
      if (fallbackSrc && !fallbackTriedRef.current) {
        fallbackTriedRef.current = true;
        // Usar requestAnimationFrame para evitar recursión inmediata
        requestAnimationFrame(() => {
          // Llamada recursiva segura usando el mismo callback
          const fallbackLoader = new Image();
          
          fallbackLoader.onload = () => {
            setImageState({
              isLoading: false,
              isLoaded: true,
              hasError: false,
              src: fallbackSrc
            });
            onLoad?.(fallbackSrc);
          };
          
          fallbackLoader.onerror = () => {
            setImageState({
              isLoading: false,
              isLoaded: false,
              hasError: true,
              error: 'Error de carga de imagen',
              src: generatePlaceholder()
            });
            onError?.('Error de carga de imagen');
          };
          
          fallbackLoader.src = fallbackSrc;
        });
        return;
      }

      // Usar placeholder como última opción
      setImageState({
        isLoading: false,
        isLoaded: false,
        hasError: true,
        error: 'Error de carga de imagen',
        src: generatePlaceholder()
      });
      onError?.('Error de carga de imagen');
    };

    imageLoader.src = imageSrc;
  }, [imageState.isLoading, imageState.isLoaded, timeout, fallbackSrc, generatePlaceholder, onLoad, onError]);

  // Configurar Intersection Observer
  useEffect(() => {
    if (!imgRef.current) return;

    const supportsIntersectionObserver = 'IntersectionObserver' in window;

    if (supportsIntersectionObserver) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              const src = img.dataset.src;
              
              if (src && !imageState.isLoaded && !imageState.isLoading) {
                loadImage(src);
                observerRef.current?.unobserve(img);
              }
            }
          });
        },
        {
          rootMargin: '50px',
          threshold: 0.1,
        }
      );

      if (imgRef.current) {
        observerRef.current.observe(imgRef.current);
      }
    } else {
      // Fallback para navegadores sin IntersectionObserver
      const img = imgRef.current;
      const src = img.dataset.src;
      if (src && !imageState.isLoaded && !imageState.isLoading) {
        loadImage(src);
      }
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadImage, imageState.isLoaded, imageState.isLoading]);

  // Cleanup en unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Método para recargar imagen
  const reload = useCallback(() => {
    // Reset del estado de fallback
    fallbackTriedRef.current = false;
    setImageState({
      isLoading: false,
      isLoaded: false,
      hasError: false,
    });
  }, []);

  return {
    imgRef,
    loadImage,
    imageState,
    reload,
    ...imageState,
  };
}

// Hook para observar múltiples imágenes lazy
export function useLazyLoaderObserver({
  rootMargin = '50px',
  threshold = 0.1,
  timeout = 10000,
}: LazyLoaderConfig = {}) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const mutationObserverRef = useRef<MutationObserver | null>(null);
  const loadedImages = useRef(new Set<string>());

  // Cargar elemento de imagen específico
  const loadImageElement = useCallback((img: HTMLImageElement, src: string, timeoutMs: number) => {
    img.classList.add('lazy-loading');
    
    const imageLoader = new Image();
    const timeoutId = setTimeout(() => {
      img.classList.remove('lazy-loading');
      img.classList.add('lazy-error');
      img.src = `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"%3E%3Crect width="400" height="400" fill="%23f0f0f0"/%3E%3Ctext x="200" y="200" text-anchor="middle" fill="%23999" font-family="Arial" font-size="16"%3EImagen no disponible%3C/text%3E%3C/svg%3E`;
    }, timeoutMs);

    imageLoader.onload = () => {
      clearTimeout(timeoutId);
      img.classList.remove('lazy-loading');
      img.classList.add('lazy-loaded');
      img.src = src;
      loadedImages.current.add(src);
    };

    imageLoader.onerror = () => {
      clearTimeout(timeoutId);
      img.classList.remove('lazy-loading');
      img.classList.add('lazy-error');
      img.src = `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"%3E%3Crect width="400" height="400" fill="%23f0f0f0"/%3E%3Ctext x="200" y="200" text-anchor="middle" fill="%23999" font-family="Arial" font-size="16"%3EImagen no disponible%3C/text%3E%3C/svg%3E`;
    };

    imageLoader.src = src;
  }, []);

  // Inicializar observer
  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.src;
            
            if (src && !loadedImages.current.has(src)) {
              loadImageElement(img, src, timeout);
              observerRef.current?.unobserve(img);
            }
          }
        });
      },
      { rootMargin, threshold }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [rootMargin, threshold, timeout, loadImageElement]);

  // Función para observar un elemento
  const observeElement = useCallback((element: HTMLImageElement) => {
    if (observerRef.current && element.dataset.src) {
      observerRef.current.observe(element);
    }
  }, []);

  // Función para observar múltiples elementos
  const observeElements = useCallback((elements: HTMLImageElement[]) => {
    elements.forEach((element) => observeElement(element));
  }, [observeElement]);

  // Función para observar dinámicamente nuevas imágenes
  const observeNewImages = useCallback((container: HTMLElement) => {
    if (!container) return;

    // Observar imágenes existentes
    const lazyImages = container.querySelectorAll('img[data-src]') as NodeListOf<HTMLImageElement>;
    observeElements(Array.from(lazyImages));

    // Configurar MutationObserver para nuevas imágenes
    mutationObserverRef.current = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            
            // Observar si el elemento es una imagen lazy
            if (element.tagName === 'IMG' && element.dataset.src) {
              observeElement(element as HTMLImageElement);
            }
            
            // Observar imágenes lazy dentro del elemento
            const nestedLazyImages = element.querySelectorAll?.('img[data-src]');
            if (nestedLazyImages) {
              observeElements(Array.from(nestedLazyImages) as HTMLImageElement[]);
            }
          }
        });
      });
    });

    mutationObserverRef.current.observe(container, {
      childList: true,
      subtree: true,
    });

    return () => {
      if (mutationObserverRef.current) {
        mutationObserverRef.current.disconnect();
      }
    };
  }, [observeElement, observeElements]);

  return {
    observeElement,
    observeElements,
    observeNewImages,
  };
}