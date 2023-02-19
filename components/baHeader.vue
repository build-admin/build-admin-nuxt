<template>
    <el-header class="ba-header">
        <el-row justify="center">
            <el-col class="header-row" :span="16" :xs="24">
                <div @click="navigateTo({ name: '/' })" class="header-logo hidden-sm-and-down">
                    <img src="~/assets/images/logo.png" />
                    <span class="site-name">{{ siteConfig.siteName }}</span>
                </div>
                <div class="user-menus-expand hidden-md-and-up">
                    <Icon name="fa fa-indent" color="var(--el-color-primary)" size="20" />
                </div>
                <client-only>
                    <el-menu :default-active="state.activeMenu" class="frontend-header-menu" mode="horizontal" :ellipsis="false">
                        <el-menu-item @click="navigateTo({ name: '/' })" v-blur index="index">{{ $t('Home') }}</el-menu-item>

                        <template v-if="siteConfig.openMemberCenter">
                            <el-sub-menu v-if="userInfo.isLogin()" v-blur index="user">
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
                                <el-menu-item @click="navigateTo({ name: 'user' })" v-blur index="user-index">
                                    {{ $t('Member Center') }}
                                </el-menu-item>
                                <el-menu-item @click="userInfo.logout()" v-blur index="user-logout">{{ $t('Logout login') }}</el-menu-item>
                            </el-sub-menu>
                            <el-menu-item v-else @click="navigateTo({ name: 'user' })" v-blur index="user">{{ $t('Member Center') }}</el-menu-item>

                            <el-menu-item index="theme-switch" class="theme-switch">
                                <DarkSwitch @click="setDark(!getDark())" />
                            </el-menu-item>
                        </template>
                    </el-menu>
                </client-only>
            </el-col>
        </el-row>
    </el-header>
</template>

<script setup lang="ts">
const userInfo = useUserInfo()
const siteConfig = useSiteConfig()

const state = reactive({
    activeMenu: '',
})

const route = useRoute()
switch (route.path) {
    case '/':
        state.activeMenu = 'index'
        break
    case '/user':
        state.activeMenu = 'user'
        break
    case '/user':
        state.activeMenu = 'user'
        break
}
</script>

<style scoped lang="scss">
.ba-header {
    position: fixed;
    width: 100%;
}
.header-row {
    display: flex;
}
.user-menus-expand {
    display: flex;
    height: 60px;
    align-items: center;
    justify-content: center;
}
.header-logo {
    display: flex;
    height: 60px;
    align-items: center;
    cursor: pointer;
    img {
        height: 34px;
        width: 34px;
    }
    span {
        padding-left: 4px;
        font-size: var(--el-font-size-large);
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
.frontend-header-menu {
    background: transparent;
    .el-menu-item,
    .el-sub-menu .el-sub-menu__title {
        color: var(--el-color-white);
        &.is-active {
            color: var(--el-color-white) !important;
        }
        &:hover {
            background-color: transparent;
            color: var(--el-menu-hover-text-color);
        }
    }
}
.theme-switch {
    --el-menu-hover-bg-color: none;
}
@at-root .dark {
    .header-logo .site-name {
        color: var(--el-text-color-primary);
    }
}
</style>
