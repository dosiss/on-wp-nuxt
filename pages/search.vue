<template>
  <div>
    <TheHeader></TheHeader>
    <div class="bg-grey-100 container mx-auto px-4 pt-20">
      <div class="flex justify-between align-center">
        <h1 class="text-2xl font-semibold mb-4">Результаты поиска: "{{ searchQuery }}"</h1>
        <SortDropdown v-model="sortBy" :options="sortOptions" class="" />
      </div>
      
      <div v-if="loading" class="text-center py-10">
        <p class="text-lg">Загрузка результатов...</p>
      </div>
      
      <div v-else-if="searchResults.length === 0" class="text-center py-10">
        <p class="text-lg">По вашему запросу ничего не найдено.</p>
      </div>
      
      <div v-else class="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <!-- Add click handler to save search path as referrer -->
        <Post 
          v-for="post in sortedResults" 
          :key="post.uri" 
          :post="post" 
          @click="saveReferrer"
        />
      </div>
      
      <!-- Display result count -->
      <div v-if="searchResults.length > 0" class="text-center mt-4 text-gray-600">
        Найдено результатов: {{ searchResults.length }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { useRuntimeConfig } from '#app';
import { ref, computed, watch, onMounted } from 'vue';
import SortDropdown from '~/components/SortDropdown.vue';

const route = useRoute();
const config = useRuntimeConfig();
const searchQuery = computed(() => route.query.q || '');
const sortBy = ref('date'); // Default sorting by date
const loading = ref(true);
const searchResults = ref([]);

// Function to save current search path as referrer
const saveReferrer = () => {
  if (process.client) {
    sessionStorage.setItem('referrer', route.fullPath);
    console.log('Saved search referrer:', route.fullPath);
  }
};

// Save referrer on page load as well
// Add this to your onMounted hook
onMounted(() => {
  if (process.client) {
    // Clear the "from frontpage" flag
    sessionStorage.removeItem('fromFrontpage');
    // Set the referrer
    sessionStorage.setItem('referrer', route.fullPath);
    console.log('Saved search referrer on mount:', route.fullPath);
  }
});

const sortOptions = [
  { label: 'Сначала новые', value: 'date' },
  { label: 'Сначала дешевле', value: 'price' },
];

// Function to fetch search results
const fetchSearchResults = async (query) => {
  if (!query) {
    searchResults.value = [];
    loading.value = false;
    return;
  }
  
  loading.value = true;
  
  try {
    const { data } = await useFetch(config.public.wordpressUrl, {
      method: 'post', // Changed from 'get' to 'post' for more reliable GraphQL requests
      body: { // Changed from 'query' to 'body' for POST request
        query: `
          query SearchProducts($searchTerm: String!) {
            posts(where: {search: $searchTerm}, first: 100) {
              nodes {
                id
                title
                date
                uri
                content
                productData {
                  __typename
                  productDescription
                  productSize
                  productPrice
                  productPriceReduced
                  productGallery {
                    edges {
                      node {
                        id
                        mediaDetails {
                          sizes(include: THUMBNAIL) {
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
          searchTerm: query
        }
      }
    });
    
    console.log('Search results count:', data.value?.data?.posts?.nodes?.length || 0);
    searchResults.value = data.value?.data?.posts?.nodes || [];
  } catch (error) {
    console.error('Error fetching search results:', error);
    searchResults.value = [];
  } finally {
    loading.value = false;
  }
};

// Sort the search results
const sortedResults = computed(() => {
  if (!searchResults.value || searchResults.value.length === 0) {
    return [];
  }
  
  console.log('Sorting results, count:', searchResults.value.length);
  
  if (sortBy.value === 'date') {
    return [...searchResults.value].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } else if (sortBy.value === 'price') {
    return [...searchResults.value].sort((a, b) => {
      const priceA = parseFloat(a.productData?.productPriceReduced ?? a.productData?.productPrice);
      const priceB = parseFloat(b.productData?.productPriceReduced ?? b.productData?.productPrice);
      return priceA - priceB;
    });
  }
  return [...searchResults.value]; // Return a copy to avoid mutation issues
});

// Watch for changes in the search query
watch(searchQuery, (newQuery) => {
  fetchSearchResults(newQuery);
}, { immediate: true });
</script>