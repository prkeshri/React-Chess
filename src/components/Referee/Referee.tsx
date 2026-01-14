import { useEffect, useRef, useState } from "react";
import { initialBoard } from "../../Constants";
import { Piece, Position } from "../../models";
import { Board } from "../../models/Board";
import { Pawn } from "../../models/piece/Pawn";
import { BoardHistory, MoveType, PieceType, TeamType } from "../../Types";
import Chessboard from "../Chessboard/Chessboard";
import { createHistory } from "../../utils/history";
import { useRefX, useRenderer } from "../../utils/utils";
import { checkmateSound, playSound, moveSound, gameStartSound, checkSound, promoteSound } from "./sounds";

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
  useEffect(() => {
    gameStartSound.play();
  }, []);
  const [promotionPawn, setPromotionPawn] = useState<Piece>();
  useEffect(() => {
    function keyPressHandler(e: KeyboardEvent) {
      if (e.ctrlKey) {
        if (e.code === 'KeyZ') {
          doUndoRedo(true);
        } else if (e.code === 'KeyY') {
          doUndoRedo(false);
        }
      }
    }

    window.addEventListener('keydown', keyPressHandler);

    return () => window.removeEventListener('keydown', keyPressHandler);
  }, []);

  function checkWin(refBoard: Board) {
    if (refBoard.winningTeam !== undefined) {
      checkmateSound.play();
      return true;
    }
    return false;
  }

  function playMove(playedPiece: Piece, destination: Position) {
    // MUST give a valid move
    board.totalTurns += 1;
    const moveResult = board.playMove(playedPiece, destination);
    if (playedPiece.isPawn && destination.isVerticalEdge) {
      setPromotionPawn(playedPiece);
    } else {
      playSound(moveResult);
    }
    rerender();

    history.pushState({
      state: board,
      moveResult,
    });

    checkWin(board);
  }

  function doUndoRedo(undo: boolean) {
    const historyState = history[undo ? 'undo' : 'redo']();
    if (!historyState)
      return;
    const boardRef = historyState.state;
    rerender();
    if (!checkWin(boardRef)) {
      if (undo) {
        moveSound.play();
      } else {
        playSound(historyState.moveResult);
      }
    }
  }

  function promotePawn(pieceType: PieceType) {
    if (promotionPawn === undefined) {
      return;
    }
    const isCheck = board.promote(promotionPawn, pieceType);
    if (isCheck) {
      checkSound.play();
    } else {
      promoteSound.play();
    }
    setPromotionPawn(undefined);
  }

  function restartGame() {
    //@ts-ignore
    boardRef.current = null;
    rerender();
  }

  return (
    <>
      <div className="relative"><div style={{ position: 'absolute' }}>
        <button onClick={() => { board.calculateAllMoves(); rerender(); }}>Re
        </button>
        <button onClick={() => doUndoRedo(true)} disabled={!history.canUndo()}>Undo</button> |
        <button onClick={() => doUndoRedo(false)} disabled={!history.canRedo()}>Redo</button> |
        <button onClick={() => { }}>Clone Board</button>
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
      {board.winningTeam ?
        <div className='modal'>
          <div className="modal-body">
            <div className="checkmate-body">
              <span>
                The winning team is{" "}
                {board.winningTeam === TeamType.OUR ? "white" : "black"}!
              </span>
              <button onClick={restartGame}>Play again</button>
            </div>
          </div>
        </div> : null}
      <Chessboard playMove={playMove} board={board} />
    </>
  );
}
