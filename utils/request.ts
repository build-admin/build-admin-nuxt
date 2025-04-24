import type { LoadingOptions } from 'element-plus'
import { ElLoading, ElNotification } from 'element-plus'
import { isArray } from 'lodash-es'
import { getLanguage } from '~/lang'
import { i18n } from '~/plugins/i18n'
import { USER_TOKEN_KEY } from '~/stores/constant/keys'

const requestStatus: RequestStatus = {
    loading: {
        target: null,
        count: 0,
    },
}

export class Http {
    /**
     * 网络请求（使用 useFetch 实现，并配置了请求参数）
     * @param options 请求参数（url、method 等），请参考 useFetch 文档
     * @param config 请求配置（简洁响应、开启成功提示等），请看类型定义
     * @param loading ElLoading 的参数，config.loading 开启时有效
     * @return 同 useFetch code != 1 任然进 then，nuxt 不支持在响应拦截中 reject（服务端请求时无法渲染）
     */
    static async fetch<DataT = any>(
        options: FetchOptions<DataT>,
        config: Partial<FetchConfig> = {},
        loading: LoadingOptions = {}
    ): HttpFetchResponse<DataT> {
        const requestConfigData = requestConfig(options, config, loading)
        if (requestConfigData.config.reductDataFormat && !requestConfigData.options.pick) {
            requestConfigData.options.pick = ['data']
        }

        const res = await useFetch(requestConfigData.options.url ? requestConfigData.options.url : '', requestConfigData.options)
        if (res.error.value) {
            ElNotification({
                type: 'error',
                message: res.error.value?.message,
                zIndex: 9999,
            })
        }

        // 响应拦截，useFetch 的 onResponse 无法使用 navigateTo
        if (res.data.value) {
            onResponseInterceptor(res.data.value, requestConfigData)
        }

        return Promise.resolve(res)
    }

    /**
     * 网络请求（使用 $fetch 实现，并配置了请求参数）
     */
    static $fetch<DataT = any>(
        options: NitroFetchOptions,
        config: Partial<FetchConfig> = {},
        loading: LoadingOptions = {}
    ): HttpOFetchResponse<DataT> {
        const requestConfigData = requestConfig(options, config, loading)

        // 响应拦截
        requestConfigData.options.onResponse = ({ response }) => {
            if (response._data) {
                onResponseInterceptor(response._data, requestConfigData)
            }
        }

        return $fetch<ApiResponse<DataT>>(requestConfigData.options.url ? requestConfigData.options.url : '', requestConfigData.options)
    }
}

/**
 * 请求配置组装
 * 开发者可以导出它然后传递给 nuxt 的网络请求方法(useFetch、useLazyFetch等)使用
 * @param options useFetch 的 options，额外一个 url 字段
 * @param config 请求配置，请看类型定义
 * @param loading loading 配置，config 内开启 loading 有效
 */
export const requestConfig = <OptionsType extends NitroFetchOptions | FetchOptions>(
    options: OptionsType,
    config: Partial<FetchConfig> = {},
    loading: LoadingOptions = {}
) => {
    const userInfo = useUserInfo()
    const requestEvent = useRequestEvent()
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
            if (!options.headers.has(USER_TOKEN_KEY)) {
                const userToken = userInfo.getToken('auth')
                if (userToken) options.headers.set(USER_TOKEN_KEY, userToken)
            }

            if (import.meta.server && requestEvent) {
                /**
                 * 本工程所属的 node 服务端收到了 x-real-ip 等 header，则继续转发至 PHP 服务端
                 * 1. 通常可由本工程上层的代理服务传递，比如 Nginx
                 * 2. 若转发了 x-real-ip，PHP 服务端不会直接认可该 IP 数据，除非配置了 buildadmin.proxy_server_ip
                 */
                const serverIpHeaders = ['x-real-ip', 'x-forwarded-for', 'client-ip', 'x-client-ip']
                for (const key in serverIpHeaders) {
                    if (requestEvent.headers.has(serverIpHeaders[key])) {
                        options.headers.set(serverIpHeaders[key], requestEvent.headers.get(serverIpHeaders[key])!)
                    }
                }
            }
        },
        onResponseError: ({ response }) => {
            config.showErrorMessage && httpErrorStatusHandle(response) // 处理错误状态码
        },
        ...options,
    }
    if (options.params) {
        let params: anyObj = {}
        for (const key in options.params) {
            if (isArray(options.params[key as keyof typeof options.params])) {
                const tempParams: anyObj = {}
                for (const pKey in options.params[key as keyof typeof options.params]) {
                    tempParams[key + '[' + pKey + ']'] = options.params[key as keyof typeof options.params][pKey]
                }
                delete options.params[key as keyof typeof options.params]
                params = { ...params, ...tempParams }
            }
        }
        options.params = { ...options.params, ...params }
    }

    return { options, config, loading }
}

const onResponseInterceptor = (
    data: ApiResponse,
    requestConfigData: { options: NitroFetchOptions | FetchOptions; config: Partial<FetchConfig>; loading: LoadingOptions }
) => {
    requestConfigData.config.loading && closeLoading(requestConfigData.config) // 关闭loading
    if (data.code != 1) {
        // 排除 303 和 409，防止多个错误消息弹出
        if (requestConfigData.config.showCodeMessage && data.msg && ![303, 409].includes(data.code)) {
            ElNotification({ type: 'error', message: data.msg, zIndex: 9999 })
        }

        if (import.meta.client && data.data && [303, 409].includes(data.code)) {
            const route = useRoute()
            let newRouteName = 'user'

            if ((data.data.type && data.data.type == 'need login') || data.code == 409) {
                // 需要重新登录
                const userInfo = useUserInfo()
                userInfo.removeToken()

                newRouteName += 'Login'
            }

            if (route.name != newRouteName) {
                ElNotification({ type: 'error', message: data.msg, zIndex: 9999 })
                navigateTo({ name: newRouteName })
            }
        }
    } else if (requestConfigData.config.showSuccessMessage && data.code == 1) {
        ElNotification({
            message: data.msg ? data.msg : i18n.global.t('request.Operation successful'),
            type: 'success',
            zIndex: 9999,
        })
    }
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
        zIndex: 9999,
    })
}
