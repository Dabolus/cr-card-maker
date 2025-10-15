import { t } from '../../i18n';
import { css } from './utils';
import { getTemplateField } from '../shared';
import type { DrawFormPartParams } from './types';
import type { Fields } from '../../../templates/generated/types';

const guessInputAlignment = ({
  nameField,
  translation,
}: {
  nameField: NonNullable<Fields['card-name']>;
  translation: string | undefined;
}) =>
  !translation || translation === '{{cardName}}'
    ? // If the translation for the card name is just the value (and so the text input),
      // then we use the provided alignment (or default to center)
      nameField?.textAlign || 'center'
    : // Otherwise, we align left to make it easier to read the text
      'left';

export const drawName = ({
  options,
  toRelative,
  styles,
  form,
  page,
}: DrawFormPartParams) => {
  const nameField = getTemplateField(options.template, 'card-name', page);
  if (!nameField) {
    return;
  }

  const i18n =
    options.template.i18n?.[
      options.language as keyof typeof options.template.i18n
    ] ?? {};

  const cardNameShadowSize = toRelative(nameField.fontSize * 0.04);
  const cardNameShadowBottomSize = toRelative(nameField.fontSize * 0.12);
  styles.insertRule(css`
    #card-name {
      font-family: 'Supercell Magic';
      left: ${toRelative(nameField.x - nameField.maxWidth / 2 - 16)};
      top: ${toRelative(nameField.y - 16)};
      white-space: nowrap;
      max-width: ${toRelative(nameField.maxWidth)};
      display: flex;
      align-items: center;
      gap: 0.75rem;

      &,
      & > select,
      & > input {
        color: ${nameField.color};
        font-size: ${toRelative(nameField.fontSize)};
        text-shadow:
          -${cardNameShadowSize} -${cardNameShadowSize} 0 #000,
          ${cardNameShadowSize} -${cardNameShadowSize} 0 #000,
          -${cardNameShadowSize} ${cardNameShadowBottomSize} 0 #000,
          ${cardNameShadowSize} ${cardNameShadowBottomSize} 0 #000;
      }

      & > select,
      & > input {
        padding: ${toRelative(16)};
      }

      & > select {
        cursor: pointer;
      }

      & > input {
        min-width: 6rem;
        text-align: ${guessInputAlignment({
          nameField,
          translation: i18n.name,
        })};
      }
    }
  `);
  const cardName = document.createElement('div');
  cardName.id = 'card-name';
  cardName.innerHTML = t(
    'name',
    {
      level: `
          <select name="level" aria-label="${t('level-label')}">
            ${Array.from(
              { length: 15 },
              (_, i) =>
                `<option value="${i + 1}"${i + 1 === options.level ? ' selected' : ''}>${i + 1}</option>`,
            ).join('')}
          </select>
        `,
      cardName: `<input name="cardName" value="${options.cardName}" placeholder="${t('card-name-placeholder')}" maxlength="32" />`,
    },
    i18n,
  );
  cardName
    .querySelector('select[name="level"]')
    ?.addEventListener('change', (e) => {
      const newLevel = parseInt((e.target as HTMLSelectElement).value, 10);
      options.onChange?.({ ...options, level: newLevel }, 'level', newLevel);
    });
  cardName
    .querySelector('input[name="cardName"]')
    ?.addEventListener('input', (e) => {
      const newName = (e.target as HTMLInputElement).value;
      options.onChange?.(
        { ...options, cardName: newName },
        'cardName',
        newName,
      );
    });
  form.appendChild(cardName);
};
