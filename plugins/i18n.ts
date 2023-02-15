import { createI18n } from 'vue-i18n'
import { getLangFileMessage, getLanguage } from '~/lang'
import elementEnLocale from 'element-plus/lib/locale/lang/en'
import elementZhcnLocale from 'element-plus/lib/locale/lang/zh-cn'

export const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: 'zh-cn',
    messages: {},
})

export default defineNuxtPlugin(async (nuxtApp) => {
    const locale = getLanguage()
    i18n.global.locale.value = locale

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
    i18n.global.mergeLocaleMessage(locale, messages)

    // 准备语言包按需加载句柄
    if (locale == 'zh-cn') {
        globals.loadLangHandle = {
            ...import.meta.glob('~/lang/pages/zh-cn/**/*.ts'),
        }
    } else if (locale == 'en') {
        globals.loadLangHandle = {
            ...import.meta.glob('~/lang/pages/en/**/*.ts'),
        }
    }
    nuxtApp.vueApp.use(i18n)
})
