import { Howl } from "howler";
import { MoveResult, MoveType } from "../../Types";

export const moveSound = new Howl({
    src: ["/sounds/move-self.mp3"],
});
const captureSound = new Howl({
    src: ["/sounds/capture.mp3"],
});
export const checkSound = new Howl({
    src: ["/sounds/move-check.mp3"],
});
const castleSound = new Howl({
    src: ["/sounds/castle.mp3"]
})
export const promoteSound = new Howl({
    src: ["/sounds/promote.mp3"]
});
export const gameStartSound = new Howl({
    src: ["/sounds/game-start.mp3"]
});
export const checkmateSound = new Howl({
    src: ["/sounds/game-end.mp3"]
});

export function playSound(moveResult: MoveResult) {
    const { type: moveType, isCastling, isCheck } = moveResult;
    if (isCheck) {
        checkSound.play();
    } else if (moveType === MoveType.CAPTURED) {
        captureSound.play();
    } else if (isCastling) {
        castleSound.play();
    } else if (moveType === MoveType.MOVED) {
        moveSound.play();
    }
}

