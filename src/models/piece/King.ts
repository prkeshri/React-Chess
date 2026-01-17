import { IterStepsConfig, Variant } from "../../Types";
import { invertTeam } from "../../utils/typeUtils";
import { Piece } from "../Piece";
import { Position } from "../Position";
import { Queen } from "./Queen";

class King extends Piece {
    static iters = 1;
    isAttacked?: boolean;
    deniedMoves: Position[] = [];

    getIterSteps(): IterStepsConfig {
        let steps = Queen.prototype.getIterSteps();
        if (this.board.isVariantAtomic) {
            steps = steps.map(s => [s[0], s[1], { canAttack: false }]);
        }
        return steps;
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
            const { rookL, rookR } = this.teamRef;
            const rooks = [rookL, rookR].filter(r => !!r);
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

    isAtomicSafe(otherKingPos?: Position) {
        otherKingPos = otherKingPos ?? this.board.teams[invertTeam(this.team)].king._position;
        return otherKingPos.isBeside(this._position);
    }
}

export { King };
