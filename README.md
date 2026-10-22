# Android ScrollView anchor reproducer

This reproduces Android `maintainVisibleContentPosition` anchor selection with React Native 0.88.0. It uses React Native views without a list library, based on the [React Native reproducer template](https://github.com/react-native-community/reproducer-react-native).

Expensify needs this behavior for its [migration from an inverted list to chronological LegendList chats](https://github.com/Expensify/App/pull/100733). Its [Android MVCP patch](https://github.com/Expensify/App/blob/c71756d8aeb1d0f07db6d4dcba874d622f991bd3/patches/react-native/react-native%2B0.86.0%2B002%2BfixMVCPAndroid.patch) combines z-index handling with a positioned, zero-sized anchor used by LegendList. [RN PR #57959](https://github.com/react/react-native/pull/57959) covers z-index ordering. The earlier [PR #46247](https://github.com/react/react-native/pull/46247) closed without merging.

## Run the reproducer

Install the dependencies in `ReproducerApp`, start its development server, and run its Android app. The project uses the standard React Native CLI `start` and `android` package scripts. See the [React Native environment setup](https://reactnative.dev/docs/set-up-your-environment) for Android prerequisites.

To use RNTester, copy [RNTesterPlayground.js](RNTesterPlayground.js) over `packages/rn-tester/js/examples/Playground/RNTesterPlayground.js` in a React Native checkout. Build RNTester and open its Playground.

## Reproduce the z-index bug

1. Tap **Scroll to row 6**. The offset should read 600.
2. Tap **Grow row 6 by 60**.
3. Row 6's top edge should stay at the top of the viewport, and the offset should stay 600.

Negative `zIndex` values reverse the native child order. Choosing the first native child can anchor a later row instead of row 6, so growing row 6 scrolls its top edge out of view.

## Check the zero-sized anchor

1. Tap **Show zero-sized anchor case**.
2. Tap **Scroll to row 6**. The offset should read 600.
3. Tap **Move anchor and rows up 60**.
4. Row 6 should stay at the top, and the offset should change to 540. Repeat the movement to check successive adjustments.

The first content child is an absolute, zero-sized anchor at 10,000,000 plus the adjustment. The second child is a stationary wrapper containing the rows. This matches LegendList's native scroll adjustment layout. Selecting the wrapper by its smaller bottom position loses the anchor movement. The z-index fix must preserve this case too.

## Preserve the anchor in the z-index fix

[This patch](patches/pr-57959-zero-sized-anchor.patch) applies after the Android helper change in RN PR #57959 at `b6b8cbfbfcacf00e23d87161a781566e1426c560`. It keeps a positioned, zero-sized first eligible child as the anchor when its position exceeds the scroll offset. Zero-sized children at or above the scroll offset still use the regular selection logic.

The [RN 0.88.0 z-index screenshot](evidence/rn-0.88-zindex.png) shows offset 660 instead of 600. With #57959's Android helper, the [z-index case stays at 600](evidence/pr-57959-zindex.png), but the [zero-sized anchor case stays at 600 instead of 540](evidence/pr-57959-zero-anchor.png). With the additional patch, [the z-index case stays at 600](evidence/pr-57959-with-anchor-fix-zindex.png) and [the zero-sized anchor case reaches 540](evidence/pr-57959-with-anchor-fix-zero-anchor.png).
