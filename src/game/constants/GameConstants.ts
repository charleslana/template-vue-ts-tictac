export const GameConstants = {
    GRID_SIZE: 3,
    CELL_SIZE: 120,
    PADDING: 20,
    DAMAGE_PER_LINE: 3,
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
} as const;

export const WIN_PATTERNS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // linhas
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // colunas
    [0, 4, 8],
    [2, 4, 6], // diagonais
] as const;
