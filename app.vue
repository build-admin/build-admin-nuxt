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
import type { Language } from 'element-plus/es/locale'
const { locale, getLocaleMessage } = useI18n()
const messages = getLocaleMessage(locale.value) as Language
</script>
