import { MouseEvent as SyntheticMouseEvent, TouchEvent as SyntheticTouchEvent, RefObject, useCallback, useRef, useState } from "react";

import { ORIGIN } from "../../../config";
import { Point } from "../../../types";
import { sum } from "../../../utils/math";
import { isMobile } from "../../../utils/misc";
import { isTouchEvent, getDelta } from "../../../utils/tracking";

type eventP = (e: MouseEvent | TouchEvent) => void;

/**
 * Track the user's intended panning offset by listening to `mousemove` events
 * once the user has started panning.
 */
export default function usePan(ref: RefObject<HTMLElement | null>): [Point, (e: SyntheticMouseEvent | SyntheticTouchEvent) => void] {
    const [panState, setPanState] = useState<Point>(ORIGIN);

    const lastPointRef = useRef(ORIGIN); // last observed mouse position on pan.

    const pan = useCallback((e: SyntheticMouseEvent | SyntheticTouchEvent) => {
        if (e.cancelable) e.preventDefault();

        if (isTouchEvent(e) && e.touches.length > 1) return; // apply zoom instead

        const lastPoint = lastPointRef.current;
        const point = isTouchEvent(e) ? { x: e.touches[0].pageX, y: e.touches[0].pageY } : { x: e.pageX, y: e.pageY };

        lastPointRef.current = point;

        setPanState((panState) => {
            const delta = getDelta(lastPoint, point); // delta between the last mouse position
            const offset = sum(panState, delta); // apply that delta to the current pan offset

            return offset;
        });
    }, []);

    const handleKeys = useCallback((e: KeyboardEvent) => {
        switch (e.key) {
            case "ArrowRight":
                setPanState((panState) => ({ ...panState, x: panState.x - 10 }));
                break;
            case "ArrowLeft":
                setPanState((panState) => ({ ...panState, x: panState.x + 10 }));
                break;
            case "ArrowUp":
                setPanState((panState) => ({ ...panState, y: panState.y + 10 }));
                break;
            case "ArrowDown":
                setPanState((panState) => ({ ...panState, y: panState.y - 10 }));
                break;
            default:
                return;
        }
    }, []);

    // event listeners
    // todo: more readability
    const endPan = useCallback(() => {
        document.removeEventListener("mousemove", pan as unknown as eventP);
        document.removeEventListener("mouseup", endPan);
        document.removeEventListener("keydown", handleKeys);
    }, [pan, handleKeys]);

    const startSwipe = useCallback(
        (e: TouchEvent) => {
            if (!ref.current) return;
            ref.current.addEventListener("touchmove", pan as unknown as eventP);
            ref.current.addEventListener("touchend", endPan);
            ref.current.addEventListener("touchcancel", endPan);

            lastPointRef.current = { x: e.changedTouches[0].pageX, y: e.changedTouches[0].pageY };
        },
        [endPan, pan, ref]
    );

    const endSwipe = useCallback(() => {
        if (!ref.current) return;
        ref.current.removeEventListener("touchmove", pan as unknown as eventP);
        ref.current.removeEventListener("touchend", endSwipe);
        ref.current.removeEventListener("touchstart", startSwipe);
    }, [pan, ref, startSwipe]);

    const startPan = useCallback(
        (e: SyntheticMouseEvent | SyntheticTouchEvent) => {
            if (!ref.current) return;

            // desktop
            document.addEventListener("mousemove", pan as unknown as eventP);
            document.addEventListener("mouseup", endPan);
            document.addEventListener("keydown", handleKeys);

            // mobile
            ref.current.addEventListener("touchstart", startSwipe, { passive: true });
            ref.current.addEventListener("touchend", endSwipe);

            if (isTouchEvent(e)) {
                lastPointRef.current = { x: e.touches[0].pageX, y: e.touches[0].pageY };
            } else {
                lastPointRef.current = { x: e.pageX, y: e.pageY };
            }
        },
        [endPan, endSwipe, handleKeys, pan, ref, startSwipe]
    );

    return [panState, startPan];
}
