export interface Contact {
  id: string
  name: string
  email: string
  phone: string
  origin: string
  stage: string
  status: 'new' | 'in_progress' | 'converted' | 'lost'
  value: number
  createdAt: string
  tags: string[]
}

export const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'Maria Silva',
    email: 'maria.silva@email.com',
    phone: '(11) 98765-4321',
    origin: 'Meta Ads',
    stage: 'Qualificação',
    status: 'in_progress',
    value: 2500,
    createdAt: '2026-03-01',
    tags: ['quente', 'interesse-alto']
  },
  {
    id: '2',
    name: 'João Santos',
    email: 'joao.santos@gmail.com',
    phone: '(21) 99876-5432',
    origin: 'Google Ads',
    stage: 'Proposta',
    status: 'in_progress',
    value: 4800,
    createdAt: '2026-03-05',
    tags: ['quente']
  },
  {
    id: '3',
    name: 'Ana Oliveira',
    email: 'ana.oliveira@empresa.com',
    phone: '(31) 98654-3210',
    origin: 'WhatsApp',
    stage: 'Lead',
    status: 'new',
    value: 1200,
    createdAt: '2026-03-10',
    tags: ['frio']
  },
  {
    id: '4',
    name: 'Carlos Pereira',
    email: 'carlos.pereira@outlook.com',
    phone: '(41) 97543-2109',
    origin: 'Orgânico',
    stage: 'Negociação',
    status: 'in_progress',
    value: 7500,
    createdAt: '2026-02-15',
    tags: ['quente', 'decisor']
  },
  {
    id: '5',
    name: 'Fernanda Costa',
    email: 'fernanda.costa@email.com',
    phone: '(11) 96432-1098',
    origin: 'Meta Ads',
    stage: 'Fechado (Ganho)',
    status: 'converted',
    value: 3200,
    createdAt: '2026-02-20',
    tags: ['convertido']
  },
  {
    id: '6',
    name: 'Roberto Lima',
    email: 'roberto.lima@gmail.com',
    phone: '(51) 95321-0987',
    origin: 'Google Ads',
    stage: 'Qualificação',
    status: 'in_progress',
    value: 2100,
    createdAt: '2026-03-12',
    tags: ['morno']
  },
  {
    id: '7',
    name: 'Juliana Martins',
    email: 'juliana.martins@empresa.com',
    phone: '(61) 94210-9876',
    origin: 'Meta Ads',
    stage: 'Lead',
    status: 'new',
    value: 900,
    createdAt: '2026-03-15',
    tags: ['frio']
  },
  {
    id: '8',
    name: 'Pedro Alves',
    email: 'pedro.alves@hotmail.com',
    phone: '(71) 93109-8765',
    origin: 'WhatsApp',
    stage: 'Proposta',
    status: 'in_progress',
    value: 5600,
    createdAt: '2026-02-28',
    tags: ['quente', 'urgente']
  },
  {
    id: '9',
    name: 'Camila Rodrigues',
    email: 'camila.rodrigues@email.com',
    phone: '(81) 92098-7654',
    origin: 'Orgânico',
    stage: 'Fechado (Perdido)',
    status: 'lost',
    value: 1800,
    createdAt: '2026-02-10',
    tags: ['perdido', 'sem-orçamento']
  },
  {
    id: '10',
    name: 'Lucas Ferreira',
    email: 'lucas.ferreira@gmail.com',
    phone: '(91) 91987-6543',
    origin: 'Google Ads',
    stage: 'Negociação',
    status: 'in_progress',
    value: 6300,
    createdAt: '2026-03-08',
    tags: ['quente', 'decisor']
  },
]
