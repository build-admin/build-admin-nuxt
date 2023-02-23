import { UseFetchOptions } from 'nuxt/dist/app/composables/fetch'
import { ElLoading, LoadingOptions, ElNotification } from 'element-plus'
import { getLanguage } from '~/lang'
import { i18n } from '~/plugins/i18n'
import { USER_TOKEN_KEY } from '~/stores/constant/keys'
import type { FetchError } from 'ofetch'
import { _AsyncData } from 'nuxt/dist/app/composables/asyncData'

interface FetchOptions<DataT = any> extends UseFetchOptions<ApiResponse<DataT>> {
    url?: string
}
const requestStatus: RequestStatus = {
    loading: {
        target: null,
        count: 0,
    },
    requestInterrupt: false,
}

export class Http {
    /**
     * 网络请求（配置好了请求参数的 useFetch）
     * @param options 请求参数（url、method 等），请参考 useFetch 文档
     * @param config 请求配置（简洁响应、开启成功提示等），请看类型定义
     * @param loading ElLoading 的参数，config.loading 开启时有效
     * @return 同 useFetch code != 1 任然进 then，nuxt 不支持在响应拦截中 reject（服务端请求时无法渲染）
     */
    static async fetch<DataT = any>(
        options: FetchOptions<DataT>,
        config: Partial<FetchConfig> = {},
        loading: LoadingOptions = {}
    ): Promise<_AsyncData<ApiResponse<DataT>, FetchError | null>> {
        const requestConfigData = requestConfig(options, config, loading)
        if (requestConfigData.config.reductDataFormat && !requestConfigData.options.pick) {
            requestConfigData.options.pick = ['data']
        }

        const res = await useFetch(requestConfigData.options.url ? requestConfigData.options.url : '', requestConfigData.options)
        if (res.error.value) {
            ElNotification({
                type: 'error',
                message: res.error.value?.message,
            })
        }

        // 响应拦截，useFetch 的 onResponse 无法使用 navigateTo
        requestConfigData.config.loading && closeLoading(requestConfigData.config) // 关闭loading
        if (res.data.value?.code != 1) {
            // 排除302和409防止多个错误消息弹出
            if (requestConfigData.config.showCodeMessage && res.data.value?.msg && ![302, 409].includes(res.data.value.code)) {
                ElNotification({ type: 'error', message: res.data.value.msg })
            }

            // 多个请求并发的发送时，会触发多次 navigateTo 导致报错，使用 requestInterrupt 做唯一限制
            if (process.client && !requestStatus.requestInterrupt && res.data.value && [302, 409].includes(res.data.value.code)) {
                const resData = res.data.value.data as anyObj
                const userInfo = useUserInfo()
                userInfo.removeToken()
                requestStatus.requestInterrupt = true
                ElNotification({ type: 'error', message: res.data.value.msg })
                if (resData.routeName) {
                    navigateTo({ name: resData.routeName })
                } else if (resData.routePath) {
                    navigateTo({ path: resData.routePath })
                } else {
                    navigateTo({ path: '/user/login' })
                }
            }
        } else if (requestConfigData.config.showSuccessMessage && res.data.value?.code == 1) {
            ElNotification({
                message: res.data.value.msg ? res.data.value.msg : i18n.global.t('request.Operation successful'),
                type: 'success',
            })
        }

        return new Promise((resolve) => {
            resolve(res)
        })
    }
}

/**
 * 请求配置组装
 * 开发者可以导出它然后传递给 nuxt 的网络请求方法(useFetch、useLazyFetch等)使用
 * @param options useFetch 的 options，额外一个 url 字段
 * @param config 请求配置，请看类型定义
 * @param loading loading 配置，config 内开启 loading 有效
 */
export const requestConfig = <DataT = any>(options: FetchOptions<DataT> = {}, config: Partial<FetchConfig> = {}, loading: LoadingOptions = {}) => {
    const userInfo = useUserInfo()
    const runtimeConfig = useRuntimeConfig()
    config = Object.assign(
        {
            loading: false, // 是否开启loading层效果, 默认为false
            reductDataFormat: false, // 是否开启简洁的数据结构响应,默认为false
            showErrorMessage: true, // 是否开启接口错误信息展示,默认为true
            showCodeMessage: true, // 是否开启code不为1时的信息提示, 默认为true
            showSuccessMessage: false, // 是否开启code为1时的信息提示, 默认为false
        },
        config
    )

    options = {
        baseURL: runtimeConfig.public.apiBaseUrl,
        headers: {
            server: 'true',
            'think-lang': getLanguage(),
        },
        // 请求拦截
        onRequest: ({ options }) => {
            // 创建loading实例
            if (config.loading) {
                requestStatus.loading.count++
                if (requestStatus.loading.count === 1) {
                    requestStatus.loading.target = ElLoading.service(loading)
                }
            }

            // 自动携带token
            options.headers = options.headers || {}
            if (!(options.headers as anyObj)[USER_TOKEN_KEY]) {
                const userToken = userInfo.getToken('auth')
                if (userToken) (options.headers as anyObj)[USER_TOKEN_KEY] = userToken
            }
        },
        onResponseError: ({ response }) => {
            config.showErrorMessage && httpErrorStatusHandle(response) // 处理错误状态码
        },
        ...options,
    }

    return { options, config, loading }
}

/**
 * 关闭网络请求 Loading 层实例
 */
function closeLoading(config: Partial<FetchConfig>) {
    if (config.loading && requestStatus.loading.count > 0) requestStatus.loading.count--
    if (requestStatus.loading.count === 0 && requestStatus.loading.target) {
        requestStatus.loading.target.close()
        requestStatus.loading.target = null
    }
}

/**
 * 处理请求异常
 * @param {*} response
 */
function httpErrorStatusHandle(response: any) {
    // 处理被取消的请求
    let message = ''
    if (response) {
        switch (response.status) {
            case 302:
                message = i18n.global.t('request.Interface redirected!')
                break
            case 400:
                message = i18n.global.t('request.Incorrect parameter!')
                break
            case 401:
                message = i18n.global.t('request.You do not have permission to operate!')
                break
            case 403:
                message = i18n.global.t('request.You do not have permission to operate!')
                break
            case 404:
                message = i18n.global.t('request.Error requesting address:') + response.url
                break
            case 408:
                message = i18n.global.t('request.Request timed out!')
                break
            case 409:
                message = i18n.global.t('request.The same data already exists in the system!')
                break
            case 500:
                message = i18n.global.t('request.Server internal error!')
                break
            case 501:
                message = i18n.global.t('request.Service not implemented!')
                break
            case 502:
                message = i18n.global.t('request.Gateway error!')
                break
            case 503:
                message = i18n.global.t('request.Service unavailable!')
                break
            case 504:
                message = i18n.global.t('request.The service is temporarily unavailable Please try again later!')
                break
            case 505:
                message = i18n.global.t('request.HTTP version is not supported!')
                break
            default:
                message = i18n.global.t('request.Abnormal problem, please contact the website administrator!')
                break
        }
    }
    if (response.statusText.includes('timeout')) message = i18n.global.t('request.Network request timeout!')
    if (response.statusText.includes('Network'))
        message = window.navigator.onLine ? i18n.global.t('request.Server exception!') : i18n.global.t('request.You are disconnected!')

    ElNotification({
        type: 'error',
        message,
    })
}
