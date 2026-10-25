#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
AUDIO_DIR="$ROOT/public/series/transformer-attention/audio"
PART1="$AUDIO_DIR/voiceover-part-1.wav"
PART2="$AUDIO_DIR/voiceover-part-2.wav"
OUTPUT="$AUDIO_DIR/voiceover.mp3"
for f in "$PART1" "$PART2"; do
  if [[ ! -s "$f" ]]; then
    echo "Missing generated narration WAV: $f" >&2
    exit 1
  fi
done
ffmpeg -hide_banner -y \
  -i "$PART1" \
  -i "$PART2" \
  -filter_complex "[0:a]aresample=48000,aformat=channel_layouts=stereo[a0];anullsrc=r=48000:cl=stereo:d=0.8[pause];[1:a]aresample=48000,aformat=channel_layouts=stereo[a1];[a0][pause][a1]concat=n=3:v=0:a=1[a]" \
  -map "[a]" -c:a libmp3lame -b:a 192k -ar 48000 \
  -metadata title="How Transformers Work: Self-Attention, Q/K/V & Context" \
  -metadata artist="AI Under the Hood" \
  "$OUTPUT"
ffprobe -v error -show_entries format=duration -show_entries stream=codec_name,sample_rate,channels \
  -of default=noprint_wrappers=1 "$OUTPUT"
echo "Wrote: $OUTPUT"
