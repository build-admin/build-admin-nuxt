import { buildLocalIconNames } from './assets/script/buildIcons'

if (process.env.VITE_ENV && !process.env.VITE_API_BASE_URL) {
    throw new Error('请先于 .env.production 文件内，配置生产环境的 VITE_API_BASE_URL')
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    runtimeConfig: {
        public: {
            env: process.env.VITE_ENV,
            apiBaseUrl: process.env.VITE_API_BASE_URL,
        },
    },
    typescript: {
        shim: false,
    },
    modules: ['@vueuse/nuxt', '@unocss/nuxt', '@element-plus/nuxt', '@pinia/nuxt', 'pinia-plugin-persistedstate/nuxt', 'nuxt-icons'],
    imports: {
        dirs: ['stores'],
    },
    hooks: {
        'build:before': () => {
            buildLocalIconNames()
        },
    },
    vite: {
        resolve: {
            alias: {
                'vue-i18n': process.env.VITE_ENV == 'production' ? 'vue-i18n/dist/vue-i18n.cjs.prod.js' : 'vue-i18n/dist/vue-i18n.cjs.js',
            },
        },
    },
    // 直接加载el的css以供随时使用 --el 开头的css类
    css: ['element-plus/dist/index.css', 'element-plus/theme-chalk/display.css', '~/assets/scss/index.scss', 'font-awesome/css/font-awesome.min.css'],
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
        icon: false,
    },
    piniaPluginPersistedstate: {
        cookieOptions: {
            sameSite: 'strict',
            maxAge: 2592000,
        },
    },
    // https://github.com/unocss/unocss/issues/2113
    sourcemap: {
        server: true,
        client: false,
    },
    build: {
        transpile: ['@popperjs'],
    },
    compatibilityDate: '2024-09-24',
})
