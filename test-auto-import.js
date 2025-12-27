// Test file to verify auto-import works
const count = ref(0)
const doubled = computed(() => count.value * 2)

console.log(doubled.value)

