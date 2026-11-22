import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RotateCcw, Sparkles } from 'lucide-react';
import { ZODIAC_SIGNS } from '../engine/constants';
import type { PlanetPosition } from '../engine/ephemeris';

interface Cosmic3DMapProps {
  planets: PlanetPosition[];
  lagnaSignIndex: number;
}

const PLANET_COLORS: Record<string, number> = {
  Sun: 0xf59e0b,
  Moon: 0xe2e8f0,
  Mars: 0xef4444,
  Mercury: 0x10b981,
  Jupiter: 0xfbbf24,
  Venus: 0xf472b6,
  Saturn: 0x6366f1,
  Rahu: 0x64748b,
  Ketu: 0x94a3b8,
};

export const Cosmic3DMap: React.FC<Cosmic3DMapProps> = ({ planets, lagnaSignIndex }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [showNakshatras, setShowNakshatras] = useState(true);
  const [selectedInfo, setSelectedInfo] = useState<string>('Click any 3D planet node to inspect its sidereal coordinates.');
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const nakGroupRef = useRef<THREE.Group | null>(null);
  const autoRotateRef = useRef(autoRotate);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  useEffect(() => {
    if (nakGroupRef.current) {
      nakGroupRef.current.visible = showNakshatras;
    }
  }, [showNakshatras]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 720;
    const height = container.clientHeight || 420;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    const gl = renderer.getContext();
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const gpuStr = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : '';
    const isSoftwareGl = /SwiftShader|llvmpipe|Microsoft Basic Render Driver/i.test(gpuStr);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSoftwareGl ? 1 : 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x091229);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmrem.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 200);
    camera.position.set(0, 12, 18);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.autoRotate = autoRotateRef.current;
    controls.autoRotateSpeed = 0.65;
    controls.minDistance = 8;
    controls.maxDistance = 36;
    controlsRef.current = controls;

    // Subtle key/fill lighting
    scene.add(new THREE.AmbientLight(0xfcfbf7, 0.45));
    const keyLight = new THREE.DirectionalLight(0xffefc2, 1.4);
    keyLight.position.set(10, 16, 10);
    scene.add(keyLight);

    const disposables: Array<{ dispose: () => void }> = [];

    // Background celestial starfield
    const starCount = isSoftwareGl ? 300 : 750;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 35 + Math.random() * 45;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPos[i * 3 + 2] = r * Math.cos(phi);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xfde68a, size: 0.18, transparent: true, opacity: 0.75 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);
    disposables.push(starGeo, starMat);

    // Central Earth / Observer core
    const coreGeo = new THREE.SphereGeometry(0.95, isSoftwareGl ? 16 : 32, isSoftwareGl ? 12 : 24);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      metalness: 0.25,
      roughness: 0.35,
      emissive: 0x0f172a,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);
    disposables.push(coreGeo, coreMat);

    // Zodiac Ecliptic Ring (Radius 10)
    const ringGeo = new THREE.TorusGeometry(10, 0.06, 12, isSoftwareGl ? 64 : 128);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xc59326, metalness: 0.75, roughness: 0.25 });
    const eclipticRing = new THREE.Mesh(ringGeo, ringMat);
    eclipticRing.rotation.x = Math.PI / 2;
    scene.add(eclipticRing);
    disposables.push(ringGeo, ringMat);

    // 12 Zodiac Sign Dividers + Constellation Star Patterns
    const spokeMat = new THREE.LineBasicMaterial({ color: 0xc59326, transparent: true, opacity: 0.35 });
    const constLineMat = new THREE.LineBasicMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.55 });
    const constStarGeo = new THREE.SphereGeometry(0.11, 8, 8);
    const constStarMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    disposables.push(spokeMat, constLineMat, constStarGeo, constStarMat);

    ZODIAC_SIGNS.forEach((sign, idx) => {
      const startRad = (idx * 30 * Math.PI) / 180;
      const spokeGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(Math.cos(startRad) * 2.5, 0, Math.sin(startRad) * 2.5),
        new THREE.Vector3(Math.cos(startRad) * 10.6, 0, Math.sin(startRad) * 10.6),
      ]);
      scene.add(new THREE.Line(spokeGeo, spokeMat));
      disposables.push(spokeGeo);

      // Constellation triangle/arc in 3D sky band outside zodiac ring
      const midRad = ((idx * 30 + 15) * Math.PI) / 180;
      const pts = [
        new THREE.Vector3(Math.cos(midRad - 0.14) * 11.4, 0.8 + (idx % 3) * 0.4, Math.sin(midRad - 0.14) * 11.4),
        new THREE.Vector3(Math.cos(midRad) * 12.2, 1.5 - (idx % 2) * 0.5, Math.sin(midRad) * 12.2),
        new THREE.Vector3(Math.cos(midRad + 0.14) * 11.6, 0.5 + ((idx + 1) % 3) * 0.4, Math.sin(midRad + 0.14) * 11.6),
      ];
      pts.forEach((pt) => {
        const star = new THREE.Mesh(constStarGeo, constStarMat);
        star.position.copy(pt);
        star.userData = {
          info: `Zodiac Constellation: ${sign.name} (${sign.sanskritName}) · Element: ${sign.element} · Ruler: ${sign.ruler}`,
        };
        scene.add(star);
      });
      const constGeo = new THREE.BufferGeometry().setFromPoints(pts);
      scene.add(new THREE.Line(constGeo, constLineMat));
      disposables.push(constGeo);

      // Highlight Lagna sign marker
      if (idx === lagnaSignIndex) {
        const lagnaGeo = new THREE.OctahedronGeometry(0.32, 0);
        const lagnaMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0x92400e });
        const lagnaMarker = new THREE.Mesh(lagnaGeo, lagnaMat);
        lagnaMarker.position.set(Math.cos(midRad) * 10, 0.65, Math.sin(midRad) * 10);
        lagnaMarker.userData = { info: `Ascendant (Lagna) Rashi: ${sign.name} (${sign.sanskritName})` };
        scene.add(lagnaMarker);
        disposables.push(lagnaGeo, lagnaMat);
      }
    });

    // 27 Nakshatra outer dotted ring
    const nakGroup = new THREE.Group();
    const nakDotGeo = new THREE.SphereGeometry(0.08, 6, 6);
    const nakDotMat = new THREE.MeshBasicMaterial({ color: 0xd4af37 });
    disposables.push(nakDotGeo, nakDotMat);
    for (let n = 0; n < 27; n++) {
      const a = ((n * (360 / 27)) * Math.PI) / 180;
      const dot = new THREE.Mesh(nakDotGeo, nakDotMat);
      dot.position.set(Math.cos(a) * 10.4, 0, Math.sin(a) * 10.4);
      nakGroup.add(dot);
    }
    nakGroup.visible = showNakshatras;
    nakGroupRef.current = nakGroup;
    scene.add(nakGroup);

    // 9 Planets placed at true Sidereal Longitude
    const clickableMeshes: THREE.Mesh[] = [];
    planets.forEach((p, idx) => {
      const radius = 3.2 + idx * 0.62;
      const orbitGeo = new THREE.RingGeometry(radius - 0.018, radius + 0.018, isSoftwareGl ? 48 : 96);
      const orbitMat = new THREE.MeshBasicMaterial({
        color: 0x94a3b8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.22,
      });
      const orbit = new THREE.Mesh(orbitGeo, orbitMat);
      orbit.rotation.x = Math.PI / 2;
      scene.add(orbit);
      disposables.push(orbitGeo, orbitMat);

      const angleRad = (p.longitude * Math.PI) / 180;
      const pSize = p.id === 'Sun' || p.id === 'Jupiter' ? 0.42 : 0.3;
      const pGeo = new THREE.SphereGeometry(pSize, isSoftwareGl ? 14 : 24, isSoftwareGl ? 10 : 18);
      const pColor = PLANET_COLORS[p.id] ?? 0xfbbf24;
      const pMat = new THREE.MeshStandardMaterial({
        color: pColor,
        metalness: 0.35,
        roughness: 0.28,
        emissive: p.id === 'Sun' ? 0xb45309 : 0x000000,
      });
      const mesh = new THREE.Mesh(pGeo, pMat);
      mesh.position.set(
        Math.cos(angleRad) * radius,
        Math.sin((p.latitude * Math.PI) / 180) * 1.4,
        Math.sin(angleRad) * radius
      );
      mesh.userData = {
        info: `${p.id}: ${p.signName} ${p.dms} · ${p.nakshatraName} Pada ${p.pada} · House ${p.house} (${p.dignity})`,
      };
      scene.add(mesh);
      clickableMeshes.push(mesh);
      disposables.push(pGeo, pMat);
    });

    // Raycaster picking
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const onPointerDown = (ev: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(clickableMeshes, false);
      if (hits.length > 0 && hits[0].object.userData.info) {
        setSelectedInfo(String(hits[0].object.userData.info));
      }
    };
    renderer.domElement.addEventListener('pointerdown', onPointerDown);

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 720;
      const h = container.clientHeight || 420;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    let rafId = 0;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      controls.dispose();
      disposables.forEach((d) => d.dispose());
      envTarget.dispose();
      pmrem.dispose();
      renderer.dispose();
    };
  }, [planets, lagnaSignIndex]);

  const handleResetView = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 12, 18);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  return (
    <div className="relative rounded-xl overflow-hidden border border-[#C59326]/30 bg-[#091229] shadow-sm">
      <div ref={mountRef} className="w-full h-[420px] cursor-grab active:cursor-grabbing" />
      <div className="px-4 py-2.5 bg-[#070E20]/95 border-t border-[#C59326]/25 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-200">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate">{selectedInfo}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setAutoRotate((v) => !v)}
            className={`px-2.5 py-1 rounded border text-[11px] font-medium cursor-pointer ${
              autoRotate
                ? 'border-amber-400/60 bg-amber-500/20 text-amber-200'
                : 'border-slate-700 text-slate-300'
            }`}
          >
            {autoRotate ? 'Auto-Rotate On' : 'Auto-Rotate Off'}
          </button>
          <button
            type="button"
            onClick={() => setShowNakshatras((v) => !v)}
            className="px-2.5 py-1 rounded border border-slate-700 hover:border-amber-400/50 text-[11px] font-medium text-slate-200 cursor-pointer"
          >
            {showNakshatras ? 'Hide 27 Stars' : 'Show 27 Stars'}
          </button>
          <button
            type="button"
            onClick={handleResetView}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-700 hover:border-amber-400/50 text-[11px] font-medium text-slate-200 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
