"use client";

import { useSyncExternalStore } from "react";

/**
 * 発見モード / マイ掲示板 用のブラウザ内保存（LocalStorage）。
 *
 * 保存するのは「イベント ID」と「希望条件（選んだ選択肢の値）」だけ。
 * 氏名・連絡先などの個人情報は扱わない。サーバーには送らない。
 *
 * React の useSyncExternalStore を使い、
 *  - サーバー描画時は空の値（fallback）
 *  - ブラウザでは LocalStorage の値
 * を返す。別タブで変更されたときも "storage" イベントで自動的に反映される。
 */

const KEYS = {
  prefs: "shiga-events:discover-prefs:v1",
  favorites: "shiga-events:favorites:v1",
  going: "shiga-events:going:v1",
} as const;

// ------------------------------------------------------------
// 小さな「ストア」：読み込み・書き込み・変更通知
// ------------------------------------------------------------

type Listener = () => void;

function createLocalStore<T>(key: string, fallback: T, validate: (raw: unknown) => T | null): LocalStore<T> {
  const listeners = new Set<Listener>();
  // 同じ文字列なら同じオブジェクトを返す（useSyncExternalStore の無限再描画を防ぐ）
  let cache: { raw: string | null; value: T } = { raw: null, value: fallback };

  function read(): T {
    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(key);
    } catch {
      return fallback; // プライベートモード等で使えない場合
    }
    if (raw === cache.raw) return cache.value;
    let value = fallback;
    if (raw !== null) {
      try {
        value = validate(JSON.parse(raw)) ?? fallback;
      } catch {
        value = fallback; // 壊れたデータは無視
      }
    }
    cache = { raw, value };
    return value;
  }

  function write(value: T | null) {
    try {
      if (value === null) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // 保存できなくても画面は動かし続ける
    }
    listeners.forEach((l) => l());
  }

  function subscribe(listener: Listener) {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }

  return { read, write, subscribe, fallback };
}

type LocalStore<T> = {
  read: () => T;
  write: (value: T | null) => void;
  subscribe: (listener: Listener) => () => void;
  fallback: T;
};

function useStore<T>(store: LocalStore<T>): T {
  return useSyncExternalStore(store.subscribe, store.read, () => store.fallback);
}

const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === "string");

// ------------------------------------------------------------
// 希望条件（発見モードの初期設定）
// ------------------------------------------------------------

export type DiscoverPrefs = {
  /** "set" = 条件を設定済み / "skipped" = 設定をスキップした */
  mode: "set" | "skipped";
  /** 興味のある分野（categories.ts の slug） */
  categories: string[];
  /** 検索ページと同じ形式の回答（guided-search.ts の質問 ID → 選択値） */
  answers: Record<string, string[]>;
};

const prefsStore = createLocalStore<DiscoverPrefs | null>(KEYS.prefs, null, (raw) => {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.mode !== "set" && r.mode !== "skipped") return null;
  const answers: Record<string, string[]> = {};
  if (r.answers && typeof r.answers === "object") {
    for (const [k, v] of Object.entries(r.answers as Record<string, unknown>)) {
      if (isStringArray(v)) answers[k] = v;
    }
  }
  return { mode: r.mode, categories: isStringArray(r.categories) ? r.categories : [], answers };
});

export function useDiscoverPrefs() {
  return useStore(prefsStore);
}
export function saveDiscoverPrefs(prefs: DiscoverPrefs | null) {
  prefsStore.write(prefs);
}

// ------------------------------------------------------------
// イベント ID の集合（お気に入り / 参加予定）
// ------------------------------------------------------------

const EMPTY: string[] = [];
const idListValidator = (raw: unknown) => (isStringArray(raw) ? raw.slice(0, 500) : null);

const favoritesStore = createLocalStore<string[]>(KEYS.favorites, EMPTY, idListValidator);
const goingStore = createLocalStore<string[]>(KEYS.going, EMPTY, idListValidator);

function makeIdListApi(store: LocalStore<string[]>) {
  return {
    add(id: string) {
      const cur = store.read();
      if (!cur.includes(id)) store.write([id, ...cur]); // 新しいものを先頭に
    },
    remove(id: string) {
      store.write(store.read().filter((x) => x !== id));
    },
    toggle(id: string) {
      const cur = store.read();
      store.write(cur.includes(id) ? cur.filter((x) => x !== id) : [id, ...cur]);
    },
  };
}

export const favorites = makeIdListApi(favoritesStore);
export const going = makeIdListApi(goingStore);

export function useFavorites() {
  return useStore(favoritesStore);
}
export function useGoing() {
  return useStore(goingStore);
}

// ------------------------------------------------------------
// 「ブラウザで描画済みか」。LocalStorage を読む前の一瞬に
// 「未設定」画面がチラッと出るのを防ぐために使う
// ------------------------------------------------------------
const noopSubscribe = () => () => {};
export function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
