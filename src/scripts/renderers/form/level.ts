import { t } from '../../i18n';
import { css, getCssSimplifiedColor } from './utils';
import { getTemplateField } from '../shared';
import type { DrawFormPartParams } from './types';
import type { Rarity } from '../types';

export const drawLevel = ({
  options,
  toRelative,
  styles,
  form,
  page,
}: DrawFormPartParams): {
  updateLevelTextColor: (rarity: Rarity) => void;
} => {
  const levelField = getTemplateField(options.template, 'level', page);

  if (!levelField) {
    return { updateLevelTextColor: () => {} };
  }

  const i18n =
    options.template.i18n?.[
      options.language as keyof typeof options.template.i18n
    ] ?? {};

  const levelShadowSize = toRelative(levelField.fontSize * 0.04);
  const levelShadowBottomSize = toRelative(levelField.fontSize * 0.12);
  styles.insertRule(css`
    #level {
      font-family: 'Supercell Magic';
      left: ${toRelative(levelField.x - 8)};
      top: ${toRelative(levelField.y - 8)};
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      transform: translateX(-50%);

      &,
      & > select,
      & > input {
        color: ${getCssSimplifiedColor(levelField.color, {
          rarity: options.rarity,
        })};
        font-size: ${toRelative(levelField.fontSize)};
        text-shadow:
          -${levelShadowSize} -${levelShadowSize} 0 #000,
          ${levelShadowSize} -${levelShadowSize} 0 #000,
          -${levelShadowSize} ${levelShadowBottomSize} 0 #000,
          ${levelShadowSize} ${levelShadowBottomSize} 0 #000;
      }

      & > select,
      & > input {
        padding: ${toRelative(8)};
      }

      & > select {
        cursor: pointer;
      }

      & > input {
        min-width: 6rem;
      }
    }
  `);
  const level = document.createElement('div');
  level.id = 'level';
  level.innerHTML = t(
    'level',
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
    },
    i18n,
  );
  const levelSelect = level.querySelector<HTMLSelectElement>(
    'select[name="level"]',
  );
  if (!levelSelect) {
    return { updateLevelTextColor: () => {} };
  }
  levelSelect.addEventListener('change', (e) => {
    const newLevel = parseInt((e.target as HTMLSelectElement).value, 10);
    options.onChange?.({ ...options, level: newLevel }, 'level', newLevel);
  });
  form.appendChild(level);

  return {
    updateLevelTextColor: (rarity: Rarity) => {
      const updatedColor = getCssSimplifiedColor(levelField!.color, { rarity });
      level.style.color = updatedColor;
      levelSelect.style.color = updatedColor;
    },
  };
};
