import { Board } from "./models/Board";

export enum PieceType {
    PAWN = 'p',
    BISHOP = 'b',
    KNIGHT = 'n',
    ROOK = 'r',
    QUEEN = 'q',
    KING = 'k',
}

export enum PieceTypeFull {
    p = 'pawn',
    b = 'bishop',
    n = 'knight',
    r = 'rook',
    q = 'queen',
    k = 'king',
}

export enum TeamType {
    OPPONENT = 'b',
    OUR = 'w',
}

export enum MoveType {
    MOVED = 'moved',
    CAPTURED = 'captured',
    NONE = 'none',
}

export type MoveResult = {
    type: MoveType,
    isCheck?: boolean;
    isCastling?: boolean;
};

export type BoardHistory = {
    state: Board;
    moveResult: MoveResult;
}
