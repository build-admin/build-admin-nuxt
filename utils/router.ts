import type { RouteRecordRaw } from 'vue-router'
import { i18n } from '~/plugins/i18n'
import { Menus } from '~/stores/interface'

/**
 * 获取第一个菜单
 */
export const getFirstRoute = (routes: RouteRecordRaw[]): false | RouteRecordRaw => {
    const routerPaths: string[] = []
    const router = useRouter()
    const routers = router.getRoutes()
    routers.forEach((item) => {
        if (item.path) routerPaths.push(item.path)
    })
    let find: boolean | RouteRecordRaw = false
    for (const key in routes) {
        if (routes[key].meta?.type != 'menu_dir' && routerPaths.indexOf(routes[key].path) !== -1) {
            return routes[key]
        } else if (routes[key].children && routes[key].children?.length) {
            find = getFirstRoute(routes[key].children!)
            if (find) return find
        }
    }
    return find
}

/**
 * 打开侧边菜单
 * @param menu 菜单数据
 */
export const onClickMenu = (menu: RouteRecordRaw) => {
    switch (menu.meta?.type) {
        case 'iframe':
        case 'tab':
            navigateTo({ path: menu.path })
            break
        case 'link':
            window.open(menu.path, '_blank')
            break

        default:
            ElNotification({
                message: i18n.global.t('utils.Navigation failed, the menu type is unrecognized!'),
                type: 'error',
            })
            break
    }
}

/**
 * 处理权限节点
 * @param routes 路由数据
 * @param prefix 节点前缀
 * @returns 组装好的权限节点
 */
export const handleAuthNode = (routes: any, prefix = '/') => {
    const authNode: Map<string, string[]> = new Map([])
    assembleAuthNode(routes, authNode, prefix, prefix)
    return authNode
}
const assembleAuthNode = (routes: any, authNode: Map<string, string[]>, prefix = '/', parent = '/') => {
    const authNodeTemp = []
    for (const key in routes) {
        if (routes[key].type == 'button') authNodeTemp.push(prefix + routes[key].name)
        if (routes[key].children && routes[key].children.length > 0) {
            assembleAuthNode(routes[key].children, authNode, prefix, prefix + routes[key].name)
        }
    }
    if (authNodeTemp && authNodeTemp.length > 0) {
        authNode.set(parent, authNodeTemp)
    }
}

export const registerMenus = (rules: any, menus: any) => {
    const siteConfig = useSiteConfig()
    const memberCenter = useMemberCenter()
    if (rules.length) {
        memberCenter.mergeAuthNode(handleAuthNode(rules, '/'))
        siteConfig.setHeadNav(handleMenus(rules, '/', ['nav']))
        memberCenter.mergeNavUserMenus(handleMenus(rules, '/', ['nav_user_menu']))
    }
    if (menus.length) {
        const menuMemberCenterBaseRoute = '/user/'
        memberCenter.mergeAuthNode(handleAuthNode(menus, menuMemberCenterBaseRoute))

        memberCenter.mergeNavUserMenus(handleMenus(menus, '/', ['nav_user_menu']))
        memberCenter.setShowHeadline(menus.length > 1 ? true : false)
        memberCenter.setUserMenus(handleMenus(menus, menuMemberCenterBaseRoute, ['menu', 'menu_dir']))
    }
}

export const handleMenus = (rules: anyObj, prefix = '/', type = ['nav']) => {
    const menus: Menus[] = []
    for (const key in rules) {
        if (rules[key].extend == 'add_rules_only') {
            continue
        }
        if (rules[key].type == 'menu_dir' && rules[key].children && !rules[key].children.length) {
            continue
        }
        let children: Menus[] = []
        if (rules[key].children && rules[key].children.length > 0) {
            children = handleMenus(rules[key].children, prefix, type)
        }

        if (type.includes(rules[key].type)) {
            let path = ''
            if (['link', 'iframe'].includes(rules[key].menu_type)) {
                path = rules[key].url
            } else {
                path = prefix + rules[key].path
            }
            menus.push({
                ...rules[key],
                meta: {
                    type: rules[key].menu_type,
                },
                path: path,
                children: children,
            })
        }
    }
    return menus
}
