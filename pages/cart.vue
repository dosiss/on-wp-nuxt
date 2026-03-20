<script setup>
import { useRoute } from 'vue-router';
import Cart from '~/components/Cart.vue';
import { useCartStore } from '../store/cart';

import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

// Import required utilities
const route = useRoute();
const data = useCartStore();

const windowWidth = ref(0);
const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth;
};
const isClient = ref(false); // Track if component is mounted on client-side

const showLargeScreenLayout = computed(() => isClient.value && windowWidth.value >= 850);

const showOrderModal = ref(false);
const isProcessing = ref(false);

const telegramNickname = ref('');
const phoneNumber = ref('');
const email = ref('');

const telegramNicknameError = ref('');
const phoneNumberError = ref('');
const emailError = ref('');
const formError = ref('');
const showSuccessMessage = ref(false);

// Function to format phone number input
const formatPhoneNumber = (event) => {
  let value = event.target.value.replace(/\D/g, ''); // Remove non-digits
  // If the first char is 8, replace with 7 (common for Russian numbers)
  if (value.startsWith('8')) {
    value = '7' + value.substring(1);
  }
  // Ensure it starts with a plus if there are digits
  if (value.length > 0 && !value.startsWith('+')) {
    value = '+' + value;
  }
  // Limit total length (e.g., +79991234567 has 12 characters)
  if (value.length > 12) {
    value = value.substring(0, 12);
  }
  phoneNumber.value = value;
};


// Function to handle form submission
const submitOrderForm = async () => { // Made async
  // Reset previous errors
  telegramNicknameError.value = '';
  phoneNumberError.value = '';
  emailError.value = '';
  formError.value = ''; // Clear general form error

  let hasError = false;

  // Validate Telegram Nickname
  if (telegramNickname.value.length > 0 && (!telegramNickname.value.startsWith('@') || telegramNickname.value.length < 2)) {
    telegramNicknameError.value = 'Telegram nickname must start with "@" and be at least 2 characters long.';
    hasError = true;
  }

  // Validate Phone Number format +XXX-XXXXXXX (cleaned version)
  const phoneRegex = /^\+\d{11}$/; // Example: +79991234567
  if (phoneNumber.value.length > 0 && !phoneRegex.test(phoneNumber.value)) {
    phoneNumberError.value = 'Phone number must be in +XDDDDDDDDDD format. Example: +79991234567';
    hasError = true;
  }

  // Basic email validation (browser's type="email" also helps)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email.value.length > 0 && !emailRegex.test(email.value)) {
    emailError.value = 'Please enter a valid email address.';
    hasError = true;
  }

  if (hasError) {
    return;
  }

  // Check if at least one field has valid data
  const hasAnyInput = telegramNickname.value.length > 0 || phoneNumber.value.length > 0 || email.value.length > 0;

  if (!hasAnyInput) {
    formError.value = 'Please fill in at least one contact method.';
    hasError = true; // Set hasError to true to prevent submission
    return;
  }

  // If all validations pass
  isProcessing.value = true; // Set processing to true
  try {
    // Prepare cart data with product URLs
    const cartItems = data.getCartItems.map(item => {
      // Get the URI from the item if available
      const productUri = item.uri || '';
      
      return {
        title: item.title,
        price: item.productData.productPriceReduced ?? item.productData.productPrice,
        url: productUri ? `https://on.devdog.xyz/${productUri}` : ''
      };
    });

    // Calculate total price
    const totalPrice = cartItems.reduce((sum, item) => sum + parseFloat(item.price), 0);

    const orderData = {
      telegramNickname: telegramNickname.value,
      phoneNumber: phoneNumber.value,
      email: email.value,
      cart: cartItems,
      totalPrice: totalPrice.toFixed(2),
      orderDate: new Date().toISOString(),
    };

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

    if (result.success) {
      showSuccessMessage.value = true;
      // Reset form fields
      telegramNickname.value = '';
      phoneNumber.value = '';
      email.value = '';
      // Close modal after a delay
      setTimeout(() => {
        showOrderModal.value = false;
        showSuccessMessage.value = false; // Reset success message when modal closes
      }, 5000); // Show message for 5 seconds
    } else {
      formError.value = result.error || 'Failed to send order. Please try again.';
    }

  } catch (error) {
    console.error('Failed to send order email:', error);
    formError.value = 'Failed to send order. Please try again.'; // Set general error
  } finally {
    isProcessing.value = false; // Reset processing state
  }
};

onMounted(() => {
  if (process.client) {
    isClient.value = true;
    updateWindowWidth();
    window.addEventListener('resize', updateWindowWidth);
  }
});

onBeforeUnmount(() => {
  if (process.client) {
    window.removeEventListener('resize', updateWindowWidth);
  }
});



</script>

<template>
  <div>
    <TheHeader></TheHeader>
    
    <div class="bg-grey-100 flex">
      <!-- Left Sidebar (empty for now) -->
      <div v-if="showLargeScreenLayout" class="w-1/5 bg-white p-4 pt-20 border-r min-h-screen">
      </div>

      <!-- Main Content Area -->
      <div :class="{'w-4/5': showLargeScreenLayout, 'w-full': !showLargeScreenLayout}" class="flex-grow container mx-auto px-4 pt-20">
        <Cart></Cart>
        <button
          @click="showOrderModal = true; showSuccessMessage = false;"
          class="w-full block bg-blue-600 text-white text-lg p-2 rounded-md mt-4"
        >
          Заказать
        </button>      </div>
    </div>
    <!-- Order Modal -->
    <div v-if="showOrderModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div class="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <button 
          @click="showOrderModal = false; showSuccessMessage = false;"
          class="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div class="mt-3 text-center">
          <h3 v-if="!showSuccessMessage" class="text-lg leading-6 font-medium text-gray-900">Спасибо за заказ!<br>Укажите предпочтительный способ связи с вами:</h3>
          <div class="mt-2 px-7 py-3">
            <div v-if="showSuccessMessage" class="text-green-600 text-lg font-semibold">
              Спасибо за ваш заказ! Мы свяжемся с вами в ближайшее время.
            </div>
            <form v-else @submit.prevent="submitOrderForm" class="mt-4">
              <div class="mb-4">
                <label for="telegram" class="block text-sm font-medium text-gray-700 text-left">Telegram Nickname</label>
                <input 
                  type="text" 
                  id="telegram" 
                  v-model="telegramNickname" 
                  placeholder="@username"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  :class="{'border-red-500': telegramNicknameError}"
                />
                <p v-if="telegramNicknameError" class="mt-1 text-sm text-red-600 text-left">{{ telegramNicknameError }}</p>
              </div>
              <div class="mb-4">
                <label for="phone" class="block text-sm font-medium text-gray-700 text-left">Phone Number</label>
                <input 
                  type="tel" 
                  id="phone" 
                  v-model="phoneNumber" 
                  @input="formatPhoneNumber"
                  placeholder="+XXX-XXXXXXX"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  :class="{'border-red-500': phoneNumberError}"
                />
                <p v-if="phoneNumberError" class="mt-1 text-sm text-red-600 text-left">{{ phoneNumberError }}</p>
              </div>
              <div class="mb-4">
                <label for="email" class="block text-sm font-medium text-gray-700 text-left">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  v-model="email" 
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  :class="{'border-red-500': emailError}"
                />
                <p v-if="emailError" class="mt-1 text-sm text-red-600 text-left">{{ emailError }}</p>
              </div>
              <div class="mt-4">
                <button 
                  type="submit" 
                  :disabled="isProcessing"
                  class="w-full px-4 py-2 bg-green-600 text-white text-base font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                  :class="{'opacity-50 cursor-not-allowed': isProcessing, 'hover:bg-green-700': !isProcessing}"
                >
                  <span v-if="isProcessing">Отправка...</span>
                  <span v-else>Отправить</span>
                </button>
                <p v-if="formError" class="mt-2 text-sm text-red-600 text-center">{{ formError }}</p>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

