<template>
  <div>
    <NuxtRouteAnnouncer />
    
  </div>
  <NuxtPage />
  <!-- <ClientOnly>
    <MiniApp />
  </ClientOnly> -->
</template>
<script setup lang="ts">
//  import MiniApp from '~/components/MiniApp.vue'
useHead({
  link: [
    { rel: 'canonical', href: 'https://odetnadezhdu.ru' }
  ]
})
</script>
