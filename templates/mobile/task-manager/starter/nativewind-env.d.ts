/// <reference types="nativewind/types" />

// Self-contained className augmentation so `tsc` passes even before NativeWind's
// transitive type packages are hoisted. These identical `className?: string`
// declarations merge cleanly with NativeWind's own types when they are present.
import "react-native";

declare module "react-native" {
  interface ViewProps {
    className?: string;
  }
  interface TextProps {
    className?: string;
  }
  interface TextInputProps {
    className?: string;
  }
  interface ScrollViewProps {
    className?: string;
  }
  interface PressableProps {
    className?: string;
  }
  interface ImageProps {
    className?: string;
  }
}
