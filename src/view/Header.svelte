<script lang="ts">
  import { Nicolive } from "../store/Nicolive.svelte";
  import { store } from "../store/store.svelte";
  import Setting from "./Setting.svelte";

  let showSetting = $state(false);

  let openTabs = $state<chrome.tabs.Tab[]>([]);
  
  chrome.tabs.query({}, tabs => {
    openTabs = tabs.filter(tab => tab?.url?.includes("https://live.nicovideo.jp/watch"));
  });
</script>

{#snippet connection(text: string, on: boolean)}
  <div class:connect-on={on} class:connect-off={!on}>
    {text}
  </div>
{/snippet}

<div class="header">
  <div class="left">
    <div class="head-item connect-item">
      <input bind:value={Nicolive.url}
        size="18"
        placeholder="URL (lv ch user/)"
        />
        <!-- list="tabList" -->

      <!-- <datalist id="tabList">
        {#each openTabs as tab (getNicoliveId(tab.url!))}
          <option value={getNicoliveId(tab.url!)}>
            {tab.title}
          </option>
        {/each}
      </datalist> -->
      {#if Nicolive.connectComment}
        <button type="button" onclick={() => Nicolive.close()}>切断</button>
      {:else}
        <button type="button" onclick={() => Nicolive.connect()}>接続</button>
      {/if}
    </div>

    <div class="head-item">
      <label for="speak">読み上げ</label>
      <input type="checkbox" id="speak" bind:checked={store.yomiage.isSpeak} />
    </div>

    <div class="head-item" title="ウェブソケットの接続状態">
      {@render connection("WS:", Nicolive.connectWs)}
    </div>
    <div class="head-item" title="メッセージ(コメント)サーバーとの接続状態">
      {@render connection("CO:", Nicolive.connectComment)}
    </div>
  </div>

  <button class="setting-btn" type="button" onclick={() => (showSetting = !showSetting)}>
    設定
  </button>
</div>

<Setting bind:show={showSetting} />

<style>
  .header {
    display: flex;
    justify-content: space-between;
    font-size: 1rem;
    white-space: nowrap;
    margin: 2px 4px;

    & > .left {
      display: flex;
      justify-content: space-between;
      white-space: nowrap;
      width: min-content;
      overflow: hidden;
    }
  }

  .head-item {
    display: flex;
    font-size: 1rem;

    &:not(:last-child) {
      margin-right: 10px;
    }

    &:not(.connect-item) {
      border-bottom: 2px solid dimgray;
    }

    &.connect-item {
      margin-right: 20px;
    }

    & > *:not(datalist) {
      display: flex;
      align-items: center;

      &:not(:last-child) {
        margin-right: 5px;
      }
    }
  }

  .connect-on::after {
    color: blue;
    content: "ON";
  }

  .connect-off::after {
    color: red;
    content: "OFF";
  }

  .setting-btn {
    margin-right: 10px;
  }
</style>
