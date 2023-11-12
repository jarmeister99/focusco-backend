// app.gateway.ts
import { Logger } from '@nestjs/common';
import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ namespace: '/api', cors: { origin: '*' } })
export class AppGateway implements OnGatewayInit {
    @WebSocketServer() server: Server;

    afterInit(server: Server) {
    }

    @SubscribeMessage('message')
    handleMessage(client: any, payload: any): string {
        return 'Hello world!';
    }

    sendEventToClient(data: any): void {
        Logger.log('Sending event to client!!!')
        this.server.emit('message', data);
    }
}