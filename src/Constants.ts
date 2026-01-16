import { Board } from "./models/Board";
import { Piece } from "./models/Piece";
import "./models/__registers";
import { Position } from "./models/Position";
import { PieceType, TeamType } from "./Types";
import { Pawn } from "./models/piece/Pawn";

export const Variants = ["atomic"];

export const VERTICAL_AXIS = ["1", "2", "3", "4", "5", "6", "7", "8"];
export const HORIZONTAL_AXIS = ["a", "b", "c", "d", "e", "f", "g", "h"];

export const initialBoard = () => {
  const initialBoard = Board.make([
    Piece.make(
      new Position(0, 7),
      PieceType.ROOK,
      TeamType.BLACK,
      false),
    Piece.make(
      new Position(1, 7),
      PieceType.KNIGHT,
      TeamType.BLACK,
      false),
    Piece.make(
      new Position(2, 7),
      PieceType.BISHOP,
      TeamType.BLACK,
      false),
    Piece.make(
      new Position(3, 7),
      PieceType.QUEEN,
      TeamType.BLACK,
      false),
    Piece.make(
      new Position(4, 7),
      PieceType.KING,
      TeamType.BLACK,
      false),
    Piece.make(
      new Position(5, 7),
      PieceType.BISHOP,
      TeamType.BLACK,
      false),
    Piece.make(
      new Position(6, 7),
      PieceType.KNIGHT,
      TeamType.BLACK,
      false),
    Piece.make(
      new Position(7, 7),
      PieceType.ROOK,
      TeamType.BLACK,
      false),
    new Pawn(
      new Position(0, 6),
      TeamType.BLACK,
      false),
    new Pawn(
      new Position(1, 6),
      TeamType.BLACK,
      false),
    new Pawn(
      new Position(2, 6),
      TeamType.BLACK,
      false),
    new Pawn(
      new Position(3, 6),
      TeamType.BLACK,
      false),
    new Pawn(
      new Position(4, 6),
      TeamType.BLACK,
      false),
    new Pawn(
      new Position(5, 6),
      TeamType.BLACK,
      false),
    new Pawn(
      new Position(6, 6),
      TeamType.BLACK,
      false),
    new Pawn(
      new Position(7, 6),
      TeamType.BLACK,
      false),

    Piece.make(
      new Position(0, 0),
      PieceType.ROOK,
      TeamType.WHITE,
      false),
    Piece.make(
      new Position(1, 0),
      PieceType.KNIGHT,
      TeamType.WHITE,
      false),
    Piece.make(
      new Position(2, 0),
      PieceType.BISHOP,
      TeamType.WHITE,
      false),
    Piece.make(
      new Position(3, 0),
      PieceType.QUEEN,
      TeamType.WHITE,
      false),
    Piece.make(
      new Position(4, 0),
      PieceType.KING,
      TeamType.WHITE,
      false),
    Piece.make(
      new Position(5, 0),
      PieceType.BISHOP,
      TeamType.WHITE,
      false),
    Piece.make(
      new Position(6, 0),
      PieceType.KNIGHT,
      TeamType.WHITE,
      false),
    Piece.make(
      new Position(7, 0),
      PieceType.ROOK,
      TeamType.WHITE,
      false),
    new Pawn(
      new Position(0, 1),
      TeamType.WHITE,
      false),
    new Pawn(
      new Position(1, 1),
      TeamType.WHITE,
      false),
    new Pawn(
      new Position(2, 1),
      TeamType.WHITE,
      false),
    new Pawn(
      new Position(3, 1),
      TeamType.WHITE,
      false),
    new Pawn(
      new Position(4, 1),
      TeamType.WHITE,
      false),
    new Pawn(
      new Position(5, 1),
      TeamType.WHITE,
      false),
    new Pawn(
      new Position(6, 1),
      TeamType.WHITE,
      false),
    new Pawn(
      new Position(7, 1),
      TeamType.WHITE,
      false),
  ]);//*/

  initialBoard.calculateAllMoves();
  return initialBoard;
}