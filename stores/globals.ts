/**
 * 全局公用的变量
 * 请注意，loadLangHandle 并不具备响应性！！！
 * 一旦具备响应性，nuxt 将自动对其“从服务端序列化到客户端”，而 loadLangHandle 存储的函数，是不能被序列化的
 * 您也可以使用 ref 或 reactive 使变量具备响应性，就像 unique 一样
 */
import type { Globals } from './interface/index'

export const globals: Globals = {
    lazy: null,
    unique: ref(0),
    loadLangHandle: {},
}
