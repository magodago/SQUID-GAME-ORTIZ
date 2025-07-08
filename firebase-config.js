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
        
        // Sync to Firebase immediately to update the correct value
        this.savePlayerData(playerName, newCoins, {
          gamesPlayed: parseInt(localStorage.getItem('gamesPlayed') || '0'),
          totalWins: parseInt(localStorage.getItem('totalWins') || '0'),
          cluesFound: parseInt(localStorage.getItem('cluesFound') || '0'),
          lastSync: new Date().toISOString(),
          autoSync: true,
          gameType: gameType,
          coinChange: newCoins - currentCoins
        });
        
        console.log(`✅ Coins updated and synced: ${currentCoins} -> ${newCoins} (${gameType})`);
        
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
        
        // Sync to Firebase immediately to update the correct value
        this.savePlayerData(playerName, newCoins, {
          gamesPlayed: parseInt(localStorage.getItem('gamesPlayed') || '0'),
          totalWins: parseInt(localStorage.getItem('totalWins') || '0'),
          cluesFound: parseInt(localStorage.getItem('cluesFound') || '0'),
          lastSync: new Date().toISOString(),
          autoSync: true,
          gameType: gameType,
          coinChange: -amount
        });
        
        console.log(`✅ Coins deducted and synced: ${currentCoins} - ${amount} = ${newCoins} (${gameType})`);
        
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
      
      // Update achievements progress
      if (typeof updateAchievementProgress === 'function') {
        updateAchievementProgress('coins', amount);
        updateAchievementProgress('games', 1);
      }
      
      // Sync to Firebase immediately to update the correct value
      this.savePlayerData(playerName, newCoins, {
        gamesPlayed: parseInt(localStorage.getItem('gamesPlayed') || '0'),
        totalWins: parseInt(localStorage.getItem('totalWins') || '0'),
        cluesFound: parseInt(localStorage.getItem('cluesFound') || '0'),
        lastSync: new Date().toISOString(),
        autoSync: true,
        gameType: gameType,
        coinChange: amount
      });
      
      console.log(`✅ Coins added and synced: ${currentCoins} + ${amount} = ${newCoins} (${gameType})`);
      
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
      const currentLocalEasterEggs = parseInt(localStorage.getItem('easterEggsFound') || '0');
      
      // Use the maximum value between local storage and existing data
      // Always use the coins parameter for game transactions to ensure correct value
      const finalCoins = gameData.autoSync ? coins : Math.max(coins, currentLocalCoins, existingData.coins || 0);
      const finalGames = Math.max(gameData.gamesPlayed || 0, currentLocalGames, existingData.gamesPlayed || 0);
      const finalWins = Math.max(gameData.totalWins || 0, currentLocalWins, existingData.totalWins || 0);
      const finalClues = Math.max(gameData.cluesFound || 0, currentLocalClues, existingData.cluesFound || 0);
      const finalEasterEggs = Math.max(currentLocalEasterEggs, existingData.easterEggsFound || existingData.totalEasterEggs || 0);
      
      // Prepare new data with the highest values
      const newData = {
        name: playerName,
        coins: finalCoins,
        lastUpdated: Date.now(),
        gamesPlayed: finalGames,
        totalWins: finalWins,
        cluesFound: finalClues,
        easterEggsFound: finalEasterEggs,
        totalEasterEggs: finalEasterEggs,
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
          migrationNote: gameData.migrationNote
        };
      }
      
      // Update player data in Firebase
      await playerRef.update(newData);
      
      console.log(`✅ Player data saved successfully: ${playerName}`);
      return true;
    } catch (error) {
      console.error('❌ Error in savePlayerData:', error);
      return false;
    }
  }
};

// Expose PlayerDataManager globally
window.PlayerDataManager = PlayerDataManager;
console.log('✅ PlayerDataManager exposed globally'); 