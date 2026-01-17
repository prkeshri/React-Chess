import { Children, useEffect, useRef, useState } from "react";
import { initialBoard } from "../../Constants";
import { Piece, Position } from "../../models";
import { Board } from "../../models/Board";
import { BoardHistory, MoveType, PieceType, TeamType, Variant } from "../../Types";
import Chessboard from "../Chessboard/Chessboard";
import { createHistory } from "../../utils/history";
import { useRefX, useRenderer } from "../../utils/utils";
import { playSound, gameStartSound } from "./sounds";
import "./Referee.css";
import { Timer } from "./Timer";
import { useStartTimer } from "../../utils/timer";

export default function Referee() {
  const rerender = useRenderer();

  const boardRef = useRefX<Board>(initialBoard);
  const { current: board } = boardRef;

  const fenNotation = useRef("");
  function calculateHash() {
    window.location.hash = fenNotation.current = board.serialize();
  }
  const { addRef, clearTimer } = useStartTimer(board, rerender, calculateHash);

  const [myTeam, setMyTeam] = useState("w");
  const [history] = useState(() => createHistory<BoardHistory>({
    state: board,
    moveResult: {
      type: MoveType.MOVED,
    },
  }));

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
  const [rotated, setRotated] = useState(false);

  const finalRotated = myTeam === TeamType.WHITE ? rotated : !rotated;
  function playMove(playedPiece: Piece, destination: Position) {
    // MUST give a valid move
    const moveResult = board.playMove(playedPiece, destination);
    if (moveResult.winner && board.timedGame) {
      clearTimer();
    }
    if (moveResult.shouldPromote) {
      setPromotionPawn(playedPiece);
    } else {
      playSound(moveResult);
      calculateHash();
    }
    rerender();

    history.pushState({
      state: board,
      moveResult,
    });
  }

  function doClone() {
    const hash = window.location.hash.substring(1);
    window.open(window.location.href.split('#')[0] + '#' + hash, "_blank");
  }
  function newGame(v: Variant) {
    window.open(window.location.href.split(/\#|\?/)[0] + (v ? '?v=' + v : ''));
  }

  function promotePawn(pieceType: PieceType) {
    if (promotionPawn === undefined) {
      return;
    }
    const result = board.promote(promotionPawn, pieceType);
    playSound(result);
    setPromotionPawn(undefined);
    calculateHash();
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

  function configTiming() {
    const t = prompt("Enter time in total,plus ( Will reset for all players ):");
    if (!t?.length) {
      return;
    }
    const [total, plus] = t.split(',').map(t => parseInt(t)).map(i => isNaN(i) ? 0 : i);
    if (!total) {
      alert("Invalid!");
      return;
    }
    board.timedGame = {
      total,
      plus
    };

    board.teams.w.remaining = board.teams.b.remaining = total;
    rerender();
  }

  return (
    <>
      <div className="controls">
        <LeftPanel values={{ myTeam, rotated }} handlers={{ configTiming, setMyTeam, setRotated, doClone, board, load, restartGame, newGame }}>

          <h3 className={`header ${board.variant}`}>
            {board.variant ? <div>{board.variant.toUpperCase()}</div> : ""}Total turns: {board.totalTurns}
          </h3>
        </LeftPanel>
      </div>
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
                    <span style={{ color: board.winningTeam === TeamType.WHITE ? "white" : "black" }}>
                      <b>{board.winningTeam === TeamType.WHITE ? "white" : "black"}!</b>
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
      <div className="board-container">
        {board.timedGame ?
          Object.entries(board.teams).map(([t, teamRef]) => {
            return (
              <Timer team={t as TeamType} rotated={finalRotated} key={`timer-${t}`} init={teamRef.remaining} setter={(s: any) => addRef(t as TeamType, s)} />
            )
          })

          : null}

        <Chessboard playMove={playMove} board={board} rotated={finalRotated} />
      </div>
    </>
  );
}

function LeftPanel(props: { handlers: any; values: any; children: any; }) {
  const {
    handlers: {
      doClone,
      board,
      load,
      restartGame,
      newGame,
      setRotated,
      configTiming,
      setMyTeam,
    }, values: {
      myTeam,
      rotated,
    },
    children
  } = props;

  const [expanded, setExpanded] = useState(false);
  return <div className="controls-out">
    {children}
    <div className="main">
      <button className="square" onClick={() => setExpanded(e => !e)}>☰</button>
      <button className="square" style={{ backgroundColor: rotated ? "#9b9595" : "" }} onClick={() => setRotated((e: boolean) => !e)}>↺</button>
    </div>
    {expanded
      ? <div className="expanded">
        <button onClick={() => doClone()}>Clone Board</button>
        <button onClick={() => { console.log(board.serialize()); }}>Log</button>
        <button onClick={() => load()}>Load</button>
        <button onClick={restartGame}>Reset</button>
        <Title>New</Title>
        <button onClick={() => newGame(Variant.REGULAR)}>Regular</button>
        <button onClick={() => newGame(Variant.ATOMIC)}>Atomic</button>
        <Title>Team</Title>
        <select name="teamSel" value={myTeam} onChange={(e) => setMyTeam(e.target.value)}>
          <option value="b">Black</option>
          <option value="w">White</option>
        </select>
        <Title>Timing</Title>
        <button onClick={() => configTiming()}>Timed</button>
      </div> : null}
  </div>;
}

const Title = ({ children }: any) => {
  return (
    <div className="centered-text-container">
      <span className="centered-text">{children}</span>
    </div>
  );
}