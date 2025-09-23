import { PlayerType, MinimaxResult } from "../types/GameTypes";
import { WIN_PATTERNS } from "../constants/GameConstants";

export class AIPlayer {
    private difficulty: number;

    constructor(difficulty: number = 1) {
        this.difficulty = difficulty;
    }

    getBestMove(board: PlayerType[]): number {
        if (Math.random() > this.difficulty) {
            const availableMoves = this.getAvailableMoves(board);
            return availableMoves[
                Math.floor(Math.random() * availableMoves.length)
            ];
        }

        const result = this.minimax(board, PlayerType.AI);
        return result.index !== undefined ? result.index : 0;
    }

    private getAvailableMoves(board: PlayerType[]): number[] {
        return board
            .map((cell, index) => (cell === PlayerType.NONE ? index : null))
            .filter((val): val is number => val !== null);
    }

    private minimax(
        board: PlayerType[],
        player: PlayerType,
        depth: number = 0
    ): MinimaxResult {
        const availableMoves = this.getAvailableMoves(board);
        const winner = this.checkWinnerForBoard(board);

        if (winner === PlayerType.HUMAN) return { score: -10 + depth };
        if (winner === PlayerType.AI) return { score: 10 - depth };
        if (availableMoves.length === 0) return { score: 0 };

        const moves: MinimaxResult[] = [];

        for (const move of availableMoves) {
            const newBoard = [...board];
            newBoard[move] = player;

            const result =
                player === PlayerType.AI
                    ? this.minimax(newBoard, PlayerType.HUMAN, depth + 1)
                    : this.minimax(newBoard, PlayerType.AI, depth + 1);

            moves.push({ score: result.score, index: move });
        }

        return player === PlayerType.AI
            ? moves.reduce((best, move) =>
                  move.score > best.score ? move : best
              )
            : moves.reduce((best, move) =>
                  move.score < best.score ? move : best
              );
    }

    private checkWinnerForBoard(board: PlayerType[]): PlayerType {
        for (const pattern of WIN_PATTERNS) {
            const [a, b, c] = pattern;
            if (
                board[a] !== PlayerType.NONE &&
                board[a] === board[b] &&
                board[a] === board[c]
            ) {
                return board[a];
            }
        }
        return PlayerType.NONE;
    }

    setDifficulty(difficulty: number): void {
        this.difficulty = difficulty;
    }
}
