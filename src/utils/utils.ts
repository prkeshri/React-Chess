import { useRef, useState } from "react";
import { Position } from "../models";

function isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
}

export function useRenderer() {
    const [, x] = useState(false);
    return () => x(x => !x);
}

export function useRefX<T>(init: () => T): React.MutableRefObject<NonNullable<T>> {
    const ref = useRef<T>();
    if (!ref.current) {
        ref.current = init() as any;
    }
    return ref as any;
}

export const iter = (init: () => any, truth: () => Boolean, inc: () => any) => {
    const setup = { init, truth, inc };
    let result: any;
    result = init();

    let toPause = false;
    let paused = false;
    let ended = false;
    let firstTime = true;
    function hasNext() {
        return !ended || !paused || !truth();
    }
    function next() {
        const { truth, inc } = setup;
        try {
            if (ended) {
                return false;
            }
            paused = toPause;
            if (paused) {
                return false;
            }
            if (!truth()) {
                ended = true;
                return false;
            }
            if (!firstTime) {
                result = inc();
            }
            firstTime = false;
            return true;
        } finally {
            toPause = false;
        }
    }

    function pause() {
        toPause = true;
    }
    return ({
        next,
        pause,
        get paused() {
            return paused;
        },
        get ended() {
            return ended;
        },
        get hasNext() {
            return hasNext;
        },
        end() {
            ended = true;
        },
        ressurect() {
            ended = false;
        },
        get result() {
            return result;
        },
        setup,
    })
}

export { isInRange };