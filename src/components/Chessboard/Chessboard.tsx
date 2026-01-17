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
  rotated: boolean;
}
type XY = {
  x: number;
  y: number;
};

type ActivePieceInfo = {
  piece: Piece,
  element: HTMLElement,
  minXY: XY,
  maxXY: XY,
  initXY: XY,
  elementXY: XY,
  lastHover?: Position,
  lastUndeads?: Position[]
};

export default function Chessboard({ rotated, playMove, board: chessBoard }: Props) {
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

    const elementRect = element.getBoundingClientRect();
    const width = elementRect.width;

    const chessRect = chessboard.getBoundingClientRect();

    const parentRect = element.parentElement!.getBoundingClientRect();
    setActivePieceInfo({
      minXY: {
        x: chessRect.left,
        y: chessRect.top,
      },
      maxXY: {
        x: chessRect.left + chessboard.clientWidth - width,
        y: chessRect.top + chessboard.clientHeight - width
      },
      initXY: {
        x: e.clientX,
        y: e.clientY,
      },
      elementXY: {
        x: elementRect.left,
        y: elementRect.top,
      },
      piece,
      element,
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
      minXY,
      maxXY,
      initXY,
      elementXY,
      lastHover,
      lastUndeads,
    } = activePieceInfo;

    const { clientX: mouseX, clientY: mouseY } = e;

    const diffY = mouseY - initXY.y;
    const diffX = mouseX - initXY.x;

    const eX = elementXY.x + diffX + 5 // Border;
    if (eX < minXY.x || eX > maxXY.x) {
      return;
    }
    const eY = elementXY.y + diffY + 5;
    if (eY < minXY.y || eY > maxXY.y) {
      return
    };

    const x = diffX;
    const y = diffY;
    element.style.position = "absolute";
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;

    console.log("elementXY.y = " + elementXY.y, " diffY = " + diffY, " eY = " + eY, " minXY.y = " + minXY.y, " element.getBoundingClientRect().y = " + element.getBoundingClientRect().y)

    element.classList.add('moving');

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
          undeads = (chessBoard as AtomicBoard).getSurroundingUndeads(point).filter(p => p !== piece).map(p => p._position);
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
    element.classList.remove('moving');

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
  let I0, ISTEP, J0, JSTEP;
  if (rotated) {
    I0 = 7;
    ISTEP = -1;
    J0 = 0;
    JSTEP = 1;
  } else {
    I0 = 0;
    ISTEP = 1;
    J0 = 7;
    JSTEP = -1;
  }
  for (let j = J0; j >= 0 && j <= 7; j += JSTEP) {
    for (let i = I0; i >= 0 && i <= 7; i += ISTEP) {
      const number = j + i + 2;
      const piece = chessBoard.pieceAt(new Position(i, j));
      const currentPiece = activePieceInfo?.piece;
      const highlight = currentPiece?.possibleMoves?.some(p => p.samePosition(new Position(i, j)));
      const image = piece ? piece.image : undefined;

      board.push(<Tile
        sameTeam={currentPiece?.team === piece?.team}
        clicked={!!(currentPiece && currentPiece === piece)}
        hasMoves={!!piece?.possibleMoves?.length}
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
        className={chessBoard.isVariantAtomic ? 'atomic' : ''}
      >
        {board}
      </div>
    </>
  );
}
