import { t } from '../../i18n';
import { css, getCssSimplifiedColor } from './utils';
import { rarities, types } from '../shared';
import type { DrawFormOptions, DrawFormPartParams } from './types';
import type { Rarity } from '../types';

export interface DrawRarityTypeParams extends DrawFormPartParams {
  backgroundImages: Record<Rarity, HTMLImageElement>;
  updateRarityFrame: (rarity: Rarity) => void;
}

export const drawRarityType = ({
  options,
  toRelative,
  styles,
  form,
  backgroundImages,
  updateRarityFrame,
}: DrawRarityTypeParams) => {
  const i18n =
    options.template.i18n?.[
      options.language as keyof typeof options.template.i18n
    ] ?? {};

  const rarityTypeShadowSize = toRelative(
    options.template.fields['card-name'].fontSize * 0.03,
  );
  const rarityTypeShadowBottomSize = toRelative(
    options.template.fields['card-name'].fontSize * 0.09,
  );
  styles.insertRule(css`
    #rarity-type-container {
      left: ${toRelative(options.template.fields['rarity-background'].x)};
      top: ${toRelative(options.template.fields['rarity-background'].y)};
      width: ${toRelative(options.template.fields['rarity-background'].width)};
      height: ${toRelative(
        options.template.fields['rarity-background'].height,
      )};
      background: url('${backgroundImages[options.rarity].src}') no-repeat
        center/100% 100%;
      background-size: contain;
    }
  `);
  const rarityTypeContainer = document.createElement('div');
  rarityTypeContainer.id = 'rarity-type-container';
  form.appendChild(rarityTypeContainer);

  styles.insertRule(css`
    #rarity-label {
      position: absolute;
      top: ${toRelative(options.template.fields['rarity-label'].y)};
      left: ${toRelative(options.template.fields['rarity-label'].x)};
      font-family: 'Supercell Magic';
      font-size: ${toRelative(
        options.template.fields['rarity-label'].fontSize,
      )};
      color: ${options.template.fields['rarity-label'].color};
    }
  `);
  const rarityLabel = document.createElement('div');
  rarityLabel.id = 'rarity-label';
  rarityLabel.innerText = t('rarity-label', {}, i18n);
  form.appendChild(rarityLabel);

  styles.insertRule(css`
    #rarity-value-container {
      top: ${toRelative(options.template.fields['rarity-value'].y - 4)};
      left: ${toRelative(options.template.fields['rarity-value'].x - 4)};

      & > select,
      & > span {
        white-space: nowrap;
        position: absolute;
        max-width: ${toRelative(
          options.template.fields['rarity-value'].maxWidth + 40,
        )};
        font-family: 'Supercell Magic';
        font-size: calc(
          ${toRelative(options.template.fields['rarity-value'].fontSize)} -
            (${rarityTypeShadowSize} * 2)
        );
      }

      & > select {
        top: 0;
        left: 0;
        padding: ${toRelative(4)};
        text-shadow:
          -${rarityTypeShadowSize} -${rarityTypeShadowSize} 0 #000,
          ${rarityTypeShadowSize} -${rarityTypeShadowSize} 0 #000,
          -${rarityTypeShadowSize} ${rarityTypeShadowBottomSize} 0 #000,
          ${rarityTypeShadowSize} ${rarityTypeShadowBottomSize} 0 #000;
      }

      & > span {
        pointer-events: none;
        top: ${toRelative(7)};
        left: ${toRelative(14)};
        color: transparent;
        background-clip: text !important;
      }
    }
  `);
  const rarityValueContainer = document.createElement('div');
  rarityValueContainer.id = 'rarity-value-container';

  const rarityValue = document.createElement('select');
  rarityValue.name = 'rarity';
  rarityValue.innerHTML = (options.template['supported-rarities'] ?? rarities)
    .map(
      (r) =>
        `<option value="${r}"${
          r === options.rarity ? ' selected' : ''
        }>${t(`rarity-${r}`, {}, i18n)}</option>`,
    )
    .join('');
  rarityValueContainer.appendChild(rarityValue);
  rarityValue.style.color = getCssSimplifiedColor(
    options.template.fields['rarity-value'].color,
    { rarity: options.rarity },
  );
  // FIXME
  // const rarityOverlay = document.createElement('span');
  // rarityOverlay.innerText = t(`rarity-${options.rarity}`, {}, i18n);
  // rarityOverlay.style.background = getCssColor(
  //   options.template.fields['rarity-value'].color[options.rarity],
  // );
  // rarityValueContainer.appendChild(rarityOverlay);
  // Watch for changes on the rarity select, to update the background and the text
  rarityValue.addEventListener('change', (e) => {
    const newRarity = (e.target as HTMLSelectElement).value as Rarity;
    rarityValue.style.color = getCssSimplifiedColor(
      options.template.fields['rarity-value'].color,
      { rarity: newRarity },
    );
    // FIXME
    // rarityOverlay.innerText = t(`rarity-${newRarity}`, {}, i18n);
    // rarityOverlay.style.background = getCssColor(
    //   options.template.fields['rarity-value'].color[newRarity],
    // );
    rarityTypeContainer.style.background = `url('${backgroundImages[newRarity].src}') no-repeat center/100% 100%`;
    rarityTypeContainer.style.backgroundSize = 'contain';
    updateRarityFrame(newRarity);
    options.onChange?.({ ...options, rarity: newRarity }, 'rarity', newRarity);
  });
  form.appendChild(rarityValueContainer);

  styles.insertRule(css`
    #type-label {
      position: absolute;
      top: ${toRelative(options.template.fields['type-label'].y)};
      left: ${toRelative(options.template.fields['type-label'].x)};
      font-family: 'Supercell Magic';
      font-size: ${toRelative(options.template.fields['type-label'].fontSize)};
      color: ${options.template.fields['type-label'].color};
    }
  `);
  const typeLabel = document.createElement('div');
  typeLabel.id = 'type-label';
  typeLabel.innerText = t('type-label', {}, i18n);
  form.appendChild(typeLabel);

  styles.insertRule(css`
    #type-value-container {
      top: ${toRelative(options.template.fields['type-value'].y - 4)};
      left: ${toRelative(options.template.fields['type-value'].x - 4)};

      & > select,
      & > span {
        white-space: nowrap;
        position: absolute;
        max-width: ${toRelative(
          options.template.fields['type-value'].maxWidth + 40,
        )};
        font-family: 'Supercell Magic';
        font-size: calc(
          ${toRelative(options.template.fields['type-value'].fontSize)} -
            (${rarityTypeShadowSize} * 2)
        );
      }

      & > select {
        top: 0;
        left: 0;
        padding: ${toRelative(4)};
        text-shadow:
          -${rarityTypeShadowSize} -${rarityTypeShadowSize} 0 #000,
          ${rarityTypeShadowSize} -${rarityTypeShadowSize} 0 #000,
          -${rarityTypeShadowSize} ${rarityTypeShadowBottomSize} 0 #000,
          ${rarityTypeShadowSize} ${rarityTypeShadowBottomSize} 0 #000;
      }

      & > span {
        pointer-events: none;
        top: ${toRelative(7)};
        left: ${toRelative(14)};
        color: transparent;
        background-clip: text !important;
      }
    }
  `);
  const typeValueContainer = document.createElement('div');
  typeValueContainer.id = 'type-value-container';

  const typeValue = document.createElement('select');
  typeValue.name = 'cardType';
  typeValue.innerHTML = (options.template['supported-types'] ?? types)
    .map(
      (type) =>
        `<option value="${type}"${
          type === options.cardType ? ' selected' : ''
        }>${t(`type-${type}`, {}, i18n)}</option>`,
    )
    .join('');
  typeValueContainer.appendChild(typeValue);
  typeValue.style.color = getCssSimplifiedColor(
    options.template.fields['type-value'].color,
    { rarity: options.rarity },
  );
  // FIXME
  // const typeOverlay = document.createElement('span');
  // typeOverlay.innerText = t(`type-${options.cardType}`, {}, i18n);
  // typeOverlay.style.background = getCssColor(
  //   options.template.fields['type-value'].color,
  // );
  // typeValueContainer.appendChild(typeOverlay);
  // Watch for changes on the type select, to update the text
  typeValue.addEventListener('change', (e) => {
    const newType = (e.target as HTMLSelectElement).value;
    typeValue.style.color = getCssSimplifiedColor(
      options.template.fields['type-value'].color,
      { rarity: options.rarity },
    );
    // FIXME
    // typeOverlay.innerText = t(`type-${newType}`, {}, i18n);
    options.onChange?.(
      { ...options, cardType: newType as DrawFormOptions['cardType'] },
      'cardType',
      newType as DrawFormOptions['cardType'],
    );
  });
  form.appendChild(typeValueContainer);
};
