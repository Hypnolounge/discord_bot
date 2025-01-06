export function deepSearchByValue(obj: Object, query: string) {
    for (const entry in Object.entries(obj)) {
        const [key, value] = entry
        if(typeof value === "object") {
            return deepSearchByValue(value, query)
        }
        if(value === query) return {key, value}
    }

    return null
}

export function deepSearchByKey(obj: Object, query: string) {
    for (const entry in Object.entries(obj)) {
        const [key, value] = entry
        if(typeof value === "object") {
            return deepSearchByKey(value, query)
        }
        if(key === query) return {key, value}
    }

    return null
}