<script>
    import { slide } from "svelte/transition";
    import { elasticInOut } from "svelte/easing";
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
    export let todos

    const removeTodo = (id) => {
        dispatch('removeTodo', id);
    }
</script>

<ul class:list={todos.length > 0}>
    {#each todos as todo (todo.id)}
        <li class="list-item" transition:slide="{{duration: 300, easing: elasticInOut}}">
            <div class="is-flex" style="align-items: center">
                <span class="is-pulled-left">{todo.text}</span>
                <div style="flex: 1"></div>
                <button class="button is-text is-pulled-right is-small" on:click={()=> removeTodo(todo.id)}>
                retirer
                </button>
            </div>
        </li>
    {:else}
        <li class="has-text-centered" transition:slide="{{delay: 600, duration: 300, easing: elasticInOut}}">Nothing here!</li>
    {/each}
</ul>
