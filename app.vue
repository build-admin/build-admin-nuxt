<template>
    <div>
        <el-config-provider :value-on-clear="() => null" :locale="messages">
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
// modules import mark, Please do not remove.

const { locale, getLocaleMessage } = useI18n()
const messages = getLocaleMessage(locale.value) as Language

// 前端初始化请求
await initialize()

// 根据站点名称设置默认标题模板
useSeoMeta({
    titleTemplate: (titleChunk?: string) => {
        const siteConfig = useSiteConfig()
        return titleChunk ? `${titleChunk} - ${siteConfig.siteName}` : siteConfig.siteName
    },
})

// modules start mark, Please do not remove.
</script>
