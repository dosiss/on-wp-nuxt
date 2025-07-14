<template>
  <div class="relative flex-grow mr-8 min-w-[150px]" :style="{ display: isVisible && hasBrands ? 'block' : 'none' }">
    <button
      @click="toggleDropdown"
      class="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg w-full text-left flex items-center justify-between"
    >
      {{ selectedBrand || 'Бренды' }}
      <svg
        class="w-5 h-5 ml-2 flex-shrink-0"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    <div v-if="dropdownOpen" class="fixed mt-1 bg-white shadow-lg rounded-lg z-50 right-6" style="width: 150px;">
      <ul class="max-h-[340px] overflow-y-auto">
        <li class="p-2 hover:bg-gray-100 cursor-pointer" @click="selectBrand(null)">
          Все бренды
        </li>
        <li 
          v-for="brand in brands" 
          :key="brand" 
          class="p-2 hover:bg-gray-100 cursor-pointer"
          @click="selectBrand(brand)"
        >
          {{ brand }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  brands: {
    type: Array,
    default: () => []
  },
  selectedBrand: {
    type: String,
    default: null
  },
  isVisible: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['select-brand']);
const dropdownOpen = ref(false);

// Computed property to check if there are any brands
const hasBrands = computed(() => {
  return Array.isArray(props.brands) && props.brands.length > 0;
});

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value;
};

const selectBrand = (brand) => {
  if (process.client) {
    if (brand) {
      sessionStorage.setItem('selectedBrand', brand);
    } else {
      sessionStorage.removeItem('selectedBrand');
    }
  }
  
  emit('select-brand', brand);
  dropdownOpen.value = false;
};
</script>