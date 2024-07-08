import type { AsyncData } from '#app'
import type { FetchError } from 'ofetch'

declare global {
    interface anyObj {
        [key: string]: any
    }

    interface FetchConfig {
        loading: boolean // 是否开启loading层效果, 默认为false
        reductDataFormat: boolean // 是否开启简洁的数据结构响应, 默认为true
        showErrorMessage: boolean // 是否开启接口错误信息展示,如404,默认为true
        showCodeMessage: boolean // 是否开启code不为1时的信息提示, 默认为true
        showSuccessMessage: boolean // 是否开启code为1时的信息提示, 默认为false
    }

    interface ApiResponse<T = any> {
        code: number
        data: T
        msg: string
        time: number
    }

    interface RequestStatus {
        loading: {
            target: any
            count: number
        }
    }

    /**
     * Http.fetch 的返回值类型
     */
    type HttpFetchResponse<DataT> = Promise<AsyncData<ApiResponse<DataT> | null, FetchError | null>>

    /**
     * Http.$fetch 的返回值类型
     */
    type HttpOFetchResponse<DataT> = Promise<ApiResponse<DataT>>

    /**
     * 只读转可写
     */
    type Writeable<T> = { -readonly [P in keyof T]: T[P] }
}
