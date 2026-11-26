import type { IconType } from 'react-icons';
import {
  LuArrowLeft, LuArrowRight, LuArrowUpRight, LuBaby, LuBell, LuBookOpen, LuCake, LuCalendar, LuCalendarDays, LuCamera, LuCar,
  LuChartBar, LuCheck, LuChevronDown, LuChevronUp, LuCircleAlert, LuCircleCheck, LuClapperboard, LuClock, LuCopy, LuCrown, LuDownload, LuDrum,
  LuExternalLink, LuEye, LuFileSpreadsheet, LuFileText, LuFilm, LuFlag, LuFlame, LuFlower, LuFlower2, LuFolderOpen, LuFrame, LuGem, LuGift, LuGlobe,
  LuGripVertical, LuHeart, LuHeartHandshake, LuHouse, LuImage, LuInfinity, LuInfo, LuKeyRound, LuLanguages, LuLayoutDashboard, LuLayoutTemplate,
  LuLink, LuListChecks, LuLock, LuLogOut, LuMail, LuMailOpen, LuMapPin, LuMaximize2, LuMegaphone, LuMenu, LuMessageCircle, LuMonitor, LuMoon,
  LuMousePointerClick, LuMusic, LuPalette, LuPartyPopper, LuPause, LuPencil, LuPenLine, LuPhone, LuPlane, LuPlay, LuPlus, LuQrCode, LuQuote,
  LuRedo2, LuRotateCcw, LuSearch, LuSend, LuSettings, LuShare2, LuShieldCheck, LuSlidersHorizontal, LuSmartphone, LuSparkles, LuSprout, LuStar,
  LuSun, LuTablet, LuTicket, LuTimer, LuTrash2, LuTrophy, LuType, LuUndo2, LuUpload, LuUserCheck, LuUsers, LuVolume2, LuVolumeX, LuX, LuZap,
} from 'react-icons/lu';

const ICONS = {
  // occasions
  wedding: LuGem, engagement: LuHeartHandshake, haldi: LuFlower2, sangeet: LuMusic, baby: LuBaby, birthday: LuCake,
  car: LuCar, home: LuHouse, family: LuPartyPopper, anniversary: LuHeart,
  // festivals
  diwali: LuFlame, holi: LuPalette, navratri: LuDrum, rakhi: LuInfinity, ganesh: LuFlower, 'new-year': LuSparkles,
  // love story
  book: LuBookOpen, rose: LuFlower, gift: LuGift, plane: LuPlane, letter: LuMailOpen, heart: LuHeart, lock: LuLock, key: LuKeyRound,
  // features
  film: LuFilm, clapper: LuClapperboard, 'user-check': LuUserCheck, calendar: LuCalendar, 'calendar-days': LuCalendarDays, access: LuShieldCheck,
  sheet: LuFileSpreadsheet, chat: LuMessageCircle, rsvp: LuCircleCheck, timer: LuTimer, pin: LuMapPin, users: LuUsers, ticket: LuTicket, send: LuSend,
  // ui
  'arrow-left': LuArrowLeft, 'arrow-right': LuArrowRight, 'arrow-up-right': LuArrowUpRight, external: LuExternalLink, menu: LuMenu, close: LuX,
  play: LuPlay, pause: LuPause, volume: LuVolume2, mute: LuVolumeX, replay: LuRotateCcw, maximize: LuMaximize2, undo: LuUndo2, redo: LuRedo2,
  download: LuDownload, share: LuShare2, copy: LuCopy, camera: LuCamera, image: LuImage, search: LuSearch, phone: LuSmartphone, tablet: LuTablet,
  monitor: LuMonitor, pen: LuPenLine, pencil: LuPencil, quote: LuQuote, palette: LuPalette, type: LuType, up: LuChevronUp, down: LuChevronDown,
  trash: LuTrash2, plus: LuPlus, check: LuCheck, sparkles: LuSparkles, star: LuStar, crown: LuCrown, sun: LuSun, moon: LuMoon, sprout: LuSprout,
  mail: LuMail, call: LuPhone, upload: LuUpload, eye: LuEye, info: LuInfo, alert: LuCircleAlert, clock: LuClock, link: LuLink, qr: LuQrCode,
  globe: LuGlobe, languages: LuLanguages, frame: LuFrame, click: LuMousePointerClick, file: LuFileText, grip: LuGripVertical, chart: LuChartBar,
  flag: LuFlag, folder: LuFolderOpen, trophy: LuTrophy, bell: LuBell, megaphone: LuMegaphone, settings: LuSettings, logout: LuLogOut,
  dashboard: LuLayoutDashboard, templates: LuLayoutTemplate, sliders: LuSlidersHorizontal, list: LuListChecks, zap: LuZap,
} satisfies Record<string, IconType>;

export type IconName = keyof typeof ICONS;

export default function Icon({ name, size = '1em', className, title }: { name: IconName | string; size?: number | string; className?: string; title?: string }) {
  const C = ICONS[name as IconName] ?? LuSparkles;
  return <C className={'ic' + (className ? ' ' + className : '')} size={size} aria-hidden={title ? undefined : true} title={title} focusable="false" />;
}
