import { installRouter, updateMetadata } from 'pwa-helpers';
import { logEvent } from './utils';
import { t } from './i18n';

export const setupRouting = (i18nReadyPromise: Promise<void>) => {
  const menuOverlay =
    document.querySelector<HTMLDivElement>('.navbar #overlay')!;
  const tablist = document.querySelector<HTMLDivElement>(
    '.navbar [role="tablist"]',
  )!;
  const tabs = Array.from(
    tablist.querySelectorAll<HTMLAnchorElement>('[role="tab"]'),
  );
  const pagesContainer = document.querySelector<HTMLDivElement>('#content')!;
  const pages = Array.from(
    pagesContainer.querySelectorAll<HTMLDivElement>('.page'),
  );

  const handlePageMetadataUpdate = async (pageHref: string) => {
    await i18nReadyPromise;
    const pageId = pageHref.slice(1);
    const title = t(`page-${pageId}-title`);
    const description = t(`page-${pageId}-description`);
    updateMetadata({
      title: `${title} - Clash Royale Card Maker`,
      description,
    });

    logEvent('page_view', {
      page_title: title,
      page_location: location.href,
      page_path: location.pathname,
    });
  };

  const goToPageIndex = (
    index: number | ((previousIndex: number) => number),
    { focus = false, scroll = false } = {},
  ) => {
    const previousIndex = tabs.findIndex(
      (item) => item.getAttribute('aria-selected') === 'true',
    );
    const newIndex = typeof index === 'function' ? index(previousIndex) : index;

    // Push the new path to the history only if necessary
    if (previousIndex < 0 || newIndex !== previousIndex) {
      const newPageHref = tabs[newIndex].getAttribute('href') ?? '';
      handlePageMetadataUpdate(newPageHref);

      // Update the item and its view with the proper accessibility attributes
      if (previousIndex >= 0) {
        // If the page we're about to hide contains the focused element,
        // remove focus first so we don't set aria-hidden on an element
        // that still has a descendant with focus (which is blocked by ATs).
        const active = document.activeElement as HTMLElement | null;
        if (pages[previousIndex].contains(active as Node)) {
          // Try to blur the active element. This will move focus away
          // from the to-be-hidden page. We avoid shifting focus to the
          // new tab immediately here because focus() is handled later
          // (and may be requested by the caller).
          active?.blur();
        }

        tabs[previousIndex].setAttribute('aria-selected', 'false');
        tabs[previousIndex].setAttribute('tabindex', '-1');
        pages[previousIndex].setAttribute('aria-hidden', 'true');
        pages[previousIndex].setAttribute('tabindex', '-1');
      }
      tabs[newIndex].setAttribute('aria-selected', 'true');
      tabs[newIndex].setAttribute('tabindex', '0');
      pages[newIndex].setAttribute('aria-hidden', 'false');
      pages[newIndex].setAttribute('tabindex', '0');

      history.pushState({}, '', newPageHref);

      if (focus) {
        tabs[newIndex].focus();
      }

      if (scroll) {
        pages[newIndex].scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  installRouter(({ pathname }, event) => {
    const normalizedPath = pathname === '/' ? '/create' : pathname;
    if (pathname !== normalizedPath) {
      history.replaceState({}, '', normalizedPath);
    }

    // Set the newly selected menu item as selected and all the others as non selected
    let newItemIndex = Math.floor(tabs.length / 2); // Default to the center page
    tabs.forEach((item, index) => {
      const itemUrl = item.getAttribute('href');

      // Update the item with the proper accessibility attributes
      item.setAttribute(
        'aria-selected',
        itemUrl === normalizedPath ? 'true' : 'false',
      );
      item.setAttribute('tabindex', itemUrl === normalizedPath ? '0' : '-1');

      // Update the view of the item with the proper accessibility attributes
      // If we're about to hide this page but it contains the active
      // element, blur it first so we don't set aria-hidden on a
      // focused descendant (which causes AT warnings).
      const active = document.activeElement as HTMLElement | null;
      if (itemUrl !== normalizedPath && pages[index].contains(active as Node)) {
        active?.blur();
      }

      pages[index].setAttribute(
        'aria-hidden',
        itemUrl === normalizedPath ? 'false' : 'true',
      );
      pages[index].setAttribute(
        'tabindex',
        itemUrl === normalizedPath ? '0' : '-1',
      );

      // We store this index so that we can scroll to the correct section without having to loop through all the menu items again
      if (itemUrl === normalizedPath) {
        newItemIndex = index;
      }
    });

    handlePageMetadataUpdate(tabs[newItemIndex].getAttribute('href') ?? '');

    // Scroll to the correct section
    const scrollOptions: ScrollIntoViewOptions | undefined = event
      ? // If we have an event, the new section was clicked, so we want to scroll to it smoothly
        { behavior: 'smooth' }
      : // Otherwise, this is the initial navigation, so we scroll to the section immediately
        undefined;
    pages[newItemIndex].scrollIntoView(scrollOptions);
  });

  let scrollingHandle: number | undefined;

  tablist.addEventListener('keydown', (event) => {
    switch (event.key) {
      case 'ArrowLeft':
        goToPageIndex((previousIndex) => Math.max(previousIndex - 1, 0), {
          focus: true,
          scroll: true,
        });
        break;
      case 'ArrowRight':
        goToPageIndex(
          (previousIndex) => Math.min(previousIndex + 1, tabs.length - 1),
          {
            focus: true,
            scroll: true,
          },
        );
        break;
    }
  });

  pagesContainer.addEventListener(
    'scroll',
    () => {
      // Clear our timeout throughout the scroll
      window.clearTimeout(scrollingHandle);

      // Set a timeout to run after scrolling ends
      scrollingHandle = window.setTimeout(() => {
        scrollingHandle = undefined;

        // Set the new selected menu item
        const newItemIndex = Math.floor(
          pagesContainer.scrollLeft / window.innerWidth,
        );
        goToPageIndex(newItemIndex);
      }, 100);

      // Update the scroll position of the menu overlay
      menuOverlay.style.transform = `translateX(${
        pagesContainer.scrollLeft / (tabs.length + 1)
      }px)`;
    },
    { passive: true },
  );
};
