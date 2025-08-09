"use client";

import { useState } from "react";

export default function FavouritesPage() {
  const [favourites, setFavourites] = useState([
    {
      id: 101,
      name: "Organic Tomatoes",
      price: 4.5,
      image: "🍅",
      isInCart: false,
      category: "Vegetables",
    },
    {
      id: 102,
      name: "Fresh Strawberries",
      price: 5.0,
      image: "🍓",
      isInCart: true,
      category: "Fruits",
    },
    {
      id: 103,
      name: "Greek Yogurt",
      price: 3.25,
      image: "🥛",
      isInCart: false,
      category: "Dairy",
    },
    {
      id: 104,
      name: "Sourdough Bread",
      price: 4.75,
      image: "🍞",
      isInCart: false,
      category: "Bakery",
    },
  ]);

  const removeFavourite = (id) => {
    setFavourites((items) => items.filter((item) => item.id !== id));
  };

  const addToCart = (id) => {
    setFavourites((items) =>
      items.map((item) => (item.id === id ? { ...item, isInCart: true } : item))
    );
  };

  const removeFromCart = (id) => {
    setFavourites((items) =>
      items.map((item) =>
        item.id === id ? { ...item, isInCart: false } : item
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-10">
      <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-2xl">❤️</span>
          <h1 className="text-2xl font-medium text-gray-900 dark:text-gray-100">
            My Favorites
          </h1>
          <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
            {favourites.length} items
          </span>
        </div>

        {favourites.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">💔</div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No favorites yet
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Start adding items to your favorites to see them here
            </p>
            <button className="mt-4 text-blue-600 dark:text-blue-400 hover:underline">
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {favourites.map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{item.image}</div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {item.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          {item.category}
                        </p>
                        <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>

                      <button
                        onClick={() => removeFavourite(item.id)}
                        className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400"
                        title="Remove from favorites"
                      >
                        <span className="text-lg">×</span>
                      </button>
                    </div>

                    <div className="flex gap-2">
                      {!item.isInCart ? (
                        <button
                          onClick={() => addToCart(item.id)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors"
                        >
                          Add to Cart
                        </button>
                      ) : (
                        <div className="flex gap-2 flex-1">
                          <span className="flex-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 py-2 px-3 rounded text-sm font-medium text-center">
                            ✓ In Cart
                          </span>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="px-3 py-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 text-sm"
                            title="Remove from cart"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
