function removeControlCharacters(value: string) {
    return Array.from(value)
        .filter((character) => {
            const code = character.charCodeAt(0)
            return code === 9 || code === 10 || code === 13 || (code >= 32 && code !== 127)
        })
        .join('')
}

export function normalizeUserInput(value: string, maxLength = 500) {
    return removeControlCharacters(value.normalize('NFKC'))
        .trim()
        .slice(0, maxLength)
}
