import { PieceType, Variant } from "../Types";
import { AtomicBoard } from "./AtomicBoard";
import { Board } from "./Board";
import { Piece } from "./Piece";
import { Bishop } from "./piece/Bishop";
import { King } from "./piece/King";
import { Knight } from "./piece/Knight";
import { Pawn } from "./piece/Pawn";
import { Queen } from "./piece/Queen";
import { Rook } from "./piece/Rook";

Piece.factory.register(PieceType.QUEEN, Queen);
Piece.factory.register(PieceType.KING, King);
Piece.factory.register(PieceType.BISHOP, Bishop);
Piece.factory.register(PieceType.KNIGHT, Knight);
Piece.factory.register(PieceType.ROOK, Rook);
Piece.factory.register(PieceType.PAWN, Pawn);

Board.factory.register(Variant.ATOMIC, AtomicBoard);
