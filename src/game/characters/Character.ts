import { Character as CharacterInterface } from "../types/GameTypes";
import { GameConstants } from "../constants/GameConstants";

export class CharacterManager {
    static createCharacter(
        scene: Phaser.Scene,
        x: number,
        y: number,
        color: number,
        health: number,
        maxHealth: number,
        damage: number,
        name: string
    ): CharacterInterface {
        const container = scene.add.container(x, y);

        // Fundo do personagem
        const bg = scene.add.rectangle(0, 0, 200, 300, color, 0.8);
        bg.setStrokeStyle(3, 0xffffff);

        // Nome do personagem
        const nameText = scene.add
            .text(0, -120, name, {
                fontSize: "20px",
                color: GameConstants.COLORS.TEXT_WHITE,
                fontFamily: "Courier New",
                stroke: "#000000",
                strokeThickness: 3,
            })
            .setOrigin(0.5);

        // Barra de vida (fundo)
        const healthBarBg = scene.add.rectangle(
            0,
            -80,
            150,
            20,
            GameConstants.COLORS.HEALTH_BAR_BG
        );

        // Barra de vida (preenchimento)
        const healthBar = scene.add.graphics();
        CharacterManager.updateHealthBar(
            healthBar,
            health,
            maxHealth,
            150,
            20,
            0,
            -80
        );

        // Texto de vida
        const healthText = scene.add
            .text(0, -50, `VIDA: ${health}/${maxHealth}`, {
                fontSize: "16px",
                color: GameConstants.COLORS.TEXT_WHITE,
                fontFamily: "Courier New",
            })
            .setOrigin(0.5);

        // Texto de dano acumulado
        const damageText = scene.add
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

    static updateHealthBar(
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

    static updateCharacterUI(character: CharacterInterface): void {
        character.healthText.setText(
            `VIDA: ${Math.max(0, character.health)}/${character.maxHealth}`
        );
        character.damageText.setText(`DANO: ${character.damage}`);

        CharacterManager.updateHealthBar(
            character.healthBar,
            character.health,
            character.maxHealth,
            150,
            20,
            0,
            -80
        );
    }
}
