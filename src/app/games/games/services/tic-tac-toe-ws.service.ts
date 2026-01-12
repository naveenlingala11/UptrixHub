import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TicTacToeWsService {

  private socket!: WebSocket;

  game$ = new BehaviorSubject<any>(null);

  /* ================= CONNECT ================= */
  connect(token: string) {
    const url =
      `${environment.wsUrl}/ws/tic-tac-toe?token=${token}`;

    this.socket = new WebSocket(url);

    this.socket.onmessage = (e) => {
      this.game$.next(JSON.parse(e.data));
    };

    this.socket.onerror = (e) => {
      console.error('❌ TicTacToe WS error', e);
    };

    this.socket.onclose = () => {
      console.warn('⚠️ TicTacToe WS closed');
    };
  }

  /* ================= ACTIONS ================= */

  join(roomId: string) {
    this.send({
      type: 'JOIN',
      roomId
    });
  }

  move(roomId: string, index: number) {
    this.send({
      type: 'MOVE',
      roomId,
      index
    });
  }

  match() {
    this.send({
      type: 'MATCH'
    });
  }

  /* ================= INTERNAL ================= */

  private send(payload: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(payload));
    } else {
      console.warn('⚠️ WS not connected yet');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
    }
  }
}
