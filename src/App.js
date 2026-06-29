import { useState, useEffect, createContext, useContext } from "react";

// ── Firebase via REST API (CDN 없이 직접 통신) ────────────────
const DB_URL = "https://filmflow-fc094-default-rtdb.firebaseio.com";

let db = true; // REST 방식은 초기화 불필요
let fbRef, fbSet, fbOnValue, fbOff;

// REST API로 데이터 읽기/쓰기
async function firebaseGet(path) {
  const res = await fetch(`${DB_URL}/${path}.json`);
  return res.json();
}

async function firebaseSet(path, data) {
  await fetch(`${DB_URL}/${path}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

async function initFirebase() {
  return true;
}

// ── Theme ─────────────────────────────────────────────────────
const ThemeCtx = createContext();
const useTheme = () => useContext(ThemeCtx);
const DARK  = { bg:"#0d1117",surface:"#111827",surface2:"#1f2937",border:"#1f2937",border2:"#374151",text:"#f9fafb",text2:"#d1d5db",text3:"#9ca3af",text4:"#6b7280",text5:"#4b5563",inputBg:"#1f2937",inputBorder:"#374151",headerBg:"#0d1117" };
const LIGHT = { bg:"#f1f5f9",surface:"#ffffff",surface2:"#f8fafc",border:"#e2e8f0",border2:"#cbd5e1",text:"#0f172a",text2:"#1e293b",text3:"#475569",text4:"#64748b",text5:"#94a3b8",inputBg:"#f8fafc",inputBorder:"#cbd5e1",headerBg:"#ffffff" };

// ── Constants ─────────────────────────────────────────────────
const PRIORITIES = ["높음","중간","낮음"];
const PRIORITY_COLOR = {"높음":"#f87171","중간":"#fbbf24","낮음":"#34d399"};
const STAGES = ["기획","촬영","편집","검토","업로드 완료"];
const STAGE_COLOR = {"기획":"#818cf8","촬영":"#fb923c","편집":"#38bdf8","검토":"#c084fc","업로드 완료":"#34d399"};
const STAGE_ICON = {"기획":"💡","촬영":"🎥","편집":"✂️","검토":"🔍","업로드 완료":"🚀"};
const TAGS = ["유튜브","인스타그램","틱톡","쇼츠","광고","브이로그"];
const TAG_COLOR = {"유튜브":"#f87171","인스타그램":"#c084fc","틱톡":"#38bdf8","쇼츠":"#fb923c","광고":"#fbbf24","브이로그":"#34d399"};
const WEEKDAYS = ["일","월","화","수","목","금","토"];
const CONFIRM_STATUS = ["컨펌중","컨펌완료","수정","반려"];
const WORK_STATUS = ["기획중","작업중","작업완료","수정중"];
const MODIFY_STATUS = ["수정 완료","수정중","대기"];
const UPLOAD_STATUS = ["완료","예정","-"];
const CONFIRM_COLOR = {"컨펌중":"#fbbf24","컨펌완료":"#34d399","수정":"#f87171","반려":"#6b7280"};
const WORK_COLOR = {"기획중":"#818cf8","작업중":"#fb923c","작업완료":"#34d399","수정중":"#f87171"};
const AVATAR_COLORS = ["#6366f1","#ec4899","#fb923c","#34d399","#38bdf8","#c084fc","#f87171"];
const ALL_TABS = [{id:"calendar",label:"📅 캘린더"},{id:"board",label:"🎞️ 제작 보드"},{id:"ad",label:"📢 광고 관리"},{id:"stats",label:"📊 통계"},{id:"ai",label:"🤖 AI 분석"}];
const ADMIN_USER = {id:"admin",name:"admin",password:"admin1234",dept:"경영진",rank:"대표",position:"관리자",officePhone:"",mobile:"",role:"admin",approved:true};

// ── Firebase Hooks (REST 폴링 방식) ───────────────────────────
function useFirebaseData(path, defaultVal) {
  const [data, setData] = useState(defaultVal);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const val = await firebaseGet(path);
        if (!cancelled) {
          if (val !== null && val !== undefined) {
            setData(Array.isArray(defaultVal) ? Object.values(val) : val);
          }
          setReady(true);
        }
      } catch(e) {
        if (!cancelled) setReady(true);
      }
    };
    load();
    // 3초마다 폴링으로 실시간 동기화
    const interval = setInterval(load, 3000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [path]);

  const setFirebase = async (val) => {
    const toStore = Array.isArray(val)
      ? Object.fromEntries(val.map((v) => [v.id || `item_${Date.now()}`, v]))
      : val;
    setData(val); // 즉시 UI 업데이트
    await firebaseSet(path, toStore);
  };

  return [data, setFirebase, ready];
}

// ── Helpers ───────────────────────────────────────────────────
function getAvatarColor(name, users) {
  const idx = users.findIndex(u => u.name === name);
  return idx >= 0 ? AVATAR_COLORS[idx % AVATAR_COLORS.length] : "#64748b";
}

function Avatar({ name, size = 24, users = [] }) {
  const color = getAvatarColor(name, users) || "#6366f1";
  return <div style={{width:size,height:size,borderRadius:"50%",background:color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.42,fontWeight:700,color:"#fff",flexShrink:0}}>{(name||"?")[0]}</div>;
}

function StatusBadge({ value, options, colorMap, onChange }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} onClick={e => e.stopPropagation()}
      style={{background:(colorMap[value]||"#6b7280")+"20",color:colorMap[value]||"#9ca3af",border:`1px solid ${(colorMap[value]||"#6b7280")}40`,borderRadius:20,padding:"2px 8px",fontSize:11,fontWeight:700,cursor:"pointer",outline:"none",appearance:"none",textAlign:"center"}}>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  );
}

function UrlCell({ url }) {
  if (!url) return <span style={{color:"#6b7280",fontSize:12}}>-</span>;
  return <a href={url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{color:"#818cf8",fontSize:11,textDecoration:"none",background:"#818cf820",padding:"2px 8px",borderRadius:6}}>링크 ↗</a>;
}

function Inp({ label, val, onChange, type = "text", required }) {
  const { t } = useTheme();
  return (
    <div style={{marginBottom:12}}>
      <div style={{fontSize:11,color:t.text4,marginBottom:4,fontWeight:600}}>{label}{required && " *"}</div>
      <input type={type} value={val} onChange={e => onChange(e.target.value)}
        style={{width:"100%",background:t.inputBg,border:`1px solid ${t.inputBorder}`,borderRadius:9,padding:"9px 12px",fontSize:13,color:t.text,boxSizing:"border-box",outline:"none"}} />
    </div>
  );
}

// ── Sync Status Indicator ─────────────────────────────────────
function SyncBadge({ synced }) {
  const { t } = useTheme();
  return (
    <div style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:synced?"#34d399":t.text5}}>
      <div style={{width:7,height:7,borderRadius:"50%",background:synced?"#34d399":"#fbbf24",animation:synced?"none":"pulse 1s infinite"}}/>
      {synced ? "실시간 동기화 중" : "연결 중..."}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
    </div>
  );
}

// ── Notice Banner ─────────────────────────────────────────────
function NoticeBanner({ notices }) {
  const { t } = useTheme();
  const active = notices.filter(n => n.active);
  if (!active.length) return null;
  return (
    <div style={{background:"linear-gradient(90deg,#6366f115,#ec489915)",borderBottom:`1px solid #6366f130`,padding:"8px 24px",display:"flex",gap:20,overflowX:"auto"}}>
      {active.map(n => (
        <div key={n.id} style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          <span style={{fontSize:11,background:"#6366f1",color:"#fff",borderRadius:20,padding:"1px 8px",fontWeight:700}}>공지</span>
          <span style={{fontSize:12,color:t.text2,fontWeight:600}}>{n.title}</span>
          <span style={{fontSize:11,color:t.text4}}>— {n.content}</span>
        </div>
      ))}
    </div>
  );
}

// ── Auth Screen ───────────────────────────────────────────────
function AuthScreen({ onLogin, users, onRegister }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({name:"",password:"",dept:"",rank:"",position:"",officePhone:"",mobile:""});
  const [err, setErr] = useState("");
  const set = (k, v) => setForm(f => ({...f,[k]:v}));

  const handleLogin = () => {
    if (form.name === "admin" && form.password === "admin1234") { onLogin(ADMIN_USER); return; }
    const u = users.find(u => u.name === form.name && u.password === form.password);
    if (!u) { setErr("이름 또는 비밀번호가 올바르지 않습니다."); return; }
    if (!u.approved) { setErr("관리자 승인 대기 중입니다."); return; }
    setErr(""); onLogin(u);
  };

  const handleRegister = async () => {
    if (!form.name||!form.password||!form.dept||!form.rank||!form.position||!form.mobile) { setErr("필수 항목을 모두 입력해주세요."); return; }
    if (form.name === "admin") { setErr("사용할 수 없는 이름입니다."); return; }
    if (users.find(u => u.name === form.name)) { setErr("이미 존재하는 이름입니다."); return; }
    const newUser = {id:`user_${Date.now()}`,name:form.name,password:form.password,dept:form.dept,rank:form.rank,position:form.position,officePhone:form.officePhone,mobile:form.mobile,role:"member",approved:false};
    await onRegister(newUser);
    setErr(""); setMode("login"); setForm({name:"",password:"",dept:"",rank:"",position:"",officePhone:"",mobile:""});
    alert("가입 신청 완료! 관리자 승인 후 로그인 가능합니다.");
  };

  const inpStyle = {width:"100%",background:"#1f2937",border:"1px solid #374151",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#f9fafb",boxSizing:"border-box",outline:"none",marginBottom:10};

  return (
    <div style={{minHeight:"100vh",background:"#0d1117",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"}}>
      <div style={{width:390,background:"#111827",borderRadius:20,padding:"32px 32px 28px",border:"1px solid #1f2937",boxShadow:"0 24px 64px #000c"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:13,fontWeight:900,color:"#818cf8",letterSpacing:"2px",marginBottom:4}}>TIMBEL</div>
          <div style={{fontSize:18,fontWeight:800,color:"#f9fafb"}}>영상 제작 스케줄러</div>
          <div style={{fontSize:11,color:"#34d399",marginTop:6,display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:"#34d399"}}/>Firebase 실시간 동기화
          </div>
        </div>
        <div style={{display:"flex",background:"#0d1117",borderRadius:10,padding:3,marginBottom:20,border:"1px solid #1f2937"}}>
          {[["login","로그인"],["register","회원가입"]].map(([v,l]) => (
            <button key={v} onClick={() => { setMode(v); setErr(""); }} style={{flex:1,padding:"8px 0",border:"none",borderRadius:8,cursor:"pointer",fontWeight:mode===v?700:500,fontSize:13,background:mode===v?"#6366f1":"transparent",color:mode===v?"#fff":"#6b7280"}}>{l}</button>
          ))}
        </div>
        {mode === "login" ? (
          <>
            <input placeholder="이름 (아이디)" value={form.name} onChange={e => set("name",e.target.value)} style={inpStyle}/>
            <input placeholder="비밀번호" type="password" value={form.password} onChange={e => set("password",e.target.value)} onKeyDown={e => e.key==="Enter" && handleLogin()} style={inpStyle}/>
            {err && <div style={{fontSize:12,color:"#f87171",marginBottom:10,textAlign:"center"}}>{err}</div>}
            <button onClick={handleLogin} style={{width:"100%",background:"#6366f1",border:"none",borderRadius:10,padding:"11px 0",fontWeight:700,fontSize:14,color:"#fff",cursor:"pointer"}}>로그인</button>
            <div style={{textAlign:"center",marginTop:12,fontSize:11,color:"#374151"}}>관리자: admin / admin1234</div>
          </>
        ) : (
          <>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 10px"}}>
              {[["이름 (아이디) *","name"],["부서명 *","dept"],["직급 *","rank"],["포지션 *","position"],["회사 전화번호","officePhone"],["핸드폰 번호 *","mobile"]].map(([pl,k],i) => (
                <div key={k} style={{gridColumn:i===0?"1/-1":"auto"}}>
                  <input placeholder={pl} value={form[k]} onChange={e => set(k,e.target.value)} style={{...inpStyle,marginBottom:9}}/>
                </div>
              ))}
            </div>
            <input placeholder="비밀번호 *" type="password" value={form.password} onChange={e => set("password",e.target.value)} style={inpStyle}/>
            <div style={{fontSize:11,color:"#4b5563",marginBottom:10}}>* 이름이 아이디로 사용됩니다. 가입 후 관리자 승인이 필요합니다.</div>
            {err && <div style={{fontSize:12,color:"#f87171",marginBottom:10,textAlign:"center"}}>{err}</div>}
            <button onClick={handleRegister} style={{width:"100%",background:"#6366f1",border:"none",borderRadius:10,padding:"11px 0",fontWeight:700,fontSize:14,color:"#fff",cursor:"pointer"}}>가입 신청</button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Profile Modal ─────────────────────────────────────────────
function ProfileModal({ currentUser, onClose, onUpdate }) {
  const { t } = useTheme();
  const [pTab, setPTab] = useState("info");
  const [form, setForm] = useState({name:currentUser.name,dept:currentUser.dept,rank:currentUser.rank,position:currentUser.position,officePhone:currentUser.officePhone||"",mobile:currentUser.mobile||""});
  const [pw, setPw] = useState({current:"",next:"",confirm:""});
  const [err, setErr] = useState(""); const [ok, setOk] = useState("");

  const saveInfo = () => {
    if (!form.name||!form.dept||!form.rank||!form.position||!form.mobile) { setErr("필수 항목을 입력해주세요."); return; }
    onUpdate({...currentUser,...form}); setErr(""); setOk("저장되었습니다.");
  };
  const savePw = () => {
    if (pw.current !== currentUser.password) { setErr("현재 비밀번호가 틀렸습니다."); return; }
    if (!pw.next||pw.next.length<4) { setErr("4자 이상 입력해주세요."); return; }
    if (pw.next !== pw.confirm) { setErr("비밀번호가 일치하지 않습니다."); return; }
    onUpdate({...currentUser,password:pw.next}); setErr(""); setOk("변경되었습니다."); setPw({current:"",next:"",confirm:""});
  };

  return (
    <div style={{position:"fixed",inset:0,background:"#00000099",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}}>
      <div style={{background:t.surface,borderRadius:20,width:420,border:`1px solid ${t.border}`,boxShadow:"0 24px 64px #000c",overflow:"hidden"}}>
        <div style={{background:"linear-gradient(135deg,#6366f1,#ec4899)",padding:"22px 24px 18px",position:"relative"}}>
          <button onClick={onClose} style={{position:"absolute",top:14,right:16,background:"none",border:"none",color:"#ffffff88",cursor:"pointer",fontSize:20}}>×</button>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:52,height:52,borderRadius:"50%",background:"#6366f1",border:"3px solid #ffffff44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:800,color:"#fff"}}>{currentUser.name[0]}</div>
            <div>
              <div style={{fontSize:17,fontWeight:800,color:"#fff"}}>{currentUser.name}</div>
              <div style={{fontSize:11,color:"#ffffff88",marginTop:2}}>{currentUser.dept} · {currentUser.rank}</div>
            </div>
          </div>
        </div>
        <div style={{display:"flex",borderBottom:`1px solid ${t.border}`}}>
          {[["info","👤 개인정보"],["password","🔒 비밀번호"]].map(([v,l]) => (
            <button key={v} onClick={() => { setPTab(v); setErr(""); setOk(""); }} style={{flex:1,padding:"10px 0",background:"none",border:"none",borderBottom:pTab===v?"2px solid #6366f1":"2px solid transparent",cursor:"pointer",fontWeight:pTab===v?700:500,fontSize:13,color:pTab===v?"#818cf8":t.text4}}>{l}</button>
          ))}
        </div>
        <div style={{padding:"18px 22px 22px"}}>
          {pTab === "info" ? (
            <>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
                <div style={{gridColumn:"1/-1"}}><Inp label="이름" val={form.name} onChange={v=>setForm(f=>({...f,name:v}))} required/></div>
                <Inp label="부서명" val={form.dept} onChange={v=>setForm(f=>({...f,dept:v}))} required/>
                <Inp label="직급" val={form.rank} onChange={v=>setForm(f=>({...f,rank:v}))} required/>
                <Inp label="포지션" val={form.position} onChange={v=>setForm(f=>({...f,position:v}))} required/>
                <Inp label="회사 전화번호" val={form.officePhone} onChange={v=>setForm(f=>({...f,officePhone:v}))}/>
                <Inp label="핸드폰" val={form.mobile} onChange={v=>setForm(f=>({...f,mobile:v}))} required/>
              </div>
              {err && <div style={{fontSize:12,color:"#f87171",marginBottom:10,textAlign:"center"}}>{err}</div>}
              {ok && <div style={{fontSize:12,color:"#34d399",marginBottom:10,textAlign:"center"}}>✓ {ok}</div>}
              <button onClick={saveInfo} style={{width:"100%",background:"#6366f1",border:"none",borderRadius:10,padding:"11px 0",fontWeight:700,fontSize:14,color:"#fff",cursor:"pointer"}}>저장하기</button>
            </>
          ) : (
            <>
              <Inp label="현재 비밀번호" val={pw.current} onChange={v=>setPw(p=>({...p,current:v}))} type="password"/>
              <Inp label="새 비밀번호 (4자 이상)" val={pw.next} onChange={v=>setPw(p=>({...p,next:v}))} type="password"/>
              <Inp label="새 비밀번호 확인" val={pw.confirm} onChange={v=>setPw(p=>({...p,confirm:v}))} type="password"/>
              {err && <div style={{fontSize:12,color:"#f87171",marginBottom:10,textAlign:"center"}}>{err}</div>}
              {ok && <div style={{fontSize:12,color:"#34d399",marginBottom:10,textAlign:"center"}}>✓ {ok}</div>}
              <button onClick={savePw} style={{width:"100%",background:"#6366f1",border:"none",borderRadius:10,padding:"11px 0",fontWeight:700,fontSize:14,color:"#fff",cursor:"pointer"}}>비밀번호 변경</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Admin Panel ───────────────────────────────────────────────
function AdminPanel({ users, onUpdateUsers, notices, onUpdateNotices, visibleTabs, setVisibleTabs, tasks, onUpdateTasks }) {
  const { t } = useTheme();
  const [aTab, setATab] = useState("users");
  const [noticeForm, setNoticeForm] = useState({title:"",content:"",active:true});
  const [editNotice, setEditNotice] = useState(null);

  const pending = users.filter(u => !u.approved && u.role !== "admin");
  const members = users.filter(u => u.role !== "admin");

  const approve = id => onUpdateUsers(users.map(u => u.id===id ? {...u,approved:true} : u));
  const reject = id => onUpdateUsers(users.filter(u => u.id !== id));
  const toggleRole = id => onUpdateUsers(users.map(u => u.id===id ? {...u,role:u.role==="manager"?"member":"manager"} : u));
  const deleteUser = id => onUpdateUsers(users.filter(u => u.id !== id));

  const addNotice = () => {
    if (!noticeForm.title||!noticeForm.content) return;
    if (editNotice) { onUpdateNotices(notices.map(n => n.id===editNotice ? {...n,...noticeForm} : n)); setEditNotice(null); }
    else onUpdateNotices([...notices, {id:`notice_${Date.now()}`,...noticeForm}]);
    setNoticeForm({title:"",content:"",active:true});
  };

  const roleColor = {"admin":"#f87171","manager":"#fbbf24","member":"#34d399"};
  const roleLabel = {"admin":"관리자","manager":"매니저","member":"팀원"};
  const aTabStyle = v => ({padding:"8px 16px",background:"none",border:"none",borderBottom:aTab===v?"2px solid #f87171":"2px solid transparent",cursor:"pointer",fontWeight:aTab===v?700:500,fontSize:13,color:aTab===v?"#f87171":t.text4,marginBottom:-1});
  const s = {background:t.surface,borderRadius:13,border:`1px solid ${t.border}`,overflow:"hidden",marginBottom:14};

  return (
    <div>
      <div style={{background:"linear-gradient(135deg,#7f1d1d,#991b1b)",borderRadius:12,padding:"14px 20px",marginBottom:18,display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:20}}>🛡️</span>
        <div><div style={{fontSize:15,fontWeight:800,color:"#fff"}}>관리자 대시보드</div><div style={{fontSize:11,color:"#fca5a5"}}>시스템 전체 설정 및 사용자 관리</div></div>
        {pending.length > 0 && <div style={{marginLeft:"auto",background:"#f87171",borderRadius:20,padding:"3px 12px",fontSize:12,fontWeight:700,color:"#fff"}}>승인 대기 {pending.length}명</div>}
      </div>
      <div style={{display:"flex",gap:2,marginBottom:20,borderBottom:`1px solid ${t.border}`}}>
        {[["users","👥 회원 관리"],["notices","📢 공지사항"],["tabs","🗂️ 탭 설정"],["schedule","📋 스케줄 조율"]].map(([v,l]) => (
          <button key={v} onClick={() => setATab(v)} style={aTabStyle(v)}>{l}</button>
        ))}
      </div>

      {aTab === "users" && (
        <div>
          {pending.length > 0 && (
            <div style={{...s,border:"1px solid #f8717140"}}>
              <div style={{padding:"11px 16px",borderBottom:`1px solid ${t.border}`,fontSize:12,fontWeight:700,color:"#f87171",background:"#f8717110"}}>⏳ 승인 대기 ({pending.length})</div>
              {pending.map(u => (
                <div key={u.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderBottom:`1px solid ${t.border}`}}>
                  <Avatar name={u.name} size={36} users={users}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700,color:t.text}}>{u.name}</div>
                    <div style={{fontSize:11,color:t.text4}}>{u.dept} · {u.rank} / {u.position}</div>
                    <div style={{fontSize:11,color:t.text5}}>{u.mobile}</div>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={() => approve(u.id)} style={{background:"#34d399",border:"none",borderRadius:8,padding:"6px 14px",fontSize:12,fontWeight:700,color:"#fff",cursor:"pointer"}}>✓ 승인</button>
                    <button onClick={() => reject(u.id)} style={{background:"#f87171",border:"none",borderRadius:8,padding:"6px 14px",fontSize:12,fontWeight:700,color:"#fff",cursor:"pointer"}}>✕ 거절</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={s}>
            <div style={{padding:"11px 16px",borderBottom:`1px solid ${t.border}`,fontSize:12,fontWeight:700,color:t.text4,textTransform:"uppercase",letterSpacing:".5px"}}>전체 회원 ({members.length})</div>
            {members.length === 0 && <div style={{padding:"24px",textAlign:"center",color:t.text5,fontSize:13}}>등록된 회원이 없습니다</div>}
            {members.map(u => (
              <div key={u.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderBottom:`1px solid ${t.border}`}}
                onMouseEnter={e => e.currentTarget.style.background=t.surface2}
                onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                <Avatar name={u.name} size={36} users={users}/>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:13,fontWeight:700,color:t.text}}>{u.name}</span>
                    <span style={{fontSize:10,background:(roleColor[u.role]||"#6b7280")+"20",color:roleColor[u.role]||"#6b7280",border:`1px solid ${(roleColor[u.role]||"#6b7280")}40`,borderRadius:20,padding:"1px 8px",fontWeight:700}}>{roleLabel[u.role]||"팀원"}</span>
                    {!u.approved && <span style={{fontSize:10,background:"#fbbf2420",color:"#fbbf24",borderRadius:20,padding:"1px 8px",fontWeight:700}}>미승인</span>}
                  </div>
                  <div style={{fontSize:11,color:t.text4,marginTop:2}}>{u.dept} · {u.rank} / {u.position} · {u.mobile}</div>
                </div>
                <div style={{display:"flex",gap:6}}>
                  <button onClick={() => toggleRole(u.id)} style={{background:t.surface2,border:`1px solid ${t.border}`,borderRadius:8,padding:"5px 10px",fontSize:11,color:t.text3,cursor:"pointer"}}>{u.role==="manager"?"팀원으로":"매니저로"}</button>
                  <button onClick={() => deleteUser(u.id)} style={{background:"#f8717120",border:"1px solid #f8717140",borderRadius:8,padding:"5px 10px",fontSize:11,color:"#f87171",cursor:"pointer"}}>삭제</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {aTab === "notices" && (
        <div>
          <div style={{...s,padding:18,marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:700,color:t.text,marginBottom:14}}>{editNotice?"✏️ 공지 수정":"➕ 새 공지 등록"}</div>
            <Inp label="제목" val={noticeForm.title} onChange={v=>setNoticeForm(f=>({...f,title:v}))} required/>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11,color:t.text4,marginBottom:4,fontWeight:600}}>내용 *</div>
              <textarea value={noticeForm.content} onChange={e=>setNoticeForm(f=>({...f,content:e.target.value}))} style={{width:"100%",background:t.inputBg,border:`1px solid ${t.inputBorder}`,borderRadius:9,padding:"9px 12px",fontSize:13,color:t.text,boxSizing:"border-box",outline:"none",minHeight:72,resize:"vertical"}}/>
            </div>
            <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:13,color:t.text3,marginBottom:14}}>
              <input type="checkbox" checked={noticeForm.active} onChange={e=>setNoticeForm(f=>({...f,active:e.target.checked}))} style={{accentColor:"#6366f1",width:15,height:15}}/> 즉시 공개
            </label>
            <div style={{display:"flex",gap:8}}>
              {editNotice && <button onClick={() => { setEditNotice(null); setNoticeForm({title:"",content:"",active:true}); }} style={{flex:1,background:t.surface2,border:`1px solid ${t.border}`,borderRadius:9,padding:"9px 0",cursor:"pointer",color:t.text3,fontWeight:600}}>취소</button>}
              <button onClick={addNotice} style={{flex:1,background:"#6366f1",border:"none",borderRadius:9,padding:"9px 0",cursor:"pointer",color:"#fff",fontWeight:700}}>{editNotice?"수정 완료":"공지 등록"}</button>
            </div>
          </div>
          <div style={s}>
            <div style={{padding:"11px 16px",borderBottom:`1px solid ${t.border}`,fontSize:12,fontWeight:700,color:t.text4,textTransform:"uppercase",letterSpacing:".5px"}}>등록된 공지 ({notices.length})</div>
            {notices.length === 0 && <div style={{padding:"24px",textAlign:"center",color:t.text5,fontSize:13}}>등록된 공지가 없습니다</div>}
            {notices.map(n => (
              <div key={n.id} style={{padding:"12px 16px",borderBottom:`1px solid ${t.border}`,display:"flex",alignItems:"flex-start",gap:12}}
                onMouseEnter={e => e.currentTarget.style.background=t.surface2}
                onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                    <span style={{fontSize:13,fontWeight:700,color:t.text}}>{n.title}</span>
                    <span style={{fontSize:10,background:n.active?"#34d39920":"#6b728020",color:n.active?"#34d399":"#6b7280",borderRadius:20,padding:"1px 8px",fontWeight:700}}>{n.active?"공개":"숨김"}</span>
                  </div>
                  <div style={{fontSize:12,color:t.text4}}>{n.content}</div>
                </div>
                <div style={{display:"flex",gap:5,flexShrink:0}}>
                  <button onClick={() => onUpdateNotices(notices.map(x => x.id===n.id ? {...x,active:!x.active} : x))} style={{background:t.surface2,border:`1px solid ${t.border}`,borderRadius:7,padding:"4px 10px",fontSize:11,color:t.text3,cursor:"pointer"}}>{n.active?"숨기기":"공개"}</button>
                  <button onClick={() => { setEditNotice(n.id); setNoticeForm({title:n.title,content:n.content,active:n.active}); }} style={{background:"#6366f120",border:"1px solid #6366f140",borderRadius:7,padding:"4px 10px",fontSize:11,color:"#818cf8",cursor:"pointer"}}>수정</button>
                  <button onClick={() => onUpdateNotices(notices.filter(x => x.id !== n.id))} style={{background:"#f8717120",border:"1px solid #f8717140",borderRadius:7,padding:"4px 10px",fontSize:11,color:"#f87171",cursor:"pointer"}}>삭제</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {aTab === "tabs" && (
        <div style={s}>
          <div style={{padding:"11px 16px",borderBottom:`1px solid ${t.border}`,fontSize:12,fontWeight:700,color:t.text4,textTransform:"uppercase",letterSpacing:".5px"}}>탭 메뉴 표시 설정</div>
          {ALL_TABS.map(tab => (
            <div key={tab.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 16px",borderBottom:`1px solid ${t.border}`}}
              onMouseEnter={e => e.currentTarget.style.background=t.surface2}
              onMouseLeave={e => e.currentTarget.style.background="transparent"}>
              <div style={{fontSize:13,color:t.text,fontWeight:500}}>{tab.label}</div>
              <div onClick={() => setVisibleTabs(vt => vt.includes(tab.id) ? vt.filter(v=>v!==tab.id) : [...vt,tab.id])}
                style={{width:44,height:24,borderRadius:99,background:visibleTabs.includes(tab.id)?"#6366f1":t.surface2,border:`1px solid ${visibleTabs.includes(tab.id)?"#6366f1":t.border}`,cursor:"pointer",position:"relative",transition:"background .2s"}}>
                <div style={{position:"absolute",top:3,left:visibleTabs.includes(tab.id)?22:3,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left .2s",boxShadow:"0 1px 3px #0003"}}/>
              </div>
            </div>
          ))}
          <div style={{padding:"12px 16px",fontSize:11,color:t.text4}}>※ 관리자는 모든 탭에 항상 접근 가능합니다.</div>
        </div>
      )}

      {aTab === "schedule" && (
        <div style={s}>
          <div style={{padding:"11px 16px",borderBottom:`1px solid ${t.border}`,fontSize:12,fontWeight:700,color:t.text4,textTransform:"uppercase",letterSpacing:".5px"}}>전체 스케줄 조율 ({tasks.length}개)</div>
          {tasks.length === 0 && <div style={{padding:"24px",textAlign:"center",color:t.text5,fontSize:13}}>등록된 스케줄이 없습니다</div>}
          {tasks.map(tk => (
            <div key={tk.id} style={{padding:"12px 16px",borderBottom:`1px solid ${t.border}`,display:"flex",alignItems:"center",gap:12}}
              onMouseEnter={e => e.currentTarget.style.background=t.surface2}
              onMouseLeave={e => e.currentTarget.style.background="transparent"}>
              <div style={{width:3,height:36,borderRadius:99,background:STAGE_COLOR[tk.status],flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600,color:t.text}}>{tk.title}</div>
                <div style={{fontSize:11,color:t.text4,marginTop:2}}>{tk.assignee} · {tk.tag} · 마감 {tk.due}</div>
              </div>
              <select value={tk.assignee} onChange={e => onUpdateTasks(tasks.map(t2 => t2.id===tk.id ? {...t2,assignee:e.target.value} : t2))} onClick={e => e.stopPropagation()}
                style={{background:t.inputBg,border:`1px solid ${t.inputBorder}`,borderRadius:8,padding:"5px 9px",fontSize:12,color:t.text,outline:"none"}}>
                {users.filter(u => u.role!=="admin"&&u.approved).map(u => <option key={u.name}>{u.name}</option>)}
              </select>
              <select value={tk.status} onChange={e => onUpdateTasks(tasks.map(t2 => t2.id===tk.id ? {...t2,status:e.target.value} : t2))} onClick={e => e.stopPropagation()}
                style={{background:STAGE_COLOR[tk.status]+"20",border:`1px solid ${STAGE_COLOR[tk.status]}40`,color:STAGE_COLOR[tk.status],borderRadius:8,padding:"5px 9px",fontSize:12,outline:"none",fontWeight:700}}>
                {STAGES.map(s => <option key={s}>{s}</option>)}
              </select>
              <input type="date" value={tk.due} onChange={e => onUpdateTasks(tasks.map(t2 => t2.id===tk.id ? {...t2,due:e.target.value} : t2))}
                style={{background:t.inputBg,border:`1px solid ${t.inputBorder}`,borderRadius:8,padding:"5px 9px",fontSize:12,color:t.text,outline:"none"}}/>
              <button onClick={() => onUpdateTasks(tasks.filter(t2 => t2.id !== tk.id))} style={{background:"#f8717120",border:"1px solid #f8717140",borderRadius:7,padding:"5px 10px",fontSize:11,color:"#f87171",cursor:"pointer"}}>삭제</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Report Modal ──────────────────────────────────────────────
function ReportModal({ tasks, mode, year, month, onClose, currentUser }) {
  const today = new Date();
  const pad = n => String(n).padStart(2,"0");
  const filtered = tasks.filter(tk => {
    if (!tk.due) return false;
    if (mode==="year") return tk.due.startsWith(String(year));
    return tk.due.startsWith(`${year}-${pad(month)}`);
  });
  const total=filtered.length, done=filtered.filter(tk=>tk.status==="업로드 완료").length, rate=total?Math.round(done/total*100):0;
  const byStage=STAGES.map(s=>({s,count:filtered.filter(tk=>tk.status===s).length}));
  const byTag=TAGS.map(tag=>({tag,count:filtered.filter(tk=>tk.tag===tag).length})).filter(x=>x.count>0);
  const byMember=[...new Set(filtered.map(tk=>tk.assignee))].map(m=>({name:m,done:filtered.filter(tk=>tk.assignee===m&&tk.status==="업로드 완료").length,total:filtered.filter(tk=>tk.assignee===m).length}));
  const title=mode==="year"?`${year}년 연간 보고`:`${year}년 ${month}월 월간 보고`;
  const reportDate=`${today.getFullYear()}.${pad(today.getMonth()+1)}.${pad(today.getDate())}`;
  return (
    <div style={{position:"fixed",inset:0,background:"#000000cc",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}}>
      <div style={{background:"#fff",borderRadius:20,width:600,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 24px 64px #0004"}}>
        <div style={{background:"linear-gradient(135deg,#1e293b,#0f172a)",padding:"26px 30px 22px",borderRadius:"20px 20px 0 0"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{fontSize:11,color:"#64748b",fontWeight:600,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>TIMBEL 영상 제작팀 업무 보고</div>
              <div style={{fontSize:20,fontWeight:800,color:"#f8fafc"}}>{title}</div>
              <div style={{fontSize:12,color:"#475569",marginTop:5}}>보고일: {reportDate} | 보고자: {currentUser?.name} ({currentUser?.rank} / {currentUser?.position})</div>
            </div>
            <button onClick={onClose} style={{background:"#1e293b",border:"1px solid #334155",borderRadius:8,padding:"6px 12px",color:"#94a3b8",cursor:"pointer",fontSize:12}}>닫기</button>
          </div>
        </div>
        <div style={{padding:"22px 28px 28px"}}>
          <div style={{marginBottom:22}}>
            <div style={{fontSize:13,fontWeight:700,color:"#1e293b",borderLeft:"3px solid #6366f1",paddingLeft:10,marginBottom:12}}>📊 종합 현황</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
              {[["전체 영상",total,"#6366f1"],["업로드 완료",done,"#22c55e"],["제작 중",total-done,"#f59e0b"],["완료율",rate+"%","#3b82f6"]].map(([l,v,c])=>(
                <div key={l} style={{background:"#f8fafc",borderRadius:10,padding:"12px 0",textAlign:"center",border:"1px solid #e2e8f0"}}><div style={{fontSize:22,fontWeight:800,color:c}}>{v}</div><div style={{fontSize:11,color:"#64748b",marginTop:2}}>{l}</div></div>
              ))}
            </div>
          </div>
          <div style={{marginBottom:22}}>
            <div style={{fontSize:13,fontWeight:700,color:"#1e293b",borderLeft:"3px solid #fb923c",paddingLeft:10,marginBottom:12}}>🎬 제작 단계별 현황</div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{background:"#f8fafc"}}>{["단계","영상 수","비율"].map(h=><th key={h} style={{padding:"8px 12px",textAlign:"left",fontSize:11,fontWeight:700,color:"#64748b",borderBottom:"1px solid #e2e8f0"}}>{h}</th>)}</tr></thead>
              <tbody>
                {byStage.filter(x=>x.count>0).map(({s,count})=>(
                  <tr key={s}><td style={{padding:"8px 12px",color:"#1e293b",borderBottom:"1px solid #f1f5f9"}}>{STAGE_ICON[s]} {s}</td><td style={{padding:"8px 12px",fontWeight:700,color:STAGE_COLOR[s],borderBottom:"1px solid #f1f5f9"}}>{count}개</td>
                  <td style={{padding:"8px 12px",borderBottom:"1px solid #f1f5f9"}}><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:80,background:"#e2e8f0",borderRadius:99,height:5}}><div style={{width:total?(count/total*100)+"%":"0%",background:STAGE_COLOR[s],height:"100%",borderRadius:99}}/></div><span style={{fontSize:11,color:"#64748b"}}>{total?Math.round(count/total*100):0}%</span></div></td></tr>
                ))}
                {byStage.filter(x=>x.count>0).length===0&&<tr><td colSpan={3} style={{padding:"16px 12px",color:"#94a3b8",textAlign:"center",fontSize:12}}>해당 기간 영상 없음</td></tr>}
              </tbody>
            </table>
          </div>
          {byTag.length>0&&<div style={{marginBottom:22}}><div style={{fontSize:13,fontWeight:700,color:"#1e293b",borderLeft:"3px solid #38bdf8",paddingLeft:10,marginBottom:12}}>📱 플랫폼별</div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{byTag.map(({tag,count})=><div key={tag} style={{background:(TAG_COLOR[tag]||"#818cf8")+"15",border:`1px solid ${(TAG_COLOR[tag]||"#818cf8")}30`,borderRadius:10,padding:"8px 16px",textAlign:"center"}}><div style={{fontSize:18,fontWeight:800,color:TAG_COLOR[tag]||"#818cf8"}}>{count}</div><div style={{fontSize:11,color:"#64748b"}}>{tag}</div></div>)}</div></div>}
          {byMember.length>0&&<div style={{marginBottom:22}}><div style={{fontSize:13,fontWeight:700,color:"#1e293b",borderLeft:"3px solid #c084fc",paddingLeft:10,marginBottom:12}}>👥 담당자별 성과</div><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}><thead><tr style={{background:"#f8fafc"}}>{["담당자","전체","완료","완료율"].map(h=><th key={h} style={{padding:"8px 12px",textAlign:"left",fontSize:11,fontWeight:700,color:"#64748b",borderBottom:"1px solid #e2e8f0"}}>{h}</th>)}</tr></thead><tbody>{byMember.map(({name,done:d,total:tt})=><tr key={name}><td style={{padding:"8px 12px",fontWeight:600,color:"#1e293b",borderBottom:"1px solid #f1f5f9"}}>{name}</td><td style={{padding:"8px 12px",color:"#475569",borderBottom:"1px solid #f1f5f9"}}>{tt}개</td><td style={{padding:"8px 12px",color:"#22c55e",fontWeight:700,borderBottom:"1px solid #f1f5f9"}}>{d}개</td><td style={{padding:"8px 12px",borderBottom:"1px solid #f1f5f9"}}><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:60,background:"#e2e8f0",borderRadius:99,height:5}}><div style={{width:tt?(d/tt*100)+"%":"0%",background:"#6366f1",height:"100%",borderRadius:99}}/></div><span style={{fontSize:11,color:"#64748b"}}>{tt?Math.round(d/tt*100):0}%</span></div></td></tr>)}</tbody></table></div>}
          {filtered.length>0&&<div><div style={{fontSize:13,fontWeight:700,color:"#1e293b",borderLeft:"3px solid #34d399",paddingLeft:10,marginBottom:12}}>📋 영상 목록</div><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr style={{background:"#f8fafc"}}>{["제목","담당","플랫폼","우선순위","마감일","상태"].map(h=><th key={h} style={{padding:"7px 10px",textAlign:"left",fontSize:11,fontWeight:700,color:"#64748b",borderBottom:"1px solid #e2e8f0"}}>{h}</th>)}</tr></thead><tbody>{filtered.sort((a,b)=>a.due.localeCompare(b.due)).map(tk=><tr key={tk.id}><td style={{padding:"7px 10px",fontWeight:600,color:"#1e293b",borderBottom:"1px solid #f1f5f9"}}>{tk.title}</td><td style={{padding:"7px 10px",color:"#475569",borderBottom:"1px solid #f1f5f9"}}>{tk.assignee}</td><td style={{padding:"7px 10px",borderBottom:"1px solid #f1f5f9"}}><span style={{color:TAG_COLOR[tk.tag]||"#818cf8",fontWeight:600}}>{tk.tag}</span></td><td style={{padding:"7px 10px",borderBottom:"1px solid #f1f5f9"}}><span style={{color:PRIORITY_COLOR[tk.priority],fontWeight:600}}>{tk.priority}</span></td><td style={{padding:"7px 10px",color:"#64748b",borderBottom:"1px solid #f1f5f9"}}>{tk.due}</td><td style={{padding:"7px 10px",borderBottom:"1px solid #f1f5f9"}}><span style={{color:STAGE_COLOR[tk.status],background:STAGE_COLOR[tk.status]+"15",padding:"2px 7px",borderRadius:20,fontWeight:600,fontSize:11}}>{tk.status}</span></td></tr>)}</tbody></table></div>}
          <div style={{marginTop:24,paddingTop:14,borderTop:"1px solid #e2e8f0",fontSize:11,color:"#94a3b8",textAlign:"center"}}>TIMBEL 영상 제작 스케줄러 자동 생성 | {reportDate}</div>
        </div>
      </div>
    </div>
  );
}

// ── Stats Panel ───────────────────────────────────────────────
function StatsPanel({ tasks, currentUser }) {
  const { t } = useTheme();
  const today = new Date();
  const [mode, setMode] = useState("all");
  const [selYear, setSelYear] = useState(today.getFullYear());
  const [selMonth, setSelMonth] = useState(today.getMonth()+1);
  const [showReport, setShowReport] = useState(false);
  const years = [...new Set(tasks.map(tk=>tk.due?.slice(0,4)).filter(Boolean))].sort();
  if (!years.includes(String(today.getFullYear()))) years.push(String(today.getFullYear()));
  const pad = n => String(n).padStart(2,"0");
  const filtered = tasks.filter(tk => {
    if (!tk.due) return mode==="all";
    if (mode==="year") return tk.due.startsWith(String(selYear));
    if (mode==="month") return tk.due.startsWith(`${selYear}-${pad(selMonth)}`);
    return true;
  });
  const total=filtered.length, done=filtered.filter(tk=>tk.status==="업로드 완료").length, rate=total?Math.round(done/total*100):0;
  const monthlyData=mode==="year"?Array.from({length:12},(_,i)=>{const m=String(i+1).padStart(2,"0");const mT=tasks.filter(tk=>tk.due?.startsWith(`${selYear}-${m}`));return{month:i+1,total:mT.length,done:mT.filter(tk=>tk.status==="업로드 완료").length};}):null;
  const yearlyData=mode==="all"?years.map(y=>{const yT=tasks.filter(tk=>tk.due?.startsWith(y));return{year:y,total:yT.length,done:yT.filter(tk=>tk.status==="업로드 완료").length};}):null;
  const maxBar=monthlyData?Math.max(...monthlyData.map(d=>d.total),1):yearlyData?Math.max(...yearlyData.map(d=>d.total),1):1;
  const s={background:t.surface,borderRadius:13,padding:"15px 17px",border:`1px solid ${t.border}`};
  const modeBtn=v=>({padding:"6px 14px",borderRadius:7,border:"none",cursor:"pointer",fontSize:12,fontWeight:mode===v?700:500,background:mode===v?"#6366f1":t.surface2,color:mode===v?"#fff":t.text4});
  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {showReport&&<ReportModal tasks={tasks} mode={mode==="all"?"year":mode} year={selYear} month={selMonth} onClose={()=>setShowReport(false)} currentUser={currentUser}/>}
      <div style={{...s,padding:"12px 16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          <div style={{display:"flex",gap:4,background:t.bg,borderRadius:9,padding:3,border:`1px solid ${t.border}`}}>
            <button style={modeBtn("all")} onClick={()=>setMode("all")}>전체</button>
            <button style={modeBtn("year")} onClick={()=>setMode("year")}>연별</button>
            <button style={modeBtn("month")} onClick={()=>setMode("month")}>월별</button>
          </div>
          {(mode==="year"||mode==="month")&&<select value={selYear} onChange={e=>setSelYear(Number(e.target.value))} style={{background:t.inputBg,border:`1px solid ${t.inputBorder}`,borderRadius:8,padding:"5px 10px",fontSize:12,color:t.text,outline:"none"}}>{years.map(y=><option key={y}>{y}</option>)}</select>}
          {mode==="month"&&<select value={selMonth} onChange={e=>setSelMonth(Number(e.target.value))} style={{background:t.inputBg,border:`1px solid ${t.inputBorder}`,borderRadius:8,padding:"5px 10px",fontSize:12,color:t.text,outline:"none"}}>{Array.from({length:12},(_,i)=><option key={i+1} value={i+1}>{i+1}월</option>)}</select>}
          <span style={{fontSize:12,color:t.text4}}>{total}개</span>
          <button onClick={()=>setShowReport(true)} style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:6,background:"linear-gradient(135deg,#6366f1,#818cf8)",border:"none",borderRadius:9,padding:"7px 16px",fontWeight:700,fontSize:12,color:"#fff",cursor:"pointer"}}>📋 {mode==="all"?"보고서 생성":mode==="year"?`${selYear}년 보고`:`${selYear}년 ${selMonth}월 보고`}</button>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
        {[["전체",total,"#818cf8"],["완료",done,"#34d399"],["진행 중",total-done,"#fb923c"],["완료율",rate+"%","#38bdf8"]].map(([l,v,c])=>(
          <div key={l} style={{...s,textAlign:"center"}}><div style={{fontSize:24,fontWeight:900,color:c}}>{v}</div><div style={{fontSize:11,color:t.text4,marginTop:3}}>{l}</div></div>
        ))}
      </div>
      {(monthlyData||yearlyData)&&(
        <div style={s}>
          <div style={{fontSize:11,fontWeight:700,color:t.text4,marginBottom:14,textTransform:"uppercase",letterSpacing:".5px"}}>{mode==="year"?`${selYear}년 월별 현황`:"연도별 현황"}</div>
          <div style={{display:"flex",alignItems:"flex-end",gap:mode==="year"?5:10,height:100}}>
            {(monthlyData||yearlyData).map((d,i)=>{const barH=Math.max((d.total/maxBar)*80,d.total>0?4:0);const doneH=d.total>0?(d.done/d.total)*barH:0;const label=mode==="year"?`${d.month}월`:d.year;const isNow=mode==="year"?(d.month===today.getMonth()+1&&selYear===today.getFullYear()):(d.year===String(today.getFullYear()));return(<div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>{d.total>0&&<span style={{fontSize:9,color:t.text4}}>{d.total}</span>}<div style={{width:"100%",display:"flex",flexDirection:"column",justifyContent:"flex-end",height:82}}><div style={{width:"100%",borderRadius:"5px 5px 0 0",overflow:"hidden",background:t.bg,height:barH,position:"relative"}}><div style={{position:"absolute",bottom:0,width:"100%",height:doneH,background:"#34d399"}}/><div style={{position:"absolute",bottom:doneH,width:"100%",height:barH-doneH,background:isNow?"#6366f1":"#818cf840"}}/></div></div><span style={{fontSize:9,color:isNow?"#818cf8":t.text5,fontWeight:isNow?700:400}}>{label}</span></div>);})}
          </div>
          <div style={{display:"flex",gap:12,marginTop:10}}><div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:10,height:10,borderRadius:3,background:"#34d399"}}/><span style={{fontSize:11,color:t.text4}}>완료</span></div><div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:10,height:10,borderRadius:3,background:"#818cf840",border:"1px solid #818cf8"}}/><span style={{fontSize:11,color:t.text4}}>진행 중</span></div></div>
        </div>
      )}
      <div style={s}><div style={{fontSize:11,fontWeight:700,color:t.text4,marginBottom:10,textTransform:"uppercase",letterSpacing:".5px"}}>완료율</div><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{flex:1,background:t.bg,borderRadius:99,height:7}}><div style={{width:rate+"%",background:"linear-gradient(90deg,#6366f1,#34d399)",height:"100%",borderRadius:99,transition:"width .4s"}}/></div><span style={{fontSize:14,fontWeight:800,color:"#818cf8"}}>{rate}%</span></div></div>
      <div style={s}><div style={{fontSize:11,fontWeight:700,color:t.text4,marginBottom:12,textTransform:"uppercase",letterSpacing:".5px"}}>제작 단계별</div>{STAGES.map(st=>{const c=filtered.filter(tk=>tk.status===st).length;return(<div key={st} style={{marginBottom:9}}><div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}><span style={{color:STAGE_COLOR[st]}}>{STAGE_ICON[st]} {st}</span><span style={{color:t.text4}}>{c}</span></div><div style={{background:t.bg,borderRadius:99,height:5}}><div style={{width:total?(c/total*100)+"%":"0%",background:STAGE_COLOR[st],height:"100%",borderRadius:99}}/></div></div>);})}</div>
      <div style={s}><div style={{fontSize:11,fontWeight:700,color:t.text4,marginBottom:12,textTransform:"uppercase",letterSpacing:".5px"}}>담당자별</div>{[...new Set(filtered.map(tk=>tk.assignee))].map(m=>{const d=filtered.filter(tk=>tk.assignee===m&&tk.status==="업로드 완료").length,tt=filtered.filter(tk=>tk.assignee===m).length;return(<div key={m} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}><div style={{display:"flex",gap:7,alignItems:"center"}}><Avatar name={m} size={20}/><span style={{fontSize:12,color:t.text2}}>{m}</span></div><span style={{fontSize:11,color:t.text4}}>{d}/{tt} 완료</span></div><div style={{background:t.bg,borderRadius:99,height:5}}><div style={{width:tt?(d/tt*100)+"%":"0%",background:"#6366f1",height:"100%",borderRadius:99}}/></div></div>);})}</div>
    </div>
  );
}

// ── Task Detail Modal ─────────────────────────────────────────
function TaskDetailModal({ task, onClose, onUpdate, onMove, users }) {
  const { t } = useTheme();
  const [comment, setComment] = useState("");
  const [author, setAuthor] = useState(users.filter(u=>u.approved&&u.role!=="admin")[0]?.name||"");
  const idx = STAGES.indexOf(task.status);
  const addComment = () => {
    if (!comment.trim()) return;
    onUpdate({...task,comments:[...(task.comments||[]),{id:`c_${Date.now()}`,author,text:comment.trim(),time:new Date().toLocaleString("ko-KR",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}]});
    setComment("");
  };
  return (
    <div style={{position:"fixed",inset:0,background:"#00000099",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}}>
      <div style={{background:t.surface,borderRadius:18,width:460,maxHeight:"85vh",display:"flex",flexDirection:"column",border:`1px solid ${t.border}`,boxShadow:"0 24px 64px #000c"}}>
        <div style={{padding:"18px 22px 14px",borderBottom:`1px solid ${t.border}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap"}}>
                <span style={{fontSize:11,color:STAGE_COLOR[task.status],background:STAGE_COLOR[task.status]+"18",padding:"2px 9px",borderRadius:20,fontWeight:700}}>{STAGE_ICON[task.status]} {task.status}</span>
                <span style={{fontSize:11,color:PRIORITY_COLOR[task.priority],background:PRIORITY_COLOR[task.priority]+"18",padding:"2px 9px",borderRadius:20,fontWeight:700}}>{task.priority}</span>
              </div>
              <div style={{fontSize:16,fontWeight:800,color:t.text}}>{task.title}</div>
              <div style={{fontSize:12,color:t.text4,marginTop:3}}>{task.desc}</div>
              <div style={{display:"flex",gap:14,marginTop:10}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}><Avatar name={task.assignee} size={18} users={users}/><span style={{fontSize:12,color:t.text3}}>{task.assignee}</span></div>
                <span style={{fontSize:12,color:t.text4}}>📅 {task.due}</span>
              </div>
            </div>
            <button onClick={onClose} style={{background:"none",border:"none",color:t.text5,cursor:"pointer",fontSize:20,padding:0,marginLeft:12}}>×</button>
          </div>
          <div style={{display:"flex",gap:6,marginTop:12}}>
            {idx>0&&<button onClick={()=>{onMove(task.id,-1);onClose();}} style={{flex:1,background:t.surface2,border:`1px solid ${t.border2}`,borderRadius:8,padding:"6px 0",fontSize:11,cursor:"pointer",color:t.text4}}>← {STAGES[idx-1]}</button>}
            {idx<STAGES.length-1&&<button onClick={()=>{onMove(task.id,1);onClose();}} style={{flex:1,background:"#6366f120",border:"1px solid #6366f140",borderRadius:8,padding:"6px 0",fontSize:11,cursor:"pointer",color:"#818cf8",fontWeight:700}}>{STAGES[idx+1]} →</button>}
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"14px 22px"}}>
          <div style={{fontSize:11,fontWeight:700,color:t.text4,marginBottom:12,textTransform:"uppercase",letterSpacing:".5px"}}>코멘트 {(task.comments||[]).length>0&&`· ${task.comments.length}`}</div>
          {(task.comments||[]).length===0&&<div style={{textAlign:"center",padding:"20px 0",color:t.text5,fontSize:13}}>아직 코멘트가 없습니다</div>}
          {(task.comments||[]).map(c=>(
            <div key={c.id} style={{display:"flex",gap:10,marginBottom:12}}>
              <Avatar name={c.author} size={26} users={users}/>
              <div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:12,fontWeight:700,color:t.text2}}>{c.author}</span>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span style={{fontSize:10,color:t.text5}}>{c.time}</span>
                    <button onClick={()=>onUpdate({...task,comments:(task.comments||[]).filter(x=>x.id!==c.id)})} style={{background:"none",border:"none",color:t.text5,cursor:"pointer",fontSize:13,padding:0}}>×</button>
                  </div>
                </div>
                <div style={{background:t.surface2,borderRadius:9,padding:"9px 12px",fontSize:13,color:t.text2,lineHeight:1.6}}>{c.text}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{padding:"12px 22px 18px",borderTop:`1px solid ${t.border}`}}>
          <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap"}}>
            {users.filter(u=>u.approved&&u.role!=="admin").map((u,i)=>(
              <button key={u.name} onClick={()=>setAuthor(u.name)} style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:20,border:`1px solid ${author===u.name?AVATAR_COLORS[i%AVATAR_COLORS.length]:t.border}`,background:author===u.name?AVATAR_COLORS[i%AVATAR_COLORS.length]+"20":"transparent",cursor:"pointer"}}>
                <Avatar name={u.name} size={14} users={users}/><span style={{fontSize:11,color:author===u.name?AVATAR_COLORS[i%AVATAR_COLORS.length]:t.text4,fontWeight:600}}>{u.name}</span>
              </button>
            ))}
          </div>
          <div style={{display:"flex",gap:7}}>
            <input value={comment} onChange={e=>setComment(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addComment()} placeholder="코멘트 입력..." style={{flex:1,background:t.inputBg,border:`1px solid ${t.inputBorder}`,borderRadius:9,padding:"9px 13px",fontSize:13,color:t.text,outline:"none"}}/>
            <button onClick={addComment} style={{background:"#6366f1",border:"none",borderRadius:9,padding:"0 15px",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>전송</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Add Task Modal ────────────────────────────────────────────
function AddTaskModal({ onAdd, onClose, defaultDate, users }) {
  const { t } = useTheme();
  const memberNames = users.filter(u=>u.approved&&u.role!=="admin").map(u=>u.name);
  const [form, setForm] = useState({title:"",desc:"",assignee:memberNames[0]||"",priority:"중간",tag:TAGS[0],due:defaultDate||"",status:"기획"});
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const inp = {width:"100%",background:t.inputBg,border:`1px solid ${t.inputBorder}`,borderRadius:9,padding:"9px 12px",fontSize:13,color:t.text,boxSizing:"border-box",outline:"none"};
  return (
    <div style={{position:"fixed",inset:0,background:"#00000099",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}}>
      <div style={{background:t.surface,borderRadius:18,padding:"22px 26px",width:370,border:`1px solid ${t.border}`,boxShadow:"0 24px 64px #000c"}}>
        <div style={{fontWeight:800,fontSize:15,marginBottom:18,color:t.text}}>새 영상 추가</div>
        {[["제목","title","text"],["설명","desc","text"],["마감일","due","date"]].map(([l,k,tp])=>(
          <div key={k} style={{marginBottom:11}}><div style={{fontSize:11,color:t.text4,marginBottom:4,fontWeight:600}}>{l}</div><input type={tp} value={form[k]} onChange={e=>set(k,e.target.value)} style={inp}/></div>
        ))}
        {[["담당자","assignee",memberNames.length?memberNames:["미배정"]],["우선순위","priority",PRIORITIES],["플랫폼","tag",TAGS],["단계","status",STAGES]].map(([l,k,opts])=>(
          <div key={k} style={{marginBottom:11}}><div style={{fontSize:11,color:t.text4,marginBottom:4,fontWeight:600}}>{l}</div><select value={form[k]} onChange={e=>set(k,e.target.value)} style={{...inp,cursor:"pointer"}}>{opts.map(o=><option key={o}>{o}</option>)}</select></div>
        ))}
        <div style={{display:"flex",gap:8,marginTop:18}}>
          <button onClick={onClose} style={{flex:1,background:t.surface2,border:`1px solid ${t.border2}`,borderRadius:9,padding:"10px 0",cursor:"pointer",color:t.text3,fontWeight:600}}>취소</button>
          <button onClick={()=>{if(form.title){onAdd({...form,id:`task_${Date.now()}`,comments:[]});onClose();}}} style={{flex:1,background:"#6366f1",border:"none",borderRadius:9,padding:"10px 0",cursor:"pointer",color:"#fff",fontWeight:700}}>추가</button>
        </div>
      </div>
    </div>
  );
}

// ── Calendar ──────────────────────────────────────────────────
function CalendarView({ tasks, onSelectTask, onAddTask }) {
  const { t } = useTheme();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const firstDay=new Date(year,month,1).getDay(), daysInMonth=new Date(year,month+1,0).getDate(), prevDays=new Date(year,month,0).getDate();
  const cells=[];
  for(let i=firstDay-1;i>=0;i--) cells.push({day:prevDays-i,cur:false});
  for(let i=1;i<=daysInMonth;i++) cells.push({day:i,cur:true});
  while(cells.length%7!==0) cells.push({day:cells.length-firstDay-daysInMonth+1,cur:false});
  const pad=n=>String(n).padStart(2,"0");
  const dateStr=d=>`${year}-${pad(month+1)}-${pad(d)}`;
  const tasksOn=d=>tasks.filter(tk=>tk.due===dateStr(d));
  const isToday=d=>d===today.getDate()&&month===today.getMonth()&&year===today.getFullYear();
  const prevMonth=()=>{if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1);};
  const nextMonth=()=>{if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1);};
  const monthTasks=tasks.filter(tk=>tk.due?.startsWith(`${year}-${pad(month+1)}`));
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <button onClick={prevMonth} style={{background:t.surface2,border:`1px solid ${t.border}`,borderRadius:8,padding:"7px 14px",color:t.text3,cursor:"pointer",fontSize:14}}>‹</button>
        <div style={{textAlign:"center"}}><div style={{fontSize:20,fontWeight:800,color:t.text}}>{year}년 {month+1}월</div><div style={{fontSize:12,color:t.text4,marginTop:2}}>{monthTasks.length}개 영상</div></div>
        <button onClick={nextMonth} style={{background:t.surface2,border:`1px solid ${t.border}`,borderRadius:8,padding:"7px 14px",color:t.text3,cursor:"pointer",fontSize:14}}>›</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",marginBottom:4}}>
        {WEEKDAYS.map((w,i)=><div key={w} style={{textAlign:"center",fontSize:11,fontWeight:700,padding:"6px 0",color:i===0?"#f87171":i===6?"#818cf8":t.text4}}>{w}</div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
        {cells.map((cell,i)=>{
          const dayTasks=cell.cur?tasksOn(cell.day):[];const col=i%7;
          return(<div key={i} onClick={()=>cell.cur&&onAddTask(dateStr(cell.day))} style={{minHeight:88,background:cell.cur?(isToday(cell.day)?"#1e1b4b":t.surface):t.bg,borderRadius:10,padding:"7px 7px 5px",border:`1px solid ${isToday(cell.day)?"#6366f1":t.border}`,cursor:cell.cur?"pointer":"default"}} onMouseEnter={e=>{if(cell.cur)e.currentTarget.style.borderColor=t.border2;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=isToday(cell.day)?"#6366f1":t.border;}}>
            <div style={{fontSize:12,fontWeight:isToday(cell.day)?800:500,color:!cell.cur?t.border2:isToday(cell.day)?"#818cf8":col===0?"#f87171":col===6?"#818cf8":t.text3,marginBottom:4,display:"flex",justifyContent:"space-between"}}>
              <span>{cell.day}</span>{isToday(cell.day)&&<span style={{fontSize:9,background:"#6366f1",color:"#fff",borderRadius:99,padding:"1px 5px",fontWeight:700}}>오늘</span>}
            </div>
            {dayTasks.slice(0,3).map(tk=><div key={tk.id} onClick={e=>{e.stopPropagation();onSelectTask(tk);}} style={{background:STAGE_COLOR[tk.status]+"25",border:`1px solid ${STAGE_COLOR[tk.status]}40`,borderRadius:5,padding:"2px 5px",fontSize:10,color:STAGE_COLOR[tk.status],fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",marginBottom:2,cursor:"pointer"}}>{STAGE_ICON[tk.status]} {tk.title}</div>)}
            {dayTasks.length>3&&<div style={{fontSize:10,color:t.text4}}>+{dayTasks.length-3}</div>}
          </div>);
        })}
      </div>
      {monthTasks.length>0&&(
        <div style={{marginTop:18,background:t.surface,borderRadius:14,border:`1px solid ${t.border}`,overflow:"hidden"}}>
          <div style={{padding:"11px 18px",borderBottom:`1px solid ${t.border}`,fontSize:12,fontWeight:700,color:t.text4,textTransform:"uppercase",letterSpacing:".5px"}}>{month+1}월 스케줄 목록</div>
          {monthTasks.sort((a,b)=>a.due.localeCompare(b.due)).map((tk,i)=>(
            <div key={tk.id} onClick={()=>onSelectTask(tk)} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 18px",borderBottom:i<monthTasks.length-1?`1px solid ${t.border}`:"none",cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background=t.surface2} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <div style={{width:3,height:30,borderRadius:99,background:STAGE_COLOR[tk.status],flexShrink:0}}/>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:t.text}}>{tk.title}</div><div style={{fontSize:11,color:t.text4,marginTop:1}}>{STAGE_ICON[tk.status]} {tk.status} · {tk.tag}</div></div>
              <div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:11,color:t.text4}}>{tk.due.slice(5)}</span><span style={{fontSize:10,color:PRIORITY_COLOR[tk.priority],background:PRIORITY_COLOR[tk.priority]+"18",padding:"2px 7px",borderRadius:20,fontWeight:700}}>{tk.priority}</span></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Board ─────────────────────────────────────────────────────
function BoardView({ tasks, onSelectTask, onMove, onDelete, users }) {
  const { t } = useTheme();
  const memberNames = ["전체",...users.filter(u=>u.approved&&u.role!=="admin").map(u=>u.name)];
  const [filterMember, setFilterMember] = useState("전체");
  const filtered = filterMember==="전체"?tasks:tasks.filter(tk=>tk.assignee===filterMember);
  return (
    <div>
      <div style={{display:"flex",gap:6,marginBottom:16}}>{memberNames.map(m=><button key={m} onClick={()=>setFilterMember(m)} style={{padding:"5px 14px",borderRadius:20,border:`1px solid ${filterMember===m?"#6366f1":t.border}`,background:filterMember===m?"#6366f120":"transparent",cursor:"pointer",fontSize:12,fontWeight:600,color:filterMember===m?"#818cf8":t.text4}}>{m}</button>)}</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12}}>
        {STAGES.map(col=>{
          const colTasks=filtered.filter(tk=>tk.status===col);
          return(<div key={col} style={{background:t.surface,borderRadius:14,padding:"12px 10px",border:`1px solid ${t.border}`}}>
            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:12,paddingBottom:10,borderBottom:`1px solid ${t.border}`}}><span>{STAGE_ICON[col]}</span><span style={{fontWeight:700,fontSize:12,color:t.text3}}>{col}</span><span style={{marginLeft:"auto",background:STAGE_COLOR[col]+"20",color:STAGE_COLOR[col],borderRadius:99,padding:"1px 8px",fontSize:11,fontWeight:700}}>{colTasks.length}</span></div>
            {colTasks.map(tk=><div key={tk.id} onClick={()=>onSelectTask(tk)} style={{background:t.surface2,borderRadius:11,padding:"11px 13px",marginBottom:8,border:`1px solid ${t.border}`,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.borderColor=t.border2} onMouseLeave={e=>e.currentTarget.style.borderColor=t.border}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontWeight:600,fontSize:13,color:t.text,flex:1}}>{tk.title}</span><button onClick={e=>{e.stopPropagation();onDelete(tk.id);}} style={{background:"none",border:"none",color:t.text5,cursor:"pointer",fontSize:14,padding:0}}>×</button></div>
              <div style={{display:"flex",gap:5,marginBottom:8}}><span style={{fontSize:10,color:PRIORITY_COLOR[tk.priority],background:PRIORITY_COLOR[tk.priority]+"18",padding:"2px 7px",borderRadius:20,fontWeight:700}}>{tk.priority}</span><span style={{fontSize:10,color:TAG_COLOR[tk.tag]||"#818cf8",background:(TAG_COLOR[tk.tag]||"#818cf8")+"18",padding:"2px 7px",borderRadius:20,fontWeight:700}}>{tk.tag}</span></div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><div style={{display:"flex",alignItems:"center",gap:5}}><Avatar name={tk.assignee} size={18} users={users}/><span style={{fontSize:11,color:t.text3}}>{tk.assignee}</span></div><div style={{display:"flex",gap:8}}>{(tk.comments||[]).length>0&&<span style={{fontSize:10,color:t.text4}}>💬{tk.comments.length}</span>}<span style={{fontSize:10,color:t.text4}}>{tk.due?.slice(5)}</span></div></div>
              <div style={{display:"flex",gap:5}} onClick={e=>e.stopPropagation()}>{STAGES.indexOf(tk.status)>0&&<button onClick={()=>onMove(tk.id,-1)} style={{flex:1,background:t.bg,border:`1px solid ${t.border}`,borderRadius:6,padding:"4px 0",fontSize:10,cursor:"pointer",color:t.text4}}>← 이전</button>}{STAGES.indexOf(tk.status)<STAGES.length-1&&<button onClick={()=>onMove(tk.id,1)} style={{flex:1,background:"#6366f118",border:"1px solid #6366f130",borderRadius:6,padding:"4px 0",fontSize:10,cursor:"pointer",color:"#818cf8",fontWeight:700}}>다음 →</button>}</div>
            </div>)}
            {colTasks.length===0&&<div style={{textAlign:"center",padding:"22px 0",color:t.text5,fontSize:12}}>비어있음</div>}
          </div>);
        })}
      </div>
    </div>
  );
}

// ── AI Panel ──────────────────────────────────────────────────
function AIPanel({ tasks, users }) {
  const { t } = useTheme();
  const [report,setReport]=useState(""), [insight,setInsight]=useState("");
  const [lR,setLR]=useState(false), [lI,setLI]=useState(false);
  const [messages,setMessages]=useState([{role:"assistant",content:"안녕하세요! TIMBEL 영상 제작 스케줄러 AI 어시스턴트입니다. 무엇이든 물어보세요 😊"}]);
  const [input,setInput]=useState(""), [chatLoading,setChatLoading]=useState(false);
  const summary=tasks.map(tk=>`[${tk.status}] ${tk.title} (담당: ${tk.assignee}, 플랫폼: ${tk.tag}, 우선순위: ${tk.priority}, 마감: ${tk.due})`).join("\n");
  async function callAI(prompt,set,setL){setL(true);set("");try{const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1000,system:"당신은 영상 크리에이터 팀의 전문 매니저입니다. 한국어로 명확하게 답변하세요.",messages:[{role:"user",content:prompt}]})});const data=await res.json();set(data.content.map(c=>c.text||"").join("\n"));}catch{set("오류가 발생했습니다.");}setL(false);}
  async function sendChat(){if(!input.trim()||chatLoading)return;const userMsg=input.trim();setInput("");const newMessages=[...messages,{role:"user",content:userMsg}];setMessages(newMessages);setChatLoading(true);try{const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1000,system:`당신은 TIMBEL 영상 제작 팀의 AI 어시스턴트입니다. 스케줄 데이터 참고해서 한국어로 친절하게 답변하세요.\n\n현재 스케줄:\n${summary}`,messages:newMessages.map(m=>({role:m.role,content:m.content}))})});const data=await res.json();setMessages(prev=>[...prev,{role:"assistant",content:data.content.map(c=>c.text||"").join("\n")}]);}catch{setMessages(prev=>[...prev,{role:"assistant",content:"오류가 발생했습니다."}]);}setChatLoading(false);}
  const suggestions=["현재 마감 임박한 영상 알려줘","편집 단계 영상 몇 개야?","이번 달 업로드 완료 영상은?","제작 효율 개선 방법 알려줘"];
  const s={background:t.surface,borderRadius:13,padding:"17px 19px",border:`1px solid ${t.border}`,marginBottom:12};
  const btn=(l,bg)=>({width:"100%",padding:"10px 0",border:"none",borderRadius:8,fontWeight:700,fontSize:13,cursor:l?"not-allowed":"pointer",background:l?t.surface2:bg,color:l?t.text4:"#fff",marginTop:12});
  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,alignItems:"start"}}>
      <div>
        <div style={s}><div style={{fontSize:14,fontWeight:700,color:t.text,marginBottom:3}}>📄 제작 현황 요약</div><div style={{fontSize:12,color:t.text4}}>현재 영상 제작 현황을 AI가 요약합니다</div><button disabled={lR} style={btn(lR,"#6366f1")} onClick={()=>callAI(`다음 영상 제작 현황을 요약 리포트로 작성해주세요.\n\n${summary}`,setReport,setLR)}>{lR?"생성 중...":"리포트 생성"}</button>{report&&<div style={{marginTop:12,background:t.bg,borderRadius:9,padding:"12px 14px",fontSize:12,color:t.text2,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{report}</div>}</div>
        <div style={s}><div style={{fontSize:14,fontWeight:700,color:t.text,marginBottom:3}}>💡 생산성 인사이트</div><div style={{fontSize:12,color:t.text4}}>병목 지점과 개선 방향을 분석합니다</div><button disabled={lI} style={btn(lI,"#ec4899")} onClick={()=>callAI(`다음 영상 제작 데이터를 분석해서 인사이트와 개선 제안 3가지 제공해주세요.\n\n${summary}`,setInsight,setLI)}>{lI?"분석 중...":"인사이트 분석"}</button>{insight&&<div style={{marginTop:12,background:t.bg,borderRadius:9,padding:"12px 14px",fontSize:12,color:t.text2,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{insight}</div>}</div>
      </div>
      <div style={{background:t.surface,borderRadius:13,border:`1px solid ${t.border}`,display:"flex",flexDirection:"column",height:600}}>
        <div style={{padding:"14px 16px",borderBottom:`1px solid ${t.border}`,display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,#6366f1,#ec4899)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🤖</div>
          <div><div style={{fontSize:13,fontWeight:700,color:t.text}}>AI 어시스턴트</div><div style={{fontSize:11,color:"#34d399",display:"flex",alignItems:"center",gap:4}}><div style={{width:6,height:6,borderRadius:"50%",background:"#34d399"}}/> 온라인</div></div>
          <button onClick={()=>setMessages([{role:"assistant",content:"안녕하세요! TIMBEL 영상 제작 스케줄러 AI 어시스턴트입니다. 무엇이든 물어보세요 😊"}])} style={{marginLeft:"auto",background:t.surface2,border:`1px solid ${t.border}`,borderRadius:7,padding:"4px 10px",fontSize:11,color:t.text4,cursor:"pointer"}}>초기화</button>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"14px 14px 8px",display:"flex",flexDirection:"column",gap:10}}>
          {messages.map((m,i)=><div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",gap:8,alignItems:"flex-end"}}>{m.role==="assistant"&&<div style={{width:26,height:26,borderRadius:8,background:"linear-gradient(135deg,#6366f1,#ec4899)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>🤖</div>}<div style={{maxWidth:"78%",padding:"10px 13px",borderRadius:m.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px",background:m.role==="user"?"#6366f1":t.surface2,color:m.role==="user"?"#fff":t.text,fontSize:13,lineHeight:1.65,whiteSpace:"pre-wrap",border:m.role==="user"?"none":`1px solid ${t.border}`}}>{m.content}</div>{m.role==="user"&&<Avatar name={users.filter(u=>u.role!=="admin")[0]?.name||"나"} size={26} users={users}/>}</div>)}
          {chatLoading&&<div style={{display:"flex",gap:8,alignItems:"flex-end"}}><div style={{width:26,height:26,borderRadius:8,background:"linear-gradient(135deg,#6366f1,#ec4899)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>🤖</div><div style={{padding:"10px 14px",borderRadius:"14px 14px 14px 4px",background:t.surface2,border:`1px solid ${t.border}`,display:"flex",gap:4,alignItems:"center"}}>{[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:t.text5,animation:`bounce 1s ${i*0.15}s infinite`}}/>)}</div></div>}
          <div ref={el=>{if(el)el.scrollIntoView({behavior:"smooth"});}}/>
        </div>
        {messages.length<=1&&<div style={{padding:"0 12px 8px",display:"flex",flexWrap:"wrap",gap:5}}>{suggestions.map(sg=><button key={sg} onClick={()=>setInput(sg)} style={{background:t.bg,border:`1px solid ${t.border}`,borderRadius:20,padding:"4px 10px",fontSize:11,color:t.text4,cursor:"pointer"}}>{sg}</button>)}</div>}
        <div style={{padding:"10px 12px 12px",borderTop:`1px solid ${t.border}`}}>
          <div style={{display:"flex",gap:8}}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&sendChat()} placeholder="메시지를 입력하세요..." style={{flex:1,background:t.inputBg,border:`1px solid ${t.inputBorder}`,borderRadius:10,padding:"9px 13px",fontSize:13,color:t.text,outline:"none"}}/>
            <button onClick={sendChat} disabled={chatLoading||!input.trim()} style={{background:input.trim()&&!chatLoading?"#6366f1":t.surface2,border:"none",borderRadius:10,width:40,height:40,display:"flex",alignItems:"center",justifyContent:"center",cursor:input.trim()&&!chatLoading?"pointer":"not-allowed",fontSize:16}}>➤</button>
          </div>
          <div style={{fontSize:10,color:t.text5,marginTop:6,textAlign:"center"}}>현재 스케줄 데이터를 기반으로 답변합니다</div>
        </div>
      </div>
      <style>{`@keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}`}</style>
    </div>
  );
}

// ── Ad Panel ──────────────────────────────────────────────────
function AdPanel() {
  const { t } = useTheme();
  const [adTab,setAdTab]=useState("ai");
  const [aiAds,setAiAds]=useFirebaseData("ads/ai",[]);
  const [intAds,setIntAds]=useFirebaseData("ads/interview",[]);
  const [selected,setSelected]=useState(null);
  const [selectedType,setSelectedType]=useState(null);

  const updateAi=u=>setAiAds(aiAds.map(a=>a.id===u.id?u:a));
  const updateInt=u=>setIntAds(intAds.map(a=>a.id===u.id?u:a));
  const addAiAd=()=>setAiAds([...aiAds,{id:`ad_${Date.now()}`,requester:"",content:"새 광고",requestDate:"",planUrl:"",refUrl:"",planConfirm:"컨펌중",workRequest:"기획중",resizing:"",workStatus:"기획중",workDate:"",expectedDate:"",completedDate:"",confirmRequestDate:"",videoUrl:"",finalConfirm:"컨펌중",modifyContent:"",modifyStatus:"대기",note:"",uploadDate:"",insta:"-",youtube:"-"}]);
  const addIntAd=()=>setIntAds([...intAds,{id:`int_${Date.now()}`,requester:"영상팀",questionUrl:"",content:"새 인터뷰 광고",shootDate:"",editStart:"",roughCut:"",questionConfirm:"컨펌중",modify:"대기",modifyContent:"",request:"",extra:"",phrase:"",workStatus:"기획중",workDate:"",expectedDate:"",completedDate:"",confirmRequestDate:"",videoUrl:"",finalConfirm:"컨펌중",modifyContent2:"",modifyStatus:"대기",note:"",uploadDate:"",insta:"-",youtube:"-"}]);

  const thS={padding:"9px 11px",fontSize:11,fontWeight:700,color:t.text4,textAlign:"left",whiteSpace:"nowrap",borderBottom:`1px solid ${t.border}`,textTransform:"uppercase",letterSpacing:".4px",background:t.bg};
  const tdS={padding:"9px 11px",fontSize:12,color:t.text2,borderBottom:`1px solid ${t.border}`,verticalAlign:"middle",whiteSpace:"nowrap"};
  const adTabStyle=tab=>({padding:"6px 16px",background:adTab===tab?"#6366f120":"transparent",border:`1px solid ${adTab===tab?"#6366f1":t.border}`,borderRadius:20,cursor:"pointer",fontSize:12,fontWeight:adTab===tab?700:500,color:adTab===tab?"#818cf8":t.text4});
  const ads=adTab==="ai"?aiAds:intAds;
  const updateAd=adTab==="ai"?updateAi:updateInt;
  const deleteAd=id=>adTab==="ai"?setAiAds(aiAds.filter(a=>a.id!==id)):setIntAds(intAds.filter(a=>a.id!==id));

  return(
    <div>
      {selected&&<AdDetailModal ad={selected} type={selectedType} onClose={()=>setSelected(null)} onUpdate={v=>{updateAd(v);setSelected(null);}}/>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{display:"flex",gap:6}}>
          <button style={adTabStyle("ai")} onClick={()=>setAdTab("ai")}>🤖 타사 광고 (AI 포함)</button>
          <button style={adTabStyle("int")} onClick={()=>setAdTab("int")}>🎙️ 인터뷰 파생 광고</button>
        </div>
        <button onClick={adTab==="ai"?addAiAd:addIntAd} style={{background:"#6366f1",border:"none",borderRadius:8,padding:"7px 14px",fontWeight:700,fontSize:12,color:"#fff",cursor:"pointer"}}>+ 추가</button>
      </div>
      <div style={{background:t.surface,borderRadius:14,border:`1px solid ${t.border}`,overflow:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:1000}}>
          <thead><tr>{(adTab==="ai"?["요청자","요청 내용","요청일","기획안","레퍼런스","기획 컨펌","제작 요청","리사이징","작업 상태","제작일","예상완료","영상URL","최종 컨펌","수정 상태","인스타","유튜브","업로드일",""] : ["요청자","요청 내용","촬영일","편집 시작","가편집","질문지 컨펌","수정","요청사항","마케팅 문구","작업 상태","예상완료","영상URL","최종 컨펌","수정 상태","인스타","유튜브","업로드일",""]).map(h=><th key={h} style={thS}>{h}</th>)}</tr></thead>
          <tbody>{ads.map(ad=>(
            <tr key={ad.id} onClick={()=>{setSelected(ad);setSelectedType(adTab);}} style={{cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background=t.surface2} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <td style={tdS}><span style={{fontWeight:600,color:t.text}}>{ad.requester||"-"}</span></td>
              <td style={{...tdS,maxWidth:140,overflow:"hidden",textOverflow:"ellipsis"}}>{ad.content}</td>
              <td style={tdS}>{adTab==="ai"?(ad.requestDate||"-"):(ad.shootDate||"-")}</td>
              <td style={tdS}>{adTab==="ai"?<UrlCell url={ad.planUrl}/>:(ad.editStart||"-")}</td>
              <td style={tdS}>{adTab==="ai"?<UrlCell url={ad.refUrl}/>:(ad.roughCut||"-")}</td>
              <td style={tdS}>{adTab==="ai"?<StatusBadge value={ad.planConfirm} options={CONFIRM_STATUS} colorMap={CONFIRM_COLOR} onChange={v=>updateAd({...ad,planConfirm:v})}/>:<StatusBadge value={ad.questionConfirm} options={CONFIRM_STATUS} colorMap={CONFIRM_COLOR} onChange={v=>updateAd({...ad,questionConfirm:v})}/>}</td>
              <td style={tdS}>{adTab==="ai"?<StatusBadge value={ad.workRequest} options={WORK_STATUS} colorMap={WORK_COLOR} onChange={v=>updateAd({...ad,workRequest:v})}/>:<StatusBadge value={ad.modify} options={["수정완료","수정중","대기"]} colorMap={{"수정완료":"#34d399","수정중":"#f87171","대기":"#fbbf24"}} onChange={v=>updateAd({...ad,modify:v})}/>}</td>
              <td style={{...tdS,maxWidth:110,overflow:"hidden",textOverflow:"ellipsis"}}><span style={{fontSize:11,color:t.text4}}>{adTab==="ai"?(ad.resizing||"-"):(ad.request||"-")}</span></td>
              <td style={{...tdS,maxWidth:100}}><span style={{fontSize:11,color:t.text4}}>{adTab==="ai"?"":(ad.phrase||"-")}</span></td>
              <td style={tdS}><StatusBadge value={ad.workStatus} options={WORK_STATUS} colorMap={WORK_COLOR} onChange={v=>updateAd({...ad,workStatus:v})}/></td>
              <td style={tdS}>{ad.expectedDate||"-"}</td>
              <td style={tdS}><UrlCell url={ad.videoUrl}/></td>
              <td style={tdS}><StatusBadge value={ad.finalConfirm} options={CONFIRM_STATUS} colorMap={CONFIRM_COLOR} onChange={v=>updateAd({...ad,finalConfirm:v})}/></td>
              <td style={tdS}><StatusBadge value={ad.modifyStatus} options={MODIFY_STATUS} colorMap={{"수정 완료":"#34d399","수정중":"#f87171","대기":"#fbbf24"}} onChange={v=>updateAd({...ad,modifyStatus:v})}/></td>
              <td style={tdS}><StatusBadge value={ad.insta} options={UPLOAD_STATUS} colorMap={{"완료":"#34d399","예정":"#fbbf24","-":"#6b7280"}} onChange={v=>updateAd({...ad,insta:v})}/></td>
              <td style={tdS}><StatusBadge value={ad.youtube} options={UPLOAD_STATUS} colorMap={{"완료":"#34d399","예정":"#fbbf24","-":"#6b7280"}} onChange={v=>updateAd({...ad,youtube:v})}/></td>
              <td style={tdS}>{ad.uploadDate||"-"}</td>
              <td style={tdS}><button onClick={e=>{e.stopPropagation();deleteAd(ad.id);}} style={{background:"none",border:"none",color:t.text5,cursor:"pointer",fontSize:15}}>×</button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

function AdDetailModal({ ad, type, onClose, onUpdate }) {
  const { t } = useTheme();
  const [form, setForm] = useState({...ad});
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const inp = {width:"100%",background:t.inputBg,border:`1px solid ${t.inputBorder}`,borderRadius:8,padding:"7px 10px",fontSize:12,color:t.text,boxSizing:"border-box",outline:"none"};
  const ta = {...inp,minHeight:56,resize:"vertical"};
  const lbl = tx => <div style={{fontSize:11,color:t.text4,marginBottom:4,fontWeight:600}}>{tx}</div>;
  const aiF=[["요청자","requester"],["요청 내용","content"],["요청일","requestDate","date"],["기획안 URL","planUrl"],["레퍼런스 URL","refUrl"],["리사이징","resizing"],["제작일","workDate","date"],["예상 완료일","expectedDate","date"],["실제 완료일","completedDate","date"],["컨펌 요청일","confirmRequestDate","date"],["영상 URL","videoUrl"],["수정 내용","modifyContent","textarea"],["업로드일","uploadDate","date"],["비고","note"]];
  const intF=[["요청자","requester"],["요청 내용","content"],["촬영일","shootDate","date"],["편집 시작","editStart","date"],["가편집 전달","roughCut","date"],["수정 내용","modifyContent","textarea"],["요청사항","request"],["추가 사항","extra"],["마케팅 문구","phrase"],["제작일","workDate","date"],["예상 완료일","expectedDate","date"],["실제 완료일","completedDate","date"],["컨펌 요청일","confirmRequestDate","date"],["영상 URL","videoUrl"],["수정 내용2","modifyContent2","textarea"],["업로드일","uploadDate","date"],["비고","note"]];
  const fields = type==="ai"?aiF:intF;
  return(
    <div style={{position:"fixed",inset:0,background:"#00000099",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}}>
      <div style={{background:t.surface,borderRadius:18,width:520,maxHeight:"88vh",display:"flex",flexDirection:"column",border:`1px solid ${t.border}`,boxShadow:"0 24px 64px #000c"}}>
        <div style={{padding:"18px 22px 14px",borderBottom:`1px solid ${t.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{fontSize:15,fontWeight:800,color:t.text}}>{form.content||"광고 상세"}</div><button onClick={onClose} style={{background:"none",border:"none",color:t.text5,cursor:"pointer",fontSize:20}}>×</button></div>
        <div style={{flex:1,overflowY:"auto",padding:"14px 22px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div style={{gridColumn:"1/-1",display:"flex",gap:7,flexWrap:"wrap"}}>
            {type==="ai"?<><div><div style={{fontSize:10,color:t.text4,marginBottom:3}}>기획 컨펌</div><StatusBadge value={form.planConfirm} options={CONFIRM_STATUS} colorMap={CONFIRM_COLOR} onChange={v=>set("planConfirm",v)}/></div><div><div style={{fontSize:10,color:t.text4,marginBottom:3}}>제작 요청</div><StatusBadge value={form.workRequest} options={WORK_STATUS} colorMap={WORK_COLOR} onChange={v=>set("workRequest",v)}/></div><div><div style={{fontSize:10,color:t.text4,marginBottom:3}}>작업 상태</div><StatusBadge value={form.workStatus} options={WORK_STATUS} colorMap={WORK_COLOR} onChange={v=>set("workStatus",v)}/></div></>:<><div><div style={{fontSize:10,color:t.text4,marginBottom:3}}>질문지 컨펌</div><StatusBadge value={form.questionConfirm} options={CONFIRM_STATUS} colorMap={CONFIRM_COLOR} onChange={v=>set("questionConfirm",v)}/></div><div><div style={{fontSize:10,color:t.text4,marginBottom:3}}>수정 여부</div><StatusBadge value={form.modify} options={["수정완료","수정중","대기"]} colorMap={{"수정완료":"#34d399","수정중":"#f87171","대기":"#fbbf24"}} onChange={v=>set("modify",v)}/></div><div><div style={{fontSize:10,color:t.text4,marginBottom:3}}>작업 상태</div><StatusBadge value={form.workStatus} options={WORK_STATUS} colorMap={WORK_COLOR} onChange={v=>set("workStatus",v)}/></div></>}
            <div><div style={{fontSize:10,color:t.text4,marginBottom:3}}>최종 컨펌</div><StatusBadge value={form.finalConfirm} options={CONFIRM_STATUS} colorMap={CONFIRM_COLOR} onChange={v=>set("finalConfirm",v)}/></div>
            <div><div style={{fontSize:10,color:t.text4,marginBottom:3}}>수정 상태</div><StatusBadge value={form.modifyStatus} options={MODIFY_STATUS} colorMap={{"수정 완료":"#34d399","수정중":"#f87171","대기":"#fbbf24"}} onChange={v=>set("modifyStatus",v)}/></div>
            <div><div style={{fontSize:10,color:t.text4,marginBottom:3}}>인스타</div><StatusBadge value={form.insta} options={UPLOAD_STATUS} colorMap={{"완료":"#34d399","예정":"#fbbf24","-":"#6b7280"}} onChange={v=>set("insta",v)}/></div>
            <div><div style={{fontSize:10,color:t.text4,marginBottom:3}}>유튜브</div><StatusBadge value={form.youtube} options={UPLOAD_STATUS} colorMap={{"완료":"#34d399","예정":"#fbbf24","-":"#6b7280"}} onChange={v=>set("youtube",v)}/></div>
          </div>
          {fields.map(([l,k,tp])=><div key={k} style={{gridColumn:tp==="textarea"?"1/-1":"auto"}}>{lbl(l)}{tp==="textarea"?<textarea value={form[k]||""} onChange={e=>set(k,e.target.value)} style={ta}/>:<input type={tp||"text"} value={form[k]||""} onChange={e=>set(k,e.target.value)} style={inp}/>}</div>)}
        </div>
        <div style={{padding:"12px 22px 18px",borderTop:`1px solid ${t.border}`,display:"flex",gap:8}}>
          <button onClick={onClose} style={{flex:1,background:t.surface2,border:`1px solid ${t.border2}`,borderRadius:9,padding:"9px 0",cursor:"pointer",color:t.text3,fontWeight:600}}>취소</button>
          <button onClick={()=>onUpdate(form)} style={{flex:1,background:"#6366f1",border:"none",borderRadius:9,padding:"9px 0",cursor:"pointer",color:"#fff",fontWeight:700}}>저장</button>
        </div>
      </div>
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────
export default function App() {
  const [isDark, setIsDark] = useState(true);
  const t = isDark ? DARK : LIGHT;

  const [users, setUsersRaw, usersReady] = useFirebaseData("users", []);
  const [tasks, setTasksRaw, tasksReady] = useFirebaseData("tasks", []);
  const [notices, setNoticesRaw, noticesReady] = useFirebaseData("notices", []);
  const [visibleTabs, setVisibleTabsRaw, tabsReady] = useFirebaseData("settings/visibleTabs", ALL_TABS.map(t=>t.id));

  const synced = usersReady && tasksReady && noticesReady;

  // 초기 데이터 시드 (DB가 비어있을 때)
  useEffect(() => {
    if (!usersReady || users.length > 0) return;
    setUsersRaw([
      {id:"user_1",name:"박래성",password:"1234",dept:"영상팀",rank:"팀장",position:"디렉터",officePhone:"02-1234-5678",mobile:"010-1234-5678",role:"manager",approved:true},
      {id:"user_2",name:"이한희",password:"1234",dept:"영상팀",rank:"팀원",position:"에디터",officePhone:"02-1234-5679",mobile:"010-9876-5432",role:"member",approved:true},
    ]);
  }, [usersReady]);

  useEffect(() => {
    if (!noticesReady || notices.length > 0) return;
    setNoticesRaw([{id:"notice_1",title:"시스템 오픈 안내",content:"TIMBEL 영상 제작 스케줄러가 Firebase 실시간 동기화로 오픈되었습니다!",active:true}]);
  }, [noticesReady]);

  useEffect(() => {
    if (!tasksReady || tasks.length > 0) return;
    setTasksRaw([
      {id:"task_1",title:"6월 메인 브이로그",desc:"월간 하이라이트 영상",assignee:"박래성",priority:"높음",tag:"유튜브",due:"2026-06-30",status:"편집",comments:[]},
      {id:"task_2",title:"신제품 리뷰 영상",desc:"스마트폰 언박싱 & 리뷰",assignee:"이한희",priority:"높음",tag:"유튜브",due:"2026-06-28",status:"촬영",comments:[]},
      {id:"task_3",title:"여름 쇼츠 #1",desc:"15초 숏폼 콘텐츠",assignee:"박래성",priority:"중간",tag:"쇼츠",due:"2026-06-27",status:"업로드 완료",comments:[]},
    ]);
  }, [tasksReady]);

  const [currentUser, setCurrentUser] = useState(null);
  const [tab, setTab] = useState("calendar");
  const [showAdd, setShowAdd] = useState(false);
  const [addDate, setAddDate] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  const isAdmin = currentUser?.role === "admin";

  const moveTask = (id, dir) => setTasksRaw(tasks.map(tk => tk.id===id ? {...tk,status:STAGES[STAGES.indexOf(tk.status)+dir]} : tk));
  const deleteTask = id => setTasksRaw(tasks.filter(tk => tk.id!==id));
  const addTask = task => setTasksRaw([...tasks, task]);
  const updateTask = u => { setTasksRaw(tasks.map(tk => tk.id===u.id?u:tk)); setSelectedTask(u); };
  const openAdd = (date="") => { setAddDate(date); setShowAdd(true); };
  const displayTabs = isAdmin ? ALL_TABS : ALL_TABS.filter(tp => (Array.isArray(visibleTabs)?visibleTabs:[...Object.values(visibleTabs||{})]).includes(tp.id));

  if (!synced) {
    return (
      <div style={{minHeight:"100vh",background:"#0d1117",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"-apple-system,sans-serif",gap:16}}>
        <div style={{fontSize:30}}>🎬</div>
        <div style={{fontSize:15,fontWeight:700,color:"#f9fafb"}}>TIMBEL 영상 제작 스케줄러</div>
        <div style={{display:"flex",alignItems:"center",gap:8,color:"#fbbf24",fontSize:13}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:"#fbbf24",animation:"pulse 1s infinite"}}/>Firebase 연결 중...
        </div>
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <ThemeCtx.Provider value={{t, isDark}}>
        <AuthScreen onLogin={setCurrentUser} users={users} onRegister={async u => { await setUsersRaw([...users, u]); }} />
      </ThemeCtx.Provider>
    );
  }

  return (
    <ThemeCtx.Provider value={{t, isDark}}>
      <div style={{minHeight:"100vh",background:t.bg,fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",color:t.text,transition:"background .2s,color .2s"}}>
        {showAdd && <AddTaskModal onAdd={addTask} onClose={()=>setShowAdd(false)} defaultDate={addDate} users={users}/>}
        {selectedTask && <TaskDetailModal task={selectedTask} onClose={()=>setSelectedTask(null)} onUpdate={updateTask} onMove={(id,dir)=>{moveTask(id,dir);setSelectedTask(prev=>({...prev,status:STAGES[STAGES.indexOf(prev.status)+dir]}));}} users={users}/>}
        {showProfile && <ProfileModal currentUser={currentUser} onClose={()=>setShowProfile(false)} onUpdate={updated=>{setUsersRaw(users.map(u=>u.id===updated.id?updated:u));setCurrentUser(updated);setShowProfile(false);}}/>}

        <div style={{borderBottom:`1px solid ${t.border}`,padding:"12px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",background:t.headerBg,position:"sticky",top:0,zIndex:50}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:15,fontWeight:900,color:"#818cf8",letterSpacing:"2px"}}>TIMBEL</span>
              <span style={{fontSize:13,fontWeight:600,color:t.text3}}>영상 제작 스케줄러</span>
            </div>
            {isAdmin && <span style={{fontSize:10,background:"#f8717120",color:"#f87171",border:"1px solid #f8717140",borderRadius:20,padding:"2px 9px",fontWeight:700}}>🛡️ 관리자</span>}
            <span style={{fontSize:11,color:t.text4,background:t.surface2,padding:"2px 9px",borderRadius:20,border:`1px solid ${t.border}`}}>{tasks.length}개</span>
            <SyncBadge synced={synced}/>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{display:"flex",alignItems:"center",background:t.surface2,border:`1px solid ${t.border}`,borderRadius:10,padding:3,gap:2}}>
              <button onClick={()=>setIsDark(false)} style={{display:"flex",alignItems:"center",gap:5,padding:"5px 12px",borderRadius:7,border:"none",cursor:"pointer",background:!isDark?"#fff":"transparent",color:!isDark?"#1e293b":t.text4,fontWeight:!isDark?700:500,fontSize:12}}>☀️ 일반</button>
              <button onClick={()=>setIsDark(true)} style={{display:"flex",alignItems:"center",gap:5,padding:"5px 12px",borderRadius:7,border:"none",cursor:"pointer",background:isDark?"#1e293b":"transparent",color:isDark?"#818cf8":t.text4,fontWeight:isDark?700:500,fontSize:12}}>🌙 다크</button>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:7,background:t.surface2,border:`1px solid ${t.border}`,borderRadius:10,padding:"5px 12px"}}>
              <Avatar name={currentUser.name} size={22} users={users}/>
              <div><div style={{fontSize:12,fontWeight:700,color:t.text}}>{currentUser.name}</div><div style={{fontSize:10,color:t.text4}}>{currentUser.rank} · {currentUser.position}</div></div>
            </div>
            {!isAdmin && <button onClick={()=>setShowProfile(true)} style={{background:t.surface2,border:`1px solid ${t.border}`,borderRadius:8,padding:"7px 12px",fontSize:12,color:t.text4,cursor:"pointer"}}>⚙️ 내 정보</button>}
            <button onClick={()=>setCurrentUser(null)} style={{background:t.surface2,border:`1px solid ${t.border}`,borderRadius:8,padding:"7px 12px",fontSize:12,color:t.text4,cursor:"pointer"}}>로그아웃</button>
            {!isAdmin && <button onClick={()=>openAdd()} style={{background:"#6366f1",border:"none",borderRadius:8,padding:"7px 15px",fontWeight:700,fontSize:13,color:"#fff",cursor:"pointer"}}>+ 추가</button>}
          </div>
        </div>

        <NoticeBanner notices={notices}/>

        <div style={{maxWidth:1300,margin:"0 auto",padding:"20px"}}>
          <div style={{display:"flex",gap:2,marginBottom:22,borderBottom:`1px solid ${t.border}`}}>
            {isAdmin && <button onClick={()=>setTab("admin")} style={{padding:"8px 18px",background:"none",border:"none",borderBottom:tab==="admin"?"2px solid #f87171":"2px solid transparent",cursor:"pointer",fontWeight:tab==="admin"?700:500,fontSize:13,color:tab==="admin"?"#f87171":t.text4,marginBottom:-1}}>🛡️ 관리자</button>}
            {displayTabs.map(tp=>(
              <button key={tp.id} onClick={()=>setTab(tp.id)} style={{padding:"8px 18px",background:"none",border:"none",borderBottom:tab===tp.id?"2px solid #6366f1":"2px solid transparent",cursor:"pointer",fontWeight:tab===tp.id?700:500,fontSize:13,color:tab===tp.id?"#818cf8":t.text4,marginBottom:-1}}>{tp.label}</button>
            ))}
          </div>

          {tab==="admin" && isAdmin && <AdminPanel users={users} onUpdateUsers={setUsersRaw} notices={notices} onUpdateNotices={setNoticesRaw} visibleTabs={Array.isArray(visibleTabs)?visibleTabs:Object.values(visibleTabs||{})} setVisibleTabs={v=>setVisibleTabsRaw(v)} tasks={tasks} onUpdateTasks={setTasksRaw}/>}
          {tab==="calendar" && <CalendarView tasks={tasks} onSelectTask={setSelectedTask} onAddTask={openAdd}/>}
          {tab==="board" && <BoardView tasks={tasks} onSelectTask={setSelectedTask} onMove={moveTask} onDelete={deleteTask} users={users}/>}
          {tab==="ad" && <AdPanel/>}
          {tab==="stats" && <div style={{maxWidth:700,margin:"0 auto"}}><StatsPanel tasks={tasks} currentUser={currentUser}/></div>}
          {tab==="ai" && <AIPanel tasks={tasks} users={users}/>}
        </div>
      </div>
    </ThemeCtx.Provider>
  );
}