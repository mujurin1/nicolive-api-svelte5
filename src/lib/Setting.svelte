<script lang="ts">
  import { BouyomiChan } from "../bouyomiChan.svelte";
  import { nicolive } from "../Nicolive.svelte";

  let bouyomiTest = $state<"none" | "try" | "miss" | "ok">("none");
</script>

<div class="setting-panel">
  <div class="title">設定</div>

  <div class="box">
    <div class="text">棒読みちゃんPORT</div>
    <input type="number" class="port" bind:value={BouyomiChan.port} />
  </div>

  <div class="box">
    <div class="text">名前の読み上げ</div>
    <select bind:value={BouyomiChan.speakName}>
      <option value="none">読み上げない</option>
      <option value="mae">コメントの前</option>
      <option value="ato">コメントの後</option>
    </select>
  </div>

  <div class="box">
    <div class="text">接続時に取得する過去コメント数</div>
    <input type="number" bind:value={nicolive.maxBackwards} />
  </div>

  <div class="box">
    <div class="text">棒読みちゃんテスト</div>
    <button
      type="button"
      onclick={() => {
        bouyomiTest = "try";
        BouyomiChan.speak("テスト", "ユーザー名", true)
          .then(() => (bouyomiTest = "ok"))
          .catch(() => (bouyomiTest = "miss"));
      }}>よみあげる</button
    >
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
</div>

<style>
  .setting-panel {
    padding: 10px;

    background-color: antiquewhite;
    position: absolute;
    right: 25px;
    top: 40px;

    width: 400px;
    height: 300px;
  }

  .title {
    font-size: 1.4rem;
    font-weight: bold;
    margin-bottom: 5px;
    text-align: center;
  }

  .box {
    display: flex;
    justify-content: space-between;
    line-height: 30px;
    margin-bottom: 10px;

    & > * {
      margin-right: 20px;
      font-size: 1rem;
    }

    & > button {
      min-width: 80px;
    }
  }

  select {
    width: 140px;
  }

  input {
    width: 80px;
  }
</style>
