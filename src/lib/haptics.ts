import * as Haptics from 'expo-haptics';

async function runHaptic(task: Promise<void>) {
  try {
    await task;
  } catch {
    // Ignore unsupported-device failures so UI interactions still complete.
  }
}

export function selectionHaptic() {
  void runHaptic(Haptics.selectionAsync());
}

export function impactHaptic(
  style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light,
) {
  void runHaptic(Haptics.impactAsync(style));
}

export function softHaptic(
  style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Soft,
) {
  void runHaptic(Haptics.impactAsync(style));
}

export function successHaptic() {
  void runHaptic(
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  );
}

export function warningHaptic() {
  void runHaptic(
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  );
}

export function errorHaptic() {
  void runHaptic(
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  );
}
