<template>
    <el-header class="ba-header">
        <el-row justify="center">
            <el-col class="header-row" :xs="24" :sm="24" :md="16">
                <client-only>
                    <div @click="navigateTo({ name: '/' })" class="header-logo hidden-sm-and-down">
                        <img src="~/assets/images/logo.png" />
                        <span class="site-name">{{ siteConfig.siteName }}</span>
                    </div>
                    <div
                        v-if="userInfo.isLogin() && memberCenter.state.viewRoutes.length"
                        @click="memberCenter.toggleMenuExpand(true)"
                        class="user-menus-expand hidden-md-and-up"
                    >
                        <Icon name="fa fa-indent" color="var(--el-color-primary)" size="20" />
                    </div>

                    <!-- globals.menu.show 解决切换路由时菜单内部的 el-popper 报警告的问题 -->
                    <!-- Slot "default" invoked outside of the render function -->
                    <el-scrollbar>
                        <el-menu
                            v-if="globals.menu.show"
                            :default-active="state.activeMenu"
                            class="frontend-header-menu"
                            mode="horizontal"
                            :ellipsis="false"
                        >
                            <el-menu-item @click="navigateTo({ name: '/' })" v-blur index="index">{{ $t('Home') }}</el-menu-item>

                            <!-- 动态菜单 -->
                            <MenuSub :menus="siteConfig.headNav" />

                            <template v-if="memberCenter.state.open">
                                <el-sub-menu v-if="userInfo.isLogin()" v-blur index="user-box">
                                    <template #title>
                                        <div class="header-user-box">
                                            <img
                                                class="header-user-avatar"
                                                :src="fullUrl(userInfo.avatar ? userInfo.avatar : '/static/images/avatar.png')"
                                                alt=""
                                            />
                                            {{ userInfo.nickname }}
                                        </div>
                                    </template>
                                    <el-menu-item @click="navigateTo({ name: 'user' })" v-blur index="user">
                                        {{ $t('Member Center') }}
                                    </el-menu-item>
                                    <!-- 动态菜单 -->
                                    <MenuSub :menus="memberCenter.state.navUserMenus" />
                                    <el-menu-item @click="userInfo.logout()" v-blur index="user-logout">{{ $t('Logout login') }}</el-menu-item>
                                </el-sub-menu>
                                <el-menu-item v-else @click="navigateTo({ name: 'user' })" v-blur index="user">
                                    {{ $t('Member Center') }}
                                </el-menu-item>

                                <el-sub-menu v-blur index="switch-language">
                                    <template #title>{{ $t('Language') }}</template>
                                    <el-menu-item
                                        @click="setLanguage(item.name as Locales)"
                                        v-for="item in languageList"
                                        :key="item.name"
                                        :index="'switch-language-' + item.value"
                                    >
                                        {{ item.value }}
                                    </el-menu-item>
                                </el-sub-menu>

                                <el-menu-item index="theme-switch" class="theme-switch">
                                    <DarkSwitch @click="setDark(!getDark())" />
                                </el-menu-item>
                            </template>
                        </el-menu>
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
                <BaAside />
            </el-drawer>
        </client-only>
    </el-header>
</template>

<script setup lang="ts">
import { Locales, languageList, setLanguage } from '~/lang/index'
import { RouteLocationNormalizedLoaded } from 'vue-router'
const userInfo = useUserInfo()
const siteConfig = useSiteConfig()
const memberCenter = useMemberCenter()

const state = reactive({
    activeMenu: '',
})

const route = useRoute()

const findMenu = (route: RouteLocationNormalizedLoaded) => {
    for (const key in memberCenter.state.navUserMenus) {
        if (memberCenter.state.navUserMenus[key].path == route.path || memberCenter.state.navUserMenus[key].name == route.name) {
            return memberCenter.state.navUserMenus[key].id
        }
    }
    for (const key in siteConfig.headNav) {
        if (siteConfig.headNav[key].path == route.path || siteConfig.headNav[key].name == route.name) {
            return siteConfig.headNav[key].id
        }
    }
}

const setActiveMenu = (route: RouteLocationNormalizedLoaded) => {
    if (route.path == '/') return (state.activeMenu = 'index')

    // 动态菜单
    const menuId = findMenu(route)
    if (menuId) {
        state.activeMenu = 'column-' + menuId
    } else if (route.path.startsWith('/user')) {
        state.activeMenu = 'user'
    }
}
setActiveMenu(route)

watch(
    () => route.path,
    () => {
        setActiveMenu(route)
    }
)
</script>

<style scoped lang="scss">
.ba-header {
    background-color: var(--ba-bg-color-overlay);
    box-shadow: 0 0 8px rgba(0 0 0 / 8%);
    .header-row {
        display: flex;
        justify-content: space-between;
    }
    .user-menus-expand {
        display: flex;
        height: var(--el-header-height);
        align-items: center;
        justify-content: center;
    }
    .header-user-box {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        .header-user-avatar {
            width: 16px;
            height: 16px;
            margin-right: 4px;
            border-radius: 50%;
        }
    }
    .theme-switch {
        --el-menu-hover-bg-color: none;
        padding-right: 0;
    }
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
    .frontend-header-menu {
        height: var(--el-header-height);
    }
    .switch-language {
        display: flex;
        align-items: center;
        span {
            padding-right: 4px;
        }
    }
}
.el-menu--horizontal {
    margin-left: auto;
    border-bottom: none;
}
.el-menu--horizontal > .el-menu-item,
.el-menu--horizontal > :deep(.el-sub-menu) .el-sub-menu__title,
.el-menu--horizontal > .el-menu-item.is-active {
    border-bottom: none;
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

    .theme-toggle-content {
        padding-right: 0;
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
