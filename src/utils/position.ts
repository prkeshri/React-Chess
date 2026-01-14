import { Position } from "../models";
export class Positions {
    static map(pos: Position[]) {
        const map: Record<string, Position> = {};
        pos.forEach(p => map[p.xy] = p);
        return map;
    }
    static commons(poss0: Position[], poss1: Position[]) {
        const cmap0 = this.map(poss0);
        return poss1.filter(p => cmap0[p.xy]);
    }
    static diff(poss0: Position[], poss1: Position[]) {
        const cmap1 = this.map(poss1);
        return poss0.filter(p => !cmap1[p.xy]);
    }
}