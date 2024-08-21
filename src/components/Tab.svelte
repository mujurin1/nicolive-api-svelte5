<script lang="ts">
  import type { Snippet } from "svelte";
  type Name = $$Generic<string>;

  let { names, content }: {
    names: readonly Name[];
    content: Snippet<[Name]>;
  } = $props();

  let currentTab = $state(names[0]);
</script>

<div class="tab">
  <div class="tab-header" role="tablist">
    {#each names as tabName (tabName)}
      {@const selected = tabName === currentTab}
      <button class="tab-name" class:selected={selected} type="button" onclick={() => currentTab = tabName}>{tabName}</button>
    {/each}
  </div>

  {@render content(currentTab)}
</div>

<style>
  .tab {
    display: grid;
    grid-template-rows: auto 1fr;
    height: 100%;
  }

  .tab-header {
    display: flex;
    flex-wrap: wrap;
    padding: 5px 5px 0 5px;
    height: 100%;
    box-sizing: border-box;
    margin-right: 70px;
  }

  .tab-name {
    display: block;
    cursor: pointer;

    font-size: 16px;
    color: #3d3d3d;
    background-color: #e2e2e2;

    margin-bottom: 3px;
    border: none;
    border-radius: 8px;

    &:not(:last-child) {
      margin-right: 3px;
    }

    &:hover {
      opacity: .8;
    }

    &.selected {
      color: black;
      background-color: #d6ecf0;
      background-color: #fbe5af;
    }
  }
</style>
