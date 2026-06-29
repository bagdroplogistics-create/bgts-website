'use client'
import { useState, useRef } from 'react'
import { useRates } from '@/hooks/useRates'

const LABEL: React.CSSProperties = {
  fontSize: '0.72rem', fontWeight: 700, color: '#666',
  textTransform: 'uppercase', letterSpacing: '0.06em',
  display: 'block', marginBottom: 4,
}
const INPUT: React.CSSProperties = {
  width: '100%', padding: '8px 10px', fontSize: '0.88rem',
  border: '1px solid #d5cfc7', borderRadius: 6,
  background: '#faf7f4', boxSizing: 'border-box',
}
const SELECT_STYLE: React.CSSProperties = { ...INPUT, cursor: 'pointer' }
const CARD: React.CSSProperties = {
  background: '#ffffff', border: '1px solid #ddd8d0',
  borderRadius: 8, padding: '20px 24px', marginBottom: 20,
}

interface InvoiceData {
  invoiceNo:      string
  invoiceDate:    string
  clientName:     string
  clientAddress:  string
  clientGstin:    string
  lrNo:           string
  vehicleId:      string
  fromLoc:        string
  toLoc:          string
  kmBilled:       string
  freight:        string
  loadingCharge:  string
  unloadingCharge:string
  tollCharge:     string
  detentionCharge:string
  gstPct:         string
  notes:          string
}

const EMPTY: InvoiceData = {
  invoiceNo: '', invoiceDate: new Date().toISOString().slice(0, 10),
  clientName: '', clientAddress: '', clientGstin: '', lrNo: '',
  vehicleId: '', fromLoc: '', toLoc: '', kmBilled: '',
  freight: '', loadingCharge: '0', unloadingCharge: '0',
  tollCharge: '0', detentionCharge: '0', gstPct: '0', notes: '',
}

export function InvoiceGenerator() {
  const { rates, loading: rLoading } = useRates()
  const [form, setForm] = useState<InvoiceData>(EMPTY)
  const printRef = useRef<HTMLDivElement>(null)

  const set = (k: keyof InvoiceData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  const freight     = Number(form.freight)        || 0
  const loading     = Number(form.loadingCharge)  || 0
  const unloading   = Number(form.unloadingCharge)|| 0
  const toll        = Number(form.tollCharge)      || 0
  const detention   = Number(form.detentionCharge) || 0
  const subtotal    = freight + loading + unloading + toll + detention
  const gstPct      = Number(form.gstPct)          || 0
  const gstAmount   = (subtotal * gstPct) / 100
  const grandTotal  = subtotal + gstAmount

  const selectedVeh = rates.vehicles.find(v => v.id === form.vehicleId)

  const fmtRs = (n: number) => '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 })

  const handlePrint = () => {
    if (!printRef.current) return
    const html = printRef.current.innerHTML
    const win = window.open('', '_blank', 'width=900,height=700')
    if (!win) return
    win.document.write(`
      <!DOCTYPE html><html><head>
      <meta charset="utf-8">
      <title>Invoice ${form.invoiceNo} — BGTS</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #fff; }
        @media print { body { padding: 0; } button { display: none !important; } }
      </style>
      </head><body>${html}</body></html>
    `)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 500)
  }

  return (
    <div style={{ padding: '24px 24px 48px', maxWidth: 1200 }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#111', margin: '0 0 4px' }}>
          Invoice Generator
        </h2>
        <p style={{ fontSize: '0.78rem', color: '#888', margin: 0 }}>
          Fill details below — professional invoice generates on the right. Use Print / Save PDF to get a shareable document.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: 24 }}>

        {/* ── LEFT: Form ── */}
        <div>
          <div style={CARD}>
            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#c45c28', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Invoice Details
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={LABEL}>Invoice No.</label>
                <input style={INPUT} placeholder="BGTS-INV-001" value={form.invoiceNo} onChange={set('invoiceNo')} />
              </div>
              <div>
                <label style={LABEL}>Invoice Date</label>
                <input style={INPUT} type="date" value={form.invoiceDate} onChange={set('invoiceDate')} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={LABEL}>Client / Company Name</label>
                <input style={INPUT} placeholder="e.g. IOCL Vadodara" value={form.clientName} onChange={set('clientName')} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={LABEL}>Client Address</label>
                <input style={INPUT} placeholder="Full billing address" value={form.clientAddress} onChange={set('clientAddress')} />
              </div>
              <div>
                <label style={LABEL}>Client GSTIN</label>
                <input style={INPUT} placeholder="24XXXXX" value={form.clientGstin} onChange={set('clientGstin')} />
              </div>
              <div>
                <label style={LABEL}>LR / Bilty No.</label>
                <input style={INPUT} placeholder="LR-001" value={form.lrNo} onChange={set('lrNo')} />
              </div>
            </div>
          </div>

          <div style={CARD}>
            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#c45c28', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Trip Details
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={LABEL}>Vehicle</label>
                {rLoading ? (
                  <div style={{ ...INPUT, color: '#aaa' }}>Loading vehicles…</div>
                ) : (
                  <select style={SELECT_STYLE} value={form.vehicleId} onChange={set('vehicleId')}>
                    <option value="">— Select vehicle —</option>
                    {rates.vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.reg_no} — {v.make_model}</option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label style={LABEL}>From</label>
                <input style={INPUT} placeholder="Origin" value={form.fromLoc} onChange={set('fromLoc')} />
              </div>
              <div>
                <label style={LABEL}>To</label>
                <input style={INPUT} placeholder="Destination" value={form.toLoc} onChange={set('toLoc')} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={LABEL}>KM Billed</label>
                <input style={INPUT} type="number" placeholder="e.g. 120" value={form.kmBilled} onChange={set('kmBilled')} />
              </div>
            </div>
          </div>

          <div style={CARD}>
            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#c45c28', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Charges
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={LABEL}>Freight (₹) *</label>
                <input style={INPUT} type="number" placeholder="e.g. 15000" value={form.freight} onChange={set('freight')} />
              </div>
              <div>
                <label style={LABEL}>Loading (₹)</label>
                <input style={INPUT} type="number" placeholder="0" value={form.loadingCharge} onChange={set('loadingCharge')} />
              </div>
              <div>
                <label style={LABEL}>Unloading (₹)</label>
                <input style={INPUT} type="number" placeholder="0" value={form.unloadingCharge} onChange={set('unloadingCharge')} />
              </div>
              <div>
                <label style={LABEL}>Toll (₹)</label>
                <input style={INPUT} type="number" placeholder="0" value={form.tollCharge} onChange={set('tollCharge')} />
              </div>
              <div>
                <label style={LABEL}>Detention (₹)</label>
                <input style={INPUT} type="number" placeholder="0" value={form.detentionCharge} onChange={set('detentionCharge')} />
              </div>
              <div>
                <label style={LABEL}>GST %</label>
                <select style={SELECT_STYLE} value={form.gstPct} onChange={set('gstPct')}>
                  <option value="0">No GST</option>
                  <option value="5">5%</option>
                  <option value="12">12%</option>
                  <option value="18">18%</option>
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={LABEL}>Notes / Remarks</label>
                <textarea
                  style={{ ...INPUT, height: 60, resize: 'vertical', fontFamily: 'inherit' }}
                  placeholder="e.g. Payment due within 30 days"
                  value={form.notes}
                  onChange={set('notes')}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Invoice Preview ── */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button
              onClick={handlePrint}
              style={{ padding: '9px 20px', background: '#c45c28', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}
            >
              🖨 Print / Save PDF
            </button>
          </div>

          {/* Invoice printable area */}
          <div ref={printRef} style={{ background: '#fff', border: '1px solid #ddd8d0', borderRadius: 8, padding: '32px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', minHeight: 600 }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, paddingBottom: 20, borderBottom: '2px solid #c45c28' }}>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#c45c28', letterSpacing: '0.06em' }}>BGTS</div>
                <div style={{ fontSize: '0.78rem', color: '#666', marginTop: 2 }}>Baroda Goods Transport Service</div>
                <div style={{ fontSize: '0.72rem', color: '#888', marginTop: 6, lineHeight: 1.6 }}>
                  Nr Natraj Cinema, Pratapgunj Naka<br />
                  Vadodara — 390002, Gujarat<br />
                  📞 +91 63 5722 5722 · info@bgts.in
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#333', marginBottom: 4 }}>
                  TAX INVOICE
                </div>
                <div style={{ fontSize: '0.82rem', color: '#555' }}>
                  <div><strong>Invoice No:</strong> {form.invoiceNo || '—'}</div>
                  <div><strong>Date:</strong> {form.invoiceDate ? new Date(form.invoiceDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</div>
                  {form.lrNo && <div><strong>LR / Bilty:</strong> {form.lrNo}</div>}
                </div>
              </div>
            </div>

            {/* Bill To */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888', marginBottom: 6 }}>Bill To</div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#111' }}>{form.clientName || '—'}</div>
                {form.clientAddress && <div style={{ fontSize: '0.78rem', color: '#666', marginTop: 4, lineHeight: 1.5 }}>{form.clientAddress}</div>}
                {form.clientGstin   && <div style={{ fontSize: '0.75rem', color: '#555', marginTop: 4 }}>GSTIN: <strong>{form.clientGstin}</strong></div>}
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888', marginBottom: 6 }}>Trip Details</div>
                <table style={{ fontSize: '0.78rem', borderCollapse: 'collapse' }}>
                  <tbody>
                    {[
                      ['Vehicle',   selectedVeh ? `${selectedVeh.reg_no} — ${selectedVeh.make_model}` : '—'],
                      ['From',      form.fromLoc || '—'],
                      ['To',        form.toLoc   || '—'],
                      ['KM Billed', form.kmBilled ? `${form.kmBilled} km` : '—'],
                    ].map(([l, v]) => (
                      <tr key={l}>
                        <td style={{ color: '#888', paddingRight: 12, paddingBottom: 4 }}>{l}</td>
                        <td style={{ fontWeight: 600, color: '#222', paddingBottom: 4 }}>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Charges Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
              <thead>
                <tr style={{ background: '#F3EFE8' }}>
                  {['#', 'Description', 'Amount (₹)'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#666', textAlign: h === 'Amount (₹)' ? 'right' : 'left', borderBottom: '2px solid #d5cfc7' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Freight Charges',    freight,   true],
                  ['Loading Charges',    loading,   loading > 0],
                  ['Unloading Charges',  unloading, unloading > 0],
                  ['Toll / State Levy',  toll,      toll > 0],
                  ['Detention Charges',  detention, detention > 0],
                ].filter(([,, show]) => show).map(([desc, amt], i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#faf7f4' }}>
                    <td style={{ padding: '9px 12px', fontSize: '0.82rem', color: '#888', borderBottom: '1px solid #ece8e0', width: 30 }}>{i + 1}</td>
                    <td style={{ padding: '9px 12px', fontSize: '0.85rem', color: '#111', borderBottom: '1px solid #ece8e0' }}>{desc as string}</td>
                    <td style={{ padding: '9px 12px', fontSize: '0.85rem', color: '#111', textAlign: 'right', borderBottom: '1px solid #ece8e0', fontWeight: 600 }}>{fmtRs(amt as number)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <table style={{ minWidth: 260, borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '6px 12px', fontSize: '0.82rem', color: '#555' }}>Subtotal</td>
                    <td style={{ padding: '6px 12px', fontSize: '0.82rem', textAlign: 'right', fontWeight: 600 }}>{fmtRs(subtotal)}</td>
                  </tr>
                  {gstPct > 0 && (
                    <tr>
                      <td style={{ padding: '6px 12px', fontSize: '0.82rem', color: '#555' }}>GST @ {gstPct}%</td>
                      <td style={{ padding: '6px 12px', fontSize: '0.82rem', textAlign: 'right', fontWeight: 600 }}>{fmtRs(gstAmount)}</td>
                    </tr>
                  )}
                  <tr style={{ background: '#c45c28' }}>
                    <td style={{ padding: '10px 12px', fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>Grand Total</td>
                    <td style={{ padding: '10px 12px', fontSize: '0.95rem', fontWeight: 800, color: '#fff', textAlign: 'right' }}>{fmtRs(grandTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Notes */}
            {form.notes && (
              <div style={{ marginTop: 24, padding: '12px 16px', background: '#faf7f4', border: '1px solid #ddd8d0', borderRadius: 6 }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: '#888', marginBottom: 4 }}>Notes</div>
                <div style={{ fontSize: '0.82rem', color: '#444' }}>{form.notes}</div>
              </div>
            )}

            {/* Footer */}
            <div style={{ marginTop: 32, paddingTop: 16, borderTop: '1px solid #e5e0d8', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div style={{ fontSize: '0.72rem', color: '#aaa' }}>
                BGTS · GST: 24AAGCB3553Q1ZO<br />
                E&OE — Subject to Vadodara jurisdiction
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 160, borderTop: '1px solid #333', marginBottom: 4 }} />
                <div style={{ fontSize: '0.72rem', color: '#666' }}>Authorised Signatory</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
