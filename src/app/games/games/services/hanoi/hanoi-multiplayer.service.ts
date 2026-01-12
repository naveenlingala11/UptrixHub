import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HanoiMultiplayerService {

  private socket!: WebSocket;

  connect(room: string, onMessage: (data: any) => void) {
    this.socket = new WebSocket(`${environment.wsUrl}/ws/hanoi`);

    this.socket.onopen = () => {
      this.send({ room, type: 'JOIN' });
    };

    this.socket.onmessage = e => {
      onMessage(JSON.parse(e.data));
    };
  }

  sendMove(room: string, move: any) {
    this.send({
      type: 'MOVE',
      room,
      move
    });
  }

  private send(payload: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(payload));
    }
  }

  disconnect() {
    this.socket?.close();
  }
}
