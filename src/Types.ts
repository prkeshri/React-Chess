import { Board } from "./models/Board";

export enum Variant {
    REGULAR = "",
    ATOMIC = "atomic"
};

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
export enum TeamTypes {
    WHITE = 'w',
    BLACK = 'b'
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

export type CalculatedResult = {
    isCheck?: boolean;
    winner?: TeamType;
    staleMate?: boolean;
    shouldPromote?: boolean;
    blastWin?: boolean;
};

export type MoveResult = CalculatedResult & {
    type: MoveType,
    isCastling?: boolean;
    promoted?: boolean;
};

export type StepOptions = {
    canAttack?: boolean,
    canMove?: boolean,
    cb?: Function,
    iters?: number
};

export type IterStepsConfig = [number, number, StepOptions?][];

export type BoardHistory = {
    state: Board;
    moveResult: MoveResult;
}
