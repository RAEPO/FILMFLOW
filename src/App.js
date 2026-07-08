import { useState, useEffect, useRef, createContext, useContext } from "react";
import { Home, LayoutGrid, Calendar, CalendarDays, Palette, Kanban, Megaphone, BarChart3, Settings, MessageCircle, Bot, Shield, Clock, History, Search, Pencil, Film, Lightbulb, CheckCircle2, Users, ClipboardList, Flag, Upload, Paperclip, Palmtree, Repeat, AlertTriangle, User, Image as ImageIcon, Zap, Rocket, Bell, Folder, Trash2, Eye, Heart, TrendingUp, Hand, Sparkles, Video, Scissors, Inbox, Lock, Key, Plus, Tag, Circle, CornerUpLeft, Download, RefreshCw, FileText, Mic, Mail, Smile, RotateCcw, SearchX, Sun, Moon, X, Check, ArrowLeft, ArrowRight, Send, LogOut, UserCog, GanttChart, Link } from "lucide-react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set as dbSet } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyC9X2XOtmcuU92aKyvVeM8HIvo-ePhffPA",
  authDomain: "filmflow-fc094.firebaseapp.com",
  databaseURL: "https://filmflow-fc094-default-rtdb.firebaseio.com",
  projectId: "filmflow-fc094",
  storageBucket: "filmflow-fc094.firebasestorage.app",
  messagingSenderId: "171720836390",
  appId: "1:171720836390:web:5f16902d687183575bade7",
  measurementId: "G-Q233WDMSE9",
};
const firebaseApp = initializeApp(firebaseConfig);
const rtdb = getDatabase(firebaseApp);

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

async function hashPassword(pw) {
  const enc = new TextEncoder();
  const data = enc.encode("TIMBEL_PEPPER_v1:" + pw);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
}
const DEFAULT_ADMIN_PASSWORD_HASH = "0b01a973154b81702c7684ae274002b90a028954cfa3cdd50378acf98f933e73";
const DEFAULT_SEED_PASSWORD_HASH = "7d471cfaaee3418e4e8596b517d44d1aa7f267cfd7ad3bdfb916f3ad2e4be317";

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
const DARK = { bg: "#0d1117", surface: "#111827", surface2: "#1f2937", border: "#1f2937", border2: "#374151", text: "#f9fafb", text2: "#d1d5db", text3: "#9ca3af", text4: "#6b7280", text5: "#4b5563", inputBg: "#1f2937", inputBorder: "#374151", headerBg: "#0d1117", todayBg: "#1e1b4b" };
const LIGHT = { bg: "#f1f5f9", surface: "#ffffff", surface2: "#f8fafc", border: "#e2e8f0", border2: "#cbd5e1", text: "#0f172a", text2: "#1e293b", text3: "#475569", text4: "#64748b", text5: "#94a3b8", inputBg: "#f8fafc", inputBorder: "#cbd5e1", headerBg: "#ffffff", todayBg: "#eef2ff" };

const PRIORITIES = ["높음", "중간", "낮음"];
const PRIORITY_COLOR = { "높음": "#f87171", "중간": "#fbbf24", "낮음": "#34d399" };
const STAGES = ["기획", "촬영", "편집", "검토", "업무 완료"];
const STAGE_COLOR = { "기획": "#818cf8", "촬영": "#fb923c", "편집": "#38bdf8", "검토": "#c084fc", "업무 완료": "#34d399" };
const STAGE_ICON = { "기획": Lightbulb, "촬영": Video, "편집": Scissors, "검토": Search, "업무 완료": Rocket };
const TAGS = ["유튜브", "인스타그램", "틱톡", "쇼츠", "광고", "브이로그"];
const TASK_CATEGORIES = ["기획", "촬영", "편집", "업로드", "미팅", "회의", "기타"];
const VIDEO_WORK_CATEGORIES = ["기획", "촬영", "편집", "업로드"];
const TAG_COLOR = { "유튜브": "#f87171", "인스타그램": "#c084fc", "틱톡": "#38bdf8", "쇼츠": "#fb923c", "광고": "#fbbf24", "브이로그": "#34d399" };
const MARKETING_STAGES = ["기획", "진행중", "검토", "완료"];
const MARKETING_STAGE_COLOR = { "기획": "#818cf8", "진행중": "#fb923c", "검토": "#c084fc", "완료": "#34d399" };
const MARKETING_STAGE_ICON = { "기획": Lightbulb, "진행중": Rocket, "검토": Search, "완료": CheckCircle2 };
const MARKETING_TAGS = ["광고", "SNS", "이벤트", "제휴", "콘텐츠", "기타"];
const MARKETING_TAG_COLOR = { "광고": "#fbbf24", "SNS": "#38bdf8", "이벤트": "#f87171", "제휴": "#c084fc", "콘텐츠": "#34d399", "기타": "#94a3b8" };
const DESIGN_STAGES = ["기획", "시안 작업", "피드백", "완료"];
const DESIGN_STAGE_COLOR = { "기획": "#818cf8", "시안 작업": "#fb923c", "피드백": "#c084fc", "완료": "#34d399" };
const DESIGN_STAGE_ICON = { "기획": Lightbulb, "시안 작업": Palette, "피드백": Repeat, "완료": CheckCircle2 };
const DESIGN_TAGS = ["로고", "배너", "템플릿", "인쇄물", "UI/UX", "기타"];
const DESIGN_TAG_COLOR = { "로고": "#f87171", "배너": "#fbbf24", "템플릿": "#38bdf8", "인쇄물": "#c084fc", "UI/UX": "#34d399", "기타": "#94a3b8" };
const COMBINED_TYPE_INFO = {
  video: { color: "#818cf8", icon: Film, label: "영상" },
  marketing: { color: "#fb923c", icon: CalendarDays, label: "마케팅" },
  design: { color: "#f87171", icon: Palette, label: "디자인" },
  adWork: { color: "#fbbf24", icon: Megaphone, label: "광고 제작일" },
  adExpected: { color: "#38bdf8", icon: Flag, label: "광고 예상완료" },
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
  { id: "home", icon: Home, text: "홈" }, { id: "unified", icon: LayoutGrid, text: "통합 캘린더" }, { id: "calendar", icon: Calendar, text: "영상 캘린더" }, { id: "adCalendar", icon: CalendarDays, text: "마케팅 캘린더" }, { id: "designCalendar", icon: Palette, text: "디자인 캘린더" }, { id: "timeline", icon: GanttChart, text: "타임라인" }, { id: "board", icon: Kanban, text: "제작 보드" },
  { id: "ad", icon: Megaphone, text: "광고 제작 관리" }, { id: "stats", icon: BarChart3, text: "통계" }, { id: "overtime", icon: Clock, text: "야근 기록" }, { id: "messages", icon: MessageCircle, text: "메시지(메모)" }, { id: "ai", icon: Bot, text: "AI 분석" }, { id: "activity", icon: History, text: "활동 로그" }, { id: "requests", icon: Inbox, text: "업무 요청함" },
];
const ADMIN_USER = { id: "admin", name: "admin", dept: "경영진", rank: "대표", position: "관리자", officePhone: "", mobile: "", role: "admin", approved: true };
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

function isRestDay(ds) {
  if (KOREAN_HOLIDAYS[ds]) return true;
  const dow = new Date(ds + "T00:00:00").getDay();
  return dow === 0 || dow === 6;
}

function trimArray(arr, maxLen) {
  if (!arr || arr.length <= maxLen) return arr || [];
  return arr.slice(arr.length - maxLen);
}

function downloadCSV(filename, rows) {
  if (!rows || rows.length === 0) { alert("내보낼 데이터가 없습니다."); return; }
  const headers = Object.keys(rows[0]);
  const escapeCell = function (val) {
    let s = val === undefined || val === null ? "" : String(val);
    s = s.replace(/"/g, '""');
    if (s.indexOf(",") !== -1 || s.indexOf("\n") !== -1 || s.indexOf('"') !== -1) s = '"' + s + '"';
    return s;
  };
  const lines = [headers.map(escapeCell).join(",")];
  rows.forEach(function (row) { lines.push(headers.map(function (h) { return escapeCell(row[h]); }).join(",")); });
  const csvContent = "\uFEFF" + lines.join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function useFirebaseData(path, defaultVal) {
  const [data, setData] = useState(defaultVal);
  const [ready, setReady] = useState(false);
  useEffect(function () {
    const dbRef = ref(rtdb, path);
    const unsubscribe = onValue(dbRef, function (snapshot) {
      const val = snapshot.val();
      if (val !== null && val !== undefined) setData(Array.isArray(defaultVal) ? Object.values(val) : val);
      else setData(defaultVal);
      setReady(true);
    }, function (error) {
      setReady(true);
    });
    return function () { unsubscribe(); };
  }, [path]);
  const setFirebase = async function (val) {
    const toStore = Array.isArray(val) ? Object.fromEntries(val.map(function (v) { return [v.id || ("item_" + Date.now()), v]; })) : val;
    setData(val);
    await dbSet(ref(rtdb, path), toStore);
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
  return <a href={props.url} target="_blank" rel="noreferrer" onClick={function (e) { e.stopPropagation(); }} style={{ display: "inline-flex", alignItems: "center", gap: 3, color: "#818cf8", fontSize: 11, textDecoration: "none", background: "#818cf820", padding: "2px 8px", borderRadius: 7 }}>링크 <ArrowRight size={10} strokeWidth={2.5} /></a>;
}
function MediaPreview(props) {
  const { t } = useTheme();
  const url = props.url;
  if (!url) return null;
  const frameWrap = function (embedUrl, ratio, allow) {
    return <div style={{ position: "relative", paddingBottom: ratio, height: 0, borderRadius: 12, overflow: "hidden", background: "#000", border: "1px solid " + t.border }}><iframe src={embedUrl} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }} allow={allow} allowFullScreen title="결과물 미리보기" /></div>;
  };
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return frameWrap("https://www.youtube.com/embed/" + ytMatch[1], "56.25%", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture");
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return frameWrap("https://player.vimeo.com/video/" + vimeoMatch[1], "56.25%", "autoplay; fullscreen; picture-in-picture");
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch) return frameWrap("https://drive.google.com/file/d/" + driveMatch[1] + "/preview", "75%", "autoplay");
  if (/figma\.com\/(file|proto|design)\//.test(url)) return frameWrap("https://www.figma.com/embed?embed_host=share&url=" + encodeURIComponent(url), "62%", "fullscreen");
  if (/\.pdf(\?.*)?$/i.test(url)) return frameWrap("https://docs.google.com/viewer?url=" + encodeURIComponent(url) + "&embedded=true", "120%", "");
  if (/\.(mp3|wav|m4a|ogg|aac)(\?.*)?$/i.test(url)) return <audio src={url} controls style={{ width: "100%", display: "block" }} />;
  if (/\.(jpe?g|png|gif|webp|svg)(\?.*)?$/i.test(url)) return <img src={url} alt="결과물 미리보기" style={{ width: "100%", borderRadius: 12, display: "block", border: "1px solid " + t.border }} />;
  if (/\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url)) return <video src={url} controls style={{ width: "100%", borderRadius: 12, display: "block", background: "#000" }} />;
  return null;
}
function EmptyState(props) {
  const { t } = useTheme();
  const Icon = props.icon || Inbox;
  return <div style={{ textAlign: "center", padding: props.compact ? "20px 0" : "30px 0" }}><div style={{ display: "flex", justifyContent: "center", marginBottom: 8, opacity: 0.4 }}><Icon size={28} strokeWidth={1.5} /></div><div style={{ color: t.text5, fontSize: 13 }}>{props.text}</div></div>;
}
function MentionText(props) {
  const names = (props.users || []).map(function (u) { return u.name; }).filter(Boolean).sort(function (a, b) { return b.length - a.length; });
  if (names.length === 0) return <span>{props.text}</span>;
  const escaped = names.map(function (n) { return n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); });
  const pattern = new RegExp("(@(?:" + escaped.join("|") + "))", "g");
  const parts = String(props.text || "").split(pattern);
  return <span>{parts.map(function (part, i) {
    if (part.charAt(0) === "@" && names.indexOf(part.slice(1)) !== -1) return <span key={i} style={{ color: "#818cf8", fontWeight: 700 }}>{part}</span>;
    return <span key={i}>{part}</span>;
  })}</span>;
}
function getThumbnailUrl(url) {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return "https://img.youtube.com/vi/" + ytMatch[1] + "/mqdefault.jpg";
  if (/\.(jpe?g|png|gif|webp)(\?.*)?$/i.test(url)) return url;
  return null;
}
function Inp(props) {
  const { t } = useTheme();
  const { label, val, onChange, required } = props;
  const type = props.type || "text";
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>{label}{required ? " *" : ""}</div>
      <input type={type} value={val} onChange={function (e) { onChange(e.target.value); }} style={{ width: "100%", background: t.inputBg, border: "1px solid " + t.inputBorder, borderRadius: 11, padding: "9px 12px", fontSize: 13, color: t.text, boxSizing: "border-box", outline: "none" }} />
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
  const { notifications, currentUser, onMarkRead, onMarkAllRead, onClickNotif, overdueItems, onClickOverdue } = props;
  const [open, setOpen] = useState(false);
  const myNotifs = notifications.filter(function (n) { return n.toUser === currentUser.name || n.toUser === "all"; }).sort(function (a, b) { return b.createdAt - a.createdAt; });
  const isRead = function (n) { return !!(n.readBy && n.readBy[currentUser.name]); };
  const overdueList = overdueItems || [];
  const unreadCount = myNotifs.filter(function (n) { return !isRead(n); }).length + overdueList.length;
  return (
    <div style={{ position: "relative" }}>
      <button onClick={function () { setOpen(!open); }} style={{ position: "relative", background: t.surface2, border: "none", borderRadius: 20, padding: "8px 11px", cursor: "pointer", display: "flex", alignItems: "center" }}>
        <Bell size={16} strokeWidth={1.75} color={t.text3} />
        {unreadCount > 0 ? <span style={{ position: "absolute", top: -4, right: -4, background: "#f87171", color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 99, minWidth: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>{unreadCount > 9 ? "9+" : unreadCount}</span> : null}
      </button>
      {open ? (
        <div style={{ position: "fixed", inset: 0, zIndex: 90 }} onClick={function () { setOpen(false); }}>
          <div onClick={function (e) { e.stopPropagation(); }} style={{ position: "absolute", top: 54, right: "clamp(4px,3vw,24px)", width: "min(90vw, 340px)", maxHeight: 420, background: t.surface, borderRadius: 16, border: "1px solid " + t.border, boxShadow: "0 16px 48px #000a", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid " + t.border, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: t.text }}>알림 {unreadCount > 0 ? "(" + unreadCount + ")" : ""}</span>
              {myNotifs.some(function (n) { return !isRead(n); }) ? <button onClick={function () { onMarkAllRead(); }} style={{ background: "none", border: "none", color: "#818cf8", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>모두 읽음</button> : null}
            </div>
            <div style={{ overflowY: "auto", flex: 1 }}>
              {myNotifs.length === 0 && overdueList.length === 0 ? <EmptyState icon={Bell} text="알림이 없습니다" compact /> : null}
              {overdueList.map(function (item) {
                const isDeadline = item.alertType === "deadline";
                const msgTail = isDeadline ? (item.isPast ? " 마감이 지났어요" : " 마감이 임박했어요") : " 시작일이 지났어요";
                const dateLabel = isDeadline ? "마감일" : "작업 시작일";
                const dateValue = isDeadline ? item.deadline : item.due;
                return (
                  <div key={item.id} onClick={function () { onClickOverdue(item); setOpen(false); }} style={{ padding: "11px 16px", borderBottom: "1px solid " + t.border, cursor: "pointer", background: "#f8717112" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <Clock size={12} strokeWidth={2} color="#f87171" style={{ marginTop: 3, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: t.text2, lineHeight: 1.5 }}><b style={{ color: "#f87171" }}>{item.typeLabel}</b> <b style={{ color: t.text }}>{item.title}</b>{msgTail}</div>
                        <div style={{ fontSize: 10, color: t.text5, marginTop: 5 }}>{dateLabel} {dateValue}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {myNotifs.map(function (n) {
                const read = isRead(n);
                return (
                  <div key={n.id} onClick={function () { onMarkRead(n.id); onClickNotif(n); setOpen(false); }} style={{ padding: "11px 16px", borderBottom: "1px solid " + t.border, cursor: "pointer", background: read ? "transparent" : "#6366f110" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                      {!read ? <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1", marginTop: 5, flexShrink: 0 }} /> : null}
                      <div style={{ flex: 1 }}>
                        {n.kind === "ad" ? (
                          <div style={{ fontSize: 12, color: t.text2, lineHeight: 1.5 }}><b style={{ color: t.text }}>{n.fromUser}</b> 님이 <b style={{ color: "#fbbf24" }}>광고 제작 관리</b>에 새 항목을 등록했습니다</div>
                        ) : (
                          <div style={{ fontSize: 12, color: t.text2, lineHeight: 1.5 }}><b style={{ color: t.text }}>{n.fromUser}</b> 님이 <b style={{ color: "#818cf8" }}>{n.taskTitle}</b>에 코멘트를 남겼습니다</div>
                        )}
                        <div style={{ fontSize: 11, color: t.text4, marginTop: 5, background: t.bg, borderRadius: 8, padding: "6px 9px" }}>{n.text}</div>
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
  const { t, isDark } = useTheme();
  const { onLogin, users, onRegister, adminPasswordHash, onUpgradeUser, onToggleDark, onSubmitRequest } = props;
  const [showReqModal, setShowReqModal] = useState(false);
  const [reqForm, setReqForm] = useState({ requesterName: "", requesterTeam: "", title: "", desc: "", type: "영상", desiredDate: "", urgency: "중간", assignee: "" });
  const setReq = function (k, v) { setReqForm(function (f) { return Object.assign({}, f, { [k]: v }); }); };
  const REQ_TYPES = ["영상", "마케팅", "디자인", "광고", "기타"];
  const submitGuestRequest = function () {
    if (!reqForm.title.trim() || !reqForm.requesterName.trim()) return;
    onSubmitRequest(reqForm);
    setReqForm({ requesterName: "", requesterTeam: "", title: "", desc: "", type: "영상", desiredDate: "", urgency: "중간", assignee: "" });
    setShowReqModal(false);
    alert("요청이 접수됐어요. 담당팀에서 확인 후 처리할게요!");
  };
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", password: "", dept: "", rank: "", position: "", officePhone: "", mobile: "" });
  const [err, setErr] = useState("");
  const set = function (k, v) { setForm(function (f) { return Object.assign({}, f, { [k]: v }); }); };
  const LOGIN_MAX_ATTEMPTS = 5;
  const LOGIN_LOCKOUT_MINUTES = 5;
  const getAttemptState = function () {
    const raw = getCookie("timbel_login_attempts");
    if (!raw) return {};
    try { return JSON.parse(raw); } catch (e) { return {}; }
  };
  const saveAttemptState = function (state) { setCookie("timbel_login_attempts", JSON.stringify(state), 1); };
  const handleLogin = async function () {
    const attempts = getAttemptState();
    const rec = attempts[form.name] || { count: 0, lockUntil: 0 };
    if (rec.lockUntil && Date.now() < rec.lockUntil) {
      const remainMin = Math.ceil((rec.lockUntil - Date.now()) / 60000);
      setErr("로그인 시도가 너무 많아요. " + remainMin + "분 후 다시 시도해주세요.");
      return;
    }
    const hashed = await hashPassword(form.password);
    let success = false;
    let pendingApproval = false;
    let resolvedUser = null;
    if (form.name === "admin") {
      success = hashed === adminPasswordHash;
    } else {
      let u = users.find(function (u) { return u.name === form.name && u.password === hashed; });
      if (!u) {
        const legacy = users.find(function (u) { return u.name === form.name && u.password === form.password; });
        if (legacy) { u = Object.assign({}, legacy, { password: hashed }); if (onUpgradeUser) onUpgradeUser(u); }
      }
      if (u && u.approved) { success = true; resolvedUser = u; }
      else if (u && !u.approved) pendingApproval = true;
    }
    if (pendingApproval) { setErr("관리자 승인 대기 중입니다."); return; }
    if (success) {
      delete attempts[form.name];
      saveAttemptState(attempts);
      setErr("");
      if (form.name === "admin") onLogin(Object.assign({}, ADMIN_USER, { password: adminPasswordHash }));
      else onLogin(resolvedUser);
      return;
    }
    rec.count = (rec.count || 0) + 1;
    if (rec.count >= LOGIN_MAX_ATTEMPTS) {
      rec.lockUntil = Date.now() + LOGIN_LOCKOUT_MINUTES * 60000;
      rec.count = 0;
      attempts[form.name] = rec;
      saveAttemptState(attempts);
      setErr("로그인 시도가 너무 많아요. " + LOGIN_LOCKOUT_MINUTES + "분 후 다시 시도해주세요.");
      return;
    }
    attempts[form.name] = rec;
    saveAttemptState(attempts);
    setErr("이름 또는 비밀번호가 올바르지 않습니다. (남은 시도 " + (LOGIN_MAX_ATTEMPTS - rec.count) + "회)");
  };
  const handleRegister = async function () {
    if (!form.name || !form.password || !form.dept || !form.rank || !form.position || !form.mobile) { setErr("필수 항목을 모두 입력해주세요."); return; }
    if (form.name === "admin") { setErr("사용할 수 없는 이름입니다."); return; }
    if (users.find(function (u) { return u.name === form.name; })) { setErr("이미 존재하는 이름입니다."); return; }
    const hashed = await hashPassword(form.password);
    const newUser = { id: "user_" + Date.now(), name: form.name, password: hashed, dept: form.dept, rank: form.rank, position: form.position, officePhone: form.officePhone, mobile: form.mobile, role: "viewer", approved: false };
    await onRegister(newUser);
    setErr(""); setMode("login"); setForm({ name: "", password: "", dept: "", rank: "", position: "", officePhone: "", mobile: "" });
    alert("가입 신청 완료! 관리자 승인 후 로그인 가능합니다.");
  };
  const inpStyle = { width: "100%", background: t.inputBg, border: "1px solid " + t.inputBorder, borderRadius: 12, padding: "10px 14px", fontSize: 13, color: t.text, boxSizing: "border-box", outline: "none", marginBottom: 10 };
  return (
    <div style={{ minHeight: "100vh", background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", position: "relative" }}>
      {onToggleDark ? (
        <div style={{ position: "absolute", top: 20, right: 20, display: "flex", alignItems: "center", background: t.surface2, borderRadius: 10, padding: 3, gap: 2 }}>
          <button onClick={function () { onToggleDark(false); }} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: !isDark ? "#fff" : "transparent", color: !isDark ? "#1e293b" : t.text4, fontWeight: !isDark ? 700 : 500, fontSize: 12 }}>일반</button>
          <button onClick={function () { onToggleDark(true); }} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: isDark ? "#1e293b" : "transparent", color: isDark ? "#818cf8" : t.text4, fontWeight: isDark ? 700 : 500, fontSize: 12 }}>다크</button>
        </div>
      ) : null}
      <div style={{ width: 390, background: t.surface, borderRadius: 20, padding: "32px 32px 28px", border: "1px solid " + t.border, boxShadow: "0 24px 64px #0006" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: "#818cf8", letterSpacing: "2px", marginBottom: 4 }}>TIMBEL</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: t.text }}>업무 스케줄러</div>
          <div style={{ fontSize: 11, color: "#34d399", marginTop: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399" }} />실시간 동기화
          </div>
        </div>
        <div style={{ display: "flex", background: t.bg, borderRadius: 12, padding: 3, marginBottom: 20, border: "1px solid " + t.border }}>
          {[["login", "로그인"], ["register", "회원가입"]].map(function (item) {
            return <button key={item[0]} onClick={function () { setMode(item[0]); setErr(""); }} style={{ flex: 1, padding: "8px 0", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: mode === item[0] ? 700 : 500, fontSize: 13, background: mode === item[0] ? "#6366f1" : "transparent", color: mode === item[0] ? "#fff" : t.text4 }}>{item[1]}</button>;
          })}
        </div>
        {mode === "login" ? (
          <div>
            <input placeholder="이름 (아이디)" value={form.name} onChange={function (e) { set("name", e.target.value); }} style={inpStyle} />
            <input placeholder="비밀번호" type="password" value={form.password} onChange={function (e) { set("password", e.target.value); }} onKeyDown={function (e) { if (e.key === "Enter") handleLogin(); }} style={inpStyle} />
            {err ? <div style={{ fontSize: 12, color: "#f87171", marginBottom: 10, textAlign: "center" }}>{err}</div> : null}
            <button onClick={handleLogin} style={{ width: "100%", background: "#6366f1", border: "none", borderRadius: 12, padding: "11px 0", fontWeight: 700, fontSize: 14, color: "#fff", cursor: "pointer" }}>로그인</button>
            {adminPasswordHash === DEFAULT_ADMIN_PASSWORD_HASH ? <div style={{ textAlign: "center", marginTop: 12, fontSize: 11, color: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}><AlertTriangle size={11} strokeWidth={2} /> 관리자 기본 계정: admin / admin1234 — 로그인 후 반드시 비밀번호를 변경하세요</div> : null}
          </div>
        ) : (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 10px" }}>
              {[["이름 (아이디) *", "name"], ["부서명 *", "dept"], ["직급 *", "rank"], ["포지션 *", "position"], ["회사 전화번호", "officePhone"], ["핸드폰 번호 *", "mobile"]].map(function (item, i) {
                return <div key={item[1]} style={{ gridColumn: i === 0 ? "1/-1" : "auto" }}><input placeholder={item[0]} value={form[item[1]]} onChange={function (e) { set(item[1], e.target.value); }} style={Object.assign({}, inpStyle, { marginBottom: 9 })} /></div>;
              })}
            </div>
            <input placeholder="비밀번호 *" type="password" value={form.password} onChange={function (e) { set("password", e.target.value); }} style={inpStyle} />
            <div style={{ fontSize: 11, color: t.text5, marginBottom: 10 }}>* 이름이 아이디로 사용됩니다. 가입 후 관리자 승인이 필요합니다.</div>
            {err ? <div style={{ fontSize: 12, color: "#f87171", marginBottom: 10, textAlign: "center" }}>{err}</div> : null}
            <button onClick={handleRegister} style={{ width: "100%", background: "#6366f1", border: "none", borderRadius: 12, padding: "11px 0", fontWeight: 700, fontSize: 14, color: "#fff", cursor: "pointer" }}>가입 신청</button>
          </div>
        )}
        {onSubmitRequest ? (
          <div style={{ textAlign: "center", marginTop: 18, paddingTop: 16, borderTop: "1px solid " + t.border }}>
            <button onClick={function () { setShowReqModal(true); }} style={{ background: "none", border: "none", color: t.text3, fontSize: 12, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5 }}><Inbox size={13} strokeWidth={2} /> 로그인 없이 업무 요청하기</button>
          </div>
        ) : null}
      </div>
      {showReqModal ? (
        <div onClick={function () { setShowReqModal(false); }} style={{ position: "fixed", inset: 0, background: "#00000099", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={function (e) { e.stopPropagation(); }} style={{ width: "min(92vw, 440px)", maxHeight: "88vh", overflowY: "auto", background: t.surface, borderRadius: 20, padding: "26px 26px 22px", border: "1px solid " + t.border, boxShadow: "0 24px 64px #0006" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: t.text, marginBottom: 4 }}>업무 요청하기</div>
            <div style={{ fontSize: 12, color: t.text4, marginBottom: 18 }}>로그인 없이도 영상·마케팅·디자인·광고 제작을 요청할 수 있어요.</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <div><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>이름 *</div><input value={reqForm.requesterName} onChange={function (e) { setReq("requesterName", e.target.value); }} style={inpStyle} /></div>
              <div><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>소속(팀)</div><input value={reqForm.requesterTeam} onChange={function (e) { setReq("requesterTeam", e.target.value); }} style={inpStyle} /></div>
            </div>
            <div style={{ marginBottom: 10 }}><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>요청 제목 *</div><input value={reqForm.title} onChange={function (e) { setReq("title", e.target.value); }} style={inpStyle} /></div>
            <div style={{ marginBottom: 10 }}><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>상세 내용</div><input value={reqForm.desc} onChange={function (e) { setReq("desc", e.target.value); }} style={inpStyle} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
              <div><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>종류</div><select value={reqForm.type} onChange={function (e) { setReq("type", e.target.value); }} style={Object.assign({}, inpStyle, { cursor: "pointer" })}>{REQ_TYPES.map(function (r) { return <option key={r}>{r}</option>; })}</select></div>
              <div><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>희망일</div><input type="date" value={reqForm.desiredDate} onChange={function (e) { setReq("desiredDate", e.target.value); }} style={inpStyle} /></div>
              <div><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>긴급도</div><select value={reqForm.urgency} onChange={function (e) { setReq("urgency", e.target.value); }} style={Object.assign({}, inpStyle, { cursor: "pointer" })}>{["낮음", "중간", "높음"].map(function (u) { return <option key={u}>{u}</option>; })}</select></div>
            </div>
            <div style={{ marginBottom: 6 }}><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>담당자 지정 (선택, 그 담당자에게도 알림이 가요)</div><select value={reqForm.assignee} onChange={function (e) { setReq("assignee", e.target.value); }} style={Object.assign({}, inpStyle, { cursor: "pointer" })}><option value="">지정 안 함 (관리자에게만 전달)</option>{users.filter(function (u) { return u.approved && u.role !== "admin"; }).map(function (u) { return <option key={u.name} value={u.name}>{u.name}</option>; })}</select></div>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button onClick={function () { setShowReqModal(false); }} style={{ flex: 1, background: t.surface2, border: "none", borderRadius: 12, padding: "10px 0", color: t.text3, fontWeight: 600, cursor: "pointer" }}>취소</button>
              <button onClick={submitGuestRequest} style={{ flex: 1, background: "#6366f1", border: "none", borderRadius: 12, padding: "10px 0", color: "#fff", fontWeight: 700, cursor: "pointer" }}>요청 제출</button>
            </div>
          </div>
        </div>
      ) : null}
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
  const savePw = async function () {
    const hashedCurrent = await hashPassword(pw.current);
    const matches = hashedCurrent === currentUser.password || pw.current === currentUser.password;
    if (!matches) { setErr("현재 비밀번호가 틀렸습니다."); return; }
    if (!pw.next || pw.next.length < 4) { setErr("4자 이상 입력해주세요."); return; }
    if (pw.next !== pw.confirm) { setErr("비밀번호가 일치하지 않습니다."); return; }
    const hashedNext = await hashPassword(pw.next);
    onUpdate(Object.assign({}, currentUser, { password: hashedNext })); setErr(""); setOk("변경되었습니다."); setPw({ current: "", next: "", confirm: "" });
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000099", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
      <div style={{ background: t.surface, borderRadius: 20, width: "min(92vw, 420px)", boxShadow: "0 24px 64px #000c", overflow: "hidden" }}>
        <div style={{ background: "linear-gradient(135deg,#6366f1,#ec4899)", padding: "22px 24px 18px", position: "relative" }}>
          <button onClick={onClose} style={{ position: "absolute", top: 14, right: 16, background: "none", border: "none", color: "#ffffff88", cursor: "pointer", fontSize: 20 }}>×</button>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#6366f1", border: "3px solid #ffffff44", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: "#fff" }}>{currentUser.name[0]}</div>
            <div><div style={{ fontSize: 17, fontWeight: 800, color: "#fff" }}>{currentUser.name}</div><div style={{ fontSize: 11, color: "#ffffff88", marginTop: 2 }}>{currentUser.dept} · {currentUser.rank}</div></div>
          </div>
        </div>
        <div style={{ display: "flex", borderBottom: "1px solid " + t.border }}>
          {[["info", User, "개인정보"], ["password", Lock, "비밀번호"]].map(function (item) {
            const PTabIcon = item[1];
            return <button key={item[0]} onClick={function () { setPTab(item[0]); setErr(""); setOk(""); }} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "10px 0", background: "none", border: "none", borderBottom: pTab === item[0] ? "2px solid #6366f1" : "2px solid transparent", cursor: "pointer", fontWeight: pTab === item[0] ? 700 : 500, fontSize: 13, color: pTab === item[0] ? "#818cf8" : t.text4 }}><PTabIcon size={13} strokeWidth={2} /> {item[2]}</button>;
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
              {ok ? <div style={{ fontSize: 12, color: "#34d399", marginBottom: 10, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}><Check size={12} strokeWidth={2.5} /> {ok}</div> : null}
              <button onClick={saveInfo} style={{ width: "100%", background: "#6366f1", border: "none", borderRadius: 12, padding: "11px 0", fontWeight: 700, fontSize: 14, color: "#fff", cursor: "pointer" }}>저장하기</button>
            </div>
          ) : (
            <div>
              <Inp label="현재 비밀번호" val={pw.current} onChange={function (v) { setPw(function (p) { return Object.assign({}, p, { current: v }); }); }} type="password" />
              <Inp label="새 비밀번호 (4자 이상)" val={pw.next} onChange={function (v) { setPw(function (p) { return Object.assign({}, p, { next: v }); }); }} type="password" />
              <Inp label="새 비밀번호 확인" val={pw.confirm} onChange={function (v) { setPw(function (p) { return Object.assign({}, p, { confirm: v }); }); }} type="password" />
              {err ? <div style={{ fontSize: 12, color: "#f87171", marginBottom: 10, textAlign: "center" }}>{err}</div> : null}
              {ok ? <div style={{ fontSize: 12, color: "#34d399", marginBottom: 10, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}><Check size={12} strokeWidth={2.5} /> {ok}</div> : null}
              <button onClick={savePw} style={{ width: "100%", background: "#6366f1", border: "none", borderRadius: 12, padding: "11px 0", fontWeight: 700, fontSize: 14, color: "#fff", cursor: "pointer" }}>비밀번호 변경</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminPanel(props) {
  const { t } = useTheme();
  const { users, onUpdateUsers, notices, onUpdateNotices, rolePermissions, setRolePermissions, tasks, onUpdateTasks, staleDays, setStaleDays, wipLimits, setWipLimits } = props;
  const [aTab, setATab] = useState("users");
  const [noticeForm, setNoticeForm] = useState({ title: "", content: "", active: true });
  const [editNotice, setEditNotice] = useState(null);
  const pending = users.filter(function (u) { return !u.approved && u.role !== "admin"; });
  const members = users.filter(function (u) { return u.role !== "admin"; });
  const approve = function (id) { onUpdateUsers(users.map(function (u) { return u.id === id ? Object.assign({}, u, { approved: true }) : u; })); };
  const reject = function (id) { onUpdateUsers(users.filter(function (u) { return u.id !== id; })); };
  const toggleRole = function (id) { onUpdateUsers(users.map(function (u) { if (u.id !== id) return u; const cur = ROLE_ORDER.indexOf(u.role); return Object.assign({}, u, { role: ROLE_ORDER[(cur + 1) % ROLE_ORDER.length] }); })); };
  const deleteUser = function (id) { onUpdateUsers(users.filter(function (u) { return u.id !== id; })); };
  const resetPassword = async function (id, name) {
    if (!window.confirm(name + " 님의 비밀번호를 임시 비밀번호(1234)로 초기화할까요?")) return;
    const hashed = await hashPassword("1234");
    onUpdateUsers(users.map(function (u) { return u.id === id ? Object.assign({}, u, { password: hashed }) : u; }));
    alert(name + " 님의 비밀번호가 1234로 초기화되었습니다. 본인에게 안내하고 로그인 후 바로 변경하도록 해주세요.");
  };
  const addNotice = function () {
    if (!noticeForm.title || !noticeForm.content) return;
    if (editNotice) { onUpdateNotices(notices.map(function (n) { return n.id === editNotice ? Object.assign({}, n, noticeForm) : n; })); setEditNotice(null); }
    else onUpdateNotices([].concat(notices, [{ id: "notice_" + Date.now(), title: noticeForm.title, content: noticeForm.content, active: noticeForm.active }]));
    setNoticeForm({ title: "", content: "", active: true });
  };
  const aTabStyle = function (v) { return { padding: "8px 16px", background: "none", border: "none", borderBottom: aTab === v ? "2px solid #f87171" : "2px solid transparent", cursor: "pointer", fontWeight: aTab === v ? 700 : 500, fontSize: 13, color: aTab === v ? "#f87171" : t.text4, marginBottom: -1 }; };
  const s = { background: t.surface, borderRadius: 15, border: "1px solid " + t.border, overflow: "hidden", marginBottom: 14 };
  return (
    <div>
      <div style={{ background: "linear-gradient(135deg,#7f1d1d,#991b1b)", borderRadius: 14, padding: "14px 20px", marginBottom: 18, display: "flex", alignItems: "center", gap: 10 }}>
        <Shield size={19} strokeWidth={1.75} color="#fff" />
        <div><div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>관리자 대시보드</div><div style={{ fontSize: 11, color: "#fca5a5" }}>시스템 전체 설정 및 사용자 관리</div></div>
        {pending.length > 0 ? <div style={{ marginLeft: "auto", background: "#f87171", borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700, color: "#fff" }}>승인 대기 {pending.length}명</div> : null}
      </div>
      <div style={{ display: "flex", gap: 2, marginBottom: 20, borderBottom: "1px solid " + t.border }}>
        {[["users", Users, "회원 관리"], ["notices", Megaphone, "공지사항"], ["tabs", Folder, "탭 설정"], ["automation", Zap, "자동화 설정"], ["schedule", ClipboardList, "스케줄 조율"]].map(function (item) {
          const TabIcon = item[1];
          return <button key={item[0]} onClick={function () { setATab(item[0]); }} style={Object.assign({}, aTabStyle(item[0]), { display: "inline-flex", alignItems: "center", gap: 6 })}><TabIcon size={14} strokeWidth={2} />{item[2]}</button>;
        })}
      </div>
      {aTab === "users" ? (
        <div>
          {pending.length > 0 ? (
            <div style={Object.assign({}, s, { border: "1px solid #f8717140" })}>
              <div style={{ padding: "11px 16px", borderBottom: "1px solid " + t.border, fontSize: 12, fontWeight: 700, color: "#f87171", background: "#f8717110", display: "flex", alignItems: "center", gap: 6 }}><Clock size={13} strokeWidth={2} /> 승인 대기 ({pending.length})</div>
              {pending.map(function (u) {
                return (
                  <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid " + t.border }}>
                    <Avatar name={u.name} size={36} users={users} />
                    <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{u.name}</div><div style={{ fontSize: 11, color: t.text4 }}>{u.dept} · {u.rank} / {u.position}</div></div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={function () { approve(u.id); }} style={{ display: "flex", alignItems: "center", gap: 4, background: "#34d399", border: "none", borderRadius: 10, padding: "6px 14px", fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer" }}><Check size={12} strokeWidth={2.5} /> 승인</button>
                      <button onClick={function () { reject(u.id); }} style={{ display: "flex", alignItems: "center", gap: 4, background: "#f87171", border: "none", borderRadius: 10, padding: "6px 14px", fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer" }}><X size={12} strokeWidth={2.5} /> 거절</button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
          <div style={s}>
            <div style={{ padding: "11px 16px", borderBottom: "1px solid " + t.border, fontSize: 12, fontWeight: 700, color: t.text4, textTransform: "uppercase", letterSpacing: ".5px" }}>전체 회원 ({members.length})</div>
            {members.length === 0 ? <EmptyState icon={Users} text="등록된 회원이 없습니다" /> : null}
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
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button onClick={function () { toggleRole(u.id); }} style={{ background: t.surface2, border: "none", borderRadius: 10, padding: "5px 10px", fontSize: 11, color: t.text3, cursor: "pointer" }}>{ROLE_LABEL[ROLE_ORDER[(ROLE_ORDER.indexOf(u.role) + 1) % ROLE_ORDER.length]]}로 변경</button>
                    <button onClick={function () { resetPassword(u.id, u.name); }} style={{ display: "flex", alignItems: "center", gap: 4, background: "#fbbf2420", border: "1px solid #fbbf2440", borderRadius: 10, padding: "5px 10px", fontSize: 11, color: "#fbbf24", cursor: "pointer" }}><Key size={11} strokeWidth={2} /> 비밀번호 초기화</button>
                    <button onClick={function () { deleteUser(u.id); }} style={{ background: "#f8717120", border: "1px solid #f8717140", borderRadius: 10, padding: "5px 10px", fontSize: 11, color: "#f87171", cursor: "pointer" }}>삭제</button>
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
            <div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>{editNotice ? <Pencil size={14} strokeWidth={2} /> : <Plus size={14} strokeWidth={2} />}{editNotice ? "공지 수정" : "새 공지 등록"}</div>
            <Inp label="제목" val={noticeForm.title} onChange={function (v) { setNoticeForm(function (f) { return Object.assign({}, f, { title: v }); }); }} required />
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>내용 *</div>
              <textarea value={noticeForm.content} onChange={function (e) { setNoticeForm(function (f) { return Object.assign({}, f, { content: e.target.value }); }); }} style={{ width: "100%", background: t.inputBg, border: "1px solid " + t.inputBorder, borderRadius: 11, padding: "9px 12px", fontSize: 13, color: t.text, boxSizing: "border-box", outline: "none", minHeight: 72, resize: "vertical" }} />
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13, color: t.text3, marginBottom: 14 }}>
              <input type="checkbox" checked={noticeForm.active} onChange={function (e) { setNoticeForm(function (f) { return Object.assign({}, f, { active: e.target.checked }); }); }} style={{ accentColor: "#6366f1", width: 15, height: 15 }} /> 즉시 공개
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {editNotice ? <button onClick={function () { setEditNotice(null); setNoticeForm({ title: "", content: "", active: true }); }} style={{ flex: 1, background: t.surface2, border: "none", borderRadius: 11, padding: "9px 0", cursor: "pointer", color: t.text3, fontWeight: 600 }}>취소</button> : null}
              <button onClick={addNotice} style={{ flex: 1, background: "#6366f1", border: "none", borderRadius: 11, padding: "9px 0", cursor: "pointer", color: "#fff", fontWeight: 700 }}>{editNotice ? "수정 완료" : "공지 등록"}</button>
            </div>
          </div>
          <div style={s}>
            <div style={{ padding: "11px 16px", borderBottom: "1px solid " + t.border, fontSize: 12, fontWeight: 700, color: t.text4, textTransform: "uppercase", letterSpacing: ".5px" }}>등록된 공지 ({notices.length})</div>
            {notices.length === 0 ? <EmptyState icon={Megaphone} text="등록된 공지가 없습니다" /> : null}
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
                    <button onClick={function () { onUpdateNotices(notices.map(function (x) { return x.id === n.id ? Object.assign({}, x, { active: !x.active }) : x; })); }} style={{ background: t.surface2, border: "none", borderRadius: 8, padding: "4px 10px", fontSize: 11, color: t.text3, cursor: "pointer" }}>{n.active ? "숨기기" : "공개"}</button>
                    <button onClick={function () { setEditNotice(n.id); setNoticeForm({ title: n.title, content: n.content, active: n.active }); }} style={{ background: "#6366f120", border: "1px solid #6366f140", borderRadius: 8, padding: "4px 10px", fontSize: 11, color: "#818cf8", cursor: "pointer" }}>수정</button>
                    <button onClick={function () { onUpdateNotices(notices.filter(function (x) { return x.id !== n.id; })); }} style={{ background: "#f8717120", border: "1px solid #f8717140", borderRadius: 8, padding: "4px 10px", fontSize: 11, color: "#f87171", cursor: "pointer" }}>삭제</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
      {aTab === "tabs" ? (
        <div style={s}>
          <div style={{ padding: "11px 16px", borderBottom: "1px solid " + t.border, fontSize: 12, fontWeight: 700, color: t.text4, textTransform: "uppercase", letterSpacing: ".5px" }}>역할별 탭 메뉴 표시 설정</div>
          <div style={{ padding: "10px 16px", fontSize: 11, color: t.text4, borderBottom: "1px solid " + t.border }}>역할마다 어떤 탭을 볼 수 있는지 자유롭게 켜고 끌 수 있어요. (예: 뷰어는 통계 끄기)</div>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 0.9fr 0.9fr 0.9fr", padding: "10px 16px", borderBottom: "1px solid " + t.border, fontSize: 11, fontWeight: 700, color: t.text4 }}>
            <div>탭</div><div style={{ textAlign: "center" }}>뷰어</div><div style={{ textAlign: "center" }}>팀원</div><div style={{ textAlign: "center" }}>매니저</div>
          </div>
          {ALL_TABS.map(function (tab) {
            return (
              <div key={tab.id} style={{ display: "grid", gridTemplateColumns: "1.4fr 0.9fr 0.9fr 0.9fr", alignItems: "center", padding: "11px 16px", borderBottom: "1px solid " + t.border }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: t.text, fontWeight: 500 }}><tab.icon size={15} strokeWidth={1.75} />{tab.text}</div>
                {["viewer", "member", "manager"].map(function (role) {
                  const list = rolePermissions[role] || [];
                  const active = list.includes(tab.id);
                  return (
                    <div key={role} style={{ display: "flex", justifyContent: "center" }}>
                      <div onClick={function () { const next = active ? list.filter(function (v) { return v !== tab.id; }) : list.concat([tab.id]); setRolePermissions(Object.assign({}, rolePermissions, { [role]: next })); }} style={{ width: 40, height: 22, borderRadius: 99, background: active ? "#6366f1" : t.surface2, border: "1px solid " + (active ? "#6366f1" : t.border), cursor: "pointer", position: "relative" }}>
                        <div style={{ position: "absolute", top: 2, left: active ? 20 : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
          <div style={{ padding: "12px 16px", fontSize: 11, color: t.text4 }}>※ 관리자는 모든 탭에 항상 접근 가능합니다.</div>
        </div>
      ) : null}
      {aTab === "automation" ? (
        <div style={s}>
          <div style={{ padding: "11px 16px", borderBottom: "1px solid " + t.border, fontSize: 12, fontWeight: 700, color: t.text4, textTransform: "uppercase", letterSpacing: ".5px" }}>자동화 설정</div>
          <div style={{ padding: "16px", borderBottom: "1px solid " + t.border }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 4 }}>정체 업무 알림 기준</div>
            <div style={{ fontSize: 11, color: t.text4, marginBottom: 10 }}>같은 단계에서 이 일수 이상 변화가 없으면 홈 화면에 "정체된 업무"로 표시돼요.</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="number" min="1" value={staleDays} onChange={function (e) { setStaleDays(Number(e.target.value) || 1); }} style={{ width: 90, background: t.inputBg, border: "1px solid " + t.inputBorder, borderRadius: 9, padding: "7px 10px", fontSize: 13, color: t.text, outline: "none" }} />
              <span style={{ fontSize: 12, color: t.text4 }}>일 이상</span>
            </div>
          </div>
          <div style={{ padding: "16px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 4 }}>제작 보드 단계별 인원 제한 (WIP)</div>
            <div style={{ fontSize: 11, color: t.text4, marginBottom: 10 }}>단계에 업무가 몰리는 걸 막기 위한 제한이에요. 비워두면 제한이 없어요.</div>
            {STAGES.map(function (stg) {
              return (
                <div key={stg} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: t.text3, width: 90 }}>{stg}</span>
                  <input type="number" min="0" placeholder="제한 없음" value={wipLimits && wipLimits[stg] ? wipLimits[stg] : ""} onChange={function (e) { const v = Number(e.target.value); const next = Object.assign({}, wipLimits); if (v > 0) next[stg] = v; else delete next[stg]; setWipLimits(next); }} style={{ width: 110, background: t.inputBg, border: "1px solid " + t.inputBorder, borderRadius: 9, padding: "6px 10px", fontSize: 12, color: t.text, outline: "none" }} />
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
      {aTab === "schedule" ? (
        <div style={s}>
          <div style={{ padding: "11px 16px", borderBottom: "1px solid " + t.border, fontSize: 12, fontWeight: 700, color: t.text4, textTransform: "uppercase", letterSpacing: ".5px" }}>전체 스케줄 조율 ({tasks.length}개)</div>
          {tasks.length === 0 ? <EmptyState icon={Calendar} text="등록된 스케줄이 없습니다" /> : null}
          {tasks.map(function (tk) {
            return (
              <div key={tk.id} style={{ padding: "12px 16px", borderBottom: "1px solid " + t.border, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 3, height: 36, borderRadius: 99, background: STAGE_COLOR[tk.status], flexShrink: 0 }} />
                <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{tk.title}</div><div style={{ fontSize: 11, color: t.text4, marginTop: 2 }}>{tk.assignee} · {tk.tag} · 마감 {tk.due}</div></div>
                <select value={tk.assignee} onChange={function (e) { onUpdateTasks(tasks.map(function (t2) { return t2.id === tk.id ? Object.assign({}, t2, { assignee: e.target.value }) : t2; })); }} style={{ background: t.inputBg, border: "1px solid " + t.inputBorder, borderRadius: 10, padding: "5px 9px", fontSize: 12, color: t.text, outline: "none" }}>
                  {users.filter(function (u) { return u.role !== "admin" && u.approved; }).map(function (u) { return <option key={u.name}>{u.name}</option>; })}
                </select>
                <select value={tk.status} onChange={function (e) { onUpdateTasks(tasks.map(function (t2) { return t2.id === tk.id ? Object.assign({}, t2, { status: e.target.value }) : t2; })); }} style={{ background: STAGE_COLOR[tk.status] + "20", border: "1px solid " + (STAGE_COLOR[tk.status] + "40"), color: STAGE_COLOR[tk.status], borderRadius: 10, padding: "5px 9px", fontSize: 12, outline: "none", fontWeight: 700 }}>
                  {STAGES.map(function (s) { return <option key={s}>{s}</option>; })}
                </select>
                <input type="date" value={tk.due} onChange={function (e) { onUpdateTasks(tasks.map(function (t2) { return t2.id === tk.id ? Object.assign({}, t2, { due: e.target.value }) : t2; })); }} style={{ background: t.inputBg, border: "1px solid " + t.inputBorder, borderRadius: 10, padding: "5px 9px", fontSize: 12, color: t.text, outline: "none" }} />
                <button onClick={function () { onUpdateTasks(tasks.filter(function (t2) { return t2.id !== tk.id; })); }} style={{ background: "#f8717120", border: "1px solid #f8717140", borderRadius: 8, padding: "5px 10px", fontSize: 11, color: "#f87171", cursor: "pointer" }}>삭제</button>
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
  const doneStatus = props.doneStatus || "업무 완료";
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
      <div style={{ background: "#fff", borderRadius: 20, width: "min(92vw, 600px)", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 64px #0004" }}>
        <div style={{ background: "linear-gradient(135deg,#1e293b,#0f172a)", padding: "26px 30px 22px", borderRadius: "20px 20px 0 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>TIMBEL {sourceLabel} 업무 보고</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#f8fafc" }}>{title}</div>
              <div style={{ fontSize: 12, color: "#475569", marginTop: 5 }}>보고일: {reportDate} | 보고자: {currentUser && currentUser.name} ({currentUser && currentUser.rank} / {currentUser && currentUser.position})</div>
            </div>
            <button onClick={onClose} style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 10, padding: "6px 12px", color: "#94a3b8", cursor: "pointer", fontSize: 12 }}>닫기</button>
          </div>
        </div>
        <div style={{ padding: "22px 28px 28px" }}>
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", borderLeft: "3px solid #6366f1", paddingLeft: 10, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><BarChart3 size={13} strokeWidth={2} /> 종합 현황</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))", gap: 10 }}>
              {[["전체 " + sourceLabel, total, "#6366f1"], [doneStatus, done, "#22c55e"], ["진행 중", total - done, "#f59e0b"], ["완료율", rate + "%", "#3b82f6"]].map(function (item) {
                return <div key={item[0]} style={{ background: "#f8fafc", borderRadius: 12, padding: "12px 0", textAlign: "center", border: "1px solid #e2e8f0" }}><div style={{ fontSize: 22, fontWeight: 800, color: item[2] }}>{item[1]}</div><div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{item[0]}</div></div>;
              })}
            </div>
          </div>
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", borderLeft: "3px solid #fb923c", paddingLeft: 10, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><Film size={13} strokeWidth={2} /> 단계별 현황</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead><tr style={{ background: "#f8fafc" }}>{["단계", sourceLabel + " 수", "비율"].map(function (h) { return <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", borderBottom: "1px solid #e2e8f0" }}>{h}</th>; })}</tr></thead>
              <tbody>
                {byStage.filter(function (x) { return x.count > 0; }).map(function (item) {
                  const StageIcon = stageIconMap[item.s];
                  return (
                    <tr key={item.s}>
                      <td style={{ padding: "8px 12px", color: "#1e293b", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 6 }}><StageIcon size={13} strokeWidth={1.75} /> {item.s}</td>
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
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", borderLeft: "3px solid #38bdf8", paddingLeft: 10, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><Tag size={13} strokeWidth={2} /> 카테고리별</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{byTag.map(function (item) { return <div key={item.tag} style={{ background: (tagColorMap[item.tag] || "#818cf8") + "15", border: "1px solid " + ((tagColorMap[item.tag] || "#818cf8") + "30"), borderRadius: 12, padding: "8px 16px", textAlign: "center" }}><div style={{ fontSize: 18, fontWeight: 800, color: tagColorMap[item.tag] || "#818cf8" }}>{item.count}</div><div style={{ fontSize: 11, color: "#64748b" }}>{item.tag}</div></div>; })}</div>
            </div>
          ) : null}
          {byMember.length > 0 ? (
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", borderLeft: "3px solid #c084fc", paddingLeft: 10, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><Users size={13} strokeWidth={2} /> 담당자별 성과</div>
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
          <div style={{ marginTop: 24, paddingTop: 14, borderTop: "1px solid #e2e8f0", fontSize: 11, color: "#94a3b8", textAlign: "center" }}>TIMBEL 업무 스케줄러 자동 생성 | {reportDate}</div>
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
        {sliceList.map(function (s, i) { return <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 10, height: 10, borderRadius: 4, background: s.color, flexShrink: 0 }} /><span style={{ fontSize: 12, color: t.text2, flex: 1 }}>{s.label}</span><span style={{ fontSize: 11, color: t.text4 }}>{s.count}개 · {s.pct}%</span></div>; })}
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
  const isVideoWork = function (tk) { return !tk.category || VIDEO_WORK_CATEGORIES.indexOf(tk.category) !== -1; };
  const videoTasks = (props.videoTasks || []).filter(isVideoWork);
  const marketingTasks = props.marketingTasks || [];
  const designTasks = props.designTasks || [];
  const SOURCES = {
    video: { label: "영상", tasks: videoTasks, stages: STAGES, stageColor: STAGE_COLOR, stageIcon: STAGE_ICON, tags: TAGS, tagColor: TAG_COLOR, doneStatus: "업무 완료", accent: "#818cf8" },
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
  const s = { background: t.surface, borderRadius: 15, padding: "15px 17px", border: "1px solid " + t.border };
  const modeBtn = function (v) { return { padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: mode === v ? 700 : 500, background: mode === v ? "#6366f1" : t.surface2, color: mode === v ? "#fff" : t.text4 }; };
  const sourceBtn = function (v, accent) { return { padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: source === v ? 700 : 500, background: source === v ? accent : t.surface2, color: source === v ? "#fff" : t.text4 }; };
  const sourceTabs = (
    <div style={{ display: "flex", gap: 4, background: t.bg, borderRadius: 11, padding: 3, border: "1px solid " + t.border, flexWrap: "wrap" }}>
      <button style={sourceBtn("all", "#6366f1")} onClick={function () { setSource("all"); }}>전체</button>
      <button style={Object.assign({}, sourceBtn("video", "#818cf8"), { display: "inline-flex", alignItems: "center", gap: 5 })} onClick={function () { setSource("video"); }}><Film size={12} strokeWidth={2} /> 영상</button>
      <button style={Object.assign({}, sourceBtn("marketing", "#fbbf24"), { display: "inline-flex", alignItems: "center", gap: 5 })} onClick={function () { setSource("marketing"); }}><CalendarDays size={12} strokeWidth={2} /> 마케팅</button>
      <button style={Object.assign({}, sourceBtn("design", "#f87171"), { display: "inline-flex", alignItems: "center", gap: 5 })} onClick={function () { setSource("design"); }}><Palette size={12} strokeWidth={2} /> 디자인</button>
    </div>
  );
  const periodTabs = (
    <div style={{ display: "flex", gap: 4, background: t.bg, borderRadius: 11, padding: 3, border: "1px solid " + t.border }}>
      <button style={modeBtn("all")} onClick={function () { setMode("all"); }}>전체</button>
      <button style={modeBtn("year")} onClick={function () { setMode("year"); }}>연별</button>
      <button style={modeBtn("month")} onClick={function () { setMode("month"); }}>월별</button>
    </div>
  );
  const periodSelectors = (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {(mode === "year" || mode === "month") ? <select value={selYear} onChange={function (e) { setSelYear(Number(e.target.value)); }} style={{ background: t.inputBg, border: "1px solid " + t.inputBorder, borderRadius: 10, padding: "5px 10px", fontSize: 12, color: t.text, outline: "none" }}>{years.map(function (y) { return <option key={y}>{y}</option>; })}</select> : null}
      {mode === "month" ? <select value={selMonth} onChange={function (e) { setSelMonth(Number(e.target.value)); }} style={{ background: t.inputBg, border: "1px solid " + t.inputBorder, borderRadius: 10, padding: "5px 10px", fontSize: 12, color: t.text, outline: "none" }}>{Array.from({ length: 12 }, function (_, i) { return <option key={i + 1} value={i + 1}>{i + 1}월</option>; })}</select> : null}
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
            <button onClick={function () { downloadCSV(cfg.label + "_업무목록_" + selYear + ".csv", filtered.map(function (tk) { return { 제목: tk.title, 설명: tk.desc || "", 담당자: tk.assignee, 우선순위: tk.priority, 카테고리: tk.tag, 단계: tk.status, 작업시작일: tk.due }; })); }} style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, background: t.surface2, border: "1px solid " + t.border, borderRadius: 11, padding: "7px 14px", fontWeight: 700, fontSize: 12, color: t.text3, cursor: "pointer" }}><Download size={13} strokeWidth={2} /> CSV</button>
            <button onClick={function () { setShowReport(true); }} style={{ display: "flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg,#6366f1,#818cf8)", border: "none", borderRadius: 11, padding: "7px 16px", fontWeight: 700, fontSize: 12, color: "#fff", cursor: "pointer" }}><ClipboardList size={13} strokeWidth={2} /> {mode === "all" ? "보고서 생성" : mode === "year" ? selYear + "년 보고" : selYear + "년 " + selMonth + "월 보고"}</button>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))", gap: 10 }}>
          {[["전체", total, cfg.accent], ["완료", done, "#34d399"], ["진행 중", total - done, "#fb923c"], ["완료율", rate + "%", "#38bdf8"]].map(function (item) { return <div key={item[0]} style={Object.assign({}, s, { textAlign: "center" })}><div style={{ fontSize: 24, fontWeight: 900, color: item[2] }}>{item[1]}</div><div style={{ fontSize: 11, color: t.text4, marginTop: 3 }}>{item[0]}</div></div>; })}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
          <div style={s}><div style={{ fontSize: 11, fontWeight: 700, color: t.text4, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".5px" }}>완료율</div><DonutChart rate={rate} /></div>
          <div style={s}><div style={{ fontSize: 11, fontWeight: 700, color: t.text4, marginBottom: 14, textTransform: "uppercase", letterSpacing: ".5px" }}>단계별 비율</div><PieChart data={cfg.stages.map(function (st) { return { label: st, color: cfg.stageColor[st], count: filtered.filter(function (tk) { return tk.status === st; }).length }; })} /></div>
        </div>
        {barData ? <div style={s}><div style={{ fontSize: 11, fontWeight: 700, color: t.text4, marginBottom: 10, textTransform: "uppercase", letterSpacing: ".5px" }}>{mode === "year" ? selYear + "년 추세" : "연도별 추세"}</div><LineChart data={barData.map(function (d) { return { label: mode === "year" ? d.month + "월" : d.year, value: d.total }; })} /></div> : null}
        <div style={s}>
          <div style={{ fontSize: 11, fontWeight: 700, color: t.text4, marginBottom: 12, textTransform: "uppercase", letterSpacing: ".5px" }}>단계별</div>
          {cfg.stages.map(function (st) { const c = filtered.filter(function (tk) { return tk.status === st; }).length; const StIcon = cfg.stageIcon[st]; return <div key={st} style={{ marginBottom: 9 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}><span style={{ color: cfg.stageColor[st], display: "flex", alignItems: "center", gap: 5 }}><StIcon size={12} strokeWidth={2} /> {st}</span><span style={{ color: t.text4 }}>{c}</span></div><div style={{ background: t.bg, borderRadius: 99, height: 5 }}><div style={{ width: total ? (c / total * 100) + "%" : "0%", background: cfg.stageColor[st], height: "100%", borderRadius: 99 }} /></div></div>; })}
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
  const doneVideo = filteredVideo.filter(function (tk) { return tk.status === "업무 완료"; }).length;
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
    const dn = vd.filter(function (tk) { return tk.status === "업무 완료"; }).length + md.filter(function (tk) { return tk.status === "완료"; }).length + dd.filter(function (tk) { return tk.status === "완료"; }).length;
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
          <button onClick={function () {
            const rows = filteredVideo.map(function (tk) { return { 유형: "영상", 제목: tk.title, 담당자: tk.assignee, 우선순위: tk.priority, 카테고리: tk.tag, 단계: tk.status, 작업시작일: tk.due }; })
              .concat(filteredMarketing.map(function (tk) { return { 유형: "마케팅", 제목: tk.title, 담당자: tk.assignee, 우선순위: tk.priority, 카테고리: tk.tag, 단계: tk.status, 작업시작일: tk.due }; }))
              .concat(filteredDesign.map(function (tk) { return { 유형: "디자인", 제목: tk.title, 담당자: tk.assignee, 우선순위: tk.priority, 카테고리: tk.tag, 단계: tk.status, 작업시작일: tk.due }; }));
            downloadCSV("전체_업무목록_" + selYear + ".csv", rows);
          }} style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, background: t.surface2, border: "1px solid " + t.border, borderRadius: 11, padding: "7px 14px", fontWeight: 700, fontSize: 12, color: t.text3, cursor: "pointer" }}><Download size={13} strokeWidth={2} /> CSV</button>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))", gap: 10 }}>
        {[["전체", total, "#6366f1"], ["완료", done, "#34d399"], ["진행 중", total - done, "#fb923c"], ["완료율", rate + "%", "#38bdf8"]].map(function (item) { return <div key={item[0]} style={Object.assign({}, s, { textAlign: "center" })}><div style={{ fontSize: 24, fontWeight: 900, color: item[2] }}>{item[1]}</div><div style={{ fontSize: 11, color: t.text4, marginTop: 3 }}>{item[0]}</div></div>; })}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
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
  const { task, onClose, onUpdate, onMove, users, currentUser, onNotify, allTasks, onUpdateSeries } = props;
  const stageList = props.stages || STAGES;
  const stageColorMap = props.stageColor || STAGE_COLOR;
  const stageIconMap = props.stageIcon || STAGE_ICON;
  const tagList = props.tags || TAGS;
  const categoryLabel = props.categoryLabel || "플랫폼";
  const categories = props.categories || null;
  const editTitle = props.editTitle || "영상 정보 수정";
  const [comment, setComment] = useState("");
  const [mentionQuery, setMentionQuery] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [applyToSeries, setApplyToSeries] = useState(false);
  const [editForm, setEditForm] = useState({ title: task.title, desc: task.desc, due: task.due, deadline: task.deadline || "", assignee: task.assignee, priority: task.priority, tag: task.tag, fileUrl: task.fileUrl || "", category: task.category || (categories ? categories[0] : ""), dependsOn: task.dependsOn || "" });
  const idx = stageList.indexOf(task.status);
  const StageIconBadge = stageIconMap[task.status] || Circle;
  const memberNames = users.filter(function (u) { return u.approved && u.role !== "admin"; }).map(function (u) { return u.name; });
  const setEF = function (k, v) { setEditForm(function (f) { return Object.assign({}, f, { [k]: v }); }); };
  const inp = { width: "100%", background: t.inputBg, border: "1px solid " + t.inputBorder, borderRadius: 11, padding: "8px 11px", fontSize: 13, color: t.text, boxSizing: "border-box", outline: "none" };
  const seriesCount = task.seriesId && allTasks ? allTasks.filter(function (tk) { return tk.seriesId === task.seriesId; }).length : 0;
  const subtasks = task.subtasks || [];
  const [newSubtask, setNewSubtask] = useState("");
  const [timeInput, setTimeInput] = useState("");
  const dependencyTask = task.dependsOn && allTasks ? allTasks.find(function (tk) { return tk.id === task.dependsOn; }) : null;
  const dependencyBlocked = !!(dependencyTask && dependencyTask.status !== stageList[stageList.length - 1]);
  const addSubtask = function () {
    if (!newSubtask.trim()) return;
    onUpdate(Object.assign({}, task, { subtasks: subtasks.concat([{ id: "sub_" + Date.now(), text: newSubtask.trim(), done: false }]) }));
    setNewSubtask("");
  };
  const toggleSubtask = function (id) { onUpdate(Object.assign({}, task, { subtasks: subtasks.map(function (s) { return s.id === id ? Object.assign({}, s, { done: !s.done }) : s; }) })); };
  const deleteSubtask = function (id) { onUpdate(Object.assign({}, task, { subtasks: subtasks.filter(function (s) { return s.id !== id; }) })); };
  const logTime = function () {
    const hrs = Number(timeInput);
    if (!hrs || hrs <= 0) return;
    onUpdate(Object.assign({}, task, { timeSpent: (task.timeSpent || 0) + hrs }));
    setTimeInput("");
  };
  const addComment = function () {
    if (!comment.trim()) return;
    const trimmed = comment.trim();
    const comments = task.comments || [];
    onUpdate(Object.assign({}, task, { comments: comments.concat([{ id: "c_" + Date.now(), author: currentUser.name, text: trimmed, time: new Date().toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) }]) }));
    if (onNotify && task.assignee && task.assignee !== currentUser.name) onNotify(task.assignee, currentUser.name, task.title, trimmed);
    if (onNotify) {
      const namesSorted = users.map(function (u) { return u.name; }).filter(Boolean).sort(function (a, b) { return b.length - a.length; });
      const notifiedAlready = { [currentUser.name]: true };
      if (task.assignee) notifiedAlready[task.assignee] = true;
      if (namesSorted.length > 0) {
        const escaped = namesSorted.map(function (n) { return n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); });
        const pattern = new RegExp("@(?:" + escaped.join("|") + ")", "g");
        const found = trimmed.match(pattern) || [];
        found.forEach(function (m) {
          const name = m.slice(1);
          if (!notifiedAlready[name]) { onNotify(name, currentUser.name, task.title, "@멘션: " + trimmed); notifiedAlready[name] = true; }
        });
      }
    }
    setComment("");
  };
  const saveEdit = function () {
    if (!editForm.title.trim()) return;
    if (applyToSeries && seriesCount > 1 && onUpdateSeries) {
      const seriesChanges = Object.assign({}, editForm);
      delete seriesChanges.due;
      delete seriesChanges.dependsOn;
      onUpdateSeries(task.seriesId, seriesChanges);
    } else {
      onUpdate(Object.assign({}, task, editForm));
    }
    setEditMode(false);
  };

  if (editMode) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "#00000099", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
        <div style={{ background: t.surface, borderRadius: 20, width: "min(92vw, 400px)", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 24px 64px #000c", padding: "22px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: t.text, display: "flex", alignItems: "center", gap: 6 }}><Pencil size={15} strokeWidth={2} />{editTitle}</div>
            <button onClick={function () { setEditMode(false); }} style={{ background: "none", border: "none", color: t.text5, cursor: "pointer", fontSize: 20 }}>×</button>
          </div>
          <div style={{ marginBottom: 11 }}><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>제목</div><input value={editForm.title} onChange={function (e) { setEF("title", e.target.value); }} style={inp} /></div>
          <div style={{ marginBottom: 11 }}><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>설명</div><input value={editForm.desc} onChange={function (e) { setEF("desc", e.target.value); }} style={inp} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 11 }}>
            <div><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>작업 시작일</div><input type="date" value={editForm.due} onChange={function (e) { setEF("due", e.target.value); }} style={inp} /></div>
            <div><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>마감일</div><input type="date" value={editForm.deadline || ""} onChange={function (e) { setEF("deadline", e.target.value); }} style={inp} /></div>
          </div>
          {task.createdAt ? <div style={{ fontSize: 11, color: t.text5, marginBottom: 11, display: "flex", alignItems: "center", gap: 4 }}><Clock size={11} strokeWidth={2} /> 등록일: {new Date(task.createdAt).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}</div> : null}
          {allTasks ? <div style={{ marginBottom: 11 }}><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><Link size={11} strokeWidth={2} /> 선행 업무</div><select value={editForm.dependsOn || ""} onChange={function (e) { setEF("dependsOn", e.target.value); }} style={Object.assign({}, inp, { cursor: "pointer" })}><option value="">없음</option>{allTasks.filter(function (tk) { return tk.id !== task.id; }).map(function (tk) { return <option key={tk.id} value={tk.id}>{tk.title}</option>; })}</select></div> : null}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 11 }}>
            <div><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>담당자</div><select value={editForm.assignee} onChange={function (e) { setEF("assignee", e.target.value); }} style={Object.assign({}, inp, { cursor: "pointer" })}>{memberNames.map(function (m) { return <option key={m}>{m}</option>; })}</select></div>
            <div><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>우선순위</div><select value={editForm.priority} onChange={function (e) { setEF("priority", e.target.value); }} style={Object.assign({}, inp, { cursor: "pointer" })}>{PRIORITIES.map(function (p) { return <option key={p}>{p}</option>; })}</select></div>
          </div>
          {categories ? <div style={{ marginBottom: 11 }}><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>업무 종류</div><select value={editForm.category} onChange={function (e) { setEF("category", e.target.value); }} style={Object.assign({}, inp, { cursor: "pointer" })}>{categories.map(function (c) { return <option key={c}>{c}</option>; })}</select></div> : null}
          <div style={{ marginBottom: 11 }}><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>{categoryLabel}</div><select value={editForm.tag} onChange={function (e) { setEF("tag", e.target.value); }} style={Object.assign({}, inp, { cursor: "pointer" })}>{tagList.map(function (tg) { return <option key={tg}>{tg}</option>; })}</select></div>
          <div style={{ marginBottom: 18 }}><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><Paperclip size={11} strokeWidth={2} /> 결과물 링크 (유튜브·피그마·구글드라이브·PDF·이미지·동영상·오디오 자동 미리보기)</div><input value={editForm.fileUrl} onChange={function (e) { setEF("fileUrl", e.target.value); }} placeholder="https://..." style={inp} /></div>
          {seriesCount > 1 && onUpdateSeries ? (
            <label style={{ display: "flex", alignItems: "flex-start", gap: 7, cursor: "pointer", fontSize: 12, color: t.text3, marginBottom: 18, background: t.bg, borderRadius: 10, padding: "9px 11px" }}>
              <input type="checkbox" checked={applyToSeries} onChange={function (e) { setApplyToSeries(e.target.checked); }} style={{ marginTop: 2, width: 15, height: 15, accentColor: "#6366f1", cursor: "pointer", flexShrink: 0 }} />
              <span style={{ display: "flex", alignItems: "flex-start", gap: 5 }}><Repeat size={13} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} /><span>이 반복 시리즈 전체({seriesCount}개)에 적용 — 작업 시작일은 각자 유지되고 나머지 정보만 함께 바뀌어요</span></span>
            </label>
          ) : null}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={function () { setEditMode(false); }} style={{ flex: 1, background: t.surface2, border: "none", borderRadius: 11, padding: "10px 0", cursor: "pointer", color: t.text3, fontWeight: 600 }}>취소</button>
            <button onClick={saveEdit} style={{ flex: 1, background: "#6366f1", border: "none", borderRadius: 11, padding: "10px 0", cursor: "pointer", color: "#fff", fontWeight: 700 }}>저장</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000099", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
      <div style={{ background: t.surface, borderRadius: 20, width: "min(92vw, 460px)", maxHeight: "85vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 64px #000c" }}>
        <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid " + t.border }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, color: stageColorMap[task.status], background: stageColorMap[task.status] + "18", padding: "2px 9px", borderRadius: 20, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}><StageIconBadge size={11} strokeWidth={2} /> {task.status}</span>
                <span style={{ fontSize: 11, color: PRIORITY_COLOR[task.priority], background: PRIORITY_COLOR[task.priority] + "18", padding: "2px 9px", borderRadius: 20, fontWeight: 700 }}>{task.priority}</span>
                {categories && task.category ? <span style={{ fontSize: 11, color: VIDEO_WORK_CATEGORIES.indexOf(task.category) !== -1 ? "#818cf8" : "#94a3b8", background: (VIDEO_WORK_CATEGORIES.indexOf(task.category) !== -1 ? "#818cf8" : "#94a3b8") + "18", padding: "2px 9px", borderRadius: 20, fontWeight: 700 }}>{task.category}</span> : null}
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: t.text }}>{task.title}</div>
              <div style={{ fontSize: 12, color: t.text4, marginTop: 3 }}>{task.desc}</div>
              <div style={{ display: "flex", gap: 14, marginTop: 10 }}><div style={{ display: "flex", alignItems: "center", gap: 6 }}><Avatar name={task.assignee} size={18} users={users} /><span style={{ fontSize: 12, color: t.text3 }}>{task.assignee}</span></div><span style={{ fontSize: 12, color: t.text4, display: "inline-flex", alignItems: "center", gap: 4 }}><Calendar size={12} strokeWidth={2} /> {task.due}</span></div>
              {task.fileUrl ? <div style={{ marginTop: 12 }}><MediaPreview url={task.fileUrl} /><a href={task.fileUrl} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 12, color: "#818cf8", background: "#818cf818", border: "1px solid #818cf830", borderRadius: 10, padding: "5px 10px", textDecoration: "none" }}><Paperclip size={12} strokeWidth={2} /> 원본 링크에서 열기 <ArrowRight size={11} strokeWidth={2.5} /></a></div> : null}
              {dependencyTask ? <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6, background: dependencyBlocked ? "#f8717118" : "#34d39918", border: "1px solid " + (dependencyBlocked ? "#f8717140" : "#34d39940"), borderRadius: 10, padding: "7px 11px", fontSize: 11.5, color: dependencyBlocked ? "#f87171" : "#34d399" }}><Link size={12} strokeWidth={2} /> 선행 업무 "{dependencyTask.title}"{dependencyBlocked ? " 아직 완료되지 않았어요" : " 완료됨"}</div> : null}
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", color: t.text5, cursor: "pointer", fontSize: 20, padding: 0, marginLeft: 12 }}>×</button>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
            {onMove && idx > 0 ? <button onClick={function () { onMove(task.id, -1); onClose(); }} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, background: t.surface2, border: "1px solid " + t.border2, borderRadius: 10, padding: "6px 0", fontSize: 11, cursor: "pointer", color: t.text4 }}><ArrowLeft size={11} strokeWidth={2} /> {stageList[idx - 1]}</button> : null}
            {onMove && idx < stageList.length - 1 ? <button onClick={function () { if (dependencyBlocked && !window.confirm("선행 업무 \"" + dependencyTask.title + "\"가 아직 완료되지 않았어요. 그래도 다음 단계로 넘길까요?")) return; onMove(task.id, 1); onClose(); }} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, background: "#6366f120", border: "1px solid #6366f140", borderRadius: 10, padding: "6px 0", fontSize: 11, cursor: "pointer", color: "#818cf8", fontWeight: 700 }}>{stageList[idx + 1]} <ArrowRight size={11} strokeWidth={2} /></button> : null}
            {onMove && task.status !== stageList[stageList.length - 1] ? <button onClick={function () { if (dependencyBlocked && !window.confirm("선행 업무 \"" + dependencyTask.title + "\"가 아직 완료되지 않았어요. 그래도 완료 처리할까요?")) return; onUpdate(Object.assign({}, task, { status: stageList[stageList.length - 1], statusChangedAt: Date.now() })); onClose(); }} style={{ display: "flex", alignItems: "center", gap: 5, background: "#34d39920", border: "1px solid #34d39940", borderRadius: 10, padding: "6px 12px", fontSize: 11, cursor: "pointer", color: "#34d399", fontWeight: 700, flexShrink: 0 }}><CheckCircle2 size={12} strokeWidth={2} /> 업무 완료</button> : null}
            {onMove ? <button onClick={function () { setEditForm({ title: task.title, desc: task.desc, due: task.due, deadline: task.deadline || "", assignee: task.assignee, priority: task.priority, tag: task.tag, fileUrl: task.fileUrl || "", category: task.category || (categories ? categories[0] : "") }); setEditMode(true); }} style={{ display: "flex", alignItems: "center", gap: 5, background: t.surface2, border: "1px solid " + t.border2, borderRadius: 10, padding: "6px 12px", fontSize: 11, cursor: "pointer", color: t.text4, flexShrink: 0 }}><Pencil size={12} strokeWidth={2} /> 정보 수정</button> : null}
          </div>
          {onMove && currentUser && (currentUser.role === "admin" || currentUser.role === "manager") && task.status === stageList[stageList.length - 2] ? (
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              <button onClick={function () { onUpdate(Object.assign({}, task, { status: stageList[stageList.length - 1], statusChangedAt: Date.now() })); onClose(); }} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, background: "#34d39920", border: "1px solid #34d39940", borderRadius: 10, padding: "7px 0", fontSize: 11, cursor: "pointer", color: "#34d399", fontWeight: 700 }}><CheckCircle2 size={12} strokeWidth={2} /> 승인 (완료 처리)</button>
              <button onClick={function () {
                const reason = window.prompt("수정 요청 사유를 입력해주세요");
                if (!reason) return;
                const newComments = (task.comments || []).concat([{ id: "c_" + Date.now(), author: currentUser.name, text: "수정 요청: " + reason, time: new Date().toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) }]);
                const backStageIdx = Math.max(0, stageList.length - 3);
                onUpdate(Object.assign({}, task, { status: stageList[backStageIdx], comments: newComments, statusChangedAt: Date.now() }));
                if (onNotify && task.assignee && task.assignee !== currentUser.name) onNotify(task.assignee, currentUser.name, task.title, "수정 요청: " + reason);
              }} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, background: "#f8717120", border: "1px solid #f8717140", borderRadius: 10, padding: "7px 0", fontSize: 11, cursor: "pointer", color: "#f87171", fontWeight: 700 }}><CornerUpLeft size={12} strokeWidth={2} /> 수정 요청</button>
            </div>
          ) : null}
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: t.text4, textTransform: "uppercase", letterSpacing: ".5px" }}>체크리스트 {subtasks.length > 0 ? "· " + subtasks.filter(function (s) { return s.done; }).length + "/" + subtasks.length : ""}</div>
          </div>
          {subtasks.length > 0 ? <div style={{ background: t.bg, borderRadius: 99, height: 4, marginBottom: 10 }}><div style={{ width: (subtasks.filter(function (s) { return s.done; }).length / subtasks.length * 100) + "%", background: "#34d399", height: "100%", borderRadius: 99 }} /></div> : null}
          {subtasks.map(function (s) {
            return (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
                <input type="checkbox" checked={s.done} onChange={function () { toggleSubtask(s.id); }} style={{ width: 15, height: 15, accentColor: "#34d399", cursor: "pointer", flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13, color: s.done ? t.text5 : t.text2, textDecoration: s.done ? "line-through" : "none" }}>{s.text}</span>
                <button onClick={function () { deleteSubtask(s.id); }} style={{ background: "none", border: "none", color: t.text5, cursor: "pointer", fontSize: 14, padding: 0 }}>×</button>
              </div>
            );
          })}
          <div style={{ display: "flex", gap: 6, marginTop: subtasks.length > 0 ? 8 : 0, marginBottom: 18 }}>
            <input value={newSubtask} onChange={function (e) { setNewSubtask(e.target.value); }} onKeyDown={function (e) { if (e.key === "Enter") addSubtask(); }} placeholder="세부 할 일 추가..." style={{ flex: 1, background: t.inputBg, border: "1px solid " + t.inputBorder, borderRadius: 9, padding: "7px 11px", fontSize: 12.5, color: t.text, outline: "none" }} />
            <button onClick={addSubtask} style={{ background: t.surface2, border: "none", borderRadius: 9, padding: "0 12px", color: t.text3, cursor: "pointer" }}><Plus size={14} strokeWidth={2} /></button>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, paddingTop: 14, borderTop: "1px solid " + t.border }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: t.text4, textTransform: "uppercase", letterSpacing: ".5px", display: "flex", alignItems: "center", gap: 5 }}><Clock size={12} strokeWidth={2} /> 누적 작업 시간 {task.timeSpent ? "· " + task.timeSpent + "시간" : ""}</div>
            <div style={{ display: "flex", gap: 6 }}>
              <input value={timeInput} onChange={function (e) { setTimeInput(e.target.value); }} onKeyDown={function (e) { if (e.key === "Enter") logTime(); }} type="number" step="0.5" min="0" placeholder="시간" style={{ width: 70, background: t.inputBg, border: "1px solid " + t.inputBorder, borderRadius: 9, padding: "6px 9px", fontSize: 12, color: t.text, outline: "none" }} />
              <button onClick={logTime} style={{ background: t.surface2, border: "none", borderRadius: 9, padding: "0 12px", color: t.text3, cursor: "pointer", fontSize: 12 }}>기록</button>
            </div>
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: t.text4, marginBottom: 12, textTransform: "uppercase", letterSpacing: ".5px", paddingTop: 14, borderTop: "1px solid " + t.border }}>코멘트 {(task.comments || []).length > 0 ? "· " + (task.comments || []).length : ""}</div>
          {(task.comments || []).length === 0 ? <EmptyState icon={MessageCircle} text="아직 코멘트가 없습니다" compact /> : null}
          {(task.comments || []).map(function (c) {
            return (
              <div key={c.id} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <Avatar name={c.author} size={26} users={users} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: t.text2 }}>{c.author}</span>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}><span style={{ fontSize: 10, color: t.text5 }}>{c.time}</span>{(c.author === currentUser.name || currentUser.role === "admin" || currentUser.role === "manager") ? <button onClick={function () { onUpdate(Object.assign({}, task, { comments: (task.comments || []).filter(function (x) { return x.id !== c.id; }) })); }} style={{ background: "none", border: "none", color: t.text5, cursor: "pointer", fontSize: 13, padding: 0 }}>×</button> : null}</div>
                  </div>
                  <div style={{ background: t.surface2, borderRadius: 11, padding: "9px 12px", fontSize: 13, color: t.text2, lineHeight: 1.6 }}><MentionText text={c.text} users={users} /></div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ padding: "12px 22px 18px", borderTop: "1px solid " + t.border }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}><Avatar name={currentUser.name} size={18} users={users} /><span style={{ fontSize: 12, color: t.text3, fontWeight: 600 }}>{currentUser.name} 으로 작성 중</span></div>
          <div style={{ position: "relative", display: "flex", gap: 7 }}>
            {mentionQuery !== null ? (function () {
              const q = mentionQuery.toLowerCase();
              const suggestions = users.filter(function (u) { return u.approved && u.name !== currentUser.name && u.name.toLowerCase().indexOf(q) !== -1; }).slice(0, 6);
              if (suggestions.length === 0) return null;
              return (
                <div style={{ position: "absolute", bottom: "100%", left: 0, marginBottom: 6, background: t.surface, border: "1px solid " + t.border, borderRadius: 12, boxShadow: "0 10px 28px #000a", overflow: "hidden", zIndex: 60, minWidth: 180 }}>
                  {suggestions.map(function (u) {
                    return (
                      <div key={u.name} onMouseDown={function (e) { e.preventDefault(); }} onClick={function () {
                        const atIndex = comment.lastIndexOf("@");
                        const newComment = comment.slice(0, atIndex) + "@" + u.name + " ";
                        setComment(newComment);
                        setMentionQuery(null);
                      }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", cursor: "pointer" }}>
                        <Avatar name={u.name} size={20} users={users} />
                        <span style={{ fontSize: 13, color: t.text2 }}>{u.name}</span>
                        <span style={{ fontSize: 10, color: t.text5, marginLeft: "auto" }}>{u.rank}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })() : null}
            <input value={comment} onChange={function (e) {
              const val = e.target.value;
              setComment(val);
              const atIndex = val.lastIndexOf("@");
              if (atIndex !== -1 && !/\s/.test(val.slice(atIndex + 1))) setMentionQuery(val.slice(atIndex + 1));
              else setMentionQuery(null);
            }} onKeyDown={function (e) { if (e.key === "Enter") { addComment(); setMentionQuery(null); } if (e.key === "Escape") setMentionQuery(null); }} placeholder="코멘트 입력... (@이름 입력하면 대상이 목록으로 떠요)" style={{ flex: 1, background: t.inputBg, border: "1px solid " + t.inputBorder, borderRadius: 11, padding: "9px 13px", fontSize: 13, color: t.text, outline: "none" }} />
            <button onClick={function () { addComment(); setMentionQuery(null); }} style={{ background: "#6366f1", border: "none", borderRadius: 11, padding: "0 15px", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>전송</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddTaskModal(props) {
  const { t } = useTheme();
  const { onAdd, onClose, defaultDate, users, allTasks } = props;
  const tagList = props.tags || TAGS;
  const stageList = props.stages || STAGES;
  const modalTitle = props.title || "새 영상 추가";
  const categoryLabel = props.categoryLabel || "플랫폼";
  const categories = props.categories || null;
  const memberNames = users.filter(function (u) { return u.approved && u.role !== "admin"; }).map(function (u) { return u.name; });
  const [form, setForm] = useState({ title: "", desc: "", assignee: memberNames[0] || "", priority: "중간", tag: tagList[0], due: defaultDate || "", deadline: "", status: stageList[0], fileUrl: "", category: categories ? categories[0] : "", repeat: "없음", repeatCount: 4, dependsOn: "" });
  const set = function (k, v) { setForm(function (f) { return Object.assign({}, f, { [k]: v }); }); };
  const inp = { width: "100%", background: t.inputBg, border: "1px solid " + t.inputBorder, borderRadius: 11, padding: "9px 12px", fontSize: 13, color: t.text, boxSizing: "border-box", outline: "none" };
  const REPEAT_OPTIONS = ["없음", "매일", "매주", "매월"];
  const pad2 = function (n) { return String(n).padStart(2, "0"); };
  const submit = function () {
    if (!form.title) return;
    const count = form.repeat === "없음" ? 1 : Math.max(1, Math.min(24, Number(form.repeatCount) || 1));
    const base = Object.assign({}, form);
    delete base.repeat;
    delete base.repeatCount;
    const seriesId = count > 1 ? "series_" + Date.now() : null;
    const newTasks = [];
    for (let i = 0; i < count; i++) {
      let dueDate = form.due;
      let deadlineDate = form.deadline;
      if (i > 0 && form.due) {
        const d = new Date(form.due + "T00:00:00");
        if (form.repeat === "매일") d.setDate(d.getDate() + i);
        else if (form.repeat === "매주") d.setDate(d.getDate() + i * 7);
        else if (form.repeat === "매월") d.setMonth(d.getMonth() + i);
        dueDate = d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
        if (form.deadline) {
          const dl = new Date(form.deadline + "T00:00:00");
          if (form.repeat === "매일") dl.setDate(dl.getDate() + i);
          else if (form.repeat === "매주") dl.setDate(dl.getDate() + i * 7);
          else if (form.repeat === "매월") dl.setMonth(dl.getMonth() + i);
          deadlineDate = dl.getFullYear() + "-" + pad2(dl.getMonth() + 1) + "-" + pad2(dl.getDate());
        }
      }
      const extra = { due: dueDate, deadline: deadlineDate, createdAt: Date.now(), statusChangedAt: Date.now(), id: "task_" + Date.now() + "_" + i, comments: [], subtasks: [], timeSpent: 0 };
      if (seriesId) extra.seriesId = seriesId;
      newTasks.push(Object.assign({}, base, extra));
    }
    onAdd(newTasks);
    onClose();
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000099", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
      <div style={{ background: t.surface, borderRadius: 20, padding: "22px 26px", width: "min(92vw, 370px)", boxShadow: "0 24px 64px #000c" }}>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 18, color: t.text }}>{modalTitle}</div>
        {[["제목", "title", "text"], ["설명", "desc", "text"], ["작업 시작일", "due", "date"], ["마감일", "deadline", "date"]].map(function (item) { return <div key={item[1]} style={{ marginBottom: 11 }}><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>{item[0]}</div><input type={item[2]} value={form[item[1]]} onChange={function (e) { set(item[1], e.target.value); }} style={inp} /></div>; })}
        {allTasks ? <div style={{ marginBottom: 11 }}><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><Link size={11} strokeWidth={2} /> 선행 업무 (이 업무가 끝나야 시작, 선택)</div><select value={form.dependsOn} onChange={function (e) { set("dependsOn", e.target.value); }} style={Object.assign({}, inp, { cursor: "pointer" })}><option value="">없음</option>{allTasks.map(function (tk) { return <option key={tk.id} value={tk.id}>{tk.title}</option>; })}</select></div> : null}
        {[["담당자", "assignee", memberNames.length ? memberNames : ["미배정"]], ["우선순위", "priority", PRIORITIES]].concat(categories ? [["업무 종류", "category", categories]] : []).concat([[categoryLabel, "tag", tagList], ["단계", "status", stageList]]).map(function (item) { return <div key={item[1]} style={{ marginBottom: 11 }}><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>{item[0]}</div><select value={form[item[1]]} onChange={function (e) { set(item[1], e.target.value); }} style={Object.assign({}, inp, { cursor: "pointer" })}>{item[2].map(function (o) { return <option key={o}>{o}</option>; })}</select></div>; })}
        <div style={{ display: "grid", gridTemplateColumns: form.repeat === "없음" ? "1fr" : "1fr 1fr", gap: 10, marginBottom: 11 }}>
          <div><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><Repeat size={11} strokeWidth={2} /> 반복</div><select value={form.repeat} onChange={function (e) { set("repeat", e.target.value); }} style={Object.assign({}, inp, { cursor: "pointer" })}>{REPEAT_OPTIONS.map(function (o) { return <option key={o}>{o}</option>; })}</select></div>
          {form.repeat !== "없음" ? <div><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>반복 횟수 (최대 24)</div><input type="number" min="1" max="24" value={form.repeatCount} onChange={function (e) { set("repeatCount", e.target.value); }} style={inp} /></div> : null}
        </div>
        {form.repeat !== "없음" ? <div style={{ fontSize: 11, color: t.text4, marginBottom: 11, background: t.bg, borderRadius: 10, padding: "7px 10px" }}>작업 시작일부터 {form.repeat}으로 {form.repeatCount || 1}개 일정이 한 번에 등록돼요.</div> : null}
        <div style={{ marginBottom: 11 }}><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><Paperclip size={11} strokeWidth={2} /> 결과물 링크 (유튜브·피그마·구글드라이브·PDF·이미지·동영상·오디오 자동 미리보기)</div><input value={form.fileUrl} onChange={function (e) { set("fileUrl", e.target.value); }} placeholder="https://..." style={inp} /></div>
        <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
          <button onClick={onClose} style={{ flex: 1, background: t.surface2, border: "none", borderRadius: 11, padding: "10px 0", cursor: "pointer", color: t.text3, fontWeight: 600 }}>취소</button>
          <button onClick={submit} style={{ flex: 1, background: "#6366f1", border: "none", borderRadius: 11, padding: "10px 0", cursor: "pointer", color: "#fff", fontWeight: 700 }}>추가</button>
        </div>
      </div>
    </div>
  );
}

function CalendarView(props) {
  const { t } = useTheme();
  const { tasks, onSelectTask, onAddTask, ads, onMove, onDelete, onSelectAd, onBulkDelete, onBulkAssign, users, currentUser } = props;
  const videoMode = props.videoMode !== false;
  const stageList = props.stages || STAGES;
  const stageColorMap = props.stageColor || STAGE_COLOR;
  const stageIconMap = props.stageIcon || STAGE_ICON;
  const taskLabel = props.taskLabel || "제작 영상";
  const taskUnitLabel = props.taskUnitLabel || "영상";
  const categoryOptions = props.categoryOptions || null;
  const categoryField = props.categoryField || "category";
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [myTasksOnly, setMyTasksOnly] = useState(false);
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [dayDetail, setDayDetail] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkAssignee, setBulkAssignee] = useState("");
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();
  const cells = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: prevDays - i, cur: false });
  for (let i = 1; i <= daysInMonth; i++) cells.push({ day: i, cur: true });
  while (cells.length % 7 !== 0) cells.push({ day: cells.length - firstDay - daysInMonth + 1, cur: false });
  const pad = function (n) { return String(n).padStart(2, "0"); };
  const dateStr = function (d) { return year + "-" + pad(month + 1) + "-" + pad(d); };
  const todayStr = today.getFullYear() + "-" + pad(today.getMonth() + 1) + "-" + pad(today.getDate());
  const isOverdue = function (item) { return item.due && item.due < todayStr && item.status === stageList[0]; };
  const adItems = [];
  if (ads) {
    for (let j = 0; j < ads.length; j++) {
      const ad = ads[j], label = ad.content || "광고";
      if (ad.workDate) adItems.push({ id: "ad_work_" + ad.id, due: ad.workDate, title: label, kind: "adWork", status: ad.workStatus || "기획중" });
      if (ad.expectedDate) adItems.push({ id: "ad_exp_" + ad.id, due: ad.expectedDate, title: label, kind: "adExpected", status: ad.workStatus || "기획중" });
    }
  }
  const filteredTasks = tasks.filter(function (tk) {
    if (categoryFilter !== "all" && tk[categoryField] !== categoryFilter) return false;
    if (myTasksOnly && currentUser && tk.assignee !== currentUser.name) return false;
    return true;
  });
  const isInDateRange = function (tk, ds) {
    if (tk.deadline && tk.deadline > tk.due) return ds >= tk.due && ds <= tk.deadline && !isRestDay(ds);
    return tk.due === ds;
  };
  const getDayItems = function (d) {
    const ds = dateStr(d), taskItems = [];
    for (let k = 0; k < filteredTasks.length; k++) {
      if (isInDateRange(filteredTasks[k], ds)) {
        const copy = Object.assign({}, filteredTasks[k]);
        copy.kind = "task";
        copy.isSpanStart = filteredTasks[k].due === ds;
        copy.isSpanEnd = filteredTasks[k].deadline === ds;
        copy.isSpanMiddle = !copy.isSpanStart && !copy.isSpanEnd;
        taskItems.push(copy);
      }
    }
    const adsForDay = [];
    for (let k = 0; k < adItems.length; k++) if (adItems[k].due === ds) adsForDay.push(adItems[k]);
    return taskItems.concat(adsForDay);
  };
  const isToday = function (d) { return d === today.getDate() && month === today.getMonth() && year === today.getFullYear(); };
  const goPrevMonth = function () { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); };
  const goNextMonth = function () { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); };
  const monthPrefix = year + "-" + pad(month + 1);
  const monthTasksUnsorted = filteredTasks.filter(function (tk) { return tk.due && tk.due.indexOf(monthPrefix) === 0; });
  const monthTasks = monthTasksUnsorted.slice().sort(function (a, b) { return a.due < b.due ? -1 : a.due > b.due ? 1 : 0; });
  const monthAdsUnsorted = adItems.filter(function (a) { return a.due && a.due.indexOf(monthPrefix) === 0; });
  const monthAds = monthAdsUnsorted.slice().sort(function (a, b) { return a.due < b.due ? -1 : a.due > b.due ? 1 : 0; });
  const getItemColor = function (item) { if (item.kind === "task") return stageColorMap[item.status] || "#818cf8"; if (item.kind === "adWork") return "#fbbf24"; if (item.kind === "adExpected") return "#38bdf8"; return "#818cf8"; };
  const getItemIcon = function (item) { if (item.kind === "task") return stageIconMap[item.status] || Film; if (item.kind === "adWork") return Megaphone; if (item.kind === "adExpected") return Flag; return Circle; };
  const getItemSuffix = function (item) { if (item.kind === "adWork") return " (제작일)"; if (item.kind === "adExpected") return " (예상완료)"; return ""; };
  const handleEditClick = function (e, taskObj) { e.stopPropagation(); onSelectTask(taskObj); };
  const handleMoveClick = function (e, taskId, direction) { e.stopPropagation(); onMove(taskId, direction); };
  const handleDeleteClick = function (e, taskObj) { e.stopPropagation(); if (window.confirm('"' + taskObj.title + '" 영상을 삭제하시겠습니까?')) onDelete(taskObj.id); };
  const weekdayColor = function (idx) { if (idx === 0) return "#f87171"; if (idx === 6) return "#818cf8"; return t.text4; };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <button onClick={goPrevMonth} style={{ background: t.surface2, border: "1px solid " + t.border, borderRadius: 10, padding: "7px 14px", color: t.text3, cursor: "pointer", fontSize: 14 }}>‹</button>
        <div style={{ textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 800, color: t.text }}>{year}년 {month + 1}월</div><div style={{ fontSize: 12, color: t.text4, marginTop: 2 }}>{videoMode ? monthTasks.length + "개 " + taskUnitLabel + " · " + monthAds.length + "개 광고 일정" : monthAds.length + "개 광고 일정"}</div></div>
        <button onClick={goNextMonth} style={{ background: t.surface2, border: "1px solid " + t.border, borderRadius: 10, padding: "7px 14px", color: t.text3, cursor: "pointer", fontSize: 14 }}>›</button>
      </div>
      <div style={{ display: "flex", gap: 14, marginBottom: 14, flexWrap: "wrap" }}>
        {videoMode ? <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 9, height: 9, borderRadius: 4, background: "#818cf8" }} /><span style={{ fontSize: 11, color: t.text4 }}>{taskLabel}</span></div> : null}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 9, height: 9, borderRadius: 4, background: "#fbbf24" }} /><span style={{ fontSize: 11, color: t.text4 }}>광고 제작일</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 9, height: 9, borderRadius: 4, background: "#38bdf8" }} /><span style={{ fontSize: 11, color: t.text4 }}>광고 예상완료일</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}><Flag size={11} strokeWidth={2} color={t.text4} /><span style={{ fontSize: 11, color: t.text4 }}>공휴일</span></div>
        {videoMode ? <div style={{ display: "flex", alignItems: "center", gap: 5 }}><Clock size={11} strokeWidth={2} color={t.text4} /><span style={{ fontSize: 11, color: t.text4 }}>시작 지연 (시작일 지났는데 기획 단계)</span></div> : null}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {categoryOptions ? (
          <select value={categoryFilter} onChange={function (e) { setCategoryFilter(e.target.value); }} style={{ background: t.inputBg, border: "1px solid " + t.inputBorder, borderRadius: 9, padding: "6px 10px", fontSize: 12, color: t.text, outline: "none", cursor: "pointer" }}>
            <option value="all">전체 업무 종류</option>
            {categoryOptions.map(function (c) { return <option key={c} value={c}>{c}</option>; })}
          </select>
        ) : null}
        {currentUser ? (
          <button onClick={function () { setMyTasksOnly(!myTasksOnly); }} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: myTasksOnly ? "#6366f1" : t.surface2, border: "none", borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 700, color: myTasksOnly ? "#fff" : t.text3, cursor: "pointer" }}><User size={12} strokeWidth={2} /> 내 업무만</button>
        ) : null}
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
            <div key={i} onClick={function () { if (cell.cur && onAddTask) onAddTask(dateStr(cell.day)); }} style={{ minHeight: 92, minWidth: 0, overflow: "hidden", background: cell.cur ? (isToday(cell.day) ? t.todayBg : t.surface) : t.bg, borderRadius: 14, padding: "8px 8px 6px", border: "1px solid " + (isHoliday ? "#f8717150" : t.border), boxShadow: isToday(cell.day) ? "0 0 0 2px #6366f1" : "none", cursor: cell.cur && onAddTask ? "pointer" : "default", boxSizing: "border-box", transition: "box-shadow .15s" }}>
              <div style={{ fontSize: 12, fontWeight: isToday(cell.day) || isHoliday ? 800 : 500, color: !cell.cur ? t.border2 : isToday(cell.day) ? "#818cf8" : isHoliday ? "#f87171" : weekdayColor(colIdx), marginBottom: isHoliday ? 1 : 4, display: "flex", justifyContent: "space-between" }}>
                <span>{cell.day}</span>
                {isToday(cell.day) ? <span style={{ fontSize: 9, background: "#6366f1", color: "#fff", borderRadius: 99, padding: "1px 5px", fontWeight: 700, flexShrink: 0 }}>오늘</span> : null}
              </div>
              {holidayName ? <div style={{ fontSize: 9, color: "#f87171", fontWeight: 600, marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "flex", alignItems: "center", gap: 3 }}><Flag size={9} strokeWidth={2} /> {holidayName}</div> : null}
              {dayItems.slice(0, 3).map(function (item) {
                const overdue = item.kind === "task" && isOverdue(item);
                const ItemIcon = getItemIcon(item);
                const isContinuation = item.kind === "task" && (item.isSpanMiddle || item.isSpanEnd);
                const isMultiDayStart = item.kind === "task" && item.isSpanStart && item.deadline && item.deadline !== item.due;
                const chipRadius = isMultiDayStart ? "7px 3px 3px 7px" : (isContinuation ? "3px 7px 7px 3px" : 7);
                return <div key={item.id} onClick={function (e) { e.stopPropagation(); if (item.kind === "task") onSelectTask(item); else if (onSelectAd) onSelectAd(item); }} style={{ display: "flex", alignItems: "center", gap: 3, background: overdue ? "#f8717130" : getItemColor(item) + "22", border: "none", borderRadius: chipRadius, padding: "3px 6px", fontSize: 10, color: overdue ? "#f87171" : getItemColor(item), fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", cursor: "pointer", maxWidth: "100%", boxSizing: "border-box" }}>{overdue ? <Clock size={9} strokeWidth={2.5} style={{ flexShrink: 0 }} /> : null}{isContinuation ? <span style={{ flexShrink: 0 }}>›</span> : <ItemIcon size={9} strokeWidth={2.5} style={{ flexShrink: 0 }} />}<span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}{getItemSuffix(item)}</span></div>;
              })}
              {dayItems.length > 3 ? <div onClick={function (e) { e.stopPropagation(); setDayDetail({ date: dateStr(cell.day), items: dayItems }); }} style={{ fontSize: 10, color: "#818cf8", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>+{dayItems.length - 3}개 더보기</div> : null}
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
          <div style={{ marginTop: 18, background: t.surface, borderRadius: 16, border: "1px solid #f8717130", overflow: "hidden" }}>
            <div style={{ padding: "11px 18px", borderBottom: "1px solid " + t.border, fontSize: 12, fontWeight: 700, color: "#f87171", textTransform: "uppercase", letterSpacing: ".5px", display: "flex", alignItems: "center", gap: 6 }}><Flag size={13} strokeWidth={2} /> {month + 1}월 공휴일</div>
            {monthHolidays.map(function (h, i) {
              const isLast = i === monthHolidays.length - 1;
              const d = new Date(h.date), wd = WEEKDAYS[d.getDay()];
              return <div key={h.date} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 18px", borderBottom: isLast ? "none" : "1px solid " + t.border }}><span style={{ fontSize: 13, fontWeight: 600, color: t.text, flex: 1 }}>{h.name}</span><span style={{ fontSize: 11, color: t.text4 }}>{h.date.slice(5)} ({wd})</span></div>;
            })}
          </div>
        );
      })()}
      {videoMode && monthTasks.length > 0 ? (
        <div style={{ marginTop: 18, background: t.surface, borderRadius: 16, border: "1px solid " + t.border, overflow: "hidden" }}>
          <div style={{ padding: "11px 18px", borderBottom: "1px solid " + t.border, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: t.text4, textTransform: "uppercase", letterSpacing: ".5px" }}>{month + 1}월 스케줄 목록</span>
            {onMove && (onBulkDelete || onBulkAssign) && selectedIds.length > 0 ? (
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, color: "#818cf8", fontWeight: 700 }}>{selectedIds.length}개 선택됨</span>
                {onBulkAssign ? <select value={bulkAssignee} onChange={function (e) { setBulkAssignee(e.target.value); }} style={{ background: t.inputBg, border: "1px solid " + t.inputBorder, borderRadius: 10, padding: "5px 8px", fontSize: 11, color: t.text, outline: "none" }}><option value="">담당자 선택</option>{(users || []).filter(function (u) { return u.approved && u.role !== "admin"; }).map(function (u) { return <option key={u.name} value={u.name}>{u.name}</option>; })}</select> : null}
                {onBulkAssign ? <button onClick={function () { if (bulkAssignee) { onBulkAssign(selectedIds, bulkAssignee); setSelectedIds([]); setBulkAssignee(""); } }} style={{ background: "#6366f118", border: "1px solid #6366f130", borderRadius: 10, padding: "5px 10px", fontSize: 11, cursor: "pointer", color: "#818cf8", fontWeight: 700 }}>일괄 변경</button> : null}
                {onBulkDelete ? <button onClick={function () { if (window.confirm(selectedIds.length + "개 항목을 삭제하시겠습니까?")) { onBulkDelete(selectedIds); setSelectedIds([]); } }} style={{ background: "#f8717118", border: "1px solid #f8717130", borderRadius: 10, padding: "5px 10px", fontSize: 11, cursor: "pointer", color: "#f87171", fontWeight: 700 }}>일괄 삭제</button> : null}
                <button onClick={function () { setSelectedIds([]); }} style={{ background: "none", border: "none", color: t.text5, cursor: "pointer", fontSize: 11 }}>선택 해제</button>
              </div>
            ) : null}
          </div>
          {monthTasks.map(function (tk, i) {
            const idx = stageList.indexOf(tk.status), isLast = i === monthTasks.length - 1, hasPrev = idx > 0, hasNext = idx < stageList.length - 1;
            const overdue = isOverdue(tk);
            const checked = selectedIds.indexOf(tk.id) !== -1;
            return (
              <div key={tk.id} style={{ padding: "13px 18px", borderBottom: isLast ? "none" : "1px solid " + t.border, background: checked ? "#6366f110" : overdue ? "#f8717110" : "transparent" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
                  {onMove && (onBulkDelete || onBulkAssign) ? <input type="checkbox" checked={checked} onChange={function () { setSelectedIds(checked ? selectedIds.filter(function (id) { return id !== tk.id; }) : selectedIds.concat([tk.id])); }} style={{ width: 15, height: 15, accentColor: "#6366f1", cursor: "pointer", flexShrink: 0 }} /> : null}
                  <div onClick={function (e) { handleEditClick(e, tk); }} style={{ width: 3, height: 30, borderRadius: 99, background: stageColorMap[tk.status], flexShrink: 0, cursor: "pointer" }} />
                  {getThumbnailUrl(tk.fileUrl) ? <img src={getThumbnailUrl(tk.fileUrl)} alt="" onClick={function (e) { handleEditClick(e, tk); }} style={{ width: 44, height: 30, objectFit: "cover", borderRadius: 7, flexShrink: 0, cursor: "pointer" }} /> : null}
                  <div onClick={function (e) { handleEditClick(e, tk); }} style={{ flex: 1, minWidth: 100, cursor: "pointer" }}><div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{tk.title}</div><div style={{ fontSize: 11, color: t.text4, marginTop: 1, display: "flex", alignItems: "center", gap: 4 }}>{(function () { const SIcon = stageIconMap[tk.status]; return <SIcon size={11} strokeWidth={2} />; })()} {tk.status} · {tk.tag}</div></div>
                  <span style={{ fontSize: 11, color: overdue ? "#f87171" : t.text4, fontWeight: overdue ? 700 : 400, flexShrink: 0 }}>{tk.due.slice(5)}</span>
                  {tk.deadline ? <span style={{ fontSize: 10, color: tk.deadline < todayStr ? "#f87171" : "#fb923c", background: (tk.deadline < todayStr ? "#f87171" : "#fb923c") + "18", padding: "2px 7px", borderRadius: 20, fontWeight: 700, flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 3 }}><Clock size={10} strokeWidth={2.5} /> {tk.deadline.slice(5)}</span> : null}
                  <span style={{ fontSize: 10, color: PRIORITY_COLOR[tk.priority], background: PRIORITY_COLOR[tk.priority] + "18", padding: "2px 7px", borderRadius: 20, fontWeight: 700, flexShrink: 0 }}>{tk.priority}</span>
                  {overdue ? <span style={{ fontSize: 10, color: "#f87171", background: "#f8717120", padding: "2px 7px", borderRadius: 20, fontWeight: 700, flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 3 }}><Clock size={10} strokeWidth={2.5} /> 시작 지연</span> : null}
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {hasPrev && onMove ? <button onClick={function (e) { handleMoveClick(e, tk.id, -1); }} style={{ display: "flex", alignItems: "center", gap: 4, background: t.bg, border: "1px solid " + t.border, borderRadius: 7, padding: "6px 11px", fontSize: 11, cursor: "pointer", color: t.text4, fontWeight: 600 }}><ArrowLeft size={11} strokeWidth={2} /> 이전 단계</button> : null}
                  {hasNext && onMove ? <button onClick={function (e) { handleMoveClick(e, tk.id, 1); }} style={{ display: "flex", alignItems: "center", gap: 4, background: "#6366f118", border: "1px solid #6366f130", borderRadius: 7, padding: "6px 11px", fontSize: 11, cursor: "pointer", color: "#818cf8", fontWeight: 700 }}>다음 단계 <ArrowRight size={11} strokeWidth={2} /></button> : null}
                  <button onClick={function (e) { handleEditClick(e, tk); }} style={{ display: "flex", alignItems: "center", gap: 4, background: t.bg, border: "1px solid " + t.border, borderRadius: 7, padding: "6px 11px", fontSize: 11, cursor: "pointer", color: t.text4, fontWeight: 600 }}>{onMove ? <Pencil size={11} strokeWidth={2} /> : <Search size={11} strokeWidth={2} />} {onMove ? "수정" : "자세히"}</button>
                  {onDelete ? <button onClick={function (e) { handleDeleteClick(e, tk); }} style={{ display: "flex", alignItems: "center", gap: 4, background: "#f8717118", border: "1px solid #f8717130", borderRadius: 7, padding: "6px 11px", fontSize: 11, cursor: "pointer", color: "#f87171", fontWeight: 600 }}><Trash2 size={11} strokeWidth={2} /> 삭제</button> : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
      {monthAds.length > 0 ? (
        <div style={{ marginTop: 14, background: t.surface, borderRadius: 16, border: "1px solid " + t.border, overflow: "hidden" }}>
          <div style={{ padding: "11px 18px", borderBottom: "1px solid " + t.border, fontSize: 12, fontWeight: 700, color: t.text4, textTransform: "uppercase", letterSpacing: ".5px" }}>{month + 1}월 광고 일정</div>
          {monthAds.map(function (item, i) {
            const isLast = i === monthAds.length - 1;
            const ItemIcon = getItemIcon(item);
            return <div key={item.id} onClick={function () { if (onSelectAd) onSelectAd(item); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 18px", borderBottom: isLast ? "none" : "1px solid " + t.border, cursor: onSelectAd ? "pointer" : "default" }}><div style={{ width: 3, height: 30, borderRadius: 99, background: getItemColor(item), flexShrink: 0 }} /><div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, color: t.text, display: "flex", alignItems: "center", gap: 5 }}><ItemIcon size={13} strokeWidth={2} /> {item.title}</div><div style={{ fontSize: 11, color: t.text4, marginTop: 1 }}>{item.kind === "adWork" ? "제작일" : "예상완료일"} · {item.status}</div></div><span style={{ fontSize: 11, color: t.text4 }}>{item.due.slice(5)}</span></div>;
          })}
        </div>
      ) : null}
      {dayDetail ? (
        <div onClick={function () { setDayDetail(null); }} style={{ position: "fixed", inset: 0, background: "#00000099", zIndex: 250, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
          <div onClick={function (e) { e.stopPropagation(); }} style={{ background: t.surface, borderRadius: 20, width: "min(92vw, 420px)", maxHeight: "80vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 64px #000c" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid " + t.border, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: t.text }}>{dayDetail.date} 일정 ({dayDetail.items.length})</div>
              <button onClick={function () { setDayDetail(null); }} style={{ background: "none", border: "none", color: t.text5, cursor: "pointer", fontSize: 20 }}>×</button>
            </div>
            <div style={{ padding: "8px 12px", overflowY: "auto" }}>
              {dayDetail.items.map(function (item) {
                const overdue = item.kind === "task" && isOverdue(item);
                const ItemIcon = getItemIcon(item);
                return (
                  <div key={item.id} onClick={function () { setDayDetail(null); if (item.kind === "task") onSelectTask(item); else if (onSelectAd) onSelectAd(item); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 10px", borderRadius: 11, cursor: "pointer", marginBottom: 3, background: overdue ? "#f8717115" : "transparent" }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: overdue ? "#f87171" : getItemColor(item), flexShrink: 0 }} />
                    {overdue ? <Clock size={12} strokeWidth={2.5} color="#f87171" style={{ flexShrink: 0 }} /> : null}
                    <ItemIcon size={12} strokeWidth={2} style={{ flexShrink: 0, color: t.text3 }} />
                    <span style={{ fontSize: 13, color: t.text, flex: 1, minWidth: 0 }}>{item.title}{getItemSuffix(item)}</span>
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

function getAdBoardStatus(ad) {
  if (ad.insta === "완료" || ad.youtube === "완료") return "업무 완료";
  if (ad.finalConfirm === "컨펌완료" || ad.workStatus === "작업완료") return "검토";
  if (ad.workStatus === "작업중" || ad.workStatus === "수정중") return "편집";
  if (ad.workStatus === "기획중") return "기획";
  return "기획";
}

function getDesignBoardStatus(dt) {
  if (dt.status === "완료") return "업무 완료";
  if (dt.status === "피드백") return "검토";
  if (dt.status === "시안 작업") return "편집";
  return "기획";
}

function getMarketingBoardStatus(mt) {
  if (mt.status === "완료") return "업무 완료";
  if (mt.status === "검토") return "검토";
  if (mt.status === "진행중") return "편집";
  return "기획";
}

function TimelineView(props) {
  const { t } = useTheme();
  const { videoTasks, marketingTasks, designTasks, onSelectVideo, onSelectMarketing, onSelectDesign, users, currentUser } = props;
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [myOnly, setMyOnly] = useState(false);
  const pad = function (n) { return String(n).padStart(2, "0"); };
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthStart = year + "-" + pad(month + 1) + "-01";
  const monthEnd = year + "-" + pad(month + 1) + "-" + pad(daysInMonth);
  const todayStr = today.getFullYear() + "-" + pad(today.getMonth() + 1) + "-" + pad(today.getDate());
  const TYPE_INFO = { video: { color: "#818cf8", label: "영상" }, marketing: { color: "#fb923c", label: "마케팅" }, design: { color: "#f87171", label: "디자인" } };
  const withKind = function (list, kind) { return list.map(function (tk) { return Object.assign({}, tk, { kind: kind }); }); };
  let all = withKind(videoTasks, "video").concat(withKind(marketingTasks, "marketing")).concat(withKind(designTasks, "design"));
  all = all.filter(function (item) {
    if (!item.due) return false;
    const s = item.due, e = item.deadline && item.deadline > item.due ? item.deadline : item.due;
    return s <= monthEnd && e >= monthStart;
  });
  if (myOnly && currentUser) all = all.filter(function (item) { return item.assignee === currentUser.name; });
  all.sort(function (a, b) { return a.due < b.due ? -1 : a.due > b.due ? 1 : 0; });
  const dayToCol = function (ds) {
    const d = new Date(ds + "T00:00:00");
    if (d.getFullYear() === year && d.getMonth() === month) return d.getDate();
    return ds < monthStart ? 1 : daysInMonth;
  };
  const handleClick = function (item) {
    if (item.kind === "video") onSelectVideo(item);
    else if (item.kind === "marketing") onSelectMarketing(item);
    else onSelectDesign(item);
  };
  const goPrev = function () { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); };
  const goNext = function () { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); };
  const rowH = 34;
  const dayColW = 26;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={goPrev} style={{ background: t.surface2, border: "1px solid " + t.border, borderRadius: 9, width: 32, height: 32, cursor: "pointer", color: t.text3, display: "flex", alignItems: "center", justifyContent: "center" }}><ArrowLeft size={14} strokeWidth={2} /></button>
          <div style={{ fontSize: 16, fontWeight: 800, color: t.text }}>{year}년 {month + 1}월 타임라인</div>
          <button onClick={goNext} style={{ background: t.surface2, border: "1px solid " + t.border, borderRadius: 9, width: 32, height: 32, cursor: "pointer", color: t.text3, display: "flex", alignItems: "center", justifyContent: "center" }}><ArrowRight size={14} strokeWidth={2} /></button>
        </div>
        {currentUser ? <button onClick={function () { setMyOnly(!myOnly); }} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: myOnly ? "#6366f1" : t.surface2, border: "none", borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 700, color: myOnly ? "#fff" : t.text3, cursor: "pointer" }}><User size={12} strokeWidth={2} /> 내 업무만</button> : null}
      </div>
      <div style={{ display: "flex", gap: 14, marginBottom: 12, fontSize: 11, color: t.text4, flexWrap: "wrap" }}>
        {Object.keys(TYPE_INFO).map(function (k) { return <span key={k} style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 9, height: 9, borderRadius: 3, background: TYPE_INFO[k].color }} />{TYPE_INFO[k].label}</span>; })}
      </div>
      {all.length === 0 ? <EmptyState icon={Calendar} text="이번 달 표시할 일정이 없습니다" /> : (
        <div style={{ overflowX: "auto", border: "1px solid " + t.border, borderRadius: 14, background: t.surface }}>
          <div style={{ minWidth: 200 + daysInMonth * dayColW }}>
            <div style={{ display: "flex", borderBottom: "1px solid " + t.border, position: "sticky", top: 0, background: t.surface, zIndex: 2 }}>
              <div style={{ width: 200, flexShrink: 0, padding: "8px 12px", fontSize: 10, fontWeight: 700, color: t.text4, textTransform: "uppercase" }}>업무</div>
              {Array.from({ length: daysInMonth }, function (_, i) { return i + 1; }).map(function (dnum) {
                const ds = year + "-" + pad(month + 1) + "-" + pad(dnum);
                const isToday = ds === todayStr;
                const dow = new Date(ds + "T00:00:00").getDay();
                return <div key={dnum} style={{ width: dayColW, flexShrink: 0, textAlign: "center", padding: "8px 0", fontSize: 9.5, fontWeight: isToday ? 800 : 500, color: isToday ? "#818cf8" : (dow === 0 || dow === 6) ? "#f87171" : t.text4, background: isToday ? "#6366f118" : "transparent" }}>{dnum}</div>;
              })}
            </div>
            {all.map(function (item, ri) {
              const info = TYPE_INFO[item.kind];
              const startCol = dayToCol(item.due);
              const endCol = item.deadline && item.deadline > item.due ? dayToCol(item.deadline) : startCol;
              const overdue = item.due < todayStr && ((item.kind === "video" && item.status === STAGES[0]) || (item.kind !== "video" && item.status === (item.kind === "marketing" ? MARKETING_STAGES[0] : DESIGN_STAGES[0])));
              return (
                <div key={item.kind + "_" + item.id} style={{ display: "flex", alignItems: "center", borderBottom: ri === all.length - 1 ? "none" : "1px solid " + t.border, height: rowH }}>
                  <div onClick={function () { handleClick(item); }} style={{ width: 200, flexShrink: 0, padding: "0 12px", fontSize: 12, color: t.text2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                    <Avatar name={item.assignee} size={16} users={users} /><span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</span>
                  </div>
                  <div style={{ position: "relative", height: "100%", flex: 1, display: "flex" }}>
                    {Array.from({ length: daysInMonth }, function (_, i) { return i + 1; }).map(function (dnum) {
                      const ds = year + "-" + pad(month + 1) + "-" + pad(dnum);
                      const dow = new Date(ds + "T00:00:00").getDay();
                      return <div key={dnum} style={{ width: dayColW, flexShrink: 0, height: "100%", borderRight: "1px solid " + t.border, background: (dow === 0 || dow === 6) ? t.bg : "transparent" }} />;
                    })}
                    <div onClick={function () { handleClick(item); }} title={item.title} style={{ position: "absolute", left: (startCol - 1) * dayColW + 3, width: (endCol - startCol + 1) * dayColW - 6, top: 7, height: rowH - 14, borderRadius: 7, background: overdue ? "#f87171" : info.color, cursor: "pointer", display: "flex", alignItems: "center", paddingLeft: 8, boxShadow: "0 1px 3px #00000030" }}>
                      <span style={{ fontSize: 10, color: "#fff", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.status}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function CombinedCalendarView(props) {
  const { t } = useTheme();
  const { videoTasks, marketingTasks, designTasks, ads, onSelectVideo, onSelectMarketing, onSelectDesign, onSelectAd, users, onBulkDeleteVideo, onBulkAssignVideo, onBulkDeleteMarketing, onBulkAssignMarketing, onBulkDeleteDesign, onBulkAssignDesign } = props;
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [dayDetail, setDayDetail] = useState(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [bulkAssignee, setBulkAssignee] = useState("");
  const toggleSelect = function (id, kind) {
    setSelectedItems(function (prev) {
      const exists = prev.find(function (x) { return x.id === id && x.kind === kind; });
      if (exists) return prev.filter(function (x) { return !(x.id === id && x.kind === kind); });
      return prev.concat([{ id: id, kind: kind }]);
    });
  };
  const isSelected = function (id, kind) { return selectedItems.some(function (x) { return x.id === id && x.kind === kind; }); };
  const canBulk = !!(onBulkDeleteVideo || onBulkAssignVideo);
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
  const isInDateRangeCombined = function (item, ds) {
    if (item.deadline && item.deadline > item.due) return ds >= item.due && ds <= item.deadline && !isRestDay(ds);
    return item.due === ds;
  };
  const getDayItems = function (d) {
    const ds = dateStr(d);
    return allItems.filter(function (item) { return isInDateRangeCombined(item, ds); }).map(function (item) {
      return Object.assign({}, item, { isSpanStart: item.due === ds, isSpanEnd: item.deadline === ds, isSpanMiddle: item.deadline && item.due !== ds && item.deadline !== ds });
    });
  };
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
        <button onClick={goPrevMonth} style={{ background: t.surface2, border: "1px solid " + t.border, borderRadius: 10, padding: "7px 14px", color: t.text3, cursor: "pointer", fontSize: 14 }}>‹</button>
        <div style={{ textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 800, color: t.text }}>{year}년 {month + 1}월</div><div style={{ fontSize: 12, color: t.text4, marginTop: 2 }}>영상 {countByType.video} · 마케팅 {countByType.marketing} · 디자인 {countByType.design} · 광고 {countByType.adWork + countByType.adExpected}</div></div>
        <button onClick={goNextMonth} style={{ background: t.surface2, border: "1px solid " + t.border, borderRadius: 10, padding: "7px 14px", color: t.text3, cursor: "pointer", fontSize: 14 }}>›</button>
      </div>
      <div style={{ display: "flex", gap: 14, marginBottom: 14, flexWrap: "wrap" }}>
        {["video", "marketing", "design", "adWork", "adExpected"].map(function (k) { const LIcon = COMBINED_TYPE_INFO[k].icon; return <div key={k} style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 9, height: 9, borderRadius: 4, background: COMBINED_TYPE_INFO[k].color }} /><span style={{ fontSize: 11, color: t.text4, display: "flex", alignItems: "center", gap: 3 }}><LIcon size={11} strokeWidth={2} /> {COMBINED_TYPE_INFO[k].label}</span></div>; })}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}><Flag size={11} strokeWidth={2} color={t.text4} /><span style={{ fontSize: 11, color: t.text4 }}>공휴일</span></div>
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
            <div key={i} style={{ minHeight: 92, minWidth: 0, overflow: "hidden", background: cell.cur ? (isToday(cell.day) ? t.todayBg : t.surface) : t.bg, borderRadius: 14, padding: "8px 8px 6px", border: "1px solid " + (isHoliday ? "#f8717150" : t.border), boxShadow: isToday(cell.day) ? "0 0 0 2px #6366f1" : "none", boxSizing: "border-box" }}>
              <div style={{ fontSize: 12, fontWeight: isToday(cell.day) || isHoliday ? 800 : 500, color: !cell.cur ? t.border2 : isToday(cell.day) ? "#818cf8" : isHoliday ? "#f87171" : weekdayColor(colIdx), marginBottom: isHoliday ? 1 : 4, display: "flex", justifyContent: "space-between" }}>
                <span>{cell.day}</span>
                {isToday(cell.day) ? <span style={{ fontSize: 9, background: "#6366f1", color: "#fff", borderRadius: 99, padding: "1px 5px", fontWeight: 700, flexShrink: 0 }}>오늘</span> : null}
              </div>
              {holidayName ? <div style={{ fontSize: 9, color: "#f87171", fontWeight: 600, marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "flex", alignItems: "center", gap: 3 }}><Flag size={9} strokeWidth={2} /> {holidayName}</div> : null}
              {dayItems.slice(0, 3).map(function (item) {
                const info = COMBINED_TYPE_INFO[item.kind];
                const ItemIcon = info.icon;
                const isContinuation = item.isSpanMiddle || item.isSpanEnd;
                const isMultiDayStart = item.isSpanStart && item.deadline && item.deadline !== item.due;
                const chipRadius = isMultiDayStart ? "7px 3px 3px 7px" : (isContinuation ? "3px 7px 7px 3px" : 7);
                return <div key={item.kind + "_" + item.id} onClick={function () { handleItemClick(item); }} style={{ display: "flex", alignItems: "center", gap: 3, background: info.color + "22", border: "none", borderRadius: chipRadius, padding: "3px 6px", fontSize: 10, color: info.color, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", cursor: "pointer", maxWidth: "100%", boxSizing: "border-box" }}>{isContinuation ? <span style={{ flexShrink: 0 }}>›</span> : <ItemIcon size={9} strokeWidth={2.5} style={{ flexShrink: 0 }} />}<span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</span></div>;
              })}
              {dayItems.length > 3 ? <div onClick={function (e) { e.stopPropagation(); setDayDetail({ date: dateStr(cell.day), items: dayItems }); }} style={{ fontSize: 10, color: "#818cf8", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>+{dayItems.length - 3}개 더보기</div> : null}
            </div>
          );
        })}
      </div>
      {monthItems.length > 0 ? (
        <div style={{ marginTop: 18, background: t.surface, borderRadius: 16, border: "1px solid " + t.border, overflow: "hidden" }}>
          <div style={{ padding: "11px 18px", borderBottom: "1px solid " + t.border, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: t.text4, textTransform: "uppercase", letterSpacing: ".5px" }}>{month + 1}월 전체 일정 ({monthItems.length})</span>
            {canBulk ? <button onClick={function () { setSelectMode(!selectMode); setSelectedItems([]); }} style={{ background: selectMode ? "#6366f1" : t.surface2, border: "1px solid " + (selectMode ? "#6366f1" : t.border), borderRadius: 10, padding: "6px 12px", fontWeight: 700, fontSize: 11, color: selectMode ? "#fff" : t.text3, cursor: "pointer" }}><span style={{display:"inline-flex",alignItems:"center",gap:5}}>{selectMode ? null : <CheckCircle2 size={12} strokeWidth={2} />}{selectMode ? "선택 모드 종료" : "선택 모드"}</span></button> : null}
          </div>
          {selectMode && selectedItems.length > 0 ? (
            <div style={{ padding: "10px 18px", borderBottom: "1px solid " + t.border, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", background: "#6366f110" }}>
              <span style={{ fontSize: 12, color: "#818cf8", fontWeight: 700 }}>{selectedItems.length}개 선택됨</span>
              <select value={bulkAssignee} onChange={function (e) { setBulkAssignee(e.target.value); }} style={{ background: t.inputBg, border: "1px solid " + t.inputBorder, borderRadius: 10, padding: "6px 10px", fontSize: 12, color: t.text, outline: "none" }}><option value="">담당자 선택</option>{(users || []).filter(function (u) { return u.approved && u.role !== "admin"; }).map(function (u) { return <option key={u.name} value={u.name}>{u.name}</option>; })}</select>
              <button onClick={function () {
                if (!bulkAssignee) return;
                const byKind = { video: [], marketing: [], design: [] };
                selectedItems.forEach(function (x) { if (byKind[x.kind]) byKind[x.kind].push(x.id); });
                if (byKind.video.length && onBulkAssignVideo) onBulkAssignVideo(byKind.video, bulkAssignee);
                if (byKind.marketing.length && onBulkAssignMarketing) onBulkAssignMarketing(byKind.marketing, bulkAssignee);
                if (byKind.design.length && onBulkAssignDesign) onBulkAssignDesign(byKind.design, bulkAssignee);
                setSelectedItems([]); setBulkAssignee("");
              }} style={{ background: "#6366f118", border: "1px solid #6366f130", borderRadius: 10, padding: "6px 12px", fontSize: 12, cursor: "pointer", color: "#818cf8", fontWeight: 700 }}>일괄 담당자 변경</button>
              <button onClick={function () {
                if (!window.confirm(selectedItems.length + "개 항목을 삭제하시겠습니까?")) return;
                const byKind = { video: [], marketing: [], design: [] };
                selectedItems.forEach(function (x) { if (byKind[x.kind]) byKind[x.kind].push(x.id); });
                if (byKind.video.length && onBulkDeleteVideo) onBulkDeleteVideo(byKind.video);
                if (byKind.marketing.length && onBulkDeleteMarketing) onBulkDeleteMarketing(byKind.marketing);
                if (byKind.design.length && onBulkDeleteDesign) onBulkDeleteDesign(byKind.design);
                setSelectedItems([]);
              }} style={{ background: "#f8717118", border: "1px solid #f8717130", borderRadius: 10, padding: "6px 12px", fontSize: 12, cursor: "pointer", color: "#f87171", fontWeight: 700 }}>일괄 삭제</button>
            </div>
          ) : null}
          {monthItems.map(function (item, i) {
            const isLast = i === monthItems.length - 1;
            const info = COMBINED_TYPE_INFO[item.kind];
            const selectable = selectMode && (item.kind === "video" || item.kind === "marketing" || item.kind === "design");
            const checked = selectable && isSelected(item.id, item.kind);
            return (
              <div key={item.kind + "_" + item.id} onClick={function () { if (selectable) toggleSelect(item.id, item.kind); else handleItemClick(item); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 18px", borderBottom: isLast ? "none" : "1px solid " + t.border, cursor: "pointer", background: checked ? "#6366f118" : "transparent" }}>
                {selectMode ? (selectable ? <input type="checkbox" checked={checked} onChange={function () { toggleSelect(item.id, item.kind); }} onClick={function (e) { e.stopPropagation(); }} style={{ width: 15, height: 15, accentColor: "#6366f1", cursor: "pointer", flexShrink: 0 }} /> : <span style={{ width: 15, flexShrink: 0 }} />) : null}
                <div style={{ width: 3, height: 30, borderRadius: 99, background: info.color, flexShrink: 0 }} />
                <span style={{ fontSize: 10, background: info.color + "20", color: info.color, borderRadius: 20, padding: "2px 8px", fontWeight: 700, flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 3 }}><info.icon size={10} strokeWidth={2.5} /> {info.label}</span>
                <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 600, color: t.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</div>{item.assignee ? <div style={{ fontSize: 11, color: t.text4, marginTop: 1 }}>{item.assignee} · {item.status}</div> : null}</div>
                <span style={{ fontSize: 11, color: t.text4, flexShrink: 0 }}>{item.due.slice(5)}</span>
              </div>
            );
          })}
        </div>
      ) : null}
      {dayDetail ? (
        <div onClick={function () { setDayDetail(null); }} style={{ position: "fixed", inset: 0, background: "#00000099", zIndex: 250, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
          <div onClick={function (e) { e.stopPropagation(); }} style={{ background: t.surface, borderRadius: 20, width: "min(92vw, 420px)", maxHeight: "80vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 64px #000c" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid " + t.border, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: t.text }}>{dayDetail.date} 일정 ({dayDetail.items.length})</div>
              <button onClick={function () { setDayDetail(null); }} style={{ background: "none", border: "none", color: t.text5, cursor: "pointer", fontSize: 20 }}>×</button>
            </div>
            <div style={{ padding: "8px 12px", overflowY: "auto" }}>
              {dayDetail.items.map(function (item) {
                const info = COMBINED_TYPE_INFO[item.kind];
                return (
                  <div key={item.kind + "_" + item.id} onClick={function () { setDayDetail(null); handleItemClick(item); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 10px", borderRadius: 11, cursor: "pointer", marginBottom: 3 }}>
                    <span style={{ fontSize: 10, background: info.color + "20", color: info.color, borderRadius: 20, padding: "2px 8px", fontWeight: 700, flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 3 }}><info.icon size={10} strokeWidth={2.5} /> {info.label}</span>
                    <span style={{ fontSize: 13, color: t.text, flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</span>
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

function BoardView(props) {
  const { t } = useTheme();
  const { tasks, onSelectTask, onMove, onDelete, users, ads, onSelectAd, designTasks, onSelectDesign, marketingTasks, onSelectMarketing, onBulkDeleteTasks, onBulkAssignTasks, onBulkDeleteMarketing, onBulkAssignMarketing, onBulkDeleteDesign, onBulkAssignDesign, currentUser, wipLimits } = props;
  const [selectMode, setSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [bulkAssignee, setBulkAssignee] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const toggleSelect = function (id, type) {
    setSelectedItems(function (prev) {
      const exists = prev.find(function (x) { return x.id === id && x.type === type; });
      if (exists) return prev.filter(function (x) { return !(x.id === id && x.type === type); });
      return prev.concat([{ id: id, type: type }]);
    });
  };
  const isSelected = function (id, type) { return selectedItems.some(function (x) { return x.id === id && x.type === type; }); };
  const canBulk = !!(onBulkDeleteTasks || onBulkAssignTasks);
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
  let filteredMarketing = marketingTasks || [];
  if (filterMember !== "전체") filteredMarketing = filteredMarketing.filter(function (mt) { return mt.assignee === filterMember; });
  if (monthFilter === "month") { const prefix = selYear + "-" + pad(selMonth); filteredMarketing = filteredMarketing.filter(function (mt) { return mt.due && mt.due.indexOf(prefix) === 0; }); }
  if (categoryFilter !== "all") {
    const sepIdx = categoryFilter.indexOf(":");
    const catType = categoryFilter.slice(0, sepIdx);
    const catValue = categoryFilter.slice(sepIdx + 1);
    filtered = catType === "video" ? filtered.filter(function (tk) { return tk.category === catValue; }) : [];
    filteredMarketing = catType === "marketing" ? filteredMarketing.filter(function (mt) { return mt.tag === catValue; }) : [];
    filteredDesign = catType === "design" ? filteredDesign.filter(function (dt) { return dt.tag === catValue; }) : [];
    filteredAds = catType === "ad" ? filteredAds : [];
  }
  const filterBtnStyle = function (active) { return { padding: "5px 14px", borderRadius: 20, border: "1px solid " + (active ? "#6366f1" : t.border), background: active ? "#6366f120" : "transparent", cursor: "pointer", fontSize: 12, fontWeight: 600, color: active ? "#818cf8" : t.text4 }; };
  const todayStr = today.getFullYear() + "-" + pad(today.getMonth() + 1) + "-" + pad(today.getDate());
  const isOverdueVideo = function (tk) { return tk.due && tk.due < todayStr && tk.status === STAGES[0]; };
  const isOverdueDesign = function (dt) { return dt.due && dt.due < todayStr && dt.status === DESIGN_STAGES[0]; };
  const isOverdueMarketing = function (mt) { return mt.due && mt.due < todayStr && mt.status === MARKETING_STAGES[0]; };
  const totalItems = filtered.length + filteredAds.length + filteredDesign.length + filteredMarketing.length;
  const doneItems = filtered.filter(function (tk) { return tk.status === "업무 완료"; }).length + filteredAds.filter(function (ad) { return getAdBoardStatus(ad) === "업무 완료"; }).length + filteredDesign.filter(function (dt) { return dt.status === "완료"; }).length + filteredMarketing.filter(function (mt) { return mt.status === "완료"; }).length;
  const doneRate = totalItems ? Math.round(doneItems / totalItems * 100) : 0;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))", gap: 10, marginBottom: 12 }}>
        {[["전체", null, totalItems, "#6366f1"], ["영상", Film, filtered.length, "#818cf8"], ["마케팅", CalendarDays, filteredMarketing.length, "#fb923c"], ["광고", Megaphone, filteredAds.length, "#fbbf24"], ["디자인", Palette, filteredDesign.length, "#f87171"]].map(function (item) {
          const CardIcon = item[1];
          return <div key={item[0]} style={{ background: t.surface, border: "1px solid " + t.border, borderRadius: 14, padding: "12px 0", textAlign: "center" }}><div style={{ fontSize: 22, fontWeight: 900, color: item[3] }}>{item[2]}</div><div style={{ fontSize: 11, color: t.text4, marginTop: 3, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>{CardIcon ? <CardIcon size={11} strokeWidth={2} /> : null}{item[0]}</div></div>;
        })}
      </div>
      <div style={{ background: t.surface, border: "1px solid " + t.border, borderRadius: 14, padding: "12px 16px", marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: t.text4, textTransform: "uppercase", letterSpacing: ".5px" }}>전체 완료율</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: "#34d399" }}>{doneRate}% ({doneItems}/{totalItems})</span>
        </div>
        <div style={{ background: t.bg, borderRadius: 99, height: 7 }}><div style={{ width: doneRate + "%", background: "linear-gradient(90deg,#6366f1,#34d399)", height: "100%", borderRadius: 99, transition: "width .3s" }} /></div>
      </div>
      <div style={{ fontSize: 11, color: t.text4, marginBottom: 10, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ display: "inline-flex", width: 10, height: 10, borderRadius: 4, background: "#818cf8" }} /><Film size={11} strokeWidth={2} /> 영상 캘린더 항목</span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ display: "inline-flex", width: 10, height: 10, borderRadius: 4, background: "#fb923c" }} /><CalendarDays size={11} strokeWidth={2} /> 마케팅 캘린더 항목</span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ display: "inline-flex", width: 10, height: 10, borderRadius: 4, background: "#fbbf24" }} /><Megaphone size={11} strokeWidth={2} /> 광고 제작 관리 항목</span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ display: "inline-flex", width: 10, height: 10, borderRadius: 4, background: "#f87171" }} /><Palette size={11} strokeWidth={2} /> 디자인 캘린더 항목</span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ display: "inline-flex", width: 10, height: 10, borderRadius: 4, background: "#f87171", border: "1px solid #fff" }} /><Clock size={11} strokeWidth={2} /> 시작 지연 (시작일 지났는데 기획 단계)</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        <button onClick={function () {
          const rows = filtered.map(function (tk) { return { 유형: "영상", 제목: tk.title, 담당자: tk.assignee, 우선순위: tk.priority, 카테고리: tk.tag, 단계: tk.status, 작업시작일: tk.due }; })
            .concat(filteredMarketing.map(function (mt) { return { 유형: "마케팅", 제목: mt.title, 담당자: mt.assignee, 우선순위: mt.priority, 카테고리: mt.tag, 단계: mt.status, 작업시작일: mt.due }; }))
            .concat(filteredDesign.map(function (dt) { return { 유형: "디자인", 제목: dt.title, 담당자: dt.assignee, 우선순위: dt.priority, 카테고리: dt.tag, 단계: dt.status, 작업시작일: dt.due }; }));
          downloadCSV("제작보드_" + today.getFullYear() + ".csv", rows);
        }} style={{ display: "flex", alignItems: "center", gap: 6, background: t.surface2, border: "1px solid " + t.border, borderRadius: 11, padding: "7px 14px", fontWeight: 700, fontSize: 12, color: t.text3, cursor: "pointer" }}><Download size={13} strokeWidth={2} /> CSV 내보내기</button>
        {canBulk ? <button onClick={function () { setSelectMode(!selectMode); setSelectedItems([]); }} style={{ background: selectMode ? "#6366f1" : t.surface2, border: "1px solid " + (selectMode ? "#6366f1" : t.border), borderRadius: 11, padding: "7px 14px", fontWeight: 700, fontSize: 12, color: selectMode ? "#fff" : t.text3, cursor: "pointer" }}><span style={{display:"inline-flex",alignItems:"center",gap:5}}>{selectMode ? null : <CheckCircle2 size={12} strokeWidth={2} />}{selectMode ? "선택 모드 종료" : "선택 모드"}</span></button> : null}
        {selectMode && selectedItems.length > 0 ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: "#818cf8", fontWeight: 700 }}>{selectedItems.length}개 선택됨</span>
            <select value={bulkAssignee} onChange={function (e) { setBulkAssignee(e.target.value); }} style={{ background: t.inputBg, border: "1px solid " + t.inputBorder, borderRadius: 10, padding: "6px 10px", fontSize: 12, color: t.text, outline: "none" }}><option value="">담당자 선택</option>{users.filter(function (u) { return u.approved && u.role !== "admin"; }).map(function (u) { return <option key={u.name} value={u.name}>{u.name}</option>; })}</select>
            <button onClick={function () {
              if (!bulkAssignee) return;
              const byType = { video: [], marketing: [], design: [] };
              selectedItems.forEach(function (x) { byType[x.type].push(x.id); });
              if (byType.video.length && onBulkAssignTasks) onBulkAssignTasks(byType.video, bulkAssignee);
              if (byType.marketing.length && onBulkAssignMarketing) onBulkAssignMarketing(byType.marketing, bulkAssignee);
              if (byType.design.length && onBulkAssignDesign) onBulkAssignDesign(byType.design, bulkAssignee);
              setSelectedItems([]); setBulkAssignee("");
            }} style={{ background: "#6366f118", border: "1px solid #6366f130", borderRadius: 10, padding: "6px 12px", fontSize: 12, cursor: "pointer", color: "#818cf8", fontWeight: 700 }}>일괄 담당자 변경</button>
            <button onClick={function () {
              if (!window.confirm(selectedItems.length + "개 항목을 삭제하시겠습니까?")) return;
              const byType = { video: [], marketing: [], design: [] };
              selectedItems.forEach(function (x) { byType[x.type].push(x.id); });
              if (byType.video.length && onBulkDeleteTasks) onBulkDeleteTasks(byType.video);
              if (byType.marketing.length && onBulkDeleteMarketing) onBulkDeleteMarketing(byType.marketing);
              if (byType.design.length && onBulkDeleteDesign) onBulkDeleteDesign(byType.design);
              setSelectedItems([]);
            }} style={{ background: "#f8717118", border: "1px solid #f8717130", borderRadius: 10, padding: "6px 12px", fontSize: 12, cursor: "pointer", color: "#f87171", fontWeight: 700 }}>일괄 삭제</button>
          </div>
        ) : null}
      </div>
      <div style={{ background: t.surface, borderRadius: 14, border: "1px solid " + t.border, padding: "12px 14px", marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: t.text4, marginBottom: 9, textTransform: "uppercase", letterSpacing: ".5px" }}>기간 필터</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <button style={filterBtnStyle(monthFilter === "all")} onClick={function () { setMonthFilter("all"); }}>전체 기간</button>
          <button style={filterBtnStyle(monthFilter === "month")} onClick={function () { setMonthFilter("month"); }}>월별 보기</button>
          {monthFilter === "month" ? (
            <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <select value={selYear} onChange={function (e) { setSelYear(Number(e.target.value)); }} style={{ background: t.inputBg, border: "1px solid " + t.inputBorder, borderRadius: 10, padding: "5px 10px", fontSize: 12, color: t.text, outline: "none" }}>{years.map(function (y) { return <option key={y}>{y}</option>; })}</select>
              <select value={selMonth} onChange={function (e) { setSelMonth(Number(e.target.value)); }} style={{ background: t.inputBg, border: "1px solid " + t.inputBorder, borderRadius: 10, padding: "5px 10px", fontSize: 12, color: t.text, outline: "none" }}>{[1,2,3,4,5,6,7,8,9,10,11,12].map(function (mNum) { return <option key={mNum} value={mNum}>{mNum}월</option>; })}</select>
            </span>
          ) : null}
          <span style={{ fontSize: 12, color: t.text4, marginLeft: "auto" }}>{totalItems}개 항목</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        {memberNames.map(function (m) { return <button key={m} onClick={function () { setFilterMember(m); }} style={filterBtnStyle(filterMember === m)}>{m}</button>; })}
        {currentUser ? <button onClick={function () { setFilterMember(filterMember === currentUser.name ? "전체" : currentUser.name); }} style={Object.assign({}, filterBtnStyle(filterMember === currentUser.name), { display: "inline-flex", alignItems: "center", gap: 5 })}><User size={12} strokeWidth={2} /> 내 업무만</button> : null}
        <select value={categoryFilter} onChange={function (e) { setCategoryFilter(e.target.value); }} style={{ background: t.inputBg, border: "1px solid " + t.inputBorder, borderRadius: 9, padding: "5px 10px", fontSize: 12, color: t.text, outline: "none", cursor: "pointer", marginLeft: "auto" }}>
          <option value="all">업무 종류: 전체</option>
          <optgroup label="영상">{TASK_CATEGORIES.map(function (c) { return <option key={"v_" + c} value={"video:" + c}>{c}</option>; })}</optgroup>
          <optgroup label="마케팅">{MARKETING_TAGS.map(function (c) { return <option key={"m_" + c} value={"marketing:" + c}>{c}</option>; })}</optgroup>
          <optgroup label="디자인">{DESIGN_TAGS.map(function (c) { return <option key={"d_" + c} value={"design:" + c}>{c}</option>; })}</optgroup>
        </select>
      </div>
      <div style={{ overflowX: "auto", overflowY: "hidden", WebkitOverflowScrolling: "touch", paddingBottom: 4, margin: "0 -2px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(200px,1fr))", gap: 12, minWidth: 900 }}>
        {STAGES.map(function (col) {
          const colTasks = filtered.filter(function (tk) { return tk.status === col; });
          const colAds = filteredAds.filter(function (ad) { return getAdBoardStatus(ad) === col; });
          const colDesign = filteredDesign.filter(function (dt) { return getDesignBoardStatus(dt) === col; });
          const colMarketing = filteredMarketing.filter(function (mt) { return getMarketingBoardStatus(mt) === col; });
          const colTotal = colTasks.length + colAds.length + colDesign.length + colMarketing.length;
          return (
            <div key={col} style={{ background: t.surface, borderRadius: 18, padding: "14px 10px 10px", boxShadow: "0 1px 3px #00000015", borderTop: "3px solid " + STAGE_COLOR[col] }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 11, background: STAGE_COLOR[col] + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{(function () { const SIcon = STAGE_ICON[col]; return <SIcon size={15} strokeWidth={2} color={STAGE_COLOR[col]} />; })()}</div>
                <span style={{ fontWeight: 800, fontSize: 13, color: t.text2 }}>{col}</span>
                {wipLimits && wipLimits[col] ? (
                  <span style={{ marginLeft: "auto", background: colTotal > wipLimits[col] ? "#f87171" : STAGE_COLOR[col], color: "#fff", borderRadius: 99, padding: "2px 9px", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", gap: 3 }}>{colTotal > wipLimits[col] ? <AlertTriangle size={10} strokeWidth={2.5} /> : null}{colTotal}/{wipLimits[col]}</span>
                ) : (
                  <span style={{ marginLeft: "auto", background: STAGE_COLOR[col], color: "#fff", borderRadius: 99, padding: "2px 9px", fontSize: 11, fontWeight: 800 }}>{colTotal}</span>
                )}
              </div>
              {wipLimits && wipLimits[col] && colTotal > wipLimits[col] ? <div style={{ fontSize: 10, color: "#f87171", marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}><AlertTriangle size={10} strokeWidth={2} /> 제한 인원({wipLimits[col]}개)을 초과했어요</div> : null}
              <div style={{ background: t.bg, borderRadius: 99, height: 4, marginBottom: 12 }}><div style={{ width: totalItems ? (colTotal / totalItems * 100) + "%" : "0%", background: STAGE_COLOR[col], height: "100%", borderRadius: 99 }} /></div>
              {colTasks.map(function (tk) {
                const overdue = isOverdueVideo(tk);
                const checked = isSelected(tk.id, "video");
                return (
                  <div key={tk.id} onClick={function () { if (selectMode) toggleSelect(tk.id, "video"); else onSelectTask(tk); }} style={{ display: "flex", background: checked ? "#6366f118" : t.surface2, borderRadius: 14, marginBottom: 9, cursor: "pointer", overflow: "hidden", boxShadow: checked ? "0 0 0 2px #6366f1" : overdue ? "0 0 0 2px #f8717170" : "0 1px 3px #00000020", border: "none" }}>
                    <div style={{ width: 4, background: "#818cf8", flexShrink: 0 }} />
                    {selectMode ? <div style={{ display: "flex", alignItems: "center", padding: "0 0 0 10px" }}><input type="checkbox" checked={checked} onChange={function () { toggleSelect(tk.id, "video"); }} onClick={function (e) { e.stopPropagation(); }} style={{ width: 15, height: 15, accentColor: "#6366f1", cursor: "pointer" }} /></div> : null}
                    <div style={{ flex: 1, padding: "10px 12px", minWidth: 0 }}>
                      {getThumbnailUrl(tk.fileUrl) ? <img src={getThumbnailUrl(tk.fileUrl)} alt="" style={{ width: "100%", height: 72, objectFit: "cover", borderRadius: 8, marginBottom: 7, display: "block" }} /> : null}
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: 13, color: t.text, flex: 1 }}>{tk.title}</span>
                        {onDelete && !selectMode ? <button onClick={function (e) { e.stopPropagation(); onDelete(tk.id); }} style={{ background: "none", border: "none", color: t.text5, cursor: "pointer", fontSize: 14, padding: 0 }}>×</button> : null}
                      </div>
                      <div style={{ display: "flex", gap: 5, marginBottom: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 10, color: PRIORITY_COLOR[tk.priority], background: PRIORITY_COLOR[tk.priority] + "18", padding: "2px 7px", borderRadius: 20, fontWeight: 700 }}>{tk.priority}</span>
                        <span style={{ fontSize: 10, color: TAG_COLOR[tk.tag] || "#818cf8", background: (TAG_COLOR[tk.tag] || "#818cf8") + "18", padding: "2px 7px", borderRadius: 20, fontWeight: 700 }}>{tk.tag}</span>
                        {tk.deadline ? <span style={{ fontSize: 10, color: tk.deadline < todayStr ? "#f87171" : "#fb923c", background: (tk.deadline < todayStr ? "#f87171" : "#fb923c") + "18", padding: "2px 7px", borderRadius: 20, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 3 }}><Clock size={9} strokeWidth={2.5} /> {tk.deadline.slice(5)}</span> : null}
                        {overdue ? <span style={{ fontSize: 10, color: "#f87171", background: "#f8717120", padding: "2px 7px", borderRadius: 20, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 3 }}><Clock size={9} strokeWidth={2.5} /> 지연</span> : null}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}><Avatar name={tk.assignee} size={18} users={users} /><span style={{ fontSize: 11, color: t.text3 }}>{tk.assignee}</span></div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>{(tk.subtasks || []).length > 0 ? <span style={{ fontSize: 10, color: t.text4, display: "flex", alignItems: "center", gap: 2 }}><CheckCircle2 size={10} strokeWidth={2} />{tk.subtasks.filter(function (s) { return s.done; }).length}/{tk.subtasks.length}</span> : null}{(tk.comments || []).length > 0 ? <span style={{ fontSize: 10, color: t.text4, display: "flex", alignItems: "center", gap: 2 }}><MessageCircle size={10} strokeWidth={2} />{tk.comments.length}</span> : null}{tk.fileUrl ? <Paperclip size={10} strokeWidth={2} color={t.text4} /> : null}<span style={{ fontSize: 10, color: overdue ? "#f87171" : t.text4, fontWeight: overdue ? 700 : 400 }}>{tk.due && tk.due.slice(5)}</span></div>
                      </div>
                      {onMove && !selectMode ? (
                        <div style={{ display: "flex", gap: 5 }} onClick={function (e) { e.stopPropagation(); }}>
                          {STAGES.indexOf(tk.status) > 0 ? <button onClick={function () { onMove(tk.id, -1); }} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 3, background: t.bg, border: "1px solid " + t.border, borderRadius: 7, padding: "4px 0", fontSize: 10, cursor: "pointer", color: t.text4 }}><ArrowLeft size={10} strokeWidth={2} /> 이전</button> : null}
                          {STAGES.indexOf(tk.status) < STAGES.length - 1 ? <button onClick={function () { onMove(tk.id, 1); }} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 3, background: "#6366f118", border: "1px solid #6366f130", borderRadius: 7, padding: "4px 0", fontSize: 10, cursor: "pointer", color: "#818cf8", fontWeight: 700 }}>다음 <ArrowRight size={10} strokeWidth={2} /></button> : null}
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
              {colAds.map(function (ad) {
                return (
                  <div key={ad.id} onClick={function () { if (onSelectAd) onSelectAd(ad); }} style={{ display: "flex", background: t.surface2, borderRadius: 14, marginBottom: 9, cursor: "pointer", overflow: "hidden", boxShadow: "0 1px 3px #00000020", border: "none" }}>
                    <div style={{ width: 4, background: "#fbbf24", flexShrink: 0 }} />
                    <div style={{ flex: 1, padding: "10px 12px", minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: 13, color: t.text, flex: 1, display: "flex", alignItems: "center", gap: 5 }}><Megaphone size={13} strokeWidth={2} /> {ad.content || "광고"}</span>
                      </div>
                      <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
                        <span style={{ fontSize: 10, color: WORK_COLOR[ad.workStatus] || t.text4, background: (WORK_COLOR[ad.workStatus] || t.text4) + "18", padding: "2px 7px", borderRadius: 20, fontWeight: 700 }}>{ad.workStatus || "대기"}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 11, color: t.text3 }}>{ad.requester || "미배정"}</span>
                        <span style={{ fontSize: 10, color: t.text4 }}>{(ad.workDate || ad.expectedDate || "").slice(5)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {colDesign.map(function (dt) {
                const overdue = isOverdueDesign(dt);
                const checked = isSelected(dt.id, "design");
                return (
                  <div key={dt.id} onClick={function () { if (selectMode) toggleSelect(dt.id, "design"); else if (onSelectDesign) onSelectDesign(dt); }} style={{ display: "flex", background: checked ? "#6366f118" : t.surface2, borderRadius: 14, marginBottom: 9, cursor: "pointer", overflow: "hidden", boxShadow: checked ? "0 0 0 2px #6366f1" : overdue ? "0 0 0 2px #f8717170" : "0 1px 3px #00000020", border: "none" }}>
                    <div style={{ width: 4, background: "#f87171", flexShrink: 0 }} />
                    {selectMode ? <div style={{ display: "flex", alignItems: "center", padding: "0 0 0 10px" }}><input type="checkbox" checked={checked} onChange={function () { toggleSelect(dt.id, "design"); }} onClick={function (e) { e.stopPropagation(); }} style={{ width: 15, height: 15, accentColor: "#6366f1", cursor: "pointer" }} /></div> : null}
                    <div style={{ flex: 1, padding: "10px 12px", minWidth: 0 }}>
                      {getThumbnailUrl(dt.fileUrl) ? <img src={getThumbnailUrl(dt.fileUrl)} alt="" style={{ width: "100%", height: 72, objectFit: "cover", borderRadius: 8, marginBottom: 7, display: "block" }} /> : null}
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: 13, color: t.text, flex: 1, display: "flex", alignItems: "center", gap: 5 }}><Palette size={13} strokeWidth={2} /> {dt.title}</span>
                      </div>
                      <div style={{ display: "flex", gap: 5, marginBottom: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 10, color: DESIGN_TAG_COLOR[dt.tag] || "#818cf8", background: (DESIGN_TAG_COLOR[dt.tag] || "#818cf8") + "18", padding: "2px 7px", borderRadius: 20, fontWeight: 700 }}>{dt.tag}</span>
                        {dt.deadline ? <span style={{ fontSize: 10, color: dt.deadline < todayStr ? "#f87171" : "#fb923c", background: (dt.deadline < todayStr ? "#f87171" : "#fb923c") + "18", padding: "2px 7px", borderRadius: 20, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 3 }}><Clock size={9} strokeWidth={2.5} /> {dt.deadline.slice(5)}</span> : null}
                        {overdue ? <span style={{ fontSize: 10, color: "#f87171", background: "#f8717120", padding: "2px 7px", borderRadius: 20, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 3 }}><Clock size={9} strokeWidth={2.5} /> 지연</span> : null}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}><Avatar name={dt.assignee} size={18} users={users} /><span style={{ fontSize: 11, color: t.text3 }}>{dt.assignee}</span></div>
                        <span style={{ fontSize: 10, color: overdue ? "#f87171" : t.text4, fontWeight: overdue ? 700 : 400 }}>{dt.due && dt.due.slice(5)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {colMarketing.map(function (mt) {
                const overdue = isOverdueMarketing(mt);
                const checked = isSelected(mt.id, "marketing");
                return (
                  <div key={mt.id} onClick={function () { if (selectMode) toggleSelect(mt.id, "marketing"); else if (onSelectMarketing) onSelectMarketing(mt); }} style={{ display: "flex", background: checked ? "#6366f118" : t.surface2, borderRadius: 14, marginBottom: 9, cursor: "pointer", overflow: "hidden", boxShadow: checked ? "0 0 0 2px #6366f1" : overdue ? "0 0 0 2px #f8717170" : "0 1px 3px #00000020", border: "none" }}>
                    <div style={{ width: 4, background: "#fb923c", flexShrink: 0 }} />
                    {selectMode ? <div style={{ display: "flex", alignItems: "center", padding: "0 0 0 10px" }}><input type="checkbox" checked={checked} onChange={function () { toggleSelect(mt.id, "marketing"); }} onClick={function (e) { e.stopPropagation(); }} style={{ width: 15, height: 15, accentColor: "#6366f1", cursor: "pointer" }} /></div> : null}
                    <div style={{ flex: 1, padding: "10px 12px", minWidth: 0 }}>
                      {getThumbnailUrl(mt.fileUrl) ? <img src={getThumbnailUrl(mt.fileUrl)} alt="" style={{ width: "100%", height: 72, objectFit: "cover", borderRadius: 8, marginBottom: 7, display: "block" }} /> : null}
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: 13, color: t.text, flex: 1, display: "flex", alignItems: "center", gap: 5 }}><CalendarDays size={13} strokeWidth={2} /> {mt.title}</span>
                      </div>
                      <div style={{ display: "flex", gap: 5, marginBottom: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 10, color: MARKETING_TAG_COLOR[mt.tag] || "#818cf8", background: (MARKETING_TAG_COLOR[mt.tag] || "#818cf8") + "18", padding: "2px 7px", borderRadius: 20, fontWeight: 700 }}>{mt.tag}</span>
                        {mt.deadline ? <span style={{ fontSize: 10, color: mt.deadline < todayStr ? "#f87171" : "#fb923c", background: (mt.deadline < todayStr ? "#f87171" : "#fb923c") + "18", padding: "2px 7px", borderRadius: 20, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 3 }}><Clock size={9} strokeWidth={2.5} /> {mt.deadline.slice(5)}</span> : null}
                        {overdue ? <span style={{ fontSize: 10, color: "#f87171", background: "#f8717120", padding: "2px 7px", borderRadius: 20, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 3 }}><Clock size={9} strokeWidth={2.5} /> 지연</span> : null}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}><Avatar name={mt.assignee} size={18} users={users} /><span style={{ fontSize: 11, color: t.text3 }}>{mt.assignee}</span></div>
                        <span style={{ fontSize: 10, color: overdue ? "#f87171" : t.text4, fontWeight: overdue ? 700 : 400 }}>{mt.due && mt.due.slice(5)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {colTotal === 0 ? <div style={{ textAlign: "center", padding: "22px 0", color: t.text5, fontSize: 12 }}>비어있음</div> : null}
            </div>
          );
        })}
        </div>
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
  const s = { background: t.surface, borderRadius: 15, padding: "16px 18px", border: "1px solid " + t.border };
  const inp = { width: "100%", background: t.inputBg, border: "1px solid " + t.inputBorder, borderRadius: 11, padding: "8px 12px", fontSize: 13, color: t.text, boxSizing: "border-box", outline: "none" };
  const secBtn = function (v, l, Icon) { return <button key={v} onClick={function () { setActiveSection(v); }} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 13px", borderRadius: 20, border: "1px solid " + (activeSection === v ? "#6366f1" : t.border), background: activeSection === v ? "#6366f120" : "transparent", cursor: "pointer", fontSize: 12, fontWeight: activeSection === v ? 700 : 500, color: activeSection === v ? "#818cf8" : t.text4 }}>{Icon ? <Icon size={12} strokeWidth={2} /> : null}{l}</button>; };
  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <div style={{ background: "linear-gradient(135deg,#6366f1,#ec4899)", borderRadius: 16, padding: "16px 22px", marginBottom: 18, display: "flex", alignItems: "center", gap: 12 }}>
        <Search size={24} strokeWidth={1.75} color="#fff" />
        <div><div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>영상 분석</div><div style={{ fontSize: 12, color: "#ffffff88", marginTop: 2 }}>YouTube URL 자동 분석 · SNS 영상 AI 인사이트</div></div>
      </div>
      {!result ? (
        <div style={Object.assign({}, s, { marginBottom: 16 })}>
          <div style={{ display: "flex", gap: 4, background: t.bg, borderRadius: 11, padding: 3, marginBottom: 18, border: "1px solid " + t.border, width: "fit-content" }}>
            {[["url", Video, "유튜브 URL"], ["manual", Pencil, "직접 입력"], ["list", ClipboardList, "제작 목록"]].map(function (item) { const ModeIcon = item[1]; return <button key={item[0]} onClick={function () { setMode(item[0]); setYtData(null); setYtError(""); }} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 15px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: mode === item[0] ? 700 : 500, fontSize: 12, background: mode === item[0] ? "#6366f1" : "transparent", color: mode === item[0] ? "#fff" : t.text4 }}><ModeIcon size={13} strokeWidth={2} /> {item[2]}</button>; })}
          </div>
          {mode === "url" ? (
            <div>
              <div style={{ fontSize: 11, color: t.text4, marginBottom: 6, fontWeight: 600 }}>유튜브 URL 입력</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <input value={url} onChange={function (e) { setUrl(e.target.value); }} onKeyDown={function (e) { if (e.key === "Enter") fetchYT(); }} placeholder="https://www.youtube.com/watch?v=... 또는 https://youtu.be/..." style={Object.assign({}, inp, { flex: 1 })} />
                <button onClick={fetchYT} disabled={fetchLoading || !url.trim()} style={{ display: "flex", alignItems: "center", gap: 5, background: fetchLoading || !url.trim() ? t.surface2 : "#6366f1", border: "none", borderRadius: 11, padding: "0 18px", color: fetchLoading || !url.trim() ? t.text4 : "#fff", fontWeight: 700, fontSize: 13, cursor: fetchLoading || !url.trim() ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>{fetchLoading ? null : <Download size={13} strokeWidth={2} />}{fetchLoading ? "불러오는 중..." : "정보 불러오기"}</button>
              </div>
              {ytError ? <div style={{ fontSize: 12, color: "#f87171", marginBottom: 10, display: "flex", alignItems: "center", gap: 5 }}><AlertTriangle size={12} strokeWidth={2} /> {ytError}</div> : null}
              {ytData ? (
                <div style={{ background: t.bg, borderRadius: 14, padding: 14, border: "1px solid " + t.border, marginBottom: 14 }}>
                  <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                    {ytData.thumbnail ? <img src={ytData.thumbnail} alt="썸네일" style={{ width: 120, height: 68, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} /> : null}
                    <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 4 }}>{ytData.title}</div><div style={{ fontSize: 11, color: t.text4 }}>{ytData.channelTitle} · {ytData.publishedAt} · {ytData.duration}</div></div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>{[[Eye, "조회수", ytData.views, "#818cf8"], [Heart, "좋아요", ytData.likes, "#f87171"], [MessageCircle, "댓글", ytData.comments, "#fb923c"]].map(function (item) { const StatIcon = item[0]; return <div key={item[1]} style={{ background: t.surface, borderRadius: 10, padding: "10px 0", textAlign: "center", border: "1px solid " + t.border }}><div style={{ fontSize: 16, fontWeight: 800, color: item[3] }}>{item[2]}</div><div style={{ fontSize: 11, color: t.text4, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}><StatIcon size={11} strokeWidth={2} /> {item[1]}</div></div>; })}</div>
                </div>
              ) : null}
              {ytData ? <button onClick={analyze} disabled={loading} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: loading ? t.surface2 : "linear-gradient(135deg,#6366f1,#ec4899)", border: "none", borderRadius: 12, padding: "12px 0", color: loading ? t.text4 : "#fff", fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer" }}>{loading ? <RefreshCw size={15} strokeWidth={2} /> : <Search size={15} strokeWidth={2} />}{loading ? "AI 분석 중..." : "AI 분석 시작"}</button> : null}
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
              <button onClick={analyze} disabled={loading || !form.title.trim()} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: loading || !form.title.trim() ? t.surface2 : "linear-gradient(135deg,#6366f1,#ec4899)", border: "none", borderRadius: 12, padding: "12px 0", color: loading || !form.title.trim() ? t.text4 : "#fff", fontWeight: 700, fontSize: 14, cursor: loading || !form.title.trim() ? "not-allowed" : "pointer" }}>{loading ? <RefreshCw size={15} strokeWidth={2} /> : <Search size={15} strokeWidth={2} />}{loading ? "AI 분석 중..." : "AI 분석 시작"}</button>
            </div>
          ) : null}
          {mode === "list" ? (
            <div>
              <div style={{ fontSize: 12, color: t.text4, marginBottom: 10 }}>스케줄러에 등록된 영상을 선택해서 분석받으세요</div>
              {tasks.length === 0 ? <EmptyState icon={Film} text="등록된 영상이 없습니다" /> : (
                <div style={{ display: "flex", flexDirection: "column", gap: 7, maxHeight: 260, overflowY: "auto", marginBottom: 14 }}>
                  {tasks.map(function (tk) { const SIcon = STAGE_ICON[tk.status]; return <div key={tk.id} onClick={function () { setSelTask(tk); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 11, border: "1px solid " + (selTask && selTask.id === tk.id ? "#6366f1" : t.border), background: selTask && selTask.id === tk.id ? "#6366f115" : t.bg, cursor: "pointer" }}><SIcon size={14} strokeWidth={2} style={{ flexShrink: 0, color: t.text3 }} /><div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{tk.title}</div><div style={{ fontSize: 11, color: t.text4 }}>{tk.tag} · {tk.assignee} · {tk.status}</div></div><span style={{ fontSize: 10, color: TAG_COLOR[tk.tag] || "#818cf8", background: (TAG_COLOR[tk.tag] || "#818cf8") + "18", padding: "2px 8px", borderRadius: 20, fontWeight: 700 }}>{tk.tag}</span></div>; })}
                </div>
              )}
              {selTask ? <button onClick={analyze} disabled={loading} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: loading ? t.surface2 : "linear-gradient(135deg,#6366f1,#ec4899)", border: "none", borderRadius: 12, padding: "12px 0", color: loading ? t.text4 : "#fff", fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer" }}>{loading ? <RefreshCw size={15} strokeWidth={2} /> : <Search size={15} strokeWidth={2} />}{loading ? "AI 분석 중..." : "\"" + selTask.title + "\" 분석하기"}</button> : null}
            </div>
          ) : null}
        </div>
      ) : null}
      {loading ? (
        <div style={Object.assign({}, s, { textAlign: "center", padding: "48px 0" })}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}><RefreshCw size={32} strokeWidth={1.5} color={t.text3} /></div><div style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 6 }}>AI가 분석하고 있어요...</div><div style={{ fontSize: 12, color: t.text4 }}>제목 개선안, 트렌드, 아이디어를 생성 중입니다</div>
        </div>
      ) : null}
      {result && !result.error ? (
        <div>
          <div style={Object.assign({}, s, { marginBottom: 14 })}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {result.thumbnail ? <img src={result.thumbnail} alt="썸네일" style={{ width: 100, height: 56, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} /> : null}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: t.text }}>{result.info && result.info.title}</div>
                <div style={{ fontSize: 12, color: t.text4, marginTop: 3 }}>{result.info && result.info.platform} {result.info && result.info.channel ? "· " + result.info.channel : ""} · {result.scoreComment}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>{[[Eye, "views", result.info && result.info.views], [Heart, "likes", result.info && result.info.likes], [MessageCircle, "comments", result.info && result.info.comments], [Clock, "duration", result.info && result.info.duration]].filter(function (item) { return item[2] && item[2] !== "미입력"; }).map(function (item) { const BadgeIcon = item[0]; return <span key={item[1]} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: t.text3, background: t.surface2, border: "1px solid " + t.border, borderRadius: 20, padding: "2px 10px" }}><BadgeIcon size={12} strokeWidth={2} /> {item[2]}</span>; })}</div>
              </div>
              <div style={{ textAlign: "center", background: "linear-gradient(135deg,#6366f1,#ec4899)", borderRadius: 14, padding: "10px 16px", flexShrink: 0 }}><div style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>{result.score}</div><div style={{ fontSize: 10, color: "#ffffffaa" }}>/ 100</div></div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>{[["all", "전체", null], ["title", "제목", Pencil], ["thumbnail", "썸네일", ImageIcon], ["trend", "트렌드", TrendingUp], ["ideas", "아이디어", Lightbulb], ["improve", "개선점", Zap], ["report", "리포트", ClipboardList]].map(function (item) { return secBtn(item[0], item[1], item[2]); })}</div>
          {(activeSection === "all" || activeSection === "title") && result.titleSuggestions ? <div style={Object.assign({}, s, { marginBottom: 14 })}><div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><Pencil size={13} strokeWidth={2} /> 제목 개선 제안</div>{result.titleSuggestions.map(function (title, i) { return <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: t.bg, borderRadius: 11, marginBottom: 7, border: "1px solid " + t.border }}><span style={{ width: 22, height: 22, borderRadius: "50%", background: "#6366f1", color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span><span style={{ fontSize: 13, color: t.text }}>{title}</span></div>; })}</div> : null}
          {(activeSection === "all" || activeSection === "thumbnail") && result.thumbnailSuggestions ? <div style={Object.assign({}, s, { marginBottom: 14 })}><div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><ImageIcon size={13} strokeWidth={2} /> 썸네일 개선 제안</div>{result.thumbnailSuggestions.map(function (tip, i) { return <div key={i} style={{ display: "flex", gap: 10, padding: "10px 14px", background: t.bg, borderRadius: 11, marginBottom: 7, border: "1px solid " + t.border }}><ImageIcon size={14} strokeWidth={2} style={{ flexShrink: 0, color: t.text4 }} /><span style={{ fontSize: 13, color: t.text, lineHeight: 1.6 }}>{tip}</span></div>; })}</div> : null}
          {(activeSection === "all" || activeSection === "trend") && result.trendAnalysis ? <div style={Object.assign({}, s, { marginBottom: 14 })}><div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}><TrendingUp size={13} strokeWidth={2} /> 트렌드 분석</div><div style={{ fontSize: 13, color: t.text2, lineHeight: 1.8, background: t.bg, borderRadius: 11, padding: "12px 14px", border: "1px solid " + t.border }}>{result.trendAnalysis}</div></div> : null}
          {(activeSection === "all" || activeSection === "ideas") && result.nextVideoIdeas ? <div style={Object.assign({}, s, { marginBottom: 14 })}><div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><Lightbulb size={13} strokeWidth={2} /> 다음 영상 아이디어</div>{result.nextVideoIdeas.map(function (idea, i) { return <div key={i} style={{ display: "flex", gap: 10, padding: "10px 14px", background: t.bg, borderRadius: 11, marginBottom: 7, border: "1px solid " + t.border }}><Lightbulb size={14} strokeWidth={2} style={{ flexShrink: 0, color: t.text4 }} /><span style={{ fontSize: 13, color: t.text, lineHeight: 1.6 }}>{idea}</span></div>; })}</div> : null}
          {(activeSection === "all" || activeSection === "improve") && result.improvements ? <div style={Object.assign({}, s, { marginBottom: 14 })}><div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><Zap size={13} strokeWidth={2} /> 개선점</div>{result.improvements.map(function (imp, i) { return <div key={i} style={{ display: "flex", gap: 10, padding: "10px 14px", background: t.bg, borderRadius: 11, marginBottom: 7, border: "1px solid #fbbf2440" }}><Zap size={14} strokeWidth={2} style={{ flexShrink: 0, color: "#fbbf24" }} /><span style={{ fontSize: 13, color: t.text, lineHeight: 1.6 }}>{imp}</span></div>; })}</div> : null}
          {(activeSection === "all" || activeSection === "report") && result.performanceReport ? <div style={Object.assign({}, s, { marginBottom: 14 })}><div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}><ClipboardList size={13} strokeWidth={2} /> 종합 성과 리포트</div><div style={{ fontSize: 13, color: t.text2, lineHeight: 1.8, background: t.bg, borderRadius: 11, padding: "14px 16px", border: "1px solid " + t.border, whiteSpace: "pre-wrap" }}>{result.performanceReport}</div></div> : null}
          <button onClick={reset} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: t.surface2, border: "1px solid " + t.border, borderRadius: 12, padding: "11px 0", color: t.text3, fontWeight: 600, fontSize: 13, cursor: "pointer", marginBottom: 20 }}><RefreshCw size={13} strokeWidth={2} /> 새 영상 분석하기</button>
        </div>
      ) : null}
      {result && result.error ? <div style={Object.assign({}, s, { textAlign: "center", padding: "30px" })}><div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}><AlertTriangle size={22} strokeWidth={1.75} color="#f87171" /></div><div style={{ fontSize: 13, color: "#f87171" }}>{result.error}</div><button onClick={reset} style={{ marginTop: 12, background: "#f8717120", border: "1px solid #f8717140", borderRadius: 11, padding: "8px 20px", color: "#f87171", cursor: "pointer", fontSize: 12 }}>다시 시도</button></div> : null}
    </div>
  );
}

function AdAnalysisPanel(props) {
  const { t } = useTheme();
  const ads = props.ads || [];
  const [mode, setMode] = useState(ads.length > 0 ? "list" : "manual");
  const [selAd, setSelAd] = useState(null);
  const [form, setFormState] = useState({ content: "", channel: "유튜브", target: "", goal: "", mediaUrl: "" });
  const setF = function (k, v) { setFormState(function (f) { return Object.assign({}, f, { [k]: v }); }); };
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const CHANNELS = ["유튜브", "인스타그램", "페이스북", "틱톡", "네이버", "기타"];
  const previewUrl = mode === "list" ? (selAd ? (selAd.videoUrl || selAd.refUrl || selAd.planUrl || "") : "") : form.mediaUrl;
  const analyze = async function () {
    let info;
    if (mode === "list" && selAd) info = { content: selAd.content || "광고", channel: "미입력", target: "미입력", goal: selAd.workStatus || "미입력" };
    else if (mode === "manual") info = Object.assign({}, form);
    else return;
    setLoading(true); setResult(null);
    const prompt = "다음 광고 정보를 분석해주세요:\n\n광고 문구/내용: " + info.content + "\n채널: " + (info.channel || "미입력") + "\n타겟 고객: " + (info.target || "미입력") + "\n목표: " + (info.goal || "미입력") + "\n\n아래 JSON 형식으로만 응답하세요:\n{\"score\":숫자,\"scoreComment\":\"한줄코멘트\",\"copyImprovements\":[\"제안1\",\"제안2\",\"제안3\"],\"targetingIdeas\":[\"아이디어1\",\"아이디어2\"],\"channelRecommendation\":\"채널추천설명\",\"abtestIdeas\":[\"테스트안1\",\"테스트안2\"]}";
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1400, system: "당신은 디지털 광고 마케팅 전문가입니다. JSON 형식으로만 응답하세요.", messages: [{ role: "user", content: prompt }] }) });
      const data = await res.json();
      const text = data.content.map(function (c) { return c.text || ""; }).join("");
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setResult(Object.assign({}, parsed, { info: info }));
    } catch (e) { setResult({ error: "분석 중 오류가 발생했습니다." }); }
    setLoading(false);
  };
  const reset = function () { setResult(null); setSelAd(null); setFormState({ content: "", channel: "유튜브", target: "", goal: "", mediaUrl: "" }); };
  const s = { background: t.surface, borderRadius: 15, padding: "16px 18px", border: "1px solid " + t.border };
  const inp = { width: "100%", background: t.inputBg, border: "1px solid " + t.inputBorder, borderRadius: 11, padding: "8px 12px", fontSize: 13, color: t.text, boxSizing: "border-box", outline: "none" };
  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b)", borderRadius: 16, padding: "16px 22px", marginBottom: 18, display: "flex", alignItems: "center", gap: 12 }}>
        <Megaphone size={24} strokeWidth={1.75} color="#fff" />
        <div><div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>광고 분석</div><div style={{ fontSize: 12, color: "#ffffff88", marginTop: 2 }}>광고 카피 · 타겟팅 · 채널 AI 인사이트</div></div>
      </div>
      {!result ? (
        <div style={Object.assign({}, s, { marginBottom: 16 })}>
          <div style={{ display: "flex", gap: 4, background: t.bg, borderRadius: 11, padding: 3, marginBottom: 18, border: "1px solid " + t.border, width: "fit-content" }}>
            {[["list", ClipboardList, "광고 목록에서 선택"], ["manual", Pencil, "직접 입력"]].map(function (item) { const ModeIcon = item[1]; return <button key={item[0]} onClick={function () { setMode(item[0]); }} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 15px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: mode === item[0] ? 700 : 500, fontSize: 12, background: mode === item[0] ? "#f59e0b" : "transparent", color: mode === item[0] ? "#fff" : t.text4 }}><ModeIcon size={13} strokeWidth={2} /> {item[2]}</button>; })}
          </div>
          {mode === "list" ? (
            ads.length === 0 ? <EmptyState icon={Megaphone} text="등록된 광고가 없습니다" compact /> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 280, overflowY: "auto", marginBottom: 12 }}>
                {ads.map(function (ad) { return <div key={ad.id} onClick={function () { setSelAd(ad); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 11, border: "1px solid " + (selAd && selAd.id === ad.id ? "#f59e0b" : t.border), background: selAd && selAd.id === ad.id ? "#f59e0b15" : t.bg, cursor: "pointer" }}><Megaphone size={14} strokeWidth={2} style={{ flexShrink: 0, color: t.text3 }} /><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 600, color: t.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ad.content || "광고"}</div><div style={{ fontSize: 11, color: t.text4 }}>{ad.requester} · {ad.workStatus}</div></div></div>; })}
              </div>
            )
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 11, marginBottom: 4 }}>
              <div><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>광고 문구/내용</div><textarea value={form.content} onChange={function (e) { setF("content", e.target.value); }} rows={3} style={Object.assign({}, inp, { resize: "vertical", fontFamily: "inherit" })} placeholder="광고 카피, 핵심 메시지 등을 입력하세요" /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>채널</div><select value={form.channel} onChange={function (e) { setF("channel", e.target.value); }} style={Object.assign({}, inp, { cursor: "pointer" })}>{CHANNELS.map(function (c) { return <option key={c}>{c}</option>; })}</select></div>
                <div><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>목표</div><input value={form.goal} onChange={function (e) { setF("goal", e.target.value); }} placeholder="예: 신규 유입 확대" style={inp} /></div>
              </div>
              <div><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>타겟 고객</div><input value={form.target} onChange={function (e) { setF("target", e.target.value); }} placeholder="예: 20대 여성, 자취생 등" style={inp} /></div>
              <div><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><Paperclip size={11} strokeWidth={2} /> 참고 링크 (선택)</div><input value={form.mediaUrl} onChange={function (e) { setF("mediaUrl", e.target.value); }} placeholder="https://... (유튜브·이미지·동영상 자동 미리보기)" style={inp} /></div>
            </div>
          )}
          {previewUrl ? <div style={{ marginTop: 14 }}><MediaPreview url={previewUrl} /></div> : null}
          <button onClick={analyze} disabled={loading || (mode === "list" ? !selAd : !form.content.trim())} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 16, background: loading || (mode === "list" ? !selAd : !form.content.trim()) ? t.surface2 : "linear-gradient(135deg,#fbbf24,#f59e0b)", border: "none", borderRadius: 12, padding: "12px 0", color: loading || (mode === "list" ? !selAd : !form.content.trim()) ? t.text4 : "#fff", fontWeight: 700, fontSize: 14, cursor: loading || (mode === "list" ? !selAd : !form.content.trim()) ? "not-allowed" : "pointer" }}>{loading ? <RefreshCw size={15} strokeWidth={2} /> : <Megaphone size={15} strokeWidth={2} />}{loading ? "AI 분석 중..." : "AI 분석 시작"}</button>
        </div>
      ) : null}
      {loading ? <div style={Object.assign({}, s, { textAlign: "center", padding: "40px" })}><div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}><RefreshCw size={32} strokeWidth={1.5} color={t.text3} /></div><div style={{ fontSize: 15, fontWeight: 700, color: t.text }}>AI가 분석하고 있어요...</div></div> : null}
      {result && result.error ? <div style={Object.assign({}, s, { textAlign: "center", padding: "30px" })}><div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}><AlertTriangle size={22} strokeWidth={1.75} color="#f87171" /></div><div style={{ fontSize: 13, color: "#f87171" }}>{result.error}</div><button onClick={reset} style={{ marginTop: 12, background: "#f8717120", border: "1px solid #f8717140", borderRadius: 11, padding: "8px 20px", color: "#f87171", cursor: "pointer", fontSize: 12 }}>다시 시도</button></div> : null}
      {result && !result.error ? (
        <div>
          <div style={Object.assign({}, s, { display: "flex", alignItems: "center", gap: 16, marginBottom: 14 })}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "conic-gradient(#f59e0b " + (result.score || 0) * 3.6 + "deg, " + t.bg + " 0deg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><div style={{ width: 46, height: 46, borderRadius: "50%", background: t.surface, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: t.text }}>{result.score}</div></div>
            <div style={{ fontSize: 13, color: t.text2, lineHeight: 1.6 }}>{result.scoreComment}</div>
          </div>
          {result.copyImprovements ? <div style={Object.assign({}, s, { marginBottom: 14 })}><div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><Pencil size={13} strokeWidth={2} /> 카피 개선 제안</div>{result.copyImprovements.map(function (v, i) { return <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: t.bg, borderRadius: 11, marginBottom: 7, border: "1px solid " + t.border }}><span style={{ width: 22, height: 22, borderRadius: "50%", background: "#f59e0b", color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span><span style={{ fontSize: 13, color: t.text }}>{v}</span></div>; })}</div> : null}
          {result.targetingIdeas ? <div style={Object.assign({}, s, { marginBottom: 14 })}><div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><Users size={13} strokeWidth={2} /> 타겟팅 아이디어</div>{result.targetingIdeas.map(function (v, i) { return <div key={i} style={{ display: "flex", gap: 10, padding: "10px 14px", background: t.bg, borderRadius: 11, marginBottom: 7, border: "1px solid " + t.border }}><Users size={14} strokeWidth={2} style={{ flexShrink: 0, color: t.text4 }} /><span style={{ fontSize: 13, color: t.text, lineHeight: 1.6 }}>{v}</span></div>; })}</div> : null}
          {result.channelRecommendation ? <div style={Object.assign({}, s, { marginBottom: 14 })}><div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}><Megaphone size={13} strokeWidth={2} /> 채널 추천</div><div style={{ fontSize: 13, color: t.text2, lineHeight: 1.8, background: t.bg, borderRadius: 11, padding: "12px 14px", border: "1px solid " + t.border }}>{result.channelRecommendation}</div></div> : null}
          {result.abtestIdeas ? <div style={Object.assign({}, s, { marginBottom: 14 })}><div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><Zap size={13} strokeWidth={2} /> A/B 테스트 아이디어</div>{result.abtestIdeas.map(function (v, i) { return <div key={i} style={{ display: "flex", gap: 10, padding: "10px 14px", background: t.bg, borderRadius: 11, marginBottom: 7, border: "1px solid #fbbf2440" }}><Zap size={14} strokeWidth={2} style={{ flexShrink: 0, color: "#fbbf24" }} /><span style={{ fontSize: 13, color: t.text, lineHeight: 1.6 }}>{v}</span></div>; })}</div> : null}
          <button onClick={reset} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: t.surface2, border: "1px solid " + t.border, borderRadius: 12, padding: "11px 0", color: t.text3, fontWeight: 600, fontSize: 13, cursor: "pointer", marginBottom: 20 }}><RefreshCw size={13} strokeWidth={2} /> 새 광고 분석하기</button>
        </div>
      ) : null}
    </div>
  );
}

function DesignAnalysisPanel(props) {
  const { t } = useTheme();
  const designTasks = props.designTasks || [];
  const [mode, setMode] = useState(designTasks.length > 0 ? "list" : "manual");
  const [selTask, setSelTask] = useState(null);
  const [form, setFormState] = useState({ desc: "", category: "로고", tone: "" });
  const setF = function (k, v) { setFormState(function (f) { return Object.assign({}, f, { [k]: v }); }); };
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const analyze = async function () {
    let info;
    if (mode === "list" && selTask) info = { desc: selTask.desc || selTask.title, category: selTask.tag, tone: "미입력" };
    else if (mode === "manual") info = Object.assign({}, form);
    else return;
    setLoading(true); setResult(null);
    const prompt = "다음 디자인 작업 정보를 분석해주세요:\n\n설명: " + info.desc + "\n카테고리: " + (info.category || "미입력") + "\n톤앤매너: " + (info.tone || "미입력") + "\n\n아래 JSON 형식으로만 응답하세요:\n{\"score\":숫자,\"scoreComment\":\"한줄코멘트\",\"styleSuggestions\":[\"제안1\",\"제안2\",\"제안3\"],\"colorPalette\":[\"색상조합1 설명\",\"색상조합2 설명\"],\"layoutTips\":[\"팁1\",\"팁2\"],\"trendAnalysis\":\"트렌드분석\"}";
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1400, system: "당신은 그래픽 디자인 전문가입니다. JSON 형식으로만 응답하세요.", messages: [{ role: "user", content: prompt }] }) });
      const data = await res.json();
      const text = data.content.map(function (c) { return c.text || ""; }).join("");
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setResult(Object.assign({}, parsed, { info: info }));
    } catch (e) { setResult({ error: "분석 중 오류가 발생했습니다." }); }
    setLoading(false);
  };
  const reset = function () { setResult(null); setSelTask(null); setFormState({ desc: "", category: "로고", tone: "" }); };
  const s = { background: t.surface, borderRadius: 15, padding: "16px 18px", border: "1px solid " + t.border };
  const inp = { width: "100%", background: t.inputBg, border: "1px solid " + t.inputBorder, borderRadius: 11, padding: "8px 12px", fontSize: 13, color: t.text, boxSizing: "border-box", outline: "none" };
  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div style={{ background: "linear-gradient(135deg,#f87171,#fb7185)", borderRadius: 16, padding: "16px 22px", marginBottom: 18, display: "flex", alignItems: "center", gap: 12 }}>
        <Palette size={24} strokeWidth={1.75} color="#fff" />
        <div><div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>디자인 분석</div><div style={{ fontSize: 12, color: "#ffffff88", marginTop: 2 }}>스타일 · 컬러 · 레이아웃 AI 인사이트</div></div>
      </div>
      {!result ? (
        <div style={Object.assign({}, s, { marginBottom: 16 })}>
          <div style={{ display: "flex", gap: 4, background: t.bg, borderRadius: 11, padding: 3, marginBottom: 18, border: "1px solid " + t.border, width: "fit-content" }}>
            {[["list", ClipboardList, "디자인 목록에서 선택"], ["manual", Pencil, "직접 입력"]].map(function (item) { const ModeIcon = item[1]; return <button key={item[0]} onClick={function () { setMode(item[0]); }} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 15px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: mode === item[0] ? 700 : 500, fontSize: 12, background: mode === item[0] ? "#f87171" : "transparent", color: mode === item[0] ? "#fff" : t.text4 }}><ModeIcon size={13} strokeWidth={2} /> {item[2]}</button>; })}
          </div>
          {mode === "list" ? (
            designTasks.length === 0 ? <EmptyState icon={Palette} text="등록된 디자인 업무가 없습니다" compact /> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 280, overflowY: "auto", marginBottom: 12 }}>
                {designTasks.map(function (dt) { return <div key={dt.id} onClick={function () { setSelTask(dt); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 11, border: "1px solid " + (selTask && selTask.id === dt.id ? "#f87171" : t.border), background: selTask && selTask.id === dt.id ? "#f8717115" : t.bg, cursor: "pointer" }}><Palette size={14} strokeWidth={2} style={{ flexShrink: 0, color: t.text3 }} /><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 600, color: t.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{dt.title}</div><div style={{ fontSize: 11, color: t.text4 }}>{dt.tag} · {dt.assignee} · {dt.status}</div></div></div>; })}
              </div>
            )
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 11, marginBottom: 4 }}>
              <div><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>디자인 설명</div><textarea value={form.desc} onChange={function (e) { setF("desc", e.target.value); }} rows={3} style={Object.assign({}, inp, { resize: "vertical", fontFamily: "inherit" })} placeholder="어떤 디자인을 만들고 있는지 설명해주세요" /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>카테고리</div><select value={form.category} onChange={function (e) { setF("category", e.target.value); }} style={Object.assign({}, inp, { cursor: "pointer" })}>{DESIGN_TAGS.map(function (c) { return <option key={c}>{c}</option>; })}</select></div>
                <div><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>톤앤매너</div><input value={form.tone} onChange={function (e) { setF("tone", e.target.value); }} placeholder="예: 미니멀, 따뜻한 느낌" style={inp} /></div>
              </div>
            </div>
          )}
          <button onClick={analyze} disabled={loading || (mode === "list" ? !selTask : !form.desc.trim())} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 16, background: loading || (mode === "list" ? !selTask : !form.desc.trim()) ? t.surface2 : "linear-gradient(135deg,#f87171,#fb7185)", border: "none", borderRadius: 12, padding: "12px 0", color: loading || (mode === "list" ? !selTask : !form.desc.trim()) ? t.text4 : "#fff", fontWeight: 700, fontSize: 14, cursor: loading || (mode === "list" ? !selTask : !form.desc.trim()) ? "not-allowed" : "pointer" }}>{loading ? <RefreshCw size={15} strokeWidth={2} /> : <Palette size={15} strokeWidth={2} />}{loading ? "AI 분석 중..." : "AI 분석 시작"}</button>
        </div>
      ) : null}
      {loading ? <div style={Object.assign({}, s, { textAlign: "center", padding: "40px" })}><div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}><RefreshCw size={32} strokeWidth={1.5} color={t.text3} /></div><div style={{ fontSize: 15, fontWeight: 700, color: t.text }}>AI가 분석하고 있어요...</div></div> : null}
      {result && result.error ? <div style={Object.assign({}, s, { textAlign: "center", padding: "30px" })}><div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}><AlertTriangle size={22} strokeWidth={1.75} color="#f87171" /></div><div style={{ fontSize: 13, color: "#f87171" }}>{result.error}</div><button onClick={reset} style={{ marginTop: 12, background: "#f8717120", border: "1px solid #f8717140", borderRadius: 11, padding: "8px 20px", color: "#f87171", cursor: "pointer", fontSize: 12 }}>다시 시도</button></div> : null}
      {result && !result.error ? (
        <div>
          <div style={Object.assign({}, s, { display: "flex", alignItems: "center", gap: 16, marginBottom: 14 })}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "conic-gradient(#f87171 " + (result.score || 0) * 3.6 + "deg, " + t.bg + " 0deg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><div style={{ width: 46, height: 46, borderRadius: "50%", background: t.surface, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: t.text }}>{result.score}</div></div>
            <div style={{ fontSize: 13, color: t.text2, lineHeight: 1.6 }}>{result.scoreComment}</div>
          </div>
          {result.styleSuggestions ? <div style={Object.assign({}, s, { marginBottom: 14 })}><div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><Palette size={13} strokeWidth={2} /> 스타일 제안</div>{result.styleSuggestions.map(function (v, i) { return <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: t.bg, borderRadius: 11, marginBottom: 7, border: "1px solid " + t.border }}><span style={{ width: 22, height: 22, borderRadius: "50%", background: "#f87171", color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span><span style={{ fontSize: 13, color: t.text }}>{v}</span></div>; })}</div> : null}
          {result.colorPalette ? <div style={Object.assign({}, s, { marginBottom: 14 })}><div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><ImageIcon size={13} strokeWidth={2} /> 컬러 팔레트 제안</div>{result.colorPalette.map(function (v, i) { return <div key={i} style={{ display: "flex", gap: 10, padding: "10px 14px", background: t.bg, borderRadius: 11, marginBottom: 7, border: "1px solid " + t.border }}><ImageIcon size={14} strokeWidth={2} style={{ flexShrink: 0, color: t.text4 }} /><span style={{ fontSize: 13, color: t.text, lineHeight: 1.6 }}>{v}</span></div>; })}</div> : null}
          {result.layoutTips ? <div style={Object.assign({}, s, { marginBottom: 14 })}><div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><LayoutGrid size={13} strokeWidth={2} /> 레이아웃 팁</div>{result.layoutTips.map(function (v, i) { return <div key={i} style={{ display: "flex", gap: 10, padding: "10px 14px", background: t.bg, borderRadius: 11, marginBottom: 7, border: "1px solid " + t.border }}><LayoutGrid size={14} strokeWidth={2} style={{ flexShrink: 0, color: t.text4 }} /><span style={{ fontSize: 13, color: t.text, lineHeight: 1.6 }}>{v}</span></div>; })}</div> : null}
          {result.trendAnalysis ? <div style={Object.assign({}, s, { marginBottom: 14 })}><div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}><TrendingUp size={13} strokeWidth={2} /> 트렌드 분석</div><div style={{ fontSize: 13, color: t.text2, lineHeight: 1.8, background: t.bg, borderRadius: 11, padding: "12px 14px", border: "1px solid " + t.border }}>{result.trendAnalysis}</div></div> : null}
          <button onClick={reset} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: t.surface2, border: "1px solid " + t.border, borderRadius: 12, padding: "11px 0", color: t.text3, fontWeight: 600, fontSize: 13, cursor: "pointer", marginBottom: 20 }}><RefreshCw size={13} strokeWidth={2} /> 새 디자인 분석하기</button>
        </div>
      ) : null}
    </div>
  );
}

function AIPanel(props) {
  const { t } = useTheme();
  const { tasks, users, ads, designTasks } = props;
  const [mainTab, setMainTab] = useState("ai");
  const [report, setReport] = useState(""), [insight, setInsight] = useState("");
  const [lR, setLR] = useState(false), [lI, setLI] = useState(false);
  const summary = tasks.map(function (tk) { return "[" + tk.status + "] " + tk.title + " (담당: " + tk.assignee + ", 플랫폼: " + tk.tag + ", 우선순위: " + tk.priority + ", 마감: " + tk.due + ")"; }).join("\n");
  const callAI = async function (prompt, set, setL) {
    setL(true); set("");
    try { const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, system: "당신은 영상 크리에이터 팀의 전문 매니저입니다. 한국어로 명확하게 답변하세요.", messages: [{ role: "user", content: prompt }] }) }); const data = await res.json(); set(data.content.map(function (c) { return c.text || ""; }).join("\n")); } catch (e) { set("오류가 발생했습니다."); }
    setL(false);
  };
  const s = { background: t.surface, borderRadius: 15, padding: "17px 19px", border: "1px solid " + t.border, marginBottom: 12 };
  const btn = function (l, bg) { return { width: "100%", padding: "10px 0", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: l ? "not-allowed" : "pointer", background: l ? t.surface2 : bg, color: l ? t.text4 : "#fff", marginTop: 12 }; };
  const mainTabBtn = function (v, l, Icon) { return <button key={v} onClick={function () { setMainTab(v); }} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 18px", background: "none", border: "none", borderBottom: mainTab === v ? "2px solid #6366f1" : "2px solid transparent", cursor: "pointer", fontWeight: mainTab === v ? 700 : 500, fontSize: 13, color: mainTab === v ? "#818cf8" : t.text4, marginBottom: -1 }}><Icon size={14} strokeWidth={2} />{l}</button>; };
  return (
    <div>
      <div style={{ display: "flex", gap: 2, marginBottom: 18, borderBottom: "1px solid " + t.border, flexWrap: "wrap" }}>{mainTabBtn("ai", "AI 분석", Bot)}{mainTabBtn("video", "영상 분석", Search)}{mainTabBtn("ad", "광고 분석", Megaphone)}{mainTabBtn("design", "디자인 분석", Palette)}</div>
      {mainTab === "ai" ? (
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={s}><div style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 3, display: "flex", alignItems: "center", gap: 6 }}><FileText size={14} strokeWidth={2} /> 제작 현황 요약</div><div style={{ fontSize: 12, color: t.text4 }}>현재 영상 제작 현황을 AI가 요약합니다</div><button disabled={lR} style={btn(lR, "#6366f1")} onClick={function () { callAI("다음 영상 제작 현황을 요약 리포트로 작성해주세요.\n\n" + summary, setReport, setLR); }}>{lR ? "생성 중..." : "리포트 생성"}</button>{report ? <div style={{ marginTop: 12, background: t.bg, borderRadius: 11, padding: "12px 14px", fontSize: 12, color: t.text2, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{report}</div> : null}</div>
          <div style={s}><div style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 3, display: "flex", alignItems: "center", gap: 6 }}><Lightbulb size={14} strokeWidth={2} /> 생산성 인사이트</div><div style={{ fontSize: 12, color: t.text4 }}>병목 지점과 개선 방향을 분석합니다</div><button disabled={lI} style={btn(lI, "#ec4899")} onClick={function () { callAI("다음 영상 제작 데이터를 분석해서 인사이트와 개선 제안 3가지 제공해주세요.\n\n" + summary, setInsight, setLI); }}>{lI ? "분석 중..." : "인사이트 분석"}</button>{insight ? <div style={{ marginTop: 12, background: t.bg, borderRadius: 11, padding: "12px 14px", fontSize: 12, color: t.text2, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{insight}</div> : null}</div>
          <div style={{ fontSize: 11, color: t.text4, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}><MessageCircle size={12} strokeWidth={2} /> 자유롭게 대화하며 물어보고 싶으신 건 화면 우측 하단의 AI 챗봇을 이용해주세요</div>
        </div>
      ) : null}
      {mainTab === "video" ? <VideoAnalysisPanel tasks={tasks} /> : null}
      {mainTab === "ad" ? <AdAnalysisPanel ads={ads} /> : null}
      {mainTab === "design" ? <DesignAnalysisPanel designTasks={designTasks} /> : null}
    </div>
  );
}

function AdDetailModal(props) {
  const { t } = useTheme();
  const { ad, type, onClose, onUpdate } = props;
  const [form, setForm] = useState(Object.assign({}, ad));
  const set = function (k, v) { setForm(function (f) { return Object.assign({}, f, { [k]: v }); }); };
  const inp = { width: "100%", background: t.inputBg, border: "1px solid " + t.inputBorder, borderRadius: 10, padding: "7px 10px", fontSize: 12, color: t.text, boxSizing: "border-box", outline: "none" };
  const ta = Object.assign({}, inp, { minHeight: 56, resize: "vertical" });
  const lbl = function (tx) { return <div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>{tx}</div>; };
  const aiF = [["요청자", "requester"], ["요청 내용", "content"], ["요청일", "requestDate", "date"], ["기획안 URL (웹 드라이브 등)", "planUrl"], ["레퍼런스 URL", "refUrl"], ["리사이징", "resizing"], ["제작일", "workDate", "date"], ["예상 완료일", "expectedDate", "date"], ["실제 완료일", "completedDate", "date"], ["컨펌 요청일", "confirmRequestDate", "date"], ["영상 파일 URL (웹 드라이브 등)", "videoUrl"], ["수정 내용", "modifyContent", "textarea"], ["업로드일", "uploadDate", "date"], ["비고", "note"]];
  const intF = [["요청자", "requester"], ["요청 내용", "content"], ["촬영일", "shootDate", "date"], ["편집 시작", "editStart", "date"], ["가편집 전달", "roughCut", "date"], ["수정 내용", "modifyContent", "textarea"], ["요청사항", "request"], ["추가 사항", "extra"], ["마케팅 문구", "phrase"], ["제작일", "workDate", "date"], ["예상 완료일", "expectedDate", "date"], ["실제 완료일", "completedDate", "date"], ["컨펌 요청일", "confirmRequestDate", "date"], ["영상 파일 URL (웹 드라이브 등)", "videoUrl"], ["수정 내용2", "modifyContent2", "textarea"], ["업로드일", "uploadDate", "date"], ["비고", "note"]];
  const fields = type === "ai" ? aiF : intF;
  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000099", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
      <div style={{ background: t.surface, borderRadius: 20, width: "min(92vw, 520px)", maxHeight: "88vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 64px #000c" }}>
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
          <button onClick={onClose} style={{ flex: 1, background: t.surface2, border: "none", borderRadius: 11, padding: "9px 0", cursor: "pointer", color: t.text3, fontWeight: 600 }}>취소</button>
          <button onClick={function () { onUpdate(form); onClose(); }} style={{ flex: 1, background: "#6366f1", border: "none", borderRadius: 11, padding: "9px 0", cursor: "pointer", color: "#fff", fontWeight: 700 }}>저장</button>
        </div>
      </div>
    </div>
  );
}

function AdPanel(props) {
  const { t } = useTheme();
  const onNewAd = props.onNewAd, currentUser = props.currentUser;
  const [adTab, setAdTab] = useState("ai");
  const aiAds = props.aiAds, setAiAds = props.setAiAds, intAds = props.intAds, setIntAds = props.setIntAds;
  const [selected, setSelected] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
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
        <div style={{ display: "flex", gap: 6 }}><button style={Object.assign({}, adTabStyle("ai"), { display: "inline-flex", alignItems: "center", gap: 5 })} onClick={function () { setAdTab("ai"); }}><Bot size={13} strokeWidth={2} /> 타사 광고 (AI 포함)</button><button style={Object.assign({}, adTabStyle("int"), { display: "inline-flex", alignItems: "center", gap: 5 })} onClick={function () { setAdTab("int"); }}><Mic size={13} strokeWidth={2} /> 인터뷰 파생 광고</button></div>
        <button onClick={adTab === "ai" ? addAiAd : addIntAd} style={{ background: "#6366f1", border: "none", borderRadius: 10, padding: "7px 14px", fontWeight: 700, fontSize: 12, color: "#fff", cursor: "pointer" }}>+ 추가</button>
      </div>
      <div style={{ fontSize: 11, color: t.text4, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}><span style={{ display: "inline-flex", width: 7, height: 7, borderRadius: "50%", background: "#34d399" }} />제작일·예상완료일이 캘린더 탭에 자동으로 표시됩니다</div>
      <div style={{ background: t.surface, borderRadius: 16, border: "1px solid " + t.border, overflow: "auto" }}>
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
  const inp = { width: "100%", background: t.inputBg, border: "1px solid " + t.inputBorder, borderRadius: 11, padding: "9px 12px", fontSize: 13, color: t.text, boxSizing: "border-box", outline: "none" };
  const isEntry = kind === "entry";
  const submit = function () {
    const hoursNum = Number(form.hours);
    if (!form.date || !hoursNum || hoursNum <= 0) return;
    onAdd({ date: form.date, hours: hoursNum, note: form.note });
    onClose();
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000099", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
      <div style={{ background: t.surface, borderRadius: 20, padding: "22px 26px", width: "min(92vw, 340px)", boxShadow: "0 24px 64px #000c" }}>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 18, color: t.text, display: "flex", alignItems: "center", gap: 6 }}>{isEntry ? <Clock size={15} strokeWidth={2} /> : <Palmtree size={15} strokeWidth={2} />}{isEntry ? "야근 기록 추가" : "대체휴가 사용 추가"}</div>
        <div style={{ marginBottom: 11 }}><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>날짜</div><input type="date" value={form.date} onChange={function (e) { set("date", e.target.value); }} style={inp} /></div>
        <div style={{ marginBottom: 11 }}><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>{isEntry ? "야근 시간 (시간 단위, 예: 2.5)" : "사용 시간 (시간 단위, 예: 4)"}</div><input type="number" step="0.5" min="0" value={form.hours} onChange={function (e) { set("hours", e.target.value); }} placeholder="예: 2.5" style={inp} /></div>
        <div style={{ marginBottom: 18 }}><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>{isEntry ? "사유" : "메모"}</div><input value={form.note} onChange={function (e) { set("note", e.target.value); }} placeholder={isEntry ? "예: 편집 마감 대응" : "예: 반차로 사용"} style={inp} /></div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, background: t.surface2, border: "none", borderRadius: 11, padding: "10px 0", cursor: "pointer", color: t.text3, fontWeight: 600 }}>취소</button>
          <button onClick={submit} style={{ flex: 1, background: isEntry ? "#6366f1" : "#fb923c", border: "none", borderRadius: 11, padding: "10px 0", cursor: "pointer", color: "#fff", fontWeight: 700 }}>추가</button>
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
  const s = { background: t.surface, borderRadius: 15, border: "1px solid " + t.border, overflow: "hidden" };
  const viewBtn = function (v) { return { padding: "6px 16px", background: view === v ? "#6366f120" : "transparent", border: "1px solid " + (view === v ? "#6366f1" : t.border), borderRadius: 20, cursor: "pointer", fontSize: 12, fontWeight: view === v ? 700 : 500, color: view === v ? "#818cf8" : t.text4 }; };
  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      {showAddEntry ? <OvertimeEntryModal kind="entry" onAdd={addEntry} onClose={function () { setShowAddEntry(false); }} /> : null}
      {showAddUsage ? <OvertimeEntryModal kind="usage" onAdd={addUsage} onClose={function () { setShowAddUsage(false); }} /> : null}
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        <button style={viewBtn("mine")} onClick={function () { setView("mine"); }}>내 기록</button>
        <button style={Object.assign({}, viewBtn("all"), { display: "inline-flex", alignItems: "center", gap: 6 })} onClick={function () { setView("all"); setExpandedUser(null); }}><Users size={13} strokeWidth={2} /> 팀 전체 현황</button>
      </div>
      {view === "mine" ? (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 10, marginBottom: 16 }}>
            <div style={Object.assign({}, s, { padding: "14px 0", textAlign: "center" })}><div style={{ fontSize: 22, fontWeight: 900, color: "#818cf8" }}>{fmt(myTotalOvertime)}h</div><div style={{ fontSize: 11, color: t.text4, marginTop: 3 }}>누적 야근시간</div></div>
            <div style={Object.assign({}, s, { padding: "14px 0", textAlign: "center" })}><div style={{ fontSize: 22, fontWeight: 900, color: "#fb923c" }}>{fmt(myTotalUsed)}h</div><div style={{ fontSize: 11, color: t.text4, marginTop: 3 }}>대체휴가 사용시간</div></div>
            <div style={Object.assign({}, s, { padding: "14px 0", textAlign: "center" })}><div style={{ fontSize: 22, fontWeight: 900, color: myRemaining >= 0 ? "#34d399" : "#f87171" }}>{fmt(myRemaining)}h</div><div style={{ fontSize: 11, color: t.text4, marginTop: 3 }}>잔여 시간</div></div>
          </div>
          <div style={Object.assign({}, s, { marginBottom: 16 })}>
            <div style={{ padding: "11px 16px", borderBottom: "1px solid " + t.border, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: t.text4, textTransform: "uppercase", letterSpacing: ".5px", display: "flex", alignItems: "center", gap: 6 }}><Clock size={13} strokeWidth={2} /> 야근 기록 ({myEntries.length})</span>
              <button onClick={function () { setShowAddEntry(true); }} style={{ background: "#6366f1", border: "none", borderRadius: 10, padding: "6px 12px", fontWeight: 700, fontSize: 12, color: "#fff", cursor: "pointer" }}>+ 추가</button>
            </div>
            {myEntries.length === 0 ? <EmptyState icon={Clock} text="기록된 야근이 없습니다" /> : null}
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
              <span style={{ fontSize: 12, fontWeight: 700, color: t.text4, textTransform: "uppercase", letterSpacing: ".5px", display: "flex", alignItems: "center", gap: 6 }}><Palmtree size={13} strokeWidth={2} /> 대체휴가 사용 기록 ({myUsage.length})</span>
              <button onClick={function () { setShowAddUsage(true); }} style={{ background: "#fb923c", border: "none", borderRadius: 10, padding: "6px 12px", fontWeight: 700, fontSize: 12, color: "#fff", cursor: "pointer" }}>+ 추가</button>
            </div>
            {myUsage.length === 0 ? <EmptyState icon={Palmtree} text="사용 기록이 없습니다" /> : null}
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 10, marginBottom: 16 }}>
            <div style={Object.assign({}, s, { padding: "14px 0", textAlign: "center" })}><div style={{ fontSize: 22, fontWeight: 900, color: "#818cf8" }}>{fmt(sumHours(entries))}h</div><div style={{ fontSize: 11, color: t.text4, marginTop: 3 }}>팀 전체 누적 야근시간</div></div>
            <div style={Object.assign({}, s, { padding: "14px 0", textAlign: "center" })}><div style={{ fontSize: 22, fontWeight: 900, color: "#fb923c" }}>{fmt(sumHours(usage))}h</div><div style={{ fontSize: 11, color: t.text4, marginTop: 3 }}>팀 전체 사용시간</div></div>
            <div style={Object.assign({}, s, { padding: "14px 0", textAlign: "center" })}><div style={{ fontSize: 22, fontWeight: 900, color: "#34d399" }}>{fmt(sumHours(entries) - sumHours(usage))}h</div><div style={{ fontSize: 11, color: t.text4, marginTop: 3 }}>팀 전체 잔여 시간</div></div>
          </div>
          <div style={s}>
            <div style={{ padding: "11px 16px", borderBottom: "1px solid " + t.border, fontSize: 12, fontWeight: 700, color: t.text4, textTransform: "uppercase", letterSpacing: ".5px" }}>팀원별 현황 ({summaryByUser.length}명) · 이름을 클릭하면 상세 기록이 열려요</div>
            {summaryByUser.length === 0 ? <EmptyState icon={Users} text="등록된 직원이 없습니다" /> : null}
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
                      <div style={{ background: t.bg, borderRadius: 11, border: "1px solid " + t.border, overflow: "hidden" }}>
                        <div style={{ padding: "8px 12px", borderBottom: "1px solid " + t.border, fontSize: 11, fontWeight: 700, color: t.text4, display: "flex", alignItems: "center", gap: 5 }}><Clock size={12} strokeWidth={2} /> 야근 기록 ({personEntries.length})</div>
                        {personEntries.length === 0 ? <div style={{ padding: "14px", textAlign: "center", color: t.text5, fontSize: 12 }}>기록 없음</div> : personEntries.map(function (e) {
                          return <div key={e.id} style={{ display: "flex", gap: 8, padding: "8px 12px", borderBottom: "1px solid " + t.border, fontSize: 12 }}><span style={{ color: t.text4, width: 76, flexShrink: 0 }}>{e.date}</span><span style={{ color: "#818cf8", fontWeight: 700, width: 40, flexShrink: 0 }}>{fmt(e.hours)}h</span><span style={{ color: t.text3, flex: 1 }}>{e.reason || "-"}</span></div>;
                        })}
                      </div>
                      <div style={{ background: t.bg, borderRadius: 11, border: "1px solid " + t.border, overflow: "hidden" }}>
                        <div style={{ padding: "8px 12px", borderBottom: "1px solid " + t.border, fontSize: 11, fontWeight: 700, color: t.text4, display: "flex", alignItems: "center", gap: 5 }}><Palmtree size={12} strokeWidth={2} /> 대체휴가 사용 ({personUsage.length})</div>
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
      <div style={{ background: t.surface, borderRadius: 16, border: "1px solid " + t.border, display: "flex", height: 620, overflow: "hidden" }}>
        <div style={{ width: "clamp(150px, 40vw, 250px)", flexShrink: 0, borderRight: "1px solid " + t.border, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid " + t.border, fontSize: 12, fontWeight: 700, color: t.text4, textTransform: "uppercase", letterSpacing: ".5px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}><MessageCircle size={13} strokeWidth={2} /> 메시지(메모)</span>
            {totalUnread > 0 ? <span style={{ fontSize: 10, background: "#f87171", color: "#fff", borderRadius: 99, minWidth: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px", fontWeight: 700 }}>{totalUnread > 9 ? "9+" : totalUnread}</span> : null}
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {partnersSorted.length === 0 ? <EmptyState icon={Users} text="대화 가능한 팀원이 없습니다" compact /> : null}
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
                {conv.length === 0 ? <EmptyState icon={Mail} text="아직 메시지가 없습니다. 첫 메시지를 보내보세요!" /> : null}
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
                  <input value={input} onChange={function (e) { setInput(e.target.value); }} onKeyDown={function (e) { if (e.key === "Enter" && !e.shiftKey) send(); }} placeholder="메시지를 입력하세요..." style={{ flex: 1, background: t.inputBg, border: "1px solid " + t.inputBorder, borderRadius: 12, padding: "9px 13px", fontSize: 13, color: t.text, outline: "none" }} />
                  <button onClick={send} disabled={!input.trim()} style={{ background: input.trim() ? "#6366f1" : t.surface2, border: "none", borderRadius: 12, padding: "0 18px", color: input.trim() ? "#fff" : t.text4, fontWeight: 700, fontSize: 13, cursor: input.trim() ? "pointer" : "not-allowed" }}>전송</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RequestsPanel(props) {
  const { t } = useTheme();
  const { requests, setRequests, currentUser, isManager, users, onNotify } = props;
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", desc: "", type: "영상", desiredDate: "", urgency: "중간", assignee: "" });
  const set = function (k, v) { setForm(function (f) { return Object.assign({}, f, { [k]: v }); }); };
  const REQ_TYPES = ["영상", "마케팅", "디자인", "광고", "기타"];
  const STATUS_COLOR = { "대기": "#fbbf24", "처리중": "#818cf8", "완료": "#34d399", "반려": "#f87171" };
  const inp = { width: "100%", background: t.inputBg, border: "1px solid " + t.inputBorder, borderRadius: 11, padding: "9px 12px", fontSize: 13, color: t.text, boxSizing: "border-box", outline: "none" };
  const memberNames = (users || []).filter(function (u) { return u.approved && u.role !== "admin"; }).map(function (u) { return u.name; });
  const submit = function () {
    if (!form.title.trim()) return;
    const newReq = Object.assign({}, form, { id: "req_" + Date.now(), requester: currentUser.name, status: "대기", createdAt: Date.now() });
    setRequests((requests || []).concat([newReq]));
    if (onNotify) {
      const notifText = form.title + " (" + form.type + ") 새 업무 요청이 접수됐어요";
      if (currentUser.name !== "admin") onNotify("admin", currentUser.name, form.title, notifText);
      if (form.assignee && form.assignee !== currentUser.name) onNotify(form.assignee, currentUser.name, form.title, notifText);
    }
    setForm({ title: "", desc: "", type: "영상", desiredDate: "", urgency: "중간", assignee: "" });
    setShowForm(false);
  };
  const updateStatus = function (id, status) { setRequests((requests || []).map(function (r) { return r.id === id ? Object.assign({}, r, { status: status }) : r; })); };
  const deleteReq = function (id) { setRequests((requests || []).filter(function (r) { return r.id !== id; })); };
  const sorted = (requests || []).slice().sort(function (a, b) { return b.createdAt - a.createdAt; });
  const s = { background: t.surface, borderRadius: 15, border: "1px solid " + t.border };
  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: t.text4 }}>다른 팀·담당자가 영상·마케팅·디자인·광고 제작을 요청할 수 있는 접수함이에요.</div>
        <button onClick={function () { setShowForm(true); }} style={{ display: "flex", alignItems: "center", gap: 5, background: "#6366f1", border: "none", borderRadius: 10, padding: "8px 16px", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", flexShrink: 0 }}><Plus size={13} strokeWidth={2} /> 새 요청</button>
      </div>
      {showForm ? (
        <div style={Object.assign({}, s, { padding: "16px 18px", marginBottom: 16 })}>
          <div style={{ marginBottom: 10 }}><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>요청 제목</div><input value={form.title} onChange={function (e) { set("title", e.target.value); }} style={inp} /></div>
          <div style={{ marginBottom: 10 }}><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>상세 내용</div><input value={form.desc} onChange={function (e) { set("desc", e.target.value); }} style={inp} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>종류</div><select value={form.type} onChange={function (e) { set("type", e.target.value); }} style={Object.assign({}, inp, { cursor: "pointer" })}>{REQ_TYPES.map(function (r) { return <option key={r}>{r}</option>; })}</select></div>
            <div><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>희망일</div><input type="date" value={form.desiredDate} onChange={function (e) { set("desiredDate", e.target.value); }} style={inp} /></div>
            <div><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600 }}>긴급도</div><select value={form.urgency} onChange={function (e) { set("urgency", e.target.value); }} style={Object.assign({}, inp, { cursor: "pointer" })}>{["낮음", "중간", "높음"].map(function (u) { return <option key={u}>{u}</option>; })}</select></div>
          </div>
          <div style={{ marginBottom: 14 }}><div style={{ fontSize: 11, color: t.text4, marginBottom: 4, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><User size={11} strokeWidth={2} /> 담당자 지정 (선택 시 그 담당자에게도 알림이 가요)</div><select value={form.assignee} onChange={function (e) { set("assignee", e.target.value); }} style={Object.assign({}, inp, { cursor: "pointer" })}><option value="">지정 안 함 (관리자에게만 전달)</option>{memberNames.map(function (n) { return <option key={n} value={n}>{n}</option>; })}</select></div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={function () { setShowForm(false); }} style={{ flex: 1, background: t.surface2, border: "none", borderRadius: 11, padding: "10px 0", color: t.text3, fontWeight: 600, cursor: "pointer" }}>취소</button>
            <button onClick={submit} style={{ flex: 1, background: "#6366f1", border: "none", borderRadius: 11, padding: "10px 0", color: "#fff", fontWeight: 700, cursor: "pointer" }}>제출</button>
          </div>
        </div>
      ) : null}
      <div style={s}>
        <div style={{ padding: "12px 18px", borderBottom: "1px solid " + t.border, fontSize: 12, fontWeight: 700, color: t.text4, textTransform: "uppercase", letterSpacing: ".5px" }}>전체 요청 ({sorted.length})</div>
        {sorted.length === 0 ? <EmptyState icon={Inbox} text="접수된 요청이 없습니다" /> : null}
        {sorted.map(function (r) {
          return (
            <div key={r.id} style={{ padding: "13px 18px", borderBottom: "1px solid " + t.border }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 10, background: STATUS_COLOR[r.status] + "20", color: STATUS_COLOR[r.status], borderRadius: 20, padding: "2px 8px", fontWeight: 700 }}>{r.status}</span>
                <span style={{ fontSize: 10, color: t.text4, background: t.bg, borderRadius: 20, padding: "2px 8px" }}>{r.type}</span>
                <span style={{ fontSize: 10, color: PRIORITY_COLOR[r.urgency] || t.text4, background: (PRIORITY_COLOR[r.urgency] || t.text4) + "18", borderRadius: 20, padding: "2px 8px", fontWeight: 700 }}>{r.urgency}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{r.title}</span>
              </div>
              {r.desc ? <div style={{ fontSize: 12, color: t.text3, marginBottom: 6 }}>{r.desc}</div> : null}
              <div style={{ fontSize: 11, color: t.text4, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <span>요청자: {r.requester}</span>{r.assignee ? <span>담당자: {r.assignee}</span> : null}{r.desiredDate ? <span>희망일: {r.desiredDate}</span> : null}
                {isManager ? (
                  <div style={{ marginLeft: "auto", display: "flex", gap: 5 }}>
                    <select value={r.status} onChange={function (e) { updateStatus(r.id, e.target.value); }} style={{ background: t.inputBg, border: "1px solid " + t.inputBorder, borderRadius: 8, padding: "3px 8px", fontSize: 11, color: t.text, outline: "none", cursor: "pointer" }}>{["대기", "처리중", "완료", "반려"].map(function (st) { return <option key={st}>{st}</option>; })}</select>
                    <button onClick={function () { deleteReq(r.id); }} style={{ background: "#f8717118", border: "none", borderRadius: 8, padding: "3px 8px", fontSize: 11, color: "#f87171", cursor: "pointer" }}><Trash2 size={11} strokeWidth={2} /></button>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HomePanel(props) {
  const { t } = useTheme();
  const { currentUser, users, videoTasks, marketingTasks, designTasks, onSelectVideo, onSelectMarketing, onSelectDesign, staleDays } = props;
  const today = new Date();
  const pad = function (n) { return String(n).padStart(2, "0"); };
  const todayStr = today.getFullYear() + "-" + pad(today.getMonth() + 1) + "-" + pad(today.getDate());
  const in7 = new Date(today); in7.setDate(in7.getDate() + 7);
  const in7Str = in7.getFullYear() + "-" + pad(in7.getMonth() + 1) + "-" + pad(in7.getDate());
  const TYPE_INFO = { video: { icon: Film, label: "영상", color: "#818cf8", firstStage: STAGES[0], reviewStage: STAGES[STAGES.length - 2] }, marketing: { icon: CalendarDays, label: "마케팅", color: "#fb923c", firstStage: MARKETING_STAGES[0], reviewStage: MARKETING_STAGES[MARKETING_STAGES.length - 2] }, design: { icon: Palette, label: "디자인", color: "#f87171", firstStage: DESIGN_STAGES[0], reviewStage: DESIGN_STAGES[DESIGN_STAGES.length - 2] } };
  const canApprove = currentUser.role === "admin" || currentUser.role === "manager";
  const withKind = function (list, kind) { return list.map(function (tk) { return Object.assign({}, tk, { kind: kind }); }); };
  const all = withKind(videoTasks, "video").concat(withKind(marketingTasks, "marketing")).concat(withKind(designTasks, "design"));
  const isDone = function (item) { if (item.kind === "video") return item.status === "업무 완료"; return item.status === "완료"; };
  const isOverdueItem = function (item) { return item.due && item.due < todayStr && item.status === TYPE_INFO[item.kind].firstStage; };
  const pendingApproval = canApprove ? all.filter(function (item) { return item.status === TYPE_INFO[item.kind].reviewStage; }) : [];
  const myActive = all.filter(function (item) { return item.assignee === currentUser.name && !isDone(item); });
  const overdueAll = all.filter(isOverdueItem);
  const in2 = new Date(today); in2.setDate(in2.getDate() + 2);
  const in2Str = in2.getFullYear() + "-" + pad(in2.getMonth() + 1) + "-" + pad(in2.getDate());
  const myDeadlineAlerts = all.filter(function (item) { return item.assignee === currentUser.name && item.deadline && !isDone(item) && item.deadline <= in2Str; }).sort(function (a, b) { return a.deadline < b.deadline ? -1 : 1; });
  const staleThreshold = (staleDays || 3) * 24 * 60 * 60 * 1000;
  const staleTasks = all.filter(function (item) { return !isDone(item) && Date.now() - (item.statusChangedAt || item.createdAt || 0) > staleThreshold; }).sort(function (a, b) { return (a.statusChangedAt || 0) - (b.statusChangedAt || 0); });
  const upcoming = all.filter(function (item) { return item.due && item.due >= todayStr && item.due <= in7Str && !isDone(item); }).sort(function (a, b) { return a.due < b.due ? -1 : 1; });
  const todayItems = all.filter(function (item) { return item.due === todayStr; });
  const members = users.filter(function (u) { return u.approved; });
  const workload = members.map(function (u) { return { name: u.name, count: all.filter(function (item) { return item.assignee === u.name && !isDone(item); }).length }; }).sort(function (a, b) { return b.count - a.count; });
  const maxWorkload = Math.max.apply(null, workload.map(function (w) { return w.count; }).concat([1]));
  const handleClick = function (item) {
    if (item.kind === "video") onSelectVideo(item);
    else if (item.kind === "marketing") onSelectMarketing(item);
    else onSelectDesign(item);
  };
  const s = { background: t.surface, borderRadius: 15, padding: "15px 17px", border: "1px solid " + t.border };
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ background: "linear-gradient(135deg,#6366f1,#818cf8)", borderRadius: 16, padding: "18px 22px" }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: "#fff" }}>안녕하세요, {currentUser.name}님</div>
        <div style={{ fontSize: 12, color: "#ffffffcc", marginTop: 3 }}>{today.getFullYear()}년 {today.getMonth() + 1}월 {today.getDate()}일 오늘의 업무 현황이에요</div>
      </div>
      {(function () {
        const priorityWeight = { 높음: 0, 중간: 1, 낮음: 2 };
        const myTodo = myActive.slice().sort(function (a, b) {
          const pw = (priorityWeight[a.priority] || 1) - (priorityWeight[b.priority] || 1);
          if (pw !== 0) return pw;
          const ad = a.deadline || a.due || "9999", bd = b.deadline || b.due || "9999";
          return ad < bd ? -1 : ad > bd ? 1 : 0;
        });
        return (
          <div style={s}>
            <div style={{ fontSize: 12, fontWeight: 700, color: t.text4, marginBottom: 10, textTransform: "uppercase", letterSpacing: ".5px", display: "flex", alignItems: "center", gap: 6 }}><CheckCircle2 size={13} strokeWidth={2} /> 오늘 내가 할 일 ({myTodo.length})</div>
            {myTodo.length === 0 ? <EmptyState icon={CheckCircle2} text="진행중인 업무가 없어요" compact /> : null}
            {myTodo.slice(0, 8).map(function (item) {
              const info = TYPE_INFO[item.kind];
              return (
                <div key={item.kind + "_" + item.id} onClick={function () { handleClick(item); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: "1px solid " + t.border, cursor: "pointer" }}>
                  <span style={{ fontSize: 10, background: info.color + "20", color: info.color, borderRadius: 20, padding: "2px 8px", fontWeight: 700, flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 3 }}><info.icon size={10} strokeWidth={2.5} /> {info.label}</span>
                  <span style={{ fontSize: 10, color: PRIORITY_COLOR[item.priority], background: PRIORITY_COLOR[item.priority] + "18", padding: "2px 7px", borderRadius: 20, fontWeight: 700, flexShrink: 0 }}>{item.priority}</span>
                  <span style={{ fontSize: 13, color: t.text, flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</span>
                  <span style={{ fontSize: 11, color: t.text4, flexShrink: 0 }}>{item.status}</span>
                </div>
              );
            })}
          </div>
        );
      })()}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
        <div style={Object.assign({}, s, { textAlign: "center" })}><div style={{ fontSize: 24, fontWeight: 900, color: "#818cf8" }}>{myActive.length}</div><div style={{ fontSize: 11, color: t.text4, marginTop: 3 }}>내 진행중 업무</div></div>
        <div style={Object.assign({}, s, { textAlign: "center" })}><div style={{ fontSize: 24, fontWeight: 900, color: "#f87171" }}>{overdueAll.length}</div><div style={{ fontSize: 11, color: t.text4, marginTop: 3 }}>전체 시작 지연</div></div>
        <div style={Object.assign({}, s, { textAlign: "center" })}><div style={{ fontSize: 24, fontWeight: 900, color: "#fb923c" }}>{myDeadlineAlerts.length}</div><div style={{ fontSize: 11, color: t.text4, marginTop: 3 }}>내 마감 임박/초과</div></div>
        <div style={Object.assign({}, s, { textAlign: "center" })}><div style={{ fontSize: 24, fontWeight: 900, color: "#fbbf24" }}>{todayItems.length}</div><div style={{ fontSize: 11, color: t.text4, marginTop: 3 }}>오늘 시작 예정</div></div>
        <div style={Object.assign({}, s, { textAlign: "center" })}><div style={{ fontSize: 24, fontWeight: 900, color: "#34d399" }}>{upcoming.length}</div><div style={{ fontSize: 11, color: t.text4, marginTop: 3 }}>7일 내 예정</div></div>
        {canApprove ? <div style={Object.assign({}, s, { textAlign: "center" })}><div style={{ fontSize: 24, fontWeight: 900, color: "#38bdf8" }}>{pendingApproval.length}</div><div style={{ fontSize: 11, color: t.text4, marginTop: 3 }}>승인 대기</div></div> : null}
      </div>
      {myDeadlineAlerts.length > 0 ? (
        <div style={Object.assign({}, s, { border: "1px solid #fb923c40" })}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#fb923c", marginBottom: 10, display: "flex", alignItems: "center", gap: 5 }}><Clock size={13} strokeWidth={2} /> 내 마감 임박/초과 업무 ({myDeadlineAlerts.length})</div>
          {myDeadlineAlerts.slice(0, 6).map(function (item) {
            const info = TYPE_INFO[item.kind];
            const isPast = item.deadline < todayStr;
            return <div key={item.kind + "_" + item.id} onClick={function () { handleClick(item); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid " + t.border, cursor: "pointer" }}><span style={{ fontSize: 10, background: info.color + "20", color: info.color, borderRadius: 20, padding: "2px 8px", fontWeight: 700, flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 3 }}><info.icon size={10} strokeWidth={2.5} /> {info.label}</span><span style={{ fontSize: 13, color: t.text, flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</span><span style={{ fontSize: 11, color: isPast ? "#f87171" : "#fb923c", fontWeight: 700 }}>{isPast ? "마감 초과" : "마감 " + item.deadline.slice(5)}</span></div>;
          })}
        </div>
      ) : null}
      {canApprove && pendingApproval.length > 0 ? (
        <div style={Object.assign({}, s, { border: "1px solid #38bdf840" })}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#38bdf8", marginBottom: 10, display: "flex", alignItems: "center", gap: 5 }}><CheckCircle2 size={13} strokeWidth={2} /> 승인 대기 업무 ({pendingApproval.length})</div>
          {pendingApproval.slice(0, 6).map(function (item) {
            const info = TYPE_INFO[item.kind];
            return <div key={item.kind + "_" + item.id} onClick={function () { handleClick(item); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid " + t.border, cursor: "pointer" }}><span style={{ fontSize: 10, background: info.color + "20", color: info.color, borderRadius: 20, padding: "2px 8px", fontWeight: 700, flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 3 }}><info.icon size={10} strokeWidth={2.5} /> {info.label}</span><span style={{ fontSize: 13, color: t.text, flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</span><Avatar name={item.assignee} size={18} users={users} /><span style={{ fontSize: 11, color: t.text4 }}>{item.assignee}</span></div>;
          })}
        </div>
      ) : null}
      {canApprove && staleTasks.length > 0 ? (
        <div style={Object.assign({}, s, { border: "1px solid #a78bfa40" })}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#a78bfa", marginBottom: 10, display: "flex", alignItems: "center", gap: 5 }}><RefreshCw size={13} strokeWidth={2} /> 정체된 업무 · {staleDays || 3}일 이상 단계 변경 없음 ({staleTasks.length})</div>
          {staleTasks.slice(0, 6).map(function (item) {
            const info = TYPE_INFO[item.kind];
            const daysStuck = Math.floor((Date.now() - (item.statusChangedAt || item.createdAt || 0)) / (24 * 60 * 60 * 1000));
            return <div key={item.kind + "_" + item.id} onClick={function () { handleClick(item); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid " + t.border, cursor: "pointer" }}><span style={{ fontSize: 10, background: info.color + "20", color: info.color, borderRadius: 20, padding: "2px 8px", fontWeight: 700, flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 3 }}><info.icon size={10} strokeWidth={2.5} /> {info.label}</span><span style={{ fontSize: 13, color: t.text, flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title} · {item.status}</span><span style={{ fontSize: 11, color: "#a78bfa", fontWeight: 700 }}>{daysStuck}일째</span></div>;
          })}
        </div>
      ) : null}
      {overdueAll.length > 0 ? (
        <div style={Object.assign({}, s, { border: "1px solid #f8717140" })}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#f87171", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}><Clock size={13} strokeWidth={2} /> 시작 지연 업무 ({overdueAll.length})</div>
          {overdueAll.slice(0, 6).map(function (item) {
            const info = TYPE_INFO[item.kind];
            return <div key={item.kind + "_" + item.id} onClick={function () { handleClick(item); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid " + t.border, cursor: "pointer" }}><span style={{ fontSize: 10, background: info.color + "20", color: info.color, borderRadius: 20, padding: "2px 8px", fontWeight: 700, flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 3 }}><info.icon size={10} strokeWidth={2.5} /> {info.label}</span><span style={{ fontSize: 13, color: t.text, flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</span><span style={{ fontSize: 11, color: t.text4 }}>{item.assignee}</span></div>;
          })}
        </div>
      ) : null}
      <div style={s}>
        <div style={{ fontSize: 12, fontWeight: 700, color: t.text4, marginBottom: 10, textTransform: "uppercase", letterSpacing: ".5px", display: "flex", alignItems: "center", gap: 6 }}><Calendar size={13} strokeWidth={2} /> 다가오는 일정 (7일 이내)</div>
        {upcoming.length === 0 ? <EmptyState icon={Calendar} text="예정된 일정이 없습니다" compact /> : null}
        {upcoming.slice(0, 10).map(function (item) {
          const info = TYPE_INFO[item.kind];
          return (
            <div key={item.kind + "_" + item.id} onClick={function () { handleClick(item); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: "1px solid " + t.border, cursor: "pointer" }}>
              <span style={{ fontSize: 10, background: info.color + "20", color: info.color, borderRadius: 20, padding: "2px 8px", fontWeight: 700, flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 3 }}><info.icon size={10} strokeWidth={2.5} /> {info.label}</span>
              <span style={{ fontSize: 13, color: t.text, flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</span>
              <Avatar name={item.assignee} size={18} users={users} />
              <span style={{ fontSize: 11, color: t.text4, width: 60, flexShrink: 0, textAlign: "right" }}>{item.due.slice(5)}</span>
            </div>
          );
        })}
      </div>
      <div style={s}>
        <div style={{ fontSize: 12, fontWeight: 700, color: t.text4, marginBottom: 12, textTransform: "uppercase", letterSpacing: ".5px", display: "flex", alignItems: "center", gap: 6 }}><Users size={13} strokeWidth={2} /> 담당자별 업무량 (진행중 기준)</div>
        {workload.length === 0 ? <EmptyState icon={BarChart3} text="데이터가 없습니다" compact /> : null}
        {workload.map(function (w) {
          return (
            <div key={w.name} style={{ marginBottom: 9 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}><div style={{ display: "flex", gap: 7, alignItems: "center" }}><Avatar name={w.name} size={20} users={users} /><span style={{ fontSize: 12, color: t.text2 }}>{w.name}</span></div><span style={{ fontSize: 11, color: t.text4 }}>{w.count}건</span></div>
              <div style={{ background: t.bg, borderRadius: 99, height: 5 }}><div style={{ width: (w.count / maxWorkload * 100) + "%", background: w.count >= maxWorkload ? "#f87171" : "#6366f1", height: "100%", borderRadius: 99 }} /></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FloatingChatWidget(props) {
  const { t } = useTheme();
  const { tasks, marketingTasks, designTasks } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState(function () {
    const saved = getCookie("timbel_chat_pos");
    if (!saved) return null;
    try { const parsed = JSON.parse(saved); if (typeof parsed.x === "number" && typeof parsed.y === "number") return parsed; } catch (e) {}
    return null;
  });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef({ active: false, startX: 0, startY: 0, origX: 0, origY: 0, moved: false });
  const btnRef = useRef(null);
  const [messages, setMessages] = useState([{ role: "assistant", content: "안녕하세요! 무엇을 도와드릴까요?" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(function () {
    const handleMove = function (e) {
      if (!dragRef.current.active) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const dx = clientX - dragRef.current.startX;
      const dy = clientY - dragRef.current.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragRef.current.moved = true;
      const w = isOpen ? 320 : 58, h = isOpen ? 440 : 58;
      let newX = dragRef.current.origX + dx;
      let newY = dragRef.current.origY + dy;
      newX = Math.max(6, Math.min(window.innerWidth - w - 6, newX));
      newY = Math.max(6, Math.min(window.innerHeight - h - 6, newY));
      setPos({ x: newX, y: newY });
    };
    const handleUp = function () {
      if (dragRef.current.active) {
        setPos(function (p) { if (p) setCookie("timbel_chat_pos", JSON.stringify(p), 365); return p; });
      }
      dragRef.current.active = false;
      setDragging(false);
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleUp);
    return function () {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleUp);
    };
  }, [isOpen]);

  const startDrag = function (e) {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const rect = btnRef.current.getBoundingClientRect();
    dragRef.current = { active: true, startX: clientX, startY: clientY, origX: rect.left, origY: rect.top, moved: false };
    setDragging(true);
  };
  const handleToggle = function () {
    if (dragRef.current.moved) { dragRef.current.moved = false; return; }
    setIsOpen(!isOpen);
  };

  const summary = tasks.concat(marketingTasks).concat(designTasks).slice(0, 40).map(function (tk) { return "[" + tk.status + "] " + tk.title + " (담당:" + tk.assignee + ", 마감:" + tk.due + ")"; }).join("\n");

  const send = async function () {
    if (!input.trim() || loading) return;
    const userMsg = input.trim(); setInput("");
    const newMessages = messages.concat([{ role: "user", content: userMsg }]);
    setMessages(newMessages); setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 800, system: "당신은 TIMBEL 업무 스케줄러의 AI 어시스턴트입니다. 친절하고 간결하게 한국어로 답변하세요.\n\n현재 업무 현황:\n" + summary, messages: newMessages.map(function (m) { return { role: m.role, content: m.content }; }) }) });
      const data = await res.json();
      setMessages(function (prev) { return prev.concat([{ role: "assistant", content: data.content.map(function (c) { return c.text || ""; }).join("\n") }]); });
    } catch (e) {
      setMessages(function (prev) { return prev.concat([{ role: "assistant", content: "오류가 발생했습니다." }]); });
    }
    setLoading(false);
  };

  const panelW = isOpen ? Math.min(320, window.innerWidth * 0.9) : 58;
  const panelH = isOpen ? 440 : 58;
  const clampedPos = pos ? { x: Math.max(6, Math.min(window.innerWidth - panelW - 6, pos.x)), y: Math.max(6, Math.min(window.innerHeight - panelH - 6, pos.y)) } : null;
  const posStyle = clampedPos ? { left: clampedPos.x, top: clampedPos.y, right: "auto", bottom: "auto" } : { right: 24, bottom: 24 };

  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: "@keyframes tbFloatBounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }" }} />
      {!isOpen ? (
        <button ref={btnRef} onMouseDown={startDrag} onTouchStart={startDrag} onClick={handleToggle} style={Object.assign({ position: "fixed", width: 58, height: 58, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#ec4899)", border: "none", cursor: dragging ? "grabbing" : "grab", boxShadow: "0 8px 24px #00000060", fontSize: 26, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", animation: dragging ? "none" : "tbFloatBounce 3s ease-in-out infinite" }, posStyle)} title="AI 어시스턴트"><Sparkles size={24} strokeWidth={1.75} color="#fff" /></button>
      ) : (
        <div ref={btnRef} style={Object.assign({ position: "fixed", width: "min(90vw, 320px)", height: 440, background: t.surface, borderRadius: 18, border: "1px solid " + t.border, boxShadow: "0 16px 48px #000a", zIndex: 9999, display: "flex", flexDirection: "column", overflow: "hidden" }, posStyle)}>
          <div onMouseDown={startDrag} onTouchStart={startDrag} style={{ padding: "12px 14px", background: "linear-gradient(135deg,#6366f1,#ec4899)", display: "flex", alignItems: "center", gap: 8, cursor: dragging ? "grabbing" : "grab", flexShrink: 0 }}>
            <Sparkles size={17} strokeWidth={1.75} color="#fff" />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", flex: 1 }}>AI 어시스턴트</span>
            <button onClick={function () { setIsOpen(false); }} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {messages.map(function (m, i) { return <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}><div style={{ maxWidth: "80%", padding: "8px 12px", borderRadius: m.role === "user" ? "12px 12px 3px 12px" : "12px 12px 12px 3px", background: m.role === "user" ? "#6366f1" : t.surface2, color: m.role === "user" ? "#fff" : t.text, fontSize: 12.5, lineHeight: 1.5, whiteSpace: "pre-wrap", border: m.role === "user" ? "none" : "1px solid " + t.border }}>{m.content}</div></div>; })}
            {loading ? <div style={{ fontSize: 11, color: t.text4 }}>입력 중...</div> : null}
          </div>
          <div style={{ padding: 10, borderTop: "1px solid " + t.border, display: "flex", gap: 6, flexShrink: 0 }}>
            <input value={input} onChange={function (e) { setInput(e.target.value); }} onKeyDown={function (e) { if (e.key === "Enter") send(); }} placeholder="메시지 입력..." style={{ flex: 1, background: t.inputBg, border: "1px solid " + t.inputBorder, borderRadius: 10, padding: "8px 10px", fontSize: 12.5, color: t.text, outline: "none", minWidth: 0 }} />
            <button onClick={send} style={{ background: "#6366f1", border: "none", borderRadius: 10, padding: "0 12px", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", flexShrink: 0 }}><Send size={14} strokeWidth={2} /></button>
          </div>
        </div>
      )}
    </div>
  );
}

function ActivityLogPanel(props) {
  const { t } = useTheme();
  const { onRestore, onCleanup, isAdmin } = props;
  const log = (props.log || []).slice().sort(function (a, b) { return b.createdAt - a.createdAt; });
  const ACTION_COLOR = { "생성": "#34d399", "삭제": "#f87171", "단계 변경": "#818cf8", "일괄 삭제": "#f87171", "일괄 변경": "#fbbf24", "복구": "#38bdf8" };
  const [restoredIds, setRestoredIds] = useState({});
  const exportLog = function () {
    downloadCSV("활동로그_전체.csv", log.map(function (entry) { return { 시간: entry.time, 실행자: entry.actor, 동작: entry.action, 내용: entry.detail }; }));
  };
  const cleanupOld = function () {
    if (!onCleanup) return;
    const days = window.prompt("몇 일 이전 기록을 삭제할까요? (예: 180) — 먼저 CSV로 백업하시는 걸 추천드려요.", "180");
    if (!days || isNaN(Number(days))) return;
    const cutoff = Date.now() - Number(days) * 24 * 60 * 60 * 1000;
    const removeCount = log.filter(function (e) { return e.createdAt < cutoff; }).length;
    if (removeCount === 0) { alert("삭제할 오래된 기록이 없습니다."); return; }
    if (!window.confirm(removeCount + "개의 기록(그 이전은 영구 삭제)을 정리하시겠습니까? 이 작업은 되돌릴 수 없어요.")) return;
    onCleanup(cutoff);
  };
  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <button onClick={exportLog} style={{ display: "flex", alignItems: "center", gap: 6, background: t.surface2, border: "1px solid " + t.border, borderRadius: 11, padding: "7px 14px", fontWeight: 700, fontSize: 12, color: t.text3, cursor: "pointer" }}><Download size={13} strokeWidth={2} /> 전체 CSV로 내보내기</button>
        {isAdmin && onCleanup ? <button onClick={cleanupOld} style={{ display: "flex", alignItems: "center", gap: 6, background: "#f8717118", border: "1px solid #f8717130", borderRadius: 11, padding: "7px 14px", fontWeight: 700, fontSize: 12, color: "#f87171", cursor: "pointer" }}><Trash2 size={13} strokeWidth={2} /> 오래된 기록 정리</button> : null}
      </div>
      <div style={{ background: t.surface, borderRadius: 16, border: "1px solid " + t.border, overflow: "hidden" }}>
        <div style={{ padding: "12px 18px", borderBottom: "1px solid " + t.border, fontSize: 12, fontWeight: 700, color: t.text4, textTransform: "uppercase", letterSpacing: ".5px" }}>전체 활동 ({log.length}) · 자동 삭제 없이 모두 보존돼요 · 최근 200개만 표시</div>
        {log.length === 0 ? <EmptyState icon={History} text="활동 기록이 없습니다" /> : null}
        {log.slice(0, 200).map(function (entry) {
          const canRestore = entry.action === "삭제" && entry.snapshot && entry.restoreType && onRestore;
          const alreadyRestored = restoredIds[entry.id];
          return (
            <div key={entry.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 18px", borderBottom: "1px solid " + t.border, flexWrap: "wrap" }}>
              <span style={{ fontSize: 10, color: ACTION_COLOR[entry.action] || t.text4, background: (ACTION_COLOR[entry.action] || t.text4) + "18", borderRadius: 20, padding: "2px 8px", fontWeight: 700, flexShrink: 0 }}>{entry.action}</span>
              <span style={{ fontSize: 13, color: t.text2, flex: 1, minWidth: 0 }}>{entry.detail}</span>
              <span style={{ fontSize: 11, color: t.text4, flexShrink: 0 }}>{entry.actor}</span>
              <span style={{ fontSize: 10, color: t.text5, flexShrink: 0 }}>{entry.time}</span>
              {canRestore ? <button disabled={alreadyRestored} onClick={function () { onRestore(entry); setRestoredIds(function (prev) { return Object.assign({}, prev, { [entry.id]: true }); }); }} style={{ background: alreadyRestored ? t.surface2 : "#38bdf820", border: "1px solid " + (alreadyRestored ? t.border : "#38bdf840"), borderRadius: 10, padding: "4px 10px", fontSize: 11, cursor: alreadyRestored ? "default" : "pointer", color: alreadyRestored ? t.text5 : "#38bdf8", fontWeight: 700, flexShrink: 0 }}><span style={{display:"inline-flex",alignItems:"center",gap:4}}>{alreadyRestored ? <Check size={11} strokeWidth={2.5}/> : <RotateCcw size={11} strokeWidth={2}/>}{alreadyRestored ? "복구됨" : "복구"}</span></button> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SearchModal(props) {
  const { t } = useTheme();
  const { videoTasks, marketingTasks, designTasks, ads, onSelectVideo, onSelectMarketing, onSelectDesign, onNavigateTab, onClose } = props;
  const [overtimeEntries] = useFirebaseData("overtimeEntries", []);
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const TYPE_INFO = { video: { icon: Film, label: "영상", color: "#818cf8" }, marketing: { icon: CalendarDays, label: "마케팅", color: "#fb923c" }, design: { icon: Palette, label: "디자인", color: "#f87171" }, ad: { icon: Megaphone, label: "광고", color: "#fbbf24" }, overtime: { icon: Clock, label: "야근", color: "#38bdf8" } };
  const matches = function (tk) {
    const hay = [tk.title, tk.desc, tk.assignee, tk.tag, tk.category, tk.status].concat((tk.comments || []).map(function (c) { return c.text; })).filter(Boolean).join(" ").toLowerCase();
    return hay.indexOf(q) !== -1;
  };
  const matchesAd = function (ad) {
    const hay = [ad.content, ad.requester, ad.note, ad.modifyContent].filter(Boolean).join(" ").toLowerCase();
    return hay.indexOf(q) !== -1;
  };
  const matchesOvertime = function (e) {
    const hay = [e.reason, e.user].filter(Boolean).join(" ").toLowerCase();
    return hay.indexOf(q) !== -1;
  };
  const results = q ? videoTasks.filter(matches).map(function (tk) { return Object.assign({}, tk, { kind: "video" }); })
    .concat(marketingTasks.filter(matches).map(function (tk) { return Object.assign({}, tk, { kind: "marketing" }); }))
    .concat(designTasks.filter(matches).map(function (tk) { return Object.assign({}, tk, { kind: "design" }); }))
    .concat((ads || []).filter(matchesAd).map(function (ad) { return { id: ad.id, kind: "ad", title: ad.content || "광고", assignee: ad.requester, status: ad.workStatus, due: ad.workDate || ad.expectedDate || "" }; }))
    .concat((overtimeEntries || []).filter(matchesOvertime).map(function (e) { return { id: e.id, kind: "overtime", title: e.reason || "야근 기록", assignee: e.user, status: e.hours + "시간", due: e.date }; })) : [];
  const handleClick = function (item) {
    onClose();
    if (item.kind === "video") onSelectVideo(item);
    else if (item.kind === "marketing") onSelectMarketing(item);
    else if (item.kind === "design") onSelectDesign(item);
    else if (item.kind === "ad") onNavigateTab("ad");
    else if (item.kind === "overtime") onNavigateTab("overtime");
  };
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "#00000099", zIndex: 400, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "10vh", backdropFilter: "blur(4px)" }}>
      <div onClick={function (e) { e.stopPropagation(); }} style={{ background: t.surface, borderRadius: 20, width: "min(92vw, 560px)", maxHeight: "70vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 64px #000c" }}>
        <div style={{ padding: "16px 18px", borderBottom: "1px solid " + t.border }}>
          <input autoFocus value={query} onChange={function (e) { setQuery(e.target.value); }} placeholder="제목, 담당자, 코멘트로 검색... (영상·마케팅·디자인·광고·야근 전체)" style={{ width: "100%", background: t.inputBg, border: "1px solid " + t.inputBorder, borderRadius: 12, padding: "10px 14px", fontSize: 14, color: t.text, outline: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ overflowY: "auto", padding: "6px 8px" }}>
          {!q ? <EmptyState icon={Search} text="검색어를 입력하세요" /> : null}
          {q && results.length === 0 ? <EmptyState icon={SearchX} text="검색 결과가 없습니다" /> : null}
          {results.map(function (item) {
            const info = TYPE_INFO[item.kind];
            return (
              <div key={item.kind + "_" + item.id} onClick={function () { handleClick(item); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 11, cursor: "pointer" }}>
                <span style={{ fontSize: 10, background: info.color + "20", color: info.color, borderRadius: 20, padding: "2px 8px", fontWeight: 700, flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 3 }}><info.icon size={10} strokeWidth={2.5} /> {info.label}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: t.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: t.text4 }}>{item.assignee} · {item.status} · {item.due}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TimbelAssistant.jsx — TIMBEL 스케줄러용 AI 가이드 캐릭터 (프로토타입 v1)
// ----------------------------------------------------------------------------
// - 화면을 돌아다니는 SVG 캐릭터 "팀비" (눈 깜빡임, 걷기 바운스, 감정 표현)
// - 말풍선 대화 + Claude API 연동 (응답을 액션 JSON으로 받아 실행)
// - 액션: speak(말하기) / open_tab(탭 이동) / move_to(요소 옆으로 이동+가리키기) / tour(가이드 투어)
// - 기존 App.jsx 하단에 붙여넣고 <TimbelAssistant ... /> 한 줄만 추가하면 동작
//   (자세한 통합 방법은 함께 드린 통합가이드.md 참고)
// ============================================================================


// ── 캐릭터가 알고 있는 앱 지도 (AI 시스템 프롬프트 + 투어에 사용) ──
const GUIDE_MAP = {
  home: { label: "홈", desc: "오늘 할 일, 마감 임박, 승인 대기, 담당자별 업무량 요약" },
  unified: { label: "통합 캘린더", desc: "영상·마케팅·디자인·광고 일정을 한 화면에서 보는 캘린더" },
  calendar: { label: "영상 캘린더", desc: "영상 제작 일정 관리, 반복 일정, 일괄 담당자 변경" },
  adCalendar: { label: "마케팅 캘린더", desc: "마케팅 업무 일정 관리" },
  designCalendar: { label: "디자인 캘린더", desc: "디자인 업무 일정 관리" },
  timeline: { label: "타임라인", desc: "간트 차트 형태로 월간 일정을 한눈에 보기" },
  board: { label: "제작 보드", desc: "칸반 보드. 기획→촬영→편집→검토→완료 단계 관리, WIP 제한" },
  ad: { label: "광고 제작 관리", desc: "타사 광고/인터뷰 파생 광고의 컨펌·업로드 상태 표 관리" },
  stats: { label: "통계", desc: "완료율, 단계별/담당자별 통계, 월간·연간 보고서 생성, CSV" },
  overtime: { label: "야근 기록", desc: "야근 시간 기록과 대체휴가 사용 관리" },
  messages: { label: "메시지(메모)", desc: "팀원 간 1:1 메시지" },
  ai: { label: "AI 분석", desc: "제작 현황 리포트, 영상/광고/디자인 AI 분석" },
  activity: { label: "활동 로그", desc: "모든 변경 이력 조회, 삭제 항목 복구" },
  requests: { label: "업무 요청함", desc: "타 부서의 영상·디자인·광고 제작 요청 접수" },
};

const TOUR_STEPS = [
  { tab: "home", text: "여기는 홈이에요! 오늘 할 일과 마감 임박 업무를 한눈에 볼 수 있어요." },
  { tab: "unified", text: "통합 캘린더예요. 영상·마케팅·디자인·광고 일정이 전부 모여요." },
  { tab: "board", text: "제작 보드! 업무를 기획→촬영→편집→검토→완료 단계로 옮기며 관리해요." },
  { tab: "ad", text: "광고 제작 관리 표예요. 컨펌 상태와 업로드 일정을 여기서 챙겨요." },
  { tab: "stats", text: "통계 탭이에요. 완료율을 확인하고 월간 보고서도 자동으로 만들 수 있어요." },
  { tab: "home", text: "투어 끝! 저를 클릭하면 언제든 물어볼 수 있어요. 잘 부탁해요!" },
];

// ── 이동/연출 상수 ──
const CHAR_W = 88;
const CHAR_H = 106;
const WALK_SPEED = 4.2; // px per frame
const IDLE_WANDER_MS = 14000;

function clampPos(x, y) {
  const maxX = window.innerWidth - CHAR_W - 8;
  const maxY = window.innerHeight - CHAR_H - 8;
  return { x: Math.max(8, Math.min(maxX, x)), y: Math.max(56, Math.min(maxY, y)) };
}

// ── 캐릭터 본체 (마스코트 "핸디" 이미지 스프라이트) ──
const HANDY_IMG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOYAAAEUCAYAAAA/R0odAAEAAElEQVR42uz9ebxl11Uein5jzLn23qerU736XpYlS26w5d7GJRs7xjZgQyQgF5JLEkxumpfuhpvkJUh6aW7yknsT8nJzb/JLbgKYAFVOaAwGOziSDTZNJAy2JDfqrKaqpOrrNHvvtdacY9w/xpxzzX2qjE0TixdS/tWv5Kpz9tl7rTXnHOMbX0P477/+q/+6++67+dZb76GHD9xP9x46FEGkF/u6wx/+jQPjpbV11+JgVH8NQfaK0uVQv8c5HoGwLOoOkPIqEU1IeZeAVxTagCBg7QE4JmIoAilIOYgqZsR6BtBTrOEcE0+hGgXxvKJ7mkWPK/i4cjyOSXv2PW9+2dmLvr/D6g4cuJ/uv/+Q3HMPlL7M5/jvv37vv+i/X4Lf/1+qSvfcAwLu51tvPaR33UVx4QF/6KHR6talk63nnzvoR5NXk9DN4vByiH8daLQG9SPHE6/kwJ7BRCBmqBBijFCxW6cqiKSAKgAC0XBTbcUoiCMAAjOB2cE5BpP9myqgvSDGFip9APWd43AOFP+LanyAiD7ehH0Pi5wI3/iumzYpv2y1UO+8E5p/3P+/LVRVpT+o75n+gF0oTu+JH3zwQQDAq171KqQbrwDkD+qFLKfiw9B77yWp/+0nf+HRq6Tv34jIbxSavChSc7kC+5R597hZW3Z+ghgjQugRJUAASFSoijKTikheelAVorQCiYhAYfGGpn9TFRABjAZRBERQkC1H+xKy/0VmckTMAIPgncN4MgI5RjfdgpNwXhE2ifunWPrHlOa/NKJdn+g6OfWe91yzcLIeVnU4cgR33XVX/AO6EDk9W/SqV70qEpGoqnvwwQf5Va96lfxBer7oD9IFI9rxlF38a326gPLCL0bli52KP3nfk7v7NuwP2+0fER6/UWj5nZPRyh7nJhBlhF4QpIVAIBGqSgIVEoCIFYoAUSEmQNWB1EMggAL5Y6uq7WCkIBBEBQSCywsTEQAD6tKeRlAaFm6qdkEc0mmsSkpgYhCxqDKcJ+c8wTFj3HiMnUeMLUI3FwYfjzj3QW7ox0D01OOzz539i+96V5uvy6FD4JMnj+idd975gj7sqkp2IS5cdHfeeac7cuRI3PH17g/CAqUXeEFSWpARAI4effzqtZV971pbX3+tPU2BAGB7ez5v2+5De/fuvY+IZi/0BVRVJoICw8/+yZ//3LXzef+OqP7dgvHLYhwdbMZry65ZxtZ8DpUoUBVRIYISQUmhgJVTAFAWl6otPKhCVEFEtpDUfhwzIKG3EhUeIIaKgInAzBDR4fRc2OsYzGyfQQTECqWIdIDaQmcrhAmAcgMipxIF7CCOWZnBjohHzQiTpQna6Tkl6k6Rzp/1LL/uEH/qnW+/+RcWS97D7oVYoHafhg38/KlTr22WJ9/VNKPVtp3v7bv+Unb05LgZT7dn81/d23U/Spddtn2x7/1DszDr+v706effuGvX+p9V1Xc3zWTdviLmjQ4AIfQRIcaHRt5/4uz58/98//79n8sl5L333itfi5t85AjozjuHzeBHfuqhl5DqexDXXteLvnG8tH4wYIQuKDQCMXQiUFEi54hIpIemZ1PFSkdVASAQEQAMIkaMAiYHgCEIAAQxRFtUdvhBRQAigMhuIhOgAlWyBal23RwJVBXMDIWmf0vLlBmQtBDZzlkuzQTA6sDUQDSCWOEc2deRAlB1OhbHzjUNwzfA0niEduusEsIvEoUnVPof62fTz33bt73ihN2r+/ytt578r36KqjXgjojC+9///uYHf/Cf/Glm9619333DZDJCO28xnc0Q+h7OOXjv87X53Ggy/rdfeuIjP3jbbXd1hw8fdi9UWU4v5KJ84IEHll/60lv/DjP9Re/HbmPjNGbzqYQQRWPCNFSRGiReXV3l9fV19H3YdM79nU9+8pP/5I477ghqN+G/wgVUOnz4CN9117fHGvf4oZ968usQw/8LNP7jzq8y8TK25zP0QUTACoBIhRiBRBUqtsEoRYAIEhUiBCJfTi4RSWUmp0UHSIgAHIgIqppOTFt0zAQVQHwoJykxQSTAsctrB1aUoJyUSKcpSEAAvB39VhoTofENlIAIhVOBIwGzAzEgUDB7KDGIAE8A22dSJlZyrJ6cW15ZgncCnW+j77eehpfvd935D33zN98+rYGju+6C1FXH72MVBiLSjY0zX7+ytv6PSPQ1m5sbOHHiBLp+FkQUMQayy6aqolAoTyZLfOmlByGCX53NZu+/+uobPvtCnZz0QixKAHj44YdXbrrpxp9pmvEd586flK5rJUZxEiNBDKmIUcHsICpQypWdysh7f8UVV0JC/PATX3ri+2666aZn77vvPn/HHXeE36/3eOQIuO4b/8OHPvvyeU/f0oXx25XX3uT9KqbTKUQkinOqKg4KygtM1RabEkFIgVyeQhOqCigUtgYZIrHa7jNqqmUdLdwyjelPBUGGU5MIkk5Tcg6kCkQpp6VEAfFQ7jIDpAIF4JwbCl7mgvAqFI3zYChAEd47qCjYVWUvMbxzAClICeQQCaQe5JqmocnEYz4//Vueu59vCB8N89MPvPe9b9qskN3flxO0WkTUdfO/pFH/Yd+3zbHjx2PXdRCBExVIsImViOzY1KJIVDl4yUE/WR6dmm6Hd91www3/5YVYnC/EwnT33HOPfv/3/9WfWV5ee/fG5qluPp+PQrAj0k4TQDX3WvbAGYqY/ltVQ4zx4IEDHoRnN2bbd1516aW/qqr+qwGQfrtftpPbgnzooYdGv/7Q0ss9850g+Wvc7EaQEbZmHQASVWHVWIAZAIgxlP5OokCgUGZw2mjs0Eo9nMJK2PSQDIdyXhUKSWVvfs3h5LT/7yiftrDONf07O1tAiBFUek8pD+FQ0qZS11kfC6iNUwhw7MBEUI22oEnT6MYqZwKXhew8JRSYQGwltqMGRKRMqpOlCY8bhUOL0G4djmHlnyw1v/HpdyXA6Pe6QPPi+Zmf+Znld7zjHf9iPB7/iaeffEqns6mIiOv63toGBWKMaUMhSNowDWizaxViCHv37fZ71vc93gV57RVXXHEW+NrObelrvSiJKG5unv4rq6t7/7ez554PIUQfYg/pgWgjAhhIC6hygv2pesNkuz+AvuvirvV1t75r12y2tfVNBy498LHfbVl7tyrfm3bFj3zkIyvPzy59f5TJn+z7pdsc78e8nULgYhCFkLi8axAEKopYTry0cIggViJBwaUs1wS8KBSphLLdWg1dVXtSyr/DzsTyvVyuJVJ/amAQAIgo8igk/3KgUiYT2aYARVmozLaQ7LqrzTnZTkrHbK0+CXxjJbVItO8hgiM2JNgB7J0hAmq9sHOu9MTEDHZeGNCRZ1oaT5i1B+HcQ4LZR6ht/+773vd15zKiu3Pc9NUuyk/f9+ndL3nDSw6PRqO3P/bo433fRx9CTzFEiApEYqkaoARRu2d587H9zq5T38/DlVdd6ZeWln/8kksv/86v9alJX8NFyQD06NGjNx04sPczIfZ+a3OTQgwkIoi9PXZ2cRhIJ2b9FgvgAUDTrh5DkFEz5vX19XYW2m+54pJ9H3nggQea22+/vf/qTsjD7uGH79R77yU5fPhO1+LvvS8q/gaP11857YF522vURjWtLk07K6Kmh5ygSunks3crMpxqCttwROyBUNG0oKiMPXLJaAs6nZRRQI6BPNpNCK3mUhmaJpGS/xlQATGX8YldybSRieSaI329FiiWOSG+au/ROYIi2umnbH+XFr+dlAZIe+/TK9op6tm2Tec9AIXzAVBKPaoHE8E5DyIV7x2Wx2OeTID59MSDTvXvTHj6qXe965UnL9ZKfKVF+cADDyy/9LaXfoQIb3ryyadD6MX3XY8YQp7jQjWm60J2XUnKKGmY/drmQxwhIvGaa67RpdHSoX2XXPLJryUYRF/r03J7+8y/XV7e8z+eOnUshhhd7MVKvgRSiOQyjne8RevN8ukZyf4/EyFEEe8879m7az6fT997xRWXfOSrKWvrC/0j//HTd4W++duCvbeJLmPedTFAKKqyIJYyECCQKiQSVJ0NdWIobzPGUEYbqpLAUTeUkUQL/aOK2EJNIIyolYt5dAIQyrOUFrwtpLRAbRBaSsp8IufFpnHoQfNiLhsCLT4BRIbOaoKNmRmMXN5aKZsXIRNKaQvkk5ahGsHOelSHdNLCSttR0wBkX+u8BxTCDro8GTtPESyzo5Ctf/q+97z0H+8Ecn67RXn48OHVb3r3t3yUmV//xJNPhNiL77oAibFsSnkzzCBX7o1z1WEXQIf/TxHtfBavuvoqt7yy8lOXXXbl+/7rgYwv0MLMF/D48ePX7d279lt96Fan21P0fSAJiijDBSt9ZSlnFza1VMoaQqh5EYMQQpSmcbxn7+5Z17V/9PLL9334yy3Ou+++zwOHxE7Jz7x+g5d/oO/xR9it0WyuMaqSCrHAHu6orS0WIURJkxw4QD0Ugj7OkQabiCEN7DWXoqnflHxqphNNBDHG3DKXU0/TqQcAGoe/L6SCzNpJ1yTEYKUl8vwxLWoaFqCqATXRRql2glEuhbX0rmn6MoBAxIbGil1xx5wWuZV7jhWQaAuVGS71nwDgHYNhi9J520Cb8QiECHaUACaB9yMQkRBYV8Yjp/GcOtf/kqPun3/re152BADuu+8+f+jQoVgv0PxMffjDHx6/6esP/fy4mdzxxGNPhr7vfQghfdaIGMUqAbrw0bfPnU9NLADEIj1ERZ0jXHnFlTM/mtx22WWXPfm1Kmn917JkXl4e3zoaraxtT7ejQp0KIKkUNBDiwtPSMAq1/glk3WUaK1Au+1TB7LnvRc6d2V5aX1/7qePPnHkfEf2cqjZE1OeZ5z333KNEFAjAv/6xR/6Xs7Ly94TW3ayba1RIUHI2Vwxp4SeOqhJUDCwgMs6qaJveJSPEoaSUKJAYF/vi9D4RNQFbWlBaJEZOFIFoGrho+pjVBiWq6dlRSDBCAVitVKv6U3Yuobw0nNzKpXwViQUwyg+l9aBVL08EQYQGSeAR0IeYPo+d2gICg8COIREIJPAu9bJiD7xjB58+SwxzuBHBCYGJ4IkRpIMATM5DoMI85pXJrq8nnX/9j//0p//vsZz7q3fccce5usJRVSZm+dSnPrV028te8TOjZnLH448/Gdq29zEYytz1wX5mDCDNwFks6DORPW82v8ytRa7aIkAMR6D5bBZVZZkbvAXAk1+rw+xr8kPyKOPkief+7f4D+//EqdPPS4zi+jYiRkNgC0qpAlIuSGzphQZANpV8nMmfBsIQIwrQ90G887x3z655kNl7rrzywMceUG0+dA9iBhX+3ZFH7+r6/s8ErN0xC0vo+z4SkVNNiwO2yw69oo0XNIErtr4iNAE+pN5GOglYqbZ1+0yQUgVQBn9UE+iCskh1YJ9XpapWpxrK11HpEbWUvfkEyFVFeQ3NPSbK64BQkdnz4uThBEcmHFAaJVflcqYDwhYY8gLPqC3BUN5EWGBiOMdomOy0dATPHh4O6gxMciM7xQmk3jthJVqdNNz3Zx5xXn54zeGH3vOe257LM/D77rtvctutt//UysrqH3niicdD3/e+Dx36TkDapBOvT6+p5drkUZCiOkXVTktKx71ILAu5befxyqsu55W11Q9dftnV3/K1Kme/Vidm7hIvBVDAnjwWMeg+lVPq7DoJAYzycErqdTJgIelk1dw9SYSoA7kRd6GXk2fOTXavr/7H55/fuusSoo8AwH/88AM3nD7b3B2w8t0tjTCfdaLSEQAnEhGiFPAGsNNRRIpSI6aexd4AoXDuNaS+zBZ23n1VUy+cy1DE4dSH2mfMr5uQ0gzuUDrZyhpB6jnJCO7E+XPnakLBxPbKOgA9ZZSSi13J7B81wgAN7zWPTvLYBLlSSSemLfCQTktDYOtTlpnQi1i/qQCrldnOpZLRMUgULIweAY0TOGUwK0R6OCYwE4mqA3lsToOMmvWXrCw1/2Bj69hdH/zZX/vLwJFP3nfffQduueml/3rSLP2Rxx97qu+CNm3XImq0+xKHft4+dSy9+VC2u4Sqp/qdpLDMmJ0BfGR9c98HgrL7Wq6Vr+nCtFldXlwDIqZ6Ef4HVbv7QMRJ6Kzm7b50VopmAFJAPJt1Mm/P71pdXfm5zz668c8+++nHX3TypB6Kfvfq9maQqKIRcKrWr9lMMZNjGDFGRIm50CsLb+gFtfRwIgJR2A1NC6OUjaksVR2kWJpHG7mUTZtTTH2pzQyRwKG029vKKHNdiZmlIKk3JEQJQ69eNiyxRcko7yWpTKCaqgMA7OxBtWurC9dcUpuRS2+RUEr0RDFKFQ+V2WuMCscCEoJogIrCOwffECgm9No38JHAHnCkiMxwzvpxxxFgcIgs83kr49H6K7fPnfj4Bz54+W+94pU37Yk0uvqLTzweJaJpuwAljxgAaARRC1GFUy5IedLVlLaAU++saUMjuHRn0lCKHDTNpCVGqET6b25hHjp0SAGgb7tHQ4zvzKVQ3plVqPA4czmYNrTE/uGKXqYQsr4vE76t5KTUU0TEoBDxPJ2Tnt3uHNzkL0/DJZjGiD40sQvq1FlJGWMPFQLDISaABmAEBQiGpsYKhcqLzso7o9RJ6t9yORvLiaWlEiiobFrZ+REos7NyatkKyl9dgJ+6lCYaqHagQlq395TL7lzGpp4vzYhLtZw7hAQ8Sfq3BEgWpJhIQWD00dgyw2apVXlrnynG9HcxwnEe9UZ4sU0rhAxmRTSNR4gBISq8GHOIERCdg3MEzwCxgrhhZs/9TCTGFe5i+/LPPnISl+1ZiQ2za7tt25zg7bOKgrgH4BDVmE2O84KMBdRSpaoH13Ja2mYa0rUkGJAUMZ+3/+2emOz5Z2OUv2BzP5RFsEA/hg2ko6SHnxmiVB64fPEInBZJZm/YaSka0QVC1CVMI+joc2f1/OZmJN5FQUYchVyIIZ2uJjoWJfSlbGRIGmWYNMoYcJk0YIPMVCZGW4iSd2EyooCmzyTVDVfKC1LKw20laILp06lLVY+ZS4Jh1MIGKhENvWM6VUWl9HcF2c5zzPL/OS3CmA5/+0wMO4E1s4Lq+XEGoUCloshqlxh7kCrUcdlsqPSlmQ5I6EXhG/u8QSKcA0RCAooYKhEhCJwDvNgCV89wTCASCHcgJo7S6LwN+vwXT+P45Jy77so9aCaAygyeHRwaMDEgnORrqbrQ4XMScdrYqmuSS/50ANjfRcSoiFHgfYOu738VAO6//376b2lhKgCcPbv57GQ8mTPxOCAoM1OMAwvFDsukxDdVV3XhBgqVlHmmS8wZRgw9QlREGUNdg40txdPHz2E6Z4Kf+CC2iKME692QTjixfilIPjFcQlYVqqEAKaZwCYV5tPjhrKSLkHIaCXRYZKWGTKddVZnnajYzcsrEMT05Sijjk1hO3dQHVyuQkPthXQCComIBHJKKpDGclkOZzql6yaT3GAOYpZAc2LmCOJfPWvWaRATI0KNqojhI15WTVZVBpDAgO8A3Dp4JClvs3ilUPTwI7IzkT2QyAFVP4/FenNvYxCNfeA5XXbMLKysNQugwcVbp+GYESuIAqJX1TJI2TE73J4Nh2f2Bq7kUp96/VQAcRXsJ8hOp+vuasH/494v0raqcf999990Lr5uU4nzbbbc9srW9/bGV5ZWMgJQdnqiCqzUrmlI5RENZZ4vAlT4qRqPDCTGCjiBYxbmpx+NPn8PWlCG6gj56hKjopbeTMlGzJFKaoSYieSTEEBGDybCMaqeJuTMgrkYckGrmaiVjTHIvFQVS6amSTj+x70G031r4sjVPVm2UUc3WygJN/TkRg5Ts/8uAntabhcJGKCoD40fVQKY0BIZGBcEBkqoXJYgSQn6L0Ra/WZmkPlpsDCSaX1+suijfbwQRew1CVCBESSfP8LuPgiAmZQshIvQRfR/Rdz1CUPRR0YWALvToY0QURRCxzVIAEsZoaQ1bscEXHz+Js+eAEMaYth0EihgEQbT8bEr9pb3vWGEAWiHQVOEG9rP6vpNdu3aRAvffdtttn985w6yee6eq7vDhw27ns/81PzE1F+mD84DuZPpgsJ8pHLTpdPrvdq3terdIJKL6S6rvFYOzmT0EaU4JB9FoZygRJFLpw2IMCNLA8xJOnG7x6FOn0csyREcI0R7ZENjKtYSyCoCgiiAESBiQSpEyM82njrGR4sA3TYvUFAq5pwSoAhdKqZlIBIYu2+JSzn2hXjCiIM5sn5iUGjYzBRnjKIZhLmebmKQNQ1PvVJ22aZwkiQc6sIa0UPZqSmAeEWsh2kspSyV9XQx2rZzjwtLSVNYPA3v7dyIxbWkSaEcxhhQrGb7EDPKKECKEAecAp86AJicQjnBxAicNHHsAYpuwtAga0UyW0G0Djz92Btdds4q9exxEOkTA5Gu21UEi0DiCd5xaDRj5oXBkdWF6aFW4oO8DTSYTiOj/SUSaD51Dhw7xoUOHcLHnPl1Tn0jvv+uxCv0uF+XCzvGWt7zF//t//+8vX1paAgAcO3asu+22255b/J4HGuBV+iu/8ivNwQMHHtyzZ/ctW1tTESEmJQhs4aDU/0kRgVRiSIDQCFC74CF2duiqQxciYtPgzCng0SfPYx5GCEIIylCx8kg0wg6s/JARQkxIbGbUJFBHh885nNQiiW9kfZQUeVai5tlju6BtHBbmoCpBIbinU9M7K83zDJQMQMn9KycQhfJjlggDhgDn16fCJiqosZhHAijaJkCLYGuSdZZ5KqrPM6CswxyTM6mgIJmmK2XOI5ww9GipB84jlsK75TSeSUiyT+ML49XaYuYEAjrPaDyBeQRml0q71ISTnYIx2DXr221AtnDtlbuxf6+HoznYTeAZaEhBztBe5xLVMPfJXM96pXz2GHvM27msrCzzeDL+1aXlpbecPHlS1tbWqOZgP/TQQ3sPHDhwlVM9GImIiGaz2enHr7nmlmMVPxy/G6aQ/10syjJgPXPmzFsmy5PvcOBXRZGXOueCivB11147D133S9uz2fEQwk8/+eSTDxDdfiq9RPiN33jg36ytrf9jZqdGOzMlvfUCXE6S9JwBRIkby1B1UHTG3ICg7wngVZw6t4XHnjyDeb+OSIygESG0EGmSiiNCwQgykM8zKbsmMuQxQiHUF35DGn1URaMMQ4liflVGQ1Eq1o8sNtvFLoQKglrK+BgLEYCIICGVyvnNpnI+hJqgqBDTuQzvJxHdVazM5iIJszldQo1AXM1KmY2ZFMUIAswIIQ3bCYVtVBDkVKoO13HwIhJVGIHG+rqYuk27t/be+yggGBk+RJvbNg2DrfJHHxSEHt6ZYoU5OT84Bol99kiCZjxG3ymeevoMSPdg7/oIEAGlMUzjc7VEaBwDGiGO0maYq5ZU7ktE23UIocd4PJG+7f7+7a++vc90wC996ZHL1pb3fufa7t1ft709+3oVuco3nqzaiiDac/b8+TMfbdv2A0T0sxc7yH7fT8y8KJ977tnX717f97+OJ5O3AEDft9jemiak0S7i2tquhHAKptPpUQn6i+fPnfmxn/yZn/zEtddeccN11978qQP7D67FKKoKEuXq5wyEdqKMkgqg3vorRPTao4sMojWcPS94+NHn0XYOgmX0UATpU39kCo0QtQAhWoCSCgTRXEIvXhoRTURuMbI6FrGTYRarZSHaDRoYPWUUQbW6BAulaMXVr7ixeTY4XJeMnJaSVUxbqDwAT3VvCvjhZ9vWlxYlABYoB2jMKhMr7UQGBk8hJMBOdVrcqxY+t53oAxDEuSwucjQjHzjKnGB7HccJgXVIpyah8UnhQgzvvJHfmUsp7slb5ZE3RQi03QbFDVx5xT7s2dPAUYfVkYO5tNj3ek7bBBGcc1ANSQZnJ/m8bTGdTuPBS/a5EOVjb3rzG74BAD7zmc+87NKDB7/LNc33jEfN/r4POHfuHLa3txFjVOMSE0ajMe3Zs8c2D+b/cOzY83/9tttue+x3ujjpd1q+bmycet/y8voR58idPXNG2q6T0PcsSsTkB5ABkGT5xpOlJV5b2YUoASeee/43n3n22UcI9M2XX3HF6mg8TihZRl+HeVxM/qlRFYCzMicGCASdEgKtYWOL8fAXnsO0HaMXhiqjl4AoXTqNHEQYUYEYbaBOTIihYP9pseTRABUENJdzJGy2IFWJO9DY6rJXh/4wyYd0B4proFJFuEgTcCqLCYmfm1YZSxl8S8x0PC4lM9Sl95z4vVW5rGn+TwBi8hZidolfLHaC5dYBqEjs6R1LLF8zUPuikdVhbgmFNJ+nSZWkLaNlhaWkAmbAO2PWMA8LmBNNrmkao/FBTb3iHFwiyZvZWC6TXemrrf82ikBoNwDtcM1VE+zZ5TAigmvS6zgGaUwMIwz3j4zsEWPEbDqFb5zs3rPOzz/33I/u37f/A/svPfh9S5PmvcvLKzhz5gym02mMMaqqukKx0DzXVYUgKildeeWVDsDJ6cb2269/8Yt/63eyOOl3sihPnz72rr17L/nZ7el5bG1uSozqsj44xjS/SydPIQtY2aNEFBXKy8sr3LYtjj77DIgY+/YfQNN4EPky11RNpPEymCcoxoAGQCNCDFBewbRfxm9+7hg2t8mQ1zQLDBKs7BSG9kaEE9KEIEpZWHl8YEp8KsSBnafgQik6NJcVjzcM+kcanALyaxUeLbIbwTA7Q56rJdCJq9dQBYRCKkmlSL8yaZ3gYF2FLVqQGj8hEeqJbaZX6zytp0ybihJIXZn32WeTxBul4hsE1MCRnS7J9M9Obwx0WZc1pxVpmIrqJJf8mmaUSCOYZEKtic7HVnpbhZi8iTynhWz9p53QSZrGDkzeNhJS9GGGEZ3DVZftxsqSw6SxHtZ7huO80CVZpAwMqa6bQ1UxHo+wuXku7t27d3bFVVeuTsYTnDlzGn3fxyiSxMJpsKCEGPvEnkKxiGF2CH3XHzx4sFldW/+C882r9+/fv/Xbydh+Rz1mgn/1mWe+eOXK6u4PTGeb2Nra0hDFSahGaeoKh3NYkMmXxuoiDwDb2zMBgH37LuGz585ia3sLl11+Gfo2DpC8+nQi2GwLNJDIoYxIS+jjMh559Dmc3yIIjRC0R9RosL1ktDW7yhnFTvIcJg3QVYzds4BOZmsOph2zyjiAJtBBwAwts1TN/SsNzMOC+Gn55kHmJQbrkzNTZqgYqyn2SS1ig3ewLdwCcReen4BUKiZRLLpOK1sjJCk5mN0AOJEpQuzVOnMuYJfUNGn+hwEQKpYmEouSJGYAIJq+EmlEI5quqA51QqLhpqGnIb0hLThOmyM703dqiHDeQ0gQO4HLtih9ROMdiAXSRXjvE63O2gYh216VgGY0Rjef4Nmj53DNlfusNM7usohGM0zvQyRvGElkQILz5zawd98+t2//wdXNzU3d2NiQEIJTEWdTgJgqgZqkECHZQA6CaBtZc/z4sXDd0sqLo+i/IKLvzoYBv+cTM5+WZ86dPLxnff+dz594NsRevKjB0HagWR+XZ3YEBrs827MbyI6hJGkHr6wtPGHPnt2Ybs3RdaYOEHgQO4RoAI8qQOIM0BEPNGt45IvP45nnWiitIYhC0SZ+qyIKQ8TZIo7RHvjsAABKfWrNB9WBf5uI64NHjrF1sg0FyhyzGhmkMjeTg0QGUbeJdSW5D6BQ9GISOKskrabG0qMpBCQJcU3nuZSNI32fpnlc5MS1HTaVrFox7x0ZiNpqBAdiV2abNWdZ0pijPKgY3PWKDpSGLjP7BhGn95g21pFzycojScaIIWlxuySkVgysJ6Z00qqBQZyYROwI3jcJqUUpQYtihdl4tpz6VGrS/eoBZXSz81hfElxx2SrGI0HTeIwagmdNWlC32IaoYGl5jMZ7TCYThBhUk+g3z7Xr2ecwZckDuIGmWKR4ViLF62+4XteWVl6zumfPbx4+fJi/khOC/0oKfyKKzzzzzMt2rex638b5MxHKXiWdPuD08GG40Fl7KNUbV5TBLlfmxcyMUePR930ZYmsiGsQYykhCYgQ02ljCj/HE08/j2MlNgHchRocQ827FiCqI6aS0YXisdI+J05nACFJTiYDzDxpYNEgLJY3rFzY5TTIhUanGJlqqB42pnCP7WZlyF0J+nzbfy4eO9Yb2M0IIkNgjhg593wPaQ6SHFlF1tF2f0jSuAqKcy/0jEBMJwKoGTQvSbrdzPj3UE8A18M6b2oKSD05VzucF75wr9y077VHGAkIs/j9ZNqUL+54W6xSpJGuaHQM5+yBJYQdRogCGPiT/IOt5RRTOu9JXKgTEyQWTGeTyaGoMP17HxvZxjE8G7D+4AmZFD5OdOc8IwdwmsnTNeQ/nR2DPaNsWxObckv2crPXBghMCUU13jIU26p23toMI7WyK6XTbc8PfD+A7f8/jkjvvvBMA0Dj6TucbP5tvx5CEqJnvWuRatdSeCbGYD6cdHdbbqAyQPqDo2oi+a01trooIK6kkujSQMPocC0H9Mo6dnuPxZ7YR4m5IdIiYm/ZOXCqdCRo11frpJFcZGEQ6ADaSjI6J7XsGkzpJD4umxcqJGWQ3yHFSZsRoKhCxE9RKZpRyVUQRpUOHbcRAIHHGjgkCaETXd4jdHNq26PotQFuMOGI8JuyaNJisLWF1yWF1dRXLy0tYXZlgaanBZDzG0tIIo2aEcUPJzc6VMlvEBvEhtJh2wHzWYtp1mE5bbE97bG/3mE1bTKc9Nre30LUt2i4iRAfQCOTHcH7FelRvJXvfp4E/TEvplEF+YnNXVYACOC2KLnoADbwPhSUFQrFKCUkY7wilz7f2kZOSw/ScuWcFmfuCnYyABjU0mThxdYGGCYoARvoenkLFgd0BHD95BtT02LeHMGoUoiM0MAWPbyid+NZrh24OqaqQQuQQBbMu2MZkZ+woscxsi3g/4wwmg+MTJ07o6tra25944olrrr/++qe+UqDRVzXH9KPmDYKgmqhh5mbHA6GcUYjPUSq0L/cVaYKVEUQtc0o7+pUllXNGt9NcVSYOqYGyS9icBjz6+HEEWTX0NQZEaUuZJmK1faZ+ZjbLDo58KTkL7S2m0Unx40GxBcnzi6HHS34/4ku1YJhVRAgdAuxh7LsOJOZ6YKyjHogt2m4L3fQ8IHP4RrG2Srjk8nVcetmVuOzSdRw8uI6966tYX1vF0tIEoxFjPPLwzGAWU9tXVYDpMF3h2tpEU4sMjKCA2ByxTxrYLjJCJ5jOWmxOBVtbmzhzfoqTp7Zw6vQWTpw4jzOnzmJjOsV8qlBZAvMK/GgC9Q4tovnI6lkoCJ5XDEIIwdzaSQBtEULy/knwsP29leFQQJyVqcXrqHCQbINzqSTv+x7e2cgLIDi13lyY0ZBDjABrhFO2KiGBSaoKbsZgWcJzz59G41ewa9WDpLP31MDaIGI0xInxk7SvjodDh2gBzCtjrAwMDoFrBeqVqmRgZtra3Ize+X0HD+69GcBTpTH9XS5MBQDvG45dIDswuOI/88J8rXiSZpi80hgNlpSamm5GtmY0TikjyrBLqRrSaRMqhy6O8OgTx9B2E8TIiDJPo5l0EkZF0Kz2oMJ3BFKp8uWb6IGKlSFmHvpDFOqaFOWFqG0ARCYV66QHYkAf5oga4QyhwXzeoZ+3wGwDoi1WV4DL909w1ZWX4aor9uGqKw/iwMFd2Lt3F5aWXaLACRghDcRDAipa89ZRLX1YlsxZZcUJBBoaH/NECnCJtcSqGKfRRsMMHQMrY8HBfR6q64jYDRGHPnpsbbXYODvFqbNbePrYaRx96jSOP7eNs5unsbkRQH4JcbwK30QQOXSxBagHMcHnE0uMi0sQO9mg4JjwByRwT6yT0OR8YEAOl4FyVIIkMwtJBP8QBZp6SlVBCPbzQh475b452s8WatFMRphtjvD8iW14rMKtRvjEqOLUjtnhMIyKjEaoSasr6aTEgqdvXiJmV6KpvSljiWpfN5XK1uamBl1+M4CP/K5L2XTUyvvf//6m7/vdfeNNRF/lidS2H9l8ymh0WYbkyofJtg15kUoCW/JAXmLugTgJa+1UCNqAeAlfOraB5093ULfXIutkbmUSHEKvJtPJbgOUlfe2cHLDnqH+LJq1FmJQ7deEA62sQggOyoOMSxFNpRKBEALaODeydCRI22J7dg5hvoHJEuHqS9bxomv249rrLsfVVx3AZZftwa6VEcaMxCWNNuSWHtAACsnlHCZYZvFQ74Gi/YyD1hNDf0MVp5WSuwBcAxUHkBhSSgBFLQvcQxFiD6CHU4KihYdgsko4sMq4+oq9ePltV6CdtTi3McPxE2fxpafP4AuPn8DTR5/H9pkI0ATN0hrceIIIRVSCC5TYNL31cGIPulMHVgbT2LSOOisGXllT6lgLIYHEnN1NOmZuCN452xRVIAFgjmlsBPSI8NmRQWyTg7dntFnai82zz+P8eI7JeALVDuNJA47JWaJxiDA+LSWhgzqX6HuywOkenmUslLk7VUfYYbI2b+c0Ho/f+PtCyXvVq14FjRJFktZdFhkvCxAvEwpRpSxIX80CBzvGqIY8As4MuaCmdCgEbCCKA3iCsxsBTx/bhPpdaHsu2kmRiKgOIG+q+op2JuniKRs/lirENF9gKRSy4cQf+JK2e9tDTohwxrmVpKYIEV3bQmOEIqCfbqPdOo8Rz3HdFbvw8pfdgttuuwrXXX0Z1neN4byCKEDCHCozK0LFGzrodOFqSnIGtyF+LKJlODUQleIwJyRAJSQSRvbczZbYBOEu7d4u67btNFPzZ3E8SgyfYJtVmh1GiXAcwdLBNRFLewMu37+Ol714PzbeeDOeP7WNJ544iUe/eBRPPnMe589vQdwYzWQCcQ6ggBgIrjHkk1UxYoZKQOOckSTSmANm2ptOyYp1pQpOp1U+jZQcNCqCGt1O1ZUNmRVQZoyYTexNNuIxNdIIfrIHz595HuMlwvrqBOys/+XJKKH3ZC4KjNIfCjMcXMWpHYgUxQ4m+UMVXmIOfaoKT4kCjYI+9Bu/p4WZ2fRE1H/Tu79xk7CcLGayRlKSDcbQjzE7FDMOdqW/y2E5RYJEeQigVS2eJUreHjIlRGrQ6xiPPXUUs97b6Zhga40EVQ8Fp1EDFeRPq//Ot3lo5HWxP8hoW+VaN7i/2/sLmuRHAYhdQGx7kHZADNjeOAMNz2PfvlW8/FXX4PavuxYvefFV2Lvu4RlJQtZD+wjnU14IOyiZAHywMUrc2Gi0uTQdhZJAEIfAoVRm51N9IdyEBvKDgSoBoA7F4FgZnMEsJgQNgE94Ohshg+GTQXKDxvUIoQe5Bk4SAUTn2LPM2H2Vx01X34C3vP5FePboeXz288fwyBeexdPHnscsjjEZ74JrxmUqFx3Qco+GgV4CiBQsTYoKTJ2mRmgcFDCalDiFVGVbIByzxU24TC+spVsRkbmgxZxmsiSAG03QdiM8d3qG0cjb3GVENktOjaJxew3htZNeoIlYQWRl6+AwiOEEpVjEBmUjTch4SF5RzWiEKPqLvx8nJgHAbD7/9K719TfVNLTs6UqUbiqMQleIAQTT8ai5eZvJEScoP1YLJlkrQqykIA9Sh14EcCM8e3QL5zYYhAZd7FJpSgASHJ2t7TU7G7gCzw9WJalhJy3+PbSDr1pT6gpljZP3T+wQ+oDQRmgI0DjF9tYJIGzhhmv2481veDVuf9VLcNkla2gcjCAgPUI0xM81KOgwc5PrHxt1kM1/rWXkpPQwwrdoht991ePEtP5SAlcUW3A7NiOrBLyR0ou5caL7IUAkMXiQrh9xuhdptsjGVTbqmwXnChNIAjzZCdH35zB2Hjde63HNVdfiza+/Al94/DR+/YGn8KUnTmOzZTSTFXi/BBGGOkLPBOYejhgKD00yMiRz6eE0SrmdakR6kKJxDjFEwJv5dEx858ZzqZZshhiRTajNRcEOM2GFH6/g3PY5rG1M4RsPLw5919s8NAUmxeRx5Nie3Zx1UkzFFpRHWmcFpBNgODElWmVFxCAmBfhBADhy5MjvaWEqAGxPN3/o3Lnxn2MGQhBVFVKkSW/eIdSEzVlPlFFbzbKthJJJqXNpoLZJQCrmrXdTBTuPzVnAM8fOINIaYgyIMdhMUT0ITdosqZT/mna8hYczMdW0IlovOnwNZbaJ+wezrL5vEbuAtptBug4iAVvnnkdDW7j15kvw1m94Hb7uZTfg4KqH9BGCDiyJHI4Ixx6iwRBJdgb5lVi8BKsnaZbCAK+MWkvaKJjs1KRkt0iwMU3JqSQq7naZ75qpfgRAqUnX30GR5rowPx3DSZoF0ba5w2mKE4BR3bhHpAAi48RKAJgajMbGSWa1scX+XR67X3Epbrn5Mjz1pZP4L795HI98/mmc3zyDyfIBgJaMc88+8W8j1Fmnr87BkYOjgeKnZaOgojUt/kdsQE8EQImIQWQkeGtDBOxc2agjOohGOD+BumWcOXMau1aXjLygBIeEMjEqpwUayPb1FGGBJ503xDSnrxhjMUaEEND3Xbzkkkt4Op3+0iOf+81fS5Xo755gkJ0HiOjBhz772Q9efvlld505c6Ynck0mJMfEjjFlQtbapWIsSYKUtMw0KfELFSjkdFGzcrQSIFjPybvw1PFTmLWmcgzam71wBEJUe+DT/p/JDFoczTQZMCXdY9obeCAaV5p/rpzefOlfu65FN52Cg0AjYbp1EtqfwNfdfDne8Q1vxu2vuh5LK0CI24ixNc0fDY4MKrAySnLiT/YQqrSZWZpVScEGt5CkQyddpLcRkI7aVA1k608pr6vK5lBQuQxKDMWqUhJaavGG1k8yDewge02XIhHs4jpzfIWonfSmZnFwbBQ19gb0uTDFrkbx0puWcdOVL8bR11yDTz7wJB585Ci2tjaxtLIXEhsoXNJytiBvulrIGCBvuklCKuGHSUDIo7jUTonYQlQxRN57HsgtnAy6SVN1lIm7jKZZweZmjzNnZ7hkLyPQMuaO4VzARBlNHBlpQQFJoBorJ7O3gaRPlMgNMP4vKOl9Re26xoD5bKZErMsrKyS9/MBdd90VDx8+/BWNvb4aSh4BwIOf+MSlqwcPfnxlZfVFW1vbkck5x02yzE87ct5hKDX2EcN/i8K50WD3KMngGC7ZfQwcT8EYp7cYn3n4GGZhFV0kiPQIvc06QwRCAmeyQx5oiAPIJ2Bt/V84sIneZX1UQmLFXl/Qo5OI2axFP28xIsJ88xzajWO4+trd+KZ3vxJveP1N2LUMxE7B6cYwxUUtpugC62V4H3TRQKHs38rJ2aA+8S9w5tXhNbPNh/nr6gIDs9hbVuU6FzsJKY5xWqV/hbSpUQl3QpXZouVUhlRyNuLk7G4oeObjdl1IErsxgq7jiafP4f5f+gwe/sJzENqNZrIO9Ykvq7DTktncEX1vBZQ4I7hneI4Sh1nt3uekMs/ZVc+kV977FKzLaBoLD+KsuQQhREW3dR5OTuOGa3dhecmhGU/QTBqMPWPkncnD2FoLSiMRzq6BBZXNAU/DwpRoVMQuBIR2DtUYrr/her+9vXXva1//xnu+2mCir1ZdQkSkn/rUp25cX1v/ydF46bb5tBXfNMzsFox0OWcOZkcypcLDBKigWZZDWD9IVkb0kSC0C5995AROnhW0NMI8ebmE5PkiMatZaEFOlRcElVKkCpBRWQCzjSeaHkAhxNiiC5vouoB5K+AYsHXuKNaXe3zj216Md7zjdhzYNwFCC9UenkdFzgSS4lm0k462c4FJFfhTl9G1lKz+ngUndaos/CvCRAausq6ySKhFijxMdOBIaqIZDq83jIZAVNwHIYvXN1up5HmppqiIenST70GMgh6dMap6AukY07bBZz5/Evf98iN45sQMtLQXDS8ZnY8I5ATwAnIEpwRPbnBXSJzaXM5n6RcSjc8x4FnhvHFoiQgj7+E4A255o060zfkc881TuOQAcMmBESZLI0yaFYzHHr5JYb2ULVJspsk0yMUWKXkysMtE0YUWXd+CmfTggf0kqn/vDW9849+6++67+d5779XfFxL7TpH0L/zCfTfv2bX2C00zvpqI1PuGm9E4UZJM78fOTK5y7gbBQVI2R0H5yZWyIH+gqBHkd+H4acFDj5xAL6uYa0QXWogwQkisI2J7CNMuHkUHFUQaFLBoEXTY8F0KQJAV+QBSD9AjdC3mszkQBaHdxmzzGbz6lZfj2+98M15y415ALPiUkw8PEopIlF3irQ8y0+WFdmBh0S3qFYdTsE43HhYCVa8hC3PjnNmCyo/HhNPJckRicYPI8X15NCSpj0QiTMSK1VRiHqqR2EDKHyw3NfGEUS3yGFE5yNvppDGCY4+2byFw6LGCU+eBT3zqIfzap89A4gR+ssscKtiYQ06XUux8kuSRwhcbEK0WZoqc986qFyi847SYbCY5buzUVQmF46vKCLFDu7kJjw1cc80Ea0sek2YFzbjBeGyL3jlzPDANaLI8Sf+d74WBZJJCogRd20I0YLw8kT2792A2n/2jO+54y19PLeFXtSi/qjmmDty7vDg//7GP3PdDa7voB2KE+kYRUk/nvGn9WV2x88/NcZYQSa1rBFVhoWacHAPj+HOnEeHRi/VGdkpysXMsjnKqiFS0xoicRQIGcVMyqaLEGpGklpBSTgf0XYdZ36GbtmhEsHn2OJbGG/ie734T3vOOl2J1AvRhBs+NgRa1GwG5xZMNA4lhMGHWHacf7ShxKz/dClms07rqfZQSqEBMlXctFkYmpJU7Aoa8l0wyt5FAYtdk971s0iXJGR6ceMrxou99eF8pU1LzicqF/M7R8C4hD54YEk3dFPvWPL7pG16CG6+Z4Rc/8Vt45vkT4KW9pipSgEIPdozAZlBKXHvaplFcbo94MCtjskiKnNUZRcwiMwGLw0YHOPLwoxV0sxnOb3YYNwzPES45KrqEaisNaH6JpMBAODBhgqLt5oACo1GD0dKyjicj3t7aPCpn5X9VVXrwwQedqsqRI0dw5513fsXkbP8Vesud6BH94A/+4K5I8ezGxoY6P2buA7z3GE8m8OJSZHjKQHQ+1eM09CcFsrFGmdM8z8YTKzh1TnDq7BwBSxDt7TQN5Ry03Uoq8XL2Rh28OCoO4xByW7ueG10vGHm7naLvemg7x9mzT+JF163he//0t+GlNx8EQoQGwPNSMeECRwAhEeRHZn/C7QV2JEQXgL8Lp2hGs+sF/Nt/rZbX1trjc0HIbURuA254QaBNyQRLyyYyzJ/zvTCSpSuLWGq7FJjWlcktSJ5yUpvNp5MhWUltCynp1kPVNJZNY4wdinPcdvMYBy95LX7xE4/hwYeeA/tdgB+lp4MQonGnHYCYTivJhIFMlVNOpAsz3UI2r079YOhj6Q219IYxCa4bwC1ha2sbe1YJgcz7ltwY3FhLFlQxqrx+Q24NQkyjNHut0WiM8bhJwnExVQzTiuzBm77vX33fR//V9/2r/rcztPuqStma+f6lL33+uoMHr3h1206/DeArurY/MJv3V4YOS13f0XR7jrbt0XU9VAmTpQkmkzEmk6VSn+fnKOdNZuuMIAImb7NN6aG8Bw89chbPnpqjB6MLPTQ6SPToU9ahQhEjFQAx6jAqqFcCFeq85sllivwzF7Sum6GdbaPrZojzKbbOfAmH3nAj/sz3vhMH9o7Q950ZNyHvtumma2+8UMAc+4QB7gdLkigLJ+bORVeDQbVK4eI95oWnblHyVL1lbWkygE+p5406sFHSQ2QTrLigDtopFqeULyM5CCknl0Wg8mEZNKskVSaoS5EJffrBLgFO5q8To0PoIoJMEWSMVlfxyV97Gh//1BfQxTW40bKNiBzgycGDktOdqxLKJBHmCY4A1ziQmAKFnUNShqFpGow8p1xOLvpShkcXOvTtHHG+gSsPEPbtJfhmhNF4DeORwDmPpnFJQKBFQRJDxHw+h2ii8BGSNadgPBlhMh5hPBljbXUZjrmdLE8ehsqx0bj5z865T37sYz/8me/5nnvnv11ymL/YorznnnsIgG5vn/27TTP5800zWV9aWkIIHbqRYDwJFuIazUKw6wPmsxYb57dx+vQpHD/2LNZWd+Ga667FeDxC13VlzcTsHqcmVSp5ITzGxmaPU2fnAEboY5sOQDbtokopzUDV64CqWLoFTGQYP0jezQUhBMzbGbp2C2G+jbadod94Bne+77X47j/2Riw7U9E3PhEBKIDQp0vlweTTgCOarQfnGeTFEdSdi9NOSVTAFF0UhR28ezB4EhU39yq6T6p4eBkEzDGxWaRayAu+Qwu95CJCDFTzZhghhGqRdFbzxAFcyglmxf9WBEoNSGxsRqyJLyYgimDPGGEF6FuonMHXv/5K7N69hI9+7GGcmTGa8Qo0dojOHNQpJPDKGZJfYvWysiZEk4TpAF5ZpIRAOVmb6E6UXOGbBmE+xva0xa51gnAPFwNiMNUOJPGOK8Q/xIg+RJw/dw7tfIbJZIK9+3dj//59WFtbwWg0AjFs44COmeiVvhm/0jn3HojiHW//0w8/88yf/vNEdP+XW5z+YqORW2+9ldp26z+MRivfuj09h3Pnz8QYkhN20kfZnzbAZQaWV0ZYXhnjwME9OHPmDLq2w9quFTA5dJ2dMEKAOoYIJzh8oGOrG+H4yU1Me0Ug8/ZRMR5koB4xJtNgjYOJVVa0yOKipHpEkPtAiYjo0fZzTGdTxPk2tDuLbnYG3/fdd+Bb3/cKQ31pDqKmUuozgFFRxg9i4AQkFPvoihcpWBAZ1wsux4sXI2UZRhGDhYdU9UymeHFldxkrE33O7eKCsl5L9gthCFcZvISoip9f9NymYsWp0MqCMw/chwVb+luqWDAVMksSExswETiUy/dbfonCOTNz7roNvOymVexefRV+9hc+i+dOb2C8vAszmUOIseQnUDF0nn0D0WDWKdkCJXOkIWA4QFxBzUMQeJfCjODNXQOAcwpHDnG8hvNdwGqr2EUC5RlAEwsFpgB4u4aUiCHemwtkDAEHDuzF5ZdfiqWliY16JCCGrtxX0agiokSqOUp0fffuW3fv2fORY8ee+V4i+uGLLU7aibzec889+te+/y/96Mry7u84f/5EN5u3jYqSxCEIJ/uyUuoGJBlIMVucmXcNfOMBAtp5j+l0aho7MisOiRnON9KyEmEaxviN3zqO81sjdEIIMkeMDjGymWsl6F6IIGEgfQ86vsrufUe1TirQ2GHWdZjNZ+i2Z4izs5D5U/ie978H733HLYi9wrsIoAdzk7yAZPD6KS6uNbqqC091nbp1YSUixf0vM3V2AkQL4xAd4g5QMaY0xSPkh07i8DYy2YOSbehgPIRk0TIwn2oJ0/D+dpzcBURM8jpZNCbLM1frWWMqgV1xaFisGGSBE62SEWIUYXcXInrdg+OnAj70sw/i2AkAEw91Znzt4giOHLjpwCxw3CSJGcwwulhkOjTOiArOO3gieG99pmdDaYk8FB0kKGJkdNMT2Lu7x749Y0ycx9KkwWjUwHuG91xmqD4ZUzfNGCurq2i8gyRxAyXxQN2G2N9p6sPLJhzH4zFfdfU1HTF9+4EDl/70zsVZTsz77rvPE1E4ffr4XSvLu7/j/MaJ0PXdyDI+FCLmOF522WwXUYqYrNoWdG2fGCtUwAqp4sgtkzJN04TBTYPTZ+fY3OwhvJQG1gyoKzt1duJDZvRkV/RKq0cVEsnVQ04q6PsO89kUoZsjtmch8+P4n97/zfjGd7wYEiLM/iWU1xmSHeJg2IWsxqeLlKgVj/jLzjG1DPaHHjSbINPC4sgpX9njlcnyRHLPpiXjJEU16JA8be85lcFx0AXmpOTFcYwuSPMKg0iym56UXrQuvXVHb1pwNxquv4IWRApF4V8sqrloNh0JxhwQ+1O4dN8Svvk9L8XPfvhzOH6yQ8SyxSWyxVX49AwyhhRyDmZvkK+Jy2lfUeFdAxGBb7iQL5hiJigncoDH1tYMu5YbuLGC+wghxQgeqg6+yU4YRqQJocP29ob5BlXeu8w8mFqnE5IcBr+lND/c3NySY8eOji+59NJ/efTzn/8kgNM1tsO5hD106JDcd999k9Fo9Df6vpW+D5QDX2I006gY7E8jZGeWyjAqiHkRq5TwGMl7hVrYi+RFpn0alBOieDx/agtRRwjBAJ0Ykw9skKrHMtAox63qjpxJSSOMWIFCFsvXYTZv0c3nCPMN9O1R/On3vx3f+I4XQ7s5PEcwh2SFyIu+qCkBOv/OFz4vghI5V5+rRBe47u0sUIaFrEVHOajhtfrMOUuksnEhK6WhriSFZXAKlSmWAT86iH+5jpyjHRF/tKC2AXZadNICMiyVrKketttGLkVIkE/Vhc+UD3KCFaOOwexByhh7RaMz7Nvd4l3vehEu3+9A8wgnS4ihh1CLriPE3tK3Y36GksFZDfAQjB0VsxVolKHiyck3iRvrmgZtq5h2hC5G9F2H2AtCFIQcQpUjAlUQ1bjbMcSS6p3n0bldsNDfHHcxxCZKVDRNw6dPnwkQvcTvWf8LaUG6YW5RcBKSF73o2luWliav2N4+xzFEF/owUN4w7OgqA3CQeaESsx2/LiyYqFTodvkUzYssxAiwx9Z2xLnzLRRNsanMiVzZuNi4CUnAjAHsKUZPxckuPSQAVK3en822Me9mgMwx33oWf+JPvA3vesdLEPoOzo0TrTA7MlSC7jKCGKhrsqOUq9HXelHUJW1xzlvoNXcG2i7OfMsNyiMRoQX7S1qQs3EpreuFBroQ0S19btQF+5RcWtvDJ0Opm2LQsyHZIoFby89VmMAgTyQG9/y4kPWZTdegXKw+k3YDcBN4nhgaSh32757j7W+7Hvt3tZCuh6cJYh/Khh5iKrFzpVFyPG1cUQy9VUpFJ4lu5hwXNhCzwvsR4JYxnQaEICkZLPknRfOjypmu5vCf5qRpZKLVPRcZaKe1nU0+QYhdEgiAn3/+eQ19/8ePHz++YvRxJSwiCEAz9u9zbqQxxiiVMxhShBlR3WdRCSQ2f1auKFm5jOEh5HVhZ897FkNpjLPnZ5jNBGBnp6VGS8QCIxKZHZcu7tJl8dWlYnozlJgsMfbo2xbtbAp0W9g49Si+7Vtejfe962WQvk1yodq9gC6KrNao5uJpciEvdvH0lAVgqEQmyEUsECvWTbHarP68GJBkahEd+raFpm54GmxUIdVCSiZnGhcWl53eyfCZtQBRQ75n7QaR3RzstaTwZ2M6jTLbahEckyQxG4zak9sgEm9ajeI5bkYYA7j8gOBtd1yF9eUtaD8DUwMmi+UoyW2aS38UxDv73C4oUoZ4bgPQ8mphgLyD5wm6uSQLVDFH/5BiB6vNKlkAJ+vRgcRhjKe4wxB8cDwY7r8kfrLnc+fPETNfu7bmXkxUmAy2IB988EECgHEzugQAhRh0cCxPWtQ4uHQbOVkq8kCOFE9iXhjAk+lcUg2yNfmlikQLnFWH06c3IVERekmDCCs/BAb7Sy480kNri1eG9Kx0grKYHYVZRZrId95tQyXg/KmjeNMbX4TvvOsN8EExQmNUIRYIQqEP2mPcQdEm06i6kccOttKFlLu6zFWt+7fhey8sb3csyvqBKvS7WHi4khdATtEWuXDcknmySDYZGszXl2yeSClKHQmwEEQIIsDJ8JmkgFS5PBJEKMWyaDPbJ/dU5TOn50TrjUkzOSK7WBA4ElgCGAGqPUAR7ASOzaLTk4cXxfVXLeMNb7gU7M4ZsBWszQlJVpXNvINY7qaRY6l429opHYcKINmjmv8UUk8OkJtYNmffQaIWn2Jr3wAJOYmcSsVoZmxDJVmiHvOmGGOyb6nolik4CmbtElVVtzf7b60PSU72IXb/idQirlNNLjmmbnioSh5jNinWmv6XeYRULZra5ZrRa58YGB4MwnwecH4bADcI2qf4dSo7n0gECYoFIpOp0c27JhlLEhAplohmRUDft5hPW8Q2YuvMs7j5+t34vu/5Riz5aMNmTk05QrKfyA/ogJ7lIJwy28vet/mmCBZ6qGHcMAA3Q++hi+AOqJprZgf6ReK9pgog58FQksAWqtwOj94F4sICKGPk7QwkL4YWDcCdVp9FYkLeiYsaR2I2rJLEjx08VgsLJpHfS4ujVThvAtS0UqcYWV5BGgHtEcWwBwsWGsO7ESAz3PKidbz6ZfvRT48nAsOonGxFZmcmlDZjz/xowEYrVesgGo3vXGWBihJcY0L+trOFT6V0tQUvCMXSNMYURpyvTQXG1aZo2UI1g6Ba5H7I0QwqEgnM++pDcsFVKPZxKM20SnpSQ7vMthFJQsPVyACLizOpTAZrD6NOQSmJiB1EHAgeG5tTbM89hBvbtSUYzUp9Yp2Y/Idy+I8oOC1IR2TCZNVkR2IzPQk95m2L0AWE6TbWR3P8mT/1Nhzc7UFBwD5CXOqJUtqUdTrBfGM0eeQk8axWXNaht9KFEJ7ipFe5p1EVxnMhqyeVlyoLQM+CxKoqI00vqXa6Vy55RVGfd+l0jfJ4ReJgK6LRFlz9nqz0TO81qXLyolRNcQgJwKRkzBxLSK2WU7zah23Diil+QngBmUfaBEHmgFfKQqWBR60uAYwR5AWTSYMxWrzmZZfjlhvXELqNNCZJljWqhldEQY7D06LyoYqbncy2k9DAFqzxZtk5gHvAe3RtY21UDJCQ+8mAmEZCMUaIhiFCMWe/lLI6/bfUI6TKyqbaNKGcNryw8AQslLJ97FUkqpaIukx61pQzMYAKO8cBWu2MsqPXkeJgk0yPJaazyWNze2ZHfWL5qFBiWwzOdrFq7gvalwjFUZMwOtG+ggTz5ukjNGxhPn0Gd337W3HrSy6xndjFKv90AKYy+iilX1sMAqq9leoZoOrOBSiD3vSCnnOH4kQGhf5OAKmMTFTK7LigfReh6ZWfR4v8WnMpt9JQKbsT7IiGj1rt8lSyPTLIYiwfggoP1MRQVwLDa0Ux0ylJzuoGHKG0QSlyNpl/LZIVBj51cnXgWXJiaNA0DqNxi9e99sW4dJ8i9BsAMbpe0YeAqPOU8gZjFvHwPEalqs+2NGmLuqcitrA8lwZMDUIw1/yYHPJDCJBg18CuS0qdjrFEXUgcZHWlAhJdkOzRguRwgeesGmN3wcLc3NxUAJhuTR/qukAWmkQVhJ6pXgPcrsWEiHbkP9SueZw9Igr/knKsAhz6yDi32YKcM/vHzO+UAVSqT4G8KchC/kKqWMQUKiFGTOctqA+YnT+KN9x+Fd75jlsR+haOu8HrVrMwe9HU19gdVJWkWomGtVABdy6MevCe7SUu/Bot4Tw7iQiqw4ZAxcB6cPAr7051oVIZEsqQZF6ZaJBPiYwLxMohvkYTK3J8In8U75xMhYwo1YoMVrsDw0pqUEMLY6k8nNKbMVgSFEuwUyv3ZmVx10bbNChXKCV/jVyPPSsdXv/KyzB2563NwQhBCV1sbfSiDhpjeUahw4jEiAx26Ei6riFtPnnk4UfWZ/Yhl/2SkthQXBOSbXAZiagsbprlpKSKxqg7xl+FAA8XYySJ8p9TWznkwR06dCgCwGx2/j+cPnXmvPcjiqmmLbs76gE2Lc7liIayjrDjYU26PLI5U1ptIDBmLbC53RaU1wTLlTVjdo6jxbDWBWQ0MV1IFX3oEJP5crt9GgfXgf/hO96G5SaCs6WJ5tIu9Uo0aEJtRrXoQkAXIRPsPNnyTDdvKhcboeSyM5eCOYszJqCqVstoNSfM11F3DHHyLl1HTsT8QMoAQMQ0V8zfK/lB1cFylCgHQmFhw3AeBTQaJFNZ+lSPZiqZWoWUG8JbndJqljA5kJZK8OwwihqQU7bUNwoABxCAsZ9gySuuv3qMW2/Zh9hupdg/JH9hQtvV5uIp5rAAkEahjBpTOpsk6/UUuAsG2IOoSfP0lKGTZ5ghJXfLMKsdQC1NCzgu3P8CDGGoJrN0r+s6HY8nCCFskB9/qoLywZVVpbvtttc+N591P768vEQh9LHMYihD6VggMxtQM8QwZ+dyGgScibo3aDONRWMUq81pj77nBJNrMsOiAqMjp2Rh2OWHuR8NacwqKXi0Q9vNoP0MYXoc73nX63HtVbugoQejAbhJCpd8zMZ0mgz7TAZ1dnrv5FKXKlOonaOTxZmgXIR4MHj7SA79qSqRmvheP+gDZU4WTpk8K8wxEop6NlmXzpXWUxeZSDYgl5Ihkql4OTOmdifQKsWMsdhH1aOsWgdaZGo7dbh5YUtVeotUrQBA6hPQ1BvlEyOMG4dJ0+O2Fx/EpXsdpNuEA0GDR4xmRWkxjjQsnvRzMzYCEDTE5BZPIDGBNTtvSWPcoA+m5ZQQCrEgBEsVz6FaMUoZyQzz2SFaMMY48Mgkx2vEcg9jjPHAgQMkqv/2iiuuOJVoeboA/txzzz2qqvT8yZN///nnT5wcj8deREMpR9JuG6WykpChJ6ACjlw4C8y+oZqDZVQh7DCbhRLgUgMmNXEgp3VlLi7nHVBlKMPUTp3YB0josXnmGF720stx6I5boXGeqmktND5N4wBO88vBcR0XnADmlK4X9enZeZLKBSAOyk6a5W6yY6ENqG/N8tEvq8/EDg38oiv4RVR8mvNVtNitDOgrqllkJpprIXKUk1ZjSavWrBypera8mPK10opDC6HifbvA0pL6uuAC8MvIKKmySPeI2cjvzhHWVxQvv20/GpwFa4SiSWO03hhnpeQcZIGDQN4Wh4GUmkZ/mU7I6TRtkhdUUscIDWOXBUxhJzUTxWKnWKOK2vVL45S+7zFv27i2tuZD6M+ePbfxjzULW3cwf3DvvfcKAHrzm9/89Mbmxve2bdc3vvGqGkVE69KusFvq/jIbJCdPmwJo5L+HJhBnsJHc2p4bJ7aALcbMWHj4k01jTMTumnlTP459mKPtp2inmxg3Ed/yTW/BrtUIUAR5Mvc9ioguzesKUEVf1uth52BfJA7sJ803OF60j8QAhw+u3unBlSFpexHAicN10MWlvXAK10bWWOhd5YJBtiTEM4Zc4vEFKUul5M0jkzyxpzSIRy3EtrsZc6w86CKmY6gQ5QErsGswlBgXeA4tyAUiFPO02SU3BZ7DuQjfLKNxEVdf7nDt1bsRujnAjKg9QpyZVUwcGFBRYsqzGU54OxkJKn2SYmhJFydq0PVGxSsgT5AU8SiIoS/Cck0bEgr3Owmo073IAJGdsAFt32I+n8dR07hdu3aFvot/9nWve92zR44c4drVgHfaVR4+fNi9+tWv++nTJ09/8/Z0+njTNE5ipL5rJWbVdoipT1KLCJCYOK05lkyqhjcr7huQMkTnEFX0ncfWtAfIpTePgVe746ExArCDcCJWU44Hth2+kx4h9tCOMDt/Cq977TW47bYDkB4AmoGdJApOrCBJ9pmU4hOkcliouaAXO5EyDW6YU+484eqFNNhaSFVh1IseFRk7c4/LqVooijpYdFbicDul0ul1EQqeJtJADqjN9LRCHskAW25XEMvX2DySE9UykRA0DL7A6ednh78M8uVFmqsrTeg3kuxLF1wbhtDeTNW0hxhQeGOUCdL4yifBgmJpPMbySHDzjetYaVpwb2OJqBF97CFBhyRyFZtXJ+cCs5eJ6Z67hFMkA24onPM2ggkMIYZQQK9zQ68jDLENIZ2CAciElyhlTBPSGpEo6LseXdtiNmu1m7e6urLi1tbWTs2n829/1Wte8+OqekGQ7QX+lkeOHFFV5SuvvvrRt7/97T/snV+F6s3s/KTvgsYYqJQ0cRiTaEp34mRpz8nOMhRz6pRhgh5KDbbnIzxz7Dy6wNZQ55taiMfmwlY8V51PTJxsGcIFAetDi77r0M9aLPnz+K7vPoTLL1mBT9aalJUMNWRdla2Vxuoith47xxwXAkE7/XnqHpRqsr1WJ15eZflBvcAmRBce8pwSfQEIpTs2sIukUSl0gQhSj2OGn50WZwUzxQGGSEbblWWL0iI9T6kIFAZEeegzd6ZfDeBITLLBIQR2+J2Spcu1GbyJjZ8d4RrG5obg9JkWfryUdJqWaGbPnSYnDbUAo9SmOK78j0jB7Asf3JwfWninGPkk7E79qQNS8K0r5a/zXM2xXbFuiTEi9D1i7BFiADPRrl27yDfNf277/tu+/tChX059pXxVnj+V0fM5AH/hU/d/6l+Rn/+fxP4N7LyaSJ1S3+eAlMrLCOnvfAXhJ1RWss6QwOwxb+cIfQDzCBpDIh3kAFgqQt2shocGu0maMybyKSJlh53OjuLrX3MVXnzDASD0NhR3w4ODnRECFzG/yrO74d8uJAd8ucW5QBKv5pQDiEKLFpDVokVJI+OFxbPQc+tF0qRw8c3EynQpUeyLWS5U2YBUxEBJs+Tsy5sR4YxcQ1EnZxsZYfAQgi4S442DLEM7ILpQDWSUt4ir6UJP4MXPOYxgmAnsFeMm4rob9uCJo19ClHHxOooSK6LIAOBJIaYrvEujlRSsXKAOEMAeIVh1J1EAtj8lRUdIHEzOY5DBvkZ4YEYlWrBzhGY01vF41BHTPV9/6NA/AIbE9t9pqJAcPnzYveIVr/A33XTTZ++//5f/hkj4vwl0Iwja+BEROTAFODdKnigMB2/8yTJioR031cjt0+nclCcF7YvVjHSIKWA2aRVisq1ggsaqHEqlQt+2mDQzvPnNN2PS9PAxpFNahj5NMrfzQpDqy0uzcsiuLOoJLyrrQgmSKabmOxUfVYhRyYOsHtQFcy6tkeK4433vOFFrVBUVdVLVSrBq86gRWnKUQJ5UcsacYZqc6LTbkVy1M1GZLhBc5+sY67ms7PQyGtwbwJnTi5LkXPOR84B+YVxGhFHjMG+n2Ld3BZceHOGZ41PwZBUSe/QiGEcyZVxZXCaShqRoCu/LRkpspbdm9ByMPmgKYg4I5ODZIRLDJQmjc1aL9WqUQiIGuwAmyzkZjRv4kQcTxHvHIYQPvO3tb/8H9913nweAO+64I/yOXPJU1Rl1NlFGABw69KZf+shHPvavGPS3I7A8m84o9sJIJ+R4PMLy8gp27dqVQkWpuA7Uiu6Y+ojZvIco0KtkimtxcLMTRZITWqajFSp5RQYOCKEFR8F8uoHbbrwEt918BTj2w1ijCszNDznRxaRXtVC4Do/ZUYJWpPO8IGI0kyl2vOCnk08SZi6gg6ounLoDJ1YXgnEWxsTVos8zyGGjWPyei4FjWhs9y/DftR5TdfEEzosqe2Fahgcj06PrSqPwYHWH8kguRsYYfCgzM4iKWDwpNlJ629B7ayWZyhEJDo0fYzKaY0UDrr5yHc8ePQ7SdRCAEOZoXQC5Bk1jVzGEAIYHJaf2enOW5MxPieet1CAm145Eqh7ANAHgzK/K2vME2MWAZtRgbWUZzdjZ2ElSZx5DRyJfrBdktoZNpax+Rc+ffLx++tOfvuLgwYNvadv+NkBfLUGvbWfduIuRo0Tq5j2m0xn6PmJzcwOTpQn27T+A+bzFdDqr+gRUMDugYExnXQkchcakq0Np7hmcgm2GGaIik+bT3DMGkAhCaKH9Bl776tdgdUJAECBLuupm8oIYhcqpPbEjhsV6oQXlTt4rJSfy2nJkAe/UgUtZn1L5IVhAcmU4jbGDEbSg0dSd4ma9cBHqxctsXTD30sI/rp0XhrlpBHZYn2qF8haGi1h4jwnkY2pd6jHTIo9aq7K5mKVBqkgHGjaRnKRFSPGE1eJkAQIwdktoaY7LDixj9xrj7HQG8BKYGH3oMRp5601ZS79MRLYAo1QsLes3NdmkwI0gwYzFqRlcCTOSLxLBKeNz3IwhEnB++xyiRozHDs5P4EcezjHYMTtmco7+2q9+8pMvX11f/0UR+TgRPfHl7Cz9xf7h1Knnv3XUjP4MiF6+srx8sA/GVmnbHvPpzDIulBBE7AMm1G48XkqnRlz0Gk9EbMcesY/og6DtAsAjSG+lK7NDCFLKvJJVqFJIDVHNKoMKh9Sg6H6+jQN7CC+77TpwmVlZX8CJPG8PtxS6WI24DsZbiwP+C0+FRcT0Agpd3OGmvlN1Ilqqgt/O2lJqpk912kGxw51dF07IC/u4IY6wfI9oyuMYStjSE+efm3s9rbNC05iszHt5AJPiQM4ucjQoyNGiE0OZTadWR3iBRabJrHtgl6UGKCqoSnQzEpekdTaCpx67V4FLL1nGyS+cx2Rl2YKn4jCmiiAz4Ur2k5oyUSonl4QJ5MBjj6hIAmkBEyVDL7NdpShwLpXHzJhMVjAaNxiNPJrGwxEXwIgJxOyImPdPllb+WOPcH+tCOPv5hx/+FBH9mxe/5CU/lVvHjM76elE+8sgj+66//rp/Oh6PvyvEObY2N3H8+HlbfyKIfSQwsSgZJ5GQkLiUxhQ6zM/NE8m/sv4XRaUeQ9/36LpYDdvruV/S2OpA3Cam0mwRuzKoDcnaoZ1v4bWvuAKX7F9F6LfhG0ZkATiCtQFiOhlIdxho0QJlDsVMjnakT/NFua9FdymLrnE1aGFjBwzhuvXDrriAYlg4npWFJXENXshFs01qxHMnSiz51MbiBlNLsYaNpPYmomIyVduM1KiylpJVS3xffVBmd/qcCE0LrvWLkkEpIbS049+G/xyYYWbq3LgRRo2Hi3NcfvkefP6x85DYlevStj0aBxB5CFkitZDYaZfyV8ocOZWlICpuHCFGwKOaXQMxEho2MQaLou86iEQ0I06jwB6RBrabc2Tm56w6n82ESHU8Hu9ZXVt79/qu1Xc/99yzHz5/fvtvvvjFL/6tvBb93XffzQDw6Sef3H3dZft/ajyevOnkiedC27YUozIR+xJvLiYdssFsTOJAMqUAkAavQBQrRjWzfMQuYlAblfTK5rKN3mBydcWjFJQjb+xGOmcp1UECGnWglPAsmUkTWjDO4xUvfQ2WlmA+pXBwcEBMoUZJZTE8GHXvuHMUokXWVPeYC4LmYvylC8E+2GGimR9q8zAyfqZJzJwF4cZgKLXjSgqkKZB2cIyQvo5EkJLOJSqLyvxqwWWNZp55UlJYDJ99UJJECdWgX4o9KLOD99Y2hJDIFJJfNww+tpy1lbKINkvauKn4ayYXi8HX1fpe2uE3uCgKWCzZ0yYmNj4Lfg4VhSfg0r2E9bWIUxstmskIIgFRGKAKBGQPUGMnd1BgTKU682ReySQKh4gQl40riwioAwV7jjw3hTwSxYjwGiIUDKfONMKOLdKegBiSe59h0I4cMJ9Pte3mcvbMKb38isvftXv3+quPHTv2LiJ6QFWZ77nnHiIivXH/3n8zGa++6bnnn+m7tvWAOhGhGCWxQgqNfXEnrJQRcYe/68IogoaYva7ts8ddEctSClrNDU8eG9TgR5mZ5pFwiGjn29i/Zw03XH8lorTwjS+0v6IOgCSy9k5iAAqUv6CQ2CHnWnSspUEpsLMX3EF5ExV0XcBoNMba2jqgwObGFjbObwAErK2tYTweI8aAkAf1LgWkJtlSCqooZXEmf9cn5M7f+ZfxOvUCg68FaxCt/H3SpuR9g6WlZYTQ4+yZczh39hz6vsdkMsF4aYK+G8T0w7MgC+MXA/8qEn5FbMjIu+RApeqaDSMrrfjBcQHtrfNViBSc7CrHI8all+wGZF5QcdFop141LtHFIXZloGXViVKuGDhZ4kixas3tSCakqGiVHo2CgA+eP7RAXIkxXycmFTgR+Kefero/8dyJA8z6M88++8g+AOqJKJ44cfzO1dVd33r6zHNBRZqY5jxFDhOHsNmcBE3kki9srPoLLDTuVsbyYCIlZvjc9r0xhahOeqUd4AXKOERpcBvPZssWUNuj67Zx7YsP4tIDKyCZmpMQjdKFtwRlO0WocEMXlR8X9njDyRMXFm/us2iHqw/tVJ2kITwRYW1tDV/84hdx/33/GY889AjOnT6HEHosr67iJbfeird+w1tx080vxnw+s/I8JJvPKp+SLsKBrcGVCxLFcPG/X2Db7GAsZTnbZLKEx774GH7lk7+CRx/9PE6fPgmJwMryKq6/8Xq8/o1vws233IIYgj1kFDPUXn12HqIZMjC+YydT0eIjZYuwHtLzQqR6rXU1ticlsjggiXDgnI1PDh7YDfrc04CsGpk8ivn2NARJ6HiEoPFU0GdynOIjJc1xczq6IoRQAXBGlZIEVhII1LjUezMc57Yh4SmJRuq9g8RoLhOO0IcI552FLqvAedccffZo2H9w72W7dl/2A0T0F/0DDzzQjHzzN/t+KvPZnGMQ9H0szb3V2rQjNEfSnKrmNtpBrXlHqHRgmRiNBId3bW9GXcQL5GgqiWBaLXZ7MFk5fX9EjH268REkM9xy81WYTBTShwQk1nNT/bKJWl9OzlXD57lkIabKlKq2htCFn5V3SiJC0zT4wA//CP7D4Q/i3LlzSc2h6PuA2WyGT/7Sp/DBnziC937re/E//qk/CZ9uMvHihpGlWhkEyzv8oPVD8efRan6cedm5t1QaSvZBiqZlRiqi+I+H/yN+8aMfxenTZzGfTy1Zu+0QYsCv/eqv4Od/7ufxDW9/O77zu/44xuMRQgw2HqvnqsltsITj1n1x2oilzlzRfI1z4lhYqFYKKCZma8rs0tfbZ+UcyYc59qw3WJ5EzEMLOJc+q8nLsgkYp3upXLGyEhtAY51Clz+TjcEaT3DODYeOq6otkZRizSZxpAASD2UtFZCogaUAIwYDx9glhNexe+Lxx/Xa66//nu3tk//Q/a2/9f0vGS+Nf2A2m7q+i5DEqzLyLob477xUaGCpIJvqJgF0zozQKoZ8YJlw6jcYZ84FnNkICOB08iXnAI2FFUMlgSqfXoMqWlTM77abotGzePc33o4rDo4B7eDYIhgkmTVn9LWGxS9Gn9OL9IiDFAlVaFH9YNFC6ZbTtFSBphnhn/7j/w0f+KEPIEbA+8YMx0JA13UIwZhMW1ub+NVf+RSOHj2GN77pLagq+AVnhJrSvrOEjjsAHSriDF00qFZdWEAFXU738wP/7ofxcx/6OcxmLbquQzufoW3n6LouyZUI7bzFIw89jGPHjuFlr3gZRs04VU0DIQJCi47ktNhbZjOqRZla1TJQ3adLBToNGwtnW0oyBhokIvQtwGM8e/Q0NmYezWhipxYrRiNv4UPMcGwkGO8dGu+KjSWquHsB0HcBDluYTACfRnvshpxMdm4gwKQ0NWZbvBlsM/yAhp9R39cK1WImaru57Nu3bwKMTjLz6H1LSxPXhxBVlGIahQzIG1UJyJWfbK2qRxLApjkZszP0dIEcnYfaVIS8g7P3UA478DBTrPs3Mqe3LAMTDejaKQ7sW8Hll+1BlK7aMIYzzVzLaQGcqcukC+l2O5QOFaumlOgXLGYqD7hEwcrKCj74Ez+BD/74YTTNCF3XYjqdom3b4fd8ju3tbUynMzA7/OQHP4h//S//JZpmlJXtg8tAqWu1jGQoG8ykaoZiNivI/Xr28l2ktmXbj8KHjRHLS0v4+H334T/9wkcRo2A2m2Frawuz2Rxt26HvO3Rdhy6F+4YY8Yn778eP/+iPoe8DYl9FHiZpVCbX1+KAPLq4oN0pvV9M6dy6I0JiUTGjqpYPz1oo3+QsaHYyAvbvXYZ0Se6XNMMah9fLm7/KwNIqrv1EUJfE+SmcKcvPJLtPROOJZ6e9BTeH6v9rBc6V+7aAjA9SQfsaaNd2GI+XLuXJZLzbOU8xBF0IOtXhpi7Ke6R0V9nNevgaQ0FjNLPmBQtH0soLJUPSaXTgzBYEGLw5F3xRUMHolIJbiSHBIPL1XSPjKC4oQYY4OSYanAN2WIHU/Utd7maV+gIAtTPvI6O0MkQ4NKMGR599Fj/6Iz8CBWE+n6Pr5uj7ObquReh7I9z3vcmTQsB83gFgfPDwT+BzD30Oo9EYfd9fYDsisToN88YgFgBTZre5LFTAK4HioPKp+9UsV2J2OHvmHD72kV9E29oGMt3eRNdOTeOaQClRKYstn/gfv/9+/MaDvwGA0HVtUegLbIHl0tmeh0Xmk1QuDovFh1ZoMy6ig8WCbYr5UVES3wOEgPXdy0X/WLizMZaTyvgzukg5TsBgrIT/mRhSWEeFhLLILzYLlqqakpzdogYkYQAFLeiKByOvIrtTiChvbU4xn89fygyKKsOFKJS4ipeZldmLxr/Dm6MFE2YqI4naKa7uRqVGEbMvi0qyIInDjLByK7AdK0K0T813hIQOV15+0Aa/adMWqFkgakgeqosq+sF+si7p9CKGvFpOwFjHGS82omXBZ3nRaDTGL3/il/D0l54FwJjPO/RdmxZii66fm9oghCIubtsWIorjx47j5z/8c4unek7EloqYkEGIyqrCkrwJ2RJWYtIJWmy07e4LJ5XxPZumweOPPYYnnnjcBLzzGfq+M8vG0Bd2j5rg34wz1Qywzp/bwK986lPY2Dhf1Px5bDJ45QyeJTvZUbLw75ruq5RKSyE76JCVx1Cyi8xia4YFJasq1lYnmEwcJIRB8J4NraUeMaU58eAcDs5PsLoh4rAsaGuvst+VyA63hmr2PjxwixGMg22nLNjEpHaIptM5Qt9/HQfpyVgyWHD0yidanplRciw3tCotQK1ixHPJRBbo4ioHcyUBq8IVc6V0UiIldQWUaAQq4wCx2L7qNDYpkppOrxd49DhwcBcYPUjngKS5Jefdy0MpGzpXNGzmC/mwuNBwqx77yIJQWRZzU6Aluk6i4qHPPIJ2PkMInSVX9z3atkXXtmUYvVA9VDzM33jwN3Dm1FlQ0qmKmO+CpN7eiVpWZDQ2iuZsXVH4pC0tO/GC0djg/4ooRaUDZTz2xcct6zG9x66z8jUWOxcbvufk6QzWhNDh+LGjOPH8CTs5Qhw20Sip8gkLEHYZS4Aqx0NJXkCL8jtzml8cnahaLqlZxHBacp0pnLgBM7BreYSl0baNbGiEYEkNgERDXV1jABIM86hDlWyR9mAIWB00UgGHFDBkN8/GiS4q2qfKjUOrHjmvnRj71HvsJLCEHBB1mmez6azreqj9tAUWTC28zTkTxYOUvryjhVZom2jlu5keBqbBgU9Sjc/JfkQWOKN5J612NxjJWRDQjB327t21oGEsp3Z92le94vD+dMHio/4IvJD4rDuE2wOoUfit+ZQnRte1eP654xCxkq8PvfVnbYu+C+h7+70Ywa7lYX3u+HGcPHmyUPOoYtooklMHhjTqYkosgp4iOtg4AFAjV8uOnri6n5IQ7pMnTmA+b9F1qdwOFiRlgE9OA99RLKTX2Nraxvlz51N52y84OlzgAFg51EvapDkrd2QR1DI/ILqoXcqQ/6kLeS75URyPRxiNG8TQlwpwMEAbAKahfdGqzKXhGWIbo1DODEUGdoYTFJW5d1H51PEWCZeJEof4QaLKPFzq2EJZWl4CEX2KZ7Ptj25snA+UBjcG9AzjPiIyz5PErazVCIOBLVWMmsGJjZJzekoBArzL5rQJUbOvDwlpzb1CPj3zBeAd3FIVRQg9JhOH1eUxILHM/qQqfQY95VBWFQsOvfBG1xu21ouZhpFPTaXbmUNCALqux/bWdnHdCyEg9gEhRPM/jUjAwWAsJukkU1LMZ3NsnD9XASlS2/eYUp4NfmdV+ChYYoZPp6ZT+60ZNMoJXCWrA8MDAzOR7kNbogZi+lqJAflb9MtZD4mgnc2xPd2GBVDJjmdkh/dtZYidvy5WWaAXswK9oK/X0vyl1xliGjPF1nnG8tIIfT+3GXMVE5jHMbV4fAH5poziWwht/lkDQo6qZ6+uY1VW7/TtremJqCqs4RmJ+bnX8XisEDnlVce/1c67jfF4tEckqPXIaUcJyYSjeK7SDvZGNTHUpEhIFykPbC+0uozGRU1eMlrtMLrQ2FfazDRLzRaCBCCGGVZ2NVhZnSBKAEOTNcSi2Ba1pGjn2GEg6y5mQldlSukvM+MEQ7mvlQlZXkTee/jGp4fUbFgkAQS1MfbFZqe5uIgxou8tLiJT8bLfESV1CIvCq2I5EtALYjCKn0BBTYMZEzoyBYZWPVTlj2Bm2Qp479NJxyUeoTJYgF5kUXJamH3okswqgHobQTjnLw7YpKg8qeP+FvIzs1O6wLEbCB1Ug0BWWvoUdqWcQUdJjDGgcYSV5QmizFKpa5zXEBneVf61nstMt2aaZeM5c85Y1GrXZPpa0GCth53Anl1hn8V0qtuclcqhl5Hn3LaFEOGc567rMe+6j/Att9yyOZu2PzweT0hEhEpq0qIMR6pTTXIiVF3P5pEV5wc6VuZSJUoGpIqRd8bmSZ+YyVVkcB1ExhUAkhkhxgYy1s/ScoPJ2CVWLpUHKm+P9We40Fy52tOIdkZr24MaY1Hxl34wcUUX+s8oRds4Go1wxZVXll75QkLDwENlts/tvcdoNAYzYc++vVhZXTUUE5WJVYbsE5ezUcE4CujMBmZHn8PsmeNonzyKzUefwuknnkY/20qmygMamjNFM+yQS7b9+y+Bcy5hCQxiV8y8OVlV5lEdU4qmSJXEZGkZ67t3I/Tmpp9NvWTH2CkTJPKfA5hICyOnXNIb0hkryqCUMRJlSxIxCWGtoXVpPNc0BIfE6628a1HFB9bjLhryLgYklpKggS1FGrDSm5gvEAqgGvkPrLeqly6uCoM1TqkOVBFDCPv27mVm/8s33HDDf/KqSr/+67/+D+n5U//D0mTpQNv1UZWcVZ9VRoUOHi5Fv7ajz5S0k5ssq/KSSQvVgmM8nEtePJRzMCPAwwkXJY85OM2ZuNJiZne5gMl4kpC4NvnV7LB2XJhZYkHvmP14diYel81CddEYa8HIWBf71Uy6SK/0+je8ER/6qZ9GCaFPIECpDASFVSQSU4S4R9t2ePHNt2BldRVRBI1LyKCgiMVFFQ0UEyGEM+fRnzqPRhUUArrZHDqf49TxDWwdfxqX3vJiTHbtgYaASFU4LQ8VkIjg5ltuwb59B7C1tQ3vhxCj2uBr4A/Y+3DsEGOPq66+Grv37kEfe0wwKWMbwg5LlAtKOV1Q9hDzziMpzTXpom4JVAmpkaxB2GXZbcS4cQACooT0tVx5MFDZOOv3QWpUORu9UEFyvGPL08lRCnkNV4J3q6wYrsR40MLnFVV4uOpnEdgBIbaAIjZN453306Wm+ctZVEevfe1rn5tubn/XdDYPzOz6EGK2kQzZii+L7LOuMDmA5QF4HpTkUYZ9KC3Wfla1WCRZ4wiOjFpkF4AHlYYs1uiFrkVDiWE2EAG+YYws/mqxbK4WDVXgQE1gpgWZVhonJOPo/H79YIQzmAMXJDq7BOaNxxbo9vY2Xvf61+O2l70UXdvB+ZHZWThOTJEGrmmMEcIO3puYVkSwb98+vPq1rzGKW+3AlzYdERuTeAEwnSNubKERRd/NsTnbwpnNczh//hxk3mLz2eN45qFHMJvPqmtIAFPpJYkd5rMWN950E151+2vQ99E0tWzlKPsG5D3Ye7Afwbmx/elHYDfC0uoqXv7Kr7PSsxml5KtFgnueaQ+VSlzQA1C6/7HeuHaysGhIXhtCagc6Ym3ilUOsvOdUoaVoR5Fk+lVFsVcsHKsQhufECgZTN2WT6Dryo7ToVZtXyEM78JCaB1CQdonoQ68xSpgsLbnllZVNMH/Hjbfc8qCqMmfjrdtf97qPnjt/+j1bW5uPj0eN6/pO27aLMcQY+iih7zWGHn3oBwhfYxrehjSM7hLFruSvVSOGnMob7cNWvVMqNlDCcvOiIS07pt1QHqL2VAvPsFwKHoyKa42k7PDnkTJLGnoJZ2RGK1WjQEOE9AHoA6iPoBDLXDXny2VwxTxb7eHv+w7Lq8v443/yT2KytFQ+LyMZl2Wv2bRjs3NwroGq4tDb7sCNL3pRcWCTKnpQxUYc6RFBu7EBmnYIscP2bBsb21vYnM9wvt3G2Y1z6Gctzh49gVPHn7MRTervaiF1nbdx53d8Oy67/HJ0XQvvvbUXYLCypa0lIzHHhMZ7hNDhDW94I170ohch9D2co7KBKWpT5UTyTwbLNpM1oTFFAQUxwEqS70xy16v7o2yduVNFszOL24oXByaG91ZlCRiOHFxO4EqeTzHlWA5z+uFw8W4wj3TsUpCvEQOgvKB0GaYBhb2TIgvTmIdk0A+HkJDwoKHvI1RpdXXNM9GvuaZ552te85oPJYMu4dp4641vfMtHzp47/7bTZ07/RNvOxXl2zjmnqiyi1Pe99n0noe+1783xOkpACB1CGpobG9/qaUk29Jb/EFMeBcBewM6ofywEphxGMyQb5whZC/nJbnec3MwDVJBs7Qd6paY+uGQdSwVSVVaShZYVo2VsRgX1ES4IqA2gLsC1EZR/dwFoe1Dbg/seLhrqCa0t8rMjHWNzexOvf9Ob8Fe+/39GM/Louh7Oe7M/dD6dnIBvkn1KDHjrN7wVb33bWzEejzEej1Jf41J1MhD8I8wnqe8CpOux2c7Rdz2k7TCfz7Hd9piJolOHvlOcO3Ua29vbCBKH96oD+ukcI4QO11x7Nf7sX/gz2H9gL0Lore/1DbwzTaZ3Do331rPFHq95ze14+ze8HaSC5fEk9WIprk80zQxtM3NB4HsB59/zAD+P8PMIngXwPML3Ah9tRkuCYtepCyZN1aaSUqglyZaIkr2meCglZxmKFvcoAKeePVBvcjFOjusJu2BieLbflGwtHSlGrkHjCNwEKJu/lfP2WfNJntlNMWaifIrAiJr43gpV0RBDlCiRHWhtfcX5xp+VqH+7mUwOveUtb/nUBQ4GAHDXXXfFw4cPu7e97W1PAfiOj33s4+/o2v6tpHyLAjcCdFXTNGtN46mTHhLt0CcCiSilcoCs/zJ1ilWXDkEHO4kganYQjiDSAW6UqsVkIcKKGA3BQuIuMigdZqHwD226w8k4aShZL/SAHWaAtTMAKeAEKcMigsMwVsmcVHN302Sjqia8JoAcm1og9QLClUFzOuG2Nzfx3ve9F/v27cP/9S/+D3z+c59PJV1yZIs9RBj79u7BW+44hDe/5S3Ytb4Lu/esg4uCwShzBeZHiiQE0DvCdjeHhg6zeYd526Jv+wSAMQQRbuzRi2A6n8EtjxOR2i2ERClZAG3XzfHK22/H9/+Nv44f+aEP4JGHHrZNtjoNiAj79u/D7a9+Nd709W/GeDyyUrzx8M5b65rM8zWdlJQzK4OY3TIxYghJKpfw3TwxSe7oFmTrigNApnVl8ghVvablauZungbDteQoDM5u8pSqYjMAs+kYgckvzFpdBuQaRmwAP2KwIzB8smYFHDdG0Eik+DwbNVBQoULq3UhVSSVCieFGo4bG47Fjx+i62ckQ4wcnfvL/e8d73vG5ykUkXtSM66677oqqSkykb3vbWz4K4KMA8KEPfeiKsa7cPKXpa4n1jSC6FcLXLC2vODPLst3CPINsby9Bs+RIiUnTAx5iRC+OmKTMHYXsVKwTiwkMR1lhLxWqGnOOULK+12RzqVUK4GCvOFAA4zDoUjFHdhGgi6AYwZI4uIk9Q7nXEZPnuBz0wIDGpN9jgL0rY5TscasAfOMwnW7h9W94HW644Xp88pc+iQd+/dfx3HPHEULA0vIyrrzyCtxy60twzbXXYGVlBbv3rGM09ot5m/nnanKOgCII4JYmOB866GyKMG8xn/elTA+IkMZhaX0XiBld35uHr/OAIrkYpjlpLgjZFueLbroJf/Wv/c/4L7/+X/DZz3wGJ54/jr4LGE3GuOKKK3DrbbfisssvR4wB3jlMlpbgnJ1wjjj14KmEDQKOBvBpSMqbBPuXeAeKgylXZLDjkjlCPomTudjfL1qysOXZLGSj5FkpcRnjmbhchwWOQfMpae6bX4uZwEmL6T0wGTMa15gDAZMSGyjpyUibWYDPDHXOMTGxY6bRaEyjsR1Aoe+hKs+LyG96735+4sY//Y3f/I1fyt6yd955p+w0ffYX8ZNVAHT48GEGgPRNRwEcBfCx++67z2+f3r4iMt7ctbM3RNDNRHqzKh9smrHLsLsmt+4Qu2Q3b3tY1IiACGe0c87NMWfX9PRnL8Hq+QsCi2wREnv0nZhFphtUR0bA0YvTkoruU4AQoV0EBzHT36jVmCXtrDleLe9jjoCQHOJT6YYooFFOARsSzlQj2BPm7Qy71tfwnm95N9769rfi9KlTmM/nyV2O4bzDeDLC8vIymqZJfehAHTRf01SyJRZPFxUrq2to9q7j+KMnIW0HFUIQoCOgZ8ZobRVuZQJ1NvYw0CHCaU49XvTSMSsSQt+3mCxN8JY7DuH2196Orc1NzGdzez/OSMkxRkyWVzBqRmBmNM3gcs9RCjDooqk6smaPaoJDJpAsiOwEYs5V5URl5yDJtFkUC7pUEkBSpJ8WMy17MQOgOJFDYgINR/YzNeegZt8fAZEvrB1mZ3PShnQ0IvHOk3Ng4oacc/AOcAxy7OA8wXuTf4kaxgCgA/VPx0ifI6WnRmP/cyu7xg/ccccdp/K9PXz4sHv44Yd1ZzTCVzJ8rr+Bkq0l3XPPPdkT86n0+wOqSr/4kz+5d4tHV0nsXhIjXxZCfwmJXi7MuyG6p4/hGpFmHRKdau+4WRtNmiVG7AAaWQx8jOmEtARgAlm2CCWCQ4oxIyZosLJm3lp24RD0oCkIRxfd8IqdJAxw6AMoCLTrzEmhMs0aYgDsQRUoKFLKN0mMIVajOnKyygQB7IyNw5QefLP39403/9sY0DQe+w8egEaxFG0Si34DF4SvpjtqAnuywUNJrYJgpsDuq66AQnHs6WewfX4L0QPKDVZW1uFWlxCIMJqM4bxP11ChPlUDVEUkVPaeWVsYQ4/Ge6yv78Lq6ipiDEWhYe9VrUbjodwksevL0UpXJJ4tZYuR1CNyRTFcAF9JgWCkAU5keaM02ZFUvGqzBrO6ZsWBMH1fl5wHKC1O2/B4qDzUdMDkuCqNKZ2a1tuvLDd08OCyc9JZ1LtIYKbYsGvh5DREjhPhtEg4CfLHveNHx0v+08x8+rrV1fO33XHH1k572Pvvud/dj/vlyy3Ir+jEvhDkVgV8qCrdc889dOutt9YetKfT79+8iNkw/fzP//watjDux8IypSUd00G/3f3l1eXRd2zMYwTYiQrq3C1Op1KJNQMn9DYmzmKDrosIIUIbHVzwqJ6fapGQEdh6yj6CejspYx/sRvOQSEUVE9ni5CMko3rZ7S95nJIQwAD3ALxC4G0BZ/FrEc86ex8EjJxZTnCsaV7Z92inEXVa6Mk+scwR2aGPPQIR1q+4HG7XGs6dPYvt7W2jeDlCgBE5llZX4Ee+zAljiCDnMACLi+a5xAwWAElArOLgG4XEppTqBtJl2qUFwFJAAsUE2gsoJNnVkC2YpmLF2fsCGmy5dkVzmuRUDEjjLBdEAUUwIYOaVUeekzp2pipSoO9j8qeitAAXwaM8+iikisQaYja0ovGO1pZGG0sj/BtE/nyzvPRF7runWrjZZLIS1tYwP3To0Had0LXz1913382HDh3ikydPaqo81SQbX/nXV7MwL1bq1j7iBAXuuQd0661H6MCBA3Ty5El9+OGH9d5779H09Rs7XuZLP/rBT957erP9JmJdJnFwxGkWSAvhPQVJzZIm2JjEOY+u3UbXd6DlIZKeK3f1PJLJAascAfQR6EIJLs16StrxgA5sJRPNRqQSto5pz3rP3k55QCDJ1yWPJygNm4mTyXACGBy7yqWPK8gdCy59UplppZ9g1C9mqBP0AmB1BUuNA6bL6PrOktNUAMcYNyO4pimnDaeFBCJEqvSqGfiqQnSZ2AjxqmnWOkQ4KsoxjuwOq1EsCzhGy5MkFJ41EcEQASq5HrDI2ZouYK/LiTSeHDQkBjvhvYGJJWMVAhft2kpOumYrXafTqeWW0BCEVNhNefKYwZpKgZOMAeLyxHvv5P+66zve+b98pXPr8OEjXD/3gOXNEpGkeMvf8S+P3+MvKpSbi3Gd7wWgC15V+bS989ve8IX/zz/40LNjd/DFfVBREi4sf875iiiBRVF6gAiOHIJ2IEeYzxXdLIDWG+NQphzNItqO2Q4zKcGizSM1RMQYFlQstSog97Ixs03S3DaHxAxuacl8WBRCybu1gbnIp7SymMviRCJY3OR4MXsyz2cTwSDTzPJMM49+CjmfADQOEgHHY0waD58sS2IUGzcpEsUu3SCmxN+sWSlV5umOZE7iQZFiqVgo2ZCGLge4LD+JAgq9oeaD8KMQxgX1botSCRTjaKpO17RJsaidMS4vW8Ngy5giJXGxNOhDC40dohCms8xx6ew6ewIjguFSLKCkF7U0OHPHsPJcCPDOo+vkVw8fPuyOH1/1l122FR5++GG95557dDHAifSuu3BBWXrvvff+ntYV47/6L1Ki4fe9994rR44cARHpsudPNGl6a3ZAWjxhLCuj7KEAS7oZVpaxY7RtxHS7s0WkQzmKzPhZ8MlRA26iFMJ55l7WjIwaXaUE0atGUGpA8/QsL1DjdCbRdDQ/Qo42izWAwS06oC8M9+WiqWE299WCPOffmf634AavBiKxc3Deo2ka+KZBMx6haRq4xhUCNZG55wexnjczU/J1KHB/7tURQWwVSp7ZsaNkiG2bBivAiUjPUSpmlN3H4vjJKKcVpXk066KhM9UyuGxwFYL5uSbtZKHuJf2k6YhTvyjmTtD2EVvTCGYBabBr5sjyvEWBjOam/cm5PINNdQCRC6GdrayuP3PXXXfFX/7lrXDXXXfFe++9V+pn+eKH0e/Pr6/Bwrzw10te8mcJAHrqP9aMQUgWk2VmRUarMkCBjEyeoVdk1j9j1s5xZmMjKVRkQS4kGocIc3vCi+Ld4HotDH/Vi51kxYEr7eqDAFjEFBikZMBNLuOCIIZEOJeBVbTTACs7tV2YLLbIxhFVjEcTxFBFossQPosLHNiRwAu2ctm5ZD7FlbbWACzvPGKIlb3HcFqXLJZKDkcXSY7mxGe2QJ1ENk8gEzEtZGISLhQKYIeiI2t1ja5YZA8mpA5ZUDDQ7ySaZpPz/Fss/bjrAra2Wzg3whDoMMwZmWPaNPP75+Q2NYJjr6Omob7bfPp/+t47HgCUjhz57YGa/2YW5iOPnFQAWFtzj/bt+a3GEZMRQUGQgSScWB1Miw592Qu0j8DzJ85DaVxFsWuVKYLFoKAwRLWTMiilCQ/O5VQiuYveND+UxeaxIjMk9JfEFC8xEfJz/8rV5c1RdHWG5jCm4JS1WGVLMqHrOnzpiS/B+yaBXZacnSVlOVowxLigESWqo+y4gCMhRng/gohic3MDo/F4IZ160BLKBVmWdDGrz5TIbU2tvaesiolVaFH9+gtCeVnMXZGKQlnYWpSICtmDSQe7TiouhlokZUEJW1sB0+0OxI35GkHg0uZd3OYTycQ2Igcmy3SlqOooYtTEz6sCd999D70Qa+QFWZi2Ayn9he/75t+IYfrk2BGrqpImTn4KJXJMAIUdmSNWHhpjo8Gx42fRtlp262J1mDxtoDZLKydNZqIoEk1wyFjJ2j+tSe9xEFiDAFZOAuLBu0VigAbjgmpamAamxEUiczUGydTFxQTlIQJ+uj3F37/3Xnznd34n7v5//wAeeegRjJoxRn7JeJd9ROhthKFFt4oU2irFAMuU82oLUgmffvDT+Bf/7J/jL/25v4j/9JGPohk1aWEPDuO1VM4KjMSiSSKCYj9jmeYDYSCNRpDc5aKYksUE3rGUzHKRDBYlA2NKFopU0ikZ2FoD5KhFkVTc2lO/fP58i7aPIPbJuUATJdIV3SeDi0dR5vUy25DGO0Iv03//Qq4Rjxfo152Hj/CRuyCjsfvFXuSlDEgktQJGLeos6/+kaCSlEKmVHcgt4djxc5jOFbuWXBrCp75GubghkGY7S9vho2QhtTmGKy6M3Bsc2wbuLoTSmZ5TkGVx5JDGA+KrB/sifWSNBO60MFFVNE2Dzc1T+OQv/zLmW1N89Oc/gk/+0sdxx9u+Ae945ztx4003YnV11fxaYywucGUuqQJyDqMUj7e5uYkvPvpZfOY3fwuPP/Y4Hvviozj6/Ak89JnP4tBbDw3jmAtUPWbQjeRymIGskj2SpB3ZZ4h0uBZWDsswmxVCHRyzkEKtGfFOCz5REu3luUoEz3A4GwEkI96VbQ3E4fTZGaI06XtMvG5jEVf8hUVzc6SFmmemzuAYp93ain8WAG699Vb9w7UwcSeOAAq3/RHIyl8meE4sArt4AoSYbojYDJA5I41Wcjo3wakzZ3Hu3NQWZjJQIE39TAZdaBCkSq2Gr+yTdGecnQogrupZM3GgMuPSuku02AZiP3jr0CAMXowzSG7gdQBP1et2XYdLL7sM3/83/yb+2f/+v+PUqVPo+x6/8OGfwy9/4hO44cYb8ZJbb8WNN70Il152GdZ3r2NpMgHI6F9mQ7mNo88ew+OPPYZHv/BFbGxtQVXx9DPPYntzE3/0fe/Fu9/zbmyc28JkMinXpRh3y07x7w4HiwT81JF9TINszxYeDXaQNHjLFjxBBj+owZB6kVxRQJ6KCp1IZUbPVFfi+0QJ005w+vQUzOMkKxOQS6OmkMyaXSqTU89EnE/rKKNJw12/9eif+4vv+xSgdNddFP9QLcy77uIIADddccknP/vY7Ggz2nOFtCqKyKWUoqITgSaom5NxF1gwnixja+s4njv+PK674koEqXMhqeSs5PKJqpWUVSicJtsLloY7TKcGD/3sYoAqoiBPPCRpJg3O1xRJMBgua9EpEmHBTmMwAE5OgDFi3s/xzne9CzfceAOO/PhP4Jc+/nGcP38e29tTPPTQw3j44UcwGU+wvLKE1ZUVTJaWMBqZWXTXddja3MTm5iZm85kpUQhw7HHLrS/Fu979Tlx//Q2DLYrWDKBEp8RFbFBoMR4vVyhUqIxaCbC1QpEzdkbFkgX5lGZaSMemavFmtlBFh7VrlEgHJnBgaIwJbVbMpjOcO7MF59cNE2BKOSEmkHZsMRTsHaCDS0SIASPvlJ0Dsftlo6Me4SNH8IdrYQKKu+9Wvusu2vq7/98Pf5QRv6cPUI0eQXoQCRgOAhvYU3RpbGG7X8MGlXetxxceO49Xfd0VUO0BSTM76kxzkOeXKeRHY8p+SGu2TyPvPE/kOhKCbQQQxdmpnedrlfRIkyCc6j5RAPG0cAouZIAqpRNpGEPYwzkwR50nTKebuOa6q/FXvv+v4r1/9L341U/+Kj794Kfx+OOPYXNjAxvnz+Ls2dOLdpspbIeduSKsre3GNddejlte8hK87OUvxzXXXQeXQK7RqIFzvEABRPUc7kwCM6mEFIS1MGuK5nIw+Mqfl4mroKhEr8yJ1BBA2HSfsFNayDJQs0qFskMBwZhgMDQcoggUwZqBuQ5QxolTLc5MZ1hZO4AoCk9kUi7vIHlNMyOgB6LHSBy4EQhFgBtCP40j3/2YLUzgyJEXZnW8gAsTAO5nAOqb9idCmP8Jhrfk36Q0YThjdKjAwQMUEcT6RFayPrRZwmOPP4/t2UuwNE4PtzZQTiVstAfHZXe+bDSWbSE4nRZZWM1IjCCpHiwpRsGcUq4HD1RdMHRi5yy0NJdcMpw6xp4ZAnG1GA5TsTSsy1vnGSFZXV533Y247tob8Z5v/mYcO3YcTz35BJ55+mmcPHkKm5tbmM9mYEdomhHW1lax/8ABXHLJpTh4yWXYt28flpaXi4m1keWzmmKnVE4rJ4nh77O5dOHniI1LMhrsyJlQXRbpjcXVTmFhQwunLxYEygV4CzkI194jMUGcCRqiRDjyUHCqhJM4W4E+Mo4+t4GgvmAD42aEhq1/TFbtthE5QuM8fK6GyIn3Iw79+Ude+8pdn8xqqxdqZbygC/Pee+8IAPANb77qP//UR599auT3XCdCIqmbzKeayQrioDRxlspEDWO8PMbzJ8/h6LNTvOimEVQ6qHhbnGJULAFDNKkQmG2QHEIqU6kaMSS6miSzJEkBuqhHEFKADxmar2LQJbm3zOBJdVrGKBekVyuGTSHPN+sTMBOqY28Zmr5pcPXVV+Pqa65GDMFyRdrB2T0vcnO+k2oMYq7rzi2aSQ1hS0NeaPEGSuBZ5phS/Z5r2iIP/jb5ax34gtDfRc8eDEbUVYoaVcT63EvamJGNjpf0lyQWNAtY9HqIhK1twXNHT2PcrCe2FeCzjQtx+flEHiRA1IAwYniZgHQk48YzRXzgjjvuCHfffZ/Pz+cfmnHJItH3Pn/77bf3K+Pmh5eXHFSj5LkeKofzmvPHCnDqP7kZ4/x2wOc+/xwCMYLOrRwTgmpIkh5GABBJEQgIyIZUZDMyWGmpUTL+ZMBFUipkr6E88yyR6LEKhU0LOOjwNXneWEffLaYcDHb9WrnxFUQ4RR3kHco3Ho33Zg+pDOcajEZjLK0sYWV1BUvLSxhPxmhGDUCEZtRgMhljZWUFa2uraEYNnHfJ8W1YlPmEzMbF2YZxMUiq6jl3+jJlOh0lQXsOba361IsDbAMoV+dJZ+oFMSMQEPPiHFZ0teEkL9zo8NyJ8zh9bopRs1zom87Rgmong7cMl5k+UGV16lyYn5vu3ut+IlVz8kKuixd8YeYLsG+N/nVoT5/3LjqWrC8XUzqohcewmOsAIYJYDL5nD/ZL+M3PPoHNrRSrEFuIdJZzEnuTLMHs7dURxBsf0gbpg9mWxGzaOxgR16ydhdwTqYAkEUhQCJkCX5K7wUKcQmWBWSOXGanM9owxmjoiBkMRM4hiWsjByt85D0oWmI0foRmNMJ5MsLS0hPF4gslkglEzMisTHk7HOgquntcOfyeLPkrIoTeDoLoe7URSqGMoEwKpLaJaCFBVGrggWW1Y4GXDktwk22uCGdI4K0Mzg4gyM8hS34IEzDvCFx8/hogGjh0YgtHIJf+k7HTvBv/YjMpaXIYsjZkaaj/+Z//Ue564++67+XdLPv9vZmHee++9cuedh9373/+uZ0dOPrC2PCGRLnIxA0lpNpB0DRNHE4rGexAY48kKvvTsaTz66FkQTRCTsiZHfcdEiI+kUO+g3iEwIEQphEiK12rM9pJSjP5Smk6F3KZTIaqUQFT1BjAoM6RMZOzUi0FLvqdUZtaSxMuFwJDk+jFYCnI+IXIq8gAgiWVf6LCAjJDBRYlPRAuUN6oi4ofFojtGNnIB8JONqgszqbb0LKUmGdjl2BweXM4WXSSGFPfCCgWmypUAMMWLpig8JYDGHjpykGLencCmZIsSY4CQx8lz2/jSs2fQjHdBNMI5RjNqykJ0jgE3+Pja/NcYVs4TRn4qK7voH6lqkTT+IT8xy6NA63tX/o++O9/5hphJ1CHa6YhMVLbezqcZlo0oCH40Rq8ev/YrX0LfTRLrBFBxw2wu9X+BzaNHmYC00w+Pe+agJve0bM8pVfmmtiAj0u/qxBAkFzYaDK9Jq5RzzS5ruCCHM2eMFDQzm0qLLpLrK+vMgdsgFaMmk+X5IqE3iwbUtBA9UTGcqtI2z1szw6i8l0yFY7JTkqh49tRz252KmvyeiemCsZRQqgyS3Sd5V07LMqTRhAGoS0FGQOgcHnvyBLbmBD9atgWdiepVno1mAy8ReM7uhC6ORs7FuPErf+nPv+c+ohcW9PkDtTCPHLkr3n036M997zs+N2L3gZWlZdYYhIqSQhERIBpSi5HNlxK0DofJyjq+8LkT+NJTZ+DcyFy6U/pXzuaMiYoHZrD3UJc0eVwxdMoCSSeF1CRrKdadhQ6WHkplM+oSwsDJrDrjHOmXXe8M/l3Uy1EyMJOaqJ5UHiXcQLN7phZ/0npxQ3eEJVFNoBi8dUXqEj0uLNSLebvqDgvQkvcYk+onbU52PY29k0/sEuC6AHJxUu8kN0PS8r3s2MJ7Glc2POXMWc6jqpR4Do/z5+d47NFjaMa7IeLB7DAaN3Bc9ZcJlXe+sU0kuSBYWxB1sjK6RxU4fPjIH4g18QfoxLwHUKX10eY/wnxz27kVUlZl/X/a+/Mwy66rPBh/19r73Htr7EndkjzjGQnCYCcMIUiGEIfJYKAaggnBD34MGAd+YGOwIVSXGcwUBwcQyIkTxi/f050AYTbGyO3gQIzN6JaNMbblSbKmnqrq3nvO3mv9/lhr73NudUsWHyTpluro6UfdNdyqe+9Ze03vkDBSqlbboglZU1VeJzfYGY3WsZ0i3vLHH8BUlgCdA7lD5zQnzdmq4gx0SpgzQ2JAGxmZCVJ4iqVsdUaHELn7RQ+sLvYAVsYxMgOZgS4M9GyG5a62KB4axdbOMnLxCXHMpmbzB7WxE0S6Ovwq2qpDZfS9jpNDw54SDFZZ5FoqDneqQ+pZBZIvZGggZ4JqP9WE9OoHOoDWSSBIE5AjI0cy0FTwaWrRfuEKvrXDSdmlJMlUFUJAjoQ8ZqSlBqkZ+87Y3pcMMa8STcgyRxZCmxuc+eu7cd95xjgchIoiNAmjUTTZFiYEZbBGRGrAYnvNiAyWkFeXx4Hk/l972bd80e/ZXv3/fra8ogJza2tLNo6f4m956Ve8qxl1P7m6DNYkmck0WLmM0ktA+h8mdWU1xXhlFe+8/U7c8f5tgMfotLVdW3bIluyxRyv7sRCAGK20jT68CZYJK3mMPRuyZVxhIHlAU7R/W8bUweRS+knrgk1AL6cpQxNdge1dHaOq2k9z7cG5atiWbMgUAAoOGdQ97BV1M6ahw9SDG/YOMbyL3i/9aqkXDCLjVqopBSoRNLKXtFwPLsQAxGD0vGB/MivU+1IaRVATQQ2DmwgN9l4UWhahBHcwIDIFb24D7j3f4vZ3vh/NZMXQTZHNB8bdgEq2JBL7tYJXXJF1NBoT6XS2vsbfhcv5/f1fvMKV9MucOXMSAPjR11/3R/efPfsVIawf6TJUkSkN1yaCakQkBQvLgtiMMdtNaOdTPO3pj0OgGbi2Y4OlfjEhKruRQP24n+FBZh9TYiA4dIxsYJRKXxltyqveA0nBhsJrL+l5nBZovXaPSm/pYEDxRW+O0ucZvK0swYskqC/rwQMXsYGN4B60kQ54jP15XH5eMbjpncT787oEYt4DtC/Au9AfNGJTblOY851uQUVygLDaaxU8UD1g1V9baiIQGiCaNYO5i9vvygggBJCGWu7nrGhzgz/8X+/GHR/axmT1KIgZzYixPB4jhJEFNhugJ0ZGCIaTjQ0jEMuBtbUQafpTr3jpl/7ixsbJcMstnyBXSizwlRSYRKS3334jveAFX3pxbYVfstw4LprVvE7UdF9N4dFKPzsFDQaWpUVcWcNfvvMenPmr+4CwjNx1gOaaJcuEM6WMLIQMRiJGDowuMlJk5BiQAyMFstKKCTkQcmDIKEDHDWQU0AUgMZBU0EHMbTljQDMrXp9Fd0hrqdsbl/rboNT3lsMebuAYZUyYfoAkIpcwU+yvwT9PlQRcgk91kdFSlBz2sl0WEwhV4GL5OimWB57NjMxjcmkdGySRRhHaBCtrvafX4P3nKELGARg3wGgMjQ2kYWRmZLLUZtNaBiF6yasAZWRpkcH4wIfP4vYzH0KzdB06BRAFTcOIFBCZa4/JRSJezXWaKMrSZIWQz975hEePv29zc5NvuOGM7mfMB7luv/2Unjx5MnzTN3zlu27+7Od+ahivfPxsPs0M5oL+Eef80aC3yiog6kzpWyLu+eidePKTHovJKFfmQfHb7CeBVFckvoTwxOSlmJ/m6lNC9bJXysCHXAle+qEEBi5UpRStRjWEOh0cErmhvqZxfR5ZABpwvyIgqvS3YVDutfob7iZ1jyX5Xpds1Yyhyw/RsLSWapNWhMmGCB916/I6lVpwa/a6hKO/Vp4ZA0PJ7NYRgv/x15a4At3Lc2cT+wEoQ/IcAkEnigtTxu/d9pe4/7xisnotBMBozFgajTAOY8NaE8DRZGhiaBCDgTNGscmHVkdheWn2L7/5m77gT48d+2a+5ZYXy5UUB4wr8DpzZkNVlZ7ylMd+Pet9H1kaIUCTBLbzmdh0d6CCQAKShIYZTCZtGEYRH7xzB79/+p2YyzrazppG8d6t9+10JQAPjKK2ldjXKoEhHAG2/ij5bDQ7DGzoUGbZ0Mj8imDwiDoxHTiOqQ931HwtJDs/dBhgFau7N9ikOl1fOsTRha9bWEUMsuIwU/bf52q14qRr6Q139k5o1THKro7Vr320EAbI+mQClHz/GBr/w6AYkYP15qBor5X3yWWdUzezGipBG84U6SSg0zH+/B134I4PncfygWuQ2g6jJmLcNFZGK4CgoOiGsRQROSIGRgPNB1aXI+nFky/79i/57ydPngz/N6RDrsrA3Noi2dg4xc973jPvXV2e/8tJTAghKlS1mqe6mCMkg5FADASdgMXckUcrB/G2P30/3v6ndwFhzVzKcqEjEXLWag/HahqxksoKgJCyokuC5PZtSQkK9v2o3YCSi0o7Q5RMm2cgsVHAC6YIbhNl0bRgmpsd8SNaHKhTBYuXdUgJoiIYprK4AzXEkH2uYGYvDT4Mgj2bKpykgfqekdCHA6AaH9UhzQWb3WJB9molaW+nCPHKQq2ysH1xsIDkCHLkUinjh7vVIlNKnMEDMHzOQJtH+PAHd/DWP/4bxOXDUATEhjCOAeMwMonKxlXjmcChQWATcGuC5rU1CoT7znzuzZ/8dapKRW7ySrsCrtCrlLTf+MKveu/nPPtrONDSs7rUJlATcnb5/GrXTiAVMCZQYZiArIA04P3v+xAec/0hHDo0RkrJPu7WecUIFijZrqwu8gCJoxUBU7NUWVV4xpPFyUrdW2opXeu+se873ZBjoZOz1k56CU6nSC1wP/cs7hfLWekZ/0geiLwnU2ZH3ngwsQ6cnXvLQvE+U0p1Sr1dnQJOCr9EYgvV8gtUYs5ZJV66U7H/6cvV+vV1UdubGBdwiUhG1hHOXlD87uvfjnO7EXG8DlLCZDzGaOQGR35wxNjYuoQIoYkYBdZRyFhZ7trlNf7ir9749A/cfvuN4UorYa/ojFmu48c3ZHPztvjKV3zxZqS7/p9Dq5OGOqTIARRaKE/tjUBjwpK0C+WZrUhEoWGEc+0Ev/rbf44778noENHJFLmbQYVsRwdBymqBCnUPk4Gpj/blm4j9P/vXa72pFvu3YndHYhpAJRgkEzRHK9Fc5S2L/RGRqs9TwAILgx1cWqqW8tQCtcD7OgPvw/ydFvtR1PWJme4wNEdTICyqcwNEkpsGoGdl7LFDl74X1eGqhdQAARLBBl52Rkuowlf2vZ0fEH1gFmlLaOPDrtbeayh22wZ/8JZ34Y67W0xWDgMqJtXZRDeY9Qk7K1gYI2rAnBGigiLltZURT2L69pd/63PffqWWsFd8xvSiFqdP/6xuboKv+bQn/8buhy981mi8/sT5PGUzZPOjnwS5eF8o9Urmamri586dx31334vHf9zjEUIGW5foN2Kop7JNeh1RBFTuZMleZRhyyaBl2N/p0JxocW1REUXDrFoU1ktfVwgdjlUVGSq054Glgi5MUPuJrFb78z248T6gimqd9AOoXOloZV3SC4P1duJ0CZjhEvV65zxKUQkcKLsXmGABJRCFfohHtvYqComqrjagHbqsaNMa/vCt78Hb//R9WFm/BlmMV7q8PEEzMg9PIlimZEIIBA6KyXiEEYfumgMrTQjbP/O9Lz9+YnPztvjiF39RvpLvfMYVf5k22rd+wRfMr/245iuacPZN6yscIJRYRyDOUMwRICA1I9riCOysSYyWDuKv7pjid9/4l9idrqDNjJzmzj5xyQ+X/hB3/mrb5IFFC8MTWZBLNOlIY18s9n8LDAzpp6wlGB/s6y2ue1J119l6pzgh9yRmGkx+C0C+X430u8gBiKB8v/SUrFxL2fK9qFPaPFDQ00GGVlfGKwawJVjLfrbQ9uptpjT4mR6qNc7dt0YVWhQU1GREszC6vIy3/8UH8EdvuwNLq4+GIKBpjNLWNNF3lC7cTECMI4SGDEwgSIdWJg3ruV9+zrOf8C0bGyfD1tbN+Yq/63GVXG7sKb/0S792zbves/sH0/na085e7BJIo2hCTsadzMow+DuQsqDrOmQx9JDs3oNP/YRH43Nvfhom8RwIHWIIyGqWRZbN3NLbDEgdEpYXdWgGGXRR7W0omKc+JS79GPdKbnt6xGEPWRXoqAQaY1HKdVGXKGepvWUZ8CwA2zNqCVrLTgyzrAxU5mjBJU2LHIFPgnVAxK69LdMek+ACwytlKaqJkA79ZLSfLpv4tukPmrFucPaNotUJ/uzMB/H7b34HwuhaCEYgClgajzFZHhlOIbL3lYzApsE7HhEYmq49uB4no93f+OzPOrzxrGc9a+5vkl7p9ztfLYFZ7Oif97zn3PvY6/nzR83F/3VwpYlBuAsawSxgVgQSqM4BaY0aFgJCMFGn5fVrceav7sbvv+mduDhfRydjtGluU80K2bMeMmUL9JRcuxWDLFd2fBjIPGrJMIZKsfLQJrUymNSWxxjC3nppkR422GfGMrCxAEwpewaXSmgeikdXUIO7XPWoIPV9rnjpPrRoKEgl7sER0vtQli+qKg0VGEF9yexAit7cBRW0X+Q8iGlBMR4Olig4XCNpA1kCkgbMtcFf3n4nfv9Nt4NHR3xeljCZLGM0niBQRAyNy1KygfaIMAoMBrqjB1fjZDz9nU//R6tf9axnPWu2ublJV0NQXlUZs1ybqrxFJL/8y2848rY/u/+XU1r57PMXpqmjFHJWSkrI5ktr1nZK6FTRiiJwRFCFdhfw8U8+gn/yj5+KpdEFMDIiG0ePy/6k8DnU/DAwWCHI3j5T+mzXq8AXXdtcW7MShLIn+/Z/X9xPDqF5w4/Twh5TF6fFA5D7cO0xBFe4CmcvQu20mGqrp7mKbBeDJxu4huqcdblbR908SYcGs+jtGyxr9vhVVa6O3YCbIWGE1DFaCfiT29+L//k/3gVqjkE4ACxYmkwwblbRRJu4cjGOhWI8ZjRMyoR07PBqszTqfvVTPmn8vOc85zm7m5vKW1skV00iwlV4bWzYRO3X3va25T/+zXf+p+ls/JVnd1S71KkIWEAQYaQsDoeLmGeXLASDOYLbC3jq45fxjz/9STiwPEfWrpjUg1iqs5TZ1tmesTgX90a4JUAD9lKjFoLEKVuyxxKgD1itGbfPfNI7f+nlAtMnyP0jDr7fDgZTJ3fR7CrCPBR0Lno+AWYrWdgiJRMPMqorB3ysW8iHtbbOYiuNNZfn6vBA0Wq3XoJUNNtumcboWuCP//Rv8OY/fj8m4wMQWkIGYzIZYWXSIAajhsFB/M0oYtQEkHQyDkpHDqzTymT+85vf+1VfR0R6JSgSPCICEzBT0PJif+f3/uK/u3gxfOu8y9Rl5CQasquma4aJApOi1QRgBKYxxpGB+T04ds0In/0ZT8CxIxNI21qfE1xvlF3WoyYm6UWe/QbWgW/6sBytYqoQ99SkS/rEoR5O3SPKYhZkCpcMh4Y2Dn1POsyMHoxZLnmHdY/VoEnKOxZWi2qfVQ2W7RYHO0rG9Olvnz2CTM4AMhlNqn4wqIGIih0mRKPtwVZFnQTM2jHe9sdn8Ed/cgd45bE2FOKI8fIKJrFBCIqGFSFYnIU4QWwaBEZeajSsTRLW1lZ+/JX/5iu+rVhA0lVSvl5F65IHvk6fPq1mQX+Cf+CVn/Q7X/R5X/I/QfJ5qqP1ttOsYCIy8o9qRkZBkbgiewZ4tIyz2xl33HEnJqMVrK+ug7SFZLNuy0pQYXMckz5zZOkNZctNt7C8V7UbWuF8S1QAeQGrizNPpMgnDqznerq+fX310vGPSfaZDFHf3w7pYYNJbRWrVqpbD3Hvjl4gjOoAnKoyOjkwwJV8K6PE1QR1zwpmEKvMPbWtqDZQEYn14RDBDkvRZDpHYYyz5xW3nX4H3vHOe9EsXYsMQowjLC1PMGoCIgPNKCAwITBjFCMCs8YAObCyFA6uyl1rq+2XbX3P827Z2NgIZ85s6NUYlFd1xhxeN920GU+f3kqvvuW/PvEjd7T/cd4tP+vidI4kKWftQs4NJAcodciaIRLANDH2uos85XQWT3vyKj7lE6/D+ipB0gycXQC6yjO6mHExN1J2RE+69GV1gLxUxzAM0DyDPrLYAgzs+oaLIqn6s4v7w/q4A0euy/V8DzBI69XqL/ESHYhooXfq2ru/pMs+Lnsp6/tRbiHKYBkBleguZiCkALANkTEEK7jjQxfwlj86g4/cvYNm5TA0E0ajiNFk2XeTpu43jowQrH1omiaPGg2HDjQYcft71z569ev/f9/wnA+UVudqvqcfFoE57DtVNXzP5qkXnb9w/pVtHh/cnoqIRhARZ+mQJCNrAFHjaB8CmoOgoOh2PoRrDgCf/ElPwBMfdwRN2kHQmQlN+V1b9WN8neI51Ps1A64z9Xo9xDTQVx0u5lEVEXoX7OH21jNy4TtqGcz0Oq3lY5fzTy0BRcBl2CW9J0n/XHpT3Pr58rHL/ISiWE9MFQRRz67ymJRA1LjauvtcUqqVAzFjZ5fx53/5QfzZOz6MaRqDm2Vkhdk/jEfgaD1/DIRIAU0zRkDUEEmWVmKYxIvbBw/E79n6zPf8FD1rK22cPBlOHb+6g/JhFZh7+84f+ZFbn/She/Ajkg9+2fZuhzbPc85ESpGTqIHT1ctcXkJKDJaMbj4D6y6e/sRr8CmfcC2OHAwgmiNLAhMQg2nR9jc63DWs14PVgaFswYxKWchTfyP3KxOtdKsFgx0VKyd9UqpDG7o9pOi+HO0zWuF+VhZ/2ZvWfatWJkfvn9L7kMLNfMzkqQexV/oZ+gBnojo95hLciD70tZJVNflYKaKTiPd9aIo/ffsZfOSj24iTI8gyAhFjeWWC8WiCQA04ZFDIiKxoImsTRnkcluP6egDRfb996GD8ju/9rq87s/f93w/MK/A5bW5uhq2trQQA/+b7/+uXnz+3/Yo286fOZozZjFOnykLKWRKydkgCSMcgjRBtkHIL6S7i8AHF059yHZ7yhANYXV8CawfkKQjZArROXUMtRUvZmsUsEYbCyP3YUha0V+sAaCCw3Me1Lx2oB9JXQ1fPQuXzC2JXtVxFD7r3PrOWv30zu+Bf0g+HuGb1UlqXMppALppdHqlA6/r0ymB0qTPwpPet867BnXddxLvffSfedcdFpJQR4hhKwcSrJxM0HBAbU0do4hgxNsqEvDTWeHitAfH8w6sryy9/5b/5il/wgIxbW1sZ/xut1/cD8+81e55QgPR973vf5CdvffPX7e7OX6JYf/LuTDBvu5RUOYlwKpNUJaTM6ITQjEYgnUO6KY6sdXj846/H4x59DQ4dmKAJCchTpNyBqxhcgaOJ28eV9QBMpHbPYmNIQM46UKnbY99eIHXMZtmg0IU+8ZLyVcy4p2i1Cg1Su+Ngh1lxuLbotWUHFu3eD5Z1Z3XTxrAepkEWp4rysbI1Qihi1iru+OA9+Ov33IWPfnQXbddARyu2M1XC0mSM8aRB44MdZgU3WRtezuM4jmsrYzBduGd1Ca978hMnP/GCF3z1RwClzc0T9HDJko+IwKy956Dn+Lmf+7kjf/aO9pu3d3a/LsQDH7e9o5jPg7QQCDJJSpQE6DBCzmwatkzIqYPmXawtAY+5dgVPeMwhXHfdQTRjBiiDZGb289qXfVxoUqC6i+x7vQHoHWIc4WJsNNSCHfSY/T5xbzlLC++mOIC/oGy84BzsINl1dveAEGrG1Yp9HfJLhu5ddaWCISWtoJi4HjAzKHa2Ez7wgfN41199GB+9fwcal8HNCjpRMDosTZaNR8nBoXVQiqSRgyzHJi6tNgg4v7064f/3uscc/MHv+Jbj7xtkyfRwvW8f9oHpNxhtbp6o5e2v/uqvrt32Pz/6/NlO+/yUmk+e5WXM2oSUJXcJlISoU1N0VU0gmZhKnyZo2kHDLdYPBFx7dAXXXXcIRw4vY3kyQgji5OMMEgEpu95Mdkhb8BXJHsVzt/HrHZLVdIwApJzqO1X6QSIrle3+j4vB7gTKXuTYsnEILlmi4rtRx626flDJfAz2XjJ4Vs91mEMYOoCxvR5CADcW8MEkQC/s7OLOO+/BBz+yi7vuOoez5zsojcCTCQCGEKEJAUsNITYTRIpoaCwcVYkkjCZjrI2BsV68b7y2cvLaR8mPvPzbnv/+EpAnTpzIV+saZD8wLxeeqnTiRB+gzMB3fNdPPHd7p3nJ7rT7xCTN+nxOmCVCRkxtAmcF5ZwpZwVTY+sVKCBz5G4K1g4rq4JD60u45vp1HDu6jgOrY0yaYMAEycY7XLDc80xEg10mMFiXKMLQgxOLaKMCjbPs6DZ1lRJmB4Ahh0yYqkx+iQjKvcQIB6rWeL3lrMtOuocgsXE9yXNnzmbIFMLYNJYQ0KUG99+/jY/eez8+8tF78dF7trG7I0g6wniyDIQx5ikj5RajJmAyahBDQMMT4YY0aqDlSeSlJYDzRY0j+qsDa8u/9KRr7nvti77jO+4uU/eTJzfk4R6Qj8jAHGbQmzZPhNODUuiVr/zpp9x7bv71093uubNZeCLRwThrI+YzxUWxflRVqctKUDKybwgWXGmKrt1FztsYNwmH1ka49pp1XHP4AA4fXceBtWU0McJwb50x8nMGD9QDiHoAANe+jqpAWFFMGA5sLNgzODBSSp6dvS8Ut0nQAOkTYgUQiK95GBnFL7cWvuRwPyoNNCFGy4qqEfMkuHD+Iu49dwH33ncB99+9jbPndjBvM5THCGEFMUyQeWpgfB2BqMG4aTRE1qWmUQ6gyTjwaMyYxITI0/cfWB+fnozkP/zQ93/TW0pmfqQF5CM8MPfuPzekzByZge9+2a3/8P6L7Re3bf6KtpWPn9M6dqfAbpuxM0fqElEmpYzEFAhBjX4ETUBK0DyDdFOQJIzGgoMHGxw+eAhHjx7CkcOrWF2eYDRijGMAcYJKawRrKW7JuQ5XxDCFtScFSeVCWkYdmL7WiS71DtpkLJnAA55l5Po1AWKizMSWaes6h5GE0CXBzu4UO7tznDu/jXvuPouz57Zx8eIOducRxBM0YQIK0UvcgK6zrMwRaGIjQNAmRl1qmjiZREwawtKygPnce5eXxm/nJvz88557zRs/8zOPT4fvyyMxIPcD8zJT3Ntvv51OnTpVl9MhEF7ykh//zJ0p//PZ7vyf7874cW1eu/b+HcbOLGGWOheH6yBCIB6B1DVnOACUoXkO7bYhksDIGI0ISxPG8jhgfX0d6+sjLC0zlpZXsLq8hPGI0dgQxMDaTh8cqhYUPJAtYkfW+3FRTbD+sIARmHUgB2IZUApEVg3o37Ud2gS084TptMW5CzvY2dnBxe1d7E5n2N7exbQVdBmARoS4hNiMAApVKFrU5DwCG42LGQiImIwjJhPF6oQQeDqbLMlfrayM39rE8S//q+c96s3PfOZzdhffgxvpakft7Afm/9YgvfQG+U8/9TuPfctfvO8Td2bz59x/Yf7PZu3k46ZzYJaSrTUoAgjoJBszgwWMiIjGPHZMbw9wXR6IgCFGKyPBeNxgPAoYjQhNw2hGEZMYMB41Rm0KjFEI7gqN2hVWrmNd2cAxtuImRRltl9BlM3mdzxLauU2Sd2ctptMZRAmpA0QD2uQiZ8ymMhdMZjIroBLh4qFAnoO0X8+w980xAE0grK0Ixk1654H18VuYml9/8hOOvu/Eia/5ywV1zc1N3rDXWh5Oe8j9wPw/UOoCwLDc9bJy9LIf+LWf+cM/eMfzP/jBHV1eXSIO0RTHYepz1rgFkE7ccFPcYQou38/gvpP0LJh9iluGO8kMZwFjqaiYxZwWly0d7ERNCiSrQMRkSNg5np0IVMgD2m3T2cn8ZArlTAEqDNFs4mMYkq/t8YNjh0UygjA4+C4UxmQJJDKKwk9+2uP+5jM+86nP/9df91n/I+e9r+lGADYueU33r/3A/FtfBSgPAC/9rn/3Ge/48w9/1x0f2v2nF3bSksYJxSYguO+Gqd6a2Q4xQ6MYm4MADrGK3VDg4uJqN30MlSwdOKKazrMgUE+f4sBgdcdr7V2pzT+pBxKoCli0WtazqwtkyQYkB5m9fdnFkFYx7GKnHnwSnLMYq4MUWRPIMcEcACGTBBk3S0DKUJmjCSLXHpr8z+sftfQz//E/vvyXcha88IW3Ntdf/5H8cAQE7Afm/4WydmtrSwHo9333f3rs/zrzkW+8//zOSy6cn4+nczELgFB0TEO14EvZMKnmXJyrHEe1WPcgLSCAYu1XTV9dH5XKvtIDpKxZChzQZHV7NE4dChUKGvX6uMCgXy07Sxciq7qxwMC6wfRpy+OS8ysDEWJgxBjRjGxXa5bywcS+sqDrEiZhjLWDEeOl6W8+8fHLP3LLa/7Nm/uB234fuR+Yf6eJ7fGsqvRVz3vFvzh/nn5ot1167NkLM2SlLIpQ0C4xRsQYTd1uYMGeUnIgOVfFdA5s+FzRge4PKkm6h9sR2B21qxv0njctDyB3ZRvJ2me+5GRtksIqkepIXY1uixBzsT4vYlouJ2lldwAFRiRyN2b7w8EysQ194GZNQOoSoCqRoasr43Do4BgrK3jVo68NP/vqV7/i3djcZD1xQh+pU9f9wPw7BuU3fdOPPfb+2fi158/N/vnFix3mKaSUc2glkxbtVKipgIfQS0n6+kJFzAjXl5RZfD8I2HAGClZ3tXYr+6KoZ7hU6SFzHnwE7elVagAFRdqjwtdr2JreilYOZ1m9iOYFbSpXKXLJjl63ijxLBraOmJn8ILLnG4IisP095QQoMJ916GQXI56gCat5NBrRkUNLvH4gXTx8lF/50z/+0h8bVCT7pe1+YD74papEdJyBU/kl3/ozn/3h+/LPnWuXn7C9Pe3mbRezgCQnCAk0lxVEMuB1CB5QpgBXWBhS9FiLrEaRvySqagmXvDGON80iFvAeWIa7lYH+suu1lglLzby5CkwXdQNSdREucURRr0ekWiwnHLbHobp1MwcEZ4+Yc5ZpyZbnTKT2jMnWL23boesSsmQwRTCPECJjaTRO6+sUj11/CMuj8J+vWb/3O37oh15x38bGRhiuqfav/cC8XD8pAPAN3/q6Exd2JpvnLwIXptOcsgRVRU4dxINAhX1VkBA4WGCSunRHcMtAcW9cqrKQboXdK6eXQ0F0Aeze6/uU/aRhX838Vl2Z3XaWKbUDvqcFYRGarurtyL2tAUzAmVFU4qUX4VIdEKwVIdoEFyJogq1tAgfnagZ3aS62CYTZbI6uSyYBKgIOhNgwxqMxJk2jS8srcvTo0XBwffbew+uTr/qh7/uXf3zy5Mlw/Ph+37kfmA9Quv7b/3Dy8HveOX3t+d2lL7/vAkubFCrbnLoEUYYMApMomg8IZ4TY1BeUiM3ub2BxVxQBxAW2zLCnSDz2tgc9Ktb4k8RaSdJENNCF1QVbhCLkJZWTWZTetS+DHTEkkvphUrGf19KHmrm9EasNxMCuts5kH2dmxBBBroQXIg/cvgnzLmPezsy5zA8GDgExRozHE4zHYywvLaVjhw/Fg2uYri6nf/Ojr3r+v71pczO+6REAUN8PzIecKW+LW1vPSpub//m6+2Zr/+3CdPyZd5+dZpHAKSUSnUKS7wa7ZCBvSVA15W/noZjdG9jFjKkKMiv3ujqateoGFUkPxtATBIseJBgot5MOgtY+nh1sXtQIsrNRio9KDUznihZlg5yT19XONHE0EZlCF8DeY6oZwKrD+pqmgZIB4psQQLD+0jxLgZwJs65DSp0Nu5IfYogIMWA0jgacGI2xsrQiBw8u83XXrmHc7J74kVd+7dZ+37kfmACAmzY34+mtrfRdm6996sXdw//vxdn6p5zbmXddnjfdfAoioO0UKuaOZY5ayZb9ZBbnDWC7S19xFE+RUiI6rs77OFQTIpTBTFWeM6U9Y4do3ScSkd/gWq36zGjWHMekDoXE95LqCni5yoGIZ0Po0JrBLBgMHpQhMBAEqf3Kityrpms2ZI/3lESMJlAFP1CAiWuLoMsZXdtCW0Kbs/uRCGJjwRkoYDIaY2l1jMnSsh5aXZHrj66HtZX21KHHjl74bc9/7rmrTaB5PzD/PstXJ1G/7Pv/+6fvXGh/aXs+eeL57ZwETew6gaTWbA18FZjdBMhkIrMPe4BABghQUDXKMZaIc58HpWfx+oCqL/l70S7JyaayQw2eKvjsVgxYdBLLajZ+5JIlQC/sVewAsWBYNDAGcvNZydnxN6bNQ2rjK0EGs+swsPXJTPa5YE8a7M+z2CeoKjoRTOdztK2ZNokZqCCEgMgBTIzYRIwnDSaTEVZXl7G2vJwf96hjYXlp9w8ee+3Sl33913/BPY/k4AyP1KC86abN+Fs/9uL8yle97pMuXFj67Xm3/JiLO20SGsckrkbnfaEW9oZTsTyNGFqHA5gCuIkAGYCbfIZJ7JxL4grBMz4mL5gIFbGcoi5OdV3h/x9MarmYGBEZvI9jzWqmzmdLD2Yb0BRDISK2x+JetYCZFx47BhffCj5h9ufNgdx/suj6MCj4c6IiBcK9t4kfCskV2GWoID/oed2Fz0nkDc9nqVtdWfm4ebvz2c//V885+a3f+g/mm5vg06dPP+J6zkdkxiyDnpd+93950kzC78/nRx53cbtLnXLMYLSpRZnAkgLJzWcBBwyo1hvV/h6NViU0mLEOxbrQrzlQ7Avk0vVIVWIfDHjQWxsUpb3iDWKPzW7lVzw+3cK+Zmjt5TH3ZMzh71A8V3r0UCmBXQGBiraRGuAwGIOEA4GtJQUxI+eEThRd12E6a5GKjZ8HZCn1QwyITBiNI8bjMVZW1rA6WcaBlaZ7/GOPNZPR/NTnfc51z3vmM5+Z/CB5RAVnfKQG5be94tcfPU3hDdO89LjdueRE45hyhpAOpp/uteHBlHNakKbkgpAB26S16fmM/SAn1yyiaq7KogKKoWaQQFTLUSt/7XF5MAgSEQt+OGVLpIB1PEkqSA3iFxpxWGCCaja9H7LBjsKCTUVqhitXzr3CQs7qtumhh/lBED0La+/TUC3f1fG4zAaS4BBA2cpYctFsVXtMFXND61jBnDHdnSJyg4a5+eCd59Ojrj248btv/BCr6leeOHFCH2nB+YgqZTc3N/mWW14sP/IjJ6/bnk3e0Mqjnnph2qZOcxRy/dfsWUcyFMGsDLSDqtneFUwrlBBDgxhHJvkfolm/lxI22N+ZuMLaiq0dVXEscgcDqiVsoXARaV2RUIHMeY1DLknC3MP0inpBlbODldD2WG6Nx4tcDhPtChVdZOWoq7N7uR3CwJgW7AtLGGzP+84Qo69mqQInshhmVqplYRjoBcH3r6FwauqAiZjBMXBKKU2W1z/hLX/0jsdsfs83/vcbb7wxnDp1ar/HfLhdqkr33HMPf9Zznr/2kbv0jXO9/hPP7cxzBmIxB8ruHaLV31EhSlApu0tCcURnZsSmsYCJxlu0G73vE9G3j74uIadaUS+c7MuSYX9mwetBwoyiJV16S3V1g2JLUrIRXJmd3GWLaz9bJEfc7azXGDGgQK/0NTg4PNAGa5zaRzr1K7JhhIs5PAebUhe7+5QNBFFkPM39i3tkFAEKRnBxMNFspbE9PmeltLpy4Bmf+3nPjd/0wi9/4+amxtOnHxlrlEdMYN5++41ha+t4vvGTv+Z1rT768+6/OE9CKaacQCG4UU9RjXPUjJphLcP6NNF+gR+aiCaOHNxt3weimhmrUp0HgMKCtiBkmHtLvzIUqu59xCZbWd2r0Wu8sgf4ANAeOJS80wtEe5BlVScwh7piCRTrgKgKuDMtDqT2TCCK/CURm6U6LJsG7p8rs2V/VevFu5RqH9x7R3Pd4TIDITYOuqAF5U7DAgaSRGlt9eCzPv/ZX3bfd7/iaX+0uXlbPH3652Q/MB8WJext8ZZbvii/9Ht/5fuSXP/is9tInc6jorMBSyYrWSUMnJet35Scqht0HZaoInCD8WQJpRkMIXjZWkYnXEHffZno2YJ66z0rQT3DhVDvySKaVR6PA1dPlJLB6uDGRZr3Zjo7GIJb56HPjG5/UBE/NFBRp2HJDQcPcPXqLMwTlM8RgUkdkOC9J6y/TSm5S7TU0kEHUu0cqZbWoT5pgzNa+awEKBM3Ghv63C/64q95wyu+6/M+uLFxMtx++yndD8yrPCi3tp6VvveH/9vzMl3z42e3Nc0g0RbwDEgwzqMmCIz9r54hTTEAyLmtONcsCSpAHDWI47FhRTnWLMMcHe5GoOCZQrkCzq2H47resDWGlZ9KpRRlz7AuJ+kHQiE616ymBGW3PfDHNgSQ9r2iz3RrLex4Xq1BiNqPMrvqH4mBCMB9sNdVT5k4e8nMg17aJ9WigpwzutSZNX12mB8FZ8aUwI/18GHWajSkkJpFY1ACZQ3jtWYUx8/+oi977i+/+oefe/7hvkbhh/sEdmvrWekHfvh3b9qdrt1y4aLktlO7ZbUAuHMPkdPh6kArX1KVkZxLaQtzAYVQM4YsrETQZxwd9JNg0KCds+nlgN6F3m6gL4EtG3MIhjLyAAL3WZZ8pwp3u2YOEDKUElHsS1UPpAAgIiASIxSzoeLsXHpJCs4KuVxPXErxUDN4GRpZmS11hyoZ9ppJb7tQ+nDiUOdZqoqUxV2lBW0StG3CvM3YmbaYTju+eH47z+fhcdPt+F/s5T7xsF73hYdvptzkW275Zr311k+//q6zo9/Z7Q4cnc4JGsbcpq6CB9h3bNldsEQEWQ3ypioGhZNUmfkp2y5xeXUFwQc+HLhmuv7mM3lIywI0uLmx4AJNPDT4GWi/+hS0DHLKBBcDVzAqpfGwLxuUpFUaxPvb8rvVw8Dt18kDu1DQCohhb0AWu4cC+St9Z2B42T7okSVjPptjPm8hKja9hnNRnY9qYAzqp7LM/trXpalNtClC0XBOmg4fOPj4P/qjM0uvePlT3vBw7jcfthnzxhtvJID0jrv1tS0devTFmaRWmducKjJFndGcnfVR1ARMhkfraZ+SneRdl9DO57Y24VgDoPpVSj/Y4UHGI59GqpaMV/Z6/TokcDB5jjJFLTtUDSA0ILW/QyOYGjA1II0+ZfUMR9EfO3iQWs9HvhAdHg7qquvVjo/I9Io41vWNGe+6CLT3yIUtMuw164EArQFaelBVQeo6dF3n024emLBo7b21zHYL0Vzs9Z63Cdu7U2zv7GLW5njX3RcTwsGXvfo1v/uCra1npSKWth+YV0kJe/z48fyyH/zNb29x7Red2+5SIo1CAkGqanUAIzkBWb0vKlkzpQ7qygO5E+QuI6WE+XxufEsOg2mm6feUm1VV6xqjavkEL0lhf8j5jCWwe0A5A8IIFHsrPC1rhjIwCj6B5X5fWa3yuO4/4VPZPCiR4eUuewlua5ngfWOptYNnUuufuf4c+96ygyUfWA2WKpXrGYNLrWRFN+/Qda2XtDJwrHYyuf9uWjxT3Eo+a0abOszbFm3b4vzuNs7v7IT7z82zyOjHXve633jiqVMbsrmpvB+YV3wJq3zq1Ia8/Ad+5+mpWztxYRZyJxqKtg1D3X7A33wMAOowtodKdrsAcbEqC1YRRTtPNpSIwUWsqC+92DCktU8MVJf+7MFjXzYIHvT7zpp8UfClPQaVHUlToICWjMkyt9IC8KAi6QePr2wA+4qd9UmyBZ/hfUuQ9pPiUPtbX8wghLDQLxrHFDWo2G0jyOVHmqZB17VoZ4Wf2S2Wx4NhViWIU8HbAlkIKQtm7RzT2RSztqUL27to8+TA/RdGv/Bwlb98mAWmkg0FSFOXf7ZL16xNEyCBSbNaBhQAEpATkJNC3bujLMVFe20cVXVOoaBLGW3boW1bjCcTz5CN90aWfbJafyo0MOkpwAHX96mGPj7NLHA/dpPb0khWu/jCBPE1DVSHFpq++eg9L3vqWXmHGeRrGBHXKKgl7SDTspev2g937PUYBgxBMlnJXjItFZACFvrmAoqPTYSKYj6bIiVboaTcGSUN0pfWMsAYgwzYoQGa2V7/tsV8NsXuvMXuvAv33L+dwAc/89Wv+a2Xbm2RbG7e9rCClz6s6vONjRvDLbe8WF7+A7//g5kOf9W57ZQ61YjsmVDFAAQw9yuBrT+yCKBigGsRV7NLyF0yiYwuo513mM9m6FKHxz/hCWhGI5tMhND7fmCwnAcQhzA69KACDIY7Q+/KPpidyTGga9X9qPbi0EV6hHlAE6tDHannbn9MDN74gQRmP9rpQ6OCHwpjZpDVuUyCIb2yAQ1hgW64mzNm8xZtO8fOzi5iHCHGBiEENDHWPt3KV/vJgbjqC1VyuVqvzL4aCkSIkQnEujRa/pznPPf5t33nS296/8Npv8kPn6A0cPrWv/2tmxIdfvmFnZiFdgK0A8SxJ2TOVyIZ9p8gKQ1G+r4+kQxNGZoEmhTSZWhWzKYtVtfWsbK2NtjVy8CJGbW8tX1cb25XgN4lu0BLf+rKejCAe+1dAVAIC5bwIKrq6UxlGkoehFqjy2QpfQeJMkjqx71Fj9Z0Z311QWWG4/IhxK7IYIEYyFXjSb2y7RUWijMYMdefa0LVEU0zwmSyBCih61rkrEAmaFJoErcUrM/Y977+G6tAxGwbcg5oW6CbZ8zaFrN2Thd3ppjOxk031589efJtB2644YxqYajvB+YVUMD6m/G2t72t2Z3jJ6fzrG1OUB1Z0nEZR1SYmzP9sxvMll4pW4bUSq+iOpVt2xbztsWxY9eCY6hTSq6nugegu29x2YkO7DiKYW3Zc/q0ZrG/cuRRzsYA6feg8H8vZlcDQiiGZtUVuF5he9y3nvXQ6HmSLr1VVx11OeNg3HIoFPB+KaVDcI4nQk9Ro8GahRlNEzEajTAajzCbz5GTAQ9MDb5XkK+rGCcTgM0LhhwbrFAjrWdB2yVMd+aYTzs+d/FcQlh60l13n93a2tqSU6dOPSzu6YdFKXv77TeGU6eO56OP/+IfSnz9c89eTDkrR3ELAPIMkbP0XMYsgz/Z1O/E/+3rkZwSunmLrsuYzWcITcCTn/a0QR/lARliVSUo/w8LO0VUTqUWTVgvy1R6gechd3NvedkHhvbZuhScZWp66XeZ4FcNfK3ABNVFW/kSiCUwRakOrXoIIQYqDK7SwIxAZnJEA9UFclnNlBLarkXKgu3tbTRxZBIjIRorhwqjpZTxjhkWqyZq5VGephr9LHBjJPUIEhJZWl7+tC/90n/1xq/72i+44+FQ0l71p4tNYY/nH/ixX3t6lsMvuv98kAQOmRSSCazkULsEQCBqw4csCQIjLotnHXO4Ew/KjK7tkJNJiUxnUxy77nqMJxNfkg+QNdoPacj7wYXsWK3SadA36eLCn/ZUYIM94jBos69VVE1XiKlfXxiYwTs07d2hhaxkrT2nOtichmMzrhNbNQA5pGbr4JNfqoOkoo9bGC627yyAe9vBKgykHmKDydIErIT5bGbVie+RDf7Y08yoABD8QDCYog/iVJFE0WVg3mZMZy125rt0cXeGadvwzhQ/aG3Nfil7BWTLU6SqdHHGP5X5yMq0Vc1CZLo82g9bRJA1IYk5OoMEqglZuhpEUmB3Di7Ioui6jPl8BiLC0WPHIK6TylQMgAa9pJe2KrJgKKc1G/VImjKF5DAEpi+WtKW/owX6FQ2yI9XArZNVYGHAFBAQtAySBpmpsF5KJvaBTq0sYKRnLeUwD4EELmnCPROn7EdLZiaCqbWPGozGE8TYYLK0grbr0DrYoFQX0feo6mUyseOMmfsptZOrxQ+redth1s4wbVvszttw733nM4e1z37NT7z+hcePH88nT17dwIOrOjA3TtrA5xU//BtfKfG6z7nv/HZipv5It1xZg019v6CKBZQPtD/Bk4jjYgWpM0mR6WyGtbU1HDh40B21in1kP1Fl6vvKipW9JKBcWNnLwTKo2ZtFL+mhUYjE2oPJh+iiwYCoX1l4r+hZtYcnhFo6DiGBxTmsgOGr4HNBImn5eT3XtGrY0iDLlw8x15I3NgY2WF5dQU4JubOpd+pS75+CvoKoukqLvDMQB4gCKSk6FcxTwnzWYj5PaDuh8xemmmX8gz//83/0ccePb8jVPAi6egNTlW44s6G/9VuvGXe6dGJnOtIuJ1ZOIEne71jg5awmOanl332wlk6t0JQ6/3/O1huJCLrU4eh11yE0wdUKbHdZCMtUJUb6CSYNytthKbo3K/ZWBb2K+jCQa57TXgKz7EWH/ehekPneUtnI1jTIuIuB369feEHxrqJ5pO9nrQeUwdpncLhBS4NQ10cxmK/LeDxGjBGz+cxYJ27HkHIGw6uN0kMTO2LJf5eqT2Q7ThHCvDXIXpontNOWt3fnEkYHjtx7fvcnAdKreRB01f7iG8dP8dYWyZv/4ik/rHzt03bnSZSYU9fWrGgasNlOd8CA6C4/mV0WQMTlG4Ugvh5REbQzO81nMytjrzl6FJKddCxAw67nSr12ung2TW7MQ56NC5OkeJlUqz3tEUE1kLAY0D3oQRcCtvaDBedKl2bpYRYu4PPqAajszaep+gFcy1DL6Fy/x1BHscpokq9YCgRRFFAv7WuS8kogMFf/kyY2mEwmmE93kZM5apPbFppG7iDrqzilevEg618jgSiQE6FtM2Zdi/l8Gu6+71wWXv/8W2/9k8+/mkvaqzIwNzc3+eSpDfnBn/jNp4qsv/DiRZEkyorBNLQMOXw/qe6+NaQglaGPrSYUJG7kmm1qm7uE+bzF+sGDWFlZ6elaRAbV88dEmayWlQQXyBxfInhVyll2tM+w1B0OgYzDiEo8DswL09tS2tZDYRjMJZPyANnjfVrtT/Vy09xLa+gCtSt9MVXs4MLq1Ca0wd3HSv9MRekgYjwZgQNjeXkZYKBLLSTlWhJYYJapdn9zEmR4ygwqhuzVjGDeJcxzh2k3x6xt0eVA7Wz7Vbdt3hbPnNlQ4Ooraa/KwLz9xhNEIL14Yenl4KNLXZtMfq3su2SoNi61f8xZXI6x72myG7zasKfsyVr7uwrado4jR48iNo2tHlwfVqk3oUWhc6HX2jFoKS2uGQaZsfSXe2Usa2YsNCrpM/sl4s17h0TApdNd9NKY6lmprntwqeEtBoJhvZOKE8cxgAO64l5fHptsZhEeGzya+4c2IGaMJmPE0KBrjQ6WZQjuGPA10ZfyOnxNfOItnqlTFnRdRjfvistYOH/hbMZo9ZPedR2eb3C9E2E/MP9PrEeOQzZ/7A1PTbK+ce5CFiFi1bzollWABE54ltSb9thp6+auopX8XHpPw3Rm5M58QA4fOVxZEAU/W4ADzDQgIw9Et/YESD/UGN7YunCA1AfZO/QZ9JSgy/WHl/n4cBBUJsHQPV8jl+w9h/+murYZCESXibK/luQlveF7Y6XTFeA/BapwvhgiYjAd2dl0iradW7UyWAmVaXqpcoa/u02KhyLYdlDM24zp3HRsd2ctuix0YQrdTfyKW289ecDOu6sra/LVly1PEUA6m8v3SFxfmadWRYRSNiaCiinZJVFkcTC0oO+rHM2Tc7LBi0j1+MjZhj7q/pLT2Q5WV1extn6gLup7Fselg5yaCRe4nQNbvT090xDwPUT4DIcde6esw7JuqNRulLX+UBqWx7W8Hf6ulZGtlxusWQ83lK+mXokPAxdrkf65dSL+mMbbLCyREtRN04BDwNLKElQEqW1dF0j89c+D6XUP3teqh9SfgKbfa2VzFkFKatPaVtDOWj63vSuhueYJs3Toa7e2tuTEiTeF/cD835otj+dX/fTvfJLyylef390VhByypDrWV1/Ci6DKfpRBi1ZrdT+ZPWsWlE+RuEipswHQfI7Dhw+haeLiHpLNBIEHGM8H2HQsZKmK/vEpZ88cGQTvnmDeu25ZCKwytR3YE9AQIbQne+4doFTAg8piDi7ghuFHBysR8kxZ1d2dT1os5EXUtZC4inzZv20YNB5NwMSYz1tDXHVpcYJNg9fO2+ACXijrreqy7XQ0UUabgFmbMG8FXZfo3MWZdmn80l/4hd9aB950VWXNqyowb7/9FAHA7tnVbxE+GrrcqeSMgFidsnpPyr48tFPVe0nJVTKyZk7JPSZUBFkUrZ/k1xy9ZrFM1MV9I7szVh02DYKgloPiAyJ1o648+PsAf96rvC9OaEvmE88ozL1AF+0J5oUMq3pJqbqQlQeBTYN6vO/zgB4L1wtyFVu/KntSsje4X6/oYKVDoQIOFIpREzFZXsJ8PnMdpVyFtm0OYKB+VSeOD/8U5T8pfTFDXL82Zx8GzTu07ZR3p1NtRkced25n6asNR3v13O98VWXLU8fzLa/+jSdqHn/1he2kicAqDNIRVLPZDPjNVHpBVLtzD1zvISWLq4V7X5kT2nlbH6ObzzEeNThw4ACQ5TJrDM/A3hMVhbpinaDDxnNP98YDxn7JqfUmjvGSUrmWohUOJws9plwmOw7lNntgOfemRN4fc7U3wCXrGhqUu6VvBC7dz1bxMt9hDj+3sL8tAtHEmEwmNlVtOwvGgmN2QnrpW0sbQuA65a1VihT+KiN1pjRh8i8tuvkUqUvY3plr1+XvPHnyttWNjaun17xqAvPGGy3mPtItvawdrU3athPuiFQ7dLILcp4ehogez5YgcoKwTQ1rCdslWDtJhvLJRvcSEczmMyyvH0RcXrFF93AIowP4myoyuNZ60fecKFNUoChKGf8TUtUEsCAhicHQanGntwA4GGTEUkqWQK9IHC2IH+NMiqRLekkhqb6Vqsk9L/sdCGnPhyzjWc2AJPEhlu1BSaWubhb76j03misjBA6gEBFHSyARpNQidXNo7iCJYHY6bqzEADiDWAEqLt4urI0e5G49Z0BSRdcJ5pmQUkDXzfnC/LxgdM0T7j43+Qoi0qul1+SrI1tu8vHjkB+69dceN5vr889v76qoBBV7Q4T2uFZBBmoA2rsru8KAFm8S9UW1SJUOsWwjSF2Lw9dcA4ommKzDoYeDFcjlN4YZZ+80tKJ7tHJL7Oer9PYGw3LVByg02EPuLY+HCnZDoDsNejNaUGQf/m7wXq+sUGTP1+xZsRRkUlFKcNBBpaKp9IuNQeyLI43MIgEuZcJGmSNCHI0RQkQ372qbUWwS6trHh3UVNjgYOtVqofS2MK/QpIqUMzqnh3VdRtuKpq79xttuuy0Cb5L9wPx7u25mgHR2/9JXxnDdaN4lEcpQRIgrxVXGQu31xAMCtY+BuLxGWZU4EbeUtmVl0qUWWRQHDhyooILqX+A3jTDQOfqk3Ct0mWFNuan7oUu/8Dd/FFns/6jvdR9oL1mDf8/HFoZMfpOjlvZusUf9YcTU94wYwPB0kLV7puaeElWsbM1l7TMAuEv9OnGNINTnUuRImiZisjRGaluIKLp2jpw789OsO9vBZBq9VCcNvFeGintmg2jgg1k7x7Rt0SWE3e0pQPHT3v3u9ClbW1uieuWLd10NgUnAm+RHf/T1K/P5+Pnbs4AsSorW9HoELheiC8OXEoDlxBdVpJyqD6T4mqTrOsfN5po523mLcYxYXl11ucZFfGrn2ZUpPiBwpg+ewQ6x/H6ilwW4Y++oZs/XFBI1DUp2fpCVzdDDZBhePZhf6/pH3VNzEXPLfXlblRHgpvK+Zx3o1JJrH4mI57BQZUNU+76RuIEqMFlaQZaEtt1FVrOiMJqd+khYDS4oXIEcZYisasgpQkAh89ghLOiSok02COrajLaTzLyGNtO/AIATJ960H5h/12tj4yRvbW3JPM8+UcPKx+/OswrAyUHpJuSUe1GnuoqQwSKfIRho5Uiv/m0CXYKcysrE1iSTyQSTpaUKtF5cVfQjzUIIrlPOPSBzHdoT0KW94kLfNyQaEy0McIa9ZQ1SXMpIGZbS/Vqk2Pk4X9Q4JotZlnCJCjxJ7iuFbNYLvQD14h5XxMWxAX+9qe/xtV/p8GCgNBqPQSoGz8vZDXcHpr2KhUlxVXQIwYnmA91cL5fFEV5ZgS4DXdth3ia+OO3QpdEX33bbbZOtrWelKx2md8UH5g03HCUAON+Nnpd4IkLkMqmNj9e7vo+sZaFW3Zlc3aAVSTIkZaTcQXMGZysZS1lbuIXdfI71AwfA0cswGZSwPuEFoTqAXYqoWUT1FHTL3l2+7pmmDstYHQDXh2uUcoPWYH5A5kpfTuoAtTTcVQ7B9IWuuVjKasELOGBenLjcW9mWiXc5ecjZNnuHV1pSbOAq3NWMGsSmQTfvkNIckjtDYeXB99LewTZXiRMoDw5EVGV5hztDs0DaDpJb3t7ZVY1rT3733zSfDQAnT17ZzJMrPDCVtraelW699cPLKitfMmtbztJxyhHQkU0kVb2ccXlIkR4WVsbpmk3fx+9YFdQsqVmqloy6M5WmhPUDBxZgaFADthc9H5O+oBrQwz4KhD2B0AdfZe7roqQIDaYvuidQFwY9OS/8vGpNsHdA5MGIveuP8nnpNYX2TJWwKFEyeG5ctJF61zMpvWhh0OQekpd1QGGrpehgKBWsHM3drII+uq6DOPTZJGC8fK+aQP0hWdY9gRkcbOBUlOIlK3KyQ7HrpugkZ9Gxzub0L1SVTuHKljm4ogOznGr3nD3zT8DLj523MyVWJgRoNkVzdeHmclqLar05yk2DohVbbqoiJVLKLz9yU85I7RxEwNL6GlSyCUKXbDfo4S7Fni5IFtSbj4kvCdC93MmFPrJkwT2vhTgDpvRZ5Wt08JOHk12uRGVaKJNrQCv5egk1K9m8xVYopTVIKdtrRLLwfEV7166KbS2+IwsrHwOqF5sG6ECwC4TYBKBr0XXJDx1n/fgwrpr0EpAGzBbiPUgo7QnW2d2/1VX2u9yi6+Zhe2dGbdt94W//4m+vnTpO+UreaV7RgXnmjJWx2zL+QmlWNQllIIHJmA4ZCuFsBrNC0GzlDXOo6xERe4OoTGcl1Zu3y51PELNLMALztIMYgaWlMRQdoKEvjH214RgVK+VY/KbtM6H4z7UbWC5btpYJcH/C54oZXRwEEZDE9opqYxdzmcxgXJp94V9j0in949ef69NqYYIQzANUZaBRpCDNIE1u5+cBjgCIYXNDMKcw++0ClHgw9XXPTeQqk2kDoWQZkAwqRcxQZozHE6Dr0LVzU8/zAR3QM2YML1sczXo1Pal7YAfSFzMlL5VT7jDLLVKOyB3RPF2U0IyO/s3u8rMB4EpGAl2x6tWqSkTIP/qjP79y71Q+dyZzEhW2KsqEmnIWE5xCqhjLISbmEjSLXopKMZhezyzJsxlWRisYj1c8CzmqJ5tyOLtRDpWbsdK+2A1v9dJhDl0qHcLMdcc3NMTl4RBpD0zODpDsGNTeJiEPg5n6hmsvPlbL4r5C/AQadJH+RWylPxZXPNV3pK5jfBg04E8uDpMXAfLaD3f7lSeZwiAAILVIuUVKLcajyZ4qw42S/LUqBG0uQAuR3iBJtHgT+eEHdA7wzykLeIXbbnoTgFO/d/a1DOO272fMh3qdOHHCWCS0drgTfnpqOzBHIop7Vgj2NIio2qOXYU8BUecqyuWCTwN6WBnR25veQeYzNOMlxGbs+cPXG+wgeVXrMRcyYG+BgMv0e3vXKQt9ZZWkvLQnLe7WZbhVVhi9ulz25bx6GWhmu5fXDrLAYpcGES8vCUOamV4WtVNV7DGQPxnKjmDQF7Mr5AnVYVqPa7U+sMgyiajzNIFubt4mpceWLJBkbCFyu4ZyoNl0N0CV6+eL5YQNx9ikS4KV0ikL2rZF13ZhOp1DJHzJr/3a25Zf+w3f0F2p5ewVG5h33vmoAABdt3S8aQ6xKGURkKoNa8TH6lTMZak/kY2pzwtZcfhvy7aGrdQskCSQnKBtC3RTjJbHADXmaqxpYcBT+sZiWk4udiruPt33isOJ5J5A9UDqkQlUh1YynJz6EzKgRIYiL6B47CZMgGbDBwwGRYZsEijZJDU7PiZrL7dCDk/UPChjXSfJWoChBKcdMLbScGOkAXyvBI64UDVE6iSWoQvT6+yLx4AGkcxiQbspcppDcmvsnuGuR1EdpkMB5xMQYhiIW5ukZzm4bC+qyBKMKZQSuiyYth26HB51553bT+oTwH5gPuTr+uufqgCwMwtP6mSEnLKW/WOdDpb+iYbL9QE4vPQ9RRpRygql9J8lkzJy7pDTRVA+h6WJv+EOiLHsJAvL+wAX3PIMVYNRemDBkABNe7iQBeva96U6EMHKNcMZZlTd9brvBwkL7OyBYZEsoogGQU4Q23wU4HrZMe7B7NaMOAQ1MGrPbGCJQhDIGEiG1e/XijgqWVNqya0q5u+gAHNECATKO8jd3MvZBHWU1iWroIVh2XDt1NPvFverRYxNIKI0b7UbxQM87+hLAOBRj/riKxI7e0X2mNZfUnrNa35r/UMX4rMvzKfefvVi/sRaWqHBTYrBzemlKpOjdHqVb4CQfBkuWZC8f5LuHBTnMWrKpDH0p37p5YqNpQyoWXvP3D03R69V4zvIskOsAyId9IsZQ/jbkFpZJp1MvXIdFUMhRfUTEWTEoZSk/zyT/hiAYuvPDZaN3UqiWNB7k+B8S3shrBTOVWZFstZevLcWdCMk6SfNKvZ9GJK0ixAZCRTnkNsjvpdOvpLhKh4dKPZC8sRVg3b4old53PIzizRp0krxy1moM02njwOAQ4feK/uB+be82nY66brJE5IKwETqVC0lkxdnpWJuOZgwGKvCpoF5sFP0UT5F5NzalDZlpCxu8zZH0ITHPOUGCMwmjgLhgdQ3LquerpdOX+HT1F6pvQRQn4Ft/5eRcl5weC4Hx7CElkFZXfZ8tQclA8azE5eJGVQEmR3xU3rkoYhXFbwazmvUekMtAs6gwfDIlfGy9YQcuEqBLgAcBrvRkulzVTkoJ07G0vphjBrC7mzXKpecBkD9gaBYCLVfHprwliqjag+JgCN55g4m7C5mg5Elh/lsDm7oC17/+tevPPvZz97xRHBFWSpckaXs8eOOyli65unKDVRsfCMDRy27sb3kKzYF0g8IrK2kGqxamyQb5xfZSvWhzXz3Io5es6ZPfeoT0KY5VJKpoyoNCNiLWNcKBUOvrVqnjkUXp5RZpdzmPtBpYRjUHyx7M0F9zp4yZIEYLQsHBw0GTkOhK6syuO5je5K07/0k+1cN7A68b81FL1azo52kJwmg/7zqYvnZr45Q8ctVpd5SP0QJq8ureOZnfBq020ZqO59W50s9RYsHjNKC2PYlAHsAkntJzCyClDvv7RPaLiGlfPDd796Z7O8x/xbXoX/6RAaAnRyfPVk6zJxTVhHK0h/1VLwz/KRkiuatSFZ6qZpjMhdcZbWWY3dM6Nwb07h+eX4OH//0x1MISTvHhUI65KIv4zcIo1/YV26mAJS1aqS6X7w5fxGhSHcpE5LaIKaUfQU6R+x+Ia71an3R0PHEy9dCNyvBP+BVDjN18gGPwnWNoMi+GdCCZPKPKkntUwvZWb3qUAhCUIgPwQjiA6fCl4QfYHuVCTOEgARF0uw/W6vvJ1UJkVXMplNce+3yG5ZWGGm3NaXCPDdaXOCFA4y4CJRxZdHsFT+rlDQQOsroSNAJ0LVOps4tMmPULK3cuJAI9gPzoV3TnSmLFHN2RQAGgHFnkCj8VE79G0+EEJ1Q67A6LlZRpP53F+YyNTwNEXjC44+94e577v3gqFnxpEIVIL+4edBLwD7YM5gYLvOHQ57yFdkZKvDsY5PMbDctWflbETWQinktwH3soWIt8CdFEMBVdLns90j6vgtwwLjC9Iu8zGYFWNT+uIWhUapyP3yp+kTqFQdcLe/SQRfVdpYrgKIoKUAEik5SnuPc2Y+8bv3A5J3IM0jbCobC0cxmS49i1WCemkPlQlUZVBcZRIoQqLKJVIBk03zq2i414xWedfh0ALjhRUdpPzAfyvX2t8NWJZmyDNTcyiREBkMM9DzDYV1Zy0uymy4QIUTLoGAzibXFeod2toOD63H+Dz7luu+54/0f+EiIS8jZ4UIDMvGw5+uX8v3AiXwVY6+q1kxSCt4hLI5dcUDVg9HImT2yh7QSkEUTRFP1Y5Gc/CDKA7E7//ki/jHXCHJ4IA88R5R1IcNVOlfpRQl9kKv5jFS4nupACLrX/NEq67JYhg/L2uJKJtor4ZPRXXD7mTPvvf7aw69nmpV6pxepduvEoXUDDSRSiLT2vwXxZL9z9urIAfl+IGbNmnPA7k67AgCPeve79wPzoVxnzx4SAGhodI2NuzOVgCjcSqkrkZ54rK6mZhQnBWlPqK03kTMQAjcQzRCkHNFibUXe8Y0v2PjjnHJjwlyimsv+sDeTrZlScgWCM9kAxco964/ApScq/WEegN59q0gyGOMKwB6EDhu0TJmxMJkZgLjLMIkGWjnDcrKYA6mLeIkoiMSmr57NqJbeWlDgPj0V77PLaFcX1B767LxIrC681h526Bo+jk+G0oCPGuoU+L7zO/SEx1/331aWTW9JpbcWLAfZAkAD5GX0cCos3kLYvZGrHUZCSp3tMjtrLHIHzHbbYR7YD8yPcdGpU8ezqhJHelJKnSHSpCzxtcLhyr7ShhW5ryjZRvGBGZG5Ag5KZrXekxAjgDzHmKd04EDzS0SkrAEgy1AKg+L1ezJ1VwE1/aBAfkMMvC8Vi2UuWRkokkEFv5rz4HTXusy36Wh25QEBLTyYDChQXp4BtbztB0TDJZ8BFrlMQCVVmht5L173CmTaOkqmEiilZC5KAioL2kSXw/XunVYvfFoJWYoavPbkbSUQRzCF1V/5lZ966yR2d5B2nFWFAyNEY6CEEOqzs3WO1NrbXlPpXxsxMIbk5KglewpFWaFrO2q7DEFcHe7M9wPzwZeYfor9+pKSPCmlFopMYHIlAfI1iAygb2qIllLa+X0ZAiMoEChU2FYIERQCAgdEJuXQ8Xi0u/34Rx/5Lb/rBJgh5RlUbItXMpyhvrJPnvqAUfVgKo2aZ5QyvaxKP85dJD/pi2RjeQytImKLRkJ7IXZDbO0QA3zZeqyuJrKb9AwYLQW87uiiPtDEe9/caxUU6J32iKTLla4Lqn5Mi34rypVjaa9FOawIIx6NiKg9fM3ar3CYUYyQEBgUyLGx1HvBqJMI1GYMClOZUM+OWoAZBbAvbqeQErqUHGjQIQY8HgC2tq48HaArLjDLrfHe984aIqwJASIdXWJpp4vJqSqcD6T7tU+h/T6MTIcmhgAiEQ6Blg+Mfu/Xf/01f+UJLgvmyOiQM3up7KdwtVPIAPXWfnU4ItnA7pp79A4piB0ah+QQucGqB7LHo6egdAZroSqVqQNreCuti/FQFaYqWxpHRuVkB5b9zlT3g5VYrv3P6/tMqfvAqrxXS0jxQMACOKL8/OHXFvZMVXUoVguu3kfooEhgVsQYFQAe85gn/PvJRC5y0BBi1FAGP0z+c2Wh/zbiQCGtm9pfUTGQwXOUYjufDVVkagv5evNZ2RI8oLPSfmBeetgnJc1dba+8ce8Z8wX3WTOoiweLUZZUPJNpPxgAoi30GQhxQktLSY5cs/zaMjANpIok0CQGai8ymA4Q7zPfENSgg53mkLNYBjXi+0DPnNmmhIX1ktX8JKWUq6DSOFYZFBT86mDKy8wWJv4xJoBUQOIWdiqm1IBe7kR9fws1XxElNdt77W3vC86WBwt7QCqXEgNwQq9AqAtuXDr4fUvZq8V0oUxrvT0hYjRkzfQb3vCT7zt69OAvT0aBQog5hBECRTAAVrO/ECr9rIdnzrW3ND8ad3FzKVIzi0q1tO5SIkktFGElZ7kiIXlXXGCWY+vo0aOZVKZRxGFZ0htoZXHUSa5/VJOXRn5DZ/s4cSm7PLCkgSIBDGGa8Prq6Mwfn37t7wAbDAAUAU4MJABoB7KVhfaUqymt7RF70WchQa5QgBK8fb/FMA9OkgHyBgKlPABOOGuk9ra6KJ1JQ806w75aYi6GOwomAasgek+sQyk/VxC0DXyuJWvOnR1oXL50qHWkC4eCDMx/Fh3MqLJJgEXB535F4y2tA9Ml25AujisIjT71Hz7jFw6ujUCSmYMJnpFkxyc3SK7VRVCQCEgTIKlmexv09oeRVHE2I32rqlqFwx0ua96yH5gP0BMBN998865C3hdCBDSokt/orhubs/bZLCXAT03LagVsjcrXFO0AIajMoegQibVhxvJ46aLBsW4gAFiaTABSpNzZKZ8TJKf+hpJCWC6Kj45nFbH20+4Gu2kVYFUEIpNAKb8vTFpSCkUr+4MXTxXtp60ovEcHMpGzNUKBxxV+8MAx/RKZERlMTctQh8gpY7nP0u5tZ32fLGgElRK5IHtU5NKfM7DeXBT6otpq2PCsIJfs50QmrExqYOqTrz92ByNf4IYYEFUWZGQIkq2TlKwtEGOjgAzsUNsKNZSSQTky8lC4TW3yzSEgaf4wEQkqN2k/MB+0zdzYOBmISFLX/hUHBVEwXkgps8j1C0waHCodIB2QO2juBqVtuXFK34e6B7SdXIcm6o792DsJACZN9J6yg0jnyJmCcy3kYNSsrFkqGEDVMhgPAAKaBZxtEAHNCKQ+UNK+rCs7OQ/eau1eqU6h7/001zIdWSq52ihwGUXLUeEqgAMR65Ll+nJYquNZLw/iE070gs6ldyxTWt3DPCl7TK2q9+og94F6fV3ziPeByR87gQIwXlnxt3+TbwQ+kGR+F1OAKGn1GlaB5A7ICZQ7qHSmMgFT2C99NwboIx2CPKp9oCpFRpfyXwHA5uaVp85+ZULyDp21Ci1P7wlBkSVrLy7lN3npMXPRI51DtQM0QfMcqZtBckJOCVkyAEZSQdYEEJByVsUcXTd7MwDccMNZC8zlEQiKLiWT/x8EHXzCWv+rn+szg60/4DtDx6JeAtVTQ9tQj7iB9IGIAZJFRZC7zkp30do/FU5NWbNQRQZh4GzmpTc5lE5zvXmzdM6J8oBysEOhlFVZliGIwtcoFWNc5VvyQJFvIFa9UAT1wySpAZLBShiFBqsTg63edBP4+NbxdiWaizBrADTUHlW0RU4zaG6h0lnpDpOZJg/ESh7H3sEVqiQRs0I0zwHgzjuvPIDBlckueYb9b3UtdtvzDkEVyYOCC7UhW89oNnqWKQmGrQwcfOcXzbbdycCqCSnP0HYtNM8R4wWsrLRvGf7o8WQJ8ymB/QZEyBYEjmclB8IP9VUvsbmjAdC9In0YGc4BJdSSmwjIOdWfnwu9inteKZU95WCxX9kVZQDjWFkpGb7KUSak+rtodemqUDqyXq0fki1KYlZUkwud9QySYtRXeugMRqgZda91faWwld/Bd8EAMBo1WD04UQA4dsySxepy+DXt5t8peZqAEdvwLPnhYgcwEaFxEMV83qJtux4yGNzLZmHWr2ViTZAZVleb7f095t8G+fN7hvxZXY2/3e7enyNpJJCW01lqWScGRE8d2naOixfO4eKFc5jNtsEQsHZAnoJyhnRzUNoG5Rko5RxoFteXp7edfv0tpwHw7bcbQmEyGfsCe4C9hQ5JkQWbVxf9PYLGe0vxpX4B2iNbpvadIBfbR9E91vPWd2FAehYHoA8hbhV8joEQGIolgj8O20pGC7OE+qwvDldTJFulaK6mukN4o+pgzCQD/lvF61ZpPUfbLFYOlZM6VFkZuEOTN6ZNaLCysuprsjsVAB267uirI919Rub3c2q3RXKH1HXQlBAgiMxYGo8RQsB0dxc72xfRdS4cXSsZ54vKgnyKhhBjN7uYDhzIv2If3d9jPqTr5MkNe6Gai+8KQQQqpBD3odR+Ke57PUkCSbbTy6nFhXP349z99yK1czQNgbKCcwZhF0E7bUC8MtI7/+FnfPzzvPlX4Aa1w2BFYtNACwDeBxfMvR1dCbAi9VjjyrcKIoO9YDEVQvHo7PeEQ1BBv3agWibWnnCPyW0F+UlCEgsuex06y5zsgAvNJqIs7tqckxOxxZfwvuv07GnT4KEAtuyRRLFlftbcqxzoQFlrUDYGXGoBQQPb+LJmYooYNSMcWFkRAHjiE8/KTZub4Rd/5kV3f8InXv9DhHPcznZEc2u7XwWaEDGKI0x3Z7jno3fjwoWL6NKginDlPNtB2/9N7cL8T4gDmoY+8qgj8iEAOHHixH7GfGiDWVJgk29+xtPOx4g/HI8bBNOjALQx0UQKIA124wSXrXAwQRbCzvYu7rzzI7jv3vvQpYsA5ma3l+baTi/QbGd79u9+4IV3V9wcbvep7FJu2B7fJoy9vwcRGQQMUn047Ia3QVHWzsDmEN8NWm9YesgyfBDv88TZG1SnjVamEQBNYjQyCEQ7pNzWKWPZN9ZdqveHhthOyLl1bdYBED53tYw0N214NtH6+9U+DrKgbbsoj2mTYPUALkY/PUd2MKFFbylR5EwC2HR+Atl7SXOKY8LBo0c6+44N4E02n/nAe96H++68E3d/+L3YPn8e890pZtNt3HPfvfjQhz6Me+/6KGa7U6gqYggGtPBSNiAiUEZgW7MwR7dhbPNyM1JWfcPx48enPmjcD8yHem1u3szPfOYzu8mk+fXRWEDUw9fgWrIEg9pJ7tXZyHVlFUDqEu677z58+EPvx0c++EHc+aG7cfddd/G9990tXZcf96J//dPPAoCNjZN1KjeZjGYhsGVIcr1S7Xd7vb6F9XPIsmcU3y/oh+UoBgv4S1UO+l0H1WlpckB7doK02MDGUUiSXafVl+cpdT04IAuQswEkZJihpU5oc53Y9sB0GqjdlZQ/nOoaHzW4GFmR8FDPRMNekhdEqEu2taojA5QRiMEclSMxBejKysrUvvAUgDcBRHrPXXePZ7sddi5ewN133YmP3nkXPvLhD+Lee+/FdHcXIEUcN73NPYfeHdt7T9ttAyGMHb6nTNTSymTyRhv6ndkX4/rbXCdO3JwB4Nja6P9J7T3zEDQwZVXtoOrZCAIggHnklnI2FyrrCGJyS3dF1yXrUbJCM0Q1hL/+m/ceA4C77+7fHOZmu2kav9nMgsCk+EMffCJGo7K5UAV120QSdX0ggzI1iywgeCT7ukW06trKgIlBjhwova46akcrxM2GXllSJUqL5ApB29sfVtW7BUevkuWcTqayaFY0wDz2agTqomao6x7smX5epgIqTXhlvIAADkDTjBBC3L728IHzFig36OnTNwsALK+ufFLOghjHaEZjNKMRxpMJxuMRRqMJQhiBKSKGiBgbBCZwCDY4gwIc3favg4oiYlnGYYmznL/7MY/h3/Aydl9X9m9bzm5snAwvfvHn3bU2ll9dmoxBQCYnydpBnAeGqsH9LmxfTz2Y04nAppKnrhDQtR3O3nef30VvQrGyiBzujbExAHzgBQU+GrphOUtCamC5Elwd1WdnqKQaYKoJgsXBi3qPWgARJt/RIaXWxaMSJLfI0rmyeuohdAVQ4XA6kDNSfEiWs1Yh694Wvd/3FZV6y6DZDgUUrGleaB1pjxOYaaMFgELt5XolgUXrCHVEVq/dw2ViraNmBGbeOXD92k7/PVsaAoGIPysroMxMCBg1Y4zHS2jCCCFEC0IYcZpDA+Jm2NmiGBAxCyhkMEVdXVrC0hJ+7gUv+NKLm5ub8UosY6/owBwEqBxcn/w0yxys4EDB5i25ZKhUlcNDiGCOKIhV62moUoyMmVC0RwGOzQoAnEaNSyjLXTHGgdQ/DVTjjGBtAL8B3UoGa4YSkL5uyZIdReTDlpyrnYL43rBkIsmdT3kV6tInddilMggy3x06ON18Pz375uT/7onO1axWsw1usu9/JSNTMaCVXtnOp8riP08qf5MuMeC1Q5IvmyWHygI6ECpjYqfeMWLDIArT6x5/dHc4iFEF5rN2QhQQAiPGxqUuI8bjJYxGY8uSsQE3jZPfy/sTejoeMzgyIquOA4jlws5jj4x+CgWEdYVeV3Rgnjp1PG9snAzf+ZLnvHlEs9evr0Rmzdkllu2m4wI2sEGNkPhENYDJjFOLRTkzVU1aDozx2LT2bxr8zJTz3TESmthYb0LcOy/XrOBmRtU9WWpfiKKQnnJPbRLD9ubUIacWuW0hqavIIemSo5ayTVYlOQqoJxj3k1vvrw0kgeyUtJL5JA/JywOVgoFHSWF51IzIvbDY0I1saAQ81LRdSEp7l/iX9NHlddOqQlBezxADRuMRRqM4/6fPeMZ0gMi0fjtQ5ODeKawIkTAejxGbEShGxFEDbqLbLHB1Zyuq7MFmdQiIYBI5sKa8tiz/4Tu+42vu2NzcjFtbW/uB+XeF6R07JN8z5rMImFIgcaeqDlk6CJLv7IaaM3ZDMHkhy1SNaYiNRD3bbXf7H2E5s5u1ZzkEhBCUgw06lNw4Z8io9/K5vIRSkTrFCrCDaEZKGSl1xnQo2c49O+sQR0p/aYOcbJzB2hf2kh7Wl5IqckpVGExzQe4UJT3UQU+SjC6ngSq8VMicqDjTRXpwe0UDkgcQ91aEe1YftEcEa3illHxgVNpQNsCHqwsyM2JoMB6PEQLL3uylCiwvLX9gFCOaaIRp4gAwIcSIZjQGedYlNzoqAVnECJkEsYkIFGUyGlEMZ++67tr4w8AmX8nZ8qoIzFOnjueTJ0+G7/rOjbctTdKPHjowYUjq2JkbRncKvtccuGwBvrx3bmbR4rKbjJom4GlPf8pZ+yk39zeUoA2B6+QRe+wilU2VZzFAncjLYZBVtAZgSgld19a+LntZmlJCyi2ydlAyEEJvU5/qxLR8bfYbvQ6KcnZIXSlz0+Bz/WuBYk9YBjvukj207dNabvZarkXGRV2/d+hmZtKY5jVafqaV0la+D/WQSqCZSmFTqxjr4yNCaAYyf4SbbropqAKa+ddXV1fQxFGuk1ZmIJTDwjNj4MscEIoQiofoSA4fXOcD68vf8bKXPf+ujY0b6UrOlldNxtzY2JDv3dzk7z/xD75nKVz4gyOrk0ZT7qxUMaPZQlSmol3qw45EGawZURWMEUgamTRKyyvTv/nFn/3O3wVAp09vVUxcHKGNsT+Jwdobw5bgtLET2AWjgABwhCLa30FueNP7gphigdmaq+87RRNUFCkJcjLx5oJsylnNm1J6z8iyhinaQzVQsqsEOqk659xr9GTX2ckGxBgimIoGD0DWpitVSG/2gFPnty6Id2mPQKoY2BqsYvtTIggb6KbaWlTcbobN1VhDiIiNdIGpQtWPHftmBYAnPebg29aWcwo0JoSxojEEUyMRlBnQ6Ip59nGmjAigAaFpCE2YYEKTdOxgjMvhoz/2Y6/6+l/c2DgZTp06nq/0e/6qCMwyOSP6hO5pTzrylSujs287cnDUsEiKRBpA0MzVRYp876fu69hRgHKDEMagTPnAWuDHXLf+w0TUbWxsLLwGJI3GGBFDYzIkQ7NUXyEEz5KZjHqWbFFmPU4INnJysEPRoy2UrpLJRMTKPc8uWWxoU3iY6v1l2R+WaWrJglYa++P5RDflXoS5rmrg1gBSgrUfVPWemOSss4EtPTxzDjLT3quQkPeuSdht8squk8Pi97PbGDRNQNM0vS73oEra3Nzkn3rtd79laTn/3qGDoxgD5eDgXuUOzAmB+/ZFBEjZtZ5ig4ioo8Dp2NHluLI8vfWWn/iW79jc3OSKKtsPzL+fa2trSzY3N+kFL/hnH3nKE9e/cH1y9rcOrUsch0ysmiKiBmWjXHEZAgRwGCE2E2iIqirdgdWmWVuZnfqvJ7det7m5yadOnVrsbVgILn9hPWZ/g2IBkE0+imdQYKdGW5kbYkTgiKKIXPaYRVenlJ090yNVxb0igZFc+SBnC+CUcvVRKZPSEhjDfWnp6yQPyMyO36UilO34URXylYo6zJcqM6YySwYyJQtrlYGn6DAoY3CPkYGbddG2tV4w2IHnfX4MASFenkuhCnrcY45958HV+YVVSqHRmAgBwgSOAqIWTL2EZ4wMClk1pLQ8iXTNwSauLF/84Vt/8pu/UWSTt7ZO6JW6HrlqA3MQnPyiF3353T/+Yy/8wvXlsy87vNZePLxGcTLZJg47eRRyHjE0smrTiMbYSgg5jTnR4bWuuf5YeuPLXvKvvo6I1EfzC29UABB55JkiIHCDoZC08Q2xkHmoOhnbxFbAAAWE0CDGCI4NODZVh8j8UrLvQG0AlNy7pPRoOZXs2WNWs4iVt1ncYq5XgOthc669U3RrM9yAxwJRhCGZAYnulh2gWoZYAUTRkX4laGGqeY6nLTzHYsVX1iYLlvK6iPrpMzC5VwuhgjiCBegDHcSve913/8XRQ/TVR9ZTtxw1BiUNPEpAI6SNBjQaETQS5XEgWR4pHV7jeHC9ve/IofTiW378Rd/15V/+FQE4Uajn2A/M/03Bqaq0ubnJP/nvvuVHrzscP/3I4dl/ObCSLxxajWFtNA7LNKa1uELrzZhWIvPhJcRj6/Ptxz46/8jvvv77/9lznvPM3WGJPLxiHDMx+d4suJgW1yEKBk7KhfMn2RTCbfLr4J8yFOLGJ5uhulsRs9ku+GoiOZCglqoiFaBfs5VPbKVOULVyG4tERxE2Lpo6BDd3zQSRABH/twbnWAdoLsALhlW7tmbSXPinqYLgh3Szso+8FOHTVyzwUnYITih74eDSlE2MYI6iir1nJLa2tuSmmzbjL/3S9/3msUeFm6+7Jv3hgaWpro/ncUSJx82ERjHSqGE6uBTDNUvgayZy12OPND/z9Kdf9w9//Me+8aespzyVr6agBK5wt6+P0XPqxsbJ8KpXHb8dwFe/+tW/ff3fvP+9X7K7TV823cUnbk93JVol+8Ex0399ylOecnJr6/nvJ/p+m3I8wBulmmKRvuRA/iIpOsfIMofaJxKFKqdo/Z6JgBjzPkOUIaQgjjBSsBoIQghCgqQZQKrGrERagQHMoYpZ9/4mqCrppedkJX8mRe2O6toGYGSfqBL1KnbVSbooqJOVmpITsusGaUUTaRXCH9rsFURU6SdVFYFD/XcfvWxSIMUakc181l5jOwBDiP5enLhE4sMGc5v8C/9p8w+Z6TNf+KJ/+0+2d2Zf3ubxc1LeXULudHl1QktR37w0wn//nM/5/F//0i/9+Is2NLw6Bj0Pm8DcOyTY2gK+/ds//04AP8OMn3nrW7V57dvfjmcAeNE3f1qXU3lvNtmkCh/49FRm4mA3u7JlEHUOhVbki9HAKjsDJv8hIogcTZ8mmzkriQKZ3QCXHTXUFtygW5UDQcncBDX7JLXgVXMdnJhosQJsGjcluERMkhPVa5l7xUCNnt1zxfSa2dGAb+mBw6HP1FRAHA6o4ECVSVKyZQnwys0kLIANhv+2qmGAv4XpBIfICMwfI5tZC7O1tSU/85Pf/j8A/A9Vfcnb3w5+O96OFz7jGSCiDgD+/b8HNjY2wg033KBbW1dnUF71gVnKHb8R6OabT4TTp7fyM59J3fBrbrppM958M+Sh7K6YIco25y+ZxFQlC+W4N8qxnlFMYsgV3gvx2QS6YDYNHMyPE7lOO5kDgirEoh8pOcSPnPs5BJEP/CkVZg4EVx6AUmawkio7/FSziDBFKCQQZZc5cWcxEQcwUf1dmbiq/VX7BPZArJhkNu9NDr3dBHp2yV5fkaGvSTnIyJ9bkd6MTfCfXc5NAFsP/j5vbGyEU6cAMrpRBoBv8Lfupps2+fTpE/nUKcpX+3191QfmnvI29VCA/vA+fXornT79t3icGCwwbX9iJemgj+pV4MiRQXkg+GTKfAEGJOgFmR3hoAymCAT1fo+rMl2t40gr3ct+CwGyZT4KJsHZaMSYd3RlMg6rayOAWsi8RYwMYQ5nLwIXd6JCdwiiA/icBZmIiY6RduYT4nEk3gOSgzYKxpiZoeQBS4WD6XYFRJV/SczuhkZV1aDA/SACcKg42YJlbjxjPkhcDqqkU/ky7zEAyOnTW/KxH2E/MP9vXv+fG33imDgEBBgMTwyysiBPUfu4oZwGBux8DPf4svBvJsuypDYEKiVs6VXzQIKz7DLZdhzImUBqK4LckY7XMx05cu7fPubxR//42DWPupjzfBdJRgg0eeufvOtzt7fbb5nPl1VESBEQ2OUjubcqYBeZLjvgakNQyeGh9q+Bm7o2KnpGJTtWm0Fm+xnFbo+pZuwK7StWiRxsah1Y/0++x/uBeTVGtEJi8dLUcqP20hSFD8lkO0uRflKpWavo1HBdYNzO7ODxEqS9uap9cIg7Lfo/xQIg+4BJkdpdqEzzShMDQf7k1//7T7w0p0sr9JM/ufn7P/izf/W8diZHIFCKDSFEK8tD6KvMAMSFMhR94LER0cklVhC4t2CvpT9XNQfmy7iZDIEHnm1VxMDnbOCDwA/vIHtErEv+d18NsxasqPWJXBXvChSOKg0MlRI27K0qNYrL15plQQjR5sE1w1oJWLWFSk9bd4JWGiMLchKkzqQ6NbU6CgLC7K05CW1sfNvSyZMnw8bGyXDy5Mlw002bk40Xn9jJKf9aExU5T3PuzL4eZNYPObfuVhb89yCAoyGYOILDCBxiBQVw9L+DERBQ/mbG1c7kcQUJAyZzL6eJ4TRXrDQOBYTQ+14CJ/ZvwP2MeflrMllSNA3mGtApm/I5cbWuw4A0DaUFMHjf9VBd/A/uzKoHW+Y6CvhqRXoK1l7IgxKM6u0Tn2QEJ0aLY0fW3gFA7757vTt+3CaQp04Bz3jGC5lAevOhr6eLd3ZGnE4ZiTowNQZbC4WKRRAiBOc6EshpVgRQsGFP9WUp/aLWoQ05yqeQvRcZJ1wntsXVGoEQmtAPtTzw96/9jHn5qygYeJZgUK+Kjj3s/YEz9N61QKmHe7euBXJK7fHIAQfqGkXk6BsOweUxQtWuMRFjJ1eDETkGzXO89z3v/FUAOH368hSma44c3GnYzZaQATLxZKKIEEYWOBwR48j4q8wI0bIlPFANLxzqzrbnpQ6QPdI7sA21dokcHeQ0tDoEgivW+colhP38sB+YDx6XCOMRQrSBB6Pv+frylN1PUvtsOTBj1QF8bWF2WDOtaxO5Jbtlnmi6Qs5MIRhNS13N3cxZpRKeMwTjyQhPetKx8eWeyxOfeFYAoOv4V8RWH4E5IiuDQ4PADRgBTTNGbEzMqigEMDeIsUEMTVWD6IPQoIbsShEqcD2k4XpkML3WgS2gv1bFGZoLnhlk+Nr9az8wH+waj+HYzQCOvc8mDSRKTLN0OModDDl8aln8PWgAStBqUtsPf2z2UzSLFsWyzKAoG0cyMNQoaMqsWFrmnc/6rE+fAsDm5t6Vgmnk3nff9vtiBJgiVcIzogVmDJ61LWOFGBFC0wPKfddqShDRCQGhwvAqCqgQyItK/lD0j7juXpmCI5AGWr1kjKDY8P7wZz8wH/xabUYaOALcmD0eKxg8FB23ss7XC1VRk7n41XiWo2rFPgTGFBBB8HK5atcWyF2wxs0kMcpBEFFYKkCQyXiE+XTnjd/2bS+8CwDvBU6UQH30ozmOxwTmCTgGNGNGiCNwbIAYgBjQNKOK42XvMQObsS8TjP3BXKVamJ1a58qBADvC0ftSxsIfdXhjtZTwQykUq3cQQtQEALfffpz278D9wLzsNVpa1hgimFGNKOs9VaQ70E8SFVZeDuUidbAmYOdp9uWg41L9FizTWEWPQS03f0+f8jKbbUHIFNAmuYeI9BnPeOEDTk4e95Sn6MrSCjgwmmZc6Wts+FQ0oUGgYNxT31HG0CBy44dRgDKbzqSLkAE2KPItpv3+zO6QqAOguk+Wc2++S+Ug0l5eNDYBsZncudhQ7F/7gbl3KtuEZGJXjJ48YcJOgSrBZEHSsgapA9CHx75UkDi5odfQLoCq3EfhL9YbvLBR6oTXAO4MA4EvLy99zFHmJzzlxvlkEmcxRDTRRKw4Nj6BbcDcWM/p/STDApA4mCIdR4MUagG9F9sBGqRFqsCCUAD9YrQ0VXUJUF2ghxFRBR9YhYC/3r/z9gPzstepUsoeHn80pek8BAQo1G4iZ5YMNFPVJ6/i6nSlvIMH24KkY+mtFsjD7CNav2XZUTal22KC8kCpHUPqmWB9dekB+7IiAfm1X/tP78o5nRmNxgCiNHGMGKOLWDXgOEKIYyDGmhnV/6AcDBwNKVQOIZtXV12g8vszsVtzapVlKXIshH6SC4UP1/pDT3M6u38H7gfmZa+TGyY5cezg5EOK8FGODHXJOfMKkQU5SHLCNGopWjw6ehSNzYKsD6tO0XVIq7U3q/1npUUVBDw7QMFZHDU7Acsryw8YmI4bDkTU7uxO3x9jA27GQt4jjhorXdXVADICKI5AzQiIARoYGhwTTB5oIQwGW+xwPK7iXeXMGLp7MbgH0HsTwFyFgEBKykRIOd+/fwfuB+YD3Mz2/y/8ws86nyRfrHtElAmqViGuBbRP+Qotk0ZyPVtUP0jDGZRs25dxRIsqcn7ruqK8l45SjC5r5iUiYGV15RwArK5ef9kAvemmTfK+dN6MRg4c972kQ+Ns2so+6HGZT7U/JWsDVXrWV0LGojFQQQEQuIvWHr9QIkLkMBB6poWJrmGSCW3XXdy/A/cD84FCU1WViEhEtC2bgMo3JK1KlrVEc34jFoJVKiuEiKvtuqkZ9Cz+8v2RQ7WkK0AGk4v0zEvFxLauGkhFEQh/CQDHjt3+oKuGyWSsTbD9JMeR9XzMpoUUGowQ0XD0KTEQmBADoSkggmgrFQV6VkhBXlBRp2d3CCsBx9XodsFACYtVQvG6yMLz/dnPfmDiQXozAoCGScoQRinVHk90aJCjtWda+L//o8L02NE7A7qUsbCoV4mnXqN26JJF7oqtZKwQFYIqkaDD+d3pewAz4Xmw5zSeTKCBQMEoVqDgZamDykPoMz37CscHPKZCT7W/rj7SavS1WmBX8WcfVrlSAoOqhUI9kBxUQSG4b4uApdvfY+4H5kMpaxMiojP2U32pai+pUgWhA1tpWKzWC3dRBjbnfc/paBciG6pQKVUVi6Y8nl9UfU2hVabRYjbh/IWPngWArY9BPxyPJkAIUC5Aggbqjli2bw2eFb0/dhI1ovWjRW6rAvTtSaKsThS9iDqhVBBaHz9Qf1DZ33qJTSKAgoIcYLCfMPcD80GvwLGnbg1eIiKTfyxlWeUWorcMKJjRKnvpN7Rlj4E6uhjHst6gDlAoJWvZE4rk+vgo5kjE6HbQPZTnMlkaa2D7HjD7VDX06w2YrKWhggxUH5ir+ErR6MEwcw5wwxVY4RnTAOnkVDBdlPzkHpLX44+BGPdB7PuB+ZBeFedAFsiO9q7LpGY0VFokVTHdHg0LQ6GK1CmiiQP4j5WMWgdFKiZYxUVYuWrZ9pKZpcG1VaGCOT2k8q9pGuUikuWNM5Xs7CuS7LaepZcUmOqCw5IgKMLVYqU3SqtItZKgwmFduKVoYee7MGVDz13dB7HvB+ZDLGW5D6BKxdI+C2hPoyDtzU1KFiUw4GTq6nYM84WEa+9Y9uofztwNqH5/2V9Wf6Sh8yMDGD2059KMm9YIyQ2aMHIqlw1ojKTNVUNXixO0GzAR+6TWgfbGKh3sYmn4/IvCny7sawGtSu4FEUULbB1C04z2e8z9wHwIgel7RM3Urw4G0508nDT6p03bFf1eknqwKPW7Exf0ggtH9yRsFJ3ZYVah4oFS62ef5j70ty2GcMEyMxNzqCZIZfDEuFTz1Q6WIiRd8qAFcZ2qwoSg0f9zoGAwLP+pro7qv7n/mcyE8X4pux+YD+lF4X7CKNpDyMrwgwL3LlkDM9biplwQQMWkx2CnwRf2ViZKmVbusbjjIq9n4e6cxsYyU1U7YIwwfojZP9wF8j6xZr9BELp2bhVpXlBgYEMEodfpWXzs0j9S5WzqoIRdVGK/9GajhdJ2/9oPzI91SQkS7o1ci+RHAcuyUbF60x3U9UHPSSw3Z7BY8+9X7jNkGaD0y/kijKyu0KdlTQKqTmIfu/I7duxGtewu91dUr+9HqWROBzNUcnPZv/KAKUJYgN6B+9KVfeViurTqL8veHrKAGWghg5YqA6LI+3fcfmA+lMvUViMSCSjIAtTMpCt7dQNGsQ4AEKjvE72XrDc/iss1V5CCFM7lMEPB7RNUQWIIm4zsJbCptpM89GFJAHfRwPzoZQAAExtJREFUh6PaAESCkVqgCFkfHDjUjN+7ccc9MifqTNRiCGyWg2KLSWAgaVlt4dFPbBUYVAfqkiXBnK5b2U+b+4H5YNcJO8lFAGYEJxKjcBA9ixbytGnK2iAHjnbhoX9H4IUMoYPprKJkpX4NAsC1eNBzHCuWls1akDDoex9S+m8iBwS24Y4JcPX71qF9C5P1nAVIMexli+dKrT69HBbjptU/ZfUSXB4FJfMCVRia3Xg2BFNSyO3+nXfJbGD/JbjMrZxFlTKgAkLjgZSqojpEwKGx+MkJxOJoGIA4gnzJDiiUBIFNhsQU5cwqQJTc2xIIiCCSsrNA3YtI9uEQm5196dv+FnHJcTwi6gCFBg72fOrCdDjtLasPoOCPmPsKAC6lUpFJaiieJjRI2WzryyFWZDeJ1HWDDJgfoyKwQ/uq8RABI9q/D/cz5gNfW1skt912W8xKy0Z+ZiIUkePgvRcjhFEVpmqaBiEwYgxVP8esx12ehKOjd8JAyKo3tmU24yFlF+DS3jXLtIRKcZ1rv6dZMJvtPmj5d/fdZ6xKJloD9U5jXDOhOX+ZL0lzaXYkgigP8L6e8cydC3DcrDrKp2lGphUUx0a2bhr7WBMRQkAzihiNRhiPR2iaiFGMiCGQgDGKo08ClE6d2r8H9wNzz3Xy5MkAALe/W/7RZOnAU+dtEmIlpuACVMZNZLYbDYGhbCsPhAbcmI6O6bI24Dg2nVbf4fGCeLL1aCG4PZ8PTUIIvqpwgS+XThDthzMi1nGKNA+pL2PJK+w9pLpxbv0dip6rE53tdyzQQB9IkenMlql0YMPamq+la9DGEbgZgePY3JybCUajJTTjCUajCSaTZUzGyxhPVjAZL2MynmDkgcw8QhbcBJDecMPG/j5zv5R9gExz3+5B0GOjoE0gxMDB3JgpIIaILmV0Ip71iqhx6MnSZAMNg6ESJJkUh2h2az2ztyMOQFYIw/6u2XxMil2993Hsrid5CBQnRdPkhxSYSrytor1lAQYrjCoE1uviEnobA3a+F0HMP1Ok/zgFQBWxZHf1cbYjoCITgA4xRowiIwRgFAlNDGgawsgwuwQQUg4fd+utbzjwDd9AFx7MInE/Yz4Cr1JGhbDypV1qoLYw9CGNq9jBs5gOVfJ61ItkrRqrIrn6URq3s5SSYeAH4kDw4KwPXyvYcCRWOQ6ugso96fhjzUvqukTy3QVse4l1A4peCntWjPb/EMDRzX8K7I4bhDjyCiAghhE4jEBhBOKRB3gEN6YnRKEBNxPEOAZCA1AExQahaUDUgEKDwMRJIKPxgSeem+VPBRQnT57avyf3A7Nvq06e3JDbbrst7k5nnwGMoGLRYGax0Uo81+uxcs4Z/gxjbxTVt+GO0fmGYkvMGqiAutaPVokR1T6oK1jBcaY55wVNVvpbLOUlyQ6zWPb2QVI/RGVPdcV01nX5fKrqO6AepROsZy7GQlVojBnUmHZQU0p4ZsQw8ml1AbebzTxxhKggQxFCo6IN5rvT4wDpfpu5H5jD/pKJSH//D3eegdHBp++2FyQScaAJEiVkA7KiEpmpLM+5BpyhZAyIkJEhmsCsCL7nFE1IECQIslv0ERTg3E9w/WtN0Mq9K7n0eRhYzncIUeQhBaa0qRPLimPOIFZ0sIFUIKm7yYpfdXlAzeYChmiHjxRFEDZzIQSqh0UgILoObVmJBBfGVgRQaKwgZ4YwoCT+dUDGjNsua5LDX/Ga17356MmNDcHmJu8H5v5Vhbgy+DOUx1GRFciOU+U9LlbUM0a0XyuU3k3cSEeVK/cQC0l08DFH/1h/qgNEjNRhj7VwBHFDI5D1dRMKD6kP4xDmRaSagiurFz9Lhe9qjT0CN5Qltv1s9SwpO0/0VC+q+rLc2x0A9fesdpyqVe+nWikU7SLbCZOIyGjpwDXnz+28gIh048YbaT8w9y+cOn5GT57UkLvwvK6LbjSb3Hg2epDZS8V+87LbyfWCBlLLTxLTgKVsfWfObv3uDBUaBDFEoTkj54yUErL4TrTYwvvAhciMYKk/Dx7ScaOdzikQYmyM/ZFtkGWKeD2gnj0YC0ywcEgjCBGMCEYgRsPu9aU95JBLSVwmy1yYOACxIqVk8pvFrdp0tEHSgJWgkWiWsmaJ3/qqW37j0KnjG1J1PvcD85F5bW4qA1vyzvf8+qeClj91d5ZEtOMEm7wqGNmDqmRMcjxrDMGpW54JxMKXmNzXUl0ryG9IqHngZmf9qwUkFS9Mp3NYFs21yDSpd3OdZmRwEIwdxL7XHqFcRXJk3rbbJrPZUaGeaTWs5zqCUhhEUBzJdLk+lkq2rMyQUCVULHPKAoqpAP2LcJ4qgb1MlwQgWfWQNXGbWhmNj10r0/E3A6SbJ94U9gPzEXzdeOMpgt0jz+NwkKGsWZUkZ2Sl2veVmwyqUMlgCAgZ7N6Xkdj3gcW2XeqgB0WbVjIoCzQn/6MgyYB0kJQs63Iv6KXaZ56iAABShBB0/ej6Q3p+F3cu7pQSunhTVoExyECtr1dJUOiiWgGwoFpAAxWDyjkdBGRd98AOIVNjF+QsaHNGlxWdZOScIDkhS0JCpi6R5sRfeevb3tacOHFz1kdw1nzEB+aZM2f01lvf1sy78JmdMJJ2fuOOTP1D06DHpCpoDGgtz6CGzAkQsCqo7g0dKKAWdLZP7IPWljEZoh0M2ZMhmp1hIlDkqsTHIgguXjUaRTr6mGse0vMLcSQ2YHWpTRIQZZBTyvopclGRJ/cE7fWJQozuX0ILJrs1SL1qoL6xrKW7ig3HsgApKWbzjGmX0OaMNrdoi2C2CO/OdhRh6RPu//27biIiPX78kbs6eUQH5sbGybC1tSV33PO+T+LRyjPm81YVOZh6wMTGkdQNlOvgAWblZ2ArLVUTVDooMkQSYNgcqCYE9r5QMgjJ3aUBFrVBiZZSNxmqJ3dQzZYhPfALGkc0SRMicifv/MLnffJHAGBra+tBO86DB5aoYYA0I7J62WysGPIhlFfcIDHMefD1jQya2bIiGbpml343u6CYuj1CLW2hIMcIW4bMyFkxbxPaLqPtElILaAdo10GTSAyr6BRfbeX40f2M+Yiu52n5McCIkyQpJrGSxSFwVm5ZJsgOVtdKKC7DkuqL6Rkgpw6aTXxLNFmgiq9BVC34cvLMWKzdBToY4dbhkCSTm6QoIQbMZrt/+exPfvYONjYKUuEBr2uvO9Yya7I4YrAKAvoAKsUAlYxYOs5BUOacexEx9NAI+xpfq5RVj1cDIoKUrXzVnJA7RUqCLPZYs86Cs2sTulbRzQUpZZ5OZ8gSPuuWX/qNQ1uP4HL2ER2Y5UQm5i9SbZAlWbEqjKwdVGfQ3NiSX5JNNSVD1G66LgGioa4B1FklqhkqybNg8lLNsgergCQBmgB0yCrImpFVINQHt+YOIAuigBZggWKEGDKWlk1S86a7b3jAm9as+ZR+5Pue/97UTd8yapbQKWXWOUY5AUToIGBRsIsOlUy4V3oTpVT1gLMgLTjeDEKuWrKkALIg54w2dUgiSMhgZIh06FKHJBldSkhdQkpztG1G1wpymvPObKrA0lPuvWv3MSDSEyewH5iP1GvedY9WsglscmqTJYF+8FKcvHLObrvu2TAnZMmeCRRZMlTzwlSy2PdlyUg5IXkmzWJDEfF1idmB9fuQYu1HxAikCEEZmnV9bfU08LFV2G+66UQgoszUng3BvPAyGVjABJx9hcFVkgjlaRfCs7iomH1c63S2AOrLcxRHKHWpQ8qpJ0urVxA5V9hi1wna1KFNCTuzGabtHF2aYt7NkFJC22adXcAjeiq7D2K3GzFBYYFSbkAViCRkWZRgtOrNStqccpX6TynVv0sWD1AfEDmKp0x3obbXtJs2G7sEhOQByi5eG1yuA5oRA4FFKTZEudM3D1ciH+uajPnOnTxVDmMDnxO8R+bqWekIAHf5oj4gVfr58gLcEFWsWtwawgpaAYkDKSQbp1OApMmVHnr7+k4YPGK07cxgiRHQ1Oo4TDjw5BgA3H77qf2M+Ui9VIGcrRQtWVBTh5yS9XdqWU1yslI2Z+Sug+QEScmCUhWSO+TUWlBmexxoBnJGns8huQWpIOeELG1dvZSsWcjFaiNM3xsKYgQCsjSsiGg/8LjHXXsPACp2ew903XyzxdS02/nPmi+QSBuYojlYiyIg+F41D3xGbKBF3gfbwCbV7JhzQkoduq61z+mgetBkjBkR5FSGWaWq6JBzh5Q6pDSHJsG87TBr55Y9uw7zdm4DoS6BQl5+RM899sMSiBGRyLKapBYkrpAOO/WzJEjukLrWs6j1jworW0WS3cRdMmBAWYlkv0G1A5HYY6Q51AdKKc0hmiDSQaSDSgKprTKYbU9KJVDQSkRLkNlvv+513/3Rm27aDEQPTo/ywKUjS/xBlu37GhaozpXQIRLZz2IxzKx2YBb73ZL9LpqTPQ/14Mqtl+l2gBhQwINWElLXOcop14ksJEFy64dchuTWH2uOrpthNp2ibedouxbz2dyCvp1pmm5f3A/MR/xUFu+SPFNJrZWZPtovmSx1HVJKNvRJXe0rpWSTbIFFZDtNSS1ymkOkheYWmjpoCb7cQX2xLtIBYlmZIGBSGw6xGHgdGZAESAvIDrfdfXrgwPp/BIDTp/ExQexEpDfdtBl+7ue27mpCd8uYZ0SyIyQzBOrASCBtwUgIlEHSAZpAlAFtB/tXP3zEJEQ0l11rRs4tsnRWrou4GG32oVcHyV39fvGsmVNrh1xuAU3Wm7atvZ5pRjnv0k53/j4r18/ofmA+wq7bb7/HYGuz2W9p11G5eSzQElLurBTzfaJxLDNSthtR1LIpkK30zZ2XbMlvZJ/M5hapmzsZOiNpB4WAtWjJiVsmGDoHJWjVhkOqOXfzXSad/ec3vvE1bwM2ArD1kNglb3rTiby5uclH1tJP6fzsXUFbCpgnlZntVT0rkgo0dyBNVjEkO0Da1CKlFioZ2cv7lFp07QwpddZHp2wZ0YM4587LeC/b82KQ2tTaD61a7ipyEgkUkdvdOw8cWvrwQynX9wPzYXidPLkhgNKRa1b/rJ3d92HSjqbzJNZD7SJ1U4jOAM90kjorb7Of9tJB8hyS7ObLXQdNllUkWabNqYWoZZWUO0P5SAcmWyFoNmnK7NA0zVZGIncq3Uxns7Pp3ns+rNP5ubPXfdyx77U+8IaHfLMSkd5++430ute96qPNWF+s3b3cTu+LrNtgneZAXWrnOyJ5rsy+c0zlUGhB0lq2Tx0ktbbGUT90cgf13ltygvoBlFNrj5NbpDRDyjN7DDX4IdQOgqS2PjHV+wzJcyXdpZRmr37Vd3/9PQ+lXH+4Xo94es3Gxslw6tTx/K9f8tMv30mHfvDsdmi7LrMKOEuiDgRNAgKomAhlV6+Dkg1AkMx8p6xRspV1lh3KblM9uwrIJrdmf1smviqqkjR3c83tDuazi/H8+XPo2nNYWRnjwPrSqff99e8ct2x56m+vkby5yfTKLfm8f/71L9mdxi/lMPlHS+vXjLhZhSiDeQLVqELjJCqUUiZ1Y5KcXURMCVnESDTkz7M8B1h2t8G0VRZKAhp8jqFmYy8CJVUEReQxYoxYjiExZrwy3v3T4899+j8+c+ZMOnHihO4H5iN2Iqt04sQJetSjnjE5/ZZ3vb7T1c+ap4CUGSKMTCNAOyRJmrOIiFaXaMm2p8to0UPSvNdyoAGJgrTpJ5fIUElBRZC6DM1zdPOLmM9bzObbkG4XqdtBStuIkc+vrEz+dHVl5Q8PH1i65a1v/ZUPO+5G/w7vt4bA+NzP/cYnzygez4qnROCzReJjm2a1aSYHoAjIXUbmBpkmFlwUbZUkYqtL73+ZqB5W9oKK738Vog7sJ8P8seay26TAypAOGQLNAkbCdUdXcM2hlc9/3Wu/9XfKgflIvS/3FbAHN+zmxsboHeGGb9ydtc/MqfvUeZsel1LQnENAjCvMAeI4AFFGytn0f1zzVYsHpq9RrD9MNgQS41sqMrp2itlsejFnUUaHBm1W0XdLoA9Epg8dOrh+drKa/9tTHr9216/88i/fn/Lf3/15002b8fTprTT82Ite9KLVP/2Dv14+/NgbPmWWmmdduLg7nozC45XCE3IOHzdv55yzQinGEOMyHAebpDEl9gpRLGsWC9BcnaWzgefVYI0pJeR21lLeniUWWlka7xw4fOiPHvuoa0+/9Fu/+Kee+cxnlt9P9wNz/6LhjXDy5Lct/fzP/8nKe97z13rkyD9eOXj08c++uL1zbHc6lXmXlgA+qCkfUNUmq4myqhCJZmgWERu7TkW6i/O8s0Oq7bgZ5ZX1FWWVd/zFn/ze/8Lqmj79MQf0Ez/xE/XkyZPnR6OYu+7SIHzGM57RvP3tb09/jzcqAZt0003g03gTcPp0umT4wEB+663N8Vf83tqf/+Wf8/b2nXr94z734Oqxaz9n3nVH29lMd+Y84RAOE8m6CkYiLVswCoFZoZ0yc46Bp5LkHBTnm0nMK0uTrusuvPHdZ37vjk996qfSzV/0yen7v+8157Ls34Tl+v8D0X5SsXWvVQgAAAAASUVORK5CYII=";

function CharacterSprite(props) {
  const { emotion, walking, facing, talking, pointing } = props;
  const bodyAnim = walking ? "hdWalk 0.4s ease-in-out infinite" : talking ? "hdTalk 0.5s ease-in-out infinite" : "hdIdle 2.8s ease-in-out infinite";
  return (
    <div style={{ position: "relative", width: CHAR_W, height: CHAR_H }}>
      {/* 그림자 */}
      <div style={{ position: "absolute", left: "50%", bottom: 0, width: CHAR_W * 0.62, height: 9, marginLeft: -(CHAR_W * 0.31), borderRadius: "50%", background: "#000", opacity: 0.22, animation: walking ? "hdShadowWalk 0.4s ease-in-out infinite" : "hdShadow 2.8s ease-in-out infinite" }} />
      {/* 몸체 이미지 */}
      <div style={{ position: "absolute", left: 0, bottom: 4, width: CHAR_W, transform: facing === "left" ? "scaleX(-1)" : "none" }}><img src={HANDY_IMG} alt="핸디" draggable={false} style={{ display: "block", width: CHAR_W, height: "auto", animation: bodyAnim, transformOrigin: "50% 100%", filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.25))", pointerEvents: "none", userSelect: "none" }} /></div>
      {/* 감정/상태 오버레이 */}
      {emotion === "happy" ? (
        <div style={{ position: "absolute", top: -14, left: "50%", marginLeft: -8, fontSize: 16, animation: "hdEmote 1.1s ease-in-out infinite" }}>✨</div>
      ) : null}
      {emotion === "thinking" ? (
        <div style={{ position: "absolute", top: -16, right: -4, fontSize: 16, animation: "hdEmote 1.4s ease-in-out infinite" }}>💭</div>
      ) : null}
      {talking && emotion !== "thinking" ? (
        <div style={{ position: "absolute", top: -12, left: facing === "left" ? -6 : "auto", right: facing === "left" ? "auto" : -6, fontSize: 13, animation: "hdEmote 0.8s ease-in-out infinite" }}>💬</div>
      ) : null}
      {/* 가리키기: 손가락 배지 */}
      {pointing ? (
        <div style={{ position: "absolute", top: 4, right: facing === "left" ? "auto" : -20, left: facing === "left" ? -20 : "auto", fontSize: 21, transform: facing === "left" ? "scaleX(-1)" : "none", animation: "hdPoint 0.7s ease-in-out infinite", filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.3))" }}>👉</div>
      ) : null}
    </div>
  );
}

// ── 메인 컴포넌트 ──
function TimbelAssistant(props) {
  const { isDark, onNavigateTab, currentUser, tasksSummary } = props;
  const t = isDark !== false
    ? { surface: "#111827", border: "#374151", text: "#f9fafb", text2: "#d1d5db", inputBg: "#1f2937" }
    : { surface: "#ffffff", border: "#cbd5e1", text: "#0f172a", text2: "#334155", inputBg: "#f8fafc" };

  const [pos, setPos] = useState(function () { return clampPos(window.innerWidth - 140, window.innerHeight - 130); });
  const [facing, setFacing] = useState("left");
  const [walking, setWalking] = useState(false);
  const [pointing, setPointing] = useState(false);
  const [emotion, setEmotion] = useState("normal");
  const [bubble, setBubble] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const posRef = useRef(pos);
  const targetRef = useRef(null); // { x, y, cb }
  const rafRef = useRef(null);
  const bubbleTimer = useRef(null);
  const idleTimer = useRef(null);
  const tourRef = useRef({ active: false, step: 0 });
  posRef.current = pos;

  // ── 이동 엔진 (requestAnimationFrame) ──
  useEffect(function () {
    const tick = function () {
      const tgt = targetRef.current;
      if (tgt) {
        const cur = posRef.current;
        const dx = tgt.x - cur.x, dy = tgt.y - cur.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < WALK_SPEED + 1) {
          setPos({ x: tgt.x, y: tgt.y });
          setWalking(false);
          const cb = tgt.cb;
          targetRef.current = null;
          if (cb) cb();
        } else {
          setFacing(dx < 0 ? "left" : "right");
          setWalking(true);
          setPos({ x: cur.x + (dx / dist) * WALK_SPEED, y: cur.y + (dy / dist) * WALK_SPEED });
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return function () { cancelAnimationFrame(rafRef.current); };
  }, []);

  const walkTo = function (x, y, cb) {
    const c = clampPos(x, y);
    setPointing(false);
    targetRef.current = { x: c.x, y: c.y, cb: cb || null };
  };

  // ── 말하기 ──
  const speak = function (text, opts) {
    setBubble(text);
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    const dur = (opts && opts.duration) || Math.max(3200, Math.min(12000, text.length * 90));
    if (!(opts && opts.sticky)) bubbleTimer.current = setTimeout(function () { setBubble(""); setPointing(false); }, dur);
    if (opts && opts.emotion) setEmotion(opts.emotion);
  };

  // ── data-guide 요소 옆으로 이동해서 가리키기 ──
  const moveToGuide = function (guideId, text, cb) {
    const el = document.querySelector('[data-guide="' + guideId + '"]');
    if (!el) { if (text) speak(text); if (cb) cb(); return; }
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(function () {
      const r = el.getBoundingClientRect();
      const x = Math.min(window.innerWidth - CHAR_W - 12, r.right + 10);
      const y = Math.min(window.innerHeight - CHAR_H - 12, r.top + r.height / 2 - CHAR_H / 3);
      walkTo(x, y, function () {
        setFacing("left");
        setPointing(true);
        // 대상 요소 하이라이트
        const prevShadow = el.style.boxShadow, prevRadius = el.style.borderRadius;
        el.style.boxShadow = "0 0 0 3px #fbbf24, 0 0 18px #fbbf2480";
        el.style.borderRadius = el.style.borderRadius || "12px";
        setTimeout(function () { el.style.boxShadow = prevShadow; el.style.borderRadius = prevRadius; }, 3000);
        if (text) speak(text, { emotion: "happy" });
        if (cb) setTimeout(cb, 2600);
      });
    }, 450);
  };

  // ── 가이드 투어 ──
  const runTourStep = function (stepIdx) {
    if (stepIdx >= TOUR_STEPS.length) {
      tourRef.current.active = false;
      setEmotion("happy");
      walkTo(window.innerWidth - 140, window.innerHeight - 130);
      return;
    }
    tourRef.current = { active: true, step: stepIdx };
    const step = TOUR_STEPS[stepIdx];
    if (onNavigateTab) onNavigateTab(step.tab);
    setTimeout(function () {
      moveToGuide("tab-" + step.tab, step.text, function () {
        if (tourRef.current.active) runTourStep(stepIdx + 1);
      });
    }, 350);
  };
  const startTour = function () { speak("좋아요, 스케줄러 투어를 시작할게요!", { emotion: "happy", duration: 2000 }); setTimeout(function () { runTourStep(0); }, 1400); };
  const stopTour = function () { tourRef.current.active = false; };

  // ── AI 액션 실행 ──
  const executeAction = function (res) {
    const speech = res.speech || "네!";
    const action = res.action || "none";
    const target = res.target || "";
    const emo = res.emotion || "normal";
    if (action === "tour") { startTour(); return; }
    if (action === "open_tab" && GUIDE_MAP[target]) {
      if (onNavigateTab) onNavigateTab(target);
      setTimeout(function () { moveToGuide("tab-" + target, speech); }, 350);
      return;
    }
    if (action === "move_to" && target) { moveToGuide(target.indexOf("tab-") === 0 ? target : "tab-" + target, speech); return; }
    speak(speech, { emotion: emo });
  };

  // ── Claude API 호출 ──
  const askAI = async function () {
    if (!input.trim() || loading) return;
    const q = input.trim();
    setInput("");
    stopTour();
    setLoading(true);
    setEmotion("thinking");
    speak("음... 잠깐만요!", { sticky: true });
    const newHistory = history.concat([{ role: "user", content: q }]).slice(-8);
    const tabList = Object.keys(GUIDE_MAP).map(function (k) { return k + ": " + GUIDE_MAP[k].label + " — " + GUIDE_MAP[k].desc; }).join("\n");
    const system = "당신은 TIMBEL 업무 스케줄러의 마스코트 '팀비'입니다. 밝고 친근하게, 존댓말로, 2문장 이내로 짧게 답하세요.\n" +
      (currentUser ? "지금 대화 중인 사용자: " + currentUser.name + "\n" : "") +
      "\n[스케줄러 탭 목록]\n" + tabList + "\n" +
      (tasksSummary ? "\n[현재 업무 현황]\n" + tasksSummary + "\n" : "") +
      "\n반드시 아래 JSON 형식으로만 응답하세요 (백틱, 설명 금지):\n" +
      '{"speech":"말풍선에 표시할 짧은 대답","action":"none|open_tab|tour","target":"open_tab일 때 탭 id","emotion":"normal|happy|thinking"}\n' +
      "규칙: 특정 기능/탭 위치를 묻거나 '보여줘/어디야/알려줘' 류의 질문이면 action=open_tab + 해당 탭 id. '투어/둘러보기/사용법 전체'를 원하면 action=tour. 그 외 일반 대화·업무 질문은 action=none.";
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 500, system: system, messages: newHistory }),
      });
      const data = await res.json();
      const text = data.content.map(function (c) { return c.text || ""; }).join("");
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setHistory(newHistory.concat([{ role: "assistant", content: text }]));
      executeAction(parsed);
    } catch (e) {
      speak("앗, 지금은 대답하기 어려워요. 잠시 후 다시 시도해주세요!", { emotion: "normal" });
    }
    setLoading(false);
  };

  // ── 심심하면 슬쩍 돌아다니기 ──
  useEffect(function () {
    const wander = function () {
      if (targetRef.current || bubble || chatOpen || tourRef.current.active || hidden) return;
      const x = 60 + Math.random() * (window.innerWidth - 200);
      const y = window.innerHeight - 130 - Math.random() * 40;
      walkTo(x, y);
    };
    idleTimer.current = setInterval(wander, IDLE_WANDER_MS);
    return function () { clearInterval(idleTimer.current); };
  }, [bubble, chatOpen, hidden]);

  // ── 리사이즈 시 화면 밖으로 못 나가게 ──
  useEffect(function () {
    const onResize = function () { setPos(function (p) { return clampPos(p.x, p.y); }); };
    window.addEventListener("resize", onResize);
    return function () { window.removeEventListener("resize", onResize); };
  }, []);

  // ── 첫 등장 인사 ──
  useEffect(function () {
    const timer = setTimeout(function () {
      speak((currentUser ? currentUser.name + "님, " : "") + "안녕하세요! 저는 팀비예요. 클릭해서 말을 걸어보세요!", { emotion: "happy" });
    }, 1200);
    return function () { clearTimeout(timer); };
  }, []);

  if (hidden) {
    return (
      <button onClick={function () { setHidden(false); }} title="팀비 다시 부르기"
        style={{ position: "fixed", left: 14, bottom: 14, zIndex: 9000, width: 40, height: 40, borderRadius: "50%", border: "none", cursor: "pointer", background: "linear-gradient(135deg,#818cf8,#ec4899)", color: "#fff", fontSize: 18, boxShadow: "0 6px 18px #00000060" }}>◕‿◕</button>
    );
  }

  const bubbleVisible = bubble || chatOpen;
  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: [
        "@keyframes tbIdle {0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}",
        "@keyframes tbWalk {0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-5px) rotate(2deg)}}",
        "@keyframes tbBlink {0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(0.08)}}",
        "@keyframes tbTalk {0%,100%{transform:scaleY(1)}50%{transform:scaleY(0.4)}}",
        "@keyframes tbAntenna {0%,100%{opacity:1}50%{opacity:0.4}}",
        "@keyframes tbFootL {0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}",
        "@keyframes tbFootR {0%,100%{transform:translateY(-4px)}50%{transform:translateY(0)}}",
        "@keyframes tbPoint {0%,100%{transform:rotate(0deg)}50%{transform:rotate(-8deg)}}",
        "@keyframes tbShadow {0%,100%{transform:scaleX(1)}50%{transform:scaleX(0.88)}}",
        "@keyframes tbBubbleIn {from{opacity:0;transform:translateY(6px) scale(0.96)}to{opacity:1;transform:translateY(0) scale(1)}}",
        "@keyframes hdIdle {0%,100%{transform:translateY(0) scale(1,1)}50%{transform:translateY(-3px) scale(0.995,1.008)}}",
        "@keyframes hdWalk {0%,100%{transform:translateY(0) rotate(-2.5deg)}25%{transform:translateY(-6px) rotate(0deg)}50%{transform:translateY(0) rotate(2.5deg)}75%{transform:translateY(-6px) rotate(0deg)}}",
        "@keyframes hdTalk {0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-2px) rotate(1.2deg)}}",
        "@keyframes hdShadow {0%,100%{transform:scaleX(1);opacity:0.22}50%{transform:scaleX(0.92);opacity:0.17}}",
        "@keyframes hdShadowWalk {0%,100%{transform:scaleX(1);opacity:0.22}25%,75%{transform:scaleX(0.82);opacity:0.14}}",
        "@keyframes hdEmote {0%,100%{transform:translateY(0);opacity:0.9}50%{transform:translateY(-5px);opacity:1}}",
        "@keyframes hdPoint {0%,100%{transform:translateX(0)}50%{transform:translateX(5px)}}",
        ".tb-idle{animation:tbIdle 2.6s ease-in-out infinite;transform-origin:40px 76px}",
        ".tb-walk{animation:tbWalk 0.35s ease-in-out infinite;transform-origin:40px 76px}",
        ".tb-blink{animation:tbBlink 4s infinite;transform-origin:40px 34px}",
        ".tb-talk{animation:tbTalk 0.3s infinite;transform-origin:40px 46px}",
        ".tb-antenna{animation:tbAntenna 1.6s infinite}",
        ".tb-footL{animation:tbFootL 0.35s infinite}",
        ".tb-footR{animation:tbFootR 0.35s infinite}",
        ".tb-point{animation:tbPoint 0.8s ease-in-out infinite;transform-origin:66px 40px}",
        ".tb-shadow{animation:tbShadow 2.6s ease-in-out infinite;transform-origin:40px 82px}",
        "@media (prefers-reduced-motion: reduce){.tb-idle,.tb-walk,.tb-point,.tb-shadow{animation:none}}",
      ].join("\n") }} />

      {/* 말풍선 + 채팅 */}
      {bubbleVisible ? (
        <div style={{ position: "fixed", left: Math.max(8, Math.min(window.innerWidth - 268, pos.x + CHAR_W / 2 - 130)), top: Math.max(8, pos.y - (chatOpen ? 158 : 96)), zIndex: 9001, width: 260, animation: "tbBubbleIn 0.18s ease-out" }}>
          <div style={{ background: t.surface, border: "1px solid " + t.border, borderRadius: 16, padding: "11px 13px", boxShadow: "0 12px 32px #00000060", position: "relative" }}>
            <button onClick={function () { setBubble(""); setChatOpen(false); setPointing(false); stopTour(); }} style={{ position: "absolute", top: 6, right: 9, background: "none", border: "none", color: t.text2, cursor: "pointer", fontSize: 14, lineHeight: 1 }}>×</button>
            {bubble ? <div style={{ fontSize: 12.5, color: t.text, lineHeight: 1.65, paddingRight: 14, whiteSpace: "pre-wrap" }}>{bubble}</div> : null}
            {loading ? <div style={{ fontSize: 11, color: "#818cf8", marginTop: 5 }}>생각하는 중...</div> : null}
            {chatOpen ? (
              <div style={{ marginTop: bubble ? 9 : 2 }}>
                <div style={{ display: "flex", gap: 5 }}>
                  <input autoFocus value={input} onChange={function (e) { setInput(e.target.value); }} onKeyDown={function (e) { if (e.key === "Enter") askAI(); }} placeholder="팀비에게 물어보세요..." style={{ flex: 1, background: t.inputBg, border: "1px solid " + t.border, borderRadius: 9, padding: "7px 10px", fontSize: 12, color: t.text, outline: "none", minWidth: 0 }} />
                  <button onClick={askAI} disabled={loading} style={{ background: "#6366f1", border: "none", borderRadius: 9, padding: "0 11px", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", flexShrink: 0 }}>→</button>
                </div>
                <div style={{ display: "flex", gap: 4, marginTop: 7, flexWrap: "wrap" }}>
                  <button onClick={startTour} style={{ background: "#fbbf2420", border: "1px solid #fbbf2440", borderRadius: 20, padding: "3px 10px", fontSize: 10.5, color: "#fbbf24", cursor: "pointer", fontWeight: 700 }}>스케줄러 투어</button>
                  <button onClick={function () { setInput("제작 보드는 어떻게 써?"); }} style={{ background: t.inputBg, border: "1px solid " + t.border, borderRadius: 20, padding: "3px 10px", fontSize: 10.5, color: t.text2, cursor: "pointer" }}>보드 사용법</button>
                  <button onClick={function () { setHidden(true); setBubble(""); setChatOpen(false); }} style={{ background: t.inputBg, border: "1px solid " + t.border, borderRadius: 20, padding: "3px 10px", fontSize: 10.5, color: t.text2, cursor: "pointer" }}>잠깐 숨기기</button>
                </div>
              </div>
            ) : null}
            {/* 말풍선 꼬리 */}
            <div style={{ position: "absolute", bottom: -7, left: "50%", marginLeft: -7, width: 14, height: 14, background: t.surface, borderRight: "1px solid " + t.border, borderBottom: "1px solid " + t.border, transform: "rotate(45deg)" }} />
          </div>
        </div>
      ) : null}

      {/* 캐릭터 */}
      <div onClick={function () { setChatOpen(!chatOpen); if (!chatOpen) { setEmotion("happy"); stopTour(); } }}
        title="팀비 (클릭해서 대화)"
        style={{ position: "fixed", left: pos.x, top: pos.y, zIndex: 9000, cursor: "pointer", userSelect: "none", WebkitTapHighlightColor: "transparent" }}>
        <CharacterSprite emotion={emotion} walking={walking} facing={facing} talking={loading} pointing={pointing} />
      </div>
    </div>
  );
}

export default function App() {
  useEffect(function () {
    document.body.style.margin = "0"; document.body.style.padding = "0";
    document.documentElement.style.margin = "0"; document.documentElement.style.padding = "0";
  }, []);
  const [isDark, setIsDarkRaw] = useState(function () { const saved = getCookie("timbel_theme"); return saved === "light" ? false : true; });
  const [calendarMenuOpen, setCalendarMenuOpen] = useState(false);
  const [calendarMenuPos, setCalendarMenuPos] = useState({ top: 0, left: 0 });
  const calendarBtnRef = useRef(null);
  const [opsMenuOpen, setOpsMenuOpen] = useState(false);
  const [opsMenuPos, setOpsMenuPos] = useState({ top: 0, left: 0 });
  const opsBtnRef = useRef(null);
  const setIsDark = function (v) { setIsDarkRaw(v); setCookie("timbel_theme", v ? "dark" : "light", 365); };
  const t = isDark ? DARK : LIGHT;
  useEffect(function () { document.body.style.background = t.bg; document.documentElement.style.background = t.bg; }, [t.bg]);

  const [users, setUsersRaw, usersReady] = useFirebaseData("users", []);
  const [tasks, setTasksRaw, tasksReady] = useFirebaseData("tasks", []);
  const [marketingTasks, setMarketingTasksRaw, marketingTasksReady] = useFirebaseData("marketingTasks", []);
  const [designTasks, setDesignTasksRaw, designTasksReady] = useFirebaseData("designTasks", []);
  const [activityLog, setActivityLogRaw] = useFirebaseData("activityLog", []);
  const [adminAuth, setAdminAuthRaw] = useFirebaseData("adminAuth", { password: DEFAULT_ADMIN_PASSWORD_HASH });
  const [notices, setNoticesRaw, noticesReady] = useFirebaseData("notices", []);
  const [notifications, setNotificationsRaw] = useFirebaseData("notifications", []);
  const [directMessages, setDirectMessagesRaw] = useFirebaseData("directMessages", []);
  const DEFAULT_ROLE_PERMISSIONS = {
    viewer: ALL_TABS.map(function (t) { return t.id; }).filter(function (id) { return ["ad", "ai", "overtime", "activity"].indexOf(id) === -1; }),
    member: ALL_TABS.map(function (t) { return t.id; }).filter(function (id) { return id !== "activity"; }),
    manager: ALL_TABS.map(function (t) { return t.id; }),
  };
  const [rolePermissions, setRolePermissionsRaw] = useFirebaseData("settings/rolePermissions", DEFAULT_ROLE_PERMISSIONS);
  const [staleDays, setStaleDaysRaw] = useFirebaseData("settings/staleDays", 3);
  const [wipLimits, setWipLimitsRaw] = useFirebaseData("settings/wipLimits", {});
  const [requests, setRequestsRaw] = useFirebaseData("requests", []);
  const synced = usersReady && tasksReady && noticesReady && marketingTasksReady && designTasksReady;

  useEffect(function () {
    if (!usersReady || users.length > 0) return;
    setUsersRaw([
      { id: "user_1", name: "박래성", password: DEFAULT_SEED_PASSWORD_HASH, dept: "영상팀", rank: "팀장", position: "디렉터", officePhone: "02-1234-5678", mobile: "010-1234-5678", role: "manager", approved: true },
      { id: "user_2", name: "이한희", password: DEFAULT_SEED_PASSWORD_HASH, dept: "영상팀", rank: "팀원", position: "에디터", officePhone: "02-1234-5679", mobile: "010-9876-5432", role: "member", approved: true },
    ]);
  }, [usersReady]);
  useEffect(function () {
    if (!noticesReady || notices.length > 0) return;
    setNoticesRaw([{ id: "notice_1", title: "시스템 오픈 안내", content: "TIMBEL 업무 스케줄러가 오픈되었습니다!", active: true }]);
  }, [noticesReady]);
  useEffect(function () {
    if (!tasksReady || tasks.length > 0) return;
    setTasksRaw([
      { id: "task_1", title: "6월 메인 브이로그", desc: "월간 하이라이트 영상", assignee: "박래성", priority: "높음", tag: "유튜브", due: "2026-06-30", status: "편집", comments: [] },
      { id: "task_2", title: "신제품 리뷰 영상", desc: "스마트폰 언박싱 & 리뷰", assignee: "이한희", priority: "높음", tag: "유튜브", due: "2026-06-28", status: "촬영", comments: [] },
      { id: "task_3", title: "여름 쇼츠 #1", desc: "15초 숏폼 콘텐츠", assignee: "박래성", priority: "중간", tag: "쇼츠", due: "2026-06-27", status: "업무 완료", comments: [] },
    ]);
  }, [tasksReady]);

  const [currentUser, setCurrentUserRaw] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [tab, setTab] = useState("home");
  const [showAdd, setShowAdd] = useState(false);
  const [addDate, setAddDate] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [showAddMarketing, setShowAddMarketing] = useState(false);
  const [addMarketingDate, setAddMarketingDate] = useState("");
  const [selectedMarketingTask, setSelectedMarketingTask] = useState(null);
  const [showAddDesign, setShowAddDesign] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [addDesignDate, setAddDesignDate] = useState("");
  const [selectedDesignTask, setSelectedDesignTask] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [aiAds, setAiAds] = useFirebaseData("ads/ai", []);
  const [intAds, setIntAds] = useFirebaseData("ads/interview", []);
  const adsData = aiAds.concat(intAds);

  const isAdmin = currentUser && currentUser.role === "admin";
  const isViewer = currentUser && currentUser.role === "viewer";
  const isManager = currentUser && currentUser.role === "manager";
  const myUnreadMessages = currentUser ? directMessages.filter(function (m) { return m.to === currentUser.name && !(m.readBy && m.readBy[currentUser.name]); }).length : 0;

  const setCurrentUser = function (user) {
    setCurrentUserRaw(user);
    if (user) setCookie("timbel_user", JSON.stringify({ id: user.id, name: user.name }), 30);
    else deleteCookie("timbel_user");
  };
  const [mySessionId] = useState(function () { return "sess_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10); });
  const [hasClaimedSession, setHasClaimedSession] = useState(false);
  const [sessionInfo] = useFirebaseData(currentUser ? "sessions/" + currentUser.name : "sessions/_none_", null);
  useEffect(function () {
    if (!currentUser) { setHasClaimedSession(false); return; }
    setHasClaimedSession(false);
    const claim = async function () {
      try {
        await dbSet(ref(rtdb, "sessions/" + currentUser.name), { sessionId: mySessionId, device: (navigator.userAgent || "").slice(0, 80), time: Date.now() });
      } catch (e) {}
      setHasClaimedSession(true);
    };
    claim();
  }, [currentUser ? currentUser.name : null]);
  useEffect(function () {
    if (!currentUser || !hasClaimedSession || !sessionInfo) return;
    if (sessionInfo.sessionId && sessionInfo.sessionId !== mySessionId) {
      alert("다른 기기(또는 브라우저)에서 같은 계정으로 로그인되어, 보안을 위해 이 화면은 자동으로 로그아웃됩니다.");
      setCurrentUser(null);
    }
  }, [sessionInfo, hasClaimedSession]);
  useEffect(function () {
    if (!synced || authChecked) return;
    const saved = getCookie("timbel_user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.id === "admin") setCurrentUserRaw(Object.assign({}, ADMIN_USER, { password: adminAuth ? adminAuth.password : DEFAULT_ADMIN_PASSWORD_HASH }));
        else { const found = users.find(function (u) { return u.id === parsed.id; }); if (found && found.approved) setCurrentUserRaw(found); else deleteCookie("timbel_user"); }
      } catch (e) { deleteCookie("timbel_user"); }
    }
    setAuthChecked(true);
  }, [synced, users]);

  const logActivity = function (action, detail, extra) {
    const entry = Object.assign({ id: "log_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6), actor: currentUser ? currentUser.name : "?", action: action, detail: detail, createdAt: Date.now(), time: new Date().toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) }, extra || {});
    setActivityLogRaw((activityLog || []).concat([entry]));
  };
  const moveTask = function (id, dir) { const tk0 = tasks.find(function (tk) { return tk.id === id; }); setTasksRaw(tasks.map(function (tk) { return tk.id === id ? Object.assign({}, tk, { status: STAGES[STAGES.indexOf(tk.status) + dir], statusChangedAt: Date.now() }) : tk; })); if (tk0) logActivity("단계 변경", "영상 업무 \"" + tk0.title + "\" → " + STAGES[STAGES.indexOf(tk0.status) + dir]); };
  const deleteTask = function (id) { const tk0 = tasks.find(function (tk) { return tk.id === id; }); setTasksRaw(tasks.filter(function (tk) { return tk.id !== id; })); if (tk0) logActivity("삭제", "영상 업무 \"" + tk0.title + "\" 삭제", { restoreType: "video", snapshot: tk0 }); };
  const addTask = function (payload) { setTasksRaw(tasks.concat(payload)); logActivity("생성", (Array.isArray(payload) ? payload : [payload]).length > 1 ? "영상 업무 " + payload.length + "건 등록 (반복)" : "영상 업무 \"" + (Array.isArray(payload) ? payload[0].title : payload.title) + "\" 등록"); };
  const updateTask = function (u) { setTasksRaw(tasks.map(function (tk) { return tk.id === u.id ? u : tk; })); setSelectedTask(u); };
  const updateTaskSeries = function (seriesId, changes) { setTasksRaw(tasks.map(function (tk) { return tk.seriesId === seriesId ? Object.assign({}, tk, changes) : tk; })); setSelectedTask(function (prev) { return Object.assign({}, prev, changes); }); logActivity("일괄 변경", "영상 반복 시리즈 정보 일괄 수정"); };
  const openAdd = function (date) { setAddDate(date || ""); setShowAdd(true); };
  const moveMarketingTask = function (id, dir) { const tk0 = marketingTasks.find(function (tk) { return tk.id === id; }); setMarketingTasksRaw(marketingTasks.map(function (tk) { return tk.id === id ? Object.assign({}, tk, { status: MARKETING_STAGES[MARKETING_STAGES.indexOf(tk.status) + dir], statusChangedAt: Date.now() }) : tk; })); if (tk0) logActivity("단계 변경", "마케팅 업무 \"" + tk0.title + "\" → " + MARKETING_STAGES[MARKETING_STAGES.indexOf(tk0.status) + dir]); };
  const deleteMarketingTask = function (id) { const tk0 = marketingTasks.find(function (tk) { return tk.id === id; }); setMarketingTasksRaw(marketingTasks.filter(function (tk) { return tk.id !== id; })); if (tk0) logActivity("삭제", "마케팅 업무 \"" + tk0.title + "\" 삭제", { restoreType: "marketing", snapshot: tk0 }); };
  const addMarketingTask = function (payload) { setMarketingTasksRaw(marketingTasks.concat(payload)); logActivity("생성", (Array.isArray(payload) ? payload : [payload]).length > 1 ? "마케팅 업무 " + payload.length + "건 등록 (반복)" : "마케팅 업무 \"" + (Array.isArray(payload) ? payload[0].title : payload.title) + "\" 등록"); };
  const updateMarketingTask = function (u) { setMarketingTasksRaw(marketingTasks.map(function (tk) { return tk.id === u.id ? u : tk; })); setSelectedMarketingTask(u); };
  const updateMarketingTaskSeries = function (seriesId, changes) { setMarketingTasksRaw(marketingTasks.map(function (tk) { return tk.seriesId === seriesId ? Object.assign({}, tk, changes) : tk; })); setSelectedMarketingTask(function (prev) { return Object.assign({}, prev, changes); }); logActivity("일괄 변경", "마케팅 반복 시리즈 정보 일괄 수정"); };
  const openAddMarketing = function (date) { setAddMarketingDate(date || ""); setShowAddMarketing(true); };
  const moveDesignTask = function (id, dir) { const tk0 = designTasks.find(function (tk) { return tk.id === id; }); setDesignTasksRaw(designTasks.map(function (tk) { return tk.id === id ? Object.assign({}, tk, { status: DESIGN_STAGES[DESIGN_STAGES.indexOf(tk.status) + dir], statusChangedAt: Date.now() }) : tk; })); if (tk0) logActivity("단계 변경", "디자인 업무 \"" + tk0.title + "\" → " + DESIGN_STAGES[DESIGN_STAGES.indexOf(tk0.status) + dir]); };
  const deleteDesignTask = function (id) { const tk0 = designTasks.find(function (tk) { return tk.id === id; }); setDesignTasksRaw(designTasks.filter(function (tk) { return tk.id !== id; })); if (tk0) logActivity("삭제", "디자인 업무 \"" + tk0.title + "\" 삭제", { restoreType: "design", snapshot: tk0 }); };
  const addDesignTask = function (payload) { setDesignTasksRaw(designTasks.concat(payload)); logActivity("생성", (Array.isArray(payload) ? payload : [payload]).length > 1 ? "디자인 업무 " + payload.length + "건 등록 (반복)" : "디자인 업무 \"" + (Array.isArray(payload) ? payload[0].title : payload.title) + "\" 등록"); };
  const updateDesignTask = function (u) { setDesignTasksRaw(designTasks.map(function (tk) { return tk.id === u.id ? u : tk; })); setSelectedDesignTask(u); };
  const updateDesignTaskSeries = function (seriesId, changes) { setDesignTasksRaw(designTasks.map(function (tk) { return tk.seriesId === seriesId ? Object.assign({}, tk, changes) : tk; })); setSelectedDesignTask(function (prev) { return Object.assign({}, prev, changes); }); logActivity("일괄 변경", "디자인 반복 시리즈 정보 일괄 수정"); };
  const restoreDeletedItem = function (entry) {
    if (!entry.snapshot || !entry.restoreType) return;
    if (entry.restoreType === "video") setTasksRaw(tasks.concat([entry.snapshot]));
    else if (entry.restoreType === "marketing") setMarketingTasksRaw(marketingTasks.concat([entry.snapshot]));
    else if (entry.restoreType === "design") setDesignTasksRaw(designTasks.concat([entry.snapshot]));
    const label = entry.restoreType === "video" ? "영상" : entry.restoreType === "marketing" ? "마케팅" : "디자인";
    logActivity("복구", label + " 업무 \"" + entry.snapshot.title + "\" 복구");
  };
  const cleanupActivityLog = function (cutoffTimestamp) {
    const kept = (activityLog || []).filter(function (e) { return e.createdAt >= cutoffTimestamp; });
    setActivityLogRaw(kept);
  };
  const openAddDesign = function (date) { setAddDesignDate(date || ""); setShowAddDesign(true); };
  const bulkDeleteTasks = function (ids) { setTasksRaw(tasks.filter(function (tk) { return ids.indexOf(tk.id) === -1; })); logActivity("일괄 삭제", "영상 업무 " + ids.length + "건 일괄 삭제"); };
  const bulkAssignTasks = function (ids, assignee) { setTasksRaw(tasks.map(function (tk) { return ids.indexOf(tk.id) !== -1 ? Object.assign({}, tk, { assignee: assignee }) : tk; })); logActivity("일괄 변경", "영상 업무 " + ids.length + "건 담당자를 " + assignee + "(으)로 일괄 변경"); };
  const bulkDeleteMarketingTasks = function (ids) { setMarketingTasksRaw(marketingTasks.filter(function (tk) { return ids.indexOf(tk.id) === -1; })); logActivity("일괄 삭제", "마케팅 업무 " + ids.length + "건 일괄 삭제"); };
  const bulkAssignMarketingTasks = function (ids, assignee) { setMarketingTasksRaw(marketingTasks.map(function (tk) { return ids.indexOf(tk.id) !== -1 ? Object.assign({}, tk, { assignee: assignee }) : tk; })); logActivity("일괄 변경", "마케팅 업무 " + ids.length + "건 담당자를 " + assignee + "(으)로 일괄 변경"); };
  const bulkDeleteDesignTasks = function (ids) { setDesignTasksRaw(designTasks.filter(function (tk) { return ids.indexOf(tk.id) === -1; })); logActivity("일괄 삭제", "디자인 업무 " + ids.length + "건 일괄 삭제"); };
  const bulkAssignDesignTasks = function (ids, assignee) { setDesignTasksRaw(designTasks.map(function (tk) { return ids.indexOf(tk.id) !== -1 ? Object.assign({}, tk, { assignee: assignee }) : tk; })); logActivity("일괄 변경", "디자인 업무 " + ids.length + "건 담당자를 " + assignee + "(으)로 일괄 변경"); };
  const myRoleTabs = rolePermissions && currentUser ? (rolePermissions[currentUser.role] || []) : [];
  const vt = Array.isArray(myRoleTabs) ? myRoleTabs : Object.values(myRoleTabs || {});
  const displayTabs = isAdmin ? ALL_TABS : ALL_TABS.filter(function (tp) { return vt.includes(tp.id); });
  const setRolePermissions = function (next) { setRolePermissionsRaw(next); };

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
  const nowForOverdue = new Date();
  const pad3 = function (n) { return String(n).padStart(2, "0"); };
  const todayStrForOverdue = nowForOverdue.getFullYear() + "-" + pad3(nowForOverdue.getMonth() + 1) + "-" + pad3(nowForOverdue.getDate());
  const in2ForDeadline = new Date(nowForOverdue); in2ForDeadline.setDate(in2ForDeadline.getDate() + 2);
  const in2StrForDeadline = in2ForDeadline.getFullYear() + "-" + pad3(in2ForDeadline.getMonth() + 1) + "-" + pad3(in2ForDeadline.getDate());
  const myOverdueItems = currentUser ? []
    .concat(tasks.filter(function (tk) { return tk.assignee === currentUser.name && tk.due && tk.due < todayStrForOverdue && tk.status === STAGES[0]; }).map(function (tk) { return { id: "ov_video_" + tk.id, kind: "video", typeLabel: "영상", title: tk.title, due: tk.due, ref: tk }; }))
    .concat(marketingTasks.filter(function (mt) { return mt.assignee === currentUser.name && mt.due && mt.due < todayStrForOverdue && mt.status === MARKETING_STAGES[0]; }).map(function (mt) { return { id: "ov_marketing_" + mt.id, kind: "marketing", typeLabel: "마케팅", title: mt.title, due: mt.due, ref: mt }; }))
    .concat(designTasks.filter(function (dt) { return dt.assignee === currentUser.name && dt.due && dt.due < todayStrForOverdue && dt.status === DESIGN_STAGES[0]; }).map(function (dt) { return { id: "ov_design_" + dt.id, kind: "design", typeLabel: "디자인", title: dt.title, due: dt.due, ref: dt }; }))
    : [];
  const myDeadlineItems = currentUser ? []
    .concat(tasks.filter(function (tk) { return tk.assignee === currentUser.name && tk.deadline && tk.status !== "업무 완료" && tk.deadline <= in2StrForDeadline; }).map(function (tk) { return { id: "dl_video_" + tk.id, kind: "video", typeLabel: "영상", title: tk.title, deadline: tk.deadline, isPast: tk.deadline < todayStrForOverdue, alertType: "deadline", ref: tk }; }))
    .concat(marketingTasks.filter(function (mt) { return mt.assignee === currentUser.name && mt.deadline && mt.status !== "완료" && mt.deadline <= in2StrForDeadline; }).map(function (mt) { return { id: "dl_marketing_" + mt.id, kind: "marketing", typeLabel: "마케팅", title: mt.title, deadline: mt.deadline, isPast: mt.deadline < todayStrForOverdue, alertType: "deadline", ref: mt }; }))
    .concat(designTasks.filter(function (dt) { return dt.assignee === currentUser.name && dt.deadline && dt.status !== "완료" && dt.deadline <= in2StrForDeadline; }).map(function (dt) { return { id: "dl_design_" + dt.id, kind: "design", typeLabel: "디자인", title: dt.title, deadline: dt.deadline, isPast: dt.deadline < todayStrForOverdue, alertType: "deadline", ref: dt }; }))
    : [];
  const allAlertItems = myOverdueItems.concat(myDeadlineItems);
  const handleOverdueClick = function (item) {
    if (item.kind === "video") { setTab("calendar"); setSelectedTask(item.ref); }
    else if (item.kind === "marketing") { setTab("adCalendar"); setSelectedMarketingTask(item.ref); }
    else if (item.kind === "design") { setTab("designCalendar"); setSelectedDesignTask(item.ref); }
  };

  if (!synced || !authChecked) {
    return (
      <div style={{ minHeight: "100vh", background: t.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system,sans-serif", gap: 16 }}>
        <div style={{ display: "flex", justifyContent: "center" }}><Film size={28} strokeWidth={1.5} color={t.text} /></div>
        <div style={{ fontSize: 15, fontWeight: 700, color: t.text }}>TIMBEL 업무 스케줄러</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#fbbf24", fontSize: 13 }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fbbf24" }} />Firebase 연결 중...</div>
      </div>
    );
  }
  if (!currentUser) {
    return (
      <ThemeCtx.Provider value={{ t: t, isDark: isDark }}>
        <AuthScreen onLogin={setCurrentUser} users={users} onRegister={async function (u) { await setUsersRaw(users.concat([u])); }} adminPasswordHash={adminAuth ? adminAuth.password : DEFAULT_ADMIN_PASSWORD_HASH} onUpgradeUser={function (u) { setUsersRaw(users.map(function (x) { return x.id === u.id ? u : x; })); }} onToggleDark={setIsDark} onSubmitRequest={function (reqForm) {
          const requesterLabel = reqForm.requesterName + (reqForm.requesterTeam ? " (" + reqForm.requesterTeam + ")" : "") + " · 비회원";
          const newReq = { id: "req_" + Date.now(), title: reqForm.title, desc: reqForm.desc, type: reqForm.type, desiredDate: reqForm.desiredDate, urgency: reqForm.urgency, assignee: reqForm.assignee, requester: requesterLabel, status: "대기", createdAt: Date.now() };
          setRequestsRaw((requests || []).concat([newReq]));
          const notifText = reqForm.title + " (" + reqForm.type + ") 비회원 업무 요청이 접수됐어요";
          sendNotification("admin", requesterLabel, reqForm.title, notifText);
          if (reqForm.assignee) sendNotification(reqForm.assignee, requesterLabel, reqForm.title, notifText);
        }} />
      </ThemeCtx.Provider>
    );
  }

  return (
    <ThemeCtx.Provider value={{ t: t, isDark: isDark }}>
      <div style={{ minHeight: "100vh", background: t.bg, fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", color: t.text }}>
        <style dangerouslySetInnerHTML={{ __html: "button:not(:disabled){transition:opacity .15s ease,transform .1s ease,box-shadow .15s ease;} button:not(:disabled):hover{opacity:.85;} button:not(:disabled):active{transform:scale(0.97);} input,select,textarea{transition:border-color .15s ease,box-shadow .15s ease;} input:focus,select:focus,textarea:focus{outline:none;border-color:#6366f1 !important;box-shadow:0 0 0 3px rgba(99,102,241,0.16);}" }} />
        <FloatingChatWidget tasks={tasks} marketingTasks={marketingTasks} designTasks={designTasks} />
        <TimbelAssistant isDark={isDark} onNavigateTab={setTab} currentUser={currentUser} tasksSummary={tasks.concat(marketingTasks).concat(designTasks).slice(0, 30).map(function (tk) { return "[" + tk.status + "] " + tk.title + " (담당:" + tk.assignee + ")"; }).join("\n")} />
        {showAdd ? <AddTaskModal onAdd={addTask} onClose={function () { setShowAdd(false); }} defaultDate={addDate} users={users} title="업무 추가" categories={TASK_CATEGORIES} allTasks={tasks} /> : null}
        {selectedTask ? <TaskDetailModal task={selectedTask} onClose={function () { setSelectedTask(null); }} onUpdate={updateTask} onMove={isViewer ? null : function (id, dir) { moveTask(id, dir); setSelectedTask(function (prev) { return Object.assign({}, prev, { status: STAGES[STAGES.indexOf(prev.status) + dir] }); }); }} users={users} currentUser={currentUser} onNotify={sendNotification} editTitle="업무 정보 수정" categories={TASK_CATEGORIES} allTasks={tasks} onUpdateSeries={isViewer ? null : updateTaskSeries} /> : null}
        {showAddMarketing ? <AddTaskModal onAdd={addMarketingTask} onClose={function () { setShowAddMarketing(false); }} defaultDate={addMarketingDate} users={users} stages={MARKETING_STAGES} tags={MARKETING_TAGS} title="새 마케팅 업무 추가" categoryLabel="카테고리" allTasks={marketingTasks} /> : null}
        {selectedMarketingTask ? <TaskDetailModal task={selectedMarketingTask} onClose={function () { setSelectedMarketingTask(null); }} onUpdate={updateMarketingTask} onMove={isViewer ? null : function (id, dir) { moveMarketingTask(id, dir); setSelectedMarketingTask(function (prev) { return Object.assign({}, prev, { status: MARKETING_STAGES[MARKETING_STAGES.indexOf(prev.status) + dir] }); }); }} users={users} currentUser={currentUser} onNotify={sendNotification} stages={MARKETING_STAGES} stageColor={MARKETING_STAGE_COLOR} stageIcon={MARKETING_STAGE_ICON} tags={MARKETING_TAGS} categoryLabel="카테고리" editTitle="마케팅 업무 수정" allTasks={marketingTasks} onUpdateSeries={isViewer ? null : updateMarketingTaskSeries} /> : null}
        {showAddDesign ? <AddTaskModal onAdd={addDesignTask} onClose={function () { setShowAddDesign(false); }} defaultDate={addDesignDate} users={users} stages={DESIGN_STAGES} tags={DESIGN_TAGS} title="새 디자인 업무 추가" categoryLabel="카테고리" allTasks={designTasks} /> : null}
        {showSearch ? <SearchModal videoTasks={tasks} marketingTasks={marketingTasks} designTasks={designTasks} ads={adsData} onSelectVideo={setSelectedTask} onSelectMarketing={setSelectedMarketingTask} onSelectDesign={setSelectedDesignTask} onNavigateTab={setTab} onClose={function () { setShowSearch(false); }} /> : null}
        {selectedDesignTask ? <TaskDetailModal task={selectedDesignTask} onClose={function () { setSelectedDesignTask(null); }} onUpdate={updateDesignTask} onMove={isViewer ? null : function (id, dir) { moveDesignTask(id, dir); setSelectedDesignTask(function (prev) { return Object.assign({}, prev, { status: DESIGN_STAGES[DESIGN_STAGES.indexOf(prev.status) + dir] }); }); }} users={users} currentUser={currentUser} onNotify={sendNotification} stages={DESIGN_STAGES} stageColor={DESIGN_STAGE_COLOR} stageIcon={DESIGN_STAGE_ICON} tags={DESIGN_TAGS} categoryLabel="카테고리" editTitle="디자인 업무 수정" allTasks={designTasks} onUpdateSeries={isViewer ? null : updateDesignTaskSeries} /> : null}
        {showProfile ? <ProfileModal currentUser={currentUser} onClose={function () { setShowProfile(false); }} onUpdate={function (updated) { if (isAdmin) { setAdminAuthRaw({ password: updated.password }); setCurrentUser(updated); } else { setUsersRaw(users.map(function (u) { return u.id === updated.id ? updated : u; })); setCurrentUser(updated); } setShowProfile(false); }} /> : null}

        <div style={{ boxShadow: "0 1px 0 " + t.border, padding: "12px clamp(10px,4vw,24px)", display: "flex", flexWrap: "wrap", rowGap: 8, justifyContent: "space-between", alignItems: "center", background: t.headerBg, position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", rowGap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 15, fontWeight: 900, color: "#818cf8", letterSpacing: "2px" }}>TIMBEL</span><span style={{ fontSize: 13, fontWeight: 600, color: t.text3 }}>업무 스케줄러</span></div>
            {isAdmin ? <span style={{ fontSize: 10, background: "#f8717120", color: "#f87171", border: "1px solid #f8717140", borderRadius: 20, padding: "2px 9px", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 3 }}><Shield size={10} strokeWidth={2} /> 관리자</span> : null}
            <span title={"영상 " + tasks.length + " · 마케팅 " + marketingTasks.length + " · 디자인 " + designTasks.length} style={{ fontSize: 11, color: t.text4, background: t.surface2, padding: "2px 9px", borderRadius: 20, border: "1px solid " + t.border, cursor: "default" }}>{tasks.length + marketingTasks.length + designTasks.length}개</span>
            <SyncBadge synced={synced} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", rowGap: 6 }}>
            <button onClick={function () { setShowSearch(true); }} style={{ background: t.surface2, border: "none", borderRadius: 20, padding: "8px 11px", cursor: "pointer", display: "flex", alignItems: "center" }}><Search size={16} strokeWidth={1.75} color={t.text3} /></button>
            <NotificationBell notifications={notifications || []} currentUser={currentUser} onMarkRead={markNotifRead} onMarkAllRead={markAllNotifsRead} onClickNotif={handleNotifClick} overdueItems={allAlertItems} onClickOverdue={handleOverdueClick} />
            <div style={{ display: "flex", alignItems: "center", background: t.surface2, border: "none", borderRadius: 12, padding: 3, gap: 2 }}>
              <button onClick={function () { setIsDark(false); }} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: !isDark ? "#fff" : "transparent", color: !isDark ? "#1e293b" : t.text4, fontWeight: !isDark ? 700 : 500, fontSize: 12 }}><Sun size={13} strokeWidth={2} /> 일반</button>
              <button onClick={function () { setIsDark(true); }} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: isDark ? "#1e293b" : "transparent", color: isDark ? "#818cf8" : t.text4, fontWeight: isDark ? 700 : 500, fontSize: 12 }}><Moon size={13} strokeWidth={2} /> 다크</button>
            </div>
            {displayTabs.some(function (tp) { return tp.id === "messages"; }) ? (
              <button data-guide="tab-messages" onClick={function () { setTab("messages"); }} style={{ position: "relative", background: tab === "messages" ? "#6366f1" : t.surface2, border: "none", borderRadius: 20, padding: "8px 11px", cursor: "pointer", fontSize: 15, color: tab === "messages" ? "#fff" : t.text3, display: "flex", alignItems: "center" }} title="메시지(메모)">
                <MessageCircle size={16} strokeWidth={1.75} />
                {myUnreadMessages > 0 ? <span style={{ position: "absolute", top: -4, right: -4, background: "#f87171", color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 99, minWidth: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>{myUnreadMessages > 9 ? "9+" : myUnreadMessages}</span> : null}
              </button>
            ) : null}
            <div style={{ display: "flex", alignItems: "center", gap: 7, background: t.surface2, border: "none", borderRadius: 12, padding: "5px 12px" }}>
              <Avatar name={currentUser.name} size={22} users={users} />
              <div><div style={{ fontSize: 12, fontWeight: 700, color: t.text }}>{currentUser.name}</div><div style={{ fontSize: 10, color: t.text4 }}>{currentUser.rank} · {currentUser.position}</div></div>
            </div>
            <button onClick={function () { setShowProfile(true); }} style={{ display: "flex", alignItems: "center", gap: 5, background: t.surface2, border: "none", borderRadius: 10, padding: "7px 12px", fontSize: 12, color: t.text4, cursor: "pointer" }}><UserCog size={13} strokeWidth={2} /> 내 정보</button>
            <button onClick={function () { setCurrentUser(null); }} style={{ background: t.surface2, border: "none", borderRadius: 10, padding: "7px 12px", fontSize: 12, color: t.text4, cursor: "pointer" }}>로그아웃</button>
            {!isAdmin && !isViewer ? <button onClick={function () { openAdd(); }} style={{ background: "#6366f1", border: "none", borderRadius: 10, padding: "7px 15px", fontWeight: 700, fontSize: 13, color: "#fff", cursor: "pointer" }}>+ 추가</button> : null}
          </div>
        </div>

        <NoticeBanner notices={notices} />

        {(function () {
          const CALENDAR_TAB_IDS = ["unified", "calendar", "adCalendar", "designCalendar", "timeline"];
          const OPS_TAB_IDS = ["overtime", "activity"];
          const calendarTabs = displayTabs.filter(function (tp) { return CALENDAR_TAB_IDS.indexOf(tp.id) !== -1; });
          const opsTabs = displayTabs.filter(function (tp) { return OPS_TAB_IDS.indexOf(tp.id) !== -1; });
          const otherTabs = displayTabs.filter(function (tp) { return CALENDAR_TAB_IDS.indexOf(tp.id) === -1 && OPS_TAB_IDS.indexOf(tp.id) === -1; });
          const calendarActive = CALENDAR_TAB_IDS.indexOf(tab) !== -1;
          const opsActive = OPS_TAB_IDS.indexOf(tab) !== -1;
          const activeCalendarTab = calendarTabs.find(function (tp) { return tp.id === tab; });
          const activeOpsTab = opsTabs.find(function (tp) { return tp.id === tab; });
          const tabBtnStyle = function (active, color) { return { position: "relative", flexShrink: 0, display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", background: active ? (color || "#6366f1") + "16" : "none", border: "none", borderRadius: 20, cursor: "pointer", fontWeight: active ? 700 : 500, fontSize: 13, color: active ? (color || "#818cf8") : t.text4, whiteSpace: "nowrap", transition: "background .15s" }; };
          return (
            <div style={{ boxShadow: "0 1px 0 " + t.border, padding: "8px clamp(6px,3vw,24px)", background: t.headerBg, overflowX: "auto", overflowY: "hidden", WebkitOverflowScrolling: "touch" }}>
              <div style={{ maxWidth: 1300, margin: "0 auto", display: "flex", gap: 2, justifyContent: "center", width: "max-content", minWidth: "100%" }}>
                {isAdmin ? <button data-guide="tab-admin" onClick={function () { setTab("admin"); }} style={tabBtnStyle(tab === "admin", "#f87171")}><Shield size={15} strokeWidth={1.75} />관리자</button> : null}
                {otherTabs.filter(function (tp) { return tp.id === "home"; }).map(function (tp) { return <button key={tp.id} data-guide={"tab-" + tp.id} onClick={function () { setTab(tp.id); }} style={tabBtnStyle(tab === tp.id)}><tp.icon size={15} strokeWidth={1.75} />{tp.text}</button>; })}
                {calendarTabs.length > 0 ? (
                  <div style={{ position: "relative" }}>
                    <button ref={calendarBtnRef} onClick={function () {
                      if (!calendarMenuOpen && calendarBtnRef.current) {
                        const rect = calendarBtnRef.current.getBoundingClientRect();
                        setCalendarMenuPos({ top: rect.bottom + 4, left: rect.left });
                      }
                      setCalendarMenuOpen(!calendarMenuOpen);
                    }} style={tabBtnStyle(calendarActive)}><Calendar size={15} strokeWidth={1.75} />{activeCalendarTab ? activeCalendarTab.text : "캘린더"} ▾</button>
                    {calendarMenuOpen ? <div style={{ position: "fixed", inset: 0, zIndex: 90 }} onClick={function () { setCalendarMenuOpen(false); }} /> : null}
                    {calendarMenuOpen ? (
                      <div style={{ position: "fixed", top: calendarMenuPos.top, left: calendarMenuPos.left, minWidth: 190, background: t.surface, border: "1px solid " + t.border, borderRadius: 12, boxShadow: "0 12px 32px #000a", overflow: "hidden", zIndex: 95 }}>
                        {calendarTabs.map(function (tp) { return <button key={tp.id} data-guide={"tab-" + tp.id} onClick={function () { setTab(tp.id); setCalendarMenuOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", padding: "10px 14px", background: tab === tp.id ? "#6366f118" : "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: tab === tp.id ? 700 : 500, color: tab === tp.id ? "#818cf8" : t.text3, whiteSpace: "nowrap" }}><tp.icon size={15} strokeWidth={1.75} />{tp.text}</button>; })}
                      </div>
                    ) : null}
                  </div>
                ) : null}
                {otherTabs.filter(function (tp) { return tp.id !== "home" && tp.id !== "messages"; }).map(function (tp) { return <button key={tp.id} data-guide={"tab-" + tp.id} onClick={function () { setTab(tp.id); }} style={tabBtnStyle(tab === tp.id)}><tp.icon size={15} strokeWidth={1.75} />{tp.text}</button>; })}
                {opsTabs.length > 0 ? (
                  <div style={{ position: "relative" }}>
                    <button ref={opsBtnRef} onClick={function () {
                      if (!opsMenuOpen && opsBtnRef.current) {
                        const rect = opsBtnRef.current.getBoundingClientRect();
                        setOpsMenuPos({ top: rect.bottom + 4, left: rect.left });
                      }
                      setOpsMenuOpen(!opsMenuOpen);
                    }} style={tabBtnStyle(opsActive)}><Settings size={15} strokeWidth={1.75} />{activeOpsTab ? activeOpsTab.text : "관리 도구"} ▾</button>
                    {opsMenuOpen ? <div style={{ position: "fixed", inset: 0, zIndex: 90 }} onClick={function () { setOpsMenuOpen(false); }} /> : null}
                    {opsMenuOpen ? (
                      <div style={{ position: "fixed", top: opsMenuPos.top, left: opsMenuPos.left, minWidth: 190, background: t.surface, border: "1px solid " + t.border, borderRadius: 12, boxShadow: "0 12px 32px #000a", overflow: "hidden", zIndex: 95 }}>
                        {opsTabs.map(function (tp) { return <button key={tp.id} data-guide={"tab-" + tp.id} onClick={function () { setTab(tp.id); setOpsMenuOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", padding: "10px 14px", background: tab === tp.id ? "#6366f118" : "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: tab === tp.id ? 700 : 500, color: tab === tp.id ? "#818cf8" : t.text3, whiteSpace: "nowrap" }}><tp.icon size={15} strokeWidth={1.75} />{tp.text}</button>; })}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })()}

        <div style={{ maxWidth: 1300, margin: "0 auto", padding: "clamp(10px,4vw,20px)", minWidth: 0, boxSizing: "border-box" }}>
          {tab === "admin" && isAdmin ? <AdminPanel users={users} onUpdateUsers={setUsersRaw} notices={notices} onUpdateNotices={setNoticesRaw} rolePermissions={rolePermissions || DEFAULT_ROLE_PERMISSIONS} setRolePermissions={setRolePermissions} tasks={tasks} onUpdateTasks={setTasksRaw} staleDays={staleDays} setStaleDays={setStaleDaysRaw} wipLimits={wipLimits} setWipLimits={setWipLimitsRaw} /> : null}
          {tab === "home" ? <HomePanel currentUser={currentUser} users={users} videoTasks={tasks} marketingTasks={marketingTasks} designTasks={designTasks} onSelectVideo={setSelectedTask} onSelectMarketing={setSelectedMarketingTask} onSelectDesign={setSelectedDesignTask} staleDays={staleDays} /> : null}
          {tab === "unified" ? <CombinedCalendarView videoTasks={tasks} marketingTasks={marketingTasks} designTasks={designTasks} ads={adsData} onSelectVideo={setSelectedTask} onSelectMarketing={setSelectedMarketingTask} onSelectDesign={setSelectedDesignTask} onSelectAd={function () { setTab("ad"); }} users={users} onBulkDeleteVideo={isViewer ? null : bulkDeleteTasks} onBulkAssignVideo={isViewer ? null : bulkAssignTasks} onBulkDeleteMarketing={isViewer ? null : bulkDeleteMarketingTasks} onBulkAssignMarketing={isViewer ? null : bulkAssignMarketingTasks} onBulkDeleteDesign={isViewer ? null : bulkDeleteDesignTasks} onBulkAssignDesign={isViewer ? null : bulkAssignDesignTasks} /> : null}
          {tab === "calendar" ? <CalendarView tasks={tasks} onSelectTask={setSelectedTask} onAddTask={isViewer ? function () {} : openAdd} ads={adsData} onMove={isViewer ? null : moveTask} onDelete={isViewer ? null : deleteTask} onSelectAd={function () { setTab("ad"); }} onBulkDelete={isViewer ? null : bulkDeleteTasks} onBulkAssign={isViewer ? null : bulkAssignTasks} users={users} currentUser={currentUser} categoryOptions={TASK_CATEGORIES} categoryField="category" /> : null}
          {tab === "adCalendar" ? <CalendarView tasks={marketingTasks} onSelectTask={setSelectedMarketingTask} onAddTask={isViewer ? function () {} : openAddMarketing} ads={adsData} onMove={isViewer ? null : moveMarketingTask} onDelete={isViewer ? null : deleteMarketingTask} onSelectAd={function () { setTab("ad"); }} stages={MARKETING_STAGES} stageColor={MARKETING_STAGE_COLOR} stageIcon={MARKETING_STAGE_ICON} taskLabel="마케팅 업무" taskUnitLabel="업무" onBulkDelete={isViewer ? null : bulkDeleteMarketingTasks} onBulkAssign={isViewer ? null : bulkAssignMarketingTasks} users={users} currentUser={currentUser} categoryOptions={MARKETING_TAGS} categoryField="tag" /> : null}
          {tab === "designCalendar" ? <CalendarView tasks={designTasks} onSelectTask={setSelectedDesignTask} onAddTask={isViewer ? function () {} : openAddDesign} ads={[]} onMove={isViewer ? null : moveDesignTask} onDelete={isViewer ? null : deleteDesignTask} stages={DESIGN_STAGES} stageColor={DESIGN_STAGE_COLOR} stageIcon={DESIGN_STAGE_ICON} taskLabel="디자인 업무" taskUnitLabel="업무" onBulkDelete={isViewer ? null : bulkDeleteDesignTasks} onBulkAssign={isViewer ? null : bulkAssignDesignTasks} users={users} currentUser={currentUser} categoryOptions={DESIGN_TAGS} categoryField="tag" /> : null}
          {tab === "timeline" ? <TimelineView videoTasks={tasks} marketingTasks={marketingTasks} designTasks={designTasks} onSelectVideo={setSelectedTask} onSelectMarketing={setSelectedMarketingTask} onSelectDesign={setSelectedDesignTask} users={users} currentUser={currentUser} /> : null}
          {tab === "board" ? <BoardView tasks={tasks} onSelectTask={setSelectedTask} onMove={isViewer ? null : moveTask} onDelete={isViewer ? null : deleteTask} users={users} ads={adsData} onSelectAd={function () { setTab("ad"); }} designTasks={designTasks} onSelectDesign={setSelectedDesignTask} marketingTasks={marketingTasks} onSelectMarketing={setSelectedMarketingTask} onBulkDeleteTasks={isViewer ? null : bulkDeleteTasks} onBulkAssignTasks={isViewer ? null : bulkAssignTasks} onBulkDeleteMarketing={isViewer ? null : bulkDeleteMarketingTasks} onBulkAssignMarketing={isViewer ? null : bulkAssignMarketingTasks} onBulkDeleteDesign={isViewer ? null : bulkDeleteDesignTasks} onBulkAssignDesign={isViewer ? null : bulkAssignDesignTasks} currentUser={currentUser} wipLimits={wipLimits} /> : null}
          {tab === "ad" ? <AdPanel aiAds={aiAds} setAiAds={setAiAds} intAds={intAds} setIntAds={setIntAds} onNewAd={sendAdNotification} currentUser={currentUser} /> : null}
          {tab === "stats" ? <div style={{ maxWidth: 760, margin: "0 auto" }}><StatsPanel videoTasks={tasks} marketingTasks={marketingTasks} designTasks={designTasks} currentUser={currentUser} /></div> : null}
          {tab === "overtime" ? <OvertimePanel currentUser={currentUser} users={users} isAdmin={isAdmin} /> : null}
          {tab === "messages" ? <MessagesPanel currentUser={currentUser} users={users} isAdmin={isAdmin} messages={directMessages} setMessages={setDirectMessagesRaw} /> : null}
          {tab === "ai" ? <AIPanel tasks={tasks} users={users} ads={adsData} designTasks={designTasks} /> : null}
          {tab === "activity" ? <ActivityLogPanel log={activityLog} onRestore={restoreDeletedItem} onCleanup={cleanupActivityLog} isAdmin={isAdmin} /> : null}
          {tab === "requests" ? <RequestsPanel requests={requests} setRequests={setRequestsRaw} currentUser={currentUser} isManager={isManager || isAdmin} users={users} onNotify={sendNotification} /> : null}
        </div>
      </div>
    </ThemeCtx.Provider>
  );
}
