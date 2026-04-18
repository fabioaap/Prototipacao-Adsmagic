import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const STORAGE_KEY = 'app:sidebar:collapsed'

function readInitialCollapsed(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : false
  } catch {
    return false
  }
}

const collapsedState = ref<boolean>(readInitialCollapsed())

watch(collapsedState, (value) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    // ignore
  }
})

export function useSidebar() {
  const route = useRoute()

  const toggle = () => {
    collapsedState.value = !collapsedState.value
  }

  const setCollapsed = (value: boolean) => {
    collapsedState.value = value
  }

  const isActive = (path: string) => {
    return route.path.startsWith(path)
  }

  return {
    collapsed: collapsedState,
    toggle,
    setCollapsed,
    isActive,
  }
}


