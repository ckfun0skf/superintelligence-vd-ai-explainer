import { gsap } from 'gsap';

const QKV_DURATION = 79.44;

/** Paused absolute-time choreography, scrubbed only by the narration clock. */
export function createQkvTimeline() {
  const origin = document.getElementById('qkv-origin');
  const [query, keys, scores, values] = document.querySelectorAll('.qkv-columns > div');
  const output = document.querySelector('.mix-output');
  const formula = document.getElementById('formula-panel');
  const steps = document.querySelector('.mechanism-steps');
  const panels = [query, keys, scores, values];
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut', lazy: false } });

  tl.set(origin, { opacity: 0, yPercent: 12, scale: 0.94 }, 0)
    .set(query, { left: '4%', top: '32%', width: '28%', height: '39%', opacity: 0, yPercent: 10, scale: 0.9, transformPerspective: 900 })
    .set(keys, { left: '36%', top: '32%', width: '28%', height: '39%', opacity: 0, yPercent: 10, scale: 0.9, transformPerspective: 900 })
    .set(values, { left: '68%', top: '32%', width: '28%', height: '39%', opacity: 0, yPercent: 10, scale: 0.9, transformPerspective: 900 })
    .set(scores, { left: '50%', top: '32%', width: '27%', height: '39%', opacity: 0, yPercent: 8, scale: 0.92, transformPerspective: 900 })
    .set(output, { right: '3%', top: '29%', width: '20%', height: '39%', opacity: 0, scale: 0.88, yPercent: 8 })
    .set(formula, { opacity: 0, yPercent: 18, scale: 0.94 })
    .set(steps, { opacity: 0, yPercent: 12 });

  // The same “it” token splits as the narration names the three projections.
  tl.to(origin, { opacity: 1, yPercent: 0, scale: 1, duration: 0.32 }, 0.35)
    .to([query, keys, values], { opacity: 0.82, yPercent: 0, scale: 0.97, duration: 0.34 }, 2.3)
    .to(query, { opacity: 1, scale: 1, duration: 0.22, ease: 'back.out(1.45)' }, 6.7)
    .to(keys, { opacity: 1, scale: 1, duration: 0.22, ease: 'back.out(1.45)' }, 7.68)
    .to(values, { opacity: 1, scale: 1, duration: 0.22, ease: 'back.out(1.45)' }, 8.64)
    .to(query, { scale: 1.035, duration: 0.18, yoyo: true, repeat: 1 }, 11.4)
    .to(keys, { scale: 1.035, duration: 0.18, yoyo: true, repeat: 1 }, 14.74)
    .to(values, { scale: 1.035, duration: 0.18, yoyo: true, repeat: 1 }, 18.06)

    // A short 3D pivot marks “vectors, not labels”; cards stay in the same scene.
    .to([query, keys, values], { rotationY: (i) => (i === 1 ? -10 : 10), rotationX: 3, scale: 0.97, duration: 0.32, stagger: 0.06 }, 22.22)
    .to([query, keys, values], { rotationY: 0, rotationX: 0, scale: 1, duration: 0.28, stagger: 0.05 }, 23.1)

    // Move the very same cards into a compact comparison rig at the spoken cue.
    .to(query, { left: '3%', top: '31%', width: '16%', height: '39%', duration: 0.4 }, 32.55)
    .to(keys, { left: '21%', top: '31%', width: '21%', height: '39%', duration: 0.4 }, 32.55)
    .to(scores, { left: '44%', top: '31%', width: '22%', height: '39%', opacity: 0, scale: 0.93, duration: 0.4 }, 32.55)
    .to(values, { left: '68%', top: '31%', width: '22%', height: '39%', duration: 0.4 }, 32.55)
    .to(query, { scale: 1.045, duration: 0.18, yoyo: true, repeat: 1 }, 33.6)
    .to(scores, { opacity: 1, yPercent: 0, scale: 1, duration: 0.25, ease: 'back.out(1.3)' }, 39.32)

    // Compress the numeric scores into one visible 100% attention distribution.
    .to(scores, { scale: 1.025, duration: 0.22, yoyo: true, repeat: 1 }, 40.86)
    .to(scores, { boxShadow: '0 0 1.35cqw rgba(145,242,210,.18), 0 .9cqw 2.3cqw rgba(0,0,0,.42)', duration: 0.25 }, 46.64)

    // Values stream into a new representation when the narration says “combine”.
    .to(query, { left: '2%', top: '26%', width: '13%', height: '35%', opacity: 0.42, scale: 0.91, duration: 0.52 }, 49.96)
    .to(keys, { left: '16%', top: '26%', width: '15%', height: '35%', opacity: 0.48, scale: 0.93, duration: 0.52 }, 49.96)
    .to(scores, { left: '32%', top: '26%', width: '15%', height: '35%', opacity: 0.62, scale: 0.94, duration: 0.52 }, 49.96)
    .to(values, { left: '48%', top: '26%', width: '20%', height: '39%', opacity: 1, scale: 1.02, duration: 0.52 }, 49.96)
    .to(output, { right: '3%', top: '28%', width: '23%', height: '42%', opacity: 1, scale: 1, yPercent: 0, duration: 0.4, ease: 'back.out(1.35)' }, 50.5)
    .to(values, { boxShadow: '0 0 1.35cqw rgba(255,199,118,.24), 0 .9cqw 2.3cqw rgba(0,0,0,.42)', duration: 0.24 }, 50.5)
    .to(output, { scale: 1.035, duration: 0.2, yoyo: true, repeat: 1 }, 58.16)

    // Existing machine recedes; its own formula grows into the foreground.
    .to(panels, { top: '12%', height: '17%', opacity: 0.22, scale: 0.88, duration: 0.58 }, 64.38)
    .to(output, { opacity: 0.48, scale: 0.9, duration: 0.4 }, 64.38)
    .to(formula, { opacity: 1, yPercent: 0, scale: 1, duration: 0.32, ease: 'back.out(1.2)' }, 64.38)
    .to(panels, { opacity: 0, yPercent: -8, scale: 0.86, duration: 0.2 }, 75.8)
    .to(output, { opacity: 0, scale: 0.88, duration: 0.2 }, 75.8)
    .to(formula, { opacity: 0, yPercent: -8, scale: 0.96, duration: 0.2 }, 75.8)
    .to(steps, { opacity: 1, yPercent: 0, duration: 0.18 }, 75.8);

  return {
    seek(seconds) {
      const t = Math.max(0, Math.min(QKV_DURATION, Number(seconds) || 0));
      tl.time(t, true);
    }
  };
}
