/**
 * navigation.js
 * State machine de navegación AR.
 * Controla qué checkpoint espera la app y avanza el flujo
 * cuando AR.js detecta el marcador correcto.
 */

const NAV = (() => {

  // ── Definición de checkpoints ──────────────────────────────────────
  const CHECKPOINTS = [
    {
      markerId:    0,
      step:        1,
      title:       'Inicio',
      icon:        '🚀',
      arDirection: 'forward',
      instruction: 'Busca el marcador de <strong>INICIO</strong> en el pasillo del piso 4',
      detected:    'Inicio detectado — dirígete a las escaleras',
    },
    {
      markerId:    1,
      step:        2,
      title:       'Escaleras',
      icon:        '🔻',
      arDirection: 'down',
      instruction: 'Encuentra el marcador en la <strong>entrada de las escaleras</strong>',
      detected:    'Escaleras encontradas — baja al piso 3',
    },
    {
      markerId:    2,
      step:        3,
      title:       'Piso 3',
      icon:        '↩️',
      arDirection: 'left',
      instruction: 'Busca el marcador al <strong>llegar al piso 3</strong>',
      detected:    'Piso 3 alcanzado — gira a la izquierda',
    },
    {
      markerId:    3,
      step:        4,
      title:       'Pasillo',
      icon:        '📍',
      arDirection: 'forward',
      instruction: 'Avanza por el pasillo hasta el <strong>próximo marcador</strong>',
      detected:    'Casi llegás — el destino está cerca',
    },
    {
      markerId:    4,
      step:        5,
      title:       'Destino',
      icon:        '🎯',
      arDirection: 'forward',
      instruction: '¡Apunta al <strong>marcador del destino</strong>!',
      detected:    null, // dispara pantalla de llegada
    },
  ];

  // ── Estado interno ─────────────────────────────────────────────────
  let currentIndex = 0;         // Índice del checkpoint esperado
  let detectionCooldown = false; // Evita disparos múltiples seguidos
  let initialized = false;
  let lastDetectedDirection = 'forward'; // Guarda la última dirección detectada

  // ── Helpers ────────────────────────────────────────────────────────

  function getCurrentCheckpoint() {
    return CHECKPOINTS[currentIndex];
  }

  function isLastCheckpoint() {
    return currentIndex === CHECKPOINTS.length - 1;
  }

  // Feedback háptico (vibración breve si el dispositivo lo soporta)
  function vibrate(pattern) {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }

  // ── Lógica de detección ────────────────────────────────────────────

  function onMarkerFound(markerId) {
    if (detectionCooldown) return;

    const expected = getCurrentCheckpoint();

    // Ignorar markers que no son el siguiente en la ruta
    if (markerId !== expected.markerId) return;

    // Guardar dirección para mantener la flecha visible
    const directionMap = {
      forward:  'forward',
      down:     'down',
      left:     'left',
      right:    'right',
      up:       'up',
    };
    lastDetectedDirection = directionMap[expected.arDirection] || 'forward';

    // Cooldown para evitar re-disparos en el mismo frame
    detectionCooldown = true;
    setTimeout(() => { detectionCooldown = false; }, 2500);

    vibrate([100, 50, 100]);

    if (isLastCheckpoint()) {
      // Usuario llegó al destino
      UI.showDetectionFeedback('¡Llegaste al destino!');
      UI.hideDirectionArrow();
      setTimeout(() => UI.showArrival(), 1200);
    } else {
      // Avanzar al siguiente checkpoint
      UI.showDetectionFeedback(expected.detected);
      // Mostrar nombre del PRÓXIMO checkpoint en la flecha
      const nextCheckpoint = CHECKPOINTS[currentIndex + 1];
      const nextName = nextCheckpoint ? nextCheckpoint.title : 'Destino';
      UI.showDirectionArrow(lastDetectedDirection, nextName);
      setTimeout(() => {
        currentIndex++;
        UI.updateStep(getCurrentCheckpoint(), currentIndex, CHECKPOINTS.length);
      }, 1800);
    }
  }

  // ── Inicialización ─────────────────────────────────────────────────

  function init() {
    if (initialized) return;
    initialized = true;

    // Adjuntar listeners a cada a-marker
    CHECKPOINTS.forEach(({ markerId }) => {
      const markerEl = document.getElementById(`marker-${markerId}`);
      if (!markerEl) return;

      markerEl.addEventListener('markerFound', () => {
        onMarkerFound(markerId);
      });
    });

    // UI inicial
    UI.updateStep(getCurrentCheckpoint(), 0, CHECKPOINTS.length);

    console.log('[AR Nav] Navigation initialized. Waiting for marker 0.');
  }

  // Esperar a que A-Frame esté listo
  document.addEventListener('DOMContentLoaded', () => {
    const scene = document.querySelector('a-scene');
    const loader = document.getElementById('loading-overlay');

    function hideLoader() {
      if (loader) {
        loader.style.opacity = '0';
        loader.style.transition = 'opacity 0.5s ease';
        setTimeout(() => loader.style.display = 'none', 500);
      }
      init();
    }

    if (scene && scene.hasLoaded) {
      hideLoader();
    } else if (scene) {
      scene.addEventListener('loaded', hideLoader);
      // Fallback por si acaso
      setTimeout(() => {
        if (loader && loader.style.display !== 'none') {
          hideLoader();
        }
      }, 5000);
    }
  });

  // API pública (útil para debug en consola del teléfono)
  return {
    init,
    getCurrentCheckpoint,
    simulateDetection: (id) => onMarkerFound(id), // útil para demos sin marker físico
    CHECKPOINTS,
  };

})();
