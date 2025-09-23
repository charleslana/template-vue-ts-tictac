import { GameConstants } from "../constants/GameConstants";

export class TextureManager {
    static createTextures(scene: Phaser.Scene): void {
        this.createXTexture(scene);
        this.createOTexture(scene);
        this.createCellTexture(scene);
        this.createCellHoverTexture(scene);
        this.createCardTextures(scene);
    }

    private static createXTexture(scene: Phaser.Scene): void {
        const xGraphics = scene.add.graphics();
        xGraphics.lineStyle(8, GameConstants.COLORS.PLAYER_X);
        xGraphics.beginPath();
        xGraphics.moveTo(20, 20);
        xGraphics.lineTo(80, 80);
        xGraphics.moveTo(80, 20);
        xGraphics.lineTo(20, 80);
        xGraphics.strokePath();
        xGraphics.generateTexture("x-mark", 100, 100);
        xGraphics.destroy();
    }

    private static createOTexture(scene: Phaser.Scene): void {
        const oGraphics = scene.add.graphics();
        oGraphics.lineStyle(8, GameConstants.COLORS.PLAYER_O);
        oGraphics.strokeCircle(50, 50, 30);
        oGraphics.generateTexture("o-mark", 100, 100);
        oGraphics.destroy();
    }

    private static createCellTexture(scene: Phaser.Scene): void {
        const cellGraphics = scene.add.graphics();
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
    }

    private static createCellHoverTexture(scene: Phaser.Scene): void {
        const cellHoverGraphics = scene.add.graphics();
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

    private static createCardTextures(scene: Phaser.Scene): void {
        // Textura de fundo da carta
        const cardGraphics = scene.add.graphics();
        cardGraphics.fillStyle(GameConstants.COLORS.CARD_BG, 0.9);
        cardGraphics.fillRoundedRect(
            0,
            0,
            GameConstants.CARD_WIDTH,
            GameConstants.CARD_HEIGHT,
            8
        );
        cardGraphics.lineStyle(2, GameConstants.COLORS.CARD_BORDER);
        cardGraphics.strokeRoundedRect(
            0,
            0,
            GameConstants.CARD_WIDTH,
            GameConstants.CARD_HEIGHT,
            8
        );
        cardGraphics.generateTexture(
            "card-bg",
            GameConstants.CARD_WIDTH,
            GameConstants.CARD_HEIGHT
        );
        cardGraphics.destroy();

        // Textura de carta selecionada
        const cardSelectedGraphics = scene.add.graphics();
        cardSelectedGraphics.fillStyle(GameConstants.COLORS.CARD_BG, 0.9);
        cardSelectedGraphics.fillRoundedRect(
            0,
            0,
            GameConstants.CARD_WIDTH,
            GameConstants.CARD_HEIGHT,
            8
        );
        cardSelectedGraphics.lineStyle(3, GameConstants.COLORS.CARD_SELECTED);
        cardSelectedGraphics.strokeRoundedRect(
            0,
            0,
            GameConstants.CARD_WIDTH,
            GameConstants.CARD_HEIGHT,
            8
        );
        cardSelectedGraphics.generateTexture(
            "card-selected",
            GameConstants.CARD_WIDTH,
            GameConstants.CARD_HEIGHT
        );
        cardSelectedGraphics.destroy();
    }
}
