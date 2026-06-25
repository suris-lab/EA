import type { EventCategory, PrepZone } from "@/types/event";

export const ZONE_LABELS: Record<PrepZone, string> = {
  head: "Head 頭部",
  body: "Body 身體",
  feet: "Feet 腳部",
  bag: "Bag 書包",
};

export const ZONE_ORDER: PrepZone[] = ["head", "body", "feet", "bag"];

interface Preset { id: string; label: string }

export const STROLLER_LABEL = "Stroller 嬰兒車";

export const STROLLER_PRESETS: Preset[] = [
  { id: "stroller-blanket", label: "Blanket 毛毯" },
  { id: "stroller-rain-cover", label: "Rain cover 雨罩" },
  { id: "stroller-sunshade", label: "Sunshade 遮陽篷" },
  { id: "stroller-snack", label: "Snack 小食" },
  { id: "stroller-bottle", label: "Bottle 奶瓶" },
  { id: "stroller-toy", label: "Toy 玩具" },
  { id: "stroller-wipes", label: "Wet wipes 濕紙巾" },
  { id: "stroller-nappies", label: "Nappies 尿片" },
];

export const PREP_PRESETS: Record<EventCategory, Record<PrepZone, Preset[]>> = {
  school: {
    head: [
      { id: "school-head-hat", label: "School hat 校帽" },
      { id: "school-head-hairband", label: "Hair band 髮箍" },
      { id: "school-head-sunscreen", label: "Sunscreen 防曬" },
    ],
    body: [
      { id: "school-body-uniform", label: "School uniform 校服" },
      { id: "school-body-pe-kit", label: "PE kit 體育服" },
      { id: "school-body-jacket", label: "Jacket 外套" },
      { id: "school-body-raincoat", label: "Raincoat 雨衣" },
      { id: "school-body-apron", label: "Art apron 畫衣" },
    ],
    feet: [
      { id: "school-feet-shoes", label: "School shoes 校鞋" },
      { id: "school-feet-trainers", label: "Trainers 運動鞋" },
      { id: "school-feet-socks", label: "Extra socks 額外襪子" },
      { id: "school-feet-wellies", label: "Wellies 水鞋" },
    ],
    bag: [
      { id: "school-bag-lunchbox", label: "Lunch box 飯盒" },
      { id: "school-bag-water", label: "Water bottle 水壺" },
      { id: "school-bag-snack", label: "Snack 小食" },
      { id: "school-bag-homework", label: "Homework folder 功課夾" },
      { id: "school-bag-book", label: "Reading book 圖書" },
      { id: "school-bag-towel", label: "Towel 毛巾" },
    ],
  },
  tutor: {
    head: [
      { id: "tutor-head-cap", label: "Cap 帽子" },
      { id: "tutor-head-sunscreen", label: "Sunscreen 防曬" },
    ],
    body: [
      { id: "tutor-body-comfy", label: "Comfy clothes 舒適衣服" },
      { id: "tutor-body-jacket", label: "Light jacket 薄外套" },
      { id: "tutor-body-change", label: "Change of clothes 替換衣服" },
    ],
    feet: [
      { id: "tutor-feet-trainers", label: "Trainers 運動鞋" },
      { id: "tutor-feet-sandals", label: "Sandals 涼鞋" },
    ],
    bag: [
      { id: "tutor-bag-snack", label: "Snack 小食" },
      { id: "tutor-bag-water", label: "Water bottle 水壺" },
      { id: "tutor-bag-nappies", label: "Nappies 尿片" },
      { id: "tutor-bag-wipes", label: "Wet wipes 濕紙巾" },
      { id: "tutor-bag-spare", label: "Spare clothes 備用衣服" },
    ],
  },
  medical: {
    head: [
      { id: "medical-head-comfort", label: "Comfort toy 安撫玩具" },
    ],
    body: [
      { id: "medical-body-comfy", label: "Loose comfy clothes 寬鬆衣服" },
      { id: "medical-body-easy", label: "Easy-access top 易穿上衣" },
      { id: "medical-body-jacket", label: "Jacket 外套" },
    ],
    feet: [
      { id: "medical-feet-easy", label: "Easy-on shoes 易穿鞋" },
      { id: "medical-feet-socks", label: "Clean socks 乾淨襪子" },
    ],
    bag: [
      { id: "medical-bag-health", label: "Health book 健康手冊" },
      { id: "medical-bag-insurance", label: "Insurance card 保險卡" },
      { id: "medical-bag-medicine", label: "Current medication 現用藥物" },
      { id: "medical-bag-water", label: "Water bottle 水壺" },
      { id: "medical-bag-snack", label: "Snack 小食" },
    ],
  },
  family: {
    head: [
      { id: "family-head-hat", label: "Sun hat / Cap 太陽帽" },
      { id: "family-head-sunscreen", label: "Sunscreen 防曬" },
    ],
    body: [
      { id: "family-body-casual", label: "Casual outfit 便服" },
      { id: "family-body-jacket", label: "Jacket 外套" },
      { id: "family-body-swimsuit", label: "Swimsuit 泳衣" },
      { id: "family-body-change", label: "Change of clothes 替換衣服" },
    ],
    feet: [
      { id: "family-feet-trainers", label: "Trainers 運動鞋" },
      { id: "family-feet-sandals", label: "Sandals 涼鞋" },
    ],
    bag: [
      { id: "family-bag-snack", label: "Snacks 小食" },
      { id: "family-bag-water", label: "Water bottle 水壺" },
      { id: "family-bag-toy", label: "Favourite toy 心愛玩具" },
      { id: "family-bag-wipes", label: "Wet wipes 濕紙巾" },
    ],
  },
  other: {
    head: [
      { id: "other-head-cap", label: "Cap / Hat 帽子" },
      { id: "other-head-sunscreen", label: "Sunscreen 防曬" },
    ],
    body: [
      { id: "other-body-outfit", label: "Appropriate outfit 合適衣服" },
      { id: "other-body-jacket", label: "Jacket 外套" },
    ],
    feet: [
      { id: "other-feet-shoes", label: "Appropriate shoes 合適鞋子" },
    ],
    bag: [
      { id: "other-bag-snack", label: "Snack 小食" },
      { id: "other-bag-water", label: "Water bottle 水壺" },
    ],
  },
};
