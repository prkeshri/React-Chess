import { useEffect, useRef } from "react";
import { Board } from "../models/Board";
import { invertTeam } from "./typeUtils";
import { TeamType } from "../Types";

export function useStartTimer(board: Board, rerender: any, calculateHash: any) {
    const { current: labelRefs } = useRef<Record<TeamType, any>>({} as any);
    const I = useRef<any>();
    useEffect(() => {
        if (!board.timedGame) {
            return;
        }
        I.current = setInterval(() => {
            const currentTeam = board.currentTeam;
            const teamRef = board.teams[currentTeam];
            let remaining = teamRef.remaining;
            remaining--;
            teamRef.remaining = remaining;
            labelRefs[currentTeam]?.(remaining);
            calculateHash();
            if (remaining <= 0) {
                board.winningTeam = invertTeam(currentTeam);
                rerender();
                clearTimer();
            }
        }, 1000);
        return () => clearTimer();
    }, [board, board.timedGame]);


    const addRef = (team: TeamType, r: any) => labelRefs[team] = r;
    const clearTimer = () => {
        if (I.current) {
            clearInterval(I.current);
            I.current = undefined;
        }
    }
    return { addRef, clearTimer };
}
