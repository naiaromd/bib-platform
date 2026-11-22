// icoone® Laser Med handpieces. Light only on RoboSolo.
// Source: beautyinbeyond.com/products (referenced in Landing)

import { HANDPIECE_IMG } from "./assets";

export type HandpieceKey = "RS" | "RT" | "RM" | "RC";

export interface Handpiece {
  key: HandpieceKey;
  name: string;
  line: string;
  desc: string;
  ppm: string; // stimulations per minute
  img: string;
  hasLight: boolean;
}

export const HANDPIECES: Record<HandpieceKey, Handpiece> = {
  RS: {
    key: "RS",
    name: "RoboSolo",
    line: "Mono line",
    desc: "จอสัมผัส 3.5 นิ้ว · Laser และ LED ใช้ร่วมหรือแยกได้",
    ppm: "15,600",
    img: HANDPIECE_IMG.RS,
    hasLight: true,
  },
  RT: {
    key: "RT",
    name: "RoboTwins",
    line: "Duo line",
    desc: "สองหัวกระตุ้นทั้งสองข้างพร้อมกัน",
    ppm: "21,600",
    img: HANDPIECE_IMG.RT,
    hasLight: false,
  },
  RM: {
    key: "RM",
    name: "Robomini Twins",
    line: "Compact",
    desc: "หัวเล็กที่สุด สำหรับบริเวณที่เข้าถึงยาก",
    ppm: "14,400",
    img: HANDPIECE_IMG.RM,
    hasLight: false,
  },
  RC: {
    key: "RC",
    name: "RoboMicro",
    line: "6 attachments",
    desc: "ต่อแบบถอดเร็ว มีหัวเปลี่ยน 6 แบบ",
    ppm: "13,200",
    img: HANDPIECE_IMG.RC,
    hasLight: false,
  },
};

export const HANDPIECE_ORDER: HandpieceKey[] = ["RS", "RT", "RM", "RC"];
