<template>
    <div>
      <TheHeader></TheHeader>
      <div class="bg-gray-100 flex">

        <!-- Left Sidebar Section for Product Details (>= 850px) -->
        <div v-if="showLargeScreenLayout" class="w-1/5 bg-white p-4 pt-20 border-r min-h-screen">
          <div class="relative flex justify-between items-center">
            <button 
            @click.prevent="toggleFavorite"
            class="absolute right-0 top-4 z-10 p-1 rounded-full bg-white bg-opacity-70 hover:bg-opacity-100 transition-all"
          >
            <svg 
              class="w-8 h-8" 
              :class="{ 'text-red-500 fill-current': isFavorite, 'text-gray-400': !isFavorite }"
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
            <h1 class="text-2xl mt-4 mb-2 pr-16">{{ data.title }}</h1>
          </div>
          <div class="py-3">Размер: <span class="uppercase">{{ data.productData?.productSize }}</span></div>
          <!-- <div class="text-2xl mt-4">{{ new Date(data.date).toLocaleDateString() }}</div> -->
          <span :class="`${data.productData?.productPriceReduced ? 'line-through text-base' : '' }`" class="mt-6 text-lg">{{ data.productData?.productPrice }} ₽</span>
          <span v-if="data.productData?.productPriceReduced" class="font-semibold text-xl ml-2">{{ data.productData?.productPriceReduced }} ₽</span>

          <button
              @click="() => {addToCart(data)}"
              :class="`${alreadyInCart(data) ? 'bg-blue-300 pointer-events-none' : 'bg-blue-600'}`"
              class="w-full block text-white text-lg p-2 rounded-md mt-4"
              >{{ alreadyInCart(data) ? 'Уже в корзине' : 'Добавить в корзину' }}
          </button>

          <div class="mt-4 pb-8 space-y-2" v-html="data.productData?.productDescription"></div>
          

          <!-- Product details for small screens -->
        <div v-if="!showLargeScreenLayout">
          <div class="relative flex justify-between items-center">
            <button 
            @click.prevent="toggleFavorite"
            class="absolute right-0 top-4 z-10 p-1 rounded-full bg-white bg-opacity-70 hover:bg-opacity-100 transition-all"
          >
            <svg 
              class="w-8 h-8" 
              :class="{ 'text-red-500 fill-current': isFavorite, 'text-gray-400': !isFavorite }"
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
            <h1 class="text-2xl mt-4 mb-2 pr-16">{{ data.title }}</h1>
          </div>
          <div class="py-3">Размер: <span class="uppercase">{{ data.productData?.productSize }}</span></div>
          <span :class="`${data.productData?.productPriceReduced ? 'line-through text-base' : '' }`" class="mt-6 text-lg">{{ data.productData?.productPrice }} ₽</span>
          <span v-if="data.productData?.productPriceReduced" class="font-semibold text-xl ml-2">{{ data.productData?.productPriceReduced }} ₽</span>

          <button
              @click="() => {addToCart(data)}"
              :class="`${alreadyInCart(data) ? 'bg-blue-300 pointer-events-none' : 'bg-blue-600'}`"
              class="w-full block text-white text-lg p-2 rounded-md mt-4"
              >{{ alreadyInCart(data) ? 'Уже в корзине' : 'Добавить в корзину' }}
          </button>
          

        </div>

        </div>

        <!-- Main Content Area -->
        <div :class="{'w-4/5': showLargeScreenLayout, 'w-full': !showLargeScreenLayout}" class="flex-grow container mx-auto mt-6 pt-10 px-4 rounded-lg relative">
        
        <!-- Gallery Section -->
        <div class="mt-8">
          <!-- Grid layout for large screens -->
          <div v-if="showLargeScreenLayout && data.productData?.productGallery?.edges?.length > 0" class="grid grid-cols-3 gap-4">
            <div v-for="edge in data.productData?.productGallery?.edges || []" :key="edge.node.id" class="flex justify-center items-center overflow-hidden rounded-lg border border-gray-200">
              <img 
                :src="edge.node?.mediaDetails?.sizes[0]?.sourceUrl" 
                :alt="`Product Image ${edge.node?.id}`"
                class="w-full h-auto object-cover"
                loading="lazy"
              />
            </div>
          </div>

          <!-- Swiper slider for small screens -->
          <div v-else-if="data.productData?.productGallery?.edges?.length > 0">
           <Swiper
              :modules="[SwiperPagination]"
              :spaceBetween="30"
              :pagination="{
                type: 'fraction',
              }"
              :slides-per-view="1"
              :loop="true"
           >
           <SwiperSlide v-for="edge in data.productData?.productGallery?.edges || []" :key="edge.node.id">
              <img 
                :src="edge.node?.mediaDetails?.sizes[0]?.sourceUrl" 
                :alt="`Product Image ${edge.node?.id}`"
                class="w-full h-auto rounded-lg border border-gray-200"
                loading="lazy"
              />
            </SwiperSlide>
          </Swiper>
          </div>

          <!-- Placeholder if no images -->
          <div v-else class="w-full">
            <img 
              src="/placeholder-image.png" 
              alt="Product Image Placeholder"
              class="w-full h-auto rounded-lg border border-gray-200"
              loading="lazy"
            />
          </div>
        </div>

        <!-- Product details for small screens -->
        <div v-if="!showLargeScreenLayout">
          <div class="relative flex justify-between items-center">
            <button 
            @click.prevent="toggleFavorite"
            class="absolute right-0 top-4 z-10 p-1 rounded-full bg-white bg-opacity-70 hover:bg-opacity-100 transition-all"
          >
            <svg 
              class="w-8 h-8" 
              :class="{ 'text-red-500 fill-current': isFavorite, 'text-gray-400': !isFavorite }"
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
            <h1 class="text-2xl mt-4 mb-2 pr-16">{{ data.title }}</h1>
          </div>
          <div class="py-3">Размер: <span class="uppercase">{{ data.productData?.productSize }}</span></div>
          <span :class="`${data.productData?.productPriceReduced ? 'line-through text-base' : '' }`" class="mt-6 text-lg">{{ data.productData?.productPrice }} ₽</span>
          <span v-if="data.productData?.productPriceReduced" class="font-semibold text-xl ml-2">{{ data.productData?.productPriceReduced }} ₽</span>

          <button
              @click="() => {addToCart(data)}"
              :class="`${alreadyInCart(data) ? 'bg-blue-300 pointer-events-none' : 'bg-blue-600'}`"
              class="w-full block text-white text-lg p-2 rounded-md mt-4"
              >{{ alreadyInCart(data) ? 'Уже в корзине' : 'Добавить в корзину' }}
          </button>
          
          <div class="mt-4 pb-8 space-y-2" v-html="data.productData?.productDescription"></div>
        </div>

        </div>

      </div>
    </div>
  </template>
  
  <script setup>
  import 'swiper/css/pagination';
  import { Pagination } from 'swiper/modules';
  import { useCartStore } from "~~/store/cart";
  import { useFavoritesStore } from "~~/store/favorites";
  import { computed, ref, onMounted, onBeforeUnmount } from 'vue';

  const windowWidth = ref(0);
const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth;
};
const isClient = ref(false); // Track if component is mounted on client-side

const showLargeScreenLayout = computed(() => isClient.value && windowWidth.value >= 850);

const route = useRoute();
  const uri = route.params.uri.join('/');
  const config = useRuntimeConfig();
  
  // Save referrer if coming from a category page
  onMounted(() => {
    if (process.client) {
      isClient.value = true; // Set isClient to true
      updateWindowWidth();
      window.addEventListener('resize', updateWindowWidth);

      const referrer = document.referrer;
      if (referrer && referrer.includes('/categories/')) {
        sessionStorage.setItem('referrer', new URL(referrer).pathname + new URL(referrer).search);
        console.log('Saved referrer from product page:', new URL(referrer).pathname + new URL(referrer).search);
      }
    }
  });

  onBeforeUnmount(() => {
    if (process.client) {
      window.removeEventListener('resize', updateWindowWidth);
    }
  });
  
  const {data, pending, refresh, error} = await useFetch(config.public.wordpressUrl, {
     method: 'get',
     query: {
         query: `
             query MyQuery3($uri: String!) {
             nodeByUri(uri: $uri) {
                 ... on Post {
                 id
                 title
                 date
                 content
                 productData {
                     __typename
                     productDescription
                     productPrice
                     productPriceReduced
                     productBrand
                     productSize
                     productGallery {
                     edges {
                         node {
                         id
                         mediaDetails {
                             sizes(include: MEDIUM) {
                             sourceUrl
                             }
                         }
                         }
                     }
                     }
                 }
                 }
             }
             }
         `,
         variables: {
             uri: uri
         }
     },
     transform(data){
         return data.data.nodeByUri
     }
  })
  
  const productDescription = computed(() => {
    if (!data.value?.productData?.productDescription) return 'Интернет-магазин Одеть Надежду';
    // Strip HTML and get first sentence
    const plainText = data.value.productData.productDescription.replace(/<[^>]*>/g, '');
    const firstSentence = plainText.split(/[.!?]/)[0];
    return firstSentence ? firstSentence + '.' : 'Описание товара Одеть Надежду';
  });

  const productOgImage = computed(() => {
    return data.value?.productData?.productGallery?.edges?.[0]?.node?.mediaDetails?.sizes?.[0]?.sourceUrl || '/on_site-logo.avif';
  });

  useHead({
     title: computed(() => `${data.value?.title} - магазин Одеть Надежду`),
     meta: [
       { name: 'description', content: productDescription },
       { property: 'og:title', content: computed(() => data.value?.title) },
       { property: 'og:description', content: productDescription },
       { property: 'og:image', content: productOgImage },
       { name: 'twitter:card', content: 'summary_large_image' }
     ]
  })

  const cartStore = useCartStore();
  const favoritesStore = useFavoritesStore();

  // Check if this product is in favorites
  const isFavorite = computed(() => {
    if (!data.value) return false;
    return favoritesStore.isFavorite({
      uri: '/' + uri // Make sure the URI format matches what's stored in favorites
    });
  });

  // Toggle favorite status
  const toggleFavorite = () => {
    if (!data.value) return;
    favoritesStore.toggleFavorite({
      id: data.value.id,
      title: data.value.title,
      uri: '/' + uri,
      productData: data.value.productData
    });
  };

const alreadyInCart = (data) => {
  const x = cartStore.cart?.find(el => el.id === data.id)
  if(x?.id) {
    return true
  } else {
    return false
  }
}

const addToCart = (data) => {
  if(!alreadyInCart(data)) {
    cartStore.addToCart(data);
  } else {
    alert(`${data.title} already in cart`)
  }
};
  </script>
  <style lang="css">
  .swiper-pagination-fraction {
    color: #fff;
    max-width: max-content;
    background: gray;
    padding: 2px 7px;
    border-radius: 16px;
    transform: translate(-14px);
    left: 50%;
  }
  </style>
  