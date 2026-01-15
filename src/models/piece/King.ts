import { Positions } from "../../utils/position";
import { Piece } from "../Piece";
import { Position } from "../Position";
import { Queen } from "./Queen";
import { Rook } from "./Rook";

class King extends Piece {
    static iters = 1;
    isAttacked?: boolean;
    deniedMoves: Position[] = [];

    getIterSteps() {
        return Queen.prototype.getIterSteps();
    }
    freshenUp(): void {
        super.freshenUp();
        this.deniedMoves = [];
        this.isAttacked = false;
    }
    calculateCastlingMoves() {
        const moves = this.possibleMoves;
        const pos = this.position;
        const cMoves: Position[] = [];
        if (moves?.length && !this._hasMoved) {
            const rooks = this.teamRef.pieces.filter(p => p.isRook) as Rook[];
            rooks.forEach(rook => {
                if (rook._hasMoved || !rook.possibleMoves?.length || rook.isAttacked) {
                    return;
                }
                let start, end;
                if (rook._position._x < pos._x) {
                    start = rook._position._x;
                    end = pos._x - 1;
                } else {
                    start = pos._x + 1;
                    end = rook._position._x;
                }
                for (let i = start; i <= end; i++) {
                    const position = new Position(i, pos._y);
                    if (this.deniedMoves.find(p => p.samePosition(position))) {
                        return;
                    }
                }
                const l = rook.horizMove.length;
                const diff = Math.abs(pos.x - rook.position.x) - 1;
                if (diff !== l) {
                    return;
                }
                cMoves.push(rook.position);
            });
        }
        this.possibleMoves = [...(this.possibleMoves ?? []), ...cMoves];
    }
}

export { King };
