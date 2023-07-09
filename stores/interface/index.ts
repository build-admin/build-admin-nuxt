import type { RouteRecordRaw, RouteLocationNormalized } from 'vue-router'

export interface Globals {
    lazy: NodeJS.Timer | null
    unique: Ref<number>
    loadLangHandle: Record<string, any>
}

export interface Menus {
    id: number
    name: string
    type: string
    path: string
    title: string
    url: string
    meta: {
        type: 'tab' | 'link' | 'iframe'
    }
    children: Menus[]
}

export interface SiteConfig {
    siteName: string
    recordNumber?: string
    version: string
    cdnUrl: string
    apiUrl: string
    upload: {
        mode: string
        maxsize: number
        mimetype: string
        savename: string
        url?: string
        params?: anyObj
    }
    headNav: Menus[]
}

export interface UserInfo {
    id: number
    username: string
    nickname: string
    email: string
    mobile: string
    gender: number
    birthday: string
    money: number
    score: number
    avatar: string
    last_login_time: string
    last_login_ip: string
    join_time: string
    motto: string
    token: string
    refresh_token: string
}

export interface MemberCenter {
    open: boolean
    activeRoute: RouteRecordRaw | RouteLocationNormalized | null
    viewRoutes: RouteRecordRaw[]
    showHeadline: boolean
    authNode: Map<string, string[]>
    shrink: boolean
    menuExpand: boolean
    navUserMenus: Menus[]
}
