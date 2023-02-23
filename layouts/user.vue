<template>
    <div>
        <el-container class="is-vertical">
            <BaHeader />
            <el-scrollbar :style="mainScrollbarHeight()" ref="mainScrollbarRef">
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
import { CSSProperties } from 'vue'

/**
 * main高度
 * @param extra main高度额外减去的px数,可以实现隐藏原有的滚动条
 * @returns CSSProperties
 */
function mainScrollbarHeight(extra = 0): CSSProperties {
    let height = extra + 60
    return {
        height: 'calc(100vh - ' + height.toString() + 'px)',
    }
}
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
@media screen and (max-width: 768px) {
    .user-layouts {
        padding-top: 0;
    }
}
</style>
