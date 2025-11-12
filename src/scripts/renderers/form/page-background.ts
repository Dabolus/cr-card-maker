import { css } from './utils';
import type { DrawFormPartParams } from './types';

export const drawPageBackground = ({
  options,
  toRelative,
  styles,
  form,
  page,
}: DrawFormPartParams) => {
  const pageConfig = options.template.pages?.[page - 1];
  if (!pageConfig?.background) {
    return;
  }
  styles.insertRule(css`
    #page-background {
      left: ${toRelative(pageConfig.x || 0)};
      top: ${toRelative(pageConfig.y || 0)};
      width: ${toRelative(pageConfig.width)};
      height: ${toRelative(pageConfig.height)};
      background: url(${pageConfig.background}) no-repeat center/100% 100%;
    }
  `);
  const backgroundElement = document.createElement('div');
  backgroundElement.id = 'page-background';

  form.appendChild(backgroundElement);
};
