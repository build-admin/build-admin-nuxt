import * as elIcons from '@element-plus/icons-vue'
import localIcons from '~/assets/script/iconNames'

/*
 * 获取当前页面中从指定域名加载到的样式表内容
 * 样式表未载入前无法获取
 */
export function getStylesFromDomain(domain: string) {
    const sheets = []
    const styles: StyleSheetList = document.styleSheets
    for (const key in styles) {
        if (styles[key].href && (styles[key].href as string).indexOf(domain) > -1) {
            sheets.push(styles[key])
        }
    }
    return sheets
}

/*
 * 获取本地自带的图标
 * /src/assets/icons文件夹内的svg文件
 */
export function getLocalIconfontNames() {
    for (const key in localIcons) {
        if (localIcons[key].startsWith('local-')) break
        localIcons[key] = 'local-' + localIcons[key]
    }
    return localIcons
}

/*
 * 获取 Awesome-Iconfont 的 name 列表
 */
export function getAwesomeIconfontNames() {
    return new Promise<string[]>((resolve, reject) => {
        nextTick(() => {
            const iconfonts = []
            const sheets = getStylesFromDomain('cdn.bootcdn.net/ajax/libs/font-awesome/')
            for (const key in sheets) {
                const rules: any = sheets[key].cssRules
                for (const k in rules) {
                    if (rules[k].selectorText && /^\.fa-(.*)::before$/g.test(rules[k].selectorText)) {
                        if (rules[k].selectorText.indexOf(', ') > -1) {
                            const iconNames = rules[k].selectorText.split(', ')
                            iconfonts.push(`${iconNames[0].substring(1, iconNames[0].length).replace(/\:\:before/gi, '')}`)
                        } else {
                            iconfonts.push(`${rules[k].selectorText.substring(1, rules[k].selectorText.length).replace(/\:\:before/gi, '')}`)
                        }
                    }
                }
            }

            if (iconfonts.length > 0) {
                resolve(iconfonts)
            } else {
                reject('No AwesomeIcon style sheet')
            }
        })
    })
}

/*
 * 获取element plus 自带的图标
 */
export function getElementPlusIconfontNames() {
    return new Promise<string[]>((resolve, reject) => {
        nextTick(() => {
            const iconfonts = []
            const icons = elIcons as any
            for (const i in icons) {
                iconfonts.push(`el-icon-${icons[i].name}`)
            }
            if (iconfonts.length > 0) {
                resolve(iconfonts)
            } else {
                reject('No ElementPlus Icons')
            }
        })
    })
}
