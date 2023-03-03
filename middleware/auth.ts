export default defineNuxtRouteMiddleware((to) => {
    const userInfo = useUserInfo()
    if (!userInfo.isLogin() && to.name != 'userLogin') {
        return navigateTo({ name: 'userLogin' })
    }
})
