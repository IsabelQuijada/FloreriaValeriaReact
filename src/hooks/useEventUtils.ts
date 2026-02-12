import { useCallback, useEffect, useRef } from 'react';
import { useEventManager } from './useEventManager';

/**
 * Hook para manejar menú móvil toggle
 */
export function useMobileMenu(
  toggleSelector: string = '#menu-toggle',
  menuSelector: string = '#nav-menu'
) {
  const { addEventListener } = useEventManager();
  const listenerIdRef = useRef<string | null>(null);

  const setupMobileMenu = useCallback(() => {
    const listenerId = addEventListener(toggleSelector, 'click', (e: Event) => {
      const menu = document.querySelector(menuSelector);
      const toggle = e.target as HTMLElement;
      
      if (menu && toggle) {
        menu.classList.toggle('active');
        toggle.classList.toggle('active');
        document.body.classList.toggle('menu-open');
      }
    });
    
    listenerIdRef.current = listenerId;
    return listenerId;
  }, [addEventListener, toggleSelector, menuSelector]);

  const toggle = useCallback(() => {
    const menu = document.querySelector(menuSelector);
    const toggleButton = document.querySelector(toggleSelector);
    
    if (menu && toggleButton) {
      menu.classList.toggle('active');
      toggleButton.classList.toggle('active');
      document.body.classList.toggle('menu-open');
    }
  }, [menuSelector, toggleSelector]);

  const close = useCallback(() => {
    const menu = document.querySelector(menuSelector);
    const toggleButton = document.querySelector(toggleSelector);
    
    if (menu && toggleButton) {
      menu.classList.remove('active');
      toggleButton.classList.remove('active');
      document.body.classList.remove('menu-open');
    }
  }, [menuSelector, toggleSelector]);

  const open = useCallback(() => {
    const menu = document.querySelector(menuSelector);
    const toggleButton = document.querySelector(toggleSelector);
    
    if (menu && toggleButton) {
      menu.classList.add('active');
      toggleButton.classList.add('active');
      document.body.classList.add('menu-open');
    }
  }, [menuSelector, toggleSelector]);

  useEffect(() => {
    setupMobileMenu();
  }, [setupMobileMenu]);

  return {
    toggle,
    open,
    close,
    setupMobileMenu
  };
}

/**
 * Hook para scroll to top button
 */
export function useScrollToTop(buttonSelector: string = '#scroll-to-top') {
  const { addEventListener } = useEventManager();
  const listenerIdsRef = useRef<{ scroll: string | null, click: string | null }>({
    scroll: null,
    click: null
  });

  const setupScrollToTop = useCallback(() => {
    // Listener para mostrar/ocultar botón basado en scroll
    const scrollListener = addEventListener(
      window,
      'scroll',
      () => {
        const button = document.querySelector(buttonSelector);
        if (button) {
          button.classList.toggle('visible', window.pageYOffset > 300);
        }
      },
      { throttle: 100 }
    );

    // Listener para el click del botón
    const clickListener = addEventListener(
      buttonSelector,
      'click',
      () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    );

    listenerIdsRef.current = {
      scroll: scrollListener,
      click: clickListener
    };

    return { scrollListener, clickListener };
  }, [addEventListener, buttonSelector]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const scrollToElement = useCallback((element: Element | string, offset: number = 0) => {
    const targetElement = typeof element === 'string' 
      ? document.querySelector(element)
      : element;
      
    if (targetElement) {
      const elementTop = targetElement.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ 
        top: elementTop - offset, 
        behavior: 'smooth' 
      });
    }
  }, []);

  useEffect(() => {
    setupScrollToTop();
  }, [setupScrollToTop]);

  return {
    scrollToTop,
    scrollToElement,
    setupScrollToTop
  };
}

/**
 * Hook para manejo de modales con navegación por teclado
 */
export interface ModalHandlers {
  onClose?: (e: Event) => void;
  onPrev?: (e: Event) => void;
  onNext?: (e: Event) => void;
  onOpen?: (e: Event) => void;
}

export function useModal(
  modalSelector: string,
  closeSelector?: string,
  prevSelector?: string,
  nextSelector?: string
) {
  const { addEventListener } = useEventManager();
  const listenerIdsRef = useRef<string[]>([]);

  const setupModal = useCallback((handlers: ModalHandlers) => {
    const modalElement = document.querySelector(modalSelector);
    if (!modalElement) return [];

    const listeners: string[] = [];

    // Close modal
    if (closeSelector && handlers.onClose) {
      const listenerId = addEventListener(closeSelector, 'click', handlers.onClose);
      if (listenerId) listeners.push(listenerId);
    }

    // Navigation
    if (prevSelector && handlers.onPrev) {
      const listenerId = addEventListener(prevSelector, 'click', handlers.onPrev);
      if (listenerId) listeners.push(listenerId);
    }

    if (nextSelector && handlers.onNext) {
      const listenerId = addEventListener(nextSelector, 'click', handlers.onNext);
      if (listenerId) listeners.push(listenerId);
    }

    // Click outside to close
    if (handlers.onClose) {
      const listenerId = addEventListener(modalElement, 'click', (e: Event) => {
        if (e.target === modalElement) {
          handlers.onClose!(e);
        }
      });
      if (listenerId) listeners.push(listenerId);
    }

    // Keyboard navigation
    const keyboardListener = addEventListener(document, 'keydown', (e: Event) => {
      if (!modalElement.classList.contains('active')) return;

      switch ((e as KeyboardEvent).key) {
        case 'Escape':
          handlers.onClose && handlers.onClose(e);
          break;
        case 'ArrowLeft':
          handlers.onPrev && handlers.onPrev(e);
          break;
        case 'ArrowRight':
          handlers.onNext && handlers.onNext(e);
          break;
      }
    });
    
    if (keyboardListener) listeners.push(keyboardListener);
    listenerIdsRef.current = listeners;
    
    return listeners;
  }, [addEventListener, modalSelector, closeSelector, prevSelector, nextSelector]);

  const openModal = useCallback(() => {
    const modalElement = document.querySelector(modalSelector);
    if (modalElement) {
      modalElement.classList.add('active');
      document.body.classList.add('modal-open');
    }
  }, [modalSelector]);

  const closeModal = useCallback(() => {
    const modalElement = document.querySelector(modalSelector);
    if (modalElement) {
      modalElement.classList.remove('active');
      document.body.classList.remove('modal-open');
    }
  }, [modalSelector]);

  const isOpen = useCallback((): boolean => {
    const modalElement = document.querySelector(modalSelector);
    return modalElement?.classList.contains('active') ?? false;
  }, [modalSelector]);

  return {
    setupModal,
    openModal,
    closeModal,
    isOpen
  };
}

/**
 * Hook para manejo de resize con throttle
 */
export function useWindowResize(callback: (e: Event) => void, throttleMs: number = 100) {
  const { addEventListener } = useEventManager();

  useEffect(() => {
    addEventListener(window, 'resize', callback, { throttle: throttleMs });
    return () => {
      // El cleanup se maneja automáticamente por useEventManager
    };
  }, [addEventListener, callback, throttleMs]);
}

/**
 * Hook para outside click detection
 */
export function useOutsideClick(
  ref: React.RefObject<HTMLElement | null>,
  callback: (e: Event) => void
) {
  const { addEventListener } = useEventManager();

  useEffect(() => {
    const handleClick = (e: Event) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        callback(e);
      }
    };

    addEventListener(document, 'mousedown', handleClick);
    return () => {
      // El cleanup se maneja automáticamente por useEventManager
    };
  }, [addEventListener, ref, callback]);
}