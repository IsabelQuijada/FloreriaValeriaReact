import React, { useRef, useState, useCallback } from 'react';
import { 
  useEventManager, 
  useMobileMenu, 
  useScrollToTop, 
  useModal, 
  useOutsideClick,
  useWindowResize 
} from '../hooks';
import './EventManagerDemo.css';

interface EventManagerDemoProps {
  className?: string;
}

const EventManagerDemo: React.FC<EventManagerDemoProps> = ({ className = '' }) => {
  const [stats, setStats] = useState({ regularListeners: 0, delegatedListeners: 0, totalListeners: 0 });
  const [log, setLog] = useState<string[]>([]);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Refs para elementos
  const outsideRef = useRef<HTMLDivElement>(null);
  const clickCounterRef = useRef(0);

  // Hooks
  const { addEventListener, addDelegatedEventListener, getStats, cleanup } = useEventManager();
  const { open: openMenu, close: closeMenu } = useMobileMenu('#demo-menu-toggle', '#demo-nav-menu');
  const { scrollToTop, scrollToElement } = useScrollToTop('#demo-scroll-btn');
  const { setupModal, openModal, closeModal } = useModal('#demo-modal', '#demo-close-modal');

  // Log helper
  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLog(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  }, []);

  // Update stats
  const updateStats = useCallback(() => {
    setStats(getStats());
  }, [getStats]);

  // Window resize handler
  useWindowResize(useCallback(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    addLog(`Ventana redimensionada: ${window.innerWidth}x${window.innerHeight}`);
  }, [addLog]), 300);

  // Outside click detection
  useOutsideClick(outsideRef, useCallback(() => {
    addLog('Click fuera del área marcada');
  }, [addLog]));

  // Event handlers
  const handleBasicClick = useCallback(() => {
    clickCounterRef.current++;
    addLog(`Click básico #${clickCounterRef.current}`);
    updateStats();
  }, [addLog, updateStats]);

  const handleDebouncedClick = useCallback(() => {
    addLog('Click con debounce (500ms)');
  }, [addLog]);

  const handleThrottledClick = useCallback(() => {
    addLog('Click con throttle (1000ms)');
  }, [addLog]);

  // Add listeners
  const addBasicListener = useCallback(() => {
    const listenerId = addEventListener('#demo-basic-btn', 'click', handleBasicClick);
    addLog(`Listener básico añadido: ${listenerId}`);
    updateStats();
  }, [addEventListener, handleBasicClick, addLog, updateStats]);

  const addDebouncedListener = useCallback(() => {
    const listenerId = addEventListener('#demo-debounce-btn', 'click', handleDebouncedClick, { debounce: 500 });
    addLog(`Listener con debounce añadido: ${listenerId}`);
    updateStats();
  }, [addEventListener, handleDebouncedClick, addLog, updateStats]);

  const addThrottledListener = useCallback(() => {
    const listenerId = addEventListener('#demo-throttle-btn', 'click', handleThrottledClick, { throttle: 1000 });
    addLog(`Listener con throttle añadido: ${listenerId}`);
    updateStats();
  }, [addEventListener, handleThrottledClick, addLog, updateStats]);

  const addDelegatedListener = useCallback(() => {
    const listenerId = addDelegatedEventListener('#demo-delegation-container', '.delegated-btn', 'click', (e: Event) => {
      const target = e.target as HTMLButtonElement;
      addLog(`Click delegado en: ${target.textContent}`);
    });
    addLog(`Listener delegado añadido: ${listenerId}`);
    updateStats();
  }, [addDelegatedEventListener, addLog, updateStats]);

  // Modal setup
  React.useEffect(() => {
    setupModal({
      onClose: () => {
        closeModal();
        addLog('Modal cerrado');
      },
      onPrev: () => addLog('Modal: Anterior'),
      onNext: () => addLog('Modal: Siguiente')
    });
  }, [setupModal, closeModal, addLog]);

  const openDemoModal = useCallback(() => {
    openModal();
    addLog('Modal abierto');
  }, [openModal, addLog]);

  // Cleanup all
  const cleanupAll = useCallback(() => {
    cleanup();
    addLog('Todos los listeners limpiados');
    updateStats();
  }, [cleanup, addLog, updateStats]);

  return (
    <div className={`event-manager-demo ${className}`}>
      <h2>🎯 EventManager Demo</h2>
      
      {/* Stats */}
      <div className="stats-section">
        <h3>📊 Estadísticas</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Listeners Regulares:</span>
            <span className="stat-value">{stats.regularListeners}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Listeners Delegados:</span>
            <span className="stat-value">{stats.delegatedListeners}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total:</span>
            <span className="stat-value">{stats.totalListeners}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Ventana:</span>
            <span className="stat-value">{windowSize.width}×{windowSize.height}</span>
          </div>
        </div>
      </div>

      {/* Basic Event Management */}
      <div className="section">
        <h3>🔧 Gestión de Eventos</h3>
        <div className="button-group">
          <button onClick={addBasicListener}>Añadir Listener Básico</button>
          <button onClick={addDebouncedListener}>Añadir Listener Debounced</button>
          <button onClick={addThrottledListener}>Añadir Listener Throttled</button>
          <button onClick={addDelegatedListener}>Añadir Listener Delegado</button>
          <button onClick={cleanupAll} className="danger">Limpiar Todo</button>
        </div>
      </div>

      {/* Test Buttons */}
      <div className="section">
        <h3>🎮 Botones de Prueba</h3>
        <div className="button-group">
          <button id="demo-basic-btn">Click Básico</button>
          <button id="demo-debounce-btn">Click Debounced (500ms)</button>
          <button id="demo-throttle-btn">Click Throttled (1000ms)</button>
        </div>
      </div>

      {/* Event Delegation */}
      <div className="section">
        <h3>🎯 Delegación de Eventos</h3>
        <div id="demo-delegation-container" className="delegation-container">
          <button className="delegated-btn">Botón Delegado 1</button>
          <button className="delegated-btn">Botón Delegado 2</button>
          <button className="delegated-btn">Botón Delegado 3</button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="section">
        <h3>📱 Menú Móvil</h3>
        <div className="mobile-menu-demo">
          <button id="demo-menu-toggle" className="menu-toggle">☰ Toggle Menu</button>
          <nav id="demo-nav-menu" className="nav-menu">
            <a href="#" onClick={(e) => { e.preventDefault(); addLog('Nav: Home'); }}>Home</a>
            <a href="#" onClick={(e) => { e.preventDefault(); addLog('Nav: About'); }}>About</a>
            <a href="#" onClick={(e) => { e.preventDefault(); addLog('Nav: Contact'); }}>Contact</a>
          </nav>
          <div className="button-group">
            <button onClick={openMenu}>Abrir Menu</button>
            <button onClick={closeMenu}>Cerrar Menu</button>
          </div>
        </div>
      </div>

      {/* Scroll Controls */}
      <div className="section">
        <h3>📜 Controles de Scroll</h3>
        <div className="button-group">
          <button onClick={scrollToTop}>Scroll to Top</button>
          <button onClick={() => scrollToElement('.stats-section')}>Scroll to Stats</button>
          <button onClick={() => scrollToElement('.log-section', 20)}>Scroll to Log</button>
        </div>
        <button id="demo-scroll-btn" className="scroll-to-top">↑</button>
      </div>

      {/* Outside Click Detection */}
      <div className="section">
        <h3>🎯 Detección de Click Externo</h3>
        <div ref={outsideRef} className="outside-click-area">
          <p>Haz click dentro de esta área (no genera log)</p>
          <p>Haz click fuera de esta área (genera log)</p>
        </div>
      </div>

      {/* Modal */}
      <div className="section">
        <h3>🪟 Modal</h3>
        <button onClick={openDemoModal}>Abrir Modal</button>
        <div id="demo-modal" className="modal">
          <div className="modal-content">
            <h3>Modal de Prueba</h3>
            <p>Usa ESC para cerrar, ← → para navegar</p>
            <div className="modal-controls">
              <button id="demo-prev-modal">← Anterior</button>
              <button id="demo-close-modal">Cerrar</button>
              <button id="demo-next-modal">Siguiente →</button>
            </div>
          </div>
        </div>
      </div>

      {/* Log */}
      <div className="section log-section">
        <h3>📝 Log de Eventos</h3>
        <div className="log-container">
          {log.length === 0 ? (
            <p className="log-empty">No hay eventos registrados</p>
          ) : (
            log.map((entry, index) => (
              <div key={index} className="log-entry">
                {entry}
              </div>
            ))
          )}
        </div>
        <button onClick={() => setLog([])}>Limpiar Log</button>
      </div>

      {/* Add some height for scroll testing */}
      <div style={{ height: '100vh', background: 'linear-gradient(45deg, #f0f0f0, #e0e0e0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Área para probar scroll (scroll hacia abajo y luego usa "Scroll to Top")</p>
      </div>
    </div>
  );
};

export default EventManagerDemo;