import { useRef, useState } from "react";

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
