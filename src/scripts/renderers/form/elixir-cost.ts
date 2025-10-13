import { css } from './utils';
import type { DrawFormPartParams } from './types';

export interface DrawElixirCostParams extends DrawFormPartParams {
  elixirImage: HTMLImageElement;
}

export const drawElixirCost = ({
  options,
  toRelative,
  styles,
  form,
  elixirImage,
}: DrawElixirCostParams) => {
  const elixirShadowSize = toRelative(
    options.template.fields['card-name'].fontSize * 0.04,
  );
  const elixirShadowBottomSize = toRelative(
    options.template.fields['card-name'].fontSize * 0.12,
  );
  // Let's draw the elixir drop...
  styles.insertRule(css`
    #elixir-drop {
      left: ${toRelative(options.template.fields['elixir-cost'].x)};
      top: ${toRelative(options.template.fields['elixir-cost'].y)};
      width: ${toRelative(options.template.fields['elixir-cost'].width)};
      height: ${toRelative(options.template.fields['elixir-cost'].height)};
      background: url("${elixirImage.src}") no-repeat center/100% 100%;
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
      left: ${toRelative(options.template.fields['elixir-cost'].x)};
      top: ${toRelative(options.template.fields['elixir-cost'].y)};
      width: ${toRelative(options.template.fields['elixir-cost'].width)};
      height: ${toRelative(options.template.fields['elixir-cost'].height)};
      background: transparent;
      text-align: center;
      text-align-last: center;

      &,
      & option {
        font-family: 'Supercell Magic';
        font-size: ${toRelative(
          options.template.fields['elixir-cost'].fontSize,
        )};
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
