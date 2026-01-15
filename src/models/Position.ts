import { Piece } from "./Piece";

export class Position {
    _x: number;
    _y: number;
    piece: Piece | undefined;
    constructor(x: number, y: number) {
        this._x = x;
        this._y = y;
    }

    get isVerticalEdge() {
        return this._y === 0 || this._y === 7;
    }
    samePosition(otherPosition: Position): boolean {
        return this._x === otherPosition._x &&
            this._y === otherPosition._y;
    }

    with(p: Piece) {
        this.piece = p;
        return this;
    }
    get xy() {
        return this._x + 'x' + this._y;
    }
    get x() {
        return this._x;
    }

    set x(x: number) {
        if (x === this._x) {
            return;
        }
        this._x = x;
        if (this.piece) this.piece._hasMoved = true;
    }


    get y() {
        return this._y;
    }

    set y(y: number) {
        if (y === this._y) {
            return;
        }
        this._y = y;
        if (this.piece) this.piece._hasMoved = true;
    }

    clone(): Position {
        return new Position(this._x, this._y);
    }

    get notation() {
        return String.fromCharCode(this._x + 97) + (this._y + 1);
    }

    static raw(notation: string): [number, number] {
        const [x97, y1] = notation.split('');
        return [x97.charCodeAt(0) - 97, parseInt(y1) - 1];
    }
}
