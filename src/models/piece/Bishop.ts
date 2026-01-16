import { IterStepsConfig } from "../../Types";
import { Piece } from "../Piece";

class Bishop extends Piece {
    getIterSteps(): IterStepsConfig {
        return [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    }
}

export { Bishop };
