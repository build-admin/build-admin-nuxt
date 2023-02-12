<script lang="ts">
import { CSSProperties } from 'vue'
export default defineComponent({
    name: 'Icon',
    props: {
        name: {
            type: String,
            required: true,
        },
        size: {
            type: String,
            default: '18px',
        },
        color: {
            type: String,
            default: '#000000',
        },
        attr: {
            type: Object,
            default: () => {},
        },
    },
    setup(props) {
        const iconStyle = computed((): CSSProperties => {
            const { size, color } = props
            let s = `${size.replace('px', '')}px`
            return {
                fontSize: s,
                color: color,
            }
        })

        if (props.name.startsWith('el-icon-')) {
            return () =>
                h(resolveComponent('el-icon'), { class: props.name, style: iconStyle.value, ...props.attr }, () => h(resolveComponent(props.name)))
        } else if (props.name.startsWith('local-') || isExternal(props.name)) {
            const name = props.name.replace('local-', '')
            return () => h(resolveComponent('nuxt-icon'), { class: props.name, name: name, style: iconStyle.value, ...props.attr })
        } else {
            return () => h('i', { class: props.name, style: iconStyle.value, ...props.attr })
        }
    },
})
</script>
