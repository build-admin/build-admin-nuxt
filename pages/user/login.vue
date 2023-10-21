<template>
    <div>
        <el-container class="is-vertical">
            <BaHeader />
            <el-main class="layouts-main">
                <el-row justify="center">
                    <el-col :span="16" :xs="24">
                        <div v-if="memberCenter.state.open" class="form-box">
                            <div class="form-title">
                                {{ $t('user.login.' + state.tab) + $t('user.login.Reach') + ' ' + siteConfig.siteName }}
                            </div>

                            <!-- 登录表单 -->
                            <el-form
                                v-if="state.tab == 'Login'"
                                ref="loginRef"
                                @keyup.enter="onLoginSubmitPre"
                                :rules="loginRules"
                                :model="state.login"
                            >
                                <el-form-item prop="username">
                                    <el-input
                                        v-model="state.login.username"
                                        :placeholder="t('Please input field', { field: t('user.login.Account') })"
                                        :clearable="true"
                                        size="large"
                                    >
                                        <template #prefix>
                                            <Icon name="fa fa-user" size="16" color="var(--el-input-icon-color)" />
                                        </template>
                                    </el-input>
                                </el-form-item>
                                <el-form-item prop="password">
                                    <el-input
                                        v-model="state.login.password"
                                        :placeholder="t('Please input field', { field: t('user.login.Password') })"
                                        type="password"
                                        show-password
                                        size="large"
                                    >
                                        <template #prefix>
                                            <Icon name="fa fa-unlock-alt" size="16" color="var(--el-input-icon-color)" />
                                        </template>
                                    </el-input>
                                </el-form-item>
                                <div class="form-footer">
                                    <el-checkbox v-model="state.login.keep" :label="t('user.login.Remember me')" size="default"></el-checkbox>
                                    <client-only>
                                        <div
                                            v-if="state.accountVerificationType.length > 0"
                                            @click="state.showRetrievePasswordDialog = true"
                                            class="forgot-password"
                                        >
                                            {{ t('user.login.Forgot your password?') }}
                                        </div>
                                    </client-only>
                                </div>
                                <el-form-item class="form-buttons">
                                    <el-button
                                        class="form-btn"
                                        @click="onLoginSubmitPre"
                                        :loading="state.loading.login"
                                        round
                                        type="primary"
                                        size="large"
                                    >
                                        {{ t('user.login.' + state.tab) }}
                                    </el-button>
                                    <el-button @click="switchTab('Register')" round plain type="info" size="large">
                                        {{ t('user.login.No account yet? Click Register') }}
                                    </el-button>
                                </el-form-item>
                                <LoginFooterMixin />
                            </el-form>

                            <!-- 注册表单 -->
                            <el-form
                                v-if="state.tab == 'Register'"
                                ref="registerRef"
                                @keyup.enter="onRegisterSubmit(registerRef)"
                                :rules="registerRules"
                                :model="state.register"
                            >
                                <el-form-item>
                                    <el-radio-group size="large" v-model="state.register.registerType">
                                        <el-radio
                                            class="register-verification-radio"
                                            label="email"
                                            :disabled="!state.accountVerificationType.includes('email')"
                                            border
                                        >
                                            {{ t('user.login.Via email') + t('user.login.Register') }}
                                        </el-radio>
                                        <el-radio
                                            class="register-verification-radio"
                                            label="mobile"
                                            :disabled="!state.accountVerificationType.includes('mobile')"
                                            border
                                        >
                                            {{ t('user.login.Via mobile number') + t('user.login.Register') }}
                                        </el-radio>
                                    </el-radio-group>
                                </el-form-item>
                                <el-form-item prop="username">
                                    <el-input
                                        v-model="state.register.username"
                                        :placeholder="t('Please input field', { field: t('user.login.User name') })"
                                        :clearable="true"
                                        size="large"
                                    >
                                        <template #prefix>
                                            <Icon name="fa fa-user" size="16" color="var(--el-input-icon-color)" />
                                        </template>
                                    </el-input>
                                </el-form-item>
                                <el-form-item prop="password">
                                    <el-input
                                        v-model="state.register.password"
                                        :placeholder="t('Please input field', { field: t('user.login.Password') })"
                                        type="password"
                                        show-password
                                        size="large"
                                    >
                                        <template #prefix>
                                            <Icon name="fa fa-unlock-alt" size="16" color="var(--el-input-icon-color)" />
                                        </template>
                                    </el-input>
                                </el-form-item>
                                <el-form-item v-if="state.register.registerType == 'mobile'" prop="mobile">
                                    <el-input
                                        v-model="state.register.mobile"
                                        :placeholder="t('Please input field', { field: t('user.login.Mobile') })"
                                        :clearable="true"
                                        size="large"
                                    >
                                        <template #prefix>
                                            <Icon name="fa fa-tablet" size="16" color="var(--el-input-icon-color)" />
                                        </template>
                                    </el-input>
                                </el-form-item>
                                <el-form-item v-if="state.register.registerType == 'email'" prop="email">
                                    <el-input
                                        v-model="state.register.email"
                                        :placeholder="t('Please input field', { field: t('user.login.Email') })"
                                        :clearable="true"
                                        size="large"
                                    >
                                        <template #prefix>
                                            <Icon name="fa fa-envelope" size="16" color="var(--el-input-icon-color)" />
                                        </template>
                                    </el-input>
                                </el-form-item>
                                <el-form-item prop="captcha">
                                    <el-row class="w100">
                                        <el-col :span="16">
                                            <el-input
                                                size="large"
                                                v-model="state.register.captcha"
                                                :placeholder="t('Please input field', { field: t('user.login.Captcha') })"
                                                autocomplete="off"
                                            >
                                                <template #prefix>
                                                    <Icon name="fa fa-ellipsis-h" size="16" color="var(--el-input-icon-color)" />
                                                </template>
                                            </el-input>
                                        </el-col>
                                        <el-col class="captcha-box" :span="8">
                                            <el-button
                                                size="large"
                                                @click="sendRegisterCaptchaPre"
                                                :loading="state.sendCaptchaLoading"
                                                :disabled="state.codeSendCountdown <= 0 ? false : true"
                                                type="primary"
                                            >
                                                {{
                                                    state.codeSendCountdown <= 0
                                                        ? t('user.login.Send')
                                                        : state.codeSendCountdown + t('user.login.Seconds')
                                                }}
                                            </el-button>
                                        </el-col>
                                    </el-row>
                                </el-form-item>

                                <el-form-item class="form-buttons">
                                    <el-button
                                        class="form-btn"
                                        @click="onRegisterSubmit(registerRef)"
                                        :loading="state.loading.register"
                                        round
                                        type="primary"
                                        size="large"
                                    >
                                        {{ t('user.login.' + state.tab) }}
                                    </el-button>
                                    <el-button @click="switchTab('Login')" round plain type="info" size="large">
                                        {{ t('user.login.Back to login') }}
                                    </el-button>
                                </el-form-item>
                                <LoginFooterMixin />
                            </el-form>
                        </div>
                    </el-col>
                </el-row>
            </el-main>
            <BaFooter />
        </el-container>

        <!-- 找回密码表单 -->
        <client-only>
            <el-dialog
                :close-on-click-modal="false"
                :close-on-press-escape="false"
                v-model="state.showRetrievePasswordDialog"
                :title="t('user.login.Retrieve password')"
                :width="state.retrieveDialogWidth + '%'"
                :draggable="true"
            >
                <div class="retrieve-password-form">
                    <el-form
                        ref="retrieveRef"
                        @keyup.enter="onSubmitRetrieve(retrieveRef)"
                        :rules="retrieveRules"
                        :model="state.retrievePasswordForm"
                        :label-width="100"
                    >
                        <el-form-item :label="t('user.login.Retrieval method')">
                            <el-radio-group v-model="state.retrievePasswordForm.type">
                                <el-radio label="email" :disabled="!state.accountVerificationType.includes('email')" border>
                                    {{ t('user.login.Via email') }}
                                </el-radio>
                                <el-radio label="mobile" :disabled="!state.accountVerificationType.includes('mobile')" border>
                                    {{ t('user.login.Via mobile number') }}
                                </el-radio>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item
                            prop="account"
                            :label="state.retrievePasswordForm.type == 'email' ? t('user.login.Email') : t('user.login.Mobile')"
                        >
                            <el-input
                                v-model="state.retrievePasswordForm.account"
                                :placeholder="
                                    t('Please input field', {
                                        field: state.retrievePasswordForm.type == 'email' ? t('user.login.Email') : t('user.login.Mobile'),
                                    })
                                "
                                :clearable="true"
                            >
                                <template #prefix>
                                    <Icon name="fa fa-user" size="16" color="var(--el-input-icon-color)" />
                                </template>
                            </el-input>
                        </el-form-item>
                        <el-form-item prop="captcha" :label="t('user.login.Captcha')">
                            <el-row class="w100">
                                <el-col :span="16">
                                    <el-input
                                        v-model="state.retrievePasswordForm.captcha"
                                        :placeholder="t('Please input field', { field: t('user.login.Captcha') })"
                                        autocomplete="off"
                                    >
                                        <template #prefix>
                                            <Icon name="fa fa-ellipsis-h" size="16" color="var(--el-input-icon-color)" />
                                        </template>
                                    </el-input>
                                </el-col>
                                <el-col class="captcha-box" :span="8">
                                    <el-button
                                        @click="sendRetrieveCaptchaPre"
                                        :loading="state.sendCaptchaLoading"
                                        :disabled="state.codeSendCountdown <= 0 ? false : true"
                                        type="primary"
                                    >
                                        {{ state.codeSendCountdown <= 0 ? t('user.login.Send') : state.codeSendCountdown + t('user.login.Seconds') }}
                                    </el-button>
                                </el-col>
                            </el-row>
                        </el-form-item>
                        <el-form-item prop="password" :label="t('user.login.New password')">
                            <el-input
                                v-model="state.retrievePasswordForm.password"
                                :placeholder="t('Please input field', { field: t('user.login.New password') })"
                                show-password
                            >
                                <template #prefix>
                                    <Icon name="fa fa-unlock-alt" size="16" color="var(--el-input-icon-color)" />
                                </template>
                            </el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-button @click="state.showRetrievePasswordDialog = false">{{ t('Cancel') }}</el-button>
                            <el-button :loading="state.loading.retrievePassword" @click="onSubmitRetrieve(retrieveRef)" type="primary">
                                {{ t('Confirm') }}
                            </el-button>
                        </el-form-item>
                    </el-form>
                </div>
            </el-dialog>
        </client-only>
    </div>
</template>

<script setup lang="ts">
import type { FormItemRule, FormInstance } from 'element-plus'
import { sendEms, sendSms } from '~/api/common'
import { checkIn, retrievePassword } from '~/api/user/index'
import LoginFooterMixin from '~/composables/mixins/loginFooter.vue'
import clickCaptcha from '~/composables/clickCaptcha'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
let timer: NodeJS.Timeout

definePageMeta({
    layout: false,
    name: 'userLogin',
    noNeedLogin: true,
})
useSeoMeta({
    title: t('user.login.Login'),
})

interface State {
    tab: 'Login' | 'Register'
    loading: {
        login: boolean
        register: boolean
        retrievePassword: boolean
    }
    login: {
        username: string
        password: string
        captchaInfo: string
        captchaId: string
        keep: boolean
    }
    register: {
        registerType: 'email' | 'mobile'
        username: string
        password: string
        mobile: string
        email: string
        captcha: string
    }
    retrieveDialogWidth: number
    showRetrievePasswordDialog: boolean
    accountVerificationType: string[]
    retrievePasswordForm: {
        type: 'email' | 'mobile'
        account: string
        captcha: string
        password: string
    }
    sendCaptchaLoading: boolean
    codeSendCountdown: number
    to: string
}

const route = useRoute()
const userInfo = useUserInfo()
const siteConfig = useSiteConfig()
const memberCenter = useMemberCenter()
const loginRef = ref<FormInstance>()
const registerRef = ref<FormInstance>()
const retrieveRef = ref<FormInstance>()
const state: State = reactive({
    tab: 'Login',
    loading: {
        login: false,
        register: false,
        retrievePassword: false,
    },
    login: {
        username: '',
        password: '',
        captchaInfo: '',
        captchaId: uuid(),
        keep: false,
    },
    register: {
        registerType: 'email',
        username: '',
        password: '',
        mobile: '',
        email: '',
        captcha: '',
    },
    retrieveDialogWidth: 36,
    showRetrievePasswordDialog: false,
    accountVerificationType: [],
    retrievePasswordForm: {
        type: 'email',
        account: '',
        captcha: '',
        password: '',
    },
    sendCaptchaLoading: false,
    codeSendCountdown: 0,
    to: route.query.to as string,
})

const loginRules: Partial<Record<string, FormItemRule[]>> = reactive({
    username: [buildValidatorData({ name: 'required', title: t('user.login.User name') })],
    password: [buildValidatorData({ name: 'required', title: t('user.login.Password') }), buildValidatorData({ name: 'password' })],
})
const registerRules: Partial<Record<string, FormItemRule[]>> = reactive({
    username: [
        buildValidatorData({ name: 'required', title: t('user.login.User name') }),
        buildValidatorData({ name: 'account', title: t('user.login.User name') }),
    ],
    email: [
        buildValidatorData({ name: 'required', title: t('user.login.Email') }),
        buildValidatorData({ name: 'email', title: t('user.login.Email') }),
    ],
    password: [buildValidatorData({ name: 'required', title: t('user.login.Password') }), buildValidatorData({ name: 'password' })],
    mobile: [buildValidatorData({ name: 'required', title: t('user.login.Mobile') }), buildValidatorData({ name: 'mobile' })],
    captcha: [buildValidatorData({ name: 'required', title: t('user.login.Captcha') })],
})

const retrieveRules: Partial<Record<string, FormItemRule[]>> = reactive({
    account: [buildValidatorData({ name: 'required', title: t('user.login.Account name') })],
    captcha: [buildValidatorData({ name: 'required', title: t('user.login.Captcha') })],
    password: [buildValidatorData({ name: 'required', title: t('user.login.Password') }), buildValidatorData({ name: 'password' })],
})

const onLoginSubmitPre = () => {
    loginRef.value?.validate((valid) => {
        if (!valid) return
        clickCaptcha(state.login.captchaId, (captchaInfo: string) => onLoginSubmit(captchaInfo))
    })
}
const onLoginSubmit = (captchaInfo: string) => {
    state.loading.login = true
    state.login.captchaInfo = captchaInfo
    checkIn('post', { ...state.login, tab: state.tab.toLocaleLowerCase() })
        .then(({ data }) => {
            if (data.value?.code != 1) return
            userInfo.dataFill(data.value?.data.userInfo)
            if (state.to) return (location.href = state.to)
            navigateTo({ path: data.value?.data.routePath })
        })
        .finally(() => {
            state.loading.login = false
        })
}

const switchTab = (type: State['tab']) => {
    state.tab = type
    if (type == 'Login') {
        loginRef.value?.resetFields()
        loginRef.value?.clearValidate()
    } else {
        registerRef.value?.resetFields()
        registerRef.value?.clearValidate()
    }
}

const sendRegisterCaptchaPre = () => {
    if (state.codeSendCountdown > 0) return
    registerRef.value?.validateField([state.register.registerType, 'username', 'password']).then((valid) => {
        if (!valid) return
        clickCaptcha(state.login.captchaId, (captchaInfo: string) => sendRegisterCaptcha(captchaInfo))
    })
}
const sendRegisterCaptcha = (captchaInfo: string) => {
    state.sendCaptchaLoading = true
    const func = state.register.registerType == 'email' ? sendEms : sendSms
    func(state.register[state.register.registerType], 'user_register', {
        captchaInfo,
        captchaId: state.login.captchaId,
    })
        .then(({ data }) => {
            if (data.value?.code == 1) startTiming(60)
        })
        .finally(() => {
            state.sendCaptchaLoading = false
        })
}

const sendRetrieveCaptchaPre = () => {
    if (state.codeSendCountdown > 0) return
    retrieveRef.value?.validateField('account').then((valid) => {
        if (!valid) return
        clickCaptcha(state.login.captchaId, (captchaInfo: string) => sendRetrieveCaptcha(captchaInfo))
    })
}
const sendRetrieveCaptcha = (captchaInfo: string) => {
    state.sendCaptchaLoading = true
    const func = state.retrievePasswordForm.type == 'email' ? sendEms : sendSms
    func(state.retrievePasswordForm.account, 'user_retrieve_pwd', {
        captchaInfo,
        captchaId: state.login.captchaId,
    })
        .then(({ data }) => {
            if (data.value?.code == 1) startTiming(60)
        })
        .finally(() => {
            state.sendCaptchaLoading = false
        })
}

const onRegisterSubmit = (registerRef: FormInstance | undefined = undefined) => {
    if (!registerRef) return
    registerRef.validate((valid) => {
        if (!valid) return
        state.loading.register = true
        checkIn('post', { ...state.register, tab: state.tab.toLocaleLowerCase() })
            .then(({ data }) => {
                if (data.value?.code != 1) return
                userInfo.dataFill(data.value?.data.userInfo)
                navigateTo({ path: data.value?.data.routePath })
            })
            .finally(() => {
                state.loading.register = false
            })
    })
}

const onSubmitRetrieve = (retrieveRef: FormInstance | undefined = undefined) => {
    if (!retrieveRef) return
    retrieveRef.validate((valid) => {
        if (valid) {
            state.loading.retrievePassword = true
            retrievePassword({ ...state.retrievePasswordForm })
                .then(({ data }) => {
                    if (data.value?.code == 1) {
                        state.showRetrievePasswordDialog = false
                        endTiming()
                        onResetForm(retrieveRef)
                    }
                })
                .finally(() => {
                    state.loading.retrievePassword = false
                })
        }
    })
}

const startTiming = (seconds: number) => {
    state.codeSendCountdown = seconds
    timer = setInterval(() => {
        state.codeSendCountdown--
        if (state.codeSendCountdown <= 0) {
            endTiming()
        }
    }, 1000)
}
const endTiming = () => {
    state.codeSendCountdown = 0
    clearInterval(timer)
}

const dialogSize = () => {
    if (process.server) return
    let clientWidth = document.documentElement.clientWidth
    let width = 36
    if (clientWidth <= 790) {
        width = 92
    } else if (clientWidth <= 910) {
        width = 56
    } else if (clientWidth <= 1260) {
        width = 46
    }
    state.retrieveDialogWidth = width
}

checkIn('get').then(({ data }) => {
    if (data.value?.code != 1) return
    state.accountVerificationType = data.value?.data.accountVerificationType
    state.retrievePasswordForm.type = data.value?.data.accountVerificationType.length > 0 ? data.value?.data.accountVerificationType[0] : ''
})

onMounted(() => {
    dialogSize()
    useEventListener(window, 'resize', dialogSize)
    if (route.query.type == 'register') state.tab = 'Register'
})
onUnmounted(() => {
    endTiming()
})
</script>

<style scoped lang="scss">
.form-box {
    width: 460px;
    margin: 40px auto;
    padding: 10px 60px 20px 60px;
    background-color: var(--ba-bg-color-overlay);
}
.form-title {
    text-align: center;
    font-size: var(--el-font-size-large);
    line-height: 100px;
    user-select: none;
}
:deep(.el-input--large) .el-input__wrapper {
    padding: 4px 15px;
}
.captcha-box {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    .captcha-img {
        width: 90%;
        margin-left: auto;
    }
    .el-button {
        width: 90%;
        height: 100%;
    }
}
.form-footer {
    display: flex;
    align-items: center;
    .forgot-password {
        color: var(--el-color-primary);
        margin-left: auto;
        user-select: none;
        cursor: pointer;
    }
}
.register-verification-radio {
    margin-top: 10px;
}
.form-buttons {
    padding-top: 20px;
    .el-button {
        width: 100%;
        letter-spacing: 2px;
        font-weight: 300;
        margin-top: 20px;
        margin-left: 0;
    }
}
@media screen and (max-width: 768px) {
    .form-box {
        width: 100%;
        margin: 0 auto;
    }
    .retrieve-password-form {
        margin-right: 0;
    }
}
// 暗黑样式
@at-root html.dark {
    .form-buttons {
        .form-btn {
            --el-button-bg-color: var(--el-color-primary-light-5);
            --el-button-border-color: rgba(240, 252, 241, 0.1);
        }
    }
    .captcha-img {
        filter: brightness(61%);
    }
}
</style>
