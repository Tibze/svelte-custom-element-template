import List from './List.svelte'

export default { title: 'List' }

export const ListStory = () => ({
  Component: List,
  props: {
    noData: 'Rien à afficher !',
  }
})

export const ListStoryWithTasks = () => ({
  Component: List,
  props: {
    noData: 'Rien à afficher !',
    buttonLabel: 'Supprimer',
    todos: [
      {
        id: 12345,
        text: 'Sample task 1'
      },
      {
        id: 12745,
        text: 'Sample task 2'
      }
    ]
  }
})
