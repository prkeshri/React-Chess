import { useEffect, useRef, useState } from "react";
import { initialBoard } from "../../Constants";
import { Piece, Position } from "../../models";
import { Board } from "../../models/Board";
import { BoardHistory, MoveType, PieceType, TeamType } from "../../Types";
import Chessboard from "../Chessboard/Chessboard";
import { createHistory } from "../../utils/history";
import { useRefX, useRenderer } from "../../utils/utils";
import { playSound, gameStartSound } from "./sounds";
import "./Referee.css";

export default function Referee() {
  const rerender = useRenderer();
  const boardRef = useRefX<Board>(initialBoard);
  const { current: board } = boardRef;
  const [history] = useState(() => createHistory<BoardHistory>({
    state: board,
    moveResult: {
      type: MoveType.MOVED,
    },
  }));

  const fenNotation = useRef("");
  useEffect(() => {
    const hashChangeEvent = () => {
      let hash = decodeURIComponent(window.location.hash ?? '');
      if (hash) {
        hash = hash.substring(1);
        if (hash && fenNotation.current !== hash) {
          const lb = Board.deserialize(hash);
          if (lb) {
            boardRef.current = lb;
          }
          fenNotation.current = hash;
          rerender();
        }
      }
    }
    window.addEventListener("hashchange", hashChangeEvent)

    hashChangeEvent();
    gameStartSound.play();

    return () => window.removeEventListener("hashchange", hashChangeEvent);
  }, []);
  const [promotionPawn, setPromotionPawn] = useState<Piece>();

  function playMove(playedPiece: Piece, destination: Position) {
    // MUST give a valid move
    const moveResult = board.playMove(playedPiece, destination);
    if (moveResult.shouldPromote) {
      setPromotionPawn(playedPiece);
    } else {
      playSound(moveResult);
      window.location.hash = fenNotation.current = board.serialize();
    }
    rerender();

    history.pushState({
      state: board,
      moveResult,
    });
  }

  function doClone() {
    const hash = board.serialize();
    window.open(window.location.href.split('#')[0] + '#' + hash, "_blank");
  }
  function promotePawn(pieceType: PieceType) {
    if (promotionPawn === undefined) {
      return;
    }
    const result = board.promote(promotionPawn, pieceType);
    playSound(result);
    setPromotionPawn(undefined);
    window.location.hash = board.serialize();
  }

  function restartGame() {
    //@ts-ignore
    boardRef.current = null;
    rerender();
  }

  function load() {
    const fen = prompt("Enter FEN");
    if (!fen) {
      return;
    }
    const newBoard = Board.deserialize(fen);
    if (!newBoard) {
      alert("Invalid FEN!");
      return;
    }
    boardRef.current = newBoard;
    rerender();
  }

  return (
    <>
      <div className="controls">
        <div className="controls-out">
          <button onClick={() => doClone()}>Clone Board</button>
          <button onClick={() => { console.log(board.serialize()) }}>PRINT</button>
          <button onClick={() => load()}>LOAD</button>
          <button onClick={restartGame}>RESET</button>
        </div>
      </div>
      <hr />
      <p style={{ color: "white", fontSize: "24px", textAlign: "center" }}>
        Total turns: {board.totalTurns}
      </p>
      {promotionPawn ?
        <div className='modal'>
          <div className="modal-body">
            <img
              onClick={() => promotePawn(PieceType.ROOK)}
              src={`/assets/images/rook_${promotionPawn.team}.png`}
            />
            <img
              onClick={() => promotePawn(PieceType.BISHOP)}
              src={`/assets/images/bishop_${promotionPawn.team}.png`}
            />
            <img
              onClick={() => promotePawn(PieceType.KNIGHT)}
              src={`/assets/images/knight_${promotionPawn.team}.png`}
            />
            <img
              onClick={() => promotePawn(PieceType.QUEEN)}
              src={`/assets/images/queen_${promotionPawn.team}.png`}
            />
          </div>
        </div> : null}
      {(board.winningTeam || board.staleMate) ?
        <div className='modal'>
          <div className="modal-body">
            <div className="checkmate-body" style={{ gap: board.staleMate ? '48px' : "" }}>
              {
                board.staleMate
                  ? <div ><b>Stalemate! Draw</b></div>
                  : <div><div>
                    The winning team is{" "}
                    <span style={{ color: board.winningTeam === TeamType.OUR ? "white" : "black" }}>
                      <b>{board.winningTeam === TeamType.OUR ? "white" : "black"}!</b>
                    </span>
                  </div>
                    <div><img src={`/assets/images/king_${board.winningTeam}.png`} />
                    </div>
                  </div>
              }
              <button onClick={restartGame}>Play again</button>
            </div>
          </div>
        </div> : null}
      <Chessboard playMove={playMove} board={board} />
    </>
  );
}
