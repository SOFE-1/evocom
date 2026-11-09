import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import type { Product } from '../types'

type Kind = 'bullet' | 'ptz' | 'dome' | 'mini' | 'turret' | 'multi'

function kindOf(product: Product): Kind {
  const category = product.category.toLowerCase()
  if (product.slug.includes('mini')) return 'mini'
  if (category.includes('bullet')) return 'bullet'
  if (category.includes('ptz')) return 'ptz'
  if (category.includes('turret')) return 'turret'
  if (category.includes('multi')) return 'multi'
  return 'dome'
}

function housing() {
  return new THREE.MeshStandardMaterial({ color: 0xf5f7fb, metalness: 0.22, roughness: 0.36 })
}

function dark() {
  return new THREE.MeshStandardMaterial({ color: 0x151c27, metalness: 0.62, roughness: 0.28 })
}

function lensMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: 0x07131c,
    metalness: 0.2,
    roughness: 0.05,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
  })
}

function glass() {
  return new THREE.MeshPhysicalMaterial({
    color: 0xe8f2ff,
    metalness: 0,
    roughness: 0.05,
    transmission: 0.88,
    thickness: 0.4,
    ior: 1.45,
    transparent: true,
  })
}

function metal() {
  return new THREE.MeshStandardMaterial({ color: 0x8d97a6, metalness: 0.88, roughness: 0.26 })
}

function mesh(
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  position?: [number, number, number],
  rotation?: [number, number, number],
) {
  const item = new THREE.Mesh(geometry, material)
  item.castShadow = true
  item.receiveShadow = true
  if (position) item.position.set(position[0], position[1], position[2])
  if (rotation) item.rotation.set(rotation[0], rotation[1], rotation[2])
  return item
}

function seat(group: THREE.Group) {
  const box = new THREE.Box3().setFromObject(group)
  const center = box.getCenter(new THREE.Vector3())
  group.position.x -= center.x
  group.position.z -= center.z
  group.position.y -= box.min.y
  return group
}

function buildBullet() {
  const group = new THREE.Group()
  const white = housing()
  const black = dark()
  const optic = lensMaterial()
  const bracket = metal()
  group.add(mesh(new THREE.BoxGeometry(0.52, 0.72, 0.08), bracket, [0, 0.36, -1.2]))
  group.add(mesh(new THREE.BoxGeometry(0.14, 0.14, 0.62), bracket, [0, 0.28, -0.86]))
  group.add(mesh(new THREE.CylinderGeometry(0.36, 0.4, 1.35, 48), white, [0, 0.42, 0.02], [Math.PI / 2, 0, 0]))
  group.add(mesh(new THREE.CylinderGeometry(0.37, 0.37, 0.08, 48), black, [0, 0.42, 0.72], [Math.PI / 2, 0, 0]))
  group.add(mesh(new THREE.CylinderGeometry(0.15, 0.18, 0.14, 32), optic, [0, 0.42, 0.8], [Math.PI / 2, 0, 0]))
  group.add(mesh(new THREE.BoxGeometry(0.86, 0.07, 0.9), white, [0, 0.84, 0.62]))
  group.add(mesh(new THREE.BoxGeometry(0.07, 0.28, 0.72), white, [-0.4, 0.68, 0.7]))
  group.add(mesh(new THREE.BoxGeometry(0.07, 0.28, 0.72), white, [0.4, 0.68, 0.7]))
  const led = new THREE.MeshStandardMaterial({ color: 0xb9dcff, emissive: 0x2563eb, emissiveIntensity: 0.55 })
  for (let index = 0; index < 8; index += 1) {
    const angle = (index / 8) * Math.PI * 2
    const dot = mesh(new THREE.SphereGeometry(0.032, 12, 12), led)
    dot.position.set(Math.cos(angle) * 0.26, 0.42 + Math.sin(angle) * 0.26, 0.77)
    group.add(dot)
  }
  return seat(group)
}

function buildDome(scale: number) {
  const group = new THREE.Group()
  const white = housing()
  const black = dark()
  group.add(mesh(new THREE.CylinderGeometry(0.95 * scale, 1.05 * scale, 0.16 * scale, 48), white, [0, 0.08 * scale, 0]))
  group.add(mesh(new THREE.CylinderGeometry(0.7 * scale, 0.7 * scale, 0.1 * scale, 40), black, [0, 0.18 * scale, 0]))
  group.add(mesh(new THREE.SphereGeometry(0.4 * scale, 32, 24), black, [0, 0.46 * scale, 0]))
  group.add(mesh(new THREE.SphereGeometry(0.11 * scale, 20, 16), lensMaterial(), [0, 0.5 * scale, 0.32 * scale]))
  group.add(
    mesh(
      new THREE.SphereGeometry(0.76 * scale, 48, 32, 0, Math.PI * 2, 0, Math.PI / 2),
      glass(),
      [0, 0.2 * scale, 0],
    ),
  )
  return seat(group)
}

function buildPtz() {
  const group = new THREE.Group()
  const white = housing()
  const black = dark()
  group.add(mesh(new THREE.CylinderGeometry(0.55, 0.72, 0.16, 40), metal(), [0, 0.08, 0]))
  group.add(mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.32, 24), black, [0, 0.3, 0]))
  group.add(mesh(new THREE.SphereGeometry(0.62, 48, 32), white, [0, 0.86, 0]))
  group.add(mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.48, 28), black, [0, 0.78, 0.52], [Math.PI / 2, 0, 0]))
  group.add(mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.08, 24), lensMaterial(), [0, 0.78, 0.78], [Math.PI / 2, 0, 0]))
  return seat(group)
}

function buildTurret() {
  const group = new THREE.Group()
  const white = housing()
  const black = dark()
  group.add(mesh(new THREE.CylinderGeometry(0.58, 0.86, 0.26, 48), white, [0, 0.13, 0]))
  group.add(mesh(new THREE.SphereGeometry(0.56, 48, 32), white, [0, 0.55, 0]))
  group.add(mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.08, 32), black, [0, 0.58, 0.5], [Math.PI / 2, 0, 0]))
  group.add(mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.08, 24), lensMaterial(), [0, 0.58, 0.56], [Math.PI / 2, 0, 0]))
  return seat(group)
}

function buildMulti() {
  const group = new THREE.Group()
  const white = housing()
  const black = dark()
  const optic = lensMaterial()
  group.add(mesh(new THREE.BoxGeometry(0.4, 0.12, 0.55), metal(), [0, 0.06, -0.2]))
  group.add(mesh(new THREE.BoxGeometry(2.35, 0.4, 0.52), white, [0, 0.4, 0.12]))
  group.add(mesh(new THREE.BoxGeometry(2.1, 0.26, 0.06), black, [0, 0.4, 0.4]))
  for (const x of [-0.78, -0.26, 0.26, 0.78]) {
    group.add(mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.1, 24), optic, [x, 0.4, 0.46], [Math.PI / 2, 0, 0]))
  }
  return seat(group)
}

function buildModel(kind: Kind) {
  if (kind === 'bullet') return buildBullet()
  if (kind === 'ptz') return buildPtz()
  if (kind === 'turret') return buildTurret()
  if (kind === 'multi') return buildMulti()
  if (kind === 'mini') return buildDome(0.82)
  return buildDome(1)
}

export function ProductViewer({ product }: { product: Product }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const parent = canvas?.parentElement
    if (!canvas || !parent) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    } catch {
      setFailed(true)
      return
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05
    renderer.setClearColor(0x000000, 0)

    const scene = new THREE.Scene()
    const pmrem = new THREE.PMREMGenerator(renderer)
    const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = environment

    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 40)
    camera.position.set(2.5, 1.45, 3.15)

    const model = buildModel(kindOf(product))
    scene.add(model)

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(2.6, 64),
      new THREE.MeshStandardMaterial({ color: 0xe6edf6, roughness: 0.92, metalness: 0 }),
    )
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(1.7, 1.78, 72),
      new THREE.MeshBasicMaterial({ color: 0xc5d2e4, side: THREE.DoubleSide }),
    )
    ring.rotation.x = -Math.PI / 2
    ring.position.y = 0.004
    scene.add(ring)

    const key = new THREE.DirectionalLight(0xffffff, 2.4)
    key.position.set(3.2, 5.4, 2.2)
    key.castShadow = true
    key.shadow.mapSize.set(1024, 1024)
    scene.add(key)
    const fill = new THREE.DirectionalLight(0xd7e4ff, 0.7)
    fill.position.set(-3.2, 2.2, -1.6)
    scene.add(fill)
    scene.add(new THREE.AmbientLight(0xffffff, 0.35))

    const controls = new OrbitControls(camera, canvas)
    controls.target.set(0, 0.48, 0)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.autoRotate = true
    controls.autoRotateSpeed = 1.15
    controls.minDistance = 1.7
    controls.maxDistance = 7
    controls.maxPolarAngle = Math.PI / 2.02
    controls.enablePan = false
    controls.addEventListener('start', () => {
      controls.autoRotate = false
    })
    controls.update()
    controls.saveState()
    controlsRef.current = controls

    const resize = () => {
      const width = parent.clientWidth
      const height = parent.clientHeight
      if (width === 0 || height === 0) return
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(parent)

    renderer.setAnimationLoop(() => {
      controls.update()
      renderer.render(scene, camera)
    })

    return () => {
      renderer.setAnimationLoop(null)
      observer.disconnect()
      controls.dispose()
      controlsRef.current = null
      const materials = new Set<THREE.Material>()
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()
          const list = Array.isArray(object.material) ? object.material : [object.material]
          list.forEach((material) => materials.add(material))
        }
      })
      materials.forEach((material) => material.dispose())
      environment.dispose()
      pmrem.dispose()
      renderer.dispose()
    }
  }, [product])

  function resetView() {
    const controls = controlsRef.current
    if (!controls) return
    controls.reset()
    controls.autoRotate = true
  }

  if (failed) {
    return <p className="grid aspect-[4/3] place-items-center px-6 text-sm text-muted">This browser cannot show the 3D view.</p>
  }

  return (
    <div className="relative aspect-[4/3] w-full bg-[radial-gradient(circle_at_50%_40%,#ffffff,#e7eef8_72%)]">
      <canvas
        ref={canvasRef}
        className="h-full w-full cursor-grab touch-none active:cursor-grabbing"
        aria-label={`3D view of ${product.name}. Drag to rotate and scroll to zoom.`}
      />
      <p className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-ink shadow-sm">
        Drag to rotate · Scroll to zoom
      </p>
      <button
        type="button"
        onClick={resetView}
        className="absolute top-3 right-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-ink shadow-sm hover:bg-white"
      >
        Reset view
      </button>
    </div>
  )
}
