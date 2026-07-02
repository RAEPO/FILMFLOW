import { useState, useEffect, createContext, useContext } from "react";

const DB_URL = "https://filmflow-fc094-default-rtdb.firebaseio.com";
const RAPIDAPI_KEY = "8005f3a9f0msh569c86a87385975p1a6738jsnb8d6ee75afb3";

function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = name + "=" + encodeURIComponent(value) + ";expires=" + expires + ";path=/";
}
function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}
function deleteCookie(name) {
  document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
}

async function firebaseGet(path) {
  const res = await fetch(DB_URL + "/" + path + ".json");
  return res.json();
}
async function firebaseSet(path, data) {
  await fetch(DB_URL + "/" + path + ".json", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

async function fetchYoutubeData(url) {
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /shorts\/([a-zA-Z0-9_-]{11})/,
    /embed\/([a-zA-Z0-9_-]{11})/,
  ];
  let videoId = null;
  for (let i = 0; i < patterns.length; i++) {
    const m = url.match(patterns[i]);
    if (m) { videoId = m[1]; break; }
  }
  if (!videoId) throw new Error("유튜브 URL에서 영상 ID를 찾을 수 없어요.");
  const res = await fetch(
    "https://youtube-v31.p.rapidapi.com/videos?part=contentDetails%2Csnippet%2Cstatistics&id=" + videoId,
    { method: "GET", headers: { "x-rapidapi-key": RAPIDAPI_KEY, "x-rapidapi-host": "youtube-v31.p.rapidapi.com" } }
  );
  if (!res.ok) throw new Error("API 요청 실패 (상태 코드: " + res.status + ").");
  const data = await res.json();
  if (!data.items || data.items.length === 0) throw new Error("영상을 찾을 수 없어요.");
  const item = data.items[0];
  const stats = item.statistics || {};
  const snippet = item.snippet || {};
  const cd = item.contentDetails || {};
  const dur = cd.duration || "";
  const dm = dur.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  const dh = dm && dm[1] ? dm[1] : null;
  const dmin = dm && dm[2] ? dm[2] : "0";
  const dsec = dm && dm[3] ? dm[3] : "0";
  const duration = dh ? dh + ":" + String(dmin).padStart(2, "0") + ":" + String(dsec).padStart(2, "0") : dmin + ":" + String(dsec).padStart(2, "0");
  const thumbs = snippet.thumbnails || {};
  const thumbnail = (thumbs.maxres && thumbs.maxres.url) || (thumbs.high && thumbs.high.url) || (thumbs.default && thumbs.default.url) || "";
  return {
    title: snippet.title || "", thumbnail: thumbnail, channelTitle: snippet.channelTitle || "",
    publishedAt: snippet.publishedAt ? snippet.publishedAt.slice(0, 10) : "",
    description: snippet.description ? snippet.description.slice(0, 300) : "",
    views: Number(stats.viewCount || 0).toLocaleString(), likes: Number(stats.likeCount || 0).toLocaleString(),
    comments: Number(stats.commentCount || 0).toLocaleString(), duration: duration, videoId: videoId,
    tags: snippet.tags ? snippet.tags.slice(0, 5) : [],
  };
}

const ThemeCtx = createContext();
const useTheme = () => useContext(ThemeCtx);
const DARK = { bg: "#0d1117", surface: "#111827", surface2: "#1f2937", border: "#1f2937", border2: "#374151", text: "#f9fafb", text2: "#d1d5db", text3: "#9ca3af", text4: "#6b7280", text5: "#4b5563", inputBg: "#1f2937", inputBorder: "#374151", headerBg: "#0d1117" };
const LIGHT = { bg: "#f1f5f9", surface: "#ffffff", surface2: "#f8fafc", border: "#e2e8f0", border2: "#cbd5e1", text: "#0f172a", text2: "#1e293b", text3: "#475569", text4: "#64748b", text5: "#94a3b8", inputBg: "#f8fafc", inputBorder: "#cbd5e1", headerBg: "#ffffff" };

const PRIORITIES = ["높음", "중간", "낮음"];
const PRIORITY_COLOR = { "높음": "#f87171", "중간": "#fbbf24", "낮음": "#34d399" };
const STAGES = ["기획", "촬영", "편집", "검토", "업로드 완료"];
const STAGE_COLOR = { "기획": "#818cf8", "촬영": "#fb923c", "편집": "#38bdf8", "검토": "#c084fc", "업로드 완료": "#34d399" };
const STAGE_ICON = { "기획": "💡", "촬영": "🎥", "편집": "✂️", "검토": "🔍", "업로드 완료": "🚀" };
const TAGS = ["유튜브", "인스타그램", "틱톡", "쇼츠", "광고", "브이로그"];
const TAG_COLOR = { "유튜브": "#f87171", "인스타그램": "#c084fc", "틱톡": "#38bdf8", "쇼츠": "#fb923c", "광고": "#fbbf24", "브이로그": "#34d399" };
const MARKETING_STAGES = ["기획", "진행중", "검토", "완료"];
const MARKETING_STAGE_COLOR = { "기획": "#818cf8", "진행중": "#fb923c", "검토": "#c084fc", "완료": "#34d399" };
const MARKETING_STAGE_ICON = { "기획": "💡", "진행중": "🚀", "검토": "🔍", "완료": "✅" };
const MARKETING_TAGS = ["광고", "SNS", "이벤트", "제휴", "콘텐츠", "기타"];
const MARKETING_TAG_COLOR = { "광고": "#fbbf24", "SNS": "#38bdf8", "이벤트": "#f87171", "제휴": "#c084fc", "콘텐츠": "#34d399", "기타": "#94a3b8" };
const DESIGN_STAGES = ["기획", "시안 작업", "피드백", "완료"];
const DESIGN_STAGE_COLOR = { "기획": "#818cf8", "시안 작업": "#fb923c", "피드백": "#c084fc", "완료": "#34d399" };
const DESIGN_STAGE_ICON = { "기획": "💡", "시안 작업": "🎨", "피드백": "🔁", "완료": "✅" };
const DESIGN_TAGS = ["로고", "배너", "템플릿", "인쇄물", "UI/UX", "기타"];
const DESIGN_TAG_COLOR = { "로고": "#f87171", "배너": "#fbbf24", "템플릿": "#38bdf8", "인쇄물": "#c084fc", "UI/UX": "#34d399", "기타": "#94a3b8" };
const COMBINED_TYPE_INFO = {
  video: { color: "#818cf8", icon: "🎬", label: "영상" },
  marketing: { color: "#fb923c", icon: "🗓️", label: "마케팅" },
  design: { color: "#f87171", icon: "🎨", label: "디자인" },
  adWork: { color: "#fbbf24", icon: "📢", label: "광고 제작일" },
  adExpected: { color: "#38bdf8", icon: "🏁", label: "광고 예상완료" },
};
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const CONFIRM_STATUS = ["대기", "컨펌중", "컨펌완료", "수정", "반려"];
const WORK_STATUS = ["대기", "기획중", "작업중", "작업완료", "수정중"];
const MODIFY_STATUS = ["대기", "수정 완료", "수정중"];
const UPLOAD_STATUS = ["대기", "완료", "예정", "-"];
const CONFIRM_COLOR = { "대기": "#6b7280", "컨펌중": "#fbbf24", "컨펌완료": "#34d399", "수정": "#f87171", "반려": "#6b7280" };
const WORK_COLOR = { "대기": "#6b7280", "기획중": "#818cf8", "작업중": "#fb923c", "작업완료": "#34d399", "수정중": "#f87171" };
const AVATAR_COLORS = ["#6366f1", "#ec4899", "#fb923c", "#34d399", "#38bdf8", "#c084fc", "#f87171"];
const ALL_TABS = [
  { id: "unified", label: "🗂️ 통합 캘린더" }, { id: "calendar", label: "📅 영상 캘린더" }, { id: "adCalendar", label: "🗓️ 마케팅 캘린더" }, { id: "designCalendar", label: "🎨 디자인 캘린더" }, { id: "board", label: "🎞️ 제작 보드" },
  { id: "ad", label: "📢 광고 관리" }, { id: "stats", label: "📊 통계" }, { id: "overtime", label: "⏰ 야근 기록" }, { id: "messages", label: "💬 메시지(메모)" }, { id: "ai", label: "🤖 AI 분석" },
];
const ADMIN_USER = { id: "admin", name: "admin", password: "admin1234", dept: "경영진", rank: "대표", position: "관리자", officePhone: "", mobile: "", role: "admin", approved: true };
const ROLE_COLOR = { "admin": "#f87171", "manager": "#fbbf24", "member": "#34d399", "viewer": "#94a3b8" };
const ROLE_LABEL = { "admin": "관리자", "manager": "매니저", "member": "팀원", "viewer": "뷰어" };
const ROLE_ORDER = ["viewer", "member", "manager"];
const KOREAN_HOLIDAYS = {
  "2026-01-01": "신정", "2026-02-16": "설날 연휴", "2026-02-17": "설날", "2026-02-18": "설날 연휴",
  "2026-03-01": "삼일절", "2026-03-02": "삼일절 대체공휴일", "2026-05-05": "어린이날", "2026-05-24": "부처님오신날",
  "2026-05-25": "부처님오신날 대체공휴일", "2026-06-06": "현충일", "2026-08-15": "광복절", "2026-08-17": "광복절 대체공휴일",
  "2026-09-24": "추석 연휴", "2026-09-25": "추석", "2026-09-26": "추석 연휴", "2026-10-03": "개천절",
  "2026-10-05": "개천절 대체공휴일", "2026-10-09": "한글날", "2026-12-25": "성탄절",
  "2027-01-01": "신정", "2027-02-06": "설날 연휴", "2027-02-07": "설날", "2027-02-08": "설날 연휴",
  "2027-02-09": "설날 대체공휴일", "2027-03-01": "삼일절", "2027-05-05": "어린이날", "2027-05-13": "부처님오신날",
  "2027-06-06": "현충일", "2027-08-15": "광복절", "2027-08-16": "광복절 대체공휴일", "2027-09-14": "추석 연휴",
  "2027-09-15": "추석", "2027-09-16": "추석 연휴", "2027-10-03": "개천절", "2027-10-04": "개천절 대체공휴일",
  "2027-10-09": "한글날", "2027-10-11": "한글날 대체공휴일", "2027-12-25": "성탄절",
};

function useFirebaseData(path, defaultVal) {
  const [data, setData] = useState(defaultVal);
  const [ready, setReady] = useState(false);
  useEffect(function () {
    let cancelled = false;
    const load = async function () {
      try {
        const val = await firebaseGet(path);
        if (!cancelled) {
          if (val !== null && val !== undefined) setData(Array.isArray(defaultVal) ? Object.values(val) : val);
          setReady(true);
        }
      } catch (e) { if (!cancelled) setReady(true); }
    };
    load();
    const interval = setInterval(load, 3000);
    return function () { cancelled = true; clearInterval(interval); };
  }, [path]);
  const setFirebase = async function (val) {
    const toStore = Array.isArray(val) ? Object.fromEntries(val.map(function (v) { return [v.id || ("item_" + Date.now()), v]; })) : val;
    setData(val);
    await firebaseSet(path, toStore);
  };
  return [data, setFirebase, ready];
}

function getAvatarColor(name, users) {
  const idx = users.findIndex(function (u) { return u.name === name; });
  return idx >= 0 ? AVATAR_COLORS[idx % AVATAR_COLORS.length] : "#64748b";
}
function Avatar(props) {
  const name = props.name, size = props.size || 24, users = props.users || [];
  const color = getAvatarColor(name, users) || "#6366f1";
  return <div style={{ width: size, height: size, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.42, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{(name || "?")[0]}</div>;
}
function StatusBadge(props) {
  const { value, options, colorMap, onChange } = props;
  return (
    <select value={value} onChange={function (e) { onChange(e.target.value); }} onClick={function (e) { e.stopPropagation(); }}
      style={{ background: (colorMap[value] || "#6b7280") + "20", color: colorMap[value] || "#9ca3af", border: "1px solid " + ((colorMap[value] || "#6b7280") + "40"), borderRadius: 20, padding: "2px 8px", fontSize: 11, fontWeight: 700, cursor: "pointer", outline: "none", appearance: "none", textAlign: "center" }}>
      {options.map(function (o) { return <option key={o}>{o}</option>; })}
    </select>
  );
}
function UrlCell(props) {
  if (!props.url) return <span style={{ color: "#6b7280", fontSize: 12 }}>-</span>;
  return <a href={props.url} target="_blank" rel="noreferrer" onClick={function (e) { e.stopPropagation(); }} style={{ color: "#818cf8", fontSize: 11, textDecoration: "none", background: "#818cf820", padding: "2px 8px", borderRadius: 6 }}>링크 ↗</a>;
}
function Inp(props) {
  const { t } = useTheme();
  const { label, val, onChange, required } = props;
  const type = props.type || "text";
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>{label}{required ? " *" : ""}</div>
      <input type={type} value={val} onChange={function (e) { onChange(e.target.value); }} style={{ width: "100%", background: t.inputBg, border: "1px solid " + t.inputBorder, borderRadius: 9, padding: "9px 12px", fontSize: 13, color: t.text, boxSizing: "border-box", outline: "none" }} />
    </div>
  );
}
function SyncBadge(props) {
  const { t } = useTheme();
  const synced = props.synced;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: synced ? "#34d399" : t.text5 }}>
      <div style={{ width: 7, height: 7, borderRadius: "50%", background: synced ? "#34d399" : "#fbbf24" }} />
      {synced ? "실시간 동기화 중" : "연결 중..."}
    </div>
  );
}

function NotificationBell(props) {
  const { t } = useTheme();
  const { notifications, currentUser, onMarkRead, onMarkAllRead, onClickNotif } = props;
  const [open, setOpen] = useState(false);
  const myNotifs = notifications.filter(function (n) { return n.toUser === currentUser.name || n.toUser === "all"; }).sort(function (a, b) { return b.createdAt - a.createdAt; });
  const isRead = function (n) { return !!(n.readBy && n.readBy[currentUser.name]); };
  const unreadCount = myNotifs.filter(function (n) { return !isRead(n); }).length;
  return (
    <div style={{ position: "relative" }}>
      <button onClick={function () { setOpen(!open); }} style={{ position: "relative", background: t.surface2, border: "1px solid " + t.border, borderRadius: 8, padding: "7px 10px", cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center" }}>
        🔔
        {unreadCount > 0 ? <span style={{ position: "absolute", top: -4, right: -4, background: "#f87171", color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 99, minWidth: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>{unreadCount > 9 ? "9+" : unreadCount}</span> : null}
      </button>
      {open ? (
        <div style={{ position: "fixed", inset: 0, zIndex: 90 }} onClick={function () { setOpen(false); }}>
          <div onClick={function (e) { e.stopPropagation(); }} style={{ position: "absolute", top: 54, right: 24, width: 340, maxHeight: 420, background: t.surface, borderRadius: 14, border: "1px solid " + t.border, boxShadow: "0 16px 48px #000a", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid " + t.border, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: t.text }}>알림 {unreadCount > 0 ? "(" + unreadCount + ")" : ""}</span>
              {unreadCount > 0 ? <button onClick={function () { onMarkAllRead(); }} style={{ background: "none", border: "none", color: "#818cf8", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>모두 읽음</button> : null}
            </div>
            <div style={{ overflowY: "auto", flex: 1 }}>
              {myNotifs.length === 0 ? <div style={{ padding: "30px 16px", textAlign: "center", color: t.text5, fontSize: 12 }}>알림이 없습니다</div> : null}
              {myNotifs.map(function (n) {
                const read = isRead(n);
                return (
                  <div key={n.id} onClick={function () { onMarkRead(n.id); onClickNotif(n); setOpen(false); }} style={{ padding: "11px 16px", borderBottom: "1px solid " + t.border, cursor: "pointer", background: read ? "transparent" : "#6366f110" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                      {!read ? <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1", marginTop: 5, flexShrink: 0 }} /> : null}
                      <div style={{ flex: 1 }}>
                        {n.kind === "ad" ? (
                          <div style={{ fontSize: 12, color: t.text2, lineHeight: 1.5 }}><b style={{ color: t.text }}>{n.fromUser}</b> 님이 <b style={{ color: "#fbbf24" }}>광고 관리</b>에 새 항목을 등록했습니다</div>
                        ) : (
                          <div style={{ fontSize: 12, color: t.text2, lineHeight: 1.5 }}><b style={{ color: t.text }}>{n.fromUser}</b> 님이 <b style={{ color: "#818cf8" }}>{n.taskTitle}</b>에 코멘트를 남겼습니다</div>
                        )}
                        <div style={{ fontSize: 11, color: t.text4, marginTop: 5, background: t.bg, borderRadius: 7, padding: "6px 9px" }}>{n.text}</div>
                        <div style={{ fontSize: 10, color: t.text5, marginTop: 5 }}>{n.time}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function NoticeBanner(props) {
  const { t } = useTheme();
  const active = props.notices.filter(function (n) { return n.active; });
  if (!active.length) return null;
  return (
    <div style={{ background: "linear-gradient(90deg,#6366f115,#ec489915)", borderBottom: "1px solid #6366f130", padding: "8px 24px", display: "flex", gap: 20, overflowX: "auto" }}>
      {active.map(function (n) {
        return (
          <div key={n.id} style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <span style={{ fontSize: 11, background: "#6366f1", color: "#fff", borderRadius: 20, padding: "1px 8px", fontWeight: 700 }}>공지</span>
            <span style={{ fontSize: 12, color: t.text2, fontWeight: 600 }}>{n.title}</span>
            <span style={{ fontSize: 11, color: t.text4 }}>— {n.content}</span>
          </div>
        );
      })}
    </div>
  );
}

function AuthScreen(props) {
  const { onLogin, users, onRegister } = props;
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", password: "", dept: "", rank: "", position: "", officePhone: "", mobile: "" });
  const [err, setErr] = useState("");
  const set = function (k, v) { setForm(function (f) { return Object.assign({}, f, { [k]: v }); }); };
  const handleLogin = function () {
    if (form.name === "admin" && form.password === "admin1234") { onLogin(ADMIN_USER); return; }
    const u = users.find(function (u) { return u.name === form.name && u.password === form.password; });
    if (!u) { setErr("이름 또는 비밀번호가 올바르지 않습니다."); return; }
    if (!u.approved) { setErr("관리자 승인 대기 중입니다."); return; }
    setErr(""); onLogin(u);
  };
  const handleRegister = async function () {
    if (!form.name || !form.password || !form.dept || !form.rank || !form.position || !form.mobile) { setErr("필수 항목을 모두 입력해주세요."); return; }
    if (form.name === "admin") { setErr("사용할 수 없는 이름입니다."); return; }
    if (users.find(function (u) { return u.name === form.name; })) { setErr("이미 존재하는 이름입니다."); return; }
    const newUser = { id: "user_" + Date.now(), name: form.name, password: form.password, dept: form.dept, rank: form.rank, position: form.position, officePhone: form.officePhone, mobile: form.mobile, role: "viewer", approved: false };
    await onRegister(newUser);
    setErr(""); setMode("login"); setForm({ name: "", password: "", dept: "", rank: "", position: "", officePhone: "", mobile: "" });
    alert("가입 신청 완료! 관리자 승인 후 로그인 가능합니다.");
  };
  const inpStyle = { width: "100%", background: "#1f2937", border: "1px solid #374151", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#f9fafb", boxSizing: "border-box", outline: "none", marginBottom: 10 };
  return (
    <div style={{ minHeight: "100vh", background: "#0d1117", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      <div style={{ width: 390, background: "#111827", borderRadius: 20, padding: "32px 32px 28px", border: "1px solid #1f2937", boxShadow: "0 24px 64px #000c" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: "#818cf8", letterSpacing: "2px", marginBottom: 4 }}>TIMBEL</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#f9fafb" }}>영상 제작 스케줄러</div>
          <div style={{ fontSize: 11, color: "#34d399", marginTop: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399" }} />실시간 동기화
          </div>
        </div>
        <div style={{ display: "flex", background: "#0d1117", borderRadius: 10, padding: 3, marginBottom: 20, border: "1px solid #1f2937" }}>
          {[["login", "로그인"], ["register", "회원가입"]].map(function (item) {
            return <button key={item[0]} onClick={function () { setMode(item[0]); setErr(""); }} style={{ flex: 1, padding: "8px 0", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: mode === item[0] ? 700 : 500, fontSize: 13, background: mode === item[0] ? "#6366f1" : "transparent", color: mode === item[0] ? "#fff" : "#6b7280" }}>{item[1]}</button>;
          })}
        </div>
        {mode === "login" ? (
          <div>
            <input placeholder="이름 (아이디)" value={form.name} onChange={function (e) { set("name", e.target.value); }} style={inpStyle} />
            <input placeholder="비밀번호" type="password" value={form.password} onChange={function (e) { set("password", e.target.value); }} onKeyDown={function (e) { if (e.key === "Enter") handleLogin(); }} style={inpStyle} />
            {err ? <div style={{ fontSize: 12, color: "#f87171", marginBottom: 10, textAlign: "center" }}>{err}</div> : null}
            <button onClick={handleLogin} style={{ width: "100%", background: "#6366f1", border: "none", borderRadius: 10, padding: "11px 0", fontWeight: 700, fontSize: 14, color: "#fff", cursor: "pointer" }}>로그인</button>
            <div style={{ textAlign: "center", marginTop: 12, fontSize: 11, color: "#374151" }}>관리자: admin / admin1234</div>
          </div>
        ) : (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 10px" }}>
              {[["이름 (아이디) *", "name"], ["부서명 *", "dept"], ["직급 *", "rank"], ["포지션 *", "position"], ["회사 전화번호", "officePhone"], ["핸드폰 번호 *", "mobile"]].map(function (item, i) {
                return <div key={item[1]} style={{ gridColumn: i === 0 ? "1/-1" : "auto" }}><input placeholder={item[0]} value={form[item[1]]} onChange={function (e) { set(item[1], e.target.value); }} style={Object.assign({}, inpStyle, { marginBottom: 9 })} /></div>;
              })}
            </div>
            <input placeholder="비밀번호 *" type="password" value={form.password} onChange={function (e) { set("password", e.target.value); }} style={inpStyle} />
            <div style={{ fontSize: 11, color: "#4b5563", marginBottom: 10 }}>* 이름이 아이디로 사용됩니다. 가입 후 관리자 승인이 필요합니다.</div>
            {err ? <div style={{ fontSize: 12, color: "#f87171", marginBottom: 10, textAlign: "center" }}>{err}</div> : null}
            <button onClick={handleRegister} style={{ width: "100%", background: "#6366f1", border: "none", borderRadius: 10, padding: "11px 0", fontWeight: 700, fontSize: 14, color: "#fff", cursor: "pointer" }}>가입 신청</button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileModal(props) {
  const { t } = useTheme();
  const { currentUser, onClose, onUpdate } = props;
  const [pTab, setPTab] = useState("info");
  const [form, setForm] = useState({ name: currentUser.name, dept: currentUser.dept, rank: currentUser.rank, position: currentUser.position, officePhone: currentUser.officePhone || "", mobile: currentUser.mobile || "" });
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [err, setErr] = useState(""), [ok, setOk] = useState("");
  const saveInfo = function () {
    if (!form.name || !form.dept || !form.rank || !form.position || !form.mobile) { setErr("필수 항목을 입력해주세요."); return; }
    onUpdate(Object.assign({}, currentUser, form)); setErr(""); setOk("저장되었습니다.");
  };
  const savePw = function () {
    if (pw.current !== currentUser.password) { setErr("현재 비밀번호가 틀렸습니다."); return; }
    if (!pw.next || pw.next.length < 4) { setErr("4자 이상 입력해주세요."); return; }
    if (pw.next !== pw.confirm) { setErr("비밀번호가 일치하지 않습니다."); return; }
    onUpdate(Object.assign({}, currentUser, { password: pw.next })); setErr(""); setOk("변경되었습니다."); setPw({ current: "", next: "", confirm: "" });
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000099", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
      <div style={{ background: t.surface, borderRadius: 20, width: 420, border: "1px solid " + t.border, boxShadow: "0 24px 64px #000c", overflow: "hidden" }}>
        <div style={{ background: "linear-gradient(135deg,#6366f1,#ec4899)", padding: "22px 24px 18px", position: "relative" }}>
          <button onClick={onClose} style={{ position: "absolute", top: 14, right: 16, background: "none", border: "none", color: "#ffffff88", cursor: "pointer", fontSize: 20 }}>×</button>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#6366f1", border: "3px solid #ffffff44", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: "#fff" }}>{currentUser.name[0]}</div>
            <div><div style={{ fontSize: 17, fontWeight: 800, color: "#fff" }}>{currentUser.name}</div><div style={{ fontSize: 11, color: "#ffffff88", marginTop: 2 }}>{currentUser.dept} · {currentUser.rank}</div></div>
          </div>
        </div>
        <div style={{ display: "flex", borderBottom: "1px solid " + t.border }}>
          {[["info", "👤 개인정보"], ["password", "🔒 비밀번호"]].map(function (item) {
            return <button key={item[0]} onClick={function () { setPTab(item[0]); setErr(""); setOk(""); }} style={{ flex: 1, padding: "10px 0", background: "none", border: "none", borderBottom: pTab === item[0] ? "2px solid #6366f1" : "2px solid transparent", cursor: "pointer", fontWeight: pTab === item[0] ? 700 : 500, fontSize: 13, color: pTab === item[0] ? "#818cf8" : t.text4 }}>{item[1]}</button>;
          })}
        </div>
        <div style={{ padding: "18px 22px 22px" }}>
          {pTab === "info" ? (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
                <div style={{ gridColumn: "1/-1" }}><Inp label="이름" val={form.name} onChange={function (v) { setForm(function (f) { return Object.assign({}, f, { name: v }); }); }} required /></div>
                <Inp label="부서명" val={form.dept} onChange={function (v) { setForm(function (f) { return Object.assign({}, f, { dept: v }); }); }} required />
                <Inp label="직급" val={form.rank} onChange={function (v) { setForm(function (f) { return Object.assign({}, f, { rank: v }); }); }} required />
                <Inp label="포지션" val={form.position} onChange={function (v) { setForm(function (f) { return Object.assign({}, f, { position: v }); }); }} required />
                <Inp label="회사 전화번호" val={form.officePhone} onChange={function (v) { setForm(function (f) { return Object.assign({}, f, { officePhone: v }); }); }} />
                <Inp label="핸드폰" val={form.mobile} onChange={function (v) { setForm(function (f) { return Object.assign({}, f, { mobile: v }); }); }} required />
              </div>
              {err ? <div style={{ fontSize: 12, color: "#f87171", marginBottom: 10, textAlign: "center" }}>{err}</div> : null}
              {ok ? <div style={{ fontSize: 12, color: "#34d399", marginBottom: 10, textAlign: "center" }}>✓ {ok}</div> : null}
              <button onClick={saveInfo} style={{ width: "100%", background: "#6366f1", border: "none", borderRadius: 10, padding: "11px 0", fontWeight: 700, fontSize: 14, color: "#fff", cursor: "pointer" }}>저장하기</button>
            </div>
          ) : (
            <div>
              <Inp label="현재 비밀번호" val={pw.current} onChange={function (v) { setPw(function (p) { return Object.assign({}, p, { current: v }); }); }} type="password" />
              <Inp label="새 비밀번호 (4자 이상)" val={pw.next} onChange={function (v) { setPw(function (p) { return Object.assign({}, p, { next: v }); }); }} type="password" />
              <Inp label="새 비밀번호 확인" val={pw.confirm} onChange={function (v) { setPw(function (p) { return Object.assign({}, p, { confirm: v }); }); }} type="password" />
              {err ? <div style={{ fontSize: 12, color: "#f87171", marginBottom: 10, textAlign: "center" }}>{err}</div> : null}
              {ok ? <div style={{ fontSize: 12, color: "#34d399", marginBottom: 10, textAlign: "center" }}>✓ {ok}</div> : null}
              <button onClick={savePw} style={{ width: "100%", background: "#6366f1", border: "none", borderRadius: 10, padding: "11px 0", fontWeight: 700, fontSize: 14, color: "#fff", cursor: "pointer" }}>비밀번호 변경</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminPanel(props) {
  const { t } = useTheme();
  const { users, onUpdateUsers, notices, onUpdateNotices, visibleTabs, setVisibleTabs, tasks, onUpdateTasks } = props;
  const [aTab, setATab] = useState("users");
  const [noticeForm, setNoticeForm] = useState({ title: "", content: "", active: true });
  const [editNotice, setEditNotice] = useState(null);
  const pending = users.filter(function (u) { return !u.approved && u.role !== "admin"; });
  const members = users.filter(function (u) { return u.role !== "admin"; });
  const approve = function (id) { onUpdateUsers(users.map(function (u) { return u.id === id ? Object.assign({}, u, { approved: true }) : u; })); };
  const reject = function (id) { onUpdateUsers(users.filter(function (u) { return u.id !== id; })); };
  const toggleRole = function (id) { onUpdateUsers(users.map(function (u) { if (u.id !== id) return u; const cur = ROLE_ORDER.indexOf(u.role); return Object.assign({}, u, { role: ROLE_ORDER[(cur + 1) % ROLE_ORDER.length] }); })); };
  const deleteUser = function (id) { onUpdateUsers(users.filter(function (u) { return u.id !== id; })); };
  const addNotice = function () {
    if (!noticeForm.title || !noticeForm.content) return;
    if (editNotice) { onUpdateNotices(notices.map(function (n) { return n.id === editNotice ? Object.assign({}, n, noticeForm) : n; })); setEditNotice(null); }
    else onUpdateNotices([].concat(notices, [{ id: "notice_" + Date.now(), title: noticeForm.title, content: noticeForm.content, active: noticeForm.active }]));
    setNoticeForm({ title: "", content: "", active: true });
  };
  const aTabStyle = function (v) { return { padding: "8px 16px", background: "none", border: "none", borderBottom: aTab === v ? "2px solid #f87171" : "2px solid transparent", cursor: "pointer", fontWeight: aTab === v ? 700 : 500, fontSize: 13, color: aTab === v ? "#f87171" : t.text4, marginBottom: -1 }; };
  const s = { background: t.surface, borderRadius: 13, border: "1px solid " + t.border, overflow: "hidden", marginBottom: 14 };
  return (
    <div>
      <div style={{ background: "linear-gradient(135deg,#7f1d1d,#991b1b)", borderRadius: 12, padding: "14px 20px", marginBottom: 18, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 20 }}>🛡️</span>
        <div><div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>관리자 대시보드</div><div style={{ fontSize: 11, color: "#fca5a5" }}>시스템 전체 설정 및 사용자 관리</div></div>
        {pending.length > 0 ? <div style={{ marginLeft: "auto", background: "#f87171", borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700, color: "#fff" }}>승인 대기 {pending.length}명</div> : null}
      </div>
      <div style={{ display: "flex", gap: 2, marginBottom: 20, borderBottom: "1px solid " + t.border }}>
        {[["users", "👥 회원 관리"], ["notices", "📢 공지사항"], ["tabs", "🗂️ 탭 설정"], ["schedule", "📋 스케줄 조율"]].map(function (item) {
          return <button key={item[0]} onClick={function () { setATab(item[0]); }} style={aTabStyle(item[0])}>{item[1]}</button>;
        })}
      </div>
      {aTab === "users" ? (
        <div>
          {pending.length > 0 ? (
            <div style={Object.assign({}, s, { border: "1px solid #f8717140" })}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid " + t.border, fontSize: 12, fontWeight: 700, color: "#f87171", background: "#f8717110" }}>⏳ 승인 대기 ({pending.length})</div>
              {pending.map(function (u) {
                return (
                  <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid " + t.border }}>
                    <Avatar name={u.name} size={36} users={users} />
                    <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{u.name}</div><div style={{ fontSize: 11, color: t.text4 }}>{u.dept} · {u.rank} / {u.position}</div></div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={function () { approve(u.id); }} style={{ background: "#34d399", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer" }}>✓ 승인</button>
                      <button onClick={function () { reject(u.id); }} style={{ background: "#f87171", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer" }}>✕ 거절</button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
          <div style={s}>
            <div style={{ padding: "11px 16px", borderBottom: "1px solid " + t.border, fontSize: 12, fontWeight: 700, color: t.text4, textTransform: "uppercase", letterSpacing: ".5px" }}>전체 회원 ({members.length})</div>
            {members.length === 0 ? <div style={{ padding: "24px", textAlign: "center", color: t.text5, fontSize: 13 }}>등록된 회원이 없습니다</div> : null}
            {members.map(function (u) {
              return (
                <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid " + t.border }}>
                  <Avatar name={u.name} size={36} users={users} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{u.name}</span>
                      <span style={{ fontSize: 10, background: (ROLE_COLOR[u.role] || "#6b7280") + "20", color: ROLE_COLOR[u.role] || "#6b7280", border: "1px solid " + ((ROLE_COLOR[u.role] || "#6b7280") + "40"), borderRadius: 20, padding: "1px 8px", fontWeight: 700 }}>{ROLE_LABEL[u.role] || "팀원"}</span>
                      {!u.approved ? <span style={{ fontSize: 10, background: "#fbbf2420", color: "#fbbf24", borderRadius: 20, padding: "1px 8px", fontWeight: 700 }}>미승인</span> : null}
                    </div>
                    <div style={{ fontSize: 11, color: t.text4, marginTop: 2 }}>{u.dept} · {u.rank} / {u.position} · {u.mobile}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={function () { toggleRole(u.id); }} style={{ background: t.surface2, border: "1px solid " + t.border, borderRadius: 8, padding: "5px 10px", fontSize: 11, color: t.text3, cursor: "pointer" }}>{ROLE_LABEL[ROLE_ORDER[(ROLE_ORDER.indexOf(u.role) + 1) % ROLE_ORDER.length]]}로 변경</button>
                    <button onClick={function () { deleteUser(u.id); }} style={{ background: "#f8717120", border: "1px solid #f8717140", borderRadius: 8, padding: "5px 10px", fontSize: 11, color: "#f87171", cursor: "pointer" }}>삭제</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
      {aTab === "notices" ? (
        <div>
          <div style={Object.assign({}, s, { padding: 18, marginBottom: 14 })}>
            <div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 14 }}>{editNotice ? "✏️ 공지 수정" : "➕ 새 공지 등록"}</div>
            <Inp label="제목" val={noticeForm.title} onChange={function (v) { setNoticeForm(function (f) { return Object.assign({}, f, { title: v }); }); }} required />
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>내용 *</div>
              <textarea value={noticeForm.content} onChange={function (e) { setNoticeForm(function (f) { return Object.assign({}, f, { content: e.target.value }); }); }} style={{ width: "100%", background: t.inputBg, border: "1px solid " + t.inputBorder, borderRadius: 9, padding: "9px 12px", fontSize: 13, color: t.text, boxSizing: "border-box", outline: "none", minHeight: 72, resize: "vertical" }} />
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13, color: t.text3, marginBottom: 14 }}>
              <input type="checkbox" checked={noticeForm.active} onChange={function (e) { setNoticeForm(function (f) { return Object.assign({}, f, { active: e.target.checked }); }); }} style={{ accentColor: "#6366f1", width: 15, height: 15 }} /> 즉시 공개
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {editNotice ? <button onClick={function () { setEditNotice(null); setNoticeForm({ title: "", content: "", active: true }); }} style={{ flex: 1, background: t.surface2, border: "1px solid " + t.border, borderRadius: 9, padding: "9px 0", cursor: "pointer", color: t.text3, fontWeight: 600 }}>취소</button> : null}
              <button onClick={addNotice} style={{ flex: 1, background: "#6366f1", border: "none", borderRadius: 9, padding: "9px 0", cursor: "pointer", color: "#fff", fontWeight: 700 }}>{editNotice ? "수정 완료" : "공지 등록"}</button>
            </div>
          </div>
          <div style={s}>
            <div style={{ padding: "11px 16px", borderBottom: "1px solid " + t.border, fontSize: 12, fontWeight: 700, color: t.text4, textTransform: "uppercase", letterSpacing: ".5px" }}>등록된 공지 ({notices.length})</div>
            {notices.length === 0 ? <div style={{ padding: "24px", textAlign: "center", color: t.text5, fontSize: 13 }}>등록된 공지가 없습니다</div> : null}
            {notices.map(function (n) {
              return (
                <div key={n.id} style={{ padding: "12px 16px", borderBottom: "1px solid " + t.border, display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{n.title}</span>
                      <span style={{ fontSize: 10, background: n.active ? "#34d39920" : "#6b728020", color: n.active ? "#34d399" : "#6b7280", borderRadius: 20, padding: "1px 8px", fontWeight: 700 }}>{n.active ? "공개" : "숨김"}</span>
                    </div>
                    <div style={{ fontSize: 12, color: t.text4 }}>{n.content}</div>
                  </div>
                  <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                    <button onClick={function () { onUpdateNotices(notices.map(function (x) { return x.id === n.id ? Object.assign({}, x, { active: !x.active }) : x; })); }} style={{ background: t.surface2, border: "1px solid " + t.border, borderRadius: 7, padding: "4px 10px", fontSize: 11, color: t.text3, cursor: "pointer" }}>{n.active ? "숨기기" : "공개"}</button>
                    <button onClick={function () { setEditNotice(n.id); setNoticeForm({ title: n.title, content: n.content, active: n.active }); }} style={{ background: "#6366f120", border: "1px solid #6366f140", borderRadius: 7, padding: "4px 10px", fontSize: 11, color: "#818cf8", cursor: "pointer" }}>수정</button>
                    <button onClick={function () { onUpdateNotices(notices.filter(function (x) { return x.id !== n.id; })); }} style={{ background: "#f8717120", border: "1px solid #f8717140", borderRadius: 7, padding: "4px 10px", fontSize: 11, color: "#f87171", cursor: "pointer" }}>삭제</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
      {aTab === "tabs" ? (
        <div style={s}>
          <div style={{ padding: "11px 16px", borderBottom: "1px solid " + t.border, fontSize: 12, fontWeight: 700, color: t.text4, textTransform: "uppercase", letterSpacing: ".5px" }}>탭 메뉴 표시 설정</div>
          {ALL_TABS.map(function (tab) {
            const active = visibleTabs.includes(tab.id);
            return (
              <div key={tab.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", borderBottom: "1px solid " + t.border }}>
                <div style={{ fontSize: 13, color: t.text, fontWeight: 500 }}>{tab.label}</div>
                <div onClick={function () { setVisibleTabs(active ? visibleTabs.filter(function (v) { return v !== tab.id; }) : visibleTabs.concat([tab.id])); }} style={{ width: 44, height: 24, borderRadius: 99, background: active ? "#6366f1" : t.surface2, border: "1px solid " + (active ? "#6366f1" : t.border), cursor: "pointer", position: "relative" }}>
                  <div style={{ position: "absolute", top: 3, left: active ? 22 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff" }} />
                </div>
              </div>
            );
          })}
          <div style={{ padding: "12px 16px", fontSize: 11, color: t.text4 }}>※ 관리자는 모든 탭에 항상 접근 가능합니다.</div>
        </div>
      ) : null}
      {aTab === "schedule" ? (
        <div style={s}>
          <div style={{ padding: "11px 16px", borderBottom: "1px solid " + t.border, fontSize: 12, fontWeight: 700, color: t.text4, textTransform: "uppercase", letterSpacing: ".5px" }}>전체 스케줄 조율 ({tasks.length}개)</div>
          {tasks.length === 0 ? <div style={{ padding: "24px", textAlign: "center", color: t.text5, fontSize: 13 }}>등록된 스케줄이 없습니다</div> : null}
          {tasks.map(function (tk) {
            return (
              <div key={tk.id} style={{ padding: "12px 16px", borderBottom: "1px solid " + t.border, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 3, height: 36, borderRadius: 99, background: STAGE_COLOR[tk.status], flexShrink: 0 }} />
                <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{tk.title}</div><div style={{ fontSize: 11, color: t.text4, marginTop: 2 }}>{tk.assignee} · {tk.tag} · 마감 {tk.due}</div></div>
                <select value={tk.assignee} onChange={function (e) { onUpdateTasks(tasks.map(function (t2) { return t2.id === tk.id ? Object.assign({}, t2, { assignee: e.target.value }) : t2; })); }} style={{ background: t.inputBg, border: "1px solid " + t.inputBorder, borderRadius: 8, padding: "5px 9px", fontSize: 12, color: t.text, outline: "none" }}>
                  {users.filter(function (u) { return u.role !== "admin" && u.approved; }).map(function (u) { return <option key={u.name}>{u.name}</option>; })}
                </select>
                <select value={tk.status} onChange={function (e) { onUpdateTasks(tasks.map(function (t2) { return t2.id === tk.id ? Object.assign({}, t2, { status: e.target.value }) : t2; })); }} style={{ background: STAGE_COLOR[tk.status] + "20", border: "1px solid " + (STAGE_COLOR[tk.status] + "40"), color: STAGE_COLOR[tk.status], borderRadius: 8, padding: "5px 9px", fontSize: 12, outline: "none", fontWeight: 700 }}>
                  {STAGES.map(function (s) { return <option key={s}>{s}</option>; })}
                </select>
                <input type="date" value={tk.due} onChange={function (e) { onUpdateTasks(tasks.map(function (t2) { return t2.id === tk.id ? Object.assign({}, t2, { due: e.target.value }) : t2; })); }} style={{ background: t.inputBg, border: "1px solid " + t.inputBorder, borderRadius: 8, padding: "5px 9px", fontSize: 12, color: t.text, outline: "none" }} />
                <button onClick={function () { onUpdateTasks(tasks.filter(function (t2) { return t2.id !== tk.id; })); }} style={{ background: "#f8717120", border: "1px solid #f8717140", borderRadius: 7, padding: "5px 10px", fontSize: 11, color: "#f87171", cursor: "pointer" }}>삭제</button>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function ReportModal(props) {
  const { tasks, mode, year, month, onClose, currentUser } = props;
  const stageList = props.stages || STAGES;
  const stageColorMap = props.stageColor || STAGE_COLOR;
  const stageIconMap = props.stageIcon || STAGE_ICON;
  const tagList = props.tags || TAGS;
  const tagColorMap = props.tagColor || TAG_COLOR;
  const doneStatus = props.doneStatus || "업로드 완료";
  const sourceLabel = props.sourceLabel || "영상";
  const today = new Date();
  const pad = function (n) { return String(n).padStart(2, "0"); };
  const filtered = tasks.filter(function (tk) {
    if (!tk.due) return false;
    if (mode === "year") return tk.due.startsWith(String(year));
    return tk.due.startsWith(year + "-" + pad(month));
  });
  const total = filtered.length, done = filtered.filter(function (tk) { return tk.status === doneStatus; }).length;
  const rate = total ? Math.round(done / total * 100) : 0;
  const byStage = stageList.map(function (s) { return { s: s, count: filtered.filter(function (tk) { return tk.status === s; }).length }; });
  const byTag = tagList.map(function (tag) { return { tag: tag, count: filtered.filter(function (tk) { return tk.tag === tag; }).length }; }).filter(function (x) { return x.count > 0; });
  const byMember = [...new Set(filtered.map(function (tk) { return tk.assignee; }))].map(function (m) { return { name: m, done: filtered.filter(function (tk) { return tk.assignee === m && tk.status === doneStatus; }).length, total: filtered.filter(function (tk) { return tk.assignee === m; }).length }; });
  const title = mode === "year" ? year + "년 연간 보고" : year + "년 " + month + "월 월간 보고";
  const reportDate = today.getFullYear() + "." + pad(today.getMonth() + 1) + "." + pad(today.getDate());
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000cc", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
      <div style={{ background: "#fff", borderRadius: 20, width: 600, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 64px #0004" }}>
        <div style={{ background: "linear-gradient(135deg,#1e293b,#0f172a)", padding: "26px 30px 22px", borderRadius: "20px 20px 0 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>TIMBEL {sourceLabel} 업무 보고</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#f8fafc" }}>{title}</div>
              <div style={{ fontSize: 12, color: "#475569", marginTop: 5 }}>보고일: {reportDate} | 보고자: {currentUser && currentUser.name} ({currentUser && currentUser.rank} / {currentUser && currentUser.position})</div>
            </div>
            <button onClick={onClose} style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: "6px 12px", color: "#94a3b8", cursor: "pointer", fontSize: 12 }}>닫기</button>
          </div>
        </div>
        <div style={{ padding: "22px 28px 28px" }}>
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", borderLeft: "3px solid #6366f1", paddingLeft: 10, marginBottom: 12 }}>📊 종합 현황</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
              {[["전체 " + sourceLabel, total, "#6366f1"], [doneStatus, done, "#22c55e"], ["진행 중", total - done, "#f59e0b"], ["완료율", rate + "%", "#3b82f6"]].map(function (item) {
                return <div key={item[0]} style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 0", textAlign: "center", border: "1px solid #e2e8f0" }}><div style={{ fontSize: 22, fontWeight: 800, color: item[2] }}>{item[1]}</div><div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{item[0]}</div></div>;
              })}
            </div>
          </div>
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", borderLeft: "3px solid #fb923c", paddingLeft: 10, marginBottom: 12 }}>🎬 단계별 현황</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead><tr style={{ background: "#f8fafc" }}>{["단계", sourceLabel + " 수", "비율"].map(function (h) { return <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", borderBottom: "1px solid #e2e8f0" }}>{h}</th>; })}</tr></thead>
              <tbody>
                {byStage.filter(function (x) { return x.count > 0; }).map(function (item) {
                  return (
                    <tr key={item.s}>
                      <td style={{ padding: "8px 12px", color: "#1e293b", borderBottom: "1px solid #f1f5f9" }}>{stageIconMap[item.s]} {item.s}</td>
                      <td style={{ padding: "8px 12px", fontWeight: 700, color: stageColorMap[item.s], borderBottom: "1px solid #f1f5f9" }}>{item.count}개</td>
                      <td style={{ padding: "8px 12px", borderBottom: "1px solid #f1f5f9" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 80, background: "#e2e8f0", borderRadius: 99, height: 5 }}><div style={{ width: total ? (item.count / total * 100) + "%" : "0%", background: stageColorMap[item.s], height: "100%", borderRadius: 99 }} /></div><span style={{ fontSize: 11, color: "#64748b" }}>{total ? Math.round(item.count / total * 100) : 0}%</span></div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {byTag.length > 0 ? (
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", borderLeft: "3px solid #38bdf8", paddingLeft: 10, marginBottom: 12 }}>🏷️ 카테고리별</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{byTag.map(function (item) { return <div key={item.tag} style={{ background: (tagColorMap[item.tag] || "#818cf8") + "15", border: "1px solid " + ((tagColorMap[item.tag] || "#818cf8") + "30"), borderRadius: 10, padding: "8px 16px", textAlign: "center" }}><div style={{ fontSize: 18, fontWeight: 800, color: tagColorMap[item.tag] || "#818cf8" }}>{item.count}</div><div style={{ fontSize: 11, color: "#64748b" }}>{item.tag}</div></div>; })}</div>
            </div>
          ) : null}
          {byMember.length > 0 ? (
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", borderLeft: "3px solid #c084fc", paddingLeft: 10, marginBottom: 12 }}>👥 담당자별 성과</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead><tr style={{ background: "#f8fafc" }}>{["담당자", "전체", "완료", "완료율"].map(function (h) { return <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", borderBottom: "1px solid #e2e8f0" }}>{h}</th>; })}</tr></thead>
                <tbody>
                  {byMember.map(function (item) {
                    return (
                      <tr key={item.name}>
                        <td style={{ padding: "8px 12px", fontWeight: 600, color: "#1e293b", borderBottom: "1px solid #f1f5f9" }}>{item.name}</td>
                        <td style={{ padding: "8px 12px", color: "#475569", borderBottom: "1px solid #f1f5f9" }}>{item.total}개</td>
                        <td style={{ padding: "8px 12px", color: "#22c55e", fontWeight: 700, borderBottom: "1px solid #f1f5f9" }}>{item.done}개</td>
                        <td style={{ padding: "8px 12px", borderBottom: "1px solid #f1f5f9" }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 60, background: "#e2e8f0", borderRadius: 99, height: 5 }}><div style={{ width: item.total ? (item.done / item.total * 100) + "%" : "0%", background: "#6366f1", height: "100%", borderRadius: 99 }} /></div><span style={{ fontSize: 11, color: "#64748b" }}>{item.total ? Math.round(item.done / item.total * 100) : 0}%</span></div></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}
          <div style={{ marginTop: 24, paddingTop: 14, borderTop: "1px solid #e2e8f0", fontSize: 11, color: "#94a3b8", textAlign: "center" }}>TIMBEL 영상 제작 스케줄러 자동 생성 | {reportDate}</div>
        </div>
      </div>
    </div>
  );
}

function DonutChart(props) {
  const { t } = useTheme();
  const rate = props.rate, size = 132, stroke = 14, r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const offset = c - (rate / 100) * c;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "relative", width: size, height: size, margin: "0 auto" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={t.bg} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="url(#donutGrad)" strokeWidth={stroke} strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" />
        <defs><linearGradient id="donutGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#34d399" /></linearGradient></defs>
      </svg>
      <div style={{ position: "absolute", textAlign: "center" }}><div style={{ fontSize: 24, fontWeight: 900, color: t.text }}>{rate}%</div><div style={{ fontSize: 10, color: t.text4, marginTop: 1 }}>완료율</div></div>
    </div>
  );
}
function PieChart(props) {
  const { t } = useTheme();
  const data = props.data;
  let total = 0;
  for (let i = 0; i < data.length; i++) total += data[i].count;
  const size = 150, r = size / 2;
  let cumulative = 0;
  const sliceList = [];
  for (let i = 0; i < data.length; i++) {
    const d = data[i];
    if (d.count <= 0) continue;
    const fraction = total ? d.count / total : 0;
    const startAngle = cumulative * 2 * Math.PI;
    cumulative += fraction;
    const endAngle = cumulative * 2 * Math.PI;
    const x1 = r + r * Math.sin(startAngle), y1 = r - r * Math.cos(startAngle);
    const x2 = r + r * Math.sin(endAngle), y2 = r - r * Math.cos(endAngle);
    const largeArc = (endAngle - startAngle) > Math.PI ? 1 : 0;
    let path;
    if (total === d.count) path = "M " + r + " 0 A " + r + " " + r + " 0 1 1 " + (r - 0.01) + " 0 Z";
    else path = "M " + r + "," + r + " L " + x1 + "," + y1 + " A " + r + " " + r + " 0 " + largeArc + " 1 " + x2 + "," + y2 + " Z";
    sliceList.push({ path: path, color: d.color, label: d.label, count: d.count, pct: total ? Math.round(fraction * 100) : 0 });
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
      <svg width={size} height={size} viewBox={"0 0 " + size + " " + size} style={{ flexShrink: 0 }}>{sliceList.map(function (s, i) { return <path key={i} d={s.path} fill={s.color} stroke={t.surface} strokeWidth={2} />; })}</svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 7, flex: 1, minWidth: 120 }}>
        {sliceList.map(function (s, i) { return <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flexShrink: 0 }} /><span style={{ fontSize: 12, color: t.text2, flex: 1 }}>{s.label}</span><span style={{ fontSize: 11, color: t.text4 }}>{s.count}개 · {s.pct}%</span></div>; })}
        {sliceList.length === 0 ? <div style={{ fontSize: 12, color: t.text5 }}>데이터 없음</div> : null}
      </div>
    </div>
  );
}
function LineChart(props) {
  const { t } = useTheme();
  const data = props.data, w = 560, h = 140, padX = 20, padY = 18;
  let maxVal = 1;
  for (let i = 0; i < data.length; i++) if (data[i].value > maxVal) maxVal = data[i].value;
  const stepX = data.length > 1 ? (w - padX * 2) / (data.length - 1) : 0;
  const pts = data.map(function (d, i) { return { x: padX + i * stepX, y: h - padY - (d.value / maxVal) * (h - padY * 2), value: d.value, label: d.label }; });
  let linePath = "";
  for (let i = 0; i < pts.length; i++) linePath += (i === 0 ? "M" : "L") + pts[i].x + "," + pts[i].y + " ";
  const lastPt = pts[pts.length - 1], firstPt = pts[0];
  const areaPath = linePath + " L " + lastPt.x + "," + (h - padY) + " L " + firstPt.x + "," + (h - padY) + " Z";
  return (
    <svg width="100%" viewBox={"0 0 " + w + " " + h} style={{ overflow: "visible" }}>
      <defs><linearGradient id="lineAreaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" /><stop offset="100%" stopColor="#6366f1" stopOpacity="0" /></linearGradient></defs>
      <path d={areaPath} fill="url(#lineAreaGrad)" />
      <path d={linePath} fill="none" stroke="#6366f1" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {pts.map(function (p, i) { return <g key={i}><circle cx={p.x} cy={p.y} r={3.5} fill="#6366f1" stroke={t.surface} strokeWidth={2} /><text x={p.x} y={h - 2} textAnchor="middle" fontSize="9" fill={t.text4}>{p.label}</text>{p.value > 0 ? <text x={p.x} y={p.y - 9} textAnchor="middle" fontSize="9" fill={t.text3} fontWeight="700">{p.value}</text> : null}</g>; })}
    </svg>
  );
}

function StatsPanel(props) {
  const { t } = useTheme();
  const currentUser = props.currentUser;
  const videoTasks = props.videoTasks || [];
  const marketingTasks = props.marketingTasks || [];
  const designTasks = props.designTasks || [];
  const SOURCES = {
    video: { label: "영상", tasks: videoTasks, stages: STAGES, stageColor: STAGE_COLOR, stageIcon: STAGE_ICON, tags: TAGS, tagColor: TAG_COLOR, doneStatus: "업로드 완료", accent: "#818cf8" },
    marketing: { label: "마케팅", tasks: marketingTasks, stages: MARKETING_STAGES, stageColor: MARKETING_STAGE_COLOR, stageIcon: MARKETING_STAGE_ICON, tags: MARKETING_TAGS, tagColor: MARKETING_TAG_COLOR, doneStatus: "완료", accent: "#fbbf24" },
    design: { label: "디자인", tasks: designTasks, stages: DESIGN_STAGES, stageColor: DESIGN_STAGE_COLOR, stageIcon: DESIGN_STAGE_ICON, tags: DESIGN_TAGS, tagColor: DESIGN_TAG_COLOR, doneStatus: "완료", accent: "#f87171" },
  };
  const [source, setSource] = useState("all");
  const today = new Date();
  const [mode, setMode] = useState("all");
  const [selYear, setSelYear] = useState(today.getFullYear());
  const [selMonth, setSelMonth] = useState(today.getMonth() + 1);
  const [showReport, setShowReport] = useState(false);
  const pad = function (n) { return String(n).padStart(2, "0"); };
  const allCombined = videoTasks.concat(marketingTasks).concat(designTasks);
  const years = [...new Set(allCombined.map(function (tk) { return tk.due && tk.due.slice(0, 4); }).filter(Boolean))].sort();
  if (!years.includes(String(today.getFullYear()))) years.push(String(today.getFullYear()));
  const dateFilter = function (list) {
    return list.filter(function (tk) {
      if (!tk.due) return mode === "all";
      if (mode === "year") return tk.due.startsWith(String(selYear));
      if (mode === "month") return tk.due.startsWith(selYear + "-" + pad(selMonth));
      return true;
    });
  };
  const s = { background: t.surface, borderRadius: 13, padding: "15px 17px", border: "1px solid " + t.border };
  const modeBtn = function (v) { return { padding: "6px 14px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 12, fontWeight: mode === v ? 700 : 500, background: mode === v ? "#6366f1" : t.surface2, color: mode === v ? "#fff" : t.text4 }; };
  const sourceBtn = function (v, accent) { return { padding: "6px 14px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 12, fontWeight: source === v ? 700 : 500, background: source === v ? accent : t.surface2, color: source === v ? "#fff" : t.text4 }; };
  const sourceTabs = (
    <div style={{ display: "flex", gap: 4, background: t.bg, borderRadius: 9, padding: 3, border: "1px solid " + t.border, flexWrap: "wrap" }}>
      <button style={sourceBtn("all", "#6366f1")} onClick={function () { setSource("all"); }}>전체</button>
      <button style={sourceBtn("video", "#818cf8")} onClick={function () { setSource("video"); }}>📅 영상</button>
      <button style={sourceBtn("marketing", "#fbbf24")} onClick={function () { setSource("marketing"); }}>🗓️ 마케팅</button>
      <button style={sourceBtn("design", "#f87171")} onClick={function () { setSource("design"); }}>🎨 디자인</button>
    </div>
  );
  const periodTabs = (
    <div style={{ display: "flex", gap: 4, background: t.bg, borderRadius: 9, padding: 3, border: "1px solid " + t.border }}>
      <button style={modeBtn("all")} onClick={function () { setMode("all"); }}>전체</button>
      <button style={modeBtn("year")} onClick={function () { setMode("year"); }}>연별</button>
      <button style={modeBtn("month")} onClick={function () { setMode("month"); }}>월별</button>
    </div>
  );
  const periodSelectors = (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {(mode === "year" || mode === "month") ? <select value={selYear} onChange={function (e) { setSelYear(Number(e.target.value)); }} style={{ background: t.inputBg, border: "1px solid " + t.inputBorder, borderRadius: 8, padding: "5px 10px", fontSize: 12, color: t.text, outline: "none" }}>{years.map(function (y) { return <option key={y}>{y}</option>; })}</select> : null}
      {mode === "month" ? <select value={selMonth} onChange={function (e) { setSelMonth(Number(e.target.value)); }} style={{ background: t.inputBg, border: "1px solid " + t.inputBorder, borderRadius: 8, padding: "5px 10px", fontSize: 12, color: t.text, outline: "none" }}>{Array.from({ length: 12 }, function (_, i) { return <option key={i + 1} value={i + 1}>{i + 1}월</option>; })}</select> : null}
    </div>
  );

  if (source !== "all") {
    const cfg = SOURCES[source];
    const filtered = dateFilter(cfg.tasks);
    const total = filtered.length, done = filtered.filter(function (tk) { return tk.status === cfg.doneStatus; }).length;
    const rate = total ? Math.round(done / total * 100) : 0;
    const monthlyData = mode === "year" ? Array.from({ length: 12 }, function (_, i) { const m = String(i + 1).padStart(2, "0"); const mT = cfg.tasks.filter(function (tk) { return tk.due && tk.due.startsWith(selYear + "-" + m); }); return { month: i + 1, total: mT.length, done: mT.filter(function (tk) { return tk.status === cfg.doneStatus; }).length }; }) : null;
    const yearlyData = mode === "all" ? years.map(function (y) { const yT = cfg.tasks.filter(function (tk) { return tk.due && tk.due.startsWith(y); }); return { year: y, total: yT.length, done: yT.filter(function (tk) { return tk.status === cfg.doneStatus; }).length }; }) : null;
    const barData = monthlyData || yearlyData;
    const allAssignees = [...new Set(filtered.map(function (tk) { return tk.assignee; }))];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {showReport ? <ReportModal tasks={cfg.tasks} mode={mode === "all" ? "year" : mode} year={selYear} month={selMonth} onClose={function () { setShowReport(false); }} currentUser={currentUser} stages={cfg.stages} stageColor={cfg.stageColor} stageIcon={cfg.stageIcon} tags={cfg.tags} tagColor={cfg.tagColor} doneStatus={cfg.doneStatus} sourceLabel={cfg.label} /> : null}
        <div style={Object.assign({}, s, { padding: "12px 16px" })}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>{sourceTabs}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {periodTabs}
            {periodSelectors}
            <span style={{ fontSize: 12, color: t.text4 }}>{total}개</span>
            <button onClick={function () { setShowReport(true); }} style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg,#6366f1,#818cf8)", border: "none", borderRadius: 9, padding: "7px 16px", fontWeight: 700, fontSize: 12, color: "#fff", cursor: "pointer" }}>📋 {mode === "all" ? "보고서 생성" : mode === "year" ? selYear + "년 보고" : selYear + "년 " + selMonth + "월 보고"}</button>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
          {[["전체", total, cfg.accent], ["완료", done, "#34d399"], ["진행 중", total - done, "#fb923c"], ["완료율", rate + "%", "#38bdf8"]].map(function (item) { return <div key={item[0]} style={Object.assign({}, s, { textAlign: "center" })}><div style={{ fontSize: 24, fontWeight: 900, color: item[2] }}>{item[1]}</div><div style={{ fontSize: 11, color: t.text4, marginTop: 3 }}>{item[0]}</div></div>; })}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 12 }}>
          <div style={s}><div style={{ fontSize: 11, fontWeight: 700, color: t.text4, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".5px" }}>완료율</div><DonutChart rate={rate} /></div>
          <div style={s}><div style={{ fontSize: 11, fontWeight: 700, color: t.text4, marginBottom: 14, textTransform: "uppercase", letterSpacing: ".5px" }}>단계별 비율</div><PieChart data={cfg.stages.map(function (st) { return { label: st, color: cfg.stageColor[st], count: filtered.filter(function (tk) { return tk.status === st; }).length }; })} /></div>
        </div>
        {barData ? <div style={s}><div style={{ fontSize: 11, fontWeight: 700, color: t.text4, marginBottom: 10, textTransform: "uppercase", letterSpacing: ".5px" }}>{mode === "year" ? selYear + "년 추세" : "연도별 추세"}</div><LineChart data={barData.map(function (d) { return { label: mode === "year" ? d.month + "월" : d.year, value: d.total }; })} /></div> : null}
        <div style={s}>
          <div style={{ fontSize: 11, fontWeight: 700, color: t.text4, marginBottom: 12, textTransform: "uppercase", letterSpacing: ".5px" }}>단계별</div>
          {cfg.stages.map(function (st) { const c = filtered.filter(function (tk) { return tk.status === st; }).length; return <div key={st} style={{ marginBottom: 9 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}><span style={{ color: cfg.stageColor[st] }}>{cfg.stageIcon[st]} {st}</span><span style={{ color: t.text4 }}>{c}</span></div><div style={{ background: t.bg, borderRadius: 99, height: 5 }}><div style={{ width: total ? (c / total * 100) + "%" : "0%", background: cfg.stageColor[st], height: "100%", borderRadius: 99 }} /></div></div>; })}
        </div>
        <div style={s}>
          <div style={{ fontSize: 11, fontWeight: 700, color: t.text4, marginBottom: 12, textTransform: "uppercase", letterSpacing: ".5px" }}>담당자별</div>
          {allAssignees.map(function (m) { const d = filtered.filter(function (tk) { return tk.assignee === m && tk.status === cfg.doneStatus; }).length; const tt = filtered.filter(function (tk) { return tk.assignee === m; }).length; return <div key={m} style={{ marginBottom: 10 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}><div style={{ display: "flex", gap: 7, alignItems: "center" }}><Avatar name={m} size={20} /><span style={{ fontSize: 12, color: t.text2 }}>{m}</span></div><span style={{ fontSize: 11, color: t.text4 }}>{d}/{tt} 완료</span></div><div style={{ background: t.bg, borderRadius: 99, height: 5 }}><div style={{ width: tt ? (d / tt * 100) + "%" : "0%", background: "#6366f1", height: "100%", borderRadius: 99 }} /></div></div>; })}
        </div>
      </div>
    );
  }

  const filteredVideo = dateFilter(videoTasks);
  const filteredMarketing = dateFilter(marketingTasks);
  const filteredDesign = dateFilter(designTasks);
  const doneVideo = filteredVideo.filter(function (tk) { return tk.status === "업로드 완료"; }).length;
  const doneMarketing = filteredMarketing.filter(function (tk) { return tk.status === "완료"; }).length;
  const doneDesign = filteredDesign.filter(function (tk) { return tk.status === "완료"; }).length;
  const total = filteredVideo.length + filteredMarketing.length + filteredDesign.length;
  const done = doneVideo + doneMarketing + doneDesign;
  const rate = total ? Math.round(done / total * 100) : 0;
  const monthlyData = mode === "year" ? Array.from({ length: 12 }, function (_, i) { const m = String(i + 1).padStart(2, "0"); const prefix = selYear + "-" + m; const cnt = videoTasks.filter(function (tk) { return tk.due && tk.due.startsWith(prefix); }).length + marketingTasks.filter(function (tk) { return tk.due && tk.due.startsWith(prefix); }).length + designTasks.filter(function (tk) { return tk.due && tk.due.startsWith(prefix); }).length; return { month: i + 1, total: cnt }; }) : null;
  const yearlyData = mode === "all" ? years.map(function (y) { const cnt = videoTasks.filter(function (tk) { return tk.due && tk.due.startsWith(y); }).length + marketingTasks.filter(function (tk) { return tk.due && tk.due.startsWith(y); }).length + designTasks.filter(function (tk) { return tk.due && tk.due.startsWith(y); }).length; return { year: y, total: cnt }; }) : null;
  const barData = monthlyData || yearlyData;
  const typeBreakdown = [
    { label: "영상", color: "#818cf8", count: filteredVideo.length },
    { label: "마케팅", color: "#fbbf24", count: filteredMarketing.length },
    { label: "디자인", color: "#f87171", count: filteredDesign.length },
  ];
  const allAssignees = [...new Set(filteredVideo.map(function (tk) { return tk.assignee; }).concat(filteredMarketing.map(function (tk) { return tk.assignee; })).concat(filteredDesign.map(function (tk) { return tk.assignee; })))];
  const assigneeStats = allAssignees.map(function (m) {
    const vd = filteredVideo.filter(function (tk) { return tk.assignee === m; });
    const md = filteredMarketing.filter(function (tk) { return tk.assignee === m; });
    const dd = filteredDesign.filter(function (tk) { return tk.assignee === m; });
    const tt = vd.length + md.length + dd.length;
    const dn = vd.filter(function (tk) { return tk.status === "업로드 완료"; }).length + md.filter(function (tk) { return tk.status === "완료"; }).length + dd.filter(function (tk) { return tk.status === "완료"; }).length;
    return { name: m, total: tt, done: dn };
  });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={Object.assign({}, s, { padding: "12px 16px" })}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>{sourceTabs}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {periodTabs}
          {periodSelectors}
          <span style={{ fontSize: 12, color: t.text4 }}>{total}개</span>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
        {[["전체", total, "#6366f1"], ["완료", done, "#34d399"], ["진행 중", total - done, "#fb923c"], ["완료율", rate + "%", "#38bdf8"]].map(function (item) { return <div key={item[0]} style={Object.assign({}, s, { textAlign: "center" })}><div style={{ fontSize: 24, fontWeight: 900, color: item[2] }}>{item[1]}</div><div style={{ fontSize: 11, color: t.text4, marginTop: 3 }}>{item[0]}</div></div>; })}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 12 }}>
        <div style={s}><div style={{ fontSize: 11, fontWeight: 700, color: t.text4, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".5px" }}>완료율</div><DonutChart rate={rate} /></div>
        <div style={s}><div style={{ fontSize: 11, fontWeight: 700, color: t.text4, marginBottom: 14, textTransform: "uppercase", letterSpacing: ".5px" }}>유형별 비율</div><PieChart data={typeBreakdown} /></div>
      </div>
      {barData ? <div style={s}><div style={{ fontSize: 11, fontWeight: 700, color: t.text4, marginBottom: 10, textTransform: "uppercase", letterSpacing: ".5px" }}>{mode === "year" ? selYear + "년 전체 업무 추세" : "연도별 전체 업무 추세"}</div><LineChart data={barData.map(function (d) { return { label: mode === "year" ? d.month + "월" : d.year, value: d.total }; })} /></div> : null}
      <div style={s}>
        <div style={{ fontSize: 11, fontWeight: 700, color: t.text4, marginBottom: 12, textTransform: "uppercase", letterSpacing: ".5px" }}>유형별 현황</div>
        {[["영상", filteredVideo.length, doneVideo, "#818cf8"], ["마케팅", filteredMarketing.length, doneMarketing, "#fbbf24"], ["디자인", filteredDesign.length, doneDesign, "#f87171"]].map(function (item) {
          const label = item[0], cnt = item[1], dn = item[2], color = item[3];
          return <div key={label} style={{ marginBottom: 9 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}><span style={{ color: color }}>{label}</span><span style={{ color: t.text4 }}>{dn}/{cnt} 완료</span></div><div style={{ background: t.bg, borderRadius: 99, height: 5 }}><div style={{ width: cnt ? (dn / cnt * 100) + "%" : "0%", background: color, height: "100%", borderRadius: 99 }} /></div></div>;
        })}
      </div>
      <div style={s}>
        <div style={{ fontSize: 11, fontWeight: 700, color: t.text4, marginBottom: 12, textTransform: "uppercase", letterSpacing: ".5px" }}>담당자별 (전체 유형 합산)</div>
        {assigneeStats.map(function (item) { return <div key={item.name} style={{ marginBottom: 10 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}><div style={{ display: "flex", gap: 7, alignItems: "center" }}><Avatar name={item.name} size={20} /><span style={{ fontSize: 12, color: t.text2 }}>{item.name}</span></div><span style={{ fontSize: 11, color: t.text4 }}>{item.done}/{item.total} 완료</span></div><div style={{ background: t.bg, borderRadius: 99, height: 5 }}><div style={{ width: item.total ? (item.done / item.total * 100) + "%" : "0%", background: "#6366f1", height: "100%", borderRadius: 99 }} /></div></div>; })}
      </div>
    </div>
  );
}

function TaskDetailModal(props) {
  const { t } = useTheme();
  const { task, onClose, onUpdate, onMove, users, currentUser, onNotify } = props;
  const stageList = props.stages || STAGES;
  const stageColorMap = props.stageColor || STAGE_COLOR;
  const stageIconMap = props.stageIcon || STAGE_ICON;
  const tagList = props.tags || TAGS;
  const categoryLabel = props.categoryLabel || "플랫폼";
  const editTitle = props.editTitle || "✏️ 영상 정보 수정";
  const [comment, setComment] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ title: task.title, desc: task.desc, due: task.due, assignee: task.assignee, priority: task.priority, tag: task.tag, fileUrl: task.fileUrl || "" });
  const idx = stageList.indexOf(task.status);
  const memberNames = users.filter(function (u) { return u.approved && u.role !== "admin"; }).map(function (u) { return u.name; });
  const setEF = function (k, v) { setEditForm(function (f) { return Object.assign({}, f, { [k]: v }); }); };
  const inp = { width: "100%", background: t.inputBg, border: "1px solid " + t.inputBorder, borderRadius: 9, padding: "8px 11px", fontSize: 13, color: t.text, boxSizing: "border-box", outline: "none" };
  const addComment = function () {
    if (!comment.trim()) return;
    const trimmed = comment.trim();
    const comments = task.comments || [];
    onUpdate(Object.assign({}, task, { comments: comments.concat([{ id: "c_" + Date.now(), author: currentUser.name, text: trimmed, time: new Date().toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) }]) }));
    if (onNotify && task.assignee && task.assignee !== currentUser.name) onNotify(task.assignee, currentUser.name, task.title, trimmed);
    setComment("");
  };
  const saveEdit = function () { if (!editForm.title.trim()) return; onUpdate(Object.assign({}, task, editForm)); setEditMode(false); };

  if (editMode) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "#00000099", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
        <div style={{ background: t.surface, borderRadius: 18, width: 400, maxHeight: "85vh", overflowY: "auto", border: "1px solid " + t.border, boxShadow: "0 24px 64px #000c", padding: "22px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: t.text }}>{editTitle}</div>
            <button onClick={function () { setEditMode(false); }} style={{ background: "none", border: "none", color: t.text5, cursor: "pointer", fontSize: 20 }}>×</button>
          </div>
          <div style={{ marginBottom: 11 }}><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>제목</div><input value={editForm.title} onChange={function (e) { setEF("title", e.target.value); }} style={inp} /></div>
          <div style={{ marginBottom: 11 }}><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>설명</div><input value={editForm.desc} onChange={function (e) { setEF("desc", e.target.value); }} style={inp} /></div>
          <div style={{ marginBottom: 11 }}><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>마감일</div><input type="date" value={editForm.due} onChange={function (e) { setEF("due", e.target.value); }} style={inp} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 11 }}>
            <div><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>담당자</div><select value={editForm.assignee} onChange={function (e) { setEF("assignee", e.target.value); }} style={Object.assign({}, inp, { cursor: "pointer" })}>{memberNames.map(function (m) { return <option key={m}>{m}</option>; })}</select></div>
            <div><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>우선순위</div><select value={editForm.priority} onChange={function (e) { setEF("priority", e.target.value); }} style={Object.assign({}, inp, { cursor: "pointer" })}>{PRIORITIES.map(function (p) { return <option key={p}>{p}</option>; })}</select></div>
          </div>
          <div style={{ marginBottom: 11 }}><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>{categoryLabel}</div><select value={editForm.tag} onChange={function (e) { setEF("tag", e.target.value); }} style={Object.assign({}, inp, { cursor: "pointer" })}>{tagList.map(function (tg) { return <option key={tg}>{tg}</option>; })}</select></div>
          <div style={{ marginBottom: 18 }}><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>📎 파일 링크</div><input value={editForm.fileUrl} onChange={function (e) { setEF("fileUrl", e.target.value); }} placeholder="https://..." style={inp} /></div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={function () { setEditMode(false); }} style={{ flex: 1, background: t.surface2, border: "1px solid " + t.border2, borderRadius: 9, padding: "10px 0", cursor: "pointer", color: t.text3, fontWeight: 600 }}>취소</button>
            <button onClick={saveEdit} style={{ flex: 1, background: "#6366f1", border: "none", borderRadius: 9, padding: "10px 0", cursor: "pointer", color: "#fff", fontWeight: 700 }}>저장</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000099", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
      <div style={{ background: t.surface, borderRadius: 18, width: 460, maxHeight: "85vh", display: "flex", flexDirection: "column", border: "1px solid " + t.border, boxShadow: "0 24px 64px #000c" }}>
        <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid " + t.border }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, color: stageColorMap[task.status], background: stageColorMap[task.status] + "18", padding: "2px 9px", borderRadius: 20, fontWeight: 700 }}>{stageIconMap[task.status]} {task.status}</span>
                <span style={{ fontSize: 11, color: PRIORITY_COLOR[task.priority], background: PRIORITY_COLOR[task.priority] + "18", padding: "2px 9px", borderRadius: 20, fontWeight: 700 }}>{task.priority}</span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: t.text }}>{task.title}</div>
              <div style={{ fontSize: 12, color: t.text4, marginTop: 3 }}>{task.desc}</div>
              <div style={{ display: "flex", gap: 14, marginTop: 10 }}><div style={{ display: "flex", alignItems: "center", gap: 6 }}><Avatar name={task.assignee} size={18} users={users} /><span style={{ fontSize: 12, color: t.text3 }}>{task.assignee}</span></div><span style={{ fontSize: 12, color: t.text4 }}>📅 {task.due}</span></div>
              {task.fileUrl ? <a href={task.fileUrl} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 10, fontSize: 12, color: "#818cf8", background: "#818cf818", border: "1px solid #818cf830", borderRadius: 8, padding: "5px 10px", textDecoration: "none" }}>📎 파일 열기 ↗</a> : null}
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", color: t.text5, cursor: "pointer", fontSize: 20, padding: 0, marginLeft: 12 }}>×</button>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
            {onMove && idx > 0 ? <button onClick={function () { onMove(task.id, -1); onClose(); }} style={{ flex: 1, background: t.surface2, border: "1px solid " + t.border2, borderRadius: 8, padding: "6px 0", fontSize: 11, cursor: "pointer", color: t.text4 }}>← {stageList[idx - 1]}</button> : null}
            {onMove && idx < stageList.length - 1 ? <button onClick={function () { onMove(task.id, 1); onClose(); }} style={{ flex: 1, background: "#6366f120", border: "1px solid #6366f140", borderRadius: 8, padding: "6px 0", fontSize: 11, cursor: "pointer", color: "#818cf8", fontWeight: 700 }}>{stageList[idx + 1]} →</button> : null}
            {onMove && task.status !== stageList[stageList.length - 1] ? <button onClick={function () { onUpdate(Object.assign({}, task, { status: stageList[stageList.length - 1] })); onClose(); }} style={{ background: "#34d39920", border: "1px solid #34d39940", borderRadius: 8, padding: "6px 12px", fontSize: 11, cursor: "pointer", color: "#34d399", fontWeight: 700, flexShrink: 0 }}>✅ 업무 완료</button> : null}
            {onMove ? <button onClick={function () { setEditForm({ title: task.title, desc: task.desc, due: task.due, assignee: task.assignee, priority: task.priority, tag: task.tag, fileUrl: task.fileUrl || "" }); setEditMode(true); }} style={{ background: t.surface2, border: "1px solid " + t.border2, borderRadius: 8, padding: "6px 12px", fontSize: 11, cursor: "pointer", color: t.text4, flexShrink: 0 }}>✏️ 정보 수정</button> : null}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 22px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: t.text4, marginBottom: 12, textTransform: "uppercase", letterSpacing: ".5px" }}>코멘트 {(task.comments || []).length > 0 ? "· " + (task.comments || []).length : ""}</div>
          {(task.comments || []).length === 0 ? <div style={{ textAlign: "center", padding: "20px 0", color: t.text5, fontSize: 13 }}>아직 코멘트가 없습니다</div> : null}
          {(task.comments || []).map(function (c) {
            return (
              <div key={c.id} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <Avatar name={c.author} size={26} users={users} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: t.text2 }}>{c.author}</span>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}><span style={{ fontSize: 10, color: t.text5 }}>{c.time}</span>{(c.author === currentUser.name || currentUser.role === "admin" || currentUser.role === "manager") ? <button onClick={function () { onUpdate(Object.assign({}, task, { comments: (task.comments || []).filter(function (x) { return x.id !== c.id; }) })); }} style={{ background: "none", border: "none", color: t.text5, cursor: "pointer", fontSize: 13, padding: 0 }}>×</button> : null}</div>
                  </div>
                  <div style={{ background: t.surface2, borderRadius: 9, padding: "9px 12px", fontSize: 13, color: t.text2, lineHeight: 1.6 }}>{c.text}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ padding: "12px 22px 18px", borderTop: "1px solid " + t.border }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}><Avatar name={currentUser.name} size={18} users={users} /><span style={{ fontSize: 12, color: t.text3, fontWeight: 600 }}>{currentUser.name} 으로 작성 중</span></div>
          <div style={{ display: "flex", gap: 7 }}>
            <input value={comment} onChange={function (e) { setComment(e.target.value); }} onKeyDown={function (e) { if (e.key === "Enter") addComment(); }} placeholder="코멘트 입력..." style={{ flex: 1, background: t.inputBg, border: "1px solid " + t.inputBorder, borderRadius: 9, padding: "9px 13px", fontSize: 13, color: t.text, outline: "none" }} />
            <button onClick={addComment} style={{ background: "#6366f1", border: "none", borderRadius: 9, padding: "0 15px", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>전송</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddTaskModal(props) {
  const { t } = useTheme();
  const { onAdd, onClose, defaultDate, users } = props;
  const tagList = props.tags || TAGS;
  const stageList = props.stages || STAGES;
  const modalTitle = props.title || "새 영상 추가";
  const categoryLabel = props.categoryLabel || "플랫폼";
  const memberNames = users.filter(function (u) { return u.approved && u.role !== "admin"; }).map(function (u) { return u.name; });
  const [form, setForm] = useState({ title: "", desc: "", assignee: memberNames[0] || "", priority: "중간", tag: tagList[0], due: defaultDate || "", status: stageList[0], fileUrl: "" });
  const set = function (k, v) { setForm(function (f) { return Object.assign({}, f, { [k]: v }); }); };
  const inp = { width: "100%", background: t.inputBg, border: "1px solid " + t.inputBorder, borderRadius: 9, padding: "9px 12px", fontSize: 13, color: t.text, boxSizing: "border-box", outline: "none" };
  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000099", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
      <div style={{ background: t.surface, borderRadius: 18, padding: "22px 26px", width: 370, border: "1px solid " + t.border, boxShadow: "0 24px 64px #000c" }}>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 18, color: t.text }}>{modalTitle}</div>
        {[["제목", "title", "text"], ["설명", "desc", "text"], ["마감일", "due", "date"]].map(function (item) { return <div key={item[1]} style={{ marginBottom: 11 }}><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>{item[0]}</div><input type={item[2]} value={form[item[1]]} onChange={function (e) { set(item[1], e.target.value); }} style={inp} /></div>; })}
        {[["담당자", "assignee", memberNames.length ? memberNames : ["미배정"]], ["우선순위", "priority", PRIORITIES], [categoryLabel, "tag", tagList], ["단계", "status", stageList]].map(function (item) { return <div key={item[1]} style={{ marginBottom: 11 }}><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>{item[0]}</div><select value={form[item[1]]} onChange={function (e) { set(item[1], e.target.value); }} style={Object.assign({}, inp, { cursor: "pointer" })}>{item[2].map(function (o) { return <option key={o}>{o}</option>; })}</select></div>; })}
        <div style={{ marginBottom: 11 }}><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>📎 파일 링크 (웹 드라이브 등)</div><input value={form.fileUrl} onChange={function (e) { set("fileUrl", e.target.value); }} placeholder="https://..." style={inp} /></div>
        <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
          <button onClick={onClose} style={{ flex: 1, background: t.surface2, border: "1px solid " + t.border2, borderRadius: 9, padding: "10px 0", cursor: "pointer", color: t.text3, fontWeight: 600 }}>취소</button>
          <button onClick={function () { if (form.title) { onAdd(Object.assign({}, form, { id: "task_" + Date.now(), comments: [] })); onClose(); } }} style={{ flex: 1, background: "#6366f1", border: "none", borderRadius: 9, padding: "10px 0", cursor: "pointer", color: "#fff", fontWeight: 700 }}>추가</button>
        </div>
      </div>
    </div>
  );
}

function CalendarView(props) {
  const { t } = useTheme();
  const { tasks, onSelectTask, onAddTask, ads, onMove, onDelete, onSelectAd } = props;
  const videoMode = props.videoMode !== false;
  const stageList = props.stages || STAGES;
  const stageColorMap = props.stageColor || STAGE_COLOR;
  const stageIconMap = props.stageIcon || STAGE_ICON;
  const taskLabel = props.taskLabel || "제작 영상";
  const taskUnitLabel = props.taskUnitLabel || "영상";
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();
  const cells = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: prevDays - i, cur: false });
  for (let i = 1; i <= daysInMonth; i++) cells.push({ day: i, cur: true });
  while (cells.length % 7 !== 0) cells.push({ day: cells.length - firstDay - daysInMonth + 1, cur: false });
  const pad = function (n) { return String(n).padStart(2, "0"); };
  const dateStr = function (d) { return year + "-" + pad(month + 1) + "-" + pad(d); };
  const adItems = [];
  if (ads) {
    for (let j = 0; j < ads.length; j++) {
      const ad = ads[j], label = ad.content || "광고";
      if (ad.workDate) adItems.push({ id: "ad_work_" + ad.id, due: ad.workDate, title: label, kind: "adWork", status: ad.workStatus || "기획중" });
      if (ad.expectedDate) adItems.push({ id: "ad_exp_" + ad.id, due: ad.expectedDate, title: label, kind: "adExpected", status: ad.workStatus || "기획중" });
    }
  }
  const getDayItems = function (d) {
    const ds = dateStr(d), taskItems = [];
    for (let k = 0; k < tasks.length; k++) if (tasks[k].due === ds) { const copy = Object.assign({}, tasks[k]); copy.kind = "task"; taskItems.push(copy); }
    const adsForDay = [];
    for (let k = 0; k < adItems.length; k++) if (adItems[k].due === ds) adsForDay.push(adItems[k]);
    return taskItems.concat(adsForDay);
  };
  const isToday = function (d) { return d === today.getDate() && month === today.getMonth() && year === today.getFullYear(); };
  const goPrevMonth = function () { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); };
  const goNextMonth = function () { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); };
  const monthPrefix = year + "-" + pad(month + 1);
  const monthTasksUnsorted = tasks.filter(function (tk) { return tk.due && tk.due.indexOf(monthPrefix) === 0; });
  const monthTasks = monthTasksUnsorted.slice().sort(function (a, b) { return a.due < b.due ? -1 : a.due > b.due ? 1 : 0; });
  const monthAdsUnsorted = adItems.filter(function (a) { return a.due && a.due.indexOf(monthPrefix) === 0; });
  const monthAds = monthAdsUnsorted.slice().sort(function (a, b) { return a.due < b.due ? -1 : a.due > b.due ? 1 : 0; });
  const getItemColor = function (item) { if (item.kind === "task") return stageColorMap[item.status] || "#818cf8"; if (item.kind === "adWork") return "#fbbf24"; if (item.kind === "adExpected") return "#38bdf8"; return "#818cf8"; };
  const getItemIcon = function (item) { if (item.kind === "task") return stageIconMap[item.status] || "🎬"; if (item.kind === "adWork") return "📢"; if (item.kind === "adExpected") return "🏁"; return "•"; };
  const getItemSuffix = function (item) { if (item.kind === "adWork") return " (제작일)"; if (item.kind === "adExpected") return " (예상완료)"; return ""; };
  const handleEditClick = function (e, taskObj) { e.stopPropagation(); onSelectTask(taskObj); };
  const handleMoveClick = function (e, taskId, direction) { e.stopPropagation(); onMove(taskId, direction); };
  const handleDeleteClick = function (e, taskObj) { e.stopPropagation(); if (window.confirm('"' + taskObj.title + '" 영상을 삭제하시겠습니까?')) onDelete(taskObj.id); };
  const weekdayColor = function (idx) { if (idx === 0) return "#f87171"; if (idx === 6) return "#818cf8"; return t.text4; };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <button onClick={goPrevMonth} style={{ background: t.surface2, border: "1px solid " + t.border, borderRadius: 8, padding: "7px 14px", color: t.text3, cursor: "pointer", fontSize: 14 }}>‹</button>
        <div style={{ textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 800, color: t.text }}>{year}년 {month + 1}월</div><div style={{ fontSize: 12, color: t.text4, marginTop: 2 }}>{videoMode ? monthTasks.length + "개 " + taskUnitLabel + " · " + monthAds.length + "개 광고 일정" : monthAds.length + "개 광고 일정"}</div></div>
        <button onClick={goNextMonth} style={{ background: t.surface2, border: "1px solid " + t.border, borderRadius: 8, padding: "7px 14px", color: t.text3, cursor: "pointer", fontSize: 14 }}>›</button>
      </div>
      <div style={{ display: "flex", gap: 14, marginBottom: 14, flexWrap: "wrap" }}>
        {videoMode ? <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 9, height: 9, borderRadius: 3, background: "#818cf8" }} /><span style={{ fontSize: 11, color: t.text4 }}>{taskLabel}</span></div> : null}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 9, height: 9, borderRadius: 3, background: "#fbbf24" }} /><span style={{ fontSize: 11, color: t.text4 }}>광고 제작일</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 9, height: 9, borderRadius: 3, background: "#38bdf8" }} /><span style={{ fontSize: 11, color: t.text4 }}>광고 예상완료일</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ fontSize: 11 }}>🎌</span><span style={{ fontSize: 11, color: t.text4 }}>공휴일</span></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", marginBottom: 4 }}>
        {WEEKDAYS.map(function (w, i) { return <div key={w} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, padding: "6px 0", color: weekdayColor(i) }}>{w}</div>; })}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", gap: 3 }}>
        {cells.map(function (cell, i) {
          const dayItems = cell.cur ? getDayItems(cell.day) : [];
          const colIdx = i % 7;
          const cellDateStr = cell.cur ? dateStr(cell.day) : null;
          const holidayName = cellDateStr ? KOREAN_HOLIDAYS[cellDateStr] : null;
          const isHoliday = !!holidayName;
          return (
            <div key={i} onClick={function () { if (cell.cur && onAddTask) onAddTask(dateStr(cell.day)); }} style={{ minHeight: 88, minWidth: 0, overflow: "hidden", background: cell.cur ? (isToday(cell.day) ? "#1e1b4b" : t.surface) : t.bg, borderRadius: 10, padding: "7px 7px 5px", border: "1px solid " + (isToday(cell.day) ? "#6366f1" : isHoliday ? "#f8717150" : t.border), cursor: cell.cur && onAddTask ? "pointer" : "default", boxSizing: "border-box" }}>
              <div style={{ fontSize: 12, fontWeight: isToday(cell.day) || isHoliday ? 800 : 500, color: !cell.cur ? t.border2 : isToday(cell.day) ? "#818cf8" : isHoliday ? "#f87171" : weekdayColor(colIdx), marginBottom: isHoliday ? 1 : 4, display: "flex", justifyContent: "space-between" }}>
                <span>{cell.day}</span>
                {isToday(cell.day) ? <span style={{ fontSize: 9, background: "#6366f1", color: "#fff", borderRadius: 99, padding: "1px 5px", fontWeight: 700, flexShrink: 0 }}>오늘</span> : null}
              </div>
              {holidayName ? <div style={{ fontSize: 9, color: "#f87171", fontWeight: 600, marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>🎌 {holidayName}</div> : null}
              {dayItems.slice(0, 3).map(function (item) {
                return <div key={item.id} onClick={function (e) { e.stopPropagation(); if (item.kind === "task") onSelectTask(item); else if (onSelectAd) onSelectAd(item); }} style={{ background: getItemColor(item) + "25", border: "1px solid " + (getItemColor(item) + "40"), borderRadius: 5, padding: "2px 5px", fontSize: 10, color: getItemColor(item), fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 2, cursor: "pointer", maxWidth: "100%", boxSizing: "border-box" }}>{getItemIcon(item)} {item.title}{getItemSuffix(item)}</div>;
              })}
              {dayItems.length > 3 ? <div style={{ fontSize: 10, color: t.text4 }}>+{dayItems.length - 3}</div> : null}
            </div>
          );
        })}
      </div>
      {(function () {
        const monthHolidays = [];
        for (const dk in KOREAN_HOLIDAYS) if (dk.indexOf(monthPrefix) === 0) monthHolidays.push({ date: dk, name: KOREAN_HOLIDAYS[dk] });
        monthHolidays.sort(function (a, b) { return a.date < b.date ? -1 : 1; });
        if (monthHolidays.length === 0) return null;
        return (
          <div style={{ marginTop: 18, background: t.surface, borderRadius: 14, border: "1px solid #f8717130", overflow: "hidden" }}>
            <div style={{ padding: "11px 18px", borderBottom: "1px solid " + t.border, fontSize: 12, fontWeight: 700, color: "#f87171", textTransform: "uppercase", letterSpacing: ".5px" }}>🎌 {month + 1}월 공휴일</div>
            {monthHolidays.map(function (h, i) {
              const isLast = i === monthHolidays.length - 1;
              const d = new Date(h.date), wd = WEEKDAYS[d.getDay()];
              return <div key={h.date} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 18px", borderBottom: isLast ? "none" : "1px solid " + t.border }}><span style={{ fontSize: 13, fontWeight: 600, color: t.text, flex: 1 }}>{h.name}</span><span style={{ fontSize: 11, color: t.text4 }}>{h.date.slice(5)} ({wd})</span></div>;
            })}
          </div>
        );
      })()}
      {videoMode && monthTasks.length > 0 ? (
        <div style={{ marginTop: 18, background: t.surface, borderRadius: 14, border: "1px solid " + t.border, overflow: "hidden" }}>
          <div style={{ padding: "11px 18px", borderBottom: "1px solid " + t.border, fontSize: 12, fontWeight: 700, color: t.text4, textTransform: "uppercase", letterSpacing: ".5px" }}>{month + 1}월 스케줄 목록</div>
          {monthTasks.map(function (tk, i) {
            const idx = stageList.indexOf(tk.status), isLast = i === monthTasks.length - 1, hasPrev = idx > 0, hasNext = idx < stageList.length - 1;
            return (
              <div key={tk.id} style={{ padding: "13px 18px", borderBottom: isLast ? "none" : "1px solid " + t.border }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
                  <div onClick={function (e) { handleEditClick(e, tk); }} style={{ width: 3, height: 30, borderRadius: 99, background: stageColorMap[tk.status], flexShrink: 0, cursor: "pointer" }} />
                  <div onClick={function (e) { handleEditClick(e, tk); }} style={{ flex: 1, minWidth: 100, cursor: "pointer" }}><div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{tk.title}</div><div style={{ fontSize: 11, color: t.text4, marginTop: 1 }}>{stageIconMap[tk.status]} {tk.status} · {tk.tag}</div></div>
                  <span style={{ fontSize: 11, color: t.text4, flexShrink: 0 }}>{tk.due.slice(5)}</span>
                  <span style={{ fontSize: 10, color: PRIORITY_COLOR[tk.priority], background: PRIORITY_COLOR[tk.priority] + "18", padding: "2px 7px", borderRadius: 20, fontWeight: 700, flexShrink: 0 }}>{tk.priority}</span>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {hasPrev && onMove ? <button onClick={function (e) { handleMoveClick(e, tk.id, -1); }} style={{ background: t.bg, border: "1px solid " + t.border, borderRadius: 6, padding: "6px 11px", fontSize: 11, cursor: "pointer", color: t.text4, fontWeight: 600 }}>← 이전 단계</button> : null}
                  {hasNext && onMove ? <button onClick={function (e) { handleMoveClick(e, tk.id, 1); }} style={{ background: "#6366f118", border: "1px solid #6366f130", borderRadius: 6, padding: "6px 11px", fontSize: 11, cursor: "pointer", color: "#818cf8", fontWeight: 700 }}>다음 단계 →</button> : null}
                  <button onClick={function (e) { handleEditClick(e, tk); }} style={{ background: t.bg, border: "1px solid " + t.border, borderRadius: 6, padding: "6px 11px", fontSize: 11, cursor: "pointer", color: t.text4, fontWeight: 600 }}>{onMove ? "✏️ 수정" : "🔍 자세히"}</button>
                  {onDelete ? <button onClick={function (e) { handleDeleteClick(e, tk); }} style={{ background: "#f8717118", border: "1px solid #f8717130", borderRadius: 6, padding: "6px 11px", fontSize: 11, cursor: "pointer", color: "#f87171", fontWeight: 600 }}>🗑️ 삭제</button> : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
      {monthAds.length > 0 ? (
        <div style={{ marginTop: 14, background: t.surface, borderRadius: 14, border: "1px solid " + t.border, overflow: "hidden" }}>
          <div style={{ padding: "11px 18px", borderBottom: "1px solid " + t.border, fontSize: 12, fontWeight: 700, color: t.text4, textTransform: "uppercase", letterSpacing: ".5px" }}>{month + 1}월 광고 일정</div>
          {monthAds.map(function (item, i) {
            const isLast = i === monthAds.length - 1;
            return <div key={item.id} onClick={function () { if (onSelectAd) onSelectAd(item); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 18px", borderBottom: isLast ? "none" : "1px solid " + t.border, cursor: onSelectAd ? "pointer" : "default" }}><div style={{ width: 3, height: 30, borderRadius: 99, background: getItemColor(item), flexShrink: 0 }} /><div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{getItemIcon(item)} {item.title}</div><div style={{ fontSize: 11, color: t.text4, marginTop: 1 }}>{item.kind === "adWork" ? "제작일" : "예상완료일"} · {item.status}</div></div><span style={{ fontSize: 11, color: t.text4 }}>{item.due.slice(5)}</span></div>;
          })}
        </div>
      ) : null}
    </div>
  );
}

function getAdBoardStatus(ad) {
  if (ad.insta === "완료" || ad.youtube === "완료") return "업로드 완료";
  if (ad.finalConfirm === "컨펌완료" || ad.workStatus === "작업완료") return "검토";
  if (ad.workStatus === "작업중" || ad.workStatus === "수정중") return "편집";
  if (ad.workStatus === "기획중") return "기획";
  return "기획";
}

function getDesignBoardStatus(dt) {
  if (dt.status === "완료") return "업로드 완료";
  if (dt.status === "피드백") return "검토";
  if (dt.status === "시안 작업") return "편집";
  return "기획";
}

function CombinedCalendarView(props) {
  const { t } = useTheme();
  const { videoTasks, marketingTasks, designTasks, ads, onSelectVideo, onSelectMarketing, onSelectDesign, onSelectAd } = props;
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();
  const cells = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: prevDays - i, cur: false });
  for (let i = 1; i <= daysInMonth; i++) cells.push({ day: i, cur: true });
  while (cells.length % 7 !== 0) cells.push({ day: cells.length - firstDay - daysInMonth + 1, cur: false });
  const pad = function (n) { return String(n).padStart(2, "0"); };
  const dateStr = function (d) { return year + "-" + pad(month + 1) + "-" + pad(d); };
  const adItems = [];
  for (let j = 0; j < (ads || []).length; j++) {
    const ad = ads[j], label = ad.content || "광고";
    if (ad.workDate) adItems.push({ id: "ad_work_" + ad.id, due: ad.workDate, title: label, kind: "adWork" });
    if (ad.expectedDate) adItems.push({ id: "ad_exp_" + ad.id, due: ad.expectedDate, title: label, kind: "adExpected" });
  }
  const withKind = function (list, kind) { return list.map(function (tk) { return Object.assign({}, tk, { kind: kind }); }); };
  const allItems = withKind(videoTasks, "video").concat(withKind(marketingTasks, "marketing")).concat(withKind(designTasks, "design")).concat(adItems);
  const getDayItems = function (d) { const ds = dateStr(d); return allItems.filter(function (item) { return item.due === ds; }); };
  const isToday = function (d) { return d === today.getDate() && month === today.getMonth() && year === today.getFullYear(); };
  const goPrevMonth = function () { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); };
  const goNextMonth = function () { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); };
  const monthPrefix = year + "-" + pad(month + 1);
  const monthItems = allItems.filter(function (item) { return item.due && item.due.indexOf(monthPrefix) === 0; }).slice().sort(function (a, b) { return a.due < b.due ? -1 : a.due > b.due ? 1 : 0; });
  const handleItemClick = function (item) {
    if (item.kind === "video") onSelectVideo(item);
    else if (item.kind === "marketing") onSelectMarketing(item);
    else if (item.kind === "design") onSelectDesign(item);
    else if (onSelectAd) onSelectAd(item);
  };
  const weekdayColor = function (idx) { if (idx === 0) return "#f87171"; if (idx === 6) return "#818cf8"; return t.text4; };
  const countByType = { video: 0, marketing: 0, design: 0, adWork: 0, adExpected: 0 };
  monthItems.forEach(function (item) { countByType[item.kind] = (countByType[item.kind] || 0) + 1; });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <button onClick={goPrevMonth} style={{ background: t.surface2, border: "1px solid " + t.border, borderRadius: 8, padding: "7px 14px", color: t.text3, cursor: "pointer", fontSize: 14 }}>‹</button>
        <div style={{ textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 800, color: t.text }}>{year}년 {month + 1}월</div><div style={{ fontSize: 12, color: t.text4, marginTop: 2 }}>영상 {countByType.video} · 마케팅 {countByType.marketing} · 디자인 {countByType.design} · 광고 {countByType.adWork + countByType.adExpected}</div></div>
        <button onClick={goNextMonth} style={{ background: t.surface2, border: "1px solid " + t.border, borderRadius: 8, padding: "7px 14px", color: t.text3, cursor: "pointer", fontSize: 14 }}>›</button>
      </div>
      <div style={{ display: "flex", gap: 14, marginBottom: 14, flexWrap: "wrap" }}>
        {["video", "marketing", "design", "adWork", "adExpected"].map(function (k) { return <div key={k} style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 9, height: 9, borderRadius: 3, background: COMBINED_TYPE_INFO[k].color }} /><span style={{ fontSize: 11, color: t.text4 }}>{COMBINED_TYPE_INFO[k].icon} {COMBINED_TYPE_INFO[k].label}</span></div>; })}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ fontSize: 11 }}>🎌</span><span style={{ fontSize: 11, color: t.text4 }}>공휴일</span></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", marginBottom: 4 }}>
        {WEEKDAYS.map(function (w, i) { return <div key={w} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, padding: "6px 0", color: weekdayColor(i) }}>{w}</div>; })}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", gap: 3 }}>
        {cells.map(function (cell, i) {
          const dayItems = cell.cur ? getDayItems(cell.day) : [];
          const colIdx = i % 7;
          const cellDateStr = cell.cur ? dateStr(cell.day) : null;
          const holidayName = cellDateStr ? KOREAN_HOLIDAYS[cellDateStr] : null;
          const isHoliday = !!holidayName;
          return (
            <div key={i} style={{ minHeight: 88, minWidth: 0, overflow: "hidden", background: cell.cur ? (isToday(cell.day) ? "#1e1b4b" : t.surface) : t.bg, borderRadius: 10, padding: "7px 7px 5px", border: "1px solid " + (isToday(cell.day) ? "#6366f1" : isHoliday ? "#f8717150" : t.border), boxSizing: "border-box" }}>
              <div style={{ fontSize: 12, fontWeight: isToday(cell.day) || isHoliday ? 800 : 500, color: !cell.cur ? t.border2 : isToday(cell.day) ? "#818cf8" : isHoliday ? "#f87171" : weekdayColor(colIdx), marginBottom: isHoliday ? 1 : 4, display: "flex", justifyContent: "space-between" }}>
                <span>{cell.day}</span>
                {isToday(cell.day) ? <span style={{ fontSize: 9, background: "#6366f1", color: "#fff", borderRadius: 99, padding: "1px 5px", fontWeight: 700, flexShrink: 0 }}>오늘</span> : null}
              </div>
              {holidayName ? <div style={{ fontSize: 9, color: "#f87171", fontWeight: 600, marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>🎌 {holidayName}</div> : null}
              {dayItems.slice(0, 3).map(function (item) {
                const info = COMBINED_TYPE_INFO[item.kind];
                return <div key={item.kind + "_" + item.id} onClick={function () { handleItemClick(item); }} style={{ background: info.color + "25", border: "1px solid " + (info.color + "40"), borderRadius: 5, padding: "2px 5px", fontSize: 10, color: info.color, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 2, cursor: "pointer", maxWidth: "100%", boxSizing: "border-box" }}>{info.icon} {item.title}</div>;
              })}
              {dayItems.length > 3 ? <div style={{ fontSize: 10, color: t.text4 }}>+{dayItems.length - 3}</div> : null}
            </div>
          );
        })}
      </div>
      {monthItems.length > 0 ? (
        <div style={{ marginTop: 18, background: t.surface, borderRadius: 14, border: "1px solid " + t.border, overflow: "hidden" }}>
          <div style={{ padding: "11px 18px", borderBottom: "1px solid " + t.border, fontSize: 12, fontWeight: 700, color: t.text4, textTransform: "uppercase", letterSpacing: ".5px" }}>{month + 1}월 전체 일정 ({monthItems.length})</div>
          {monthItems.map(function (item, i) {
            const isLast = i === monthItems.length - 1;
            const info = COMBINED_TYPE_INFO[item.kind];
            return (
              <div key={item.kind + "_" + item.id} onClick={function () { handleItemClick(item); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 18px", borderBottom: isLast ? "none" : "1px solid " + t.border, cursor: "pointer" }}>
                <div style={{ width: 3, height: 30, borderRadius: 99, background: info.color, flexShrink: 0 }} />
                <span style={{ fontSize: 10, background: info.color + "20", color: info.color, borderRadius: 20, padding: "2px 8px", fontWeight: 700, flexShrink: 0 }}>{info.icon} {info.label}</span>
                <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 600, color: t.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</div>{item.assignee ? <div style={{ fontSize: 11, color: t.text4, marginTop: 1 }}>{item.assignee} · {item.status}</div> : null}</div>
                <span style={{ fontSize: 11, color: t.text4, flexShrink: 0 }}>{item.due.slice(5)}</span>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function BoardView(props) {
  const { t } = useTheme();
  const { tasks, onSelectTask, onMove, onDelete, users, ads, onSelectAd, designTasks, onSelectDesign } = props;
  const memberNames = ["전체"].concat(users.filter(function (u) { return u.approved && u.role !== "admin"; }).map(function (u) { return u.name; }));
  const [filterMember, setFilterMember] = useState("전체");
  const today = new Date();
  const [monthFilter, setMonthFilter] = useState("all");
  const [selYear, setSelYear] = useState(today.getFullYear());
  const [selMonth, setSelMonth] = useState(today.getMonth() + 1);
  const pad = function (n) { return String(n).padStart(2, "0"); };
  const years = [...new Set(tasks.map(function (tk) { return tk.due && tk.due.slice(0, 4); }).filter(Boolean))].sort();
  if (years.indexOf(String(today.getFullYear())) === -1) years.push(String(today.getFullYear()));
  let filtered = filterMember === "전체" ? tasks : tasks.filter(function (tk) { return tk.assignee === filterMember; });
  if (monthFilter === "month") { const prefix = selYear + "-" + pad(selMonth); filtered = filtered.filter(function (tk) { return tk.due && tk.due.indexOf(prefix) === 0; }); }
  let filteredAds = ads || [];
  if (filterMember !== "전체") filteredAds = filteredAds.filter(function (ad) { return ad.requester === filterMember; });
  if (monthFilter === "month") { const prefix = selYear + "-" + pad(selMonth); filteredAds = filteredAds.filter(function (ad) { const d = ad.workDate || ad.expectedDate || ""; return d && d.indexOf(prefix) === 0; }); }
  let filteredDesign = designTasks || [];
  if (filterMember !== "전체") filteredDesign = filteredDesign.filter(function (dt) { return dt.assignee === filterMember; });
  if (monthFilter === "month") { const prefix = selYear + "-" + pad(selMonth); filteredDesign = filteredDesign.filter(function (dt) { return dt.due && dt.due.indexOf(prefix) === 0; }); }
  const filterBtnStyle = function (active) { return { padding: "5px 14px", borderRadius: 20, border: "1px solid " + (active ? "#6366f1" : t.border), background: active ? "#6366f120" : "transparent", cursor: "pointer", fontSize: 12, fontWeight: 600, color: active ? "#818cf8" : t.text4 }; };

  return (
    <div>
      <div style={{ fontSize: 11, color: t.text4, marginBottom: 10, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ display: "inline-flex", width: 9, height: 9, borderRadius: 3, border: "1px dashed #fbbf24" }} />📢 광고 관리 항목</span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ display: "inline-flex", width: 9, height: 9, borderRadius: 3, border: "1px dashed #f87171" }} />🎨 디자인 캘린더 항목</span>
      </div>
      <div style={{ background: t.surface, borderRadius: 12, border: "1px solid " + t.border, padding: "12px 14px", marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: t.text4, marginBottom: 9, textTransform: "uppercase", letterSpacing: ".5px" }}>기간 필터</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <button style={filterBtnStyle(monthFilter === "all")} onClick={function () { setMonthFilter("all"); }}>전체 기간</button>
          <button style={filterBtnStyle(monthFilter === "month")} onClick={function () { setMonthFilter("month"); }}>월별 보기</button>
          {monthFilter === "month" ? (
            <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <select value={selYear} onChange={function (e) { setSelYear(Number(e.target.value)); }} style={{ background: t.inputBg, border: "1px solid " + t.inputBorder, borderRadius: 8, padding: "5px 10px", fontSize: 12, color: t.text, outline: "none" }}>{years.map(function (y) { return <option key={y}>{y}</option>; })}</select>
              <select value={selMonth} onChange={function (e) { setSelMonth(Number(e.target.value)); }} style={{ background: t.inputBg, border: "1px solid " + t.inputBorder, borderRadius: 8, padding: "5px 10px", fontSize: 12, color: t.text, outline: "none" }}>{[1,2,3,4,5,6,7,8,9,10,11,12].map(function (mNum) { return <option key={mNum} value={mNum}>{mNum}월</option>; })}</select>
            </span>
          ) : null}
          <span style={{ fontSize: 12, color: t.text4, marginLeft: "auto" }}>{filtered.length}개 영상</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {memberNames.map(function (m) { return <button key={m} onClick={function () { setFilterMember(m); }} style={filterBtnStyle(filterMember === m)}>{m}</button>; })}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: 12 }}>
        {STAGES.map(function (col) {
          const colTasks = filtered.filter(function (tk) { return tk.status === col; });
          const colAds = filteredAds.filter(function (ad) { return getAdBoardStatus(ad) === col; });
          const colDesign = filteredDesign.filter(function (dt) { return getDesignBoardStatus(dt) === col; });
          return (
            <div key={col} style={{ background: t.surface, borderRadius: 14, padding: "12px 10px", border: "1px solid " + t.border }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid " + t.border }}>
                <span>{STAGE_ICON[col]}</span><span style={{ fontWeight: 700, fontSize: 12, color: t.text3 }}>{col}</span>
                <span style={{ marginLeft: "auto", background: STAGE_COLOR[col] + "20", color: STAGE_COLOR[col], borderRadius: 99, padding: "1px 8px", fontSize: 11, fontWeight: 700 }}>{colTasks.length + colAds.length + colDesign.length}</span>
              </div>
              {colTasks.map(function (tk) {
                return (
                  <div key={tk.id} onClick={function () { onSelectTask(tk); }} style={{ background: t.surface2, borderRadius: 11, padding: "11px 13px", marginBottom: 8, border: "1px solid " + t.border, cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: 13, color: t.text, flex: 1 }}>{tk.title}</span>
                      {onDelete ? <button onClick={function (e) { e.stopPropagation(); onDelete(tk.id); }} style={{ background: "none", border: "none", color: t.text5, cursor: "pointer", fontSize: 14, padding: 0 }}>×</button> : null}
                    </div>
                    <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
                      <span style={{ fontSize: 10, color: PRIORITY_COLOR[tk.priority], background: PRIORITY_COLOR[tk.priority] + "18", padding: "2px 7px", borderRadius: 20, fontWeight: 700 }}>{tk.priority}</span>
                      <span style={{ fontSize: 10, color: TAG_COLOR[tk.tag] || "#818cf8", background: (TAG_COLOR[tk.tag] || "#818cf8") + "18", padding: "2px 7px", borderRadius: 20, fontWeight: 700 }}>{tk.tag}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}><Avatar name={tk.assignee} size={18} users={users} /><span style={{ fontSize: 11, color: t.text3 }}>{tk.assignee}</span></div>
                      <div style={{ display: "flex", gap: 8 }}>{(tk.comments || []).length > 0 ? <span style={{ fontSize: 10, color: t.text4 }}>💬{tk.comments.length}</span> : null}{tk.fileUrl ? <span style={{ fontSize: 10, color: t.text4 }}>📎</span> : null}<span style={{ fontSize: 10, color: t.text4 }}>{tk.due && tk.due.slice(5)}</span></div>
                    </div>
                    {onMove ? (
                      <div style={{ display: "flex", gap: 5 }} onClick={function (e) { e.stopPropagation(); }}>
                        {STAGES.indexOf(tk.status) > 0 ? <button onClick={function () { onMove(tk.id, -1); }} style={{ flex: 1, background: t.bg, border: "1px solid " + t.border, borderRadius: 6, padding: "4px 0", fontSize: 10, cursor: "pointer", color: t.text4 }}>← 이전</button> : null}
                        {STAGES.indexOf(tk.status) < STAGES.length - 1 ? <button onClick={function () { onMove(tk.id, 1); }} style={{ flex: 1, background: "#6366f118", border: "1px solid #6366f130", borderRadius: 6, padding: "4px 0", fontSize: 10, cursor: "pointer", color: "#818cf8", fontWeight: 700 }}>다음 →</button> : null}
                      </div>
                    ) : null}
                  </div>
                );
              })}
              {colAds.map(function (ad) {
                return (
                  <div key={ad.id} onClick={function () { if (onSelectAd) onSelectAd(ad); }} style={{ background: t.surface2, borderRadius: 11, padding: "11px 13px", marginBottom: 8, border: "1px dashed #fbbf2470", cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: 13, color: t.text, flex: 1 }}>📢 {ad.content || "광고"}</span>
                    </div>
                    <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
                      <span style={{ fontSize: 10, color: "#fbbf24", background: "#fbbf2418", padding: "2px 7px", borderRadius: 20, fontWeight: 700 }}>광고</span>
                      <span style={{ fontSize: 10, color: WORK_COLOR[ad.workStatus] || t.text4, background: (WORK_COLOR[ad.workStatus] || t.text4) + "18", padding: "2px 7px", borderRadius: 20, fontWeight: 700 }}>{ad.workStatus || "대기"}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: t.text3 }}>{ad.requester || "미배정"}</span>
                      <span style={{ fontSize: 10, color: t.text4 }}>{(ad.workDate || ad.expectedDate || "").slice(5)}</span>
                    </div>
                  </div>
                );
              })}
              {colDesign.map(function (dt) {
                return (
                  <div key={dt.id} onClick={function () { if (onSelectDesign) onSelectDesign(dt); }} style={{ background: t.surface2, borderRadius: 11, padding: "11px 13px", marginBottom: 8, border: "1px dashed #f8717170", cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: 13, color: t.text, flex: 1 }}>🎨 {dt.title}</span>
                    </div>
                    <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
                      <span style={{ fontSize: 10, color: "#f87171", background: "#f8717118", padding: "2px 7px", borderRadius: 20, fontWeight: 700 }}>디자인</span>
                      <span style={{ fontSize: 10, color: DESIGN_STAGE_COLOR[dt.status] || t.text4, background: (DESIGN_STAGE_COLOR[dt.status] || t.text4) + "18", padding: "2px 7px", borderRadius: 20, fontWeight: 700 }}>{dt.status}</span>
                      <span style={{ fontSize: 10, color: DESIGN_TAG_COLOR[dt.tag] || "#818cf8", background: (DESIGN_TAG_COLOR[dt.tag] || "#818cf8") + "18", padding: "2px 7px", borderRadius: 20, fontWeight: 700 }}>{dt.tag}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}><Avatar name={dt.assignee} size={18} users={users} /><span style={{ fontSize: 11, color: t.text3 }}>{dt.assignee}</span></div>
                      <span style={{ fontSize: 10, color: t.text4 }}>{dt.due && dt.due.slice(5)}</span>
                    </div>
                  </div>
                );
              })}
              {colTasks.length === 0 && colAds.length === 0 && colDesign.length === 0 ? <div style={{ textAlign: "center", padding: "22px 0", color: t.text5, fontSize: 12 }}>비어있음</div> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VideoAnalysisPanel(props) {
  const { t } = useTheme();
  const tasks = props.tasks;
  const [mode, setMode] = useState("url");
  const [url, setUrl] = useState("");
  const [selTask, setSelTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeSection, setActiveSection] = useState("all");
  const [ytData, setYtData] = useState(null);
  const [ytError, setYtError] = useState("");
  const [form, setFormState] = useState({ title: "", platform: "유튜브", views: "", likes: "", comments: "", duration: "", uploadDate: "", desc: "" });
  const setF = function (k, v) { setFormState(function (f) { return Object.assign({}, f, { [k]: v }); }); };
  const PLATFORMS = ["유튜브", "인스타그램", "틱톡", "트위터/X", "페이스북", "기타"];
  const fetchYT = async function () { if (!url.trim()) return; setFetchLoading(true); setYtError(""); setYtData(null); try { const data = await fetchYoutubeData(url); setYtData(data); } catch (e) { setYtError(e.message || "영상 정보를 가져올 수 없어요."); } setFetchLoading(false); };
  const analyze = async function () {
    let info;
    if (mode === "url" && ytData) info = { title: ytData.title, platform: "유튜브", views: ytData.views, likes: ytData.likes, comments: ytData.comments, duration: ytData.duration, uploadDate: ytData.publishedAt, desc: ytData.description, channel: ytData.channelTitle, tags: ytData.tags ? ytData.tags.join(", ") : "", thumbnail: ytData.thumbnail };
    else if (mode === "list" && selTask) info = { title: selTask.title, platform: selTask.tag, views: "미입력", likes: "미입력", comments: "미입력", duration: "미입력", uploadDate: selTask.due, desc: selTask.desc };
    else if (mode === "manual") info = Object.assign({}, form);
    else return;
    setLoading(true); setResult(null);
    const prompt = "다음 SNS 영상 정보를 분석해주세요:\n\n제목: " + info.title + "\n플랫폼: " + info.platform + "\n채널: " + (info.channel || "미입력") + "\n조회수: " + (info.views || "미입력") + "\n좋아요: " + (info.likes || "미입력") + "\n댓글: " + (info.comments || "미입력") + "\n영상 길이: " + (info.duration || "미입력") + "\n업로드 날짜: " + (info.uploadDate || "미입력") + "\n태그: " + (info.tags || "미입력") + "\n설명: " + (info.desc || "미입력") + "\n\n아래 JSON 형식으로만 응답하세요:\n{\"score\":숫자,\"scoreComment\":\"한줄코멘트\",\"titleSuggestions\":[\"제목1\",\"제목2\",\"제목3\"],\"thumbnailSuggestions\":[\"제안1\",\"제안2\"],\"trendAnalysis\":\"트렌드분석\",\"nextVideoIdeas\":[\"아이디어1\",\"아이디어2\",\"아이디어3\"],\"performanceReport\":\"리포트\",\"improvements\":[\"개선점1\",\"개선점2\",\"개선점3\"]}";
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 2000, system: "당신은 SNS 영상 마케팅 전문가입니다. JSON 형식으로만 응답하세요.", messages: [{ role: "user", content: prompt }] }) });
      const data = await res.json();
      const text = data.content.map(function (c) { return c.text || ""; }).join("");
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setResult(Object.assign({}, parsed, { info: info, thumbnail: info.thumbnail || null }));
    } catch (e) { setResult({ error: "분석 중 오류가 발생했습니다." }); }
    setLoading(false);
  };
  const reset = function () { setResult(null); setYtData(null); setUrl(""); setSelTask(null); setFormState({ title: "", platform: "유튜브", views: "", likes: "", comments: "", duration: "", uploadDate: "", desc: "" }); setActiveSection("all"); };
  const s = { background: t.surface, borderRadius: 13, padding: "16px 18px", border: "1px solid " + t.border };
  const inp = { width: "100%", background: t.inputBg, border: "1px solid " + t.inputBorder, borderRadius: 9, padding: "8px 12px", fontSize: 13, color: t.text, boxSizing: "border-box", outline: "none" };
  const secBtn = function (v, l) { return <button key={v} onClick={function () { setActiveSection(v); }} style={{ padding: "5px 13px", borderRadius: 20, border: "1px solid " + (activeSection === v ? "#6366f1" : t.border), background: activeSection === v ? "#6366f120" : "transparent", cursor: "pointer", fontSize: 12, fontWeight: activeSection === v ? 700 : 500, color: activeSection === v ? "#818cf8" : t.text4 }}>{l}</button>; };
  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <div style={{ background: "linear-gradient(135deg,#6366f1,#ec4899)", borderRadius: 14, padding: "16px 22px", marginBottom: 18, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 26 }}>🔍</span>
        <div><div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>영상 분석</div><div style={{ fontSize: 12, color: "#ffffff88", marginTop: 2 }}>YouTube URL 자동 분석 · SNS 영상 AI 인사이트</div></div>
      </div>
      {!result ? (
        <div style={Object.assign({}, s, { marginBottom: 16 })}>
          <div style={{ display: "flex", gap: 4, background: t.bg, borderRadius: 9, padding: 3, marginBottom: 18, border: "1px solid " + t.border, width: "fit-content" }}>
            {[["url", "▶ 유튜브 URL"], ["manual", "✏️ 직접 입력"], ["list", "📋 제작 목록"]].map(function (item) { return <button key={item[0]} onClick={function () { setMode(item[0]); setYtData(null); setYtError(""); }} style={{ padding: "7px 15px", borderRadius: 7, border: "none", cursor: "pointer", fontWeight: mode === item[0] ? 700 : 500, fontSize: 12, background: mode === item[0] ? "#6366f1" : "transparent", color: mode === item[0] ? "#fff" : t.text4 }}>{item[1]}</button>; })}
          </div>
          {mode === "url" ? (
            <div>
              <div style={{ fontSize: 11, color: t.text4, marginBottom: 6, fontWeight: 600 }}>유튜브 URL 입력</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <input value={url} onChange={function (e) { setUrl(e.target.value); }} onKeyDown={function (e) { if (e.key === "Enter") fetchYT(); }} placeholder="https://www.youtube.com/watch?v=... 또는 https://youtu.be/..." style={Object.assign({}, inp, { flex: 1 })} />
                <button onClick={fetchYT} disabled={fetchLoading || !url.trim()} style={{ background: fetchLoading || !url.trim() ? t.surface2 : "#6366f1", border: "none", borderRadius: 9, padding: "0 18px", color: fetchLoading || !url.trim() ? t.text4 : "#fff", fontWeight: 700, fontSize: 13, cursor: fetchLoading || !url.trim() ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>{fetchLoading ? "불러오는 중..." : "📥 정보 불러오기"}</button>
              </div>
              {ytError ? <div style={{ fontSize: 12, color: "#f87171", marginBottom: 10 }}>⚠️ {ytError}</div> : null}
              {ytData ? (
                <div style={{ background: t.bg, borderRadius: 12, padding: 14, border: "1px solid " + t.border, marginBottom: 14 }}>
                  <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                    {ytData.thumbnail ? <img src={ytData.thumbnail} alt="썸네일" style={{ width: 120, height: 68, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} /> : null}
                    <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 4 }}>{ytData.title}</div><div style={{ fontSize: 11, color: t.text4 }}>{ytData.channelTitle} · {ytData.publishedAt} · {ytData.duration}</div></div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>{[["👁 조회수", ytData.views, "#818cf8"], ["❤️ 좋아요", ytData.likes, "#f87171"], ["💬 댓글", ytData.comments, "#fb923c"]].map(function (item) { return <div key={item[0]} style={{ background: t.surface, borderRadius: 8, padding: "10px 0", textAlign: "center", border: "1px solid " + t.border }}><div style={{ fontSize: 16, fontWeight: 800, color: item[2] }}>{item[1]}</div><div style={{ fontSize: 11, color: t.text4, marginTop: 2 }}>{item[0]}</div></div>; })}</div>
                </div>
              ) : null}
              {ytData ? <button onClick={analyze} disabled={loading} style={{ width: "100%", background: loading ? t.surface2 : "linear-gradient(135deg,#6366f1,#ec4899)", border: "none", borderRadius: 10, padding: "12px 0", color: loading ? t.text4 : "#fff", fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer" }}>{loading ? "⏳ AI 분석 중..." : "🔍 AI 분석 시작"}</button> : null}
            </div>
          ) : null}
          {mode === "manual" ? (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                <div style={{ gridColumn: "1/-1" }}><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>영상 제목 *</div><input value={form.title} onChange={function (e) { setF("title", e.target.value); }} placeholder="영상 제목 입력" style={inp} /></div>
                <div><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>플랫폼</div><select value={form.platform} onChange={function (e) { setF("platform", e.target.value); }} style={Object.assign({}, inp, { cursor: "pointer" })}>{PLATFORMS.map(function (p) { return <option key={p}>{p}</option>; })}</select></div>
                <div><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>업로드 날짜</div><input type="date" value={form.uploadDate} onChange={function (e) { setF("uploadDate", e.target.value); }} style={inp} /></div>
                {[["조회수", "views", "예: 12,500"], ["좋아요", "likes", "예: 430"], ["댓글 수", "comments", "예: 52"], ["영상 길이", "duration", "예: 8:32"]].map(function (item) { return <div key={item[1]}><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>{item[0]}</div><input value={form[item[1]]} onChange={function (e) { setF(item[1], e.target.value); }} placeholder={item[2]} style={inp} /></div>; })}
                <div style={{ gridColumn: "1/-1" }}><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>영상 설명 (선택)</div><textarea value={form.desc} onChange={function (e) { setF("desc", e.target.value); }} placeholder="영상 내용, 타겟, 기획 의도 등" style={Object.assign({}, inp, { minHeight: 68, resize: "vertical" })} /></div>
              </div>
              <button onClick={analyze} disabled={loading || !form.title.trim()} style={{ width: "100%", background: loading || !form.title.trim() ? t.surface2 : "linear-gradient(135deg,#6366f1,#ec4899)", border: "none", borderRadius: 10, padding: "12px 0", color: loading || !form.title.trim() ? t.text4 : "#fff", fontWeight: 700, fontSize: 14, cursor: loading || !form.title.trim() ? "not-allowed" : "pointer" }}>{loading ? "⏳ AI 분석 중..." : "🔍 AI 분석 시작"}</button>
            </div>
          ) : null}
          {mode === "list" ? (
            <div>
              <div style={{ fontSize: 12, color: t.text4, marginBottom: 10 }}>스케줄러에 등록된 영상을 선택해서 분석받으세요</div>
              {tasks.length === 0 ? <div style={{ textAlign: "center", padding: "24px", color: t.text5, fontSize: 13 }}>등록된 영상이 없습니다</div> : (
                <div style={{ display: "flex", flexDirection: "column", gap: 7, maxHeight: 260, overflowY: "auto", marginBottom: 14 }}>
                  {tasks.map(function (tk) { return <div key={tk.id} onClick={function () { setSelTask(tk); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 9, border: "1px solid " + (selTask && selTask.id === tk.id ? "#6366f1" : t.border), background: selTask && selTask.id === tk.id ? "#6366f115" : t.bg, cursor: "pointer" }}><span>{STAGE_ICON[tk.status]}</span><div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{tk.title}</div><div style={{ fontSize: 11, color: t.text4 }}>{tk.tag} · {tk.assignee} · {tk.status}</div></div><span style={{ fontSize: 10, color: TAG_COLOR[tk.tag] || "#818cf8", background: (TAG_COLOR[tk.tag] || "#818cf8") + "18", padding: "2px 8px", borderRadius: 20, fontWeight: 700 }}>{tk.tag}</span></div>; })}
                </div>
              )}
              {selTask ? <button onClick={analyze} disabled={loading} style={{ width: "100%", background: loading ? t.surface2 : "linear-gradient(135deg,#6366f1,#ec4899)", border: "none", borderRadius: 10, padding: "12px 0", color: loading ? t.text4 : "#fff", fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer" }}>{loading ? "⏳ AI 분석 중..." : "🔍 \"" + selTask.title + "\" 분석하기"}</button> : null}
            </div>
          ) : null}
        </div>
      ) : null}
      {loading ? (
        <div style={Object.assign({}, s, { textAlign: "center", padding: "48px 0" })}>
          <div style={{ fontSize: 36, marginBottom: 14 }}>🔍</div><div style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 6 }}>AI가 분석하고 있어요...</div><div style={{ fontSize: 12, color: t.text4 }}>제목 개선안, 트렌드, 아이디어를 생성 중입니다</div>
        </div>
      ) : null}
      {result && !result.error ? (
        <div>
          <div style={Object.assign({}, s, { marginBottom: 14 })}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {result.thumbnail ? <img src={result.thumbnail} alt="썸네일" style={{ width: 100, height: 56, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} /> : null}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: t.text }}>{result.info && result.info.title}</div>
                <div style={{ fontSize: 12, color: t.text4, marginTop: 3 }}>{result.info && result.info.platform} {result.info && result.info.channel ? "· " + result.info.channel : ""} · {result.scoreComment}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>{[["👁", result.info && result.info.views], ["❤️", result.info && result.info.likes], ["💬", result.info && result.info.comments], ["⏱", result.info && result.info.duration]].filter(function (item) { return item[1] && item[1] !== "미입력"; }).map(function (item) { return <span key={item[0]} style={{ fontSize: 12, color: t.text3, background: t.surface2, border: "1px solid " + t.border, borderRadius: 20, padding: "2px 10px" }}>{item[0]} {item[1]}</span>; })}</div>
              </div>
              <div style={{ textAlign: "center", background: "linear-gradient(135deg,#6366f1,#ec4899)", borderRadius: 12, padding: "10px 16px", flexShrink: 0 }}><div style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>{result.score}</div><div style={{ fontSize: 10, color: "#ffffffaa" }}>/ 100</div></div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>{[["all", "전체"], ["title", "✏️ 제목"], ["thumbnail", "🖼️ 썸네일"], ["trend", "📈 트렌드"], ["ideas", "💡 아이디어"], ["improve", "⚡ 개선점"], ["report", "📋 리포트"]].map(function (item) { return secBtn(item[0], item[1]); })}</div>
          {(activeSection === "all" || activeSection === "title") && result.titleSuggestions ? <div style={Object.assign({}, s, { marginBottom: 14 })}><div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 12 }}>✏️ 제목 개선 제안</div>{result.titleSuggestions.map(function (title, i) { return <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: t.bg, borderRadius: 9, marginBottom: 7, border: "1px solid " + t.border }}><span style={{ width: 22, height: 22, borderRadius: "50%", background: "#6366f1", color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span><span style={{ fontSize: 13, color: t.text }}>{title}</span></div>; })}</div> : null}
          {(activeSection === "all" || activeSection === "thumbnail") && result.thumbnailSuggestions ? <div style={Object.assign({}, s, { marginBottom: 14 })}><div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 12 }}>🖼️ 썸네일 개선 제안</div>{result.thumbnailSuggestions.map(function (tip, i) { return <div key={i} style={{ display: "flex", gap: 10, padding: "10px 14px", background: t.bg, borderRadius: 9, marginBottom: 7, border: "1px solid " + t.border }}><span style={{ flexShrink: 0 }}>🖼️</span><span style={{ fontSize: 13, color: t.text, lineHeight: 1.6 }}>{tip}</span></div>; })}</div> : null}
          {(activeSection === "all" || activeSection === "trend") && result.trendAnalysis ? <div style={Object.assign({}, s, { marginBottom: 14 })}><div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 10 }}>📈 트렌드 분석</div><div style={{ fontSize: 13, color: t.text2, lineHeight: 1.8, background: t.bg, borderRadius: 9, padding: "12px 14px", border: "1px solid " + t.border }}>{result.trendAnalysis}</div></div> : null}
          {(activeSection === "all" || activeSection === "ideas") && result.nextVideoIdeas ? <div style={Object.assign({}, s, { marginBottom: 14 })}><div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 12 }}>💡 다음 영상 아이디어</div>{result.nextVideoIdeas.map(function (idea, i) { return <div key={i} style={{ display: "flex", gap: 10, padding: "10px 14px", background: t.bg, borderRadius: 9, marginBottom: 7, border: "1px solid " + t.border }}><span style={{ flexShrink: 0 }}>💡</span><span style={{ fontSize: 13, color: t.text, lineHeight: 1.6 }}>{idea}</span></div>; })}</div> : null}
          {(activeSection === "all" || activeSection === "improve") && result.improvements ? <div style={Object.assign({}, s, { marginBottom: 14 })}><div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 12 }}>⚡ 개선점</div>{result.improvements.map(function (imp, i) { return <div key={i} style={{ display: "flex", gap: 10, padding: "10px 14px", background: t.bg, borderRadius: 9, marginBottom: 7, border: "1px solid #fbbf2440" }}><span style={{ flexShrink: 0 }}>⚡</span><span style={{ fontSize: 13, color: t.text, lineHeight: 1.6 }}>{imp}</span></div>; })}</div> : null}
          {(activeSection === "all" || activeSection === "report") && result.performanceReport ? <div style={Object.assign({}, s, { marginBottom: 14 })}><div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 10 }}>📋 종합 성과 리포트</div><div style={{ fontSize: 13, color: t.text2, lineHeight: 1.8, background: t.bg, borderRadius: 9, padding: "14px 16px", border: "1px solid " + t.border, whiteSpace: "pre-wrap" }}>{result.performanceReport}</div></div> : null}
          <button onClick={reset} style={{ width: "100%", background: t.surface2, border: "1px solid " + t.border, borderRadius: 10, padding: "11px 0", color: t.text3, fontWeight: 600, fontSize: 13, cursor: "pointer", marginBottom: 20 }}>🔄 새 영상 분석하기</button>
        </div>
      ) : null}
      {result && result.error ? <div style={Object.assign({}, s, { textAlign: "center", padding: "30px" })}><div style={{ fontSize: 24, marginBottom: 8 }}>⚠️</div><div style={{ fontSize: 13, color: "#f87171" }}>{result.error}</div><button onClick={reset} style={{ marginTop: 12, background: "#f8717120", border: "1px solid #f8717140", borderRadius: 9, padding: "8px 20px", color: "#f87171", cursor: "pointer", fontSize: 12 }}>다시 시도</button></div> : null}
    </div>
  );
}

function AIPanel(props) {
  const { t } = useTheme();
  const { tasks, users } = props;
  const [mainTab, setMainTab] = useState("ai");
  const [report, setReport] = useState(""), [insight, setInsight] = useState("");
  const [lR, setLR] = useState(false), [lI, setLI] = useState(false);
  const [messages, setMessages] = useState([{ role: "assistant", content: "안녕하세요! TIMBEL 영상 제작 스케줄러 AI 어시스턴트입니다. 무엇이든 물어보세요 😊" }]);
  const [input, setInput] = useState(""), [chatLoading, setChatLoading] = useState(false);
  const summary = tasks.map(function (tk) { return "[" + tk.status + "] " + tk.title + " (담당: " + tk.assignee + ", 플랫폼: " + tk.tag + ", 우선순위: " + tk.priority + ", 마감: " + tk.due + ")"; }).join("\n");
  const callAI = async function (prompt, set, setL) {
    setL(true); set("");
    try { const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, system: "당신은 영상 크리에이터 팀의 전문 매니저입니다. 한국어로 명확하게 답변하세요.", messages: [{ role: "user", content: prompt }] }) }); const data = await res.json(); set(data.content.map(function (c) { return c.text || ""; }).join("\n")); } catch (e) { set("오류가 발생했습니다."); }
    setL(false);
  };
  const sendChat = async function () {
    if (!input.trim() || chatLoading) return;
    const userMsg = input.trim(); setInput("");
    const newMessages = messages.concat([{ role: "user", content: userMsg }]);
    setMessages(newMessages); setChatLoading(true);
    try { const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, system: "당신은 TIMBEL 영상 제작 팀의 AI 어시스턴트입니다. 스케줄 데이터 참고해서 한국어로 친절하게 답변하세요.\n\n현재 스케줄:\n" + summary, messages: newMessages.map(function (m) { return { role: m.role, content: m.content }; }) }) }); const data = await res.json(); setMessages(function (prev) { return prev.concat([{ role: "assistant", content: data.content.map(function (c) { return c.text || ""; }).join("\n") }]); }); } catch (e) { setMessages(function (prev) { return prev.concat([{ role: "assistant", content: "오류가 발생했습니다." }]); }); }
    setChatLoading(false);
  };
  const suggestions = ["현재 마감 임박한 영상 알려줘", "편집 단계 영상 몇 개야?", "이번 달 업로드 완료 영상은?", "제작 효율 개선 방법 알려줘"];
  const s = { background: t.surface, borderRadius: 13, padding: "17px 19px", border: "1px solid " + t.border, marginBottom: 12 };
  const btn = function (l, bg) { return { width: "100%", padding: "10px 0", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: l ? "not-allowed" : "pointer", background: l ? t.surface2 : bg, color: l ? t.text4 : "#fff", marginTop: 12 }; };
  const firstUser = users.filter(function (u) { return u.role !== "admin"; })[0];
  const mainTabBtn = function (v, l) { return <button key={v} onClick={function () { setMainTab(v); }} style={{ padding: "8px 18px", background: "none", border: "none", borderBottom: mainTab === v ? "2px solid #6366f1" : "2px solid transparent", cursor: "pointer", fontWeight: mainTab === v ? 700 : 500, fontSize: 13, color: mainTab === v ? "#818cf8" : t.text4, marginBottom: -1 }}>{l}</button>; };
  return (
    <div>
      <div style={{ display: "flex", gap: 2, marginBottom: 18, borderBottom: "1px solid " + t.border }}>{mainTabBtn("ai", "🤖 AI 분석")}{mainTabBtn("video", "🔍 영상 분석")}</div>
      {mainTab === "ai" ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }}>
          <div>
            <div style={s}><div style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 3 }}>📄 제작 현황 요약</div><div style={{ fontSize: 12, color: t.text4 }}>현재 영상 제작 현황을 AI가 요약합니다</div><button disabled={lR} style={btn(lR, "#6366f1")} onClick={function () { callAI("다음 영상 제작 현황을 요약 리포트로 작성해주세요.\n\n" + summary, setReport, setLR); }}>{lR ? "생성 중..." : "리포트 생성"}</button>{report ? <div style={{ marginTop: 12, background: t.bg, borderRadius: 9, padding: "12px 14px", fontSize: 12, color: t.text2, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{report}</div> : null}</div>
            <div style={s}><div style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 3 }}>💡 생산성 인사이트</div><div style={{ fontSize: 12, color: t.text4 }}>병목 지점과 개선 방향을 분석합니다</div><button disabled={lI} style={btn(lI, "#ec4899")} onClick={function () { callAI("다음 영상 제작 데이터를 분석해서 인사이트와 개선 제안 3가지 제공해주세요.\n\n" + summary, setInsight, setLI); }}>{lI ? "분석 중..." : "인사이트 분석"}</button>{insight ? <div style={{ marginTop: 12, background: t.bg, borderRadius: 9, padding: "12px 14px", fontSize: 12, color: t.text2, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{insight}</div> : null}</div>
          </div>
          <div style={{ background: t.surface, borderRadius: 13, border: "1px solid " + t.border, display: "flex", flexDirection: "column", height: 600 }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid " + t.border, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤖</div>
              <div><div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>AI 어시스턴트</div><div style={{ fontSize: 11, color: "#34d399", display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399" }} /> 온라인</div></div>
              <button onClick={function () { setMessages([{ role: "assistant", content: "안녕하세요! TIMBEL 영상 제작 스케줄러 AI 어시스턴트입니다. 무엇이든 물어보세요 😊" }]); }} style={{ marginLeft: "auto", background: t.surface2, border: "1px solid " + t.border, borderRadius: 7, padding: "4px 10px", fontSize: 11, color: t.text4, cursor: "pointer" }}>초기화</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 8px", display: "flex", flexDirection: "column", gap: 10 }}>
              {messages.map(function (m, i) { return <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", gap: 8, alignItems: "flex-end" }}>{m.role === "assistant" ? <div style={{ width: 26, height: 26, borderRadius: 8, background: "linear-gradient(135deg,#6366f1,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>🤖</div> : null}<div style={{ maxWidth: "78%", padding: "10px 13px", borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: m.role === "user" ? "#6366f1" : t.surface2, color: m.role === "user" ? "#fff" : t.text, fontSize: 13, lineHeight: 1.65, whiteSpace: "pre-wrap", border: m.role === "user" ? "none" : "1px solid " + t.border }}>{m.content}</div>{m.role === "user" ? <Avatar name={firstUser ? firstUser.name : "나"} size={26} users={users} /> : null}</div>; })}
              {chatLoading ? <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}><div style={{ width: 26, height: 26, borderRadius: 8, background: "linear-gradient(135deg,#6366f1,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>🤖</div><div style={{ padding: "10px 14px", borderRadius: "14px 14px 14px 4px", background: t.surface2, border: "1px solid " + t.border, display: "flex", gap: 4, alignItems: "center" }}>{[0, 1, 2].map(function (i) { return <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: t.text5 }} />; })}</div></div> : null}
              <div ref={function (el) { if (el) el.scrollIntoView({ behavior: "smooth" }); }} />
            </div>
            {messages.length <= 1 ? <div style={{ padding: "0 12px 8px", display: "flex", flexWrap: "wrap", gap: 5 }}>{suggestions.map(function (sg) { return <button key={sg} onClick={function () { setInput(sg); }} style={{ background: t.bg, border: "1px solid " + t.border, borderRadius: 20, padding: "4px 10px", fontSize: 11, color: t.text4, cursor: "pointer" }}>{sg}</button>; })}</div> : null}
            <div style={{ padding: "10px 12px 12px", borderTop: "1px solid " + t.border }}>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={input} onChange={function (e) { setInput(e.target.value); }} onKeyDown={function (e) { if (e.key === "Enter" && !e.shiftKey) sendChat(); }} placeholder="메시지를 입력하세요..." style={{ flex: 1, background: t.inputBg, border: "1px solid " + t.inputBorder, borderRadius: 10, padding: "9px 13px", fontSize: 13, color: t.text, outline: "none" }} />
                <button onClick={sendChat} disabled={chatLoading || !input.trim()} style={{ background: input.trim() && !chatLoading ? "#6366f1" : t.surface2, border: "none", borderRadius: 10, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: input.trim() && !chatLoading ? "pointer" : "not-allowed", fontSize: 16 }}>➤</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {mainTab === "video" ? <VideoAnalysisPanel tasks={tasks} /> : null}
    </div>
  );
}

function AdDetailModal(props) {
  const { t } = useTheme();
  const { ad, type, onClose, onUpdate } = props;
  const [form, setForm] = useState(Object.assign({}, ad));
  const set = function (k, v) { setForm(function (f) { return Object.assign({}, f, { [k]: v }); }); };
  const inp = { width: "100%", background: t.inputBg, border: "1px solid " + t.inputBorder, borderRadius: 8, padding: "7px 10px", fontSize: 12, color: t.text, boxSizing: "border-box", outline: "none" };
  const ta = Object.assign({}, inp, { minHeight: 56, resize: "vertical" });
  const lbl = function (tx) { return <div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>{tx}</div>; };
  const aiF = [["요청자", "requester"], ["요청 내용", "content"], ["요청일", "requestDate", "date"], ["기획안 URL (웹 드라이브 등)", "planUrl"], ["레퍼런스 URL", "refUrl"], ["리사이징", "resizing"], ["제작일", "workDate", "date"], ["예상 완료일", "expectedDate", "date"], ["실제 완료일", "completedDate", "date"], ["컨펌 요청일", "confirmRequestDate", "date"], ["영상 파일 URL (웹 드라이브 등)", "videoUrl"], ["수정 내용", "modifyContent", "textarea"], ["업로드일", "uploadDate", "date"], ["비고", "note"]];
  const intF = [["요청자", "requester"], ["요청 내용", "content"], ["촬영일", "shootDate", "date"], ["편집 시작", "editStart", "date"], ["가편집 전달", "roughCut", "date"], ["수정 내용", "modifyContent", "textarea"], ["요청사항", "request"], ["추가 사항", "extra"], ["마케팅 문구", "phrase"], ["제작일", "workDate", "date"], ["예상 완료일", "expectedDate", "date"], ["실제 완료일", "completedDate", "date"], ["컨펌 요청일", "confirmRequestDate", "date"], ["영상 파일 URL (웹 드라이브 등)", "videoUrl"], ["수정 내용2", "modifyContent2", "textarea"], ["업로드일", "uploadDate", "date"], ["비고", "note"]];
  const fields = type === "ai" ? aiF : intF;
  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000099", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
      <div style={{ background: t.surface, borderRadius: 18, width: 520, maxHeight: "88vh", display: "flex", flexDirection: "column", border: "1px solid " + t.border, boxShadow: "0 24px 64px #000c" }}>
        <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid " + t.border, display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ fontSize: 15, fontWeight: 800, color: t.text }}>{form.content || "광고 상세"}</div><button onClick={onClose} style={{ background: "none", border: "none", color: t.text5, cursor: "pointer", fontSize: 20 }}>×</button></div>
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 22px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div style={{ gridColumn: "1/-1", display: "flex", gap: 7, flexWrap: "wrap" }}>
            {type === "ai" ? (
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                <div><div style={{ fontSize: 10, color: t.text4, marginBottom: 3 }}>기획 컨펌</div><StatusBadge value={form.planConfirm} options={CONFIRM_STATUS} colorMap={CONFIRM_COLOR} onChange={function (v) { set("planConfirm", v); }} /></div>
                <div><div style={{ fontSize: 10, color: t.text4, marginBottom: 3 }}>제작 요청</div><StatusBadge value={form.workRequest} options={WORK_STATUS} colorMap={WORK_COLOR} onChange={function (v) { set("workRequest", v); }} /></div>
                <div><div style={{ fontSize: 10, color: t.text4, marginBottom: 3 }}>작업 상태</div><StatusBadge value={form.workStatus} options={WORK_STATUS} colorMap={WORK_COLOR} onChange={function (v) { set("workStatus", v); }} /></div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                <div><div style={{ fontSize: 10, color: t.text4, marginBottom: 3 }}>질문지 컨펌</div><StatusBadge value={form.questionConfirm} options={CONFIRM_STATUS} colorMap={CONFIRM_COLOR} onChange={function (v) { set("questionConfirm", v); }} /></div>
                <div><div style={{ fontSize: 10, color: t.text4, marginBottom: 3 }}>수정 여부</div><StatusBadge value={form.modify} options={["대기", "수정완료", "수정중"]} colorMap={{ "대기": "#6b7280", "수정완료": "#34d399", "수정중": "#f87171" }} onChange={function (v) { set("modify", v); }} /></div>
                <div><div style={{ fontSize: 10, color: t.text4, marginBottom: 3 }}>작업 상태</div><StatusBadge value={form.workStatus} options={WORK_STATUS} colorMap={WORK_COLOR} onChange={function (v) { set("workStatus", v); }} /></div>
              </div>
            )}
            <div><div style={{ fontSize: 10, color: t.text4, marginBottom: 3 }}>최종 컨펌</div><StatusBadge value={form.finalConfirm} options={CONFIRM_STATUS} colorMap={CONFIRM_COLOR} onChange={function (v) { set("finalConfirm", v); }} /></div>
            <div><div style={{ fontSize: 10, color: t.text4, marginBottom: 3 }}>수정 상태</div><StatusBadge value={form.modifyStatus} options={MODIFY_STATUS} colorMap={{ "대기": "#6b7280", "수정 완료": "#34d399", "수정중": "#f87171" }} onChange={function (v) { set("modifyStatus", v); }} /></div>
            <div><div style={{ fontSize: 10, color: t.text4, marginBottom: 3 }}>인스타</div><StatusBadge value={form.insta} options={UPLOAD_STATUS} colorMap={{ "대기": "#6b7280", "완료": "#34d399", "예정": "#fbbf24", "-": "#6b7280" }} onChange={function (v) { set("insta", v); }} /></div>
            <div><div style={{ fontSize: 10, color: t.text4, marginBottom: 3 }}>유튜브</div><StatusBadge value={form.youtube} options={UPLOAD_STATUS} colorMap={{ "대기": "#6b7280", "완료": "#34d399", "예정": "#fbbf24", "-": "#6b7280" }} onChange={function (v) { set("youtube", v); }} /></div>
          </div>
          {fields.map(function (item) { const l = item[0], k = item[1], tp = item[2]; return <div key={k} style={{ gridColumn: tp === "textarea" ? "1/-1" : "auto" }}>{lbl(l)}{tp === "textarea" ? <textarea value={form[k] || ""} onChange={function (e) { set(k, e.target.value); }} style={ta} /> : <input type={tp || "text"} value={form[k] || ""} onChange={function (e) { set(k, e.target.value); }} style={inp} />}</div>; })}
        </div>
        <div style={{ padding: "12px 22px 18px", borderTop: "1px solid " + t.border, display: "flex", gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, background: t.surface2, border: "1px solid " + t.border2, borderRadius: 9, padding: "9px 0", cursor: "pointer", color: t.text3, fontWeight: 600 }}>취소</button>
          <button onClick={function () { onUpdate(form); onClose(); }} style={{ flex: 1, background: "#6366f1", border: "none", borderRadius: 9, padding: "9px 0", cursor: "pointer", color: "#fff", fontWeight: 700 }}>저장</button>
        </div>
      </div>
    </div>
  );
}

function AdPanel(props) {
  const { t } = useTheme();
  const onAdsChange = props.onAdsChange, onNewAd = props.onNewAd, currentUser = props.currentUser;
  const [adTab, setAdTab] = useState("ai");
  const [aiAds, setAiAds] = useFirebaseData("ads/ai", []);
  const [intAds, setIntAds] = useFirebaseData("ads/interview", []);
  const [selected, setSelected] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  useEffect(function () { if (onAdsChange) onAdsChange(aiAds.concat(intAds)); }, [aiAds, intAds]);
  const updateAi = function (u) { setAiAds(aiAds.map(function (a) { return a.id === u.id ? u : a; })); };
  const updateInt = function (u) { setIntAds(intAds.map(function (a) { return a.id === u.id ? u : a; })); };
  const addAiAd = function () {
    const newAd = { id: "ad_" + Date.now(), requester: "", content: "새 광고", requestDate: "", planUrl: "", refUrl: "", planConfirm: "대기", workRequest: "대기", resizing: "", workStatus: "대기", workDate: "", expectedDate: "", completedDate: "", confirmRequestDate: "", videoUrl: "", finalConfirm: "대기", modifyContent: "", modifyStatus: "대기", note: "", uploadDate: "", insta: "대기", youtube: "대기" };
    setAiAds(aiAds.concat([newAd]));
    if (onNewAd) onNewAd(newAd, "타사 광고 (AI 포함)", currentUser ? currentUser.name : "");
  };
  const addIntAd = function () {
    const newAd = { id: "int_" + Date.now(), requester: "영상팀", questionUrl: "", content: "새 인터뷰 광고", shootDate: "", editStart: "", roughCut: "", questionConfirm: "대기", modify: "대기", modifyContent: "", request: "", extra: "", phrase: "", workStatus: "대기", workDate: "", expectedDate: "", completedDate: "", confirmRequestDate: "", videoUrl: "", finalConfirm: "대기", modifyContent2: "", modifyStatus: "대기", note: "", uploadDate: "", insta: "대기", youtube: "대기" };
    setIntAds(intAds.concat([newAd]));
    if (onNewAd) onNewAd(newAd, "인터뷰 파생 광고", currentUser ? currentUser.name : "");
  };
  const thS = { padding: "9px 11px", fontSize: 11, fontWeight: 700, color: t.text4, textAlign: "left", whiteSpace: "nowrap", borderBottom: "1px solid " + t.border, textTransform: "uppercase", letterSpacing: ".4px", background: t.bg };
  const tdS = { padding: "9px 11px", fontSize: 12, color: t.text2, borderBottom: "1px solid " + t.border, verticalAlign: "middle", whiteSpace: "nowrap" };
  const adTabStyle = function (tab) { return { padding: "6px 16px", background: adTab === tab ? "#6366f120" : "transparent", border: "1px solid " + (adTab === tab ? "#6366f1" : t.border), borderRadius: 20, cursor: "pointer", fontSize: 12, fontWeight: adTab === tab ? 700 : 500, color: adTab === tab ? "#818cf8" : t.text4 }; };
  const ads = adTab === "ai" ? aiAds : intAds;
  const updateAd = adTab === "ai" ? updateAi : updateInt;
  const deleteAd = function (id) { if (adTab === "ai") setAiAds(aiAds.filter(function (a) { return a.id !== id; })); else setIntAds(intAds.filter(function (a) { return a.id !== id; })); };
  const headers = adTab === "ai" ? ["요청자", "요청 내용", "요청일", "기획안", "레퍼런스", "기획 컨펌", "제작 요청", "리사이징", "작업 상태", "제작일", "예상완료", "영상URL", "최종 컨펌", "수정 상태", "인스타", "유튜브", "업로드일", ""] : ["요청자", "요청 내용", "촬영일", "편집 시작", "가편집", "질문지 컨펌", "수정", "요청사항", "마케팅 문구", "작업 상태", "예상완료", "영상URL", "최종 컨펌", "수정 상태", "인스타", "유튜브", "업로드일", ""];
  return (
    <div>
      {selected ? <AdDetailModal ad={selected} type={selectedType} onClose={function () { setSelected(null); }} onUpdate={function (v) { updateAd(v); setSelected(null); }} /> : null}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 6 }}><button style={adTabStyle("ai")} onClick={function () { setAdTab("ai"); }}>🤖 타사 광고 (AI 포함)</button><button style={adTabStyle("int")} onClick={function () { setAdTab("int"); }}>🎙️ 인터뷰 파생 광고</button></div>
        <button onClick={adTab === "ai" ? addAiAd : addIntAd} style={{ background: "#6366f1", border: "none", borderRadius: 8, padding: "7px 14px", fontWeight: 700, fontSize: 12, color: "#fff", cursor: "pointer" }}>+ 추가</button>
      </div>
      <div style={{ fontSize: 11, color: t.text4, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}><span style={{ display: "inline-flex", width: 7, height: 7, borderRadius: "50%", background: "#34d399" }} />제작일·예상완료일이 캘린더 탭에 자동으로 표시됩니다</div>
      <div style={{ background: t.surface, borderRadius: 14, border: "1px solid " + t.border, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1000 }}>
          <thead><tr>{headers.map(function (h) { return <th key={h} style={thS}>{h}</th>; })}</tr></thead>
          <tbody>
            {ads.map(function (ad) {
              return (
                <tr key={ad.id} onClick={function () { setSelected(ad); setSelectedType(adTab); }} style={{ cursor: "pointer" }}>
                  <td style={tdS}><span style={{ fontWeight: 600, color: t.text }}>{ad.requester || "-"}</span></td>
                  <td style={Object.assign({}, tdS, { maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis" })}>{ad.content}</td>
                  <td style={tdS}>{adTab === "ai" ? (ad.requestDate || "-") : (ad.shootDate || "-")}</td>
                  <td style={tdS}>{adTab === "ai" ? <UrlCell url={ad.planUrl} /> : (ad.editStart || "-")}</td>
                  <td style={tdS}>{adTab === "ai" ? <UrlCell url={ad.refUrl} /> : (ad.roughCut || "-")}</td>
                  <td style={tdS}>{adTab === "ai" ? <StatusBadge value={ad.planConfirm} options={CONFIRM_STATUS} colorMap={CONFIRM_COLOR} onChange={function (v) { updateAd(Object.assign({}, ad, { planConfirm: v })); }} /> : <StatusBadge value={ad.questionConfirm} options={CONFIRM_STATUS} colorMap={CONFIRM_COLOR} onChange={function (v) { updateAd(Object.assign({}, ad, { questionConfirm: v })); }} />}</td>
                  <td style={tdS}>{adTab === "ai" ? <StatusBadge value={ad.workRequest} options={WORK_STATUS} colorMap={WORK_COLOR} onChange={function (v) { updateAd(Object.assign({}, ad, { workRequest: v })); }} /> : <StatusBadge value={ad.modify} options={["대기", "수정완료", "수정중"]} colorMap={{ "대기": "#6b7280", "수정완료": "#34d399", "수정중": "#f87171" }} onChange={function (v) { updateAd(Object.assign({}, ad, { modify: v })); }} />}</td>
                  <td style={Object.assign({}, tdS, { maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis" })}><span style={{ fontSize: 11, color: t.text4 }}>{adTab === "ai" ? (ad.resizing || "-") : (ad.request || "-")}</span></td>
                  <td style={Object.assign({}, tdS, { maxWidth: 100 })}><span style={{ fontSize: 11, color: t.text4 }}>{adTab === "ai" ? "" : (ad.phrase || "-")}</span></td>
                  <td style={tdS}><StatusBadge value={ad.workStatus} options={WORK_STATUS} colorMap={WORK_COLOR} onChange={function (v) { updateAd(Object.assign({}, ad, { workStatus: v })); }} /></td>
                  <td style={tdS}><input type="date" value={ad.workDate || ""} onChange={function (e) { updateAd(Object.assign({}, ad, { workDate: e.target.value })); }} onClick={function (e) { e.stopPropagation(); }} style={{ background: "transparent", border: "none", color: t.text2, fontSize: 12, outline: "none", cursor: "pointer", colorScheme: "dark" }} /></td>
                  <td style={tdS}><input type="date" value={ad.expectedDate || ""} onChange={function (e) { updateAd(Object.assign({}, ad, { expectedDate: e.target.value })); }} onClick={function (e) { e.stopPropagation(); }} style={{ background: "transparent", border: "none", color: t.text2, fontSize: 12, outline: "none", cursor: "pointer", colorScheme: "dark" }} /></td>
                  <td style={tdS}><UrlCell url={ad.videoUrl} /></td>
                  <td style={tdS}><StatusBadge value={ad.finalConfirm} options={CONFIRM_STATUS} colorMap={CONFIRM_COLOR} onChange={function (v) { updateAd(Object.assign({}, ad, { finalConfirm: v })); }} /></td>
                  <td style={tdS}><StatusBadge value={ad.modifyStatus} options={MODIFY_STATUS} colorMap={{ "대기": "#6b7280", "수정 완료": "#34d399", "수정중": "#f87171" }} onChange={function (v) { updateAd(Object.assign({}, ad, { modifyStatus: v })); }} /></td>
                  <td style={tdS}><StatusBadge value={ad.insta} options={UPLOAD_STATUS} colorMap={{ "대기": "#6b7280", "완료": "#34d399", "예정": "#fbbf24", "-": "#6b7280" }} onChange={function (v) { updateAd(Object.assign({}, ad, { insta: v })); }} /></td>
                  <td style={tdS}><StatusBadge value={ad.youtube} options={UPLOAD_STATUS} colorMap={{ "대기": "#6b7280", "완료": "#34d399", "예정": "#fbbf24", "-": "#6b7280" }} onChange={function (v) { updateAd(Object.assign({}, ad, { youtube: v })); }} /></td>
                  <td style={tdS}>{ad.uploadDate || "-"}</td>
                  <td style={tdS}><button onClick={function (e) { e.stopPropagation(); deleteAd(ad.id); }} style={{ background: "none", border: "none", color: t.text5, cursor: "pointer", fontSize: 15 }}>×</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OvertimeEntryModal(props) {
  const { t } = useTheme();
  const { onAdd, onClose, kind } = props;
  const [form, setForm] = useState({ date: "", hours: "", note: "" });
  const set = function (k, v) { setForm(function (f) { return Object.assign({}, f, { [k]: v }); }); };
  const inp = { width: "100%", background: t.inputBg, border: "1px solid " + t.inputBorder, borderRadius: 9, padding: "9px 12px", fontSize: 13, color: t.text, boxSizing: "border-box", outline: "none" };
  const isEntry = kind === "entry";
  const submit = function () {
    const hoursNum = Number(form.hours);
    if (!form.date || !hoursNum || hoursNum <= 0) return;
    onAdd({ date: form.date, hours: hoursNum, note: form.note });
    onClose();
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000099", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
      <div style={{ background: t.surface, borderRadius: 18, padding: "22px 26px", width: 340, border: "1px solid " + t.border, boxShadow: "0 24px 64px #000c" }}>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 18, color: t.text }}>{isEntry ? "⏰ 야근 기록 추가" : "🏖️ 대체휴가 사용 추가"}</div>
        <div style={{ marginBottom: 11 }}><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>날짜</div><input type="date" value={form.date} onChange={function (e) { set("date", e.target.value); }} style={inp} /></div>
        <div style={{ marginBottom: 11 }}><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>{isEntry ? "야근 시간 (시간 단위, 예: 2.5)" : "사용 시간 (시간 단위, 예: 4)"}</div><input type="number" step="0.5" min="0" value={form.hours} onChange={function (e) { set("hours", e.target.value); }} placeholder="예: 2.5" style={inp} /></div>
        <div style={{ marginBottom: 18 }}><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>{isEntry ? "사유" : "메모"}</div><input value={form.note} onChange={function (e) { set("note", e.target.value); }} placeholder={isEntry ? "예: 편집 마감 대응" : "예: 반차로 사용"} style={inp} /></div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, background: t.surface2, border: "1px solid " + t.border2, borderRadius: 9, padding: "10px 0", cursor: "pointer", color: t.text3, fontWeight: 600 }}>취소</button>
          <button onClick={submit} style={{ flex: 1, background: isEntry ? "#6366f1" : "#fb923c", border: "none", borderRadius: 9, padding: "10px 0", cursor: "pointer", color: "#fff", fontWeight: 700 }}>추가</button>
        </div>
      </div>
    </div>
  );
}

function OvertimePanel(props) {
  const { t } = useTheme();
  const { currentUser, users, isAdmin } = props;
  const [entries, setEntries] = useFirebaseData("overtimeEntries", []);
  const [usage, setUsage] = useFirebaseData("overtimeUsage", []);
  const [view, setView] = useState("mine");
  const [expandedUser, setExpandedUser] = useState(null);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [showAddUsage, setShowAddUsage] = useState(false);
  const myName = currentUser.name;
  const sumHours = function (list) { return list.reduce(function (a, x) { return a + Number(x.hours || 0); }, 0); };
  const fmt = function (n) { return (Math.round(n * 10) / 10).toString().replace(/\.0$/, ""); };
  const myEntries = entries.filter(function (e) { return e.user === myName; }).slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
  const myUsage = usage.filter(function (u) { return u.user === myName; }).slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
  const myTotalOvertime = sumHours(myEntries);
  const myTotalUsed = sumHours(myUsage);
  const myRemaining = myTotalOvertime - myTotalUsed;
  const addEntry = function (data) { setEntries(entries.concat([{ id: "ot_" + Date.now(), user: myName, date: data.date, hours: data.hours, reason: data.note, createdAt: Date.now() }])); };
  const deleteEntry = function (id) { setEntries(entries.filter(function (e) { return e.id !== id; })); };
  const addUsage = function (data) { setUsage(usage.concat([{ id: "otu_" + Date.now(), user: myName, date: data.date, hours: data.hours, note: data.note, createdAt: Date.now() }])); };
  const deleteUsage = function (id) { setUsage(usage.filter(function (u) { return u.id !== id; })); };
  const members = users.filter(function (u) { return u.approved && u.role !== "viewer"; });
  const summaryByUser = members.map(function (u) {
    const ot = sumHours(entries.filter(function (e) { return e.user === u.name; }));
    const us = sumHours(usage.filter(function (x) { return x.user === u.name; }));
    return { name: u.name, rank: u.rank, position: u.position, overtime: ot, used: us, remaining: ot - us };
  }).sort(function (a, b) { return b.remaining - a.remaining; });
  const s = { background: t.surface, borderRadius: 13, border: "1px solid " + t.border, overflow: "hidden" };
  const viewBtn = function (v) { return { padding: "6px 16px", background: view === v ? "#6366f120" : "transparent", border: "1px solid " + (view === v ? "#6366f1" : t.border), borderRadius: 20, cursor: "pointer", fontSize: 12, fontWeight: view === v ? 700 : 500, color: view === v ? "#818cf8" : t.text4 }; };
  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      {showAddEntry ? <OvertimeEntryModal kind="entry" onAdd={addEntry} onClose={function () { setShowAddEntry(false); }} /> : null}
      {showAddUsage ? <OvertimeEntryModal kind="usage" onAdd={addUsage} onClose={function () { setShowAddUsage(false); }} /> : null}
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        <button style={viewBtn("mine")} onClick={function () { setView("mine"); }}>내 기록</button>
        <button style={viewBtn("all")} onClick={function () { setView("all"); setExpandedUser(null); }}>👥 팀 전체 현황</button>
      </div>
      {view === "mine" ? (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
            <div style={Object.assign({}, s, { padding: "14px 0", textAlign: "center" })}><div style={{ fontSize: 22, fontWeight: 900, color: "#818cf8" }}>{fmt(myTotalOvertime)}h</div><div style={{ fontSize: 11, color: t.text4, marginTop: 3 }}>누적 야근시간</div></div>
            <div style={Object.assign({}, s, { padding: "14px 0", textAlign: "center" })}><div style={{ fontSize: 22, fontWeight: 900, color: "#fb923c" }}>{fmt(myTotalUsed)}h</div><div style={{ fontSize: 11, color: t.text4, marginTop: 3 }}>대체휴가 사용시간</div></div>
            <div style={Object.assign({}, s, { padding: "14px 0", textAlign: "center" })}><div style={{ fontSize: 22, fontWeight: 900, color: myRemaining >= 0 ? "#34d399" : "#f87171" }}>{fmt(myRemaining)}h</div><div style={{ fontSize: 11, color: t.text4, marginTop: 3 }}>잔여 시간</div></div>
          </div>
          <div style={Object.assign({}, s, { marginBottom: 16 })}>
            <div style={{ padding: "11px 16px", borderBottom: "1px solid " + t.border, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: t.text4, textTransform: "uppercase", letterSpacing: ".5px" }}>⏰ 야근 기록 ({myEntries.length})</span>
              <button onClick={function () { setShowAddEntry(true); }} style={{ background: "#6366f1", border: "none", borderRadius: 8, padding: "6px 12px", fontWeight: 700, fontSize: 12, color: "#fff", cursor: "pointer" }}>+ 추가</button>
            </div>
            {myEntries.length === 0 ? <div style={{ padding: "24px", textAlign: "center", color: t.text5, fontSize: 13 }}>기록된 야근이 없습니다</div> : null}
            {myEntries.map(function (e) {
              return (
                <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", borderBottom: "1px solid " + t.border }}>
                  <span style={{ fontSize: 12, color: t.text4, width: 84, flexShrink: 0 }}>{e.date}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#818cf8", width: 48, flexShrink: 0 }}>{fmt(e.hours)}h</span>
                  <span style={{ fontSize: 12, color: t.text3, flex: 1 }}>{e.reason || "-"}</span>
                  <button onClick={function () { deleteEntry(e.id); }} style={{ background: "none", border: "none", color: t.text5, cursor: "pointer", fontSize: 14 }}>×</button>
                </div>
              );
            })}
          </div>
          <div style={s}>
            <div style={{ padding: "11px 16px", borderBottom: "1px solid " + t.border, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: t.text4, textTransform: "uppercase", letterSpacing: ".5px" }}>🏖️ 대체휴가 사용 기록 ({myUsage.length})</span>
              <button onClick={function () { setShowAddUsage(true); }} style={{ background: "#fb923c", border: "none", borderRadius: 8, padding: "6px 12px", fontWeight: 700, fontSize: 12, color: "#fff", cursor: "pointer" }}>+ 추가</button>
            </div>
            {myUsage.length === 0 ? <div style={{ padding: "24px", textAlign: "center", color: t.text5, fontSize: 13 }}>사용 기록이 없습니다</div> : null}
            {myUsage.map(function (u) {
              return (
                <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", borderBottom: "1px solid " + t.border }}>
                  <span style={{ fontSize: 12, color: t.text4, width: 84, flexShrink: 0 }}>{u.date}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#fb923c", width: 48, flexShrink: 0 }}>{fmt(u.hours)}h</span>
                  <span style={{ fontSize: 12, color: t.text3, flex: 1 }}>{u.note || "-"}</span>
                  <button onClick={function () { deleteUsage(u.id); }} style={{ background: "none", border: "none", color: t.text5, cursor: "pointer", fontSize: 14 }}>×</button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
            <div style={Object.assign({}, s, { padding: "14px 0", textAlign: "center" })}><div style={{ fontSize: 22, fontWeight: 900, color: "#818cf8" }}>{fmt(sumHours(entries))}h</div><div style={{ fontSize: 11, color: t.text4, marginTop: 3 }}>팀 전체 누적 야근시간</div></div>
            <div style={Object.assign({}, s, { padding: "14px 0", textAlign: "center" })}><div style={{ fontSize: 22, fontWeight: 900, color: "#fb923c" }}>{fmt(sumHours(usage))}h</div><div style={{ fontSize: 11, color: t.text4, marginTop: 3 }}>팀 전체 사용시간</div></div>
            <div style={Object.assign({}, s, { padding: "14px 0", textAlign: "center" })}><div style={{ fontSize: 22, fontWeight: 900, color: "#34d399" }}>{fmt(sumHours(entries) - sumHours(usage))}h</div><div style={{ fontSize: 11, color: t.text4, marginTop: 3 }}>팀 전체 잔여 시간</div></div>
          </div>
          <div style={s}>
            <div style={{ padding: "11px 16px", borderBottom: "1px solid " + t.border, fontSize: 12, fontWeight: 700, color: t.text4, textTransform: "uppercase", letterSpacing: ".5px" }}>팀원별 현황 ({summaryByUser.length}명) · 이름을 클릭하면 상세 기록이 열려요</div>
            {summaryByUser.length === 0 ? <div style={{ padding: "24px", textAlign: "center", color: t.text5, fontSize: 13 }}>등록된 직원이 없습니다</div> : null}
            {summaryByUser.map(function (item) {
              const isMe = item.name === myName;
              const isOpen = expandedUser === item.name;
              const personEntries = entries.filter(function (e) { return e.user === item.name; }).slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
              const personUsage = usage.filter(function (u) { return u.user === item.name; }).slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
              return (
                <div key={item.name} style={{ borderBottom: "1px solid " + t.border, background: isMe ? "#6366f110" : "transparent" }}>
                  <div onClick={function () { setExpandedUser(isOpen ? null : item.name); }} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", cursor: "pointer" }}>
                    <Avatar name={item.name} size={30} users={users} />
                    <div style={{ width: 110, flexShrink: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: t.text, display: "flex", alignItems: "center", gap: 6 }}>{item.name}{isMe ? <span style={{ fontSize: 10, background: "#6366f1", color: "#fff", borderRadius: 20, padding: "1px 7px", fontWeight: 700 }}>나</span> : null}</div>
                      <div style={{ fontSize: 10, color: t.text4, marginTop: 1 }}>{item.rank}{item.rank && item.position ? " · " : ""}{item.position}</div>
                    </div>
                    <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                      <div style={{ textAlign: "center" }}><div style={{ fontSize: 14, fontWeight: 800, color: "#818cf8" }}>{fmt(item.overtime)}h</div><div style={{ fontSize: 10, color: t.text4 }}>누적</div></div>
                      <div style={{ textAlign: "center" }}><div style={{ fontSize: 14, fontWeight: 800, color: "#fb923c" }}>{fmt(item.used)}h</div><div style={{ fontSize: 10, color: t.text4 }}>사용</div></div>
                      <div style={{ textAlign: "center" }}><div style={{ fontSize: 14, fontWeight: 800, color: item.remaining >= 0 ? "#34d399" : "#f87171" }}>{fmt(item.remaining)}h</div><div style={{ fontSize: 10, color: t.text4 }}>잔여</div></div>
                    </div>
                    <span style={{ fontSize: 12, color: t.text5, flexShrink: 0 }}>{isOpen ? "▲" : "▼"}</span>
                  </div>
                  {isOpen ? (
                    <div style={{ padding: "0 16px 14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div style={{ background: t.bg, borderRadius: 9, border: "1px solid " + t.border, overflow: "hidden" }}>
                        <div style={{ padding: "8px 12px", borderBottom: "1px solid " + t.border, fontSize: 11, fontWeight: 700, color: t.text4 }}>⏰ 야근 기록 ({personEntries.length})</div>
                        {personEntries.length === 0 ? <div style={{ padding: "14px", textAlign: "center", color: t.text5, fontSize: 12 }}>기록 없음</div> : personEntries.map(function (e) {
                          return <div key={e.id} style={{ display: "flex", gap: 8, padding: "8px 12px", borderBottom: "1px solid " + t.border, fontSize: 12 }}><span style={{ color: t.text4, width: 76, flexShrink: 0 }}>{e.date}</span><span style={{ color: "#818cf8", fontWeight: 700, width: 40, flexShrink: 0 }}>{fmt(e.hours)}h</span><span style={{ color: t.text3, flex: 1 }}>{e.reason || "-"}</span></div>;
                        })}
                      </div>
                      <div style={{ background: t.bg, borderRadius: 9, border: "1px solid " + t.border, overflow: "hidden" }}>
                        <div style={{ padding: "8px 12px", borderBottom: "1px solid " + t.border, fontSize: 11, fontWeight: 700, color: t.text4 }}>🏖️ 대체휴가 사용 ({personUsage.length})</div>
                        {personUsage.length === 0 ? <div style={{ padding: "14px", textAlign: "center", color: t.text5, fontSize: 12 }}>기록 없음</div> : personUsage.map(function (u) {
                          return <div key={u.id} style={{ display: "flex", gap: 8, padding: "8px 12px", borderBottom: "1px solid " + t.border, fontSize: 12 }}><span style={{ color: t.text4, width: 76, flexShrink: 0 }}>{u.date}</span><span style={{ color: "#fb923c", fontWeight: 700, width: 40, flexShrink: 0 }}>{fmt(u.hours)}h</span><span style={{ color: t.text3, flex: 1 }}>{u.note || "-"}</span></div>;
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function MessagesPanel(props) {
  const { t } = useTheme();
  const { currentUser, users, isAdmin, messages, setMessages } = props;
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [input, setInput] = useState("");
  const myName = currentUser.name;

  const partners = (function () {
    const base = users.filter(function (u) { return u.approved && u.name !== myName; });
    if (!isAdmin) base.unshift({ name: "admin", dept: "경영진", rank: "대표", position: "관리자" });
    return base;
  })();

  const isRead = function (m) { return !!(m.readBy && m.readBy[myName]); };
  const conversationWith = function (name) { return messages.filter(function (m) { return (m.from === myName && m.to === name) || (m.from === name && m.to === myName); }).slice().sort(function (a, b) { return a.createdAt - b.createdAt; }); };
  const unreadFrom = function (name) { return messages.filter(function (m) { return m.from === name && m.to === myName && !isRead(m); }).length; };
  const lastMessageWith = function (name) { const conv = conversationWith(name); return conv.length ? conv[conv.length - 1] : null; };
  const partnersSorted = partners.slice().sort(function (a, b) {
    const la = lastMessageWith(a.name), lb = lastMessageWith(b.name);
    const ta = la ? la.createdAt : 0, tb = lb ? lb.createdAt : 0;
    if (ta !== tb) return tb - ta;
    return a.name < b.name ? -1 : 1;
  });
  const totalUnread = partners.reduce(function (a, p) { return a + unreadFrom(p.name); }, 0);

  const markRead = function (name) {
    let changed = false;
    const updated = messages.map(function (m) {
      if (m.from === name && m.to === myName && !isRead(m)) {
        changed = true;
        const rb = Object.assign({}, m.readBy || {});
        rb[myName] = true;
        return Object.assign({}, m, { readBy: rb });
      }
      return m;
    });
    if (changed) setMessages(updated);
  };
  useEffect(function () { if (selectedPartner) markRead(selectedPartner); }, [selectedPartner, messages.length]);

  const send = function () {
    if (!input.trim() || !selectedPartner) return;
    const newMsg = { id: "msg_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7), from: myName, to: selectedPartner, text: input.trim(), createdAt: Date.now(), time: new Date().toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }), readBy: { [myName]: true } };
    setMessages(messages.concat([newMsg]));
    setInput("");
  };

  const conv = selectedPartner ? conversationWith(selectedPartner) : [];
  const partnerInfo = selectedPartner ? partners.find(function (p) { return p.name === selectedPartner; }) : null;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ background: t.surface, borderRadius: 14, border: "1px solid " + t.border, display: "flex", height: 620, overflow: "hidden" }}>
        <div style={{ width: 250, flexShrink: 0, borderRight: "1px solid " + t.border, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid " + t.border, fontSize: 12, fontWeight: 700, color: t.text4, textTransform: "uppercase", letterSpacing: ".5px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>💬 메시지(메모)</span>
            {totalUnread > 0 ? <span style={{ fontSize: 10, background: "#f87171", color: "#fff", borderRadius: 99, minWidth: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px", fontWeight: 700 }}>{totalUnread > 9 ? "9+" : totalUnread}</span> : null}
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {partnersSorted.length === 0 ? <div style={{ padding: "24px 16px", textAlign: "center", color: t.text5, fontSize: 12 }}>대화 가능한 팀원이 없습니다</div> : null}
            {partnersSorted.map(function (p) {
              const last = lastMessageWith(p.name);
              const unread = unreadFrom(p.name);
              const active = selectedPartner === p.name;
              return (
                <div key={p.name} onClick={function () { setSelectedPartner(p.name); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", cursor: "pointer", background: active ? "#6366f118" : "transparent", borderBottom: "1px solid " + t.border, borderLeft: active ? "3px solid #6366f1" : "3px solid transparent" }}>
                  <Avatar name={p.name} size={30} users={users} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{p.name}</span>
                      {unread > 0 ? <span style={{ fontSize: 10, background: "#f87171", color: "#fff", borderRadius: 99, minWidth: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px", fontWeight: 700, flexShrink: 0 }}>{unread > 9 ? "9+" : unread}</span> : null}
                    </div>
                    <div style={{ fontSize: 11, color: t.text4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 2 }}>{last ? (last.from === myName ? "나: " : "") + last.text : (p.rank || "") + (p.rank && p.position ? " · " : "") + (p.position || "")}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {!selectedPartner ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: t.text5, fontSize: 13 }}>왼쪽에서 대화할 팀원을 선택하세요</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid " + t.border, display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar name={selectedPartner} size={30} users={users} />
                <div><div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{selectedPartner}</div><div style={{ fontSize: 11, color: t.text4 }}>{partnerInfo ? [partnerInfo.rank, partnerInfo.position].filter(Boolean).join(" · ") : ""}</div></div>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px 8px", display: "flex", flexDirection: "column", gap: 10 }}>
                {conv.length === 0 ? <div style={{ textAlign: "center", padding: "30px 0", color: t.text5, fontSize: 12 }}>아직 메시지가 없습니다. 첫 메시지를 보내보세요!</div> : null}
                {conv.map(function (m) {
                  const mine = m.from === myName;
                  return (
                    <div key={m.id} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start", gap: 8, alignItems: "flex-end" }}>
                      {!mine ? <Avatar name={m.from} size={24} users={users} /> : null}
                      <div style={{ maxWidth: "70%" }}>
                        <div style={{ padding: "9px 13px", borderRadius: mine ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: mine ? "#6366f1" : t.surface2, color: mine ? "#fff" : t.text, fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap", border: mine ? "none" : "1px solid " + t.border }}>{m.text}</div>
                        <div style={{ fontSize: 10, color: t.text5, marginTop: 3, textAlign: mine ? "right" : "left" }}>{m.time}</div>
                      </div>
                    </div>
                  );
                })}
                <div ref={function (el) { if (el) el.scrollIntoView({ behavior: "smooth" }); }} />
              </div>
              <div style={{ padding: "10px 16px 14px", borderTop: "1px solid " + t.border }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <input value={input} onChange={function (e) { setInput(e.target.value); }} onKeyDown={function (e) { if (e.key === "Enter" && !e.shiftKey) send(); }} placeholder="메시지를 입력하세요..." style={{ flex: 1, background: t.inputBg, border: "1px solid " + t.inputBorder, borderRadius: 10, padding: "9px 13px", fontSize: 13, color: t.text, outline: "none" }} />
                  <button onClick={send} disabled={!input.trim()} style={{ background: input.trim() ? "#6366f1" : t.surface2, border: "none", borderRadius: 10, padding: "0 18px", color: input.trim() ? "#fff" : t.text4, fontWeight: 700, fontSize: 13, cursor: input.trim() ? "pointer" : "not-allowed" }}>전송</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  useEffect(function () {
    document.body.style.margin = "0"; document.body.style.padding = "0";
    document.documentElement.style.margin = "0"; document.documentElement.style.padding = "0";
  }, []);
  const [isDark, setIsDark] = useState(true);
  const t = isDark ? DARK : LIGHT;
  useEffect(function () { document.body.style.background = t.bg; document.documentElement.style.background = t.bg; }, [t.bg]);

  const [users, setUsersRaw, usersReady] = useFirebaseData("users", []);
  const [tasks, setTasksRaw, tasksReady] = useFirebaseData("tasks", []);
  const [marketingTasks, setMarketingTasksRaw, marketingTasksReady] = useFirebaseData("marketingTasks", []);
  const [designTasks, setDesignTasksRaw, designTasksReady] = useFirebaseData("designTasks", []);
  const [notices, setNoticesRaw, noticesReady] = useFirebaseData("notices", []);
  const [notifications, setNotificationsRaw] = useFirebaseData("notifications", []);
  const [directMessages, setDirectMessagesRaw] = useFirebaseData("directMessages", []);
  const [visibleTabs, setVisibleTabsRaw] = useFirebaseData("settings/visibleTabs", ALL_TABS.map(function (t) { return t.id; }));
  const synced = usersReady && tasksReady && noticesReady && marketingTasksReady && designTasksReady;

  useEffect(function () {
    if (!usersReady || users.length > 0) return;
    setUsersRaw([
      { id: "user_1", name: "박래성", password: "1234", dept: "영상팀", rank: "팀장", position: "디렉터", officePhone: "02-1234-5678", mobile: "010-1234-5678", role: "manager", approved: true },
      { id: "user_2", name: "이한희", password: "1234", dept: "영상팀", rank: "팀원", position: "에디터", officePhone: "02-1234-5679", mobile: "010-9876-5432", role: "member", approved: true },
    ]);
  }, [usersReady]);
  useEffect(function () {
    if (!noticesReady || notices.length > 0) return;
    setNoticesRaw([{ id: "notice_1", title: "시스템 오픈 안내", content: "TIMBEL 영상 제작 스케줄러가 오픈되었습니다!", active: true }]);
  }, [noticesReady]);
  useEffect(function () {
    if (!tasksReady || tasks.length > 0) return;
    setTasksRaw([
      { id: "task_1", title: "6월 메인 브이로그", desc: "월간 하이라이트 영상", assignee: "박래성", priority: "높음", tag: "유튜브", due: "2026-06-30", status: "편집", comments: [] },
      { id: "task_2", title: "신제품 리뷰 영상", desc: "스마트폰 언박싱 & 리뷰", assignee: "이한희", priority: "높음", tag: "유튜브", due: "2026-06-28", status: "촬영", comments: [] },
      { id: "task_3", title: "여름 쇼츠 #1", desc: "15초 숏폼 콘텐츠", assignee: "박래성", priority: "중간", tag: "쇼츠", due: "2026-06-27", status: "업로드 완료", comments: [] },
    ]);
  }, [tasksReady]);

  const [currentUser, setCurrentUserRaw] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [tab, setTab] = useState("calendar");
  const [showAdd, setShowAdd] = useState(false);
  const [addDate, setAddDate] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [showAddMarketing, setShowAddMarketing] = useState(false);
  const [addMarketingDate, setAddMarketingDate] = useState("");
  const [selectedMarketingTask, setSelectedMarketingTask] = useState(null);
  const [showAddDesign, setShowAddDesign] = useState(false);
  const [addDesignDate, setAddDesignDate] = useState("");
  const [selectedDesignTask, setSelectedDesignTask] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [adsData, setAdsData] = useState([]);

  const isAdmin = currentUser && currentUser.role === "admin";
  const isViewer = currentUser && currentUser.role === "viewer";
  const myUnreadMessages = currentUser ? directMessages.filter(function (m) { return m.to === currentUser.name && !(m.readBy && m.readBy[currentUser.name]); }).length : 0;
  const VIEWER_BLOCKED_TABS = ["ad", "ai", "overtime"];

  const setCurrentUser = function (user) {
    setCurrentUserRaw(user);
    if (user) setCookie("timbel_user", JSON.stringify({ id: user.id, name: user.name }), 30);
    else deleteCookie("timbel_user");
  };
  useEffect(function () {
    if (!synced || authChecked) return;
    const saved = getCookie("timbel_user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.id === "admin") setCurrentUserRaw(ADMIN_USER);
        else { const found = users.find(function (u) { return u.id === parsed.id; }); if (found && found.approved) setCurrentUserRaw(found); else deleteCookie("timbel_user"); }
      } catch (e) { deleteCookie("timbel_user"); }
    }
    setAuthChecked(true);
  }, [synced, users]);

  const moveTask = function (id, dir) { setTasksRaw(tasks.map(function (tk) { return tk.id === id ? Object.assign({}, tk, { status: STAGES[STAGES.indexOf(tk.status) + dir] }) : tk; })); };
  const deleteTask = function (id) { setTasksRaw(tasks.filter(function (tk) { return tk.id !== id; })); };
  const addTask = function (task) { setTasksRaw(tasks.concat([task])); };
  const updateTask = function (u) { setTasksRaw(tasks.map(function (tk) { return tk.id === u.id ? u : tk; })); setSelectedTask(u); };
  const openAdd = function (date) { setAddDate(date || ""); setShowAdd(true); };
  const moveMarketingTask = function (id, dir) { setMarketingTasksRaw(marketingTasks.map(function (tk) { return tk.id === id ? Object.assign({}, tk, { status: MARKETING_STAGES[MARKETING_STAGES.indexOf(tk.status) + dir] }) : tk; })); };
  const deleteMarketingTask = function (id) { setMarketingTasksRaw(marketingTasks.filter(function (tk) { return tk.id !== id; })); };
  const addMarketingTask = function (task) { setMarketingTasksRaw(marketingTasks.concat([task])); };
  const updateMarketingTask = function (u) { setMarketingTasksRaw(marketingTasks.map(function (tk) { return tk.id === u.id ? u : tk; })); setSelectedMarketingTask(u); };
  const openAddMarketing = function (date) { setAddMarketingDate(date || ""); setShowAddMarketing(true); };
  const moveDesignTask = function (id, dir) { setDesignTasksRaw(designTasks.map(function (tk) { return tk.id === id ? Object.assign({}, tk, { status: DESIGN_STAGES[DESIGN_STAGES.indexOf(tk.status) + dir] }) : tk; })); };
  const deleteDesignTask = function (id) { setDesignTasksRaw(designTasks.filter(function (tk) { return tk.id !== id; })); };
  const addDesignTask = function (task) { setDesignTasksRaw(designTasks.concat([task])); };
  const updateDesignTask = function (u) { setDesignTasksRaw(designTasks.map(function (tk) { return tk.id === u.id ? u : tk; })); setSelectedDesignTask(u); };
  const openAddDesign = function (date) { setAddDesignDate(date || ""); setShowAddDesign(true); };
  const vt = Array.isArray(visibleTabs) ? visibleTabs : Object.values(visibleTabs || {});
  const displayTabs = isAdmin ? ALL_TABS : ALL_TABS.filter(function (tp) { return vt.includes(tp.id) && !(isViewer && VIEWER_BLOCKED_TABS.includes(tp.id)); });

  const sendNotification = function (toUser, fromUser, taskTitle, text) {
    const newNotif = { id: "notif_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7), toUser: toUser, fromUser: fromUser, taskTitle: taskTitle, text: text.length > 60 ? text.slice(0, 60) + "..." : text, kind: "comment", readBy: {}, createdAt: Date.now(), time: new Date().toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) };
    setNotificationsRaw((notifications || []).concat([newNotif]));
  };
  const sendAdNotification = function (ad, adTypeLabel, fromUser) {
    const label = ad && ad.content ? ad.content : "새 광고";
    const newNotif = { id: "notif_ad_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7), toUser: "all", fromUser: fromUser || "알 수 없음", taskTitle: adTypeLabel, text: label, kind: "ad", readBy: {}, createdAt: Date.now(), time: new Date().toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) };
    setNotificationsRaw((notifications || []).concat([newNotif]));
  };
  const markNotifRead = function (notifId) {
    setNotificationsRaw((notifications || []).map(function (n) { if (n.id !== notifId) return n; const rb = Object.assign({}, n.readBy || {}); rb[currentUser.name] = true; return Object.assign({}, n, { readBy: rb }); }));
  };
  const markAllNotifsRead = function () {
    setNotificationsRaw((notifications || []).map(function (n) { if (n.toUser !== currentUser.name && n.toUser !== "all") return n; const rb = Object.assign({}, n.readBy || {}); rb[currentUser.name] = true; return Object.assign({}, n, { readBy: rb }); }));
  };
  const handleNotifClick = function (notif) {
    if (notif.kind === "ad") { setTab("ad"); return; }
    const found = tasks.find(function (tk) { return tk.title === notif.taskTitle; });
    if (found) { setTab("calendar"); setSelectedTask(found); }
  };

  if (!synced || !authChecked) {
    return (
      <div style={{ minHeight: "100vh", background: "#0d1117", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system,sans-serif", gap: 16 }}>
        <div style={{ fontSize: 30 }}>🎬</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#f9fafb" }}>TIMBEL 영상 제작 스케줄러</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#fbbf24", fontSize: 13 }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fbbf24" }} />Firebase 연결 중...</div>
      </div>
    );
  }
  if (!currentUser) {
    return (
      <ThemeCtx.Provider value={{ t: t, isDark: isDark }}>
        <AuthScreen onLogin={setCurrentUser} users={users} onRegister={async function (u) { await setUsersRaw(users.concat([u])); }} />
      </ThemeCtx.Provider>
    );
  }

  return (
    <ThemeCtx.Provider value={{ t: t, isDark: isDark }}>
      <div style={{ minHeight: "100vh", background: t.bg, fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", color: t.text }}>
        {showAdd ? <AddTaskModal onAdd={addTask} onClose={function () { setShowAdd(false); }} defaultDate={addDate} users={users} /> : null}
        {selectedTask ? <TaskDetailModal task={selectedTask} onClose={function () { setSelectedTask(null); }} onUpdate={updateTask} onMove={isViewer ? null : function (id, dir) { moveTask(id, dir); setSelectedTask(function (prev) { return Object.assign({}, prev, { status: STAGES[STAGES.indexOf(prev.status) + dir] }); }); }} users={users} currentUser={currentUser} onNotify={sendNotification} /> : null}
        {showAddMarketing ? <AddTaskModal onAdd={addMarketingTask} onClose={function () { setShowAddMarketing(false); }} defaultDate={addMarketingDate} users={users} stages={MARKETING_STAGES} tags={MARKETING_TAGS} title="새 마케팅 업무 추가" categoryLabel="카테고리" /> : null}
        {selectedMarketingTask ? <TaskDetailModal task={selectedMarketingTask} onClose={function () { setSelectedMarketingTask(null); }} onUpdate={updateMarketingTask} onMove={isViewer ? null : function (id, dir) { moveMarketingTask(id, dir); setSelectedMarketingTask(function (prev) { return Object.assign({}, prev, { status: MARKETING_STAGES[MARKETING_STAGES.indexOf(prev.status) + dir] }); }); }} users={users} currentUser={currentUser} onNotify={sendNotification} stages={MARKETING_STAGES} stageColor={MARKETING_STAGE_COLOR} stageIcon={MARKETING_STAGE_ICON} tags={MARKETING_TAGS} categoryLabel="카테고리" editTitle="✏️ 마케팅 업무 수정" /> : null}
        {showAddDesign ? <AddTaskModal onAdd={addDesignTask} onClose={function () { setShowAddDesign(false); }} defaultDate={addDesignDate} users={users} stages={DESIGN_STAGES} tags={DESIGN_TAGS} title="새 디자인 업무 추가" categoryLabel="카테고리" /> : null}
        {selectedDesignTask ? <TaskDetailModal task={selectedDesignTask} onClose={function () { setSelectedDesignTask(null); }} onUpdate={updateDesignTask} onMove={isViewer ? null : function (id, dir) { moveDesignTask(id, dir); setSelectedDesignTask(function (prev) { return Object.assign({}, prev, { status: DESIGN_STAGES[DESIGN_STAGES.indexOf(prev.status) + dir] }); }); }} users={users} currentUser={currentUser} onNotify={sendNotification} stages={DESIGN_STAGES} stageColor={DESIGN_STAGE_COLOR} stageIcon={DESIGN_STAGE_ICON} tags={DESIGN_TAGS} categoryLabel="카테고리" editTitle="✏️ 디자인 업무 수정" /> : null}
        {showProfile ? <ProfileModal currentUser={currentUser} onClose={function () { setShowProfile(false); }} onUpdate={function (updated) { setUsersRaw(users.map(function (u) { return u.id === updated.id ? updated : u; })); setCurrentUser(updated); setShowProfile(false); }} /> : null}

        <div style={{ borderBottom: "1px solid " + t.border, padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", background: t.headerBg, position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 15, fontWeight: 900, color: "#818cf8", letterSpacing: "2px" }}>TIMBEL</span><span style={{ fontSize: 13, fontWeight: 600, color: t.text3 }}>영상 제작 스케줄러</span></div>
            {isAdmin ? <span style={{ fontSize: 10, background: "#f8717120", color: "#f87171", border: "1px solid #f8717140", borderRadius: 20, padding: "2px 9px", fontWeight: 700 }}>🛡️ 관리자</span> : null}
            <span style={{ fontSize: 11, color: t.text4, background: t.surface2, padding: "2px 9px", borderRadius: 20, border: "1px solid " + t.border }}>{tasks.length}개</span>
            <SyncBadge synced={synced} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <NotificationBell notifications={notifications || []} currentUser={currentUser} onMarkRead={markNotifRead} onMarkAllRead={markAllNotifsRead} onClickNotif={handleNotifClick} />
            <div style={{ display: "flex", alignItems: "center", background: t.surface2, border: "1px solid " + t.border, borderRadius: 10, padding: 3, gap: 2 }}>
              <button onClick={function () { setIsDark(false); }} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 7, border: "none", cursor: "pointer", background: !isDark ? "#fff" : "transparent", color: !isDark ? "#1e293b" : t.text4, fontWeight: !isDark ? 700 : 500, fontSize: 12 }}>☀️ 일반</button>
              <button onClick={function () { setIsDark(true); }} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 7, border: "none", cursor: "pointer", background: isDark ? "#1e293b" : "transparent", color: isDark ? "#818cf8" : t.text4, fontWeight: isDark ? 700 : 500, fontSize: 12 }}>🌙 다크</button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, background: t.surface2, border: "1px solid " + t.border, borderRadius: 10, padding: "5px 12px" }}>
              <Avatar name={currentUser.name} size={22} users={users} />
              <div><div style={{ fontSize: 12, fontWeight: 700, color: t.text }}>{currentUser.name}</div><div style={{ fontSize: 10, color: t.text4 }}>{currentUser.rank} · {currentUser.position}</div></div>
            </div>
            {!isAdmin ? <button onClick={function () { setShowProfile(true); }} style={{ background: t.surface2, border: "1px solid " + t.border, borderRadius: 8, padding: "7px 12px", fontSize: 12, color: t.text4, cursor: "pointer" }}>⚙️ 내 정보</button> : null}
            <button onClick={function () { setCurrentUser(null); }} style={{ background: t.surface2, border: "1px solid " + t.border, borderRadius: 8, padding: "7px 12px", fontSize: 12, color: t.text4, cursor: "pointer" }}>로그아웃</button>
            {!isAdmin && !isViewer ? <button onClick={function () { openAdd(); }} style={{ background: "#6366f1", border: "none", borderRadius: 8, padding: "7px 15px", fontWeight: 700, fontSize: 13, color: "#fff", cursor: "pointer" }}>+ 추가</button> : null}
          </div>
        </div>

        <NoticeBanner notices={notices} />

        <div style={{ borderBottom: "1px solid " + t.border, padding: "0 24px", background: t.headerBg }}>
          <div style={{ maxWidth: 1300, margin: "0 auto", display: "flex", gap: 2, justifyContent: "center" }}>
            {isAdmin ? <button onClick={function () { setTab("admin"); }} style={{ padding: "10px 18px", background: "none", border: "none", borderBottom: tab === "admin" ? "2px solid #f87171" : "2px solid transparent", cursor: "pointer", fontWeight: tab === "admin" ? 700 : 500, fontSize: 13, color: tab === "admin" ? "#f87171" : t.text4, marginBottom: -1 }}>🛡️ 관리자</button> : null}
            {displayTabs.map(function (tp) { return <button key={tp.id} onClick={function () { setTab(tp.id); }} style={{ position: "relative", padding: "10px 18px", background: "none", border: "none", borderBottom: tab === tp.id ? "2px solid #6366f1" : "2px solid transparent", cursor: "pointer", fontWeight: tab === tp.id ? 700 : 500, fontSize: 13, color: tab === tp.id ? "#818cf8" : t.text4, marginBottom: -1 }}>{tp.label}{tp.id === "messages" && myUnreadMessages > 0 ? <span style={{ position: "absolute", top: 4, right: 4, background: "#f87171", color: "#fff", fontSize: 9, fontWeight: 700, borderRadius: 99, minWidth: 15, height: 15, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>{myUnreadMessages > 9 ? "9+" : myUnreadMessages}</span> : null}</button>; })}
          </div>
        </div>

        <div style={{ maxWidth: 1300, margin: "0 auto", padding: "20px", minWidth: 0, boxSizing: "border-box" }}>
          {tab === "admin" && isAdmin ? <AdminPanel users={users} onUpdateUsers={setUsersRaw} notices={notices} onUpdateNotices={setNoticesRaw} visibleTabs={vt} setVisibleTabs={function (v) { setVisibleTabsRaw(v); }} tasks={tasks} onUpdateTasks={setTasksRaw} /> : null}
          {tab === "unified" ? <CombinedCalendarView videoTasks={tasks} marketingTasks={marketingTasks} designTasks={designTasks} ads={adsData} onSelectVideo={setSelectedTask} onSelectMarketing={setSelectedMarketingTask} onSelectDesign={setSelectedDesignTask} onSelectAd={function () { setTab("ad"); }} /> : null}
          {tab === "calendar" ? <CalendarView tasks={tasks} onSelectTask={setSelectedTask} onAddTask={isViewer ? function () {} : openAdd} ads={adsData} onMove={isViewer ? null : moveTask} onDelete={isViewer ? null : deleteTask} onSelectAd={function () { setTab("ad"); }} /> : null}
          {tab === "adCalendar" ? <CalendarView tasks={marketingTasks} onSelectTask={setSelectedMarketingTask} onAddTask={isViewer ? function () {} : openAddMarketing} ads={adsData} onMove={isViewer ? null : moveMarketingTask} onDelete={isViewer ? null : deleteMarketingTask} onSelectAd={function () { setTab("ad"); }} stages={MARKETING_STAGES} stageColor={MARKETING_STAGE_COLOR} stageIcon={MARKETING_STAGE_ICON} taskLabel="마케팅 업무" taskUnitLabel="업무" /> : null}
          {tab === "designCalendar" ? <CalendarView tasks={designTasks} onSelectTask={setSelectedDesignTask} onAddTask={isViewer ? function () {} : openAddDesign} ads={[]} onMove={isViewer ? null : moveDesignTask} onDelete={isViewer ? null : deleteDesignTask} stages={DESIGN_STAGES} stageColor={DESIGN_STAGE_COLOR} stageIcon={DESIGN_STAGE_ICON} taskLabel="디자인 업무" taskUnitLabel="업무" /> : null}
          {tab === "board" ? <BoardView tasks={tasks} onSelectTask={setSelectedTask} onMove={isViewer ? null : moveTask} onDelete={isViewer ? null : deleteTask} users={users} ads={adsData} onSelectAd={function () { setTab("ad"); }} designTasks={designTasks} onSelectDesign={setSelectedDesignTask} /> : null}
          {tab === "ad" ? <AdPanel onAdsChange={setAdsData} onNewAd={sendAdNotification} currentUser={currentUser} /> : null}
          {tab === "stats" ? <div style={{ maxWidth: 760, margin: "0 auto" }}><StatsPanel videoTasks={tasks} marketingTasks={marketingTasks} designTasks={designTasks} currentUser={currentUser} /></div> : null}
          {tab === "overtime" ? <OvertimePanel currentUser={currentUser} users={users} isAdmin={isAdmin} /> : null}
          {tab === "messages" ? <MessagesPanel currentUser={currentUser} users={users} isAdmin={isAdmin} messages={directMessages} setMessages={setDirectMessagesRaw} /> : null}
          {tab === "ai" ? <AIPanel tasks={tasks} users={users} /> : null}
        </div>
      </div>
    </ThemeCtx.Provider>
  );
}