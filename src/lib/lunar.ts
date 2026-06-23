import { Solar } from "lunar-typescript";

export interface LunarDateInfo {
  yearGanZhi: string;
  yearShengXiao: string;
  monthChinese: string;
  dayChinese: string;
  isLeapMonth: boolean;
  isFirstDayOfMonth: boolean;
  festivals: string[];
  solarTerm: string | null;
  fullLabel: string;
  cellLabel: string;
}

const SIMPLIFIED_TO_TRADITIONAL: Record<string, string> = {
  "春节": "農曆新年",
  "元宵节": "元宵節",
  "端午节": "端午節",
  "七夕节": "七夕",
  "中元节": "中元節",
  "中秋节": "中秋節",
  "重阳节": "重陽節",
  "除夕": "除夕",
  "腊八节": "臘八節",
  "小年": "小年",
};

const SOLAR_TERM_TRADITIONAL: Record<string, string> = {
  "小寒": "小寒", "大寒": "大寒", "立春": "立春", "雨水": "雨水",
  "惊蛰": "驚蟄", "春分": "春分", "清明": "清明", "谷雨": "穀雨",
  "立夏": "立夏", "小满": "小滿", "芒种": "芒種", "夏至": "夏至",
  "小暑": "小暑", "大暑": "大暑", "立秋": "立秋", "处暑": "處暑",
  "白露": "白露", "秋分": "秋分", "寒露": "寒露", "霜降": "霜降",
  "立冬": "立冬", "小雪": "小雪", "大雪": "大雪", "冬至": "冬至",
};

const SHENGXIAO_TRADITIONAL: Record<string, string> = {
  "鼠": "鼠", "牛": "牛", "虎": "虎", "兔": "兔",
  "龙": "龍", "蛇": "蛇", "马": "馬", "羊": "羊",
  "猴": "猴", "鸡": "雞", "狗": "狗", "猪": "豬",
};

const cache = new Map<string, LunarDateInfo>();

export function getLunarInfo(year: number, month: number, day: number): LunarDateInfo {
  const key = `${year}-${month}-${day}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();

  const yearGanZhi = lunar.getYearInGanZhi();
  const rawShengXiao = lunar.getYearShengXiao();
  const yearShengXiao = SHENGXIAO_TRADITIONAL[rawShengXiao] || rawShengXiao;
  const monthChinese = lunar.getMonthInChinese();
  const dayChinese = lunar.getDayInChinese();
  const isLeapMonth = lunar.getMonth() < 0;
  const isFirstDayOfMonth = lunar.getDay() === 1;

  const rawFestivals: string[] = lunar.getFestivals() || [];
  const festivals = rawFestivals.map(
    (f: string) => SIMPLIFIED_TO_TRADITIONAL[f] || f
  );

  const rawJieQi = lunar.getJieQi();
  const solarTerm = rawJieQi
    ? SOLAR_TERM_TRADITIONAL[rawJieQi] || rawJieQi
    : null;

  let cellLabel: string;
  if (solarTerm) {
    cellLabel = solarTerm;
  } else if (isFirstDayOfMonth) {
    cellLabel = isLeapMonth ? `閏${monthChinese}月` : `${monthChinese}月`;
  } else {
    cellLabel = dayChinese;
  }

  const monthDisplay = isLeapMonth ? `閏${monthChinese}月` : `${monthChinese}月`;
  const fullLabel = `${yearGanZhi}年 ${monthDisplay}${dayChinese}`;

  const info: LunarDateInfo = {
    yearGanZhi,
    yearShengXiao,
    monthChinese,
    dayChinese,
    isLeapMonth,
    isFirstDayOfMonth,
    festivals,
    solarTerm,
    fullLabel,
    cellLabel,
  };

  cache.set(key, info);
  return info;
}

export function getLunarInfoFromDateStr(dateStr: string): LunarDateInfo {
  const [y, m, d] = dateStr.split("-").map(Number);
  return getLunarInfo(y, m, d);
}
