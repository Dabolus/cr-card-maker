import { t } from '../../i18n';
import { css, getCssSimplifiedColor } from './utils';
import { getTemplateField, rarities, types } from '../shared';
import type { DrawFormOptions, DrawFormPartParams } from './types';
import type { Rarity } from '../types';
import type { Type, Url } from '../../../templates/generated/types';

export interface DrawRarityTypeParams extends DrawFormPartParams {
  onRarityChange?: (rarity: Rarity) => void;
  onTypeChange?: (type: Type) => void;
}

export const drawRarityType = ({
  options,
  toRelative,
  styles,
  form,
  page,
  onRarityChange,
  onTypeChange,
}: DrawRarityTypeParams) => {
  const i18n =
    options.template.i18n?.[
      options.language as keyof typeof options.template.i18n
    ] ?? {};

  const rarityBackgroundField = getTemplateField(
    options.template,
    'rarity-background',
    page,
  );

  const typeBackgroundField = getTemplateField(
    options.template,
    'type-background',
    page,
  );

  const getBackgroundSrc = (url: Url, rarity: Rarity): string | undefined =>
    typeof url === 'string' ? url : url[rarity];

  const setupBackground = (
    key: 'rarity' | 'type',
    field:
      | { x: number; y: number; width: number; height: number; url: Url }
      | undefined,
  ) => {
    if (!field) {
      return;
    }
    styles.insertRule(css`
      #${key}-background {
        left: ${toRelative(field.x)};
        top: ${toRelative(field.y)};
        width: ${toRelative(field.width)};
        height: ${toRelative(field.height)};
        pointer-events: none;
      }
    `);
    const element = document.createElement('div');
    element.id = `${key}-background`;
    form.appendChild(element);

    const applyBackground = (rarity: Rarity) => {
      const src = getBackgroundSrc(field.url, rarity);
      element.style.background = src
        ? `url("${src}") no-repeat center/100% 100%`
        : '';
      element.style.backgroundSize = src ? 'contain' : '';
    };

    applyBackground(options.rarity);

    return applyBackground;
  };

  const updateRarityBackground = setupBackground(
    'rarity',
    rarityBackgroundField,
  );

  const updateTypeBackground = setupBackground('type', typeBackgroundField);

  // Not the most elegant way to do this, but the simplest given the current setup
  const htmlElements = {
    rarityLabel: null as HTMLDivElement | null,
    rarityValue: null as HTMLSelectElement | null,
    typeLabel: null as HTMLDivElement | null,
    typeValue: null as HTMLSelectElement | null,
  };
  (
    [
      {
        templateKey: 'rarity',
        cardKey: 'rarity',
        availableOptions: options.template['supported-rarities'] ?? rarities,
      },
      {
        templateKey: 'type',
        cardKey: 'cardType',
        availableOptions: options.template['supported-types'] ?? types,
      },
    ] as const
  ).forEach(({ templateKey, cardKey, availableOptions }) => {
    const labelField = getTemplateField(
      options.template,
      `${templateKey}-label`,
      page,
    );
    if (labelField) {
      const labelTextAlign = labelField.textAlign ?? 'left';
      styles.insertRule(css`
        #${templateKey}-label {
          left: ${toRelative(
            labelField.x -
              (labelTextAlign === 'center' ? labelField.maxWidth / 2 : 0),
          )};
          top: ${toRelative(labelField.y)};
          font-family: 'Supercell Magic';
          white-space: nowrap;
          width: ${toRelative(labelField.maxWidth)};
          font-size: ${toRelative(labelField.fontSize)};
          text-align: ${labelTextAlign};
        }
      `);
      const labelElement = document.createElement('div');
      labelElement.id = `${templateKey}-label`;
      labelElement.innerText = t(`${templateKey}-label`, {}, i18n);
      htmlElements[`${templateKey}Label`] = labelElement;
      form.appendChild(labelElement);
    }
    const valueField = getTemplateField(
      options.template,
      `${templateKey}-value`,
      page,
    );
    if (valueField) {
      const valueShadowSize = toRelative(valueField.fontSize * 0.03);
      const valueShadowBottomSize = toRelative(valueField.fontSize * 0.09);
      const valueTextAlign = valueField.textAlign ?? 'left';
      styles.insertRule(css`
        #${templateKey}-value {
          left: ${toRelative(
            valueField.x -
              (valueTextAlign === 'center' ? valueField.maxWidth / 2 + 24 : 4),
          )};
          top: ${toRelative(valueField.y - 4)};
          padding: ${toRelative(4)};
          white-space: nowrap;
          width: ${toRelative(valueField.maxWidth + 40)};
          font-family: 'Supercell Magic';
          font-size: calc(
            ${toRelative(valueField.fontSize)} - (${valueShadowSize} * 2)
          );
          text-align: ${valueTextAlign};
          text-shadow:
            -${valueShadowSize} -${valueShadowSize} 0 #000,
            ${valueShadowSize} -${valueShadowSize} 0 #000,
            -${valueShadowSize} ${valueShadowBottomSize} 0 #000,
            ${valueShadowSize} ${valueShadowBottomSize} 0 #000;
        }
      `);
      const valueElement = document.createElement('select');
      valueElement.id = `${templateKey}-value`;
      valueElement.name = templateKey;
      valueElement.setAttribute('aria-label', t(`${templateKey}-label`));
      valueElement.innerHTML = availableOptions
        .map(
          (value) =>
            `<option value="${value}"${
              value === options[cardKey] ? ' selected' : ''
            }>${t(`${templateKey}-${value}`, {}, i18n)}</option>`,
        )
        .join('');
      htmlElements[`${templateKey}Value`] = valueElement;
      form.appendChild(valueElement);
    }
  });

  const applyColors = (rarity: Rarity) => {
    (['rarity', 'type'] as const).forEach((templateKey) => {
      const labelField = getTemplateField(
        options.template,
        `${templateKey}-label`,
        page,
      );
      if (labelField?.color) {
        const element = htmlElements[`${templateKey}Label`] as HTMLDivElement;
        element.style.color = getCssSimplifiedColor(labelField.color, {
          rarity,
        });
      }
      const valueField = getTemplateField(
        options.template,
        `${templateKey}-value`,
        page,
      );
      if (valueField?.color) {
        const element = htmlElements[
          `${templateKey}Value`
        ] as HTMLSelectElement;
        element.style.color = getCssSimplifiedColor(valueField.color, {
          rarity,
        });
      }
    });
  };

  htmlElements.rarityValue?.addEventListener('change', (e) => {
    const newRarity = (e.target as HTMLSelectElement).value as Rarity;
    updateRarityBackground?.(newRarity);
    updateTypeBackground?.(newRarity);
    applyColors(newRarity);
    onRarityChange?.(newRarity);
    options.onChange?.({ ...options, rarity: newRarity }, 'rarity', newRarity);
  });

  htmlElements.typeValue?.addEventListener('change', (e) => {
    const newType = (e.target as HTMLSelectElement)
      .value as DrawFormOptions['cardType'];
    onTypeChange?.(newType);
    options.onChange?.({ ...options, cardType: newType }, 'cardType', newType);
  });

  applyColors(options.rarity);
  updateTypeBackground?.(options.rarity);
};
