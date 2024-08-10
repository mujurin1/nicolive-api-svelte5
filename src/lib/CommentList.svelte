<script lang="ts">
  import { tick } from "svelte";
  import { nicolive } from "../Nicolive.svelte";
  import { iconNone } from "../utils";

  let listView: HTMLDivElement;

  $effect.pre(() => {
    nicolive.comments.length;

    const autoscroll =
      listView && listView.offsetHeight + listView.scrollTop > listView.scrollHeight - 50;

    if (autoscroll) {
      tick().then(() => {
        listView!.scrollTo(0, listView!.scrollHeight);
      });
    }
  });

  function onErrorImage(e: Event) {
    const img = e.currentTarget as HTMLImageElement;
    img.src = iconNone;
  }
</script>

<div bind:this={listView} class="comment-list">
  {#each nicolive.comments as comment}
    <div class="comment">
      <div class="child no">{comment.no}</div>
      <div class="child icon">
        <img src={comment.iconUrl} alt="" onerror={onErrorImage} />
      </div>
      <div class="child name">{comment.name ?? comment.userId}</div>
      <div class="child time">{comment.time}</div>
      <div class="child content">{comment.content}</div>
    </div>
  {/each}
</div>

<style>
  .comment {
    display: flex;
    min-height: 30px;

    font-size: 1rem;
    border-bottom: 1px solid black;

    & > .child {
      margin-right: 4px;
      display: flex;
      align-items: center;
    }

    & > .no {
      padding-right: 5px;
      display: flex;
      justify-content: flex-end;
      flex: 0 0 40px;
    }
    & > .icon {
      flex: 0 0 30px;

      & > img {
        height: 30px;
      }
    }
    & > .name {
      flex: 0 0 100px;
      overflow: hidden;
      white-space: nowrap;
    }
    & > .time {
      flex: 0 0 50px;
    }
    & > .content {
      flex: 1 0 10px;
    }
  }
</style>
