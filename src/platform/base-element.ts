export abstract class BaseElement extends HTMLElement {
  protected readonly root: ShadowRoot;

  private renderQueued = false;

  protected constructor() {
    super();
    this.root = this.attachShadow({ mode: 'open' });
  }

  public connectedCallback(): void {
    this.render();
  }

  protected requestRender(): void {
    if (!this.isConnected || this.renderQueued) {
      return;
    }

    this.renderQueued = true;
    queueMicrotask(() => {
      this.renderQueued = false;
      if (this.isConnected) {
        this.render();
      }
    });
  }

  protected abstract render(): void;
}
