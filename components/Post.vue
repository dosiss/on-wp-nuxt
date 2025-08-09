<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden relative">
    <!-- Add favorite heart icon -->
    <button 
      @click.prevent="toggleFavorite"
      class="absolute z-[2] top-2 right-2 z-10 p-1 rounded-full  transition-all"
    >
      <svg 
        class="w-6 h-6" 
        :class="{ 'text-red-500 fill-current': isFavorite, 'text-gray-200': !isFavorite }"
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
          :fill="isFavorite ? 'currentColor' : 'none'" 
          stroke="currentColor" 
          stroke-width="2"
        />
      </svg>
    </button>
    
    <NuxtLink :to="post.uri" @click="saveScrollPosition">
        <div class="flex
        items-start
        border
        h-full
        rounded-lg
        p-2
        text-black
        transition-all
        hover:-translate-y-1
        hover:scale-105"
        >
            <div>
                <img 
                v-if="post.productData.productGallery.edges.length > 0" 
                :src="post.productData.productGallery?.edges?.[0]?.node?.mediaDetails?.sizes?.[0]?.sourceUrl" 
                :alt="`${post.title} image`" 
                class="object-cover rounded-md min-w-full"
                loading="lazy"
                />
                <div class="title-content flex justify-between items-start">
                    <h2 class="font-normal text-sm leading-5 mt-4">{{ post.title }}</h2>
                    <span class="font-semibold text-sm">{{ post.productData.productSize }}</span>
                </div>    
                <span :class="`${post.productData.productPriceReduced ? 'line-through text-sm' : 'text-sm font-semibold' }`" class="mt-4">{{ post.productData.productPrice }} ₽</span>
                <span v-if="post.productData.productPriceReduced" class="font-semibold text-sm ml-2">{{  post.productData.productPriceReduced }} ₽</span>
            </div>
        </div>
    </NuxtLink>
  </div>
</template>
 
<script setup>
import { computed } from 'vue';
import { useFavoritesStore } from '~/store/favorites';

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
});

const favoritesStore = useFavoritesStore();

// Check if this product is in favorites
const isFavorite = computed(() => {
  return favoritesStore.isFavorite(props.post);
});

// Toggle favorite status
const toggleFavorite = (event) => {
  event.stopPropagation();
  favoritesStore.toggleFavorite(props.post);
};

// Function to save scroll position when clicking on a product
const saveScrollPosition = () => {
  const scrollPosition = window.scrollY || window.pageYOffset;
  console.log('Saving scroll position from Post component:', scrollPosition);
  sessionStorage.setItem('lastScrollPosition', scrollPosition.toString());
};
</script>