import { Piece } from "../Piece";
import { Position } from "../Position";

class Rook extends Piece {
    horizMove: Position[] = [];
    isAttacked = false;
    getIterSteps() {
        const cb = (m: Position[]) => {
            if (m.length) {
                this.horizMove = m;
            } // Only  1 possible for castling
        };
        return [[-1, 0, { cb }], [1, 0, { cb }], [0, -1], [0, 1]];
    }
    freshenUp() {
        this.horizMove = [];
        this.isAttacked = false;
        super.freshenUp();
    }
}

export { Rook };
