import { NicoliveClient, timestampToMs } from "@mujurin/nicolive-api-ts";
import type { ChunkedMessage } from "@mujurin/nicolive-api-ts/build/gen/dwango_pb";
import { iconNone, timeString } from "../utils";
import { BouyomiChan } from "./BouyomiChan.svelte";
import { store } from "./store.svelte";

export interface NicoliveComment {
  type: "listener" | "owner" | "system";

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
  public get maxBackwards() { return store.nicolive.maxBackwards; }
  public set maxBackwards(value) { store.nicolive.maxBackwards = value; }

  public client = $state<NicoliveClient>();
  public comments = $state<NicoliveComment[]>([]);

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

    this.client.onComment.on((message) => {
      const comment = chunkedMessageToComment(message, this);
      if (comment == null) return;

      if (this._canSpeak) {
        void BouyomiChan.speak(comment);
      }

      this.comments.push(comment);
    });

    // デバッグ用
    setDebug(this.client);
  }

  public close() {
    if (this.client == null) return;
    this.client.close();
  }

  // デバッグ用
  public addComment(...comments: NicoliveComment[]) {
    this.comments.push(...comments);
  }
}

export const Nicolive = new _Nicolive();

function chunkedMessageToComment({ meta, payload }: ChunkedMessage, nicolive: _Nicolive): NicoliveComment | undefined {
  if (meta == null) return;

  const commentId = meta.id!;
  let type: NicoliveComment["type"];
  let no: number | undefined;
  let iconUrl: string | undefined;
  let userId: string | number | undefined;
  let name: string | undefined;
  const time = timestampToMs(meta.at!) - nicolive.client!.beginTime.getTime();
  let content: string;

  if (payload.case === "message") {
    const data = payload.value.data;
    if (data.case === "chat") {
      type = "listener";
      no = data.value.no;
      userId = data.value.hashedUserId ?? Number(data.value.rawUserId)!;
      iconUrl = userIdToIconUrl(userId);
      name = data.value.name;
      content = data.value.content;
    } else if (data.case === "nicoad") {
      return; // TODO:
    } else if (data.case === "gift") {
      return; // TODO:
    } else if (data.case === "simpleNotification") {
      type = "system";
      content = data.value.message.value!;
    } else return;
  } else {
    if (payload.case !== "state") return;

    type = "owner";
    const display = payload.value.marquee?.display;
    if (display?.operatorComment == null) return;
    userId = nicolive.client!.ownerId;
    iconUrl = userIdToIconUrl(userId);
    name = nicolive.client!.ownerName;
    content = display.operatorComment.content!;
  }

  return {
    type,
    commentId,
    no,
    iconUrl,
    userId,
    name,
    time: timeString(time),
    content,
  };
}


function userIdToIconUrl(userId?: string | number) {
  if (typeof userId !== "number") return iconNone;

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