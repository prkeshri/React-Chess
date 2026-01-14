/**
 * A generic Undo/Redo manager for state of type T
 */
export function createHistory<T>(initialState: T) {
    let current: T = initialState;
    let undoStack: T[] = [];
    let redoStack: T[] = [];

    return {
        /**
         * Get the current state
         */
        getState: (): T => current,

        /**
         * Update the state and clear the redo history
         */
        pushState: (newState: T): void => {
            undoStack.push(current);
            current = newState;
            // When a new action is taken, the "future" is invalidated
            redoStack = [];
        },

        /**
         * Move back to the previous state
         */
        undo: (): T | null => {
            if (undoStack.length === 0) return null;

            const previous = undoStack.pop()!;
            redoStack.push(current);
            current = previous;

            return current;
        },

        /**
         * Move forward to the next state
         */
        redo: (): T | null => {
            if (redoStack.length === 0) return null;

            const next = redoStack.pop()!;
            undoStack.push(current);
            current = next;

            return current;
        },

        /**
         * Utility to check if actions are possible
         */
        canUndo: () => undoStack.length > 0,
        canRedo: () => redoStack.length > 0,
    };
}