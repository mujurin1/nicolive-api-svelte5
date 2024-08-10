<script lang="ts">
  import { BouyomiChan } from "../bouyomiChan.svelte";
  import { nicolive } from "../Nicolive.svelte";
  import Setting from "./Setting.svelte";

  let setting = $state(false);

  async function connect() {
    await nicolive.connect();
  }
  function close() {
    nicolive.close();
  }
</script>

<div class="header">
  <div class="left">
    <div class="head-item">
      <input bind:value={nicolive.url} size="30" />
      <button type="button" onclick={connect}>接続</button>
      <button type="button" onclick={close}>切断</button>
    </div>

    <div class="head-item">
      <div style="margin-right: 5px">棒読みちゃん</div>
      <button type="button" onclick={BouyomiChan.switchSpeak}>
        {BouyomiChan.isSpeak ? "ON" : "OFF"}
      </button>
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

    & > .left {
      display: flex;
      justify-content: space-between;
    }
  }

  .head-item {
    display: flex;
    margin-right: 10px;
    flex-wrap: wrap;
    font-size: 1rem;

    & > * {
      margin-right: 10px;
      align-items: center;
      display: flex;
      align-items: center;
    }
  }

  .setting-btn {
    margin-right: 20px;
  }
</style>
