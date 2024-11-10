export interface Globals {
    // 防抖计时器
    lazy: NodeJS.Timeout | null
    // 随机数生成时的唯一性自增种子
    unique: Ref<number>
    // 语言包懒加载句柄
    loadLangHandle: Record<string, any>
}

export interface Menus {
    id: number
    name: string
    type: string
    path: string
    title: string
    url: string
    icon: string
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
        [key: string]: any
    }
    headNav: Menus[]
    initialize: boolean
    userInitialize: boolean
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
    userMenus: Menus[]
    showHeadline: boolean
    authNode: Map<string, string[]>
    shrink: boolean
    menuExpand: boolean
    navUserMenus: Menus[]
}
