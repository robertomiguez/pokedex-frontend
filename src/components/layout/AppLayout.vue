<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const isOffline = ref(!navigator.onLine);

const updateOnlineStatus = () => {
  isOffline.value = !navigator.onLine;
};

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
});

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus);
  window.removeEventListener('offline', updateOnlineStatus);
});
</script>

<template>
  <div class="app-layout">
    <header class="app-header">
      <div class="container header-content">
        <router-link to="/" class="brand">
          <span class="pokeball-icon">🔴</span>
          <h2>Pokedex<span class="highlight">Pro</span></h2>
        </router-link>
        
        <nav class="main-nav">
          <router-link to="/" class="nav-link" active-class="active">Pokémon</router-link>
          <router-link to="/pokedex" class="nav-link" active-class="active">Pokedex</router-link>
        </nav>
      </div>
    </header>

    <div v-if="isOffline" class="offline-banner">
      You are currently offline. Using cached data.
    </div>

    <main class="main-content container">
      <slot></slot>
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  background-color: #f5f7fa;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.offline-banner {
  background-color: #ff9800;
  color: white;
  text-align: center;
  padding: 0.5rem;
  font-weight: bold;
}

.app-header {
  background-color: #ff3e3e;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 0.5rem 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: white;
  gap: 0.5rem;
}

.pokeball-icon {
  font-size: 1rem;
}

h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.highlight {
  color: #ffcb05; /* Pokemon Yellow */
  text-shadow: 1px 1px 0 #3b5ca8; /* Pokemon Blue */
}

.main-nav {
  display: flex;
}

.nav-link {
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  padding: 0.5rem 0.8rem;
  border-radius: 20px;
  transition: all 0.2s ease;
}

.nav-link:hover {
  color: white;
  background-color: rgba(255, 255, 255, 0.15);
}

.nav-link.active {
  color: #3b5ca8;
  background-color: white;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.main-content {
  padding-top: 2rem;
  padding-bottom: 3rem;
}
</style>
