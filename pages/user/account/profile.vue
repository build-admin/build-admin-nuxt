<template>
    <div class="user-views">
        <el-card class="user-views-card" shadow="hover">
            <template #header>
                <div class="card-header">
                    <span>{{ $t('user.account.profile.Personal data') }}</span>
                    <el-button @click="navigateTo({ name: 'account/changePassword' })" type="info" v-blur plain>
                        {{ $t('user.account.profile.Change Password') }}
                    </el-button>
                </div>
            </template>
            <div class="user-profile">
                <el-form :model="state.form" :rules="state.rules" :label-width="100" ref="formRef" @keyup.enter="onSubmit(formRef)">
                    <FormItem
                        :label="$t('user.account.profile.Avatar')"
                        :input-attr="{
                            'hide-select-file': true,
                        }"
                        type="image"
                        v-model="state.form.avatar"
                        prop="avatar"
                    />
                    <FormItem
                        :label="$t('user.account.profile.User name')"
                        type="string"
                        v-model="state.form.username"
                        :placeholder="$t('Please input field', { field: $t('user.account.profile.User name') })"
                        prop="username"
                    />
                    <FormItem
                        :label="$t('user.account.profile.User nickname')"
                        type="string"
                        v-model="state.form.nickname"
                        :placeholder="$t('Please input field', { field: $t('user.account.profile.User nickname') })"
                        prop="nickname"
                    />
                    <el-form-item v-if="state.accountVerificationType.includes('email')" :label="t('utils.Email')">
                        <el-input v-model="state.form.email" readonly :placeholder="t('user.account.profile.Operation via right button')">
                            <template #append>
                                <el-button type="primary" @click="onChangeBindInfo('email')">
                                    {{ state.form.email ? t('user.account.profile.Click Modify') : t('user.account.profile.Bind') }}
                                </el-button>
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-form-item v-if="state.accountVerificationType.includes('mobile')" :label="t('utils.Email')">
                        <el-input v-model="state.form.mobile" readonly :placeholder="t('user.account.profile.Operation via right button')">
                            <template #append>
                                <el-button type="primary" @click="onChangeBindInfo('mobile')">
                                    {{ state.form.mobile ? t('user.account.profile.Click Modify') : t('user.account.profile.Bind') }}
                                </el-button>
                            </template>
                        </el-input>
                    </el-form-item>
                    <FormItem
                        :label="$t('user.account.profile.Gender')"
                        type="radio"
                        v-model="state.form.gender"
                        :data="{
                            childrenAttr: { border: true },
                            content: {
                                '0': $t('user.account.profile.Secrecy'),
                                '1': $t('user.account.profile.Male'),
                                '2': $t('user.account.profile.Female'),
                            },
                        }"
                    />
                    <FormItem :label="$t('user.account.profile.Birthday')" type="date" v-model="state.form.birthday" />
                    <FormItem
                        :label="$t('user.account.profile.Personal signature')"
                        type="textarea"
                        :placeholder="$t('Please input field', { field: $t('user.account.profile.Personal signature') })"
                        v-model="state.form.motto"
                        :input-attr="{ 'show-word-limit': true, rows: 3 }"
                    />
                    <UserProfileMixin />
                    <el-form-item class="submit-buttons">
                        <el-button @click="onResetForm(formRef)">{{ $t('Reset') }}</el-button>
                        <el-button type="primary" :loading="state.formSubmitLoading" @click="onSubmit(formRef)">{{ $t('Save') }}</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </el-card>

        <!-- 账户验证 -->
        <client-only>
            <el-dialog
                :title="t('user.account.profile.Account verification')"
                v-model="state.dialog.verification.show"
                class="ba-change-bind-dialog ba-verification-dialog"
                :destroy-on-close="true"
                :close-on-click-modal="false"
                width="30%"
            >
                <el-form
                    :model="state.dialog.verification.form"
                    :rules="state.dialog.verification.rules"
                    :label-position="'top'"
                    ref="verificationFormRef"
                    @keyup.enter="onSubmitVerification(verificationFormRef)"
                >
                    <FormItem
                        :label="t('user.account.profile.Account password verification')"
                        type="password"
                        v-model="state.dialog.verification.form.password"
                        prop="password"
                        :input-attr="{ 'show-password': true }"
                        :placeholder="$t('Please input field', { field: $t('utils.Password') })"
                    />
                    <el-form-item prop="captcha">
                        <template #label>
                            <span v-if="state.dialog.type == 'email'">
                                {{ t('user.account.profile.Mail verification') }}
                                ({{ t('user.account.profile.Accept') + t('user.account.profile.Mail') + '：' + userInfo.email }})
                            </span>
                            <span v-else>
                                {{ t('user.account.profile.SMS verification') }}
                                ({{ t('user.account.profile.Accept') + t('utils.Mobile') + '：' + userInfo.mobile }})
                            </span>
                        </template>
                        <el-row class="w100" :gutter="10">
                            <el-col :span="18">
                                <el-input
                                    v-model="state.dialog.verification.form.captcha"
                                    :placeholder="t('Please input field', { field: t('user.account.profile.Captcha') })"
                                    autocomplete="off"
                                />
                            </el-col>
                            <el-col class="captcha-box" :span="6">
                                <el-button
                                    @click="sendVerificationCaptchaPre"
                                    :loading="state.dialog.sendCaptchaLoading"
                                    :disabled="state.dialog.codeSendCountdown <= 0 ? false : true"
                                    type="primary"
                                >
                                    {{
                                        state.dialog.codeSendCountdown <= 0
                                            ? t('user.account.profile.Send')
                                            : state.dialog.codeSendCountdown + t('user.account.profile.Seconds')
                                    }}
                                </el-button>
                            </el-col>
                        </el-row>
                    </el-form-item>
                </el-form>
                <template #footer>
                    <div :style="'width: calc(100% - 20px)'">
                        <el-button @click="state.dialog.verification.show = false">{{ t('Cancel') }}</el-button>
                        <el-button v-blur :loading="state.dialog.submitLoading" @click="onSubmitVerification(verificationFormRef)" type="primary">
                            {{ t('user.account.profile.Next step') }}
                        </el-button>
                    </div>
                </template>
            </el-dialog>
        </client-only>

        <!-- 绑定 -->
        <client-only>
            <el-dialog
                :title="t('user.account.profile.Bind') + (state.dialog.type == 'email' ? t('utils.Email') : t('utils.Mobile'))"
                v-model="state.dialog.bind.show"
                class="ba-change-bind-dialog ba-bind-dialog"
                :destroy-on-close="true"
                :close-on-click-modal="false"
                width="30%"
            >
                <el-form
                    :model="state.dialog.bind.form"
                    :rules="state.dialog.bind.rules"
                    :label-position="'top'"
                    ref="bindFormRef"
                    @keyup.enter="onSubmitBind(bindFormRef)"
                >
                    <FormItem
                        v-if="!state.dialog.verification.accountVerificationToken"
                        :label="t('user.account.profile.Account password verification')"
                        type="password"
                        v-model="state.dialog.bind.form.password"
                        prop="password"
                        :input-attr="{ 'show-password': true }"
                        :placeholder="$t('Please input field', { field: $t('utils.Password') })"
                    />
                    <FormItem
                        v-if="state.dialog.type == 'email'"
                        :label="t('user.account.profile.New ' + state.dialog.type)"
                        type="string"
                        v-model="state.dialog.bind.form.email"
                        prop="email"
                        :placeholder="$t('Please input field', { field: t('user.account.profile.New ' + state.dialog.type) })"
                    />
                    <FormItem
                        v-if="state.dialog.type == 'mobile'"
                        :label="t('user.account.profile.New ' + state.dialog.type)"
                        type="string"
                        v-model="state.dialog.bind.form.mobile"
                        prop="mobile"
                        :placeholder="$t('Please input field', { field: t('user.account.profile.New ' + state.dialog.type) })"
                    />
                    <el-form-item
                        :label="
                            state.dialog.type == 'email' ? t('user.account.profile.Mail verification') : t('user.account.profile.SMS verification')
                        "
                        prop="captcha"
                    >
                        <el-row class="w100" :gutter="10">
                            <el-col :span="18">
                                <el-input
                                    v-model="state.dialog.bind.form.captcha"
                                    :placeholder="t('Please input field', { field: t('user.account.profile.Captcha') })"
                                    autocomplete="off"
                                />
                            </el-col>
                            <el-col class="captcha-box" :span="6">
                                <el-button
                                    @click="sendBindCaptchaPre"
                                    :loading="state.dialog.sendCaptchaLoading"
                                    :disabled="state.dialog.codeSendCountdown <= 0 ? false : true"
                                    type="primary"
                                >
                                    {{
                                        state.dialog.codeSendCountdown <= 0
                                            ? t('user.account.profile.Send')
                                            : state.dialog.codeSendCountdown + t('user.account.profile.Seconds')
                                    }}
                                </el-button>
                            </el-col>
                        </el-row>
                    </el-form-item>
                </el-form>
                <template #footer>
                    <div :style="'width: calc(100% - 20px)'">
                        <el-button @click="state.dialog.bind.show = false">{{ t('Cancel') }}</el-button>
                        <el-button v-blur :loading="state.dialog.submitLoading" @click="onSubmitBind(bindFormRef)" type="primary">
                            {{ t('user.account.profile.Bind') }}
                        </el-button>
                    </div>
                </template>
            </el-dialog>
        </client-only>
    </div>
</template>

<script setup lang="ts">
import { FormInstance, FormItemRule } from 'element-plus'
import { getProfile, postProfile, postVerification, postChangeBind } from '~/api/user/index'
import { useI18n } from 'vue-i18n'
import { sendEms, sendSms } from '~/api/common'
import UserProfileMixin from '~/composables/mixins/userProfile.vue'
import clickCaptcha from '~/composables/clickCaptcha'
let timer: NodeJS.Timer

definePageMeta({
    name: 'account/profile',
})

const { t } = useI18n()
const userInfo = useUserInfo()

const formRef = ref<FormInstance>()
const bindFormRef = ref<FormInstance>()
const verificationFormRef = ref<FormInstance>()
const state: {
    formSubmitLoading: boolean
    form: anyObj
    rules: Partial<Record<string, FormItemRule[]>>
    accountVerificationType: string[]
    dialog: {
        type: 'email' | 'mobile'
        submitLoading: boolean
        sendCaptchaLoading: boolean
        codeSendCountdown: number
        captchaId: string
        verification: {
            show: boolean
            rules: Partial<Record<string, FormItemRule[]>>
            form: {
                password: string
                captcha: string
            }
            accountVerificationToken: string
        }
        bind: {
            show: boolean
            rules: Partial<Record<string, FormItemRule[]>>
            form: {
                password: string
                email: string
                mobile: string
                captcha: string
            }
        }
    }
} = reactive({
    formSubmitLoading: false,
    form: userInfo.$state,
    rules: {
        avatar: [buildValidatorData({ name: 'required', message: t('Please select field', { field: t('user.account.profile.Captcha') }) })],
        username: [buildValidatorData({ name: 'required', title: t('user.account.profile.User name') }), buildValidatorData({ name: 'account' })],
        nickname: [buildValidatorData({ name: 'required', title: t('user.account.profile.Nickname') })],
    },
    accountVerificationType: [],
    dialog: {
        type: 'email',
        submitLoading: false,
        sendCaptchaLoading: false,
        codeSendCountdown: 0,
        captchaId: uuid(),
        verification: {
            show: false,
            rules: {
                password: [buildValidatorData({ name: 'required', title: t('utils.Password') }), buildValidatorData({ name: 'password' })],
                captcha: [buildValidatorData({ name: 'required', title: t('user.account.profile.Captcha') })],
            },
            form: {
                password: '',
                captcha: '',
            },
            accountVerificationToken: '',
        },
        bind: {
            show: false,
            rules: {
                password: [buildValidatorData({ name: 'required', title: t('utils.Password') }), buildValidatorData({ name: 'password' })],
                email: [
                    buildValidatorData({ name: 'required', title: t('utils.Email') }),
                    buildValidatorData({ name: 'email', title: t('utils.Email') }),
                ],
                mobile: [
                    buildValidatorData({ name: 'required', title: t('utils.Mobile') }),
                    buildValidatorData({ name: 'mobile', title: t('utils.Mobile') }),
                ],
                captcha: [buildValidatorData({ name: 'required', title: t('user.account.profile.Captcha') })],
            },
            form: {
                password: '',
                email: '',
                mobile: '',
                captcha: '',
            },
        },
    },
})

const startTiming = (seconds: number) => {
    state.dialog.codeSendCountdown = seconds
    timer = setInterval(() => {
        state.dialog.codeSendCountdown--
        if (state.dialog.codeSendCountdown <= 0) {
            endTiming()
        }
    }, 1000)
}
const endTiming = () => {
    state.dialog.codeSendCountdown = 0
    clearInterval(timer)
}

const onChangeBindInfo = (type: 'email' | 'mobile') => {
    if ((type == 'email' && userInfo.email) || (type == 'mobile' && userInfo.mobile)) {
        state.dialog.verification.show = true
    } else {
        state.dialog.bind.show = true
    }
    state.dialog.type = type
}

const sendVerificationCaptchaPre = () => {
    if (state.dialog.codeSendCountdown > 0) return
    verificationFormRef.value?.validateField('password').then((res) => {
        if (!res) return
        clickCaptcha(state.dialog.captchaId, (captchaInfo: string) => sendVerificationCaptcha(captchaInfo))
    })
}
const sendVerificationCaptcha = (captchaInfo: string) => {
    state.dialog.sendCaptchaLoading = true
    const func = state.dialog.type == 'email' ? sendEms : sendSms
    func(userInfo[state.dialog.type], `user_${state.dialog.type}_verify`, {
        password: state.dialog.verification.form.password,
        captchaId: state.dialog.captchaId,
        captchaInfo,
    })
        .then(({ data }) => {
            if (data.value?.code == 1) startTiming(60)
        })
        .finally(() => {
            state.dialog.sendCaptchaLoading = false
        })
}

const sendBindCaptchaPre = () => {
    if (state.dialog.codeSendCountdown > 0) return
    bindFormRef.value?.validateField(state.dialog.type).then((res) => {
        if (!res) return
        clickCaptcha(state.dialog.captchaId, (captchaInfo: string) => sendBindCaptcha(captchaInfo))
    })
}
const sendBindCaptcha = (captchaInfo: string) => {
    state.dialog.sendCaptchaLoading = true
    const func = state.dialog.type == 'email' ? sendEms : sendSms
    func(state.dialog.bind.form[state.dialog.type], `user_change_${state.dialog.type}`, {
        captchaId: state.dialog.captchaId,
        captchaInfo,
    })
        .then(({ data }) => {
            if (data.value?.code == 1) startTiming(60)
        })
        .finally(() => {
            state.dialog.sendCaptchaLoading = false
        })
}

const onSubmitVerification = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.validate((res) => {
        if (res) {
            state.dialog.submitLoading = true
            postVerification({
                type: state.dialog.type,
                captcha: state.dialog.verification.form.captcha,
            })
                .then(({ data }) => {
                    if (data.value?.code != 1) return
                    endTiming()
                    state.dialog.bind.show = true
                    state.dialog.type = data.value?.data.type
                    state.dialog.verification.show = false
                    state.dialog.verification.accountVerificationToken = data.value?.data.accountVerificationToken
                })
                .finally(() => {
                    state.dialog.submitLoading = false
                })
        }
    })
}

const onSubmitBind = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.validate((res) => {
        if (res) {
            state.dialog.submitLoading = true
            postChangeBind({
                type: state.dialog.type,
                accountVerificationToken: state.dialog.verification.accountVerificationToken,
                ...state.dialog.bind.form,
            })
                .then(({ data }) => {
                    if (data.value?.code == 1) {
                        endTiming()
                        state.dialog.bind.show = false
                        userInfo[state.dialog.type] = state.dialog.bind.form[state.dialog.type]
                    }
                })
                .finally(() => {
                    state.dialog.submitLoading = false
                })
        }
    })
}

const onSubmit = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.validate((valid) => {
        if (valid) {
            state.formSubmitLoading = true
            postProfile(state.form).finally(() => {
                state.formSubmitLoading = false
            })
        }
    })
}

const { data } = await getProfile()
if (data.value?.code == 1) state.accountVerificationType = data.value?.data.accountVerificationType
</script>

<style scoped lang="scss">
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.user-profile {
    width: 400px;
    max-width: 100%;
}
.submit-buttons :deep(.el-form-item__content) {
    justify-content: flex-end;
}
:deep(.el-upload-list--picture-card) {
    --el-upload-list-picture-card-size: 100px;
}
:deep(.el-upload--picture-card) {
    --el-upload-picture-card-size: 100px;
}
.captcha-box {
    margin-left: auto;
    .el-button {
        width: 100%;
    }
}
:deep(.ba-verification-dialog) .el-dialog__body {
    padding-bottom: 10px;
}
@media screen and (max-width: 1024px) {
    :deep(.ba-change-bind-dialog) {
        --el-dialog-width: 50% !important;
    }
}
@media screen and (max-width: 768px) {
    :deep(.ba-change-bind-dialog) {
        --el-dialog-width: 70% !important;
    }
}
@media screen and (max-width: 600px) {
    :deep(.ba-change-bind-dialog) {
        --el-dialog-width: 92% !important;
    }
}
</style>
