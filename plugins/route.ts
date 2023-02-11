import NProgress from 'nprogress'
import { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import langAutoLoadMap from '~/lang/autoload'
import { uniq } from 'lodash-es'
import { mergeMessage } from '~/lang/index'

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.$router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
        if (process.client) {
            NProgress.configure({ showSpinner: false })
            NProgress.start()
        }

        // 按需动态加载页面的语言包-start
        let loadPath: string[] = []
        const locale = nuxtApp.$i18n.locale.value

        // 根据 autoload.ts 加载的语言包
        if (to.path in langAutoLoadMap) {
            loadPath.push(...langAutoLoadMap[to.path as keyof typeof langAutoLoadMap])
        }

        // 根据访问 path 加载的语言包
        const prefix = '/lang/pages/' + locale
        loadPath.push(prefix + to.path + '.ts')

        // 根据路由 name 加载的语言包
        if (to.name) {
            loadPath.push(prefix + '/' + to.name.toString() + '.ts')
        }
        // 去重
        loadPath = uniq(loadPath)

        for (const key in loadPath) {
            loadPath[key] = loadPath[key].replaceAll('${lang}', locale)
            if (loadPath[key] in globals.loadLangHandle) {
                const res = await globals.loadLangHandle[loadPath[key]]()
                if (res.default) {
                    const pathName = loadPath[key].slice(loadPath[key].lastIndexOf(prefix) + (prefix.length + 1), loadPath[key].lastIndexOf('.'))
                    mergeMessage(nuxtApp, res.default, pathName)
                }
            }
        }
        // 动态加载语言包-end

        next()
    })

    nuxtApp.$router.afterEach(() => {
        if (process.client) {
            NProgress.done()
        }
    })
})
