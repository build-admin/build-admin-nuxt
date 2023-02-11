import { getLangFileMessage } from '~/lang'
import elementEnLocale from 'element-plus/lib/locale/lang/en'
import elementZhcnLocale from 'element-plus/lib/locale/lang/zh-cn'

export default defineNuxtPlugin(async (nuxtApp) => {
    const locale = nuxtApp.$i18n.locale.value
    await loadLang(nuxtApp, locale)

    nuxtApp.$i18n.onBeforeLanguageSwitch = async (oldLocale: string, newLocale: string, isInitialSetup: string, nuxtApp: anyObj) => {
        await loadLang(nuxtApp, newLocale)
    }

    /**
     * 客户端直接刷新页面
     * 1、element plus的语言包不能动态切换
     * 2、哪怕上面做了切换前加载新语言的翻译，浏览器控制台依然可能报警告
     */
    nuxtApp.$i18n.onLanguageSwitched = () => {
        if (process.client) {
            setTimeout(() => {
                location.reload()
            }, 200)
        }
    }
})

const loadLang = async (nuxtApp: anyObj, locale: string) => {
    // 加载框架全局语言包
    const lang = await import(`~/lang/globs-${locale}.ts`)
    const globsMessage = lang.default ?? {}

    const messages = {
        ...globsMessage,
    }

    // common和el语言包
    if (locale == 'zh-cn') {
        Object.assign(messages, getLangFileMessage(import.meta.glob('~/lang/common/zh-cn/**/*.ts', { eager: true }), locale))
        Object.assign(messages, elementZhcnLocale)
    } else if (locale == 'en') {
        Object.assign(messages, getLangFileMessage(import.meta.glob('~/lang/common/en/**/*.ts', { eager: true }), locale))
        Object.assign(messages, elementEnLocale)
    }

    nuxtApp.$i18n.mergeLocaleMessage(locale, messages)
}
