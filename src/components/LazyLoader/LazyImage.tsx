import React, { useEffect } from 'react';
import type { HTMLAttributes } from 'react';
import { useLazyLoader } from './useLazyLoader';

export interface LazyImageProps extends Omit<HTMLAttributes<HTMLImageElement>, 'onError' | 'onLoad'> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  placeholder?: string;
  timeout?: number;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  onLoad?: (src: string) => void;
  onImageError?: (error: string) => void;
}

/**
 * Componente de imagen con lazy loading
 */
const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  fallbackSrc,
  placeholder,
  timeout,
  loadingComponent,
  errorComponent,
  onLoad,
  onImageError,
  className = '',
  style,
  ...restProps
}) => {
  const { imgRef, imageState, reload } = useLazyLoader({
    fallbackSrc,
    placeholder,
    timeout,
    onLoad,
    onError: onImageError,
  });

  // Inicializar carga cuando se monta el componente
  useEffect(() => {
    if (src && imgRef.current) {
      imgRef.current.dataset.src = src;
    }
  }, [src]);

  // Configurar src para mostrar
  const displaySrc = imageState.src || placeholder || src;

  const imageClasses = [
    className,
    imageState.isLoading ? 'lazy-loading' : '',
    imageState.isLoaded ? 'lazy-loaded' : '',
    imageState.hasError ? 'lazy-error' : ''
  ].filter(Boolean).join(' ');

  // Renderizado condicional
  if (imageState.isLoading && loadingComponent) {
    return <div className={`lazy-loading-wrapper ${className}`}>{loadingComponent}</div>;
  }

  if (imageState.hasError && errorComponent) {
    return (
      <div className={`lazy-error-wrapper ${className}`} onClick={reload}>
        {errorComponent}
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={displaySrc}
      alt={alt}
      className={imageClasses}
      style={style}
      data-src={src}
      loading="lazy"
      {...restProps}
    />
  );
};

export default LazyImage;