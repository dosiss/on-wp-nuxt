<script setup>
import CategoriesDropdown from '~/components/CategoriesDropdown.vue';
import SortDropdown from '~/components/SortDropdown.vue';
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';

const config = useRuntimeConfig();
const sortBy = ref('date'); // Default sorting by date
const loading = ref(false);
const allPosts = ref([]);
const currentPage = ref(1);
const postsPerPage = 50;
const hasMorePosts = ref(true);
const endCursor = ref(''); // Store the cursor for pagination
const isLoadingMore = ref(false); // Additional flag to prevent duplicate requests

const debug = ref({
  initialDataLoaded: false,
  morePostsLoaded: false,
  error: null
});

// Initial data fetch with cursor-based pagination
const { data, pending, error } = await useFetch(config.public.wordpressUrl, {
  method: 'post',
  body: {
    query: `
      query NewQuery {
        posts (first:${postsPerPage}) {
          pageInfo {
            endCursor
            hasNextPage
          }
          nodes {
            title
            date
            uri
            categories {
              edges {
                node {
                  name
                  slug
                  parent {
                    node {
                      name
                      slug
                    }
                  }
                }
              }
            }
            productData {
              __typename
              productDescription
              productPrice
              productPriceReduced
              productGallery {
                edges {
                  node {
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
        categories (first:30) {
          nodes {
            name
            slug
            parent {
              node {
                name
                slug
              }
            }
          }
        }
      }
    `
  },
  transform(data) {
    try {
      console.log('Initial data received:', data);
      
      if (data?.data?.posts?.nodes) {
        debug.value.initialDataLoaded = true;
        console.log('Initial posts loaded:', data.data.posts.nodes.length);
        
        // Store the end cursor for pagination - add more detailed logging
        console.log('PageInfo from response:', data?.data?.posts?.pageInfo);
        
        if (data?.data?.posts?.pageInfo?.endCursor) {
          endCursor.value = data.data.posts.pageInfo.endCursor;
          hasMorePosts.value = data.data.posts.pageInfo.hasNextPage;
          console.log('End cursor set to:', endCursor.value, 'Has next page:', hasMorePosts.value);
        } else {
          console.error('No endCursor found in pageInfo:', data?.data?.posts?.pageInfo);
          debug.value.error = 'No endCursor found in pageInfo';
          
          // Set a default cursor if none is found (this is a workaround)
          endCursor.value = "YXJyYXljb25uZWN0aW9uOjEwNzk="; 
          console.log('Using default cursor as fallback:', endCursor.value);
        }
      } else {
        console.error('No posts found in initial data');
        debug.value.error = 'No posts found in initial data';
      }
      
      return {
        posts: data?.data?.posts?.nodes || [],
        categories: data?.data?.categories?.nodes || [],
      };
    } catch (error) {
      console.error('Error in transform:', error);
      debug.value.error = error.message;
      return { posts: [], categories: [] };
    }
  }
});

// Initialize allPosts from data when it's available
watch(data, (newData) => {
  if (newData?.posts && newData.posts.length > 0) {
    console.log('Setting allPosts from data watch:', newData.posts.length);
    allPosts.value = [...newData.posts];
  }
}, { immediate: true });

// Function to load more posts with cursor-based pagination
const loadMorePosts = async () => {
  if (loading.value || isLoadingMore.value || !hasMorePosts.value || !endCursor.value) {
    console.log('Skipping loadMorePosts:', { 
      loading: loading.value,
      isLoadingMore: isLoadingMore.value,
      hasMorePosts: hasMorePosts.value, 
      endCursor: endCursor.value 
    });
    return;
  }
  
  loading.value = true;
  isLoadingMore.value = true;
  console.log('Loading more posts, page:', currentPage.value + 1, 'with cursor:', endCursor.value);
  
  try {
    // Use cursor-based pagination
    const { data: moreData } = await useFetch(config.public.wordpressUrl, {
      method: 'post',
      body: {
        query: `
          query LoadMorePosts {
            posts (first:${postsPerPage}, after: "${endCursor.value}") {
              pageInfo {
                endCursor
                hasNextPage
              }
              nodes {
                title
                date
                uri
                categories {
                  edges {
                    node {
                      name
                      slug
                      parent {
                        node {
                          name
                          slug
                        }
                      }
                    }
                  }
                }
                productData {
                  __typename
                  productDescription
                  productPrice
                  productPriceReduced
                  productGallery {
                    edges {
                      node {
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
        `
      },
      key: `more-posts-${Date.now()}` // Use timestamp for truly unique keys
    });
    
    console.log('More data received:', moreData.value);
    
    if (moreData.value?.data?.posts?.nodes) {
      const newPosts = moreData.value.data.posts.nodes;
      console.log('New posts loaded:', newPosts.length);
      
      if (newPosts.length > 0) {
        // Use nextTick to ensure UI updates properly
        await nextTick();
        allPosts.value = [...allPosts.value, ...newPosts];
        currentPage.value++;
        debug.value.morePostsLoaded = true;
        
        // Update the end cursor for next pagination
        if (moreData.value?.data?.posts?.pageInfo?.endCursor) {
          endCursor.value = moreData.value.data.posts.pageInfo.endCursor;
          hasMorePosts.value = moreData.value.data.posts.pageInfo.hasNextPage;
          console.log('Updated cursor:', endCursor.value, 'Has next page:', hasMorePosts.value);
        } else {
          hasMorePosts.value = false;
          console.log('No more cursor available');
        }
      } else {
        hasMorePosts.value = false;
        console.log('No more posts available');
      }
    } else {
      console.error('No posts found in additional data');
      hasMorePosts.value = false;
    }
  } catch (error) {
    console.error('Error loading more posts:', error);
    debug.value.error = error.message;
  } finally {
    loading.value = false;
    isLoadingMore.value = false;
    
    // Force a re-render
    await nextTick();
  }
};

// Set up initial data on mount
onMounted(() => {
  console.log('Component mounted');
  
  // Ensure allPosts is populated from data on client-side
  if (data.value?.posts && data.value.posts.length > 0 && allPosts.value.length === 0) {
    console.log('Setting allPosts in onMounted:', data.value.posts.length);
    allPosts.value = [...data.value.posts];
  }
  
  // Check if there's a saved scroll position
  const savedPosition = sessionStorage.getItem('lastScrollPosition');
  if (savedPosition) {
    // Restore the scroll position
    setTimeout(() => {
      const position = parseInt(savedPosition);
      window.scrollTo({
        top: position,
        behavior: 'auto'
      });
      // Clear the saved position after restoring
      sessionStorage.removeItem('lastScrollPosition');
    }, 500); // Small delay to ensure the page has rendered
  }
});

// Clean up scroll listener
onUnmounted(() => {
  console.log('Component unmounted');
});

// Save scroll position when clicking on a product
const saveScrollPosition = () => {
  sessionStorage.setItem('lastScrollPosition', window.scrollY.toString());
};

const sortOptions = [
  { label: 'Сначала новые', value: 'date' },
  { label: 'Сначала дешевле', value: 'price' },
];

const sortedPosts = computed(() => {
  console.log('Computing sorted posts, count:', allPosts.value.length);
  
  if (!allPosts.value || allPosts.value.length === 0) {
    // Fallback to data.value.posts if allPosts is empty
    if (data.value?.posts && data.value.posts.length > 0) {
      console.log('Using fallback posts from data:', data.value.posts.length);
      return sortPostsByCurrentCriteria([...data.value.posts]);
    }
    console.log('No posts to sort');
    return [];
  }
  
  return sortPostsByCurrentCriteria([...allPosts.value]);
});

// Helper function to sort posts by the current criteria
function sortPostsByCurrentCriteria(postsToSort) {
  if (sortBy.value === 'date') {
    return postsToSort.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } else if (sortBy.value === 'price') {
    return postsToSort.sort((a, b) => {
      const priceA = parseFloat(a.productData?.productPriceReduced ?? a.productData?.productPrice);
      const priceB = parseFloat(b.productData?.productPriceReduced ?? b.productData?.productPrice);
      return priceA - priceB;
    });
  }
  return postsToSort;
}

const parentCategories = computed(() => {
  return data.value?.categories?.filter(category => !category.parent) || [];
});

const childCategories = computed(() => {
  return data.value?.categories?.filter(category => category.parent) || [];
});
</script>

<template>
  <div class="bg-grey-100">
    <TheHeader></TheHeader>
    <div class="px-4 pt-20">
      <div class="flex justify-between align-center">
        <CategoriesDropdown :parentCategories="parentCategories" :childCategories="childCategories" />
        <SortDropdown v-model="sortBy" :options="sortOptions" class="" />
      </div>
      
      <!-- Debug info (remove in production) -->
      <div v-if="debug.error" class="bg-red-100 p-4 my-4 rounded">
        <p class="text-red-700">Error: {{ debug.error }}</p>
      </div>
      
      <!-- Loading state -->
      <div v-if="pending && !data?.posts?.length" class="flex justify-center items-center py-20">
        <p class="text-xl">Loading products...</p>
      </div>
      
      <!-- Error state -->
      <div v-else-if="error" class="flex justify-center items-center py-20">
        <p class="text-xl text-red-500">Error loading products. Please try again later.</p>
      </div>
      
      <!-- Products grid -->
      <div v-else-if="sortedPosts.length > 0" class="grid gap-4 grid-cols-2 lg:grid-cols-4 p-4">
        <Post 
          v-for="post in sortedPosts" 
          :key="post.uri" 
          :post="post"
          @click="saveScrollPosition"
        ></Post>
      </div>
      
      <!-- Empty state -->
      <div v-else class="flex justify-center items-center py-20">
        <p class="text-xl">No products found</p>
      </div>
      
      <!-- Load More Button -->
      <div class="flex justify-center my-8">
        <button 
          v-if="hasMorePosts && !loading && endCursor" 
          @click="loadMorePosts" 
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Загрузить еще
        </button>

        <div v-if="!loading && hasMorePosts && !endCursor" class="text-center text-gray-500 my-8">
          Выберите категорию вверху страницы чтобы продолжить
        </div>
        
        <!-- Loading indicator -->
        <div v-if="loading" class="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
      </div>
      
      <!-- End of results message -->
      <div v-if="!loading && !hasMorePosts && allPosts.length > 0" class="text-center text-gray-500 my-8">
        Все товары загружены
      </div>
    </div>
  </div>
</template>