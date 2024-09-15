import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { newDiedricPlane } from './diedricPlane';


const a = new newDiedricPlane(10, 20)


const canvasDiv = document.querySelector<HTMLDivElement>("#main-canvas") as HTMLDivElement
const canvas = canvasDiv.querySelector<HTMLCanvasElement>("canvas") as HTMLCanvasElement
const fovSlider = document.querySelector<HTMLInputElement>("#fov-slider")
const canvasInfo = document.querySelector<HTMLDivElement>("#main-canvas-info") as HTMLDivElement

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, canvasDiv.offsetWidth / canvasDiv.offsetHeight, 0.1, 1000)
scene.background = new THREE.Color("rgb(120, 118, 122)")

const size = 100

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

function addPoint(position: THREE.Vector3, color: THREE.ColorRepresentation = 'black') {

    const geometry = new THREE.SphereGeometry(1)
    const material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });
    const point = new THREE.Mesh(geometry, material);
    scene.add(point);
    point.position.x = position.x
    point.position.y = position.y
    point.position.z = position.z
}

function diedricLine(point1: THREE.Vector3, point2: THREE.Vector3) {

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

function diedricPlane(o: number | null, a: number | null, c: number | null, color: THREE.ColorRepresentation) {

    let point1: THREE.Vector3;
    let point2: THREE.Vector3;
    let point3: THREE.Vector3;

    console.log("alpha", o, a, c)

    if (o == null && a == null && c == null) {
        console.error("Unable to create plane")
        return
    } else if (o == null && a == null) { // Horizontal plane
        c = c as number
        point1 = new THREE.Vector3(2, c, 0)
        point2 = new THREE.Vector3(0, c, 2)
        point3 = new THREE.Vector3(-2, c, 0)
    } else if (a == null && c == null) { // Profile plane
        o = o as number
        point1 = new THREE.Vector3(o, 0, 0)
        point2 = new THREE.Vector3(o, 0, 50)
        point3 = new THREE.Vector3(o, 50, 0)
    } else if (o == null && c == null) { // Vertical plane
        a = a as number
        point1 = new THREE.Vector3(2, 0, a)
        point2 = new THREE.Vector3(0, 2, a)
        point3 = new THREE.Vector3(-2, 0, a)
    } else if (o == null) { // Parallel  LT
        a = a as number
        c = c as number
        point1 = new THREE.Vector3(0, 0, a)
        point2 = new THREE.Vector3(0, c, 0)
        point3 = new THREE.Vector3(-50, 0, a)
    } else if (a == null) { // Perpendicular to vertical plane
        o = o as number
        c = c as number
        point1 = new THREE.Vector3(o, 0, 0)
        point2 = new THREE.Vector3(o, 0, 10)
        point3 = new THREE.Vector3(0, c, 0)
    } else if (c == null) { // Perpendicular to horizontal plane
        o = o as number
        a = a as number
        point1 = new THREE.Vector3(o, 0, 0)
        point2 = new THREE.Vector3(o, 10, 0)
        point3 = new THREE.Vector3(0, 0, a)
    } else {
        o = o as number
        a = a as number
        c = c as number
        point1 = new THREE.Vector3(o, 0, 0)
        point2 = new THREE.Vector3(0, c, 0)
        point3 = new THREE.Vector3(0, 0, a)
    }

    point1 = point1 as THREE.Vector3
    point2 = point2 as THREE.Vector3
    point3 = point3 as THREE.Vector3


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

    const d = normal.x * point1.x + normal.y * point1.y + normal.z * point1.z
    const borderPoints: THREE.Vector3[] = []

    if (normal.x != 0) {
        let x: number;
        let y: number;
        let z: number;

        for (let k of [[size, size], [size, -size], [-size, size], [-size, -size]]) {
            y = k[0]
            z = k[1]
            x = (d - normal.y * y - normal.z * z) / normal.x
            if (x < size && x > -size) {
                // addPoint(new THREE.Vector3(x, y, z), "blue")
                borderPoints.push(new THREE.Vector3(x, y, z))
            }
        }
    }
    if (normal.y != 0) {
        let x: number;
        let y: number;
        let z: number;
        for (let k of [[size, size], [size, -size], [-size, size], [-size, -size]]) {

            x = k[0]
            z = k[1]
            y = (d - normal.x * x - normal.z * z) / normal.y
            if (y < size && y > -size) {
                // addPoint(new THREE.Vector3(x, y, z), "red")
                borderPoints.push(new THREE.Vector3(x, y, z))
            }
        }

    }
    if (normal.z != 0) {
        let x: number;
        let y: number;
        let z: number;
        for (let k of [[size, size], [size, -size], [-size, size], [-size, -size]]) {

            x = k[0]
            y = k[1]
            z = (d - normal.x * x - normal.y * y) / normal.z
            if (z < size && z > -size) {
                // addPoint(new THREE.Vector3(x, y, z))
                borderPoints.push(new THREE.Vector3(x, y, z))
            }
        }
    }

    const finalBorderPoints: THREE.Vector3[] = []

    let currentPoint = borderPoints[0]
    let closestPoints: THREE.Vector3[] = []

    finalBorderPoints.push(currentPoint)

    for (let i = 0; i < borderPoints.length - 1; i++) {
        closestPoints = borderPoints.sort((a, b) => {
            return currentPoint.distanceTo(a) - currentPoint.distanceTo(b)
        }).filter(a => !finalBorderPoints.includes(a))
        finalBorderPoints.push(closestPoints[0])
        currentPoint = closestPoints[0]
    }

    // Create a new geometry
    const geometry1 = new THREE.BufferGeometry();
    const vertices = []

    for (let face = 0; face < finalBorderPoints.length - 2; face++) {
        vertices.push(finalBorderPoints[0].x, finalBorderPoints[0].y, finalBorderPoints[0].z)
        for (let vertice = 0; vertice < 2; vertice++) {
            vertices.push(finalBorderPoints[vertice + face + 1].x, finalBorderPoints[vertice + face + 1].y, finalBorderPoints[vertice + face + 1].z)
        }
    }

    const Float32Vertices = new Float32Array(vertices);

    // Set the positions to the geometry
    geometry1.setAttribute('position', new THREE.BufferAttribute(Float32Vertices, 3));

    // Create a material
    const material2 = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide, transparent: true, opacity: 0.3 });

    // Create a mesh with the geometry and material
    const plane1 = new THREE.Mesh(geometry1, material2);

    // Add the plane to the scene
    scene.add(plane1);
}

function Axis() {


    const axesMaterial = new THREE.LineBasicMaterial({ color: 0x56d154, });

    const xGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-size, 0, 0), new THREE.Vector3(size, 0, 0)]);
    const yGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -size, 0), new THREE.Vector3(0, size, 0)]);
    const zGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, -size), new THREE.Vector3(0, 0, size)]);
    const xLine = new THREE.Line(xGeometry, axesMaterial);
    const yLine = new THREE.Line(yGeometry, axesMaterial);
    const zLine = new THREE.Line(zGeometry, axesMaterial);
    scene.add(xLine, yLine, zLine);


    const squareGeometry = new THREE.PlaneGeometry(200, 200)
    // const facesMaterial = new THREE.LineBasicMaterial({ color: 0x56d154, transparent: true, opacity: 0.1, side: THREE.DoubleSide, forceSinglePass: true });
    const facesMaterial = new THREE.MeshBasicMaterial({ color: 0x56d154, transparent: true, opacity: 0.1, side: THREE.DoubleSide, forceSinglePass: true, wireframe: true });
    const face1 = new THREE.Mesh(squareGeometry, facesMaterial)
    const face2 = new THREE.Mesh(squareGeometry, facesMaterial)
    const face3 = new THREE.Mesh(squareGeometry, facesMaterial)
    const face4 = new THREE.Mesh(squareGeometry, facesMaterial)
    const face5 = new THREE.Mesh(squareGeometry, facesMaterial)
    const face6 = new THREE.Mesh(squareGeometry, facesMaterial)
    face1.position.set(0, 0, size)
    face2.position.set(0, 0, -size)

    face3.rotateX(Math.PI / 2)
    face3.position.set(0, size, 0)
    face4.rotateX(Math.PI / 2)
    face4.position.set(0, -size, 0)

    face5.rotateY(Math.PI / 2)
    face5.position.set(size, 0, 0)
    face6.rotateY(Math.PI / 2)
    face6.position.set(-size, 0, 0)

    scene.add(face1, face2, face3, face4, face5, face6)
}

Axis()

function horizontalPlaneLabel() {

    const cv = document.createElement('canvas');
    cv.width = 512 //  3 * 512
    cv.height = 512;
    const ctx = cv.getContext('2d') as CanvasRenderingContext2D;
    ctx.fillStyle = "rgba(255, 255, 0, 0.5)";
    // ctx.fillRect(0, 0, cv.width, cv.height);
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
    const cvMaterial = new THREE.MeshBasicMaterial({ map: cvTexture, transparent: true, opacity: 1 });
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
    // ctx.fillRect(0, 0, cv.width, cv.height);
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
    const cvMaterial = new THREE.MeshBasicMaterial({ map: cvTexture, transparent: true, opacity: 1 });
    const cvMaterials = [spineMat, spineMat, spineMat, spineMat, cvMaterial, cvMaterial];
    const cvTxtMesh = new THREE.Mesh(txtGeometry, cvMaterials);
    // cvTxtMesh.rotation.x = Math.PI / 2; // radiant
    // cvTxtMesh.rotation.z = Math.PI; // radiant
    cvTxtMesh.position.set(80, 80, 0);
    scene.add(cvTxtMesh);
}

verticalPlaneLabel()
horizontalPlaneLabel()

const staticLabels: THREE.Mesh<THREE.BoxGeometry, (THREE.MeshBasicMaterial | THREE.MeshPhongMaterial)[], THREE.Object3DEventMap>[] = []

function staticLabel(text: string, position: THREE.Vector3) {
    const cv = document.createElement('canvas');
    cv.width = 50
    cv.height = 100;
    const ctx = cv.getContext('2d') as CanvasRenderingContext2D;

    // ctx.fillStyle = "rgba(255, 255, 0, 0.5)";
    // ctx.fillRect(0, 0, cv.width, cv.height);

    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = '5vh Arial';
    ctx.fillText(text, cv.width / 2, 0);

    const txtGeometry = new THREE.BoxGeometry(cv.width / 5, cv.height / 5, 0); // w 3 : h 1
    const cvTexture = new THREE.Texture(cv);
    cvTexture.needsUpdate = true; // otherwise all black only
    const spineMat = new THREE.MeshPhongMaterial({ color: 0xa5800e, transparent: true, opacity: 0.1 });
    const cvMaterial = new THREE.MeshBasicMaterial({ map: cvTexture, transparent: true, opacity: 1 });
    const cvMaterials = [spineMat, spineMat, spineMat, spineMat, cvMaterial, cvMaterial];
    const cvTxtMesh = new THREE.Mesh(txtGeometry, cvMaterials);
    cvTxtMesh.position.copy(position);
    scene.add(cvTxtMesh);

    staticLabels.push(cvTxtMesh)

    // return cvTxtMesh
}


// diedricLine(new THREE.Vector3(0,0,0), new THREE.Vector3(-40, -10, 40))
// diedricLine(new THREE.Vector3(0, 0, 0), new THREE.Vector3(40, 30, 10))


// diedricPlane(30, null, null)
// diedricPlane(null, 30, null)
// diedricPlane(null, null, 30)

// addPoint(new THREE.Vector3(0, 100, 0))
diedricPlane(20, -40, null, "red")
diedricPlane(-40, null, 80, "blue")
diedricPlane(null, 20, 50, "green")

// addPoint(new THREE.Vector3(10, 0, 0))
// addPoint(new THREE.Vector3(0, 20, 0))
// addPoint(new THREE.Vector3(0, 0, 30))

staticLabel("x", new THREE.Vector3(110, 0, 0))
staticLabel("y", new THREE.Vector3(0, 110, 0))
staticLabel("z", new THREE.Vector3(0, 0, 110))

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

        for (let mesh of staticLabels) {

            mesh.rotation.set(camera.rotation.x, camera.rotation.y, camera.rotation.z)
        }
    }
    renderer.render(scene, camera)
}

animate()