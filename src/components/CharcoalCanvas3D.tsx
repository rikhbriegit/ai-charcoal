import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion } from 'motion/react';
import { Flame, RotateCw, Sparkles, Eye, X } from 'lucide-react';

type CharcoalShape = 'hexagonal' | 'pillow' | 'natural';

interface CharcoalCanvas3DProps {
  onClose?: () => void;
}

export function CharcoalCanvas3D({ onClose }: CharcoalCanvas3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [shape, setShape] = useState<CharcoalShape>('hexagonal');
  const [heat, setHeat] = useState<number>(0.65); // 0.0 to 1.0 heat slider
  const [isAutoSpin, setIsAutoSpin] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'control' | 'info'>('control');

  // Keep state refs for use in the Three.js animation loop without re-instantiating
  const shapeRef = useRef<CharcoalShape>(shape);
  const heatRef = useRef<number>(heat);
  const spinRef = useRef<boolean>(isAutoSpin);

  useEffect(() => {
    shapeRef.current = shape;
  }, [shape]);

  useEffect(() => {
    heatRef.current = heat;
  }, [heat]);

  useEffect(() => {
    spinRef.current = isAutoSpin;
  }, [isAutoSpin]);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- SETUP SCENE, CAMERA & RENDERER ---
    const container = mountRef.current;
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 450;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xfafafa, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.5, 4.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // --- LIGHTS ---
    // Ambient light - low deep orange-tint ambient
    const ambientLight = new THREE.AmbientLight(0x1a0a05, 0.6);
    scene.add(ambientLight);

    // Studio Key Light - subtle orange/amber from top right
    const keyLight = new THREE.DirectionalLight(0xff7722, 1.2);
    keyLight.position.set(5, 5, 3);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Fill Light - cold dark blue from opposite side for premium contrast
    const fillLight = new THREE.DirectionalLight(0x3366ff, 0.5);
    fillLight.position.set(-4, -2, -2);
    scene.add(fillLight);

    // Core Ember Emissive Point Light (gets updated inside core loop)
    const emberLight = new THREE.PointLight(0xff3300, 4, 10);
    emberLight.position.set(0, 0, 0);
    scene.add(emberLight);

    // --- PROCEDURAL GEOMETRIES ---

    // 1. Hexagonal Briquette with a central hollow channel
    const createHexagonalGeometry = () => {
      const hexShape = new THREE.Shape();
      const radius = 0.85;
      const segments = 6;
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (i === 0) hexShape.moveTo(x, y);
        else hexShape.lineTo(x, y);
      }
      hexShape.closePath();

      // Add central core circle cutout (oxygen hollow tube)
      const holePath = new THREE.Path();
      holePath.absarc(0, 0, 0.22, 0, Math.PI * 2, true);
      hexShape.holes.push(holePath);

      const extrudeSettings = {
        depth: 2.2,
        bevelEnabled: true,
        bevelSegments: 4,
        steps: 1,
        bevelSize: 0.04,
        bevelThickness: 0.04,
      };
      
      const geom = new THREE.ExtrudeGeometry(hexShape, extrudeSettings);
      geom.center();
      // Rotate to vertical profile
      geom.rotateX(Math.PI / 2);

      // Add some subtle organic vertex wrinkling for realistic charcoal fracture lines
      const pos = geom.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let x = pos.getX(i);
        let y = pos.getY(i);
        let z = pos.getZ(i);

        // Displace outer shell to avoid flat clinical computer angles
        const d = Math.sqrt(x*x + z*z);
        if (d > 0.3) {
          const noise = Math.sin(y * 8) * Math.cos(x * 5) * 0.025;
          x += (x / d) * noise;
          z += (z / d) * noise;
        }
        pos.setXYZ(i, x, y, z);
      }
      geom.computeVertexNormals();
      return geom;
    };

    // 2. BBQ Pillow Briquette (rounded cushion/brick)
    const createPillowGeometry = () => {
      const geom = new THREE.BoxGeometry(1.6, 1.0, 1.6, 12, 12, 12);
      const pos = geom.attributes.position;
      
      for (let i = 0; i < pos.count; i++) {
        let x = pos.getX(i);
        let y = pos.getY(i);
        let z = pos.getZ(i);

        // Pull coordinates inward around outer boundaries to simulate rounded compressed charcoal dust cushion
        const length = Math.sqrt(x*x + y*y + z*z);
        const shrinkFactor = 1.0 - (y*y * 0.25) - ((x*x + z*z) * 0.15);
        
        // Add tiny localized surface ruggedness/crater bumps
        const bumpyNoise = (Math.sin(x * 12) * Math.cos(z * 12) + Math.sin(y * 15)) * 0.02;

        pos.setXYZ(
          i, 
          x * shrinkFactor + bumpyNoise * (x / length), 
          y * shrinkFactor + bumpyNoise * (y / length), 
          z * shrinkFactor + bumpyNoise * (z / length)
        );
      }
      geom.computeVertexNormals();
      return geom;
    };

    // 3. Natural Hardwood Lump (highly rough, fractured, organic geometry)
    const createNaturalGeometry = () => {
      const geom = new THREE.IcosahedronGeometry(1.0, 3);
      const pos = geom.attributes.position;
      
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const z = pos.getZ(i);

        // Rich multifaceted displacement noise
        const n1 = Math.sin(x * 3.5) * Math.cos(y * 3.5) * Math.sin(z * 3.5) * 0.15;
        const n2 = Math.sin(x * 7.0 + y * 4.0) * Math.cos(z * 8.0) * 0.05;
        const n3 = (Math.sin(y * 2.0) > 0 ? y * 0.15 : y * -0.05); // slightly elongated vertical trunk format

        pos.setXYZ(
          i,
          x * (1.0 + n1 + n2) * 1.0,
          y * (1.0 + n1 + n2) * 1.35 + n3,
          z * (1.0 + n1 + n2) * 0.9
        );
      }
      geom.computeVertexNormals();
      return geom;
    };

    // --- MATERIALS & MESH SETUP ---
    // Deep Matte Rugged Charcoal Material
    const charcoalMaterial = new THREE.MeshStandardMaterial({
      color: 0x0c0c0e,
      roughness: 0.94,
      metalness: 0.18,
      flatShading: true,
      emissive: 0x220500, // base constant glow representing deep oxygen-starved embers
      emissiveIntensity: 1.0,
    });

    // Outer mesh holder
    const charcoalGroup = new THREE.Group();
    scene.add(charcoalGroup);

    let activeGeom: THREE.BufferGeometry;
    let charcoalMesh: THREE.Mesh;

    // Core Glowing Ring inside the hex core, or deep core spheres simulating burning lava cracks
    let glowingCoreMesh: THREE.Mesh | null = null;
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0xff4500,
      side: THREE.BackSide,
    });

    const updateMeshShape = (targetShape: CharcoalShape) => {
      if (charcoalMesh) {
        charcoalGroup.remove(charcoalMesh);
        charcoalMesh.geometry.dispose();
      }
      if (glowingCoreMesh) {
        charcoalGroup.remove(glowingCoreMesh);
        glowingCoreMesh.geometry.dispose();
        glowingCoreMesh = null;
      }

      if (targetShape === 'hexagonal') {
        activeGeom = createHexagonalGeometry();
        charcoalMesh = new THREE.Mesh(activeGeom, charcoalMaterial);
        charcoalMesh.castShadow = true;
        charcoalMesh.receiveShadow = true;
        charcoalGroup.add(charcoalMesh);

        // Core central supercharged red-hot cylinder
        const coreGeom = new THREE.CylinderGeometry(0.2, 0.2, 2.1, 8, 1, true);
        glowingCoreMesh = new THREE.Mesh(coreGeom, coreMaterial);
        charcoalGroup.add(glowingCoreMesh);
        
      } else if (targetShape === 'pillow') {
        activeGeom = createPillowGeometry();
        charcoalMesh = new THREE.Mesh(activeGeom, charcoalMaterial);
        charcoalMesh.castShadow = true;
        charcoalMesh.receiveShadow = true;
        charcoalGroup.add(charcoalMesh);

        // Glowing core lines representing structural split cracks
        const splitGeom = new THREE.TorusGeometry(0.4, 0.05, 8, 24);
        splitGeom.rotateX(Math.PI / 4);
        glowingCoreMesh = new THREE.Mesh(splitGeom, coreMaterial);
        glowingCoreMesh.position.set(0, 0, 0);
        charcoalGroup.add(glowingCoreMesh);

      } else {
        activeGeom = createNaturalGeometry();
        charcoalMesh = new THREE.Mesh(activeGeom, charcoalMaterial);
        charcoalMesh.castShadow = true;
        charcoalMesh.receiveShadow = true;
        charcoalGroup.add(charcoalMesh);

        // For lump, place 2 tiny inner glowing burning ember pockets
        const clusterGeom = new THREE.DodecahedronGeometry(0.3, 0);
        glowingCoreMesh = new THREE.Mesh(clusterGeom, coreMaterial);
        glowingCoreMesh.position.set(0.1, -0.2, 0.1);
        charcoalGroup.add(glowingCoreMesh);
      }
    };

    updateMeshShape(shapeRef.current);

    // --- 3D DEFORMING VOLUMETRIC FLAME CORE ---
    // Physical glowing flame cones that deform organically in real-time to simulate licking fire tongues
    const flameGroup = new THREE.Group();
    scene.add(flameGroup);

    const flameCount = 2;
    const flameMeshes: THREE.Mesh[] = [];
    const flameGeometries: THREE.ConeGeometry[] = [];
    const originalFlamePositions: THREE.BufferAttribute[] = [];
    const flameColors = [0xff4500, 0xffa500];
    const flameRadii = [0.38, 0.22];
    const flameHeights = [1.4, 0.95];
    const flameOpacities = [0.4, 0.65];
    const flameSpeeds = [1.4, 2.2];

    for (let k = 0; k < flameCount; k++) {
      const fGeom = new THREE.ConeGeometry(flameRadii[k], flameHeights[k], 16, 16, true);
      // Shift geometry origin so scaling, twisting, and tilting pivots layout naturally from the charcoal surface
      fGeom.translate(0, flameHeights[k] / 2, 0); 
      
      const fMat = new THREE.MeshBasicMaterial({
        color: flameColors[k],
        transparent: true,
        opacity: flameOpacities[k],
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      });

      const fMesh = new THREE.Mesh(fGeom, fMat);
      // Place at scene center
      fMesh.position.set(0, -0.4, 0);
      flameGroup.add(fMesh);
      flameMeshes.push(fMesh);
      flameGeometries.push(fGeom);
      originalFlamePositions.push(fGeom.attributes.position.clone() as THREE.BufferAttribute);
    }

    // --- DENSE FLUID-LIKE FIRE PARTICLES ---
    // Creates high-density rising heat plasma directly rising from the charcoal piece
    const fireParticleCount = 90;
    const fireGeom = new THREE.BufferGeometry();
    const firePositions = new Float32Array(fireParticleCount * 3);
    const fireAges = new Float32Array(fireParticleCount);
    const fireLifes = new Float32Array(fireParticleCount);
    const fireSpeedsArray = new Float32Array(fireParticleCount * 3);

    for (let i = 0; i < fireParticleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.05 + Math.random() * 0.4;
      firePositions[i * 3] = Math.cos(angle) * radius;
      firePositions[i * 3 + 1] = -0.4 + Math.random() * 1.2;
      firePositions[i * 3 + 2] = Math.sin(angle) * radius;

      fireAges[i] = Math.random();
      fireLifes[i] = 0.8 + Math.random() * 1.4;

      fireSpeedsArray[i * 3] = (Math.random() - 0.5) * 0.18;      // X drifts
      fireSpeedsArray[i * 3 + 1] = 0.5 + Math.random() * 0.7;    // Y rise
      fireSpeedsArray[i * 3 + 2] = (Math.random() - 0.5) * 0.18;  // Z drifts
    }

    fireGeom.setAttribute('position', new THREE.BufferAttribute(firePositions, 3));

    // Custom high-quality glowing puff/plasma fire texture
    const buildFireTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, 32, 32);
        const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        // Rich high-fidelity thermal fire gradient: super white-hot core -> yellow -> hot orange -> faded red
        grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
        grad.addColorStop(0.25, 'rgba(253, 224, 71, 0.85)'); 
        grad.addColorStop(0.55, 'rgba(249, 115, 22, 0.45)');  
        grad.addColorStop(0.85, 'rgba(239, 68, 68, 0.12)');  
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(16, 16, 16, 0, Math.PI * 2);
        ctx.fill();
      }
      return new THREE.CanvasTexture(canvas);
    };

    const fireMaterial = new THREE.PointsMaterial({
      size: 0.18,
      map: buildFireTexture(),
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });

    const fireParticles = new THREE.Points(fireGeom, fireMaterial);
    scene.add(fireParticles);

    // --- POPPING CONVECTION SPARKS ---
    // Elegant tiny sparks that shoot off and float away chaotically on thermal chimneys
    const sparkCount = 85;
    const sparkGeom = new THREE.BufferGeometry();
    const sparkPositions = new Float32Array(sparkCount * 3);
    const sparkSpeedsArray = new Float32Array(sparkCount * 3);
    const sparkAges = new Float32Array(sparkCount);
    const sparkLifes = new Float32Array(sparkCount);

    for (let i = 0; i < sparkCount; i++) {
      sparkPositions[i * 3] = (Math.random() - 0.5) * 1.3;
      sparkPositions[i * 3 + 1] = -0.5 + Math.random() * 2.4;
      sparkPositions[i * 3 + 2] = (Math.random() - 0.5) * 1.3;

      sparkSpeedsArray[i * 3] = (Math.random() - 0.5) * 0.45;     // drifting breeze
      sparkSpeedsArray[i * 3 + 1] = 0.95 + Math.random() * 1.35;  // fast pop upwards
      sparkSpeedsArray[i * 3 + 2] = (Math.random() - 0.5) * 0.45;

      sparkAges[i] = Math.random();
      sparkLifes[i] = 0.6 + Math.random() * 0.9;
    }

    sparkGeom.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));

    const buildSparkTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, 16, 16);
        const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
        grad.addColorStop(0, 'rgba(255, 244, 180, 1.0)'); // white hot core
        grad.addColorStop(0.35, 'rgba(249, 115, 22, 0.9)'); // bright orange outer
        grad.addColorStop(0.75, 'rgba(185, 28, 28, 0.25)'); // smoke red halo
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(8, 8, 8, 0, Math.PI * 2);
        ctx.fill();
      }
      return new THREE.CanvasTexture(canvas);
    };

    const sparkMaterial = new THREE.PointsMaterial({
      size: 0.05,
      map: buildSparkTexture(),
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });

    const sparkParticles = new THREE.Points(sparkGeom, sparkMaterial);
    scene.add(sparkParticles);

    // --- INTERACTION & DRAGGING LOGIC ---
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotY = 0;
    let targetRotX = 0;

    const handlePointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      
      targetRotY += deltaX * 0.008;
      targetRotX += deltaY * 0.008;

      // Limit vertical rotation to prevent flipping upside down
      targetRotX = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, targetRotX));

      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const handlePointerUpOrLeave = () => {
      isDragging = false;
    };

    container.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUpOrLeave);

    // --- ZOOM HANDLE ON MOUSE WHEEL ---
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomAmount = e.deltaY * 0.002;
      camera.position.z = Math.max(2.8, Math.min(6.5, camera.position.z + zoomAmount));
    };
    container.addEventListener('wheel', handleWheel, { passive: false });

    // --- RESIZE OBSERVER ---
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const w = entry.contentRect.width || container.clientWidth;
        const h = entry.contentRect.height || container.clientHeight;
        
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    });
    resizeObserver.observe(container);

    // --- ANIMATION LOOP ---
    let animId = 0;
    let lastTime = 0;

    const animate = (time: number) => {
      animId = requestAnimationFrame(animate);

      const delta = Math.min((time - lastTime) * 0.001, 0.1);
      lastTime = time;

      // Check for shape swaps on-the-fly safely
      if (charcoalMesh && glowingCoreMesh) {
        const currentActiveShape = shapeRef.current;
        const currentMeshGeomName = 
          currentActiveShape === 'hexagonal' ? 'ExtrudeGeometry' :
          currentActiveShape === 'pillow' ? 'BoxGeometry' : 'IcosahedronGeometry';

        if (charcoalMesh.geometry.type !== currentMeshGeomName) {
          updateMeshShape(currentActiveShape);
        }
      }

      const activeHeat = heatRef.current;

      // Apply drag rotation or auto rotation
      if (spinRef.current && !isDragging) {
        targetRotY += 0.004; // auto rotate Y
      }

      // Smoothly interpolate rotations (LERP)
      charcoalGroup.rotation.y += (targetRotY - charcoalGroup.rotation.y) * 0.1;
      charcoalGroup.rotation.x += (targetRotX - charcoalGroup.rotation.x) * 0.1;

      // Modulate materials based on Heat intensity
      const tempR = Math.min(1.0, activeHeat * 1.5);
      const tempG = Math.max(0, Math.min(1.0, (activeHeat - 0.3) * 1.4));
      const tempB = Math.max(0, Math.min(1.0, (activeHeat - 0.75) * 3.0));

      // Update charcoal emissive material properties based on state variables
      charcoalMaterial.emissive.setRGB(activeHeat * 0.65, activeHeat * 0.14, 0.0);
      charcoalMaterial.emissiveIntensity = 0.4 + activeHeat * 3.2;

      // Pulse rate corresponds to heat state
      const pulseSpeed = 1.0 + activeHeat * 3.5;
      const pulse = Math.sin(time * 0.002 * pulseSpeed) * 0.16 + 0.84;

      // Update inner core flame color
      coreMaterial.color.setRGB(tempR, tempG * 0.6, tempB * 0.1);
      if (glowingCoreMesh) {
        glowingCoreMesh.scale.setScalar(pulse * (0.95 + activeHeat * 0.25));
      }

      // Update light tracking center
      const flicker = 0.86 + Math.random() * 0.28;
      emberLight.color.setRGB(tempR, tempG * 0.5, tempB * 0.1);
      emberLight.intensity = activeHeat * 42.0 * pulse * flicker;

      // Update directional orange spotlight helper to flicker naturally
      keyLight.intensity = 0.75 + Math.random() * 0.15 + activeHeat * 1.1;

      // --- 1. VOLUMETRIC FLAME CONE ANIMATION ---
      const timeFactor = time * 0.0075;
      for (let k = 0; k < flameCount; k++) {
        const fMesh = flameMeshes[k];
        const fGeom = flameGeometries[k];
        const origPos = originalFlamePositions[k];
        const posAttr = fGeom.attributes.position as THREE.BufferAttribute;
        const posArr = posAttr.array as Float32Array;
        const origArr = origPos.array as Float32Array;

        // Scale and visibility react instantly to the heat slider
        fMesh.scale.set(activeHeat, activeHeat, activeHeat);
        (fMesh.material as THREE.MeshBasicMaterial).opacity = (flameOpacities[k] * (0.8 + Math.sin(time * 0.012 + k * 3) * 0.2)) * (activeHeat > 0.08 ? 1.0 : activeHeat * 11);

        if (activeHeat > 0.05) {
          fMesh.visible = true;
          for (let i = 0; i < posAttr.count; i++) {
            const idx = i * 3;
            const ox = origArr[idx];
            const oy = origArr[idx + 1];
            const oz = origArr[idx + 2];

            const heightPercent = oy / flameHeights[k];
            
            // Generate a natural rising thermal wind swaying motion (wider at the tips, anchored at the base)
            const waveX = Math.sin(oy * 4 - timeFactor * flameSpeeds[k] + k * 2) * 0.14 * heightPercent * activeHeat;
            const waveZ = Math.cos(oy * 3.5 - timeFactor * (flameSpeeds[k] * 1.15) - k * 3) * 0.14 * heightPercent * activeHeat;
            
            const shrink = 1.0 - (heightPercent * 0.3); // sharp taper at top

            posArr[idx] = ox * shrink + waveX;
            posArr[idx + 1] = oy * (1.0 + Math.sin(timeFactor * 1.8 + ox) * 0.05 * activeHeat);
            posArr[idx + 2] = oz * shrink + waveZ;
          }
          posAttr.needsUpdate = true;
          fGeom.computeVertexNormals();
        } else {
          fMesh.visible = false;
        }
      }

      // --- 2. DENSE FLUID FIRE PARTICLES ANIMATION ---
      const firePosAttr = fireParticles.geometry.attributes.position as THREE.BufferAttribute;
      const firePosArr = firePosAttr.array as Float32Array;

      for (let i = 0; i < fireParticleCount; i++) {
        const idx = i * 3;
        fireAges[i] += delta;

        // Particle vectors updated relative to heat
        firePosArr[idx] += fireSpeedsArray[idx] * delta * (1.0 + activeHeat);
        firePosArr[idx + 1] += fireSpeedsArray[idx + 1] * delta * (1.1 + activeHeat * 1.5);
        firePosArr[idx + 2] += fireSpeedsArray[idx + 2] * delta * (1.0 + activeHeat);

        // Fluid flame sway
        const swimSway = Math.sin(time * 0.005 + i) * 0.15 * (fireAges[i] / fireLifes[i]);
        firePosArr[idx] += swimSway * delta;

        // Hot recycle spawn if expired or heat is off
        if (fireAges[i] >= fireLifes[i] || activeHeat < 0.05) {
          fireAges[i] = 0;
          fireLifes[i] = 0.7 + Math.random() * 1.2;

          const spawnAngle = Math.random() * Math.PI * 2;
          const spawnRadius = 0.02 + Math.random() * 0.35;
          firePosArr[idx] = Math.cos(spawnAngle) * spawnRadius;
          firePosArr[idx + 1] = -0.4 + Math.random() * 0.4;
          firePosArr[idx + 2] = Math.sin(spawnAngle) * spawnRadius;

          fireSpeedsArray[idx] = (Math.random() - 0.5) * 0.22;
          fireSpeedsArray[idx + 1] = 0.6 + Math.random() * 0.85;
          fireSpeedsArray[idx + 2] = (Math.random() - 0.5) * 0.22;
        }
      }
      firePosAttr.needsUpdate = true;
      fireMaterial.size = 0.18 * activeHeat;
      fireMaterial.opacity = activeHeat > 0.1 ? 0.9 : activeHeat * 9;

      // --- 3. POPPING SPARKS ANIMATION ---
      const sparkPosAttr = sparkParticles.geometry.attributes.position as THREE.BufferAttribute;
      const sparkPosArr = sparkPosAttr.array as Float32Array;

      for (let i = 0; i < sparkCount; i++) {
        const idx = i * 3;
        sparkAges[i] += delta;

        // Faster snapping ascent with heat thermal lift
        sparkPosArr[idx] += sparkSpeedsArray[idx] * delta * (1.0 + activeHeat * 1.6);
        sparkPosArr[idx + 1] += sparkSpeedsArray[idx + 1] * delta * (1.3 + activeHeat * 2.2);
        sparkPosArr[idx + 2] += sparkSpeedsArray[idx + 2] * delta * (1.0 + activeHeat * 1.6);

        // Natural chaotic wind friction
        const windX = Math.sin(time * 0.012 + sparkPosArr[idx + 1] * 2.8) * 0.3;
        const windZ = Math.cos(time * 0.009 + sparkPosArr[idx + 1] * 2.2) * 0.3;
        sparkPosArr[idx] += windX * delta;
        sparkPosArr[idx + 2] += windZ * delta;

        // Reset if age expired, too high, or heat is off
        if (sparkAges[i] >= sparkLifes[i] || sparkPosArr[idx + 1] > 2.8 || activeHeat < 0.05) {
          sparkAges[i] = 0;
          sparkLifes[i] = 0.5 + Math.random() * 0.9;

          sparkPosArr[idx] = (Math.random() - 0.5) * 0.8;
          sparkPosArr[idx + 1] = -0.3 + Math.random() * 0.4;
          sparkPosArr[idx + 2] = (Math.random() - 0.5) * 0.8;

          sparkSpeedsArray[idx] = (Math.random() - 0.5) * 0.65;
          sparkSpeedsArray[idx + 1] = 1.1 + Math.random() * 1.9;
          sparkSpeedsArray[idx + 2] = (Math.random() - 0.5) * 0.65;
        }
      }
      sparkPosAttr.needsUpdate = true;
      sparkMaterial.size = 0.062 * (0.35 + activeHeat * 0.85);
      sparkMaterial.opacity = activeHeat > 0.08 ? 0.95 : activeHeat * 12;

      // Spin the particles slowly to represent thermal vortex whirlpools
      fireParticles.rotation.y += 0.003 * (0.5 + activeHeat);
      sparkParticles.rotation.y += 0.006 * (0.5 + activeHeat);

      // Render scene
      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    // --- CLEANUP DISPOSER ---
    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      
      container.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUpOrLeave);
      container.removeEventListener('wheel', handleWheel);

      // Recursive disposal of ThreeJS memories to maintain zero leakage
      scene.traverse((obj: any) => {
        if (!obj) return;
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((mat) => mat.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });

      fireMaterial.dispose();
      sparkMaterial.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="w-full h-full max-w-lg bg-white/95 backdrop-blur-lg rounded-3xl border border-zinc-200 p-4 flex flex-col justify-between overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.22)] relative group text-zinc-900">
      
      {/* Decorative futuristic corners */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-orange-500/30 rounded-tl-3xl pointer-events-none" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-orange-500/30 rounded-tr-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-orange-500/30 rounded-bl-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-orange-500/30 rounded-br-3xl pointer-events-none" />
 
      {/* Header Info Bar */}
      <div className="flex items-center justify-between z-10 border-b border-zinc-150 pb-3 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 bg-orange-600 rounded-full flex items-center justify-center animate-pulse">
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
          </div>
          <span className="text-[11px] font-mono tracking-widest text-zinc-500 font-extrabold uppercase">CHARCOAL 3D SIMULATOR</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
            <button
              onClick={() => setActiveTab('control')}
              className={`px-3 py-1 text-[10px] sm:text-xs font-bold rounded-md transition-all cursor-pointer ${
                activeTab === 'control' 
                  ? 'bg-orange-600 text-white shadow-[0_2px_10px_rgba(234,88,12,0.25)]' 
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Kontrol
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`px-3 py-1 text-[10px] sm:text-xs font-bold rounded-md transition-all cursor-pointer ${
                activeTab === 'info' 
                  ? 'bg-orange-600 text-white shadow-[0_2px_10px_rgba(234,88,12,0.25)]' 
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Sains Arang
            </button>
          </div>
 
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-md bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-500 hover:text-zinc-950 transition-all cursor-pointer"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
 
      {/* Three.js Canvas Container Panel */}
      <div className="relative flex-1 w-full h-[250px] sm:h-[280px] my-1 flex items-center justify-center cursor-grab active:cursor-grabbing">
        {/* Dynamic Canvas element mounted here */}
        <div ref={mountRef} className="w-full h-full" id="charcoal-canvas-3d" />
 
        {/* Drag Hint overlay */}
        <div className="absolute bottom-3 left-4 flex items-center gap-1.5 px-2.5 py-1 bg-white/75 rounded-full border border-zinc-200 pointer-events-none">
          <Eye className="w-3 h-3 text-orange-600" />
          <span className="text-[9px] font-mono font-bold text-zinc-600">TARIK mouse berkamera 360°</span>
        </div>
 
        {/* Heat Indicator floating pill */}
        <div className="absolute top-3 right-4 px-3 py-1 bg-white/85 rounded-lg border border-zinc-200 flex items-center gap-2 pointer-events-none">
          <Flame className={`w-3.5 h-3.5 ${heat > 0.7 ? 'text-orange-600 animate-bounce' : 'text-zinc-400'}`} />
          <span className="text-[10px] font-mono font-bold text-zinc-800 uppercase">
            {heat === 0 ? 'Mati' : heat < 0.4 ? 'Hangat' : heat < 0.85 ? 'Siap Bakar' : 'Bara Panas Ekstrim'}
          </span>
        </div>
 
        {/* Floating Sparks Visual Accents */}
        <div className="absolute top-1/4 left-1/4 pointer-events-none w-2 h-2 rounded-full bg-orange-500/20 blur-[1px] animate-ping" />
        <div className="absolute bottom-1/4 right-1/4 pointer-events-none w-1 h-3 rounded-full bg-yellow-500/30 blur-[2px] animate-pulse" />
      </div>
 
      {/* Tab Interface Area */}
      <div className="z-10 bg-zinc-50 rounded-2xl border border-zinc-200 p-3.5 min-h-[135px] flex flex-col justify-between text-zinc-900">
        {activeTab === 'control' ? (
          <div className="space-y-4">
            {/* Shape selection row */}
            <div>
              <span className="text-[10px] font-mono tracking-wider font-extrabold text-zinc-400 uppercase block mb-1.5">Bentuk Arang (Shape Selection)</span>
              <div className="grid grid-cols-3 gap-2">
                {(['hexagonal', 'pillow', 'natural'] as CharcoalShape[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setShape(t)}
                    className={`py-1.5 px-2 text-[10px] sm:text-xs font-black rounded-lg border transition-all flex items-center justify-center gap-1.5 select-none cursor-pointer ${
                      shape === t
                        ? 'border-orange-500 bg-orange-600/10 text-orange-600 shadow-[0_0_15px_rgba(234,88,12,0.08)]'
                        : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:text-zinc-900'
                    }`}
                  >
                    {t === 'hexagonal' ? 'Hexagonal Export' : t === 'pillow' ? 'BBQ Pillow' : 'Hardwood Lump'}
                  </button>
                ))}
              </div>
            </div>
 
            {/* Slider controls heat */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono tracking-wider font-extrabold text-zinc-400 uppercase flex items-center gap-1.5">
                  <Flame className="w-3 h-3 text-orange-600" /> Pengatur Suhu Bara & Api
                </span>
                <span className="text-[11px] font-mono font-black text-orange-600">{(heat * 100).toFixed(0)}%</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-zinc-400 font-semibold font-mono">Dingin</span>
                <input
                  type="range"
                  min="0"
                  max="1.0"
                  step="0.05"
                  value={heat}
                  onChange={(e) => setHeat(parseFloat(e.target.value))}
                  className="flex-1 accent-orange-600 h-1 bg-zinc-200 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-zinc-600 font-bold font-mono">Pembera</span>
              </div>
            </div>
 
            {/* Rotation toggle */}
            <div className="flex items-center justify-between border-t border-zinc-200 pt-2 pb-0.5">
              <span className="text-[10px] font-mono text-zinc-400 font-bold">Auto-rotating Presentation</span>
              <button
                onClick={() => setIsAutoSpin(!isAutoSpin)}
                className={`px-3 py-1 text-[10px] font-mono font-black rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                  isAutoSpin
                    ? 'bg-orange-50 text-orange-600 border border-orange-500/20'
                    : 'bg-zinc-100 text-zinc-400 border border-transparent'
                }`}
              >
                <RotateCw className={`w-2.5 h-2.5 ${isAutoSpin ? 'animate-spin' : ''}`} />
                {isAutoSpin ? 'Aktif' : 'Berhenti'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-left h-full flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold text-orange-600 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                Sains Kualitas Pembakaran
              </p>
              <p className="text-[11px] text-zinc-600 mt-1 sm:mt-1.5 font-light leading-relaxed">
                {shape === 'hexagonal' && 'Desain silinder berlubang di tengah (Hexagonal Core) menciptakan sirkulasi udara optimal (efek cerobong). Hal ini mendorong pasokan oksigen konstan yang menghasilkan pembakaran berdaya tahan tinggi (8+ jam) tanpa asap beracun.'}
                {shape === 'pillow' && 'Briket Pillow BBQ dipadatkan di bawah tekanan hidrolik tinggi untuk meningkatkan indeks densitas. Ideal untuk panggang santai keluarga dengan penyebaran radiasi panas berdaya tahan lama yang merata stabil.'}
                {shape === 'natural' && 'Hasil alami pecahan kayu keras pilihan tanpa bahan pengikat kimia. Memancarkan aroma kayu murni yang legendaris, menghasilkan suhu tinggi super cepat dengan tingkat residu abu yang sangat minim.'}
              </p>
            </div>
            
            <div className="border-t border-zinc-200 pt-1.5 flex items-center justify-between">
              <span className="text-[9px] font-mono font-bold text-zinc-400">RESIDU KECIL (ASH &lt; 2.5%)</span>
              <span className="text-[9px] font-mono font-bold text-orange-600">100% BAHAN ALAMI KELAPA</span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
