import { Piece } from "../Piece";

class Knight extends Piece {
    static iters = 1;
    getIterSteps() {
        return [
            [-2, -1], [-2, 1],
            [-1, -2], [-1, 2],
            [1, -2], [1, 2],
            [2, -1], [2, 1],
        ];
    }
}

export { Knight };
