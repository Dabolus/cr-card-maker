import { css } from './utils';
import { t } from '../../i18n';
import { getTemplateField } from '../shared';
import type { DrawFormPartParams } from './types';

export const drawElixirCost = ({
  options,
  toRelative,
  styles,
  form,
  page,
}: DrawFormPartParams) => {
  const elixirCostField = getTemplateField(
    options.template,
    'elixir-cost',
    page,
  );
  if (!elixirCostField) {
    return;
  }
  const elixirShadowSize = toRelative(elixirCostField.fontSize * 0.04);
  const elixirShadowBottomSize = toRelative(elixirCostField.fontSize * 0.12);
  // Let's draw the elixir drop...
  styles.insertRule(css`
    #elixir-drop {
      left: ${toRelative(elixirCostField.x)};
      top: ${toRelative(elixirCostField.y)};
      width: ${toRelative(elixirCostField.width)};
      height: ${toRelative(elixirCostField.height)};
      background: url('/cards-assets/elixir.png') no-repeat center/100% 100%;
      background-size: contain;
    }
  `);
  const elixirDrop = document.createElement('div');
  elixirDrop.id = 'elixir-drop';
  form.appendChild(elixirDrop);

  // ...and then the elixir cost
  styles.insertRule(css`
    #elixir-cost {
      cursor: pointer;
      appearance: none;
      left: ${toRelative(elixirCostField.x)};
      top: ${toRelative(elixirCostField.y)};
      width: ${toRelative(elixirCostField.width)};
      height: ${toRelative(elixirCostField.height)};
      background: transparent;
      text-align: center;
      text-align-last: center;

      &,
      & option {
        font-family: 'Supercell Magic';
        font-size: ${toRelative(elixirCostField.fontSize)};
        color: #ffe9ff;
        text-shadow:
          -${elixirShadowSize} -${elixirShadowSize} 0 #760088,
          ${elixirShadowSize} -${elixirShadowSize} 0 #760088,
          -${elixirShadowSize} ${elixirShadowBottomSize} 0 #760088,
          ${elixirShadowSize} ${elixirShadowBottomSize} 0 #760088;
      }

      & option {
        background-color: #d217dd;
      }
    }
  `);
  const elixirCost = document.createElement('select');
  elixirCost.id = 'elixir-cost';
  elixirCost.name = 'elixirCost';
  elixirCost.setAttribute('aria-label', t('elixir-cost-label'));
  elixirCost.innerHTML = Array.from({ length: 12 }, (_, i) => {
    const val = i === 0 ? '?' : (i - 1).toString();
    return `<option value="${val}"${
      val === options.elixirCost.toString() ? ' selected' : ''
    }>${val}</option>`;
  }).join('');
  elixirCost.addEventListener('change', (e) => {
    const newElixirCost = (e.target as HTMLSelectElement).value;
    options.onChange?.(
      { ...options, elixirCost: newElixirCost },
      'elixirCost',
      newElixirCost,
    );
  });
  form.appendChild(elixirCost);
};
