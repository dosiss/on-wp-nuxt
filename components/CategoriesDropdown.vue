<template>
  <div class="relative flex-grow mr-8">
    <button
      @click="toggleDropdown"
      class="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg w-full text-left flex items-center justify-between"
    >
      Категории
      <svg
        class="w-5 h-5"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    <div v-if="dropdownOpen" class="absolute mt-1 w-full bg-white shadow-lg rounded-lg z-10">
      <ul>
        <li v-for="parent in parentCategories" :key="parent.slug" class="p-2">
          <div @click="toggleSubmenu(parent.slug)" class="flex justify-between cursor-pointer">
            {{ parent.name }}
            <svg class="w-4 h-4 transform transition-transform" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <ul v-if="openSubmenu === parent.slug" class="pl-4 mt-1 space-y-1">
            <li v-for="child in getChildCategories(parent.slug)" :key="child.slug" class="pl-2 hover:bg-gray-100">
              <NuxtLink :to="`/categories/${child.slug}`">{{ child.name }}</NuxtLink>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps({
  parentCategories: Array,
  childCategories: Array
});

const dropdownOpen = ref(false);
const openSubmenu = ref(null);

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value;
};

const toggleSubmenu = (slug) => {
  openSubmenu.value = openSubmenu.value === slug ? null : slug;
};

const getChildCategories = (parentSlug) => {
  return props.childCategories.filter(child => child.parent.node.slug === parentSlug);
};
</script>
