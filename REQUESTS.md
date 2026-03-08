# 📬 REQUESTS — Запити до @nan0web/i18n

> Цей файл містить архітектурні запити від інших пакетів екосистеми.

---

## 1. `extractFromModels(models)` — Збір ключів з живих Model-as-Schema об'єктів

**Від:** `@nan0web/law`, `@nan0web/0hcnai.framework`
**Дата:** 2026-03-08
**Пріоритет:** 🔴 Критичний

### Суть

Поточна функція `extract(content: string)` парсить вихідний код через regex.  
Потрібна **нова функція** `extractFromModels(models)`, яка приймає **об'єкт живих моделей** і обходить їх `static` поля, збираючи значення `help`, `label`, `placeholder`, `title`, `message`, `error*` як ключі перекладу.

### Контракт API

```js
import * as models from './src/domain/index.js'
import { extractFromModels } from '@nan0web/i18n'

// models = { LoginModel, LanguageIntentModel, PaymentModel, ... }
const keys = extractFromModels(models)
// → ['Username', 'Enter your login', 'Password', ...]
```

### Алгоритм

```js
import { EXTRACT_FIELDS } from './extract.js'

/**
 * Extract i18n keys from live Model-as-Schema static fields.
 * @param {Record<string, Function>} models — object of exported Model classes
 * @returns {string[]} — sorted unique array of translation keys
 */
export function extractFromModels(models) {
  const keys = new Set()
  // Перетворити wildcard-поля в regex для порівняння
  const fieldPatterns = EXTRACT_FIELDS.map((f) => new RegExp('^' + f.replace('*', '.*') + '$'))

  for (const [name, ModelClass] of Object.entries(models)) {
    if (typeof ModelClass !== 'function') continue

    for (const prop of Object.keys(ModelClass)) {
      const meta = ModelClass[prop]
      if (!meta || typeof meta !== 'object') continue

      for (const [key, value] of Object.entries(meta)) {
        if (typeof value !== 'string') continue
        const matches = fieldPatterns.some((re) => re.test(key))
        if (matches) keys.add(value)
      }
    }
  }

  return [...keys].sort()
}
```

### Приклад моделі, з якої мають збиратися ключі

```js
export class LoginModel {
  static username = { label: 'Username', help: 'Enter your login', alias: 'u' }
  static password = { label: 'Password', help: 'Enter your password', alias: 'p' }
  static submit = { label: 'Sign In' }
}
```

**Очікуваний результат:**

```js
extractFromModels({ LoginModel })
// → ['Enter your login', 'Enter your password', 'Password', 'Sign In', 'Username']
```

### Де експортувати

- `src/extract.js` — реалізація поряд з `extract()`
- `src/index.js` — реекспорт: `export { extractFromModels } from './extract.js'`

### Зв'язок з i18n-standards workflow

Ця функція реалізує правило **4.1 Model Export Rule** з `.agent/workflows/i18n-standards.md`:

> Кожна модель, яка містить статичні поля з метаданими, ПОВИННА бути експортована, щоб `@nan0web/i18n` міг обійти їхні статичні поля та зібрати ключі для словника перекладів.
