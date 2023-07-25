<template>
    <el-header class="ba-header">
        <el-row justify="center">
            <el-col class="ba-header-row" :xs="24" :sm="24" :md="16">
                <client-only>
                    <div @click="navigateTo({ name: '/' })" class="header-logo">
                        <img src="~/assets/images/logo.png" />
                        <span class="site-name">{{ siteConfig.siteName }}</span>
                    </div>
                    <div
                        v-if="!memberCenter.state.menuExpand"
                        @click="memberCenter.toggleMenuExpand(true)"
                        class="user-menus-expand hidden-md-and-up"
                    >
                        <Icon name="fa fa-indent" color="var(--el-color-primary)" size="20" />
                    </div>

                    <!-- globals.menu.show 解决切换路由时菜单内部的 el-popper 报警告的问题 -->
                    <!-- Slot "default" invoked outside of the render function -->
                    <el-scrollbar class="hidden-sm-and-down">
                        <Menu class="frontend-header-menu" :ellipsis="false" mode="horizontal" />
                    </el-scrollbar>
                </client-only>
            </el-col>
        </el-row>
        <client-only>
            <el-drawer
                class="ba-aside-drawer"
                :append-to-body="true"
                v-model="memberCenter.state.menuExpand"
                :with-header="false"
                direction="ltr"
                size="40%"
            >
                <div class="ba-header-row">
                    <div @click="navigateTo({ name: '/' })" class="header-logo">
                        <img src="~/assets/images/logo.png" />
                        <span class="site-name">{{ siteConfig.siteName }}</span>
                    </div>
                    <div @click="memberCenter.toggleMenuExpand(false)" class="user-menus-expand hidden-md-and-up">
                        <Icon name="fa fa-dedent" color="var(--el-color-primary)" size="20" />
                    </div>
                </div>
                <Menu :show-icon="true" mode="vertical" />
            </el-drawer>
        </client-only>
    </el-header>
</template>

<script setup lang="ts">
const siteConfig = useSiteConfig()
const memberCenter = useMemberCenter()
</script>

<style scoped lang="scss">
.ba-header {
    background-color: var(--ba-bg-color-overlay);
    box-shadow: 0 0 8px rgba(0 0 0 / 8%);
    .frontend-header-menu {
        height: var(--el-header-height);
    }
}
.ba-header-row {
    display: flex;
    justify-content: space-between;
    .header-logo {
        display: flex;
        height: var(--el-header-height);
        align-items: center;
        padding-right: 15px;
        cursor: pointer;
        img {
            height: 34px;
            width: 34px;
        }
        .site-name {
            padding-left: 4px;
            font-size: var(--el-font-size-large);
            white-space: nowrap;
        }
    }
    .user-menus-expand {
        display: flex;
        height: var(--el-header-height);
        align-items: center;
        justify-content: center;
    }
}
.ba-aside-drawer {
    .ba-header-row {
        padding: 10px 20px;
        background-color: var(--el-color-info-light-9);
        .header-logo {
            img {
                height: 28px;
                width: 28px;
            }
        }
    }
}

@at-root html.dark {
    .header-logo .site-name {
        color: var(--el-text-color-primary);
    }
}
@media screen and (max-width: 768px) {
    .user-menus-expand {
        padding: 0;
    }
}
@media screen and (max-width: 414px) {
    .frontend-header-menu :deep(.el-sub-menu .el-sub-menu__title) {
        padding: 0 20px;
        .el-icon {
            display: none;
        }
    }
}
</style>
