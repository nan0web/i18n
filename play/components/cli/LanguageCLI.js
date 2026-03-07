import { info, alert, prompt } from '@nan0web/ui-cli'

/**
 * Example of how we compose CLI interfaces without direct console.info/console.log,
 * relying entirely on components that receive translation keys from Models.
 *
 * "в ui-cli теж жодних console info... зберігаємо всі переклади або в моделях або в компонентах"
 */
export async function promptLanguage(t, Language) {
	// Information block. Passed through t() directly or wrapped in UI-CLI component.
	info(t('Please select a language.'))

	try {
		// Generate form from the model schema
		const result = await prompt.renderForm(Language, { t })

		info(t('Language selected!'))
		return result
	} catch (err) {
		if (err.message === 'validation_failed') {
			// Model errors are strings translated by the adapter/component automatically
			// or manually here using t() on standard error keys
			alert(t(Language.locale.errorNotFound))
		}
		throw err
	}
}
