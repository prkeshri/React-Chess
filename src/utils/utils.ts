import { useRef, useState } from "react";
import { Variant } from "../Types";

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

export function getQueryPrefs() {
    const queryString = window.location.search;
    const params = new URLSearchParams(queryString);
    let v = params.get("v") ?? "";
    if (Array.isArray(v)) v = v[0];
    const variant: Variant = v as Variant;
    return { variant };
}

export function FactoryMap<S extends string, T>() {
    const map: Record<S, T> = {} as any;
    function register(type: S, clazz: any) {
        map[type] = clazz;
    }
    return { register, get(type: S) { return map[type] } };
}