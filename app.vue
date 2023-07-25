<template>
    <div>
        <el-config-provider :locale="messages">
            <NuxtLayout>
                <NuxtPage />
            </NuxtLayout>
        </el-config-provider>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { initialize } from '~/api/common'
import type { Language } from 'element-plus/es/locale'
import { useSiteConfig } from '~/stores/siteConfig'

const { locale, getLocaleMessage } = useI18n()
const messages = getLocaleMessage(locale.value) as Language

const siteConfig = useSiteConfig()
const memberCenter = useMemberCenter()
const { data } = await initialize()
if (data.value?.code == 1) {
    siteConfig.dataFill(data.value.data.site)
    memberCenter.setStatus(data.value.data.openMemberCenter)
    if (data.value.data.rules) {
        memberCenter.mergeAuthNode(handleAuthNode(data.value.data.rules, '/'))
        memberCenter.setNavUserMenus(handleMenus(data.value.data.rules, '/', ['nav_user_menu']))
        siteConfig.setHeadNav(handleMenus(data.value.data.rules, '/', ['nav']))
    }
}

// 根据站点名称设置默认标题模板
useSeoMeta({
    titleTemplate: (titleChunk?: string) => {
        return titleChunk ? `${titleChunk} - ${siteConfig.siteName}` : siteConfig.siteName
    },
})
</script>
