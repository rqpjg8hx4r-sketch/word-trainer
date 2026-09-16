/* 通用家庭局域网与 P2P 房间联机引擎 (支持 4G/5G 手机信号与内网 Wi-Fi 直连) */
class P2PRoom {
  constructor(options = {}) {
    this.prefix = options.prefix || 'study4alex-room-';
    this.peer = null;
    this.isHost = false;
    this.roomCode = null;
    this.connections = new Map(); // peerId -> DataConnection (Host side)
    this.hostConn = null; // DataConnection (Client side)
    this.myPlayerInfo = null;
    this.eventListeners = {};
  }

  on(event, callback) {
    if (!this.eventListeners[event]) this.eventListeners[event] = [];
    this.eventListeners[event].push(callback);
  }

  emit(event, data) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(cb => {
        try { cb(data); } catch (e) { console.error('Event error:', e); }
      });
    }
  }

  // 房主创建房间
  createHost(roomCode, hostPlayerInfo) {
    return new Promise((resolve, reject) => {
      this.isHost = true;
      this.roomCode = String(roomCode).padStart(4, '0');
      this.myPlayerInfo = { id: 'host', isHost: true, ...hostPlayerInfo };

      const peerId = `${this.prefix}${this.roomCode}`;
      this.peer = new Peer(peerId, {
        debug: 1,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        }
      });

      this.peer.on('open', (id) => {
        console.log('Host room created with Peer ID:', id);
        this.emit('roomCreated', { roomCode: this.roomCode, peerId: id });
        resolve(this.roomCode);
      });

      this.peer.on('connection', (conn) => {
        this.handleIncomingConnection(conn);
      });

      this.peer.on('error', (err) => {
        console.error('Peer error on host:', err);
        this.emit('error', err);
        if (err.type === 'unavailable-id') {
          reject(new Error('ROOM_CODE_OCCUPIED'));
        } else {
          reject(err);
        }
      });
    });
  }

  handleIncomingConnection(conn) {
    conn.on('open', () => {
      this.connections.set(conn.peer, conn);
    });

    conn.on('data', (data) => {
      this.handleHostReceivedData(conn, data);
    });

    conn.on('close', () => {
      this.connections.delete(conn.peer);
      this.emit('playerDisconnected', conn.peer);
    });

    conn.on('error', (err) => {
      console.warn('Connection error with peer:', conn.peer, err);
      this.connections.delete(conn.peer);
      this.emit('playerDisconnected', conn.peer);
    });
  }

  handleHostReceivedData(conn, data) {
    if (!data || !data.type) return;
    this.emit('message', { peerId: conn.peer, data });
  }

  // 玩家加入房间
  joinRoom(roomCode, playerInfo) {
    return new Promise((resolve, reject) => {
      this.isHost = false;
      this.roomCode = String(roomCode).padStart(4, '0');
      this.myPlayerInfo = { ...playerInfo };

      // 生成客户端临时 Peer ID
      const randomId = `s4a-p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      this.peer = new Peer(randomId, {
        debug: 1,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        }
      });

      this.peer.on('open', (myId) => {
        this.myPlayerInfo.id = myId;
        const targetHostPeerId = `${this.prefix}${this.roomCode}`;
        console.log(`Connecting to Host: ${targetHostPeerId}...`);

        this.hostConn = this.peer.connect(targetHostPeerId, {
          reliable: true
        });

        this.hostConn.on('open', () => {
          console.log('Connected to Host!');
          this.hostConn.send({
            type: 'JOIN_ROOM',
            player: this.myPlayerInfo
          });
          this.emit('connected', { roomCode: this.roomCode });
          resolve();
        });

        this.hostConn.on('data', (data) => {
          if (!data || !data.type) return;
          this.emit('message', { data });
        });

        this.hostConn.on('close', () => {
          console.warn('Host connection closed');
          this.emit('hostDisconnected');
        });

        this.hostConn.on('error', (err) => {
          console.error('Connection to host error:', err);
          this.emit('error', err);
          reject(err);
        });
      });

      this.peer.on('error', (err) => {
        console.error('Peer error on client:', err);
        this.emit('error', err);
        reject(err);
      });
    });
  }

  // 房主广播给所有已连接客户端
  broadcast(type, payload = {}) {
    if (!this.isHost) return;
    const msg = { type, payload, timestamp: Date.now() };
    this.connections.forEach((conn) => {
      if (conn.open) {
        try { conn.send(msg); } catch (e) { console.warn('Send error to peer:', conn.peer, e); }
      }
    });
  }

  // 房主发送给特定玩家
  sendTo(peerId, type, payload = {}) {
    if (!this.isHost) return;
    const conn = this.connections.get(peerId);
    if (conn && conn.open) {
      conn.send({ type, payload, timestamp: Date.now() });
    }
  }

  // 客户端发送给房主
  sendToHost(type, payload = {}) {
    if (this.isHost) return;
    if (this.hostConn && this.hostConn.open) {
      this.hostConn.send({ type, payload, timestamp: Date.now() });
    }
  }

  // 销毁与退出
  destroy() {
    if (this.hostConn) {
      try { this.hostConn.close(); } catch (e) {}
    }
    this.connections.forEach(c => {
      try { c.close(); } catch (e) {}
    });
    this.connections.clear();
    if (this.peer) {
      try { this.peer.destroy(); } catch (e) {}
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = P2PRoom;
} else if (typeof window !== 'undefined') {
  window.P2PRoom = P2PRoom;
}
