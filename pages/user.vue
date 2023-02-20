<template>
    <div>
        <NuxtPage />
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'user',
    name: 'user',
})
useServerSeoMeta({
    title: '会员中心',
})

const route = useRoute()
const userInfo = useUserInfo()

if (!userInfo.isLogin() && route.name != 'userLogin') navigateTo({ name: 'userLogin' })
</script>

<style scoped lang="scss"></style>
