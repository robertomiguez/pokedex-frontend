<script setup lang="ts">
</script>

<template>
  <div class="app-layout">
    <header class="app-header">
      <div class="header-content">
        <h1 class="logo">Pokédex</h1>
        <nav class="nav">
          <a href="/" class="nav-link">All Pokémon</a>
          <a href="/pokedex" class="nav-link">My Pokédex</a>
        </nav>
      </div>
    </header>
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.nav {
  display: flex;
  gap: 1.5rem;
}

.nav-link {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.nav-link:hover {
  color: white;
}

.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}
</style>
