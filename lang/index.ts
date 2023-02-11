import { isEmpty } from 'lodash-es'
import { LANG } from '~/stores/constant/keys'

export function getLanguage() {
    const lang = useCookie(LANG)
    return lang.value || 'zh-cn'
}

export function setLanguage(locale: string) {
    const { $i18n } = useNuxtApp()
    $i18n.setLocale(locale)

    const lang = useCookie(LANG)
    lang.value = locale

    /**
     * 客户端直接刷新页面
     * 1、element plus的语言包不能动态切换
     * 2、哪怕在语言切换时做了切换前加载新语言的翻译，浏览器控制台依然可能报警告
     */
    if (process.client) {
        location.reload()
    }
}

/**
 * 合并语言翻译到当前语言
 * @param nuxtApp
 * @param message
 * @param pathName
 * @returns
 */
export function mergeMessage(nuxtApp: any, message: anyObj, pathName = '') {
    if (isEmpty(message)) return
    if (!pathName) {
        return nuxtApp.$i18n.mergeLocaleMessage(nuxtApp.$i18n.locale.value, message)
    }
    let msg: anyObj = {}
    if (pathName.indexOf('/') > 0) {
        msg = handleMsglist(msg, message, pathName)
    } else {
        msg[pathName] = message
    }
    nuxtApp.$i18n.mergeLocaleMessage(nuxtApp.$i18n.locale.value, msg)
}

export function getLangFileMessage(mList: any, locale: string) {
    let msg: anyObj = {}
    locale = '/' + locale
    for (const path in mList) {
        if (mList[path].default) {
            //  获取文件名
            const pathName = path.slice(path.lastIndexOf(locale) + (locale.length + 1), path.lastIndexOf('.'))
            if (pathName.indexOf('/') > 0) {
                msg = handleMsglist(msg, mList[path].default, pathName)
            } else {
                msg[pathName] = mList[path].default
            }
        }
    }
    return msg
}

export function handleMsglist(msg: anyObj, mList: anyObj, pathName: string) {
    const pathNameTmp = pathName.split('/')
    let obj: anyObj = {}
    for (let i = pathNameTmp.length - 1; i >= 0; i--) {
        if (i == pathNameTmp.length - 1) {
            obj = {
                [pathNameTmp[i]]: mList,
            }
        } else {
            obj = {
                [pathNameTmp[i]]: obj,
            }
        }
    }
    return mergeMsg(msg, obj)
}

export function mergeMsg(msg: anyObj, obj: anyObj) {
    for (const key in obj) {
        if (typeof msg[key] == 'undefined') {
            msg[key] = obj[key]
        } else if (typeof msg[key] == 'object') {
            msg[key] = mergeMsg(msg[key], obj[key])
        }
    }
    return msg
}
