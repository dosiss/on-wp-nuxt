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
                    <span v-if="isPromoApplicable(item)" class="font-semibold text-xl ml-2 text-green-600">{{ getDiscountedPrice(item) }} ₽</span>
                </div>
            </div>
            <div class="w-8 h-8 text-red-600 bold" @click="data.removeFromCart(item)">
                X
            </div>

        </div>
        <div class="my-4">
            <input 
                v-model="promocode" 
                type="text" 
                placeholder="Промокод" 
                class="border border-gray-300 rounded px-3 py-2 w-full max-w-xs"
            />
        </div>
        <div>
            <span class="text-2xl">Итого:</span>
            <span class="text-2xl font-semibold ml-8">{{ calculateTotal() }} ₽</span>
        </div>
    </div>
</template>
<script setup>
    import { useCartStore } from '../store/cart'
    import { ref, computed } from 'vue'
    
    //get store
    const data = useCartStore();
    const promocode = ref('');
    
    const isPromoApplicable = (item) => {
        if (!promocode.value) return false;
        
        return promocode.value.toUpperCase() === 'WIKTOR' && 
               item.productData.productBrand && 
               item.productData.productBrand.toLowerCase().includes('hagl');
    };
    
    const getDiscountedPrice = (item) => {
        if (!isPromoApplicable(item)) return item.productData.productPriceReduced ?? item.productData.productPrice;
        
        const originalPrice = item.productData.productPriceReduced ?? item.productData.productPrice;
        return Math.max(originalPrice - 1000, 0); // Ensure price doesn't go below 0
    };
    
    const calculateTotal = () => {
        return data.cart.reduce((acc, item) => {
            if (isPromoApplicable(item)) {
                return acc + getDiscountedPrice(item);
            } else {
                return acc + (item.productData.productPriceReduced ?? item.productData.productPrice);
            }
        }, 0);
    };
</script>