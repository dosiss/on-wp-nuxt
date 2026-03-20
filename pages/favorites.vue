<template>
  <div class="bg-grey-100">
    <TheHeader></TheHeader>
    
    <div class="px-4 pt-20">
      <h1 class="text-2xl font-bold mb-6">Избранное</h1>
      
      <div v-if="favorites.length === 0" class="text-center py-10">
        <p class="text-gray-500 mb-4">У вас пока нет избранных товаров</p>
        <NuxtLink to="/" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
          Перейти в каталог
        </NuxtLink>
      </div>
      
      <div v-else>
        <div class="grid gap-4 grid-cols-2 lg:grid-cols-4 p-4">
          <Post 
            v-for="favorite in favorites" 
            :key="favorite.uri" 
            :post="favorite"
          ></Post>
        </div>
        
        <div class="flex justify-center mt-6 mb-10">
          <button 
            @click="clearFavorites" 
            class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Очистить избранное
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useFavoritesStore } from '~/store/favorites';
import Post from '~/components/Post.vue';

const favoritesStore = useFavoritesStore();

useHead({
  title: 'Избранное - Одеть Надежду',
  meta: [
    { name: 'description', content: 'Ваш список избранных товаров в магазине Одеть Надежду.' },
    { property: 'og:title', content: 'Избранное - Одеть Надежду' },
    { property: 'og:description', content: 'Ваш список избранных товаров.' },
    { property: 'og:image', content: '/on_site-logo.avif' }
  ]
})

// Get all favorites
const favorites = computed(() => {
  return favoritesStore.getFavorites;
});

// Clear all favorites
const clearFavorites = () => {
  if (confirm('Вы уверены, что хотите очистить все избранные товары?')) {
    favoritesStore.clearFavorites();
  }
};
</script>