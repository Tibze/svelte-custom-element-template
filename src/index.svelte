<script>
  import { createEventDispatcher, onDestroy, onMount } from 'svelte'
  import { get_current_component } from 'svelte/internal'
  import { fade } from 'svelte/transition'
  import { isLoading, t, locale } from 'svelte-i18n'
  import setupI18N from './lib/i18n'
  import Styles from './styles.svelte'
  import Form from './components/Form.svelte'
  import List from './components/List.svelte'

  const production = !!get_current_component().dispatchEvent

  const customElement = get_current_component()

  let dispatch = null

  if (production) {
    dispatch = (name, detail) => {
      customElement.dispatchEvent(new CustomEvent(name, {
        detail,
        composed: true
      }))
    }
  } else {
    dispatch = createEventDispatcher()
  }

  export let title = 'Hello from component!!'
  let initialized = false
  let visible = true

  let todos = [];

  const unsuscribeLangChange = locale.subscribe(lang => {
    if (lang) {
      dispatch('language-change', lang)
    }
  })

  const addTodo = (e) => {
    console.log('add todoll')
    const { text } = e.detail
    if (text)
      todos = [
        ...todos,
        {
          text,
          id: Math.random()
                  .toString(36)
                  .substr(2, 9)
        }
      ];
  }

  const removeTodo = (e) => {
    console.log(e)
    const id = e.detail
    const index = todos.findIndex(todo => todo.id === id)
    todos.splice(index, 1)
    todos = todos
  }

  onMount(() => {
    setupI18N()
    initialized = true
  })

  onDestroy(() => {
    unsuscribeLangChange()
  })

  const changeLang = lang => () => locale.set(lang)
</script>

<style type="text/scss" lang="scss">
  h1 {
    font-family: 'Open Sans', sans-serif;
  }

  .clock-container {
    width: 500px;
  }
</style>

<Styles />

{#if $isLoading || !initialized}
  <p>Please wait...</p>
{:else}
  <h1>{title}</h1>

  <p>{$t('text:example-paragraph')}</p>

  <button on:click={changeLang('en')}>EN</button>
  <button on:click={changeLang('es')}>ES</button>

  <div class="main-wrapper">
    <Form on:addTodo={addTodo} />
    <List todos={todos} on:removeTodo={removeTodo} />
  </div>
{/if}
<svelte:options tag="svelte-custom-element" />
