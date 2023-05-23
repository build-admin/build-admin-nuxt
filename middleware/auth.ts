export default defineNuxtRouteMiddleware((to) => {
    const userInfo = useUserInfo()
    if (!userInfo.isLogin() && !to.meta.noNeedLogin) {
        return navigateTo({ name: 'userLogin' })
    }
})
