import { describe, it } from "node:test"
import { strict as assert } from "node:assert"
import { createT } from "./index.js"
import uk from "./vocabs/uk.js"

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
})
