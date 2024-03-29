import { forwardRef } from "react";

export function forwardRefWithAs<T extends { name: string; displayName?: string }>(component: T): T & { displayName: string } {
    return Object.assign(forwardRef(component as unknown as any) as any, {
        displayName: component.displayName ?? component.name,
    });
}

export function isMobile(): boolean {
    return /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(navigator.userAgent);
}

export function isNull(obj: Record<string, unknown>): boolean {
    return Object.values(obj).some((value) => {
        if (value === null) {
            return true;
        }

        return false;
    });
}

export const isObject = (object: any): boolean => {
    return object != null && typeof object === "object";
};
