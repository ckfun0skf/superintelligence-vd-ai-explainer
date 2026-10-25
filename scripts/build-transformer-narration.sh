#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
AUDIO_DIR="$ROOT/public/series/transformer-attention/audio"
OUTPUT="$AUDIO_DIR/voiceover.mp3"
TIMING="$AUDIO_DIR/chapter-timing.json"
GAP="${CHAPTER_GAP_SECONDS:-0.8}"

inputs=()
for i in {1..8}; do
  f=$(printf '%s/chapter-%02d.wav' "$AUDIO_DIR" "$i")
  if [[ ! -s "$f" ]]; then
    echo "Missing generated chapter narration WAV: $f" >&2
    exit 1
  fi
  inputs+=( -i "$f" )
  if (( i < 8 )); then
    inputs+=( -f lavfi -t "$GAP" -i "anullsrc=r=24000:cl=mono" )
  fi
done

filter=''
concat_inputs=''
for i in {0..14}; do
  concat_inputs+="[$i:a]"
done
filter="${concat_inputs}concat=n=15:v=0:a=1,aresample=48000,aformat=channel_layouts=stereo[out]"

ffmpeg -hide_banner -y "${inputs[@]}" \
  -filter_complex "$filter" -map '[out]' \
  -c:a libmp3lame -b:a 192k -ar 48000 \
  -metadata title="How Transformers Work: Self-Attention, Q/K/V & Context" \
  -metadata artist="AI Under the Hood" \
  "$OUTPUT"

python3 - "$AUDIO_DIR" "$GAP" "$TIMING" <<'PY'
import json, subprocess, sys
from pathlib import Path
root=Path(sys.argv[1]); gap=float(sys.argv[2]); out=Path(sys.argv[3])
chapters=[]; t=0.0
for i in range(1,9):
    p=root/f'chapter-{i:02d}.wav'
    duration=float(subprocess.check_output([
        'ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(p)
    ], text=True).strip())
    chapters.append({'id':f'{i:02d}','duration_seconds':round(duration,6),'start_seconds':round(t,6),'end_seconds':round(t+duration,6)})
    t+=duration+(gap if i<8 else 0)
payload={'gap_seconds':gap,'total_duration_seconds':round(t,6),'chapters':chapters}
out.write_text(json.dumps(payload,indent=2)+'\n',encoding='utf-8')
print(json.dumps(payload,indent=2))
PY

ffprobe -v error -show_entries format=duration -show_entries stream=codec_name,sample_rate,channels \
  -of default=noprint_wrappers=1 "$OUTPUT"
ffmpeg -v error -i "$OUTPUT" -f null -
echo "Wrote: $OUTPUT"
echo "Wrote: $TIMING"
