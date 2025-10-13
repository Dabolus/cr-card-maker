import { css } from './utils';
import { t } from '../../i18n';
import { icons, iconsImages, type Icon } from '../shared';
import type { CardStat } from '../types';
import type { DrawFormPartParams } from './types';

export interface DrawStatsParams extends DrawFormPartParams {
  evenBackgroundImage: HTMLImageElement | null;
  oddBackgroundImage: HTMLImageElement | null;
}

export interface CardStatWithId extends CardStat {
  id: string;
}

const sortablePromise = import('sortablejs/modular/sortable.core.esm.js').then(
  (mod) => mod.default,
);

const handleIconChange = ({
  form,
  currentStatState,
}: {
  form: HTMLFormElement;
  currentStatState: CardStatWithId;
}): Promise<Pick<CardStatWithId, 'icon' | 'showIconBackground'>> =>
  new Promise<Pick<CardStatWithId, 'icon' | 'showIconBackground'>>(
    (resolve) => {
      const dialog = document.createElement('dialog');
      dialog.id = 'select-stat-icon-dialog';

      const dialogForm = document.createElement('form');
      dialogForm.method = 'dialog';

      const title = document.createElement('h3');
      title.classList.add('dialog-title');
      title.textContent = t('select-icon');
      dialogForm.appendChild(title);

      const iconsContainer = document.createElement('div');
      iconsContainer.classList.add('dialog-content');
      iconsContainer.innerHTML = icons
        .map(
          (icon) => `
            <label class="icon-option">
              <img src="${iconsImages[icon].src}" title="${t(`stat-icon-${icon}`)}"/>
              <input type="radio" name="icon" value="${icon}" ${icon === currentStatState.icon ? 'checked' : ''} hidden>
            </label>
          `,
        )
        .join('');
      dialogForm.appendChild(iconsContainer);

      const actionsContainer = document.createElement('div');
      actionsContainer.classList.add('dialog-actions');
      dialogForm.appendChild(actionsContainer);

      const showIconBackgroundLabel = document.createElement('label');
      showIconBackgroundLabel.id = 'show-icon-background';
      const showIconBackground = document.createElement('input');
      showIconBackground.type = 'checkbox';
      showIconBackground.name = 'show-icon-background';
      showIconBackground.checked = !!currentStatState.showIconBackground;
      showIconBackgroundLabel.appendChild(showIconBackground);
      const labelText = document.createElement('span');
      labelText.textContent = t('show-icon-background');
      showIconBackgroundLabel.appendChild(labelText);
      actionsContainer.appendChild(showIconBackgroundLabel);

      const cancelButton = document.createElement('button');
      cancelButton.classList.add('secondary-action');
      cancelButton.type = 'submit';
      cancelButton.formMethod = 'dialog';
      cancelButton.value = 'cancel';
      cancelButton.textContent = t('cancel');
      actionsContainer.appendChild(cancelButton);

      const confirmButton = document.createElement('button');
      confirmButton.classList.add('primary-action');
      confirmButton.type = 'submit';
      confirmButton.formMethod = 'dialog';
      confirmButton.value = 'confirm';
      confirmButton.textContent = t('confirm');
      actionsContainer.appendChild(confirmButton);

      dialogForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitter = (e as SubmitEvent).submitter as HTMLButtonElement;
        if (submitter.value === 'confirm') {
          resolve({
            icon: dialogForm.icon.value as Icon,
            showIconBackground: showIconBackground.checked,
          });
        }
        dialog.close();
        form.removeChild(dialog);
      });

      dialog.appendChild(dialogForm);
      form.appendChild(dialog);
      dialog.showModal();
    },
  );

const generateStat = ({
  stat,
  iconBackgroundEnabled,
  form,
  onChange,
  onDelete,
}: {
  stat: CardStatWithId;
  iconBackgroundEnabled: boolean;
  form: HTMLFormElement;
  onChange: (
    updatedStat: CardStatWithId,
    updatedStatElement: HTMLElement,
  ) => void;
  onDelete: (
    deletedStat: CardStatWithId,
    deletedStatElement: HTMLElement,
  ) => void;
}) => {
  let currentStatState: CardStatWithId = { ...stat };
  const statContainer = document.createElement('div');
  statContainer.classList.add('stat');

  const statName = document.createElement('input');
  statName.classList.add('stat-name');
  statName.type = 'text';
  statName.name = 'stat-name';
  statName.value = stat.name;
  statName.placeholder = 'Name';
  statName.maxLength = 32;
  statName.classList.add('stat-name');
  statName.addEventListener('input', (e) => {
    currentStatState = {
      ...currentStatState,
      name: (e.target as HTMLInputElement).value,
    };
    onChange(currentStatState, statContainer);
  });
  statContainer.appendChild(statName);

  const statValue = document.createElement('input');
  statValue.classList.add('stat-value');
  statValue.type = 'text';
  statValue.name = 'stat-value';
  statValue.value = stat.value.toString();
  statValue.placeholder = 'Value';
  statValue.maxLength = 32;
  statValue.classList.add('stat-value');
  statValue.addEventListener('input', (e) => {
    currentStatState = {
      ...currentStatState,
      value: (e.target as HTMLInputElement).value,
    };
    onChange(currentStatState, statContainer);
  });
  statContainer.appendChild(statValue);

  if (stat.showIconBackground && iconBackgroundEnabled) {
    const iconBg = document.createElement('div');
    iconBg.classList.add('stat-icon-bg');
    statContainer.appendChild(iconBg);
  }

  if (stat.icon in iconsImages) {
    const icon = document.createElement('img');
    icon.classList.add('stat-icon');
    icon.src = iconsImages[stat.icon].src;
    icon.addEventListener('click', async () => {
      const iconChangeResult = await handleIconChange({
        form,
        currentStatState,
      });
      currentStatState = { ...currentStatState, ...iconChangeResult };
      icon.src = iconsImages[currentStatState.icon].src;
      // If the icon background is disabled in the new icon, remove it
      if (!currentStatState.showIconBackground || !iconBackgroundEnabled) {
        statContainer.querySelector('.stat-icon-bg')?.remove();
        // Otherwise, add it if it didn't exist before
      } else if (!statContainer.querySelector('.stat-icon-bg')) {
        const iconBg = document.createElement('div');
        iconBg.classList.add('stat-icon-bg');
        statContainer.insertBefore(iconBg, icon);
      }
      onChange(currentStatState, statContainer);
    });
    statContainer.appendChild(icon);
  }

  const deleteStatButton = document.createElement('button');
  deleteStatButton.type = 'button';
  deleteStatButton.classList.add('delete-stat');
  deleteStatButton.innerHTML = '×';
  deleteStatButton.addEventListener('click', () => {
    onDelete(stat, statContainer);
  });
  statContainer.appendChild(deleteStatButton);

  const moveStatButton = document.createElement('button');
  moveStatButton.type = 'button';
  moveStatButton.classList.add('move-stat');
  moveStatButton.innerHTML = '✥';
  statContainer.appendChild(moveStatButton);

  return statContainer;
};

export const drawStats = ({
  options,
  toRelative,
  styles,
  form,
  evenBackgroundImage,
  oddBackgroundImage,
}: DrawStatsParams) => {
  const statsOptions = options.template.fields.stats;
  if (!statsOptions) {
    return;
  }
  let currentStats =
    options.stats?.map<CardStatWithId>((stat) => ({
      ...stat,
      id: crypto.randomUUID(),
    })) ?? [];
  const statsWidth =
    statsOptions.itemsPerRow * (statsOptions.items.width + statsOptions.gapX) -
    statsOptions.gapX;
  const maxRows = Math.ceil(statsOptions.maxItems / statsOptions.itemsPerRow);
  const statsHeight =
    maxRows * (statsOptions.items.height + statsOptions.gapY) -
    statsOptions.gapY;
  const statValueShadowSize = toRelative(
    options.template.fields['card-name'].fontSize * 0.03,
  );
  const statValueShadowBottomSize = toRelative(
    options.template.fields['card-name'].fontSize * 0.09,
  );
  const itemsConfig = statsOptions.items;
  const iconBgWidth = itemsConfig.icon.width - 10;
  const iconBgHeight = itemsConfig.icon.height - 10;
  const iconBgDx =
    itemsConfig.icon.dx + (itemsConfig.icon.width - iconBgWidth) / 2;
  const iconBgDy =
    itemsConfig.icon.dy + (itemsConfig.icon.height - iconBgHeight) / 2;
  styles.insertRule(css`
    #stats-container {
      font-family: 'Supercell Magic';
      border-radius: ${toRelative(8)};
      /* TODO: decide whether to keep this background or not */
      /* background-color: rgba(0, 0, 0, 0.12); */
      top: ${toRelative(statsOptions.y - 8)};
      left: ${toRelative(statsOptions.x - 8)};
      width: ${toRelative(statsWidth)};
      height: ${toRelative(statsHeight)};
      display: grid;
      grid-template-columns: repeat(
        ${statsOptions.itemsPerRow},
        ${toRelative(statsOptions.items.width)}
      );
      grid-auto-rows: ${toRelative(statsOptions.items.height)};
      justify-content: center;
      align-content: start;
      padding: ${toRelative(8)};
      gap: ${toRelative(statsOptions.gapY)} ${toRelative(statsOptions.gapX)};

      & > .stat {
        position: relative;

        /* Dynamic background color rules based on odd/even rows and itemsPerRow */
        ${Array.from({ length: statsOptions.itemsPerRow })
          .map(
            (_, i) => `
              &:nth-child(${statsOptions.itemsPerRow * 2}n + ${i + 1})
            `,
          )
          .join(', ')} {
          background: ${oddBackgroundImage
            ? `url("${oddBackgroundImage.src}")`
            : ''};
        }

        ${Array.from({ length: statsOptions.itemsPerRow })
          .map(
            (_, i) => `
              &:nth-child(${statsOptions.itemsPerRow * 2}n + ${
                statsOptions.itemsPerRow + i + 1
              })
            `,
          )
          .join(', ')} {
          background: ${evenBackgroundImage
            ? `url("${evenBackgroundImage.src}")`
            : ''};
        }

        & > * {
          position: absolute;
        }

        & > .stat-name {
          left: ${toRelative(statsOptions.items.name.dx - 2)};
          top: ${toRelative(statsOptions.items.name.dy - 8)};
          padding: ${toRelative(2)};
          width: ${toRelative(statsOptions.items.name.maxWidth)};
          font-family: '${itemsConfig.name.fontFamily || 'SC CCBackBeat'}';
          font-size: ${toRelative(statsOptions.items.name.fontSize)};
          color: ${statsOptions.items.name.color};
        }

        & > .stat-value {
          left: ${toRelative(statsOptions.items.value.dx - 2)};
          top: ${toRelative(statsOptions.items.value.dy - 8)};
          padding: ${toRelative(2)};
          width: ${toRelative(statsOptions.items.value.maxWidth)};
        }

        & > .stat-icon-bg {
          left: ${toRelative(iconBgDx)};
          top: ${toRelative(iconBgDy)};
          width: ${toRelative(iconBgWidth)};
          height: ${toRelative(iconBgHeight)};
          border-radius: ${toRelative(6)};
          background-color: ${statsOptions.items.icon.backgroundColor ??
          'transparent'};
        }

        & > .stat-icon {
          cursor: pointer;
          left: ${toRelative(itemsConfig.icon.dx)};
          top: ${toRelative(itemsConfig.icon.dy)};
          width: ${toRelative(itemsConfig.icon.width)};
          height: ${toRelative(itemsConfig.icon.height)};
        }
      }

      & > .stat > .stat-value,
      & > .stat > .delete-stat,
      & > .stat > .move-stat,
      & > .add {
        color: ${statsOptions.items.value.color};
        font-size: calc(
          ${toRelative(statsOptions.items.value.fontSize)} -
            (${statValueShadowSize} * 2)
        );
        text-shadow:
          -${statValueShadowSize} -${statValueShadowSize} 0 #000,
          ${statValueShadowSize} -${statValueShadowSize} 0 #000,
          -${statValueShadowSize} ${statValueShadowBottomSize} 0 #000,
          ${statValueShadowSize} ${statValueShadowBottomSize} 0 #000;
      }

      & > .stat > .delete-stat,
      & > .stat > .move-stat {
        right: 0;
        width: ${toRelative(statsOptions.items.height / 2)};
        height: ${toRelative(statsOptions.items.height / 2)};
        padding: 0;
        text-align: center;
      }

      & > .stat > .delete-stat {
        cursor: pointer;
        top: 0;
        background: linear-gradient(to bottom, #ff7b7b 5%, #ff0000 100%);
        border: 2px solid #b20000;
      }

      & > .stat > .move-stat {
        cursor: grab;
        bottom: 0;
        background: linear-gradient(to bottom, #7fb3ff 5%, #1b6dff 100%);
        border: 2px solid #0f3d99;
      }

      & > .add {
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(to bottom, #ffd053 5%, #ffbc2b 100%);
        border: 2px solid #b06904;
      }
    }
  `);
  styles.insertRule(css`
    #select-stat-icon-dialog {
      display: flex;
      flex-direction: column;
      gap: 1rem;

      @media (min-width: 660px) {
        max-width: 640px;
      }

      & > form > .dialog-content {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 1rem;
        max-height: 60vh;
        overflow-y: auto;

        & > .icon-option {
          cursor: pointer;
          width: 48px;
          height: 48px;
          padding: 4px;
          border-radius: 12px;

          &:hover,
          &:has(> input:checked) {
            background-color: rgba(87, 94, 98, 0.12);
          }

          &:has(> input:checked) {
            padding: 2px;
            border: 2px solid #575e62;
          }

          & > img {
            width: 100%;
            height: 100%;
          }
        }
      }

      & .dialog-actions > #show-icon-background {
        cursor: pointer;
        color: #000;
        margin-right: auto;
        display: flex;
        align-items: center;
        gap: 0.5rem;

        & > input {
          padding: 0.25rem;
          border-radius: 4px;
        }
      }
    }
  `);
  const statsContainer = document.createElement('div');
  statsContainer.id = 'stats-container';

  const addStatButton = document.createElement('button');
  addStatButton.type = 'button';
  addStatButton.classList.add('add');
  addStatButton.innerHTML = `+ ${t('add_stat')}`;
  addStatButton.addEventListener('click', () => {
    if (currentStats.length >= statsOptions.maxItems) {
      return;
    }
    const newStat: CardStatWithId = {
      id: crypto.randomUUID(),
      name: '',
      value: '',
      icon: 'hp',
      showIconBackground: true,
    };
    const newStatElement = generateStat({
      stat: newStat,
      iconBackgroundEnabled: !!statsOptions.items.icon.backgroundColor,
      form,
      onChange: (updatedStat) => {
        const statIndex = currentStats.findIndex(
          (stat) => stat.id === updatedStat.id,
        );
        currentStats.splice(statIndex, 1, updatedStat);
        options.onChange?.(
          { ...options, stats: currentStats },
          'stats',
          currentStats,
        );
      },
      onDelete: (deletedStat, deletedStatElement) => {
        statsContainer.removeChild(deletedStatElement);
        if (currentStats.length >= statsOptions.maxItems) {
          statsContainer.appendChild(addStatButton);
        }
        currentStats = currentStats.filter(
          (stat) => stat.id !== deletedStat.id,
        );
        options.onChange?.(
          { ...options, stats: currentStats },
          'stats',
          currentStats,
        );
      },
    });
    currentStats.push(newStat);
    statsContainer.insertBefore(newStatElement, addStatButton);
    if (currentStats.length >= statsOptions.maxItems) {
      statsContainer.removeChild(addStatButton);
    }
    options.onChange?.(
      { ...options, stats: currentStats },
      'stats',
      currentStats,
    );
  });

  currentStats.forEach((stat, index) => {
    if (index >= statsOptions.maxItems) {
      return;
    }
    const statElement = generateStat({
      stat,
      iconBackgroundEnabled: !!statsOptions.items.icon.backgroundColor,
      form,
      onChange: (updatedStat) => {
        const statIndex = currentStats.findIndex(
          (stat) => stat.id === updatedStat.id,
        );
        currentStats.splice(statIndex, 1, updatedStat);
        options.onChange?.(
          { ...options, stats: currentStats },
          'stats',
          currentStats,
        );
      },
      onDelete: (deletedStat, deletedStatElement) => {
        statsContainer.removeChild(deletedStatElement);
        if (currentStats.length >= statsOptions.maxItems) {
          statsContainer.appendChild(addStatButton);
        }
        currentStats = currentStats.filter(
          (stat) => stat.id !== deletedStat.id,
        );
        options.onChange?.(
          { ...options, stats: currentStats },
          'stats',
          currentStats,
        );
      },
    });
    statsContainer.appendChild(statElement);
  });

  if (options.stats && options.stats.length < statsOptions.maxItems) {
    statsContainer.appendChild(addStatButton);
  }

  form.appendChild(statsContainer);

  // Lazily setup Sortable.JS
  sortablePromise.then((Sortable) => {
    new Sortable(statsContainer, {
      filter: '.add',
      handle: '.move-stat',
      delay: 200,
      delayOnTouchOnly: true,
      onMove: (evt) =>
        !(evt.related.classList.contains('add') && evt.willInsertAfter),
      onEnd: (evt) => {
        currentStats = currentStats
          .toSpliced(evt.oldIndex!, 1)
          .toSpliced(evt.newIndex!, 0, currentStats[evt.oldIndex!]);
        options.onChange?.(
          { ...options, stats: currentStats },
          'stats',
          currentStats,
        );
      },
    });
  });
};
