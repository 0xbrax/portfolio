<template>
  <router-view v-slot="{ Component }">
    <transition name="main-fade">
      <component :is="Component" />
    </transition>
  </router-view>

  <!-- TODO => SPOSTA QUA IL LOADER OPPURE NEL TRANSITION PER EFFETTO ALL ENTER NON AL LOAD PAGE -->
</template>

<script>
export default {
  name: 'App',
};
</script>

<style>
/*.main-fade-enter-from,
.main-fade-leave-from {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
}
.main-fade-enter-from {
  z-index: 2;
}
.main-fade-leave-from {
  z-index: 1;
}*/
.main-fade-enter-active, 
.main-fade-leave-active {
  transition: opacity 5.5s;
}
.main-fade-enter-from,
.main-fade-leave-to {
  opacity: 0;
}
/*.main-fade-enter-to,
.main-fade-leave-from {
  opacity: 1;
}*/
</style>
