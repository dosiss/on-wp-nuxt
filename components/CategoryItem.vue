<template>
    <li>
      <div @click="toggleSubMenu" class="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between">
        <NuxtLink :to="`/category/${parentSlug}`">{{ parentCategory.name }}</NuxtLink>
        <svg
          v-if="hasChildren"
          :class="{'rotate-180': submenuOpen}"
          class="w-4 h-4 transform transition-transform"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      <ul v-if="submenuOpen && hasChildren" class="pl-4 border-l border-gray-200">
        <CategoryItem
          v-for="child in childCategories"
          :key="child.slug"
          :categories="childCategories"
          :categoriesMap="categoriesMap"
          :parentSlug="child.slug"
        />
      </ul>
    </li>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue';
  
  const props = defineProps({
    categories: Array,
    categoriesMap: Object,
    parentSlug: String
  });
  
  const submenuOpen = ref(false);
  const toggleSubMenu = () => {
    submenuOpen.value = !submenuOpen.value;
  };
  
  const childCategories = computed(() => props.categoriesMap.get(props.parentSlug) || []);
  const hasChildren = computed(() => childCategories.value.length > 0);
  
  const parentCategory = computed(() => props.categories.find(cat => cat.slug === props.parentSlug));
  </script>
  