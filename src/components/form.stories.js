import Form from './Form.svelte'

export default { title: 'Form' }

export const FormStory = () => ({
  Component: Form,
  props: {
    placeholder: 'Placeholder',
    buttonLabel: 'Ajouter',
  }
})
