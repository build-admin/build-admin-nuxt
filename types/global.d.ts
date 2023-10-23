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
    // 因303、409中断了请求
    requestInterrupt: boolean
}
