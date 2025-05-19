<script setup>
import CategoriesDropdown from '~/components/CategoriesDropdown.vue';
import SortDropdown from '~/components/SortDropdown.vue';
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

const config = useRuntimeConfig();
const sortBy = ref('date'); // Default sorting by date
const loading = ref(false);
const allPosts = ref([]);
const currentPage = ref(1);
const postsPerPage = 20;
const hasMorePosts = ref(true);
const endCursor = ref(''); // Store the cursor for pagination

const debug = ref({
  initialDataLoaded: false,
  morePostsLoaded: false,
  error: null
});

// Initial data fetch with cursor-based pagination
const { data, pending, error } = await useFetch(config.public.wordpressUrl, {
  method: 'get',
  query: {
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
        
        // Store the end cursor for pagination
        if (data?.data?.posts?.pageInfo?.endCursor) {
          endCursor.value = data.data.posts.pageInfo.endCursor;
          hasMorePosts.value = data.data.posts.pageInfo.hasNextPage;
          console.log('End cursor:', endCursor.value, 'Has next page:', hasMorePosts.value);
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
  if (loading.value || !hasMorePosts.value || !endCursor.value) return;
  
  loading.value = true;
  console.log('Loading more posts, page:', currentPage.value + 1, 'with cursor:', endCursor.value);
  
  try {
    // Use cursor-based pagination
    const { data: moreData } = await useFetch(config.public.wordpressUrl, {
      method: 'get',
      query: {
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
      key: `more-posts-${currentPage.value + 1}` // Unique key for each request
    });
    
    console.log('More data received:', moreData.value);
    
    if (moreData.value?.data?.posts?.nodes) {
      const newPosts = moreData.value.data.posts.nodes;
      console.log('New posts loaded:', newPosts.length);
      
      if (newPosts.length > 0) {
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
  }
};

// Handle scroll event for infinite scrolling - improved for mobile
const handleScroll = () => {
  // Get viewport height and scroll position
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const scrollY = window.scrollY || window.pageYOffset;
  const documentHeight = document.documentElement.scrollHeight;
  
  // Calculate distance from bottom (more reliable for mobile)
  const distanceFromBottom = documentHeight - (scrollY + windowHeight);
  
  // Load more when user is 200px from the bottom
  if (distanceFromBottom < 200 && !loading.value && hasMorePosts.value) {
    console.log('Scroll trigger activated, distance from bottom:', distanceFromBottom);
    loadMorePosts();
  }
};

// Set up scroll listener with both scroll and touch events for mobile
onMounted(() => {
  console.log('Component mounted, setting up scroll listeners');
  
  // Add scroll event listener
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  // Add touch events for mobile devices
  window.addEventListener('touchmove', handleScroll, { passive: true });
  window.addEventListener('touchend', () => {
    // Small delay to ensure accurate scroll position after touch
    setTimeout(handleScroll, 100);
  }, { passive: true });
  
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
  
  // Initial check for small content that doesn't fill the viewport
  setTimeout(() => {
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    if (documentHeight <= windowHeight && hasMorePosts.value && !loading.value) {
      console.log('Content doesn\'t fill viewport, loading more posts');
      loadMorePosts();
    }
  }, 500);
});

// Clean up scroll listener
onUnmounted(() => {
  console.log('Component unmounted, removing scroll listeners');
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('touchmove', handleScroll);
  window.removeEventListener('touchend', handleScroll);
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
      
      <!-- Loading indicator for more posts -->
      <div v-if="loading" class="flex justify-center my-8">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
      </div>
      
      <!-- End of results message -->
      <div v-if="!loading && !hasMorePosts && allPosts.length > 0" class="text-center text-gray-500 my-8">
        Все товары загружены
      </div>
    </div>
  </div>
</template>