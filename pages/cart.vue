<!-- <script setup>
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
</template> -->
<script setup>
import { useRoute } from 'vue-router';
import Cart from '~/components/Cart.vue';
import { useCartStore } from '../store/cart';
import { MainButton, useWebAppPopup, useWebApp } from 'vue-tg';

// Import required utilities
const route = useRoute();
const data = useCartStore();
const { showAlert } = useWebAppPopup();
const { initDataUnsafe } = useWebApp(); // useWebApp function to access WebApp and initDataUnsafe

function sendOrder() {
  // Extract user information from initDataUnsafe
  const userId = initDataUnsafe.user?.username;

  // Ensure the WebApp is available

    // Prepare cart data
    const cartItems = data.getCartItems.map(item => ({
      title: item.title,
      price: item.productData.productPriceReduced ?? item.productData.productPrice,
    }));

    // Prepare data to send to Telegram bot
    const orderData = {
      userId:`@${userId}`,   // Telegram user ID
      cart: cartItems,
    };

    // Send data to the bot using Telegram WebApp API
    window.Telegram.WebApp.sendData(JSON.stringify(orderData));

    // Show confirmation alert
    showAlert('Спасибо за ваш заказ! Мы свяжемся с вами в Телеграм.');
}
</script>

<template>
  <div class="bg-grey-100 min-h-screen">
    <TheHeader></TheHeader>
    <Cart></Cart>
    <ClientOnly>
      <MainButton text="Заказать" @click="sendOrder" />
    </ClientOnly>
  </div>
</template>

