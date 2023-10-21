import type { App } from 'vue'

export default defineNuxtPlugin(async (nuxtApp) => {
    blurDirective(nuxtApp.vueApp)
    authDirective(nuxtApp.vueApp)
})

/**
 * 点击后自动失焦指令
 * @description v-blur
 */
function blurDirective(app: App) {
    app.directive('blur', {
        mounted(el) {
            useEventListener(el, 'focus', () => el.blur())
        },
    })
}

/**
 * 鉴权指令
 * @description v-auth="'name'"，name可以为：index,add,edit,del,...
 */
function authDirective(app: App) {
    app.directive('auth', {
        mounted(el, binding) {
            if (!binding.value) return false
            if (!auth(binding.value)) {
                el.parentNode.removeChild(el)
            }
        },
    })
}
