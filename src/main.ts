import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DObject, CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { cameraProjectionMatrix, color } from 'three/webgpu';


const canvasDiv = document.querySelector<HTMLDivElement>("#main-canvas") as HTMLDivElement
const canvas = canvasDiv.querySelector<HTMLCanvasElement>("canvas") as HTMLCanvasElement
const fovSlider = document.querySelector<HTMLInputElement>("#fov-slider")
const canvasInfo = document.querySelector<HTMLDivElement>("#main-canvas-info") as HTMLDivElement

console.log("canvasInfo", canvasInfo)

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, canvasDiv.offsetWidth / canvasDiv.offsetHeight, 0.1, 1000)
scene.background = new THREE.Color("rgb(120, 118, 122)")



fovSlider?.addEventListener("input", () => {
    camera.fov = Number(fovSlider.value);
    camera.updateProjectionMatrix();
})


// Doesn't work
// document.addEventListener("resize", () => { 
//     console.log("resize")
//     console.log(canvasDiv.offsetWidth / canvasDiv.offsetHeight)
//     console.log(canvasDiv.offsetWidth, canvasDiv.offsetHeight)
// })

const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})

renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(canvasDiv.offsetWidth, canvasDiv.offsetHeight)

const localStorageCamera = localStorage.getItem("camera")
if (localStorageCamera) {
    const cameraConfig = JSON.parse(localStorageCamera)
    console.log(cameraConfig)
    camera.position.setX(cameraConfig.position_x)
    camera.position.setY(cameraConfig.position_y)
    camera.position.setZ(cameraConfig.position_z)
    camera.rotation.x = cameraConfig.rotation_x
    camera.rotation.y = cameraConfig.rotation_y
    camera.rotation.z = cameraConfig.rotation_z
    // camera.rotation.set(cameraConfig.rotation_x, cameraConfig.rotation_y, cameraConfig.rotation_z)


} else {
    camera.position.setZ(20)
    camera.position.setY(50)
    camera.position.setX(20)
}

const controls = new OrbitControls(camera, renderer.domElement)

const axesHelper = new THREE.AxesHelper(100)
scene.add(axesHelper)

// const geometry = new THREE.TorusGeometry(10, 3, 16, 100)
// const material = new THREE.MeshBasicMaterial({ color: 'rgb(255, 20, 60)', wireframe: false })
// const torus = new THREE.Mesh(geometry, material)
// scene.add(torus)

function addMathPlane(vector3: THREE.Vector3, d: number) {
    const plane = new THREE.Plane(vector3, d)
    const helper = new THREE.PlaneHelper(plane, 100, 0xffff00);
    scene.add(helper);
}

// addPlane(new THREE.Vector3(1, 0, 0), 0)
// addPlane(new THREE.Vector3(0, 1, 0), 0)
// addPlane(new THREE.Vector3(0, 0, 1), 0)

function addPlane(position: THREE.Vector3, rotation: THREE.Vector3, color: THREE.ColorRepresentation) {

    const geometry = new THREE.PlaneGeometry(40, 40);
    const material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
    const plane = new THREE.Mesh(geometry, material);
    plane.position.setX(position.x)
    plane.position.setY(position.y)
    plane.position.setZ(position.z)

    plane.rotation.x = rotation.x
    plane.rotation.y = rotation.y
    plane.rotation.z = rotation.z

    scene.add(plane);
}



function addPoint(position: THREE.Vector3) {

    const geometry = new THREE.SphereGeometry(1)
    const material = new THREE.MeshBasicMaterial({ color: 'black', side: THREE.DoubleSide });
    const point = new THREE.Mesh(geometry, material);
    scene.add(point);
    point.position.x = position.x
    point.position.y = position.y
    point.position.z = position.z

    // const earthLabel = new CSS2DObject(earthDiv);
    // earthLabel.position.set(1.5 * EARTH_RADIUS, 0, 0);
    // earthLabel.center.set(0, 1);
    // earth.add(earthLabel);
    // earthLabel.layers.set(0);

    // const element = document.createElement('div');
    // element.textContent = `Some text in the div`;
    // element.id = "ADSF"
    // element.style.width = '100px'
    // element.style.height = '100px'
    // element.style.backgroundColor = 'red'
    // element.style.color = "white"
    // element.style.fontSize = '100px'
    // element.style.left = '50px'; // positioning works

    // // document.body.appendChild(element)

    // const objectCSS = new CSS2DObject(element);
    // objectCSS.center.x = 0;
    // objectCSS.center.y = 0;
    // // objectCSS.position.set(0, 0, 0)

    // point.add(objectCSS)
}

const pointLight = new THREE.PointLight('rgb(255, 255, 255)', 4000)
scene.add(pointLight)

function diedricLine(point1: THREE.Vector3, point2: THREE.Vector3) {

    // const mainMaterial = new THREE.LineBasicMaterial({ color: 0x56d154, linewidth: 10 });

    // const mainGeometry = new THREE.BufferGeometry().setFromPoints([point1, point2]);
    // const mainLine = new THREE.Line(mainGeometry, mainMaterial);
    // scene.add(mainLine);


    const newPoint1 = new THREE.Vector3(point1.x, point1.z, point1.y)
    const newPoint2 = new THREE.Vector3(point2.x, point2.z, point2.y)


    // Calculate the midpoint between the two points
    const midpoint = new THREE.Vector3().addVectors(newPoint1, newPoint2).multiplyScalar(0.5);

    // Calculate the direction vector from pointA to pointB
    const direction = new THREE.Vector3().subVectors(newPoint2, newPoint1);
    const length = direction.length() * 5;


    // Create the cylinder geometry
    const radiusTop = 1; // Set the top radius
    const radiusBottom = 1; // Set the bottom radius
    const radialSegments = 32; // Set the number of radial segments
    const heightSegments = 1; // Set the number of height segments
    const openEnded = false; // Set whether the ends are open or capped
    const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, length, radialSegments, heightSegments, openEnded);

    // const material = new THREE.MeshStandardMaterial({ color: 'red' });
    const material = new THREE.MeshBasicMaterial({ color: 'blue', side: THREE.DoubleSide, transparent: true, opacity: 0.3 });

    const cylinder = new THREE.Mesh(geometry, material);

    cylinder.position.copy(midpoint);
    cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    scene.add(cylinder);



    const projectionMaterial = new THREE.LineBasicMaterial({ color: 0x000000, });
    const horizontalProjectionGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(newPoint1.x, 0, newPoint1.z), new THREE.Vector3(newPoint2.x, 0, newPoint2.z)]);
    const horizontalProjectionLine = new THREE.Line(horizontalProjectionGeometry, projectionMaterial);
    scene.add(horizontalProjectionLine);

    const verticalProjectionGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(newPoint1.x, newPoint1.y, 0), new THREE.Vector3(newPoint2.x, newPoint2.y, 0)]);
    const verticalProjectionLine = new THREE.Line(verticalProjectionGeometry, projectionMaterial);
    scene.add(verticalProjectionLine);
}

function diedricPlane(o: number | null, a: number | null, c: number | null) {

    let point1: THREE.Vector3;
    let point2: THREE.Vector3;
    let point3: THREE.Vector3;
    let position: THREE.Vector3;


    if (o == null && a == null && c == null) {

    } else if (o == null && a == null) { // Horizontal plane
        c = c as number
        point1 = new THREE.Vector3(2, c, 0)
        point2 = new THREE.Vector3(0, c, 2)
        point3 = new THREE.Vector3(-2, c, 0)
        position = new THREE.Vector3(0, c, 0)
    } else if (a == null && c == null) { // Profile plane
        o = o as number
        point1 = new THREE.Vector3(o, 0, 0)
        point2 = new THREE.Vector3(o, 0, 50)
        point3 = new THREE.Vector3(o, 50, 0)
        position = new THREE.Vector3(o, 0, 0)
    } else if (o == null && c == null) { // Vertical plane
        a = a as number
        point1 = new THREE.Vector3(2, 0, a)
        point2 = new THREE.Vector3(0, 2, a)
        point3 = new THREE.Vector3(-2, 0, a)
        position = new THREE.Vector3(0, 0, a)
    } else if (o == null) { // Parallel  LT
        a = a as number
        c = c as number
        point1 = new THREE.Vector3(0, 0, a)
        point2 = new THREE.Vector3(0, c, 0)
        point3 = new THREE.Vector3(-50, 0, a)
        position = new THREE.Vector3(0, 0, a)
    } else if (a == null) { // Perpendicular vertical plane
    } else if (c == null) { // Perpendicular horizontal plane
    } else {
        o = o as number
        a = a as number
        c = c as number
        point1 = new THREE.Vector3(o, 0, 0)
        point2 = new THREE.Vector3(0, c, 0)
        point3 = new THREE.Vector3(0, 0, a)
        position = new THREE.Vector3(o, 0, 0)
    }

    // addPoint(point1)
    // addPoint(point2)
    // addPoint(point3)

    const projectionMaterial = new THREE.LineBasicMaterial({ color: 0x000000, });
    const horizontalProjectionGeometry = new THREE.BufferGeometry().setFromPoints([point1, point2]);
    const horizontalProjectionLine = new THREE.Line(horizontalProjectionGeometry, projectionMaterial);
    scene.add(horizontalProjectionLine);

    const verticalProjectionGeometry = new THREE.BufferGeometry().setFromPoints([point1, point3]);
    const verticalProjectionLine = new THREE.Line(verticalProjectionGeometry, projectionMaterial);
    scene.add(verticalProjectionLine);

    const vector1 = new THREE.Vector3().subVectors(point2, point1);
    const vector2 = new THREE.Vector3().subVectors(point3, point1);
    const normal = new THREE.Vector3().crossVectors(vector1, vector2).normalize();

    const geometry = new THREE.PlaneGeometry(100, 100);
    const material = new THREE.MeshBasicMaterial({ color: 'red', side: THREE.DoubleSide, transparent: true, opacity: 0.3 });
    const plane = new THREE.Mesh(geometry, material);
    plane.position.copy(position)
    plane.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal)

    scene.add(plane);
}

function Axis() {

    const mainMaterial = new THREE.LineBasicMaterial({ color: 0x56d154, });

    const mainGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-100, 0, 0), new THREE.Vector3(100, 0, 0)]);
    const mainLine = new THREE.Line(mainGeometry, mainMaterial);
    scene.add(mainLine);
}

Axis()

function horizontalPlaneLabel() {

    const cv = document.createElement('canvas');
    cv.width = 512 //  3 * 512
    cv.height = 512;
    const ctx = cv.getContext('2d') as CanvasRenderingContext2D;
    ctx.fillStyle = "rgba(255, 255, 0, 0.5)";
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 70vh Arial';
    // https://unicode.org/emoji/charts/full-emoji-list.html#1f642 (mark and copy - column Browser)
    ctx.fillText('H', 30, 300);
    const txtGeometry = new THREE.BoxGeometry(20, 20, 0); // w 3 : h 1
    const cvTexture = new THREE.Texture(cv);
    cvTexture.needsUpdate = true; // otherwise all black only
    const spineMat = new THREE.MeshPhongMaterial({ color: 0xa5800e, transparent: true, opacity: 0.1 });
    const cvMaterial = new THREE.MeshBasicMaterial({ map: cvTexture, transparent: true, opacity: 0.1 });
    const cvMaterials = [spineMat, spineMat, spineMat, spineMat, cvMaterial, cvMaterial];
    const cvTxtMesh = new THREE.Mesh(txtGeometry, cvMaterials);
    cvTxtMesh.rotation.x = Math.PI / 2; // radiant
    cvTxtMesh.rotation.z = Math.PI; // radiant
    cvTxtMesh.position.set(80, 0, 80);
    scene.add(cvTxtMesh);
}


function verticalPlaneLabel() {
    const cv = document.createElement('canvas');
    cv.width = 512 //  3 * 512
    cv.height = 512;
    const ctx = cv.getContext('2d') as CanvasRenderingContext2D;
    ctx.fillStyle = "rgba(255, 255, 0, 0.5)";
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 70vh Arial';
    // https://unicode.org/emoji/charts/full-emoji-list.html#1f642 (mark and copy - column Browser)
    ctx.fillText('V', 40, 300);
    const txtGeometry = new THREE.BoxGeometry(20, 20, 0); // w 3 : h 1
    const cvTexture = new THREE.Texture(cv);
    cvTexture.needsUpdate = true; // otherwise all black only
    const spineMat = new THREE.MeshPhongMaterial({ color: 0xa5800e, transparent: true, opacity: 0.1 });
    const cvMaterial = new THREE.MeshBasicMaterial({ map: cvTexture });
    const cvMaterials = [spineMat, spineMat, spineMat, spineMat, cvMaterial, cvMaterial];
    const cvTxtMesh = new THREE.Mesh(txtGeometry, cvMaterials);
    // cvTxtMesh.rotation.x = Math.PI / 2; // radiant
    // cvTxtMesh.rotation.z = Math.PI; // radiant
    cvTxtMesh.position.set(80, 80, 0);
    scene.add(cvTxtMesh);
}


verticalPlaneLabel()
horizontalPlaneLabel()


diedricLine(new THREE.Vector3(-70, -35, 0), new THREE.Vector3(-45, 0, 35))
// diedricLine(new THREE.Vector3(0, 0, 0), new THREE.Vector3(40, 30, 10))


// diedricPlane(30, null, null)
// diedricPlane(null, 30, null)
// diedricPlane(null, null, 30)

diedricPlane(-40, -10, 20)

// addPoint(new THREE.Vector3(10, 0, 0))
// addPoint(new THREE.Vector3(0, 20, 0))
// addPoint(new THREE.Vector3(0, 0, 30))

let lastInnerHTML: string;

function animate() {
    requestAnimationFrame(animate)

    controls.update()

    let newInnerHTML = `
        <label>
            Rotation: 
            ${(Math.round(camera.rotation.x * 100) / 100).toString()}
            ${(Math.round(camera.rotation.y * 100) / 100).toString()}
            ${(Math.round(camera.rotation.z * 100) / 100).toString()}
        </label>
            <label>
            Position:
            ${(Math.round(camera.position.x * 100) / 100).toString()}
            ${(Math.round(camera.position.y * 100) / 100).toString()}
            ${(Math.round(camera.position.z * 100) / 100).toString()}
        </label>
        <label>
            Scene elements: ${scene.children.length}
        </label>
    `
    if (newInnerHTML != lastInnerHTML) {
        canvasInfo.innerHTML = newInnerHTML
        lastInnerHTML = newInnerHTML
        localStorage.setItem("camera", JSON.stringify({
            rotation_x: Math.round(camera.rotation.x * 100) / 100,
            rotation_y: Math.round(camera.rotation.y * 100) / 100,
            rotation_z: Math.round(camera.rotation.z * 100) / 100,
            position_x: Math.round(camera.position.x * 100) / 100,
            position_y: Math.round(camera.position.y * 100) / 100,
            position_z: Math.round(camera.position.z * 100) / 100,
        }))

        pointLight.position.set(camera.position.x, camera.position.y, camera.position.z)

    }

    renderer.render(scene, camera)
}

animate()