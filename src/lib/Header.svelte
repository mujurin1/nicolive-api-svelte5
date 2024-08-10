<script lang="ts">
  import { BouyomiChan } from "../bouyomiChan.svelte";
  import { nicolive } from "../Nicolive.svelte";
  import Setting from "./Setting.svelte";

  let setting = $state(false);

</script>

{#snippet connection(text: string, on: boolean)}
<div class:connect-on={on} class:connect-off={!on}>
  {text}
</div>
{/snippet}

<div class="header">
  <div class="left">
    <div class="head-item">
      <input bind:value={nicolive.url} size="30" />
      {#if nicolive.connectComment}
        <button type="button" onclick={() => nicolive.close()}>切断</button>
      {:else}
        <button type="button" onclick={() => nicolive.connect()}>接続</button>
      {/if}
    </div>

    <div class="head-item">
      <div style="margin-right: 5px">棒読みちゃん</div>
      <button type="button" onclick={BouyomiChan.switchSpeak}>
        {BouyomiChan.isSpeak ? "ON" : "OFF"}
      </button>
    </div>

    <div class="head-item" title="ウェブソケットの接続状態">
      {@render connection("WS:", nicolive.connectWs)}
    </div>
    <div class="head-item" title="コメントの受信状態">
      {@render connection("CO:", nicolive.connectComment)}
    </div>
  </div>

  <button class="setting-btn" type="button" onclick={() => (setting = !setting)}>
    設定いろいろ
  </button>
</div>

{#if setting}
  <Setting />
{/if}

<style>
  .header {
    display: flex;
    justify-content: space-between;
    font-size: 1rem;
    white-space: nowrap;

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
    margin-right: 10px;
    font-size: 1rem;

    & > * {
      display: flex;
      align-items: center;

      &:not(:last-child) {
        margin-right: 10px;
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
