export enum PlayerType {
    HUMAN = "X",
    AI = "O",
    NONE = "",
}

export enum GameState {
    WAITING_PLAYER = "waiting_player",
    AI_THINKING = "ai_thinking",
    GAME_OVER = "game_over",
    WAITING_END_TURN = "waiting_end_turn",
}

export enum CardType {
    NORMAL_X = "normal_x",
    NORMAL_O = "normal_o",
}

export interface GameScore {
    player: number;
    ai: number;
    ties: number;
}

export interface MinimaxResult {
    score: number;
    index?: number;
}

export interface Character {
    health: number;
    maxHealth: number;
    damage: number;
    container: Phaser.GameObjects.Container;
    healthBar: Phaser.GameObjects.Graphics;
    healthText: Phaser.GameObjects.Text;
    damageText: Phaser.GameObjects.Text;
}

export interface DamageAnimation {
    text: Phaser.GameObjects.Text;
    startY: number;
    duration: number;
    elapsed: number;
}

export interface GameResult {
    winner: PlayerType;
    lines: number[][];
}

export interface Card {
    id: string;
    type: CardType;
    playerType: PlayerType;
    name: string;
    description: string;
    sprite?: Phaser.GameObjects.Image;
    container?: Phaser.GameObjects.Container;
}

export interface DeckState {
    cards: Card[];
    discardPile: Card[];
}

export interface HandState {
    cards: Card[];
    maxHandSize: number;
}
