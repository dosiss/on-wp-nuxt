import { defineStore } from "pinia";

export const useFavoritesStore = defineStore('favorites', {
  state: () => {
    // Initialize favorites from localStorage if available
    const savedFavorites = process.client ? JSON.parse(localStorage.getItem('favorites') || '[]') : [];
    return {
      favorites: savedFavorites,
    };
  },
  actions: {
    toggleFavorite(product) {
      const index = this.favorites.findIndex(item => item.uri === product.uri);
      
      if (index === -1) {
        // Add to favorites
        this.favorites.push({
          id: product.id || product.uri,
          title: product.title,
          uri: product.uri,
          productData: product.productData
        });
      } else {
        // Remove from favorites
        this.favorites.splice(index, 1);
      }
      
      // Save to localStorage
      if (process.client) {
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
      }
    },
    isFavorite(product) {
      return this.favorites.some(item => item.uri === product.uri);
    },
    clearFavorites() {
      this.favorites = [];
      if (process.client) {
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
      }
    }
  },
  getters: {
    favoritesCount() {
      return this.favorites.length;
    },
    getFavorites() {
      return this.favorites;
    }
  }
});