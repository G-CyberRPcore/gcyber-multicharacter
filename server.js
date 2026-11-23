// gcyber-multicharacter - Master Server Script
// Modular Character Selection & Identity Management for G-CyberRPcore

const Config = require('./config');

console.log('[gcyber-multicharacter] Server module initializing...');

function getPlayerKey(player) {
  if (!player) return 'unknown';
  return player.nickname || `player_${player.id}`;
}

// 1. Client requests character slots
mp.events.onClient('g-cyber:server:requestCharacters', (player) => {
  try {
    const pKey = getPlayerKey(player);
    console.log(`[gcyber-multicharacter] Player ${pKey} (ID: ${player.id}) requested character list.`);

    if (!global.G_CyberCore || !global.G_CyberCore.Database) {
      console.warn('[gcyber-multicharacter] Core Database not yet available.');
      player.emit('g-cyber:client:receiveCharacters', JSON.stringify([]));
      return;
    }

    const userChars = global.G_CyberCore.Database.GetCharactersForPlayer(pKey, player.id);
    console.log(`[gcyber-multicharacter] Returning ${userChars.length} characters to player ${pKey}.`);
    player.emit('g-cyber:client:receiveCharacters', JSON.stringify(userChars));
  } catch (err) {
    console.error('[gcyber-multicharacter] Error fetching characters:', err.message);
    player.emit('g-cyber:client:receiveCharacters', JSON.stringify([]));
  }
});

// 2. Client creates new character
mp.events.onClient('g-cyber:server:createCharacter', (player, characterJson) => {
  try {
    const data = (typeof characterJson === 'string') ? JSON.parse(characterJson) : (characterJson || {});
    const pKey = getPlayerKey(player);
    const citizenid = `NC-${Math.floor(100000 + Math.random() * 900000)}`;

    const newChar = {
      citizenid: citizenid,
      ownerKey: pKey,
      slot: data.slot || 1,
      charinfo: data.charinfo || {
        firstname: 'Valerie',
        lastname: 'Street',
        birthdate: '2054-10-12',
        gender: 'female',
        lifepath: 'streetkid'
      },
      clothing: data.clothing || {},
      money: Object.assign({}, Config.starterMoney),
      job: {
        name: 'civilian',
        label: 'Civilian Citizen',
        payment: 750,
        onDuty: true,
        grade: { name: 'Unemployed', level: 0 }
      },
      gang: {
        name: 'none',
        label: 'No Gang Affiliation'
      },
      metadata: {
        health: 100,
        armor: 100,
        hunger: 100,
        thirst: 100,
        stress: 0
      },
      inventory: JSON.parse(JSON.stringify(Config.starterInventory)),
      created: Date.now()
    };

    if (global.G_CyberCore) {
      // Save to Database
      if (global.G_CyberCore.Database) {
        global.G_CyberCore.Database.SavePlayer(citizenid, newChar);
      }

      // Register active player in G_CyberCore
      if (typeof global.G_CyberCore.CreatePlayer === 'function') {
        global.G_CyberCore.CreatePlayer(player, newChar);
      }
    }

    // Teleport to Apartment Spawn
    player.position = Config.defaultSpawn;

    // Notify client that character was loaded
    player.emit('g-cyber:client:characterLoaded', JSON.stringify(newChar));
    console.log(`[gcyber-multicharacter] New Citizen registered: ${newChar.charinfo.firstname} ${newChar.charinfo.lastname} (${citizenid})`);
  } catch (err) {
    console.error('[gcyber-multicharacter] Error creating character:', err.message);
  }
});

// 3. Client selects existing character
mp.events.onClient('g-cyber:server:selectCharacter', (player, citizenid) => {
  try {
    if (!global.G_CyberCore || !global.G_CyberCore.Database) {
      player.emit('g-cyber:client:notify', 'Error', 'Database offline.', 'error');
      return;
    }

    const charData = global.G_CyberCore.Database.GetPlayerByCitizenId(citizenid);
    if (!charData) {
      player.emit('g-cyber:client:notify', 'Error', 'Character identity record not found.', 'error');
      return;
    }

    // Register in memory
    if (typeof global.G_CyberCore.CreatePlayer === 'function') {
      global.G_CyberCore.CreatePlayer(player, charData);
    }

    // Teleport player
    player.position = Config.defaultSpawn;

    // Notify client
    player.emit('g-cyber:client:characterLoaded', JSON.stringify(charData));
    console.log(`[gcyber-multicharacter] Player ${player.nickname} selected ${charData.charinfo ? charData.charinfo.firstname : charData.name} (${citizenid})`);
  } catch (err) {
    console.error('[gcyber-multicharacter] Error selecting character:', err.message);
  }
});

// 4. Client deletes character
mp.events.onClient('g-cyber:server:deleteCharacter', (player, citizenid) => {
  try {
    if (!global.G_CyberCore || !global.G_CyberCore.Database) return;
    global.G_CyberCore.Database.DeletePlayer(citizenid);
    console.log(`[gcyber-multicharacter] Citizen ${citizenid} deleted from database.`);

    const pKey = getPlayerKey(player);
    const userChars = global.G_CyberCore.Database.GetCharactersForPlayer(pKey, player.id);
    player.emit('g-cyber:client:receiveCharacters', JSON.stringify(userChars));
  } catch (err) {
    console.error('[gcyber-multicharacter] Error deleting character:', err.message);
  }
});

console.log('[gcyber-multicharacter] Server handlers ready.');
