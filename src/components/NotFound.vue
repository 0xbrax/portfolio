<template>
    <div id="not-found" class="d-flex wrap justify-ctr align-ctr">
        <div class="w-100 text-ctr">
            404 error, go back home PUSH ROUTER (title: Oh, no...)
        </div>

        <div class="img-container w-100 text-ctr relative">
            <img class="avatar-body relative" src="@/assets/image/cute-villain-crying-edit-noeyes.png" />
            <img class="avatar-eyes" src="@/assets/image/cute-villain-crying-edit-eyes-nobg.png" />

            <div class="left-tear" ref="leftTear"></div>
            <div class="right-tear" ref="rightTear"></div>
            <div class="tears-lake"></div>
        </div>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue';
export default {
    name: 'NotFound',

    setup() {
        const leftTear = ref(null);
        const rightTear = ref(null);

        const TEARS_OPACITY = '0.7';
        const TEARS_PRIMARY_COLOR = '0,138,255';
        const TEARS_SECONDARY_COLOR = '0,211,255';
        const TEARS_ANIM_DURATION = 1300;



        const tearsAnimation = (tearRef) => {
            const animKeyframes = [
                {
                    background: `linear-gradient(180deg, rgba(${TEARS_SECONDARY_COLOR},${TEARS_OPACITY}) 0%, rgba(${TEARS_SECONDARY_COLOR},${TEARS_OPACITY}) 10%, rgba(${TEARS_PRIMARY_COLOR},${TEARS_OPACITY}) 10%, rgba(${TEARS_PRIMARY_COLOR},${TEARS_OPACITY}) 100%)`
                },
                {
                    background: `linear-gradient(180deg, rgba(${TEARS_PRIMARY_COLOR},${TEARS_OPACITY}) 0%, rgba(${TEARS_PRIMARY_COLOR},${TEARS_OPACITY}) 10%, rgba(${TEARS_SECONDARY_COLOR},${TEARS_OPACITY}) 10%, rgba(${TEARS_SECONDARY_COLOR},${TEARS_OPACITY}) 20%, rgba(${TEARS_PRIMARY_COLOR},${TEARS_OPACITY}) 20%, rgba(${TEARS_PRIMARY_COLOR},${TEARS_OPACITY}) 100%)`
                },
                {
                    background: `linear-gradient(180deg, rgba(${TEARS_PRIMARY_COLOR},${TEARS_OPACITY}) 0%, rgba(${TEARS_PRIMARY_COLOR},${TEARS_OPACITY}) 20%, rgba(${TEARS_SECONDARY_COLOR},${TEARS_OPACITY}) 20%, rgba(${TEARS_SECONDARY_COLOR},${TEARS_OPACITY}) 30%, rgba(${TEARS_PRIMARY_COLOR},${TEARS_OPACITY}) 30%, rgba(${TEARS_PRIMARY_COLOR},${TEARS_OPACITY}) 100%)`
                },
                {
                    background: `linear-gradient(180deg, rgba(${TEARS_PRIMARY_COLOR},${TEARS_OPACITY}) 0%, rgba(${TEARS_PRIMARY_COLOR},${TEARS_OPACITY}) 30%, rgba(${TEARS_SECONDARY_COLOR},${TEARS_OPACITY}) 30%, rgba(${TEARS_SECONDARY_COLOR},${TEARS_OPACITY}) 40%, rgba(${TEARS_PRIMARY_COLOR},${TEARS_OPACITY}) 40%, rgba(${TEARS_PRIMARY_COLOR},${TEARS_OPACITY}) 100%)`
                },
                {
                    background: `linear-gradient(180deg, rgba(${TEARS_PRIMARY_COLOR},${TEARS_OPACITY}) 0%, rgba(${TEARS_PRIMARY_COLOR},${TEARS_OPACITY}) 40%, rgba(${TEARS_SECONDARY_COLOR},${TEARS_OPACITY}) 40%, rgba(${TEARS_SECONDARY_COLOR},${TEARS_OPACITY}) 50%, rgba(${TEARS_PRIMARY_COLOR},${TEARS_OPACITY}) 50%, rgba(${TEARS_PRIMARY_COLOR},${TEARS_OPACITY}) 100%)`
                },
                {
                    background: `linear-gradient(180deg, rgba(${TEARS_PRIMARY_COLOR},${TEARS_OPACITY}) 0%, rgba(${TEARS_PRIMARY_COLOR},${TEARS_OPACITY}) 50%, rgba(${TEARS_SECONDARY_COLOR},${TEARS_OPACITY}) 50%, rgba(${TEARS_SECONDARY_COLOR},${TEARS_OPACITY}) 60%, rgba(${TEARS_PRIMARY_COLOR},${TEARS_OPACITY}) 60%, rgba(${TEARS_PRIMARY_COLOR},${TEARS_OPACITY}) 100%)`
                },
                {
                    background: `linear-gradient(180deg, rgba(${TEARS_PRIMARY_COLOR},${TEARS_OPACITY}) 0%, rgba(${TEARS_PRIMARY_COLOR},${TEARS_OPACITY}) 60%, rgba(${TEARS_SECONDARY_COLOR},${TEARS_OPACITY}) 60%, rgba(${TEARS_SECONDARY_COLOR},${TEARS_OPACITY}) 70%, rgba(${TEARS_PRIMARY_COLOR},${TEARS_OPACITY}) 70%, rgba(${TEARS_PRIMARY_COLOR},${TEARS_OPACITY}) 100%)`
                },
                {
                    background: `linear-gradient(180deg, rgba(${TEARS_PRIMARY_COLOR},${TEARS_OPACITY}) 0%, rgba(${TEARS_PRIMARY_COLOR},${TEARS_OPACITY}) 70%, rgba(${TEARS_SECONDARY_COLOR},${TEARS_OPACITY}) 70%, rgba(${TEARS_SECONDARY_COLOR},${TEARS_OPACITY}) 80%, rgba(${TEARS_PRIMARY_COLOR},${TEARS_OPACITY}) 80%, rgba(${TEARS_PRIMARY_COLOR},${TEARS_OPACITY}) 100%)`
                },
                {
                    background: `linear-gradient(180deg, rgba(${TEARS_PRIMARY_COLOR},${TEARS_OPACITY}) 0%, rgba(${TEARS_PRIMARY_COLOR},${TEARS_OPACITY}) 80%, rgba(${TEARS_SECONDARY_COLOR},${TEARS_OPACITY}) 80%, rgba(${TEARS_SECONDARY_COLOR},${TEARS_OPACITY}) 90%, rgba(${TEARS_PRIMARY_COLOR},${TEARS_OPACITY}) 90%, rgba(${TEARS_PRIMARY_COLOR},${TEARS_OPACITY}) 100%)`
                },
                {
                    background: `linear-gradient(180deg, rgba(${TEARS_PRIMARY_COLOR},${TEARS_OPACITY}) 0%, rgba(${TEARS_PRIMARY_COLOR},${TEARS_OPACITY}) 90%, rgba(${TEARS_SECONDARY_COLOR},${TEARS_OPACITY}) 90%, rgba(${TEARS_SECONDARY_COLOR},${TEARS_OPACITY}) 100%)`
                },
            ];

            const animProperties = {
                duration: TEARS_ANIM_DURATION,
                iterations: Infinity,
            };

            tearRef.animate(animKeyframes, animProperties);
        }

        onMounted(() => {
            leftTear.value.style.background = `linear-gradient(180deg, rgba(${TEARS_PRIMARY_COLOR},${TEARS_OPACITY}) 0%, rgba(${TEARS_PRIMARY_COLOR},${TEARS_OPACITY}) 10%, rgba(${TEARS_SECONDARY_COLOR},${TEARS_OPACITY}) 10%, rgba(${TEARS_SECONDARY_COLOR},${TEARS_OPACITY}) 20%, rgba(${TEARS_PRIMARY_COLOR},${TEARS_OPACITY}) 20%, rgba(${TEARS_PRIMARY_COLOR},${TEARS_OPACITY}) 100%)`;
            rightTear.value.style.background = `linear-gradient(180deg, rgba(${TEARS_PRIMARY_COLOR},${TEARS_OPACITY}) 0%, rgba(${TEARS_PRIMARY_COLOR},${TEARS_OPACITY}) 10%, rgba(${TEARS_SECONDARY_COLOR},${TEARS_OPACITY}) 10%, rgba(${TEARS_SECONDARY_COLOR},${TEARS_OPACITY}) 20%, rgba(${TEARS_PRIMARY_COLOR},${TEARS_OPACITY}) 20%, rgba(${TEARS_PRIMARY_COLOR},${TEARS_OPACITY}) 100%)`;

            tearsAnimation(leftTear.value);
            tearsAnimation(rightTear.value);
        });

        return {
            leftTear,
            rightTear
        }
    }
}
</script>

<style>
#not-found {
    width: 100%;
    height: 100vh;
    overflow: hidden;
}

.avatar-body {
    width: 20%;
    z-index: 10;
}
.avatar-eyes {
    width: 12%;

    position: absolute;
    top: 15%;
    left: 49.3%;
    transform: translateX(-50%);
    z-index: 12;
}

.left-tear {
    width: 4%;
    height: 100%;

    position: absolute;
    z-index: 11;
    top: 30%;
    left: 44%;
}
.right-tear {
    width: 4%;
    height: 100%;

    position: absolute;
    z-index: 11;
    top: 30%;
    left: 50.5%;
}

.tears-lake {
    background-color: rgba(0, 138, 255, 0.7);
    width: 100%;
    height: 20%;

    position: absolute;
    z-index: 13;
    bottom: 0;
    left: 0;
}
</style>