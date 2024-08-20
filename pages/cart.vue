<script setup>
import { useRoute } from 'vue-router';
import Cart from '~/components/Cart.vue';
import { useCartStore } from '../store/cart';

const route = useRoute();
</script>
<template>
  <div>
    <TheHeader></TheHeader>
    <Cart></Cart>
  </div>
</template>
