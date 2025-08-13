import { create } from "zustand";

export const useFavoriteStore = create((set) => ({
    favorites: [],
    setFavorites: (data) => set({ favorites: data }),
    toggleFavorite: async (productId) => {
        set((state) => {
            const isFavorited = state.favorites.includes(productId);
            const updated = isFavorited
                ? state.favorites.filter((id) => id !== productId)
                : [...state.favorites, productId];

            fetch("/api/favorites", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId,
                    action: isFavorited ? "remove" : "add",
                }),
            }).catch((err) => {
                console.error("Failed to update favorite:", err);
                set({ favorites: state.favorites });
            });

            return { favorites: updated };
        });
    },
}));
