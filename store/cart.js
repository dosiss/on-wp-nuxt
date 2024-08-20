import { defineStore } from "pinia";

export const useCartStore = defineStore('cart', {
  state: () => {
    return {
      cart: [],
    };
  },
  actions: {
    addToCart(data) {
      this.cart.push({ ...data, quantity: 1 })
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