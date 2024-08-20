<template>
    <div class="bg-grey-100 pt-20 px-4">
        <div class="text-2xl font-semibold">Ваша корзина:</div>
        <div v-for="item in data.getCartItems" :key="item.id" class="flex items-center my-4 pb-4 border-b border-gray-300">
            <img 
                    v-if="item.productData.productGallery.edges.length > 0" 
                    :src="item.productData.productGallery.edges[0].node.mediaDetails.sizes[0].sourceUrl" 
                    :alt="`${item.title} image`" 
                    class="object-cover rounded-md w-14"
                    />
            <div class="flex-grow ml-8">       
                <div class="prod-name">{{item.title}}</div>
                <div>
                    <span :class="`${item.productData.productPriceReduced ? 'line-through text-base' : '' }`" class="mt-6 text-lg">{{ item.productData.productPrice }} ₽</span>
                    <span v-if="item.productData.productPriceReduced" class="font-semibold text-xl ml-2">{{  item.productData.productPriceReduced }} ₽</span>
                </div>
            </div>
            <div class="w-8 h-8 text-red-600 bold" @click="data.removeFromCart(item)">
                X
            </div>

        </div>
        <div>
            <span class="text-2xl">Итого:</span>
            <span class="text-2xl font-semibold ml-8">{{ data.cart.reduce((acc, item) => acc + (item.productData.productPriceReduced ?? item.productData.productPrice), 0) }} ₽</span>
        </div>
    </div>
</template>
<script setup>
    import { useCartStore } from '../store/cart'
    //get store
    const data = useCartStore();
</script>