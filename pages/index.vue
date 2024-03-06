<template>
    <div>
        <el-container class="index-container">
            <BaHeader />
            <el-main class="main">
                <div class="main-container">
                    <div class="main-left">
                        <div class="main-title">{{ siteConfig.siteName }}</div>
                        <div class="main-content">
                            {{ $t('index.title') }}
                        </div>
                        <client-only>
                            <el-button
                                v-if="memberCenter.state.open"
                                @click="navigateTo({ name: 'user' })"
                                class="container-button"
                                color="#ffffff"
                                size="large"
                            >
                                {{ $t('Member Center') }}
                            </el-button>
                        </client-only>
                    </div>
                    <div class="main-right">
                        <img :src="indexCover" alt="" />
                    </div>
                </div>
            </el-main>
            <BaFooter />
        </el-container>
    </div>
</template>

<script setup lang="ts">
import indexCover from '~/assets/images/index-cover.svg'

const siteConfig = useSiteConfig()
const memberCenter = useMemberCenter()

definePageMeta({
    name: '/',
})
</script>

<style scoped lang="scss">
.index-container {
    width: 100vw;
    height: 100vh;
    background: url(~/assets/images/bg.jpg) repeat;
    color: var(--el-color-white);
    .main {
        height: calc(100vh - 120px);
        padding: 0;
        .main-container {
            display: flex;
            height: 100%;
            width: 66%;
            margin: 0 auto;
            align-items: center;
            justify-content: space-between;
            .container-button {
                margin: 0 15px 15px 0;
            }
            .main-left {
                padding-right: 50px;
                .main-title {
                    font-size: 45px;
                }
                .main-content {
                    padding-top: 20px;
                    padding-bottom: 40px;
                    font-size: var(--el-font-size-large);
                }
            }
            .main-right {
                img {
                    width: 380px;
                }
            }
        }
    }
}
.ba-header {
    background-color: transparent !important;
    box-shadow: none !important;
    position: fixed;
    width: 100%;
    :deep(.header-logo) {
        span {
            padding-left: 4px;
            color: var(--el-color-white);
        }
    }
    :deep(.frontend-header-menu) {
        background: transparent;
        .el-menu-item,
        .el-sub-menu .el-sub-menu__title {
            color: var(--el-color-white);
            &.is-active {
                color: var(--el-color-white) !important;
            }
            &:hover {
                background-color: transparent !important;
                color: var(--el-menu-hover-text-color) !important;
            }
        }
    }
}
.ba-footer {
    color: var(--el-text-color-secondary);
    background-color: transparent !important;
    position: fixed;
    bottom: 0;
}

@media screen and (max-width: 1024px) {
    .index-container {
        .main {
            height: unset;
        }
    }
    .main-container {
        width: 90% !important;
        flex-wrap: wrap;
        align-content: center;
        justify-content: center !important;
        .main-right {
            padding-top: 50px;
        }
    }
}
@media screen and (max-width: 375px) {
    .main-right img {
        width: 300px !important;
    }
}
@media screen and (max-height: 650px) {
    .main-right img {
        display: none;
    }
}
@at-root html.dark {
    .index-container {
        background: url(~/assets/images/bg-dark.jpg) repeat;
    }
}
</style>
