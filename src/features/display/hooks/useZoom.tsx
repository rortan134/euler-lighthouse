import { RefObject, useState, useCallback, TouchEvent as SyntheticTouchEvent } from "react";

import { MIN_ZOOM_SCALE, MAX_ZOOM_SCALE } from "../../../config";
import useEventListener from "../../../hooks/useEventListener";
import { between } from "../../../utils/math";
import { isTouchEvent, getPointFromTouch, getDistanceBetweenPoints } from "../../../utils/tracking";

type ScaleOpts = {
    direction: "up" | "down";
    interval: number;
};

/**
 * scroll & touch zoom.
 */
export default function useZoom(ref: RefObject<HTMLElement | null>) {
    const [scale, setScale] = useState(1);
    const [lastDistance, setLastDistance] = useState(0);

    const updateScale = useCallback(({ direction, interval }: ScaleOpts) => {
        setScale((currentScale) => {
            let scale: number;

            // Adjust up to or down to the maximum or minimum scale levels by `interval`.
            if (direction === "up" && currentScale + interval < MAX_ZOOM_SCALE) {
                scale = currentScale + interval;
            } else if (direction === "up") {
                scale = MAX_ZOOM_SCALE;
            } else if (direction === "down" && currentScale - interval > MIN_ZOOM_SCALE) {
                scale = currentScale - interval;
            } else if (direction === "down") {
                scale = MIN_ZOOM_SCALE;
            } else {
                scale = currentScale;
            }

            return scale;
        });
    }, []);

    const handlePinchStart = useCallback(
        (e: SyntheticTouchEvent) => {
            const pointA = getPointFromTouch(e.touches[0], ref);
            const pointB = getPointFromTouch(e.touches[1], ref);

            if (pointA && pointB) {
                setLastDistance(getDistanceBetweenPoints(pointA, pointB));
            }
        },
        [ref]
    );

    const handlePinchMove = useCallback(
        (e: SyntheticTouchEvent) => {
            if (isTouchEvent(e) && e.touches.length == 2) {
                const pointA = getPointFromTouch(e.touches[0], ref);
                const pointB = getPointFromTouch(e.touches[1], ref);

                if (pointA && pointB) {
                    const distance = getDistanceBetweenPoints(pointA, pointB);

                    setScale((currentScale) => between(MIN_ZOOM_SCALE, MAX_ZOOM_SCALE, currentScale * (distance / lastDistance)));
                    setLastDistance(distance);
                }
            }
        },
        [lastDistance, ref]
    );

    useEventListener(
        ref,
        "wheel",
        (e) => {
            if (e.ctrlKey || e.metaKey) {
                // prevent browser zoom w scroll
                e.preventDefault();
            }

            updateScale({
                direction: between(-1, 1, e.deltaY) > 0 ? "down" : "up",
                interval: 0.1,
            });
        },
        { passive: false }
    );

    useEventListener(ref, "keydown", (e: KeyboardEvent) => {
        if (e.ctrlKey == true && (e.which == 107 || e.which == 173 || e.which == 187 || e.which == 189)) {
            // prevent browzer zoom w +/- keys
            e.preventDefault();
        }
        // 107 Num Key  +
        // 109 Num Key  -
        // 173 Min Key  hyphen/underscore key
        // 61 Plus key  +/= key

        updateScale({
            direction: e.which === 107 || e.which === 61 ? "up" : "down",
            interval: 0.1,
        });
    });

    useEventListener(ref, "touchstart", handlePinchStart as any, { passive: true });
    useEventListener(ref, "touchmove", handlePinchMove as any, { passive: true });

    return scale;
}
