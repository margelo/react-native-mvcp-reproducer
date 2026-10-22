/**
 * @format
 */

import { useRef, useState } from 'react';
import type { ScrollViewInstance } from 'react-native';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
        <AppContent />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const ROW_HEIGHT = 100;
const INITIAL_OFFSET = ROW_HEIGHT * 6;
const ANCHOR_POSITION = 10_000_000;
const ROWS = Array.from({ length: 30 }, (_, index) => index);

function AppContent() {
  const [useZeroSizedAnchor, setUseZeroSizedAnchor] = useState(false);

  return (
    <View style={styles.container}>
      <Button
        title={
          useZeroSizedAnchor
            ? 'Show z-index case'
            : 'Show zero-sized anchor case'
        }
        onPress={() => setUseZeroSizedAnchor(value => !value)}
      />
      <AnchorExample
        key={String(useZeroSizedAnchor)}
        useZeroSizedAnchor={useZeroSizedAnchor}
      />
    </View>
  );
}

function AnchorExample({
  useZeroSizedAnchor,
}: {
  useZeroSizedAnchor: boolean;
}) {
  const scrollView = useRef<ScrollViewInstance | null>(null);
  const [adjustment, setAdjustment] = useState(0);
  const [offset, setOffset] = useState(0);

  const rows = ROWS.map(index => (
    <View
      key={index}
      collapsable={false}
      style={[
        styles.row,
        {
          backgroundColor: index % 2 === 0 ? '#dbeafe' : '#fef3c7',
          height:
            ROW_HEIGHT + (!useZeroSizedAnchor && index === 6 ? adjustment : 0),
          zIndex: useZeroSizedAnchor ? 0 : -index,
        },
      ]}
    >
      <Text style={styles.label}>Row {index}</Text>
    </View>
  ));

  return (
    <View style={styles.example}>
      <Text style={styles.instructions}>
        {useZeroSizedAnchor
          ? 'Scroll to row 6, then move the anchor. Row 6 should stay at the top. This uses the zero-sized anchor and item wrapper layout used by LegendList.'
          : 'Scroll to row 6, then grow that row. Its top edge should stay in place. Negative z-index reverses the native child order.'}
      </Text>
      <Button
        title="Scroll to row 6"
        onPress={() =>
          scrollView.current?.scrollTo({ y: INITIAL_OFFSET, animated: false })
        }
      />
      <Button
        title={
          useZeroSizedAnchor ? 'Move anchor and rows up 60' : 'Grow row 6 by 60'
        }
        onPress={() =>
          setAdjustment(value => value + (useZeroSizedAnchor ? -60 : 60))
        }
      />
      <Text testID="mvcp-offset" style={styles.instructions}>
        Offset: {Math.round(offset)}. Expected:{' '}
        {INITIAL_OFFSET + (useZeroSizedAnchor ? adjustment : 0)}
      </Text>
      <ScrollView
        ref={scrollView}
        style={styles.scrollView}
        maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
        onScroll={event => setOffset(event.nativeEvent.contentOffset.y)}
        scrollEventThrottle={16}
      >
        {useZeroSizedAnchor ? (
          <View
            collapsable={false}
            style={{
              position: 'absolute',
              width: 0,
              height: 0,
              top: ANCHOR_POSITION + adjustment,
            }}
          />
        ) : null}
        {useZeroSizedAnchor ? (
          <View
            collapsable={false}
            style={{ height: ROWS.length * ROW_HEIGHT }}
          >
            <View
              style={{
                position: 'absolute',
                top: adjustment,
                left: 0,
                right: 0,
              }}
            >
              {rows}
            </View>
          </View>
        ) : (
          rows
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  example: {
    flex: 1,
  },
  instructions: {
    color: '#111827',
    paddingVertical: 8,
  },
  scrollView: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#dc2626',
  },
  row: {
    justifyContent: 'flex-start',
    borderBottomWidth: 1,
    borderColor: '#111827',
  },
  label: {
    color: '#111827',
    fontSize: 18,
    padding: 8,
  },
});
