import type { FetchError } from 'ofetch'
import { _AsyncData } from 'nuxt/dist/app/composables/asyncData'

export const state: () => 'disable' | 'enable' = () => 'disable'

export function fileUpload<DataT = any>(fd: FormData, params: anyObj = {}): Promise<_AsyncData<ApiResponse<DataT>, FetchError | null>> {
    // 上传扩展，定义此函数，并将上方的 state 设定为 enable，系统可自动使用此函数进行上传
    return new Promise((resolve, reject) => {
        console.log(fd, params)
        reject('未定义')
    })
}
