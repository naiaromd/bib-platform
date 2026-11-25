// Asset lookup — maps content IDs from the prototype to the files in /public/assets.
// Every value here must exist in /public/assets/<hash>.<ext>.

const ext = (hash: string, type: "png" | "jpg" | "mp4" = "png") =>
  `/assets/${hash}.${type}`;

// === Logos / chrome ===
export const LOGO_LIGHT = ext("51c43cea60dcacfb89841e4a24c2ef45");
export const LOGO_DARK = ext("13f7161279bc07cbcde093c836a14f7a");

// === Models (hero figures) ===
export const FIGURES = {
  f: {
    front: ext("abc37813a2a9bbc0f0d0daa34cea1e2e"),
    back: ext("a45905c4fa1c4aa3de53c40594d91c4a"),
    altFront: "นางแบบในชุดบอดี้สูท ท่ายืนตรง ด้านหน้า",
    altBack: "นางแบบในชุดบอดี้สูท ท่ายืนตรง ด้านหลัง",
  },
  m: {
    front: ext("4c97bd5f81da360fc01bccba7e8a7b49"),
    back: ext("f3a0ad6e4ce0df40b7e888540e6b54c2"),
    altFront: "นายแบบในชุดบอดี้สูท ท่ายืนตรง ด้านหน้า",
    altBack: "นายแบบในชุดบอดี้สูท ท่ายืนตรง ด้านหลัง",
  },
} as const;

// === Video + poster (hero of the Technology section) ===
export const TECH_VIDEO = ext("f62f7034ba1ba88d2a9ed3bd88fc8768", "mp4");
export const TECH_POSTER = ext("7cce333f55d2739544e065fa8b4718ed", "jpg");

// === icoone Laser Med machine (Evidence section) ===
export const DEVICE_PHOTO = ext("7d3654625308b2affb49d3814d04a8fe");

// === Handpieces ===
// ภาพหัวเครื่องแบบ vector (ไนน์ 25 พ.ย. · BIB/4_Media/handpiece_svg_r01) แทนภาพถ่าย 400 px
export const HANDPIECE_IMG = {
  RS: "/assets/handpieces/RS-r01.svg",
  RT: "/assets/handpieces/RT-r01.svg",
  RM: "/assets/handpieces/RM-r01.svg",
  RC: "/assets/handpieces/RC-r01.svg",
} as const;

// === Program icons ===
export const PROGRAM_ICON: Record<string, string> = {
  CELLDRAIN: ext("e58209c2e339a9fc968980c887013a42"),
  FLOWING: ext("ace96df39aa36347097971666a35bb7f"),
  SILK: ext("5e8078b6999af326d95405f6818bc72c"),
  CELLFAT: ext("2338b62b7d83d5efd57e10b2d6a067f9"),
  BIOYOUNG: ext("d0831fc297135ed22449dc2c34b31d6a"),
  ELASTO: ext("86b71471a6f594e24f9531ad3048c1ca"),
  TONUS: ext("7044d42ba09599f17a5d347a4275f83e"),
  OPTIMUM: ext("b61d61259b57c3d7dc3594af09fe01b3"),
  SILHOUETTE: ext("5a747757411f532e17b93bbeb2c8efc0"),
  MODELPLUS: ext("3b685d322bb542ee4576d1a84f144ad0"),
  REMOD: ext("50cfc40ba76bc8a39d6c9a46e055e1fe"),
  HIGHPLUS: ext("34caf20f47a4f23af9b65828fc0ccb28"),
  "MEN-ZONE": ext("9724bda3139e65efa298873d06463fcf"),
  ABDOTON: ext("b1e3893da29fb97ba6edb4b363dba8fb"),
  ARMTON: ext("c9853364c38bdf06bff986d57e372dce"),
  INTON: ext("6b7c54dd3203b79f227387941e1dd88b"),
  FATZONE: ext("035461524eff403e2210c6d371f99bcb"),
  "NECK-FACE DRAIN": ext("458602b2e0cf355230bb907c672a3dba"),
  "NECK-FACE ONE": ext("f1137eec12eb360d741e47ec790f6caf"),
  "NECK-FACE TWO": ext("4eebf3ae0f35b03973a21211a8e4afc3"),
  YOUNGTOUCH: ext("84d74a129108fef8084c64cedc870d0c"),
  CHINSCULPT: ext("68914137ed272becb90bfe8835d155a9"),
  SMOOTHFACE: ext("c604438e489d1161c933435beb82c0fe"),
  EYELIGHT: ext("a171fca6eea7d4796b63b77c61c2bedc"),
  STIMFLUID: ext("80027de37c0af23d4d7bedf618c309a5"),
  LINFA: ext("aa6eb170078e665a9b2bf0686ef640d5"),
  SKINEW: ext("d47cf41c32b01430a7fad6ba59c4c060"),
  NOVASKIN: ext("70aef940f69b4588da27bcf592bfc8f6"),
  SKINREPAIR: ext("602d622d9639ec360be2493eb7641621"),
  "IN-PULSE": ext("da1df83e92e7da001be3e8ab258c8b00"),
  FINAL: ext("d592017ff685fb9314f98cc4aa38f9e0"),
  MASSMOTHER: ext("4295527a1e5cfc15fae87bc2c4e8629a"),
  PAINMASS: ext("6573fffab63092404c6e39dd2add48c8"),
  MIND: ext("a52d86516c6cab614ccb7a8e196815f7"),
  MASSTOTAL: ext("ece145f27c77cc18e3fbcf5a44c63228"),
  BALANCING: ext("0ae2825ba94afd92bc68ddb1ca92cec8"),
  NEUROMASS: ext("de4ff4d6015b59a7d4d8826b7b9c60bb"),
  MIOCONTRACT: ext("71de83645ad2da6cc2b1085bc74a6339"),
  APONEUROSIS: ext("4e86d2b93b5fb1b4e327be2e2a959daf"),
  "VITAL JUMP": ext("a5307a8da652b4f5a1dceed22589ddc9"),
};
