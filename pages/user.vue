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

definePageMeta({
    layout: 'user',
    name: 'user',
})
useSeoMeta({
    title: t('Member Center'),
})

const route = useRoute()
const userInfo = useUserInfo()
const memberCenter = useMemberCenter()

if (userInfo.isLogin()) {
    if (isEmpty(memberCenter.state.viewRoutes)) {
        const { data } = await index()
        if (data.value?.code == 1) {
            data.value.data.userInfo.refreshToken = userInfo.refreshToken
            userInfo.dataFill(data.value.data.userInfo)
            if (data.value.data.menus) {
                const menuMemberCenterBaseRoute = '/user/'
                const menuRule = handleMenuRule(data.value.data.menus, menuMemberCenterBaseRoute, menuMemberCenterBaseRoute)
                memberCenter.setViewRoutes(menuRule)
                memberCenter.setShowHeadline(data.value.data.menus.length > 1 ? true : false)
            }
        }
    }
} else if (route.name != 'userLogin') {
    navigateTo({ name: 'userLogin' })
}

if (process.client) {
    // 跳转到第一个菜单
    if (userInfo.isLogin() && route.name == 'user') {
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
    memberCenter.setShrink(document.body.clientWidth < 1024)
}
</script>

<style scoped lang="scss"></style>
