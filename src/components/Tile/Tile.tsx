import { CSSProperties, useEffect, useState } from "react";
import "./Tile.css";

interface Props {
  image?: string;
  number: number;
  highlight: boolean;
  ij: { i: number; j: number; };
  clicked: boolean;
  sameTeam?: boolean;
  onRender: (setter: any) => void;
}

export default function Tile({
  number,
  sameTeam,
  image,
  highlight,
  ij: { i, j },
  clicked,
  onRender,
}: Props) {
  const [highlighter, setHighlighter] = useState('');
  useEffect(() => {
    onRender((newHighlighter: string) => {
      setHighlighter(newHighlighter);
    });
    return () => onRender(null);
  }, []);
  const className: string = ["tile",
    number % 2 === 0 && "black-tile",
    number % 2 !== 0 && "white-tile",
    highlight && "tile-highlight",
    highlighter && `tile-highlight-${highlighter}`,
    (image && !sameTeam) && "chess-piece-tile"].filter(Boolean).join(' ');

  let style: CSSProperties = {};
  if (clicked) {
    style.border = ' solid 5px #b77878';
    style.boxSizing = 'border-box';
  }
  return (
    <div className={className} data-x={i} data-y={j} style={style}>
      <div style={{ position: 'absolute', left: '10%', top: '10%', fontSize: '50%' }}>{String.fromCharCode(i + 97)}{j + 1}</div>
      {
        image
          ? <div style={{ backgroundImage: `url(${image})` }} className="chess-piece" />
          : null
      }
    </div>
  );
}