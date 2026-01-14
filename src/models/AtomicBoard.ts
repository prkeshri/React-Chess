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

    playMove(enPassantMove: boolean, playedPiece: Piece, destination: Position): MoveResult {
        const result = super.playMove(enPassantMove, playedPiece, destination);
        if (result === MoveResult.CAPTURED) {
            this.pieces = this.pieces.reduce((results, piece) => {
                const blasted = this.isBlasted(piece, destination);
                if (blasted) {
                    if (piece.isKing) {
                        this.winningTeam = playedPiece.team;
                    }
                } else {
                    results.push(piece);
                }
                return results;
            }, [] as Piece[]);


        }
        return result;
    }
}