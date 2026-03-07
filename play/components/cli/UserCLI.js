import { info, alert, prompt } from '@nan0web/ui-cli'

/**
 * Example of how we compose CLI interfaces without direct console.info/console.log,
 * relying entirely on components that receive translation keys from Models.
 *
 * "в ui-cli теж жодних console info... зберігаємо всі переклади або в моделях або в компонентах"
 */
export async function promptUser(t, User) {
	// Information block. Passed through t() directly or wrapped in UI-CLI component.
	info(t('Please fill out the user registration form.'))

	try {
		// Generate form from the model schema
		const result = await prompt.renderForm(User, { t })

		info(t('Registration complete!'))
		return result
	} catch (err) {
		if (err.message === 'validation_failed') {
			// Model errors are strings translated by the adapter/component automatically
			// or manually here using t() on standard error keys
			alert(t(User.properties.username.errorInvalid))
		}
		throw err
	}
}
