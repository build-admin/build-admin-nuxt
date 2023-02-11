import { loadEnv } from 'vite'

let envScript = 'development'
if (['build', 'generate'].includes(process.env.npm_lifecycle_event ?? '')) {
    envScript = 'production'
}
const envData = loadEnv(envScript, '')
if (!envData.VITE_API_BASE_URL) {
    throw new Error('请先于 .env.production 文件内,配置生产环境的 VITE_API_BASE_URL')
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    runtimeConfig: {
        public: {
            env: envData.VITE_ENV,
            apiBaseUrl: envData.VITE_API_BASE_URL,
        },
    },
    typescript: {
        shim: false,
    },
    modules: ['@vueuse/nuxt', '@unocss/nuxt', '@element-plus/nuxt', '@nuxtjs/i18n', '@pinia/nuxt', '@pinia-plugin-persistedstate/nuxt'],
    imports: {
        dirs: ['stores'],
    },
    // 直接加载el的css以供随时使用 --el 开头的css类
    css: ['element-plus/dist/index.css', 'element-plus/theme-chalk/display.css', '~/assets/scss/index.scss'],
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
    i18n: {
        locales: ['zh-cn', 'en'],
        defaultLocale: 'zh-cn',
        vueI18n: {
            legacy: false,
            locale: 'zh-cn',
            globalInjection: true,
            messages: {},
        },
    },
    pinia: {
        autoImports: ['defineStore', 'acceptHMRUpdate'],
        disableVuex: true,
    },
    // https://github.com/unocss/unocss/issues/2113
    sourcemap: {
        server: true,
        client: false,
    },
})
