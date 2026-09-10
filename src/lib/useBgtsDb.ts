'use client'
import { useState, useCallback, useEffect } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BgtsCompany {
  name: string; addr: string; gstin: string; phone: string; email: string; lrPrefix: string;
  pan?: string;
}
export interface BgtsBranch {
  id: string; name: string; entityName: string; gstin: string; addr: string; lrPrefix?: string; phone: string;
  pan?: string; email?: string;
}
export interface BgtsClient {
  id: string; name: string; gstin: string; phone: string; email: string; creditDays: number; addr: string;
}
export interface BgtsVehicle {
  id: string; regNo: string; make: string; type: string; owned: boolean; gvw: string; driverId: string;
}
export interface BgtsDriver {
  id: string; name: string; phone: string; licNo: string; licExpiry: string;
}
export interface BgtsVendor {
  id: string; name: string; phone: string; city: string; rating: string;
  pan?: string; gst?: string; bank?: string; contact?: string;
}
export interface BgtsRoute {
  id: string; origin: string; destination: string; km: string;
}
export interface BgtsInquiry {
  id: string; inqNo: string; status: string; date: string; branchId: string;
  clientId: string; partyName: string; contact: string; fromPlace: string; toPlace: string;
  vehicleType: string; cargo: string; weightMT: string; expectedDate: string;
  rateQuoted: string; ownershipPref: string; notes: string;
  assignType: string; assignedVehicleId: string; assignedVendorId: string;
  assignedTruckNo: string; lrId: string; bookingId: string;
}
export interface BgtsBooking {
  id: string; bkNo: string; date: string; branchId: string; clientId: string;
  origin: string; destination: string; mode: string; vehicleType: string;
  cargo: string; weightMT: string; freight: number; rateSource: string;
  assignType: string; vehicleId: string; hiredVendorId: string; hiredVehicleNo: string;
  hireCost: number; driverId: string; status: string; lrNo: string;
  ewayBill: string; podReceived: boolean; invoiceId: string;
}
export interface BgtsParty {
  name: string; city: string; contact: string; pan: string; gst: string;
}
export interface BgtsGood {
  desc: string; pkgType: string; pcs: string; aw: string; cw: string; l: string; w: string; h: string;
}
export interface BgtsLRExpense {
  account: string; amount: number; remarks: string;
}
export interface BgtsTripExpense {
  id: string; date: string; category: string; amount: number; notes: string;
}
export interface BgtsHire {
  vendorId: string; amount: number; advance: number;
  payments: { id: string; date: string; amount: number; ref: string }[];
}
export interface BgtsLRCharges {
  abovePct: string; aboveCh: number; belowPct: string; belowCh: number; rate: string; rateCh: number;
  freight: number; surcharge: number; localCartage: number; lastMile: number; fov: number;
  loading: number; unloading: number; handling: number; gc: number; other: number; ewayCh: number; aoc: number;
}
export interface BgtsLR {
  id: string; bookingId: string; lrType: string; truckNo: string; lrNo: string; date: string;
  bookingBranch: string; branchId: string; fromPlace: string; toPlace: string; toBranch: string;
  invoiceNo: string; invAmount: string; invoiceDate: string; ewayBillNo: string;
  ewayBillDate: string; ewayExDate: string; poDate: string;
  packing: string; lorryType: string; privateMark: string; lrMode: string; deliveryAddress: string;
  billingParty: string; gstPaidBy: string; gstSlab: string; insurance: string;
  payTerms: string; agent: string; billedAt: string;
  consignor: BgtsParty; consignee: BgtsParty; billingTo: BgtsParty;
  goods: BgtsGood[]; aWeight: string; cWeight: string; expenses: BgtsLRExpense[];
  remark: string; employee: string; driverNo: string; charges: BgtsLRCharges;
  igstPct: number; cgstPct: number; sgstPct: number;
  subTotal: number; igstAmt: number; cgstAmt: number; sgstAmt: number; gross: number;
  pod: boolean; ownership: string; hire: BgtsHire; vehicleId: string; tripExpenses: BgtsTripExpense[];
}
export interface BgtsExpense {
  id: string; vehicleId: string; date: string; category: string; amount: number; litres: string; notes: string;
}
export interface BgtsRenewal {
  id: string; vehicleRegNo: string; docType: string; issueDate: string; expiryDate: string;
  amount: number; insurer: string; notes: string; reminder: number;
  // legacy compat
  vehicleId?: string; ref?: string; expiry?: string;
}
export interface BgtsContract {
  id: string; party: string; validFrom: string; validTo: string; status: string; notes: string;
  rates: { from: string; to: string; vehicleType: string; rate: number; unit: string }[];
  // legacy compat
  type?: string; clientId?: string; ref?: string; emd?: string; bgExpiry?: string;
}
export interface BgtsInvoice {
  id: string; invNo: string; date: string; branchId: string;
  // BGTS-OS fields
  party: string; lrNos: string; amount: number; gst: number; total: number;
  dueDate: string; notes: string; cancelled: boolean;
  // legacy compat
  clientId?: string; gstPct?: number; bookingIds?: string[];
}
export interface BgtsPayment {
  id: string; invoiceId: string; date: string; amount: number; ref: string;
  // BGTS-OS fields
  party: string; method: string; branchId: string; notes: string;
  // legacy compat
  mrNo?: string; mode?: string; bankTxnId?: string;
}
export interface BgtsAcctExp {
  id: string; lrId?: string; branchId: string; date: string; account: string; amount: number;
  paidThrough: string; vendor: string; ref: string; notes: string; src: string;
}
export interface BgtsBankTxn {
  id: string; date: string; description: string; amount: number; ref: string;
  // BGTS-OS fields
  account: string; type: 'credit' | 'debit'; balance: number;
  // legacy compat
  status?: string; matchedPaymentId?: string;
}
export interface BgtsLHC {
  id: string; [key: string]: unknown;
}
export interface BgtsAdvance {
  id: string; [key: string]: unknown;
}
export interface BgtsDB {
  company: BgtsCompany;
  seq: { lr: number; inv: number; bk: number; inq: number; mr: number };
  branches: BgtsBranch[];
  clients: BgtsClient[];
  vehicles: BgtsVehicle[];
  drivers: BgtsDriver[];
  vendors: BgtsVendor[];
  routes: BgtsRoute[];
  inquiries: BgtsInquiry[];
  bookings: BgtsBooking[];
  lrs: BgtsLR[];
  expenses: BgtsExpense[];
  renewals: BgtsRenewal[];
  contracts: BgtsContract[];
  invoices: BgtsInvoice[];
  payments: BgtsPayment[];
  acctExp: BgtsAcctExp[];
  bankTxns: BgtsBankTxn[];
  lhcs: BgtsLHC[];
  advances: BgtsAdvance[];
  billingBackup?: unknown[];
  regSeeded?: boolean;
  pdfRecon?: string;
  billingReconDone?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function uid(p = 'x'): string {
  return p + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36)
}
export function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}
export function fmtDate(iso: string): string {
  if (!iso) return '—'
  const p = iso.split('-')
  return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : iso
}
export function daysTo(iso: string): number | null {
  if (!iso) return null
  const a = new Date(iso + 'T00:00:00'), b = new Date(todayISO() + 'T00:00:00')
  return Math.round((a.getTime() - b.getTime()) / 86400000)
}
export function money(n: number): string {
  return '₹' + (Number(n) || 0).toLocaleString('en-IN')
}
export function invPaid(inv: BgtsInvoice, payments: BgtsPayment[]): number {
  return payments.filter(p => p.invoiceId === inv.id).reduce((s, p) => s + (Number(p.amount) || 0), 0)
}
export function invOutstanding(inv: BgtsInvoice, payments: BgtsPayment[]): number {
  return (Number(inv.total) || 0) - invPaid(inv, payments)
}
export function hireBalance(lr: BgtsLR): number {
  const h = lr.hire || { amount: 0, advance: 0, payments: [] }
  return (Number(h.amount) || 0) - (Number(h.advance) || 0) -
    (h.payments || []).reduce((s, p) => s + (Number(p.amount) || 0), 0)
}

// ─── Init / blank DB ─────────────────────────────────────────────────────────

function blankDB(): BgtsDB {
  return {
    company: { name: 'Baroda Goods Transport Service Pvt. Ltd.', addr: 'Vadodara, Gujarat, India', gstin: '', phone: '', email: '', lrPrefix: 'BGTS/26-27/' },
    seq: { lr: 1, inv: 1, bk: 1, inq: 1, mr: 1 },
    branches: [{ id: 'br_main', name: 'VADODARA', entityName: 'Baroda Goods Transport Service Pvt. Ltd.', gstin: '', addr: 'Vadodara, Gujarat, India', lrPrefix: 'BGTS/26-27/', phone: '' }],
    clients: [], vehicles: [], drivers: [], vendors: [], routes: [],
    inquiries: [], bookings: [], lrs: [], expenses: [], renewals: [],
    contracts: [], invoices: [], payments: [], acctExp: [], bankTxns: [],
    lhcs: [], advances: [], billingBackup: [],
  }
}

const BGTS_FLEET = [
  { id: 'vGJ19X6890', regNo: 'GJ19X6890', make: 'Tata Ultra 1518 Open (2019)', type: 'Open Body', owned: true, gvw: '18500', driverId: '' },
  { id: 'vGJ06BX3536', regNo: 'GJ06BX3536', make: 'Tata 1212 LPT DCR 49HSD (2024)', type: 'High Deck Body', owned: true, gvw: '11990', driverId: '' },
  { id: 'vGJ34T2262', regNo: 'GJ34T2262', make: 'Eicher PRO 2110 (2020)', type: 'Half Deck Load Body', owned: true, gvw: '11990', driverId: '' },
  { id: 'vGJ06BY1577', regNo: 'GJ06BY1577', make: 'Mahindra Bolero Maxx PikUp HD 2.0L (07-2025)', type: 'Open Body Pickup', owned: true, gvw: '3900', driverId: '' },
]
const BGTS_FLEET_RENEWALS = [
  { regNo: 'GJ19X6890', docType: 'Insurance', ref: 'VGC1116112000101 (Royal Sundaram)', expiry: '2026-03-01' },
  { regNo: 'GJ06BX3536', docType: 'Insurance', ref: 'TAQ1088958000100 (Royal Sundaram)', expiry: '2026-09-02' },
  { regNo: 'GJ06BX3536', docType: 'Permit (State)', ref: 'GJ2024-GP-3993F', expiry: '2029-09-12' },
  { regNo: 'GJ34T2262', docType: 'Insurance', ref: 'OG-25-2201-1803-00004751 (Bajaj Allianz)', expiry: '2026-02-14' },
  { regNo: 'GJ06BY1577', docType: 'Insurance', ref: '213044/31/26/004994 (Shriram)', expiry: '' },
]

function ensureBGTSFleet(db: BgtsDB) {
  const byReg: Record<string, BgtsVehicle> = {}
  db.vehicles.forEach(v => { byReg[v.regNo.replace(/\s/g,'').toUpperCase()] = v })
  BGTS_FLEET.forEach(v => {
    if (!byReg[v.regNo]) { db.vehicles.push({ ...v }); byReg[v.regNo] = db.vehicles[db.vehicles.length-1] }
  })
  BGTS_FLEET_RENEWALS.forEach(r => {
    const veh = byReg[r.regNo]; if (!veh) return
    const dup = db.renewals.some(x => x.vehicleId === veh.id && x.docType === r.docType)
    if (!dup) db.renewals.push({ id: uid('rn'), vehicleRegNo: r.regNo, vehicleId: veh.id, docType: r.docType, issueDate: '', expiryDate: r.expiry, amount: 0, insurer: r.ref||'', notes: '', reminder: 30, ref: r.ref, expiry: r.expiry })
  })
}

function migrate(db: BgtsDB) {
  if (!db.lrs) db.lrs = []
  if (!db.acctExp) db.acctExp = []
  if (!db.inquiries) db.inquiries = []
  if (!db.bankTxns) db.bankTxns = []
  if (!db.lhcs) db.lhcs = []
  if (!db.advances) db.advances = []
  if (!db.branches || !db.branches.length) {
    db.branches = [{ id: 'br_main', name: 'VADODARA', entityName: db.company.name, gstin: db.company.gstin || '', addr: db.company.addr || '', lrPrefix: db.company.lrPrefix || '', phone: db.company.phone || '' }]
  }
  if (!db.seq.inq) db.seq.inq = 1
  if (!db.seq.mr) db.seq.mr = 1
  db.payments.forEach(p => { if (!p.mrNo) { p.mrNo = 'MR-' + String(db.seq.mr).padStart(4,'0'); db.seq.mr++ } })
  ensureBGTSFleet(db)
  // normalize LRs
  db.lrs.forEach(l => {
    if (!l.ownership) l.ownership = 'Owned'
    if (!l.hire) l.hire = { vendorId: '', amount: 0, advance: 0, payments: [] }
    if (!l.tripExpenses) l.tripExpenses = []
  })
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

const DB_KEY = 'bgts_os_db'

export function loadDB(): BgtsDB {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(DB_KEY) : null
    if (raw) return JSON.parse(raw) as BgtsDB
  } catch { /* ignore */ }
  return blankDB()
}

export function useBgtsDb() {
  const [db, setDb] = useState<BgtsDB>(() => {
    const d = loadDB()
    migrate(d)
    return d
  })

  const save = useCallback((updated: BgtsDB) => {
    try { localStorage.setItem(DB_KEY, JSON.stringify(updated)) } catch { /* ignore */ }
    setDb({ ...updated })
  }, [])

  const refresh = useCallback(() => {
    const d = loadDB()
    migrate(d)
    setDb({ ...d })
  }, [])

  // Hydrate from localStorage on mount (SSR safety)
  useEffect(() => {
    const d = loadDB()
    migrate(d)
    setDb({ ...d })
  }, [])

  return { db, save, refresh }
}
