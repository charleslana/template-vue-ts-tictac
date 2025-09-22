// import { Boot } from "./scenes/Boot";
// import { GameOver } from "./scenes/GameOver";
// import { Game as MainGame } from "./scenes/Game";
// import { MainMenu } from "./scenes/MainMenu";
import { AUTO, Game } from "phaser";
// import { Preloader } from "./scenes/Preloader";
import { GameConstants, TicTacToeScene } from "./scenes/TicTacToeScene";

const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: "game-container",
    backgroundColor: GameConstants.COLORS.BACKGROUND,
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    // scene: [Boot, Preloader, MainMenu, MainGame, GameOver],
    scene: TicTacToeScene,
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
};

export default StartGame;
