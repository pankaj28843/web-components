export type ComponentMap = Record<string, CustomElementConstructor>;

export function defineWebComponent<T extends CustomElementConstructor>(
  name: string,
  constructor: T,
): T {
  const existing = customElements.get(name);
  if (existing && existing !== constructor) {
    throw new Error(`The custom element "${name}" is already registered by another constructor.`);
  }

  if (!existing) {
    customElements.define(name, constructor);
  }

  return constructor;
}

export function registerComponents(components: ComponentMap): void {
  for (const [name, constructor] of Object.entries(components)) {
    defineWebComponent(name, constructor);
  }
}
