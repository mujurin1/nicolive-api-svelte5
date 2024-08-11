import { store } from "./store.svelte";

export const SpeakName = ["none", "mae", "ato"] as const;
export type SpeakName = typeof SpeakName[number];

export class BouyomiChan {
  public static get port() { return store.bouyomiChan.port; }
  public static set port(value) { store.bouyomiChan.port = value; }
  public static get isSpeak() { return store.bouyomiChan.isSpeak; }
  public static set isSpeak(value) { store.bouyomiChan.isSpeak = value; }
  public static get speakName() { return store.bouyomiChan.speakName; }
  public static set speakName(value) { store.bouyomiChan.speakName = value; }

  public static switchSpeak() {
    BouyomiChan.isSpeak = !BouyomiChan.isSpeak;
  }

  public static async speak(text: string, name: string | undefined, forceSpeak = false) {
    if (!forceSpeak && !BouyomiChan.isSpeak) return;

    if (name != null) {
      if (BouyomiChan.speakName === "mae") text = name + "。" + text;
      else if (BouyomiChan.speakName === "ato") text = text + "。" + name;
    }

    await fetch(`http://localhost:${BouyomiChan.port}/talk?text=${text}`);
  }
}

