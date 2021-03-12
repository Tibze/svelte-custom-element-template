<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
    export let placeholder = '[placeholder]'
    export let buttonLabel = '[buttonLabel]'
    let input = "";
    function addTodo() {
        dispatch('addTodo', {
            text: input
        });
    }
</script>

<form on:submit|preventDefault={addTodo}>
    <input bind:value={input} class="input" type="text" placeholder={placeholder}>
    <button class="button">
        {buttonLabel}
    </button>
</form>

<style type="text/scss" lang="scss">
  form {
    display: flex;
  }
  .input {
      font-family: 'Open Sans', sans-serif;
      border-radius: 5px;
      border: 1px solid lightgrey;
      padding: 1em;
  }
  .button {
      font-family: 'Open Sans', sans-serif;
      background-color: black;
      border: 0;
      border-radius: 5px;
      color: white;
      margin-left: 5px;
      padding: 0 20px;
  }
</style>
