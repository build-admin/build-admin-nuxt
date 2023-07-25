<template>
    <div>
        <NuxtPage />
    </div>
</template>

<script setup lang="ts">
import { index } from '~/api/user/index'
import { useI18n } from 'vue-i18n'
import { isEmpty } from 'lodash-es'
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
const siteConfig = useSiteConfig()
const memberCenter = useMemberCenter()

if (isEmpty(memberCenter.state.viewRoutes) && userInfo.isLogin()) {
    const { data } = await index()
    if (data.value?.code == 1) {
        data.value.data.userInfo.refresh_token = userInfo.getToken('refresh')
        userInfo.dataFill(data.value.data.userInfo)
        if (data.value.data.menus) {
            const menuMemberCenterBaseRoute = '/user/'
            const menuRule = handleMenuRule(data.value.data.menus, menuMemberCenterBaseRoute)
            memberCenter.setViewRoutes(menuRule)
            memberCenter.setShowHeadline(data.value.data.menus.length > 1 ? true : false)
            memberCenter.mergeAuthNode(handleAuthNode(data.value.data.menus, menuMemberCenterBaseRoute))
        }
        if (data.value.data.rules) {
            memberCenter.mergeAuthNode(handleAuthNode(data.value.data.rules, '/'))
            memberCenter.setNavUserMenus(handleMenus(data.value.data.rules, '/', ['nav_user_menu']))
            siteConfig.setHeadNav(handleMenus(data.value.data.rules, '/', ['nav']))
        }
    }
}

const jumpFirstMenu = () => {
    let firstRoute = getFirstRoute(memberCenter.state.viewRoutes)
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
