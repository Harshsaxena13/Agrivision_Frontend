import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from "expo-audio";
import { File, Paths } from "expo-file-system";

/**
 * Plays base64-encoded WAV clips one after another. Each clip is written to a
 * temp .wav file first because the player needs a file to play. Resolves to a
 * function that stops playback early; temp files are deleted either way.
 */
export const playBase64Wavs = async (clips: string[]): Promise<() => void> => {
  const stamp = Date.now();
  const files = await Promise.all(
    clips.map(async (clip, i) => {
      const file = new File(Paths.cache, `voice-reply-${stamp}-${i}.wav`);
      file.create({ overwrite: true });
      await file.write(clip, { encoding: "base64" });
      return file;
    }),
  );

  await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false });

  let player: AudioPlayer | null = null;
  let stopped = false;

  const stop = () => {
    if (stopped) return;
    stopped = true;
    player?.remove();
    player = null;
    for (const file of files) {
      try {
        file.delete();
      } catch {
        // Already removed
      }
    }
  };

  const playAt = (i: number) => {
    if (stopped) return;
    if (i >= files.length) {
      stop();
      return;
    }
    player?.remove();
    const current = createAudioPlayer({ uri: files[i].uri });
    player = current;
    let finished = false;
    current.addListener("playbackStatusUpdate", (status) => {
      if (!status.didJustFinish || finished) return;
      finished = true;
      // Leave this player's callback before removing it
      setTimeout(() => playAt(i + 1), 0);
    });
    current.play();
  };

  playAt(0);
  return stop;
};
