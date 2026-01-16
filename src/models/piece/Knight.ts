import { IterStepsConfig } from "../../Types";
import { Piece } from "../Piece";

class Knight extends Piece {
    static iters = 1;
    getIterSteps(): IterStepsConfig {
        return [
            [-2, -1], [-2, 1],
            [-1, -2], [-1, 2],
            [1, -2], [1, 2],
            [2, -1], [2, 1],
        ];
    }
}

export { Knight };
