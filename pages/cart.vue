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
  const userId = initDataUnsafe.user?.id;
  const userName = initDataUnsafe.user?.username;

  // Prepare cart data
  const cartItems = data.getCartItems.map(item => ({
    title: item.title,
    price: item.productData.productPriceReduced ?? item.productData.productPrice,
  }));

  // Prepare data to send to Telegram bot
  const orderData = {
    userName: `@${userName}`,   // Telegram user ID
    userId: userId,
    cart: cartItems,
  };

  // Check if we're on desktop or mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    // On mobile, use the standard sendData method (WebApp will stay open on mobile)
    window.Telegram.WebApp.sendData(JSON.stringify(orderData));
  } else {
    // On desktop, use a different approach to prevent closing
    // Log the data to console for debugging
    console.log('Order data:', orderData);
    
    // Use BackButton event to send data without closing the WebApp
    try {
      // Alternative approach: use Telegram's postEvent method
      window.Telegram.WebApp.postEvent('web_app_data_send', {
        data: JSON.stringify(orderData)
      });
    } catch (error) {
      console.error('Error sending data:', error);
    }
  }

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

