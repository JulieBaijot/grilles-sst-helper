// @ts-nocheck
import { useState, useEffect, useCallback, useRef, memo, Fragment } from "react"
import { Check, ArrowLeft, Printer, RefreshCw, Save } from "lucide-react"

const SECTIONS = [
  { id:'prev', title:'Prévention', items:[
    { id:'prv1', text:"A su repérer une situation dangereuse" },
    { id:'prv2', text:"A su faire une remontée d'information factuelle en respectant les procédures de l'entreprise" },
    { id:'prv3', text:"A su proposer une mesure immédiate et 2 actions de prévention" },
  ]},
  { id:'prot', title:'Protéger', items:[
    { id:'prt1', text:"A su mettre en œuvre une action de protection adaptée à la situation" },
    { id:'prt2', text:"A su effectuer un dégagement d'urgence par traction de la victime" },
    { id:'prt3', text:"Identifier les signaux d'alerte aux populations" },
  ]},
  { id:'exam', title:'Examiner', items:[
    { id:'exm1', text:"A su conduire le bilan de la victime dans le bon ordre (conscience → VVA → respiration)" },
    { id:'exm2', text:"A su identifier la présence d'une urgence vitale" },
  ]},
  { id:'alt', title:'Faire alerter', items:[
    { id:'alt1', text:"A su délivrer un message complet assurant l'arrivée des secours au plus près" },
  ]},
  { id:'sec', title:'Secourir', items:[
    { id:'sec1', text:"A fait tous les apprentissages" },
  ]},
]

const CC_ITEMS = [
  { id:'cr1',  text:"A repéré le(s) danger(s) persistant(s)" },
  { id:'cr2',  text:"A su protéger" },
  { id:'cr3',  text:"A su examiner" },
  { id:'cr4',  text:"A su choisir une action de secours adaptée" },
  { id:'cr5',  text:"Exactitude du geste" },
  { id:'cr6',  text:"Transmet le message d'alerte" },
  { id:'cr7',  text:"Donne les consignes au témoin" },
  { id:'cr8',  text:"Surveille la victime" },
  { id:'cr9',  text:"A partir de la SD initiale, explicite le MAD" },
  { id:'cr10', text:"Propose une action pour supprimer / réduire le risque" },
  { id:'cr11', text:"Hiérarchise la meilleure solution" },
]

const ALL_IDS = SECTIONS.flatMap(s => s.items.map(i => i.id))
const CC_IDS  = CC_ITEMS.map(i => i.id)
const E3_LBL  = { acquis:'Acquis', en_cours:'En cours', non_acquis:'Non acquis' }

function mkStudent(sid, n) {
  return {
    id:sid, nom:'', prenom:'', entreprise:'',
    note_role:'', note_juridique:'',
    _n: n,
    items: Object.fromEntries(ALL_IDS.map(k=>[k,{v:null,c:''}])),
    cc1_s:'', cc2_s:'',
    cc1: Object.fromEntries(CC_IDS.map(k=>[k,null])),
    cc2: Object.fromEntries(CC_IDS.map(k=>[k,null])),
  }
}
function mkSession(){ return { date:new Date().toISOString().split('T')[0], trainer:'', modalite:'FI' } }

function tabLabel(s){ return [s.nom,s.prenom].filter(Boolean).join(' ') || `Stagiaire ${s._n}` }

// ─── Styles module-level (référence stable pour React.memo) ───────────────
const CBOX_COLORS = {
  success:{ bg:'#C8E6C9', border:'#66BB6A', check:'#1B5E20' },
  warning:{ bg:'#FFE0B2', border:'#FFA726', check:'#E65100' },
  danger: { bg:'#FFCDD2', border:'#EF5350', check:'#B71C1C' },
}
const TD_TXT = { padding:'6px 10px', fontSize:12, color:'#1A1A2E', borderBottom:'0.5px solid #E5E7EB', verticalAlign:'middle', lineHeight:1.4 }
const TD_CTR = { ...TD_TXT, textAlign:'center', width:38 }
const TD_TXT_COMMENT = { ...TD_TXT, padding:'4px 8px' }
const TD_CTR_LEFT = { ...TD_CTR, borderLeft:'0.5px solid #E5E7EB' }
const TD_CTR_NOLEFT = { ...TD_CTR, borderLeft:'none' }
const COMMENT_INPUT_STYLE = { width:'100%', fontSize:11, padding:'2px 5px', boxSizing:'border-box' }
const NOTE_INPUT_STYLE = { width:32, textAlign:'center', fontSize:12, padding:'2px 4px' }

// ─── Checkbox carré coloré ────────────────────────────────────────────────
const CBox = memo(function CBox({ on, sem, onClick }){
  const c = CBOX_COLORS[sem]
  return (
    <div onClick={onClick} style={{
      width:20, height:20, borderRadius:4, margin:'0 auto', flexShrink:0,
      border:`2px solid ${on ? c.border : '#D1D5DB'}`,
      background: on ? c.bg : '#FFFFFF',
      cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
    }}>
      {on && <Check size={11} color={c.check}/>}
    </div>
  )
})

// ─── Ligne d'item (mémoïsée) ──────────────────────────────────────────────
const Row = memo(function Row({ item, value, comment, idx, onSetV, onSetC }){
  const bg = idx%2===0?'#F8F9FC':'#FFFFFF'
  return (
    <tr style={{background:bg}}>
      <td style={TD_TXT}>{item.text}</td>
      <td style={TD_CTR}><CBox on={value==='acquis'}     sem="success" onClick={()=>onSetV(item.id, value==='acquis'?null:'acquis')}/></td>
      <td style={TD_CTR}><CBox on={value==='en_cours'}   sem="warning" onClick={()=>onSetV(item.id, value==='en_cours'?null:'en_cours')}/></td>
      <td style={TD_CTR}><CBox on={value==='non_acquis'} sem="danger"  onClick={()=>onSetV(item.id, value==='non_acquis'?null:'non_acquis')}/></td>
      <td style={TD_TXT_COMMENT}>
        <input value={comment} onChange={e=>onSetC(item.id, e.target.value)} placeholder="Commentaire..." style={COMMENT_INPUT_STYLE}/>
      </td>
    </tr>
  )
})

// ─── Ligne CC (mémoïsée) ──────────────────────────────────────────────────
const CC_VALS = [['acquis','success'],['en_cours','warning'],['non_acquis','danger']]
const CCRow = memo(function CCRow({ item, cc1Val, cc2Val, idx, onSetCC }){
  const bg = idx%2===0?'#F8F9FC':'#FFFFFF'
  return (
    <tr style={{background:bg}}>
      <td style={TD_TXT}>{item.text}</td>
      {['cc1','cc2'].map(cc=>{
        const cur = cc==='cc1'?cc1Val:cc2Val
        return (
          <Fragment key={cc}>
            {CC_VALS.map(([val,sem])=>(
              <td key={val} style={val==='acquis'?TD_CTR_LEFT:TD_CTR_NOLEFT}>
                <CBox on={cur===val} sem={sem} onClick={()=>onSetCC(cc, item.id, cur===val?null:val)}/>
              </td>
            ))}
          </Fragment>
        )
      })}
    </tr>
  )
})

// ─── Note input (mémoïsé pour Rôle/Juridique) ─────────────────────────────
const NoteRow = memo(function NoteRow({ field, label, value, idx, onSetField }){
  return (
    <tr style={{background:idx%2===0?'#F8F9FC':'#FFFFFF'}}>
      <td style={TD_TXT}>{label}</td>
      <td style={{...TD_CTR, width:70}}>
        <input value={value} onChange={e=>onSetField(field, e.target.value)} placeholder="—" style={NOTE_INPUT_STYLE}/>
        <span style={{fontSize:10,color:'#6B7280'}}> /5</span>
      </td>
    </tr>
  )
})

// ─── Grille (stable callbacks par student) ────────────────────────────────
function Grille({ student, setStudents }){
  const id = student.id

  const onSetV = useCallback((itemId, val) => {
    setStudents(p => p.map(s => s.id===id ? {...s, items:{...s.items, [itemId]:{...s.items[itemId], v: val}}} : s))
  }, [id, setStudents])

  const onSetC = useCallback((itemId, c) => {
    setStudents(p => p.map(s => s.id===id ? {...s, items:{...s.items, [itemId]:{...s.items[itemId], c}}} : s))
  }, [id, setStudents])

  const onSetCC = useCallback((cc, itemId, val) => {
    setStudents(p => p.map(s => s.id===id ? {...s, [cc]:{...s[cc], [itemId]: val}} : s))
  }, [id, setStudents])

  const onSetField = useCallback((field, val) => {
    setStudents(p => p.map(s => s.id===id ? {...s, [field]: val} : s))
  }, [id, setStudents])

  const th = (label, w, center) => (
    <th style={{
      background:'#185FA5', color:'#E6F1FB', padding:'5px 8px',
      fontSize:10, fontWeight:500, textTransform:'uppercase', letterSpacing:0.3,
      textAlign: center?'center':'left', width:w, whiteSpace:'nowrap',
    }}>{label}</th>
  )
  const secTh = (label, cols, bg) => (
    <tr>
      <td colSpan={cols} style={{
        background: bg||'#6B8EC0', color:'#E6F1FB',
        padding:'5px 10px', fontSize:10, fontWeight:500,
        textTransform:'uppercase', letterSpacing:0.3,
      }}>{label}</td>
    </tr>
  )

  return (
    <div style={{display:'flex',flexDirection:'column',gap:10}}>

      {/* ── Évaluations théoriques ── */}
      <div style={{border:'0.5px solid #E5E7EB',borderRadius:'8px',overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr>
            {th('Évaluations théoriques — questionnaires','',false)}
            {th('Note /5',70,true)}
          </tr></thead>
          <tbody>
            <NoteRow field="note_role"      label="Rôle du SST"     value={student.note_role}      idx={0} onSetField={onSetField}/>
            <NoteRow field="note_juridique" label="Cadre juridique" value={student.note_juridique} idx={1} onSetField={onSetField}/>
          </tbody>
        </table>
      </div>

      {/* ── Compétences ── */}
      <div style={{border:'0.5px solid #E5E7EB',borderRadius:'8px',overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr>
            {th('Compétence','',false)}
            {th('Acquis',38,true)}
            {th('En cours',46,true)}
            {th('Non acquis',54,true)}
            {th('Commentaire',110,false)}
          </tr></thead>
          <tbody>
            {SECTIONS.map(sec=>(
              <Fragment key={sec.id}>
                {secTh(sec.title, 5)}
                {sec.items.map((item,idx)=>{
                  const d = student.items[item.id]||{v:null,c:''}
                  return (
                    <Row key={item.id} item={item} value={d.v} comment={d.c} idx={idx} onSetV={onSetV} onSetC={onSetC}/>
                  )
                })}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Mise en situation CC ── */}
      <div style={{border:'0.5px solid #E5E7EB',borderRadius:'8px',overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr>
              <th style={{background:'#185FA5',color:'#E6F1FB',padding:'5px 10px',fontSize:10,fontWeight:500,textTransform:'uppercase',letterSpacing:0.3,textAlign:'left'}} rowSpan={2}>
                Mise en situation d'accident simulé
              </th>
              {['cc1','cc2'].map(cc=>(
                <th key={cc} colSpan={3} style={{background:'#6B8EC0',color:'#E6F1FB',padding:'4px 8px',fontSize:10,fontWeight:500,textTransform:'uppercase',letterSpacing:0.3,textAlign:'center',borderLeft:'0.5px solid #8AAED0'}}>
                  {cc==='cc1'?'CC 1':'CC 2'}
                  <input value={student[cc==='cc1'?'cc1_s':'cc2_s']||''} onChange={e=>onSetField(cc==='cc1'?'cc1_s':'cc2_s', e.target.value)}
                    placeholder="S1–S8" style={{marginLeft:6,fontSize:10,padding:'1px 4px',width:60,borderRadius:3,border:'1px solid rgba(255,255,255,0.4)',background:'rgba(255,255,255,0.15)',color:'#E6F1FB'}}/>
                </th>
              ))}
            </tr>
            <tr>
              {['cc1','cc2'].map(cc=>(
                <Fragment key={cc}>
                  {[
                    ['Acquis','success'],
                    ['En cours','warning'],
                    ['Non acquis','danger'],
                  ].map(([lbl,sem])=>(
                    <th key={lbl} style={{background:'#8AAED0',color:'#E6F1FB',padding:'3px 4px',fontSize:9,fontWeight:500,textTransform:'uppercase',textAlign:'center',width:38,borderLeft:'0.5px solid #8AAED0'}}>
                      <CBox on={false} sem={sem} onClick={()=>{}}/>
                      <div style={{marginTop:2,fontSize:8,letterSpacing:0.2}}>{lbl}</div>
                    </th>
                  ))}
                </Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {CC_ITEMS.map((item,idx)=>(
              <CCRow key={item.id} item={item} cc1Val={student.cc1[item.id]} cc2Val={student.cc2[item.id]} idx={idx} onSetCC={onSetCC}/>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Vue impression ───────────────────────────────────────────────────────
function PrintView({ student, session, onBack }){
  const td  = {border:'0.5px solid #DDE3EE',padding:'4px 8px',fontSize:11,fontFamily:'Arial',verticalAlign:'middle'}
  const bg3 = v => v==='acquis'?'#C8E6C9':v==='en_cours'?'#FFE0B2':v==='non_acquis'?'#FFCDD2':'#F5F5F5'
  const l3  = v => v ? E3_LBL[v] : '—'
  const fmt = d => { try{ return new Date(d+'T12:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'}) }catch(e){return d} }
  return (
    <div>
      <div className="no-print" style={{padding:'10px 16px',background:'#F8F9FC',borderBottom:'0.5px solid #E5E7EB',display:'flex',gap:10,alignItems:'center'}}>
        <button onClick={onBack} style={{fontSize:12,fontFamily:'system-ui,-apple-system,sans-serif'}}><ArrowLeft size={14}/> Retour</button>
        <button onClick={()=>window.print()} style={{background:'#D9BB5F',color:'#4A3800',border:'none',borderRadius:'4px',padding:'6px 14px',fontSize:12,fontWeight:500,cursor:'pointer',fontFamily:'system-ui,-apple-system,sans-serif'}}>
          <Printer size={14}/> Imprimer / Exporter en PDF
        </button>
        <span style={{fontSize:11,color:'#6B7280',fontFamily:'system-ui,-apple-system,sans-serif'}}>Dans la boîte d'impression → "Enregistrer en PDF"</span>
      </div>
      <div style={{padding:20,maxWidth:860,margin:'0 auto',fontFamily:'Arial,sans-serif',color:'#1A1A2E'}}>
        <div style={{background:'#185FA5',color:'#E6F1FB',padding:'7px 12px',fontSize:12,fontWeight:'bold',borderRadius:'4px 4px 0 0'}}>
          Grille d'évaluation SST — {session.modalite}
        </div>
        <table style={{width:'100%',borderCollapse:'collapse',marginBottom:12}}>
          <tbody><tr>
            {[['Stagiaire',tabLabel(student)],['Entreprise',student.entreprise||'—'],['Date',fmt(session.date)],['Formateur',session.trainer]].map(([k,v])=>(
              <td key={k} style={{...td,background:'#F8F9FC'}}><strong>{k} :</strong> {v}</td>
            ))}
          </tr></tbody>
        </table>
        <table style={{width:'100%',borderCollapse:'collapse',marginBottom:10}}>
          <thead><tr>
            <th style={{...td,background:'#185FA5',color:'#E6F1FB',textAlign:'left',width:'43%'}}>Thème / Compétence</th>
            <th style={{...td,background:'#185FA5',color:'#E6F1FB',textAlign:'center',width:55}}>Note</th>
            <th style={{...td,background:'#185FA5',color:'#E6F1FB',textAlign:'center',width:70}}>Acquis</th>
            <th style={{...td,background:'#185FA5',color:'#E6F1FB',textAlign:'center',width:72}}>En cours</th>
            <th style={{...td,background:'#185FA5',color:'#E6F1FB',textAlign:'center',width:82}}>Non acquis</th>
            <th style={{...td,background:'#185FA5',color:'#E6F1FB',textAlign:'left'}}>Commentaire</th>
          </tr></thead>
          <tbody>
            <tr><td colSpan={6} style={{...td,background:'#185FA5',color:'#E6F1FB',fontWeight:'bold'}}>Évaluations théoriques</td></tr>
            {[['Rôle du SST',student.note_role],['Cadre juridique',student.note_juridique]].map(([lbl,note],i)=>(
              <tr key={lbl} style={{background:i%2===0?'#F8F9FC':'#FFF'}}>
                <td style={td}>{lbl}</td><td style={{...td,textAlign:'center'}}>{note||'—'}/5</td>
                <td style={td}/><td style={td}/><td style={td}/><td style={td}/>
              </tr>
            ))}
            {SECTIONS.map(sec=>(
              <Fragment key={sec.id}>
                <tr><td colSpan={6} style={{...td,background:'#6B8EC0',color:'#E6F1FB',fontWeight:'bold'}}>{sec.title}</td></tr>
                {sec.items.map((item,idx)=>{
                  const d=student.items[item.id]||{v:null,c:''}
                  return (
                    <tr key={item.id} style={{background:idx%2===0?'#F8F9FC':'#FFF'}}>
                      <td style={td}>{item.text}</td><td style={td}/>
                      <td style={{...td,textAlign:'center',background:d.v==='acquis'?'#C8E6C9':''}}>{d.v==='acquis'?'✓':''}</td>
                      <td style={{...td,textAlign:'center',background:d.v==='en_cours'?'#FFE0B2':''}}>{d.v==='en_cours'?'✓':''}</td>
                      <td style={{...td,textAlign:'center',background:d.v==='non_acquis'?'#FFCDD2':''}}>{d.v==='non_acquis'?'✓':''}</td>
                      <td style={td}>{d.c||''}</td>
                    </tr>
                  )
                })}
              </Fragment>
            ))}
          </tbody>
        </table>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr>
              <th style={{...td,background:'#185FA5',color:'#E6F1FB',textAlign:'left'}} rowSpan={2}>Mise en situation d'accident simulé</th>
              {['cc1','cc2'].map(cc=>(
                <th key={cc} colSpan={3} style={{...td,background:'#6B8EC0',color:'#E6F1FB',textAlign:'center'}}>
                  {cc==='cc1'?'CC1':'CC2'}{student[cc==='cc1'?'cc1_s':'cc2_s']?` — ${student[cc==='cc1'?'cc1_s':'cc2_s']}`:''}
                </th>
              ))}
            </tr>
            <tr>
              {['cc1','cc2'].flatMap(cc=>
                [['Acquis','#C8E6C9'],['En cours','#FFE0B2'],['Non acquis','#FFCDD2']].map(([lbl,c])=>(
                  <th key={cc+lbl} style={{...td,background:c,textAlign:'center',fontSize:10}}>{lbl}</th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {CC_ITEMS.map((item,idx)=>(
              <tr key={item.id} style={{background:idx%2===0?'#F8F9FC':'#FFF'}}>
                <td style={td}>{item.text}</td>
                {['cc1','cc2'].map(cc=>(
                  <Fragment key={cc}>
                    <td style={{...td,textAlign:'center',background:student[cc][item.id]==='acquis'?'#C8E6C9':''}}>{student[cc][item.id]==='acquis'?'✓':''}</td>
                    <td style={{...td,textAlign:'center',background:student[cc][item.id]==='en_cours'?'#FFE0B2':''}}>{student[cc][item.id]==='en_cours'?'✓':''}</td>
                    <td style={{...td,textAlign:'center',background:student[cc][item.id]==='non_acquis'?'#FFCDD2':''}}>{student[cc][item.id]==='non_acquis'?'✓':''}</td>
                  </Fragment>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{marginTop:18,display:'flex',gap:40,fontSize:10,color:'#556688'}}>
          <span>Signature formateur : ________________________________</span>
          <span>Signature stagiaire : ________________________________</span>
        </div>
      </div>
      <style>{`@media print{.no-print{display:none!important;}body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}`}</style>
    </div>
  )
}

// ─── App principale ───────────────────────────────────────────────────────
export default function App(){
  const [session,  setSession]  = useState(mkSession())
  const [students, setStudents] = useState([])
  const [tab,      setTab]      = useState(0)
  const [count,    setCount]    = useState(4)
  const [ready,    setReady]    = useState(false)
  const [printing, setPrinting] = useState(false)
  const [dirty,    setDirty]    = useState(false)
  const [savedAt,  setSavedAt]  = useState(null)

  // Charge l'état initial
  useEffect(()=>{
    try{
      const raw=localStorage.getItem('sst-v3')
      if(raw){const d=JSON.parse(raw);setSession(d.session);setStudents(d.students);setCount(d.count||4);if(d.savedAt)setSavedAt(d.savedAt)}
    }catch(e){}
    setReady(true)
  },[])

  // Garde toujours l'état le plus récent en mémoire
  const latestRef = useRef({session,students,count,savedAt})
  latestRef.current = {session,students,count,savedAt}

  // Marque "modifié" dès qu'une donnée change
  useEffect(()=>{ if(ready) setDirty(true) },[session,students,count])

  // Sauvegarde manuelle
  const save = useCallback(()=>{
    const now = new Date().toISOString()
    try{
      localStorage.setItem('sst-v3', JSON.stringify({...latestRef.current, savedAt: now}))
      setSavedAt(now); setDirty(false)
    }catch(e){}
  },[])

  // Avertir avant de quitter si modifications non enregistrées
  useEffect(()=>{
    if(!dirty) return
    const h = (e)=>{ e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', h)
    return ()=>window.removeEventListener('beforeunload', h)
  },[dirty])

  // Raccourci Ctrl/Cmd+S
  useEffect(()=>{
    const h = (e)=>{
      if((e.ctrlKey||e.metaKey) && e.key==='s'){ e.preventDefault(); save() }
    }
    window.addEventListener('keydown', h)
    return ()=>window.removeEventListener('keydown', h)
  },[save])

  const savedLabel = savedAt ? new Date(savedAt).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}) : null

  const upd = (id,fn) => setStudents(p=>p.map(s=>s.id===id?fn(s):s))
  const student = students[tab]||null

  if(!ready) return <div style={{padding:'2rem',fontFamily:'system-ui,-apple-system,sans-serif',color:'#6B7280',fontSize:13}}>Chargement...</div>
  if(printing&&student) return <PrintView student={student} session={session} onBack={()=>setPrinting(false)}/>

  return (
    <div>
      {/* Barre session */}
      <div style={{background:'#185FA5',padding:'8px 14px',display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
        <span style={{color:'#E6F1FB',fontWeight:500,fontSize:13,fontFamily:'system-ui,-apple-system,sans-serif',marginRight:4}}>Grilles SST</span>
        <input type="date" value={session.date} onChange={e=>setSession(s=>({...s,date:e.target.value}))} style={{fontSize:11,padding:'3px 6px'}}/>
        <input type="text"  value={session.trainer} onChange={e=>setSession(s=>({...s,trainer:e.target.value}))} placeholder="Formateur" style={{fontSize:11,padding:'3px 6px',width:130}}/>
        <select value={session.modalite} onChange={e=>setSession(s=>({...s,modalite:e.target.value}))} style={{fontSize:11,padding:'3px 6px'}}>
          <option value="FI">FI — Formation initiale</option>
          <option value="MAC">MAC — Recyclage</option>
        </select>
        {students.length===0?(
          <>
            <select value={count} onChange={e=>setCount(parseInt(e.target.value))} style={{fontSize:11,padding:'3px 6px'}}>
              {[4,5,6,7,8,9,10].map(n=><option key={n} value={n}>{n} stagiaires</option>)}
            </select>
            <button onClick={()=>{setStudents(Array.from({length:count},(_,i)=>mkStudent(`s${Date.now()}_${i}`,i+1)));setTab(0)}}
              disabled={!session.trainer}
              style={{background:session.trainer?'#D9BB5F':'rgba(255,255,255,0.2)',color:session.trainer?'#4A3800':'#E6F1FB',border:'none',borderRadius:'4px',padding:'5px 10px',fontSize:11,fontWeight:500,cursor:session.trainer?'pointer':'default',fontFamily:'system-ui,-apple-system,sans-serif'}}>
              Démarrer
            </button>
          </>
        ):(
          <>
          <button onClick={save} disabled={!dirty}
            title="Enregistrer (Ctrl+S)"
            style={{background:dirty?'#D9BB5F':'rgba(255,255,255,0.15)',color:dirty?'#4A3800':'#E6F1FB',border:'none',borderRadius:'4px',padding:'5px 10px',fontSize:11,fontWeight:500,cursor:dirty?'pointer':'default',marginLeft:'auto',display:'inline-flex',alignItems:'center',gap:4,fontFamily:'system-ui,-apple-system,sans-serif'}}>
            <Save size={13}/> {dirty ? 'Enregistrer' : 'Enregistré'}
          </button>
          <span style={{color:'#E6F1FB',fontSize:10,opacity:0.85,fontFamily:'system-ui,-apple-system,sans-serif'}}>
            {dirty ? '● Modifications non enregistrées' : (savedLabel ? `Enregistré à ${savedLabel}` : '')}
          </span>
          <button onClick={()=>{
            if(confirm('Réinitialiser toute la session ? Les évaluations de tous les stagiaires seront effacées.')){
              const fresh=mkSession()
              setSession(fresh); setStudents([]); setCount(4); setTab(0); setSavedAt(null)
              localStorage.setItem('sst-v3',JSON.stringify({session:fresh,students:[],count:4}))
              setDirty(false)
            }
          }}
            style={{background:'rgba(255,255,255,0.15)',color:'#E6F1FB',border:'none',borderRadius:'4px',padding:'5px 8px',fontSize:10,cursor:'pointer',fontFamily:'system-ui,-apple-system,sans-serif'}}>
            <RefreshCw size={14}/> Nouvelle session
          </button>
          </>
        )}
      </div>

      {students.length>0&&student&&(
        <>
          {/* Onglets stagiaires — nom mis à jour dynamiquement */}
          <div style={{display:'flex',background:'#FFFFFF',borderBottom:'0.5px solid #E5E7EB',overflowX:'auto'}}>
            {students.map((s,i)=>(
              <button key={s.id} onClick={()=>setTab(i)}
                style={{background:'none',border:'none',borderBottom:`2px solid ${tab===i?'#185FA5':'transparent'}`,padding:'9px 14px',fontSize:12,fontWeight:tab===i?500:400,color:tab===i?'#185FA5':'#6B7280',cursor:'pointer',whiteSpace:'nowrap',fontFamily:'system-ui,-apple-system,sans-serif'}}>
                {tabLabel(s)}
              </button>
            ))}
            {students.length<10&&(
              <button onClick={()=>{const n=students.length+1;setStudents(p=>[...p,mkStudent(`s${Date.now()}`,n)]);setTab(students.length)}}
                style={{background:'none',border:'none',borderBottom:'2px solid transparent',padding:'9px 12px',fontSize:12,color:'#9CA3AF',cursor:'pointer',fontFamily:'system-ui,-apple-system,sans-serif'}}>
                + Ajouter
              </button>
            )}
          </div>

          {/* Infos stagiaire (actif) */}
          <div style={{padding:'8px 14px',background:'#F8F9FC',borderBottom:'0.5px solid #E5E7EB',display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
            {[['nom','Nom',120],['prenom','Prénom',110],['entreprise','Entreprise',150]].map(([f,ph,w])=>(
              <input key={f} value={student[f]} onChange={e=>upd(student.id,s=>({...s,[f]:e.target.value}))}
                placeholder={ph} style={{fontSize:12,padding:'4px 8px',width:w}}/>
            ))}
            <div style={{marginLeft:'auto',display:'flex',gap:6}}>
              <button onClick={()=>setPrinting(true)}
                style={{background:'#D9BB5F',color:'#4A3800',border:'none',borderRadius:'4px',padding:'5px 12px',fontSize:12,fontWeight:500,cursor:'pointer',fontFamily:'system-ui,-apple-system,sans-serif'}}>
                <Printer size={14}/> PDF
              </button>
              <button onClick={()=>{if(confirm('Remettre à zéro ce stagiaire ?')) upd(student.id,s=>({...mkStudent(s.id,s._n),nom:s.nom,prenom:s.prenom,entreprise:s.entreprise}))}}
                style={{background:'none',border:'0.5px solid #D1D5DB',borderRadius:'4px',padding:'5px 8px',fontSize:11,cursor:'pointer',color:'#6B7280',fontFamily:'system-ui,-apple-system,sans-serif'}}>
                <RefreshCw size={14}/>
              </button>
            </div>
          </div>

          {/* Grilles : toutes montées, seule l'active est visible (préserve le focus) */}
          {students.map((s,i)=>(
            <div key={s.id} style={{padding:'12px 14px', display: tab===i?'block':'none'}}>
              <Grille student={s} setStudents={setStudents}/>
            </div>
          ))}
        </>
      )}

      {students.length===0&&(
        <div style={{padding:'4rem 2rem',textAlign:'center',color:'#9CA3AF',fontFamily:'system-ui,-apple-system,sans-serif',fontSize:13}}>
          Renseignez le formateur et cliquez sur "Démarrer" pour commencer.
        </div>
      )}
    </div>
  )
}
