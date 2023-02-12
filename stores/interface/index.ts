export interface Globals {
    lazy: NodeJS.Timer | null
    unique: Ref<number>
    loadLangHandle: Record<string, any>
}
