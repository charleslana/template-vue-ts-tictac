import { DamageAnimation } from "../types/GameTypes";
import { GameConstants } from "../constants/GameConstants";

export class EffectsManager {
    private scene: Phaser.Scene;
    private damageAnimations: DamageAnimation[] = [];

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    createBackground(): void {
        this.scene.add
            .rectangle(
                0,
                0,
                this.scene.scale.width,
                this.scene.scale.height,
                GameConstants.COLORS.BACKGROUND
            )
            .setOrigin(0);

        // Estrelas animadas
        for (let i = 0; i < 20; i++) {
            const star = this.scene.add.circle(
                Phaser.Math.Between(0, this.scene.scale.width),
                Phaser.Math.Between(0, this.scene.scale.height),
                2,
                0xffffff,
                0.6
            );

            this.scene.tweens.add({
                targets: star,
                alpha: 0.2,
                duration: Phaser.Math.Between(1000, 3000),
                yoyo: true,
                repeat: -1,
            });
        }
    }

    createDamageText(
        x: number,
        y: number,
        damage: number,
        isPlayer: boolean
    ): void {
        const damageText = this.scene.add
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
            duration: 1000,
            elapsed: 0,
        };

        this.damageAnimations.push(anim);
    }

    updateDamageAnimations(delta: number): void {
        for (let i = this.damageAnimations.length - 1; i >= 0; i--) {
            const anim = this.damageAnimations[i];
            anim.elapsed += delta;

            const progress = anim.elapsed / anim.duration;
            const currentY = anim.startY - progress * 50;
            const alpha = 1 - progress;

            anim.text.setY(currentY);
            anim.text.setAlpha(alpha);

            if (anim.elapsed >= anim.duration) {
                anim.text.destroy();
                this.damageAnimations.splice(i, 1);
            }
        }
    }

    createShakeEffect(
        target: Phaser.GameObjects.Container,
        direction: number
    ): void {
        this.scene.tweens.add({
            targets: target,
            x: target.x + direction,
            yoyo: true,
            duration: 100,
            repeat: 3,
        });
    }

    createScaleAnimation(target: Phaser.GameObjects.Image): void {
        target.setScale(0);
        this.scene.tweens.add({
            targets: target,
            scale: 1,
            duration: 300,
            ease: "Back.easeOut",
        });
    }

    clearAllAnimations(): void {
        this.damageAnimations.forEach((anim) => anim.text.destroy());
        this.damageAnimations = [];
    }
}
