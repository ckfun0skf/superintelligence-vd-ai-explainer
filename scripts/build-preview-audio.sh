#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
AUDIO_SOURCE="${AUDIO_SOURCE:-/home/ubuntu/ai-explainer-audio}"
VOICE5_SOURCE="${VOICE5_SOURCE:-${AUDIO_SOURCE}/section-05-tools-origin.wav}"
VOICE6_SOURCE="${VOICE6_SOURCE:-${AUDIO_SOURCE}/section-06-tool-use.wav}"
OUTPUT="${ROOT}/public/audio/section-01-06-preview-mix.mp3"
LEAD_IN="1.2"

probe_duration() {
  ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$1"
}

VOICE_DURATION="$(python3 - "$(probe_duration "${AUDIO_SOURCE}/approved-voice-part-1.wav")" "$(probe_duration "${AUDIO_SOURCE}/chapter-pause.wav")" "$(probe_duration "${AUDIO_SOURCE}/approved-voice-part-2.wav")" "$(probe_duration "${AUDIO_SOURCE}/chapter-pause.wav")" "$(probe_duration "${VOICE5_SOURCE}")" "$(probe_duration "${AUDIO_SOURCE}/chapter-pause.wav")" "$(probe_duration "${VOICE6_SOURCE}")" "${LEAD_IN}" <<'PY'
import sys
values = [float(value) for value in sys.argv[1:]]
print(f"{sum(values):.3f}")
PY
)"
FADE_OUT_START="$(python3 - "${VOICE_DURATION}" <<'PY'
import sys
print(f"{max(0.0, float(sys.argv[1]) - 1.58):.3f}")
PY
)"

mkdir -p "${ROOT}/public/audio"
ffmpeg -y -v error \
  -i "${AUDIO_SOURCE}/approved-voice-part-1.wav" \
  -i "${AUDIO_SOURCE}/chapter-pause.wav" \
  -i "${AUDIO_SOURCE}/approved-voice-part-2.wav" \
  -i "${AUDIO_SOURCE}/chapter-pause.wav" \
  -i "${VOICE5_SOURCE}" \
  -i "${AUDIO_SOURCE}/chapter-pause.wav" \
  -i "${VOICE6_SOURCE}" \
  -i "${AUDIO_SOURCE}/cyber-space-bgm-full.mp3" \
  -filter_complex "\
    [0:a]aresample=44100,aformat=sample_fmts=fltp:channel_layouts=stereo[v1];\
    [1:a]aresample=44100,aformat=sample_fmts=fltp:channel_layouts=stereo[p1];\
    [2:a]aresample=44100,aformat=sample_fmts=fltp:channel_layouts=stereo[v2];\
    [3:a]aresample=44100,aformat=sample_fmts=fltp:channel_layouts=stereo[p2];\
    [4:a]aresample=44100,aformat=sample_fmts=fltp:channel_layouts=stereo[v5];\
    [5:a]aresample=44100,aformat=sample_fmts=fltp:channel_layouts=stereo[p3];\
    [6:a]aresample=44100,aformat=sample_fmts=fltp:channel_layouts=stereo[v6];\
    [v1][p1][v2][p2][v5][p3][v6]concat=n=7:v=0:a=1,adelay=1200:all=1,asplit=2[voice][voicekey];\
    [7:a]atrim=duration=${VOICE_DURATION},asetpts=PTS-STARTPTS,volume=0.10,highpass=f=65,equalizer=f=300:t=q:w=1:g=-2,afade=t=in:st=0:d=1.5,afade=t=out:st=${FADE_OUT_START}:d=1.58[bg];\
    [bg][voicekey]sidechaincompress=threshold=0.20:ratio=4.5:attack=25:release=550:knee=3:detection=peak[duck];\
    [voice][duck]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.94,loudnorm=I=-16:TP=-1.5:LRA=11[mix]" \
  -map '[mix]' -t "${VOICE_DURATION}" -c:a libmp3lame -b:a 192k -ar 44100 "${OUTPUT}"

ffprobe -v error -show_entries stream=codec_name,sample_rate,channels -show_entries format=duration -of default=noprint_wrappers=1 "${OUTPUT}"
ffmpeg -v error -i "${OUTPUT}" -f null -
