import { defineStore } from 'pinia'
import { USER_INFO } from '~/stores/constant/keys'
import { UserInfo } from '~/stores/interface'
import { userLogout } from '~/api/common'

export const useUserInfo = defineStore('userInfo', {
    state: (): UserInfo => {
        return {
            id: 0,
            username: '',
            nickname: '',
            email: '',
            mobile: '',
            avatar: '',
            gender: 0,
            birthday: '',
            money: 0,
            score: 0,
            lastlogintime: '',
            lastloginip: '',
            jointime: '',
            motto: '',
            token: '',
            refreshToken: '',
        }
    },
    actions: {
        removeToken() {
            this.token = ''
            this.refreshToken = ''
        },
        dataFill(state: UserInfo) {
            this.$state = state
        },
        setToken(token: string, type: 'token' | 'refreshToken') {
            this[type] = token
        },
        getToken(type: 'auth' | 'refresh' = 'auth') {
            return type === 'auth' ? this.token : this.refreshToken
        },
        getGenderIcon() {
            let icon = { name: 'fa fa-transgender-alt', color: 'var(--el-text-color-secondary)' }
            switch (this.gender) {
                case 1:
                    icon = { name: 'fa fa-mars-stroke-v', color: 'var(--el-color-primary)' }
                    break
                case 2:
                    icon = { name: 'fa fa-mars-stroke', color: 'var(--el-color-danger)' }
                    break
            }
            return icon
        },
        logout() {
            userLogout().then((res) => {
                if (res.value?.code == 1) {
                    const userInfo = useCookie(USER_INFO)
                    userInfo.value = ''
                    const router = useRouter()
                    router.go(0)
                }
            })
        },
        isLogin() {
            return this.id && this.token
        },
    },
    persist: {
        key: USER_INFO,
    },
})
