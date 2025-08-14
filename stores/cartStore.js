import { create } from "zustand";

const cartRequest = async (body) => {
    const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Cart request failed");
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
        if (existingItem && existingItem.quantity >= item.product.stock) {
            throw new Error(
                `Cannot add more ${item.product.productName}. Only ${item.product.stock} ${item.product.unit} available.`
            );
        }

        // Farmer restriction
        if (prevCart.length) {
            const firstFarmerId = prevCart[0]?.product?.farmer?._id || prevCart[0]?.product?.farmer;
            const newFarmerId = item.product?.farmer?._id || item.product?.farmer;
            if (String(firstFarmerId) !== String(newFarmerId)) {
                alert("You can only add products from the same farmer to the cart.");
                return;
            }
        }

        // Optimistic update
        set({ cart: [...prevCart, item] });

        try {
            await cartRequest({ action: "add", item });
        } catch (error) {
            console.error("Error adding to cart:", error);
            set({ cart: prevCart }); // rollback
        }
    },

    removeFromCart: async (productId) => {
        const prevCart = get().cart;
        set({ cart: prevCart.filter(item => item.product._id !== productId) });

        try {
            await cartRequest({ action: "remove", productId });
        } catch (error) {
            console.error("Error removing from cart:", error);
            set({ cart: prevCart }); // rollback
        }
    },

    updateQuantity: async (productId, quantity) => {
        const prevCart = get().cart;
        set({
            cart: prevCart.map(item =>
                item.product._id === productId ? { ...item, quantity } : item
            ),
        });

        try {
            await cartRequest({ action: "update", productId, quantity });
        } catch (error) {
            console.error("Error updating quantity:", error);
            set({ cart: prevCart }); // rollback
        }
    },

    clearCart: async () => {
        const prevCart = get().cart;
        set({ cart: [] });
        try {
            await cartRequest({ action: "clear" });
        } catch (error) {
            console.error("Error clearing cart:", error);
            set({ cart: prevCart }); // rollback
        }
    },
}));
