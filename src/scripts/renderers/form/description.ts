import { t } from '../../i18n';
import { css } from './utils';
import type { DrawFormPartParams } from './types';

export const drawDescription = ({
  options,
  toRelative,
  styles,
  form,
}: DrawFormPartParams) => {
  if (!options.template.fields.description) {
    return;
  }
  styles.insertRule(css`
    #description {
      font-family: 'SC CCBackBeat';
      background-color: rgba(0, 0, 0, 0.12);
      border-radius: ${toRelative(8)};
      left: ${toRelative(
        options.template.fields.description.x -
          options.template.fields.description.maxWidth / 2 -
          16,
      )};
      top: ${toRelative(options.template.fields.description.y - 16)};
      width: ${toRelative(options.template.fields.description.maxWidth)};
      height: ${toRelative(
        options.template.fields.description.lineHeight *
          options.template.fields.description.maxLines,
      )};
      overflow-y: auto;
      font-size: ${toRelative(options.template.fields.description.fontSize)};
      line-height: ${toRelative(
        options.template.fields.description.lineHeight,
      )};
      color: ${options.template.fields.description.color};
      resize: none;
      display: flex;
      flex-direction: column;
      justify-content: ${{
        top: 'flex-start',
        middle: 'center',
        bottom: 'flex-end',
      }[options.template.fields.description.textBaseline || 'top']};
      text-align: ${options.template.fields.description.textAlign || 'center'};
      text-align-last: ${options.template.fields.description.textAlign ||
      'center'};
      padding: ${toRelative(16)};

      &[aria-placeholder]:empty:before {
        content: attr(aria-placeholder);
        color: #555;
      }

      &[aria-placeholder]:empty:focus:before {
        content: '';
      }
    }
  `);
  const description = document.createElement('div');
  description.id = 'description';
  description.contentEditable = 'true';
  description.role = 'textbox';
  description.setAttribute('aria-multiline', 'true');
  description.setAttribute(
    'aria-placeholder',
    t('description-placeholder', {}),
  );
  description.textContent = options.description;
  description.addEventListener('input', (e) => {
    const newDescription = (e.target as HTMLDivElement).innerText;
    options.onChange?.(
      { ...options, description: newDescription },
      'description',
      newDescription,
    );
  });
  form.appendChild(description);
};
