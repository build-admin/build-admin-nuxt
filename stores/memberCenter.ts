import { MemberCenter, Menus } from '~/stores/interface/index'
import type { RouteLocationNormalized, RouteRecordRaw } from 'vue-router'

export const useMemberCenter = defineStore('memberCenter', () => {
    const state: MemberCenter = reactive({
        // 是否开启会员中心
        open: false,
        // 当前激活菜单
        activeRoute: null,
        // 从后台加载到的，会员中心菜单
        userMenus: [],
        // 是否显示一级菜单标题(当有多个一级菜单分组时显示)
        showHeadline: false,
        // 权限节点
        authNode: new Map(),
        // 收缩布局
        shrink: false,
        // 菜单展开（小屏设备）
        menuExpand: false,
        // 顶栏会员菜单下拉项
        navUserMenus: [],
    })

    const setNavUserMenus = (menus: Menus[]) => {
        state.navUserMenus = menus
    }

    const setAuthNode = (key: string, data: string[]) => {
        state.authNode.set(key, data)
    }

    const mergeAuthNode = (authNode: Map<string, string[]>) => {
        state.authNode = new Map([...state.authNode, ...authNode])
    }

    const setUserMenus = (menus: Menus[]): void => {
        state.userMenus = encodeRoutesURI(menus)
    }

    const setShowHeadline = (show: boolean): void => {
        state.showHeadline = show
    }

    const setActiveRoute = (route: RouteLocationNormalized | RouteRecordRaw) => {
        state.activeRoute = route
    }

    const setShrink = (shrink: boolean) => {
        state.shrink = shrink
    }

    const setStatus = (status: boolean) => {
        state.open = status
    }

    const toggleMenuExpand = (expand = !state.menuExpand) => {
        state.menuExpand = expand
    }

    return {
        state,
        setAuthNode,
        setNavUserMenus,
        mergeAuthNode,
        setUserMenus,
        setShowHeadline,
        setActiveRoute,
        setShrink,
        setStatus,
        toggleMenuExpand,
    }
})

function encodeRoutesURI(data: Menus[]) {
    data.forEach((item) => {
        if (item.meta?.type == 'iframe') {
            item.path = '/user/iframe/' + encodeURIComponent(item.path)
        }

        if (item.children && item.children.length) {
            item.children = encodeRoutesURI(item.children)
        }
    })
    return data
}
