<script lang="ts">
import { isArray, isString } from 'lodash-es'
import type { PropType, VNode } from 'vue'
import { createVNode } from 'vue'
import { getArea } from '~/api/common'
import type { InputAttr, InputData, ModelValueTypes } from '~/composables/baInput/types'
import { inputTypes } from '~/composables/baInput/types'

export default defineComponent({
    name: 'baInput',
    props: {
        // 输入框类型,支持的输入框见 inputTypes
        type: {
            type: String,
            required: true,
            validator: (value: string) => {
                return inputTypes.includes(value)
            },
        },
        // 双向绑定值
        modelValue: {
            type: null,
            required: true,
        },
        // 输入框的附加属性
        attr: {
            type: Object as PropType<InputAttr>,
            default: () => {},
        },
        // 额外数据,radio、checkbox的选项等数据
        data: {
            type: Object as PropType<InputData>,
            default: () => {},
        },
    },
    emits: ['update:modelValue'],
    setup(props, { emit, slots }) {
        // 合并 props.attr 和 props.data
        const attrs = computed(() => {
            return { ...props.attr, ...props.data }
        })

        // 通用值更新函数
        const onValueUpdate = (value: ModelValueTypes) => {
            emit('update:modelValue', value)
        }

        // 基础用法 string textarea password
        const bases = () => {
            return () =>
                createVNode(
                    resolveComponent('el-input'),
                    {
                        type: props.type == 'string' ? 'text' : props.type,
                        ...attrs.value,
                        modelValue: props.modelValue,
                        'onUpdate:modelValue': onValueUpdate,
                    },
                    slots
                )
        }
        // radio checkbox
        const rc = () => {
            if (!attrs.value.content) {
                console.warn('请传递 ' + props.type + ' 的 content')
            }

            // nuxt 中 resolveComponent 只支持使用字面量，此处对 radio 和 checkbox 组件硬编码
            const components = {
                radio: resolveComponent('el-radio'),
                checkbox: resolveComponent('el-checkbox'),
                'radio-group': resolveComponent('el-radio-group'),
                'checkbox-group': resolveComponent('el-checkbox-group'),
                'radio-button': resolveComponent('el-radio-button'),
                'checkbox-button': resolveComponent('el-checkbox-button'),
            }

            const vNodes = computed(() => {
                const vNode: VNode[] = []
                const contentIsArray = isArray(attrs.value.content)
                const type = attrs.value.button ? props.type + '-button' : props.type
                for (const key in attrs.value.content) {
                    let nodeProps = {}
                    if (contentIsArray) {
                        if (typeof attrs.value.content[key].value == 'number') {
                            console.warn(props.type + ' 的 content.value 不能是数字')
                        }

                        nodeProps = {
                            ...attrs.value.content[key],
                            border: attrs.value.border ? attrs.value.border : false,
                            ...(attrs.value.childrenAttr || {}),
                        }
                    } else {
                        nodeProps = {
                            value: key,
                            label: attrs.value.content[key],
                            border: attrs.value.border ? attrs.value.border : false,
                            ...(attrs.value.childrenAttr || {}),
                        }
                    }
                    vNode.push(createVNode(components[type as keyof typeof components], nodeProps, slots))
                }
                return vNode
            })

            return () => {
                const valueComputed = computed(() => {
                    if (props.type == 'radio') {
                        if (props.modelValue == undefined) return ''
                        return '' + props.modelValue
                    } else {
                        let modelValueArr: anyObj = []
                        for (const key in props.modelValue) {
                            modelValueArr[key] = '' + props.modelValue[key]
                        }
                        return modelValueArr
                    }
                })
                return createVNode(
                    components[(props.type + '-group') as keyof typeof components],
                    {
                        ...attrs.value,
                        modelValue: valueComputed.value,
                        'onUpdate:modelValue': onValueUpdate,
                    },
                    () => vNodes.value
                )
            }
        }
        // select selects
        const select = () => {
            if (!attrs.value.content) {
                console.warn('请传递 ' + props.type + '的 content')
            }

            const vNodes = computed(() => {
                const vNode: VNode[] = []
                for (const key in attrs.value.content) {
                    vNode.push(
                        createVNode(
                            resolveComponent('el-option'),
                            {
                                key: key,
                                label: attrs.value.content[key],
                                value: key,
                                ...(attrs.value.childrenAttr || {}),
                            },
                            slots
                        )
                    )
                }
                return vNode
            })

            return () => {
                const valueComputed = computed(() => {
                    if (props.type == 'select') {
                        if (props.modelValue == undefined) return ''
                        return '' + props.modelValue
                    } else {
                        let modelValueArr: anyObj = []
                        for (const key in props.modelValue) {
                            modelValueArr[key] = '' + props.modelValue[key]
                        }
                        return modelValueArr
                    }
                })
                return createVNode(resolveComponent('client-only'), {}, () =>
                    createVNode(
                        resolveComponent('el-select'),
                        {
                            class: 'w100',
                            multiple: props.type == 'select' ? false : true,
                            clearable: true,
                            ...attrs.value,
                            modelValue: valueComputed.value,
                            'onUpdate:modelValue': onValueUpdate,
                        },
                        () => vNodes.value
                    )
                )
            }
        }
        // datetime
        const datetime = () => {
            let valueFormat = 'YYYY-MM-DD HH:mm:ss'
            switch (props.type) {
                case 'date':
                    valueFormat = 'YYYY-MM-DD'
                    break
                case 'year':
                    valueFormat = 'YYYY'
                    break
            }
            return () =>
                createVNode(
                    resolveComponent('el-date-picker'),
                    {
                        class: 'w100',
                        type: props.type,
                        'value-format': valueFormat,
                        ...attrs.value,
                        modelValue: props.modelValue,
                        'onUpdate:modelValue': onValueUpdate,
                    },
                    slots
                )
        }
        // upload
        const upload = () => {
            return () =>
                createVNode(
                    resolveComponent('BaInputUpload'),
                    {
                        type: props.type,
                        modelValue: props.modelValue,
                        'onUpdate:modelValue': onValueUpdate,
                        ...attrs.value,
                    },
                    slots
                )
        }

        // remoteSelect remoteSelects
        const remoteSelect = () => {
            return () =>
                createVNode(resolveComponent('client-only'), {}, () => {
                    return createVNode(
                        resolveComponent('BaInputRemoteSelect'),
                        {
                            modelValue: props.modelValue,
                            'onUpdate:modelValue': onValueUpdate,
                            multiple: props.type == 'remoteSelect' ? false : true,
                            ...attrs.value,
                        },
                        slots
                    )
                })
        }

        const buildFun = new Map([
            ['string', bases],
            [
                'number',
                () => {
                    return () =>
                        createVNode(
                            resolveComponent('el-input-number'),
                            {
                                class: 'w100',
                                'controls-position': 'right',
                                ...attrs.value,
                                modelValue: isString(props.modelValue) ? Number(props.modelValue) : props.modelValue,
                                'onUpdate:modelValue': onValueUpdate,
                            },
                            slots
                        )
                },
            ],
            ['textarea', bases],
            ['password', bases],
            ['radio', rc],
            ['checkbox', rc],
            [
                'switch',
                () => {
                    // 值类型:string,number,boolean,custom
                    const valueType = computed(() => {
                        if (typeof attrs.value.activeValue !== 'undefined' && typeof attrs.value.inactiveValue !== 'undefined') {
                            return 'custom'
                        }
                        return typeof props.modelValue
                    })

                    // 要传递给 el-switch 组件的绑定值，该组件对传入值有限制，先做处理
                    const valueComputed = computed(() => {
                        if (valueType.value === 'boolean' || valueType.value === 'custom') {
                            return props.modelValue
                        } else {
                            let valueTmp = parseInt(props.modelValue as string)
                            return isNaN(valueTmp) || valueTmp <= 0 ? false : true
                        }
                    })
                    return () =>
                        createVNode(
                            resolveComponent('el-switch'),
                            {
                                ...attrs.value,
                                modelValue: valueComputed.value,
                                'onUpdate:modelValue': (value: boolean) => {
                                    let newValue: boolean | string | number = value
                                    switch (valueType.value) {
                                        case 'string':
                                            newValue = value ? '1' : '0'
                                            break
                                        case 'number':
                                            newValue = value ? 1 : 0
                                    }
                                    emit('update:modelValue', newValue)
                                },
                            },
                            slots
                        )
                },
            ],
            ['datetime', datetime],
            [
                'year',
                () => {
                    return () => {
                        const valueComputed = computed(() => (!props.modelValue ? null : '' + props.modelValue))
                        return createVNode(
                            resolveComponent('el-date-picker'),
                            {
                                class: 'w100',
                                type: props.type,
                                'value-format': 'YYYY',
                                ...attrs.value,
                                modelValue: valueComputed.value,
                                'onUpdate:modelValue': onValueUpdate,
                            },
                            slots
                        )
                    }
                },
            ],
            ['date', datetime],
            [
                'time',
                () => {
                    return () =>
                        createVNode(
                            resolveComponent('el-time-picker'),
                            {
                                class: 'w100',
                                clearable: true,
                                format: 'HH:mm:ss',
                                valueFormat: 'HH:mm:ss',
                                ...attrs.value,
                                modelValue: props.modelValue,
                                'onUpdate:modelValue': onValueUpdate,
                            },
                            slots
                        )
                },
            ],
            ['select', select],
            ['selects', select],
            [
                'array',
                () => {
                    return () =>
                        createVNode(
                            resolveComponent('BaInputArray'),
                            {
                                modelValue: props.modelValue,
                                'onUpdate:modelValue': onValueUpdate,
                                ...attrs.value,
                            },
                            slots
                        )
                },
            ],
            ['remoteSelect', remoteSelect],
            ['remoteSelects', remoteSelect],
            [
                'city',
                async () => {
                    type Node = { value?: number; label?: string; leaf?: boolean }
                    let maxLevel = attrs.value.level ? attrs.value.level - 1 : 2
                    const lastLazyValue: {
                        value: string | number[] | unknown
                        nodes: Node[]
                        key: string
                        currentRequest: any
                    } = reactive({
                        value: props.modelValue,
                        nodes: [],
                        key: '',
                        currentRequest: null,
                    })

                    // 请求到的node备份-s
                    let nodeEbak: anyObj = {}
                    const getNodes = (level: number, key: string) => {
                        if (nodeEbak[level] && nodeEbak[level][key]) {
                            return nodeEbak[level][key]
                        }
                        return false
                    }
                    const setNodes = (level: number, key: string, nodes: Node[] = []) => {
                        if (!nodeEbak[level]) {
                            nodeEbak[level] = {}
                        }
                        nodeEbak[level][key] = nodes
                    }
                    // 请求到的node备份-e

                    // 初始化请求-s
                    let key = isArray(props.modelValue) ? props.modelValue.join(',') : ''
                    lastLazyValue.key = key ? key : 'init'
                    await getArea([]).then((res) => {
                        if (res.code != 1) return
                        let toStr = false
                        if (props.modelValue && typeof (props.modelValue as anyObj)[0] === 'string') {
                            toStr = true
                        }
                        for (const key in res.data) {
                            if (toStr) {
                                res.data[key].value = res.data[key].value.toString()
                            }
                            lastLazyValue.nodes.push(res.data[key])
                        }
                        setNodes(0, lastLazyValue.key, lastLazyValue.nodes)
                    })
                    // 初始化请求-e

                    return () =>
                        createVNode(resolveComponent('client-only'), {}, () => {
                            return createVNode(
                                resolveComponent('el-cascader'),
                                {
                                    modelValue: props.modelValue,
                                    'onUpdate:modelValue': onValueUpdate,
                                    class: 'w100',
                                    clearable: true,
                                    // city 数据使用 varchar 存储，所以清空时使用 empty string 而不是 null
                                    valueOnClear: '',
                                    props: {
                                        lazy: true,
                                        lazyLoad(node: any, resolve: any) {
                                            // lazyLoad会频繁触发,在本地存储请求结果,供重复触发时直接读取
                                            const { level, pathValues } = node
                                            let key = pathValues.join(',')
                                            key = key ? key : 'init'

                                            let locaNode = getNodes(level, key)
                                            if (locaNode) {
                                                return resolve(locaNode)
                                            }

                                            if (lastLazyValue.key == key && lastLazyValue.value == props.modelValue) {
                                                if (lastLazyValue.currentRequest) {
                                                    return lastLazyValue.currentRequest
                                                }
                                                return resolve(lastLazyValue.nodes)
                                            }

                                            let nodes: Node[] = []
                                            lastLazyValue.key = key
                                            lastLazyValue.currentRequest = getArea(pathValues).then((res) => {
                                                if (res.code != 1) return
                                                let toStr = false
                                                if (props.modelValue && typeof (props.modelValue as anyObj)[0] === 'string') {
                                                    toStr = true
                                                }
                                                for (const key in res.data) {
                                                    if (toStr) {
                                                        res.data[key].value = res.data[key].value.toString()
                                                    }
                                                    res.data[key].leaf = level >= maxLevel
                                                    nodes.push(res.data[key])
                                                }
                                                lastLazyValue.nodes = nodes
                                                lastLazyValue.currentRequest = null
                                                setNodes(level, key, nodes)
                                                resolve(nodes)
                                            })
                                        },
                                    },
                                    ...attrs.value,
                                },
                                slots
                            )
                        })
                },
            ],
            ['image', upload],
            ['images', upload],
            ['file', upload],
            ['files', upload],
            [
                'icon',
                () => {
                    return () =>
                        createVNode(
                            resolveComponent('BaInputIconSelector'),
                            {
                                modelValue: props.modelValue,
                                'onUpdate:modelValue': onValueUpdate,
                                ...attrs.value,
                            },
                            slots
                        )
                },
            ],
            [
                'color',
                () => {
                    return () =>
                        createVNode(
                            resolveComponent('el-color-picker'),
                            {
                                modelValue: props.modelValue,
                                'onUpdate:modelValue': onValueUpdate,
                                ...attrs.value,
                            },
                            slots
                        )
                },
            ],
            [
                'editor',
                () => {
                    return () =>
                        createVNode(
                            resolveComponent('BaInputEditor'),
                            {
                                class: 'w100',
                                modelValue: props.modelValue,
                                'onUpdate:modelValue': onValueUpdate,
                                ...attrs.value,
                            },
                            slots
                        )
                },
            ],
            [
                'default',
                () => {
                    console.warn('暂不支持' + props.type + '的输入框类型，你可以自行在 BaInput 组件内添加逻辑')
                },
            ],
        ])

        let action = buildFun.get(props.type) || buildFun.get('default')
        return action!.call(this)
    },
})
</script>

<style scoped lang="scss">
.ba-upload-image :deep(.el-upload--picture-card) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
}
.ba-upload-file :deep(.el-upload-list) {
    margin-left: -10px;
}
</style>
