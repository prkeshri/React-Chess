import { IterStepsConfig } from "../../Types";
import { Piece } from "../Piece";

class Queen extends Piece {
    getIterSteps(): IterStepsConfig {
        return [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
    }
}

export { Queen };
