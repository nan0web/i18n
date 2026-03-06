# i18n Package Requests

1. **Refine extraction of `value` inside Model-as-Schema options**  
   Currently, the regex `/(?:help|label|title|...): '...'/` extracts strings for translation perfectly. However, if we blindly add `value|` to the regex, it erroneously extracts technical values inside array maps (like `options: [{ value: 'premium', label: 'Premium cards' }]`). The goal is to translate the UI strings (`label`), not the system IDs (`value`).

   **Task:** Implement a smarter parser or AST-based extractor instead of pure regex if `value` needs to be extracted in certain contexts but strictly **not** inside `options`. Until then, `value` is removed from the `i18n generate/sync` regex block.

2. **Add `--yaml` switch to `npx i18n sync`**  
   Implement a `--yaml` flag to synchronize translation keys directly into `_/t.yaml` instead of resolving them into `_/t.json`. `yaml` files are the main Developer Experience (DX) source of truth, so when sync runs, it should directly push missing strings to `data/{locale}/_/t.yaml`.
