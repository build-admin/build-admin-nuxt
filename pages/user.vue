<template>
    <div>
        <NuxtPage />
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { initialize } from '~/api/common'
const { t } = useI18n()

useSeoMeta({
    title: t('Member Center'),
})
definePageMeta({
    layout: 'user',
    name: 'user',
    middleware: ['user-mount', 'auth'],
})

const route = useRoute()
const userInfo = useUserInfo()
const memberCenter = useMemberCenter()

/**
 * 初始化请求
 * 若在 app.vue 发送此请求时已经登录，initialize 内会自动放弃请求
 */
await initialize()

const jumpFirstMenu = () => {
    let firstRoute = getFirstRoute(memberCenter.state.userMenus)
    if (firstRoute) {
        navigateTo({ path: firstRoute.path })
    } else {
        ElNotification({
            type: 'error',
            message: t('No route found to jump~'),
        })
    }
}

/**
 * 在中间件中处理时，jumpFirstMenu 后将导致部分元素水合失败
 */
if (userInfo.isLogin() && process.client && route.name == 'user') {
    jumpFirstMenu()
}

/**
 * onBeforeRouteUpdate 中不能跳转，直接监听
 */
watch(
    () => route.name,
    (val) => {
        if (val == 'user') jumpFirstMenu()
        memberCenter.setActiveRoute(route)
    }
)

onMounted(() => {
    memberCenter.setShrink(document.body.clientWidth < 992)
    memberCenter.setActiveRoute(route)
})
</script>

<style scoped lang="scss"></style>
