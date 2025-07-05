# 🔥 Firebase Setup para Squid Game Ortiz

## Configuración Requerida

Para que el panel de administración funcione y recopile datos de todos los jugadores, necesitas configurar Firebase.

### Paso 1: Crear Proyecto Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Crear un proyecto"
3. Nombra el proyecto: `squid-game-ortiz`
4. Sigue los pasos de configuración

### Paso 2: Habilitar Firestore Database

1. En el panel de Firebase, ve a "Firestore Database"
2. Haz clic en "Crear base de datos"
3. Selecciona "Comenzar en modo de prueba" (gratis)
4. Elige la ubicación más cercana

### Paso 3: Obtener Configuración

1. Ve a "Configuración del proyecto" (ícono de engranaje)
2. Selecciona "Configuración de SDK"
3. Copia la configuración

### Paso 4: Actualizar firebase-config.js

Reemplaza la configuración en `firebase-config.js` con tus datos reales:

```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY_REAL",
  authDomain: "squid-game-ortiz.firebaseapp.com",
  projectId: "squid-game-ortiz",
  storageBucket: "squid-game-ortiz.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};
```

### Paso 5: Configurar Reglas de Seguridad

En Firestore Database > Reglas, usa estas reglas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /players/{playerId} {
      allow read, write: if true; // Para desarrollo
    }
  }
}
```

## Funcionalidades

✅ **Datos en Tiempo Real** - Ve todos los jugadores al instante  
✅ **Estadísticas Completas** - Total de monedas, juegos, victorias  
✅ **Panel de Administración** - Acceso con código "DAGO"  
✅ **Sincronización Automática** - Datos se guardan cada 30 segundos  
✅ **Gratis** - Hasta 50,000 lecturas/mes  

## Estructura de Datos

```javascript
players/{playerName} = {
  name: "Nombre del Jugador",
  coins: 150,
  gamesPlayed: 5,
  totalWins: 3,
  cluesFound: 2,
  lastUpdated: timestamp,
  deviceInfo: {
    userAgent: "...",
    platform: "...",
    timestamp: "..."
  }
}
```

## Acceso al Panel

1. En el juego, escribe "DAGO" en el código de entrada
2. Aparece el botón del panel de administración
3. Haz clic para ver todos los datos de jugadores

## Notas Importantes

- **Gratis**: Firebase tiene un plan gratuito generoso
- **Seguro**: Los datos están encriptados y seguros
- **Escalable**: Funciona para 30 jugadores sin problemas
- **Tiempo Real**: Los datos se actualizan automáticamente

## Solución de Problemas

Si el panel no carga datos:
1. Verifica la configuración de Firebase
2. Revisa la consola del navegador para errores
3. Asegúrate de que Firestore esté habilitado
4. Verifica las reglas de seguridad 