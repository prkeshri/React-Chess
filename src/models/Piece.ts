import { TeamType, PieceType, PieceTypeFull, IterStepsConfig } from "../Types";
import { Board } from "./Board";
import { Position } from "./Position";
import { Team } from "./team";

export abstract class Piece {
    dead?: boolean;
    image: string;
    _position: Position;
    type: PieceType;
    team: TeamType;
    possibleMoves?: Position[];
    _hasMoved: boolean = false;
    restrictedMoves?: Position[];
    board!: Board;
    teamRef!: Team;
    static iters: number = 0;
    freshenUp() {
        this.possibleMoves = [];
        this.restrictedMoves = undefined;
    }
    constructor(position: Position,
        type: PieceType,
        team: TeamType,
        hasMoved: boolean,
        possibleMoves: Position[] = []
    ) {
        this.image = `assets/images/${PieceTypeFull[type]}_${team}.png`;
        this._position = position.with(this);
        this.type = type;
        this.team = team;
        this.possibleMoves = possibleMoves;
        this._hasMoved = hasMoved;
    }

    get position(): Position {
        return this._position;
    }
    set position(p: Position) {
        if (p.samePosition(this._position)) {
            return;
        }
        this._position = p.with(this);
        this._hasMoved = true;
    }

    get isPawn(): boolean {
        return this.type === PieceType.PAWN
    }

    get isRook(): boolean {
        return this.type === PieceType.ROOK
    }

    get isKnight(): boolean {
        return this.type === PieceType.KNIGHT
    }

    get isBishop(): boolean {
        return this.type === PieceType.BISHOP
    }

    get isKing(): boolean {
        return this.type === PieceType.KING
    }

    get isQueen(): boolean {
        return this.type === PieceType.QUEEN
    }

    get hasMoved() {
        return this._hasMoved;
    }

    get fenBit() {
        return this.teamRef.aptFenBit(this.type);
    }

    getIterSteps(): IterStepsConfig {
        throw new Error("Method not implemented.");
    }

    samePiecePosition(otherPiece: Piece): boolean {
        return this._position.samePosition(otherPiece.position);
    }

    samePosition(otherPosition: Position): boolean {
        return this._position.samePosition(otherPosition);
    }

    clone(): Piece {
        const c = new (this.constructor as any)(this._position.clone(),
            this.type, this.team, this._hasMoved,
            this.possibleMoves?.map(m => m.clone()));
        c.teamRef = this.teamRef;
        c.board = this.board;
        return c;
    }

    static make(position: Position,
        type: PieceType,
        team: TeamType,
        hasMoved = false,
        possibleMoves: Position[] = [],
        //@ts-ignore
        ...rest
    ): Piece {
        const Class = this.map[type];
        if (type === PieceType.PAWN) {
            //@ts-ignore
            return new Class(position, team, hasMoved);
        }
        //@ts-ignore
        return new Class(position, type, team, hasMoved, possibleMoves, ...rest);
    }

    static map: Record<PieceType, typeof Piece> = {} as any;
    static register(type: PieceType, clazz: any) {
        this.map[type] = clazz;
    }
}