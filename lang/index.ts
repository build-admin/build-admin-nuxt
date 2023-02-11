export function getLangFileMessage(mList: any, locale: string) {
    let msg: anyObj = {}
    locale = '/' + locale
    for (const path in mList) {
        if (mList[path].default) {
            //  获取文件名
            const pathName = path.slice(path.lastIndexOf(locale) + (locale.length + 1), path.lastIndexOf('.'))
            if (pathName.indexOf('/') > 0) {
                msg = handleMsglist(msg, mList[path].default, pathName)
            } else {
                msg[pathName] = mList[path].default
            }
        }
    }
    return msg
}

export function handleMsglist(msg: anyObj, mList: anyObj, pathName: string) {
    const pathNameTmp = pathName.split('/')
    let obj: anyObj = {}
    for (let i = pathNameTmp.length - 1; i >= 0; i--) {
        if (i == pathNameTmp.length - 1) {
            obj = {
                [pathNameTmp[i]]: mList,
            }
        } else {
            obj = {
                [pathNameTmp[i]]: obj,
            }
        }
    }
    return mergeMsg(msg, obj)
}

export function mergeMsg(msg: anyObj, obj: anyObj) {
    for (const key in obj) {
        if (typeof msg[key] == 'undefined') {
            msg[key] = obj[key]
        } else if (typeof msg[key] == 'object') {
            msg[key] = mergeMsg(msg[key], obj[key])
        }
    }
    return msg
}
