interface PresetOptions {
  template: string
  replaces?: Array<[RegExp, string]>
}

class Preset {
  constructor (options: PresetOptions) {
    this.#originalOptions = structuredClone(options)
    this.#template = options.template
    this.#replaces = structuredClone(options.replaces) ?? []
  }

  readonly #originalOptions: PresetOptions

  readonly #template: string
  readonly #replaces: Array<[RegExp, string]>

  addReplaceOnce (replace: [RegExp, string]): this {
    this.#replaces.push(replace)
    return this
  }

  get prompt (): string {
    return this.#replaces.reduce((acc, [regex, replacement]) => acc.replace(regex, replacement), this.#template)
  }

  clone (): Preset {
    return new Preset(this.#originalOptions)
  }
}

export { Preset }
export type { PresetOptions }
