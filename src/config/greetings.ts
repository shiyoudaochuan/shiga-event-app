/**
 * トップページの「多言語あいさつシール」。
 * 滋賀に住む外国人住民の主な言語に合わせている。増やすときはここに 1 行足す。
 * bg はシールの色、r は傾き。
 */
export const GREETINGS = [
  { text: "こんにちは", lang: "ja", bg: "#ffc93c", r: "-4deg" },
  { text: "Hello!", lang: "en", bg: "#d9f7ef", r: "3deg" },
  { text: "Xin chào", lang: "vi", bg: "#ffe1da", r: "-2deg" },
  { text: "Olá!", lang: "pt", bg: "#e3ecff", r: "5deg" },
  { text: "你好", lang: "zh", bg: "#efe7ff", r: "-3deg" },
  { text: "Kumusta", lang: "tl", bg: "#ffe6f2", r: "2deg" },
] as const;
