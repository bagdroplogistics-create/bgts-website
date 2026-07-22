'use client'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

// Chart.js loaded from CDN — no npm install required
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Chart: any
let chartJsReady = false
let chartJsLoading = false
const chartJsCallbacks: (() => void)[] = []
function loadChartJs(cb: () => void) {
  if (chartJsReady) { cb(); return }
  chartJsCallbacks.push(cb)
  if (chartJsLoading) return
  chartJsLoading = true
  const s = document.createElement('script')
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js'
  s.onload = () => { chartJsReady = true; chartJsCallbacks.forEach(f => f()); chartJsCallbacks.length = 0 }
  document.head.appendChild(s)
}

// ── Types ──────────────────────────────────────────────────────────────────────
interface DnlV {
  rateMT:number;mtOut:number;mtBack:number;gstRate:number;detFree:number;detRate:number;
  km1:number;kmIntra:number;tonners:number;wFill:number;wEmpty:number;payload:number;
  diesel:number;mileage:number;tyre:number;maint:number;toll:number;driver:number;misc:number;
  emi:number;insur:number;permit:number;
  days:number;tripsDay:number;vehicles:number;dnlTrips:number;
  hire:number;sup:number;minM:number;tgtM:number;fuelCap:number;benchKm:number;
}
interface Trip {
  date:string;veh:string;type:'Owned'|'Hired';pick:string;
  out:number;back:number;km:number;det:number;pod:string;
  dl:number;toll:number;drv:number;
  vendor:string;hire:number;adv:number;extra:number;vbill:string;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ChInst = { destroy():void; data:any; update():void }
const CHARTS: Record<string,ChInst> = {}
function mkChart(id:string, cfg:object, ref:React.RefObject<HTMLCanvasElement|null>){
  if(CHARTS[id]) CHARTS[id].destroy()
  const ctx = ref.current?.getContext('2d')
  if(!ctx || typeof Chart === 'undefined') return
  CHARTS[id] = new Chart(ctx, cfg) as unknown as ChInst
}

// ── Defaults (matches HTML DEF exactly) ───────────────────────────────────────
const DEF:DnlV = {
  rateMT:1346.50, mtOut:20, mtBack:8, gstRate:0.18, detFree:4, detRate:250,
  km1:100, kmIntra:20, tonners:13, wFill:1.5, wEmpty:0.6, payload:20,
  diesel:92, mileage:3.8, tyre:3.5, maint:3.0, toll:900, driver:1400, misc:400,
  emi:85000, insur:10000, permit:2000,
  days:26, tripsDay:1, vehicles:2, dnlTrips:0,
  hire:14000, sup:300, minM:0.12, tgtM:0.20, fuelCap:0.32, benchKm:52,
}

// ── Inputs groups (matches HTML GROUPS) ────────────────────────────────────────
type GEntry = [keyof DnlV, string, string]
const GROUPS: Record<string, GEntry[]> = {
  in_rev:[['rateMT','Rate per MT','Rs/MT — CONFIRMED'],
    ['mtOut','Billed MT — outbound (filled)','MT — billed 20 vs actual 19.5'],
    ['mtBack','Billed MT — return (empty)','MT — the empty return IS paid'],
    ['gstRate','GST rate','fraction — 0.18, vehicle hire with ITC'],
    ['detFree','Free detention hours per plant end','hrs — placeholder, confirm'],
    ['detRate','Detention charge beyond free time','Rs/hr — placeholder, confirm']],
  in_route:[['km1','Ankleshwar → Nandesari (one way)','km — placeholder'],
    ['kmIntra','Intra-Ankleshwar leg (SSPL ⇄ Amol)','km'],
    ['tonners','Filled tonners per trip','nos'],['wFill','Weight per FILLED tonner','MT'],
    ['wEmpty','Weight per EMPTY tonner','MT'],['payload','Vehicle rated PAYLOAD','MT — payload or GVW?']],
  in_run:[['diesel','Diesel price','Rs/ltr'],['mileage','Mileage, blended round trip','km/ltr'],
    ['tyre','Tyre cost','Rs/km — ITC likely claimable'],['maint','Maintenance & spares','Rs/km — ITC likely claimable'],
    ['toll','Toll per round trip','Rs — GST exempt, no ITC'],['driver','Driver + cleaner per trip','Rs'],
    ['misc','Misc / loading supervision','Rs per trip']],
  in_fix:[['emi','EMI per month','Rs — set 0 if fully paid'],['insur','Insurance + road tax (monthly)','Rs'],
    ['permit','Permit / fitness / PUC (monthly)','Rs']],
  in_ops:[['days','Working days per month','days'],['tripsDay','Round trips per vehicle per day','trips'],
    ['vehicles','Owned vehicles dedicated','nos — plan, not yet justified'],
    ['dnlTrips','DNL confirmed trips per month','trips — UNKNOWN. Enter when confirmed.']],
  in_out:[['hire','Market vehicle hire per round trip','Rs — placeholder, get quotes'],
    ['sup','Supervision on market vehicle','Rs'],['minM','Minimum acceptable margin','fraction — BGTS rule 0.12'],
    ['tgtM','Target margin','fraction'],['fuelCap','Fuel red-flag threshold','fraction of revenue — 0.32'],
    ['benchKm','Market benchmark revenue per km','Rs/km — modelled, sanity check only']],
}

// ── Model (matches HTML model() exactly) ──────────────────────────────────────
function mdl(v:DnlV){
  const km=v.km1*2+v.kmIntra, fpk=v.mileage>0?v.diesel/v.mileage:0
  const fuel=km*fpk, tyre=km*v.tyre, mnt=km*v.maint
  const direct=fuel+tyre+mnt+v.toll+v.driver+v.misc
  const fixedMo=v.emi+v.insur+v.permit, tripsMo=v.days*v.tripsDay
  const fpt=tripsMo>0?fixedMo/tripsMo:0
  const ownTotal=direct+fpt, outTotal=v.hire+v.sup
  const mtTot=v.mtOut+v.mtBack, freight=v.rateMT*mtTot
  const gst=freight*v.gstRate, invoice=freight+gst
  const den=outTotal-direct, cross=den>0?fixedMo/den:Infinity
  const ownMargin=freight-ownTotal, outMargin=freight-outTotal
  const minOwn=ownTotal/(1-v.minM), tgtOwn=ownTotal/(1-v.tgtM)
  const minOut=outTotal/(1-v.minM), tgtOut=outTotal/(1-v.tgtM)
  const fuelPc=freight?fuel/freight:0, revKm=km?freight/km:0, costKm=km?ownTotal/km:0
  const prem=v.benchKm?(freight/km)/v.benchKm:0
  const wOut=v.tonners*v.wFill, wBack=v.tonners*v.wEmpty
  const payloadUtil=v.payload?(v.tonners*v.wFill)/v.payload:0
  const capacity=tripsMo*v.vehicles
  return {km,fuel,tyre:tyre,mnt,direct,fixedMo,tripsMo,fpt,ownTotal,outTotal,
    mtTot,freight,gst,invoice,ownMargin,ownMarginPc:freight?(freight-ownTotal)/freight:0,
    outMargin,outMarginPc:freight?(freight-outTotal)/freight:0,
    minOwn,tgtOwn,minOut,tgtOut,fuelPc,revKm,costKm,prem,wOut,wBack,payloadUtil,cross,capacity}
}
function mixFor(n:number,v:DnlV){
  const m=mdl(v)
  const veh=Math.min(Math.floor(isFinite(m.cross)?n/m.cross:0),Math.ceil(n/m.tripsMo))
  const own=Math.min(n,veh*m.tripsMo), hire=n-own
  const cost=own*m.direct+veh*m.fixedMo+hire*m.outTotal
  const allOwn=n*m.direct+Math.ceil(n/m.tripsMo)*m.fixedMo, allHire=n*m.outTotal
  const best=Math.min(cost,allOwn,allHire)
  const strategy=cost<=Math.min(allOwn,allHire)?'MIXED':(allOwn<allHire?'ALL OWNED':'ALL HIRED')
  return {n,veh,own,hire,cost,allOwn,allHire,best,rev:n*m.freight,
    margin:n*m.freight-best,strategy}
}
function ownedCost(t:Trip,v:DnlV){
  if(t.type!=='Owned') return 0
  const m=mdl(v)
  return (t.dl||0)*v.diesel+(t.toll||0)+(t.drv||0)+(t.km||0)*(v.tyre+v.maint)+m.fpt
}
function hiredCost(t:Trip,v:DnlV){
  if(t.type!=='Hired') return 0
  return (t.hire||0)+(t.extra||0)+v.sup
}
function tripCost(t:Trip,v:DnlV){ return ownedCost(t,v)+hiredCost(t,v) }
function tripRev(t:Trip,v:DnlV){
  return mdl(v).freight+Math.max(0,(t.det||0)-v.detFree*2)*v.detRate
}
function rollup(trips:Trip[],v:DnlV){
  const m=mdl(v)
  const a={trips:0,own:0,hire:0,rev:0,cost:0,km:0,dl:0,ton:0,back:0,pod:0,fuel:0,gst:0,
    ownRev:0,ownCost:0,hireRev:0,hireCost:0,ownKm:0,hireKm:0,
    hirePaid:0,extraPaid:0,advance:0,balance:0,bills:0,
    vendors:{} as Record<string,{name:string;trips:number;hire:number;extra:number;adv:number;bal:number;bills:number}>,
    margin:0,marginPc:0,variance:0,mileage:0,fuelPc:0,util:0,podPc:0,
    ownMarginPt:0,hireMarginPt:0,edge:null as number|null,
    totalHireSpend:0,avgHire:0,billPc:0,
    vendorList:[] as {name:string;trips:number;hire:number;extra:number;adv:number;bal:number;bills:number;total:number;avg:number;billPc:number;share:number}[],
    topDep:0,
  }
  trips.forEach(t=>{
    const oc=ownedCost(t,v),hc=hiredCost(t,v),c=oc+hc,r=tripRev(t,v)
    a.trips++;a.rev+=r;a.cost+=c;a.km+=(t.km||0);a.ton+=(t.out||0);a.back+=(t.back||0)
    a.gst+=r*v.gstRate; if(t.pod==='Y')a.pod++
    if(t.type==='Owned'){
      a.own++;a.ownRev+=r;a.ownCost+=oc;a.ownKm+=(t.km||0)
      a.dl+=(t.dl||0);a.fuel+=(t.dl||0)*v.diesel
    } else {
      a.hire++;a.hireRev+=r;a.hireCost+=hc;a.hireKm+=(t.km||0)
      a.hirePaid+=(t.hire||0);a.extraPaid+=(t.extra||0)
      a.advance+=(t.adv||0);a.balance+=((t.hire||0)-(t.adv||0))
      if(t.vbill==='Y')a.bills++
      const vn=(t.vendor||'Unnamed').trim()||'Unnamed'
      if(!a.vendors[vn])a.vendors[vn]={name:vn,trips:0,hire:0,extra:0,adv:0,bal:0,bills:0}
      const x=a.vendors[vn]
      x.trips++;x.hire+=(t.hire||0);x.extra+=(t.extra||0);x.adv+=(t.adv||0)
      x.bal+=((t.hire||0)-(t.adv||0)); if(t.vbill==='Y')x.bills++
    }
  })
  a.margin=a.rev-a.cost;a.marginPc=a.rev?a.margin/a.rev:0;a.variance=a.ton-a.back
  a.mileage=a.dl?a.ownKm/a.dl:0;a.fuelPc=a.ownRev?a.fuel/a.ownRev:0
  a.util=m.capacity?a.own/m.capacity:0;a.podPc=a.trips?a.pod/a.trips:0
  a.ownMarginPt=a.own?(a.ownRev-a.ownCost)/a.own:0
  a.hireMarginPt=a.hire?(a.hireRev-a.hireCost)/a.hire:0
  a.edge=(a.own&&a.hire)?a.ownMarginPt-a.hireMarginPt:null
  a.totalHireSpend=a.hirePaid+a.extraPaid;a.avgHire=a.hire?a.hirePaid/a.hire:0
  a.billPc=a.hire?a.bills/a.hire:1
  a.vendorList=Object.values(a.vendors).map(vd=>({...vd,
    total:vd.hire+vd.extra,avg:vd.trips?vd.hire/vd.trips:0,
    billPc:vd.trips?vd.bills/vd.trips:0,
    share:a.totalHireSpend?(vd.hire+vd.extra)/a.totalHireSpend:0}))
    .sort((x,y)=>y.total-x.total)
  a.topDep=a.vendorList.length?Math.max(...a.vendorList.map(vd=>vd.share)):0
  return a
}

// ── Formatters ──────────────────────────────────────────────────────────────────
const Rs=(n:number)=>'Rs '+Math.round(n).toLocaleString('en-IN')
const Pc=(n:number)=>(n*100).toFixed(1)+'%'
const Nm=(n:number)=>(Math.round(n*10)/10).toLocaleString('en-IN')

// ── Colours ─────────────────────────────────────────────────────────────────────
const NAVY='#1e293b',STEEL='#c45c28',OK='#0f7b47',WARN='#a4650a',BAD='#b3261e',MUT='#6b7789'
const SL:React.CSSProperties={fontFamily:'-apple-system,"Segoe UI",Arial,sans-serif',fontSize:14,lineHeight:1.5,color:'#12203a'}

type SubTab='econ'|'vol'|'fleet'|'log'|'vendors'|'flags'|'inputs'
const TABS=[
  {id:'econ' as SubTab,label:'Trip Economics'},
  {id:'vol'  as SubTab,label:'Volume & Fleet Mix'},
  {id:'fleet'as SubTab,label:'Owned vs Outside'},
  {id:'log'  as SubTab,label:'Daily Trip Log'},
  {id:'vendors'as SubTab,label:'Vendors & Hire'},
  {id:'flags'as SubTab,label:'Risk Flags'},
  {id:'inputs'as SubTab,label:'Inputs'},
]

// ── localStorage helpers ────────────────────────────────────────────────────────
function lsLoad<T>(key:string,def:T):T{
  if(typeof window==='undefined') return def
  try{const v=localStorage.getItem(key);return v?{...def,...JSON.parse(v)}:def}catch{return def}
}
function lsSave(key:string,v:unknown){try{localStorage.setItem(key,JSON.stringify(v))}catch{}}

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export function DnlDesk(){
  const [tab,setTab]=useState<SubTab>('econ')
  const [V,setV]=useState<DnlV>(()=>lsLoad('dnl2_inputs',{...DEF}))
  const [trips,setTrips]=useState<Trip[]>(()=>lsLoad('dnl2_trips',[]))
  const [tripType,setTripType]=useState<'Owned'|'Hired'>('Owned')
  const [volInput,setVolInput]=useState(0)

  // form
  const [fd,setFd]=useState({
    date:new Date().toISOString().slice(0,10),veh:'',pick:'SSPL + Amol',
    out:13,back:13,km:220,det:0,pod:'Y',
    dl:58,toll:900,drv:1400,
    vendor:'',hire:14000,adv:0,extra:0,vbill:'N',
  })
  const sf=(k:string,v:unknown)=>setFd(f=>({...f,[k]:v}))

  // chart canvas refs
  const rCost =useRef<HTMLCanvasElement>(null)
  const rVol  =useRef<HTMLCanvasElement>(null)
  const rCross=useRef<HTMLCanvasElement>(null)
  const rMix  =useRef<HTMLCanvasElement>(null)
  const rVend =useRef<HTMLCanvasElement>(null)

  const m=useMemo(()=>mdl(V),[V])
  const a=useMemo(()=>rollup(trips,V),[trips,V])

  const VOLS=[6,10,13,16,20,26,32,39,42,45,48,52,60,78]

  // ── charts ──────────────────────────────────────────────────────────────────
  useEffect(()=>{
    if(tab!=='econ') return
    let destroyed=false
    loadChartJs(()=>{
      if(destroyed) return
      mkChart('chCost',{type:'bar',data:{
        labels:['Fuel','Tyres','Maint','Toll','Driver','Misc','Fixed','MARGIN'],
        datasets:[{data:[m.fuel,m.tyre,m.mnt,V.toll,V.driver,V.misc,m.fpt,m.ownMargin],
          backgroundColor:['#c45c28','#c45c28','#c45c28','#d4956a','#c45c28','#d4956a','#1e293b','#0f7b47']}]},
        options:{plugins:{legend:{display:false}},
          scales:{y:{ticks:{callback:(v:number)=>'Rs '+v.toLocaleString('en-IN')}}},
          maintainAspectRatio:false}},rCost)
    })
    return ()=>{ destroyed=true; if(CHARTS.chCost) CHARTS.chCost.destroy() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[tab,m.fuel,m.tyre,m.mnt,V.toll,V.driver,V.misc,m.fpt,m.ownMargin])

  useEffect(()=>{
    if(tab!=='vol') return
    let destroyed=false
    loadChartJs(()=>{
      if(destroyed) return
      mkChart('chVol',{type:'line',data:{labels:VOLS,datasets:[
        {label:'Revenue (ex-GST)',data:VOLS.map(n=>Math.round(n*m.freight)),borderColor:OK,tension:0},
        {label:'All-owned cost',data:VOLS.map(n=>Math.round(mixFor(n,V).allOwn)),borderColor:NAVY,stepped:true},
        {label:'All-hired cost',data:VOLS.map(n=>Math.round(mixFor(n,V).allHire)),borderColor:WARN,borderDash:[6,4],tension:0},
        {label:'Mixed-fleet cost',data:VOLS.map(n=>Math.round(mixFor(n,V).cost)),borderColor:BAD,borderWidth:3,stepped:true}]},
        options:{scales:{x:{title:{display:true,text:'DNL round trips per month'}},
          y:{ticks:{callback:(v:number)=>'Rs '+(v/100000).toFixed(1)+'L'}}},
          maintainAspectRatio:false}},rVol)
    })
    return ()=>{ destroyed=true; if(CHARTS.chVol) CHARTS.chVol.destroy() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[tab,m.freight,V])

  useEffect(()=>{
    if(tab!=='fleet') return
    let destroyed=false
    loadChartJs(()=>{
      if(destroyed) return
      const xs:number[]=[],ow:number[]=[],ou:number[]=[]
      for(let n=8;n<=40;n+=2){
        const f=m.fixedMo/n,tot=m.direct+f
        xs.push(n);ow.push(Math.round(tot));ou.push(Math.round(m.outTotal))
      }
      mkChart('chCross',{type:'line',data:{labels:xs,datasets:[
        {label:'Owned — total cost/trip',data:ow,borderColor:NAVY,backgroundColor:NAVY+'20',tension:.25,fill:true},
        {label:'Outside — cost/trip',data:ou,borderColor:WARN,borderDash:[6,4],tension:0}]},
        options:{scales:{x:{title:{display:true,text:'Round trips per month per vehicle'}},
          y:{ticks:{callback:(v:number)=>'Rs '+v.toLocaleString('en-IN')}}},
          maintainAspectRatio:false}},rCross)
      mkChart('chMix',{type:'doughnut',data:{
        labels:['Owned','Hired'],
        datasets:[{data:[a.own||0,a.hire||0],backgroundColor:['#c45c28','#c77b1a']}]},
        options:{plugins:{title:{display:true,text:'Trips by vehicle type ('+a.trips+' logged)'}},
          maintainAspectRatio:false}},rMix)
    })
    return ()=>{
      destroyed=true
      if(CHARTS.chCross) CHARTS.chCross.destroy()
      if(CHARTS.chMix)   CHARTS.chMix.destroy()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[tab,m.direct,m.fixedMo,m.outTotal,a.own,a.hire,a.trips])

  useEffect(()=>{
    if(tab!=='vendors') return
    let destroyed=false
    loadChartJs(()=>{
      if(destroyed) return
      mkChart('chVend',{type:'bar',data:{
        labels:a.vendorList.map(v=>v.name),
        datasets:[{label:'Total paid (Rs)',data:a.vendorList.map(v=>Math.round(v.total)),
          backgroundColor:a.vendorList.map(v=>v.share>0.4?BAD:'#c77b1a')}]},
        options:{indexAxis:'y',plugins:{legend:{display:false},
          title:{display:true,text:'Hire spend by vendor — red exceeds the 40% dependency trigger'}},
          scales:{x:{ticks:{callback:(v:number)=>'Rs '+v.toLocaleString('en-IN')}}},
          maintainAspectRatio:false}},rVend)
    })
    return ()=>{ destroyed=true; if(CHARTS.chVend) CHARTS.chVend.destroy() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[tab,a.vendorList])

  // ── trip form helpers ────────────────────────────────────────────────────────
  const curDraft=useCallback(():Trip=>({
    date:fd.date,veh:fd.veh||'—',type:tripType,pick:fd.pick,
    out:fd.out||0,back:fd.back||0,km:fd.km||0,det:fd.det||0,pod:fd.pod,
    dl:tripType==='Owned'?(fd.dl||0):0,toll:tripType==='Owned'?(fd.toll||0):0,
    drv:tripType==='Owned'?(fd.drv||0):0,
    vendor:tripType==='Hired'?fd.vendor.trim():'',
    hire:tripType==='Hired'?(fd.hire||0):0,
    adv:tripType==='Hired'?(fd.adv||0):0,
    extra:tripType==='Hired'?(fd.extra||0):0,
    vbill:tripType==='Hired'?fd.vbill:'n/a',
  }),[fd,tripType])

  const preview=useMemo(()=>{
    const t=curDraft(), c=tripCost(t,V), r=tripRev(t,V)
    return {c,r,m:r-c}
  },[curDraft,V])

  const addTrip=useCallback(()=>{
    const t=curDraft()
    if(!t.date){alert('Enter the trip date.');return}
    if(t.type==='Hired'&&!t.vendor){
      if(!confirm('No vendor name. Dependency and bill tracking will not work. Add anyway?'))return}
    const newTrips=[...trips,t].sort((a,b)=>a.date<b.date?-1:1)
    setTrips(newTrips);lsSave('dnl2_trips',newTrips)
  },[curDraft,trips])

  const delTrip=useCallback((i:number)=>{
    const newTrips=trips.filter((_,idx)=>idx!==i)
    setTrips(newTrips);lsSave('dnl2_trips',newTrips)
  },[trips])

  const exportCSV=useCallback(()=>{
    const h=['Date','Vehicle','Type','Vendor','Pickup','TonnersOut','EmptiesBack','Variance','KM',
      'DieselLtrs','Toll','DriverExp','OwnedCost','HireRate','AdvancePaid','BalancePayable',
      'ExtraPaid','Supervision','HiredCost','TotalCost','FreightRevenue','DetentionHrs',
      'DetentionRecovery','TotalRevenueExGST','GST','InvoiceValue','Margin','POD','VendorBill']
    const rows=trips.map(t=>{
      const oc=ownedCost(t,V),hc=hiredCost(t,V),c=oc+hc
      const dr=Math.max(0,(t.det||0)-V.detFree*2)*V.detRate
      const r=tripRev(t,V),g=r*V.gstRate
      return [t.date,t.veh,t.type,t.vendor||'',t.pick,t.out,t.back,(t.out||0)-(t.back||0),t.km,
        t.dl||0,t.toll||0,t.drv||0,Math.round(oc),t.hire||0,t.adv||0,Math.round((t.hire||0)-(t.adv||0)),
        t.extra||0,t.type==='Hired'?V.sup:0,Math.round(hc),Math.round(c),
        Math.round(mdl(V).freight),t.det||0,Math.round(dr),Math.round(r),Math.round(g),
        Math.round(r+g),Math.round(r-c),t.pod,t.vbill]
    })
    const el=document.createElement('a')
    el.href=URL.createObjectURL(new Blob([[h,...rows].map(r=>r.join(',')).join('\n')],{type:'text/csv'}))
    el.download='BGTS_DNL_TripLog.csv';el.click()
  },[trips,V])

  // ── save/reset inputs ────────────────────────────────────────────────────────
  const updateV=(k:keyof DnlV,val:number)=>{
    const nv={...V,[k]:val}; setV(nv); lsSave('dnl2_inputs',nv)
  }
  const resetInputs=()=>{
    if(!confirm('Reset all inputs to defaults?'))return
    setV({...DEF}); lsSave('dnl2_inputs',DEF)
  }
  const saveInputs=()=>{ lsSave('dnl2_inputs',V); alert('Inputs saved.') }

  // ── vol evaluate ─────────────────────────────────────────────────────────────
  const setVol=()=>{
    const nv={...V,dnlTrips:volInput}; setV(nv); lsSave('dnl2_inputs',nv)
  }
  const dv=V.dnlTrips||0

  // ── crossover table data ──────────────────────────────────────────────────────
  const crossRows=useMemo(()=>{
    const rows=[]
    for(let n=8;n<=40;n+=2){
      const f=m.fixedMo/n, tot=m.direct+f, adv=m.outTotal-tot
      rows.push({n,direct:m.direct,f,tot,out:m.outTotal,adv,mpc:(m.freight-tot)/m.freight,own:adv>0})
    }
    return rows
  },[m])

  // ── flags data ────────────────────────────────────────────────────────────────
  const dvv=V.dnlTrips||0, just=dvv>0?mixFor(dvv,V).veh:0
  const FLAGS=[
    ['DNL committed monthly trips confirmed', dvv||'not set','required',dvv<=0,
      'Volume is the binding risk on this lane, not margin. Do not dedicate the second vehicle until DNL commits a monthly minimum in writing.'],
    ['Owned vehicles planned vs justified',V.vehicles+' planned / '+(dvv>0?just+' justified':'? justified'),'must match',dvv>0&&V.vehicles>just,
      'You are committing Rs '+Math.round((V.vehicles-just)*m.fixedMo).toLocaleString('en-IN')+'/month of fixed cost for trips that would be cheaper to hire. Convert the surplus vehicle to market hire.'],
    ['Payload utilisation vs rated capacity',Pc(m.payloadUtil),'max 95%',m.payloadUtil>0.95,
      'OVERLOAD EXPOSURE. Confirm 20 MT is rated payload, not GVW. Escalate to Directors before the next dispatch.'],
    ['Gross margin on DNL business',a.trips?Pc(a.marginPc):Pc(m.ownMarginPc),'min '+Pc(V.minM),(a.trips?a.marginPc:m.ownMarginPc)<V.minM,
      'Re-price or strip cost.'],
    ['Fuel as % of revenue',a.trips?Pc(a.fuelPc):Pc(m.fuelPc),'max '+Pc(V.fuelCap),(a.trips?a.fuelPc:m.fuelPc)>V.fuelCap,
      'Fuel audit: pump reconciliation, per-vehicle mileage, GPS route deviation.'],
    ['Tonner variance (DNL asset in custody)',a.variance,'must be 0',a.variance!==0,
      'Client asset unaccounted. Trace same day — this is a liability, not an operational nuisance.'],
    ['POD compliance',a.trips?Pc(a.podPc):'—','100%',a.trips>0&&a.podPc<1,
      'Every missing POD delays an invoice and stretches the receivable cycle.'],
    ['Owned fleet utilisation',a.trips?Pc(a.util):'—','min 85%',a.trips>0&&a.util<0.85,
      'Idle above 15%. Reduce dedicated vehicles or find additional volume.'],
    ['Owned margin advantage per trip (actuals)',(a.own&&a.hire)?Rs(a.edge!):'—','above 0',a.own>0&&a.hire>0&&(a.edge??0)<0,
      'On your logged trips a hired vehicle is out-earning an owned one. Shift trips to market vehicles.'],
    ['Highest single-vendor dependency',a.vendorList.length?Pc(a.topDep):'—','max 40%',a.topDep>0.4,
      'One vendor holds more than 40% of your hire spend. They can price you at will. Empanel more vendors.'],
    ['Vendor bill compliance',a.hire?Pc(a.billPc):'—','100%',a.hire>0&&a.billPc<1,
      'Missing vendor bills block ITC on the hire charge and understate payables. Chase before month-end.'],
    ['Balance payable to vendors',Rs(a.balance),'within terms',a.balance>0,
      'Outstanding vendor liability of '+Rs(a.balance)+'. Confirm it sits within agreed payment terms.'],
    ['Revenue per km vs market benchmark',Nm(m.prem)+'x','below 2x',m.prem>2,
      'Rate is well above the modelled benchmark. Verify cost inputs are not understated.'],
    ['Single-client concentration',dvv>0?Rs(dvv*m.freight)+'/mo':'—','below 35% of turnover',dvv>0,
      'This contract bills significantly. Measure it against total BGTS turnover — policy flags single-client exposure above 35%.'],
  ] as [string,unknown,string,boolean,string][]

  const CLAUSES=[
    ['Minimum guaranteed monthly trips','You are dedicating owned vehicles against volume DNL can throttle at will. At Rs '+Math.round(m.fixedMo).toLocaleString('en-IN')+'/month per vehicle in fixed cost, this is the largest single exposure on the contract.','1 — highest'],
    ['Detention / demurrage','Loading 13 tonners at two Ankleshwar points plus unloading at Nandesari can consume the day. Unpaid detention caps you at one trip/day and silently erodes margin.','2'],
    ['Tonner custody & liability cap','13 DNL-owned tonners in BGTS custody every trip. Define loss/damage liability and cap BGTS exposure.','3'],
    ['Overload responsibility on consignor','19.5 MT actual on a 20 MT vehicle. Any RTO penalty must sit with the party specifying the load.','4'],
    ['Rate protection / escalation','Rate is confirmed at Rs 1,346.50/MT. Fix the review mechanism and a diesel escalation trigger before DNL proposes one.','5'],
    ['Payment terms and POD process','BGTS flags receivables above 60 days. On a dedicated-fleet contract the EMI is monthly — the receivable cannot be quarterly.','6'],
    ['GST classification confirmation','Billed at 18% as vehicle hire with ITC. Have the CA confirm the classification and quantify ITC recoverable on tyres, spares, maintenance and insurance. Diesel and toll carry no ITC.','7'],
  ]

  // ── shared styles ─────────────────────────────────────────────────────────
  const TH:React.CSSProperties={background:'#fdf7f3',textAlign:'left',padding:'8px',fontSize:11,textTransform:'uppercase',letterSpacing:'.4px',color:NAVY,borderBottom:'2px solid #e8ddd6',whiteSpace:'nowrap'}
  const TD:React.CSSProperties={padding:'7px 8px',borderBottom:'1px solid #edf0f4',fontVariantNumeric:'tabular-nums',fontSize:13}
  const TDR:React.CSSProperties={...TD,textAlign:'right'}
  const CARD:React.CSSProperties={background:'#fff',border:'1px solid #e8ddd6',borderRadius:6,padding:15}
  const H2:React.CSSProperties={fontSize:15,color:NAVY,margin:'22px 0 10px',paddingBottom:6,borderBottom:'2px solid #e8ddd6'}
  const H2F:React.CSSProperties={...H2,marginTop:0}
  const NOTE:React.CSSProperties={fontSize:11.5,color:MUT,marginTop:8,lineHeight:1.6}

  // KPI card helper
  const KPI=({lab,val,fo,cls}:{lab:string;val:string;fo?:string;cls?:string})=>(
    <div style={CARD}>
      <div style={{fontSize:11,color:MUT,textTransform:'uppercase',letterSpacing:'.6px'}}>{lab}</div>
      <div style={{fontSize:24,fontWeight:700,margin:'5px 0 2px',fontVariantNumeric:'tabular-nums',color:cls==='ok'?OK:cls==='bad'?BAD:cls==='warn'?WARN:'#12203a'}}>{val}</div>
      {fo&&<div style={{fontSize:11,color:MUT}}>{fo}</div>}
    </div>
  )

  const flagCls=(bad:boolean)=>({
    display:'flex',gap:12,alignItems:'flex-start',padding:11,borderRadius:5,marginBottom:8,
    borderLeft:'4px solid '+(bad?BAD:OK),
    background:bad?'#fbe6e5':'#e3f4ea',
  })

  const pill=(txt:string,type:'own'|'out'|'mix')=>{
    const bg=type==='own'?'#fff4ee':type==='out'?'#fde9d8':'#d9f0e2'
    const col=type==='own'?STEEL:type==='out'?'#8a4b00':OK
    return <span style={{display:'inline-block',padding:'1px 7px',borderRadius:9,fontSize:10.5,fontWeight:700,background:bg,color:col}}>{txt}</span>
  }

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="dnl-desk" style={{...SL,background:'#f8f4f0',minHeight:'80vh'}}>
      {/* Always-visible number input spinners */}
      <style>{`
        .dnl-desk input[type=number]::-webkit-inner-spin-button,
        .dnl-desk input[type=number]::-webkit-outer-spin-button { opacity:1; }
      `}</style>

      {/* Header */}
      <div style={{background:NAVY,color:'#fff',padding:'18px 26px'}}>
        <div style={{fontSize:19,letterSpacing:.3}}>BGTS &nbsp;|&nbsp; DEEPAK NITRITE LIMITED — DEDICATED MOVEMENT MIS &nbsp;<span style={{fontSize:12,opacity:.6}}>v2.0</span></div>
        <div style={{fontSize:12,opacity:.8,marginTop:4}}>
          <span style={{display:'inline-block',background:'#ffffff22',border:'1px solid #ffffff40',padding:'2px 8px',borderRadius:3,fontSize:11,marginRight:6}}>DNL DESK</span>
          <span style={{display:'inline-block',background:'#ffffff22',border:'1px solid #ffffff40',padding:'2px 8px',borderRadius:3,fontSize:11,marginRight:6}}>OPS · FLT · FIN · RISK</span>
          <span style={{display:'inline-block',background:'#1d7a4d',border:'1px solid #2fa06a',padding:'2px 8px',borderRadius:3,fontSize:11,marginRight:6}}>RATE CONFIRMED</span>
          Ankleshwar (SSPL + Amol) ⇄ Nandesari &nbsp;·&nbsp; Rs 1,346.50/MT &nbsp;·&nbsp; 20 MT filled + 8 MT empty = 28 MT billed
        </div>
      </div>

      {/* Nav */}
      <div style={{background:STEEL,display:'flex',gap:2,padding:'0 18px',flexWrap:'wrap'}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{background:'none',border:0,color:tab===t.id?'#fff':'#dce6f5',padding:'11px 15px',fontSize:13,cursor:'pointer',
              borderBottom:tab===t.id?'3px solid #ffd54a':'3px solid transparent',
              fontWeight:tab===t.id?600:400,fontFamily:'inherit'}}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{padding:22,maxWidth:1560,margin:'0 auto'}}>

      {/* ═══ TAB: TRIP ECONOMICS ═══ */}
      {tab==='econ'&&(
        <div>
          {/* Banners */}
          <div style={{borderRadius:5,padding:'11px 13px',fontSize:12.5,marginBottom:16,border:'1px solid #8fc9a9',background:'#e3f4ea'}}>
            <b>Agreed terms:</b> Rs {Nm(V.rateMT)}/MT × {Nm(m.mtTot)} MT ({Nm(V.mtOut)} filled + {Nm(V.mtBack)} empty) = <b>{Rs(m.freight)}</b> freight. GST @{Pc(V.gstRate)} = {Rs(m.gst)}. Invoice value <b>{Rs(m.invoice)}</b>. &nbsp;<b>All margins below are computed on {Rs(m.freight)} — GST is a pass-through, not BGTS revenue.</b>
          </div>
          <div style={{borderRadius:5,padding:'11px 13px',fontSize:12.5,marginBottom:16,border:'1px solid #e8c268',background:'#fdf2df'}}>
            <b>Cost inputs are still placeholders.</b> Diesel, mileage, tyres, maintenance, EMI, insurance, distance and market hire are modelled Gujarat benchmarks, not BGTS actuals. Margin figures will move when you replace them.
          </div>

          {/* KPI row */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:14,marginBottom:14}}>
            <KPI lab="Freight revenue / trip" val={Rs(m.freight)} fo={Nm(m.km)+' km · '+Nm(m.revKm)+' Rs/km · '+Nm(V.rateMT)+' Rs/MT'}/>
            <KPI lab="Cost / trip (owned)" val={Rs(m.ownTotal)} fo={Rs(m.direct)+' direct + '+Rs(m.fpt)+' fixed absorbed'}/>
            <KPI lab="Margin / trip" val={Rs(m.ownMargin)} fo="owned vehicle, per round trip" cls={m.ownMargin<=0?'bad':m.ownMarginPc<V.minM?'warn':'ok'}/>
            <KPI lab="Margin %" val={Pc(m.ownMarginPc)} fo={'BGTS floor '+Pc(V.minM)+' · target '+Pc(V.tgtM)} cls={m.ownMarginPc<=0?'bad':m.ownMarginPc<V.minM?'warn':'ok'}/>
          </div>

          <h2 style={H2}>Invoice build-up — what DNL is billed</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(340px,1fr))',gap:14,marginBottom:14}}>
            <div style={CARD}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                <tbody>
                  {[['Rate per MT',Rs(V.rateMT)],
                    ['Billed MT — outbound (filled)',Nm(V.mtOut)+' MT'],
                    ['Billed MT — return (empty)',Nm(V.mtBack)+' MT'],
                    ['Total billed MT',Nm(m.mtTot)+' MT'],
                    ['Freight revenue (ex-GST)',Rs(m.freight)],
                    ['GST @ '+Pc(V.gstRate)+' (pass-through)',Rs(m.gst)],
                    ['Total invoice value to DNL',Rs(m.invoice)],
                  ].map(([k,v],i)=>(
                    <tr key={k} style={{fontWeight:i===4||i===6?700:400,background:i===4||i===6?'#fdf7f3':''}}>
                      <td style={TD}>{k}</td><td style={TDR}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={NOTE}>GST is collected on BGTS&apos;s behalf and paid to the government. It never enters the margin calculation.</p>
            </div>
            <div style={CARD}>
              <div style={{position:'relative',height:295}}><canvas ref={rCost}></canvas></div>
              <p style={NOTE}>Cost build-up per round trip against {Rs(m.freight)} of freight revenue.</p>
            </div>
          </div>

          <h2 style={H2}>Round-trip cost build-up</h2>
          <div style={{...CARD,marginBottom:14,overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
              <thead><tr>
                <th style={TH}>Component</th>
                <th style={{...TH,textAlign:'right'}}>Owned (Rs)</th>
                <th style={{...TH,textAlign:'right'}}>% of revenue</th>
                <th style={{...TH,textAlign:'right'}}>Outside (Rs)</th>
              </tr></thead>
              <tbody>
                {[
                  ['Fuel',m.fuel,0],['Tyres',m.tyre,0],['Maintenance & spares',m.mnt,0],
                  ['Toll',V.toll,0],['Driver + cleaner',V.driver,0],
                  ['Misc / supervision',V.misc,V.sup],['Market vehicle hire',0,V.hire],
                  ['Fixed absorbed (EMI, insurance, permits)',m.fpt,0],
                ].map(([lbl,ow,out])=>{
                  const fl=lbl==='Fuel'&&m.fuelPc>V.fuelCap
                  return (
                    <tr key={String(lbl)}>
                      <td style={TD}>{lbl}{fl&&<span style={{marginLeft:6,display:'inline-block',padding:'1px 7px',borderRadius:9,fontSize:10.5,fontWeight:700,background:'#fbe6e5',color:BAD}}>ABOVE CAP</span>}</td>
                      <td style={{...TDR,color:fl?BAD:'inherit'}}>{ow?Rs(ow as number):'—'}</td>
                      <td style={{...TDR,color:fl?BAD:'inherit'}}>{ow?Pc((ow as number)/m.freight):'—'}</td>
                      <td style={TDR}>{out?Rs(out as number):'—'}</td>
                    </tr>
                  )
                })}
                <tr style={{fontWeight:700,background:'#fdf7f3'}}>
                  <td style={TD}>TOTAL COST PER ROUND TRIP</td>
                  <td style={TDR}>{Rs(m.ownTotal)}</td>
                  <td style={TDR}>{Pc(m.ownTotal/m.freight)}</td>
                  <td style={TDR}>{Rs(m.outTotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 style={H2}>Rate floor &amp; sanity check</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(340px,1fr))',gap:14,marginBottom:14}}>
            <div style={CARD}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                <thead><tr>
                  <th style={TH}>Benchmark</th>
                  <th style={{...TH,textAlign:'right'}}>Owned</th>
                  <th style={{...TH,textAlign:'right'}}>Outside</th>
                </tr></thead>
                <tbody>
                  {[
                    ['Break-even (0% margin)',m.ownTotal,m.outTotal],
                    ['At BGTS minimum margin ('+Pc(V.minM)+')',m.minOwn,m.minOut],
                    ['At BGTS target margin ('+Pc(V.tgtM)+')',m.tgtOwn,m.tgtOut],
                    ['Agreed freight rate',m.freight,m.freight],
                  ].map(([k,a,b])=>(
                    <tr key={String(k)}><td style={TD}>{k}</td><td style={TDR}>{Rs(a as number)}</td><td style={TDR}>{Rs(b as number)}</td></tr>
                  ))}
                  <tr style={{fontWeight:700}}>
                    <td style={TD}>Headroom above minimum-margin rate</td>
                    <td style={{...TDR,color:OK}}>{Rs(m.freight-m.minOwn)}</td>
                    <td style={{...TDR,color:OK}}>{Rs(m.freight-m.minOut)}</td>
                  </tr>
                </tbody>
              </table>
              <p style={NOTE}>The agreed rate clears the BGTS 12% floor by {Rs(m.freight-m.minOwn)} on an owned vehicle and {Rs(m.freight-m.minOut)} on a hired one. <b>Margin is not the risk on this lane. Volume is.</b></p>
            </div>
            <div style={CARD}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                <thead><tr>
                  <th style={TH}>Sanity check</th>
                  <th style={{...TH,textAlign:'right'}}>Value</th>
                </tr></thead>
                <tbody>
                  {[
                    ['Revenue per km',Nm(m.revKm)+' Rs/km'],
                    ['Cost per km',Nm(m.costKm)+' Rs/km'],
                    ['Margin per km',Nm((m.freight-m.ownTotal)/m.km)+' Rs/km'],
                    ['Market benchmark (modelled)',Nm(V.benchKm)+' Rs/km'],
                    ['Premium over benchmark',Nm(m.prem)+'x'],
                    ['Fuel as % of revenue',Pc(m.fuelPc)],
                  ].map(([k,v],i)=>(
                    <tr key={k}><td style={TD}>{k}</td>
                      <td style={{...TDR,color:i===4&&m.prem>2?WARN:i===5&&m.fuelPc>V.fuelCap?BAD:i===5?OK:'inherit',fontWeight:i===4||i===5?700:400}}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={NOTE}>{m.prem>2
                ?'Revenue per km sits at '+Nm(m.prem)+'x the modelled market benchmark. The rate is confirmed, so either this contract is genuinely premium or a cost input is understated. Treat margin as provisional until actual costs are entered.'
                :'Revenue per km is in a normal band against the modelled benchmark.'}</p>
            </div>
          </div>

          <h2 style={H2}>Load &amp; capacity check</h2>
          <div style={CARD}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
              <thead><tr>
                <th style={TH}>Parameter</th>
                <th style={{...TH,textAlign:'right'}}>Outbound (filled)</th>
                <th style={{...TH,textAlign:'right'}}>Return (empty)</th>
              </tr></thead>
              <tbody>
                {[
                  ['Tonners carried',V.tonners+' nos',V.tonners+' nos'],
                  ['Weight per tonner',V.wFill+' MT',V.wEmpty+' MT'],
                  ['Actual weight',Nm(m.wOut)+' MT',Nm(m.wBack)+' MT'],
                  ['Billed weight',Nm(V.mtOut)+' MT',Nm(V.mtBack)+' MT'],
                  ['Billed less actual',Nm(V.mtOut-m.wOut)+' MT',Nm(V.mtBack-m.wBack)+' MT'],
                  ['Rated payload',V.payload+' MT',V.payload+' MT'],
                  ['Capacity utilisation',Pc(m.payloadUtil),Pc(m.wBack/V.payload)],
                ].map(([k,a,b])=>(
                  <tr key={k}><td style={TD}>{k}</td><td style={TDR}>{a}</td><td style={TDR}>{b}</td></tr>
                ))}
              </tbody>
            </table>
            <p style={NOTE}>
              {m.payloadUtil>0.95&&<><b style={{color:BAD}}>Outbound load is at {Pc(m.payloadUtil)} of rated payload.</b> No margin for tare error or a weighbridge dispute. Confirm whether 20 MT is rated payload or GVW — if GVW, this load is illegal. Escalate. </>}
              You bill {Nm(m.mtTot)} MT against {Nm(m.wOut+m.wBack)} MT actually carried — a favourable {Nm(m.mtTot-m.wOut-m.wBack)} MT. Note the empty return leg <b>is</b> paid at {Nm(V.mtBack)} MT ({Rs(V.mtBack*V.rateMT)}), so there is no unmonetised backhaul on this contract.
            </p>
          </div>
        </div>
      )}

      {/* ═══ TAB: VOLUME & FLEET MIX ═══ */}
      {tab==='vol'&&(
        <div>
          <div style={{borderRadius:5,padding:'11px 13px',fontSize:12.5,marginBottom:16,border:'1px solid #e8c268',background:'#fdf2df'}}>
            <b>DNL&apos;s committed monthly trip count is not confirmed.</b> This is now the single largest open risk on the project — not margin. Enter it below the moment you have it in writing.
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:14,marginBottom:14}}>
            <KPI lab="1st owned vehicle pays above" val={isFinite(m.cross)?Nm(m.cross):'n/a'} fo="trips / month"/>
            <KPI lab="2nd owned vehicle pays above" val={isFinite(m.cross)?Nm(m.tripsMo+m.cross):'n/a'} fo="trips / month"/>
            <KPI lab="3rd owned vehicle pays above" val={isFinite(m.cross)?Nm(2*m.tripsMo+m.cross):'n/a'} fo="trips / month"/>
            <KPI lab="Margin per trip forgone if unserved" val={Rs(m.ownMargin)} fo="every missed trip costs this"/>
          </div>

          <div style={{...CARD,marginBottom:14}}>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:9,alignItems:'end'}}>
              <div style={{display:'flex',flexDirection:'column',gap:3}}>
                <label style={{fontSize:10.5,color:MUT,textTransform:'uppercase',letterSpacing:.4}}>DNL confirmed trips / month</label>
                <input type="number" value={volInput} onChange={e=>setVolInput(parseFloat(e.target.value)||0)}
                  style={{font:'13px inherit',padding:'6px 8px',border:'1px solid #c3ccd8',borderRadius:4,textAlign:'right',fontVariantNumeric:'tabular-nums'}}/>
              </div>
              <div><button onClick={setVol} style={{background:STEEL,color:'#fff',border:0,padding:'8px 15px',borderRadius:4,cursor:'pointer',font:'600 13px inherit'}}>Evaluate</button></div>
            </div>
            {dv<=0
              ?<div style={{...flagCls(true),marginTop:12}}>
                  <div style={{fontWeight:700,fontSize:11,letterSpacing:.6,minWidth:56,paddingTop:1,color:BAD}}>UNKNOWN</div>
                  <div style={{flex:1}}><b style={{display:'block',fontSize:13,marginBottom:2}}>DNL monthly trip count not confirmed</b>
                    <span style={{fontSize:12,color:'#42506a'}}>Until this is in writing, the second owned vehicle cannot be justified. Enter the confirmed figure above to get a fleet recommendation.</span></div>
                </div>
              :(()=>{const x=mixFor(dv,V);const xe=x.allOwn>x.cost&&x.allHire>x.cost;return(
                <div style={{marginTop:12}}>
                  <div style={{...flagCls(false)}}>
                    <div style={{fontWeight:700,fontSize:11,letterSpacing:.6,minWidth:56,paddingTop:1,color:OK}}>PLAN</div>
                    <div style={{flex:1}}><b style={{display:'block',fontSize:13,marginBottom:2}}>At {dv} trips/month: dedicate {x.veh} owned vehicle{x.veh===1?'':'s'}, hire {x.hire} trip{x.hire===1?'':'s'}</b>
                      <span style={{fontSize:12,color:'#42506a'}}>Revenue {Rs(x.rev)} · cost {Rs(x.cost)} · margin <b>{Rs(x.margin)}</b> ({Pc(x.margin/x.rev)}). {xe?'This beats all-owned by '+Rs(x.allOwn-x.cost)+' and all-hired by '+Rs(x.allHire-x.cost)+' per month.':''}</span></div>
                    <div style={{fontVariantNumeric:'tabular-nums',fontWeight:700,fontSize:13,whiteSpace:'nowrap',color:OK}}>{Pc(x.margin/x.rev)}</div>
                  </div>
                  {V.vehicles>x.veh&&<div style={{...flagCls(true)}}>
                    <div style={{fontWeight:700,fontSize:11,letterSpacing:.6,minWidth:56,paddingTop:1,color:BAD}}>RED</div>
                    <div style={{flex:1}}><b style={{display:'block',fontSize:13,marginBottom:2}}>You plan {V.vehicles} dedicated vehicles but only {x.veh} is justified at this volume</b>
                      <span style={{fontSize:12,color:'#42506a'}}>The extra vehicle commits {Rs((V.vehicles-x.veh)*m.fixedMo)}/month of fixed cost against trips that would be cheaper to hire.</span></div>
                  </div>}
                </div>
              )})()
            }
          </div>

          <div style={{...CARD,overflowX:'auto',marginBottom:14}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
              <thead><tr>
                <th style={TH}>Trips/mo</th>
                <th style={{...TH,textAlign:'right'}}>Revenue</th>
                <th style={{...TH,textAlign:'right'}}>All-owned cost</th>
                <th style={{...TH,textAlign:'right'}}>All-hired cost</th>
                <th style={{...TH,textAlign:'center'}}>Mixed: owned veh</th>
                <th style={{...TH,textAlign:'right'}}>Mixed: trips owned</th>
                <th style={{...TH,textAlign:'right'}}>Mixed: trips hired</th>
                <th style={{...TH,textAlign:'right'}}>Mixed cost</th>
                <th style={{...TH,textAlign:'center'}}>Best strategy</th>
                <th style={{...TH,textAlign:'right'}}>Best margin</th>
                <th style={{...TH,textAlign:'right'}}>Margin %</th>
              </tr></thead>
              <tbody>
                {VOLS.map(n=>{const x=mixFor(n,V);const st=x.strategy;return(
                  <tr key={n}>
                    <td style={{...TD,fontWeight:700}}>{n}</td>
                    <td style={TDR}>{Rs(x.rev)}</td>
                    <td style={TDR}>{Rs(x.allOwn)}</td>
                    <td style={TDR}>{Rs(x.allHire)}</td>
                    <td style={{...TD,textAlign:'center'}}>{x.veh}</td>
                    <td style={TDR}>{x.own}</td>
                    <td style={TDR}>{x.hire}</td>
                    <td style={{...TDR,fontWeight:700}}>{Rs(x.cost)}</td>
                    <td style={{...TD,textAlign:'center'}}>{pill(st,st==='MIXED'?'mix':st==='ALL OWNED'?'own':'out')}</td>
                    <td style={{...TDR,color:OK,fontWeight:700}}>{Rs(x.margin)}</td>
                    <td style={TDR}>{Pc(x.margin/x.rev)}</td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>

          <h2 style={H2}>Revenue vs cost across volume</h2>
          <div style={CARD}>
            <div style={{position:'relative',height:330}}><canvas ref={rVol}></canvas></div>
            <p style={NOTE}>Revenue rises in a straight line. Owned cost rises in <b>steps</b> — each new dedicated vehicle adds a full month of fixed cost the day it is committed. Those steps are where money is lost.</p>
          </div>
        </div>
      )}

      {/* ═══ TAB: OWNED vs OUTSIDE ═══ */}
      {tab==='fleet'&&(
        <div>
          <h2 style={H2F}>Utilisation crossover</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(340px,1fr))',gap:14,marginBottom:14}}>
            <div style={CARD}><div style={{position:'relative',height:295}}><canvas ref={rCross}></canvas></div></div>
            <div style={CARD}>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:14,marginBottom:12}}>
                <div>
                  <div style={{fontSize:11,color:MUT,textTransform:'uppercase',letterSpacing:.6}}>Crossover</div>
                  <div style={{fontSize:24,fontWeight:700,margin:'5px 0 2px',fontVariantNumeric:'tabular-nums'}}>{isFinite(m.cross)?Nm(m.cross):'n/a'}</div>
                  <div style={{fontSize:11,color:MUT}}>trips/month/vehicle</div>
                </div>
                <div>
                  <div style={{fontSize:11,color:MUT,textTransform:'uppercase',letterSpacing:.6}}>Gain from owning</div>
                  <div style={{fontSize:24,fontWeight:700,margin:'5px 0 2px',fontVariantNumeric:'tabular-nums'}}>{Rs((m.outTotal-m.ownTotal)*m.tripsMo)}</div>
                  <div style={{fontSize:11,color:MUT}}>per month per vehicle, at plan</div>
                </div>
              </div>
              {(()=>{const head=m.tripsMo-m.cross;return !isFinite(m.cross)
                ?<div style={{...flagCls(true)}}><div style={{fontWeight:700,fontSize:11,color:BAD,letterSpacing:.6,minWidth:56}}>CHECK</div><div style={{flex:1}}><b style={{display:'block',fontSize:13,marginBottom:2}}>Owning never breaks even at these inputs</b><span style={{fontSize:12,color:'#42506a'}}>Verify the market hire rate or your running costs.</span></div></div>
                :<div style={{...flagCls(head>=0)}}><div style={{fontWeight:700,fontSize:11,color:head>=0?OK:BAD,letterSpacing:.6,minWidth:56,paddingTop:1}}>{head>=0?'OWN':'HIRE'}</div><div style={{flex:1}}><b style={{display:'block',fontSize:13,marginBottom:2}}>{head>=0?'A full vehicle clears the crossover':'Planned volume is below the crossover'}</b><span style={{fontSize:12,color:'#42506a'}}>Crossover is {Nm(m.cross)} trips/month; a vehicle at plan runs {Nm(m.tripsMo)}. Headroom {Nm(head)} trips. But note the gain from owning is only {Rs(m.outTotal-m.ownTotal)}/trip against {Rs(m.fixedMo)}/month of committed fixed cost — a small edge for a large commitment.</span></div></div>
              })()}
            </div>
          </div>

          <h2 style={H2}>Cost per trip by monthly utilisation</h2>
          <div style={{...CARD,overflowX:'auto',marginBottom:14}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
              <thead><tr>
                <th style={TH}>Trips/mo</th>
                <th style={{...TH,textAlign:'right'}}>Owned: direct</th>
                <th style={{...TH,textAlign:'right'}}>Owned: fixed absorbed</th>
                <th style={{...TH,textAlign:'right'}}>Owned: total</th>
                <th style={{...TH,textAlign:'right'}}>Outside: total</th>
                <th style={{...TH,textAlign:'right'}}>Owning advantage</th>
                <th style={{...TH,textAlign:'right'}}>Owned margin %</th>
                <th style={{...TH,textAlign:'center'}}>Verdict</th>
              </tr></thead>
              <tbody>
                {crossRows.map(r=>(
                  <tr key={r.n}>
                    <td style={TD}>{r.n}</td>
                    <td style={TDR}>{Rs(r.direct)}</td>
                    <td style={TDR}>{Rs(r.f)}</td>
                    <td style={{...TDR,fontWeight:700}}>{Rs(r.tot)}</td>
                    <td style={TDR}>{Rs(r.out)}</td>
                    <td style={{...TDR,color:r.adv>0?OK:BAD}}>{Rs(r.adv)}</td>
                    <td style={TDR}>{Pc(r.mpc)}</td>
                    <td style={{...TD,textAlign:'center'}}>{pill(r.own?'OWN':'HIRE',r.own?'own':'out')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 style={H2}>Actual fleet mix — from the trip log</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(340px,1fr))',gap:14}}>
            <div style={CARD}><div style={{position:'relative',height:295}}><canvas ref={rMix}></canvas></div></div>
            <div style={CARD}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                <thead><tr>
                  <th style={TH}>Measure</th>
                  <th style={{...TH,textAlign:'right'}}>Owned</th>
                  <th style={{...TH,textAlign:'right'}}>Outside</th>
                  <th style={{...TH,textAlign:'right'}}>Total</th>
                </tr></thead>
                <tbody>
                  {[
                    ['Trips run',a.own,a.hire,a.trips,false],
                    ['Revenue (ex-GST)',a.ownRev,a.hireRev,a.rev,true],
                    ['Cost',a.ownCost,a.hireCost,a.cost,true],
                    ['Margin',a.ownRev-a.ownCost,a.hireRev-a.hireCost,a.margin,true],
                    ['KM run',a.ownKm,a.hireKm,a.km,false],
                  ].map(([l,ow,hi,tot,isMny])=>(
                    <tr key={String(l)}><td style={TD}>{l}</td>
                      <td style={TDR}>{isMny?Rs(ow as number):Nm(ow as number)}</td>
                      <td style={TDR}>{isMny?Rs(hi as number):Nm(hi as number)}</td>
                      <td style={{...TDR,fontWeight:700}}>{isMny?Rs(tot as number):Nm(tot as number)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td style={TD}>Margin %</td>
                    <td style={TDR}>{a.ownRev?Pc((a.ownRev-a.ownCost)/a.ownRev):'—'}</td>
                    <td style={TDR}>{a.hireRev?Pc((a.hireRev-a.hireCost)/a.hireRev):'—'}</td>
                    <td style={{...TDR,fontWeight:700}}>{a.rev?Pc(a.marginPc):'—'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TAB: DAILY TRIP LOG ═══ */}
      {tab==='log'&&(
        <div>
          <h2 style={H2F}>Log a round trip</h2>
          <div style={{...CARD,marginBottom:14}}>
            {/* Type toggle */}
            <div style={{display:'flex',gap:0,marginBottom:14,border:'1px solid #e8ddd6',borderRadius:5,overflow:'hidden',maxWidth:340}}>
              {(['Owned','Hired'] as const).map(t=>(
                <button key={t} onClick={()=>setTripType(t)}
                  style={{flex:1,background:tripType===t?(t==='Owned'?'#1f6b3a':'#8a4b00'):'#fff',
                    border:0,padding:'10px 8px',font:'700 11.5px inherit',letterSpacing:.5,
                    color:tripType===t?'#fff':MUT,cursor:'pointer',borderRight:'1px solid #e8ddd6'}}>
                  {t.toUpperCase()} VEHICLE
                </button>
              ))}
            </div>

            {/* Trip details */}
            <div style={{border:'1px solid #e8ddd6',borderRadius:5,padding:12,marginBottom:10,background:'#fcfdfe'}}>
              <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:.5,color:NAVY,marginBottom:9}}>Trip details</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(112px,1fr))',gap:9,alignItems:'end'}}>
                {[
                  {l:'Date',k:'date',type:'date'},{l:'Vehicle No',k:'veh',type:'text'},
                  {l:'Tonners out',k:'out',type:'number'},{l:'Empties back',k:'back',type:'number'},
                  {l:'KM run',k:'km',type:'number'},{l:'Detention hrs',k:'det',type:'number'},
                ].map(f=>(
                  <div key={f.k} style={{display:'flex',flexDirection:'column',gap:3}}>
                    <label style={{fontSize:10.5,color:MUT,textTransform:'uppercase',letterSpacing:.4}}>{f.l}</label>
                    <input type={f.type} value={(fd as Record<string,string|number>)[f.k]} placeholder={f.k==='veh'?'GJ-06-XX-0001':''}
                      onChange={e=>sf(f.k,f.type==='number'?parseFloat(e.target.value)||0:e.target.value)}
                      style={{font:'13px inherit',padding:'6px 8px',border:'1px solid #c3ccd8',borderRadius:4,width:'100%',
                        textAlign:f.type==='number'?'right':'left',fontVariantNumeric:'tabular-nums'}}/>
                  </div>
                ))}
                <div style={{display:'flex',flexDirection:'column',gap:3}}>
                  <label style={{fontSize:10.5,color:MUT,textTransform:'uppercase',letterSpacing:.4}}>Pickup</label>
                  <select value={fd.pick} onChange={e=>sf('pick',e.target.value)}
                    style={{font:'13px inherit',padding:'6px 8px',border:'1px solid #c3ccd8',borderRadius:4}}>
                    <option>SSPL + Amol</option><option>SSPL only</option><option>Amol only</option>
                  </select>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:3}}>
                  <label style={{fontSize:10.5,color:MUT,textTransform:'uppercase',letterSpacing:.4}}>POD recd</label>
                  <select value={fd.pod} onChange={e=>sf('pod',e.target.value)}
                    style={{font:'13px inherit',padding:'6px 8px',border:'1px solid #c3ccd8',borderRadius:4}}>
                    <option>Y</option><option>N</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Owned fields */}
            {tripType==='Owned'&&(
              <div style={{border:'1px solid #e8ddd6',borderLeft:'4px solid #1f6b3a',borderRadius:5,padding:12,marginBottom:10,background:'#f4faf6'}}>
                <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:.5,color:NAVY,marginBottom:9}}>Owned vehicle cost — BGTS pays these directly</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(112px,1fr))',gap:9,alignItems:'end'}}>
                  {[{l:'Diesel ltrs',k:'dl'},{l:'Toll (Rs)',k:'toll'},{l:'Driver + cleaner (Rs)',k:'drv'}].map(f=>(
                    <div key={f.k} style={{display:'flex',flexDirection:'column',gap:3}}>
                      <label style={{fontSize:10.5,color:MUT,textTransform:'uppercase',letterSpacing:.4}}>{f.l}</label>
                      <input type="number" value={(fd as unknown as Record<string,number>)[f.k]}
                        onChange={e=>sf(f.k,parseFloat(e.target.value)||0)}
                        style={{font:'13px inherit',padding:'6px 8px',border:'1px solid #c3ccd8',borderRadius:4,textAlign:'right',fontVariantNumeric:'tabular-nums'}}/>
                    </div>
                  ))}
                  <div style={{display:'flex',flexDirection:'column',gap:3,justifyContent:'flex-end'}}>
                    <label style={{fontSize:10.5,color:MUT,textTransform:'uppercase',letterSpacing:.4}}>Auto-added</label>
                    <span style={{fontSize:11.5,color:MUT,fontVariantNumeric:'tabular-nums',padding:'6px 0'}}>
                      tyre+maint {Rs((fd.km||0)*(V.tyre+V.maint))} · fixed {Rs(m.fpt)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Hired fields */}
            {tripType==='Hired'&&(
              <div style={{border:'1px solid #e8ddd6',borderLeft:'4px solid #8a4b00',borderRadius:5,padding:12,marginBottom:10,background:'#fffaf3'}}>
                <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:.5,color:NAVY,marginBottom:9}}>Hired vehicle cost — the vendor bears fuel, toll and driver inside the hire rate</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(112px,1fr))',gap:9,alignItems:'end'}}>
                  {[{l:'Vendor name',k:'vendor',type:'text'},{l:'Hire rate agreed (Rs)',k:'hire',type:'number'},
                    {l:'Advance paid (Rs)',k:'adv',type:'number'},{l:'Extra paid to vendor',k:'extra',type:'number'}].map(f=>(
                    <div key={f.k} style={{display:'flex',flexDirection:'column',gap:3}}>
                      <label style={{fontSize:10.5,color:MUT,textTransform:'uppercase',letterSpacing:.4}}>{f.l}</label>
                      <input type={f.type||'text'} value={(fd as Record<string,string|number>)[f.k]} placeholder={f.k==='vendor'?'Shreeji Transport':''}
                        onChange={e=>sf(f.k,f.type==='number'?parseFloat(e.target.value)||0:e.target.value)}
                        style={{font:'13px inherit',padding:'6px 8px',border:'1px solid #c3ccd8',borderRadius:4,
                          textAlign:f.type==='number'?'right':'left',fontVariantNumeric:'tabular-nums'}}/>
                    </div>
                  ))}
                  <div style={{display:'flex',flexDirection:'column',gap:3}}>
                    <label style={{fontSize:10.5,color:MUT,textTransform:'uppercase',letterSpacing:.4}}>Vendor bill recd</label>
                    <select value={fd.vbill} onChange={e=>sf('vbill',e.target.value)}
                      style={{font:'13px inherit',padding:'6px 8px',border:'1px solid #c3ccd8',borderRadius:4}}>
                      <option>N</option><option>Y</option>
                    </select>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:3,justifyContent:'flex-end'}}>
                    <label style={{fontSize:10.5,color:MUT,textTransform:'uppercase',letterSpacing:.4}}>Auto-added</label>
                    <span style={{fontSize:11.5,color:MUT,fontVariantNumeric:'tabular-nums',padding:'6px 0'}}>
                      supervision {Rs(V.sup)} · balance {Rs((fd.hire||0)-(fd.adv||0))}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div style={{display:'flex',gap:10,alignItems:'center',marginTop:12}}>
              <button onClick={addTrip} style={{background:STEEL,color:'#fff',border:0,padding:'8px 15px',borderRadius:4,cursor:'pointer',font:'600 13px inherit'}}>Add trip</button>
              <span style={{fontSize:11.5,color:MUT}}>This trip: cost <b>{Rs(preview.c)}</b> · revenue <b>{Rs(preview.r)}</b> · margin <b style={{color:preview.m<0?BAD:OK}}>{Rs(preview.m)}</b> ({preview.r?Pc(preview.m/preview.r):'—'})</span>
            </div>
            <p style={NOTE}><b>Why the form switches:</b> on a hired trip the vendor already pays diesel, toll and driver inside the hire rate. Entering them again would double-count the cost and understate hired margin. Only the fields BGTS actually pays are shown for each vehicle type.</p>
          </div>

          <h2 style={H2}>Month to date</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:14,marginBottom:14}}>
            <KPI lab="Trips completed" val={String(a.trips)} fo={'capacity '+Nm(m.capacity)+' · utilisation '+(m.capacity?Pc(a.util):'—')}/>
            <KPI lab="Revenue (ex-GST)" val={a.trips?Rs(a.rev):'—'} fo={'GST '+Rs(a.gst)+' · invoiced '+Rs(a.rev+a.gst)}/>
            <KPI lab="Gross margin" val={a.trips?Rs(a.margin):'—'} fo={a.trips?Pc(a.marginPc)+' · fuel '+Pc(a.fuelPc)+' of revenue':'no trips logged'}
              cls={!a.trips?undefined:a.margin<=0?'bad':a.marginPc<V.minM?'warn':'ok'}/>
            <KPI lab="Tonner variance" val={String(a.variance)} fo="DNL asset in BGTS custody" cls={a.variance?'bad':'ok'}/>
          </div>

          <h2 style={H2}>
            Trip register
            <button onClick={exportCSV} style={{float:'right',background:'#fff',color:STEEL,border:'1px solid '+STEEL,padding:'5px 11px',borderRadius:4,cursor:'pointer',font:'600 12px inherit'}}>Export CSV</button>
          </h2>
          <div style={{...CARD,overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
              <thead><tr>
                {['Date','Vehicle','Type','Vendor','Out','Back','Var','KM','km/l',
                  'Owned cost','Hired cost','Total cost','Revenue','GST','Invoice',
                  'Margin','Mgn%','POD','Bill',''].map(h=>(
                  <th key={h} style={{...TH,textAlign:['Out','Back','Var','KM','km/l','Owned cost','Hired cost','Total cost','Revenue','GST','Invoice','Margin','Mgn%'].includes(h)?'right':'left'}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {trips.length===0
                  ?<tr><td colSpan={20} style={{textAlign:'center',padding:26,color:MUT,fontSize:13}}>No trips logged yet. Pick OWNED or HIRED above and add your first round trip.</td></tr>
                  :trips.map((t,i)=>{
                    const oc=ownedCost(t,V),hc=hiredCost(t,V),c=oc+hc,r=tripRev(t,V)
                    const g=r*V.gstRate,mg=r-c,vr=(t.out||0)-(t.back||0)
                    const kml=t.type==='Owned'&&t.dl?Nm(t.km/t.dl):'—'
                    return(
                      <tr key={i} style={{background:i%2===0?'#fff':'#fafbfd'}}>
                        <td style={TD}>{t.date}</td>
                        <td style={TD}>{t.veh}</td>
                        <td style={TD}>{pill(t.type,t.type==='Owned'?'own':'out')}</td>
                        <td style={TD}>{t.type==='Hired'?(t.vendor||<span style={{color:BAD}}>unnamed</span>):'—'}</td>
                        <td style={TDR}>{t.out||0}</td>
                        <td style={TDR}>{t.back||0}</td>
                        <td style={{...TDR,color:vr?BAD:'inherit'}}>{vr}</td>
                        <td style={TDR}>{t.km||0}</td>
                        <td style={TDR}>{kml}</td>
                        <td style={TDR}>{oc?Rs(oc):'—'}</td>
                        <td style={TDR}>{hc?Rs(hc):'—'}</td>
                        <td style={{...TDR,fontWeight:700}}>{Rs(c)}</td>
                        <td style={TDR}>{Rs(r)}</td>
                        <td style={TDR}>{Rs(g)}</td>
                        <td style={TDR}>{Rs(r+g)}</td>
                        <td style={{...TDR,color:mg<0?BAD:OK}}>{Rs(mg)}</td>
                        <td style={TDR}>{r?Pc(mg/r):'—'}</td>
                        <td style={TD}>{t.pod==='Y'?'✓':<span style={{color:BAD}}>✗</span>}</td>
                        <td style={TD}>{t.type==='Hired'?(t.vbill==='Y'?'✓':<span style={{color:BAD}}>✗</span>):'—'}</td>
                        <td style={TD}><button onClick={()=>delTrip(i)} style={{background:'none',border:0,color:BAD,cursor:'pointer',fontSize:15}}>×</button></td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ TAB: VENDORS & HIRE ═══ */}
      {tab==='vendors'&&(
        <div>
          <div style={{borderRadius:5,padding:'11px 13px',fontSize:12.5,marginBottom:16,border:'1px solid #e8c268',background:'#fdf2df'}}>
            A hired vehicle is not free of risk just because no EMI appears. It carries <b>rate drift</b>, <b>vendor dependency</b>, and <b>cash and ITC exposure</b> through unbilled hires. This desk tracks all three.
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:14,marginBottom:14}}>
            <KPI lab="Hire spend" val={Rs(a.totalHireSpend)} fo={a.hire+' hired trip'+(a.hire===1?'':'s')+' · '+a.vendorList.length+' vendor'+(a.vendorList.length===1?'':'s')}/>
            <KPI lab="Avg hire / trip" val={a.hire?Rs(a.avgHire):'—'}
              fo={a.hire?(a.avgHire-m.ownTotal>0?Rs(a.avgHire-m.ownTotal)+' above':Rs(-(a.avgHire-m.ownTotal))+' below')+' owned cost/trip':'no hired trips yet'}/>
            <KPI lab="Balance payable" val={Rs(a.balance)} fo="outstanding vendor liability"/>
            <KPI lab="Top vendor dependency" val={a.vendorList.length?Pc(a.topDep):'—'} fo="BGTS trigger: 40%" cls={a.topDep>0.4?'bad':'ok'}/>
          </div>

          <h2 style={H2}>Vendor register</h2>
          <div style={{...CARD,overflowX:'auto',marginBottom:14}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
              <thead><tr>
                <th style={TH}>Vendor</th>
                <th style={{...TH,textAlign:'right'}}>Trips</th>
                <th style={{...TH,textAlign:'right'}}>Hire paid</th>
                <th style={{...TH,textAlign:'right'}}>Extra paid</th>
                <th style={{...TH,textAlign:'right'}}>Total paid</th>
                <th style={{...TH,textAlign:'right'}}>Avg / trip</th>
                <th style={{...TH,textAlign:'right'}}>Advance</th>
                <th style={{...TH,textAlign:'right'}}>Balance payable</th>
                <th style={{...TH,textAlign:'right'}}>Bill compliance</th>
                <th style={{...TH,textAlign:'right'}}>Share of spend</th>
                <th style={{...TH,textAlign:'center'}}>Status</th>
              </tr></thead>
              <tbody>
                {a.vendorList.length===0
                  ?<tr><td colSpan={11} style={{textAlign:'center',padding:26,color:MUT,fontSize:13}}>No hired trips logged yet. Log a trip with the HIRED VEHICLE tab to populate this register.</td></tr>
                  :a.vendorList.map((v,i)=>(
                    <tr key={v.name} style={{background:i%2===0?'#fff':'#fafbfd'}}>
                      <td style={{...TD,fontWeight:700}}>{v.name}</td>
                      <td style={TDR}>{v.trips}</td>
                      <td style={TDR}>{Rs(v.hire)}</td>
                      <td style={TDR}>{Rs(v.extra)}</td>
                      <td style={{...TDR,fontWeight:700}}>{Rs(v.total)}</td>
                      <td style={TDR}>{Rs(v.avg)}</td>
                      <td style={TDR}>{Rs(v.adv)}</td>
                      <td style={{...TDR,color:v.bal>0?WARN:'inherit'}}>{Rs(v.bal)}</td>
                      <td style={{...TDR,color:v.billPc<1?BAD:'inherit'}}>{Pc(v.billPc)}</td>
                      <td style={TDR}>{Pc(v.share)}</td>
                      <td style={{...TD,textAlign:'center'}}>{pill(v.share>0.4?'DEPENDENCY':'OK',v.share>0.4?'out':'mix')}</td>
                    </tr>
                  ))
                }
                {a.vendorList.length>0&&(
                  <tr style={{fontWeight:700,background:'#fdf7f3'}}>
                    <td style={TD}>TOTAL</td>
                    <td style={TDR}>{a.hire}</td>
                    <td style={TDR}>{Rs(a.hirePaid)}</td>
                    <td style={TDR}>{Rs(a.extraPaid)}</td>
                    <td style={TDR}>{Rs(a.totalHireSpend)}</td>
                    <td style={TDR}>{Rs(a.avgHire)}</td>
                    <td style={TDR}>{Rs(a.advance)}</td>
                    <td style={TDR}>{Rs(a.balance)}</td>
                    <td style={TDR}>{Pc(a.billPc)}</td>
                    <td style={TDR}>100.0%</td>
                    <td></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <h2 style={H2}>Owned vs hired — settled on your actual logged trips</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(340px,1fr))',gap:14}}>
            <div style={CARD}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                <thead><tr>
                  <th style={TH}>Measure</th>
                  <th style={{...TH,textAlign:'right'}}>Owned</th>
                  <th style={{...TH,textAlign:'right'}}>Hired</th>
                </tr></thead>
                <tbody>
                  {[
                    ['Trips logged',a.own,a.hire,'n'],
                    ['Cost per trip',a.own?a.ownCost/a.own:0,a.hire?a.hireCost/a.hire:0,'r'],
                    ['Margin per trip',a.ownMarginPt,a.hireMarginPt,'r'],
                    ['Margin %',a.ownRev?(a.ownRev-a.ownCost)/a.ownRev:0,a.hireRev?(a.hireRev-a.hireCost)/a.hireRev:0,'p'],
                    ['Total margin',a.ownRev-a.ownCost,a.hireRev-a.hireCost,'r'],
                  ].map(([l,ow,hi,t])=>(
                    <tr key={String(l)}>
                      <td style={TD}>{l}</td>
                      <td style={TDR}>{t==='p'?Pc(ow as number):t==='r'?Rs(ow as number):Nm(ow as number)}</td>
                      <td style={TDR}>{t==='p'?Pc(hi as number):t==='r'?Rs(hi as number):Nm(hi as number)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={NOTE}>{(a.own&&a.hire)
                ?(a.edge!==null&&a.edge>0
                  ?<><b style={{color:OK}}>Owned vehicles are earning their fixed cost.</b> On your actual logged trips an owned vehicle returns {Rs(a.edge)} more margin per trip than a hired one. Across a 26-trip month that is {Rs(a.edge*26)}. Keep the dedication.</>
                  :<><b style={{color:BAD}}>Owned vehicles are NOT earning their fixed cost.</b> On actuals a hired vehicle returns {Rs(-(a.edge??0))} more margin per trip. Either utilisation is too low or your hire rates are better than your running cost. Shift trips to market vehicles and re-examine the dedication.</>)
                :'Log trips on both owned and hired vehicles to settle the own-vs-hire question on actuals rather than assumptions. Everything on the Owned vs Outside tab is theory until this table has data on both sides.'
              }</p>
            </div>
            <div style={CARD}>
              <div style={{position:'relative',height:295}}><canvas ref={rVend}></canvas></div>
              <p style={NOTE}>Hire spend by vendor. Concentration here is a pricing risk: the vendor who knows they are your only cover will price accordingly the day a truck breaks down.</p>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TAB: RISK FLAGS ═══ */}
      {tab==='flags'&&(
        <div>
          <h2 style={H2F}>BGTS standing risk triggers — live</h2>
          <div style={CARD}>
            {FLAGS.map(([l,val,thresh,bad,msg],i)=>(
              <div key={i} style={{...flagCls(bad),marginBottom:i<FLAGS.length-1?8:0}}>
                <div style={{fontWeight:700,fontSize:11,letterSpacing:.6,minWidth:56,paddingTop:1,color:bad?BAD:OK}}>{bad?'RED':'OK'}</div>
                <div style={{flex:1}}>
                  <b style={{display:'block',fontSize:13,marginBottom:2}}>{l}</b>
                  <span style={{fontSize:12,color:'#42506a'}}>{bad?msg:'Within BGTS threshold ('+thresh+').'}</span>
                </div>
                <div style={{fontVariantNumeric:'tabular-nums',fontWeight:700,fontSize:13,whiteSpace:'nowrap'}}>{String(val)}</div>
              </div>
            ))}
          </div>

          <h2 style={H2}>Contract items to secure with DNL</h2>
          <div style={CARD}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
              <thead><tr>
                <th style={TH}>Clause</th>
                <th style={TH}>Why it matters on this lane</th>
                <th style={{...TH,textAlign:'center'}}>Priority</th>
              </tr></thead>
              <tbody>
                {CLAUSES.map(([clause,why,pri],i)=>(
                  <tr key={i} style={{background:i%2===0?'#fff':'#fafbfd'}}>
                    <td style={{...TD,fontWeight:700}} dangerouslySetInnerHTML={{__html:clause}}/>
                    <td style={TD}>{why}</td>
                    <td style={{...TD,textAlign:'center'}}>{pri}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ TAB: INPUTS ═══ */}
      {tab==='inputs'&&(
        <div>
          <div style={{borderRadius:5,padding:'11px 13px',fontSize:12.5,marginBottom:16,border:'1px solid #8fc9a9',background:'#e3f4ea'}}>
            <b>Revenue terms below are CONFIRMED</b> (Director, 20 Jul 2026): Rs 1,346.50/MT, 20 MT filled + 8 MT empty, 18% GST as vehicle hire with ITC.
          </div>
          <div style={{borderRadius:5,padding:'11px 13px',fontSize:12.5,marginBottom:16,border:'1px solid #e8c268',background:'#fdf2df'}}>
            <b>All COST inputs remain placeholders.</b> Gujarat-market benchmarks for a 20 MT multi-axle — modelled estimates, not BGTS actuals. Replace each before relying on the margin figures.
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(340px,1fr))',gap:14}}>
            {[
              {id:'in_rev',title:'Revenue — confirmed',hero:true},
              {id:'in_route',title:'Route & load'},
              {id:'in_run',title:'Owned vehicle — running cost'},
              {id:'in_fix',title:'Owned vehicle — fixed monthly'},
              {id:'in_ops',title:'Operating plan'},
              {id:'in_out',title:'Outside vehicle & policy'},
            ].map(({id,title,hero})=>(
              <div key={id} style={{...CARD,background:hero?'#f0fdf4':'#fff',border:hero?'1px solid #86efac':'1px solid #e8ddd6'}}>
                <h2 style={H2F}>{title}</h2>
                {GROUPS[id].map(([k,lab,hint])=>(
                  <div key={k} style={{display:'grid',gridTemplateColumns:'1fr 108px',gap:8,alignItems:'center',padding:'5px 0',borderBottom:'1px solid #f0f2f5'}}>
                    <label style={{fontSize:12.5}}>
                      {lab}
                      <small style={{display:'block',color:MUT,fontSize:10.5}}>{hint}</small>
                    </label>
                    <input type="number" step="any" value={V[k as keyof DnlV]}
                      onChange={e=>updateV(k as keyof DnlV, parseFloat(e.target.value)||0)}
                      style={{font:'13px inherit',padding:'6px 8px',border:'1px solid #c3ccd8',borderRadius:4,
                        textAlign:'right',fontVariantNumeric:'tabular-nums',
                        background:hero?'#e3f4ea':'#fff',fontWeight:hero?700:400}}/>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{marginTop:14,display:'flex',gap:9}}>
            <button onClick={saveInputs} style={{background:STEEL,color:'#fff',border:0,padding:'8px 15px',borderRadius:4,cursor:'pointer',font:'600 13px inherit'}}>Save inputs</button>
            <button onClick={resetInputs} style={{background:'#fff',color:STEEL,border:'1px solid '+STEEL,padding:'8px 15px',borderRadius:4,cursor:'pointer',font:'600 13px inherit'}}>Reset to defaults</button>
          </div>
        </div>
      )}

      </div>
    </div>
  )
}
