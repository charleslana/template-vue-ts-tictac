import * as Phaser from "phaser";

// Enums e constantes
export const GameConstants = {
    GRID_SIZE: 3,
    CELL_SIZE: 120,
    PADDING: 20,
    COLORS: {
        BACKGROUND: 0x1e272e,
        CELL: 0x2f3542,
        CELL_BORDER: 0x57606f,
        CELL_HOVER: 0x3742fa,
        PLAYER_X: 0xff4757,
        PLAYER_O: 0x5352ed,
        TEXT_WHITE: "#ffffff",
        TEXT_YELLOW: "#ffa502",
        TEXT_GREEN: "#2ed573",
        TEXT_RED: "#ff4757",
        PLAYER_BG: 0x1e90ff,
        ENEMY_BG: 0xff4757,
        HEALTH_BAR: 0x2ed573,
        HEALTH_BAR_BG: 0x2f3542,
        DAMAGE_TEXT: 0xff6b6b,
    },
};

export enum PlayerType {
    HUMAN = "X",
    AI = "O",
    NONE = "",
}

export enum GameState {
    WAITING_PLAYER = "waiting_player",
    AI_THINKING = "ai_thinking",
    GAME_OVER = "game_over",
}

// Interface para pontuação
export interface GameScore {
    player: number;
    ai: number;
    ties: number;
}

// Interface para resultado do minimax
interface MinimaxResult {
    score: number;
    index?: number;
}

// Interface para personagem
interface Character {
    health: number;
    maxHealth: number;
    damage: number;
    container: Phaser.GameObjects.Container;
    healthBar: Phaser.GameObjects.Graphics;
    healthText: Phaser.GameObjects.Text;
    damageText: Phaser.GameObjects.Text;
}

// Interface para animação de dano
interface DamageAnimation {
    text: Phaser.GameObjects.Text;
    startY: number;
    duration: number;
    elapsed: number;
}

// Classe para gerenciar o tabuleiro
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

    checkWinner(): { winner: PlayerType; lines: number[][] } {
        const winPatterns = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8], // linhas
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8], // colunas
            [0, 4, 8],
            [2, 4, 6], // diagonais
        ];

        const completedLines: number[][] = [];
        let winner = PlayerType.NONE;

        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (
                this.board[a] !== PlayerType.NONE &&
                this.board[a] === this.board[b] &&
                this.board[a] === this.board[c]
            ) {
                completedLines.push(pattern);
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

        // Limpar apenas as células das linhas completadas
        for (const index of cellsToClear) {
            this.board[index] = PlayerType.NONE;
        }
    }

    clone(): PlayerType[] {
        return [...this.board];
    }
}

// Classe para IA com algoritmo Minimax
export class AIPlayer {
    private difficulty: number;

    constructor(difficulty: number = 1) {
        this.difficulty = difficulty;
    }

    getBestMove(board: PlayerType[]): number {
        if (Math.random() > this.difficulty) {
            const availableMoves = board
                .map((cell, index) => (cell === PlayerType.NONE ? index : null))
                .filter((val): val is number => val !== null);
            return availableMoves[
                Math.floor(Math.random() * availableMoves.length)
            ];
        }

        const result = this.minimax(board, PlayerType.AI);
        return result.index !== undefined ? result.index : 0;
    }

    private minimax(
        board: PlayerType[],
        player: PlayerType,
        depth: number = 0
    ): MinimaxResult {
        const availableMoves = board
            .map((cell, index) => (cell === PlayerType.NONE ? index : null))
            .filter((val): val is number => val !== null);

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

        if (player === PlayerType.AI) {
            return moves.reduce((best, move) =>
                move.score > best.score ? move : best
            );
        } else {
            return moves.reduce((best, move) =>
                move.score < best.score ? move : best
            );
        }
    }

    private checkWinnerForBoard(board: PlayerType[]): PlayerType {
        const winPatterns = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ];

        for (const pattern of winPatterns) {
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
}

// Classe principal da cena do jogo
export class TicTacToeScene extends Phaser.Scene {
    private gameBoard!: GameBoard;
    private aiPlayer!: AIPlayer;
    private currentState: GameState = GameState.WAITING_PLAYER;
    private score: GameScore = { player: 0, ai: 0, ties: 0 };

    // Elementos da UI
    private titleText!: Phaser.GameObjects.Text;
    private statusText!: Phaser.GameObjects.Text;
    private scoreText!: Phaser.GameObjects.Text;
    private resetButton!: Phaser.GameObjects.Rectangle;
    private marks: Phaser.GameObjects.Image[] = [];

    // Sistema Roguelike
    private playerCharacter!: Character;
    private enemyCharacter!: Character;
    private readonly DAMAGE_PER_LINE = 3;
    private damageAnimations: DamageAnimation[] = [];

    constructor() {
        super({ key: "TicTacToeScene" });
    }

    preload(): void {
        this.createPixelTextures();
    }

    create(): void {
        this.gameBoard = new GameBoard();
        this.aiPlayer = new AIPlayer(1);

        this.scale.on("resize", this.handleResize, this);

        this.createBackground();
        this.createCharacters();
        this.createUI();
        this.createGameBoard();

        this.handleResize();
    }

    update(_time: number, delta: number): void {
        this.updateDamageAnimations(delta);
    }

    private updateDamageAnimations(delta: number): void {
        for (let i = this.damageAnimations.length - 1; i >= 0; i--) {
            const anim = this.damageAnimations[i];
            anim.elapsed += delta;

            const progress = anim.elapsed / anim.duration;
            const currentY = anim.startY - progress * 50; // Move 50 pixels para cima
            const alpha = 1 - progress;

            anim.text.setY(currentY);
            anim.text.setAlpha(alpha);

            if (anim.elapsed >= anim.duration) {
                anim.text.destroy();
                this.damageAnimations.splice(i, 1);
            }
        }
    }

    private createDamageText(
        x: number,
        y: number,
        damage: number,
        isPlayer: boolean
    ): void {
        const damageText = this.add
            .text(x, y, `-${damage}`, {
                fontSize: "24px",
                color: isPlayer
                    ? GameConstants.COLORS.TEXT_RED
                    : GameConstants.COLORS.TEXT_GREEN,
                fontFamily: "Courier New",
                stroke: "#000000",
                strokeThickness: 3,
                fontStyle: "bold",
            })
            .setOrigin(0.5);

        const anim: DamageAnimation = {
            text: damageText,
            startY: y,
            duration: 1000, // 1 segundo
            elapsed: 0,
        };

        this.damageAnimations.push(anim);
    }

    private createPixelTextures(): void {
        // Texture para X (pixel art)
        const xGraphics = this.add.graphics();
        xGraphics.lineStyle(8, GameConstants.COLORS.PLAYER_X);
        xGraphics.beginPath();
        xGraphics.moveTo(20, 20);
        xGraphics.lineTo(80, 80);
        xGraphics.moveTo(80, 20);
        xGraphics.lineTo(20, 80);
        xGraphics.strokePath();
        xGraphics.generateTexture("x-mark", 100, 100);
        xGraphics.destroy();

        // Texture para O (pixel art)
        const oGraphics = this.add.graphics();
        oGraphics.lineStyle(8, GameConstants.COLORS.PLAYER_O);
        oGraphics.strokeCircle(50, 50, 30);
        oGraphics.generateTexture("o-mark", 100, 100);
        oGraphics.destroy();

        // Texture para célula vazia
        const cellGraphics = this.add.graphics();
        cellGraphics.fillStyle(GameConstants.COLORS.CELL, 0.8);
        cellGraphics.fillRoundedRect(
            0,
            0,
            GameConstants.CELL_SIZE,
            GameConstants.CELL_SIZE,
            10
        );
        cellGraphics.lineStyle(3, GameConstants.COLORS.CELL_BORDER);
        cellGraphics.strokeRoundedRect(
            0,
            0,
            GameConstants.CELL_SIZE,
            GameConstants.CELL_SIZE,
            10
        );
        cellGraphics.generateTexture(
            "cell",
            GameConstants.CELL_SIZE,
            GameConstants.CELL_SIZE
        );
        cellGraphics.destroy();

        // Texture para célula hover
        const cellHoverGraphics = this.add.graphics();
        cellHoverGraphics.fillStyle(GameConstants.COLORS.CELL_HOVER, 0.3);
        cellHoverGraphics.fillRoundedRect(
            0,
            0,
            GameConstants.CELL_SIZE,
            GameConstants.CELL_SIZE,
            10
        );
        cellHoverGraphics.lineStyle(3, GameConstants.COLORS.CELL_HOVER);
        cellHoverGraphics.strokeRoundedRect(
            0,
            0,
            GameConstants.CELL_SIZE,
            GameConstants.CELL_SIZE,
            10
        );
        cellHoverGraphics.generateTexture(
            "cell-hover",
            GameConstants.CELL_SIZE,
            GameConstants.CELL_SIZE
        );
        cellHoverGraphics.destroy();
    }

    private createBackground(): void {
        this.add
            .rectangle(
                0,
                0,
                this.scale.width,
                this.scale.height,
                GameConstants.COLORS.BACKGROUND
            )
            .setOrigin(0);

        for (let i = 0; i < 20; i++) {
            const star = this.add.circle(
                Phaser.Math.Between(0, this.scale.width),
                Phaser.Math.Between(0, this.scale.height),
                2,
                0xffffff,
                0.6
            );
            this.tweens.add({
                targets: star,
                alpha: 0.2,
                duration: Phaser.Math.Between(1000, 3000),
                yoyo: true,
                repeat: -1,
            });
        }
    }

    private createCharacters(): void {
        // Criar personagem do jogador (esquerda)
        this.playerCharacter = this.createCharacter(
            200,
            this.scale.height / 2,
            GameConstants.COLORS.PLAYER_BG,
            12,
            12,
            0,
            "JOGADOR"
        );

        // Criar personagem do inimigo (direita)
        this.enemyCharacter = this.createCharacter(
            this.scale.width - 200,
            this.scale.height / 2,
            GameConstants.COLORS.ENEMY_BG,
            3,
            3,
            0,
            "INIMIGO"
        );
    }

    private createCharacter(
        x: number,
        y: number,
        color: number,
        health: number,
        maxHealth: number,
        damage: number,
        name: string
    ): Character {
        const container = this.add.container(x, y);

        // Fundo do personagem
        const bg = this.add.rectangle(0, 0, 200, 300, color, 0.8);
        bg.setStrokeStyle(3, 0xffffff);

        // Nome do personagem
        const nameText = this.add
            .text(0, -120, name, {
                fontSize: "20px",
                color: GameConstants.COLORS.TEXT_WHITE,
                fontFamily: "Courier New",
                stroke: "#000000",
                strokeThickness: 3,
            })
            .setOrigin(0.5);

        // Barra de vida (fundo)
        const healthBarBg = this.add.rectangle(
            0,
            -80,
            150,
            20,
            GameConstants.COLORS.HEALTH_BAR_BG
        );

        // Barra de vida (preenchimento)
        const healthBar = this.add.graphics();
        this.updateHealthBar(healthBar, health, maxHealth, 150, 20, 0, -80);

        // Texto de vida
        const healthText = this.add
            .text(0, -50, `VIDA: ${health}/${maxHealth}`, {
                fontSize: "16px",
                color: GameConstants.COLORS.TEXT_WHITE,
                fontFamily: "Courier New",
            })
            .setOrigin(0.5);

        // Texto de dano acumulado
        const damageText = this.add
            .text(0, -20, `DANO: ${damage}`, {
                fontSize: "16px",
                color: GameConstants.COLORS.TEXT_YELLOW,
                fontFamily: "Courier New",
            })
            .setOrigin(0.5);

        container.add([
            bg,
            nameText,
            healthBarBg,
            healthBar,
            healthText,
            damageText,
        ]);

        return {
            health,
            maxHealth,
            damage,
            container,
            healthBar,
            healthText,
            damageText,
        };
    }

    private updateHealthBar(
        graphics: Phaser.GameObjects.Graphics,
        health: number,
        maxHealth: number,
        width: number,
        height: number,
        x: number,
        y: number
    ): void {
        graphics.clear();
        const healthPercent = Math.max(0, health) / maxHealth;
        const barWidth = width * healthPercent;

        graphics.fillStyle(GameConstants.COLORS.HEALTH_BAR);
        graphics.fillRect(x - width / 2, y - height / 2, barWidth, height);
    }

    private createUI(): void {
        this.titleText = this.add
            .text(this.scale.width / 2, 60, "JOGO DA VELHA ROGUELIKE", {
                fontSize: "28px",
                color: GameConstants.COLORS.TEXT_WHITE,
                fontFamily: "Courier New",
                stroke: "#000000",
                strokeThickness: 3,
            })
            .setOrigin(0.5);

        this.statusText = this.add
            .text(this.scale.width / 2, 100, "Sua vez! (X)", {
                fontSize: "18px",
                color: GameConstants.COLORS.TEXT_YELLOW,
                fontFamily: "Courier New",
            })
            .setOrigin(0.5);

        this.scoreText = this.add
            .text(
                this.scale.width / 2,
                this.scale.height - 100,
                this.getScoreText(),
                {
                    fontSize: "16px",
                    color: GameConstants.COLORS.TEXT_WHITE,
                    fontFamily: "Courier New",
                }
            )
            .setOrigin(0.5);

        this.createResetButton();
    }

    private createResetButton(): void {
        this.resetButton = this.add
            .rectangle(
                this.scale.width / 2,
                this.scale.height - 50,
                150,
                40,
                GameConstants.COLORS.PLAYER_X
            )
            .setInteractive()
            .setStrokeStyle(2, 0xffffff);

        this.add
            .text(this.scale.width / 2, this.scale.height - 50, "NOVO JOGO", {
                fontSize: "14px",
                color: GameConstants.COLORS.TEXT_WHITE,
                fontFamily: "Courier New",
            })
            .setOrigin(0.5);

        this.resetButton.on("pointerdown", () => {
            this.resetGame();
        });

        this.resetButton.on("pointerover", () => {
            this.resetButton.setFillStyle(0xff6b7a);
        });

        this.resetButton.on("pointerout", () => {
            this.resetButton.setFillStyle(GameConstants.COLORS.PLAYER_X);
        });
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

        mark.setScale(0);
        this.tweens.add({
            targets: mark,
            scale: 1,
            duration: 300,
            ease: "Back.easeOut",
        });

        // Verificar se há vencedor (agora pode ter múltiplas linhas)
        const result = this.gameBoard.checkWinner();
        if (result.winner !== PlayerType.NONE && result.lines.length > 0) {
            this.handleLineCompletion(result.winner, result.lines);
            return;
        } else if (this.gameBoard.isFull()) {
            this.handleTie();
            return;
        }

        // Continuar jogo
        if (player === PlayerType.HUMAN) {
            this.currentState = GameState.AI_THINKING;
            this.statusText.setText("IA pensando...");
            this.time.delayedCall(500, () => {
                this.handleAIMove();
            });
        } else {
            this.currentState = GameState.WAITING_PLAYER;
            this.statusText.setText("Sua vez! (X)");
        }
    }

    private handleLineCompletion(winner: PlayerType, lines: number[][]): void {
        const totalDamage = lines.length * this.DAMAGE_PER_LINE;
        const isPlayerWinner = winner === PlayerType.HUMAN;
        const targetCharacter = isPlayerWinner
            ? this.enemyCharacter
            : this.playerCharacter;
        const attackerCharacter = isPlayerWinner
            ? this.playerCharacter
            : this.enemyCharacter;

        // Aplicar dano
        targetCharacter.health -= totalDamage;
        attackerCharacter.damage += totalDamage;

        // Atualizar UI
        this.updateCharacterUI(targetCharacter);
        this.updateCharacterUI(attackerCharacter);

        // Criar animação de dano
        const targetX = targetCharacter.container.x;
        const targetY = targetCharacter.container.y - 80; // Posição acima da barra de vida
        this.createDamageText(targetX, targetY, totalDamage, !isPlayerWinner);

        // Mensagem de status
        lines.length > 1 ? `${lines.length} linhas` : "uma linha";
        if (isPlayerWinner) {
            this.statusText.setText(
                `Combo! ${lines.length} linhas! ⚔️ -${totalDamage} de dano`
            );
            this.statusText.setColor(GameConstants.COLORS.TEXT_GREEN);
        } else {
            this.statusText.setText(
                `Combo da IA! ${lines.length} linhas! 💀 -${totalDamage} de dano`
            );
            this.statusText.setColor(GameConstants.COLORS.TEXT_RED);
        }

        // Efeito de dano no personagem
        const shakeDirection = isPlayerWinner ? 10 : -10;
        this.tweens.add({
            targets: targetCharacter.container,
            x: targetCharacter.container.x + shakeDirection,
            yoyo: true,
            duration: 100,
            repeat: 3,
        });

        // Limpar as linhas completadas
        this.clearCompletedLines(lines);

        // Verificar se o jogo acabou
        this.time.delayedCall(1000, () => {
            if (
                this.playerCharacter.health <= 0 ||
                this.enemyCharacter.health <= 0
            ) {
                this.handleGameEnd();
            } else {
                // Continuar jogo com tabuleiro atualizado
                this.currentState = GameState.WAITING_PLAYER;
                this.statusText.setText("Sua vez! (X)");
                this.statusText.setColor(GameConstants.COLORS.TEXT_YELLOW);
            }
        });
    }

    private handleTie(): void {
        this.statusText.setText("Empate! Reiniciando partida...");
        this.statusText.setColor(GameConstants.COLORS.TEXT_YELLOW);

        this.time.delayedCall(1500, () => {
            this.resetBoardOnly();
        });
    }

    private clearCompletedLines(lines: number[][]): void {
        // Animação para limpar as linhas
        const cellsToClear = new Set<number>();
        lines.forEach((line) =>
            line.forEach((index) => cellsToClear.add(index))
        );

        cellsToClear.forEach((index) => {
            const cell = this.gameBoard.cells[index];
            this.tweens.add({
                targets: cell,
                alpha: 0.3,
                duration: 500,
            });
        });

        // Limpar as linhas do tabuleiro após animação
        this.time.delayedCall(800, () => {
            this.gameBoard.clearLines(lines);

            // Restaurar visual das células
            cellsToClear.forEach((index) => {
                const cell = this.gameBoard.cells[index];
                cell.setTexture("cell");
                cell.setAlpha(1);
            });

            // Remover marcações visuais das linhas limpas
            this.marks.forEach((mark, i) => {
                const markIndex = this.gameBoard.cells.findIndex(
                    (c, _idx) =>
                        Math.abs(mark.x - (c.x + GameConstants.CELL_SIZE / 2)) <
                            10 &&
                        Math.abs(mark.y - (c.y + GameConstants.CELL_SIZE / 2)) <
                            10
                );
                if (cellsToClear.has(markIndex)) {
                    mark.destroy();
                    this.marks.splice(i, 1);
                }
            });
        });
    }

    private updateCharacterUI(character: Character): void {
        character.healthText.setText(
            `VIDA: ${Math.max(0, character.health)}/${character.maxHealth}`
        );
        character.damageText.setText(`DANO: ${character.damage}`);

        this.updateHealthBar(
            character.healthBar,
            character.health,
            character.maxHealth,
            150,
            20,
            0,
            -80
        );
    }

    private handleGameEnd(): void {
        this.currentState = GameState.GAME_OVER;

        if (this.playerCharacter.health <= 0) {
            this.score.ai++;
            this.statusText.setText("Você foi derrotado! 💀");
            this.statusText.setColor(GameConstants.COLORS.TEXT_RED);
        } else {
            this.score.player++;
            this.statusText.setText("Você venceu! 🎉");
            this.statusText.setColor(GameConstants.COLORS.TEXT_GREEN);
        }

        this.updateScoreboard();

        this.tweens.add({
            targets: this.statusText,
            scale: 1.2,
            duration: 200,
            yoyo: true,
            repeat: 3,
        });
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

        this.statusText.setText("Sua vez! (X)");
        this.statusText.setColor(GameConstants.COLORS.TEXT_YELLOW);
        this.statusText.setScale(1);
    }

    private resetGame(): void {
        // Limpar animações de dano
        this.damageAnimations.forEach((anim) => anim.text.destroy());
        this.damageAnimations = [];

        this.resetBoardOnly();

        // Resetar personagens
        this.playerCharacter.health = 12;
        this.playerCharacter.maxHealth = 12;
        this.playerCharacter.damage = 0;
        this.updateCharacterUI(this.playerCharacter);

        this.enemyCharacter.health = 3;
        this.enemyCharacter.maxHealth = 3;
        this.enemyCharacter.damage = 0;
        this.updateCharacterUI(this.enemyCharacter);
    }

    private updateScoreboard(): void {
        this.scoreText.setText(this.getScoreText());
    }

    private getScoreText(): string {
        return `Jogador: ${this.score.player} | IA: ${this.score.ai} | Empates: ${this.score.ties}`;
    }

    private handleResize(): void {
        const width = this.scale.width;
        const height = this.scale.height;

        this.titleText?.setPosition(width / 2, 60);
        this.statusText?.setPosition(width / 2, 100);
        this.scoreText?.setPosition(width / 2, height - 100);
        this.resetButton?.setPosition(width / 2, height - 50);

        // Reposicionar personagens
        this.playerCharacter?.container.setPosition(200, height / 2);
        this.enemyCharacter?.container.setPosition(width - 200, height / 2);

        // Reposicionar tabuleiro
        if (this.gameBoard?.cells && this.gameBoard.cells.length > 0) {
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

            this.marks.forEach((mark) => {
                const boardIndex = this.gameBoard.cells.findIndex(
                    (cell, _index) =>
                        Math.abs(
                            mark.x - (cell.x + GameConstants.CELL_SIZE / 2)
                        ) < 10 &&
                        Math.abs(
                            mark.y - (cell.y + GameConstants.CELL_SIZE / 2)
                        ) < 10
                );
                if (boardIndex !== -1) {
                    const cell = this.gameBoard.cells[boardIndex];
                    mark.setPosition(
                        cell.x + GameConstants.CELL_SIZE / 2,
                        cell.y + GameConstants.CELL_SIZE / 2
                    );
                }
            });
        }
    }

    public setAIDifficulty(difficulty: number): void {
        this.aiPlayer = new AIPlayer(difficulty);
    }

    public getScore(): GameScore {
        return { ...this.score };
    }
}

