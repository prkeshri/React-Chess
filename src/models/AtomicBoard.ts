import { MoveResult } from "../Types";
import { Board } from "./Board";
import { Piece } from "./Piece";
import { Position } from "./Position";

export class AtomicBoard extends Board {
    // Atomic chess specific methods can go here
    isBlasted(piece: Piece, destination: Position): boolean {
        if (piece.samePosition(destination)) return true;
        if (!piece.isPawn) {
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    if (i === 0 && j === 0) continue;
                    const adjacentPosition = new Position(destination.x + i, destination.y + j);
                    if (piece.samePosition(adjacentPosition)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
}