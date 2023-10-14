import type { RouterConfig } from '@nuxt/schema'

export default <RouterConfig>{
    scrollBehavior(to, from, savedPosition) {
        const scrollEl = document.querySelectorAll('.main-scrollbar .el-scrollbar__wrap')
        if (savedPosition) {
            scrollEl.forEach(function (el) {
                el.scrollTo(savedPosition)
            })
            return savedPosition
        } else if (to.hash) {
            return {
                selector: to.hash,
                behavior: 'smooth',
            }
        } else {
            const options: ScrollToOptions = { top: 0, left: 0, behavior: 'smooth' }
            scrollEl.forEach(function (el) {
                el.scrollTo(options)
            })
            return options
        }
    },
}
