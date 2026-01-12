import { Injectable } from '@angular/core';
import { Game2048Engine, Direction } from '../../2048/game-2048.engine';

@Injectable({ providedIn: 'root' })
export class Game2048AiService {

  bestMove(game: Game2048Engine): Direction {
    const dirs: Direction[] = ['LEFT', 'UP', 'RIGHT', 'DOWN'];
    let bestScore = -Infinity;
    let bestDir: Direction = 'LEFT';

    for (const dir of dirs) {
      const clone = this.cloneGame(game);
      const moved = clone.move(dir);
      if (!moved) continue;

      const score =
        this.emptyCells(clone) * 10 +
        this.maxTile(clone) * 2;

      if (score > bestScore) {
        bestScore = score;
        bestDir = dir;
      }
    }
    return bestDir;
  }

  private emptyCells(game: Game2048Engine): number {
    return game.grid.flat().filter(v => v === 0).length;
  }

  private maxTile(game: Game2048Engine): number {
    return Math.max(...game.grid.flat());
  }

  private cloneGame(game: Game2048Engine): Game2048Engine {
    const g = new Game2048Engine(game.size);
    g.grid = game.grid.map(r => [...r]);
    g.score = game.score;
    return g;
  }
}
