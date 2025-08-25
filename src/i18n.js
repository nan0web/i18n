/**
 * Default English translation dictionary (fallback/default).
 *
 * Keys correspond to the original English UI strings.
 */
const defaultVocab = {
	"Welcome!": "Welcome, {name}!",
	"User Form": "User Form",
	"Submit": "Submit",
	"Form submitted successfully!": "Form submitted successfully!",
	"Validation failed!": "Validation failed!",
	"Registration Form": "Registration Form",
	"Username": "Username",
	"Password": "Password",
	"Confirm Password": "Confirm Password",
	"Email or Telephone": "Email or Telephone",
	"Currency Exchange": "Currency Exchange",
	"From Currency": "From Currency",
	"To Currency": "To Currency",
	"Amount": "Amount",
	"Top-up Telephone": "Top-up Telephone",
	"Phone Number": "Phone Number",
	"Top-up Amount": "Top-up Amount",
	"Top-up Currency": "Top-up Currency",
}

/**
 * Creates a translation function bound to a specific vocabulary.
 *
 * @param {Object<string,string>} vocab - Mapping from keys to localized strings.
 * @returns {(key:string, vars?:Object<string,string|number>)=>string} Translation function.
 *
 * The returned function looks up the key in the supplied vocabulary.
 * If the key is missing, it returns the original key.
 * Placeholders in the form `{name}` are replaced by values from the `vars` object.
 *
 * Example:
 *   const t = createT({ "Hello {name}": "{name}, вітаю!" })
 *   t("Hello {name}", { name: "Іван" }) // → "Іван, вітаю!"
 */
export function createT(vocab) {
	return function t(key, vars = {}) {
		const template = Object.prototype.hasOwnProperty.call(vocab, key) ? vocab[key] : key
		return template.replace(/{([^}]+)}/g, (_, name) =>
			Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : `{${name}}`
		)
	}
}

/** Default translation function using the English vocabulary. */
const t = createT(defaultVocab)

export default t
