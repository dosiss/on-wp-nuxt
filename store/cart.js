import { defineStore } from "pinia";

export const useCartStore = defineStore('cart', {
  state: () => {
    return {
      cart: [],
    };
  },
  actions: {
    addToCart(data) {
      // Make sure to include the URI in the cart item
      const uri = data.uri || (typeof window !== 'undefined' ? window.location.pathname.substring(1) : '');
      this.cart.push({ ...data, uri, quantity: 1 })
    },
    removeFromCart(data) {
        this.cart = this.cart.filter(product => product.id !== data.id)
    },
  },
  getters:  {
    countCartItems(){
        return this.cart.length;
    },
    getCartItems(){
        return this.cart;
    }
  }
})