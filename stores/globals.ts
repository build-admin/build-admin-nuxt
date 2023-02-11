/**
 * 一些全局公用的状态
 */
export const useGlobalsStore = defineStore('globals', {
    state: () => {
        return {
            unique: 0,
            loadLangHandle: {},
        }
    },
})

if (import.meta.hot) import.meta.hot.accept(acceptHMRUpdate(useGlobalsStore, import.meta.hot))
