import React from 'react'
import styles from './Home.css'
import * as THREE from 'three'
import * as CANNON from 'cannon'
import OrbitControls from 'orbit-controls-es6'
import Stats from 'stats.js'
import dat from 'dat.gui'

// THREE
let scene, camera, renderer, controls

// CANNON
let world

// Mixed
let plane, box

// Stats.js
let stats

class Home extends React.Component {

  constructor(props) {
    super(props)

    this.gravity = -10

    this.canvas = React.createRef()
    this.animate = this.animate.bind(this)
  }

  componentDidMount() {

    // THREE

    renderer = new THREE.WebGLRenderer({antialias: true, canvas: this.canvas})
    renderer.setSize(innerWidth, innerHeight)
    renderer.setPixelRatio(devicePixelRatio)

    scene = new THREE.Scene()
    
    camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 1, 1000)
    camera.position.y = 15
    camera.position.z = 40

    controls = new OrbitControls(camera, renderer.domElement)
    controls.minDistance = 0
    controls.maxDistance = 1000

    const grid = new THREE.GridHelper(100, 20)
    scene.add(grid)

    const pointLight = new THREE.PointLight(0xffffff, 1, 100)
    pointLight.position.set(0, 10, 0)
    scene.add(pointLight)

    const ambientLight = new THREE.AmbientLight(0xffffff, .7)
    scene.add(ambientLight)

    const axesHelper = new THREE.AxesHelper(5)
    scene.add(axesHelper)

    const planeMaterial = new THREE.MeshStandardMaterial({
      color: 0xcecece, 
      side: THREE.DoubleSide
    })
    const boxMaterial = new THREE.MeshStandardMaterial({color: 0x6fd7ff, side: THREE.DoubleSide})

    const planeGeometry = new THREE.PlaneGeometry(20, 20)
    const boxGeometry = new THREE.BoxGeometry(2, 2, 2)

    plane = new THREE.Mesh(planeGeometry, planeMaterial)
    box = new THREE.Mesh(boxGeometry, boxMaterial)

    plane.rotation.x = Math.PI / 2
    plane.position.y = 0

    scene.add(plane)
    scene.add(box)

    // CANNON

    world = new CANNON.World()
    world.broadphase = new CANNON.NaiveBroadphase()
    world.gravity.set(0, this.gravity, 0)

    plane.body = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Plane()
    })

    plane.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)

    world.add(plane.body)

    box.body = new CANNON.Body({
      mass: 1,
      shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1)),
      position: new CANNON.Vec3(0, 4, 0)
    })

    world.add(box.body)

    // Stats.js
    stats = new Stats()
    document.body.appendChild(stats.domElement)

    // Dat.gui

    const gui = new dat.GUI()
    gui.add(this, 'gravity', -10, 10)

    this.animate()
  }

  animate() {
    requestAnimationFrame(this.animate)

    stats.begin()

    this.update()
    renderer.render(scene, camera)

    stats.end()
  }

  update() {
    world.gravity.set(0, this.gravity, 0)

    box.position.copy(box.body.position)
    box.quaternion.copy(box.body.quaternion)

    plane.position.copy(plane.body.position)
    plane.quaternion.copy(plane.body.quaternion)

    world.step(1/60)

    controls.update()
  }

  render() {
    return (
      <div className={styles.container}>
        <canvas ref={el => { this.canvas = el }}/>
      </div>
    )
  }
}

export default Home;