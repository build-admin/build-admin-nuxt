<template>
    <div class="ba-loading" :style="loaderStyle">
        <div class="ball-scale-multiple">
            <div></div>
            <div></div>
            <div></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { CSSProperties } from 'vue'

interface Props {
    size?: string | number
    color?: string
}

const props = withDefaults(defineProps<Props>(), {
    size: '60',
    color: '#409eff',
})

const loaderStyle = computed((): CSSProperties => {
    const { size, color } = props
    let s = size.toString().replace('px', '')
    let sn = parseInt(s)
    s = `${s}px`
    return {
        '--loading-width': s,
        '--loading-height': s,
        '--loading-div-color': color,
        '--loading-transform': `-${sn / 2}px`,
    }
})
</script>

<style scoped lang="scss">
// from https://github.com/ConnorAtherton/loaders.css
.ba-loading {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--loading-width);
    height: var(--loading-height);
    perspective: 500px;
}
@-webkit-keyframes ball-scale-multiple {
    0% {
        -webkit-transform: scale(0);
        transform: scale(0);
        opacity: 0;
    }
    5% {
        opacity: 1;
    }
    100% {
        -webkit-transform: scale(1);
        transform: scale(1);
        opacity: 0;
    }
}

@keyframes ball-scale-multiple {
    0% {
        -webkit-transform: scale(0);
        transform: scale(0);
        opacity: 0;
    }
    5% {
        opacity: 1;
    }
    100% {
        -webkit-transform: scale(1);
        transform: scale(1);
        opacity: 0;
    }
}

.ball-scale-multiple {
    position: relative;
    -webkit-transform: translateY(var(--loading-transform));
    transform: translateY(var(--loading-transform));
}
.ball-scale-multiple > div:nth-child(2) {
    -webkit-animation-delay: -0.4s;
    animation-delay: -0.4s;
}
.ball-scale-multiple > div:nth-child(3) {
    -webkit-animation-delay: -0.2s;
    animation-delay: -0.2s;
}
.ball-scale-multiple > div {
    background-color: var(--loading-div-color);
    border-radius: 100%;
    -webkit-animation-fill-mode: both;
    animation-fill-mode: both;
    position: absolute;
    left: var(--loading-transform);
    top: 0px;
    opacity: 0;
    margin: 0;
    width: var(--loading-width);
    height: var(--loading-height);
    -webkit-animation: ball-scale-multiple 1s 0s linear infinite;
    animation: ball-scale-multiple 1s 0s linear infinite;
}
</style>
