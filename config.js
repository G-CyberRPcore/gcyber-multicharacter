// gcyber-multicharacter - Central Configuration File
// Decoupled resource configuration for G-CyberRPcore

module.exports = {
  // Maximum character slots per account
  maxSlots: 4,

  // Default world spawn coordinates: Megabuilding H10 Apartment (Watson, Little China)
  defaultSpawn: [-1392.6, 1271.5, 123.0],

  // Character studio mirror coordinates
  studioCoords: [-1392.6, 1271.5, 123.0, 0.0],

  // Cyberpunk 2077 Native 3D Character Customizer
  enableNativeCreator: true,
  nativeScenarios: {
    creator: 'MenuScenario_CharacterCustomization',
    mirror: 'MenuScenario_CharacterCustomizationMirror'
  },

  // Starting economy package for new characters
  starterMoney: {
    cash: 5000,
    bank: 25000,
    crypto: 100
  },

  // Default initial inventory items
  starterInventory: [
    { name: 'maxdoc_mk1', label: 'MaxDoc Mk.1 Inhaler', amount: 3, weight: 0.2 },
    { name: 'phone', label: 'Personal Agent Phone', amount: 1, weight: 0.1 },
    { name: 'id_card', label: 'Night City Citizen ID', amount: 1, weight: 0.05 }
  ]
};
