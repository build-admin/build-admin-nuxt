import * as elIcons from '@element-plus/icons-vue'
import localIcons from '~/assets/script/iconNames'

/**
 * 获取Vite开发服务/编译后的样式表内容
 * @param devID style 标签的 viteDevId，只开发服务有
 */
function getStylesFromVite(devId: string, CSSRuleLang = 0) {
    const sheets = []
    const styles: StyleSheetList = document.styleSheets
    if (import.meta.env.MODE == 'production') {
        for (const key in styles) {
            if (styles[key].cssRules && styles[key].cssRules.length >= CSSRuleLang) {
                sheets.push(styles[key])
            }
        }
        return sheets
    }
    for (const key in styles) {
        const ownerNode = styles[key].ownerNode as HTMLMapElement
        if (ownerNode && ownerNode.dataset?.viteDevId && ownerNode.dataset.viteDevId!.indexOf(devId) > -1) {
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
            const sheets = getStylesFromVite('font-awesome.min.css', 712)
            for (const key in sheets) {
                const rules: any = sheets[key].cssRules
                for (const k in rules) {
                    if (!rules[k].selectorText || rules[k].selectorText.indexOf('.fa-') !== 0) {
                        continue
                    }
                    if (/^\.fa-(.*)::before$/g.test(rules[k].selectorText)) {
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
