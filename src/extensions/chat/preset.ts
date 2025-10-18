interface PresetOptions {
  template: string
}

export class Preset {
  readonly #template: string

  constructor (options: PresetOptions) {
    this.#template = options.template
  }

  get prompt (): string {
    return this.#template
  }

  clone (): Preset {
    return new Preset({ template: this.#template })
  }
}
