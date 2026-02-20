import {
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: '*' })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(@ConnectedSocket() client: Socket) {
    console.log('Client connected', client.id);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log('Client disconnected', client.id);
  }

  @SubscribeMessage('events')
  handleEvent(@MessageBody() data: string) {
    console.log('Event received', data);
    return data;
  }

  @SubscribeMessage('join-pr')
  async handleJoinPR(
    @MessageBody() data: { pullRequestId: number },
    @ConnectedSocket() client: Socket,
  ) {
    await client.join(`pr:${data.pullRequestId}`);
    client.emit('joined', `Joined PR ${data.pullRequestId}`);
    this.server.emit('joined', `Joined PR ${data.pullRequestId}`);
    return data;
  }

  @SubscribeMessage('leave-pr')
  async handleLeavePR(
    @MessageBody() data: { pullRequestId: number },
    @ConnectedSocket() client: Socket,
  ) {
    await client.leave(`pr:${data.pullRequestId}`);
    client.emit('left', `Left PR ${data.pullRequestId}`);
    this.server.emit('left', `Left PR ${data.pullRequestId}`);
    return data;
  }
}
