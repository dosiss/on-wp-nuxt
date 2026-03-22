<template>
  <div>
    <TheHeader></TheHeader>
    
    <div class="bg-grey-100 flex">
      <!-- Left Sidebar for Child Categories (>= 850px) -->
      <div v-if="showLargeScreenLayout && childCategories.length > 0" class="w-1/5 bg-white p-4 pt-[140px] min-h-screen">
        <ul>
          <li v-for="childCat in childCategories" :key="childCat.slug" class="mb-2">
            <a 
              href="#" 
              @click.prevent="handleChildCategoryClick(childCat.slug)" 
              :class="{ 'font-bold text-primary': selectedChildCategory === childCat.slug || (!selectedChildCategory && childCat.slug === slug) }"
              class="hover:text-primary"
            >
              {{ childCat.name }}
            </a>
          </li>
          <li class="mb-2">
            <a 
              href="#" 
              @click.prevent="handleChildCategoryClick(null)" 
              :class="{ 'font-bold text-primary': !selectedChildCategory }"
              class="hover:text-primary"
            >
              Всё из категории {{ parentCategoryName }}
            </a>
          </li>
        </ul>
      </div>

      <div :class="{'w-4/5': showLargeScreenLayout && childCategories.length > 0, 'w-full': !showLargeScreenLayout || childCategories.length === 0}" class="flex-grow container mx-auto px-4 pt-20">
        <div class="flex justify-between align-center">
          <h1 class="text-2xl font-semibold mb-4">{{ displayCategoryName }}</h1>
          <SortDropdown v-model="sortBy" :options="sortOptions" class="" />
        </div>
        
        <div v-if="postsDisplayState === 'loading'" class="text-center py-10">
          <p class="text-lg">Загрузка товаров...</p>
        </div>
        
        <div v-else-if="postsDisplayState === 'noPosts'" class="text-center py-10">
          <p class="text-lg">В данной категории нет товаров.</p>
        </div>
        
        <div v-else-if="postsDisplayState === 'hasPosts'" class="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <!-- Add click handler to save category path as referrer -->
          <Post 
            v-for="post in sortedPosts" 
            :key="post.uri" 
            :post="post" 
            @click="saveReferrer"
          />
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
          
          <!-- Loading indicator -->
          <div v-if="loading && allPosts.length > 0" class="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
        </div>
        
        <!-- End of results message -->
        <div v-if="!loading && !hasMorePosts && allPosts.length > 0" class="text-center text-gray-500 my-8">
          Все товары загружены
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { useRuntimeConfig } from '#app';
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'; // Ensure 'watch' is imported

const windowWidth = ref(0);
const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth;
};

// --- Reactive State ---
const route = useRoute();
const config = useRuntimeConfig();
const slug = route.params.slug;
const sortBy = ref('date'); // Default sorting by date
const loading = computed(() => initialPostsPending.value || isLoadingMore.value);
const allPosts = ref([]); // Now updated by initial fetch and loadMore
const currentPage = ref(1);
const postsPerPage = 20; // Smaller batch size to avoid CORS issues
const hasMorePosts = ref(true);
const endCursor = ref(''); // Store the cursor for pagination
const isLoadingMore = ref(false); // Additional flag to prevent duplicate requests
const selectedChildCategory = ref(null); // Track selected child category
const isClient = ref(false); // Track if component is mounted on client-side


// --- Computed Properties ---

// Fetch all categories data first, as other computed properties and functions depend on it
const { data: allCategoriesData } = await useFetch(config.public.wordpressUrl, {
  method: 'post',
  body: {
    query: `
      query AllCategories {
        categories(first: 100) {
          nodes {
            name
            slug
            databaseId
            parentId
            parent {
              node {
                slug
              }
            }
          }
        }
      }
    `
  },
  transform: (data) => {
    console.log('allCategoriesData.value in transform:', data?.data?.categories?.nodes);
    return data?.data?.categories?.nodes || [];
  }
});

const childCategories = computed(() => {
  if (!allCategoriesData.value) return [];
  const currentCategory = allCategoriesData.value.find(cat => cat.slug === slug);
  if (!currentCategory) return [];

  return allCategoriesData.value.filter(cat => cat.parent?.node?.slug === currentCategory.slug);
});
console.log('childCategories computed:', childCategories.value); // Log childCategories here

const showLargeScreenLayout = computed(() => isClient.value && windowWidth.value >= 850);

const displayCategoryName = computed(() => {
  if (selectedChildCategory.value) {
    const childCat = allCategoriesData.value?.find(cat => cat.slug === selectedChildCategory.value);
    return childCat?.name || selectedChildCategory.value;
  }
  const mainCat = allCategoriesData.value?.find(cat => cat.slug === slug);
  return mainCat?.name || slug;
});

const sortedPosts = computed(() => {
  return allPosts.value;
});

const parentCategoryName = computed(() => {
  const mainCat = allCategoriesData.value?.find(cat => cat.slug === slug);
  return mainCat?.parent?.node?.name || mainCat?.name || slug;
});

useHead({
  title: computed(() => `${displayCategoryName.value} - магазинОдеть Надежду`),
  meta: [
    { name: 'description', content: computed(() => `Просмотрите товары в категории ${displayCategoryName.value} в магазине Одеть Надежду.`) },
    { property: 'og:title', content: computed(() => `${displayCategoryName.value} - Одеть Надежду`) },
    { property: 'og:image', content: '/on_site-logo.avif' }
  ]
})

const postsDisplayState = computed(() => {
  if (allPosts.value && allPosts.value.length > 0) {
    return 'hasPosts';
  }
  if (loading.value) {
    return 'loading';
  }
  return 'noPosts';
});


// --- Functions ---

// Helper function to fetch posts (used by useAsyncData and subsequent loads)
const _fetchPosts = async (currentSlug, childCatSlug, afterCursor = null) => {
  let categoriesToQuery = [];
  if (childCatSlug) {
    const selectedChildCat = allCategoriesData.value?.find(cat => cat.slug === childCatSlug);
    if (selectedChildCat && selectedChildCat.databaseId) {
      categoriesToQuery.push(selectedChildCat.databaseId);
    }
  } else {
    const mainCat = allCategoriesData.value?.find(cat => cat.slug === currentSlug);
    if (mainCat && mainCat.databaseId) {
      categoriesToQuery.push(mainCat.databaseId);
    }
    if (childCategories.value) {
      childCategories.value.forEach(childCat => {
        if (childCat.databaseId) {
          categoriesToQuery.push(childCat.databaseId);
        }
      });
    }
  }
  console.log('_fetchPosts: categoriesToQuery', categoriesToQuery);

  try {
    const response = await $fetch(config.public.wordpressUrl, {
      method: 'post',
      body: {
        query: `
          query FilteredProducts($categorySlugs: [ID]!, $first: Int!, $after: String) {
            posts(where: { categoryIn: $categorySlugs }, first: $first, after: $after) {
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
                          slug
                        }
                      }
                    }
                  }
                }
                productData {
                  __typename
                  productDescription
                  productSize
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
        `,
        variables: {
          categorySlugs: categoriesToQuery,
          first: postsPerPage,
          after: afterCursor
        }
      }
    });

    console.log('_fetchPosts: response data', response.data);
    
    return {
      posts: response.data?.posts?.nodes || [],
      pageInfo: response.data?.posts?.pageInfo || null
    };
  } catch (error) {
    console.error('Error fetching posts with $fetch:', error);
    return { posts: [], pageInfo: null };
  }
};

const saveReferrer = () => {
  if (process.client) {
    sessionStorage.setItem('referrer', route.fullPath);
    console.log('Saved referrer:', route.fullPath);
  }
};

const handleChildCategoryClick = (childCatSlug) => {
  selectedChildCategory.value = childCatSlug;
  // Update URL with child-cat parameter
  if (process.client) {
    const url = new URL(window.location.href);
    if (childCatSlug) {
      url.searchParams.set('child-cat', childCatSlug);
    } else {
      url.searchParams.delete('child-cat');
    }
    window.history.pushState({}, '', url);
  }
};

const loadMorePosts = async () => {
  if (loading.value || isLoadingMore.value || !hasMorePosts.value || !endCursor.value) {
    return;
  }
  isLoadingMore.value = true;
  const result = await _fetchPosts(slug, selectedChildCategory.value, endCursor.value);
  allPosts.value = [...allPosts.value, ...result.posts];
  endCursor.value = result.pageInfo?.endCursor || '';
  hasMorePosts.value = result.pageInfo?.hasNextPage || false;
  isLoadingMore.value = false;
};

const sortOptions = [
  { label: 'Сначала новые', value: 'date' },
  { label: 'Сначала дешевле', value: 'price' },
];

// --- useAsyncData for Initial Fetch (SSR safe) ---
const { data: initialPostsData, pending: initialPostsPending } = await useAsyncData(
  'initialPosts',
  async () => {
    // This initial fetch happens on server, so childCategories computed property is ready.
    // selectedChildCategory might be set from URL on client init.
    return await _fetchPosts(slug, selectedChildCategory.value);
  },
  {
    watch: [() => route.params.slug, selectedChildCategory, allCategoriesData], // Re-run if these change
    lazy: false, // Ensure data is fetched immediately
    server: true, // Run on server
  }
);


// --- Lifecycle Hooks and Watchers ---

// Initialize allPosts and pagination from initialPostsData
watch(initialPostsData, (newData) => {
  if (newData?.posts) {
    allPosts.value = newData.posts;
    endCursor.value = newData.pageInfo?.endCursor || '';
    hasMorePosts.value = newData.pageInfo?.hasNextPage || false;
  } else {
    allPosts.value = [];
    endCursor.value = '';
    hasMorePosts.value = false;
  }
  // No explicit assignment needed as 'loading' is a computed property
}, { immediate: true });


onMounted(() => {
  if (process.client) {
    isClient.value = true; // Set isClient to true
    updateWindowWidth();
    window.addEventListener('resize', updateWindowWidth);

    sessionStorage.removeItem('fromFrontpage');
    sessionStorage.setItem('referrer', route.fullPath);
    console.log('Saved category referrer on mount:', route.fullPath);

    const urlParams = new URLSearchParams(window.location.search);
    const childCatParam = urlParams.get('child-cat');
    if (childCatParam) {
      selectedChildCategory.value = childCatParam;
    }
  }
});

onBeforeUnmount(() => {
  if (process.client) {
    window.removeEventListener('resize', updateWindowWidth);
  }
});

// Watch for allCategoriesData to be available before fetching posts
// This watch is now for *re-fetching* after initial setup, not initial fetch
watch(allCategoriesData, (newData) => {
  if (newData && newData.length > 0 && isClient.value) {
    // Logic here is already covered by useAsyncData's watch on allCategoriesData
    // and subsequent selectedChildCategory watch.
  }
}, { immediate: true });


// Watch for selectedChildCategory changes to refetch posts
watch(selectedChildCategory, async (newChildCategory) => {
  // Reset pagination when child category changes
  currentPage.value = 1;
  allPosts.value = [];
  endCursor.value = '';
  hasMorePosts.value = true;
  
  const result = await _fetchPosts(slug, newChildCategory);
  allPosts.value = result.posts;
  endCursor.value = result.pageInfo?.endCursor || '';
  hasMorePosts.value = result.pageInfo?.hasNextPage || false;
});

</script>