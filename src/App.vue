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
.main-fade-enter-active,
.main-fade-leave-active {
  transition: opacity 1s ease-in-out;

  position: absolute;
  width: 100%;
  height: 100vh;
  top: 0;
  left: 0;
  overflow: hidden;
}

.main-fade-enter-from,
.main-fade-leave-to {
  opacity: 0;
}
.main-fade-enter-to,
.main-fade-leave-from {
  opacity: 1;
}
</style>
