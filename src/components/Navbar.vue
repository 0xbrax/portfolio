<template>
    <div id="navbar" class="navbar absolute left-0 top-0 z-20 p-4">
            <div class="navbar-start relative">
                <transition name="fade">
                    <span v-show="!isMenuVisible" class="text-xl font-bold text-secondary">LOGO</span>
                </transition>
            </div>

        <div class="navbar-end">
            <label class="btn btn-outline btn-circle swap swap-rotate">
                <input @change="($event) => isMenuVisible = $event.target.checked" type="checkbox" />

                <svg
                    class="swap-off fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 512 512"
                >
                    <path d="M64,384H448V341.33H64Zm0-106.67H448V234.67H64ZM64,128v42.67H448V128Z" />
                </svg>
                <svg
                    class="swap-on fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 512 512"
                >
                    <polygon points="400 145.49 366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49" />
                </svg>
            </label>
        </div>
    </div>
</template>

<script>
import { inject } from "vue";

export default {
    name: "Navbar",
    setup() {
        const isMenuVisible = inject('isMenuVisible');

        return {
            isMenuVisible
        }
    }
}
</script>
