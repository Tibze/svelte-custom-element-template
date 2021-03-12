import { addMessages, getLocaleFromNavigator, init } from 'svelte-i18n'

import en from '../config/translations/en.json'
import fr from '../config/translations/fr.json'

const setupI18N = () => {
  addMessages('en', en)
  addMessages('fr', fr)

  init({
    fallbackLocale: 'fr',
    initialLocale: getLocaleFromNavigator(),
  })
}

export default setupI18N
