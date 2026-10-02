/**
 * Feature Flags Store Tests
 */

import {
  useFeatureFlagsStore,
  FeatureFlag,
  getFeatureFlagValue,
} from '@stores/featureFlagsStore';

const makeFlag = (overrides: Partial<FeatureFlag> = {}): FeatureFlag => ({
  id: 'flag-1',
  key: 'test_feature',
  name: 'Test Feature',
  description: 'A test feature flag',
  category: 'feature',
  type: 'boolean',
  enabled: true,
  defaultValue: false,
  targeting: {
    rolloutPercentage: 100,
    environments: ['development', 'staging', 'production'],
  },
  metadata: {
    tags: ['test'],
    owner: 'team',
    priority: 'medium',
  },
  ...overrides,
});

beforeEach(() => {
  useFeatureFlagsStore.setState({
    flags: [makeFlag()],
    overrides: {},
    isInitialized: false,
    lastUpdated: 0,
  });
});

describe('initialize', () => {
  it('sets isInitialized to true', () => {
    useFeatureFlagsStore.getState().initialize();
    expect(useFeatureFlagsStore.getState().isInitialized).toBe(true);
  });
});

describe('getAllFeatureFlags', () => {
  it('returns all flags', () => {
    const flags = useFeatureFlagsStore.getState().getAllFeatureFlags();
    expect(flags).toHaveLength(1);
    expect(flags[0].key).toBe('test_feature');
  });
});

describe('getFeatureFlag', () => {
  it('returns flag by key', () => {
    const flag = useFeatureFlagsStore.getState().getFeatureFlag('test_feature');
    expect(flag).not.toBeNull();
    expect(flag?.key).toBe('test_feature');
  });

  it('returns null for unknown key', () => {
    expect(
      useFeatureFlagsStore.getState().getFeatureFlag('nonexistent'),
    ).toBeNull();
  });

  it('supports old ENABLE_ key format via migration', () => {
    useFeatureFlagsStore.setState({
      flags: [makeFlag({ key: 'home_carousel' })],
      overrides: {},
    });
    const flag = useFeatureFlagsStore
      .getState()
      .getFeatureFlag('ENABLE_HOME_CAROUSEL');
    expect(flag?.key).toBe('home_carousel');
  });
});

describe('getFeatureFlagsByCategory', () => {
  it('returns flags of the given category', () => {
    useFeatureFlagsStore.setState({
      flags: [
        makeFlag({ key: 'feat1', category: 'feature' }),
        makeFlag({ key: 'ui1', category: 'ui' }),
        makeFlag({ key: 'feat2', category: 'feature' }),
      ],
      overrides: {},
    });
    const result = useFeatureFlagsStore
      .getState()
      .getFeatureFlagsByCategory('feature');
    expect(result).toHaveLength(2);
    result.forEach(f => expect(f.category).toBe('feature'));
  });

  it('returns empty array when no flags match', () => {
    const result = useFeatureFlagsStore
      .getState()
      .getFeatureFlagsByCategory('debug');
    expect(result).toHaveLength(0);
  });
});

describe('isFeatureEnabled', () => {
  it('returns false for unknown flag', () => {
    expect(
      useFeatureFlagsStore.getState().isFeatureEnabled('nonexistent'),
    ).toBe(false);
  });

  it('respects override (true)', () => {
    useFeatureFlagsStore.setState({ overrides: { test_feature: true } });
    // Override is true even if the flag itself might not be enabled
    expect(
      useFeatureFlagsStore.getState().isFeatureEnabled('test_feature'),
    ).toBe(true);
  });

  it('respects override (false)', () => {
    useFeatureFlagsStore.setState({ overrides: { test_feature: false } });
    expect(
      useFeatureFlagsStore.getState().isFeatureEnabled('test_feature'),
    ).toBe(false);
  });
});

describe('setFeatureFlagOverride', () => {
  it('adds an override for a flag', () => {
    useFeatureFlagsStore
      .getState()
      .setFeatureFlagOverride('test_feature', false);
    expect(useFeatureFlagsStore.getState().overrides.test_feature).toBe(
      false,
    );
  });

  it('overwrites an existing override', () => {
    useFeatureFlagsStore.setState({ overrides: { test_feature: false } });
    useFeatureFlagsStore
      .getState()
      .setFeatureFlagOverride('test_feature', true);
    expect(useFeatureFlagsStore.getState().overrides.test_feature).toBe(
      true,
    );
  });
});

describe('clearOverride', () => {
  it('removes the specified override', () => {
    useFeatureFlagsStore.setState({
      overrides: { test_feature: false, other: true },
    });
    useFeatureFlagsStore.getState().clearOverride('test_feature');
    const { overrides } = useFeatureFlagsStore.getState();
    expect('test_feature' in overrides).toBe(false);
    expect(overrides.other).toBe(true);
  });
});

describe('clearAllOverrides', () => {
  it('empties all overrides', () => {
    useFeatureFlagsStore.setState({ overrides: { a: true, b: false } });
    useFeatureFlagsStore.getState().clearAllOverrides();
    expect(useFeatureFlagsStore.getState().overrides).toEqual({});
  });
});

describe('toggleFeatureFlag', () => {
  it('toggles flag from enabled to disabled', () => {
    useFeatureFlagsStore.setState({ overrides: { test_feature: true } });
    useFeatureFlagsStore.getState().toggleFeatureFlag('test_feature');
    expect(useFeatureFlagsStore.getState().overrides.test_feature).toBe(
      false,
    );
  });
});

describe('resetToDefaults', () => {
  it('clears overrides and restores defaults', () => {
    useFeatureFlagsStore.setState({ overrides: { test_feature: false } });
    useFeatureFlagsStore.getState().resetToDefaults();
    expect(useFeatureFlagsStore.getState().overrides).toEqual({});
    expect(useFeatureFlagsStore.getState().flags.length).toBeGreaterThan(0);
  });
});

describe('updateFromRemote', () => {
  it('replaces flags with remote data', () => {
    const remoteFlag = makeFlag({ key: 'remote_flag', name: 'Remote' });
    useFeatureFlagsStore.getState().updateFromRemote([remoteFlag]);
    const flags = useFeatureFlagsStore.getState().getAllFeatureFlags();
    expect(flags).toHaveLength(1);
    expect(flags[0].key).toBe('remote_flag');
  });
});

describe('getFeatureFlagValue helper', () => {
  it('returns false for unknown key', () => {
    expect(getFeatureFlagValue('nonexistent_key')).toBe(false);
  });
});
