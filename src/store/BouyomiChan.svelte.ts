import { NO_SPEAK_NAME, store } from "./store.svelte";

export class BouyomiChan {
  public static get port() { return store.bouyomiChan.port; }
  public static set port(value) { store.bouyomiChan.port = value; }
  public static get isSpeak() { return store.yomiage.isSpeak; }
  public static set isSpeak(value) { store.yomiage.isSpeak = value; }
  public static get speakName() { return store.yomiage.speakName; }
  public static set speakName(value) { store.yomiage.speakName = value; }
  public static get speakSystem() { return store.yomiage.speakSystem; }
  public static set speakSystem(value) { store.yomiage.speakSystem = value; }

  public static switchSpeak() {
    BouyomiChan.isSpeak = !BouyomiChan.isSpeak;
  }

  public static async speak(content: string, name: string | undefined, forceSpeak = false) {
    if (!forceSpeak && !store.yomiage.isSpeak) return;

    if (name != null && !name.includes(NO_SPEAK_NAME)) {
      if (BouyomiChan.speakName === "mae") content = name + "。" + content;
      else if (BouyomiChan.speakName === "ato") content = content + "。" + name;
    }

    await fetch(`http://localhost:${BouyomiChan.port}/talk?text=${content}`);
  }
}

