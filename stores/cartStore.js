import { create } from "zustand";

const cartRequest = async (body) => {
    const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Cart request failed");
    }
    return res.json();
};

export const useCartStore = create((set, get) => ({
    cart: [],

    fetchCart: async () => {
        try {
            const res = await fetch("/api/cart");
            if (!res.ok) throw new Error("Failed to fetch cart");
            const data = await res.json();
            set({ cart: data });
        } catch (error) {
            console.error("Error fetching cart:", error);
        }
    },

    addToCart: async (item) => {
        const prevCart = get().cart;
        const existingItem = prevCart.find(
            (cartItem) => cartItem.product._id === item.product._id
        );

        // Check stock availability
        if (existingItem && existingItem.quantity >= item.product.stock) {
            throw new Error(
                `Cannot add more ${item.product.productName}. Only ${item.product.stock} ${item.product.unit} available.`
            );
        }

        // Farmer restriction check
        if (prevCart.length > 0) {
            const firstFarmerId = prevCart[0]?.product?.farmer?._id || prevCart[0]?.product?.farmer;
            const newFarmerId = item.product?.farmer?._id || item.product?.farmer;

            if (String(firstFarmerId) !== String(newFarmerId)) {
                throw new Error("You can only add products from the same farmer to your cart.");
            }
        }

        try {
            const result = await cartRequest({
                action: "add",
                productId: item.product._id,
                quantity: item.quantity || 1
            });

            // Update state with server response
            set({ cart: result });
        } catch (error) {
            console.error("Error adding to cart:", error);
            throw error;
        }
    },

    removeFromCart: async (productId) => {
        const prevCart = get().cart;

        try {
            const result = await cartRequest({ action: "remove", productId });
            set({ cart: result });
        } catch (error) {
            console.error("Error removing from cart:", error);
            set({ cart: prevCart });
            throw error;
        }
    },

    updateQuantity: async (productId, quantity) => {
        const prevCart = get().cart;

        try {
            const result = await cartRequest({ action: "update", productId, quantity });
            set({ cart: result });
        } catch (error) {
            console.error("Error updating quantity:", error);
            set({ cart: prevCart });
            throw error;
        }
    },

    clearCart: async () => {
        const prevCart = get().cart;

        try {
            await cartRequest({ action: "clear" });
            set({ cart: [] });
        } catch (error) {
            console.error("Error clearing cart:", error);
            set({ cart: prevCart });
            throw error;
        }
    },
}));