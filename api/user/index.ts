const accountUrl = '/api/account/'
const controllerUrl = '/api/user/'

export function index() {
    return Http.fetch({
        url: controllerUrl + 'index',
        method: 'get',
    })
}

export function checkIn(method: 'get' | 'post', params: object = {}) {
    const opt = method == 'get' ? {} : { body: params }
    return Http.fetch({
        url: controllerUrl + 'checkIn',
        method: method,
        ...opt,
    })
}

export function retrievePassword(params: anyObj) {
    return Http.fetch(
        {
            url: accountUrl + 'retrievePassword',
            method: 'POST',
            body: params,
        },
        {
            showSuccessMessage: true,
        }
    )
}

export function overview() {
    return Http.fetch({
        url: accountUrl + 'overview',
        method: 'get',
    })
}

export function getProfile() {
    return Http.fetch({
        url: accountUrl + 'profile',
        method: 'get',
    })
}

export function postProfile(params: anyObj) {
    return Http.fetch(
        {
            url: accountUrl + 'profile',
            method: 'POST',
            body: params,
        },
        {
            showSuccessMessage: true,
        }
    )
}

export function postVerification(data: anyObj) {
    return Http.fetch({
        url: accountUrl + 'verification',
        method: 'post',
        body: data,
    })
}

export function postChangeBind(data: anyObj) {
    return Http.fetch(
        {
            url: accountUrl + 'changeBind',
            method: 'post',
            body: data,
        },
        {
            showSuccessMessage: true,
        }
    )
}

export function changePassword(params: anyObj) {
    return Http.fetch(
        {
            url: accountUrl + 'changePassword',
            method: 'POST',
            body: params,
        },
        {
            showSuccessMessage: true,
        }
    )
}
