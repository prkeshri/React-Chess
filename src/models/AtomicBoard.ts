import { MoveResult, TeamType, Variant } from "../Types";
import { Board } from "./Board";
import { Piece } from "./Piece";
import { Position } from "./Position";

export class AtomicBoard extends Board {
    constructor(pieces: Piece[]) {
        super(pieces);
        this.variant = Variant.ATOMIC;
    }
    markSurroundingRestricted(point: Position, team: TeamType) {
        const { x, y } = point;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) {
                    continue;
                }
                const newX = x + i, newY = y + j;
                if (!(newX >= 0 && newX < 8 && newY >= 0 && newY < 8)) {
                    continue;
                }
                const newPos = new Position(newX, newY);
                const p = this.pieceAt(newPos, team);
                if (p) {
                    p.restrictedMoves = []
                }
            }
        }
    }
    getSurroundingUndeads(point: Position): Piece[] {
        const pieces: Piece[] = [];
        const { x, y } = point;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) {
                    continue;
                }
                const newX = x + i, newY = y + j;
                if (!(newX >= 0 && newX < 8 && newY >= 0 && newY < 8)) {
                    continue;
                }
                const newPos = new Position(newX, newY);
                const p = this.pieceAt(newPos);
                if (p && !p.isPawn) {
                    pieces.push(p);
                }
            }
        }
        return pieces;
    }
    markSurroundingDead(point: Position) {
        this.getSurroundingUndeads(point).forEach(p => p.dead = true);
    }
}