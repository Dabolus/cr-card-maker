import { t } from '../../i18n';
import { css } from './utils';
import { getTemplateField } from '../shared';
import type { DrawFormPartParams } from './types';

export const drawDescription = ({
  options,
  toRelative,
  styles,
  form,
  page,
}: DrawFormPartParams) => {
  const descriptionField = getTemplateField(
    options.template,
    'description',
    page,
  );
  if (!descriptionField) {
    return;
  }
  styles.insertRule(css`
    #description {
      font-family: 'SC CCBackBeat';
      background-color: rgba(0, 0, 0, 0.12);
      border-radius: ${toRelative(8)};
      left: ${toRelative(
        descriptionField.x - descriptionField.maxWidth / 2 - 16,
      )};
      top: ${toRelative(descriptionField.y - 16)};
      width: ${toRelative(descriptionField.maxWidth)};
      height: ${toRelative(
        descriptionField.lineHeight * descriptionField.maxLines,
      )};
      overflow-y: auto;
      font-size: ${toRelative(descriptionField.fontSize)};
      line-height: ${toRelative(descriptionField.lineHeight)};
      color: ${descriptionField.color};
      resize: none;
      display: flex;
      flex-direction: column;
      justify-content: ${{
        top: 'flex-start',
        middle: 'center',
        bottom: 'flex-end',
      }[descriptionField.textBaseline || 'top']};
      text-align: ${descriptionField.textAlign || 'center'};
      text-align-last: ${descriptionField.textAlign || 'center'};
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
