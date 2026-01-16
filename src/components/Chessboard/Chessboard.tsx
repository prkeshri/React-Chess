import { useRef, useState } from "react";
import "./Chessboard.css";
import Tile from "../Tile/Tile";
import {
  VERTICAL_AXIS,
  HORIZONTAL_AXIS,
} from "../../Constants";
import { Piece, Position } from "../../models";
import { Board } from "../../models/Board";
import { Positions } from "../../utils/position";
import { AtomicBoard } from "../../models/AtomicBoard";

interface Props {
  playMove: (piece: Piece, position: Position) => void;
  board: Board;
}
type XY = {
  x: number;
  y: number;
};

type ActivePieceInfo = {
  position: Position,
  piece: Piece,
  element: HTMLElement,
  width: number,
  parentLT: XY,
  maxX: number,
  offsetXY: XY,
  lastHover?: Position,
  lastUndeads?: Position[]
};

export default function Chessboard({ playMove, board: chessBoard }: Props) {
  const { pieces } = chessBoard;
  const [activePieceInfo, setActivePieceInfo] = useState<ActivePieceInfo | null>(null);
  const { current: tileRerenders } = useRef<Record<string, any>>({});
  const moved = useRef<any>(null);
  const chessboardRef = useRef<HTMLDivElement>(null);

  function grabPiece(e: React.MouseEvent) {
    const element = e.target as HTMLElement;
    const chessboard = chessboardRef.current;
    if (!chessboard) {
      return;
    }
    if (activePieceInfo) {
      return dropPiece(e);
    }
    if (!element.classList.contains("chess-piece")) {
      return;
    }

    moved.current = false;
    const parent = element.parentElement!;
    const x = parseInt(parent.getAttribute('data-x')!);
    const y = parseInt(parent.getAttribute('data-y')!);
    const position = new Position(x, y);
    const piece = chessBoard.pieceAt(position);
    if (!piece || !piece.possibleMoves?.length) {
      return;
    }
    element.style.position = "absolute";
    element.style.width = `${element.clientWidth}px`;
    element.style.height = `${element.clientWidth}px`;

    const rect = element.getBoundingClientRect();
    const width = rect.width;
    setActivePieceInfo({
      offsetXY: {
        x: e.clientX - rect.x,
        y: e.clientY - rect.y,
      },
      position,
      piece,
      element,
      width,
      parentLT: {
        x: parent.offsetLeft,
        y: parent.offsetTop
      },
      maxX: chessboard.clientWidth - width,
    })
  }

  function movePiece(e: React.MouseEvent) {
    const chessboard = chessboardRef.current;
    if (!chessboard || !activePieceInfo) {
      return;
    }
    moved.current = true;
    const {
      piece,
      element,
      parentLT,
      maxX,
      offsetXY,
      lastHover,
      lastUndeads,
    } = activePieceInfo;

    const minX = 0;
    const eX = e.clientX - chessboard.offsetLeft - offsetXY.x;

    const minY = 0;
    const maxY = chessboard.clientHeight;
    const eY = e.clientY - chessboard.offsetTop - offsetXY.y;
    element.style.position = "absolute";

    const x = Math.min(Math.max(minX, eX), maxX) - parentLT.x;
    const y = Math.min(Math.max(minY, eY), maxY) - parentLT.y;
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;

    const target = document.elementsFromPoint(e.clientX, e.clientY).find(e => e.getAttribute('data-x'));
    if (!target) {
      return;
    }
    const ttx = parseInt(target.getAttribute('data-x')!);
    const tty = parseInt(target.getAttribute('data-y')!);
    const point = new Position(ttx, tty);
    if (lastHover && lastHover.samePosition(point)) {
      return;
    }
    if (lastHover) {
      tileRerenders[`${lastHover.x}x${lastHover.y}`]?.("");
    }

    activePieceInfo.lastHover = point;
    let undeads: Position[] = [];
    if (piece.possibleMoves?.find(p => p.samePosition(point))) {
      tileRerenders[`${point.x}x${point.y}`]?.("move");
      if (chessBoard.isVariantAtomic) {
        let enPawn;
        if (chessBoard.pieceAt(point) || (enPawn = chessBoard.enPassantPawn)?.enPassant?.samePosition(point)) {
          undeads = (chessBoard as AtomicBoard).getSurroundingUndeads(point).map(p => p._position && p !== piece);
          if (enPawn) {
            undeads.push(enPawn.position);
          }
        }
      }
    }
    if (chessBoard.isVariantAtomic) {
      let oldUndeads: Position[] = [], newUndeads: Position[] = undeads;
      if (lastUndeads?.length) {
        oldUndeads = Positions.diff(lastUndeads, undeads);
        newUndeads = Positions.diff(undeads, lastUndeads);
      }
      oldUndeads.forEach(p => {
        tileRerenders[`${p.x}x${p.y}`]?.("");
      });
      newUndeads.forEach(p => {
        tileRerenders[`${p.x}x${p.y}`]?.("blast");
      });
      activePieceInfo.lastUndeads = undeads;
    }
  }

  function dropPiece(e: React.MouseEvent) {
    const chessboard = chessboardRef.current;
    if (!chessboard || !activePieceInfo) {
      return;
    }

    if (!moved.current) {
      return;
    }
    const { piece, element, lastHover, lastUndeads } = activePieceInfo;
    if (lastHover) {
      tileRerenders[`${lastHover.x}x${lastHover.y}`]?.("");
    }
    //RESETS THE PIECE POSITION
    element.style.position = "relative";
    element.style.removeProperty("top");
    element.style.removeProperty("left");
    element.style.removeProperty("width");
    element.style.removeProperty("height");

    const target = document.elementsFromPoint(e.clientX, e.clientY).find(e => e.getAttribute('data-x'));
    if (!target) {
      clean();
      setActivePieceInfo(null);
      return;
    }
    const x = parseInt(target.getAttribute('data-x')!);
    const y = parseInt(target.getAttribute('data-y')!);

    if (piece) {
      playPiece(piece, new Position(x, y), e.button === 2);
    }

    clean();
    setActivePieceInfo(null);

    function clean() {
      lastUndeads?.forEach(p => {
        tileRerenders[`${p.x}x${p.y}`]?.("");
      });
    }
  }

  function playPiece(piece: Piece, destination: Position, force: boolean = false) {
    if (force ||
      piece.possibleMoves?.find(m => m.samePosition(destination))) {
      playMove(piece, destination);
      return;
    }
  }

  let board = [];

  for (let j = VERTICAL_AXIS.length - 1; j >= 0; j--) {
    for (let i = 0; i < HORIZONTAL_AXIS.length; i++) {
      const number = j + i + 2;
      const piece = chessBoard.pieceAt(new Position(i, j));
      const currentPiece = activePieceInfo?.piece;
      const highlight = currentPiece?.possibleMoves?.some(p => p.samePosition(new Position(i, j)));
      const image = piece ? piece.image : undefined;

      board.push(<Tile
        sameTeam={currentPiece?.team === piece?.team}
        clicked={!!(currentPiece && currentPiece === piece)}
        key={`${j}x${i}`}
        ij={{ i, j }}
        image={image}
        number={number}
        highlight={!!highlight}
        onRender={(setHighlighter) => {
          tileRerenders[`${i}x${j}`] = setHighlighter
        }}
      />);
    }
  }

  return (
    <>
      <div
        onMouseMove={(e) => movePiece(e)}
        onMouseDown={(e) => grabPiece(e)}
        onMouseUp={(e) => dropPiece(e)}
        id="chessboard"
        ref={chessboardRef}
      >
        {board}
      </div>
    </>
  );
}
