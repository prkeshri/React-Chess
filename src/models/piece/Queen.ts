import { Piece } from "../Piece";
import { Position } from "../Position";

class Queen extends Piece {
    getIterSteps() {
        return [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
    }
}

export { Queen };
