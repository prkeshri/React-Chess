import { TeamType } from "../Types";
import { Piece } from "./Piece";
import { King } from "./piece/King";
import { Position } from "./Position";

export class Team {
    type: TeamType;
    pieces: Piece[] = [];
    king!: King;
    allowedMoves: Position[] = [];
    constructor(type: TeamType) {
        this.type = type;
    }

    freshenUp() {
        this.allowedMoves = [];
    }

    empty() {
        this.pieces = [];
    }
    add(piece: Piece) {
        this.pieces.push(piece);
        if (piece.isKing) {
            this.king = piece as King;
        }
    }
}
