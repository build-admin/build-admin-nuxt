import NProgress from 'nprogress'
import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import langAutoLoadMap from '~/lang/autoload'
import { uniq } from 'lodash-es'
import { i18n } from './i18n'
import { mergeMessage } from '~/lang/index'

export default defineNuxtPlugin(() => {
    const router = useRouter()
    router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
        // 修复切换路由时顶栏菜单内部的 el-popper 报警告的问题
        globals.menu.show = false

        if (process.client) {
            // 进度条
            NProgress.configure({ showSpinner: false })
            NProgress.start()

            setTimeout(() => {
                globals.menu.show = true
            }, 200)
        }

        // 按需动态加载页面的语言包-start
        let loadPath: string[] = []
        const locale = i18n.global.locale.value

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
            loadPath[key] = loadPath[key].replace(/\$\{lang\}/g, locale)
            if (loadPath[key] in globals.loadLangHandle) {
                const res = await globals.loadLangHandle[loadPath[key]]()
                if (res.default) {
                    const pathName = loadPath[key].slice(loadPath[key].lastIndexOf(prefix) + (prefix.length + 1), loadPath[key].lastIndexOf('.'))
                    mergeMessage(res.default, pathName)
                }
            }
        }
        // 动态加载语言包-end

        next()
    })

    router.afterEach(() => {
        if (process.client) {
            NProgress.done()
            const memberCenter = useMemberCenter()
            memberCenter.state.menuExpand = false
        }
    })
})
