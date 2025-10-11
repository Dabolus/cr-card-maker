import type { RendererBaseOptions } from '../types';

export type DrawFormOptions = RendererBaseOptions & {
  /**
   * The container element to draw the form in.
   * If not provided, a new div element will be created and returned.
   */
  element?: HTMLElement;
  /**
   * A callback that is called whenever a value in the form changes.
   * It receives as parameters:
   * - the new form values
   * - the key of the updated value
   * - the updated value
   */
  onChange?: (
    newFormValues: Omit<DrawFormOptions, 'template' | 'onChange'>,
    updatedKey: keyof Omit<DrawFormOptions, 'template' | 'onChange'>,
    updatedValue: Omit<DrawFormOptions, 'template' | 'onChange'>[keyof Omit<
      DrawFormOptions,
      'template' | 'onChange'
    >],
  ) => void;
};

export interface DrawFormPartParams {
  options: DrawFormOptions;
  toRelative: (pixels: number) => string;
  styles: CSSStyleSheet;
  form: HTMLFormElement;
}
