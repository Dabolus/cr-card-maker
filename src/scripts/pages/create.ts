import ogTemplate from '../../templates/og.json' with { type: 'json' };
import placeholderImageUrl from '../../images/placeholder.svg';
import { drawCanvas } from '../renderers/canvas';
import { drawForm } from '../renderers/form';
import type { RendererBaseOptions } from '../renderers/types';
import type { $Schema as TemplateSchema } from '../../templates/generated/types';

const templateSelect =
  document.querySelector<HTMLSelectElement>('#template-select')!;
templateSelect.innerHTML = `
  <option value="og" selected>${ogTemplate.name}</option>
`;

let currentParams: RendererBaseOptions = {
  // TODO: fix types
  template: ogTemplate as unknown as TemplateSchema,
  language: 'en',
  cardName: 'Knight',
  rarity: 'legendary',
  level: 11,
  cardType: 'troop',
  elixirCost: 3,
  description: "A tough melee fighter. He's reliable and hard to kill.",
  image: {
    src: placeholderImageUrl,
    fit: 'contain',
  },
  stats: [
    {
      name: 'Hitpoints',
      value: '1,100',
      icon: 'hp',
      showIconBackground: true,
    },
    {
      name: 'Damage',
      value: '150',
      icon: 'damage',
      showIconBackground: true,
    },
    {
      name: 'Speed',
      value: 'Medium',
      icon: 'speed',
      showIconBackground: true,
    },
    {
      name: 'Deploy Time',
      value: '1 sec',
      icon: 'deploy-time',
    },
    {
      name: 'Range',
      value: 'Melee',
      icon: 'range',
    },
  ],
};
const cardCanvas = await drawCanvas(currentParams);
cardCanvas.style.width = '60vmin';
cardCanvas.style.height = `calc(60vmin / ${ogTemplate.width} * ${ogTemplate.height})`;

const cardElement = await drawForm({
  ...currentParams,
  onChange: (_, key, val) => {
    (currentParams as Record<string, unknown>)[key] = val;
    console.log(currentParams);
    drawCanvas({
      ...currentParams,
      element: cardCanvas,
    });
  },
});
cardElement.style.width = '60vmin';
cardElement.style.height = `calc(60vmin / ${ogTemplate.width} * ${ogTemplate.height})`;

const cardEditor = document.querySelector<HTMLDivElement>('#card-editor')!;
// Remove the loader
cardEditor.removeChild(cardEditor.firstElementChild!);
cardEditor.appendChild(cardElement);
cardEditor.appendChild(cardCanvas);
