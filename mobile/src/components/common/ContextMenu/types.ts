import type { ActionType } from './registry';
import type { Article } from '@components/search/ArticleCard';

export interface UseContextMenuOptions {
  /**
   * Enable/disable context menu for this component.
   * Useful for gradual rollout or feature flags.
   * @default true
   */
  enabled?: boolean;

  /**
   * Action type to trigger (must be in ACTION_REGISTRY).
   */
  actionType: ActionType;

  /**
   * Article to pass to the context menu.
   */
  article: Article;

  /**
   * Override the default threshold for this action.
   * Useful if a specific screen needs different timing.
   * @default ACTION_REGISTRY[actionType].threshold
   */
  threshold?: number;

  /**
   * Optional callback when action is triggered.
   */
  onAction?: (action: string) => void;
}

export interface UseContextMenuReturn {
  /**
   * Press-in handler - attach to pressable component or gesture handler.
   */
  onPressIn: () => void;

  /**
   * Press-out handler - attach to pressable component or gesture handler.
   */
  onPressOut: () => void;

  /**
   * Whether component is currently pressed/held.
   * Use for scale animation.
   */
  isPressed: boolean;
}
