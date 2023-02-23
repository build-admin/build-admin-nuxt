import type { RouteRecordRaw } from 'vue-router'

/**
 * 会员中心菜单规则处理
 * @param routes 菜单规则数据
 * @param pathPrefix 路径前缀
 * @param parent 上级规则
 */
export const handleMenuRule = (routes: any, pathPrefix = '/', parent = '/') => {
    const menuRule: RouteRecordRaw[] = []
    const authNode: string[] = []
    for (const key in routes) {
        if (routes[key].extend == 'add_rules_only') {
            continue
        }
        if (routes[key].type == 'menu' || routes[key].type == 'menu_dir') {
            if (routes[key].type == 'menu_dir' && routes[key].children && !routes[key].children.length) {
                continue
            }
            const currentPath = routes[key].menu_type == 'link' || routes[key].menu_type == 'iframe' ? routes[key].url : pathPrefix + routes[key].path
            let children: RouteRecordRaw[] = []
            if (routes[key].children && routes[key].children.length > 0) {
                children = handleMenuRule(routes[key].children, pathPrefix, currentPath)
            }
            menuRule.push({
                path: currentPath,
                name: routes[key].name,
                component: routes[key].component,
                meta: {
                    title: routes[key].title,
                    icon: routes[key].icon,
                    keepalive: routes[key].keepalive,
                    type: routes[key].menu_type,
                },
                children: children,
            })
        } else {
            // 权限节点
            authNode.push(pathPrefix + routes[key].name)
        }
    }
    if (authNode.length) {
        const memberCenter = useMemberCenter()
        memberCenter.setAuthNode(parent, authNode)
    }
    return menuRule
}

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
