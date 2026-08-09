'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { Topic } from '@/content/schema';
import type { Locale } from '@/i18n/config';

interface ThreeSphereProps {
  topics: Topic[];
  locale: Locale;
  activeId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  showConnections?: boolean;
  /** 'dark' = white particles on deep-space navy; 'light' = charcoal on white. */
  theme?: 'dark' | 'light';
  /** Render the internal star/glow backdrop. Off when the page has its own. */
  showBackground?: boolean;
}

/** Fibonacci sphere point cloud with a given radius. */
function fibonacciSphere(n: number, radius: number) {
  const pts: { x: number; y: number; z: number }[] = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = phi * i;
    pts.push({
      x: Math.cos(theta) * r * radius,
      y: y * radius,
      z: Math.sin(theta) * r * radius,
    });
  }
  return pts;
}

interface LabelHandle {
  el: HTMLButtonElement;
  pos: THREE.Vector3;
  topic: Topic;
}

/**
 * WebGL particle-sphere navigation, adapted from the "Topics Sphere" design.
 *
 * - Dense dust shell + constellation nodes/lines (Three.js Points/Lines).
 * - Topic labels are real, clickable, focusable DOM buttons projected from
 *   their 3D anchor each frame, with depth fade and collision hiding.
 * - Auto-rotates via OrbitControls; the user can drag to rotate.
 * - Themed for Ilim: light (charcoal on white) or dark (white on navy).
 */
export function ThreeSphere({
  topics,
  locale,
  activeId,
  onSelect,
  onHover,
  autoRotate = true,
  autoRotateSpeed = 0.9,
  showConnections = true,
  theme = 'light',
  showBackground = true,
}: ThreeSphereProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);

  // Keep latest callbacks/props in refs so the animation loop stays stable.
  const stateRef = useRef({
    activeId,
    onSelect,
    onHover,
    locale,
    autoRotate,
    autoRotateSpeed,
    showConnections,
  });
  stateRef.current = {
    activeId,
    onSelect,
    onHover,
    locale,
    autoRotate,
    autoRotateSpeed,
    showConnections,
  };

  const labelHandlesRef = useRef<LabelHandle[]>([]);

  const isDark = theme === 'dark';
  const particleColor = isDark ? 0xffffff : 0x1a2a4a;
  const lineColor = isDark ? 0xffffff : 0x1a2a4a;
  const goldColor = 0xc9a227;

  // ---- Background starfield / glow canvas ----
  useEffect(() => {
    if (!showBackground) return;
    const canvas = bgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    const stars: {
      x: number;
      y: number;
      r: number;
      phase: number;
      speed: number;
    }[] = [];
    const glows: { x: number; y: number; r: number; vx: number; vy: number }[] =
      [];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    window.addEventListener('resize', resize);
    resize();

    const starCount = isDark ? 220 : 90;
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random(),
        r: Math.random() * 1.3 + 0.2,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 0.8,
      });
    }
    for (let i = 0; i < 4; i++) {
      glows.push({
        x: Math.random(),
        y: Math.random(),
        r: 0.25 + Math.random() * 0.2,
        vx: (Math.random() - 0.5) * 0.00006,
        vy: (Math.random() - 0.5) * 0.00006,
      });
    }

    const animate = (t: number) => {
      raf = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, w, h);
      glows.forEach((g) => {
        g.x += g.vx;
        g.y += g.vy;
        if (g.x < 0 || g.x > 1) g.vx *= -1;
        if (g.y < 0 || g.y > 1) g.vy *= -1;
        const cx = g.x * w;
        const cy = g.y * h;
        const rad = g.r * Math.max(w, h);
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        // Gold-tinted glow on light; blue on dark.
        const tint = isDark ? '70,110,255' : '201,162,39';
        grad.addColorStop(0, `rgba(${tint},${isDark ? 0.1 : 0.05})`);
        grad.addColorStop(1, `rgba(${tint},0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      });
      stars.forEach((s) => {
        const tw = 0.55 + 0.45 * Math.sin(t * 0.001 * s.speed + s.phase);
        ctx.beginPath();
        const starTint = isDark ? '255,255,255' : '138,143,154';
        ctx.fillStyle = `rgba(${starTint},${tw * (isDark ? 0.85 : 0.5)})`;
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
    };
    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
  }, [isDark, showBackground]);

  // ---- Three.js scene ----
  useEffect(() => {
    const mount = mountRef.current;
    const labelsHost = labelsRef.current;
    if (!mount || !labelsHost) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0.25, 4.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // Dense dust shell
    const dustN = 2200;
    const dustPos = new Float32Array(dustN * 3);
    fibonacciSphere(dustN, 1).forEach((p, i) => {
      const jitter = 0.97 + Math.random() * 0.1;
      dustPos[i * 3] = p.x * jitter;
      dustPos[i * 3 + 1] = p.y * jitter;
      dustPos[i * 3 + 2] = p.z * jitter;
    });
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: particleColor,
      size: 0.012,
      transparent: true,
      opacity: isDark ? 0.5 : 0.55,
      sizeAttenuation: true,
    });
    group.add(new THREE.Points(dustGeo, dustMat));

    // Constellation nodes
    const nodeN = 150;
    const nodePts = fibonacciSphere(nodeN, 1.04);
    const nodePos = new Float32Array(nodeN * 3);
    nodePts.forEach((p, i) => {
      nodePos[i * 3] = p.x;
      nodePos[i * 3 + 1] = p.y;
      nodePos[i * 3 + 2] = p.z;
    });
    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePos, 3));
    const nodeMat = new THREE.PointsMaterial({
      color: particleColor,
      size: 0.028,
      transparent: true,
      opacity: isDark ? 0.9 : 0.75,
      sizeAttenuation: true,
    });
    group.add(new THREE.Points(nodeGeo, nodeMat));

    // Constellation lines (each node → 2 nearest)
    const linePositions: number[] = [];
    for (let i = 0; i < nodeN; i++) {
      const a = nodePts[i];
      const dists: [number, number][] = [];
      for (let j = 0; j < nodeN; j++) {
        if (i === j) continue;
        const b = nodePts[j];
        const d = (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2;
        dists.push([d, j]);
      }
      dists.sort((x, y) => x[0] - y[0]);
      for (let k = 0; k < 2; k++) {
        const b = nodePts[dists[k][1]];
        linePositions.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    }
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(linePositions), 3),
    );
    const lineMat = new THREE.LineBasicMaterial({
      color: lineColor,
      transparent: true,
      opacity: isDark ? 0.18 : 0.12,
    });
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    lines.visible = stateRef.current.showConnections;
    group.add(lines);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.autoRotate = stateRef.current.autoRotate;
    controls.autoRotateSpeed = stateRef.current.autoRotateSpeed;

    // Topic label anchors + connecting lines
    const labelRadius = 1.32;
    const anchors = fibonacciSphere(topics.length, labelRadius);

    const topicLinePositions: number[] = [];
    for (let i = 0; i < anchors.length; i++) {
      const a = anchors[i];
      const dists: [number, number][] = [];
      for (let j = 0; j < anchors.length; j++) {
        if (i === j) continue;
        const b = anchors[j];
        const d = (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2;
        dists.push([d, j]);
      }
      dists.sort((x, y) => x[0] - y[0]);
      for (let k = 0; k < 2; k++) {
        const b = anchors[dists[k][1]];
        topicLinePositions.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    }
    const topicLineGeo = new THREE.BufferGeometry();
    topicLineGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(topicLinePositions), 3),
    );
    const topicLineMat = new THREE.LineBasicMaterial({
      color: lineColor,
      transparent: true,
      opacity: isDark ? 0.22 : 0.14,
    });
    const topicLines = new THREE.LineSegments(topicLineGeo, topicLineMat);
    topicLines.visible = stateRef.current.showConnections;
    group.add(topicLines);

    // Build clickable label buttons
    labelsHost.innerHTML = '';
    const labelHandles: LabelHandle[] = topics.map((topic, i) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.textContent = topic.translations[stateRef.current.locale].name;
      el.setAttribute('aria-label', topic.translations[stateRef.current.locale].name);
      el.dataset.id = topic.id;
      Object.assign(el.style, {
        position: 'absolute',
        left: '0',
        top: '0',
        fontWeight: '700',
        fontFamily: "'Manrope', system-ui, sans-serif",
        letterSpacing: '-0.01em',
        whiteSpace: 'nowrap',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        padding: '2px 6px',
        borderRadius: '999px',
        willChange: 'transform, opacity',
        transformOrigin: 'center',
      } as CSSStyleDeclaration);

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        stateRef.current.onSelect(topic.id);
      });
      el.addEventListener('mouseenter', () =>
        stateRef.current.onHover(topic.id),
      );
      el.addEventListener('mouseleave', () => stateRef.current.onHover(null));
      el.addEventListener('focus', () => stateRef.current.onHover(topic.id));
      el.addEventListener('blur', () => stateRef.current.onHover(null));

      labelsHost.appendChild(el);
      return {
        el,
        topic,
        pos: new THREE.Vector3(anchors[i].x, anchors[i].y, anchors[i].z),
      };
    });
    labelHandlesRef.current = labelHandles;

    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', resize);
    resize();

    const v = new THREE.Vector3();
    const camDir = new THREE.Vector3();
    let raf = 0;

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const st = stateRef.current;
      controls.autoRotate = st.autoRotate;
      controls.autoRotateSpeed = st.autoRotateSpeed;
      lines.visible = st.showConnections;
      topicLines.visible = st.showConnections;
      controls.update();

      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camDir.copy(camera.position).normalize();
      const marginX = w * 0.09;
      const marginY = h * 0.09;

      const computed = labelHandles.map(({ el, pos, topic }) => {
        v.copy(pos).applyMatrix4(group.matrixWorld);
        const facing = pos.clone().normalize().dot(camDir);
        v.project(camera);
        const x = (v.x * 0.5 + 0.5) * w;
        const y = (-v.y * 0.5 + 0.5) * h;
        const t = (facing + 1) / 2;
        let opacity = Math.max(0.08, Math.min(1, 0.1 + t * 0.9));
        const edgeX = Math.max(
          0,
          Math.max(marginX - x, x - (w - marginX)) / marginX,
        );
        const edgeY = Math.max(
          0,
          Math.max(marginY - y, y - (h - marginY)) / marginY,
        );
        const edgeFade = Math.max(0, 1 - Math.max(edgeX, edgeY) * 1.4);
        opacity *= edgeFade;
        const scale = 0.55 + t * 0.45;
        const label = topic.translations[st.locale].name;
        const fontSize = Math.max(10, 14 * scale);
        const halfW = label.length * fontSize * 0.34;
        const halfH = fontSize * 0.75;
        const isActive = st.activeId === topic.id;
        return { el, x, y, t, opacity, fontSize, halfW, halfH, isActive, topic };
      });

      computed.sort((a, b) => b.t - a.t);
      const placed: typeof computed = [];
      computed.forEach((l) => {
        const hit = placed.some(
          (p) =>
            Math.abs(l.x - p.x) < (l.halfW + p.halfW) &&
            Math.abs(l.y - p.y) < (l.halfH + p.halfH),
        );
        if (hit && !l.isActive) l.opacity *= 0.04;
        else placed.push(l);

        const highlighted = l.isActive;
        l.el.style.transform =
          'translate(-50%, -50%) translate(' + l.x + 'px,' + l.y + 'px)';
        l.el.style.opacity = String(l.opacity);
        l.el.style.fontSize = l.fontSize + 'px';
        l.el.style.zIndex = String(Math.round(l.t * 100) + (highlighted ? 500 : 0));
        // Interactivity only for reasonably visible, front-facing labels.
        l.el.style.pointerEvents = l.opacity > 0.25 ? 'auto' : 'none';

        if (highlighted) {
          l.el.style.color = '#ffffff';
          l.el.style.background = '#c9a227';
          l.el.style.boxShadow = '0 4px 18px -4px rgba(201,162,39,0.5)';
          l.el.style.padding = '4px 12px';
        } else {
          l.el.style.color = isDark ? '#ffffff' : '#1a1a1a';
          l.el.style.background = 'transparent';
          l.el.style.boxShadow = 'none';
          l.el.style.padding = '2px 6px';
          l.el.style.textShadow = isDark
            ? '0 1px 8px rgba(0,0,0,0.5)'
            : '0 0 6px rgba(255,255,255,0.95), 0 0 2px rgba(255,255,255,1)';
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
      controls.dispose();
      renderer.dispose();
      dustGeo.dispose();
      nodeGeo.dispose();
      lineGeo.dispose();
      topicLineGeo.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
      labelsHost.innerHTML = '';
    };
    // Rebuild the scene when the topic set or theme changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topics, isDark]);

  // Update label text live on locale change (without rebuilding the scene).
  useEffect(() => {
    labelHandlesRef.current.forEach(({ el, topic }) => {
      el.textContent = topic.translations[locale].name;
      el.setAttribute('aria-label', topic.translations[locale].name);
    });
  }, [locale]);

  return (
    <div className="relative h-full w-full">
      {showBackground && (
        <canvas
          ref={bgCanvasRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full"
        />
      )}
      <div ref={mountRef} className="absolute inset-0 h-full w-full" />
      <div
        ref={labelsRef}
        className="pointer-events-none absolute inset-0 overflow-visible"
      />
    </div>
  );
}
