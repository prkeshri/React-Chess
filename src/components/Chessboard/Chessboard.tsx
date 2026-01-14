import { useRef, useState } from "react";
import "./Chessboard.css";
import Tile from "../Tile/Tile";
import {
  VERTICAL_AXIS,
  HORIZONTAL_AXIS,
  GRID_SIZE,
} from "../../Constants";
import { Piece, Position } from "../../models";
import { Board } from "../../models/Board";

interface Props {
  playMove: (piece: Piece, position: Position) => void;
  board: Board;
}

export default function Chessboard({ playMove, board: chessBoard }: Props) {
  const { pieces, currentTeam } = chessBoard;
  const [activePiece, setActivePiece] = useState<HTMLElement | null>(null);
  const [grabPosition, setGrabPosition] = useState<Position>(new Position(-1, -1));
  const chessboardRef = useRef<HTMLDivElement>(null);

  function grabPiece(e: React.MouseEvent) {
    const element = e.target as HTMLElement;
    const chessboard = chessboardRef.current;
    if (element.classList.contains("chess-piece") && chessboard) {
      const grabX = Math.floor((e.clientX - chessboard.offsetLeft) / GRID_SIZE);
      const grabY = Math.abs(
        Math.ceil((e.clientY - chessboard.offsetTop - 800) / GRID_SIZE)
      );
      setGrabPosition(new Position(grabX, grabY));

      const x = e.clientX - GRID_SIZE / 2;
      const y = e.clientY - GRID_SIZE / 2;
      element.style.position = "absolute";
      element.style.left = `${x}px`;
      element.style.top = `${y}px`;

      setActivePiece(element);
    }
  }

  function movePiece(e: React.MouseEvent) {
    const chessboard = chessboardRef.current;
    if (activePiece && chessboard) {
      const minX = chessboard.offsetLeft - 25;
      const minY = chessboard.offsetTop - 25;
      const maxX = chessboard.offsetLeft + chessboard.clientWidth - 75;
      const maxY = chessboard.offsetTop + chessboard.clientHeight - 75;
      const x = e.clientX - 50;
      const y = e.clientY - 50;
      activePiece.style.position = "absolute";

      //If x is smaller than minimum amount
      if (x < minX) {
        activePiece.style.left = `${minX}px`;
      }
      //If x is bigger than maximum amount
      else if (x > maxX) {
        activePiece.style.left = `${maxX}px`;
      }
      //If x is in the constraints
      else {
        activePiece.style.left = `${x}px`;
      }

      //If y is smaller than minimum amount
      if (y < minY) {
        activePiece.style.top = `${minY}px`;
      }
      //If y is bigger than maximum amount
      else if (y > maxY) {
        activePiece.style.top = `${maxY}px`;
      }
      //If y is in the constraints
      else {
        activePiece.style.top = `${y}px`;
      }
    }
  }

  function dropPiece(e: React.MouseEvent) {
    const chessboard = chessboardRef.current;
    if (activePiece && chessboard) {
      const x = Math.floor((e.clientX - chessboard.offsetLeft) / GRID_SIZE);
      const y = Math.abs(
        Math.ceil((e.clientY - chessboard.offsetTop - 800) / GRID_SIZE)
      );

      const currentPiece = pieces.find((p) =>
        p.samePosition(grabPosition)
      );

      if (currentPiece) {
        playMove(currentPiece.clone(), new Position(x, y));

        //RESETS THE PIECE POSITION
        activePiece.style.position = "relative";
        activePiece.style.removeProperty("top");
        activePiece.style.removeProperty("left");
      }
      setActivePiece(null);
    }
  }

  const [clicked, setClicked] = useState<Piece>();
  function handleClick(i: number, j: number, piece?: Piece) {
    const p = new Position(i, j);
    if (clicked) {
      if (clicked === piece) {
        return setClicked(undefined);
      }
      if (clicked.possibleMoves?.find(m => m.samePosition(p))) {
        setClicked(undefined);
        playMove(clicked, new Position(i, j));
        return;
      }
    }
    if (!piece) {
      return setClicked(undefined);
    }
    if (!piece.possibleMoves?.length) {
      return setClicked(undefined);
    }

    return setClicked(piece);


  }
  let board = [];

  for (let j = VERTICAL_AXIS.length - 1; j >= 0; j--) {
    for (let i = 0; i < HORIZONTAL_AXIS.length; i++) {
      const number = j + i + 2;
      const piece = pieces.find((p) =>
        p.samePosition(new Position(i, j))
      );

      const currentPiece = clicked ?? (activePiece != null ? pieces.find(p => p.samePosition(grabPosition)) : undefined);
      const highlight = currentPiece?.possibleMoves ?
        currentPiece.possibleMoves.some(p => p.samePosition(new Position(i, j))) : false;
      const image = piece ? piece.image : undefined;

      board.push(<Tile sameTeam={currentPiece?.team === piece?.team} clicked={!!(clicked && clicked === piece)} key={`${j},${i}`} ij={{ i, j }} image={image} number={number} highlight={highlight}
        onClick={() => handleClick(i, j, piece)} />);
    }
  }

  return (
    <>
      <div
        xonMouseMove={(e) => movePiece(e)}
        xonMouseDown={(e) => grabPiece(e)}
        xonMouseUp={(e) => dropPiece(e)}
        id="chessboard"
        ref={chessboardRef}
      >
        {board}
      </div>
    </>
  );
}
