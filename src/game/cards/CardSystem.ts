import {
    Card,
    CardType,
    PlayerType,
    DeckState,
    HandState,
} from "../types/GameTypes";
import { GameConstants } from "../constants/GameConstants";

export class CardSystem {
    private playerDeck: DeckState;
    private aiDeck: DeckState;
    private playerHand: HandState;
    private aiHand: HandState;

    constructor() {
        this.playerDeck = { cards: [], discardPile: [] };
        this.aiDeck = { cards: [], discardPile: [] };
        this.playerHand = {
            cards: [],
            maxHandSize: GameConstants.MAX_HAND_SIZE,
        };
        this.aiHand = { cards: [], maxHandSize: GameConstants.MAX_HAND_SIZE };

        this.initializeDecks();
    }

    private initializeDecks(): void {
        // Criar deck do jogador (12 cartas X)
        for (let i = 0; i < GameConstants.DECK_SIZE; i++) {
            this.playerDeck.cards.push(
                this.createCard(
                    `player_${i}`,
                    CardType.NORMAL_X,
                    PlayerType.HUMAN,
                    "X Normal",
                    "Uma marca X básica"
                )
            );
        }

        // Criar deck da IA (12 cartas O)
        for (let i = 0; i < GameConstants.DECK_SIZE; i++) {
            this.aiDeck.cards.push(
                this.createCard(
                    `ai_${i}`,
                    CardType.NORMAL_O,
                    PlayerType.AI,
                    "O Normal",
                    "Uma marca O básica"
                )
            );
        }

        // Embaralhar os decks
        this.shuffleDeck(this.playerDeck);
        this.shuffleDeck(this.aiDeck);
    }

    private createCard(
        id: string,
        type: CardType,
        playerType: PlayerType,
        name: string,
        description: string
    ): Card {
        return {
            id,
            type,
            playerType,
            name,
            description,
        };
    }

    private shuffleDeck(deck: DeckState): void {
        for (let i = deck.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck.cards[i], deck.cards[j]] = [deck.cards[j], deck.cards[i]];
        }
    }

    drawCard(isPlayer: boolean): Card | null {
        const deck = isPlayer ? this.playerDeck : this.aiDeck;
        const hand = isPlayer ? this.playerHand : this.aiHand;

        if (hand.cards.length >= hand.maxHandSize) {
            return null; // Mão cheia
        }

        if (deck.cards.length === 0) {
            this.reshuffleDeck(isPlayer);
        }

        const card = deck.cards.pop();
        if (card) {
            hand.cards.push(card);
        }
        return card || null;
    }

    private reshuffleDeck(isPlayer: boolean): void {
        const deck = isPlayer ? this.playerDeck : this.aiDeck;

        // Mover cartas do descarte de volta para o deck
        deck.cards = [...deck.discardPile];
        deck.discardPile = [];

        // Embaralhar novamente
        this.shuffleDeck(deck);
    }

    drawInitialHand(isPlayer: boolean): Card[] {
        const cardsDrawn: Card[] = [];
        for (let i = 0; i < GameConstants.MAX_HAND_SIZE; i++) {
            const card = this.drawCard(isPlayer);
            if (card) {
                cardsDrawn.push(card);
            }
        }
        return cardsDrawn;
    }

    playCard(cardId: string, isPlayer: boolean): Card | null {
        const hand = isPlayer ? this.playerHand : this.aiHand;
        const cardIndex = hand.cards.findIndex((card) => card.id === cardId);

        if (cardIndex === -1) {
            return null;
        }

        const card = hand.cards[cardIndex];
        hand.cards.splice(cardIndex, 1);
        return card;
    }

    discardCard(card: Card, isPlayer: boolean): void {
        const deck = isPlayer ? this.playerDeck : this.aiDeck;
        deck.discardPile.push(card);
    }

    refillHandAfterScore(isPlayer: boolean): Card[] {
        const hand = isPlayer ? this.playerHand : this.aiHand;
        const cardsDrawn: Card[] = [];

        // Se tem 1 ou menos cartas, reembaralha e compra até 3
        if (hand.cards.length <= 1) {
            this.reshuffleDeck(isPlayer);

            // Comprar até ter 3 cartas
            while (hand.cards.length < GameConstants.MAX_HAND_SIZE) {
                const card = this.drawCard(isPlayer);
                if (card) {
                    cardsDrawn.push(card);
                }
            }
        }

        return cardsDrawn;
    }

    getHand(isPlayer: boolean): Card[] {
        return isPlayer ? this.playerHand.cards : this.aiHand.cards;
    }

    getDeckCount(isPlayer: boolean): number {
        const deck = isPlayer ? this.playerDeck : this.aiDeck;
        return deck.cards.length;
    }

    reset(): void {
        this.playerDeck = { cards: [], discardPile: [] };
        this.aiDeck = { cards: [], discardPile: [] };
        this.playerHand = {
            cards: [],
            maxHandSize: GameConstants.MAX_HAND_SIZE,
        };
        this.aiHand = { cards: [], maxHandSize: GameConstants.MAX_HAND_SIZE };

        this.initializeDecks();
    }
}
