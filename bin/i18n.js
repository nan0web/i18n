#!/usr/bin/env node

/**
 * i18n Architecture Auditor & Toolkit
 * Thin CLI entry point — all logic lives in I18nCliApp (Data-Driven).
 */
import { I18nCliApp } from '../src/domain/I18nCliApp.js'
import { bootstrapApp } from '@nan0web/ui-cli'

bootstrapApp(I18nCliApp)

