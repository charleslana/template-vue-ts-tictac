import { Card } from "../types/GameTypes";
import { GameConstants } from "../constants/GameConstants";

export class CardUI {
    private scene: Phaser.Scene;
    private cards: Map<string, Phaser.GameObjects.Container> = new Map();
    private selectedCard: Card | null = null;
    private draggedCard: Phaser.GameObjects.Container | null = null;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    createCardVisual(
        card: Card,
        x: number,
        y: number
    ): Phaser.GameObjects.Container {
        const container = this.scene.add.container(x, y);

        // Fundo da carta
        const bg = this.scene.add.rectangle(
            0,
            0,
            GameConstants.CARD_WIDTH,
            GameConstants.CARD_HEIGHT,
            GameConstants.COLORS.CARD_BG,
            0.9
        );
        bg.setStrokeStyle(2, GameConstants.COLORS.CARD_BORDER);

        // Ícone da carta (X ou O)
        const iconTexture = card.type === "normal_x" ? "x-mark" : "o-mark";
        const icon = this.scene.add.image(0, -10, iconTexture).setScale(0.5);

        // Nome da carta
        const nameText = this.scene.add
            .text(0, 25, card.name, {
                fontSize: "10px",
                color: GameConstants.COLORS.TEXT_WHITE,
                fontFamily: "Courier New",
            })
            .setOrigin(0.5);

        container.add([bg, icon, nameText]);
        container.setSize(GameConstants.CARD_WIDTH, GameConstants.CARD_HEIGHT);
        container.setInteractive();

        // Configurar eventos de drag
        this.setupCardDrag(container, card);

        // Salvar referência
        this.cards.set(card.id, container);
        card.container = container;

        return container;
    }

    private setupCardDrag(
        container: Phaser.GameObjects.Container,
        card: Card
    ): void {
        this.scene.input.setDraggable(container);

        container.on("dragstart", (_pointer: Phaser.Input.Pointer) => {
            this.selectedCard = card;
            this.draggedCard = container;
            container.setScale(1.1);
            this.highlightCard(container, true);
        });

        container.on(
            "drag",
            (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
                container.setPosition(dragX, dragY);
            }
        );

        container.on("dragend", (_pointer: Phaser.Input.Pointer) => {
            container.setScale(1);
            this.highlightCard(container, false);
            this.draggedCard = null;
        });

        container.on("pointerover", () => {
            if (!this.draggedCard) {
                container.setScale(1.05);
                this.highlightCard(container, true);
            }
        });

        container.on("pointerout", () => {
            if (!this.draggedCard) {
                container.setScale(1);
                this.highlightCard(container, false);
            }
        });
    }

    private highlightCard(
        container: Phaser.GameObjects.Container,
        highlight: boolean
    ): void {
        const bg = container.getAt(0) as Phaser.GameObjects.Rectangle;
        const color = highlight
            ? GameConstants.COLORS.CARD_HOVER
            : GameConstants.COLORS.CARD_BORDER;
        bg.setStrokeStyle(2, color);
    }

    updateHandDisplay(cards: Card[], isPlayer: boolean): void {
        const baseY = isPlayer
            ? this.scene.scale.height / 2 - 200
            : this.scene.scale.height / 2 + 200;
        const characterX = isPlayer ? 200 : this.scene.scale.width - 200;

        cards.forEach((card, index) => {
            let container = this.cards.get(card.id);

            if (!container) {
                const cardX =
                    characterX + (index - 1) * (GameConstants.CARD_WIDTH + 10);
                container = this.createCardVisual(card, cardX, baseY);
            } else {
                // Reposicionar carta existente
                const cardX =
                    characterX + (index - 1) * (GameConstants.CARD_WIDTH + 10);
                container.setPosition(cardX, baseY);
            }
        });
    }

    removeCard(cardId: string): void {
        const container = this.cards.get(cardId);
        if (container) {
            container.destroy();
            this.cards.delete(cardId);
        }
    }

    getSelectedCard(): Card | null {
        return this.selectedCard;
    }

    clearSelectedCard(): void {
        this.selectedCard = null;
    }

    isCardBeingDragged(): boolean {
        return this.draggedCard !== null;
    }

    animateCardDraw(card: Card, targetX: number, targetY: number): void {
        const container = this.cards.get(card.id);
        if (container) {
            // Animação de entrada
            container.setAlpha(0);
            container.setScale(0);

            this.scene.tweens.add({
                targets: container,
                alpha: 1,
                scale: 1,
                x: targetX,
                y: targetY,
                duration: 500,
                ease: "Back.easeOut",
            });
        }
    }

    clearAllCards(): void {
        this.cards.forEach((container) => container.destroy());
        this.cards.clear();
        this.selectedCard = null;
        this.draggedCard = null;
    }

    repositionCards(isPlayer: boolean): void {
        const hand = Array.from(this.cards.values()).filter((container) => {
            // Verificar se a carta pertence ao jogador correto baseado na posição Y
            const baseY = isPlayer
                ? this.scene.scale.height / 2 - 200
                : this.scene.scale.height / 2 + 200;
            return Math.abs(container.y - baseY) < 50;
        });

        const characterX = isPlayer ? 200 : this.scene.scale.width - 200;
        const baseY = isPlayer
            ? this.scene.scale.height / 2 - 200
            : this.scene.scale.height / 2 + 200;

        hand.forEach((container, index) => {
            const cardX =
                characterX + (index - 1) * (GameConstants.CARD_WIDTH + 10);
            container.setPosition(cardX, baseY);
        });
    }
}

