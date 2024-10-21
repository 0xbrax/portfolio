<template>
    <div class="h-full p-4 flex flex-col justify-center items-center">
        <div class="text-center text-xl mb-4">Oh, no... 404 error !</div>
        <LucideRabbit class="w-36 h-36" />
        <router-link to="/" class="mt-4">
            <button class="btn btn-outline btn-circle">
                <LucideHouse />
            </button>
        </router-link>
    </div>
</template>

<script>
export default {
    name: "NotFound"
}
</script>
