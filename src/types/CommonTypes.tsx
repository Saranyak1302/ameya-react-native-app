export type Error = {message: string; code?: string};
export type AlertButtons =
  | [{text: string; onPress?: () => void}]
  | [
      {text: string; onPress?: () => void},
      {text: string; onPress?: () => void},
    ];
