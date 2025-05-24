<script setup>
import { useRoute } from 'vue-router';
import Cart from '~/components/Cart.vue';
import { useCartStore } from '../store/cart';
import { MainButton, useWebAppPopup, useWebApp } from 'vue-tg';
import { ref } from 'vue';

// Import required utilities
const route = useRoute();
const data = useCartStore();
const { showAlert } = useWebAppPopup();
const { initDataUnsafe } = useWebApp(); // useWebApp function to access WebApp and initDataUnsafe
const config = useRuntimeConfig();
const isProcessing = ref(false);

async function sendOrder() {
  if (isProcessing.value) return;
  isProcessing.value = true;
  
  try {
    // Extract user information from initDataUnsafe
    const userId = initDataUnsafe.user?.id;
    const userName = initDataUnsafe.user?.username;

    // Prepare cart data
    const cartItems = data.getCartItems.map(item => ({
      title: item.title,
      price: item.productData.productPriceReduced ?? item.productData.productPrice,
      url: item.uri || item.slug ? `https://odet-nadezhdu.netlify.app/${item.uri || item.slug}` : ''
    }));

    // Calculate total price
    const totalPrice = cartItems.reduce((sum, item) => sum + parseFloat(item.price), 0);

    // Prepare data to send to Telegram bot and email
    const orderData = {
      userId: userId,
      userName: `@${userName}`,
      cart: cartItems,
      totalPrice: totalPrice.toFixed(2),
      orderDate: new Date().toISOString(),
    };

    // First, send the order data to your server endpoint
    // This will happen in the background and won't close the WebApp
    try {
      const response = await fetch('/api/send-order-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      
      const result = await response.json();
      console.log('Email sent result:', result);
      console.log('Order data sent:', orderData);
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // Continue with Telegram data sending even if email fails
    }

    // Show confirmation alert
    showAlert('Спасибо за ваш заказ! Мы свяжемся с вами в Телеграм.');
    
    // Short delay to ensure the alert is shown before potentially closing the WebApp
    setTimeout(() => {
      // Send data to the bot using Telegram WebApp API
      // This will close the WebApp on desktop
      window.Telegram.WebApp.sendData(JSON.stringify(orderData));
    }, 100000 );
  } catch (error) {
    console.error('Error processing order:', error);
    showAlert('Произошла ошибка при оформлении заказа. Пожалуйста, попробуйте еще раз.');
  } finally {
    isProcessing.value = false;
  }
}
</script>

<template>
  <div class="bg-grey-100 min-h-screen">
    <TheHeader></TheHeader>
    <Cart></Cart>
    <ClientOnly>
      <MainButton text="Заказать" @click="sendOrder" :disabled="isProcessing" />
    </ClientOnly>
  </div>
</template>

