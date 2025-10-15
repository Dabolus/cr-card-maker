import rendererStyles from '../../../styles/renderer-styles.scss?raw';
import { createToRelativeMapper, css } from './utils';
import type { DrawFormOptions } from './types';

export interface SetupLayoutParams {
  options: DrawFormOptions;
}

export interface SetupLayoutResult {
  toRelative: (value: number) => string;
  container: HTMLElement;
  shadow: ShadowRoot;
  styles: CSSStyleSheet;
  form: HTMLFormElement;
}

export const setupLayout = ({ options }: SetupLayoutParams) => {
  const toRelative = createToRelativeMapper(0, options.template.width);
  const container = options.element ?? document.createElement('div');
  container.role = 'application';
  const shadow = container.attachShadow({ mode: 'open' });
  const styles = new CSSStyleSheet();
  const form = document.createElement('form');
  form.id = 'card';
  form.addEventListener('submit', (e) => e.preventDefault());
  // Start with the common, static styles for the renderer
  styles.replaceSync(rendererStyles);
  styles.insertRule(css`
    :host {
      aspect-ratio: ${options.template.width} / ${options.template.height};
    }
  `);
  styles.insertRule(css`
    #card {
      background: url(${options.template.background}) no-repeat center/100% 100%;
    }
  `);
  styles.insertRule(css`
    input,
    textarea,
    select,
    button {
      border-radius: ${toRelative(8)};
    }
  `);

  return { toRelative, container, shadow, styles, form };
};
