import { i18n } from '~/plugins/i18n'
import type { UploadRawFile } from 'element-plus'
import { useSiteConfig } from '~/stores/siteConfig'
import { state as uploadExpandState, fileUpload as uploadExpand } from '~/composables/mixins/baUpload'

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
    })
}

/**
 * 上传文件
 * @param fd 表单数据
 * @param params 请求额外参数
 * @param forceLocal 上传到本地，而不使用云存储
 */
export function fileUpload<DataT = any>(fd: FormData, params: anyObj = {}, forceLocal = false): Promise<Ref<ApiResponse<DataT> | null>> {
    let errorMsg = ''
    const file = fd.get('file') as UploadRawFile
    const siteConfig = useSiteConfig()

    if (!file.name || typeof file.size == 'undefined') {
        errorMsg = i18n.global.t('utils.The data of the uploaded file is incomplete!')
    } else if (!checkFileMimetype(file.name, file.type)) {
        errorMsg = i18n.global.t('utils.The type of uploaded file is not allowed!')
    } else if (file.size > siteConfig.upload.maxsize) {
        errorMsg = i18n.global.t('utils.The size of the uploaded file exceeds the allowed range!')
    }
    if (errorMsg) {
        return new Promise((resolve, reject) => {
            ElNotification({
                type: 'error',
                message: errorMsg,
            })
            reject(errorMsg)
        })
    }

    if (!forceLocal && uploadExpandState() == 'enable') {
        return uploadExpand(fd, params)
    }

    return Http.request({
        url: apiUploadUrl,
        method: 'POST',
        body: fd,
        params: params,
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
    return Http.fetch({
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

/**
 * 文件类型效验，主要用于云存储
 * 服务端并不能单纯此函数来限制文件上传
 * @param fileName 文件名
 * @param fileType 文件mimetype，不一定存在
 */
export const checkFileMimetype = (fileName: string, fileType: string) => {
    if (!fileName) return false
    const siteConfig = useSiteConfig()
    const mimetype = siteConfig.upload.mimetype.toLowerCase().split(',')

    const fileSuffix = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase()
    if (siteConfig.upload.mimetype === '*' || mimetype.includes(fileSuffix) || mimetype.includes('.' + fileSuffix)) {
        return true
    }
    if (fileType) {
        const fileTypeTemp = fileType.toLowerCase().split('/')
        if (mimetype.includes(fileTypeTemp[0] + '/*') || mimetype.includes(fileType)) {
            return true
        }
    }
    return false
}
