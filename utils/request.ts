import { UseFetchOptions } from 'nuxt/dist/app/composables/fetch'
import { ElLoading, LoadingOptions, ElNotification } from 'element-plus'
import { getLanguage } from '~/lang'
import { i18n } from '~/plugins/i18n'
import { _AsyncData } from 'nuxt/dist/app/composables/asyncData'

interface FetchOptions<DataT = any> extends UseFetchOptions<ApiResponse<DataT>> {
    url: string
}
const loadingInstance: LoadingInstance = {
    target: null,
    count: 0,
}

export class Http {
    /**
     * 网络请求
     * @param options 请求参数（url、method 等），请参考 useFetch 文档
     * @param config 请求配置（简洁响应、开启成功提示等），请看类型定义
     * @param loading ElLoading 的参数，config.loading 开启时有效
     * 本方法 code != 1 进 catch，只返回 data
     */
    static async request<DataT = any>(
        options: FetchOptions<DataT>,
        config: Partial<FetchConfig> = {},
        loading: LoadingOptions = {}
    ): Promise<Ref<ApiResponse<DataT> | null>> {
        const { data } = await useFetch(options.url, requestConfig(options, config, loading))
        return data.value?.code == 1 ? Promise.resolve(data) : Promise.reject(data)
    }

    /**
     * 网络请求（配置好了请求参数的 useFetch）
     * @param options 请求参数（url、method 等），请参考 useFetch 文档
     * @param config 请求配置（简洁响应、开启成功提示等），请看类型定义
     * @param loading ElLoading 的参数，config.loading 开启时有效
     * 本方法 code != 1 任然进 then，nuxt暂不支持在响应拦截中 reject
     */
    static async fetch<DataT = any>(options: FetchOptions<DataT>, config: Partial<FetchConfig> = {}, loading: LoadingOptions = {}) {
        if (config.reductDataFormat && !options.pick) {
            options.pick = ['data']
        }
        return useFetch(options.url, requestConfig(options, config, loading))
    }
}

/**
 * 请求通用配置组装
 * 开发者可以导出它然后直接传递给 nuxt 的网络请求方法(useFetch、useLazyFetch等)使用
 * @param options useFetch 的 options，此处不含 url 字段
 * @param config 请求配置，请看类型定义
 * @param loading loading 配置，config 内开启 loading 有效
 */
export const requestConfig = <DataT = any>(
    options: UseFetchOptions<ApiResponse<DataT>> = {},
    config: Partial<FetchConfig> = {},
    loading: LoadingOptions = {}
): UseFetchOptions<ApiResponse<DataT>> => {
    const userInfo = useUserInfo()
    const runtimeConfig = useRuntimeConfig()
    config = Object.assign(
        {
            loading: false, // 是否开启loading层效果, 默认为false
            reductDataFormat: false, // 是否开启简洁的数据结构响应,默认为false,只 Http.fetch 支持
            showErrorMessage: true, // 是否开启接口错误信息展示,默认为true
            showCodeMessage: true, // 是否开启code不为1时的信息提示, 默认为true
            showSuccessMessage: false, // 是否开启code为1时的信息提示, 默认为false
        },
        config
    )

    return {
        baseURL: runtimeConfig.public.apiBaseUrl,
        headers: {
            server: 'true',
            'think-lang': getLanguage(),
        },
        // 请求拦截
        onRequest: ({ options }) => {
            // 创建loading实例
            if (config.loading) {
                loadingInstance.count++
                if (loadingInstance.count === 1) {
                    loadingInstance.target = ElLoading.service(loading)
                }
            }

            // 自动携带token
            options.headers = options.headers || {}
            const userToken = userInfo.getToken('auth')
            if (userToken) (options.headers as anyObj)['ba-user-token'] = userToken
        },
        onResponse: ({ response }) => {
            config.loading && closeLoading(config) // 关闭loading
            if (response._data && response._data.code !== 1) {
                if (response._data.code == 409) {
                    // TODO
                    // 刷新 token
                }
                if (config.showCodeMessage && response._data.msg) {
                    ElNotification({
                        type: 'error',
                        message: response._data.msg,
                    })
                }
                if (response._data.code == 302) {
                    // 自动跳转到路由 name 或 path，仅限 server 端返回302的情况
                    // TODO
                    // 删除 token
                    if (response._data.data.routeName) {
                        navigateTo({ name: response._data.data.routeName })
                    } else if (response._data.data.routePath) {
                        navigateTo({ path: response._data.data.routePath })
                    }
                }
            } else if (config.showSuccessMessage && response._data && response._data.code == 1) {
                ElNotification({
                    message: response._data.msg ? response._data.msg : i18n.global.t('request.Operation successful'),
                    type: 'success',
                })
            }
        },
        onResponseError: ({ response }) => {
            config.showErrorMessage && httpErrorStatusHandle(response) // 处理错误状态码
        },
        ...options,
    }
}

/**
 * 关闭网络请求 Loading 层实例
 */
function closeLoading(options: Partial<FetchConfig>) {
    if (options.loading && loadingInstance.count > 0) loadingInstance.count--
    if (loadingInstance.count === 0) {
        loadingInstance.target.close()
        loadingInstance.target = null
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
