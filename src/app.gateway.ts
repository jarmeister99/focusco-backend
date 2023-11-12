// app.gateway.ts
import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ namespace: '/api', cors: true })
export class AppGateway implements OnGatewayInit {
    @WebSocketServer() server: Server;

    afterInit(server: Server) {
    }

    @SubscribeMessage('message')
    handleMessage(client: any, payload: any): string {
        return 'Hello world!';
    }

    sendEventToClient(data: any): void {
        this.server.emit('message', data);
    }
}