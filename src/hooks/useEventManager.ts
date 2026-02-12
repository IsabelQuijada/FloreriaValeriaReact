import { useCallback, useRef, useEffect } from 'react';

export interface EventOptions {
  debounce?: number;
  throttle?: number;
  once?: boolean;
  passive?: boolean;
  capture?: boolean;
}

type EventHandler = (event: Event) => void;

export interface RegisteredEventListener {
  id: string;
  element: Element | Window | Document;
  eventType: string;
  handler: EventHandler;
  originalHandler: EventHandler;
  cleanup: () => void;
}

export interface DelegatedEventListener {
  id: string;
  container: Element;
  childSelector: string;
  eventType: string;
  handler: EventHandler;
  originalHandler: EventHandler;
  cleanup: () => void;
}

interface EventManagerState {
  listeners: Map<string, RegisteredEventListener>;
  delegatedListeners: Map<string, DelegatedEventListener>;
  debounceTimers: Map<string, number>;
  throttleLastExecution: Map<string, number>;
}

/**
 * Hook para manejo centralizado de eventos con auto-cleanup
 * Reemplaza la clase EventManager con API React-friendly
 */
export function useEventManager() {
  const stateRef = useRef<EventManagerState>({
    listeners: new Map(),
    delegatedListeners: new Map(),
    debounceTimers: new Map(),
    throttleLastExecution: new Map(),
  });

  // Generar ID único para listeners
  const generateListenerId = useCallback((): string => {
    return `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Obtener elemento del DOM
  const getElement = useCallback((elementOrSelector: Element | Window | Document | string): Element | Window | Document | null => {
    if (typeof elementOrSelector === 'string') {
      if (elementOrSelector === 'window') return window;
      if (elementOrSelector === 'document') return document;
      
      return elementOrSelector.startsWith('#') 
        ? document.getElementById(elementOrSelector.slice(1))
        : document.querySelector(elementOrSelector);
    }
    return elementOrSelector;
  }, []);

  // Crear debounced function
  const createDebounced = useCallback((func: EventHandler, wait: number, key: string): EventHandler => {
    return (...args: unknown[]) => {
      const timers = stateRef.current.debounceTimers;
      const existingTimer = timers.get(key);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }
      
      const timer = window.setTimeout(() => {
        func(...(args as [Event]));
        timers.delete(key);
      }, wait);
      
      timers.set(key, timer);
    };
  }, []);

  // Crear throttled function
  const createThrottled = useCallback((func: EventHandler, limit: number, key: string): EventHandler => {
    return (...args: unknown[]) => {
      const executions = stateRef.current.throttleLastExecution;
      const lastExecution = executions.get(key) || 0;
      const now = Date.now();
      
      if (now - lastExecution >= limit) {
        executions.set(key, now);
        func(...(args as [Event]));
      }
    };
  }, []);

  // Remover event listener (declarado antes para evitar problema de orden)
  const removeEventListener = useCallback((listenerId: string): boolean => {
    const listener = stateRef.current.listeners.get(listenerId);
    if (listener) {
      listener.cleanup();
      stateRef.current.listeners.delete(listenerId);
      return true;
    }

    const delegatedListener = stateRef.current.delegatedListeners.get(listenerId);
    if (delegatedListener) {
      delegatedListener.cleanup();
      stateRef.current.delegatedListeners.delete(listenerId);
      return true;
    }

    return false;
  }, []);

  // Añadir event listener
  const addEventListener = useCallback((
    elementOrSelector: Element | Window | Document | string,
    eventType: string,
    handler: EventHandler,
    options: EventOptions = {}
  ): string | null => {
    const element = getElement(elementOrSelector);
    if (!element) {
      console.warn(`Element not found: ${elementOrSelector}`);
      return null;
    }

    const listenerId = generateListenerId();
    
    // Aplicar decorators
    let finalHandler = handler;
    
    if (options.debounce) {
      finalHandler = createDebounced(handler, options.debounce, `${listenerId}-debounce`);
    }
    
    if (options.throttle) {
      finalHandler = createThrottled(handler, options.throttle, `${listenerId}-throttle`);
    }
    
    if (options.once) {
      const originalHandler = finalHandler;
      finalHandler = (event: Event) => {
        originalHandler(event);
        removeEventListener(listenerId);
      };
    }

    // Opciones nativas del DOM
    const nativeOptions = {
      passive: options.passive,
      capture: options.capture,
      once: options.once
    };

    element.addEventListener(eventType, finalHandler, nativeOptions);
    
    // Cleanup function
    const cleanup = () => {
      element.removeEventListener(eventType, finalHandler, nativeOptions);
      
      // Limpiar timers de debounce si existen
      const debounceKey = `${listenerId}-debounce`;
      const timer = stateRef.current.debounceTimers.get(debounceKey);
      if (timer) {
        clearTimeout(timer);
        stateRef.current.debounceTimers.delete(debounceKey);
      }
      
      // Limpiar throttle execution
      const throttleKey = `${listenerId}-throttle`;
      stateRef.current.throttleLastExecution.delete(throttleKey);
    };

    // Almacenar listener para cleanup
    stateRef.current.listeners.set(listenerId, {
      id: listenerId,
      element,
      eventType,
      handler: finalHandler,
      originalHandler: handler,
      cleanup
    });

    return listenerId;
  }, [getElement, generateListenerId, createDebounced, createThrottled, removeEventListener]);

  // Event delegation
  const addDelegatedEventListener = useCallback((
    containerOrSelector: Element | string,
    childSelector: string,
    eventType: string,
    handler: EventHandler
  ): string | null => {
    const container = getElement(containerOrSelector) as Element;
    if (!container) {
      console.warn(`Container not found: ${containerOrSelector}`);
      return null;
    }

    const listenerId = generateListenerId();
    
    const delegatedHandler: EventHandler = (event: Event) => {
      const target = (event.target as Element).closest(childSelector);
      if (target && container.contains(target)) {
        // Call the handler with proper context
        const boundHandler = handler.bind(target);
        boundHandler(event);
      }
    };

    container.addEventListener(eventType, delegatedHandler);
    
    const cleanup = () => {
      container.removeEventListener(eventType, delegatedHandler);
    };

    stateRef.current.delegatedListeners.set(listenerId, {
      id: listenerId,
      container,
      childSelector,
      eventType,
      handler: delegatedHandler,
      originalHandler: handler,
      cleanup
    });

    return listenerId;
  }, [getElement, generateListenerId]);

  // Remover event listener (ya declarado anteriormente)
  // const removeEventListener = ... (ya definido arriba)

  // Cleanup completo
  const cleanup = useCallback(() => {
    // Limpiar listeners regulares
    stateRef.current.listeners.forEach(listener => listener.cleanup());
    stateRef.current.listeners.clear();

    // Limpiar listeners delegados
    stateRef.current.delegatedListeners.forEach(listener => listener.cleanup());
    stateRef.current.delegatedListeners.clear();

    // Limpiar timers
    stateRef.current.debounceTimers.forEach(timer => clearTimeout(timer));
    stateRef.current.debounceTimers.clear();

    // Limpiar throttle executions
    stateRef.current.throttleLastExecution.clear();
  }, []);

  // Estadísticas
  const getStats = useCallback(() => {
    return {
      regularListeners: stateRef.current.listeners.size,
      delegatedListeners: stateRef.current.delegatedListeners.size,
      debounceTimers: stateRef.current.debounceTimers.size,
      totalListeners: stateRef.current.listeners.size + stateRef.current.delegatedListeners.size
    };
  }, []);

  // Auto cleanup en unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    addEventListener,
    addDelegatedEventListener,
    removeEventListener,
    cleanup,
    getStats
  };
}