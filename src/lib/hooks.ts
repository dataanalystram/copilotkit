"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook for persisting state to localStorage.
 * Falls back to initial value on first load or parse errors.
 * Syncs across tabs via the `storage` event.
 */
export function usePersistedState<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [state, setState] = useState<T>(() => {
        if (typeof window === "undefined") return initialValue;
        try {
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : initialValue;
        } catch {
            return initialValue;
        }
    });

    // Persist to localStorage whenever state changes
    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(state));
        } catch (err) {
            console.warn(`Failed to persist state for key "${key}":`, err);
        }
    }, [key, state]);

    // Sync across tabs
    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key === key && e.newValue) {
                try {
                    setState(JSON.parse(e.newValue));
                } catch {
                    // ignore parse errors from other tabs
                }
            }
        };
        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, [key]);

    return [state, setState];
}

/**
 * Custom hook for computing pipeline analytics from deals array.
 * Deduplicates computation shared between PipelineBoard and PipelineSummary.
 */
export function usePipelineAnalytics(deals: { value: number; stage: string }[]) {
    return {
        totalValue: deals.reduce((sum, d) => sum + d.value, 0),
        activeDeals: deals.filter(
            (d) => d.stage !== "closed_won" && d.stage !== "closed_lost"
        ),
        wonDeals: deals.filter((d) => d.stage === "closed_won"),
        lostDeals: deals.filter((d) => d.stage === "closed_lost"),
        get wonValue() {
            return this.wonDeals.reduce((sum, d) => sum + d.value, 0);
        },
        get activeValue() {
            return this.activeDeals.reduce((sum, d) => sum + d.value, 0);
        },
        get winRate() {
            const closed = this.wonDeals.length + this.lostDeals.length;
            return closed > 0 ? Math.round((this.wonDeals.length / closed) * 100) : 0;
        },
    };
}
