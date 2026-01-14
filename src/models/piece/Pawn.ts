import { PieceType, TeamType } from "../../Types";
import { Piece } from "../Piece";
import { Position } from "../Position";

class Pawn extends Piece {
    static iterOnce = true;
    getIterSteps() {
        const team = this.team;
        const specialRow = team === TeamType.OUR ? 1 : 6;
        const pawnDirection = team === TeamType.OUR ? 1 : -1;

        const steps = [[0, pawnDirection, { canAttack: false }],
        [1, pawnDirection, { canMove: false }],
        [-1, pawnDirection, { canMove: false }]];
        if (this.position.y === specialRow) {
            steps.unshift([0, 2 * pawnDirection, { canAttack: false }]);
        }
        return steps;
    }

    enPassant?: Position;

    constructor(position: Position,
        team: TeamType,
        hasMoved: boolean,
        enPassant?: Position,
    ) {
        super(position, PieceType.PAWN, team, hasMoved);
        this.enPassant = enPassant;
    }

    clone(): Pawn {
        return new Pawn(
            new Position(this.position.x, this.position.y),
            this.team,
            this._hasMoved,
            this.enPassant,
        );
    }

    get position() {
        return super.position;
    }
    set position(p: Position) {
        const current = this._position;
        if (Math.abs(current._y - p._y) === 2) {
            this.enPassant = new Position(p._x, (p._y + current._y) / 2);
            this.board.enPassantPawn = this;
        }
        super.position = p
    }
}

export { Pawn };
