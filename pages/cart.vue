<script setup>
import { useRoute } from 'vue-router';
import Cart from '~/components/Cart.vue';
import { useCartStore } from '../store/cart';

const route = useRoute();
</script>
<template>
  <div class="bg-grey-100 min-h-screen">
    <TheHeader></TheHeader>
    <Cart></Cart>
  </div>
</template>
