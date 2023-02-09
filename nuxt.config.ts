import pkg from './package.json'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    app: {
        head: {
            title: pkg.name,
            meta: [{ charset: 'utf-8' }, { name: 'viewport', content: 'width=device-width, initial-scale=1' }],
        },
    },
    typescript: {
        shim: false,
    },
    // 直接加载el的css以供随时使用 --el 开头的css类
    css: ['element-plus/dist/index.css', 'element-plus/theme-chalk/display.css', '~/assets/scss/index.scss'],
    // build modules
    modules: ['@vueuse/nuxt', '@unocss/nuxt', '@pinia/nuxt', '@element-plus/nuxt'],
    vueuse: {
        ssrHandlers: true,
    },
    unocss: {
        uno: true,
        attributify: true,
        icons: {
            scale: 1.2,
        },
    },
    elementPlus: {
        icon: 'ElIcon',
    },
    // https://github.com/unocss/unocss/issues/2113
    sourcemap: {
        server: true,
        client: false,
    },
})
