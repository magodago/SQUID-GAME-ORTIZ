// Easter Eggs Configuration for Squid Game Ortiz
// This file contains all Easter Eggs with their descriptions, powers, and explanations

const EasterEggsConfig = {
  // Red Light Easter Egg
  'red-light': {
    name: 'Red Light',
    description: 'Luz roja que detiene el tiempo',
    power: 'Detiene temporalmente el tiempo en los juegos',
    explanation: 'Este huevo de Pascua te permite pausar brevemente el tiempo durante los juegos, dándote una ventaja estratégica.',
    rarity: 'Común',
    coinsReward: 50,
    icon: '🔴',
    category: 'Time Control'
  },

  // Green Light Easter Egg
  'green-light': {
    name: 'Green Light',
    description: 'Luz verde que acelera el tiempo',
    power: 'Acelera temporalmente el tiempo en los juegos',
    explanation: 'Encuentra este huevo para acelerar el tiempo y completar desafíos más rápidamente.',
    rarity: 'Común',
    coinsReward: 50,
    icon: '🟢',
    category: 'Time Control'
  },

  // Gods Power Easter Egg
  'gods_power': {
    name: 'Gods Power',
    description: 'Poder divino que otorga invencibilidad',
    power: 'Te hace temporalmente invencible en los juegos',
    explanation: 'El poder más poderoso de todos. Te otorga invencibilidad temporal, permitiéndote superar cualquier obstáculo.',
    rarity: 'Legendario',
    coinsReward: 200,
    icon: '⚡',
    category: 'Power'
  },

  // Hidden Clue Easter Egg
  'hidden_clue': {
    name: 'Hidden Clue',
    description: 'Pista oculta que revela secretos',
    power: 'Revela pistas ocultas en los juegos',
    explanation: 'Este huevo te ayuda a encontrar pistas ocultas que pueden llevarte a otros Easter Eggs o ventajas especiales.',
    rarity: 'Raro',
    coinsReward: 100,
    icon: '🔍',
    category: 'Discovery'
  },

  // Golden Ticket Easter Egg
  'golden_ticket': {
    name: 'Golden Ticket',
    description: 'Boleto dorado para acceso especial',
    power: 'Desbloquea contenido especial y recompensas únicas',
    explanation: 'El boleto dorado es el acceso a contenido exclusivo y recompensas especiales que no están disponibles de otra manera.',
    rarity: 'Épico',
    coinsReward: 150,
    icon: '🎫',
    category: 'Access'
  },

  // Time Machine Easter Egg
  'time_machine': {
    name: 'Time Machine',
    description: 'Máquina del tiempo para retroceder',
    power: 'Te permite retroceder en el tiempo y corregir errores',
    explanation: 'La máquina del tiempo te da una segunda oportunidad, permitiéndote deshacer errores y tomar mejores decisiones.',
    rarity: 'Épico',
    coinsReward: 150,
    icon: '⏰',
    category: 'Time Control'
  },

  // Lucky Charm Easter Egg
  'lucky_charm': {
    name: 'Lucky Charm',
    description: 'Amuleto de la suerte',
    power: 'Aumenta temporalmente la probabilidad de éxito',
    explanation: 'Este amuleto de la suerte mejora tus probabilidades de éxito en todos los juegos y desafíos.',
    rarity: 'Raro',
    coinsReward: 100,
    icon: '🍀',
    category: 'Luck'
  },

  // Secret Passage Easter Egg
  'secret_passage': {
    name: 'Secret Passage',
    description: 'Pasaje secreto para atajos',
    power: 'Revela atajos ocultos en los juegos',
    explanation: 'Descubre pasajes secretos que te permiten saltar niveles o acceder a áreas normalmente inaccesibles.',
    rarity: 'Raro',
    coinsReward: 100,
    icon: '🚪',
    category: 'Access'
  },

  // Power Boost Easter Egg
  'power_boost': {
    name: 'Power Boost',
    description: 'Impulso de poder temporal',
    power: 'Aumenta temporalmente todas tus habilidades',
    explanation: 'Este impulso mejora temporalmente todas tus habilidades, haciéndote más rápido, más fuerte y más preciso.',
    rarity: 'Común',
    coinsReward: 75,
    icon: '💪',
    category: 'Power'
  },

  // Mystery Box Easter Egg
  'mystery_box': {
    name: 'Mystery Box',
    description: 'Caja misteriosa con sorpresas',
    power: 'Contiene recompensas aleatorias y sorpresas',
    explanation: 'La caja misteriosa puede contener cualquier cosa: desde monedas extra hasta poderes especiales o incluso otros Easter Eggs.',
    rarity: 'Común',
    coinsReward: 50,
    icon: '📦',
    category: 'Random'
  },

  // Infinity Stone Easter Egg
  'infinity_stone': {
    name: 'Infinity Stone',
    description: 'Piedra del infinito con poder ilimitado',
    power: 'Otorga poder ilimitado temporalmente',
    explanation: 'La piedra más poderosa de todas. Te otorga poder ilimitado por un tiempo limitado, pero úsala sabiamente.',
    rarity: 'Legendario',
    coinsReward: 300,
    icon: '💎',
    category: 'Power'
  },

  // Rainbow Bridge Easter Egg
  'rainbow_bridge': {
    name: 'Rainbow Bridge',
    description: 'Puente arcoíris hacia la victoria',
    power: 'Te transporta directamente a la meta',
    explanation: 'El puente arcoíris es el atajo definitivo, llevándote directamente a la victoria sin necesidad de completar el nivel.',
    rarity: 'Épico',
    coinsReward: 200,
    icon: '🌈',
    category: 'Access'
  },

  // Crystal Ball Easter Egg
  'crystal_ball': {
    name: 'Crystal Ball',
    description: 'Bola de cristal que predice el futuro',
    power: 'Revela información sobre futuros niveles',
    explanation: 'La bola de cristal te permite ver el futuro, revelando información sobre niveles próximos y ayudándote a prepararte.',
    rarity: 'Raro',
    coinsReward: 125,
    icon: '🔮',
    category: 'Discovery'
  },

  // Phoenix Feather Easter Egg
  'phoenix_feather': {
    name: 'Phoenix Feather',
    description: 'Pluma de fénix para renacer',
    power: 'Te permite renacer una vez después de perder',
    explanation: 'Como el fénix que renace de sus cenizas, esta pluma te da una segunda oportunidad después de una derrota.',
    rarity: 'Épico',
    coinsReward: 175,
    icon: '🦅',
    category: 'Survival'
  },

  // Golden Key Easter Egg
  'golden_key': {
    name: 'Golden Key',
    description: 'Llave dorada para desbloquear todo',
    power: 'Desbloquea todas las puertas y contenido',
    explanation: 'La llave dorada es la llave maestra que desbloquea todo el contenido oculto y todas las puertas cerradas.',
    rarity: 'Legendario',
    coinsReward: 250,
    icon: '🔑',
    category: 'Access'
  }
};

// Helper functions for Easter Eggs
const EasterEggsHelper = {
  // Get Easter Egg info by key
  getEasterEggInfo: function(key) {
    return EasterEggsConfig[key] || {
      name: 'Unknown Easter Egg',
      description: 'Easter Egg desconocido',
      power: 'Poder desconocido',
      explanation: 'Este Easter Egg no ha sido identificado.',
      rarity: 'Desconocida',
      coinsReward: 0,
      icon: '❓',
      category: 'Unknown'
    };
  },

  // Get all Easter Eggs
  getAllEasterEggs: function() {
    return EasterEggsConfig;
  },

  // Check if Easter Egg exists
  exists: function(key) {
    return key in EasterEggsConfig;
  },

  // Get Easter Eggs by category
  getByCategory: function(category) {
    return Object.keys(EasterEggsConfig).filter(key => 
      EasterEggsConfig[key].category === category
    );
  },

  // Get Easter Eggs by rarity
  getByRarity: function(rarity) {
    return Object.keys(EasterEggsConfig).filter(key => 
      EasterEggsConfig[key].rarity === rarity
    );
  }
};

// Make helper available globally
window.EasterEggsHelper = EasterEggsHelper;
window.EasterEggsConfig = EasterEggsConfig; 