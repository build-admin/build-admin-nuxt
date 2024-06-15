<!-- 多编辑器共存支持 -->
<!-- 所有编辑器的代码位于 /@/composables/mixins/editor 文件夹，一个文件为一种编辑器，文件名则为编辑器名称 -->
<!-- 向本组件传递 editorType（文件名/编辑器名称）自动加载对应的编辑器进行渲染 -->
<template>
    <div>
        <client-only>
            <component v-if="state.mounted" :is="mixins[state.editorType]" v-bind="$attrs" />
        </client-only>
    </div>
</template>

<script setup lang="ts">
interface Props {
    editorType?: string
}

const props = withDefaults(defineProps<Props>(), {
    editorType: 'default',
})

const state = reactive({
    mounted: false,
    editorType: props.editorType,
})

const mixins: Record<string, Component> = {}
const getComponents = async () => {
    if (import.meta.server) return
    const mixinComponents = import.meta.glob('~/composables/mixins/editor/**.vue')
    for (const key in mixinComponents) {
        const res: any = await mixinComponents[key]()
        const fileName = key.replace('/composables/mixins/editor/', '').replace('.vue', '')
        mixins[fileName] = res.default

        // 未安装富文本编辑器时，值为 default，安装之后，则值为最后一个编辑器的名称
        if (props.editorType == 'default' && fileName != 'default') {
            state.editorType = fileName
        }
    }
    state.mounted = true
}
getComponents()
</script>

<style scoped lang="scss"></style>
