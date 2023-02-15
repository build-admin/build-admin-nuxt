import { i18n } from '~/plugins/i18n'
import { useSiteConfig } from '~~/stores/siteConfig'

// 公共
export const captchaUrl = '/api/common/captcha'
export const refreshTokenUrl = '/api/common/refreshToken'

// api模块(前台)
export const apiUploadUrl = '/api/ajax/upload'
export const apiBuildSuffixSvgUrl = '/api/ajax/buildSuffixSvg'
export const apiAreaUrl = '/api/ajax/area'
export const apiSendSms = '/api/Sms/send'
export const apiSendEms = '/api/Ems/send'
export const indexUrl = '/api/index/index'

/**
 * 初始化
 */
export function initialize() {
    const siteConfig = useSiteConfig()

    if (siteConfig.siteName) {
        return
    }

    return Http.request({
        url: indexUrl,
        method: 'get',
    }).then((res) => {
        useServerSeoMeta({
            title: i18n.global.t('Home'),
            titleTemplate: (titleChunk?: string) => {
                return titleChunk ? `${titleChunk} - ${res.value?.data.site.siteName}` : res.value?.data.site.siteName
            },
        })
        siteConfig.dataFill({ ...res.value?.data.site, openMemberCenter: res.value?.data.openMemberCenter })
    })
}

/**
 * 获取地区数据
 */
export function getArea(values: number[]) {
    const params: { province?: number; city?: number } = {}
    if (values[0]) {
        params.province = values[0]
    }
    if (values[1]) {
        params.city = values[1]
    }
    return Http.request({
        url: apiAreaUrl,
        method: 'GET',
        params: params,
    })
}

/**
 * 远程下拉框数据获取
 */
export function getSelectData(remoteUrl: string, q: string, params: {}) {
    return Http.request({
        url: remoteUrl,
        method: 'get',
        params: Object.assign(params, {
            select: true,
            quick_search: q,
        }),
    })
}
