<script setup>
import { useRoute } from 'vue-router';
import Cart from '~/components/Cart.vue';
import { useCartStore } from '../store/cart';
import { MainButton, useWebAppPopup, useWebAppTheme } from 'vue-tg'

const route = useRoute();
const { showAlert } = useWebAppPopup()
//const { setBackgroundColor } = useWebAppTheme()
</script>
<template>
  <div class="bg-grey-100 min-h-screen">
    <TheHeader></TheHeader>
    <Cart></Cart>
    <ClientOnly>
        <MainButton text="Заказать" @click="() => showAlert('Спасибо за ваш заказ! Мы свяжемся с вами в Телеграм.')" />
    </ClientOnly>
  </div>
</template>
