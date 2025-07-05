// Firebase Configuration for Squid Game Ortiz
// This will store all player data in the cloud for the admin panel

// Firebase config - Configuración real de Squid Game Ortiz
const firebaseConfig = {
  apiKey: "AIzaSyBZTHdGwNjqBy6TZmpMJTKoac9GIPIObp0",
  authDomain: "squid-game-ortiz.firebaseapp.com",
  databaseURL: "https://squid-game-ortiz-default-rtdb.firebaseio.com",
  projectId: "squid-game-ortiz",
  storageBucket: "squid-game-ortiz.firebasestorage.app",
  messagingSenderId: "564790427576",
  appId: "1:564790427576:web:585ed1ec3d9dea792a594d"
};

// Initialize Firebase when DOM is ready
let db;
function initializeFirebase() {
  try {
    if (window.firebase) {
      firebase.initializeApp(firebaseConfig);
      db = firebase.database();
      console.log('✅ Firebase initialized successfully');
      console.log('📊 Database URL:', firebaseConfig.databaseURL);
      return true;
    } else {
      console.error('❌ Firebase not loaded yet');
      return false;
    }
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    return false;
  }
}

// Try to initialize immediately
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeFirebase);
} else {
  initializeFirebase();
}

// Player data management functions
const PlayerDataManager = {
  // Safe coin update function that prevents overwriting other players' data
  safeUpdateCoins: function(newCoins, gameType = 'unknown') {
    try {
      const playerName = localStorage.getItem('soldierName');
      if (!playerName) {
        console.error('❌ No player name found for safe coin update');
        return false;
      }

      // Get current coins from localStorage
      const currentCoins = parseInt(localStorage.getItem('totalOrtizCoins') || '0');
      
      // Only update if the new value is higher or if it's a valid game transaction
      if (newCoins >= currentCoins || gameType !== 'unknown') {
        localStorage.setItem('totalOrtizCoins', newCoins.toString());
        console.log(`✅ Safe coin update: ${currentCoins} -> ${newCoins} (${gameType})`);
        
        // Auto-sync to Firebase
        this.savePlayerData(playerName, newCoins, {
          gamesPlayed: parseInt(localStorage.getItem('gamesPlayed') || '0'),
          totalWins: parseInt(localStorage.getItem('totalWins') || '0'),
          cluesFound: parseInt(localStorage.getItem('cluesFound') || '0'),
          lastSync: new Date().toISOString(),
          autoSync: true,
          gameType: gameType,
          coinChange: newCoins - currentCoins
        });
        
        return true;
      } else {
        console.warn(`⚠️ Coin update blocked: ${currentCoins} -> ${newCoins} (${gameType}) - would decrease coins`);
        return false;
      }
    } catch (error) {
      console.error('❌ Error in safe coin update:', error);
      return false;
    }
  },

  // Safe coin deduction function for game costs
  safeDeductCoins: function(amount, gameType = 'unknown') {
    try {
      const playerName = localStorage.getItem('soldierName');
      if (!playerName) {
        console.error('❌ No player name found for coin deduction');
        return false;
      }

      const currentCoins = parseInt(localStorage.getItem('totalOrtizCoins') || '0');
      
      if (currentCoins >= amount) {
        const newCoins = currentCoins - amount;
        localStorage.setItem('totalOrtizCoins', newCoins.toString());
        console.log(`✅ Safe coin deduction: ${currentCoins} - ${amount} = ${newCoins} (${gameType})`);
        
        // Auto-sync to Firebase
        this.savePlayerData(playerName, newCoins, {
          gamesPlayed: parseInt(localStorage.getItem('gamesPlayed') || '0'),
          totalWins: parseInt(localStorage.getItem('totalWins') || '0'),
          cluesFound: parseInt(localStorage.getItem('cluesFound') || '0'),
          lastSync: new Date().toISOString(),
          autoSync: true,
          gameType: gameType,
          coinChange: -amount
        });
        
        return true;
      } else {
        console.warn(`⚠️ Insufficient coins for deduction: ${currentCoins} < ${amount} (${gameType})`);
        return false;
      }
    } catch (error) {
      console.error('❌ Error in safe coin deduction:', error);
      return false;
    }
  },

  // Safe coin addition function for game winnings
  safeAddCoins: function(amount, gameType = 'unknown') {
    try {
      const playerName = localStorage.getItem('soldierName');
      if (!playerName) {
        console.error('❌ No player name found for coin addition');
        return false;
      }

      const currentCoins = parseInt(localStorage.getItem('totalOrtizCoins') || '0');
      const newCoins = currentCoins + amount;
      
      localStorage.setItem('totalOrtizCoins', newCoins.toString());
      console.log(`✅ Safe coin addition: ${currentCoins} + ${amount} = ${newCoins} (${gameType})`);
      
      // Auto-sync to Firebase
      this.savePlayerData(playerName, newCoins, {
        gamesPlayed: parseInt(localStorage.getItem('gamesPlayed') || '0'),
        totalWins: parseInt(localStorage.getItem('totalWins') || '0'),
        cluesFound: parseInt(localStorage.getItem('cluesFound') || '0'),
        lastSync: new Date().toISOString(),
        autoSync: true,
        gameType: gameType,
        coinChange: amount
      });
      
      return true;
    } catch (error) {
      console.error('❌ Error in safe coin addition:', error);
      return false;
    }
  },

  // Save player data to Firebase Realtime Database
  savePlayerData: async function(playerName, coins, gameData = {}) {
    try {
      const playerRef = db.ref('players/' + playerName);
      
      // Check if player already exists
      const snapshot = await playerRef.once('value');
      const existingData = snapshot.val() || {};
      
      // Always use the highest values from localStorage or existing data
      // This prevents overwriting with lower values from individual games
      const currentLocalCoins = parseInt(localStorage.getItem('totalOrtizCoins') || '0');
      const currentLocalGames = parseInt(localStorage.getItem('gamesPlayed') || '0');
      const currentLocalWins = parseInt(localStorage.getItem('totalWins') || '0');
      const currentLocalClues = parseInt(localStorage.getItem('cluesFound') || '0');
      
      // Use the maximum value between local storage and existing data
      const finalCoins = Math.max(coins, currentLocalCoins, existingData.coins || 0);
      const finalGames = Math.max(gameData.gamesPlayed || 0, currentLocalGames, existingData.gamesPlayed || 0);
      const finalWins = Math.max(gameData.totalWins || 0, currentLocalWins, existingData.totalWins || 0);
      const finalClues = Math.max(gameData.cluesFound || 0, currentLocalClues, existingData.cluesFound || 0);
      
      // Prepare new data with the highest values
      const newData = {
        name: playerName,
        coins: finalCoins,
        lastUpdated: Date.now(),
        gamesPlayed: finalGames,
        totalWins: finalWins,
        cluesFound: finalClues,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          timestamp: new Date().toISOString()
        }
      };
      
      // Add migration info if this is a migration
      if (gameData.migrationNote) {
        newData.migrationInfo = {
          migratedAt: gameData.migratedAt,
          note: gameData.migrationNote,
          originalCoins: gameData.originalCoins || finalCoins
        };
      }
      
      // Add auto-sync info
      if (gameData.autoSync) {
        newData.lastAutoSync = {
          timestamp: new Date().toISOString(),
          gameType: gameData.gameType || 'unknown',
          syncedCoins: coins,
          finalCoins: finalCoins,
          coinChange: gameData.coinChange || 0
        };
      }
      
      await playerRef.set(newData);
      console.log('✅ Player data saved to Firebase Realtime Database:', playerName, {
        syncedCoins: coins,
        finalCoins: finalCoins,
        syncedGames: gameData.gamesPlayed || 0,
        finalGames: finalGames
      });
      return true;
    } catch (error) {
      console.error('❌ Error saving player data:', error);
      return false;
    }
  },

  // Get all players data
  getAllPlayers: async function() {
    try {
      const snapshot = await db.ref('players').once('value');
      const players = [];
      
      snapshot.forEach(childSnapshot => {
        const data = childSnapshot.val();
        players.push({
          id: childSnapshot.key,
          name: data.name,
          coins: data.coins || 0,
          lastUpdated: new Date(data.lastUpdated || Date.now()),
          gamesPlayed: data.gamesPlayed || 0,
          totalWins: data.totalWins || 0,
          cluesFound: data.cluesFound || 0,
          deviceInfo: data.deviceInfo || {}
        });
      });
      
      // Sort by last updated
      players.sort((a, b) => b.lastUpdated - a.lastUpdated);
      
      console.log('✅ Retrieved', players.length, 'players from Firebase Realtime Database');
      return players;
    } catch (error) {
      console.error('❌ Error getting players data:', error);
      return [];
    }
  },

  // Get player statistics
  getPlayerStats: async function() {
    try {
      const players = await this.getAllPlayers();
      const totalPlayers = players.length;
      const totalCoins = players.reduce((sum, player) => sum + (player.coins || 0), 0);
      const averageCoins = totalPlayers > 0 ? Math.round(totalCoins / totalPlayers) : 0;
      const totalGames = players.reduce((sum, player) => sum + (player.gamesPlayed || 0), 0);
      const totalWins = players.reduce((sum, player) => sum + (player.totalWins || 0), 0);
      const totalClues = players.reduce((sum, player) => sum + (player.cluesFound || 0), 0);

      return {
        totalPlayers,
        totalCoins,
        averageCoins,
        totalGames,
        totalWins,
        totalClues,
        winRate: totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0
      };
    } catch (error) {
      console.error('❌ Error getting player stats:', error);
      return {
        totalPlayers: 0,
        totalCoins: 0,
        averageCoins: 0,
        totalGames: 0,
        totalWins: 0,
        totalClues: 0,
        winRate: 0
      };
    }
  },

  // Update player coins
  updatePlayerCoins: async function(playerName, newCoins) {
    try {
      const playerRef = db.ref('players/' + playerName);
      await playerRef.update({
        coins: newCoins,
        lastUpdated: Date.now()
      });
      console.log('✅ Player coins updated:', playerName, '->', newCoins);
      return true;
    } catch (error) {
      console.error('❌ Error updating player coins:', error);
      return false;
    }
  },

  // Add game result
  addGameResult: async function(playerName, gameType, won, coinsEarned, clueFound = false) {
    try {
      const playerRef = db.ref('players/' + playerName);
      const snapshot = await playerRef.once('value');
      const currentData = snapshot.val() || {};
      
      await playerRef.set({
        ...currentData,
        name: playerName,
        gamesPlayed: (currentData.gamesPlayed || 0) + 1,
        totalWins: (currentData.totalWins || 0) + (won ? 1 : 0),
        cluesFound: (currentData.cluesFound || 0) + (clueFound ? 1 : 0),
        lastUpdated: Date.now(),
        lastGame: {
          type: gameType,
          won: won,
          coinsEarned: coinsEarned,
          timestamp: new Date().toISOString()
        }
      });
      console.log('✅ Game result saved:', playerName, gameType, won ? 'WON' : 'LOST');
      return true;
    } catch (error) {
      console.error('❌ Error saving game result:', error);
      return false;
    }
  },

  // Listen for real-time updates
  onPlayersUpdate: function(callback) {
    return db.ref('players').on('value', snapshot => {
      const players = [];
      snapshot.forEach(childSnapshot => {
        const data = childSnapshot.val();
        players.push({
          id: childSnapshot.key,
          name: data.name,
          coins: data.coins || 0,
          lastUpdated: new Date(data.lastUpdated || Date.now()),
          gamesPlayed: data.gamesPlayed || 0,
          totalWins: data.totalWins || 0,
          cluesFound: data.cluesFound || 0
        });
      });
      
      // Sort by last updated
      players.sort((a, b) => b.lastUpdated - a.lastUpdated);
      callback(players);
    });
  }
};

// Export for use in other files
window.PlayerDataManager = PlayerDataManager; 