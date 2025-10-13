import { t } from '../../i18n';
import { css, getCssSimplifiedColor } from './utils';
import { rarities, types } from '../shared';
import type { DrawFormOptions, DrawFormPartParams } from './types';
import type { Rarity } from '../types';
import type { Url } from '../../../templates/generated/types';

export interface DrawRarityTypeParams extends DrawFormPartParams {
  rarityBackgroundImages: Partial<Record<Rarity, HTMLImageElement>> | null;
  typeBackgroundImages: Partial<Record<Rarity, HTMLImageElement>> | null;
  onRarityChange: (rarity: Rarity) => void;
}

export const drawRarityType = ({
  options,
  toRelative,
  styles,
  form,
  rarityBackgroundImages,
  typeBackgroundImages,
  onRarityChange,
}: DrawRarityTypeParams) => {
  const i18n =
    options.template.i18n?.[
      options.language as keyof typeof options.template.i18n
    ] ?? {};

  const rarityBackgroundField = options.template.fields['rarity-background'];
  const typeBackgroundField = options.template.fields['type-background'];

  const rarityTypeShadowSize = toRelative(
    options.template.fields['card-name'].fontSize * 0.03,
  );
  const rarityTypeShadowBottomSize = toRelative(
    options.template.fields['card-name'].fontSize * 0.09,
  );

  const getBackgroundSrc = (url: Url, rarity: Rarity): string | undefined =>
    typeof url === 'string' ? url : url[rarity];

  const setupBackground = (
    key: 'rarity' | 'type',
    field:
      | { x: number; y: number; width: number; height: number; url: Url }
      | undefined,
    images: Partial<Record<Rarity, HTMLImageElement>> | null,
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
      const src = images?.[rarity]?.src ?? getBackgroundSrc(field.url, rarity);
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
    rarityBackgroundImages,
  );

  const updateTypeBackground = setupBackground(
    'type',
    typeBackgroundField,
    typeBackgroundImages,
  );

  (['rarity', 'type'] as const).forEach((key) => {
    const labelField = options.template.fields[`${key}-label`];
    const labelTextAlign = labelField.textAlign ?? 'left';
    styles.insertRule(css`
      #${key}-label {
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
    const valueField = options.template.fields[`${key}-value`];
    const valueTextAlign = valueField.textAlign ?? 'left';
    styles.insertRule(css`
      #${key}-value {
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
          ${toRelative(valueField.fontSize)} - (${rarityTypeShadowSize} * 2)
        );
        text-align: ${valueTextAlign};
        text-shadow:
          -${rarityTypeShadowSize} -${rarityTypeShadowSize} 0 #000,
          ${rarityTypeShadowSize} -${rarityTypeShadowSize} 0 #000,
          -${rarityTypeShadowSize} ${rarityTypeShadowBottomSize} 0 #000,
          ${rarityTypeShadowSize} ${rarityTypeShadowBottomSize} 0 #000;
      }
    `);
  });

  const rarityLabel = document.createElement('div');
  rarityLabel.id = 'rarity-label';
  rarityLabel.innerText = t('rarity-label', {}, i18n);
  form.appendChild(rarityLabel);

  const rarityValue = document.createElement('select');
  rarityValue.id = 'rarity-value';
  rarityValue.name = 'rarity';
  rarityValue.innerHTML = (options.template['supported-rarities'] ?? rarities)
    .map(
      (r) =>
        `<option value="${r}"${
          r === options.rarity ? ' selected' : ''
        }>${t(`rarity-${r}`, {}, i18n)}</option>`,
    )
    .join('');
  form.appendChild(rarityValue);

  const typeLabel = document.createElement('div');
  typeLabel.id = 'type-label';
  typeLabel.innerText = t('type-label', {}, i18n);
  form.appendChild(typeLabel);

  const typeValue = document.createElement('select');
  typeValue.id = 'type-value';
  typeValue.name = 'cardType';
  typeValue.innerHTML = (options.template['supported-types'] ?? types)
    .map(
      (type) =>
        `<option value="${type}"${
          type === options.cardType ? ' selected' : ''
        }>${t(`type-${type}`, {}, i18n)}</option>`,
    )
    .join('');
  form.appendChild(typeValue);

  const colorTargets: {
    element: HTMLElement;
    fieldKey: 'rarity-label' | 'rarity-value' | 'type-label' | 'type-value';
  }[] = [
    { element: rarityLabel, fieldKey: 'rarity-label' },
    { element: rarityValue, fieldKey: 'rarity-value' },
    { element: typeLabel, fieldKey: 'type-label' },
    { element: typeValue, fieldKey: 'type-value' },
  ];

  const applyColors = (rarity: Rarity) => {
    colorTargets.forEach(({ element, fieldKey }) => {
      const field = options.template.fields[fieldKey];
      if (!field?.color) {
        return;
      }
      element.style.color = getCssSimplifiedColor(field.color, { rarity });
    });
  };

  rarityValue.addEventListener('change', (e) => {
    const newRarity = (e.target as HTMLSelectElement).value as Rarity;
    updateRarityBackground?.(newRarity);
    updateTypeBackground?.(newRarity);
    applyColors(newRarity);
    onRarityChange(newRarity);
    options.onChange?.({ ...options, rarity: newRarity }, 'rarity', newRarity);
  });

  typeValue.addEventListener('change', (e) => {
    const newType = (e.target as HTMLSelectElement)
      .value as DrawFormOptions['cardType'];
    options.onChange?.({ ...options, cardType: newType }, 'cardType', newType);
  });

  applyColors(options.rarity);
  updateTypeBackground?.(options.rarity);
};
