import { red } from "picocolors";
import { WebSocketServer, WebSocket } from "ws";
import { HMR_PORT } from "./constants";

import {Server} from "connect";

export interface WebSocketServerInstance {
    send: (msg: Object) => void;
    close: () => void;
}

export function createWebSocketServer(server: Server): WebSocketServerInstance {
    const wss = new WebSocketServer({ port: HMR_PORT });

    wss.on('connection', socket => {
        socket.send(JSON.stringify({type: 'connected'}));
    });

    wss.on('error', (e: Error & {code: string}) => {
        if (e.code !== 'EADDRINUSE') {
            console.error(red(`WebSocket server error:\n${e.stack || e.message}`));
        }
    });

    return {
        send(payload) {
            const stringified = JSON.stringify(payload);
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                  client.send(stringified);
                }
            });
        },
        close() {
            wss.close();
        },
    }
}
