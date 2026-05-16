/**
 * ui.js
 * Controlador del overlay HTML sobre la escena AR.
 * Actualiza progreso, instrucciones y paneles de estado.
 */

const UI = (() => {

  // ── Referencias al DOM ─────────────────────────────────────────────
  const els = {
    stepLabel:      () => document.getElementById('ui-step-label'),
    progressFill:   () => document.getElementById('ui-progress-fill'),
    instructionIcon:() => document.getElementById('instruction-icon'),
    instructionText:() => document.getElementById('instruction-text'),
    detection:      () => document.getElementById('ui-detection'),
    detectionLabel: () => document.getElementById('detection-label'),
    arrival:        () => document.getElementById('ui-arrival'),
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

  // API pública
  return {
    updateStep,
    showDetectionFeedback,
    showArrival,
  };

})();
