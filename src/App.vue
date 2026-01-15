<script setup lang="ts">
import AppLayout from '@/components/layout/AppLayout.vue';
import { RouterView } from 'vue-router';
import ReloadPrompt from '@/components/layout/ReloadPrompt.vue';
</script>

<template>
  <AppLayout>
    <RouterView />
    <ReloadPrompt />
  </AppLayout>

</template>

<style scoped>
</style>
