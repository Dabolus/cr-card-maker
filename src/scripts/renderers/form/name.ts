import { t } from '../../i18n';
import { css } from './utils';
import type { DrawFormPartParams } from './types';

export const drawName = ({
  options,
  toRelative,
  styles,
  form,
}: DrawFormPartParams) => {
  const i18n =
    options.template.i18n?.[
      options.language as keyof typeof options.template.i18n
    ] ?? {};

  const cardNameShadowSize = toRelative(
    options.template.fields['card-name'].fontSize * 0.04,
  );
  const cardNameShadowBottomSize = toRelative(
    options.template.fields['card-name'].fontSize * 0.12,
  );
  styles.insertRule(css`
    #card-name {
      font-family: 'Supercell Magic';
      left: ${toRelative(
        options.template.fields['card-name'].x -
          options.template.fields['card-name'].maxWidth / 2 -
          16,
      )};
      top: ${toRelative(options.template.fields['card-name'].y - 16)};
      white-space: nowrap;
      max-width: ${toRelative(options.template.fields['card-name'].maxWidth)};
      display: flex;
      align-items: center;
      gap: 0.75rem;

      &,
      & > select,
      & > input {
        color: ${options.template.fields['card-name'].color};
        font-size: ${toRelative(options.template.fields['card-name'].fontSize)};
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
      }
    }
  `);
  const cardName = document.createElement('div');
  cardName.id = 'card-name';
  cardName.innerHTML = t(
    'name',
    {
      level: `
          <select name="level">
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
    .querySelector('select[name="level"]')!
    .addEventListener('change', (e) => {
      const newLevel = parseInt((e.target as HTMLSelectElement).value, 10);
      options.onChange?.({ ...options, level: newLevel }, 'level', newLevel);
    });
  cardName
    .querySelector('input[name="cardName"]')!
    .addEventListener('input', (e) => {
      const newName = (e.target as HTMLInputElement).value;
      options.onChange?.(
        { ...options, cardName: newName },
        'cardName',
        newName,
      );
    });
  form.appendChild(cardName);
};
