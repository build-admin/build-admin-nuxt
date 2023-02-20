const accountUrl = '/api/account/'
const controllerUrl = '/api/user/'

export function checkIn(method: 'get' | 'post', params: object = {}) {
    const opt = method == 'get' ? {} : { body: params }
    return Http.request({
        url: controllerUrl + 'checkIn',
        method: method,
        ...opt,
    })
}

export function retrievePassword(params: anyObj) {
    return Http.request(
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
