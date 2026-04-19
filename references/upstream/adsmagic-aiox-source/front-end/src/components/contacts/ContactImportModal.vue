<script setup lang="ts">
/**
 * ContactImportModal.vue
 * 
 * Modal para importação de contatos via CSV com:
 * - Upload de arquivo CSV
 * - Preview dos dados
 * - Mapeamento de colunas (CSV → campos do Contact)
 * - Validação de dados
 * - Importação em lote
 * 
 * @gap G6.7 - Importação de contatos (CSV com mapeamento)
 */
import { ref, computed, watch } from 'vue'
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, X, ArrowRight, Loader2 } from 'lucide-vue-next'
import Modal from '@/components/ui/Modal.vue'
import Button from '@/components/ui/Button.vue'
import Select from '@/components/ui/Select.vue'
import Badge from '@/components/ui/Badge.vue'
import Progress from '@/components/ui/Progress.vue'
import { useOriginsStore } from '@/stores/origins'
import { useStagesStore } from '@/stores/stages'
import { createContact } from '@/services/api/contacts'
import type { CreateContactDTO } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  imported: [count: number]
}>()

// ============================================================================
// STORES
// ============================================================================
const originsStore = useOriginsStore()
const stagesStore = useStagesStore()

// ============================================================================
// STATE
// ============================================================================

type ImportStep = 'upload' | 'mapping' | 'preview' | 'importing' | 'complete'

const currentStep = ref<ImportStep>('upload')
const file = ref<File | null>(null)
const csvData = ref<string[][]>([])
const headers = ref<string[]>([])
const isDragging = ref(false)

// Mapeamento de colunas
interface ColumnMapping {
  csvColumn: string
  field: keyof CreateContactDTO | 'skip'
}

const columnMappings = ref<ColumnMapping[]>([])

// Campos disponíveis para mapeamento
const availableFields: { value: keyof CreateContactDTO | 'skip'; label: string; required: boolean }[] = [
  { value: 'name', label: 'Nome', required: true },
  { value: 'phone', label: 'Telefone', required: true },
  { value: 'countryCode', label: 'Código do País', required: false },
  { value: 'email', label: 'Email', required: false },
  { value: 'company', label: 'Empresa', required: false },
  { value: 'location', label: 'Localização', required: false },
  { value: 'notes', label: 'Notas', required: false },
  { value: 'origin', label: 'Origem', required: false },
  { value: 'stage', label: 'Estágio', required: false },
  { value: 'skip', label: '(Ignorar coluna)', required: false },
]

// Defaults para origem e estágio
const defaultOrigin = ref<string>('')
const defaultStage = ref<string>('')

// Progress de importação
const importProgress = ref(0)
const importedCount = ref(0)
const errorCount = ref(0)
const errors = ref<string[]>([])

// ============================================================================
// COMPUTED
// ============================================================================

const previewRows = computed(() => {
  return csvData.value.slice(1, 6) // Primeiras 5 linhas de dados
})

const totalRows = computed(() => {
  return csvData.value.length - 1 // Exclui header
})

const requiredFieldsMapped = computed(() => {
  const mappedFields = columnMappings.value.map(m => m.field)
  return mappedFields.includes('name') && mappedFields.includes('phone')
})

const originOptions = computed(() => {
  return originsStore.origins.map(o => ({ value: o.id, label: o.name }))
})

const stageOptions = computed(() => {
  return stagesStore.stages.map(s => ({ value: s.id, label: s.name }))
})

const fieldOptions = computed(() => {
  return availableFields.map(f => ({
    value: f.value,
    label: f.required ? `${f.label} *` : f.label
  }))
})

// ============================================================================
// METHODS
// ============================================================================

const handleClose = () => {
  resetState()
  emit('update:open', false)
}

const resetState = () => {
  currentStep.value = 'upload'
  file.value = null
  csvData.value = []
  headers.value = []
  columnMappings.value = []
  importProgress.value = 0
  importedCount.value = 0
  errorCount.value = 0
  errors.value = []
  defaultOrigin.value = originsStore.origins[0]?.id || ''
  defaultStage.value = stagesStore.stages[0]?.id || ''
}

const parseCSV = (text: string): string[][] => {
  const lines = text.split(/\r\n|\n/)
  const result: string[][] = []
  
  for (const line of lines) {
    if (!line.trim()) continue
    
    // Parse simples (não trata aspas escapadas complexas)
    const cells: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if ((char === ',' || char === ';') && !inQuotes) {
        cells.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    cells.push(current.trim())
    
    result.push(cells)
  }
  
  return result
}

const handleFileSelect = async (selectedFile: File) => {
  file.value = selectedFile
  
  const text = await selectedFile.text()
  csvData.value = parseCSV(text)
  
  if (csvData.value.length < 2) {
    errors.value = ['Arquivo CSV precisa ter pelo menos um header e uma linha de dados']
    return
  }
  
  headers.value = csvData.value[0] ?? []
  
  // Auto-mapear colunas baseado em nomes comuns
  columnMappings.value = headers.value.map((header: string) => {
    const lowerHeader = header.toLowerCase().trim()
    
    if (lowerHeader.includes('nome') || lowerHeader === 'name') {
      return { csvColumn: header, field: 'name' as const }
    }
    if (lowerHeader.includes('telefone') || lowerHeader.includes('phone') || lowerHeader.includes('celular')) {
      return { csvColumn: header, field: 'phone' as const }
    }
    if (lowerHeader.includes('email') || lowerHeader.includes('e-mail')) {
      return { csvColumn: header, field: 'email' as const }
    }
    if (lowerHeader.includes('empresa') || lowerHeader.includes('company')) {
      return { csvColumn: header, field: 'company' as const }
    }
    if (lowerHeader.includes('cidade') || lowerHeader.includes('cidade') || lowerHeader.includes('local')) {
      return { csvColumn: header, field: 'location' as const }
    }
    if (lowerHeader.includes('nota') || lowerHeader.includes('obs') || lowerHeader.includes('notes')) {
      return { csvColumn: header, field: 'notes' as const }
    }
    if (lowerHeader.includes('origem') || lowerHeader.includes('origin') || lowerHeader.includes('fonte')) {
      return { csvColumn: header, field: 'origin' as const }
    }
    if (lowerHeader.includes('estágio') || lowerHeader.includes('estagio') || lowerHeader.includes('stage') || lowerHeader.includes('status')) {
      return { csvColumn: header, field: 'stage' as const }
    }
    
    return { csvColumn: header, field: 'skip' as const }
  })
  
  // Set defaults
  defaultOrigin.value = originsStore.origins[0]?.id || ''
  defaultStage.value = stagesStore.stages[0]?.id || ''
  
  currentStep.value = 'mapping'
}

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    const selectedFile = files[0]
    if (!selectedFile) return
    if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
      handleFileSelect(selectedFile)
    } else {
      errors.value = ['Por favor, selecione um arquivo CSV']
    }
  }
}

const handleFileInput = (e: Event) => {
  const input = e.target as HTMLInputElement
  const files = input.files
  if (files && files.length > 0 && files[0]) {
    handleFileSelect(files[0])
  }
}

const updateMapping = (index: number, field: keyof CreateContactDTO | 'skip') => {
  const mapping = columnMappings.value[index]
  if (mapping) {
    mapping.field = field
  }
}

const goToPreview = () => {
  if (!requiredFieldsMapped.value) {
    errors.value = ['Mapeie pelo menos Nome e Telefone']
    return
  }
  errors.value = []
  currentStep.value = 'preview'
}

const getMappedValue = (row: string[], field: keyof CreateContactDTO | 'skip'): string => {
  if (field === 'skip') return ''
  
  const mappingIndex = columnMappings.value.findIndex(m => m.field === field)
  if (mappingIndex === -1) return ''
  
  const mapping = columnMappings.value[mappingIndex]
  if (!mapping) return ''
  
  const csvIndex = headers.value.indexOf(mapping.csvColumn)
  if (csvIndex === -1) return ''
  
  return row[csvIndex] ?? ''
}

const formatPhone = (phone: string): string => {
  // Remove tudo exceto dígitos
  return phone.replace(/\D/g, '')
}

const startImport = async () => {
  currentStep.value = 'importing'
  importProgress.value = 0
  importedCount.value = 0
  errorCount.value = 0
  errors.value = []
  
  const dataRows = csvData.value.slice(1) // Remove header
  const total = dataRows.length
  
  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i]
    if (!row) continue
    
    try {
      const name = getMappedValue(row, 'name')
      const phone = formatPhone(getMappedValue(row, 'phone'))
      
      if (!name || !phone) {
        errors.value.push(`Linha ${i + 2}: Nome ou telefone vazio`)
        errorCount.value++
        continue
      }
      
      // Preparar dados do contato
      const contactData: CreateContactDTO = {
        name,
        phone,
        countryCode: getMappedValue(row, 'countryCode') || '+55',
        email: getMappedValue(row, 'email') || undefined,
        company: getMappedValue(row, 'company') || undefined,
        location: getMappedValue(row, 'location') || undefined,
        notes: getMappedValue(row, 'notes') || undefined,
        origin: getMappedValue(row, 'origin') || defaultOrigin.value,
        stage: getMappedValue(row, 'stage') || defaultStage.value,
      }
      
      const result = await createContact(contactData)
      
      if (result.ok) {
        importedCount.value++
      } else {
        errors.value.push(`Linha ${i + 2}: ${result.error.message}`)
        errorCount.value++
      }
    } catch (error) {
      errors.value.push(`Linha ${i + 2}: Erro desconhecido`)
      errorCount.value++
    }
    
    importProgress.value = Math.round(((i + 1) / total) * 100)
  }
  
  currentStep.value = 'complete'
  emit('imported', importedCount.value)
}

// Reset quando o modal abre
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    resetState()
  }
})
</script>

<template>
  <Modal
    :open="props.open"
    size="2xl"
    :no-padding="true"
    @update:open="$emit('update:open', $event)"
  >
    <div class="w-full max-h-[90vh] flex flex-col">
        <!-- Header -->
        <header class="flex items-center justify-between p-4 border-b">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <FileSpreadsheet class="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 class="section-title-sm">Importar Contatos</h2>
              <p class="text-sm text-muted-foreground">
                {{ currentStep === 'upload' ? 'Selecione um arquivo CSV' :
                   currentStep === 'mapping' ? 'Mapeie as colunas' :
                   currentStep === 'preview' ? 'Revise os dados' :
                   currentStep === 'importing' ? 'Importando...' :
                   'Importação concluída' }}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" @click="handleClose">
            <X class="h-5 w-5" />
          </Button>
        </header>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-4">
          <!-- Step 1: Upload -->
          <div v-if="currentStep === 'upload'" class="space-y-4">
            <div
              :class="cn(
                'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
                isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
              )"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleDrop"
            >
              <Upload class="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p class="section-title-sm mb-2">Arraste o arquivo CSV aqui</p>
              <p class="text-sm text-muted-foreground mb-4">ou</p>
              <label>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  class="hidden"
                  @change="handleFileInput"
                />
                <Button as="span" variant="outline" class="cursor-pointer">
                  Selecionar Arquivo
                </Button>
              </label>
            </div>

            <div class="bg-muted/50 rounded-lg p-4">
              <h4 class="section-kicker mb-2">Formato esperado:</h4>
              <ul class="text-sm text-muted-foreground space-y-1">
                <li>• Arquivo CSV com separador vírgula (,) ou ponto e vírgula (;)</li>
                <li>• Primeira linha deve conter os nomes das colunas</li>
                <li>• Colunas obrigatórias: <strong>Nome</strong> e <strong>Telefone</strong></li>
                <li>• Colunas opcionais: Email, Empresa, Localização, Notas</li>
              </ul>
            </div>
          </div>

          <!-- Step 2: Mapping -->
          <div v-else-if="currentStep === 'mapping'" class="space-y-4">
            <div v-if="file" class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <FileSpreadsheet class="h-5 w-5 text-primary" />
              <div>
                <p class="section-kicker">{{ file.name }}</p>
                <p class="text-xs text-muted-foreground">{{ totalRows }} contatos encontrados</p>
              </div>
            </div>

            <div class="space-y-3">
              <h4 class="section-kicker">Mapeamento de Colunas</h4>
              <p class="text-sm text-muted-foreground">
                Associe cada coluna do CSV a um campo do contato
              </p>

              <div class="space-y-2">
                <div
                  v-for="(mapping, index) in columnMappings"
                  :key="mapping.csvColumn"
                  class="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                >
                  <div class="flex-1">
                    <p class="section-kicker">{{ mapping.csvColumn }}</p>
                    <p class="text-xs text-muted-foreground truncate">
                      Ex: {{ csvData[1]?.[index] || '-' }}
                    </p>
                  </div>
                  <ArrowRight class="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <Select
                    :model-value="mapping.field"
                    :options="fieldOptions"
                    @update:model-value="(v: string) => updateMapping(index, v as keyof CreateContactDTO | 'skip')"
                    class="w-48"
                  />
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm section-title-sm mb-2 block">Origem padrão</label>
                <Select
                  v-model="defaultOrigin"
                  :options="originOptions"
                  placeholder="Selecione origem"
                  class="w-full"
                />
              </div>
              <div>
                <label class="text-sm section-title-sm mb-2 block">Estágio padrão</label>
                <Select
                  v-model="defaultStage"
                  :options="stageOptions"
                  placeholder="Selecione estágio"
                  class="w-full"
                />
              </div>
            </div>

            <div v-if="!requiredFieldsMapped" class="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg">
              <AlertCircle class="h-4 w-4 text-destructive" />
              <p class="text-sm text-destructive">
                Mapeie pelo menos as colunas Nome e Telefone
              </p>
            </div>
          </div>

          <!-- Step 3: Preview -->
          <div v-else-if="currentStep === 'preview'" class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="section-title-sm">Preview da Importação</h4>
                <p class="text-sm text-muted-foreground">
                  Mostrando {{ Math.min(5, totalRows) }} de {{ totalRows }} contatos
                </p>
              </div>
              <Badge variant="secondary">
                {{ totalRows }} contatos
              </Badge>
            </div>

            <div class="border rounded-lg overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead class="bg-muted/50">
                    <tr>
                      <th class="px-3 py-2 text-left font-medium">Nome</th>
                      <th class="px-3 py-2 text-left font-medium">Telefone</th>
                      <th class="px-3 py-2 text-left font-medium">Email</th>
                      <th class="px-3 py-2 text-left font-medium">Empresa</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, i) in previewRows" :key="i" class="border-t">
                      <td class="px-3 py-2">{{ getMappedValue(row, 'name') || '-' }}</td>
                      <td class="px-3 py-2">{{ getMappedValue(row, 'phone') || '-' }}</td>
                      <td class="px-3 py-2">{{ getMappedValue(row, 'email') || '-' }}</td>
                      <td class="px-3 py-2">{{ getMappedValue(row, 'company') || '-' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="bg-muted/50 rounded-lg p-4">
              <h4 class="section-kicker mb-2">Configuração:</h4>
              <ul class="text-sm text-muted-foreground space-y-1">
                <li>• Origem padrão: <strong>{{ originOptions.find(o => o.value === defaultOrigin)?.label || '-' }}</strong></li>
                <li>• Estágio padrão: <strong>{{ stageOptions.find(s => s.value === defaultStage)?.label || '-' }}</strong></li>
              </ul>
            </div>
          </div>

          <!-- Step 4: Importing -->
          <div v-else-if="currentStep === 'importing'" class="space-y-6 py-8">
            <div class="text-center">
              <Loader2 class="h-12 w-12 mx-auto text-primary animate-spin mb-4" />
              <h3 class="section-title-sm mb-2">Importando contatos...</h3>
              <p class="text-sm text-muted-foreground">
                {{ importedCount }} de {{ totalRows }} importados
              </p>
            </div>

            <Progress :value="importProgress" class="h-2" />

            <p class="text-center text-sm text-muted-foreground">
              {{ importProgress }}% concluído
            </p>
          </div>

          <!-- Step 5: Complete -->
          <div v-else-if="currentStep === 'complete'" class="space-y-6 py-8">
            <div class="text-center">
              <div 
                :class="cn(
                  'w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4',
                  errorCount === 0 ? 'bg-success/10' : 'bg-warning/10'
                )"
              >
                <CheckCircle2 
                  :class="cn(
                    'h-8 w-8',
                    errorCount === 0 ? 'text-success' : 'text-warning'
                  )" 
                />
              </div>
              <h3 class="section-title-sm mb-2">Importação Concluída!</h3>
              <p class="text-sm text-muted-foreground">
                {{ importedCount }} contatos importados com sucesso
              </p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="bg-success/10 rounded-lg p-4 text-center">
                <p class="text-2xl font-bold text-success">{{ importedCount }}</p>
                <p class="text-sm text-muted-foreground">Importados</p>
              </div>
              <div class="bg-destructive/10 rounded-lg p-4 text-center">
                <p class="text-2xl font-bold text-destructive">{{ errorCount }}</p>
                <p class="text-sm text-muted-foreground">Erros</p>
              </div>
            </div>

            <div v-if="errors.length > 0" class="bg-muted/50 rounded-lg p-4">
              <h4 class="section-kicker mb-2 text-destructive">Erros encontrados:</h4>
              <ul class="text-sm text-muted-foreground space-y-1 max-h-32 overflow-y-auto">
                <li v-for="(error, i) in errors.slice(0, 10)" :key="i">• {{ error }}</li>
                <li v-if="errors.length > 10" class="text-muted-foreground">
                  ... e mais {{ errors.length - 10 }} erros
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <footer class="flex items-center justify-between p-4 border-t">
          <div>
            <Button
              v-if="currentStep === 'mapping'"
              variant="outline"
              @click="currentStep = 'upload'"
            >
              Voltar
            </Button>
            <Button
              v-else-if="currentStep === 'preview'"
              variant="outline"
              @click="currentStep = 'mapping'"
            >
              Voltar
            </Button>
          </div>

          <div class="flex gap-2">
            <Button variant="outline" @click="handleClose">
              {{ currentStep === 'complete' ? 'Fechar' : 'Cancelar' }}
            </Button>

            <Button
              v-if="currentStep === 'mapping'"
              :disabled="!requiredFieldsMapped"
              @click="goToPreview"
            >
              Próximo
            </Button>

            <Button
              v-else-if="currentStep === 'preview'"
              @click="startImport"
            >
              Importar {{ totalRows }} Contatos
            </Button>
          </div>
        </footer>
    </div>
  </Modal>
</template>
