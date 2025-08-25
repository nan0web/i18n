import { describe, it } from "node:test"
import { strict as assert } from "node:assert"
import tDefault, { createT } from "./i18n.js"
import uk from "./uk.js"

describe("createT", () => {
	it("translates Ukrainian with placeholder", () => {
		const t = createT(uk)
		assert.equal(t("Welcome!", { name: "I" }), "Вітаємо у пісочниці, I!")
	})

	it("falls back to key when missing", () => {
		const t = createT(uk)
		assert.equal(t("MissingKey", {}), "MissingKey")
	})

	it("handles multiple placeholders", () => {
		const vocab = { "Greet": "Hello {first} {last}!" }
		const t = createT(vocab)
		assert.equal(t("Greet", { first: "John", last: "Doe" }), "Hello John Doe!")
	})

	it("supports English default dictionary", () => {
		const t = tDefault
		assert.equal(t("Welcome!", { name: "Anna" }), "Welcome, Anna!")
		assert.equal(t("User Form"), "User Form")
		assert.equal(t("Submit"), "Submit")
		assert.equal(t("Form submitted successfully!"), "Form submitted successfully!")
		assert.equal(t("Validation failed!"), "Validation failed!")
	})
})
