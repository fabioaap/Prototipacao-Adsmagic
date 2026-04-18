/**
 * Mock data for contacts
 *
 * Contains 50+ realistic contacts with varied:
 * - Names (businesses and individuals)
 * - Phone numbers (Brazil format)
 * - Origins (system and custom)
 * - Stages (throughout the funnel)
 * - Metadata (device, browser, OS, IP)
 *
 * @module mocks/contacts
 */

import type { Contact } from '@/types'

/**
 * Mock contacts data (50+ records)
 */
export const MOCK_CONTACTS: Contact[] = [
  // Google Ads contacts
  {
    id: 'contact-001',
    name: 'Dr. Leticia Lopes - Odontologia',
    phone: '16988098344',
    countryCode: '55',
    origin: 'origin-google-ads',
    stage: 'stage-sale',
    projectId: '2',
    createdAt: '2024-10-01T10:30:00.000Z',
    updatedAt: '2024-10-15T14:20:00.000Z',
    metadata: {
      device: 'mobile',
      browser: 'Chrome',
      os: 'Android',
      ipAddress: '177.45.123.89'
    }
  },
  {
    id: 'contact-002',
    name: 'João Silva',
    phone: '11987654321',
    countryCode: '55',
    origin: 'origin-google-ads',
    stage: 'stage-negotiation',
    projectId: '2',
    createdAt: '2024-10-15T08:15:00.000Z',
    updatedAt: '2024-10-18T16:45:00.000Z',
    metadata: {
      device: 'desktop',
      browser: 'Chrome',
      os: 'Windows',
      ipAddress: '189.12.45.67'
    }
  },
  {
    id: 'contact-003',
    name: 'Maria Oliveira',
    phone: '21976543210',
    countryCode: '55',
    origin: 'origin-google-ads',
    stage: 'stage-proposal-sent',
    projectId: '2',
    createdAt: '2024-10-16T14:20:00.000Z',
    updatedAt: '2024-10-17T09:30:00.000Z',
    metadata: {
      device: 'mobile',
      browser: 'Safari',
      os: 'iOS',
      ipAddress: '201.33.78.90'
    }
  },
  {
    id: 'contact-004',
    name: 'Carlos Eduardo Santos',
    phone: '11965432109',
    countryCode: '55',
    origin: 'origin-google-ads',
    stage: 'stage-qualification',
    projectId: '2',
    createdAt: '2024-10-17T11:45:00.000Z',
    updatedAt: '2024-10-17T11:45:00.000Z',
    metadata: {
      device: 'desktop',
      browser: 'Firefox',
      os: 'Windows',
      ipAddress: '177.89.12.34'
    }
  },
  {
    id: 'contact-005',
    name: 'Ana Paula Costa',
    phone: '85998877665',
    countryCode: '55',
    origin: 'origin-google-ads',
    stage: 'stage-contact-initiated',
    projectId: '2',
    createdAt: '2024-10-18T09:00:00.000Z',
    updatedAt: '2024-10-18T09:00:00.000Z',
    metadata: {
      device: 'mobile',
      browser: 'Chrome',
      os: 'Android',
      ipAddress: '200.45.67.123'
    }
  },

  // Meta Ads contacts
  {
    id: 'contact-006',
    name: 'Clínica Bella Vita',
    phone: '11945678901',
    countryCode: '55',
    origin: 'origin-meta-ads',
    stage: 'stage-sale',
    projectId: '2',
    createdAt: '2024-09-28T13:20:00.000Z',
    updatedAt: '2024-10-12T15:30:00.000Z',
    metadata: {
      device: 'mobile',
      browser: 'Chrome',
      os: 'Android',
      ipAddress: '189.67.89.123'
    }
  },
  {
    id: 'contact-007',
    name: 'Pedro Henrique Alves',
    phone: '21987654321',
    countryCode: '55',
    origin: 'origin-meta-ads',
    stage: 'stage-negotiation',
    projectId: '2',
    createdAt: '2024-10-10T16:45:00.000Z',
    updatedAt: '2024-10-16T10:20:00.000Z',
    metadata: {
      device: 'mobile',
      browser: 'Safari',
      os: 'iOS',
      ipAddress: '201.78.90.45'
    }
  },
  {
    id: 'contact-008',
    name: 'Juliana Ferreira',
    phone: '11934567890',
    countryCode: '55',
    origin: 'origin-meta-ads',
    stage: 'stage-proposal-sent',
    projectId: '2',
    createdAt: '2024-10-14T10:15:00.000Z',
    updatedAt: '2024-10-15T14:30:00.000Z',
    metadata: {
      device: 'mobile',
      browser: 'Chrome',
      os: 'Android',
      ipAddress: '177.23.45.67'
    }
  },
  {
    id: 'contact-009',
    name: 'Rafael Souza',
    phone: '48991234567',
    countryCode: '55',
    origin: 'origin-meta-ads',
    stage: 'stage-qualification',
    projectId: '2',
    createdAt: '2024-10-16T08:30:00.000Z',
    updatedAt: '2024-10-16T08:30:00.000Z',
    metadata: {
      device: 'desktop',
      browser: 'Chrome',
      os: 'Windows',
      ipAddress: '189.12.34.56'
    }
  },
  {
    id: 'contact-010',
    name: 'Fernanda Lima',
    phone: '11923456789',
    countryCode: '55',
    origin: 'origin-meta-ads',
    stage: 'stage-contact-initiated',
    projectId: '2',
    createdAt: '2024-10-18T11:20:00.000Z',
    updatedAt: '2024-10-18T11:20:00.000Z',
    metadata: {
      device: 'mobile',
      browser: 'Safari',
      os: 'iOS',
      ipAddress: '200.89.123.45'
    }
  },

  // Instagram contacts
  {
    id: 'contact-011',
    name: 'Estética Avançada',
    phone: '11912345678',
    countryCode: '55',
    origin: 'origin-instagram',
    stage: 'stage-sale',
    projectId: '2',
    createdAt: '2024-09-25T09:30:00.000Z',
    updatedAt: '2024-10-08T16:45:00.000Z',
    metadata: {
      device: 'mobile',
      browser: 'Instagram',
      os: 'iOS',
      ipAddress: '201.45.67.89'
    }
  },
  {
    id: 'contact-012',
    name: 'Beatriz Martins',
    phone: '21976543211',
    countryCode: '55',
    origin: 'origin-instagram',
    stage: 'stage-negotiation',
    projectId: '2',
    createdAt: '2024-10-12T14:20:00.000Z',
    updatedAt: '2024-10-17T10:30:00.000Z',
    metadata: {
      device: 'mobile',
      browser: 'Instagram',
      os: 'Android',
      ipAddress: '189.78.90.12'
    }
  },
  {
    id: 'contact-013',
    name: 'Lucas Pereira',
    phone: '11901234567',
    countryCode: '55',
    origin: 'origin-instagram',
    stage: 'stage-proposal-sent',
    projectId: '2',
    createdAt: '2024-10-15T16:00:00.000Z',
    updatedAt: '2024-10-16T11:20:00.000Z',
    metadata: {
      device: 'mobile',
      browser: 'Instagram',
      os: 'iOS',
      ipAddress: '177.34.56.78'
    }
  },
  {
    id: 'contact-014',
    name: 'Gabriela Costa',
    phone: '85912345678',
    countryCode: '55',
    origin: 'origin-instagram',
    stage: 'stage-contact-initiated',
    projectId: '2',
    createdAt: '2024-10-18T13:45:00.000Z',
    updatedAt: '2024-10-18T13:45:00.000Z',
    metadata: {
      device: 'mobile',
      browser: 'Instagram',
      os: 'Android',
      ipAddress: '200.12.34.56'
    }
  },

  // TikTok Ads contacts
  {
    id: 'contact-015',
    name: 'Camila Rodrigues',
    phone: '11990123456',
    countryCode: '55',
    origin: 'origin-tiktok-ads',
    stage: 'stage-sale',
    projectId: '2',
    createdAt: '2024-10-05T10:15:00.000Z',
    updatedAt: '2024-10-14T09:30:00.000Z',
    metadata: {
      device: 'mobile',
      browser: 'Chrome',
      os: 'Android',
      ipAddress: '189.45.67.89'
    }
  },
  {
    id: 'contact-016',
    name: 'Thiago Almeida',
    phone: '21965432198',
    countryCode: '55',
    origin: 'origin-tiktok-ads',
    stage: 'stage-qualification',
    projectId: '2',
    createdAt: '2024-10-17T15:30:00.000Z',
    updatedAt: '2024-10-17T15:30:00.000Z',
    metadata: {
      device: 'mobile',
      browser: 'Safari',
      os: 'iOS',
      ipAddress: '201.23.45.67'
    }
  },

  // WhatsApp contacts
  {
    id: 'contact-017',
    name: 'Marcelo Santos',
    phone: '11978901234',
    countryCode: '55',
    origin: 'origin-whatsapp',
    stage: 'stage-sale',
    projectId: '2',
    createdAt: '2024-09-30T08:45:00.000Z',
    updatedAt: '2024-10-10T14:20:00.000Z',
    metadata: {
      device: 'mobile',
      browser: 'WhatsApp',
      os: 'Android',
      ipAddress: '177.56.78.90'
    }
  },
  {
    id: 'contact-018',
    name: 'Patrícia Oliveira',
    phone: '48987654321',
    countryCode: '55',
    origin: 'origin-whatsapp',
    stage: 'stage-negotiation',
    projectId: '2',
    createdAt: '2024-10-13T11:00:00.000Z',
    updatedAt: '2024-10-16T16:30:00.000Z',
    metadata: {
      device: 'mobile',
      browser: 'WhatsApp',
      os: 'iOS',
      ipAddress: '189.12.34.56'
    }
  },
  {
    id: 'contact-019',
    name: 'Ricardo Mendes',
    phone: '11967890123',
    countryCode: '55',
    origin: 'origin-whatsapp',
    stage: 'stage-contact-initiated',
    projectId: '2',
    createdAt: '2024-10-18T14:15:00.000Z',
    updatedAt: '2024-10-18T14:15:00.000Z',
    metadata: {
      device: 'mobile',
      browser: 'WhatsApp',
      os: 'Android',
      ipAddress: '200.45.67.89'
    }
  },

  // Referral contacts
  {
    id: 'contact-020',
    name: 'Dr. Paulo Andrade',
    phone: '11956789012',
    countryCode: '55',
    origin: 'origin-referral',
    stage: 'stage-sale',
    projectId: '2',
    createdAt: '2024-10-02T09:20:00.000Z',
    updatedAt: '2024-10-11T15:40:00.000Z',
    metadata: {
      device: 'desktop',
      browser: 'Chrome',
      os: 'Windows',
      ipAddress: '177.78.90.12'
    }
  },
  {
    id: 'contact-021',
    name: 'Sandra Lima',
    phone: '21954321098',
    countryCode: '55',
    origin: 'origin-referral',
    stage: 'stage-proposal-sent',
    projectId: '2',
    createdAt: '2024-10-16T10:30:00.000Z',
    updatedAt: '2024-10-17T14:45:00.000Z',
    metadata: {
      device: 'mobile',
      browser: 'Safari',
      os: 'iOS',
      ipAddress: '201.34.56.78'
    }
  },

  // Organic contacts
  {
    id: 'contact-022',
    name: 'Clínica São Lucas',
    phone: '11945678912',
    countryCode: '55',
    origin: 'origin-organic',
    stage: 'stage-sale',
    projectId: '2',
    createdAt: '2024-09-27T13:10:00.000Z',
    updatedAt: '2024-10-09T11:25:00.000Z',
    metadata: {
      device: 'desktop',
      browser: 'Chrome',
      os: 'macOS',
      ipAddress: '189.23.45.67'
    }
  },
  {
    id: 'contact-023',
    name: 'Eduardo Silva',
    phone: '11943210987',
    countryCode: '55',
    origin: 'origin-organic',
    stage: 'stage-qualification',
    projectId: '2',
    createdAt: '2024-10-17T09:45:00.000Z',
    updatedAt: '2024-10-17T09:45:00.000Z',
    metadata: {
      device: 'desktop',
      browser: 'Firefox',
      os: 'Linux',
      ipAddress: '177.90.12.34'
    }
  },

  // Direct contacts
  {
    id: 'contact-024',
    name: 'Amanda Rocha',
    phone: '11932109876',
    countryCode: '55',
    origin: 'origin-direct',
    stage: 'stage-negotiation',
    projectId: '2',
    createdAt: '2024-10-14T15:20:00.000Z',
    updatedAt: '2024-10-17T13:10:00.000Z',
    metadata: {
      device: 'mobile',
      browser: 'Chrome',
      os: 'Android',
      ipAddress: '200.12.34.56'
    }
  },

  // Custom origin: LinkedIn Ads
  {
    id: 'contact-025',
    name: 'Consultoria Premium',
    phone: '11921098765',
    countryCode: '55',
    origin: 'origin-custom-1',
    stage: 'stage-sale',
    projectId: '2',
    createdAt: '2024-10-03T11:30:00.000Z',
    updatedAt: '2024-10-13T10:15:00.000Z',
    metadata: {
      device: 'desktop',
      browser: 'Chrome',
      os: 'Windows',
      ipAddress: '189.56.78.90'
    }
  },

  // Custom origin: Evento Presencial
  {
    id: 'contact-026',
    name: 'Roberto Dias',
    phone: '11910987654',
    countryCode: '55',
    origin: 'origin-custom-2',
    stage: 'stage-proposal-sent',
    projectId: '2',
    createdAt: '2024-10-15T14:00:00.000Z',
    updatedAt: '2024-10-16T09:20:00.000Z',
    metadata: {
      device: 'mobile',
      browser: 'Safari',
      os: 'iOS',
      ipAddress: '177.12.34.56'
    }
  },

  // More Google Ads contacts (varying stages)
  {
    id: 'contact-027',
    name: 'Vanessa Martins',
    phone: '11909876543',
    countryCode: '55',
    origin: 'origin-google-ads',
    stage: 'stage-lost',
    projectId: '2',
    createdAt: '2024-09-20T10:00:00.000Z',
    updatedAt: '2024-09-28T16:30:00.000Z',
    metadata: {
      device: 'desktop',
      browser: 'Chrome',
      os: 'Windows',
      ipAddress: '201.67.89.12'
    }
  },
  {
    id: 'contact-028',
    name: 'Felipe Andrade',
    phone: '21998765432',
    countryCode: '55',
    origin: 'origin-google-ads',
    stage: 'stage-contact-initiated',
    projectId: '2',
    createdAt: '2024-10-18T10:30:00.000Z',
    updatedAt: '2024-10-18T10:30:00.000Z',
    metadata: {
      device: 'mobile',
      browser: 'Chrome',
      os: 'Android',
      ipAddress: '189.34.56.78'
    }
  },
  {
    id: 'contact-029',
    name: 'Larissa Costa',
    phone: '11987654320',
    countryCode: '55',
    origin: 'origin-google-ads',
    stage: 'stage-qualification',
    projectId: '2',
    createdAt: '2024-10-17T13:15:00.000Z',
    updatedAt: '2024-10-17T13:15:00.000Z',
    metadata: {
      device: 'tablet',
      browser: 'Safari',
      os: 'iOS',
      ipAddress: '177.45.67.89'
    }
  },
  {
    id: 'contact-030',
    name: 'Odontologia Moderna',
    phone: '11976543219',
    countryCode: '55',
    origin: 'origin-google-ads',
    stage: 'stage-sale',
    projectId: '2',
    createdAt: '2024-09-29T08:20:00.000Z',
    updatedAt: '2024-10-07T14:35:00.000Z',
    metadata: {
      device: 'desktop',
      browser: 'Edge',
      os: 'Windows',
      ipAddress: '200.23.45.67'
    }
  },

  // More Meta Ads contacts
  {
    id: 'contact-031',
    name: 'Gustavo Fernandes',
    phone: '48976543218',
    countryCode: '55',
    origin: 'origin-meta-ads',
    stage: 'stage-lost',
    projectId: '2',
    createdAt: '2024-10-01T11:45:00.000Z',
    updatedAt: '2024-10-10T09:20:00.000Z',
    metadata: {
      device: 'mobile',
      browser: 'Chrome',
      os: 'Android',
      ipAddress: '189.67.89.23'
    }
  },
  {
    id: 'contact-032',
    name: 'Mariana Silva',
    phone: '11965432187',
    countryCode: '55',
    origin: 'origin-meta-ads',
    stage: 'stage-sale',
    projectId: '2',
    createdAt: '2024-10-04T09:30:00.000Z',
    updatedAt: '2024-10-12T15:45:00.000Z',
    metadata: {
      device: 'mobile',
      browser: 'Safari',
      os: 'iOS',
      ipAddress: '177.89.12.45'
    }
  },
  {
    id: 'contact-033',
    name: 'Bruno Oliveira',
    phone: '21954321876',
    countryCode: '55',
    origin: 'origin-meta-ads',
    stage: 'stage-proposal-sent',
    projectId: '2',
    createdAt: '2024-10-16T14:50:00.000Z',
    updatedAt: '2024-10-17T10:15:00.000Z',
    metadata: {
      device: 'desktop',
      browser: 'Chrome',
      os: 'macOS',
      ipAddress: '201.12.34.67'
    }
  },

  // More Instagram contacts
  {
    id: 'contact-034',
    name: 'Tatiana Souza',
    phone: '85943218765',
    countryCode: '55',
    origin: 'origin-instagram',
    stage: 'stage-sale',
    projectId: '2',
    createdAt: '2024-10-06T12:20:00.000Z',
    updatedAt: '2024-10-14T16:40:00.000Z',
    metadata: {
      device: 'mobile',
      browser: 'Instagram',
      os: 'iOS',
      ipAddress: '200.56.78.90'
    }
  },
  {
    id: 'contact-035',
    name: 'Diego Alves',
    phone: '11932187654',
    countryCode: '55',
    origin: 'origin-instagram',
    stage: 'stage-qualification',
    projectId: '2',
    createdAt: '2024-10-17T15:40:00.000Z',
    updatedAt: '2024-10-17T15:40:00.000Z',
    metadata: {
      device: 'mobile',
      browser: 'Instagram',
      os: 'Android',
      ipAddress: '189.45.67.12'
    }
  },

  // More WhatsApp contacts
  {
    id: 'contact-036',
    name: 'Adriana Lima',
    phone: '11921876543',
    countryCode: '55',
    origin: 'origin-whatsapp',
    stage: 'stage-sale',
    projectId: '2',
    createdAt: '2024-10-08T10:10:00.000Z',
    updatedAt: '2024-10-15T13:25:00.000Z',
    metadata: {
      device: 'mobile',
      browser: 'WhatsApp',
      os: 'Android',
      ipAddress: '177.23.45.78'
    }
  },
  {
    id: 'contact-037',
    name: 'Renato Costa',
    phone: '48910987654',
    countryCode: '55',
    origin: 'origin-whatsapp',
    stage: 'stage-proposal-sent',
    projectId: '2',
    createdAt: '2024-10-16T11:30:00.000Z',
    updatedAt: '2024-10-17T08:45:00.000Z',
    metadata: {
      device: 'mobile',
      browser: 'WhatsApp',
      os: 'iOS',
      ipAddress: '201.78.90.34'
    }
  },

  // More Referral contacts
  {
    id: 'contact-038',
    name: 'Carla Mendes',
    phone: '21909876542',
    countryCode: '55',
    origin: 'origin-referral',
    stage: 'stage-sale',
    projectId: '2',
    createdAt: '2024-10-07T14:25:00.000Z',
    updatedAt: '2024-10-13T11:50:00.000Z',
    metadata: {
      device: 'desktop',
      browser: 'Firefox',
      os: 'Linux',
      ipAddress: '189.12.34.89'
    }
  },
  {
    id: 'contact-039',
    name: 'Vinícius Santos',
    phone: '11898765431',
    countryCode: '55',
    origin: 'origin-referral',
    stage: 'stage-negotiation',
    projectId: '2',
    createdAt: '2024-10-15T09:15:00.000Z',
    updatedAt: '2024-10-17T14:20:00.000Z',
    metadata: {
      device: 'mobile',
      browser: 'Chrome',
      os: 'Android',
      ipAddress: '200.34.56.12'
    }
  },

  // More Organic contacts
  {
    id: 'contact-040',
    name: 'Luciana Ferreira',
    phone: '11887654320',
    countryCode: '55',
    origin: 'origin-organic',
    stage: 'stage-sale',
    projectId: '2',
    createdAt: '2024-10-05T11:40:00.000Z',
    updatedAt: '2024-10-11T16:15:00.000Z',
    metadata: {
      device: 'desktop',
      browser: 'Safari',
      os: 'macOS',
      ipAddress: '177.56.78.23'
    }
  },
  {
    id: 'contact-041',
    name: 'André Rocha',
    phone: '48876543209',
    countryCode: '55',
    origin: 'origin-organic',
    stage: 'stage-contact-initiated',
    projectId: '2',
    createdAt: '2024-10-18T08:20:00.000Z',
    updatedAt: '2024-10-18T08:20:00.000Z',
    metadata: {
      device: 'tablet',
      browser: 'Chrome',
      os: 'Android',
      ipAddress: '189.67.89.45'
    }
  },

  // More Direct contacts
  {
    id: 'contact-042',
    name: 'Simone Almeida',
    phone: '21865432198',
    countryCode: '55',
    origin: 'origin-direct',
    stage: 'stage-qualification',
    projectId: '2',
    createdAt: '2024-10-17T12:35:00.000Z',
    updatedAt: '2024-10-17T12:35:00.000Z',
    metadata: {
      device: 'mobile',
      browser: 'Safari',
      os: 'iOS',
      ipAddress: '201.89.12.56'
    }
  },

  // More TikTok contacts
  {
    id: 'contact-043',
    name: 'Isabela Santos',
    phone: '11854321987',
    countryCode: '55',
    origin: 'origin-tiktok-ads',
    stage: 'stage-sale',
    projectId: '2',
    createdAt: '2024-10-09T13:50:00.000Z',
    updatedAt: '2024-10-16T09:30:00.000Z',
    metadata: {
      device: 'mobile',
      browser: 'Chrome',
      os: 'Android',
      ipAddress: '200.45.67.78'
    }
  },
  {
    id: 'contact-044',
    name: 'Leonardo Dias',
    phone: '11843219876',
    countryCode: '55',
    origin: 'origin-tiktok-ads',
    stage: 'stage-negotiation',
    projectId: '2',
    createdAt: '2024-10-14T16:10:00.000Z',
    updatedAt: '2024-10-16T13:40:00.000Z',
    metadata: {
      device: 'mobile',
      browser: 'Safari',
      os: 'iOS',
      ipAddress: '177.12.34.90'
    }
  },

  // Outros (Other) contacts
  {
    id: 'contact-045',
    name: 'Patricia Gomes',
    phone: '48832198765',
    countryCode: '55',
    origin: 'origin-outros',
    stage: 'stage-contact-initiated',
    projectId: '2',
    createdAt: '2024-10-18T15:25:00.000Z',
    updatedAt: '2024-10-18T15:25:00.000Z',
    metadata: {
      device: 'desktop',
      browser: 'Edge',
      os: 'Windows',
      ipAddress: '189.23.45.89'
    }
  },

  // More custom origin contacts
  {
    id: 'contact-046',
    name: 'Empresa XYZ Ltda',
    phone: '11821987654',
    countryCode: '55',
    origin: 'origin-custom-1',
    stage: 'stage-negotiation',
    projectId: '2',
    createdAt: '2024-10-13T10:45:00.000Z',
    updatedAt: '2024-10-17T11:20:00.000Z',
    metadata: {
      device: 'desktop',
      browser: 'Chrome',
      os: 'Windows',
      ipAddress: '201.56.78.12'
    }
  },
  {
    id: 'contact-047',
    name: 'Marcos Teixeira',
    phone: '21810987643',
    countryCode: '55',
    origin: 'origin-custom-2',
    stage: 'stage-sale',
    projectId: '2',
    createdAt: '2024-10-10T09:30:00.000Z',
    updatedAt: '2024-10-16T14:45:00.000Z',
    metadata: {
      device: 'mobile',
      browser: 'Safari',
      os: 'iOS',
      ipAddress: '200.67.89.34'
    }
  },

  // Additional varied contacts to reach 50+
  {
    id: 'contact-048',
    name: 'Daniela Ribeiro',
    phone: '85809876532',
    countryCode: '55',
    origin: 'origin-google-ads',
    stage: 'stage-lost',
    projectId: '2',
    createdAt: '2024-09-22T11:20:00.000Z',
    updatedAt: '2024-09-30T15:35:00.000Z',
    metadata: {
      device: 'mobile',
      browser: 'Chrome',
      os: 'Android',
      ipAddress: '177.78.90.56'
    }
  },
  {
    id: 'contact-049',
    name: 'Fábio Nascimento',
    phone: '11798765421',
    countryCode: '55',
    origin: 'origin-meta-ads',
    stage: 'stage-contact-initiated',
    projectId: '2',
    createdAt: '2024-10-18T13:10:00.000Z',
    updatedAt: '2024-10-18T13:10:00.000Z',
    metadata: {
      device: 'tablet',
      browser: 'Safari',
      os: 'iOS',
      ipAddress: '189.45.67.90'
    }
  },
  {
    id: 'contact-050',
    name: 'Clínica Saúde Total',
    phone: '48787654310',
    countryCode: '55',
    origin: 'origin-custom-3',
    stage: 'stage-sale',
    projectId: '2',
    createdAt: '2024-10-11T14:30:00.000Z',
    updatedAt: '2024-10-17T10:50:00.000Z',
    metadata: {
      device: 'desktop',
      browser: 'Chrome',
      os: 'macOS',
      ipAddress: '201.23.45.78'
    }
  },
  {
    id: 'contact-051',
    name: 'Priscila Monteiro',
    phone: '11776543209',
    countryCode: '55',
    origin: 'origin-instagram',
    stage: 'stage-proposal-sent',
    projectId: '2',
    createdAt: '2024-10-15T11:50:00.000Z',
    updatedAt: '2024-10-16T15:20:00.000Z',
    metadata: {
      device: 'mobile',
      browser: 'Instagram',
      os: 'Android',
      ipAddress: '200.89.12.67'
    }
  },
  {
    id: 'contact-052',
    name: 'Rodrigo Barbosa',
    phone: '21765432098',
    countryCode: '55',
    origin: 'origin-whatsapp',
    stage: 'stage-qualification',
    projectId: '2',
    createdAt: '2024-10-17T10:25:00.000Z',
    updatedAt: '2024-10-17T10:25:00.000Z',
    metadata: {
      device: 'mobile',
      browser: 'WhatsApp',
      os: 'iOS',
      ipAddress: '177.34.56.12'
    }
  }
]

/**
 * Helper to get contact by ID
 */
export function getContactById(id: string): Contact | undefined {
  return MOCK_CONTACTS.find((contact) => contact.id === id)
}

/**
 * Helper to get contacts by origin
 */
export function getContactsByOrigin(originId: string): Contact[] {
  return MOCK_CONTACTS.filter((contact) => contact.origin === originId)
}

/**
 * Helper to get contacts by stage
 */
export function getContactsByStage(stageId: string): Contact[] {
  return MOCK_CONTACTS.filter((contact) => contact.stage === stageId)
}

/**
 * Helper to search contacts by name or phone
 */
export function searchContacts(query: string): Contact[] {
  const lowerQuery = query.toLowerCase()
  return MOCK_CONTACTS.filter(
    (contact) =>
      contact.name.toLowerCase().includes(lowerQuery) || contact.phone.includes(query)
  )
}
