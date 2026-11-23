// gcyber-multicharacter - Master Client Script
// Modular Character Selection & 3D Creator Client for CyberMP (Cyberpunk 2077)

mp.cef.setUrl('./ui/index.html');

let isMulticharActive = true;

function safeSetFocus(cursor, keyboard) {
  try {
    if (mp.cef && typeof mp.cef.setFocus === 'function') {
      mp.cef.setFocus(cursor, keyboard);
    }
  } catch (err) {
    console.warn('[gcyber-multicharacter] setFocus error:', err);
  }
}

// Open character selector on load
safeSetFocus(true, true);

// Cyberpunk 2077 Native 3D Character Customizer Launcher
function openNativeCharacterCustomizer(scenarioType = 'MenuScenario_CharacterCustomization') {
  try {
    console.log(`[gcyber-multicharacter] Launching Native Scenario: ${scenarioType}`);

    if (mp.game && mp.game.ScriptGameInstance) {
      const uiSys = mp.game.ScriptGameInstance.GetUISystem();
      if (uiSys) {
        try {
          if (typeof uiSys.PushMenuScenario === 'function') {
            uiSys.PushMenuScenario(scenarioType);
          }
        } catch (e1) {
          console.warn('[gcyber-multicharacter] PushMenuScenario notice:', e1);
        }

        try {
          if (typeof uiSys.QueueMenuEvent === 'function') {
            uiSys.QueueMenuEvent(scenarioType);
            uiSys.QueueMenuEvent("OnOpenMorphMenu");
          }
        } catch (e2) {
          console.warn('[gcyber-multicharacter] QueueMenuEvent notice:', e2);
        }

        try {
          const custSys = mp.game.ScriptGameInstance.GetCharacterCustomizationSystem();
          if (custSys && typeof custSys.InitializeState === 'function') {
            custSys.InitializeState();
          }
        } catch (e3) {
          console.warn('[gcyber-multicharacter] custSys InitializeState notice:', e3);
        }
      }
    }

    // Release mouse and keyboard from CEF so player interacts with native 3D creator
    safeSetFocus(false, false);
  } catch (err) {
    console.error('[gcyber-multicharacter] openNativeCharacterCustomizer error:', err);
  }
}

// =====================================================================
// Event Bridges: Server <-> Client <-> CEF
// =====================================================================

// Server sends character list
mp.events.onServer('g-cyber:client:receiveCharacters', (charsJson) => {
  try {
    isMulticharActive = true;
    safeSetFocus(true, true);
    mp.events.emitCef('g-cyber:characters:receive', charsJson);
  } catch (err) {
    console.error('[gcyber-multicharacter] Error receiving characters:', err);
  }
});

// Server notifies that character was loaded into world
mp.events.onServer('g-cyber:client:characterLoaded', (charJson) => {
  try {
    isMulticharActive = false;
    safeSetFocus(false, false);
    mp.events.emitCef('g-cyber:characters:loaded', charJson);
    console.log('[gcyber-multicharacter] Character spawned in world.');
  } catch (err) {
    console.error('[gcyber-multicharacter] Error loading character:', err);
  }
});

// CEF requests character list
mp.events.onCef('g-cyber:characters:request', () => {
  safeSetFocus(true, true);
  mp.events.emitServer('g-cyber:server:requestCharacters');
});

// CEF selects character
mp.events.onCef('g-cyber:characters:select', (citizenid) => {
  mp.events.emitServer('g-cyber:server:selectCharacter', citizenid);
});

// CEF creates character
mp.events.onCef('g-cyber:characters:create', (characterJson) => {
  mp.events.emitServer('g-cyber:server:createCharacter', characterJson);
});

// CEF deletes character
mp.events.onCef('g-cyber:characters:delete', (citizenid) => {
  mp.events.emitServer('g-cyber:server:deleteCharacter', citizenid);
});

// CEF requests native 3D character creator
mp.events.onCef('g-cyber:characters:openNativeCreator', () => {
  openNativeCharacterCustomizer('MenuScenario_CharacterCustomization');
});

// CEF requests native mirror
mp.events.onCef('g-cyber:characters:openNativeMirror', () => {
  openNativeCharacterCustomizer('MenuScenario_CharacterCustomizationMirror');
});

// CEF focus toggle
mp.events.onCef('g-cyber:ui:setFocus', (state) => {
  safeSetFocus(state, state);
});

// Command: /char to reopen multicharacter screen
mp.commands.add('char', () => {
  isMulticharActive = true;
  safeSetFocus(true, true);
  mp.events.emitCef('g-cyber:ui:showMulticharacter');
  mp.events.emitServer('g-cyber:server:requestCharacters');
});

console.log('[gcyber-multicharacter] Client module initialized.');
