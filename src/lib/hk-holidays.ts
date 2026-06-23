export interface HKHoliday {
  date: string;
  name: string;
  nameCN: string;
}

const VARIABLE_HOLIDAYS: Record<number, Array<{ date: string; name: string; nameCN: string }>> = {
  2024: [
    { date: "2024-02-10", name: "Lunar New Year's Day", nameCN: "農曆年初一" },
    { date: "2024-02-12", name: "Third day of Lunar New Year", nameCN: "農曆年初三" },
    { date: "2024-02-13", name: "Fourth day of Lunar New Year", nameCN: "農曆年初四" },
    { date: "2024-03-29", name: "Good Friday", nameCN: "耶穌受難節" },
    { date: "2024-03-30", name: "The day following Good Friday", nameCN: "耶穌受難節翌日" },
    { date: "2024-04-01", name: "Easter Monday", nameCN: "復活節星期一" },
    { date: "2024-04-04", name: "Ching Ming Festival", nameCN: "清明節" },
    { date: "2024-05-15", name: "Buddha's Birthday", nameCN: "佛誕" },
    { date: "2024-06-10", name: "Dragon Boat Festival", nameCN: "端午節" },
    { date: "2024-09-18", name: "The day following Mid-Autumn Festival", nameCN: "中秋節翌日" },
    { date: "2024-10-11", name: "Chung Yeung Festival", nameCN: "重陽節" },
  ],
  2025: [
    { date: "2025-01-29", name: "Lunar New Year's Day", nameCN: "農曆年初一" },
    { date: "2025-01-30", name: "Second day of Lunar New Year", nameCN: "農曆年初二" },
    { date: "2025-01-31", name: "Third day of Lunar New Year", nameCN: "農曆年初三" },
    { date: "2025-04-04", name: "Ching Ming Festival", nameCN: "清明節" },
    { date: "2025-04-18", name: "Good Friday", nameCN: "耶穌受難節" },
    { date: "2025-04-19", name: "The day following Good Friday", nameCN: "耶穌受難節翌日" },
    { date: "2025-04-21", name: "Easter Monday", nameCN: "復活節星期一" },
    { date: "2025-05-05", name: "Buddha's Birthday", nameCN: "佛誕" },
    { date: "2025-05-31", name: "Dragon Boat Festival", nameCN: "端午節" },
    { date: "2025-10-07", name: "The day following Mid-Autumn Festival", nameCN: "中秋節翌日" },
    { date: "2025-10-29", name: "Chung Yeung Festival", nameCN: "重陽節" },
  ],
  2026: [
    { date: "2026-02-17", name: "Lunar New Year's Day", nameCN: "農曆年初一" },
    { date: "2026-02-18", name: "Second day of Lunar New Year", nameCN: "農曆年初二" },
    { date: "2026-02-19", name: "Third day of Lunar New Year", nameCN: "農曆年初三" },
    { date: "2026-04-03", name: "Good Friday", nameCN: "耶穌受難節" },
    { date: "2026-04-04", name: "The day following Good Friday", nameCN: "耶穌受難節翌日" },
    { date: "2026-04-05", name: "Ching Ming Festival", nameCN: "清明節" },
    { date: "2026-04-06", name: "Easter Monday", nameCN: "復活節星期一" },
    { date: "2026-05-24", name: "Buddha's Birthday", nameCN: "佛誕" },
    { date: "2026-06-19", name: "Dragon Boat Festival", nameCN: "端午節" },
    { date: "2026-09-26", name: "The day following Mid-Autumn Festival", nameCN: "中秋節翌日" },
    { date: "2026-10-18", name: "Chung Yeung Festival", nameCN: "重陽節" },
    { date: "2026-10-19", name: "The day following Chung Yeung Festival", nameCN: "重陽節翌日" },
  ],
  2027: [
    { date: "2027-02-07", name: "Second day of Lunar New Year", nameCN: "農曆年初二" },
    { date: "2027-02-08", name: "Third day of Lunar New Year", nameCN: "農曆年初三" },
    { date: "2027-02-09", name: "Fourth day of Lunar New Year", nameCN: "農曆年初四" },
    { date: "2027-03-26", name: "Good Friday", nameCN: "耶穌受難節" },
    { date: "2027-03-27", name: "The day following Good Friday", nameCN: "耶穌受難節翌日" },
    { date: "2027-03-29", name: "Easter Monday", nameCN: "復活節星期一" },
    { date: "2027-04-05", name: "Ching Ming Festival", nameCN: "清明節" },
    { date: "2027-05-13", name: "Buddha's Birthday", nameCN: "佛誕" },
    { date: "2027-06-09", name: "Dragon Boat Festival", nameCN: "端午節" },
    { date: "2027-09-16", name: "The day following Mid-Autumn Festival", nameCN: "中秋節翌日" },
    { date: "2027-10-08", name: "Chung Yeung Festival", nameCN: "重陽節" },
  ],
  2028: [
    { date: "2028-01-27", name: "Second day of Lunar New Year", nameCN: "農曆年初二" },
    { date: "2028-01-28", name: "Third day of Lunar New Year", nameCN: "農曆年初三" },
    { date: "2028-01-29", name: "Fourth day of Lunar New Year", nameCN: "農曆年初四" },
    { date: "2028-04-04", name: "Ching Ming Festival", nameCN: "清明節" },
    { date: "2028-04-14", name: "Good Friday", nameCN: "耶穌受難節" },
    { date: "2028-04-15", name: "The day following Good Friday", nameCN: "耶穌受難節翌日" },
    { date: "2028-04-17", name: "Easter Monday", nameCN: "復活節星期一" },
    { date: "2028-05-02", name: "Buddha's Birthday", nameCN: "佛誕" },
    { date: "2028-05-28", name: "Dragon Boat Festival", nameCN: "端午節" },
    { date: "2028-09-04", name: "The day following Mid-Autumn Festival", nameCN: "中秋節翌日" },
    { date: "2028-10-26", name: "Chung Yeung Festival", nameCN: "重陽節" },
  ],
};

function getFixedHolidays(year: number): HKHoliday[] {
  return [
    { date: `${year}-01-01`, name: "New Year's Day", nameCN: "元旦" },
    { date: `${year}-05-01`, name: "Labour Day", nameCN: "勞動節" },
    { date: `${year}-07-01`, name: "HKSAR Establishment Day", nameCN: "香港特別行政區成立紀念日" },
    { date: `${year}-10-01`, name: "National Day", nameCN: "國慶日" },
    { date: `${year}-12-25`, name: "Christmas Day", nameCN: "聖誕節" },
    { date: `${year}-12-26`, name: "Boxing Day", nameCN: "聖誕節翌日" },
  ];
}

export function getHKHolidays(year: number): HKHoliday[] {
  const fixed = getFixedHolidays(year);
  const variable = VARIABLE_HOLIDAYS[year] ?? [];
  return [...fixed, ...variable].sort((a, b) => a.date.localeCompare(b.date));
}

export function getHolidayMap(year: number): Map<string, HKHoliday> {
  const map = new Map<string, HKHoliday>();
  for (const h of getHKHolidays(year)) {
    map.set(h.date, h);
  }
  return map;
}
