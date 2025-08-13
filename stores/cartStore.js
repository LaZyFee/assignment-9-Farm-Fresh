import { create } from "zustand";

export const useCartStore = create((set, get) => ({
    cart: [],
    setCart: (cartData) => set({ cart: cartData }),
    addToCart: async (item) => {
        const state = get();
        // Local optimistic update
        let updatedCart;
        set((state) => {
            // Check farmer constraint
            if (state.cart.length > 0 && state.cart[0].product.farmer?._id !== item.product.farmer?._id) {
                alert("You can only add products from the same farmer to the cart.");
                return state;
            }
            const existing = state.cart.find(c => c.product._id === item.product._id);
            updatedCart = existing
                ? state.cart.map(c =>
                    c.product._id === item.product._id
                        ? { ...c, quantity: c.quantity + item.quantity }
                        : c
                )
                : [...state.cart, item];
            return { cart: updatedCart };
        });

        try {
            const res = await fetch("/api/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId: item.product._id,
                    quantity: item.quantity,
                    action: "add",
                }),
            });
            if (res.ok) {
                const updated = await res.json();
                set({ cart: updated });
            } else {

                set({ cart: state.cart });
                alert("Failed to add to cart. Please try again.");
            }
        } catch (err) {
            console.error("Error adding to cart:", err);
            set({ cart: state.cart });
            alert("An error occurred. Please try again.");
        }
    },
    removeFromCart: async (id) => {
        const state = get();
        // Local optimistic update
        set((state) => ({
            cart: state.cart.filter(item => item.product._id !== id),
        }));

        try {
            const res = await fetch("/api/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId: id,
                    action: "remove",
                }),
            });
            if (res.ok) {
                const updated = await res.json();
                set({ cart: updated });
            } else {
                set({ cart: state.cart });
                alert("Failed to remove from cart. Please try again.");
            }
        } catch (err) {
            console.error("Error removing from cart:", err);
            set({ cart: state.cart });
            alert("An error occurred. Please try again.");
        }
    },
    updateQuantity: async (id, quantity) => {
        const state = get();
        let updatedCart;
        set((state) => {
            updatedCart = state.cart
                .map(item =>
                    item.product._id === id ? { ...item, quantity } : item
                )
                .filter(item => item.quantity > 0);
            return { cart: updatedCart };
        });

        try {
            const res = await fetch("/api/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId: id,
                    quantity: quantity - (state.cart.find(item => item.product._id === id)?.quantity || 0),
                    action: "update",
                }),
            });
            if (res.ok) {
                const updated = await res.json();
                set({ cart: updated });
            } else {
                set({ cart: state.cart });
                alert("Failed to update quantity. Please try again.");
            }
        } catch (err) {
            console.error("Error updating quantity:", err);
            set({ cart: state.cart });
            alert("An error occurred. Please try again.");
        }
    },
    clearCart: async () => {
        const state = get();
        set({ cart: [] });

        try {
            for (const item of state.cart) {
                await fetch("/api/cart", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        productId: item.product._id,
                        action: "remove",
                    }),
                });
            }
        } catch (err) {
            console.error("Error clearing cart:", err);
            set({ cart: state.cart });
            alert("Failed to clear cart. Please try again.");
        }
    },
}));