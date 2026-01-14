import { Piece } from "../Piece";

class Bishop extends Piece {
    getIterSteps() {
        return [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    }
}

export { Bishop };
