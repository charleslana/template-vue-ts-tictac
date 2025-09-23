import { PlayerType, GameResult } from "../types/GameTypes";
import { WIN_PATTERNS } from "../constants/GameConstants";

export class GameBoard {
    public board: PlayerType[] = [];
    public cells: Phaser.GameObjects.Image[] = [];
    public completedLines: number[][] = [];

    constructor() {
        this.reset();
    }

    reset(): void {
        this.board = new Array(9).fill(PlayerType.NONE);
        this.completedLines = [];
    }

    makeMove(index: number, player: PlayerType): boolean {
        if (this.isValidMove(index)) {
            this.board[index] = player;
            return true;
        }
        return false;
    }

    isValidMove(index: number): boolean {
        return index >= 0 && index < 9 && this.board[index] === PlayerType.NONE;
    }

    getAvailableMoves(): number[] {
        return this.board
            .map((cell, index) => (cell === PlayerType.NONE ? index : null))
            .filter((val): val is number => val !== null);
    }

    checkWinner(): GameResult {
        const completedLines: number[][] = [];
        let winner = PlayerType.NONE;

        for (const pattern of WIN_PATTERNS) {
            const [a, b, c] = pattern;
            if (
                this.board[a] !== PlayerType.NONE &&
                this.board[a] === this.board[b] &&
                this.board[a] === this.board[c]
            ) {
                completedLines.push([...pattern]);
                winner = this.board[a];
            }
        }

        return { winner, lines: completedLines };
    }

    isFull(): boolean {
        return !this.board.includes(PlayerType.NONE);
    }

    clearLines(lines: number[][]): void {
        const cellsToClear = new Set<number>();

        for (const line of lines) {
            for (const index of line) {
                cellsToClear.add(index);
            }
            this.completedLines.push(line);
        }

        for (const index of cellsToClear) {
            this.board[index] = PlayerType.NONE;
        }
    }

    clone(): PlayerType[] {
        return [...this.board];
    }
}
