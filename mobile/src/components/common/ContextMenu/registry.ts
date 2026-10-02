export type ActionType = 'addToFavorites';
// Additional action types will be added as they are implemented.
// Example for future expansion:
// export type ActionType = 'addToFavorites' | 'share' | 'copyInfo';

export interface ActionConfig {
  threshold: number; // milliseconds before menu appears
  label: string; // user-facing label
  icon?: string; // icon name for future UI
}

/**
 * Registry of all available context menu actions.
 * Add new actions here to automatically support them across all components.
 * Thresholds are configurable per action type.
 */
export const ACTION_REGISTRY: Partial<Record<ActionType, ActionConfig>> = {
  addToFavorites: {
    threshold: 500,
    label: 'Add to Favorites',
    icon: 'heart',
  },
  // Future actions:
  // share: {
  //   threshold: 400,
  //   label: 'Share',
  //   icon: 'share',
  // },
  // copyInfo: {
  //   threshold: 300,
  //   label: 'Copy Material Number',
  //   icon: 'copy',
  // },
};

/**
 * Get the press-hold threshold (in ms) for a specific action.
 * Falls back to 500ms if action not found (safe default).
 */
export const getActionThreshold = (actionType: ActionType): number => {
  return ACTION_REGISTRY[actionType]?.threshold ?? 500;
};

/**
 * Get the label for a specific action.
 */
export const getActionLabel = (actionType: ActionType): string => {
  return ACTION_REGISTRY[actionType]?.label ?? 'Action';
};
