import { CSSProperties } from 'vue'
import type { FormItemRule } from 'element-plus'

// 支持的输入框类型
export const inputTypes = [
    'string',
    'password',
    'number',
    'radio',
    'checkbox',
    'switch',
    'textarea',
    'array',
    'datetime',
    'year',
    'date',
    'time',
    'select',
    'selects',
    'remoteSelect',
    'remoteSelects',
    'editor',
    'city',
    'image',
    'images',
    'file',
    'files',
    'icon',
    'color',
]
export type modelValueTypes = string | number | boolean | object

export interface InputData {
    // 标题
    title?: string
    // 内容,比如radio的选项列表数据 content: { a: '选项1', b: '选项2' }
    content?: any
    // 提示信息
    tip?: string
    // 需要生成子级元素时,子级元素属性(比如radio)
    childrenAttr?: anyObj
    // 城市选择器等级,1=省,2=市,3=区
    level?: number
}

/**
 * input可用属性,用于代码提示,渲染不同输入组件时,需要的属性是不一样的
 * https://element-plus.org/zh-CN/component/input.html#input-属性
 */
export interface InputAttr {
    id?: string
    name?: string
    type?: string
    placeholder?: string
    maxlength?: string | number
    minlength?: string | number
    'show-word-limit'?: boolean
    clearable?: boolean
    'show-password'?: boolean
    disabled?: boolean
    size?: 'large' | 'default' | 'small'
    'prefix-icon'?: string | Component
    'suffix-icon'?: string | Component
    rows?: number
    border?: boolean
    autosize?: boolean | anyObj
    autocomplete?: string
    readonly?: boolean
    max?: string | number
    min?: string | number
    step?: string | number
    resize?: 'none' | 'both' | 'horizontal' | 'vertical'
    autofocus?: boolean
    form?: string
    label?: string
    tabindex?: string | number
    'validate-event'?: boolean
    'input-style'?: anyObj
    // DateTimePicker属性
    editable?: boolean
    'start-placeholder'?: string
    'end-placeholder'?: string
    'time-arrow-control'?: boolean
    format?: string
    'popper-class'?: string
    'range-separator'?: string
    'default-value'?: Date
    'default-time'?: Date | Date[]
    'value-format'?: string
    'unlink-panels'?: boolean
    'clear-icon'?: string | Component
    shortcuts?: { text: string; value: Date | Function }[]
    disabledDate?: Function
    cellClassName?: Function
    teleported?: boolean
    // select属性
    multiple?: boolean
    'value-key'?: string
    'collapse-tags'?: string
    'collapse-tags-tooltip'?: boolean
    'multiple-limit'?: number
    effect?: 'dark' | 'light'
    filterable?: boolean
    'allow-create'?: boolean
    'filter-method'?: Function
    remote?: false // 禁止使用远程搜索,如需使用请使用单独封装好的 remoteSelect 组件
    'remote-method'?: false
    'label-formatter'?: (optionData: anyObj, optionKey: string) => string
    'no-match-text'?: string
    'no-data-text'?: string
    'reserve-keyword'?: boolean
    'default-first-option'?: boolean
    'popper-append-to-body'?: boolean
    persistent?: boolean
    'automatic-dropdown'?: boolean
    'fit-input-width'?: boolean
    'tag-type'?: 'success' | 'info' | 'warning' | 'danger'
    params?: anyObj
    // 远程select属性
    pk?: string
    field?: string
    'remote-url'?: string
    'tooltip-params'?: anyObj
    // 图标选择器属性
    'show-icon-name'?: boolean
    placement?: string
    title?: string
    // 颜色选择器
    'show-alpha'?: boolean
    'color-format'?: string
    predefine?: string[]
    // 图片文件上传属性
    action?: string
    headers?: anyObj
    method?: string
    data?: anyObj
    'with-credentials'?: boolean
    'show-file-list'?: boolean
    drag?: boolean
    accept?: string
    'list-type'?: string
    'auto-upload'?: boolean
    limit?: number
    'return-full-url'?: boolean
    // editor属性
    height?: string
    mode?: string
    editorStyle?: CSSProperties
    style?: CSSProperties
    toolbarConfig?: anyObj
    editorConfig?: anyObj
    // 返回数据类型
    'data-type'?: string
    // 事件
    onPreview?: Function
    onRemove?: Function
    onSuccess?: Function
    onError?: Function
    onProgress?: Function
    onExceed?: Function
    onBeforeUpload?: Function
    onBeforeRemove?: Function
    onChange?: Function
    onInput?: Function
    onVisibleChange?: Function
    onRemoveTag?: Function
    onClear?: Function
    onBlur?: Function
    onFocus?: Function
    onCalendarChange?: Function
    onPanelChange?: Function
    onActiveChange?: Function
    [key: string]: any
}

export interface FormItemAttr {
    id?: string
    class?: string
    prop?: string | string[]
    'label-width'?: string | number
    required?: boolean
    rules?: FormItemRule | FormItemRule[]
    error?: string
    'show-message'?: boolean
    'inline-message'?: boolean
    size?: 'large' | 'default' | 'small'
    style?: CSSProperties
    'block-help'?: string
}
