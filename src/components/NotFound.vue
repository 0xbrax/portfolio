<template>
    <div id="not-found" class="d-flex wrap justify-ctr align-ctr">
        <div class="w-100 text-ctr py-20">
            <h2>
                Oh no... page not found.
            </h2>
            
            <p class="mt-10">Please be patient, I'm doing my best.</p>
        </div>

        <router-link class="home-btn" to="/">Go back home</router-link>

        <div class="img-container w-100 text-ctr relative">
            <img
                class="avatar-body relative"
                src="@/assets/image/cute-villain-crying-edit-noeyes.png"
            />
            <img
                class="avatar-eyes"
                src="@/assets/image/cute-villain-crying-edit-eyes-nobg.png"
            />

            <div class="left-tear" ref="leftTear"></div>
            <div class="right-tear" ref="rightTear"></div>
            <div class="tears-lake"></div>
        </div>
    </div>
</template>

<script>
    import { ref, onMounted } from "vue";

    export default {
        name: "NotFound",

        setup() {
            const leftTear = ref(null);
            const rightTear = ref(null);

            const TEARS_OPACITY = "1";
            const TEARS_PRIMARY_COLOR = "0, 138, 255";
            const TEARS_SECONDARY_COLOR = "0, 211, 255";
            const TEARS_ANIM_DURATION = 1700;

            const tearsAnimationDelay = (array, indexArray) => {
                const arr = [...array];
                const temp = [...arr.filter((el, i) => indexArray.includes(i))];
                arr.splice(indexArray[0], indexArray.length);
                arr.splice(0, 0, ...temp);
                return arr;
            };

            const tearsAnimation = (tearRef, delay) => {
                let animKeyframes = [
                    {
                        background: `linear-gradient(180deg, rgba(${TEARS_SECONDARY_COLOR}, ${TEARS_OPACITY}) 0%, rgba(${TEARS_SECONDARY_COLOR}, ${TEARS_OPACITY}) 10%, rgba(${TEARS_PRIMARY_COLOR}, ${TEARS_OPACITY}) 10%, rgba(${TEARS_PRIMARY_COLOR}, ${TEARS_OPACITY}) 100%)`,
                    },
                    {
                        background: `linear-gradient(180deg, rgba(${TEARS_PRIMARY_COLOR}, ${TEARS_OPACITY}) 0%, rgba(${TEARS_PRIMARY_COLOR}, ${TEARS_OPACITY}) 10%, rgba(${TEARS_SECONDARY_COLOR}, ${TEARS_OPACITY}) 10%, rgba(${TEARS_SECONDARY_COLOR}, ${TEARS_OPACITY}) 20%, rgba(${TEARS_PRIMARY_COLOR}, ${TEARS_OPACITY}) 20%, rgba(${TEARS_PRIMARY_COLOR}, ${TEARS_OPACITY}) 100%)`,
                    },
                    {
                        background: `linear-gradient(180deg, rgba(${TEARS_PRIMARY_COLOR}, ${TEARS_OPACITY}) 0%, rgba(${TEARS_PRIMARY_COLOR}, ${TEARS_OPACITY}) 20%, rgba(${TEARS_SECONDARY_COLOR}, ${TEARS_OPACITY}) 20%, rgba(${TEARS_SECONDARY_COLOR}, ${TEARS_OPACITY}) 30%, rgba(${TEARS_PRIMARY_COLOR}, ${TEARS_OPACITY}) 30%, rgba(${TEARS_PRIMARY_COLOR}, ${TEARS_OPACITY}) 100%)`,
                    },
                    {
                        background: `linear-gradient(180deg, rgba(${TEARS_PRIMARY_COLOR}, ${TEARS_OPACITY}) 0%, rgba(${TEARS_PRIMARY_COLOR}, ${TEARS_OPACITY}) 30%, rgba(${TEARS_SECONDARY_COLOR}, ${TEARS_OPACITY}) 30%, rgba(${TEARS_SECONDARY_COLOR}, ${TEARS_OPACITY}) 40%, rgba(${TEARS_PRIMARY_COLOR}, ${TEARS_OPACITY}) 40%, rgba(${TEARS_PRIMARY_COLOR}, ${TEARS_OPACITY}) 100%)`,
                    },
                    {
                        background: `linear-gradient(180deg, rgba(${TEARS_PRIMARY_COLOR}, ${TEARS_OPACITY}) 0%, rgba(${TEARS_PRIMARY_COLOR}, ${TEARS_OPACITY}) 40%, rgba(${TEARS_SECONDARY_COLOR}, ${TEARS_OPACITY}) 40%, rgba(${TEARS_SECONDARY_COLOR}, ${TEARS_OPACITY}) 50%, rgba(${TEARS_PRIMARY_COLOR}, ${TEARS_OPACITY}) 50%, rgba(${TEARS_PRIMARY_COLOR}, ${TEARS_OPACITY}) 100%)`,
                    },
                    {
                        background: `linear-gradient(180deg, rgba(${TEARS_PRIMARY_COLOR}, ${TEARS_OPACITY}) 0%, rgba(${TEARS_PRIMARY_COLOR}, ${TEARS_OPACITY}) 50%, rgba(${TEARS_SECONDARY_COLOR}, ${TEARS_OPACITY}) 50%, rgba(${TEARS_SECONDARY_COLOR}, ${TEARS_OPACITY}) 60%, rgba(${TEARS_PRIMARY_COLOR}, ${TEARS_OPACITY}) 60%, rgba(${TEARS_PRIMARY_COLOR}, ${TEARS_OPACITY}) 100%)`,
                    },
                    {
                        background: `linear-gradient(180deg, rgba(${TEARS_PRIMARY_COLOR}, ${TEARS_OPACITY}) 0%, rgba(${TEARS_PRIMARY_COLOR}, ${TEARS_OPACITY}) 60%, rgba(${TEARS_SECONDARY_COLOR}, ${TEARS_OPACITY}) 60%, rgba(${TEARS_SECONDARY_COLOR}, ${TEARS_OPACITY}) 70%, rgba(${TEARS_PRIMARY_COLOR}, ${TEARS_OPACITY}) 70%, rgba(${TEARS_PRIMARY_COLOR}, ${TEARS_OPACITY}) 100%)`,
                    },
                    {
                        background: `linear-gradient(180deg, rgba(${TEARS_PRIMARY_COLOR}, ${TEARS_OPACITY}) 0%, rgba(${TEARS_PRIMARY_COLOR}, ${TEARS_OPACITY}) 70%, rgba(${TEARS_SECONDARY_COLOR}, ${TEARS_OPACITY}) 70%, rgba(${TEARS_SECONDARY_COLOR}, ${TEARS_OPACITY}) 80%, rgba(${TEARS_PRIMARY_COLOR}, ${TEARS_OPACITY}) 80%, rgba(${TEARS_PRIMARY_COLOR}, ${TEARS_OPACITY}) 100%)`,
                    },
                    {
                        background: `linear-gradient(180deg, rgba(${TEARS_PRIMARY_COLOR}, ${TEARS_OPACITY}) 0%, rgba(${TEARS_PRIMARY_COLOR}, ${TEARS_OPACITY}) 80%, rgba(${TEARS_SECONDARY_COLOR}, ${TEARS_OPACITY}) 80%, rgba(${TEARS_SECONDARY_COLOR}, ${TEARS_OPACITY}) 90%, rgba(${TEARS_PRIMARY_COLOR}, ${TEARS_OPACITY}) 90%, rgba(${TEARS_PRIMARY_COLOR}, ${TEARS_OPACITY}) 100%)`,
                    },
                    {
                        background: `linear-gradient(180deg, rgba(${TEARS_PRIMARY_COLOR}, ${TEARS_OPACITY}) 0%, rgba(${TEARS_PRIMARY_COLOR}, ${TEARS_OPACITY}) 90%, rgba(${TEARS_SECONDARY_COLOR}, ${TEARS_OPACITY}) 90%, rgba(${TEARS_SECONDARY_COLOR}, ${TEARS_OPACITY}) 100%)`,
                    },
                ];

                if (delay) {
                    animKeyframes = tearsAnimationDelay(animKeyframes, [9]);
                }

                const animProperties = {
                    duration: TEARS_ANIM_DURATION,
                    iterations: Infinity,
                };

                tearRef.animate(animKeyframes, animProperties);
            };

            // INIT
            document.title = "0xbrax | 404 LOL";

            onMounted(() => {
                leftTear.value.style.background = `linear-gradient(180deg, rgba(${TEARS_PRIMARY_COLOR}, ${TEARS_OPACITY}) 0%, rgba(${TEARS_PRIMARY_COLOR}, ${TEARS_OPACITY}) 10%, rgba(${TEARS_SECONDARY_COLOR}, ${TEARS_OPACITY}) 10%, rgba(${TEARS_SECONDARY_COLOR}, ${TEARS_OPACITY}) 20%, rgba(${TEARS_PRIMARY_COLOR}, ${TEARS_OPACITY}) 20%, rgba(${TEARS_PRIMARY_COLOR}, ${TEARS_OPACITY}) 100%)`;
                rightTear.value.style.background = `linear-gradient(180deg, rgba(${TEARS_PRIMARY_COLOR}, ${TEARS_OPACITY}) 0%, rgba(${TEARS_PRIMARY_COLOR}, ${TEARS_OPACITY}) 10%, rgba(${TEARS_SECONDARY_COLOR}, ${TEARS_OPACITY}) 10%, rgba(${TEARS_SECONDARY_COLOR}, ${TEARS_OPACITY}) 20%, rgba(${TEARS_PRIMARY_COLOR}, ${TEARS_OPACITY}) 20%, rgba(${TEARS_PRIMARY_COLOR}, ${TEARS_OPACITY}) 100%)`;

                tearsAnimation(leftTear.value);
                tearsAnimation(rightTear.value, true);
            });

            return {
                leftTear,
                rightTear,
            };
        },
    };
</script>

<style>
    #not-found {
        width: 100%;
        height: 100vh;
        height: 100dvh;
        overflow: hidden;

        background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0) 70%,
            rgba(0, 138, 255, 1) 70%,
            rgba(0, 138, 255, 1) 100%
        );
    }

    .home-btn {
        border-radius: 15px;
        padding: 10px 15px;
        text-transform: uppercase;
        font-size: 20px;
        background-color: rgba(0, 138, 255, 1);
        color: #ffffff;
        text-transform: uppercase;
        cursor: pointer;
        border: 2px solid #000000;
        transition: background-color 0.2s ease-in-out;
    }
    .home-btn:hover {
        background-color: rgba(0, 211, 255, 1);
    }

    .img-container {
        background-color: #ffffff;
    }

    .avatar-body {
        width: 40%;
        z-index: 10;
    }
    .avatar-eyes {
        width: 24%;

        position: absolute;
        top: 15%;
        left: 49.3%;
        transform: translateX(-50%);
        z-index: 12;
    }

    .left-tear {
        width: 6.5%;
        height: 51%;

        position: absolute;
        z-index: 11;
        top: 30%;
        left: 39.4%;

        animation: tearsHeight 15s infinite ease-in-out;
    }
    .right-tear {
        width: 6.5%;
        height: 51%;

        position: absolute;
        z-index: 11;
        top: 30%;
        left: 52.1%;

        animation: tearsHeight 15s infinite ease-in-out;
    }

    @keyframes tearsHeight {
        from, to {
            height: 51%;
        }
        50% {
            height: 46%;
        }
    }

    .tears-lake {
        background-color: rgba(0, 138, 255, 1);
        width: 100%;
        height: 20%;

        position: absolute;
        z-index: 13;
        bottom: 0;
        left: 0;

        animation: tearsLakeHeight 15s infinite ease-in-out;
    }

    @keyframes tearsLakeHeight {
        from, to {
            height: 20%;
        }
        50% {
            height: 25%;
        }
    }

    @media all and (min-width: 576px) {
        .avatar-body {
            width: 20%;
        }
        .avatar-eyes {
            width: 12%;
        }
        .left-tear {
            width: 3.5%;
            left: 44.2%;
        }
        .right-tear {
            width: 3.5%;
            left: 50.5%;
        }
    }
</style>
