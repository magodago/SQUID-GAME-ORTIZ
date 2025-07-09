// Sistema Universal de Invitaciones para Juegos Multiplayer
// Compatible con: chinos, bomba-explosiva, squid-race

class InvitationSystem {
    constructor() {
        this.currentPlayer = localStorage.getItem('soldierName') || 'Jugador';
        this.currentGame = this.getCurrentGame();
        this.selectedPlayers = new Set();
        this.invitations = new Map();
        this.roomId = null;
        this.isOrganizer = false;
        this.isInviting = false; // Protección contra múltiples clicks
        this.config = window.INVITATION_CONFIG || this.getDefaultConfig();
        
        this.init();
    }

    getDefaultConfig() {
        return {
            supportedGames: {
                'chinos': { name: 'Chinos', minPlayers: 2, maxPlayers: 6 },
                'bomba-explosiva': { name: 'Bomba Explosiva', minPlayers: 2, maxPlayers: 8 },
                'squid-race': { name: 'Squid Race', minPlayers: 2, maxPlayers: 10 }
            },
            invitation: {
                expirationTime: 5 * 60 * 1000,
                autoCloseModal: 30 * 1000,
                statusTimeout: 5 * 1000
            },
            messages: {
                loading: 'Cargando jugadores online...',
                noPlayers: 'No hay jugadores online',
                sendingInvitations: 'Enviando invitaciones...',
                invitationsSent: 'Invitaciones enviadas'
            }
        };
    }

    getCurrentGame() {
        const path = window.location.pathname;
        if (path.includes('chinos')) return 'chinos';
        if (path.includes('bomba-explosiva')) return 'bomba-explosiva';
        if (path.includes('squid-race')) return 'squid-race';
        return null;
    }

    init() {
        if (!this.currentGame) {
            console.log('Sistema de invitaciones: No es un juego multiplayer soportado');
            return;
        }

        this.setupUI();
        this.checkFirebaseConnection();
        this.loadOnlinePlayers();
        this.setupInvitationListeners();
        this.checkForInvitations();
        this.startCleanupInterval();
    }

    checkFirebaseConnection() {
        console.log('🔍 Verificando conectividad de Firebase...');
        
        if (!window.firebase) {
            console.error('❌ Firebase no está cargado');
            this.showStatus('Firebase no está cargado', 'error');
            return false;
        }

        if (!window.firebase.database) {
            console.error('❌ Firebase Database no está disponible');
            this.showStatus('Firebase Database no está disponible', 'error');
            return false;
        }

        try {
            const db = firebase.database();
            const testRef = db.ref('.info/connected');
            
            testRef.on('value', (snapshot) => {
                const connected = snapshot.val();
                console.log('🌐 Estado de conexión Firebase:', connected ? 'Conectado' : 'Desconectado');
                
                if (connected) {
                    console.log('✅ Firebase conectado correctamente');
                    this.showStatus('Conectado a Firebase', 'success');
                } else {
                    console.warn('⚠️ Firebase desconectado');
                    this.showStatus('Desconectado de Firebase', 'error');
                }
            });

            return true;
        } catch (error) {
            console.error('❌ Error verificando Firebase:', error);
            this.showStatus('Error verificando Firebase: ' + error.message, 'error');
            return false;
        }
    }

    setupUI() {
        const gameContainer = document.querySelector('.game-container') || 
                             document.querySelector('.chinos-container') || 
                             document.querySelector('.lobby-screen') || 
                             document.body;
        
        // Verificar si ya existe la sección de invitaciones
        if (document.getElementById('invitation-section')) {
            return;
        }
        
        // Crear sección de invitaciones
        const invitationSection = document.createElement('div');
        invitationSection.id = 'invitation-section';
        invitationSection.innerHTML = `
            <div class="invitation-panel">
                <h3>🎮 Invitar Jugadores Online</h3>
                <div id="online-players-list" class="players-list">
                    <p>${this.config.messages.loading}</p>
                </div>
                <div class="invitation-controls">
                    <button id="invite-selected-btn" class="btn btn-primary" disabled>
                        🚀 Invitar Seleccionados
                    </button>
                </div>
                <div id="invitation-status" class="status-message"></div>
                <div id="debug-panel" class="debug-panel" style="display: none;">
                    <h4>🔍 Debug Info</h4>
                    <div id="debug-content"></div>
                </div>
                <button id="toggle-debug-btn" class="btn btn-small">
                    🔍 Mostrar Debug
                </button>
            </div>
        `;

        // Insertar al inicio del contenedor del juego
        gameContainer.insertBefore(invitationSection, gameContainer.firstChild);

        // Agregar estilos
        this.addStyles();

        // Event listeners
        const inviteBtn = document.getElementById('invite-selected-btn');
        const toggleDebugBtn = document.getElementById('toggle-debug-btn');
        
        console.log('🎯 Configurando event listeners...');
        console.log('🎯 inviteBtn:', inviteBtn);
        console.log('🎯 toggleDebugBtn:', toggleDebugBtn);
        
        if (inviteBtn) {
            // Limpiar event listeners existentes
            inviteBtn.replaceWith(inviteBtn.cloneNode(true));
            const newInviteBtn = document.getElementById('invite-selected-btn');
            
            // Agregar múltiples tipos de event listeners para asegurar compatibilidad
            newInviteBtn.addEventListener('click', (e) => {
                console.log('🎯 Click event listener activado');
                e.preventDefault();
                e.stopPropagation();
                this.inviteSelectedPlayers();
            });
            
            newInviteBtn.addEventListener('touchstart', (e) => {
                console.log('🎯 Touchstart event listener activado');
                e.preventDefault();
                this.inviteSelectedPlayers();
            });
            
            // También agregar onclick como backup
            newInviteBtn.onclick = (e) => {
                console.log('🎯 onclick handler activado');
                e.preventDefault();
                this.inviteSelectedPlayers();
            };
            
            console.log('✅ Event listeners agregados a invite-selected-btn');
            this.addDebugInfo('button_setup', 'Event listeners configurados correctamente');
        } else {
            console.error('❌ No se encontró invite-selected-btn');
            this.addDebugInfo('button_error', 'Botón no encontrado');
        }
        
        if (toggleDebugBtn) {
            toggleDebugBtn.addEventListener('click', () => this.toggleDebugPanel());
            console.log('✅ Event listener agregado a toggle-debug-btn');
        } else {
            console.error('❌ No se encontró toggle-debug-btn');
        }
    }

    addStyles() {
        if (document.getElementById('invitation-system-styles')) {
            return; // Ya existen los estilos
        }

        const style = document.createElement('style');
        style.id = 'invitation-system-styles';
        style.textContent = `
            .invitation-panel {
                background: linear-gradient(135deg, #1a1a2e, #16213e);
                border: 2px solid #00d4ff;
                border-radius: 15px;
                padding: 20px;
                margin: 20px 0;
                box-shadow: 0 8px 32px rgba(0, 212, 255, 0.3);
            }

            .invitation-panel h3 {
                color: #00d4ff;
                text-align: center;
                margin-bottom: 15px;
                font-size: 1.2em;
            }

            .players-list {
                max-height: 200px;
                overflow-y: auto;
                margin: 15px 0;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 10px;
                padding: 10px;
            }

            .player-item {
                display: flex;
                align-items: center;
                padding: 8px;
                margin: 5px 0;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .player-item:hover {
                background: rgba(0, 212, 255, 0.2);
                transform: translateX(5px);
            }

            .player-item.selected {
                background: rgba(0, 212, 255, 0.3);
                border: 1px solid #00d4ff;
            }

            .player-checkbox {
                margin-right: 10px;
                transform: scale(1.2);
            }

            .player-name {
                color: #fff;
                flex-grow: 1;
            }

            .player-status {
                font-size: 0.8em;
                color: #00ff88;
            }

            .invitation-controls {
                display: flex;
                gap: 10px;
                justify-content: center;
                margin: 15px 0;
            }

            .btn {
                padding: 10px 20px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.3s ease;
            }

            .btn-primary {
                background: linear-gradient(45deg, #00d4ff, #0099cc);
                color: white;
            }

            .btn-primary:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0, 212, 255, 0.4);
            }

            .btn-primary:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .btn-secondary {
                background: linear-gradient(45deg, #ff6b6b, #ee5a52);
                color: white;
            }

            .btn-secondary:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(255, 107, 107, 0.4);
            }

            .btn-info {
                background: linear-gradient(45deg, #17a2b8, #138496);
                color: white;
            }

            .btn-info:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(23, 162, 184, 0.4);
            }

            .status-message {
                margin-top: 10px;
                padding: 8px;
                border-radius: 5px;
                text-align: center;
                font-size: 0.9em;
            }

            .status-info {
                background: rgba(0, 123, 255, 0.2);
                color: #007bff;
                border: 1px solid #007bff;
            }

            .status-success {
                background: rgba(40, 167, 69, 0.2);
                color: #28a745;
                border: 1px solid #28a745;
            }

            .status-error {
                background: rgba(220, 53, 69, 0.2);
                color: #dc3545;
                border: 1px solid #dc3545;
            }

            .debug-panel {
                background: rgba(0, 0, 0, 0.8);
                border: 1px solid #00d4ff;
                border-radius: 10px;
                padding: 15px;
                margin-top: 15px;
                font-size: 0.8em;
                color: #fff;
            }

            .debug-panel h4 {
                color: #00d4ff;
                margin-bottom: 10px;
                text-align: center;
            }

            .debug-panel h5 {
                color: #00d4ff;
                margin: 10px 0 5px 0;
                font-size: 0.9em;
            }

            .debug-panel p {
                margin: 3px 0;
                font-size: 0.8em;
            }

            .btn-small {
                font-size: 0.8em;
                padding: 5px 10px;
                margin-top: 10px;
            }

            /* Modal de invitación */
            .invitation-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }

            .invitation-modal-content {
                background: linear-gradient(135deg, #1a1a2e, #16213e);
                border: 2px solid #00d4ff;
                border-radius: 15px;
                padding: 30px;
                text-align: center;
                max-width: 400px;
                width: 90%;
            }

            .invitation-modal h2 {
                color: #00d4ff;
                margin-bottom: 20px;
            }

            .invitation-modal p {
                color: #fff;
                margin-bottom: 25px;
                font-size: 1.1em;
            }

            .modal-buttons {
                display: flex;
                gap: 15px;
                justify-content: center;
            }

            .btn-accept {
                background: linear-gradient(45deg, #00ff88, #00cc6a);
                color: white;
                padding: 12px 25px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: bold;
            }

            .btn-reject {
                background: linear-gradient(45deg, #ff6b6b, #ee5a52);
                color: white;
                padding: 12px 25px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: bold;
            }

            @media (max-width: 768px) {
                .invitation-panel {
                    padding: 15px;
                    margin: 10px 0;
                }

                .invitation-controls {
                    flex-direction: column;
                }

                .btn {
                    padding: 12px 15px;
                    font-size: 0.9em;
                }
            }
        `;
        document.head.appendChild(style);
    }

    async loadOnlinePlayers() {
        try {
            console.log('🔍 Iniciando loadOnlinePlayers...');
            
            const playerName = this.currentPlayer;
            if (!playerName) {
                console.log('⚠️ No hay nombre de jugador para sistema online');
                this.showStatus('No hay nombre de jugador configurado', 'error');
                return;
            }

            console.log('🎮 Configurando tracking para jugador:', playerName);

            // Verificar que Firebase esté disponible
            if (!window.firebase || !window.firebase.database) {
                console.error('❌ Firebase no está disponible');
                this.showStatus('Firebase no está disponible', 'error');
                return;
            }

            const db = firebase.database();
            console.log('✅ Firebase database obtenido');
            
            // Marcar jugador actual como online (igual que en index.html)
            const playerRef = db.ref(`onlinePlayers/${playerName.replace(/[^a-zA-Z0-9]/g, '_')}`);
            console.log('🔗 Referencia del jugador creada:', playerRef.toString());
            
            const playerData = {
                name: playerName,
                lastSeen: Date.now(),
                status: 'online',
                currentGame: this.currentGame
            };
            
            console.log('📝 Datos del jugador a guardar:', playerData);
            
            playerRef.set(playerData).then(() => {
                console.log('✅ Jugador marcado como online en Firebase');
            }).catch((error) => {
                console.error('❌ Error al marcar jugador como online:', error);
                this.showStatus('Error conectando con Firebase: ' + error.message, 'error');
            });

            // Actualizar lastSeen cada 10 segundos para mantener jugador online
            const keepAliveInterval = setInterval(() => {
                playerRef.update({
                    lastSeen: Date.now()
                }).catch(error => {
                    console.error('❌ Error actualizando lastSeen:', error);
                });
            }, 10000);

            // Remover jugador cuando se cierre la página
            window.addEventListener('beforeunload', () => {
                clearInterval(keepAliveInterval);
                playerRef.remove().catch(error => {
                    console.error('❌ Error removiendo jugador:', error);
                });
            });

            // Escuchar cambios en jugadores online (igual que en index.html)
            const onlinePlayersRef = db.ref('onlinePlayers');
            console.log('👂 Configurando listener para jugadores online...');
            
            onlinePlayersRef.on('value', (snapshot) => {
                console.log('📡 Datos recibidos de Firebase:', snapshot.val());
                
                const players = [];
                const allPlayers = [];
                
                snapshot.forEach((childSnapshot) => {
                    const player = childSnapshot.val();
                    console.log('👤 Procesando jugador:', player);
                    
                    if (player && player.name) {
                        allPlayers.push(player);
                        // Solo mostrar otros jugadores (no el actual)
                        if (player.name !== playerName) {
                            players.push(player);
                        }
                    }
                });
                
                console.log('👥 Jugadores online encontrados:', players.length);
                console.log('📋 Lista de jugadores:', players);
                this.displayOnlinePlayers(players);
            }, (error) => {
                console.error('❌ Error en listener de jugadores online:', error);
                this.showStatus('Error recibiendo datos de Firebase: ' + error.message, 'error');
            });

            // Limpiar jugadores offline (más de 30 segundos) y jugadores inválidos
            setInterval(() => {
                const cutoff = Date.now() - 30000;
                onlinePlayersRef.once('value', (snapshot) => {
                    snapshot.forEach((childSnapshot) => {
                        const player = childSnapshot.val();
                        if (player) {
                            // Remover jugadores offline
                            if (player.lastSeen < cutoff) {
                                console.log('🧹 Limpiando jugador offline:', player.name);
                                childSnapshot.ref.remove();
                            }
                            // Remover jugadores con nombres inválidos
                            else if (!player.name || player.name === 'undefined' || player.name === 'null') {
                                console.log('🧹 Limpiando jugador con nombre inválido:', childSnapshot.key);
                                childSnapshot.ref.remove();
                            }
                        }
                    });
                });
            }, 10000);

        } catch (error) {
            console.error('❌ Error cargando jugadores online:', error);
            console.error('❌ Stack trace:', error.stack);
            this.showStatus('Error cargando jugadores - Verificando conexión...', 'error');
            
            // Intentar reconectar después de 5 segundos
            setTimeout(() => {
                console.log('🔄 Intentando reconectar...');
                this.loadOnlinePlayers();
            }, 5000);
        }
    }

    displayOnlinePlayers(players) {
        const container = document.getElementById('online-players-list');
        if (!container) return;

        if (players.length === 0) {
            container.innerHTML = `<p style="color: #888; text-align: center;">${this.config.messages.noPlayers}</p>`;
            return;
        }

        console.log('🎯 displayOnlinePlayers - players:', players);
        console.log('🎯 displayOnlinePlayers - selectedPlayers antes:', Array.from(this.selectedPlayers));
        this.addDebugInfo('displayOnlinePlayers', `Jugadores encontrados: ${players.length}`);

        container.innerHTML = players.map(player => {
            const playerName = player.name || player.username || 'Jugador Desconocido';
            const playerId = playerName.replace(/[^a-zA-Z0-9]/g, '_');
            
            console.log('🎯 Creando checkbox para:', playerName, 'ID:', playerId);
            
            return `
                <div class="player-item">
                    <input type="checkbox" 
                           class="player-checkbox" 
                           id="player-${playerId}"
                           data-player-id="${playerId}"
                           ${this.selectedPlayers.has(playerId) ? 'checked' : ''}>
                    <span class="player-name">${playerName}</span>
                    <span class="player-status">🟢 Online</span>
                </div>
            `;
        }).join('');

        // Agregar event listeners a los checkboxes
        const checkboxes = container.querySelectorAll('.player-checkbox');
        console.log('🎯 Encontrados', checkboxes.length, 'checkboxes');
        this.addDebugInfo('checkboxes', `Checkboxes encontrados: ${checkboxes.length}`);
        
        checkboxes.forEach(checkbox => {
            console.log('🎯 Agregando listener a checkbox:', checkbox.dataset.playerId);
            
            // Agregar listener para el evento change
            checkbox.addEventListener('change', (e) => {
                const playerId = e.target.dataset.playerId;
                console.log('🎯 Checkbox cambiado:', playerId, 'checked:', e.target.checked);
                this.addDebugInfo('checkbox_change', `${playerId}: ${e.target.checked ? 'marcado' : 'desmarcado'}`);
                
                // Llamar directamente a togglePlayerSelection
                this.togglePlayerSelection(playerId);
            });
            
            // También agregar listener para click para asegurar que funcione en móvil
            checkbox.addEventListener('click', (e) => {
                const playerId = e.target.dataset.playerId;
                console.log('🎯 Checkbox clickeado:', playerId, 'checked:', e.target.checked);
                this.addDebugInfo('checkbox_click', `${playerId}: ${e.target.checked ? 'marcado' : 'desmarcado'}`);
                
                // No llamar aquí para evitar doble llamada, solo en change
            });
        });

        this.updateInviteButton();
        this.updateDebugPanel();
    }

    togglePlayerSelection(playerId) {
        console.log('🎯 togglePlayerSelection llamado con:', playerId);
        console.log('🎯 selectedPlayers antes:', Array.from(this.selectedPlayers));
        this.addDebugInfo('toggle_start', `PlayerId: ${playerId}, Antes: ${Array.from(this.selectedPlayers).join(', ')}`);
        
        if (!playerId) {
            console.error('❌ playerId es undefined o null');
            this.addDebugInfo('error', 'playerId es undefined');
            return;
        }
        
        if (this.selectedPlayers.has(playerId)) {
            this.selectedPlayers.delete(playerId);
            console.log('❌ Removido jugador:', playerId);
            this.addDebugInfo('selection', `Removido: ${playerId}`);
        } else {
            this.selectedPlayers.add(playerId);
            console.log('✅ Agregado jugador:', playerId);
            this.addDebugInfo('selection', `Agregado: ${playerId}`);
        }
        
        console.log('🎯 selectedPlayers después:', Array.from(this.selectedPlayers));
        this.addDebugInfo('toggle_end', `Después: ${Array.from(this.selectedPlayers).join(', ')}`);
        
        this.updateInviteButton();
        this.updateDebugPanel();
    }

    updateInviteButton() {
        const btn = document.getElementById('invite-selected-btn');
        if (!btn) {
            console.log('❌ Botón invite-selected-btn no encontrado');
            this.addDebugInfo('error', 'Botón no encontrado');
            return;
        }

        const count = this.selectedPlayers.size;
        console.log('🎯 updateInviteButton - count:', count);
        console.log('🎯 updateInviteButton - selectedPlayers:', Array.from(this.selectedPlayers));
        
        // Lógica simple: habilitar si hay jugadores seleccionados
        btn.disabled = count === 0;
        btn.textContent = count > 0 ? `🚀 Invitar (${count})` : '🚀 Invitar Seleccionados';
        
        console.log('🎯 Botón habilitado:', !btn.disabled);
        console.log('🎯 Texto del botón:', btn.textContent);
        this.addDebugInfo('button', `Habilitado: ${!btn.disabled}, Texto: ${btn.textContent}`);
        this.updateDebugPanel();
    }

    async inviteSelectedPlayers() {
        // Protección contra múltiples clicks
        if (this.isInviting) {
            console.log('🚀 Ya se está enviando una invitación, ignorando click');
            return;
        }
        
        console.log('🚀 inviteSelectedPlayers llamado');
        console.log('🚀 selectedPlayers.size:', this.selectedPlayers.size);
        console.log('🚀 selectedPlayers:', Array.from(this.selectedPlayers));
        this.addDebugInfo('invite_start', `Iniciando invitación. Jugadores: ${this.selectedPlayers.size}`);
        
        // Verificación más robusta
        const selectedCount = this.selectedPlayers.size;
        const selectedArray = Array.from(this.selectedPlayers);
        
        if (selectedCount === 0 || selectedArray.length === 0) {
            console.log('❌ No hay jugadores seleccionados');
            this.addDebugInfo('invite_error', 'No hay jugadores seleccionados');
            this.showStatus('Selecciona al menos un jugador para invitar', 'error');
            return;
        }

        // Verificar que todos los jugadores seleccionados son válidos
        const validPlayers = selectedArray.filter(playerId => playerId && playerId.trim() !== '');
        if (validPlayers.length === 0) {
            console.log('❌ No hay jugadores válidos seleccionados');
            this.addDebugInfo('invite_error', 'No hay jugadores válidos');
            this.showStatus('Selecciona jugadores válidos para invitar', 'error');
            return;
        }

        // Marcar como enviando
        this.isInviting = true;

        // Deshabilitar el botón inmediatamente para evitar múltiples clicks
        const btn = document.getElementById('invite-selected-btn');
        if (btn) {
            btn.disabled = true;
            btn.textContent = '🚀 Enviando...';
        }

        try {
            this.showStatus(this.config.messages.sendingInvitations, 'info');
            this.addDebugInfo('invite_sending', 'Enviando invitaciones...');
            
            const roomId = this.generateRoomId();
            const invitationData = {
                game: this.currentGame,
                organizer: this.currentPlayer,
                roomId: roomId,
                timestamp: Date.now(),
                expiresAt: Date.now() + this.config.invitation.expirationTime,
                status: 'pending'
            };

            console.log('🚀 Datos de invitación:', invitationData);
            this.addDebugInfo('invite_data', `RoomId: ${roomId}, Game: ${this.currentGame}`);

            // Crear invitaciones para cada jugador seleccionado
            const invitations = [];
            for (const playerId of validPlayers) {
                console.log('🚀 Enviando invitación a:', playerId);
                this.addDebugInfo('invite_player', `Enviando a: ${playerId}`);
                
                const invitationRef = firebase.database().ref(`invitations/${playerId}`);
                await invitationRef.push(invitationData);
                invitations.push(playerId);
            }

            this.roomId = roomId;
            this.isOrganizer = true;
            
            console.log('✅ Invitaciones enviadas:', invitations);
            this.addDebugInfo('invite_success', `Enviadas a: ${invitations.join(', ')}`);
            this.showStatus(`${this.config.messages.invitationsSent} a ${invitations.length} jugadores`, 'success');
            
            // Limpiar selección después de enviar exitosamente
            this.selectedPlayers.clear();
            this.updateInviteButton();
            this.addDebugInfo('invite_clear', 'Selección limpiada');
            
            // Esperar respuestas
            this.waitForResponses(roomId);
            
        } catch (error) {
            console.error('❌ Error enviando invitaciones:', error);
            this.addDebugInfo('invite_error', `Error: ${error.message}`);
            this.showStatus('Error enviando invitaciones', 'error');
            
            // Re-habilitar el botón en caso de error
            if (btn) {
                btn.disabled = false;
                btn.textContent = '🚀 Invitar Seleccionados';
            }
        } finally {
            // Siempre resetear el flag de invitación
            this.isInviting = false;
        }
    }

    async createPrivateRoom() {
        try {
            const roomId = this.generateRoomId();
            this.roomId = roomId;
            this.isOrganizer = true;
            
            // Crear sala en Firebase
            const roomRef = firebase.database().ref(`gameRooms/${roomId}`);
            await roomRef.set({
                game: this.currentGame,
                organizer: this.currentPlayer,
                players: [this.currentPlayer],
                status: 'waiting',
                createdAt: Date.now()
            });
            
            this.showStatus('Sala privada creada. Comparte el enlace para invitar jugadores.', 'success');
            
        } catch (error) {
            console.error('Error creando sala:', error);
            this.showStatus('Error creando sala', 'error');
        }
    }

    generateRoomId() {
        return 'room_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    async waitForResponses(roomId) {
        // Escuchar respuestas en la sala específica
        const responsesRef = firebase.database().ref(`gameRooms/${roomId}/responses`);
        
        responsesRef.on('value', (snapshot) => {
            const responses = snapshot.val() || {};
            const accepted = Object.values(responses).filter(r => r.status === 'accepted').length;
            const rejected = Object.values(responses).filter(r => r.status === 'rejected').length;
            
            if (accepted > 0) {
                this.showStatus(`${accepted} jugador(es) aceptaron la invitación`, 'success');
            }
            
            if (rejected > 0) {
                this.showStatus(`${rejected} jugador(es) rechazaron la invitación`, 'error');
            }
        });
    }

    setupInvitationListeners() {
        // Escuchar invitaciones entrantes
        const invitationsRef = firebase.database().ref(`invitations/${this.currentPlayer}`);
        
        invitationsRef.on('child_added', (snapshot) => {
            const invitation = snapshot.val();
            if (invitation.status === 'pending' && invitation.expiresAt > Date.now()) {
                this.showInvitationModal(invitation, snapshot.key);
            }
        });
    }

    showInvitationModal(invitation, invitationId) {
        // Evitar múltiples modales
        if (document.querySelector('.invitation-modal')) {
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'invitation-modal';
        modal.innerHTML = `
            <div class="invitation-modal-content">
                <h2>🎮 Invitación de Juego</h2>
                <p><strong>${invitation.organizer}</strong> te invita a jugar <strong>${this.getGameDisplayName(invitation.game)}</strong></p>
                <div class="modal-buttons">
                    <button class="btn-accept" onclick="document.querySelector('.invitation-modal').invitationSystem.acceptInvitation('${invitationId}', '${invitation.roomId}')">
                        ✅ Aceptar
                    </button>
                    <button class="btn-reject" onclick="document.querySelector('.invitation-modal').invitationSystem.rejectInvitation('${invitationId}', '${invitation.roomId}')">
                        ❌ Rechazar
                    </button>
                </div>
            </div>
        `;
        
        // Asignar la referencia del sistema de invitaciones al modal
        modal.invitationSystem = this;
        
        document.body.appendChild(modal);
        
        // Auto-cerrar después del tiempo configurado
        setTimeout(() => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
        }, this.config.invitation.autoCloseModal);
    }

    getGameDisplayName(game) {
        return this.config.supportedGames[game]?.name || game;
    }

    async acceptInvitation(invitationId, roomId) {
        try {
            // Responder a la invitación en la sala
            const responseRef = firebase.database().ref(`gameRooms/${roomId}/responses/${this.currentPlayer}`);
            await responseRef.set({
                status: 'accepted',
                timestamp: Date.now()
            });
            
            // Unirse a la sala
            const roomRef = firebase.database().ref(`gameRooms/${roomId}/players`);
            await roomRef.push(this.currentPlayer);
            
            this.roomId = roomId;
            this.showStatus('¡Invitación aceptada! Uniéndose a la sala...', 'success');
            
            // Cerrar modal
            const modal = document.querySelector('.invitation-modal');
            if (modal) document.body.removeChild(modal);
            
        } catch (error) {
            console.error('Error aceptando invitación:', error);
            this.showStatus('Error aceptando invitación', 'error');
        }
    }

    async rejectInvitation(invitationId, roomId) {
        try {
            // Responder a la invitación en la sala
            const responseRef = firebase.database().ref(`gameRooms/${roomId}/responses/${this.currentPlayer}`);
            await responseRef.set({
                status: 'rejected',
                timestamp: Date.now()
            });
            
            this.showStatus('Invitación rechazada', 'error');
            
            // Cerrar modal
            const modal = document.querySelector('.invitation-modal');
            if (modal) document.body.removeChild(modal);
            
        } catch (error) {
            console.error('Error rechazando invitación:', error);
            this.showStatus('Error rechazando invitación', 'error');
        }
    }

    checkForInvitations() {
        // Verificar invitaciones existentes al cargar la página
        const invitationsRef = firebase.database().ref(`invitations/${this.currentPlayer}`);
        invitationsRef.once('value').then((snapshot) => {
            const invitations = snapshot.val() || {};
            Object.entries(invitations).forEach(([id, invitation]) => {
                if (invitation.status === 'pending' && invitation.expiresAt > Date.now()) {
                    this.showInvitationModal(invitation, id);
                }
            });
        });
    }

    showStatus(message, type = 'info') {
        const statusEl = document.getElementById('invitation-status');
        if (!statusEl) return;

        statusEl.textContent = message;
        statusEl.className = `status-message status-${type}`;
        
        // Auto-limpiar después del tiempo configurado
        setTimeout(() => {
            statusEl.textContent = '';
            statusEl.className = 'status-message';
        }, this.config.invitation.statusTimeout);
    }

    startCleanupInterval() {
        if (!this.config.cleanup?.enabled) return;

        setInterval(() => {
            this.cleanupExpiredData();
        }, this.config.cleanup.interval);
    }

    async cleanupExpiredData() {
        try {
            const now = Date.now();
            
            // Limpiar invitaciones expiradas
            if (this.config.cleanup.removeExpiredInvitations) {
                const invitationsRef = firebase.database().ref('invitations');
                const snapshot = await invitationsRef.once('value');
                const invitations = snapshot.val() || {};
                
                Object.entries(invitations).forEach(async ([playerId, playerInvitations]) => {
                    Object.entries(playerInvitations).forEach(async ([invitationId, invitation]) => {
                        if (invitation.expiresAt && invitation.expiresAt < now) {
                            await firebase.database().ref(`invitations/${playerId}/${invitationId}`).remove();
                        }
                    });
                });
            }

            // Limpiar salas antiguas
            if (this.config.cleanup.removeOldRooms) {
                const roomsRef = firebase.database().ref('gameRooms');
                const snapshot = await roomsRef.once('value');
                const rooms = snapshot.val() || {};
                
                Object.entries(rooms).forEach(async ([roomId, room]) => {
                    if (room.createdAt && (now - room.createdAt) > this.config.invitation.maxRoomAge) {
                        await firebase.database().ref(`gameRooms/${roomId}`).remove();
                    }
                });
            }
        } catch (error) {
            console.error('Error en limpieza automática:', error);
        }
    }

    // Métodos públicos para integración con juegos
    getCurrentRoomId() {
        return this.roomId;
    }

    isRoomOrganizer() {
        return this.isOrganizer;
    }

    getGameType() {
        return this.currentGame;
    }

    getGameConfig() {
        return this.config.supportedGames[this.currentGame];
    }

    testConnection() {
        console.log('🧪 Probando conexión manualmente...');
        this.showStatus('Probando conexión...', 'info');
        
        try {
            if (!window.firebase) {
                this.showStatus('❌ Firebase no está cargado', 'error');
                return;
            }

            if (!window.firebase.database) {
                this.showStatus('❌ Firebase Database no está disponible', 'error');
                return;
            }

            const db = firebase.database();
            const testRef = db.ref('.info/connected');
            
            testRef.once('value').then((snapshot) => {
                const connected = snapshot.val();
                if (connected) {
                    this.showStatus('✅ Firebase conectado correctamente', 'success');
                    
                    // Probar escritura
                    const writeTestRef = db.ref('testConnection');
                    writeTestRef.set({
                        timestamp: Date.now(),
                        test: true
                    }).then(() => {
                        this.showStatus('✅ Lectura y escritura funcionando', 'success');
                        // Limpiar test
                        writeTestRef.remove();
                    }).catch(error => {
                        this.showStatus('❌ Error de escritura: ' + error.message, 'error');
                    });
                } else {
                    this.showStatus('❌ Firebase desconectado', 'error');
                }
            }).catch(error => {
                this.showStatus('❌ Error de lectura: ' + error.message, 'error');
            });

        } catch (error) {
            console.error('❌ Error en test de conexión:', error);
            this.showStatus('❌ Error: ' + error.message, 'error');
        }
    }

    toggleDebugPanel() {
        const debugPanel = document.getElementById('debug-panel');
        const toggleBtn = document.getElementById('toggle-debug-btn');
        if (debugPanel && toggleBtn) {
            debugPanel.style.display = debugPanel.style.display === 'none' ? 'block' : 'none';
            toggleBtn.textContent = debugPanel.style.display === 'none' ? '🔍 Ocultar Debug' : '🔍 Mostrar Debug';
        }
    }

    updateDebugPanel() {
        const debugContent = document.getElementById('debug-content');
        if (!debugContent) return;

        debugContent.innerHTML = `
            <h5>Estado de Firebase:</h5>
            <p>Conectado: ${window.firebase?.database()?.ref('.info/connected')?.val() || 'Desconocido'}</p>
            <h5>Configuración del Sistema:</h5>
            <p>Juego Actual: ${this.currentGame}</p>
            <p>Jugador Actual: ${this.currentPlayer}</p>
            <p>Sala Actual: ${this.roomId || 'Ninguna'}</p>
            <p>Organizador: ${this.isOrganizer ? 'Sí' : 'No'}</p>
            <h5>Selección de Jugadores:</h5>
            <p>Jugadores Seleccionados: ${this.selectedPlayers.size}</p>
            <p>Jugadores en Lista: ${this.config.supportedGames[this.currentGame]?.minPlayers || 'N/A'} - ${this.config.supportedGames[this.currentGame]?.maxPlayers || 'N/A'}</p>
            <h5>Invitaciones Pendientes:</h5>
            <p>Invitaciones Recibidas: ${this.invitations.size}</p>
            <p>Invitaciones Enviadas: ${this.invitations.size}</p>
            <h5>Tiempo de Expiración:</h5>
            <p>Tiempo de Invitación: ${this.config.invitation.expirationTime / 1000} segundos</p>
            <p>Tiempo de Auto-cierre Modal: ${this.config.invitation.autoCloseModal / 1000} segundos</p>
            <p>Tiempo de Estado: ${this.config.invitation.statusTimeout / 1000} segundos</p>
        `;
    }

    addDebugInfo(category, message) {
        const timestamp = new Date().toLocaleTimeString();
        const debugInfo = `[${timestamp}] ${category}: ${message}`;
        console.log(debugInfo);
        
        // Agregar al panel de debug si existe
        const debugContent = document.getElementById('debug-content');
        if (debugContent) {
            const debugLine = document.createElement('div');
            debugLine.textContent = debugInfo;
            debugContent.appendChild(debugLine);
            
            // Mantener solo las últimas 20 líneas
            while (debugContent.children.length > 20) {
                debugContent.removeChild(debugContent.firstChild);
            }
        }
    }
}

// Inicializar sistema cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    if (typeof firebase !== 'undefined') {
        window.invitationSystem = new InvitationSystem();
        // Actualizar el panel de debug al cargar la página
        window.invitationSystem.updateDebugPanel();
    }
}); 