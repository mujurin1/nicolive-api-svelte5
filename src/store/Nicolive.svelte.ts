import { NicoliveClient, timestampToMs } from "@mujurin/nicolive-api-ts";
import type { ChunkedMessage } from "@mujurin/nicolive-api-ts/build/gen/dwango_pb";
import { iconNone, timeString } from "../utils";
import { BouyomiChan } from "./BouyomiChan.svelte";
import { NO_SPEAK_NAME, store, type NicoliveUser } from "./store.svelte";

export interface NicoliveComment {
  type: "listener" | "owner" | "system";
  /** システムメッセージは184とする */
  is184: boolean;

  commentId: string;
  userId: string | number | undefined;
  no: number | undefined;
  iconUrl: string | undefined;
  name: string | undefined;
  time: string;
  content: string;
  /** コメントに含まれるURL */
  link: string | undefined;
  /** シャープを含むコメントか */
  includeSharp: boolean;
}

/** システムメッセージのコメントのユーザーは含まれない */
export interface NicoliveUser_live {
  id: string | number;
  is184: boolean;
  name: string;
  firstNo?: number;
}

class _Nicolive {
  /** 接続開始時の過去コメを読み上げないためのフラグ */
  private _canSpeak = false;

  public url = $state("");
  public get maxBackwards() { return store.general.maxBackwards; }
  public set maxBackwards(value) { store.general.maxBackwards = value; }

  public client = $state<NicoliveClient>();
  public comments = $state<NicoliveComment[]>([]);

  public connectWs = $state(false);
  public connectComment = $state(false);

  /**
   * 接続している放送単位でのユーザーの情報を管理する\
   * システムメッセージのコメントのユーザーは管理しない
   * 
   * `Map`だと内部の値が変更されても通知されないためオブジェクトで管理する
   */
  public users = $state<Record<string | number, NicoliveUser_live>>({});

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

      let storeUser: NicoliveUser | undefined;

      if (comment.type !== "system" && comment.userId != null) {
        // ユーザーのコメントの場合にユーザーの情報を取得して storeUser にセットする
        // およびそのユーザーの情報を更新する
        const match = /[@＠]([^\s@＠]+)/.exec(comment.content);
        let kotehan = match?.[1];

        storeUser = store.nicolive.users_primitable[comment.userId];
        if (storeUser == null) {
          // 184は枠毎にIDが変わるので保存しないで良い
          // 今はコテハン以外に保存する必要のある情報はない
          if (!comment.is184 && kotehan != null) {
            store.nicolive.users_primitable[comment.userId!] = {
              id: comment.userId,
              name: comment.name,
              kotehan,
            };
          }
        } else {
          if (kotehan == null) kotehan = storeUser.kotehan;
          else storeUser.kotehan = kotehan;
        }

        // let liveUser = this.users.get(comment.userId);
        let liveUser = this.users[comment.userId];

        if (liveUser == null) {
          liveUser = {
            id: comment.userId,
            name: kotehan ?? comment.name ?? comment.userId as string,
            firstNo: comment.no,
            is184: comment.is184,
          };

          if (store.general.nameToNo && liveUser.is184 && kotehan == null) {
            liveUser.name = `${liveUser.firstNo} コメ`;
          }

          // this.users.set(comment.userId, liveUser);
          this.users[comment.userId] = liveUser;
        } else {
          if (kotehan != null) liveUser.name = kotehan;
          if (
            comment.no != null && liveUser.firstNo != null &&
            comment.no < liveUser.firstNo
          ) {
            liveUser.firstNo = comment.no;

            if (store.general.nameToNo && comment.is184)
              liveUser.name = `${liveUser.firstNo} コメ`;
          }
        }

        if (comment.no != null && liveUser.firstNo != null && comment.no < liveUser.firstNo) {
          liveUser.firstNo = comment.no;
        }
      }

      if (this._canSpeak) {
        if (storeUser != null && !(store.general.hideSharp && comment.includeSharp)) {
          // ユーザーのメッセージを読み上げる
          void BouyomiChan.speak(comment.content, storeUser.kotehan ?? storeUser.name);
        } else if (comment.type === "system" && store.yomiage.speakSystem) {
          // システムメッセージを読み上げる
          void BouyomiChan.speak(comment.content, undefined);
        }
      }

      this.comments.push(comment);
    });

    document.title = `${this.client.title} - ${this.client.liveId}`;

    // デバッグ用
    // setDebug(this.client);
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
  let userId: string | number | undefined;
  let type: NicoliveComment["type"];
  let no: number | undefined;
  let iconUrl: string | undefined;
  let is184: boolean;
  let name: string | undefined;
  const time = timestampToMs(meta.at!) - nicolive.client!.beginTime.getTime();
  let content: string;
  let link: string | undefined;


  if (payload.case === "message") {
    const data = payload.value.data;
    if (data.case === "chat") {
      type = "listener";
      userId = data.value.hashedUserId ?? Number(data.value.rawUserId)!;
      is184 = data.value.rawUserId == null;
      no = data.value.no;
      iconUrl = userIdToIconUrl(userId);
      name = data.value.name;
      content = data.value.content;
    } else if (data.case === "nicoad") {
      type = "system";
      is184 = true;
      // TODO: ニコニ広告が復活したらメッセージを確認する
      let msg: string | undefined;
      if (data.value.versions.case === "v0") {
        msg = data.value.versions.value.latest?.message;
      } else if (data.value.versions.case === "v1") {
        msg = data.value.versions.value.message;
      }
      if (msg == null) {
        name = `開発中のため簡易メッセージです ${NO_SPEAK_NAME}`;
        content = "ニコニ広告されました";
      } else {
        content = msg;
      }
    } else if (data.case === "gift") {
      type = "system";
      is184 = true;
      content = data.value.message;
    } else if (data.case === "simpleNotification") {
      type = "system";
      is184 = true;
      content = data.value.message.value!;
    } else return;
  } else if (payload.case === "state") {
    type = "owner";
    is184 = false;
    const operatorComment = payload.value.marquee?.display?.operatorComment;
    if (operatorComment == null) return;
    userId = nicolive.client!.ownerId;
    iconUrl = userIdToIconUrl(userId);
    name = nicolive.client!.ownerName;
    content = operatorComment.content!;
    link = operatorComment.link;
  } else
    return;

  if (store.general.urlToLink && link == null) {
    link = /.*(https?:\/\/\S*).*/.exec(content)?.[1];
  }

  return {
    type,
    commentId,
    userId,
    no,
    iconUrl,
    is184,
    name,
    time: timeString(time),
    content,
    link,
    includeSharp: /[♯#＃]/.test(content),
  };
}


function userIdToIconUrl(userId?: string | number) {
  if (typeof userId !== "number") return iconNone;
  return `https://secure-dcdn.cdn.nimg.jp/nicoaccount/usericon/${Math.floor(userId / 1e4)}/${userId}.jpg`;
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