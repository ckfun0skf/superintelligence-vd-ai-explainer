import { gsap } from 'gsap';

const QKV_DURATION = 79.44;

/**
 * A paused, absolute-time choreography for the Q/K/V scene.
 * The player/exporter seeks this timeline from the narration clock; it never
 * runs from GSAP's ticker, so arbitrary frame order stays deterministic.
 */
export function createQkvTimeline() {
  const origin = document.getElementById('qkv-origin');
  const [query, keys, scores, values] = document.querySelectorAll('.qkv-columns > div');
  const output = document.querySelector('.mix-output');
  const formula = document.getElementById('formula-panel');
  const steps = document.querySelector('.mechanism-steps');
  const panels = [query, keys, scores, values];
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut', lazy: false } });

  // Start as a three-way projection, not a four-column dashboard.
  tl.set(origin, { opacity: 0, yPercent: 18, scale: 0.92 }, 0)
    .set(query, { left: '4%', top: '32%', width: '28%', height: '39%', opacity: 0, yPercent: 14, scale: 0.84, transformPerspective: 900 })
    .set(keys, { left: '36%', top: '32%', width: '28%', height: '39%', opacity: 0, yPercent: 14, scale: 0.84, transformPerspective: 900 })
    .set(values, { left: '68%', top: '32%', width: '28%', height: '39%', opacity: 0, yPercent: 14, scale: 0.84, transformPerspective: 900 })
    .set(scores, { left: '50%', top: '32%', width: '27%', height: '39%', opacity: 0, yPercent: 12, scale: 0.82, transformPerspective: 900 })
    .set(output, { right: '4%', top: '70%', width: '24%', height: '12%', opacity: 0, scale: 0.82, yPercent: 12 })
    .set(formula, { opacity: 0, yPercent: 24, scale: 0.9 })
    .set(steps, { opacity: 0.72, yPercent: 15 });

  tl.to(origin, { opacity: 1, yPercent: 0, scale: 1, duration: 0.55, ease: 'back.out(1.4)' }, 0.15)
    .to([query, keys, values], { opacity: 1, yPercent: 0, scale: 1, duration: 0.62, stagger: 0.28, ease: 'back.out(1.45)' }, 0.72)
    // Short, separate pulses explain the three learned projections without leaving the composition frozen.
    .to(query, { scale: 1.045, duration: 0.28, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 8.1)
    .to(keys, { scale: 1.045, duration: 0.28, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 12.2)
    .to(values, { scale: 1.045, duration: 0.28, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 16.4)
    // Turn the analogy cards into abstract learned vectors, then rapidly reflow into the scoring operation.
    .to([query, keys, values], { rotationY: (i) => (i === 1 ? -7 : 7), scale: 0.97, duration: 0.42, stagger: 0.12 }, 22.0)
    .to([query, keys, values], { rotationY: 0, scale: 1, duration: 0.4, stagger: 0.1 }, 23.0)
    .to(query, { left: '3%', top: '31%', width: '20%', height: '41%', duration: 0.82 }, 38.65)
    .to(keys, { left: '27%', top: '31%', width: '21%', height: '41%', duration: 0.82 }, 38.65)
    .to(values, { left: '78%', top: '31%', width: '19%', height: '41%', duration: 0.82 }, 38.65)
    .to(scores, { left: '52%', top: '31%', width: '24%', height: '41%', opacity: 1, yPercent: 0, scale: 1, duration: 0.68, ease: 'back.out(1.35)' }, 38.8)
    .to([query, keys, values], { opacity: 0.72, scale: 0.96, duration: 0.62 }, 42.1)
    .to(scores, { scale: 1.08, boxShadow: '0 0 2.2cqw rgba(145,242,210,.22), 0 .9cqw 2.3cqw rgba(0,0,0,.45)', duration: 0.55 }, 42.1)
    // Focus shifts from the normalized weights to Value streams and the newly mixed vector.
    .to(query, { left: '2%', top: '25%', width: '16%', height: '34%', opacity: 0.45, scale: 0.91, duration: 0.82 }, 50.4)
    .to(keys, { left: '19%', top: '25%', width: '16%', height: '34%', opacity: 0.42, scale: 0.91, duration: 0.82 }, 50.4)
    .to(scores, { left: '36%', top: '25%', width: '16%', height: '34%', opacity: 0.58, scale: 0.94, boxShadow: '0 0 .8cqw rgba(145,242,210,.1), 0 .9cqw 2.3cqw rgba(0,0,0,.35)', duration: 0.82 }, 50.4)
    .to(values, { left: '54%', top: '29%', width: '19%', height: '39%', opacity: 1, scale: 1.04, duration: 0.82 }, 50.4)
    .to(output, { right: '3%', top: '29%', width: '22%', height: '39%', opacity: 1, scale: 1, yPercent: 0, duration: 0.8, ease: 'back.out(1.3)' }, 50.8)
    .to(steps, { opacity: 1, yPercent: 0, duration: 0.45 }, 50.4)
    // Keep the real objects on screen, but move them back as the compact formula takes focus.
    .to(panels, { top: '18%', height: '22%', opacity: 0.22, scale: 0.88, duration: 0.85 }, 64.65)
    .to(output, { opacity: 0.38, scale: 0.88, duration: 0.65 }, 64.65)
    .to(formula, { opacity: 1, yPercent: 0, scale: 1.05, duration: 0.72, ease: 'back.out(1.2)' }, 64.7)
    .to(steps, { yPercent: 0, duration: 0.35 }, 64.7)
    .to(formula, { opacity: 0.78, scale: 1, duration: 0.3 }, 78.85);

  return {
    seek(seconds) {
      const t = Math.max(0, Math.min(QKV_DURATION, Number(seconds) || 0));
      tl.time(t, true);
    }
  };
}
