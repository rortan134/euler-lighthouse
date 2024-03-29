import create from "zustand";
import { persist } from "zustand/middleware";

interface ISettingsState {
    shouldDrawGrid: boolean;
    setDrawGrid: (newState: boolean) => void;
    darkMode: boolean;
    toggleDarkMode: () => void;
}

export const useStore = create(
    persist<ISettingsState>(
        (set, get) => ({
            shouldDrawGrid: true,
            setDrawGrid: (newState: boolean) => {
                set({ shouldDrawGrid: newState });
            },
            darkMode: localStorage.theme === "dark",
            toggleDarkMode: () => {
                set((state) => ({ darkMode: !state.darkMode }));

                const darkModeActive = get().darkMode;

                if (darkModeActive) {
                    document.documentElement.classList.add("dark");
                    localStorage.theme = "dark";
                } else {
                    document.documentElement.classList.remove("dark");
                    localStorage.theme = "light";
                }
            },
        }),
        {
            name: "settings",
        }
    )
);
