<script lang="ts">
  import CommentList from "./components/CommentList.svelte";
  import Header from "./components/Header.svelte";
</script>

<main>
  <div class="view">
    <Header />
    <CommentList />
  </div>
</main>

<style>
  .view {
    display: flex;
    padding-top: 4px;
    /* padding: 4px 4px 0 4px; */
    box-sizing: border-box;
    flex-direction: column;
    height: 100vh;

    :global(& > .header) {
      flex: 0 0 1;
      margin: 2px 4px;
    }

    :global(& > .comment-list) {
      flex: 1 1 1;
      overflow-y: auto;
    }
  }
</style>
