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
  // Save player data to Firebase Realtime Database
  savePlayerData: async function(playerName, coins, gameData = {}) {
    try {
      const playerRef = db.ref('players/' + playerName);
      
      // Check if player already exists
      const snapshot = await playerRef.once('value');
      const existingData = snapshot.val() || {};
      
      // Prepare new data
      const newData = {
        name: playerName,
        coins: coins,
        lastUpdated: Date.now(),
        gamesPlayed: gameData.gamesPlayed || existingData.gamesPlayed || 0,
        totalWins: gameData.totalWins || existingData.totalWins || 0,
        cluesFound: gameData.cluesFound || existingData.cluesFound || 0,
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
          originalCoins: gameData.originalCoins || coins
        };
      }
      
      await playerRef.set(newData);
      console.log('✅ Player data saved to Firebase Realtime Database:', playerName);
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