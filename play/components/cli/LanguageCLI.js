import { info, alert, prompt } from '@nan0web/ui-cli'

/**
 * UI messages for Language CLI — defined as a Model-as-Schema pattern.
 * All translatable text lives here, NEVER as string literals in adapters.
 */
export class LanguageCLIMessages {
	static promptMessage = {
		help: 'Please select a language.',
	}
	static successMessage = {
		help: 'Language selected!',
	}
}

/**
 * Example of how we compose CLI interfaces without direct console.info/console.log,
 * relying entirely on components that receive translation keys from Models.
 *
 * "в ui-cli теж жодних console info... зберігаємо всі переклади або в моделях або в компонентах"
 */
export async function promptLanguage(t, Language) {
	// ✅ All keys come from Models, NEVER from string literals
	info(t(LanguageCLIMessages.promptMessage.help))

	try {
		// Generate form from the model schema
		const result = await prompt.renderForm(Language, { t })

		info(t(LanguageCLIMessages.successMessage.help))
		return result
	} catch (err) {
		if (err.message === 'validation_failed') {
			alert(t(Language.locale.errorNotFound))
		}
		throw err
	}
}
