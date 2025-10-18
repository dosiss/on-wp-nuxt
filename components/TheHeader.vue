<template>
    <header className="fixed z-10 flex justify-between w-full p-4 h-85px top-0 mx-auto bg-slate-200">
        <!-- Use dynamic link for back navigation -->
        <NuxtLink :to="backLink">
            <!-- Show back arrow on non-frontpage routes -->
            <div v-if="!isHomePage" class="flex items-center">
                <svg class="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 12H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span class="text-2xl">Назад</span>
            </div>
            <!-- Show Каталог on frontpage -->
            <h1 v-else className="text-2xl">Каталог</h1>
        </NuxtLink>
        <div class="flex items-center">
            <!-- Search Icon -->
            <div class="relative mr-6 mt-2">
                <button @click="toggleSearch" class="focus:outline-none">
                    <svg class="w-7 h-auto" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                <!-- Search Input -->
                <div v-if="showSearch" class="absolute right-[calc(100%-68px)] top-full mt-[100px] w-64 bg-white shadow-lg rounded-lg p-2 z-20">
                    <input 
                        v-model="searchQuery" 
                        @keyup.enter="performSearch"
                        type="text" 
                        placeholder="Поиск товаров..." 
                        class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
            
            <!-- Favorites Icon -->
            <NuxtLink href="/favorites" class="relative cursor-pointer mr-6">
                <div v-if="favoritesCount > 0" class="absolute w-6 h-6 rounded-full text-center bg-red-600 text-white -right-4 -top-2">{{ favoritesCount }}</div>
                <svg class="w-7 h-auto" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path 
                        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
                        stroke="currentColor" 
                        stroke-width="2"
                    />
                </svg>
            </NuxtLink>
            
            <!-- Cart Icon -->
            <NuxtLink href="/cart" class="relative cursor-pointer">
                <div class="absolute w-6 h-6 rounded-full text-center bg-red-600 text-white -right-4 -top-2">{{data.countCartItems}}</div>
                <svg class="w-8 h-auto" viewBox="0 0 483.1 483.1">
                    <path d="M434.55,418.7l-27.8-313.3c-0.5-6.2-5.7-10.9-12-10.9h-58.6c-0.1-52.1-42.5-94.5-94.6-94.5s-94.5,42.4-94.6,94.5h-58.6 c-6.2,0-11.4,4.7-12,10.9l-27.8,313.3c0,0.4,0,0.7,0,1.1c0,34.9,32.1,63.3,71.5,63.3h243c39.4,0,71.5-28.4,71.5-63.3 C434.55,419.4,434.55,419.1,434.55,418.7z M241.55,24c38.9,0,70.5,31.6,70.6,70.5h-141.2C171.05,55.6,202.65,24,241.55,24z M363.05,459h-243c-26,0-47.2-17.3-47.5-38.8l26.8-301.7h47.6v42.1c0,6.6,5.4,12,12,12s12-5.4,12-12v-42.1h141.2v42.1 c0,6.6,5.4,12,12,12s12-5.4,12-12v-42.1h47.6l26.8,301.8C410.25,441.7,389.05,459,363.05,459z"/>
                </svg>
            </NuxtLink>
        </div>
    </header>
</template>
<script setup>
    import { useCartStore } from '../store/cart'
    import { useFavoritesStore } from '../store/favorites'
    import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
    import { useRouter, useRoute } from 'vue-router'
    
    //get stores
    const data = useCartStore();
    const favoritesStore = useFavoritesStore();
    const router = useRouter();
    const route = useRoute();
    
    // Get favorites count
    const favoritesCount = computed(() => {
        return favoritesStore.favoritesCount;
    });
    
    // Check if current route is homepage
    const isHomePage = computed(() => {
        return route.path === '/' || route.path === '';
    });
 
    // Compute the back link based on referrer or default to homepage
    const backLink = computed(() => {
        if (process.client) {
            const referrer = sessionStorage.getItem('referrer');
            const fromFrontpage = sessionStorage.getItem('fromFrontpage');
            const selectedBrand = sessionStorage.getItem('selectedBrand');
            
            console.log('Current referrer in sessionStorage:', referrer);
            console.log('Current route path:', route.path);
            
            if(isHomePage.value) {
                return '/';
            }
            
            if (fromFrontpage === 'true') {
                return '/';
            }
            
            // Check for brand in sessionStorage first
            if (selectedBrand) {
                console.log('Brand selected from dropdown:', selectedBrand);
                return `/?brand=${selectedBrand}`;
            }
            
            // Then check current URL
            if (route.fullPath.includes('?brand=') || route.fullPath.includes('&brand=')) {
                console.log('Current URL has brand parameter:', route.fullPath);
                return route.fullPath;
            }
            
            if (referrer && route.path.startsWith('/')) {
                // Don't remove referrer until user actually navigates
                // sessionStorage.removeItem('referrer');
                
                if (referrer.includes('/search') && !route.path.startsWith('/search')) {
                    return referrer;
                }
                
                if (referrer.includes('/categories/') && !route.path.startsWith('/categories/')) {
                    return referrer;
                }
            }
        }
        
        return '/';
    });
    
    // Search functionality
    const showSearch = ref(false);
    const searchQuery = ref('');
    
    const toggleSearch = () => {
        showSearch.value = !showSearch.value;
    }
    
    const performSearch = () => {
        if (searchQuery.value.trim()) {
            // Save scroll position before navigating away from homepage
            if (isHomePage.value) {
                saveScrollPosition();
            }
            router.push(`/search?q=${encodeURIComponent(searchQuery.value.trim())}`);
            showSearch.value = false;
            searchQuery.value = '';
        }
    }
    
    // Function to save scroll position
    const saveScrollPosition = () => {
        if (process.client) {
            const scrollPosition = window.scrollY || window.pageYOffset;
            console.log('Saving homepage scroll position:', scrollPosition);
            sessionStorage.setItem('lastScrollPosition', scrollPosition.toString());
        }
    }
    
    // Add navigation guards to save scroll position when leaving homepage
    onMounted(() => {
        if (isHomePage.value) {
            // Add event listeners to all product links to save scroll position
            const productLinks = document.querySelectorAll('a[href^="/"]');
            productLinks.forEach(link => {
                link.addEventListener('click', saveScrollPosition);
            });
            
            // Also add a router beforeEach guard
            const unregisterHook = router.beforeEach((to, from, next) => {
                if (from.path === '/' && to.path !== '/') {
                    saveScrollPosition();
                }
                next();
            });
            
            // Clean up the hook when component is unmounted
            onBeforeUnmount(() => {
                unregisterHook();
                productLinks.forEach(link => {
                    link.removeEventListener('click', saveScrollPosition);
                });
            });
        }
    });
</script>