/**
 * 全局公用的变量
 */
import type { Globals } from './interface/index'

export const globals: Globals = {
    lazy: null,
    unique: ref(0),
    loadLangHandle: {},
}
