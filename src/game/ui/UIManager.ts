import { GameScore } from "../types/GameTypes";
import { GameConstants } from "../constants/GameConstants";

export class UIManager {
    private scene: Phaser.Scene;

    public titleText!: Phaser.GameObjects.Text;
    public statusText!: Phaser.GameObjects.Text;
    public scoreText!: Phaser.GameObjects.Text;
    public resetButton!: Phaser.GameObjects.Rectangle;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    createUI(onResetCallback: () => void): void {
        this.createTitle();
        this.createStatusText();
        this.createScoreText();
        this.createResetButton(onResetCallback);
    }

    private createTitle(): void {
        this.titleText = this.scene.add
            .text(this.scene.scale.width / 2, 60, "JOGO DA VELHA ROGUELIKE", {
                fontSize: "28px",
                color: GameConstants.COLORS.TEXT_WHITE,
                fontFamily: "Courier New",
                stroke: "#000000",
                strokeThickness: 3,
            })
            .setOrigin(0.5);
    }

    private createStatusText(): void {
        this.statusText = this.scene.add
            .text(this.scene.scale.width / 2, 100, "Sua vez! (X)", {
                fontSize: "18px",
                color: GameConstants.COLORS.TEXT_YELLOW,
                fontFamily: "Courier New",
            })
            .setOrigin(0.5);
    }

    private createScoreText(): void {
        this.scoreText = this.scene.add
            .text(
                this.scene.scale.width / 2,
                this.scene.scale.height - 100,
                this.getScoreText({ player: 0, ai: 0, ties: 0 }),
                {
                    fontSize: "16px",
                    color: GameConstants.COLORS.TEXT_WHITE,
                    fontFamily: "Courier New",
                }
            )
            .setOrigin(0.5);
    }

    private createResetButton(onResetCallback: () => void): void {
        this.resetButton = this.scene.add
            .rectangle(
                this.scene.scale.width / 2,
                this.scene.scale.height - 50,
                150,
                40,
                GameConstants.COLORS.PLAYER_X
            )
            .setInteractive()
            .setStrokeStyle(2, 0xffffff);

        this.scene.add
            .text(
                this.scene.scale.width / 2,
                this.scene.scale.height - 50,
                "NOVO JOGO",
                {
                    fontSize: "14px",
                    color: GameConstants.COLORS.TEXT_WHITE,
                    fontFamily: "Courier New",
                }
            )
            .setOrigin(0.5);

        this.resetButton.on("pointerdown", onResetCallback);
        this.resetButton.on("pointerover", () => {
            this.resetButton.setFillStyle(0xff6b7a);
        });
        this.resetButton.on("pointerout", () => {
            this.resetButton.setFillStyle(GameConstants.COLORS.PLAYER_X);
        });
    }

    updateScore(score: GameScore): void {
        this.scoreText.setText(this.getScoreText(score));
    }

    private getScoreText(score: GameScore): string {
        return `Jogador: ${score.player} | IA: ${score.ai} | Empates: ${score.ties}`;
    }

    updateStatus(text: string, color?: string): void {
        this.statusText.setText(text);
        if (color) {
            this.statusText.setColor(color);
        }
    }

    animateStatusText(): void {
        this.scene.tweens.add({
            targets: this.statusText,
            scale: 1.2,
            duration: 200,
            yoyo: true,
            repeat: 3,
        });
    }

    resetStatusScale(): void {
        this.statusText.setScale(1);
    }

    handleResize(): void {
        const width = this.scene.scale.width;
        const height = this.scene.scale.height;

        this.titleText?.setPosition(width / 2, 60);
        this.statusText?.setPosition(width / 2, 100);
        this.scoreText?.setPosition(width / 2, height - 100);
        this.resetButton?.setPosition(width / 2, height - 50);
    }
}
