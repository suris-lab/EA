import type { EventCategory, PrepZone } from "@/types/event";

export const ZONE_LABELS: Record<PrepZone, string> = {
  head: "Head",
  body: "Body",
  feet: "Feet",
  bag: "Bag",
};

export const ZONE_ORDER: PrepZone[] = ["head", "body", "feet", "bag"];

interface Preset { id: string; label: string }

export const STROLLER_LABEL = "Stroller";

export const STROLLER_PRESETS: Preset[] = [
  { id: "stroller-blanket", label: "Blanket" },
  { id: "stroller-rain-cover", label: "Rain cover" },
  { id: "stroller-sunshade", label: "Sunshade" },
  { id: "stroller-snack", label: "Snack" },
  { id: "stroller-bottle", label: "Bottle" },
  { id: "stroller-toy", label: "Toy" },
  { id: "stroller-wipes", label: "Wet wipes" },
  { id: "stroller-nappies", label: "Nappies" },
];

export const PREP_PRESETS: Record<EventCategory, Record<PrepZone, Preset[]>> = {
  school: {
    head: [
      { id: "school-head-hat", label: "School hat" },
      { id: "school-head-hairband", label: "Hair band" },
      { id: "school-head-sunscreen", label: "Sunscreen" },
    ],
    body: [
      { id: "school-body-uniform", label: "School uniform" },
      { id: "school-body-pe-kit", label: "PE kit" },
      { id: "school-body-jacket", label: "Jacket" },
      { id: "school-body-raincoat", label: "Raincoat" },
      { id: "school-body-apron", label: "Art apron" },
    ],
    feet: [
      { id: "school-feet-shoes", label: "School shoes" },
      { id: "school-feet-trainers", label: "Trainers" },
      { id: "school-feet-socks", label: "Extra socks" },
      { id: "school-feet-wellies", label: "Wellies" },
    ],
    bag: [
      { id: "school-bag-lunchbox", label: "Lunch box" },
      { id: "school-bag-water", label: "Water bottle" },
      { id: "school-bag-snack", label: "Snack" },
      { id: "school-bag-homework", label: "Homework folder" },
      { id: "school-bag-book", label: "Reading book" },
      { id: "school-bag-towel", label: "Towel" },
    ],
  },
  tutor: {
    head: [
      { id: "tutor-head-cap", label: "Cap" },
      { id: "tutor-head-sunscreen", label: "Sunscreen" },
    ],
    body: [
      { id: "tutor-body-comfy", label: "Comfy clothes" },
      { id: "tutor-body-jacket", label: "Light jacket" },
      { id: "tutor-body-change", label: "Change of clothes" },
    ],
    feet: [
      { id: "tutor-feet-trainers", label: "Trainers" },
      { id: "tutor-feet-sandals", label: "Sandals" },
    ],
    bag: [
      { id: "tutor-bag-snack", label: "Snack" },
      { id: "tutor-bag-water", label: "Water bottle" },
      { id: "tutor-bag-nappies", label: "Nappies" },
      { id: "tutor-bag-wipes", label: "Wet wipes" },
      { id: "tutor-bag-spare", label: "Spare clothes" },
    ],
  },
  medical: {
    head: [
      { id: "medical-head-comfort", label: "Comfort toy" },
    ],
    body: [
      { id: "medical-body-comfy", label: "Loose comfy clothes" },
      { id: "medical-body-easy", label: "Easy-access top" },
      { id: "medical-body-jacket", label: "Jacket" },
    ],
    feet: [
      { id: "medical-feet-easy", label: "Easy-on shoes" },
      { id: "medical-feet-socks", label: "Clean socks" },
    ],
    bag: [
      { id: "medical-bag-health", label: "Health book" },
      { id: "medical-bag-insurance", label: "Insurance card" },
      { id: "medical-bag-medicine", label: "Current medication" },
      { id: "medical-bag-water", label: "Water bottle" },
      { id: "medical-bag-snack", label: "Snack" },
    ],
  },
  family: {
    head: [
      { id: "family-head-hat", label: "Sun hat / Cap" },
      { id: "family-head-sunscreen", label: "Sunscreen" },
    ],
    body: [
      { id: "family-body-casual", label: "Casual outfit" },
      { id: "family-body-jacket", label: "Jacket" },
      { id: "family-body-swimsuit", label: "Swimsuit" },
      { id: "family-body-change", label: "Change of clothes" },
    ],
    feet: [
      { id: "family-feet-trainers", label: "Trainers" },
      { id: "family-feet-sandals", label: "Sandals" },
    ],
    bag: [
      { id: "family-bag-snack", label: "Snacks" },
      { id: "family-bag-water", label: "Water bottle" },
      { id: "family-bag-toy", label: "Favourite toy" },
      { id: "family-bag-wipes", label: "Wet wipes" },
    ],
  },
  other: {
    head: [
      { id: "other-head-cap", label: "Cap / Hat" },
      { id: "other-head-sunscreen", label: "Sunscreen" },
    ],
    body: [
      { id: "other-body-outfit", label: "Appropriate outfit" },
      { id: "other-body-jacket", label: "Jacket" },
    ],
    feet: [
      { id: "other-feet-shoes", label: "Appropriate shoes" },
    ],
    bag: [
      { id: "other-bag-snack", label: "Snack" },
      { id: "other-bag-water", label: "Water bottle" },
    ],
  },
};
