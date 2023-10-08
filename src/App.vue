<template>
  <router-view v-slot="{ Component }">
    <transition name="main-fade">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script>
export default {
  name: 'App',
};
</script>

<style>
.main-fade-enter-active, .main-fade-leave-active {
  transition: opacity 0.5s;
}
.main-fade-enter, .main-fade-leave-to {
  opacity: 0;
}
</style>
