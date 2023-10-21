import { i18n } from '~/plugins/i18n'
import type { UploadRawFile } from 'element-plus'
import { useSiteConfig } from '~/stores/siteConfig'
import { state as uploadExpandState, fileUpload as uploadExpand } from '~/composables/mixins/baUpload'
import type { FetchError } from 'ofetch'
import type { _AsyncData } from 'nuxt/dist/app/composables/asyncData'
import { isEmpty } from 'lodash-es'

// 公共
export const captchaUrl = '/api/common/captcha'
export const clickCaptchaUrl = '/api/common/clickCaptcha'
export const checkClickCaptchaUrl = '/api/common/checkClickCaptcha'

// api模块(前台)
export const apiUploadUrl = '/api/ajax/upload'
export const apiBuildSuffixSvgUrl = '/api/ajax/buildSuffixSvg'
export const apiAreaUrl = '/api/ajax/area'
export const apiSendSms = '/api/Sms/send'
export const apiSendEms = '/api/Ems/send'
export const indexUrl = '/api/index/index'

/**
 * 前端初始化请求
 * 1. 会员已登录时，一共只初始化一次
 * 2. 会员未登录时，在会员完成登录时再初始化一次
 */
export async function initialize(requiredLogin?: boolean) {
    const userInfo = useUserInfo()
    const siteConfig = useSiteConfig()

    if (!userInfo.isLogin() && siteConfig.initialize) return
    if (userInfo.isLogin() && siteConfig.userInitialize) return

    const { data } = await Http.fetch({
        url: indexUrl,
        method: 'get',
        params: {
            requiredLogin: requiredLogin ? 1 : 0,
        },
    })
    if (data.value?.code == 1) {
        const memberCenter = useMemberCenter()
        siteConfig.dataFill(data.value.data.site)
        memberCenter.setStatus(data.value.data.openMemberCenter)
        registerMenus(data.value.data.rules, data.value.data.menus)

        if (!isEmpty(data.value.data.userInfo)) {
            data.value.data.userInfo.refresh_token = userInfo.getToken('refresh')
            userInfo.dataFill(data.value.data.userInfo)

            // 请求到会员信息才设置会员中心初始化是成功的
            siteConfig.setUserInitialize(true)
        }

        siteConfig.setInitialize(true)
    }
    return data
}

/**
 * 上传文件
 * @param fd 表单数据
 * @param params 请求额外参数
 * @param forceLocal 上传到本地，而不使用云存储
 */
export function fileUpload<DataT = anyObj>(
    fd: FormData,
    params: anyObj = {},
    forceLocal = false
): Promise<_AsyncData<ApiResponse<DataT> | null, FetchError<any> | null>> {
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

    return Http.fetch({
        url: apiUploadUrl,
        method: 'POST',
        body: fd,
        params: params,
    })
}

/**
 * 发送短信
 */
export function sendSms(mobile: string, templateCode: string, extend: anyObj = {}) {
    return Http.fetch(
        {
            url: apiSendSms,
            method: 'POST',
            body: {
                mobile: mobile,
                template_code: templateCode,
                ...extend,
            },
        },
        {
            showSuccessMessage: true,
        }
    )
}

/**
 * 发送邮件
 */
export function sendEms(email: string, event: string, extend: anyObj = {}) {
    return Http.fetch(
        {
            url: apiSendEms,
            method: 'POST',
            body: {
                email: email,
                event: event,
                ...extend,
            },
        },
        {
            showSuccessMessage: true,
        }
    )
}

/**
 * 构建验证码 URL
 */
export function buildCaptchaUrl() {
    return import.meta.env.VITE_API_BASE_URL + captchaUrl + '?server=1'
}

/**
 * 获取文字点击验证码数据
 * @param id 验证码ID
 */
export function getCaptchaData(id: string) {
    return Http.fetch({
        url: clickCaptchaUrl,
        method: 'get',
        params: {
            id,
        },
    })
}

/**
 * 验证文字点击验证码
 * @param id 验证码ID
 * @param info 点选的文字信息
 * @param unset 验证完成清理验证码数据
 */
export function checkClickCaptcha(id: string, info: string, unset: boolean) {
    return Http.fetch(
        {
            url: checkClickCaptchaUrl,
            method: 'post',
            body: {
                id,
                info,
                unset,
            },
        },
        {
            showCodeMessage: false,
        }
    )
}

/**
 * 用户注销登录
 */
export function userLogout() {
    const userInfo = useUserInfo()
    return Http.fetch({
        url: '/api/user/logout',
        method: 'POST',
        body: {
            refresh_token: userInfo.getToken('refresh'),
        },
    })
}

/**
 * 生成文件后缀icon的svg图片
 * @param suffix 后缀名
 * @param background 背景色,如:rgb(255,255,255)
 */
export function buildSuffixSvgUrl(suffix: string, background = '') {
    return (
        import.meta.env.VITE_API_BASE_URL + apiBuildSuffixSvgUrl + '?suffix=' + suffix + (background ? '&background=' + background : '') + '&server=1'
    )
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
    return Http.fetch({
        url: remoteUrl,
        method: 'get',
        params: Object.assign(params, {
            select: true,
            quickSearch: q,
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
