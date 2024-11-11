import type { MemberCenter, Menus } from '~/stores/interface/index'

export const useMemberCenter = defineStore('memberCenter', () => {
    const state: MemberCenter = reactive({
        open: false,
        userMenus: [],
        showHeadline: false,
        authNode: new Map(),
        shrink: false,
        menuExpand: false,
        navUserMenus: [],
    })

    const setNavUserMenus = (menus: Menus[]) => {
        state.navUserMenus = menus
    }

    const mergeNavUserMenus = (menus: Menus[]) => {
        state.navUserMenus = [...state.navUserMenus, ...menus]
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
        mergeNavUserMenus,
        mergeAuthNode,
        setUserMenus,
        setShowHeadline,
        setShrink,
        setStatus,
        toggleMenuExpand,
    }
})

function encodeRoutesURI(data: Menus[]) {
    data.forEach((item) => {
        if (item.meta.menu_type == 'iframe') {
            item.path = '/user/iframe/' + encodeURIComponent(item.path)
        }

        if (item.children && item.children.length) {
            item.children = encodeRoutesURI(item.children)
        }
    })
    return data
}
