import { debounce } from "lodash";

export const debounceSearch = debounce((value, category, products, setSuggestions) => {
    if (value.trim() === "") {
        setSuggestions([]);
        return;
    }

    const filtered = products.filter((product) => {
        const matchKeyword = product.productName.toLowerCase().includes(value.toLowerCase());
        const matchCategory = category === "All Categories" || product.category.toLowerCase() === category.toLowerCase();
        return matchKeyword && matchCategory;
    });

    setSuggestions(filtered.slice(0, 5));
}, 300);
