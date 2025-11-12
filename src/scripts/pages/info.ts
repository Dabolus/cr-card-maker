export const onPageLoad = async () => {
  let selectedTabIndex = 0;
  const tabs = document.querySelectorAll(
    '.page#info .tabs > ul > li[role=tab]',
  );
  const tabsViews = document.querySelectorAll('.content > ul > li');

  const _changeTab = (newTabIndex: number) => {
    if (selectedTabIndex === newTabIndex) {
      return;
    }
    tabs[selectedTabIndex].setAttribute('aria-selected', 'false');
    tabs[selectedTabIndex].setAttribute('tabindex', '-1');
    tabs[newTabIndex].setAttribute('aria-selected', 'true');
    tabs[newTabIndex].setAttribute('tabindex', '0');
    tabsViews[selectedTabIndex].className = '';
    tabsViews[newTabIndex].className = 'selected';
    selectedTabIndex = newTabIndex;
  };

  for (let i = 0; i < tabs.length; i++) {
    tabs[i].addEventListener('click', () => _changeTab(i));
  }

  const donationInput =
    document.querySelector<HTMLInputElement>('#donation-input')!;
  const donationButton =
    document.querySelector<HTMLAnchorElement>('#donation-button')!;

  donationInput.addEventListener('input', () => {
    const value = Number(donationInput.value) || 5;
    donationButton.href = `https://github.com/sponsors/Dabolus?frequency=one-time&amount=${value}`;
  });
};
