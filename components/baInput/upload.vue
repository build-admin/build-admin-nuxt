<template>
    <div class="w100">
        <el-upload
            ref="upload"
            class="ba-upload"
            :class="[type, hideImagePlusOnOverLimit && state.attrs.limit && state.fileList.length >= state.attrs.limit ? 'hide-image-plus' : '']"
            v-model:file-list="state.fileList"
            :auto-upload="false"
            @change="onElChange"
            @remove="onElRemove"
            @preview="onElPreview"
            @exceed="onElExceed"
            v-bind="state.attrs"
            :key="state.key"
        >
            <template v-if="!$slots.default" #default>
                <template v-if="type == 'image' || type == 'images'">
                    <Icon class="ba-upload-icon" name="el-icon-Plus" size="30" color="#c0c4cc" />
                </template>
                <template v-else>
                    <el-button v-blur type="primary">
                        <Icon name="el-icon-Plus" color="#ffffff" />
                        <span>{{ $t('Upload') }}</span>
                    </el-button>
                </template>
            </template>
            <template v-for="(slot, name) in $slots" #[name]="scopedData">
                <slot :name="name" v-bind="scopedData"></slot>
            </template>
        </el-upload>
        <client-only>
            <el-dialog v-model="state.preview.show" class="ba-upload-preview">
                <div class="ba-upload-preview-scroll ba-scroll-style">
                    <img :src="state.preview.url" class="ba-upload-preview-img" alt="" />
                </div>
            </el-dialog>
        </client-only>
    </div>
</template>

<script setup lang="ts">
import type { UploadInstance, UploadUserFile, UploadProps, UploadRawFile, UploadFiles } from 'element-plus'
import { stringToArray } from '~/composables/baInput/helper'
import { cloneDeep, isEmpty } from 'lodash-es'
import { fileUpload } from '~/api/common'
import { genFileId } from 'element-plus'
import Sortable from 'sortablejs'

// 禁用 Attributes 自动继承
defineOptions({
    inheritAttrs: false,
})

interface Props extends /* @vue-ignore */ Partial<UploadProps> {
    type: 'image' | 'images' | 'file' | 'files'
    // 上传请求时的额外携带数据
    data?: anyObj
    modelValue: string | string[]
    // 返回绝对路径
    returnFullUrl?: boolean
    // 可自定义 el-upload 的其他属性（已废弃，v2.2.0 删除，请直接传递为 props）
    attr?: Partial<Writeable<UploadProps>>
    // 强制上传到本地存储
    forceLocal?: boolean
    // 在上传数量达到限制时隐藏图片上传按钮
    hideImagePlusOnOverLimit?: boolean
}
interface UploadFileExt extends UploadUserFile {
    serverUrl?: string
}

const props = withDefaults(defineProps<Props>(), {
    type: 'image',
    data: () => {
        return {}
    },
    modelValue: () => [],
    returnFullUrl: false,
    attr: () => {
        return {}
    },
    forceLocal: false,
    hideImagePlusOnOverLimit: false,
})

const emits = defineEmits<{
    (e: 'update:modelValue', value: string | string[]): void
}>()

const attrs = useAttrs()
const upload = ref<UploadInstance>()
const state: {
    key: string
    // 返回值类型，通过v-model类型动态计算
    defaultReturnType: 'string' | 'array'
    // 预览弹窗
    preview: {
        show: boolean
        url: string
    }
    // 文件列表
    fileList: UploadFileExt[]
    // 绑定到 el-upload 的属性对象
    attrs: Partial<UploadProps>
    // 正在上传的文件数量
    uploading: number
    events: anyObj
} = reactive({
    key: uuid(),
    defaultReturnType: 'string',
    preview: {
        show: false,
        url: '',
    },
    fileList: [],
    attrs: {},
    uploading: 0,
    events: {},
})

/**
 * 需要管理的事件列表（使用 triggerEvent 触发）
 */
const eventNameMap = {
    // el-upload 的钩子函数（它们是 props，并不是 emit，以上已经使用，所以需要手动触发）
    change: ['onChange', 'on-change'],
    remove: ['onRemove', 'on-remove'],
    preview: ['onPreview', 'on-preview'],
    exceed: ['onExceed', 'on-exceed'],

    // 由于自定义了上传方法，需要手动触发的钩子
    beforeUpload: ['beforeUpload', 'onBeforeUpload', 'before-upload', 'on-before-upload'],
    progress: ['onProgress', 'on-progress'],
    success: ['onSuccess', 'on-success'],
    error: ['onError', 'on-error'],
}

const onElChange = (file: UploadFileExt, files: UploadFiles) => {
    // 将 file 换为 files 中的对象，以便修改属性等操作
    const fileIndex = getArrayKey(files, 'uid', file.uid!)
    if (!fileIndex) return
    file = files[fileIndex] as UploadFileExt
    if (!file || !file.raw) return
    if (triggerEvent('beforeUpload', [file]) === false) return
    let fd = new FormData()
    fd.append('file', file.raw)
    fd = formDataAppend(fd)
    state.uploading++
    fileUpload(fd, { uuid: uuid() }, props.forceLocal)
        .then((res) => {
            if (res.code == 1) {
                file.serverUrl = res.data.file.url
                file.status = 'success'
                emits('update:modelValue', getAllUrls())
                triggerEvent('success', [res, file, files])
            } else {
                file.status = 'fail'
                files.splice(fileIndex, 1)
                triggerEvent('error', [res, file, files])
            }
        })
        .catch((res) => {
            file.status = 'fail'
            files.splice(fileIndex, 1)
            triggerEvent('error', [res, file, files])
        })
        .finally(() => {
            state.uploading--
            onChange(file, files)
        })
}

const onElRemove = (file: UploadUserFile, files: UploadFiles) => {
    triggerEvent('remove', [file, files])
    onChange(file, files)
    emits('update:modelValue', getAllUrls())
}

const onElPreview = (file: UploadFileExt) => {
    triggerEvent('preview', [file])
    if (!file || !file.serverUrl) {
        return
    }
    if (props.type == 'file' || props.type == 'files') {
        window.open(fullUrl(file.serverUrl))
        return
    }
    state.preview.show = true
    state.preview.url = fullUrl(file.serverUrl)
}

const onElExceed = (files: UploadUserFile[]) => {
    const file = files[0] as UploadRawFile
    file.uid = genFileId()
    upload.value!.handleStart(file)
    triggerEvent('exceed', [file, state.fileList])
}

/**
 * 初始化文件/图片的排序功能
 */
const initSort = () => {
    if (!import.meta.client) return
    nextTick(() => {
        let uploadListEl = upload.value?.$el.querySelector('.el-upload-list')
        let uploadItemEl = uploadListEl.getElementsByClassName('el-upload-list__item')
        if (uploadItemEl.length >= 2) {
            Sortable.create(uploadListEl, {
                animation: 200,
                draggable: '.el-upload-list__item',
                onEnd: (evt: Sortable.SortableEvent) => {
                    if (evt.oldIndex != evt.newIndex) {
                        state.fileList[evt.newIndex!] = [
                            state.fileList[evt.oldIndex!],
                            (state.fileList[evt.oldIndex!] = state.fileList[evt.newIndex!]),
                        ][0]
                        emits('update:modelValue', getAllUrls())
                    }
                },
            })
        }
    })
}

const triggerEvent = (name: string, args: any[]) => {
    const events = eventNameMap[name as keyof typeof eventNameMap]
    if (events) {
        for (const key in events) {
            // 执行函数，只在 false 时 return
            if (typeof state.events[events[key]] === 'function' && state.events[events[key]](...args) === false) return false
        }
    }
}

onMounted(() => {
    // 即将废弃的 props.attr Start
    const addProps: anyObj = {}
    if (!isEmpty(props.attr)) {
        const evtArr = ['onPreview', 'onRemove', 'onSuccess', 'onError', 'onChange', 'onExceed', 'beforeUpload', 'onProgress']
        for (const key in props.attr) {
            if (evtArr.includes(key)) {
                state.events[key] = props.attr[key as keyof typeof props.attr]
            } else {
                addProps[key] = props.attr[key as keyof typeof props.attr]
            }
        }

        console.warn('图片/文件上传组件的 props.attr 已经弃用，并将于 v2.2.0 版本彻底删除，请将 props.attr 的部分直接作为 props 传递！')
    }
    // 即将废弃的 props.attr End

    let events: string[] = []
    let bindAttrs: anyObj = {}
    for (const key in eventNameMap) {
        events = [...events, ...eventNameMap[key as keyof typeof eventNameMap]]
    }
    for (const attrKey in attrs) {
        if (events.includes(attrKey)) {
            state.events[attrKey] = attrs[attrKey]
        } else {
            bindAttrs[attrKey] = attrs[attrKey]
        }
    }

    if (props.type == 'image' || props.type == 'file') {
        bindAttrs = { ...bindAttrs, limit: 1 }
    } else {
        bindAttrs = { ...bindAttrs, multiple: true }
    }

    if (props.type == 'image' || props.type == 'images') {
        bindAttrs = { ...bindAttrs, accept: 'image/*', listType: 'picture-card' }
    }

    state.attrs = { ...bindAttrs, ...addProps }

    init(props.modelValue)

    initSort()
})

const limitExceed = () => {
    if (state.attrs.limit && state.fileList.length > state.attrs.limit) {
        state.fileList = state.fileList.slice(state.fileList.length - state.attrs.limit)
        return true
    }
    return false
}

const init = (modelValue: string | string[]) => {
    let urls = stringToArray(modelValue as string)
    state.fileList = []
    state.defaultReturnType = typeof modelValue === 'string' || props.type == 'file' || props.type == 'image' ? 'string' : 'array'

    for (const key in urls) {
        state.fileList.push({
            name: getFileNameFromPath(urls[key]),
            url: fullUrl(urls[key]),
            serverUrl: urls[key],
        })
    }

    // 超出过滤 || 确定返回的URL完整
    if (limitExceed() || props.returnFullUrl) {
        emits('update:modelValue', getAllUrls())
    }
    state.key = uuid()
}

/**
 * 获取当前所有图片路径的列表
 */
const getAllUrls = (returnType: string = state.defaultReturnType) => {
    limitExceed()
    let urlList = []
    for (const key in state.fileList) {
        if (state.fileList[key].serverUrl) urlList.push(state.fileList[key].serverUrl)
    }
    if (props.returnFullUrl) urlList = arrayFullUrl(urlList as string[])
    return returnType === 'string' ? urlList.join(',') : (urlList as string[])
}

const formDataAppend = (fd: FormData) => {
    if (props.data && !isEmpty(props.data)) {
        for (const key in props.data) {
            fd.append(key, props.data[key])
        }
    }
    return fd
}

/**
 * 文件状态改变时的钩子，选择文件、上传成功和上传失败时都会被调用
 */
const onChange = (file: string | string[] | UploadFileExt, files: UploadFileExt[]) => {
    initSort()
    triggerEvent('change', [file, files])
}

const getRef = () => {
    return upload.value
}

defineExpose({
    getRef,
})

watch(
    () => props.modelValue,
    (newVal) => {
        if (state.uploading > 0) return
        if (newVal === undefined || newVal === null) {
            return init('')
        }
        let newValArr = arrayFullUrl(stringToArray(cloneDeep(newVal)))
        let oldValArr = arrayFullUrl(getAllUrls('array'))
        if (newValArr.sort().toString() != oldValArr.sort().toString()) {
            init(newVal)
        }
    }
)
</script>

<style scoped lang="scss">
.ba-upload :deep(.el-upload:hover .ba-upload-icon) {
    color: var(--el-color-primary) !important;
}
:deep(.ba-upload-preview) .el-dialog__body {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
    height: auto;
}
.ba-upload-preview-scroll {
    max-height: 70vh;
    overflow: auto;
}
.ba-upload-preview-img {
    max-width: 100%;
    max-height: 100%;
}
:deep(.el-dialog__headerbtn) {
    top: 2px;
    width: 37px;
    height: 37px;
}
.ba-upload.image :deep(.el-upload--picture-card),
.ba-upload.images :deep(.el-upload--picture-card) {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}
.ba-upload.file :deep(.el-upload-list),
.ba-upload.files :deep(.el-upload-list) {
    margin-left: -10px;
}
.ba-upload.files,
.ba-upload.images {
    :deep(.el-upload-list__item) {
        user-select: none;
        .el-upload-list__item-actions,
        .el-upload-list__item-name {
            cursor: move;
        }
    }
}
.ml-6 {
    margin-left: 6px;
}
.ba-upload.hide-image-plus :deep(.el-upload--picture-card) {
    display: none;
}
</style>
