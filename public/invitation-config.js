// Configuración del Sistema de Invitaciones
// Personalizable para diferentes juegos y necesidades

const INVITATION_CONFIG = {
    // Juegos soportados
    supportedGames: {
        'chinos': {
            name: 'Chinos',
            minPlayers: 2,
            maxPlayers: 6,
            description: 'Adivina la suma total de los números'
        },
        'bomba-explosiva': {
            name: 'Bomba Explosiva',
            minPlayers: 2,
            maxPlayers: 8,
            description: 'Pasa la bomba antes de que explote'
        },
        'squid-race': {
            name: 'Squid Race',
            minPlayers: 2,
            maxPlayers: 10,
            description: 'Carrera de clics para llegar a la meta'
        }
    },

    // Configuración de invitaciones
    invitation: {
        expirationTime: 5 * 60 * 1000, // 5 minutos en milisegundos
        autoCloseModal: 30 * 1000, // 30 segundos para auto-cerrar modal
        statusTimeout: 5 * 1000, // 5 segundos para limpiar mensajes de estado
        maxInvitationsPerPlayer: 10, // Máximo de invitaciones pendientes por jugador
        maxRoomAge: 30 * 60 * 1000 // 30 minutos máximo de vida de una sala
    },

    // Configuración de UI
    ui: {
        colors: {
            primary: '#00d4ff',
            secondary: '#ff6b6b',
            success: '#00ff88',
            error: '#ff6b6b',
            warning: '#ffd93d',
            info: '#00d4ff'
        },
        animations: {
            duration: 300, // milisegundos
            easing: 'ease'
        },
        mobile: {
            breakpoint: 768, // px
            touchTarget: 44 // px mínimo para elementos táctiles
        }
    },

    // Configuración de Firebase
    firebase: {
        paths: {
            onlinePlayers: 'onlinePlayers',
            invitations: 'invitations',
            gameRooms: 'gameRooms',
            responses: 'responses'
        },
        timeouts: {
            connection: 10000, // 10 segundos para conexión
            operation: 15000, // 15 segundos para operaciones
            retry: 3000 // 3 segundos entre reintentos
        }
    },

    // Mensajes personalizables
    messages: {
        loading: 'Cargando jugadores online...',
        noPlayers: 'No hay jugadores online',
        sendingInvitations: 'Enviando invitaciones...',
        invitationsSent: 'Invitaciones enviadas',
        invitationAccepted: '¡Invitación aceptada!',
        invitationRejected: 'Invitación rechazada',
        errorLoading: 'Error cargando jugadores',
        errorSending: 'Error enviando invitaciones',
        errorAccepting: 'Error aceptando invitación',
        errorRejecting: 'Error rechazando invitación',
        roomCreated: 'Sala privada creada',
        errorCreatingRoom: 'Error creando sala',
        waitingForResponses: 'Esperando respuestas...',
        playersAccepted: 'jugador(es) aceptaron la invitación',
        playersRejected: 'jugador(es) rechazaron la invitación'
    },

    // Configuración de notificaciones
    notifications: {
        enabled: true,
        sound: true,
        vibration: true,
        desktop: true,
        mobile: true,
        duration: 5000 // 5 segundos
    },

    // Configuración de limpieza automática
    cleanup: {
        enabled: true,
        interval: 5 * 60 * 1000, // Cada 5 minutos
        removeExpiredInvitations: true,
        removeOldRooms: true,
        removeOfflinePlayers: true
    }
};

// Exportar configuración
if (typeof module !== 'undefined' && module.exports) {
    module.exports = INVITATION_CONFIG;
} else {
    window.INVITATION_CONFIG = INVITATION_CONFIG;
} 