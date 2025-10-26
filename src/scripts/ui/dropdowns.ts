export const setupDropdown = (
  dropdownContainer: HTMLElement,
  actions: {
    selector: string;
    action: (item: HTMLElement) => void;
  }[],
) => {
  const dropdownButton =
    dropdownContainer.querySelector<HTMLButtonElement>('.dropdown-btn');
  const dropdownMenu =
    dropdownContainer.querySelector<HTMLUListElement>('.dropdown-menu');

  if (!dropdownButton || !dropdownMenu) {
    return;
  }

  document.addEventListener('click', (e) => {
    if (
      e.target !== dropdownButton &&
      !dropdownButton.contains(e.target as Node)
    ) {
      dropdownButton.setAttribute('aria-expanded', 'false');
      dropdownMenu.hidden = true;
    } else if (
      e.target === dropdownButton ||
      dropdownButton.contains(e.target as Node)
    ) {
      const expanded = dropdownButton.getAttribute('aria-expanded') === 'true';
      dropdownButton.setAttribute('aria-expanded', String(!expanded));
      dropdownMenu.hidden = expanded;
      const menuSize = dropdownMenu.getBoundingClientRect();
      // Make the menu open on the top of the button, aligned on its right
      dropdownMenu.style.top = `${dropdownButton.offsetTop - menuSize.height - 7}px`;
      dropdownMenu.style.left = `${
        dropdownButton.offsetLeft +
        dropdownButton.offsetWidth -
        menuSize.width +
        5
      }px`;
    }
  });

  actions.forEach(({ selector, action }) => {
    const item = dropdownMenu.querySelector<HTMLButtonElement>(selector);
    item?.addEventListener('click', () => action(item));
  });
};
