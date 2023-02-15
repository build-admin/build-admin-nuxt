export interface Globals {
    lazy: NodeJS.Timer | null
    unique: Ref<number>
    loadLangHandle: Record<string, any>
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
    openMemberCenter?: boolean
}
