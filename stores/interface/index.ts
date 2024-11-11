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
        /**
         * 在 meta 中存储多个可能用到的属性
         * 兼容 RouteRecordRaw 和 RouteLocationNormalizedLoaded 类型
         */
        id: number
        type: string
        menu_type: 'tab' | 'link' | 'iframe'
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
    // 是否开启会员中心
    open: boolean
    // 从后台加载到的会员中心菜单数据
    userMenus: Menus[]
    // 是否显示一级菜单标题（当有多个一级菜单分组时显示）
    showHeadline: boolean
    // 权限节点
    authNode: Map<string, string[]>
    // 收缩布局（小屏设备）
    shrink: boolean
    // 菜单展开状态（小屏设备）
    menuExpand: boolean
    // 顶栏会员菜单下拉项
    navUserMenus: Menus[]
}
