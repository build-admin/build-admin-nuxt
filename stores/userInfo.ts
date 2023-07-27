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
            last_login_time: '',
            last_login_ip: '',
            join_time: '',
            motto: '',
            token: '',
            refresh_token: '',
        }
    },
    actions: {
        removeToken() {
            this.token = ''
            this.refresh_token = ''
        },
        dataFill(state: UserInfo) {
            this.$state = state
        },
        setToken(token: string, type: 'auth' | 'refresh') {
            const field = type == 'auth' ? 'token' : 'refresh_token'
            this[field] = token
        },
        getToken(type: 'auth' | 'refresh' = 'auth') {
            return type === 'auth' ? this.token : this.refresh_token
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
            userLogout().then(({ data }) => {
                if (data.value?.code == 1) {
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
        paths: ['id', 'nickname', 'avatar', 'gender', 'token', 'refresh_token'],
    },
})
