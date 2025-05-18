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
        <Post v-for="post in sortedResults" :key="post.uri" :post="post" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { useRuntimeConfig } from '#app';
import { ref, computed, watch } from 'vue';
import SortDropdown from '~/components/SortDropdown.vue';

const route = useRoute();
const config = useRuntimeConfig();
const searchQuery = computed(() => route.query.q || '');
const sortBy = ref('date'); // Default sorting by date
const loading = ref(true);
const searchResults = ref([]);

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
      method: 'get',
      query: {
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
  if (sortBy.value === 'date') {
    return [...searchResults.value].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } else if (sortBy.value === 'price') {
    return [...searchResults.value].sort((a, b) => {
      const priceA = parseFloat(a.productData?.productPriceReduced ?? a.productData?.productPrice);
      const priceB = parseFloat(b.productData?.productPriceReduced ?? b.productData?.productPrice);
      return priceA - priceB;
    });
  }
  return searchResults.value;
});

// Watch for changes in the search query
watch(searchQuery, (newQuery) => {
  fetchSearchResults(newQuery);
}, { immediate: true });
</script>