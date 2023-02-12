import * as elIcons from '@element-plus/icons-vue'

export default defineNuxtPlugin(async (nuxtApp) => {
    const icons = elIcons as any
    for (const i in icons) {
        nuxtApp.vueApp.component(`el-icon-${icons[i].name}`, icons[i])
    }
})
