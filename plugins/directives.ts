import { App } from 'vue'

export default defineNuxtPlugin(async (nuxtApp) => {
    blurDirective(nuxtApp.vueApp)
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
