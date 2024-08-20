<template>
    <NuxtLink :to='post.uri'>
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
                :src="post.productData.productGallery.edges[0].node.mediaDetails.sizes[0].sourceUrl" 
                :alt="`${post.title} image`" 
                class="object-cover rounded-md min-w-full"
                />
                <h2 class="font-normal text-md mt-4">{{ post.title }}</h2>
                <span :class="`${post.productData.productPriceReduced ? 'line-through text-base' : 'text-lg' }`" class="mt-4">{{ post.productData.productPrice }} ₽</span>
                <span v-if="post.productData.productPriceReduced" class="font-semibold text-lg ml-2">{{  post.productData.productPriceReduced }} ₽</span>
                <!-- <div class="text-sm">{{ post.categories.edges[1].node.name }}</div> -->
                <!-- <p>{{ new Date(post.date).toLocaleDateString() }}</p> -->

            </div>
        </div>
    </NuxtLink>
 </template>
 
<script setup lang="ts">
const props = defineProps<{ post: any }>();

</script>