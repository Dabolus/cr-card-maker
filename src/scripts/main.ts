import { setupI18n } from './i18n';
import { setupRouting } from './routing';
import '../styles/main.scss';

const i18nReadyPromise = setupI18n();
setupRouting(i18nReadyPromise);

import('./pages/create');
