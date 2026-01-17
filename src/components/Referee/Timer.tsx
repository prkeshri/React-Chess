import { useEffect, useRef, useState } from "react"
import "./Timer.css"
import { TeamType } from "../../Types";
type TimerProps = {
    init: number;
    setter: any;
    rotated: boolean;
    team: TeamType;
}
export const Timer = ({ init, setter, team, rotated }: TimerProps) => {
    const isWhite = team === 'w';
    const placement = ((isWhite && rotated) || (!isWhite && !rotated)) ? 'top' : 'bottom';
    const [v, setV] = useState(init);
    useEffect(() => {
        setV(init);
    }, [init]);
    useEffect(() => {
        setter(setV);
        return () => setter();
    }, []);

    const txt = format(v);
    return <div className={`timer timer-${placement} timer-team-${team}`}>{txt}</div>
}

function format(t: number) {
    const minutes = Math.floor(t / 60);
    const seconds = t % 60;
    const txt = [minutes, seconds].map(j => j.toString().padStart(2, "0")).join(':');
    return txt;
}