import { TeamType } from "../Types";
import { Piece } from "./Piece";
import { King } from "./piece/King";
import { Rook } from "./piece/Rook";
import { Position } from "./Position";

export class Team {
    type: TeamType;
    pieces: Piece[] = [];
    king!: King;
    rookL?: Rook;
    rookR?: Rook;
    restrictedMoves?: Position[];
    constructor(type: TeamType) {
        this.type = type;
    }

    freshenUp() {
        this.restrictedMoves = undefined;
    }

    empty() {
        this.pieces = [];
        this.rookL = this.rookR = undefined;
        //@ts-ignore
        this.king = undefined;
    }
    add(piece: Piece) {
        this.pieces.push(piece);
        if (piece.isKing) {
            this.king = piece as King;
        } else if (piece.isRook) {
            const rook = piece as Rook;
            if (rook._position._x === 0) {
                this.rookL = rook;
            } else {
                this.rookR = rook;
            }
        }
    }

    aptFenBit(c: string) {
        if (this.type === TeamType.OUR) {
            c = c.toUpperCase();
        }
        return c;
    }

    static which(n: string): TeamType {
        const team = n.charCodeAt(0) >= 97 ? TeamType.OPPONENT : TeamType.OUR;
        return team;
    }

}
