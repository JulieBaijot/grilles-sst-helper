import { useState, useEffect, Fragment } from "react"
import { Check, ArrowLeft, Printer, RefreshCw } from "lucide-react"

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

// ─── Checkbox carré coloré ────────────────────────────────────────────────
function CBox({ on, sem, onClick }){
  const colors = {
    success:{ bg:'#C8E6C9', border:'#66BB6A', check:'#1B5E20' },
    warning:{ bg:'#FFE0B2', border:'#FFA726', check:'#E65100' },
    danger: { bg:'#FFCDD2', border:'#EF5350', check:'#B71C1C' },
  }
  const c = colors[sem]
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
}

// ─── Grille ───────────────────────────────────────────────────────────────
function Grille({ student, onUpd, onItem, onCC }){
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
  const tdTxt = { padding:'6px 10px', fontSize:12, color:'#1A1A2E', borderBottom:'0.5px solid #E5E7EB', verticalAlign:'middle', lineHeight:1.4 }
  const tdCtr = { ...tdTxt, textAlign:'center', width:38 }

  const setV = (id, val, cur) => onItem(id,'v', cur===val ? null : val)
  const setCCV = (cc, id, val, cur) => onCC(cc, id, cur===val ? null : val)

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
            {[['note_role','Rôle du SST'],['note_juridique','Cadre juridique']].map(([f,lbl],i)=>(
              <tr key={f} style={{background:i%2===0?'#F8F9FC':'#FFFFFF'}}>
                <td style={tdTxt}>{lbl}</td>
                <td style={{...tdCtr,width:70}}>
                  <input value={student[f]} onChange={e=>onUpd(s=>({...s,[f]:e.target.value}))}
                    placeholder="—" style={{width:32,textAlign:'center',fontSize:12,padding:'2px 4px'}} />
                  <span style={{fontSize:10,color:'#6B7280'}}> /5</span>
                </td>
              </tr>
            ))}
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
                    <tr key={item.id} style={{background:idx%2===0?'#F8F9FC':'#FFFFFF'}}>
                      <td style={tdTxt}>{item.text}</td>
                      <td style={tdCtr}><CBox on={d.v==='acquis'}     sem="success" onClick={()=>setV(item.id,'acquis',d.v)}     /></td>
                      <td style={tdCtr}><CBox on={d.v==='en_cours'}   sem="warning" onClick={()=>setV(item.id,'en_cours',d.v)}   /></td>
                      <td style={tdCtr}><CBox on={d.v==='non_acquis'} sem="danger"  onClick={()=>setV(item.id,'non_acquis',d.v)} /></td>
                      <td style={{...tdTxt,padding:'4px 8px'}}>
                        <input value={d.c} onChange={e=>onItem(item.id,'c',e.target.value)}
                          placeholder="Commentaire..." style={{width:'100%',fontSize:11,padding:'2px 5px',boxSizing:'border-box'}} />
                      </td>
                    </tr>
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
                  <input value={student[cc==='cc1'?'cc1_s':'cc2_s']||''} onChange={e=>onUpd(s=>({...s,[cc==='cc1'?'cc1_s':'cc2_s']:e.target.value}))}
                    placeholder="S1–S8" style={{marginLeft:6,fontSize:10,padding:'1px 4px',width:60,borderRadius:3,border:'1px solid rgba(255,255,255,0.4)',background:'rgba(255,255,255,0.15)',color:'#E6F1FB'}} />
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
                      <CBox on={false} sem={sem} onClick={()=>{}} />
                      <div style={{marginTop:2,fontSize:8,letterSpacing:0.2}}>{lbl}</div>
                    </th>
                  ))}
                </Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {CC_ITEMS.map((item,idx)=>(
              <tr key={item.id} style={{background:idx%2===0?'#F8F9FC':'#FFFFFF'}}>
                <td style={tdTxt}>{item.text}</td>
                {['cc1','cc2'].map(cc=>(
                  <Fragment key={cc}>
                    {[['acquis','success'],['en_cours','warning'],['non_acquis','danger']].map(([val,sem])=>(
                      <td key={val} style={{...tdCtr,borderLeft:val==='acquis'?'0.5px solid #E5E7EB':'none'}}>
                        <CBox on={student[cc][item.id]===val} sem={sem} onClick={()=>setCCV(cc,item.id,val,student[cc][item.id])} />
                      </td>
                    ))}
                  </Fragment>
                ))}
              </tr>
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

  useEffect(()=>{
    try{
      const raw=localStorage.getItem('sst-v3')
      if(raw){const d=JSON.parse(raw);setSession(d.session);setStudents(d.students);setCount(d.count||4)}
    }catch(e){}
    setReady(true)
  },[])

  useEffect(()=>{
    if(!ready) return
    localStorage.setItem('sst-v3',JSON.stringify({session,students,count}))
  },[session,students,count,ready])

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
          <button onClick={()=>{
            if(confirm('Réinitialiser toute la session ? Les évaluations de tous les stagiaires seront effacées.')){
              const fresh=mkSession()
              setSession(fresh); setStudents([]); setCount(4); setTab(0)
              localStorage.setItem('sst-v3',JSON.stringify({session:fresh,students:[],count:4}))
            }
          }}
            style={{background:'rgba(255,255,255,0.15)',color:'#E6F1FB',border:'none',borderRadius:'4px',padding:'5px 8px',fontSize:10,cursor:'pointer',marginLeft:'auto',fontFamily:'system-ui,-apple-system,sans-serif'}}>
            <RefreshCw size={14}/> Nouvelle session
          </button>
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

          {/* Infos stagiaire */}
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

          {/* Grille */}
          <div style={{padding:'12px 14px'}}>
            <Grille
              student={student}
              onUpd={fn=>upd(student.id,fn)}
              onItem={(id,field,val)=>upd(student.id,s=>({...s,items:{...s.items,[id]:{...s.items[id],[field]:val}}}))}
              onCC={(cc,id,val)=>upd(student.id,s=>({...s,[cc]:{...s[cc],[id]:val}}))}
            />
          </div>
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
