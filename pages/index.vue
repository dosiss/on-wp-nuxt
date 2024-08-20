<script setup lang="ts">
import CategoriesDropdown from '~/components/CategoriesDropdown.vue';
import SortDropdown from '~/components/SortDropdown.vue';
import { ref, computed } from 'vue';

const config = useRuntimeConfig();
const sortBy = ref('date'); // Default sorting by date

const { data } = await useFetch(config.public.wordpressUrl, {
  method: 'get',
  query: {
    query: `
      query NewQuery {
        posts (first:100) {
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
        categories (first:50) {
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
    return {
      posts: data.data.posts.nodes,
      categories: data.data.categories.nodes,
    };
  }
});

const sortOptions = [
  { label: 'Сначала новые', value: 'date' },
  { label: 'Сначала дешевле', value: 'price' },
];

const sortedPosts = computed(() => {
  if (sortBy.value === 'date') {
    return [...data.value.posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } else if (sortBy.value === 'price') {
    return [...data.value.posts].sort((a, b) => {
      const priceA = parseFloat(a.productData.productPriceReduced ?? a.productData.productPrice);
      const priceB = parseFloat(b.productData.productPriceReduced ?? b.productData.productPrice);
      return priceA - priceB;
    });
  }
  return data.value.posts;
});

const parentCategories = computed(() => {
  return data.value.categories.filter(category => !category.parent);
});

const childCategories = computed(() => {
  return data.value.categories.filter(category => category.parent);
});


</script>

<template>
  <div>
    <TheHeader></TheHeader>
    <div class="bg-grey-100 px-4 pt-20">
      <div class="flex justify-between align-center">
        <CategoriesDropdown :parentCategories="parentCategories" :childCategories="childCategories" />
        <SortDropdown v-model="sortBy" :options="sortOptions" class="" />
      </div>
    </div>
    <div class="grid gap-4 grid-cols-2 lg:grid-cols-4 p-4">
      <Post v-for="post in sortedPosts" :key="post.uri" :post="post"></Post>
    </div>
  </div>
</template>