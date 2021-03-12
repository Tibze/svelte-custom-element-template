<script>
  import { createEventDispatcher, onDestroy, onMount } from 'svelte'
  import { get_current_component } from 'svelte/internal'
  import { fade } from 'svelte/transition'
  import { isLoading, t, locale } from 'svelte-i18n'
  import setupI18N from './lib/i18n'
  import Styles from './styles.svelte'
  import Form from './components/Form.svelte'
  import List from './components/List.svelte'

  const isWc = !!get_current_component().dispatchEvent

  const customElement = get_current_component()

  let dispatch = null

  if (isWc) {
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
  h1, p {
    font-family: 'Open Sans', sans-serif;
  }

  .clock-container {
    width: 500px;
  }

  .main-wrapper {
    font-family: 'Open Sans', sans-serif;
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

  .form-comp {
    margin-bottom: 10px;
  }
</style>

<Styles />

{#if $isLoading || !initialized}
  <p>Please wait...</p>
{:else}
  <div class='lang-wrapper'>
    <button class='button' on:click={changeLang('en')}>EN</button>
    <button class='button' on:click={changeLang('fr')}>FR</button>
  </div>
  <h1>{$t('index:title')}</h1>
  <p>{$t('index:description')}</p>

  <div class="main-wrapper">
    <div class='form-comp'>
      <Form
        placeholder={$t('form:placeholder')}
        buttonLabel={$t('form:buttonLabel')}
        on:addTodo={addTodo}
      />
    </div>
    <div class='form-comp'>
      <List
        class='list-comp'
        noData={$t('list:nothingHere')}
        buttonLabel={$t('list:buttonLabel')}
        todos={todos}
        on:removeTodo={removeTodo}
      />
    </div>
  </div>
{/if}
<svelte:options tag="todo-list" />
