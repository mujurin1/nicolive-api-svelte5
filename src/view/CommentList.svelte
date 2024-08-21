<script lang="ts">
  import { tick } from "svelte";
  import { Nicolive } from "../store/Nicolive.svelte";
  import { store } from "../store/store.svelte";
  import { iconNone } from "../utils";

  let listView: HTMLDivElement;

  $effect.pre(() => {
    Nicolive.comments.length;

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

<div bind:this={listView} class="comment-list" tabindex="-1">
  {#each Nicolive.comments as comment (comment.commentId)}
    <!-- {@const user = Nicolive.users.get(comment.userId!)} -->
     {@const user = Nicolive.users[comment.userId!]}
     {@const sharp = comment.type === "listener" && store.general.hideSharp && /[♯#＃]/.test(comment.content)}
    <div
      class="comment"
      class:bold={
        store.general.firstIsBold &&
        comment.no != null &&
        user?.firstNo === comment.no
      }>
      <div class="child no">{comment.no}</div>
      {#if sharp}
        <div class="child icon"></div>
        <div class="child name"></div>
      {:else}
        <div class="child icon">
          <!-- svelte-ignore a11y_missing_attribute -->
          <img src={comment.iconUrl} onerror={onErrorImage} />
        </div>
        {#if (comment.name ?? comment.userId) !== null}
          <div class="child name" title={comment.name ?? (comment.userId as string)}>
            {user?.name}
          </div>
        {/if}
      {/if}
      <div class="child time">{comment.time}</div>
      <div class="child content">
        {#if sharp}
          ＃シャープコメントだよ＃
        {:else if comment.link == null}
          {comment.content}
        {:else}
          <a href={comment.link} target="_blank" title={comment.link}>{comment.content}</a>
        {/if}
      </div>
    </div>
  {/each}
</div>

<style>
  .comment-list {
    height: 100%;
    overflow: hidden;
    overflow-y: auto;
  }

  .comment {
    display: flex;
    min-height: 30px;

    font-size: 1rem;
    border-bottom: 1px solid black;

    & > .child {
      margin-right: 6px;
      display: flex;
      align-items: center;
    }

    & > .no {
      display: flex;
      justify-content: flex-end;
      flex: 0 0 40px;
      padding-right: 5px;
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
      .bold {
        font-weight: bold;
      }
</style>
