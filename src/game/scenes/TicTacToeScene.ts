import * as Phaser from "phaser";
import { GameBoard } from "../board/GameBoard";
import { AIPlayer } from "../ai/AIPlayer";
import { CardSystem } from "../cards/CardSystem";
import { CharacterManager } from "../characters/Character";
import { UIManager } from "../ui/UIManager";
import { CardUI } from "../ui/CardUI";
import { EffectsManager } from "../effects/EffectsManager";
import { TextureManager } from "../effects/TextureManager";
import {
    GameState,
    PlayerType,
    GameScore,
    Character,
    // Card,
} from "../types/GameTypes";
import { GameConstants } from "../constants/GameConstants";

export class TicTacToeScene extends Phaser.Scene {
    // Core game systems
    private gameBoard!: GameBoard;
    private aiPlayer!: AIPlayer;
    private cardSystem!: CardSystem;
    private uiManager!: UIManager;
    private cardUI!: CardUI;
    private effectsManager!: EffectsManager;

    // Game state
    private currentState: GameState = GameState.WAITING_PLAYER;
    private score: GameScore = { player: 0, ai: 0, ties: 0 };
    private cardPlayed: boolean = false;

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
        this.startNewRound();
        this.handleResize();
    }

    update(_time: number, delta: number): void {
        this.effectsManager.updateDamageAnimations(delta);
    }

    private initializeManagers(): void {
        this.gameBoard = new GameBoard();
        this.aiPlayer = new AIPlayer(1);
        this.cardSystem = new CardSystem();
        this.uiManager = new UIManager(this);
        this.cardUI = new CardUI(this);
        this.effectsManager = new EffectsManager(this);
    }

    private initializeGame(): void {
        this.currentState = GameState.WAITING_PLAYER;
        this.score = { player: 0, ai: 0, ties: 0 };
        this.cardPlayed = false;
    }

    private createGameElements(): void {
        this.effectsManager.createBackground();
        this.createCharacters();
        this.uiManager.createUI(
            () => this.resetGame(),
            () => this.handleEndTurn()
        );
        this.createGameBoard();
    }

    private createCharacters(): void {
        // Reposicionar personagens para dar espaço para as cartas
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

    private startNewRound(): void {
        // Comprar cartas iniciais
        const playerCards = this.cardSystem.drawInitialHand(true);
        const aiCards = this.cardSystem.drawInitialHand(false);

        // Atualizar UI das cartas
        this.cardUI.updateHandDisplay(playerCards, true);
        this.cardUI.updateHandDisplay(aiCards, false);

        this.currentState = GameState.WAITING_PLAYER;
        this.uiManager.updateStatus(
            "Sua vez! Arraste uma carta para o tabuleiro",
            GameConstants.COLORS.TEXT_YELLOW
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
        // Configurar zona de drop para cartas
        cell.setInteractive({ dropZone: true });

        cell.on(
            "drop",
            (
                _pointer: Phaser.Input.Pointer,
                gameObject: Phaser.GameObjects.Container
            ) => {
                this.handleCardDrop(index, gameObject);
            }
        );

        cell.on("dragenter", () => {
            if (
                this.gameBoard.isValidMove(index) &&
                this.currentState === GameState.WAITING_PLAYER &&
                this.cardUI.isCardBeingDragged()
            ) {
                cell.setTexture("cell-hover");
            }
        });

        cell.on("dragleave", () => {
            if (this.gameBoard.isValidMove(index)) {
                cell.setTexture("cell");
            }
        });
    }

    private handleCardDrop(
        index: number,
        _cardContainer: Phaser.GameObjects.Container
    ): void {
        if (
            this.currentState !== GameState.WAITING_PLAYER ||
            !this.gameBoard.isValidMove(index) ||
            this.cardPlayed
        ) {
            return;
        }

        const selectedCard = this.cardUI.getSelectedCard();
        if (!selectedCard) {
            return;
        }

        // Jogar a carta
        const playedCard = this.cardSystem.playCard(selectedCard.id, true);
        if (playedCard) {
            this.makeMove(index, PlayerType.HUMAN);
            this.cardUI.removeCard(playedCard.id);
            this.cardPlayed = true;

            // Habilitar botão de finalizar turno
            this.uiManager.setEndTurnButtonEnabled(true);
            this.uiManager.updateStatus(
                "Carta jogada! Clique em 'Finalizar Turno'",
                GameConstants.COLORS.TEXT_GREEN
            );
        }
    }

    private handleEndTurn(): void {
        if (!this.cardPlayed) {
            return;
        }

        this.cardPlayed = false;
        this.uiManager.setEndTurnButtonEnabled(false);

        // Comprar nova carta se necessário
        const newCard = this.cardSystem.drawCard(true);
        if (newCard) {
            this.cardUI.updateHandDisplay(this.cardSystem.getHand(true), true);
        }

        // Verificar resultado do jogo antes de passar o turno
        const result = this.gameBoard.checkWinner();
        if (result.winner !== PlayerType.NONE && result.lines.length > 0) {
            this.handleLineCompletion(result.winner, result.lines);
            return;
        } else if (this.gameBoard.isFull()) {
            this.handleTie();
            return;
        }

        // Turno da IA
        this.handleAITurn();
    }

    private handleAITurn(): void {
        this.currentState = GameState.AI_THINKING;
        this.uiManager.updateStatus("IA pensando...");

        this.time.delayedCall(1000, () => {
            // IA escolhe uma carta aleatória da mão
            const aiHand = this.cardSystem.getHand(false);
            if (aiHand.length > 0) {
                const randomCard =
                    aiHand[Math.floor(Math.random() * aiHand.length)];
                const playedCard = this.cardSystem.playCard(
                    randomCard.id,
                    false
                );

                if (playedCard) {
                    this.cardUI.removeCard(playedCard.id);

                    // IA faz sua jogada
                    const bestMove = this.aiPlayer.getBestMove(
                        this.gameBoard.board
                    );
                    this.makeMove(bestMove, PlayerType.AI);

                    // IA compra nova carta
                    const newCard = this.cardSystem.drawCard(false);
                    if (newCard) {
                        this.cardUI.updateHandDisplay(
                            this.cardSystem.getHand(false),
                            false
                        );
                    }
                }
            }
        });
    }

    private makeMove(index: number, player: PlayerType): void {
        if (!this.gameBoard.makeMove(index, player)) return;

        this.createMoveAnimation(index, player);

        if (player === PlayerType.AI) {
            this.checkGameResultForAI();
        }
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

        // Restaurar textura da célula
        cell.setTexture("cell");
    }

    private checkGameResultForAI(): void {
        const result = this.gameBoard.checkWinner();

        if (result.winner !== PlayerType.NONE && result.lines.length > 0) {
            this.handleLineCompletion(result.winner, result.lines);
        } else if (this.gameBoard.isFull()) {
            this.handleTie();
        } else {
            // Voltar para o turno do jogador
            this.currentState = GameState.WAITING_PLAYER;
            this.uiManager.updateStatus(
                "Sua vez! Arraste uma carta para o tabuleiro",
                GameConstants.COLORS.TEXT_YELLOW
            );
            this.cardUI.clearSelectedCard();
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

            // Verificar se precisa reembaralhar e comprar cartas
            this.refillHandsAfterScore();
        });
    }

    private refillHandsAfterScore(): void {
        const playerCards = this.cardSystem.refillHandAfterScore(true);
        const aiCards = this.cardSystem.refillHandAfterScore(false);

        if (playerCards.length > 0) {
            this.cardUI.updateHandDisplay(this.cardSystem.getHand(true), true);
        }

        if (aiCards.length > 0) {
            this.cardUI.updateHandDisplay(
                this.cardSystem.getHand(false),
                false
            );
        }
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
            "Sua vez! Arraste uma carta para o tabuleiro",
            GameConstants.COLORS.TEXT_YELLOW
        );
        this.cardPlayed = false;
        this.uiManager.setEndTurnButtonEnabled(false);
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
        this.uiManager.setEndTurnButtonEnabled(false);
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
        this.cardPlayed = false;

        this.marks.forEach((mark) => mark.destroy());
        this.marks = [];

        this.gameBoard.cells.forEach((cell) => {
            cell.setTexture("cell");
            cell.setAlpha(1);
        });

        this.uiManager.updateStatus(
            "Sua vez! Arraste uma carta para o tabuleiro",
            GameConstants.COLORS.TEXT_YELLOW
        );
        this.uiManager.resetStatusScale();
        this.uiManager.setEndTurnButtonEnabled(false);
    }

    private resetGame(): void {
        this.effectsManager.clearAllAnimations();
        this.cardUI.clearAllCards();
        this.resetBoardOnly();
        this.resetCharacters();
        this.cardSystem.reset();
        this.startNewRound();
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

    private setupEventListeners(): void {
        this.scale.on("resize", this.handleResize, this);
    }

    private handleResize(): void {
        const width = this.scale.width;
        const height = this.scale.height;

        this.uiManager?.handleResize();
        this.repositionCharacters(width, height);
        this.repositionGameBoard(width, height);
        this.cardUI?.repositionCards(true);
        this.cardUI?.repositionCards(false);
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

    public getDeckInfo(): {
        playerDeck: number;
        aiDeck: number;
        playerHand: number;
        aiHand: number;
    } {
        return {
            playerDeck: this.cardSystem.getDeckCount(true),
            aiDeck: this.cardSystem.getDeckCount(false),
            playerHand: this.cardSystem.getHand(true).length,
            aiHand: this.cardSystem.getHand(false).length,
        };
    }
}

