<script lang="ts">
    import Tab from "../components/Tab.svelte";
    import { BouyomiChan } from "../store/BouyomiChan.svelte";
    import { store, storeClear, storeSave, Yomiage } from "../store/store.svelte";

  let { show = $bindable() }: { show: boolean } = $props();

  let setting : HTMLDialogElement;
  let useAdvanced = $state(false);
  let savedata = $state("");

  $effect(() => {
    if(!useAdvanced) return;
    
    savedata = JSON.stringify(store, null, 2);
  })

  $effect(() => {
    if(show) setting.showModal();
    else {
      bouyomiTest = "none";
      useAdvanced = false;
      setting.close();
    }
  });

  let bouyomiTest = $state<"none" | "try" | "miss" | "ok">("none");

  function testSpeak() {
    bouyomiTest = "try";
    BouyomiChan.speak("テストです","ユーザー名", true)
      .then(() => (bouyomiTest = "ok"))
      .catch(() => (bouyomiTest = "miss"));
  }
</script>

<dialog bind:this={setting} class="mordal">
  <!-- 雑ボタン. このボタンに被らないように<Tab>で margin-right を指定している -->
  <button class="close-btn" onclick={() => show = false}>閉じる</button>

  <div class="mordal-body">
    <Tab names={["一般", "読み上げ", "Advanced"]}>

{#snippet content(tabId)}
  <div class="content">
    {#if tabId === "一般"}

      <div class="line">
        <div>
          <div>接続時に取得する過去コメント数</div>
          <div class="hint">実際に取得するコメント数とは誤差があります</div>
        </div>
        <input type="number" bind:value={store.general.maxBackwards} />
      </div>

      <div class="line">
        <label for="kotehan">コテハンを使用する</label>
        <input type="checkbox" id="kotehan" bind:checked={store.general.useKotehan} />
      </div>

      <div class="line">
        <label for="link">URLを含むコメントをリンクにする</label>
        <input type="checkbox" id="link" bind:checked={store.general.urlToLink} />
      </div>

      <div class="line">
        <label for="bold">最初のコメントを太字にする</label>
        <input type="checkbox" id="bold" bind:checked={store.general.firstIsBold} />
      </div>

      <div class="line">
        <div>
          <label for="184">184の表示名をコメ番にする</label>
          <br>
          <div class="hint">184の表示名はその人の最初のコメント番号になります</div>
        </div>
        <input type="checkbox" id="184" bind:checked={store.general.nameToNo} />
      </div>

      <div class="line">
        <div>
          <label for="sharp">シャープ(♯ # ＃)を含むコメントを隠す＆読み上げない</label>
          <br>
          <div class="hint">用途: ボドゲや初見プレイなどでリスナー同士で考察するなど</div>
        </div>
        <input type="checkbox" id="sharp" bind:checked={store.general.hideSharp} />
      </div>

    {:else if tabId === "読み上げ"}

      <div class="line">
        <label for="speak">コメントを読み上げる</label>
        <input type="checkbox" id="speak" bind:checked={store.yomiage.isSpeak} />
      </div>

      <div class="line">
        <div>名前の読み上げ</div>
        <select bind:value={store.yomiage.speakName}>
          <option value="none">読み上げない</option>
          <option value="mae">コメントの前</option>
          <option value="ato">コメントの後</option>
        </select>
      </div>

      <div class="line">
        <label for="system">システムメッセージの読み上げ</label>
        <input type="checkbox" id="system" bind:checked={store.yomiage.speakSystem} />
      </div>

      <div class="line">
        <div>読み上げテスト</div>
        <button type="button" onclick={testSpeak}>よみあげる</button>
      </div>

      <div>
        {#if bouyomiTest === "try"}
          <div>棒読みちゃんに接続中...</div>
        {:else if bouyomiTest === "ok"}
          <div>棒読みちゃん読み上げ成功 😊</div>
        {:else if bouyomiTest === "miss"}
          <div>棒読みちゃん読み上げ失敗 😭</div>
        {/if}
      </div>

      <div class="line">
        <div>
          <h3 style="margin-bottom: 0;">使用する読み上げ</h3>
          <div class="hint">VOICEVOX は対応予定。現在は利用不可です</div>
        </div>

        <div>
          {#each Yomiage as yomi (yomi)}
            {@const selected = store.yomiage.use === yomi}
            {@const disabled = yomi === "VOICEVOX"}
            <input type="radio" id={yomi} name="contact" value={yomi} onclick={() => store.yomiage.use = yomi} checked={selected} {disabled}/>
            <label for={yomi}>{yomi}</label>
          {/each}
        </div>
      </div>

      {#if store.yomiage.use === "棒読みちゃん"}
        <div class="line">
          <div>棒読みちゃんPORT</div>
          <input type="number" bind:value={BouyomiChan.port} />
        </div>
      {:else if store.yomiage.use === "VOICEVOX"}
        <div></div>
      {/if}

    {:else if tabId === "Advanced"}

      <h2 style="margin-bottom: 0;">詳しいユーザー向けのページです</h2>
      <div style="margin-bottom: 20px;">このタブの項目は注意して操作してください</div>

      {#if !useAdvanced}
        <button type="button" onclick={() => useAdvanced = true}>高度な設定を使用する</button>
      {:else}
        <div class="list" style="display: flex;">
          <div>データの変更</div>
          <button type="button" onclick={() => storeSave(JSON.parse(savedata))}>保存する</button>
          <button type="button" onclick={storeClear}>初期化する</button>
        </div>
        <div>※コメビュの保存データのJSONです。注意して操作してください</div>
        <div>※キー(property key)を消して保存した場合そのキーの値は上書きされません</div>
        <textarea
          style="width: 100%;"
          rows="20"
          bind:value={savedata}
        ></textarea>
      {/if}

    {/if}
  </div>
{/snippet}

    </Tab>
  </div>
</dialog>

<style>
  .mordal {
    background-color: #c0cbd6;

    width: 80%;
    height: 80%;
    
    padding: 0;
    border: 2px solid black;
  }

  .close-btn {
    position: absolute;
    right: 10px;
    top: 5px;
    min-width: auto;
  }
  .mordal-body {
    height: 100%;
    overflow-y: auto;
  }

  .content {
    background-color: #fbe5af;
    overflow-y: auto;

    box-sizing: border-box;
    height: 100%;
    padding: 10px;
  }

  .line {
    display: flex;
    justify-content: space-between;
    align-items: center;
    line-height: 30px;

    &:not(:last-child) {
      margin-bottom: 3px;
    }

    & > * {
      font-size: 1rem;
    }
  }

  .list {
    font-size: 1rem;
    margin-bottom: 5px;

    & > *:not(last-child) {
      margin-right: 50px;
    }
  }

  .hint {
    color: darkblue;
    margin-top: -3px;
    font-size: 0.75rem;
    text-indent: 0.5rem;
    line-height: normal;
  }

  select {
    width: 140px;
  }
  button {
    min-width: 80px;
  }
  input[type=checkbox] {
    min-width: 24px;
  }
  input[type=number] {
    width: 80px;
  }
</style>
