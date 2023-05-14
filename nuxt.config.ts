import { loadEnv } from 'vite'
import { buildLocalIconNames } from './assets/script/buildIcons'

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
    app: {
        head: {
            link: [
                // 动态的加载样式表，以实现：获取样式表内容（图标名称列表等）
                // font-awesome 图标库CDN地址，任取其一即可，若图标无法显示，可尝试更换CDN地址
                // 1. Bootstrap 中文网同款
                // { rel: 'stylesheet', crossorigin: 'anonymous', href: '//cdn.bootcdn.net/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css' },
                // 2. cdnjs
                { rel: 'stylesheet', crossorigin: 'anonymous', href: '//cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css' },
            ],
        },
    },
    runtimeConfig: {
        public: {
            env: envData.VITE_ENV,
            apiBaseUrl: envData.VITE_API_BASE_URL,
        },
    },
    typescript: {
        shim: false,
    },
    modules: ['@vueuse/nuxt', '@unocss/nuxt', '@element-plus/nuxt', '@pinia/nuxt', '@pinia-plugin-persistedstate/nuxt', 'nuxt-icons'],
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
                'vue-i18n': envData.VITE_ENV == 'production' ? 'vue-i18n/dist/vue-i18n.cjs.prod.js' : 'vue-i18n/dist/vue-i18n.cjs.js',
            },
        },
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
        icon: false,
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
