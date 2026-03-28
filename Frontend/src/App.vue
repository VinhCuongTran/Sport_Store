<template>
  <v-app>
    <router-view></router-view>
  </v-app>
</template>

<script setup></script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap");

:root {
  --bg-primary: #001a2d;
  --text-primary: #ffffff;
  --accent-green: #77e51f;
}

body {
  margin: 0;
  padding: 0;
  font-family:
    "Inter",
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    "Helvetica Neue",
    Arial,
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.v-application {
  font-family:
    "Inter",
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    "Helvetica Neue",
    Arial,
    sans-serif !important;
  background-color: var(--bg-primary) !important;
  color: var(--text-primary) !important;
}

.text-accent-green {
  color: var(--accent-green) !important;
}
</style>
