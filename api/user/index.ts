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
