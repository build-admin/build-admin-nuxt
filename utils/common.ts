import type { FormInstance } from 'element-plus'

/**
 * 获取资源完整地址
 * @param relativeUrl 资源相对地址
 * @param domain 指定域名
 */
export const fullUrl = (relativeUrl: string, domain = '') => {
    const siteConfig = useSiteConfig()
    if (!domain) {
        domain = siteConfig.cdnUrl ? siteConfig.cdnUrl : import.meta.env.VITE_API_BASE_URL
    }
    if (!relativeUrl) return domain

    const regUrl = new RegExp(/^http(s)?:\/\//)
    const regexImg = new RegExp(/^((?:[a-z]+:)?\/\/|data:image\/)(.*)/i)
    if (!domain || regUrl.test(relativeUrl) || regexImg.test(relativeUrl)) {
        return relativeUrl
    }
    return domain + relativeUrl
}

/**
 * 获取一组资源的完整地址
 * @param relativeUrls 资源相对地址
 * @param domain 指定域名
 */
export const arrayFullUrl = (relativeUrls: string | string[], domain = '') => {
    if (typeof relativeUrls === 'string') {
        relativeUrls = relativeUrls == '' ? [] : relativeUrls.split(',')
    }
    for (const key in relativeUrls) {
        relativeUrls[key] = fullUrl(relativeUrls[key], domain)
    }
    return relativeUrls
}

/**
 * 从一个文件路径中获取文件名
 * @param path 文件路径
 */
export const getFileNameFromPath = (path: string) => {
    const paths = path.split('/')
    return paths[paths.length - 1]
}

/**
 * 是否是外部链接
 * @param path
 */
export function isExternal(path: string): boolean {
    return /^(https?|ftp|mailto|tel):/.test(path)
}

/**
 * 防抖
 * @param fn 执行函数
 * @param ms 间隔毫秒数
 */
export const debounce = (fn: Function, ms: number) => {
    return (...args: any[]) => {
        if (globals.lazy) {
            clearTimeout(globals.lazy)
        }
        globals.lazy = setTimeout(() => {
            fn(...args)
        }, ms)
    }
}

/**
 * 表单重置
 * @param formEl
 */
export const onResetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.resetFields && formEl.resetFields()
}
