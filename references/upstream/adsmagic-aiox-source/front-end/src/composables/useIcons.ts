/**
 * Centralized icon catalog from Lucide Vue Next.
 * 
 * This composable provides a single source of truth for all project icons,
 * enabling:
 * - Easy library swapping (change one file if we move away from Lucide)
 * - Better tree-shaking (only imported icons bundled)
 * - TypeScript autocomplete for available icons
 * - Consistent icon usage across the project
 * 
 * @example
 * ```vue
 * <script setup>
 * import { RefreshCw, Plus, Download } from '@/composables/useIcons'
 * </script>
 * 
 * <template>
 *   <button><RefreshCw :size="16" /> Refresh</button>
 * </template>
 * ```
 * 
 * @see https://lucide.dev/icons/ - Icon catalog
 * @see specs/005-design-system-consolidation/contracts/useIcons.api.md - API contract
 */

/* eslint-disable no-restricted-imports */

// Navigation Icons (12)
export {
  Home,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Link2,
  Menu,
  Layers,
  Grid,
  ChevronRight as ChevronRightIcon,
} from 'lucide-vue-next'

// Action Icons (23)
export {
  Plus,
  X,
  Check,
  CheckSquare,
  Minus,
  Edit,
  Edit2,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  RefreshCcw,
  Copy,
  Save,
  Send,
  Share,
  Filter,
  Search,
  Settings,
  LayoutGrid,
  List,
  Loader2,
  GripVertical,
  MoreVertical,
} from 'lucide-vue-next'

// State Icons (11)
export {
  Info,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  CheckCircle,
  XCircle,
  HelpCircle,
  Eye,
  EyeOff,
  Circle,
  Dot,
} from 'lucide-vue-next'

// User Icons (2)
export {
  UserPlus,
  UserCog,
} from 'lucide-vue-next'

// Business Icons (26)
export {
  Users,
  User,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Briefcase,
  Building2,
  Calendar,
  CalendarIcon,
  Clock,
  Bell,
  Mail,
  Phone,
  Tag,
  Flag,
  MousePointerClick,
  MousePointer,
  LayoutDashboard,
  FileText,
  TestTube,
  Target,
  Activity,
  BarChart,
  BarChart2,
  BarChart3,
  Package,
} from 'lucide-vue-next'

// Platform Icons (3)
export {
  Facebook,
  Chrome,
  Music,
} from 'lucide-vue-next'

// Social/Integration Icons (8)
export {
  Linkedin,
  Globe,
  Smartphone,
  MessageSquare,
  Link as LinkIcon,
  Link,
  WifiOff,
  QrCode,
  Webhook,
} from 'lucide-vue-next'

// Miscellaneous Icons (21)
export {
  Sparkles,
  Rocket,
  Rocket as RocketIcon,
  GraduationCap,
  Crown,
  Shield,
  Lock,
  Unlock,
  KeyRound,
  Folder,
  Image,
  Video,
  Moon,
  Sun,
  Star,
  Heart,
  Zap,
  ShoppingBag,
  Cloud,
  UtensilsCrossed,
  Store,
  CreditCard,
  CheckCheck,
  Mic,
  MapPin,
  Play,
  File,
} from 'lucide-vue-next'

/* eslint-enable no-restricted-imports */

/**
 * Total icons exported: 120+
 * 
 * Categories:
 * - Navigation: 13 icons
 * - Action: 22 icons
 * - State: 11 icons
 * - Business: 26 icons
 * - Social/Integration: 5 icons
 * - Miscellaneous: 15 icons
 * 
 * To add new icons:
 * 1. Check if icon exists: https://lucide.dev/icons/
 * 2. Add export above (maintain category organization)
 * 3. Add test in tests/unit/useIcons.spec.ts
 * 4. Commit and use
 */
