import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TicTacToeWsService {

  private socket!: WebSocket;
  game$ = new Subject<any>();

  connect(token: string) {
    this.socket = new WebSocket(
      `ws://localhost:8080/ws/tic-tac-toe?token=${token}`
    );

    this.socket.onmessage = e => {
      this.game$.next(JSON.parse(e.data));
    };
  }

  join(roomId: string) {
    this.send({ type: 'JOIN', roomId });
  }

  move(roomId: string, index: number) {
    this.send({ type: 'MOVE', roomId, index });
  }

  private send(data: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }
  
  match() {
    this.send({ type: 'MATCH' });
  }

}
