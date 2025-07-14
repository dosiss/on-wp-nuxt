<template>
  <div>
    <TheHeader></TheHeader>
    
    <div class="bg-grey-100 container mx-auto px-4 pt-20">
      <div class="flex justify-between align-center">
        <h1 class="text-2xl font-semibold mb-4">{{ selectedCategory || categoryName }}</h1>
        <SortDropdown v-model="sortBy" :options="sortOptions" class="" />
      </div>
      
      <div v-if="loading && !allPosts.length" class="text-center py-10">
        <p class="text-lg">Загрузка товаров...</p>
      </div>
      
      <div v-else-if="allPosts.length === 0" class="text-center py-10">
        <p class="text-lg">В данной категории нет товаров.</p>
      </div>
      
      <div v-else class="grid gap-4 grid-cols-2 lg:grid-cols-4">
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
</template>

<script setup>
import { useRoute } from 'vue-router';
import { useRuntimeConfig } from '#app';
import { ref, computed, onMounted, nextTick } from 'vue';
import SortDropdown from '~/components/SortDropdown.vue';

const route = useRoute();
const config = useRuntimeConfig();
const slug = route.params.slug;
const sortBy = ref('date'); // Default sorting by date
const loading = ref(true);
const allPosts = ref([]);
const currentPage = ref(1);
const postsPerPage = 20; // Smaller batch size to avoid CORS issues
const hasMorePosts = ref(true);
const endCursor = ref(''); // Store the cursor for pagination
const isLoadingMore = ref(false); // Additional flag to prevent duplicate requests

// Function to save current category path as referrer
const saveReferrer = () => {
  if (process.client) {
    sessionStorage.setItem('referrer', route.fullPath);
    console.log('Saved referrer:', route.fullPath);
  }
};

// Save referrer on page load as well
onMounted(() => {
  if (process.client) {
    // Clear the "from frontpage" flag
    sessionStorage.removeItem('fromFrontpage');
    // Set the referrer
    sessionStorage.setItem('referrer', route.fullPath);
    console.log('Saved category referrer on mount:', route.fullPath);
  }
});

// Initial data fetch with cursor-based pagination
const { data, error } = await useFetch(config.public.wordpressUrl, {
  method: 'post',
  body: {
    query: `
      query AllProductsByCategory($slug: String!) {
        posts(where: { categoryName: $slug }, first: ${postsPerPage}) {
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
      slug: slug
    }
  },
  transform(data) {
    if (!data.data || !data.data.posts || !data.data.posts.nodes) {
      return { categoryName: '', products: [], pageInfo: null };
    }

    // Find the first category with a non-null parent
    const categoryWithParent = data.data.posts.nodes[0]?.categories?.edges.find(
      edge => edge.node.parent !== null
    );
    
    // Store pagination info
    const pageInfo = data.data.posts.pageInfo;
    if (pageInfo?.endCursor) {
      endCursor.value = pageInfo.endCursor;
      hasMorePosts.value = pageInfo.hasNextPage;
      console.log('End cursor set to:', endCursor.value, 'Has next page:', hasMorePosts.value);
    } else {
      hasMorePosts.value = false;
    }

    return {
      categoryName: categoryWithParent?.node.name || '',
      products: data.data.posts.nodes,
      pageInfo: pageInfo
    };
  }
});

// Initialize allPosts from data when it's available
const categoryName = computed(() => data.value?.categoryName || '');

// Set allPosts from initial data
onMounted(() => {
  if (data.value?.products && data.value.products.length > 0) {
    allPosts.value = [...data.value.products];
  }
  loading.value = false;
});

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
          query LoadMoreProductsByCategory($slug: String!) {
            posts(where: { categoryName: $slug }, first: ${postsPerPage}, after: "${endCursor.value}") {
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
          slug: slug
        }
      },
      key: `more-posts-${slug}-${Date.now()}` // Use timestamp for truly unique keys
    });
    
    if (moreData.value?.data?.posts?.nodes) {
      const newPosts = moreData.value.data.posts.nodes;
      console.log('New posts loaded:', newPosts.length);
      
      if (newPosts.length > 0) {
        // Use nextTick to ensure UI updates properly
        await nextTick();
        allPosts.value = [...allPosts.value, ...newPosts];
        currentPage.value++;
        
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
    hasMorePosts.value = false;
  } finally {
    loading.value = false;
    isLoadingMore.value = false;
    
    // Force a re-render
    await nextTick();
  }
};

const sortOptions = [
  { label: 'Сначала новые', value: 'date' },
  { label: 'Сначала дешевле', value: 'price' },
];

const sortedPosts = computed(() => {
  // Check if products exist before trying to spread them
  if (!allPosts.value || !Array.isArray(allPosts.value) || allPosts.value.length === 0) {
    return [];
  }
  
  if (sortBy.value === 'date') {
    return [...allPosts.value].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } else if (sortBy.value === 'price') {
    return [...allPosts.value].sort((a, b) => {
      const priceA = parseFloat(a.productData?.productPriceReduced ?? a.productData?.productPrice);
      const priceB = parseFloat(b.productData?.productPriceReduced ?? b.productData?.productPrice);
      return priceA - priceB;
    });
  }
  return [...allPosts.value]; // Return a copy to avoid mutation issues
});
</script>
  