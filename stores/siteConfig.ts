import type { Menus, SiteConfig } from '~/stores/interface'

export const useSiteConfig = defineStore('siteConfig', {
    state: (): SiteConfig => {
        return {
            siteName: '',
            recordNumber: '',
            version: '',
            cdnUrl: '',
            apiUrl: '',
            upload: {
                mode: 'local',
            },
            headNav: [],
            initialize: false,
            userInitialize: false,
        }
    },
    actions: {
        dataFill(state: Partial<SiteConfig>) {
            this.$patch(state)
        },
        setHeadNav(headNav: Menus[]) {
            this.headNav = headNav
        },
        setInitialize(initialize: boolean) {
            this.initialize = initialize
        },
        setUserInitialize(userInitialize: boolean) {
            this.userInitialize = userInitialize
        },
    },
})
