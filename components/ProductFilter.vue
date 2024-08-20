<template>
    <div class="w-full max-w-md mx-auto mt-6">
      <ul class="bg-white shadow rounded-md divide-y divide-gray-200">
        <!-- Top-Level Menu Items -->
        <li v-for="(category, index) in topLevelCategories" :key="index">
          <button
            @click="toggleDropdown(index)"
            class="flex items-center justify-between w-full p-4 text-left text-gray-700 font-medium focus:outline-none hover:bg-gray-100"
          >
            {{ category.name }}
            <svg
              :class="isOpen(index) ? 'transform rotate-180' : ''"
              class="w-5 h-5 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fill-rule="evenodd" d="M10 3a1 1 0 00-.707 1.707l4.586 4.586-4.586 4.586a1 1 0 001.414 1.414l5-5a1 1 0 000-1.414l-5-5A1 1 0 0010 3z" clip-rule="evenodd" />
            </svg>
          </button>
          <!-- Child Menu Items -->
          <ul v-if="isOpen(index)" class="pl-8 pr-4 py-2 bg-gray-50">
            <li v-for="(child, childIndex) in category.children" :key="childIndex" class="py-1">
              <NuxtLink :to="`/${child.slug}`" class="text-gray-600 hover:text-gray-900">
                {{ child.name }}
              </NuxtLink>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  
  const props = defineProps({
    categories: Array
  })
  
  const openDropdown = ref(null)
  
  const topLevelCategories = computed(() =>
    props.categories
      .filter(category => category.parent === null)
      .map(category => ({
        ...category,
        children: props.categories.filter(child => child.parent && child.parent.node.slug === category.slug)
      }))
  )
  
  const toggleDropdown = (index) => {
    openDropdown.value = openDropdown.value === index ? null : index
  }
  
  const isOpen = (index) => openDropdown.value === index
  </script>  