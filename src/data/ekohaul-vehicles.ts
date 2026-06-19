import type { EkoVehicle, EkoFleetPlan } from '@/types/ekohaul'

// ─── Vehicle specs (exact coefficients from ekohaul_esg/index.html) ──────
// DIESEL_EF = 2.68 kg CO2/litre
// GRID_EF   = 0.71 kg CO2/kWh
// SOLAR_EF  = 0.04 kg CO2/kWh

export const ekoVehicles: Record<string, EkoVehicle> = {
  '3w': {
    id: '3w',
    type: '3w',
    make: 'Euler',
    model: 'HiLoad EV',
    payload: '688 kg',
    rangeKm: 120,
    chargeTimeHrs: 3.5,
    dieselEquivKmpl: 31,    // from DS spec sheet
    energyKwhPerKm: 0.09,
    isAvailable: true,
  },
  mini: {
    id: 'mini',
    type: 'mini',
    make: 'Tata',
    model: 'Ace EV',
    payload: '550 kg',
    rangeKm: 154,
    chargeTimeHrs: 3.8,
    dieselEquivKmpl: 17,
    energyKwhPerKm: 0.20,
    isAvailable: true,
  },
  scv: {
    id: 'scv',
    type: 'scv',
    make: 'Switch',
    model: 'IeV3',
    payload: '1,000 kg',
    rangeKm: 100,
    chargeTimeHrs: 5.0,
    dieselEquivKmpl: 12,
    energyKwhPerKm: 0.33,
    isAvailable: true,
  },
  icv: {
    id: 'icv',
    type: 'icv',
    make: 'Tata',
    model: 'Ultra E.7',
    payload: '7,000 kg',
    rangeKm: 70,
    chargeTimeHrs: 6.5,
    dieselEquivKmpl: 8.5,
    energyKwhPerKm: 0.47,
    isAvailable: true,
  },
}

export const ekoVehicleLabels: Record<string, string> = {
  '3w':  'Three-Wheeler (Euler HiLoad)',
  mini:  'Mini Truck (Tata Ace EV)',
  scv:   'Small Commercial Vehicle (Switch IeV3)',
  icv:   'Intermediate CV (Tata Ultra E.7)',
}

// ─── Fleet plans ─────────────────────────────────────────────────────────

export const ekoFleetPlans: EkoFleetPlan[] = [
  {
    tier: 'flex-ev',
    name: 'FlexEV',
    tagline: 'On-demand EV fleet with zero lock-in.',
    description:
      'Book EV vehicles by the trip or day. No minimum commitment. Ideal for businesses testing EV logistics or handling seasonal demand peaks.',
    minVehicles: 1,
    maxVehicles: 10,
    commitmentMonths: 0,
    pricingModel: 'per-km',
    features: [
      'No minimum commitment',
      'Same-day vehicle availability',
      'Per-km billing transparency',
      'Digital POD and tracking',
      'Basic ESG reporting',
    ],
    idealFor: ['SMEs', 'D2C brands', 'Seasonal shippers'],
    sla: 'Best effort, 95% uptime',
  },
  {
    tier: 'dedi-ev',
    name: 'DediEV',
    tagline: 'Dedicated EV fleet with a monthly SLA.',
    description:
      'Guaranteed vehicle availability with fixed monthly billing. Perfect for businesses with predictable daily route volumes who want the economics of a dedicated fleet without capital expenditure.',
    minVehicles: 3,
    maxVehicles: 25,
    commitmentMonths: 12,
    pricingModel: 'monthly-fixed',
    features: [
      'Dedicated vehicles with named driver',
      '99% uptime SLA guaranteed',
      'Monthly carbon report (BRSR-ready)',
      'Priority maintenance 24-hour TAT',
      'API integration available',
    ],
    idealFor: ['E-commerce fulfilment', 'FMCG distribution', 'Retail last-mile'],
    sla: '99% vehicle uptime, 24-hour maintenance TAT',
  },
  {
    tier: 'fleet-ev',
    name: 'FleetEV',
    tagline: 'Enterprise EV fleet-as-a-service.',
    description:
      'Full fleet digitalisation: dedicated vehicles, drivers, ops manager, charging infrastructure advisory, white-labelled tracking app, and comprehensive ESG dashboarding for enterprise sustainability reporting.',
    minVehicles: 25,
    commitmentMonths: 36,
    pricingModel: 'custom',
    features: [
      'Custom fleet sizing (25–200+ vehicles)',
      'Embedded EkoHaul operations manager',
      'Charging infrastructure advisory',
      'White-labelled customer tracking app',
      'Quarterly BRSR ESG report',
      'Custom API + ERP integration',
    ],
    idealFor: ['Large manufacturers', 'Retail chains', 'FMCG majors'],
    sla: '99.5% uptime, 12-hour maintenance SLA',
  },
]

export const getFleetPlan = (tier: string): EkoFleetPlan | undefined =>
  ekoFleetPlans.find((p) => p.tier === tier)
