/**
 * ui.js
 * Controlador del overlay HTML sobre la escena AR.
 * Actualiza progreso, instrucciones y paneles de estado.
 */

const UI = (() => {

  // ── Estado del giroscopio ──────────────────────────────────────────
  let deviceOrientation = { alpha: 0, beta: 0, gamma: 0 };
  let referenceOrientation = { alpha: 0 };
  let hasGyroscope = false;

  // Detectar y escuchar giroscopio
  window.addEventListener('deviceorientation', (event) => {
    deviceOrientation.alpha = event.alpha || 0;
    deviceOrientation.beta = event.beta || 0;
    deviceOrientation.gamma = event.gamma || 0;
    hasGyroscope = true;
    updateArrowRotation();
  }, true);

  // ── Referencias al DOM ─────────────────────────────────────────────
  const els = {
    stepLabel:      () => document.getElementById('ui-step-label'),
    progressFill:   () => document.getElementById('ui-progress-fill'),
    instructionIcon:() => document.getElementById('instruction-icon'),
    instructionText:() => document.getElementById('instruction-text'),
    detection:      () => document.getElementById('ui-detection'),
    detectionLabel: () => document.getElementById('detection-label'),
    arrival:        () => document.getElementById('ui-arrival'),
    directionArrow: () => document.getElementById('ui-direction-arrow'),
    arrowSymbol:    () => document.getElementById('arrow-symbol'),
    arrowLabel:     () => document.getElementById('arrow-label'),
    btnHelp:        () => document.getElementById('btn-help'),
    modalHelp:      () => document.getElementById('modal-help'),
    btnCloseModal:  () => document.getElementById('btn-close-modal'),
  };

  // ── Actualizar paso actual ─────────────────────────────────────────
  function updateStep(checkpoint, index, total) {
    const progress = Math.round((index / total) * 100);

    // Animación de transición rápida
    const instruction = els.instructionText();
    if (instruction) {
      instruction.style.opacity = '0';
      instruction.style.transform = 'translateY(6px)';
    }

    setTimeout(() => {
      const stepLabel = els.stepLabel();
      if (stepLabel) {
        stepLabel.textContent = `Paso ${checkpoint.step} de ${total}`;
      }

      const fill = els.progressFill();
      if (fill) {
        fill.style.width = `${progress}%`;
      }

      const icon = els.instructionIcon();
      if (icon) {
        icon.textContent = checkpoint.icon;
      }

      if (instruction) {
        instruction.innerHTML = checkpoint.instruction;
        instruction.style.opacity = '1';
        instruction.style.transform = 'translateY(0)';
        instruction.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
      }
    }, 150);
  }

  // ── Mostrar feedback de detección ──────────────────────────────────
  function showDetectionFeedback(label) {
    const detEl = els.detection();
    const labelEl = els.detectionLabel();

    if (!detEl || !labelEl) return;

    labelEl.textContent = label || 'Marcador detectado';
    detEl.classList.add('active');

    // Regenerar la animación del pulso
    const pulse = detEl.querySelector('.detection-pulse');
    if (pulse) {
      pulse.style.animation = 'none';
      pulse.offsetHeight; // forzar reflow
      pulse.style.animation = '';
    }

    setTimeout(() => {
      detEl.classList.remove('active');
    }, 1600);
  }

  // ── Mostrar pantalla de llegada ────────────────────────────────────
  function showArrival() {
    const arrivalEl = els.arrival();
    if (arrivalEl) {
      arrivalEl.style.display = 'flex';
    }

    // Progreso al 100%
    const fill = els.progressFill();
    if (fill) fill.style.width = '100%';

    const stepLabel = els.stepLabel();
    if (stepLabel) stepLabel.textContent = '¡Completado!';
  }

  // ── Modal de ayuda ─────────────────────────────────────────────────
  function initHelpModal() {
    const btnHelp = els.btnHelp();
    const modal   = els.modalHelp();
    const btnClose= els.btnCloseModal();

    if (btnHelp && modal) {
      btnHelp.addEventListener('click', () => {
        modal.style.display = 'flex';
      });
    }

    if (btnClose && modal) {
      btnClose.addEventListener('click', () => {
        modal.style.display = 'none';
      });
    }

    // Cerrar tocando fuera del modal
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
      });
    }
  }

  // ── Instrucción de transición suave ───────────────────────────────
  function applyTransitionStyles() {
    const instruction = els.instructionText();
    if (instruction) {
      instruction.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
    }
  }

  // ── Init ───────────────────────────────────────────────────────────
  function init() {
    applyTransitionStyles();
    initHelpModal();
  }

  document.addEventListener('DOMContentLoaded', init);

  // ── Actualizar rotación de flecha con giroscopio ────────────────────
  function updateArrowRotation() {
    if (!hasGyroscope) return;
    const arrow = els.directionArrow();
    if (!arrow || !arrow.classList.contains('active')) return;

    // Calcular rotación relativa desde la referencia
    const deltaRotation = deviceOrientation.alpha - referenceOrientation.alpha;
    const currentRotation = parseFloat(arrow.dataset.baseRotation || 0);
    const finalRotation = currentRotation + deltaRotation;

    arrow.style.transform = `translate(-50%, -50%) rotate(${finalRotation}deg)`;
  }

  // ── Mostrar flecha de dirección permanente ────────────────────────
  function showDirectionArrow(direction, label) {
    const arrow = els.directionArrow();
    const symbol = els.arrowSymbol();
    const arrowLabel = els.arrowLabel();

    if (!arrow) return;

    // Mapear dirección a símbolo y rotación
    const symbols = {
      forward:  { icon: '⬇', angle: 90 },
      backward: { icon: '⬆', angle: -90 },
      left:     { icon: '⬅', angle: 0 },
      right:    { icon: '➡', angle: 180 },
      down:     { icon: '⬇', angle: 90 },
      up:       { icon: '⬆', angle: -90 },
    };

    const dirData = symbols[direction] || symbols.forward;

    if (symbol) symbol.textContent = dirData.icon;
    if (arrowLabel) arrowLabel.textContent = label || 'Próximo';

    // Guardar rotación base y referencia de orientación
    arrow.dataset.baseRotation = dirData.angle;
    referenceOrientation.alpha = deviceOrientation.alpha;

    arrow.style.transform = `translate(-50%, -50%) rotate(${dirData.angle}deg)`;
    arrow.classList.add('active');

    updateArrowRotation();
  }

  function hideDirectionArrow() {
    const arrow = els.directionArrow();
    if (arrow) arrow.classList.remove('active');
  }

  // API pública
  return {
    updateStep,
    showDetectionFeedback,
    showArrival,
    showDirectionArrow,
    hideDirectionArrow,
  };

})();
