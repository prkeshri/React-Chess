import { CalculatedResult, MoveResult, MoveType, PieceType, StepOptions, TeamType, TeamTypes } from "../Types";
import { invertTeam } from "../utils/typeUtils";
import { Pawn } from "./piece/Pawn";
import { Piece } from "./Piece";
import { Position } from "./Position";
import { Team } from "./team";
import { Positions } from "../utils/position";
import { King } from "./piece/King";

export class Board {
  _pieces: Piece[] = [];
  totalTurns: number;
  halfMoves: number;
  enPassantPawn?: Pawn;
  winningTeam?: TeamType;
  staleMate?: boolean;
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
  constructor(pieces: Piece[], totalTurns = 0, halfMoves = 0) {
    this.pieces = pieces;
    this.totalTurns = totalTurns;
    this.halfMoves = halfMoves;
  }

  currentTeam: TeamType = TeamType.OUR;

  pieceAt(p: Position) {
    return this._pieces.find(piece => piece.samePosition(p));
  }

  calculateAllMoves(): CalculatedResult {
    const currentTeam = this.currentTeam;

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
      this.calcPossibleMovesFor(piece);
    }

    // Calculate the moves of all the pieces
    let noMoreMoves = true;

    for (const piece of ourTeam.pieces) {
      let possibleMoves = this.calcPossibleMovesFor(piece);
      piece.possibleMoves = possibleMoves;
      if (possibleMoves.length) {
        noMoreMoves = false;
      }
    }

    ourTeam.king.calculateCastlingMoves();

    let winner, staleMate;
    if (noMoreMoves) {
      if (ourTeam.king.isAttacked) {
        winner = this.winningTeam = otherTeam;
      } else {
        staleMate = this.staleMate = true;
      }
    }
    const isCheck = ourTeam.king.isAttacked;
    return {
      isCheck,
      winner,
      staleMate,
    };
  }

  calcPossibleMovesFor(piece: Piece): Position[] {
    const possibleMoves: Position[] = [];
    const Class = piece.constructor as typeof Piece;
    const steps = piece.getIterSteps();
    const defIters = Class.iters;
    let step;
    const playingTeam = this.currentTeam === piece.team;
    while (step = steps.pop()) {
      const stepOptions = step[2] ?? {} as StepOptions;
      const { canAttack = true, canMove = true, cb, iters = defIters } = stepOptions;
      const moves = this.getPossibleMovesInDirection({
        piece,
        stepX: step[0],
        stepY: step[1],
        playingTeam,
        iters,
        canAttack,
        canMove,
      });
      if (cb) {
        cb(moves);
      }
      possibleMoves.push(...moves);
    }

    return possibleMoves;
  }

  promote(pawn: Pawn, pieceType: PieceType): MoveResult {
    const newPiece = Piece.make(
      pawn.position,
      pieceType,
      pawn.team,
      false
    );
    const newPieces = this.pieces.filter(piece => piece !== pawn);
    this.halfMoves = 0;
    newPieces.push(newPiece);
    this.pieces = newPieces;
    const { isCheck, winner } = this.calculateAllMoves();
    return {
      type: MoveType.MOVED,
      isCheck,
      winner,
      promoted: true,
    };
  }
  playMove(piece: Piece, destination: Position): MoveResult {
    let capturedPiece;
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
          capturedPiece = p;
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

    // Next turn
    this.totalTurns += 1;
    this.currentTeam = invertTeam(this.currentTeam);

    let type: MoveType;
    if (capturedPiece) {
      this.halfMoves = 0;
      type = MoveType.CAPTURED;
    } else {
      this.halfMoves++;
      type = MoveType.MOVED;
    }
    const { isCheck, winner } = this.calculateAllMoves();
    return {
      type,
      isCheck,
      isCastling,
      winner,
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
    iters = 0,
    playingTeam = true,
    canAttack = true,
    canMove = true,
  }: {
    piece: Piece,
    stepX: number,
    stepY: number,
    iters?: number,
    playingTeam?: boolean,
    canAttack?: boolean,
    canMove?: boolean,
  }) {
    const possibleMoves: Position[] = [];
    const otherTeamRef = this.teams[invertTeam(piece.team)];
    const otherKing = otherTeamRef.king;
    const possibleNextAttacks: Position[] = [];
    const afterKillMoves: Position[] = [];

    let { x, y } = piece.position;
    let point!: Position;
    let destPiece: Piece | undefined;
    let run = 0;
    const init = () => {
      run++;
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
    const truthyMain = () => (x >= 0 && x < 8 && y >= 0 && y < 8);
    let truthy = truthyMain;
    if (iters) {
      truthy = () => ((run <= iters) && truthyMain());
    }

    for (init(); truthy(); next()) {
      if (destPiece) {
        if (canAttack) {
          if (destPiece.team !== piece.team) {
            possibleMoves.push(point);
            if (destPiece.isKing && !playingTeam) {
              if (otherKing.isAttacked) {
                otherTeamRef.restrictedMoves = [];
              } else {
                otherKing.isAttacked = true;
                otherTeamRef.restrictedMoves = otherTeamRef.restrictedMoves ?? [];
                otherTeamRef.restrictedMoves.push(...possibleMoves, piece.position);
              }
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
        const otherKingMoved = !otherKing.hasMoved;
        const { x, y } = otherKing.position;
        otherKing.deniedMoves.push(...kingDenies.filter(p => {
          if ((otherKingMoved && (p._y === 0 || p._y === 7)) || (Math.abs(x - p._x) <= 1 && Math.abs(y - p._y) <= 1)) {
            return true;
          }
          return false;
        }));
      }

      if (!destPiece || destPiece.team === piece.team) {
        return possibleMoves;
      }
      if (destPiece.isKing && truthy()) {
        next();
        if (point) {
          otherKing.deniedMoves.push(point);
        }
        return possibleMoves;
      }

      const attackedPiece = destPiece;
      for (init(); truthy(); next()) {
        if (!destPiece) {
          afterKillMoves.push(point);
        } else {
          if (destPiece.isKing && destPiece.team !== piece.team) {
            attackedPiece.restrictedMoves = [...possibleMoves, piece.position, ...afterKillMoves];
          }
          break;
        }
      }

      return possibleMoves;
    } else {
      let finalPossibleMoves = possibleMoves;
      if (piece.restrictedMoves && possibleMoves.length) {
        finalPossibleMoves = Positions.commons(possibleMoves, piece.restrictedMoves);
      }
      if ((piece as King).deniedMoves?.length && finalPossibleMoves.length) {
        finalPossibleMoves = Positions.diff(finalPossibleMoves, (piece as King).deniedMoves);
      }
      if (!piece.isKing && piece.teamRef.restrictedMoves && finalPossibleMoves.length) {
        finalPossibleMoves = Positions.commons(finalPossibleMoves, piece.teamRef.restrictedMoves);
      }
      return finalPossibleMoves;
    }
  }
  serialize() {
    const arr: (Piece | undefined)[][] = Array.from({ length: 8 }, () => Array.from({ length: 8 }));
    this._pieces.forEach(p => {
      arr[p._position._y][p._position._x] = p;
    });
    const rows = [];
    for (let j = 7; j >= 0; j--) {
      const row = arr[j];
      let blanks = 0;
      const bits = [];
      for (let i = 0; i < 8; i++) {
        const piece = row[i];
        if (!piece) {
          blanks++;
          continue;
        }
        if (blanks > 0) {
          bits.push(blanks);
          blanks = 0;
        }
        bits.push(piece.fenBit);
      }
      if (blanks > 0) {
        bits.push(blanks);
      }
      rows.push(bits.join(''));
    }

    const fields = [];
    // Pieces
    fields.push(rows.join('/'));

    // Current Team
    fields.push(this.currentTeam)

    const castleConfigs: string[] = [];
    const calcCastleConfig = (t: Team) => {
      if (t.king.hasMoved) {
        return;
      }
      if (t.rookR && !t.rookR.hasMoved) {
        castleConfigs.push(t.king.fenBit);
      }
      if (t.rookL && !t.rookL.hasMoved) {
        castleConfigs.push(t.aptFenBit(PieceType.QUEEN));
      }
    }

    calcCastleConfig(this.teams.w);
    calcCastleConfig(this.teams.b);
    fields.push(castleConfigs.join('') || '-');

    fields.push(this.enPassantPawn?.enPassant ?
      this.enPassantPawn.enPassant.notation
      : '-');

    fields.push(this.halfMoves);

    const fullMoves = Math.ceil(this.totalTurns / 2);
    fields.push(fullMoves);

    return fields.join(' ');
  }

  static deserialize(fen: string) {
    const [rows$, currentTeam, castles, enPassant, halfMoves, fullMoves] = fen.split(' ');
    const rows = rows$.split('/');
    let y = 8;
    const pieces: Piece[] = [];
    rows.forEach(r => {
      y--;
      let x = 0;
      r.split('').forEach(n => {
        const spaces = parseInt(n);
        if (!isNaN(spaces)) {
          x += spaces;
          return;
        }
        const team = Team.which(n);
        const piece = Piece.make(new Position(x, y), n.toLowerCase() as PieceType, team);
        pieces.push(piece);
        x++;
      });
    });

    const board = new this(pieces);
    board.currentTeam = currentTeam as TeamType;
    if (castles !== '-') {
      castles.split('').forEach(c => {
        const team = Team.which(c);
        const teamRef = board.teams[team];
        teamRef.king._hasMoved = false;
        const kq = c.toLowerCase();
        if (kq === 'k') {
          teamRef.rookR!._hasMoved = false;
        } else {
          teamRef.rookL!._hasMoved = false;
        }
      });
    }

    if (enPassant !== '-') {
      const posRaw = Position.raw(enPassant);
      const [x, y] = posRaw;
      const pawnY = y === 2 ? 3 : 4;
      const pawn = board.pieceAt(new Position(x, pawnY)) as Pawn | undefined;
      if (!pawn) {
        //return null;
      } else {
        pawn.enPassant = new Position(x, y);
        board.enPassantPawn = pawn;
      }
    }

    board.halfMoves = parseInt(halfMoves);
    const total = (parseInt(fullMoves) * 2) + (currentTeam === TeamType.OUR ? -1 : 0)
    board.totalTurns = total;

    board.calculateAllMoves();
    return board;
  }
}
