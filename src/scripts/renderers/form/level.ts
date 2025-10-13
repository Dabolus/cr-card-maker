import { t } from '../../i18n';
import { css, getCssSimplifiedColor } from './utils';
import type { DrawFormPartParams } from './types';
import type { Rarity } from '../types';

export const drawLevel = ({
  options,
  toRelative,
  styles,
  form,
}: DrawFormPartParams): {
  updateLevelTextColor: (rarity: Rarity) => void;
} => {
  if (!options.template.fields.level) {
    return { updateLevelTextColor: () => {} };
  }

  const i18n =
    options.template.i18n?.[
      options.language as keyof typeof options.template.i18n
    ] ?? {};

  const levelShadowSize = toRelative(
    options.template.fields.level.fontSize * 0.04,
  );
  const levelShadowBottomSize = toRelative(
    options.template.fields.level.fontSize * 0.12,
  );
  styles.insertRule(css`
    #level {
      font-family: 'Supercell Magic';
      left: ${toRelative(options.template.fields.level.x - 8)};
      top: ${toRelative(options.template.fields.level.y - 8)};
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      transform: translateX(-50%);

      &,
      & > select,
      & > input {
        color: ${getCssSimplifiedColor(options.template.fields.level.color, {
          rarity: options.rarity,
        })};
        font-size: ${toRelative(options.template.fields.level.fontSize)};
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
          <select name="level">
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
  )!;
  levelSelect.addEventListener('change', (e) => {
    const newLevel = parseInt((e.target as HTMLSelectElement).value, 10);
    options.onChange?.({ ...options, level: newLevel }, 'level', newLevel);
  });
  form.appendChild(level);

  return {
    updateLevelTextColor: (rarity: Rarity) => {
      const updatedColor = getCssSimplifiedColor(
        options.template.fields.level!.color,
        { rarity },
      );
      level.style.color = updatedColor;
      levelSelect.style.color = updatedColor;
    },
  };
};
