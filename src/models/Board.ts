import { MoveResult, MoveType, PieceType, TeamType } from "../Types";
import { invertTeam } from "../utils/typeUtils";
import { Pawn } from "./piece/Pawn";
import { Piece } from "./Piece";
import { Position } from "./Position";
import { Team } from "./team";
import { Positions } from "../utils/position";

export class Board {
  _pieces: Piece[] = [];
  totalTurns: number;
  enPassantPawn?: Pawn;
  winningTeam?: TeamType;
  teams = {
    [TeamType.OUR]: new Team(TeamType.OUR),
    [TeamType.OPPONENT]: new Team(TeamType.OPPONENT),
  }
  get pieces() {
    return this._pieces;
  }
  set pieces(pieces) {
    this._pieces = pieces;
    Object.values(this.teams).forEach(t => t.empty());
    pieces.forEach((p) => {
      const team = this.teams[p.team];
      team.add(p);
      p.board = this;
      p.teamRef = team;
    });
  }
  constructor(pieces: Piece[], totalTurns: number) {
    this.pieces = pieces;
    this.totalTurns = totalTurns;
  }

  get currentTeam(): TeamType {
    return this.totalTurns % 2 === 0 ? TeamType.OPPONENT : TeamType.OUR;
  }

  calculateAllMoves() {
    const currentTeam = this.currentTeam;
    // Calculate the moves of all the pieces
    let noMoreMoves = true;

    const otherTeam = invertTeam(currentTeam);
    const {
      [otherTeam]: opponentTeam,
      [currentTeam]: ourTeam
    } = this.teams;

    ourTeam.freshenUp();
    opponentTeam.freshenUp();
    for (const piece of this.pieces) {
      piece.freshenUp();
    }
    for (const piece of opponentTeam.pieces) {
      piece.calcPossibleMoves();
    }

    for (const piece of ourTeam.pieces) {
      let possibleMoves = piece.calcPossibleMoves();
      piece.possibleMoves = possibleMoves;
      if (possibleMoves.length) {
        noMoreMoves = false;
      }
    }

    ourTeam.king.calculateCastlingMoves();

    if (noMoreMoves) {
      this.winningTeam =
        this.currentTeam === TeamType.OUR ? TeamType.OPPONENT : TeamType.OUR;
    }
  }

  promote(pawn: Pawn, pieceType: PieceType) {
    const newPiece = Piece.make(
      pawn.position,
      pieceType,
      TeamType.OUR,
      false
    );
    const newPieces = this.pieces.filter(piece => piece !== pawn);
    newPieces.push(newPiece);
    this.pieces = newPieces;
    this.calculateAllMoves();
    const isCheck = !!this.teams[this.currentTeam].king.isAttacked;

    return isCheck;
  }
  playMove(piece: Piece, destination: Position): MoveResult {
    let destinationPiece;
    let enPassantPawn = this.enPassantPawn;
    if (!(enPassantPawn && piece.isPawn && destination.samePosition(enPassantPawn.enPassant!))) {
      enPassantPawn = undefined;
    }

    let newPieces: Piece[] = [];
    let isCastling = false;

    if (piece.isKing && Math.abs(piece.position.x - destination.x) > 1) {
      newPieces = this.pieces; // No Change!
      isCastling = true;
      // Castling
      this.pieces.some((p) => {
        if (p.samePosition(destination)) {
          p.position = piece.position;
          return true;
        }
      });
    } else {
      this.pieces.forEach((p) => {
        if (p.samePosition(destination) || (p === enPassantPawn)) {
          destinationPiece = p;
        } else {
          newPieces.push(p);
        }
      });
    }

    if (this.enPassantPawn) {
      this.enPassantPawn.enPassant = undefined;
      this.enPassantPawn = undefined;
    }
    piece.position = destination;
    this.pieces = newPieces;
    this.calculateAllMoves();
    const isCheck = !!this.teams[this.currentTeam].king.isAttacked;
    if (destinationPiece) {
      return {
        type: MoveType.CAPTURED,
        isCheck,
        isCastling
      };
    }
    return {
      type: MoveType.MOVED,
      isCheck,
      isCastling
    };
  }

  clone(): Board {
    return new (this.constructor as any)(
      this.pieces.map((p) => p.clone()),
      this.totalTurns
    );
  }

  getPossibleMovesInDirection({
    piece,
    stepX,
    stepY,
    once = false,
    playingTeam = true,
    canAttack = true,
    canMove = true,
  }: {
    piece: Piece,
    stepX: number,
    stepY: number,
    once?: boolean,
    playingTeam?: boolean,
    canAttack?: boolean,
    canMove?: boolean,
  }) {
    const possibleMoves: Position[] = [];
    const otherTeamRef = this.teams[invertTeam(piece.team)];
    const otherKing = otherTeamRef.king;
    const possibleNextAttacks: Position[] = [];
    const afterKillMoves: Position[] = [];
    let ranOnce = false;

    let { x, y } = piece.position;
    let point!: Position;
    let destPiece: Piece | undefined;
    const init = () => {
      x += stepX; y += stepY; point = new Position(x, y);
      let finder = (p: Piece) => p.samePosition(point);
      if (piece.isPawn && canAttack) {
        finder = (p: Piece) => {
          if (p.samePosition(point)) return true;
          if (p.isPawn) {
            const pawn = p as Pawn;
            if (pawn.enPassant) {
              return pawn.enPassant.samePosition(point);
            }
          }
          return false;
        }
      }
      destPiece = this.pieces.find(finder);
    };
    const next = init;
    const truthy = () => ((once && !ranOnce) || !once) && (x >= 0 && x < 8 && y >= 0 && y < 8);

    for (init(); truthy(); next()) {
      ranOnce = true;
      if (destPiece) {
        if (canAttack) {
          if (destPiece.team !== piece.team) {
            possibleMoves.push(point);
            if (destPiece.isKing && !playingTeam) {
              otherKing.isAttacked = true;
              otherTeamRef.allowedMoves.push(...possibleMoves, piece.position)
            }
          } else {
            possibleNextAttacks.push(point);
          }
        }
        break;
      } else {
        if (canMove) {
          possibleMoves.push(point);
        } else {
          possibleNextAttacks.push(point);
        }
      }
    }

    if (!playingTeam) {
      const kingDenies = [...possibleNextAttacks];
      if (possibleMoves.length && canAttack) {
        kingDenies.push(...possibleMoves);
      }

      if (kingDenies.length) {
        otherKing.deniedMoves.push(...kingDenies);
      }

      if (!destPiece) {
        return possibleMoves;
      }
      if (destPiece.isKing && truthy()) {
        next();
        if (point) {
          otherKing.deniedMoves.push(point);
        }
        return possibleMoves;
      }

      const attackPiece = destPiece;
      for (init(); truthy(); next()) {
        if (!destPiece) {
          afterKillMoves.push(point);
        } else {
          if (destPiece.isKing) {
            attackPiece.allowedMoves = [...possibleMoves, piece.position, ...afterKillMoves];
          }
          break;
        }
      }

      return possibleMoves;
    } else {
      let finalPossibleMoves = possibleMoves;
      if (piece.allowedMoves.length && possibleMoves.length) {
        finalPossibleMoves = Positions.commons(possibleMoves, piece.allowedMoves);
      }
      if (piece.deniedMoves.length && finalPossibleMoves.length) {
        finalPossibleMoves = Positions.diff(finalPossibleMoves, piece.deniedMoves);
      }
      if (!piece.isKing && piece.teamRef.allowedMoves.length && finalPossibleMoves.length) {
        finalPossibleMoves = Positions.commons(finalPossibleMoves, piece.teamRef.allowedMoves);
      }
      return finalPossibleMoves;
    }
  }

}
