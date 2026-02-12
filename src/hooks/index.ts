// Event Management Hooks
export { useEventManager } from './useEventManager';
export type { EventOptions, RegisteredEventListener, DelegatedEventListener } from './useEventManager';

export { 
  useMobileMenu,
  useScrollToTop,
  useModal,
  useWindowResize,
  useOutsideClick
} from './useEventUtils';
export type { ModalHandlers } from './useEventUtils';