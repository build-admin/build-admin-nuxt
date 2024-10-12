<template>
    <div>
        <el-container class="is-vertical">
            <BaHeader />
            <el-scrollbar :style="calcHeight(60)" class="main-scrollbar" ref="mainScrollbarRef">
                <el-row class="layouts-main" justify="center">
                    <el-col class="user-layouts" :span="16" :xs="24">
                        <BaAside class="hidden-sm-and-down" />
                        <el-main class="layout-main">
                            <slot />
                        </el-main>
                    </el-col>
                </el-row>
                <BaFooter />
            </el-scrollbar>
        </el-container>
    </div>
</template>

<script setup lang="ts">
import type { ScrollbarInstance } from 'element-plus'

const route = useRoute()
const mainScrollbarRef = ref<ScrollbarInstance>()

// 路由切换时滚动条滚动至顶部
watch(
    () => route.fullPath,
    () => {
        if (!route.meta.disableScrollTo) {
            mainScrollbarRef?.value?.scrollTo(0, 0)
        }
    }
)

// 将滚动条的 ref provide 给子级组件
provide('mainScrollbarRef', mainScrollbarRef)
</script>

<style scoped lang="scss">
.user-layouts {
    display: flex;
    padding-top: 15px;
    align-items: flex-start;
}
.layout-main {
    padding: 0 !important;
    overflow-x: hidden;
}
</style>
