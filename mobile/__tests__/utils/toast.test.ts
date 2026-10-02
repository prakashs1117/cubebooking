/**
 * Toast Utility Tests
 */

jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
  hide: jest.fn(),
}));

import Toast from 'react-native-toast-message';
import {
  showSuccess,
  showError,
  showInfo,
  showWarning,
  hideToast,
  toast,
} from '@utils/toast';

const mockShow = Toast.show as jest.Mock;
const mockHide = Toast.hide as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('showSuccess', () => {
  it('calls Toast.show with type success', () => {
    showSuccess({ title: 'Done', message: 'Saved!' });
    expect(mockShow).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'success',
        text1: 'Done',
        text2: 'Saved!',
      }),
    );
  });

  it('defaults position to top and duration to 3000', () => {
    showSuccess({ title: 'OK' });
    expect(mockShow).toHaveBeenCalledWith(
      expect.objectContaining({ position: 'top', visibilityTime: 3000 }),
    );
  });

  it('uses custom position and duration', () => {
    showSuccess({ title: 'OK', position: 'bottom', duration: 5000 });
    expect(mockShow).toHaveBeenCalledWith(
      expect.objectContaining({ position: 'bottom', visibilityTime: 5000 }),
    );
  });
});

describe('showError', () => {
  it('calls Toast.show with type error', () => {
    showError({ title: 'Error', message: 'Something went wrong' });
    expect(mockShow).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'error', text1: 'Error' }),
    );
  });

  it('defaults duration to 4000', () => {
    showError({ title: 'Error' });
    expect(mockShow).toHaveBeenCalledWith(
      expect.objectContaining({ visibilityTime: 4000 }),
    );
  });
});

describe('showInfo', () => {
  it('calls Toast.show with type info', () => {
    showInfo({ title: 'Info' });
    expect(mockShow).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'info', visibilityTime: 3000 }),
    );
  });
});

describe('showWarning', () => {
  it('calls Toast.show with type warning', () => {
    showWarning({ title: 'Warning' });
    expect(mockShow).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'warning', visibilityTime: 3500 }),
    );
  });
});

describe('hideToast', () => {
  it('calls Toast.hide', () => {
    hideToast();
    expect(mockHide).toHaveBeenCalledTimes(1);
  });
});

describe('toast shorthand object', () => {
  it('toast.success calls showSuccess', () => {
    toast.success('Title', 'Msg');
    expect(mockShow).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'success',
        text1: 'Title',
        text2: 'Msg',
      }),
    );
  });

  it('toast.error calls showError', () => {
    toast.error('Error title');
    expect(mockShow).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'error', text1: 'Error title' }),
    );
  });

  it('toast.info calls showInfo', () => {
    toast.info('Info title');
    expect(mockShow).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'info', text1: 'Info title' }),
    );
  });

  it('toast.warning calls showWarning', () => {
    toast.warning('Warn title');
    expect(mockShow).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'warning', text1: 'Warn title' }),
    );
  });

  it('toast.hide calls Toast.hide', () => {
    toast.hide();
    expect(mockHide).toHaveBeenCalledTimes(1);
  });
});
