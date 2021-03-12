<script>
    import { slide } from "svelte/transition";
    import { elasticInOut } from "svelte/easing";
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
    export let noData = '[noData]'
    export let buttonLabel ='[buttonLabel]'
    export let todos = []

    const removeTodo = (id) => {
        dispatch('removeTodo', id);
    }
</script>

<ul class='list'>
    {#each todos as todo (todo.id)}
        <li class="list-item" transition:slide="{{duration: 300, easing: elasticInOut}}">
            <span class="text">{todo.text}</span>
            <button class="button" on:click={()=> removeTodo(todo.id)}>
                {buttonLabel}
            </button>
        </li>
    {:else}
        <li class="list-item" transition:slide="{{delay: 600, duration: 300, easing: elasticInOut}}">
            {noData}
        </li>
    {/each}
</ul>

<style type="text/scss" lang="scss">
    .list {
        margin: 0;
        padding: 0;
    }
    .list-item {
        font-family: 'Open Sans', sans-serif;
        display: flex;
        margin-bottom: 5px;
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
