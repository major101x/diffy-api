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

  @SubscribeMessage('join-pr-room')
  async handleJoinPRRoom(
    @MessageBody() data: { pullRequestId: number; username: string },
    @ConnectedSocket() client: Socket<any, any, any, { username: string }>,
  ) {
    await client.join(`pr:${data.pullRequestId}`);
    client
      .to(`pr:${data.pullRequestId}`)
      .emit('joined', `${data.username} has joined the chat`);
    client.data.username = data.username;
    const clientsInRoom = this.server
      .in(`pr:${data.pullRequestId}`)
      .fetchSockets();
    const users = (await clientsInRoom).map(
      (client: { data: { username: string } }) => client.data.username,
    );
    const userCount = users.length;
    this.server
      .to(`pr:${data.pullRequestId}`)
      .emit('user-count', { userCount });
    this.server.to(`pr:${data.pullRequestId}`).emit('active-users', users);
    return data;
  }

  @SubscribeMessage('leave-pr-room')
  async handleLeavePRRoom(
    @MessageBody() data: { pullRequestId: number; username: string },
    @ConnectedSocket() client: Socket,
  ) {
    await client.leave(`pr:${data.pullRequestId}`);
    this.server
      .to(`pr:${data.pullRequestId}`)
      .emit('left', `${data.username} left PR ${data.pullRequestId}`);
    const clientsInRoom = this.server
      .in(`pr:${data.pullRequestId}`)
      .fetchSockets();
    const users = (await clientsInRoom).map(
      (client: { data: { username: string } }) => client.data.username,
    );
    const userCount = users.length;
    this.server
      .to(`pr:${data.pullRequestId}`)
      .emit('user-count', { userCount });
    this.server.to(`pr:${data.pullRequestId}`).emit('active-users', users);
    return data;
  }

  @SubscribeMessage('joined')
  handleJoined(@MessageBody() data: { pullRequestId: number }) {
    this.server
      .to(`pr:${data.pullRequestId}`)
      .emit('joined', `Joined PR ${data.pullRequestId}`);
    return data;
  }

  @SubscribeMessage('left')
  handleLeft(@MessageBody() data: { pullRequestId: number }) {
    // this.server
    //   .to(`pr:${data.pullRequestId}`)
    //   .emit('left', `Left PR ${data.pullRequestId}`);
    console.log('Left PR', data.pullRequestId);
    return data;
  }

  @SubscribeMessage('send-message-to-pr-room')
  handleMessage(
    @MessageBody()
    data: {
      message: string;
      pullRequestId: number;
      username: string;
    },
  ) {
    this.server.to(`pr:${data.pullRequestId}`).emit('pr-room-message', {
      message: data.message,
      username: data.username,
    });
    return data;
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { pullRequestId: number; username: string },
  ) {
    this.server
      .to(`pr:${data.pullRequestId}`)
      .emit('typing', { username: data.username });
    return data;
  }

  @SubscribeMessage('stop-typing')
  handleStopTyping(
    @MessageBody() data: { pullRequestId: number; username: string },
  ) {
    this.server
      .to(`pr:${data.pullRequestId}`)
      .emit('stop-typing', { username: data.username });
    return data;
  }
}
