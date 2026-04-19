<script setup lang="ts">
import { ref } from 'vue'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'

// Grupo 1
import Checkbox from '@/components/ui/Checkbox.vue'
import Radio from '@/components/ui/Radio.vue'
import RadioGroup from '@/components/ui/RadioGroup.vue'
import Modal from '@/components/ui/Modal.vue'
import Alert from '@/components/ui/Alert.vue'
import AlertDialog from '@/components/ui/AlertDialog.vue'
import Spinner from '@/components/ui/Spinner.vue'

// Grupo 2
import Switch from '@/components/ui/Switch.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import Progress from '@/components/ui/Progress.vue'
import Tabs from '@/components/ui/Tabs.vue'
import TabsList from '@/components/ui/TabsList.vue'
import TabsTrigger from '@/components/ui/TabsTrigger.vue'
import TabsContent from '@/components/ui/TabsContent.vue'
import FormField from '@/components/ui/FormField.vue'

// State - Grupo 1
const checkboxValue = ref(false)
const checkboxWithLabel = ref(true)
const checkboxIndeterminate = ref(false)
const checkboxDisabled = ref(false)

const radioValue = ref('option1')
const radioHorizontal = ref('horizontal1')

const showDialog = ref(false)
const showAlertDialog = ref(false)

const showAlertInfo = ref(true)
const showAlertSuccess = ref(true)
const showAlertWarning = ref(true)
const showAlertDestructive = ref(true)

// State - Grupo 2
const switchValue = ref(false)
const switchLarge = ref(true)
const switchDisabled = ref(false)

const progressValue = ref(60)
const progressSuccess = ref(100)
const progressWarning = ref(30)

const activeTab = ref('tab1')

const formEmail = ref('')
const formError = ref('')

// Methods
const handleAlertDialogConfirm = () => {
  console.log('AlertDialog confirmed!')
  showAlertDialog.value = false
}

const validateEmail = () => {
  if (!formEmail.value) {
    formError.value = 'Email is required'
  } else if (!formEmail.value.includes('@')) {
    formError.value = 'Please enter a valid email address'
  } else {
    formError.value = ''
  }
}
</script>

<template>
  <div class="container mx-auto p-6 space-y-8">
    <!-- Header -->
    <div>
      <h1 class="text-3xl font-bold mb-2">Component Testing Page</h1>
      <p class="text-muted-foreground">
        Testing all new UI components (Grupo 1 + Grupo 2)
      </p>
    </div>

    <!-- Section Header: Grupo 1 -->
    <div class="border-t pt-6">
      <h2 class="text-2xl font-bold mb-4">Grupo 1 - Componentes Essenciais</h2>
    </div>

    <!-- Checkbox Tests -->
    <Card>
      <CardHeader>
        <CardTitle>Checkbox Component</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-3">
          <Checkbox
            v-model="checkboxValue"
            label="Simple checkbox"
          />
          <Checkbox
            v-model="checkboxWithLabel"
            label="Checkbox with label (checked by default)"
          />
          <Checkbox
            v-model="checkboxIndeterminate"
            :indeterminate="true"
            label="Indeterminate checkbox"
          />
          <Checkbox
            v-model="checkboxDisabled"
            :disabled="true"
            label="Disabled checkbox"
          />
        </div>

        <div class="pt-4 border-t">
          <p class="text-sm text-muted-foreground">
            Values: {{ checkboxValue }}, {{ checkboxWithLabel }}, {{ checkboxIndeterminate }}, {{ checkboxDisabled }}
          </p>
        </div>
      </CardContent>
    </Card>

    <!-- Radio Tests -->
    <Card>
      <CardHeader>
        <CardTitle>Radio & RadioGroup Components</CardTitle>
      </CardHeader>
      <CardContent class="space-y-6">
        <!-- Vertical RadioGroup -->
        <div>
          <h3 class="font-medium mb-3">Vertical RadioGroup (default)</h3>
          <RadioGroup v-model="radioValue">
            <Radio value="option1" label="Option 1" name="test-radio" />
            <Radio value="option2" label="Option 2" name="test-radio" />
            <Radio value="option3" label="Option 3" name="test-radio" />
            <Radio value="option4" label="Option 4 (disabled)" name="test-radio" :disabled="true" />
          </RadioGroup>
          <p class="text-sm text-muted-foreground mt-2">
            Selected: {{ radioValue }}
          </p>
        </div>

        <!-- Horizontal RadioGroup -->
        <div>
          <h3 class="font-medium mb-3">Horizontal RadioGroup</h3>
          <RadioGroup v-model="radioHorizontal" orientation="horizontal">
            <Radio value="horizontal1" label="Option A" name="test-radio-h" />
            <Radio value="horizontal2" label="Option B" name="test-radio-h" />
            <Radio value="horizontal3" label="Option C" name="test-radio-h" />
          </RadioGroup>
          <p class="text-sm text-muted-foreground mt-2">
            Selected: {{ radioHorizontal }}
          </p>
        </div>
      </CardContent>
    </Card>

    <!-- Dialog Tests -->
    <Card>
      <CardHeader>
        <CardTitle>Dialog Component</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex gap-3">
          <Button @click="showDialog = true">
            Open Dialog
          </Button>
        </div>

        <Modal
          v-model="showDialog"
          title="Example Dialog"
          description="This is an example dialog with title and description"
          size="md"
        >
          <div class="space-y-4">
            <p>This is the content of the dialog. You can put any content here.</p>
            <p class="text-sm text-muted-foreground">
              Press ESC or click outside to close (if not persistent).
            </p>
          </div>

          <template #footer>
            <Button variant="outline" @click="showDialog = false">
              Cancel
            </Button>
            <Button @click="showDialog = false">
              Confirm
            </Button>
          </template>
        </Modal>
      </CardContent>
    </Card>

    <!-- Alert Tests -->
    <Card>
      <CardHeader>
        <CardTitle>Alert Component</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <Alert
          v-if="showAlertInfo"
          variant="info"
          title="Info Alert"
          description="This is an informational alert with a close button."
          :closable="true"
          @close="showAlertInfo = false"
        />

        <Alert
          v-if="showAlertSuccess"
          variant="success"
          title="Success Alert"
          description="This is a success alert indicating a positive action."
          :closable="true"
          @close="showAlertSuccess = false"
        />

        <Alert
          v-if="showAlertWarning"
          variant="warning"
          title="Warning Alert"
          description="This is a warning alert to draw attention."
          :closable="true"
          @close="showAlertWarning = false"
        />

        <Alert
          v-if="showAlertDestructive"
          variant="destructive"
          title="Destructive Alert"
          description="This is a destructive/error alert indicating a problem."
          :closable="true"
          @close="showAlertDestructive = false"
        />

        <Button
          v-if="!showAlertInfo || !showAlertSuccess || !showAlertWarning || !showAlertDestructive"
          variant="outline"
          size="sm"
          @click="showAlertInfo = true; showAlertSuccess = true; showAlertWarning = true; showAlertDestructive = true"
        >
          Reset Alerts
        </Button>
      </CardContent>
    </Card>

    <!-- AlertDialog Tests -->
    <Card>
      <CardHeader>
        <CardTitle>AlertDialog Component</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex gap-3">
          <Button variant="destructive" @click="showAlertDialog = true">
            Open AlertDialog
          </Button>
        </div>

        <AlertDialog
          v-model="showAlertDialog"
          title="Are you sure?"
          description="This action cannot be undone. This will permanently delete your data."
          variant="destructive"
          confirm-text="Delete"
          cancel-text="Cancel"
          @confirm="handleAlertDialogConfirm"
          @cancel="console.log('Canceled')"
        />
      </CardContent>
    </Card>

    <!-- Spinner Tests -->
    <Card>
      <CardHeader>
        <CardTitle>Spinner Component</CardTitle>
      </CardHeader>
      <CardContent class="space-y-6">
        <!-- Sizes -->
        <div>
          <h3 class="font-medium mb-3">Sizes</h3>
          <div class="flex items-center gap-6">
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
            <Spinner size="xl" />
          </div>
        </div>

        <!-- Variants -->
        <div>
          <h3 class="font-medium mb-3">Variants</h3>
          <div class="flex items-center gap-6">
            <Spinner variant="primary" />
            <Spinner variant="secondary" />
            <Spinner variant="muted" />
          </div>
        </div>

        <!-- With Label -->
        <div>
          <h3 class="font-medium mb-3">With Label</h3>
          <div class="flex flex-col gap-3">
            <Spinner label="Loading..." />
            <Spinner label="Please wait..." size="sm" variant="muted" />
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Section Header: Grupo 2 -->
    <div class="border-t pt-6">
      <h2 class="text-2xl font-bold mb-4">Grupo 2 - Componentes Complementares</h2>
    </div>

    <!-- Switch Tests -->
    <Card>
      <CardHeader>
        <CardTitle>Switch Component</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-3">
          <Switch
            v-model="switchValue"
            label="Enable notifications"
          />
          <Switch
            v-model="switchLarge"
            label="Large switch"
            size="lg"
          />
          <Switch
            v-model="switchDisabled"
            label="Disabled switch"
            :disabled="true"
          />
        </div>

        <div class="pt-4 border-t">
          <p class="text-sm text-muted-foreground">
            Values: {{ switchValue }}, {{ switchLarge }}, {{ switchDisabled }}
          </p>
        </div>
      </CardContent>
    </Card>

    <!-- Skeleton Tests -->
    <Card>
      <CardHeader>
        <CardTitle>Skeleton Component</CardTitle>
      </CardHeader>
      <CardContent class="space-y-6">
        <div>
          <h3 class="font-medium mb-3">Text Skeleton</h3>
          <div class="space-y-2">
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="60%" />
          </div>
        </div>

        <div>
          <h3 class="font-medium mb-3">Circular Skeleton (Avatar)</h3>
          <Skeleton variant="circular" width="48px" height="48px" />
        </div>

        <div>
          <h3 class="font-medium mb-3">Rounded Skeleton (Card)</h3>
          <Skeleton variant="rounded" width="100%" height="120px" />
        </div>

        <div>
          <h3 class="font-medium mb-3">Rectangular Skeleton</h3>
          <Skeleton variant="rectangular" width="200px" height="100px" />
        </div>
      </CardContent>
    </Card>

    <!-- Progress Tests -->
    <Card>
      <CardHeader>
        <CardTitle>Progress Component</CardTitle>
      </CardHeader>
      <CardContent class="space-y-6">
        <div>
          <h3 class="font-medium mb-3">Default Progress</h3>
          <Progress :value="progressValue" :show-label="true" label="Upload Progress" />
        </div>

        <div>
          <h3 class="font-medium mb-3">Success Progress (Complete)</h3>
          <Progress :value="progressSuccess" variant="success" :show-label="true" />
        </div>

        <div>
          <h3 class="font-medium mb-3">Warning Progress</h3>
          <Progress :value="progressWarning" variant="warning" :show-label="true" />
        </div>

        <div>
          <h3 class="font-medium mb-3">Sizes</h3>
          <div class="space-y-3">
            <Progress :value="60" size="sm" label="Small" />
            <Progress :value="60" size="md" label="Medium" />
            <Progress :value="60" size="lg" label="Large" />
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Tabs Tests -->
    <Card>
      <CardHeader>
        <CardTitle>Tabs Component</CardTitle>
      </CardHeader>
      <CardContent class="space-y-6">
        <div>
          <h3 class="font-medium mb-3">Horizontal Tabs</h3>
          <Tabs v-model="activeTab">
            <TabsList>
              <TabsTrigger value="tab1">Account</TabsTrigger>
              <TabsTrigger value="tab2">Password</TabsTrigger>
              <TabsTrigger value="tab3">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1">
              <p class="text-sm text-muted-foreground">
                Make changes to your account here. Click save when you're done.
              </p>
            </TabsContent>
            <TabsContent value="tab2">
              <p class="text-sm text-muted-foreground">
                Change your password here. After saving, you'll be logged out.
              </p>
            </TabsContent>
            <TabsContent value="tab3">
              <p class="text-sm text-muted-foreground">
                Configure your account settings and preferences.
              </p>
            </TabsContent>
          </Tabs>
          <p class="text-sm text-muted-foreground mt-2">
            Active tab: {{ activeTab }}
          </p>
        </div>
      </CardContent>
    </Card>

    <!-- FormField Tests -->
    <Card>
      <CardHeader>
        <CardTitle>FormField Component</CardTitle>
      </CardHeader>
      <CardContent class="space-y-6">
        <div>
          <h3 class="font-medium mb-3">With Label and Helper Text</h3>
          <FormField
            label="Email"
            helper-text="We'll never share your email with anyone else."
            :required="true"
          >
            <template #default="{ id }">
              <Input
                :id="id"
                v-model="formEmail"
                type="email"
                placeholder="Enter your email"
                @blur="validateEmail"
              />
            </template>
          </FormField>
        </div>

        <div>
          <h3 class="font-medium mb-3">With Error Message</h3>
          <FormField
            label="Email"
            :error="formError || undefined"
            :required="true"
          >
            <template #default="{ id }">
              <Input
                :id="id"
                v-model="formEmail"
                type="email"
                placeholder="Enter your email"
                @blur="validateEmail"
              />
            </template>
          </FormField>
        </div>
      </CardContent>
    </Card>

    <!-- Dark Mode Test Reminder -->
    <Card>
      <CardHeader>
        <CardTitle>Dark Mode Testing</CardTitle>
      </CardHeader>
      <CardContent>
        <p class="text-muted-foreground">
          Toggle dark mode using the DarkModeToggle component in the navbar to test all components in both themes.
        </p>
      </CardContent>
    </Card>
  </div>
</template>
