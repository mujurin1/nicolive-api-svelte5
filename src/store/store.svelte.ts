export const Talker = ["none", "bouyomiChan"] as const;
export type Talker = typeof Talker[number];

export const SpeakName = ["none", "mae", "ato"] as const;
export type SpeakName = typeof SpeakName[number];

export const Yomiage = ["棒読みちゃん", "VOICEVOX"] as const;
export type Yomiage = typeof Yomiage[number];

/** ユーザー名にこれが付いていた場合は名前を読み上げない */
export const NO_SPEAK_NAME = "#--no-speak-name";

export interface NicoliveUser {
  id: string | number;
  name: string | undefined;
  kotehan: string | undefined;
}

/**
 * 拡張機能のセーブデータの初期値およびセーブデータ型
 *
 * 制限
 * * `"_primitable"` という文字で終わる場合は保存時にそのオブジェクトまでをコピーする
 * * プリミティブ値またはプリミティブ値のみで構成されたオブジェクトのみを持つ
 *   * ただし配列はOK
 * * `undefined`は使ってもよいが存在するか分からないプロパティの定義は不可
 */
const defaultStore = {
  general: {
    maxBackwards: 50,
    useKotehan: true,
    /** URLを含むコメントをリンクにする */
    urlToLink: true,
    /** 最初のコメントを強調する */
    firstIsBold: true,
    /** 184の表示名を最初のコメ版にするか */
    nameToNo: true,
    /** シャープコメントを隠す */
    hideSharp: false,
  },
  nicolive: {
    users_primitable: {} as Record<string, NicoliveUser>,
    pinnLives: [] as { id: string, description: string; }[],
  },
  yomiage: {
    isSpeak: false,
    use: "棒読みちゃん" as Yomiage,
    speakName: "none" as SpeakName,
    speakSystem: true,
  },
  bouyomiChan: {
    port: 50080,
  },
};

export const store = $state(structuredClone(defaultStore));


export function storeLoad() {
  return chrome.storage.local.get(undefined)
    .then(value => overriteClone(store, value as typeof store));
}

/**
 * 拡張機能へ保存します\
 * `data`に`store`に対応するキーがない場合はそのキーは更新されません
 */
export function storeSave(data: typeof store) {
  overriteClone(store, data);
}

export function storeClear() {
  return storeSave(structuredClone(defaultStore));
}

void storeLoad();

// store の値が更新されたら保存する
// MEMO: $effect をコンポーネント外から呼び出す場合は $effect.root を使う必要がある
$effect.root(() => {
  $effect(() => void chrome.storage.local.set($state.snapshot(store)));
});


/**
 * `target`のプロパティを`overrite`で上書きする\
 * `target`がプロパティを持っていない場合は`target`の値まま
 */
function overriteClone<T>(target: T, overrite: T): void {
  for (const key in target) {
    if (
      Object.prototype.hasOwnProperty.call(target, key) &&
      overrite[key] != null
    ) {
      if (
        key.endsWith("_primitable") ||
        typeof target[key] !== "object" ||
        Array.isArray(target[key])
      ) {
        // "_primitable" という名前で終わる場合は内部まで探索しない
        // プリミティブ値または配列の場合はコピーする
        target[key] = structuredClone(overrite[key]);
      } else if (
        typeof target[key] === "object" &&
        !Array.isArray(target[key])
      ) {
        // プロパティがオブジェクトの場合は再帰的に呼び出す
        overriteClone(target[key], overrite[key]);
      }
    }
  }
}
