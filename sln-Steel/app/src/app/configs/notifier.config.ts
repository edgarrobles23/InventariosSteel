import { NotifierOptions } from 'angular-notifier';

const notifierConfig: NotifierOptions = {
  behaviour: {
    autoHide: 4000,
    onClick: 'hide',
    onMouseover: 'pauseAutoHide',
    showDismissButton: true,
  },
  position: {
    horizontal: {
      position: 'right',
      distance: 12,
    },
    vertical: {
      position: 'top',
      distance: 12,
      gap: 10,
    },
  },
};

export { notifierConfig };
