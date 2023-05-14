<template>
    <div class="iframe-main" v-loading="state.loading">
        <iframe :src="state.iframeSrc" frameborder="0" height="100%" width="100%" id="iframe" ref="iframeRef" @load="hideLoading"></iframe>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    name: 'iframe',
})

const router = useRouter()

const state = reactive({
    loading: true,
    iframeSrc: router.currentRoute.value.params.url as string,
})

const hideLoading = () => {
    state.loading = false
}
</script>

<style scoped lang="scss">
.iframe-main {
    iframe {
        height: 100vh;
    }
}
</style>
