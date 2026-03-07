/**
 * Example demonstrating how @nan0web/i18n is used in Web Components (UI-Lit).
 * This component simply receives a Model-as-Schema object and a `t()` translation
 * function as properties. All UI text inside is fully extracted and translatable.
 */
import { LitElement, html } from 'lit'

export class LanguageForm extends LitElement {
	static properties = {
		model: { type: Object },
		t: { type: Function },
	}

	constructor() {
		super()
		this.t = (key) => key // Fallback translation function
	}

	render() {
		// Component simply uses the model metadata and passes it through the i18n t() function.
		// The keys from 'label', 'placeholder', 'help', and 'error*' were already extracted
		// during the build step.
		const title = this.model.title
		const locale = this.model.locale
		const icon = this.model.icon

		return html`
			<form>
				<div class="field">
					<label>${this.t(title.help)}</label>
					<input type="text" placeholder=${this.t(title.default)} />
				</div>

				<div class="field">
					<label>${this.t(locale.help)}</label>
					<input type="text" placeholder=${this.t(locale.default)} />
					<!-- Example showing an error message -->
					<!-- We extract ANY property starting with 'error' -->
					<span class="error">${this.t(locale.errorNotFound)}</span>
				</div>

				<div class="field">
					<label>${this.t(icon.help)}</label>
					<input type="text" placeholder=${this.t(icon.default)} />
				</div>
			</form>
		`
	}
}
