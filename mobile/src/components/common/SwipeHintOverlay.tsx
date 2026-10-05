import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSwipeHint, type SwipeHintScreen } from '@hooks/useSwipeHint';
import SwipeHintBubble from '@components/common/SwipeHintBubble';
import type { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';

interface Props {
  screenKey: SwipeHintScreen;
  ready: boolean;
  children: React.ReactNode;
  tooltipTitle: string;
  tooltipMessage?: string;
  swipeableRef?: (ref: SwipeableMethods | null) => void;
}

/**
 * Wraps the first swipeable list item (History, Favourites).
 * Uses cloneElement to inject swipeHintRef into the child so the hook
 * can call openRight() / close() on the Swipeable.
 *
 * NOTE: Do NOT use this inside FlatList renderItem — it causes duplicate key
 * errors. Use useSwipeHint + SwipeHintBubble directly in that case.
 */
const SwipeHintOverlay: React.FC<Props> = ({
  screenKey,
  ready,
  children,
  tooltipMessage,
  swipeableRef,
}) => {
  const { registerSwipeRef, tooltipVisible, dismiss } = useSwipeHint(
    screenKey,
    ready,
  );

  const handleRef = React.useCallback(
    (ref: SwipeableMethods | null) => {
      registerSwipeRef(ref);
      swipeableRef?.(ref);
    },
    [registerSwipeRef, swipeableRef],
  );

  return (
    <View style={styles.wrapper}>
      <View style={styles.bubbleAnchor}>
        <SwipeHintBubble
          visible={tooltipVisible}
          message={tooltipMessage ?? ''}
          onDismiss={dismiss}
        />
      </View>
      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<any>, {
            swipeHintRef: handleRef,
          })
        : children}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  bubbleAnchor: {
    position: 'absolute',
    bottom: '100%',
    left: 12,
    zIndex: 100,
    paddingBottom: 2,
  },
});

export default SwipeHintOverlay;
