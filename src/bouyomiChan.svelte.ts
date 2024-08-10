
interface BouyomiChan {
  port: number;
  isSpeak: boolean;
  speakName: SpeakName;
}

const bouyomiChan = $state<BouyomiChan>({
  port: 50080,
  isSpeak: false,
  speakName: "none",
});

export const BouyomiChan = {
  get port() { return bouyomiChan.port; },
  set port(value) {
    bouyomiChan.port = value;
    void saveBouyomiChan();
  },
  get isSpeak() { return bouyomiChan.isSpeak; },
  set isSpeak(value) {
    bouyomiChan.isSpeak = value;
    void saveBouyomiChan();
  },
  get speakName() { return bouyomiChan.speakName; },
  set speakName(value) {
    bouyomiChan.speakName = value;
    void saveBouyomiChan();
  },


  switchSpeak() {
    BouyomiChan.isSpeak = !BouyomiChan.isSpeak;
  },
  async speak(text: string, name: string | undefined, forceSpeak = false) {
    if (!forceSpeak && !bouyomiChan.isSpeak) return;

    if (name != null) {
      if (bouyomiChan.speakName === "mae") text = name + "。" + text;
      else if (bouyomiChan.speakName === "ato") text = text + "。" + name;
    }

    await fetch(`http://localhost:${BouyomiChan.port}/talk?text=${text}`);
  }
} as const;

export const SpeakName = ["none", "mae", "ato"] as const;
export type SpeakName = typeof SpeakName[number];

async function saveBouyomiChan() {
  return chrome.storage.local.set({ bouyomiChan });
}

void chrome.storage.local.get("bouyomiChan")
  .then(value => {
    const bc = value?.bouyomiChan as BouyomiChan;
    if (bc == null) return;

    console.log(bc);

    bouyomiChan.port = bc.port ?? bouyomiChan.port;
    bouyomiChan.isSpeak = bc.isSpeak ?? bouyomiChan.isSpeak;
    bouyomiChan.speakName = bc.speakName ?? bouyomiChan.speakName;
  });
