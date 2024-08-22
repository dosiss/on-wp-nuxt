import { defineNuxtPlugin } from '#app';
import { useWebAppTheme } from 'vue-tg';
i// mport { useWebApp } from 'vue-tg';

export default defineNuxtPlugin((nuxtApp) => {
  const { setBackgroundColor } = useWebAppTheme();

  // Set a default background color for the entire Telegram Mini App
  setBackgroundColor('#ffffff'); // Replace with your desired color
});
