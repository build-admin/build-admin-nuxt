<template>
    <div class="user-views">
        <el-card class="user-views-card" shadow="hover">
            <template #header>
                <div class="card-header">
                    <span>{{ $t('user.account.integral.Score change record') }}</span>
                    <span class="right-title">{{ $t('user.account.integral.Current points') + ' ' + userInfo.score }}</span>
                </div>
            </template>
            <div v-loading="state.pageLoading" class="logs">
                <div class="log-item" v-for="(item, idx) in state.logs" :key="idx">
                    <div class="log-title">{{ item.memo }}</div>
                    <div v-if="item.score > 0" class="log-change-amount increase">
                        {{ $t('Integral') + '：+' + item.score }}
                    </div>
                    <div v-else class="log-change-amount reduce">{{ $t('Integral') + '：' + item.score }}</div>
                    <div class="log-after">{{ $t('user.account.integral.Points after change') + '：' + item.after }}</div>
                    <div class="log-change-time">{{ $t('user.account.integral.Change time') + '：' + timeFormat(item.create_time) }}</div>
                </div>
            </div>
            <div v-if="state.total > 0" class="log-footer">
                <el-pagination
                    :currentPage="state.currentPage"
                    :page-size="state.pageSize"
                    :page-sizes="[10, 20, 50, 100]"
                    background
                    :layout="memberCenter.state.shrink ? 'prev, next, jumper' : 'sizes, ->, prev, pager, next, jumper'"
                    :total="state.total"
                    @size-change="onTableSizeChange"
                    @current-change="onTableCurrentChange"
                ></el-pagination>
            </div>
            <el-empty v-else />
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ScrollbarInstance } from 'element-plus'
import { getIntegralLog } from '~/api/user/index'

definePageMeta({
    name: 'account/integral',
})
useSeoMeta({
    title: '积分记录',
})

const userInfo = useUserInfo()
const memberCenter = useMemberCenter()
const mainScrollbarRef = inject<Ref<ScrollbarInstance>>('mainScrollbarRef')
const state: {
    logs: {
        memo: string
        create_time: number
        score: number
        after: number
    }[]
    currentPage: number
    total: number
    pageSize: number
    pageLoading: boolean
} = reactive({
    logs: [],
    currentPage: 1,
    total: 0,
    pageSize: 10,
    pageLoading: true,
})

const onTableSizeChange = (val: number) => {
    state.pageSize = val
    loadData()
}
const onTableCurrentChange = (val: number) => {
    state.currentPage = val
    loadData()
}

const loadData = async () => {
    const { data } = await getIntegralLog(state.currentPage, state.pageSize)
    if (data.value?.code == 1) {
        state.pageLoading = false
        state.logs = data.value?.data.list
        state.total = data.value?.data.total
        mainScrollbarRef?.value?.scrollTo(0, 0)
    }
}

loadData()
</script>

<style scoped lang="scss">
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.user-views-card :deep(.el-card__body) {
    padding-top: 0;
}
.right-title {
    color: var(--el-text-color-secondary);
}
.log-item {
    border-bottom: 1px solid var(--ba-bg-color);
    padding: 15px 0;
    div {
        padding: 4px 0;
    }
}
.log-title {
    font-size: var(--el-font-size-medium);
}
.log-change-amount.increase {
    color: var(--el-color-success);
}
.log-change-amount.reduce {
    color: var(--el-color-danger);
}
.log-after,
.log-change-time {
    font-size: var(--el-font-size-small);
    color: var(--el-text-color-secondary);
}
.log-footer {
    padding-top: 20px;
}
</style>
