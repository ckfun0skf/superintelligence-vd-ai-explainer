#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
AUDIO_SOURCE="${AUDIO_SOURCE:-/home/ubuntu/ai-explainer-audio}"
OUTPUT="${ROOT}/public/audio/section-01-04-preview-mix.mp3"
VOICE_DURATION="177.38"
FADE_OUT_START="175.8"

mkdir -p "${ROOT}/public/audio"
ffmpeg -y -v error \
  -i "${AUDIO_SOURCE}/approved-voice-part-1.wav" \
  -i "${AUDIO_SOURCE}/chapter-pause.wav" \
  -i "${AUDIO_SOURCE}/approved-voice-part-2.wav" \
  -i "${AUDIO_SOURCE}/cyber-space-bgm-full.mp3" \
  -filter_complex "\
    [0:a]aresample=44100,aformat=sample_fmts=fltp:channel_layouts=stereo[v1];\
    [1:a]aresample=44100,aformat=sample_fmts=fltp:channel_layouts=stereo[v2];\
    [2:a]aresample=44100,aformat=sample_fmts=fltp:channel_layouts=stereo[v3];\
    [v1][v2][v3]concat=n=3:v=0:a=1,adelay=1200:all=1,asplit=2[voice][voicekey];\
    [3:a]atrim=duration=${VOICE_DURATION},asetpts=PTS-STARTPTS,volume=0.10,highpass=f=65,equalizer=f=300:t=q:w=1:g=-2,afade=t=in:st=0:d=1.5,afade=t=out:st=${FADE_OUT_START}:d=1.58[bg];\
    [bg][voicekey]sidechaincompress=threshold=0.20:ratio=4.5:attack=25:release=550:knee=3:detection=peak[duck];\
    [voice][duck]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.94,loudnorm=I=-16:TP=-1.5:LRA=11[mix]" \
  -map '[mix]' -t "${VOICE_DURATION}" -c:a libmp3lame -b:a 192k -ar 44100 "${OUTPUT}"

ffprobe -v error -show_entries stream=codec_name,sample_rate,channels -show_entries format=duration -of default=noprint_wrappers=1 "${OUTPUT}"
ffmpeg -v error -i "${OUTPUT}" -f null -
