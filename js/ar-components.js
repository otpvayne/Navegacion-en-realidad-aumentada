/**
 * ar-components.js
 * Componentes A-Frame personalizados para la navegación AR.
 */

// ═══════════════════════════════════════════════════════════
//  nav-arrow — Flecha 3D clara tipo banner
// ═══════════════════════════════════════════════════════════
AFRAME.registerComponent('nav-arrow', {
  schema: {
    direction: { type: 'string',  default: 'forward' },
    color:     { type: 'color',   default: '#00FF88'  },
    label:     { type: 'string',  default: ''         },
    sublabel:  { type: 'string',  default: ''         },
  },

  init() {
    const { direction, color, label, sublabel } = this.data;
    const el = this.el;

    const rotations = {
      forward:  '0 0 0',
      backward: '0 180 0',
      left:     '0 90 0',
      right:    '0 -90 0',
      up:       '-90 0 0',
      down:     '90 0 0',
    };

    const wrapper = document.createElement('a-entity');
    wrapper.setAttribute('rotation', rotations[direction] || '0 0 0');
    wrapper.setAttribute('position', '0 0.35 0');

    // — CUERPO principal (cilindro como shaft) —
    const shaft = document.createElement('a-cylinder');
    shaft.setAttribute('radius',   '0.025');
    shaft.setAttribute('height',   '0.20');
    shaft.setAttribute('color',    color);
    shaft.setAttribute('position', '0 0.05 0');
    shaft.setAttribute('rotation', '90 0 0');
    shaft.setAttribute('material', `color: ${color}; emissive: ${color}; emissiveIntensity: 0.7; side: front`);
    wrapper.appendChild(shaft);

    // — PUNTA (cono más visible) —
    const head = document.createElement('a-cone');
    head.setAttribute('radius-bottom', '0.06');
    head.setAttribute('radius-top',    '0');
    head.setAttribute('height',        '0.12');
    head.setAttribute('color',         color);
    head.setAttribute('position',      '0 0.15 0');
    head.setAttribute('rotation',      '90 0 0');
    head.setAttribute('material',      `color: ${color}; emissive: ${color}; emissiveIntensity: 0.8`);
    wrapper.appendChild(head);

    // — Base de la flecha (triángulo) —
    const base = document.createElement('a-cone');
    base.setAttribute('radius-bottom', '0.08');
    base.setAttribute('radius-top',    '0.025');
    base.setAttribute('height',        '0.06');
    base.setAttribute('color',         color);
    base.setAttribute('position',      '0 -0.08 0');
    base.setAttribute('rotation',      '90 0 0');
    base.setAttribute('material',      `color: ${color}; emissive: ${color}; emissiveIntensity: 0.6; opacity: 0.8`);
    wrapper.appendChild(base);

    // — Animación: pulsación —
    wrapper.setAttribute('animation__pulse', {
      property:  'scale',
      from:      '1 1 1',
      to:        '1.15 1.15 1.15',
      dir:       'alternate',
      loop:      true,
      dur:       800,
      easing:    'easeInOutSine',
    });

    el.appendChild(wrapper);

    // — ETIQUETA principal (más visible) —
    if (label) {
      const text = document.createElement('a-text');
      text.setAttribute('value',    label);
      text.setAttribute('position', '0 0.65 0');
      text.setAttribute('align',    'center');
      text.setAttribute('color',    '#FFFFFF');
      text.setAttribute('scale',    '0.50 0.50 0.50');
      text.setAttribute('look-at',  '[camera]');
      text.setAttribute('material', `color: white; opacity: 1`);
      el.appendChild(text);
    }

    // — SUBETIQUETA —
    if (sublabel) {
      const sub = document.createElement('a-text');
      sub.setAttribute('value',    sublabel);
      sub.setAttribute('position', '0 0.50 0');
      sub.setAttribute('align',    'center');
      sub.setAttribute('color',    color);
      sub.setAttribute('scale',    '0.35 0.35 0.35');
      sub.setAttribute('look-at',  '[camera]');
      sub.setAttribute('material', `color: ${color}; emissive: ${color}; opacity: 1`);
      el.appendChild(sub);
    }
  },
});


// ═══════════════════════════════════════════════════════════
//  destination-marker — Marcador 3D para el destino final
//  Uso: <a-entity destination-marker="name: Tienda; color: #FF4444">
// ═══════════════════════════════════════════════════════════
AFRAME.registerComponent('destination-marker', {
  schema: {
    name:  { type: 'string', default: 'Destino' },
    color: { type: 'color',  default: '#FF4444'  },
  },

  init() {
    const { name, color } = this.data;
    const el = this.el;

    // — Pin exterior (esfera pulsante) —
    const outerRing = document.createElement('a-torus');
    outerRing.setAttribute('radius',         '0.28');
    outerRing.setAttribute('radius-tubular',  '0.02');
    outerRing.setAttribute('color',          color);
    outerRing.setAttribute('rotation',       '-90 0 0');
    outerRing.setAttribute('position',       '0 0.01 0');
    outerRing.setAttribute('material',       `color: ${color}; emissive: ${color}; emissiveIntensity: 0.6; opacity: 0.9`);
    outerRing.setAttribute('animation__spin', {
      property: 'rotation',
      to:       '-90 360 0',
      loop:     true,
      dur:      4000,
      easing:   'linear',
    });
    el.appendChild(outerRing);

    // — Esfera central —
    const sphere = document.createElement('a-sphere');
    sphere.setAttribute('radius',   '0.18');
    sphere.setAttribute('color',    color);
    sphere.setAttribute('position', '0 0.35 0');
    sphere.setAttribute('material', `color: ${color}; emissive: ${color}; emissiveIntensity: 0.5`);
    sphere.setAttribute('animation__bounce', {
      property: 'position',
      from:     '0 0.28 0',
      to:       '0 0.50 0',
      dir:      'alternate',
      loop:     true,
      dur:      700,
      easing:   'easeInOutSine',
    });
    sphere.setAttribute('animation__pulse', {
      property: 'scale',
      from:     '1 1 1',
      to:       '1.15 1.15 1.15',
      dir:      'alternate',
      loop:     true,
      dur:      700,
    });
    el.appendChild(sphere);

    // — Ítem tipo "pin" bajo la esfera —
    const stick = document.createElement('a-cylinder');
    stick.setAttribute('radius',   '0.025');
    stick.setAttribute('height',   '0.28');
    stick.setAttribute('color',    color);
    stick.setAttribute('position', '0 0.14 0');
    stick.setAttribute('material', `color: ${color}; opacity: 0.7`);
    el.appendChild(stick);

    // — Halo en el suelo —
    const glow = document.createElement('a-circle');
    glow.setAttribute('radius',   '0.35');
    glow.setAttribute('rotation', '-90 0 0');
    glow.setAttribute('position', '0 0.005 0');
    glow.setAttribute('material', `color: ${color}; opacity: 0.2; transparent: true`);
    glow.setAttribute('animation__glow', {
      property: 'material.opacity',
      from:     0.05,
      to:       0.3,
      dir:      'alternate',
      loop:     true,
      dur:      1000,
    });
    el.appendChild(glow);

    // — Texto nombre del destino —
    const title = document.createElement('a-text');
    title.setAttribute('value',    `📍 ${name}`);
    title.setAttribute('position', '0 0.85 0');
    title.setAttribute('align',    'center');
    title.setAttribute('color',    '#FFFFFF');
    title.setAttribute('scale',    '0.6 0.6 0.6');
    title.setAttribute('look-at',  '[camera]');
    el.appendChild(title);

    const subtitle = document.createElement('a-text');
    subtitle.setAttribute('value',    '¡Llegaste!');
    subtitle.setAttribute('position', '0 0.65 0');
    subtitle.setAttribute('align',    'center');
    subtitle.setAttribute('color',    color);
    subtitle.setAttribute('scale',    '0.45 0.45 0.45');
    subtitle.setAttribute('look-at',  '[camera]');
    el.appendChild(subtitle);
  },
});
