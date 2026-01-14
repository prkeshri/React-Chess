import { TeamType, PieceType, PieceTypeFull } from "../Types";
import { Board } from "./Board";
import { Position } from "./Position";
import { Team } from "./Team";

export abstract class Piece {
    image: string;
    _position: Position;
    type: PieceType;
    team: TeamType;
    possibleMoves?: Position[];
    _hasMoved: boolean = false;
    restrictedMoves?: Position[];
    board!: Board;
    teamRef!: Team;
    static iterOnce: boolean = false;
    freshenUp() {
        this.possibleMoves = [];
        this.restrictedMoves = undefined;
    }
    serialize() {
        return [this._position.x, this._position.y, this.type,
        this.team];
    }
    deserialize(data: any[]) {
        const newPos = new Position(data[0], data[1]);
        if (!this._position.samePosition(newPos)) {
            this._hasMoved = true;
            this._position = newPos;
        }
        this.type = data[2];
        this.team = data[3];
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
    getIterSteps(): Array<any> {
        throw new Error("Method not implemented.");
    }

    calcPossibleMoves(): Position[] {
        const possibleMoves: Position[] = [];
        const Class = this.constructor as typeof Piece;
        const steps = this.getIterSteps();
        const once = Class.iterOnce;
        let step;
        const board = this.board;
        const playingTeam = board.currentTeam === this.team;
        while (step = steps.pop()) {
            const stepOptions = step[2] ?? {} as any;
            const { canAttack = true, canMove = true, cb } = stepOptions;
            const moves = board.getPossibleMovesInDirection({
                piece: this,
                stepX: step[0],
                stepY: step[1],
                playingTeam,
                once,
                canAttack,
                canMove,
            });
            if (cb) {
                cb(moves);
            }
            possibleMoves.push(...moves);
        }

        return possibleMoves;
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
        hasMoved: boolean,
        possibleMoves: Position[] = [],
        //@ts-ignore
        ...rest
    ): Piece {
        const Class = this.map[type];
        //@ts-ignore
        return new Class(position, type, team, hasMoved, possibleMoves, ...rest);
    }

    static map: Record<PieceType, typeof Piece> = {} as any;
    static register(type: PieceType, clazz: any) {
        this.map[type] = clazz;
    }
}