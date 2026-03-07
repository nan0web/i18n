/**
 * Example demonstrating how @nan0web/i18n is used in Web Components (UI-Lit).
 * This component simply receives a Model-as-Schema object and a `t()` translation
 * function as properties. All UI text inside is fully extracted and translatable.
 */
import { LitElement, html } from 'lit'

export class UserForm extends LitElement {
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
		const username = this.model.properties.username
		const role = this.model.properties.role

		return html`
			<form>
				<div class="field">
					<label>${this.t(username.label)}</label>
					<input type="text" placeholder=${this.t(username.placeholder)} />
					<small class="help">${this.t(username.help)}</small>

					<!-- Example showing an error message -->
					<!-- We extract ANY property starting with 'error' -->
					<span class="error">${this.t(username.errorInvalid)}</span>
					<span class="error">${this.t(username.errorNotFound)}</span>
				</div>

				<div class="field">
					<label>${this.t(role.label)}</label>
					<select>
						${role.options.map(
							(opt) => html`
								<!-- We translate label, but NOT value, because 'value' inside options array is ignored by our extractor -->
								<option value=${opt.value}>${this.t(opt.label)}</option>
							`,
						)}
					</select>
				</div>
			</form>
		`
	}
}
