export interface SaleStage {
  id: string
  name: string
  color: string
  order: number
}

export interface Sale {
  id: string
  contactName: string
  title: string
  value: number
  stageId: string
  origin: string
  probability: number
  closingDate: string
  createdAt: string
}

export const mockStages: SaleStage[] = [
  { id: 'lead', name: 'Lead', color: '#94A3B8', order: 1 },
  { id: 'qualification', name: 'Qualificação', color: '#3B82F6', order: 2 },
  { id: 'proposal', name: 'Proposta', color: '#F59E0B', order: 3 },
  { id: 'negotiation', name: 'Negociação', color: '#8B5CF6', order: 4 },
  { id: 'closed_won', name: 'Fechado (Ganho)', color: '#10B981', order: 5 },
  { id: 'closed_lost', name: 'Fechado (Perdido)', color: '#EF4444', order: 6 },
]

export const mockSales: Sale[] = [
  {
    id: '1',
    contactName: 'Maria Silva',
    title: 'Plano Pro Anual',
    value: 2500,
    stageId: 'qualification',
    origin: 'Meta Ads',
    probability: 60,
    closingDate: '2026-04-15',
    createdAt: '2026-03-01'
  },
  {
    id: '2',
    contactName: 'João Santos',
    title: 'Gestão de Campanhas',
    value: 4800,
    stageId: 'proposal',
    origin: 'Google Ads',
    probability: 75,
    closingDate: '2026-04-10',
    createdAt: '2026-03-05'
  },
  {
    id: '3',
    contactName: 'Carlos Pereira',
    title: 'Pacote Enterprise',
    value: 7500,
    stageId: 'negotiation',
    origin: 'Orgânico',
    probability: 85,
    closingDate: '2026-04-05',
    createdAt: '2026-02-15'
  },
  {
    id: '4',
    contactName: 'Fernanda Costa',
    title: 'Plano Starter',
    value: 3200,
    stageId: 'closed_won',
    origin: 'Meta Ads',
    probability: 100,
    closingDate: '2026-03-20',
    createdAt: '2026-02-20'
  },
  {
    id: '5',
    contactName: 'Roberto Lima',
    title: 'Gestão Meta + Google',
    value: 2100,
    stageId: 'qualification',
    origin: 'Google Ads',
    probability: 50,
    closingDate: '2026-04-20',
    createdAt: '2026-03-12'
  },
  {
    id: '6',
    contactName: 'Pedro Alves',
    title: 'Plano Pro Mensal x12',
    value: 5600,
    stageId: 'proposal',
    origin: 'WhatsApp',
    probability: 70,
    closingDate: '2026-04-08',
    createdAt: '2026-02-28'
  },
  {
    id: '7',
    contactName: 'Lucas Ferreira',
    title: 'Pacote Full',
    value: 6300,
    stageId: 'negotiation',
    origin: 'Google Ads',
    probability: 80,
    closingDate: '2026-04-03',
    createdAt: '2026-03-08'
  },
  {
    id: '8',
    contactName: 'Camila Rodrigues',
    title: 'Plano Básico',
    value: 1800,
    stageId: 'closed_lost',
    origin: 'Orgânico',
    probability: 0,
    closingDate: '2026-03-01',
    createdAt: '2026-02-10'
  },
  {
    id: '9',
    contactName: 'Marcos Nascimento',
    title: 'Consultoria + Ferramentas',
    value: 9200,
    stageId: 'lead',
    origin: 'Meta Ads',
    probability: 20,
    closingDate: '2026-05-01',
    createdAt: '2026-03-18'
  },
  {
    id: '10',
    contactName: 'Beatriz Carvalho',
    title: 'Plano Pro Anual',
    value: 2500,
    stageId: 'lead',
    origin: 'Google Ads',
    probability: 25,
    closingDate: '2026-04-30',
    createdAt: '2026-03-17'
  },
  {
    id: '11',
    contactName: 'Rafael Sousa',
    title: 'Pacote Avançado',
    value: 4200,
    stageId: 'closed_won',
    origin: 'WhatsApp',
    probability: 100,
    closingDate: '2026-03-15',
    createdAt: '2026-03-01'
  },
  {
    id: '12',
    contactName: 'Tatiane Gomes',
    title: 'Gestão de Leads',
    value: 3800,
    stageId: 'proposal',
    origin: 'Meta Ads',
    probability: 65,
    closingDate: '2026-04-12',
    createdAt: '2026-03-10'
  },
]
