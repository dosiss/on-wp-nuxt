<template>
  <div>
    <TheHeader></TheHeader>
    <div class="bg-grey-100 container mx-auto px-4 pt-20">
      <div class="flex justify-between align-center">
        <h1 class="text-2xl font-semibold mb-4">Результаты поиска: "{{ searchQuery }}"</h1>
        <SortDropdown v-model="sortBy" :options="sortOptions" class="" />
      </div>
      
      <div v-if="loading && !searchResults.length" class="text-center py-10">
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
        Показано результатов: {{ searchResults.length }}
      </div>
      
      <!-- Load More Button -->
      <div class="flex justify-center my-8">
        <button 
          v-if="hasMorePosts && !loading && endCursor" 
          @click="loadMoreResults" 
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Загрузить еще
        </button>
        
        <!-- Loading indicator -->
        <div v-if="loading && searchResults.length > 0" class="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
      </div>
      
      <!-- End of results message -->
      <div v-if="!loading && !hasMorePosts && searchResults.length > 0" class="text-center text-gray-500 my-8">
        Все результаты загружены
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { useRuntimeConfig } from '#app';
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import SortDropdown from '~/components/SortDropdown.vue';

const route = useRoute();
const config = useRuntimeConfig();
const searchQuery = computed(() => route.query.q || '');

useHead({
  title: computed(() => `Поиск: ${searchQuery.value} - Одеть Надежду`),
  meta: [
    { name: 'description', content: computed(() => `Результаты поиска товаров по запросу: ${searchQuery.value}`) },
    { property: 'og:title', content: computed(() => `Поиск: ${searchQuery.value} - Одеть Надежду`) },
    { property: 'og:image', content: '/on_site-logo.avif' }
  ]
})

const sortBy = ref('date'); // Default sorting by date
const loading = ref(false);
const searchResults = ref([]);
const currentPage = ref(1);
const postsPerPage = 20; // Smaller batch size to avoid CORS issues
const hasMorePosts = ref(true);
const endCursor = ref(''); // Store the cursor for pagination
const isLoadingMore = ref(false); // Additional flag to prevent duplicate requests

// Function to save current search path as referrer
const saveReferrer = () => {
  if (process.client) {
    // Clear any existing referrer first
    sessionStorage.removeItem('referrer');
    // Then save the current search path
    sessionStorage.setItem('referrer', route.fullPath);
    console.log('Saved and cleared search referrer:', route.fullPath);
  }
};

// Save referrer on page load as well
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

// Function to fetch search results with pagination
const fetchSearchResults = async (query, page = 1) => {
  if (!query) {
    searchResults.value = [];
    loading.value = false;
    hasMorePosts.value = false;
    return;
  }
  
  loading.value = true;
  
  try {
    // Use cursor-based pagination
    const cursor = page === 1 ? null : endCursor.value;
    const cursorParam = cursor ? `, after: "${cursor}"` : '';
    
    const { data } = await useFetch(config.public.wordpressUrl, {
      method: 'post',
      body: {
        query: `
          query SearchProducts($searchTerm: String!) {
            posts(where: {search: $searchTerm}, first: ${postsPerPage}${cursorParam}) {
              pageInfo {
                endCursor
                hasNextPage
              }
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
      },
      key: `search-${query}-page-${page}-${Date.now()}` // Use timestamp for truly unique keys
    });
    
    const posts = data.value?.data?.posts?.nodes || [];
    const pageInfo = data.value?.data?.posts?.pageInfo;
    
    console.log('Search results count:', posts.length);
    
    if (page === 1) {
      searchResults.value = posts;
    } else {
      // Use nextTick to ensure UI updates properly
      await nextTick();
      searchResults.value = [...searchResults.value, ...posts];
    }
    
    // Update pagination info
    if (pageInfo?.endCursor) {
      endCursor.value = pageInfo.endCursor;
      hasMorePosts.value = pageInfo.hasNextPage;
      console.log('End cursor set to:', endCursor.value, 'Has next page:', hasMorePosts.value);
    } else {
      hasMorePosts.value = false;
      console.log('No more results available');
    }
    
    // Update current page
    if (posts.length > 0) {
      currentPage.value = page;
    }
  } catch (error) {
    console.error('Error fetching search results:', error);
    searchResults.value = [];
    hasMorePosts.value = false;
  } finally {
    loading.value = false;
    isLoadingMore.value = false;
  }
};

// Function to load more search results
const loadMoreResults = async () => {
  if (loading.value || isLoadingMore.value || !hasMorePosts.value || !endCursor.value) {
    console.log('Skipping loadMoreResults:', { 
      loading: loading.value,
      isLoadingMore: isLoadingMore.value,
      hasMorePosts: hasMorePosts.value, 
      endCursor: endCursor.value 
    });
    return;
  }
  
  isLoadingMore.value = true;
  await fetchSearchResults(searchQuery.value, currentPage.value + 1);
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
  // Reset pagination when search query changes
  currentPage.value = 1;
  endCursor.value = '';
  hasMorePosts.value = true;
  searchResults.value = [];
  
  fetchSearchResults(newQuery);
}, { immediate: true });
</script>