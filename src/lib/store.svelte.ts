
export const SpeakName = ["none", "mae", "ato"] as const;
export type SpeakName = typeof SpeakName[number];

export const store = $state({
  bouyomiChan: {
    port: 50080,
    isSpeak: false,
    speakName: "none" as SpeakName,
  },
  connection: {
    maxBackwards: 50,
  },
});

export function updateStore() {
  return chrome.storage.local.get(undefined)
    .then(value => {
      const data = value as typeof store;
      if (Object.keys(data).length === 0) return;

      for (const [key, value] of Object.entries(data))
        (<any>store)[key] = value;
    });
}

export function storeClear() {
  return chrome.storage.local.clear()
    .then(updateStore);
}


// store の値が更新されたら保存する
// $effect をコンポーネント外から呼び出す場合は $effect.root で囲う必要がある
$effect.root(() => {
  $effect(() => void chrome.storage.local.set(store));
});

void updateStore();
