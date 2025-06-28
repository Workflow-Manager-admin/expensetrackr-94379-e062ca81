<template>
  <v-app>
    <v-app-bar color="primary" flat elevate-on-scroll>
      <v-app-bar-title>
        <v-icon start class="mr-2">mdi-cash-multiple</v-icon>
        ExpenseTrackr
      </v-app-bar-title>
      <v-spacer></v-spacer>
      <RouterLink class="mx-2" to="/" style="text-decoration: none;">
        <v-btn variant="text" color="white">Home</v-btn>
      </RouterLink>
      <RouterLink class="mx-2" to="/about" style="text-decoration: none;">
        <v-btn variant="text" color="white">About</v-btn>
      </RouterLink>
    </v-app-bar>
    <v-main class="pa-2 pa-md-6 bg-background">
      <RouterView />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useTheme } from 'vuetify'
import { onMounted } from 'vue';

const theme = useTheme();
onMounted(() => {
  theme.global.name.value = 'light'
})
</script>

<style>
html,
body,
#app {
  height: 100%;
}

.bg-background {
  background-color: #f8fafc !important;
  min-height: 100vh;
}

.v-application {
  background-color: #f8fafc !important;
}
</style>
