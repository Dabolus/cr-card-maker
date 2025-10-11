import { t } from '../../i18n';
import { css } from './utils';
import type { DrawFormPartParams } from './types';

export const drawDescription = ({
  options,
  toRelative,
  styles,
  form,
}: DrawFormPartParams) => {
  styles.insertRule(css`
    #description {
      font-family: 'SC CCBackBeat';
      left: ${toRelative(
        options.template.fields.description.x -
          options.template.fields.description.maxWidth / 2 -
          16,
      )};
      top: ${toRelative(options.template.fields.description.y - 16)};
      width: ${toRelative(options.template.fields.description.maxWidth)};
      height: ${toRelative(options.template.fields.description.lineHeight * 5)};
      font-size: ${toRelative(options.template.fields.description.fontSize)};
      line-height: ${toRelative(
        options.template.fields.description.lineHeight,
      )};
      color: ${options.template.fields.description.color};
      resize: none;
      text-align: center;
      text-align-last: center;
      padding: ${toRelative(16)};
    }
  `);
  const description = document.createElement('textarea');
  description.id = 'description';
  description.name = 'description';
  description.placeholder = t('description-placeholder', {});
  description.maxLength = 200;
  description.value = options.description;
  description.addEventListener('input', (e) => {
    const newDescription = (e.target as HTMLTextAreaElement).value;
    options.onChange?.(
      { ...options, description: newDescription },
      'description',
      newDescription,
    );
  });
  form.appendChild(description);
};
