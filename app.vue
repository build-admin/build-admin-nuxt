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
const initData = await initialize()
if (initData?.value?.code == 1) {
    siteConfig.dataFill({ ...initData?.value?.data.site, openMemberCenter: initData?.value?.data.openMemberCenter })
}

// 根据站点名称设置默认标题模板
useServerSeoMeta({
    titleTemplate: (titleChunk?: string) => {
        return titleChunk ? `${titleChunk} - ${initData?.value?.data.site.siteName}` : initData?.value?.data.site.siteName
    },
})
</script>
