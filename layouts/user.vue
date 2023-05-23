<template>
    <div>
        <el-container class="is-vertical">
            <BaHeader />
            <el-scrollbar :style="calcHeight(60)" ref="mainScrollbarRef">
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

<script setup lang="ts"></script>

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
