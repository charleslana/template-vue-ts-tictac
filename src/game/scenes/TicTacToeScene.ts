import * as Phaser from "phaser";
import { GameBoard } from "../board/GameBoard";
import { AIPlayer } from "../ai/AIPlayer";
import { CharacterManager } from "../characters/Character";
import { UIManager } from "../ui/UIManager";
import { EffectsManager } from "../effects/EffectsManager";
import { TextureManager } from "../effects/TextureManager";
import {
    GameState,
    PlayerType,
    GameScore,
    Character,
} from "../types/GameTypes";
import { GameConstants } from "../constants/GameConstants";

export class TicTacToeScene extends Phaser.Scene {
    // Core game systems
    private gameBoard!: GameBoard;
    private aiPlayer!: AIPlayer;
    private uiManager!: UIManager;
    private effectsManager!: EffectsManager;

    // Game state
    private currentState: GameState = GameState.WAITING_PLAYER;
    private score: GameScore = { player: 0, ai: 0, ties: 0 };

    // Game objects
    private marks: Phaser.GameObjects.Image[] = [];
    private playerCharacter!: Character;
    private enemyCharacter!: Character;

    constructor() {
        super({ key: "TicTacToeScene" });
    }

    preload(): void {
        TextureManager.createTextures(this);
    }

    create(): void {
        this.initializeManagers();
        this.initializeGame();
        this.createGameElements();
        this.setupEventListeners();
        this.handleResize();
    }

    update(_time: number, delta: number): void {
        this.effectsManager.updateDamageAnimations(delta);
    }

    private initializeManagers(): void {
        this.gameBoard = new GameBoard();
        this.aiPlayer = new AIPlayer(1);
        this.uiManager = new UIManager(this);
        this.effectsManager = new EffectsManager(this);
    }

    private initializeGame(): void {
        this.currentState = GameState.WAITING_PLAYER;
        this.score = { player: 0, ai: 0, ties: 0 };
    }

    private createGameElements(): void {
        this.effectsManager.createBackground();
        this.createCharacters();
        this.uiManager.createUI(() => this.resetGame());
        this.createGameBoard();
    }

    private createCharacters(): void {
        this.playerCharacter = CharacterManager.createCharacter(
            this,
            200,
            this.scale.height / 2,
            GameConstants.COLORS.PLAYER_BG,
            12,
            12,
            0,
            "JOGADOR"
        );

        this.enemyCharacter = CharacterManager.createCharacter(
            this,
            this.scale.width - 200,
            this.scale.height / 2,
            GameConstants.COLORS.ENEMY_BG,
            3,
            3,
            0,
            "INIMIGO"
        );
    }

    private createGameBoard(): void {
        const startX =
            this.scale.width / 2 -
            (GameConstants.GRID_SIZE * GameConstants.CELL_SIZE +
                (GameConstants.GRID_SIZE - 1) * 10) /
                2;
        const startY =
            this.scale.height / 2 -
            (GameConstants.GRID_SIZE * GameConstants.CELL_SIZE +
                (GameConstants.GRID_SIZE - 1) * 10) /
                2;

        for (let i = 0; i < 9; i++) {
            const row = Math.floor(i / GameConstants.GRID_SIZE);
            const col = i % GameConstants.GRID_SIZE;
            const x = startX + col * (GameConstants.CELL_SIZE + 10);
            const y = startY + row * (GameConstants.CELL_SIZE + 10);

            const cell = this.add.image(x, y, "cell").setOrigin(0);
            cell.setInteractive();

            this.setupCellEvents(cell, i);
            this.gameBoard.cells.push(cell);
        }
    }

    private setupCellEvents(
        cell: Phaser.GameObjects.Image,
        index: number
    ): void {
        cell.on("pointerover", () => {
            if (
                this.gameBoard.isValidMove(index) &&
                this.currentState === GameState.WAITING_PLAYER
            ) {
                cell.setTexture("cell-hover");
            }
        });

        cell.on("pointerout", () => {
            if (
                this.gameBoard.isValidMove(index) &&
                this.currentState === GameState.WAITING_PLAYER
            ) {
                cell.setTexture("cell");
            }
        });

        cell.on("pointerdown", () => {
            this.handlePlayerMove(index);
        });
    }

    private setupEventListeners(): void {
        this.scale.on("resize", this.handleResize, this);
    }

    private handlePlayerMove(index: number): void {
        if (
            this.currentState !== GameState.WAITING_PLAYER ||
            !this.gameBoard.isValidMove(index)
        ) {
            return;
        }
        this.makeMove(index, PlayerType.HUMAN);
    }

    private handleAIMove(): void {
        if (this.currentState !== GameState.AI_THINKING) return;
        const bestMove = this.aiPlayer.getBestMove(this.gameBoard.board);
        this.makeMove(bestMove, PlayerType.AI);
    }

    private makeMove(index: number, player: PlayerType): void {
        if (!this.gameBoard.makeMove(index, player)) return;

        this.createMoveAnimation(index, player);
        this.checkGameResult(player);
    }

    private createMoveAnimation(index: number, player: PlayerType): void {
        const cell = this.gameBoard.cells[index];
        const texture = player === PlayerType.HUMAN ? "x-mark" : "o-mark";

        const mark = this.add
            .image(
                cell.x + GameConstants.CELL_SIZE / 2,
                cell.y + GameConstants.CELL_SIZE / 2,
                texture
            )
            .setOrigin(0.5);

        this.marks.push(mark);
        this.effectsManager.createScaleAnimation(mark);
    }

    private checkGameResult(player: PlayerType): void {
        const result = this.gameBoard.checkWinner();

        if (result.winner !== PlayerType.NONE && result.lines.length > 0) {
            this.handleLineCompletion(result.winner, result.lines);
        } else if (this.gameBoard.isFull()) {
            this.handleTie();
        } else {
            this.continueGame(player);
        }
    }

    private continueGame(player: PlayerType): void {
        if (player === PlayerType.HUMAN) {
            this.currentState = GameState.AI_THINKING;
            this.uiManager.updateStatus("IA pensando...");
            this.time.delayedCall(500, () => this.handleAIMove());
        } else {
            this.currentState = GameState.WAITING_PLAYER;
            this.uiManager.updateStatus(
                "Sua vez! (X)",
                GameConstants.COLORS.TEXT_YELLOW
            );
        }
    }

    private handleLineCompletion(winner: PlayerType, lines: number[][]): void {
        const totalDamage = lines.length * GameConstants.DAMAGE_PER_LINE;
        const isPlayerWinner = winner === PlayerType.HUMAN;

        this.applyDamage(totalDamage, isPlayerWinner);
        this.showCombatEffects(totalDamage, isPlayerWinner, lines.length);
        this.clearCompletedLines(lines);

        this.time.delayedCall(1000, () => {
            this.checkForGameEnd() || this.continueCombat();
        });
    }

    private applyDamage(damage: number, isPlayerWinner: boolean): void {
        const target = isPlayerWinner
            ? this.enemyCharacter
            : this.playerCharacter;
        const attacker = isPlayerWinner
            ? this.playerCharacter
            : this.enemyCharacter;

        target.health -= damage;
        attacker.damage += damage;

        CharacterManager.updateCharacterUI(target);
        CharacterManager.updateCharacterUI(attacker);
    }

    private showCombatEffects(
        damage: number,
        isPlayerWinner: boolean,
        lineCount: number
    ): void {
        const target = isPlayerWinner
            ? this.enemyCharacter
            : this.playerCharacter;

        // Damage text animation
        this.effectsManager.createDamageText(
            target.container.x,
            target.container.y - 80,
            damage,
            !isPlayerWinner
        );

        // Status message
        const statusMessage = `Combo! ${lineCount} linhas! ⚔️ -${damage} de dano`;
        const statusColor = isPlayerWinner
            ? GameConstants.COLORS.TEXT_GREEN
            : GameConstants.COLORS.TEXT_RED;

        this.uiManager.updateStatus(statusMessage, statusColor);

        // Shake effect
        const shakeDirection = isPlayerWinner ? 10 : -10;
        this.effectsManager.createShakeEffect(target.container, shakeDirection);
    }

    private clearCompletedLines(lines: number[][]): void {
        const cellsToClear = new Set<number>();
        lines.forEach((line) =>
            line.forEach((index) => cellsToClear.add(index))
        );

        // Animation to clear lines
        cellsToClear.forEach((index) => {
            const cell = this.gameBoard.cells[index];
            this.tweens.add({
                targets: cell,
                alpha: 0.3,
                duration: 500,
            });
        });

        // Clear lines after animation
        this.time.delayedCall(800, () => {
            this.gameBoard.clearLines(lines);
            this.restoreClearedCells(cellsToClear);
        });
    }

    private restoreClearedCells(cellsToClear: Set<number>): void {
        cellsToClear.forEach((index) => {
            const cell = this.gameBoard.cells[index];
            cell.setTexture("cell");
            cell.setAlpha(1);
        });

        // Remove visual marks for cleared cells
        this.marks = this.marks.filter((mark) => {
            const markIndex = this.findMarkIndex(mark);
            if (cellsToClear.has(markIndex)) {
                mark.destroy();
                return false;
            }
            return true;
        });
    }

    private findMarkIndex(mark: Phaser.GameObjects.Image): number {
        return this.gameBoard.cells.findIndex(
            (cell) =>
                Math.abs(mark.x - (cell.x + GameConstants.CELL_SIZE / 2)) <
                    10 &&
                Math.abs(mark.y - (cell.y + GameConstants.CELL_SIZE / 2)) < 10
        );
    }

    private checkForGameEnd(): boolean {
        if (
            this.playerCharacter.health <= 0 ||
            this.enemyCharacter.health <= 0
        ) {
            this.handleGameEnd();
            return true;
        }
        return false;
    }

    private continueCombat(): void {
        this.currentState = GameState.WAITING_PLAYER;
        this.uiManager.updateStatus(
            "Sua vez! (X)",
            GameConstants.COLORS.TEXT_YELLOW
        );
    }

    private handleGameEnd(): void {
        this.currentState = GameState.GAME_OVER;

        if (this.playerCharacter.health <= 0) {
            this.score.ai++;
            this.uiManager.updateStatus(
                "Você foi derrotado! 💀",
                GameConstants.COLORS.TEXT_RED
            );
        } else {
            this.score.player++;
            this.uiManager.updateStatus(
                "Você venceu! 🎉",
                GameConstants.COLORS.TEXT_GREEN
            );
        }

        this.uiManager.updateScore(this.score);
        this.uiManager.animateStatusText();
    }

    private handleTie(): void {
        this.uiManager.updateStatus(
            "Empate! Reiniciando partida...",
            GameConstants.COLORS.TEXT_YELLOW
        );
        this.time.delayedCall(1500, () => this.resetBoardOnly());
    }

    private resetBoardOnly(): void {
        this.gameBoard.reset();
        this.currentState = GameState.WAITING_PLAYER;

        this.marks.forEach((mark) => mark.destroy());
        this.marks = [];

        this.gameBoard.cells.forEach((cell) => {
            cell.setTexture("cell");
            cell.setAlpha(1);
        });

        this.uiManager.updateStatus(
            "Sua vez! (X)",
            GameConstants.COLORS.TEXT_YELLOW
        );
        this.uiManager.resetStatusScale();
    }

    private resetGame(): void {
        this.effectsManager.clearAllAnimations();
        this.resetBoardOnly();
        this.resetCharacters();
    }

    private resetCharacters(): void {
        // Reset player character
        this.playerCharacter.health = 12;
        this.playerCharacter.maxHealth = 12;
        this.playerCharacter.damage = 0;
        CharacterManager.updateCharacterUI(this.playerCharacter);

        // Reset enemy character
        this.enemyCharacter.health = 3;
        this.enemyCharacter.maxHealth = 3;
        this.enemyCharacter.damage = 0;
        CharacterManager.updateCharacterUI(this.enemyCharacter);
    }

    private handleResize(): void {
        const width = this.scale.width;
        const height = this.scale.height;

        this.uiManager?.handleResize();
        this.repositionCharacters(width, height);
        this.repositionGameBoard(width, height);
    }

    private repositionCharacters(width: number, height: number): void {
        this.playerCharacter?.container.setPosition(200, height / 2);
        this.enemyCharacter?.container.setPosition(width - 200, height / 2);
    }

    private repositionGameBoard(width: number, height: number): void {
        if (!this.gameBoard?.cells || this.gameBoard.cells.length === 0) return;

        const startX =
            width / 2 -
            (GameConstants.GRID_SIZE * GameConstants.CELL_SIZE +
                (GameConstants.GRID_SIZE - 1) * 10) /
                2;
        const startY =
            height / 2 -
            (GameConstants.GRID_SIZE * GameConstants.CELL_SIZE +
                (GameConstants.GRID_SIZE - 1) * 10) /
                2;

        this.gameBoard.cells.forEach((cell, i) => {
            const row = Math.floor(i / GameConstants.GRID_SIZE);
            const col = i % GameConstants.GRID_SIZE;
            const x = startX + col * (GameConstants.CELL_SIZE + 10);
            const y = startY + row * (GameConstants.CELL_SIZE + 10);
            cell.setPosition(x, y);
        });

        this.repositionMarks();
    }

    private repositionMarks(): void {
        this.marks.forEach((mark) => {
            const boardIndex = this.findMarkIndex(mark);
            if (boardIndex !== -1) {
                const cell = this.gameBoard.cells[boardIndex];
                mark.setPosition(
                    cell.x + GameConstants.CELL_SIZE / 2,
                    cell.y + GameConstants.CELL_SIZE / 2
                );
            }
        });
    }

    // Public API methods
    public setAIDifficulty(difficulty: number): void {
        this.aiPlayer.setDifficulty(difficulty);
    }

    public getScore(): GameScore {
        return { ...this.score };
    }

    public getCurrentState(): GameState {
        return this.currentState;
    }
}

