import { createServer } from 'https';
import { readFileSync, statSync } from 'fs';
import { join, extname } from 'path';
import { IncomingMessage, ServerResponse } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import os from "os";

// ==== TYPES ====

type Role = 'client' | 'server';

interface RegisterMessage {
  type: 'register';
  role: Role;
}

interface ChatMessage {
  type: 'message';
  target: Role;
  message: string;
}

type Message = RegisterMessage | ChatMessage;

// ==== SSL CONFIG ====

const options = {
  key: readFileSync('./key.pem'),
  cert: readFileSync('./cert.pem'),
};

// ==== STATIC FILE SERVER ====

const server = createServer(
  options,
  (req: IncomingMessage, res: ServerResponse) => {
    let urlPath = req.url === '/' ? '/client/' : req.url || '';
    let filePath = join(__dirname, '../../public', urlPath);

    try {
      if (statSync(filePath).isDirectory()) {
        filePath = join(filePath, 'index.html');
      }

      const fileData = readFileSync(filePath);
      const ext = extname(filePath);
      const mimeTypes: Record<string, string> = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
      };

      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
      res.end(fileData);
    } catch {
      res.writeHead(404);
      res.end('Not Found');
    }
  }
);

// ==== WEBSOCKET SERVER ====

const wss = new WebSocketServer({ server });

const clients: Record<Role, WebSocket | null> = {
  client: null,
  server: null,
};

wss.on('connection', (ws: WebSocket) => {
  let role: Role | null = null;

  ws.on('message', (data) => {
    let msg: Partial<Message>;

    try {
      msg = JSON.parse(data.toString());
    } catch {
      ws.send('Invalid message format.');
      return;
    }

    // Handle role registration
    if (
      msg.type === 'register' &&
      (msg.role === 'client' || msg.role === 'server')
    ) {
      role = msg.role;
      clients[role] = ws;
      ws.send(`Registered as ${role}`);
      return;
    }

    // Handle message passing between roles
    if (
      msg.type === 'message' &&
      (msg.target === 'client' || msg.target === 'server') &&
      typeof msg.message === 'string'
    ) {
      const targetWs = clients[msg.target];
      if (targetWs && targetWs.readyState === WebSocket.OPEN) {
        targetWs.send(`[${role}] ${msg.message}`);
      } else {
        ws.send(`Target "${msg.target}" is not connected.`);
      }
    }
  });

  ws.on('close', () => {
    if (role) {
      clients[role] = null;
    }
  });
});

function getLocalIp(): string | null {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }

  return null;
}

// ==== START SERVER ====

server.listen(8080, () => {
  const ip = getLocalIp() || "localhost";
  console.log(` server running at:`);;
  console.log(` client ip  → https://${ip}:8080`);
  console.log(` server ip  → https://${ip}:8080/server`);
});

