import { NicoliveClient, timestampToMs } from "@mujurin/nicolive-api-ts";
import { iconNone, timeString } from "../utils";
import { BouyomiChan } from "./BouyomiChan.svelte";
import { store } from "./store.svelte";

export interface NicoComment {
  commentId: string;
  no?: number;
  iconUrl?: string;
  userId?: string | number;
  name?: string;
  time: string;
  content: string;
}

class _Nicolive {
  private _canSpeak = false;

  public url = $state("");
  public get maxBackwards() { return store.connection.maxBackwards; }
  public set maxBackwards(value) { store.connection.maxBackwards = value; }

  public client = $state<NicoliveClient>();
  public comments = $state<NicoComment[]>([]);

  public connectWs = $state(false);
  public connectComment = $state(false);

  public async connect() {
    this._canSpeak = false;
    this.close();
    this.comments = [];

    this.client = await NicoliveClient.create(this.url, "now", this.maxBackwards);
    this.url = this.client.liveId;

    this.client.onWsState.on(event => this.connectWs = event === "open");
    this.client.onCommentState.on(event => this.connectComment = event === "open");

    this.client.onCommentEntry.on(message => {
      if (message === "segment") this._canSpeak = true;
    });

    this.client.onComment.on(({ meta, payload }) => {
      if (meta == null) return;

      const commentId = meta.id!;
      let no: number | undefined;
      let iconUrl: string | undefined;
      let userId: string | number | undefined;
      let name: string | undefined;
      const time = timestampToMs(meta.at!) - this.client!.beginTime.getTime();
      let content: string;

      if (payload.case === "message") {
        const data = payload.value.data;
        if (data.case !== "chat") return;

        no = data.value.no;
        userId = data.value.hashedUserId ?? Number(data.value.rawUserId)!;
        iconUrl = userIdToIconUrl(userId);
        name = data.value.name;
        content = data.value.content;
      } else {
        if (payload.case !== "state") return;

        const display = payload.value.marquee?.display;
        if (display?.operatorComment == null) return;
        content = display.operatorComment.content!;
      }

      if (this._canSpeak) {
        void BouyomiChan.speak(content, name);
      }

      this.comments.push({
        commentId,
        no,
        iconUrl,
        userId,
        name,
        time: timeString(time),
        content,
      });
    });

    // デバッグ用
    // setDebug(this.client);
  }

  public close() {
    if (this.client == null) return;
    this.client.close();
  }

  // デバッグ用
  public addComment(...comments: NicoComment[]) {
    this.comments.push(...comments);
  }
}

export const Nicolive = new _Nicolive();


function userIdToIconUrl(userId: string | number) {
  if (typeof userId === "string") return iconNone;

  const numStr = userId.toString();

  // 右から4桁を除いた文字列を取得
  const withoutLastFour = numStr.slice(0, -4);

  // 左から4桁を取得
  const firstFour = withoutLastFour.slice(0, 4);

  // 取り出した数字が0文字の場合は「0」にする
  const extracted = firstFour.length > 0 ? firstFour : "0";

  // フォーマットされた文字列を返す
  return `https://secure-dcdn.cdn.nimg.jp/nicoaccount/usericon/${extracted}/${numStr}.jpg`;
}


function setDebug(client: NicoliveClient) {
  client.onWsState.on(event => console.log(`wsClient: ${event}`));
  client.onCommentState.on(event => console.log(`commentClient: ${event}`));
  client.onCommentEntry.on(event => console.log(`commentEntry: ${event}`));
  client.onComment.on(({ meta: _meta, payload: { value, case: _case } }) => {
    const meta =
      _meta == null
        ? "none"
        : {
          ..._meta,
          at: _meta.at == null ? "-" : new Date(timestampToMs(_meta.at)).toLocaleString(),
        };

    if (_case === "state") {
      console.log("###", _case, meta, value);
    } else if (_case === "signal") {
      console.log("###", _case, meta, value);
    } else if (_case === "message") {
      console.log("###", _case, value.data.case, meta);
      console.log(value.data.value);
    }
  });
}