export const useGlobalsStore = defineStore('globals', {
    state: () => {
        return {
            loadLangHandle: {},
        }
    },
})

if (import.meta.hot) import.meta.hot.accept(acceptHMRUpdate(useGlobalsStore, import.meta.hot))
