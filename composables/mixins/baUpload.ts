import { ElNotification } from 'element-plus'

export const state: () => 'disable' | 'enable' = () => 'disable'

export function fileUpload<DataT = any>(fd: FormData, params: anyObj = {}): HttpFetchResponse<DataT> {
    // 上传扩展，定义此函数，并将上方的 state 设定为 enable，系统可自动使用此函数进行上传
    return new Promise((resolve, reject) => {
        console.log(fd, params)
        ElNotification({
            type: 'error',
            message: '上传扩展未定义！',
        })
        reject('未定义')

        // 成功上传示例
        const res = {
            code: 1,
            data: {
                file: {
                    full_url: fullUrl('file_url'),
                    url: 'file_url',
                },
            },
            msg: '',
            time: Date.now(),
        }
        resolve({ data: ref(res) } as unknown as HttpFetchResponse<DataT>)
    })
}
