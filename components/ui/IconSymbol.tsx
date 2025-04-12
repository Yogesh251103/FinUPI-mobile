// This file is a fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import React from 'react';
import { OpaqueColorValue, StyleProp, ViewStyle } from 'react-native';

// Add your SFSymbol to MaterialIcons mappings here.
const MAPPING = {
  // See MaterialIcons here: https://icons.expo.fyi
  // See SF Symbols in the SF Symbols app on Mac.
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chart.bar.fill': 'bar-chart',
  'dollarsign.circle.fill': 'attach-money',
  'book.fill': 'menu-book',
  'gift.fill': 'card-giftcard',
  'arrow.clockwise': 'loop',
  'person.fill': 'person',
  'credit.card.fill': 'credit-card',
  'banknote.fill': 'money',
  'lock.fill': 'lock',
  'bell.fill': 'notifications',
  'gear.fill': 'settings',
  'doc.text.fill': 'description',
  'arrow.up': 'arrow-upward',
  'arrow.down': 'arrow-downward',
  'checkmark.circle.fill': 'check-circle',
  'xmark.circle.fill': 'cancel',
  'plus.circle.fill': 'add-circle',
  'minus.circle.fill': 'remove-circle',
  'info.circle.fill': 'info',
  'questionmark.circle.fill': 'help',
} as Partial<
  Record<
    import('expo-symbols').SymbolViewProps['name'],
    React.ComponentProps<typeof MaterialIcons>['name']
  >
>;

export type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SFSymbols on iOS, and MaterialIcons on Android and web. This ensures a consistent look across platforms, and optimal resource usage.
 *
 * Icon `name`s are based on SFSymbols and require manual mapping to MaterialIcons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  // Use a valid Material icon name from the mapping, or fallback to 'help'
  const iconName = MAPPING[name] || 'help';
  return <MaterialIcons color={color} size={size} name={iconName} style={style as any} />;
}
