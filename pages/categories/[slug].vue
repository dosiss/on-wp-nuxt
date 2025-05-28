<template>
    <div>
      <TheHeader></TheHeader>
      
      <div class="bg-grey-100 container mx-auto px-4 pt-20">
        <div class="flex justify-between align-center">
            <h1 class="text-2xl font-semibold mb-4">{{ categoryName }}</h1>
            <SortDropdown v-model="sortBy" :options="sortOptions" class="" />
        </div>
        <div class="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <!-- Add click handler to save category path as referrer -->
          <Post 
            v-for="post in sortedPosts" 
            :key="post.uri" 
            :post="post" 
            @click="saveReferrer"
          />
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { useRoute } from 'vue-router';
  import { useRuntimeConfig } from '#app';
  import { ref, computed, onMounted } from 'vue';
  import SortDropdown from '~/components/SortDropdown.vue';

  
  const route = useRoute();
  const config = useRuntimeConfig();
  const slug = route.params.slug;
  const sortBy = ref('date'); // Default sorting by date

  // Function to save current category path as referrer
  const saveReferrer = () => {
    if (process.client) {
      sessionStorage.setItem('referrer', route.fullPath);
      console.log('Saved referrer:', route.fullPath);
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
      console.log('Saved category referrer on mount:', route.fullPath);
    }
  });
  
  const { data, error } = await useFetch(config.public.wordpressUrl, {
    method: 'get',
    query: {
      query: `
        query AllProductsByCategory($slug: String!) {
        posts(where: { categoryName: $slug }, first: 100) {
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
      return { categoryName: '', products: [] };
    }

    // Find the first category with a non-null parent
    const categoryWithParent = data.data.posts.nodes[0]?.categories?.edges.find(
      edge => edge.node.parent !== null
    );

    return {
      categoryName: categoryWithParent?.node.name || '',
      products: data.data.posts.nodes
    };
  }
  });
  
  const categoryName = computed(() => data.value?.categoryName || '');
  const products = computed(() => data.value?.products || []);

  const sortOptions = [
  { label: 'Сначала новые', value: 'date' },
  { label: 'Сначала дешевле', value: 'price' },
];

const sortedPosts = computed(() => {
  // Check if products exist before trying to spread them
  if (!data.value?.products || !Array.isArray(data.value.products)) {
    return [];
  }
  
  if (sortBy.value === 'date') {
    return [...data.value.products].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } else if (sortBy.value === 'price') {
    return [...data.value.products].sort((a, b) => {
      const priceA = parseFloat(a.productData.productPriceReduced ?? a.productData.productPrice);
      const priceB = parseFloat(b.productData.productPriceReduced ?? b.productData.productPrice);
      return priceA - priceB;
    });
  }
  return data.value.products;
});
  </script>
  