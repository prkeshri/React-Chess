import { CSSProperties } from "react";
import "./Tile.css";

interface Props {
  image?: string;
  number: number;
  highlight: boolean;
  ij: { i: number; j: number; };
  onClick: any;
  onContextmenu: any;
  clicked: boolean;
  sameTeam?: boolean;
}

export default function Tile({
  number,
  sameTeam,
  image,
  highlight,
  ij: { i, j },
  onClick,
  clicked,
  onContextmenu
}: Props) {
  const className: string = ["tile",
    number % 2 === 0 && "black-tile",
    number % 2 !== 0 && "white-tile",
    highlight && "tile-highlight",
    (image && !sameTeam) && "chess-piece-tile"].filter(Boolean).join(' ');


  let style: CSSProperties = {};
  if (clicked) {
    style.border = ' solid 5px #b77878';
    style.boxSizing = 'border-box';
  }
  return (
    <div className={className} onClick={onClick} onContextMenu={(e) => { onContextmenu(); e.preventDefault(); }} style={style}>
      <div style={{ position: 'absolute', left: '10%', top: '10%' }}>{i},{j}</div>
      {image && <div style={{ backgroundImage: `url(${image})` }} className="chess-piece"></div>}
    </div>
  );
}