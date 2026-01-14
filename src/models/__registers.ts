import { PieceType } from "../Types";
import { Piece } from "./Piece";
import { Bishop } from "./piece/Bishop";
import { King } from "./piece/King";
import { Knight } from "./piece/Knight";
import { Pawn } from "./piece/Pawn";
import { Queen } from "./piece/Queen";
import { Rook } from "./piece/Rook";

Piece.register(PieceType.QUEEN, Queen);
Piece.register(PieceType.KING, King);
Piece.register(PieceType.BISHOP, Bishop);
Piece.register(PieceType.KNIGHT, Knight);
Piece.register(PieceType.ROOK, Rook);
Piece.register(PieceType.PAWN, Pawn);

