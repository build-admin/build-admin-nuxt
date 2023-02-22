<template>
    <div>
        <NuxtPage />
    </div>
</template>

<script setup lang="ts">
import { index } from '~/api/user/index'

definePageMeta({
    layout: 'user',
    name: 'user',
})
useServerSeoMeta({
    title: '会员中心',
})

const route = useRoute()
const userInfo = useUserInfo()

if (userInfo.isLogin()) {
    const { data } = await index()
    if (data.value?.code == 1) {
        console.log('会员中心请求成功', data.value.data)
    }
} else if (route.name != 'userLogin') {
    navigateTo({ name: 'userLogin' })
}
</script>

<style scoped lang="scss"></style>
