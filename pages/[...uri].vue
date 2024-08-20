<template>
    <div>
      <TheHeader></TheHeader>
      <main class="bg-gray-100 container mx-auto mt-6 pt-10 px-4 rounded-lg">
        <!-- Gallery Section -->
        <div class="mt-8">
         <Swiper
            :modules="[SwiperPagination]"
            :spaceBetween="30"
            :pagination="{
              type: 'fraction',
            }"
            :slides-per-view="1"
            :loop="true"
     
         >
         <SwiperSlide v-for="edge in data.productData.productGallery.edges" :key="edge.node.id">
            <img 
              :src="edge.node.mediaDetails.sizes[0].sourceUrl" 
              :alt="`Product Image ${edge.node.id}`"
              class="w-full h-auto rounded-lg border border-gray-200"
            />
          </SwiperSlide>
        </Swiper>
        </div>
        <h1 class="text-2xl mt-4 mb-2">{{ data.title }}</h1>
        <!-- <div class="text-2xl mt-4">{{ new Date(data.date).toLocaleDateString() }}</div> -->
        <span :class="`${data.productData.productPriceReduced ? 'line-through text-base' : '' }`" class="mt-6 text-lg">{{ data.productData.productPrice }} ₽</span>
        <span v-if="data.productData.productPriceReduced" class="font-semibold text-xl ml-2">{{  data.productData.productPriceReduced }} ₽</span>
        <button
            @click="() => {addToCart(data)}"
            :class="`${alreadyInCart(data) ? 'bg-blue-300 pointer-events-none' : 'bg-blue-600'}`"
            class="w-full block text-white text-lg p-2 rounded-md mt-4"
            >{{ alreadyInCart(data) ? 'Уже в корзине' : 'Добавить в корзину' }}
        </button>
        <div class="mt-4 pb-8 space-y-2" v-html="data.productData.productDescription"></div>



      </main>
    </div>
  </template>
  
  <script setup>

  import 'swiper/css/pagination';
  import { Pagination } from 'swiper/modules';
  import { useCartStore } from "~~/store/cart";

  const route = useRoute();
  const uri = route.params.uri.join('/');
  const config = useRuntimeConfig();
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
  
  useHead({
     title: data.value.title
  })

const cartStore = useCartStore();

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
  