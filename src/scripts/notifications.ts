export interface Notification {
  message: string;
  timer?: number;
  onClick?: () => void;
}

const notificationsQueue: Notification[] = [];

export const showNotification = ({
  message,
  timer = 3000,
  onClick,
}: Notification) => {
  notificationsQueue.push({ message, timer, onClick });

  const container = document.querySelector<HTMLDivElement>(
    '#global-notification',
  )!;

  if (container.getAttribute('aria-hidden') === 'true') {
    const showNext = () => {
      const next = notificationsQueue.shift();
      if (!next) {
        container.setAttribute('aria-hidden', 'true');
        return;
      }

      container.textContent = next.message;

      if (next.onClick) {
        container.addEventListener('click', next.onClick, { once: true });
        container.classList.add('clickable');
      } else {
        container.classList.remove('clickable');
      }
      container.setAttribute('aria-hidden', 'false');

      setTimeout(() => {
        container.setAttribute('aria-hidden', 'true');
        setTimeout(showNext, 300);
      }, next.timer);
    };

    showNext();
  }
};
