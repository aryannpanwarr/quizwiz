'use client';

const particles = [
  { id: 1, size: 120, color: 'rgba(192, 132, 252, 0.35)', x: '10%', duration: '9s', delay: '0s', drift: '40px', maxOpacity: '0.35' },
  { id: 2, size: 80,  color: 'rgba(244, 114, 182, 0.3)',  x: '25%', duration: '12s', delay: '1s', drift: '-30px', maxOpacity: '0.3' },
  { id: 3, size: 160, color: 'rgba(139, 92, 246, 0.25)',  x: '40%', duration: '10s', delay: '2s', drift: '50px', maxOpacity: '0.25' },
  { id: 4, size: 100, color: 'rgba(248, 113, 113, 0.3)',  x: '55%', duration: '8s',  delay: '0.5s', drift: '-20px', maxOpacity: '0.3' },
  { id: 5, size: 200, color: 'rgba(167, 139, 250, 0.2)',  x: '70%', duration: '14s', delay: '3s', drift: '60px', maxOpacity: '0.2' },
  { id: 6, size: 90,  color: 'rgba(251, 113, 133, 0.35)', x: '85%', duration: '11s', delay: '1.5s', drift: '-45px', maxOpacity: '0.35' },
  { id: 7, size: 130, color: 'rgba(216, 180, 254, 0.25)', x: '5%',  duration: '13s', delay: '4s', drift: '25px', maxOpacity: '0.25' },
  { id: 8, size: 70,  color: 'rgba(240, 171, 252, 0.4)',  x: '60%', duration: '7s',  delay: '2.5s', drift: '-35px', maxOpacity: '0.4' },
  { id: 9, size: 110, color: 'rgba(196, 181, 253, 0.3)',  x: '90%', duration: '15s', delay: '0s', drift: '20px', maxOpacity: '0.3' },
  { id: 10, size: 85, color: 'rgba(248, 113, 113, 0.25)', x: '35%', duration: '9s', delay: '3.5s', drift: '-55px', maxOpacity: '0.25' },
  { id: 11, size: 145, color: 'rgba(139, 92, 246, 0.2)', x: '78%', duration: '11s', delay: '5s', drift: '40px', maxOpacity: '0.2' },
  { id: 12, size: 95,  color: 'rgba(244, 114, 182, 0.3)', x: '18%', duration: '10s', delay: '1s', drift: '-25px', maxOpacity: '0.3' },
  { id: 13, size: 175, color: 'rgba(192, 132, 252, 0.15)', x: '50%', duration: '16s', delay: '2s', drift: '70px', maxOpacity: '0.15' },
  { id: 14, size: 60,  color: 'rgba(251, 113, 133, 0.4)',  x: '93%', duration: '6s', delay: '4.5s', drift: '-15px', maxOpacity: '0.4' },
  { id: 15, size: 120, color: 'rgba(167, 139, 250, 0.25)', x: '45%', duration: '12s', delay: '0.5s', drift: '35px', maxOpacity: '0.25' },
];

const sparkles = [
  { id: 1, x: '8%',  y: '15%', size: '18px', duration: '2.5s', delay: '0s' },
  { id: 2, x: '22%', y: '35%', size: '14px', duration: '3.2s', delay: '0.8s' },
  { id: 3, x: '38%', y: '20%', size: '22px', duration: '2.8s', delay: '1.6s' },
  { id: 4, x: '55%', y: '10%', size: '16px', duration: '3.5s', delay: '0.4s' },
  { id: 5, x: '70%', y: '30%', size: '20px', duration: '2.2s', delay: '1.2s' },
  { id: 6, x: '82%', y: '18%', size: '12px', duration: '4s',   delay: '2s' },
  { id: 7, x: '14%', y: '60%', size: '24px', duration: '3s',   delay: '0.6s' },
  { id: 8, x: '90%', y: '55%', size: '15px', duration: '2.6s', delay: '1.8s' },
  { id: 9, x: '48%', y: '70%', size: '19px', duration: '3.8s', delay: '1s' },
  { id: 10, x: '65%', y: '80%', size: '13px', duration: '2.4s', delay: '2.4s' },
];

const bokehBlobs = [
  { id: 1, size: 300, color: 'rgba(124, 58, 237, 0.25)', x: '5%',  y: '10%', duration: '7s',  delay: '0s' },
  { id: 2, size: 400, color: 'rgba(147, 51, 234, 0.2)',  x: '60%', y: '5%',  duration: '9s',  delay: '1s' },
  { id: 3, size: 250, color: 'rgba(236, 72, 153, 0.2)',  x: '80%', y: '60%', duration: '8s',  delay: '2s' },
  { id: 4, size: 350, color: 'rgba(192, 132, 252, 0.15)', x: '30%', y: '70%', duration: '11s', delay: '3s' },
  { id: 5, size: 200, color: 'rgba(248, 113, 113, 0.2)', x: '50%', y: '40%', duration: '6s',  delay: '0.5s' },
];

export default function FloatingParticles() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Animated gradient background */}
      <div className="gradient-bg" />

      {/* Bokeh soft glow blobs */}
      {bokehBlobs.map((blob) => (
        <div
          key={blob.id}
          className="bokeh"
          style={{
            width: blob.size,
            height: blob.size,
            background: blob.color,
            left: blob.x,
            top: blob.y,
            '--duration': blob.duration,
            '--delay': blob.delay,
          } as React.CSSProperties}
        />
      ))}

      {/* Floating particle circles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            width: p.size,
            height: p.size,
            background: p.color,
            left: p.x,
            bottom: '-10%',
            '--duration': p.duration,
            '--delay': p.delay,
            '--drift': p.drift,
            '--max-opacity': p.maxOpacity,
          } as React.CSSProperties}
        />
      ))}

      {/* Sparkle stars */}
      {sparkles.map((s) => (
        <div
          key={s.id}
          className="sparkle"
          style={{
            left: s.x,
            top: s.y,
            '--size': s.size,
            '--duration': s.duration,
            '--delay': s.delay,
          } as React.CSSProperties}
        >
          ✦
        </div>
      ))}
    </div>
  );
}
