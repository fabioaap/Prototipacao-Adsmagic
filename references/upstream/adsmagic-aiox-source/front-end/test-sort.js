const items = [
    { id: 1, value: 'new-file', label: 'New File' },
    { id: 2, value: 'open-file', label: 'Open File' },
    { id: 3, value: 'save-file', label: 'Save File' },
    { id: 4, value: 'settings', label: 'Settings' },
    { id: 5, value: 'help', label: 'Help' }
]

const search = 's'

const filtered = items
    .filter(item => item.label.toLowerCase().includes(search))
    .sort((a, b) => {
        const aLabel = a.label.toLowerCase()
        const bLabel = b.label.toLowerCase()

        // Prioritize exact matches at start
        const aStarts = aLabel.startsWith(search)
        const bStarts = bLabel.startsWith(search)

        if (aStarts && !bStarts) return -1
        if (!aStarts && bStarts) return 1

        // Both start or both don't start - alphabetical
        return aLabel.localeCompare(bLabel)
    })

console.log('Filtered for "s":')
filtered.forEach(item => {
    console.log(`- ${item.label} (${item.value}) - starts: ${item.label.toLowerCase().startsWith(search)}`)
})