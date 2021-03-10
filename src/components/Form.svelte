<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
    let input = "";
    function addTodo() {
        dispatch('addTodo', {
            text: input
        });
    }
</script>

<form class="field has-addons" style="justify-content: center" on:submit|preventDefault={addTodo}>
    <div class="control">
        <input bind:value={input} class="input" type="text" placeholder="TODO">
    </div>
    <div class="control">
        <button class="button is-primary">
            Ajouter
        </button>
    </div>
</form>

<style type="text/scss" lang="scss">
  form {
    border: 1px solid red;
  }
</style>
