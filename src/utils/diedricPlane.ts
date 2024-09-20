import * as THREE from 'three';
import { Diedric } from './diedric';
import { DiedricLine2Plane } from './diedricLine2Plane';

export class DiedricPlane {
    private size: number
    private geometry: THREE.BufferGeometry<THREE.NormalBufferAttributes>

    private _normal: THREE.Vector3 | undefined
    private _d: number | undefined

    private material: THREE.MeshBasicMaterial
    private diedric: Diedric

    private horizontalProjectionGeometry;
    private verticalProjectionGeometry;

    private verticalProjectionLine: THREE.Line<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.LineBasicMaterial, THREE.Object3DEventMap>
    private horizontalProjectionLine: THREE.Line<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.LineBasicMaterial, THREE.Object3DEventMap>
    private plane: THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.MeshBasicMaterial, THREE.Object3DEventMap>

    children: (DiedricLine2Plane)[] = []

    static type = "plane"


    constructor(diedric: Diedric, normal: THREE.Vector3 | undefined, d: number | undefined, color: THREE.ColorRepresentation) {

        this.diedric = diedric
        this.size = diedric.size
        this.geometry = new THREE.BufferGeometry();

        this._normal = normal
        this._d = d

        const projectionMaterial = new THREE.LineBasicMaterial({ color: color, });

        this.horizontalProjectionGeometry = new THREE.BufferGeometry().setFromPoints([]);
        this.horizontalProjectionLine = new THREE.Line(this.horizontalProjectionGeometry, projectionMaterial);
        this.diedric.scene.add(this.horizontalProjectionLine);

        this.verticalProjectionGeometry = new THREE.BufferGeometry().setFromPoints([]);
        this.verticalProjectionLine = new THREE.Line(this.verticalProjectionGeometry, projectionMaterial);
        this.diedric.scene.add(this.verticalProjectionLine);

        this.calc()

        // Create a material
        this.material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide, transparent: true, opacity: 0.1 });

        // Create a mesh with the geometry and material
        this.plane = new THREE.Mesh(this.geometry, this.material);

        // Add the plane to the scene
        this.diedric.scene.add(this.plane);
    }

    calc() {
        if (!(this._d !== undefined && this._normal)) {
            this.hidden = true

            return
        }

        this.hidden = false

        const size = this.size

        const d = this._d
        const borderPoints: THREE.Vector3[] = []

        let horizontalProjectionPoints = []
        let verticalProjectionPoints = []

        if (this._normal.x != 0) {
            let x: number;
            let y: number;
            let z: number;

            for (let k of [[size, size], [size, -size], [-size, size], [-size, -size]]) {
                y = k[0]
                z = k[1]
                x = (d - this._normal.y * y - this._normal.z * z) / this._normal.x
                if (x < size && x > -size) {
                    // addPoint(new THREE.Vector3(x, y, z), "blue")
                    borderPoints.push(new THREE.Vector3(x, y, z))
                }
            }

            z = size
            y = 0
            x = (d - this._normal.z * z) / this._normal.x
            if (x <= size && x >= -size) {
                horizontalProjectionPoints.push(new THREE.Vector3(x, y, z))
            }

            z = -size
            x = (d - this._normal.z * z) / this._normal.x
            if (x <= size && x >= -size) {
                horizontalProjectionPoints.push(new THREE.Vector3(x, y, z))
            }

            z = 0
            y = size
            x = (d - this._normal.y * y) / this._normal.x
            if (x <= size && x >= -size) {
                verticalProjectionPoints.push(new THREE.Vector3(x, y, z))
            }

            y = -size
            x = (d - this._normal.y * y) / this._normal.x
            if (x <= size && x >= -size) {
                verticalProjectionPoints.push(new THREE.Vector3(x, y, z))
            }

        }
        if (this._normal.y != 0) {
            let x: number;
            let y: number;
            let z: number;
            for (let k of [[size, size], [size, -size], [-size, size], [-size, -size]]) {

                x = k[0]
                z = k[1]
                y = (d - this._normal.x * x - this._normal.z * z) / this._normal.y
                if (y < size && y > -size) {
                    // addPoint(new THREE.Vector3(x, y, z), "red")
                    borderPoints.push(new THREE.Vector3(x, y, z))
                }
            }
            z = 0
            x = size
            y = (d - this._normal.x * x) / this._normal.y
            if (y <= size && y >= -size) {
                verticalProjectionPoints.push(new THREE.Vector3(x, y, z))
            }

            x = -size
            y = (d - this._normal.x * x) / this._normal.y
            if (y <= size && y >= -size) {
                verticalProjectionPoints.push(new THREE.Vector3(x, y, z))
            }

        }
        if (this._normal.z != 0) {
            let x: number;
            let y: number;
            let z: number;
            for (let k of [[size, size], [size, -size], [-size, size], [-size, -size]]) {

                x = k[0]
                y = k[1]
                z = (d - this._normal.x * x - this._normal.y * y) / this._normal.z
                if (z < size && z > -size) {
                    // addPoint(new THREE.Vector3(x, y, z))
                    borderPoints.push(new THREE.Vector3(x, y, z))
                }
            }
            y = 0;
            x = size
            z = (d - this._normal.x * x) / this._normal.z
            if (z <= size && z >= -size) {
                horizontalProjectionPoints.push(new THREE.Vector3(x, y, z))
            }

            x = -size
            z = (d - this._normal.x * x) / this._normal.z
            if (z <= size && z >= -size) {
                horizontalProjectionPoints.push(new THREE.Vector3(x, y, z))
            }
        }

        this.horizontalProjectionGeometry.setFromPoints(horizontalProjectionPoints)
        this.verticalProjectionGeometry.setFromPoints(verticalProjectionPoints)

        const finalBorderPoints: THREE.Vector3[] = []

        let currentPoint = borderPoints[0]

        finalBorderPoints.push(currentPoint)

        let facesDone: string[] = []

        for (let i = 0; i < borderPoints.length - 1; i++) {

            if (currentPoint.x == size && !facesDone.includes("A")) {

                let newPoint = borderPoints.find(point => (point.x == size && !finalBorderPoints.includes(point)))
                if (!newPoint) {
                    console.warn("This should never happen", borderPoints, currentPoint)
                    continue
                }
                finalBorderPoints.push(newPoint)
                currentPoint = newPoint
                facesDone.push("A")
            } else if (currentPoint.x == -size && !facesDone.includes("B")) {

                let newPoint = borderPoints.find(point => (point.x == -size && !finalBorderPoints.includes(point)))
                if (!newPoint) {
                    console.warn("This should never happen", borderPoints, currentPoint)
                    continue
                }
                finalBorderPoints.push(newPoint)
                currentPoint = newPoint

                facesDone.push("B")
            } else if (currentPoint.y == size && !facesDone.includes("C")) {
                let newPoint = borderPoints.find(point => (point.y == size && !finalBorderPoints.includes(point)))
                if (!newPoint) {
                    console.warn("This should never happen", borderPoints, currentPoint)
                    continue
                }
                finalBorderPoints.push(newPoint)
                currentPoint = newPoint

                facesDone.push("C")

            } else if (currentPoint.y == -size && !facesDone.includes("D")) {
                let newPoint = borderPoints.find(point => (point.y == -size && !finalBorderPoints.includes(point)))
                if (!newPoint) {
                    console.warn("This should never happen", borderPoints, currentPoint)
                    continue
                }
                finalBorderPoints.push(newPoint)
                currentPoint = newPoint

                facesDone.push("D")
            } else if (currentPoint.z == size && !facesDone.includes("E")) {
                let newPoint = borderPoints.find(point => (point.z == size && !finalBorderPoints.includes(point)))
                if (!newPoint) {
                    console.warn("This should never happen", borderPoints, currentPoint)
                    continue
                }
                finalBorderPoints.push(newPoint)
                currentPoint = newPoint

                facesDone.push("E")
            } else if (currentPoint.z == -size && !facesDone.includes("F")) {
                let newPoint = borderPoints.find(point => (point.z == -size && !finalBorderPoints.includes(point)))
                if (!newPoint) {
                    console.warn("This should never happen", borderPoints, currentPoint)
                    continue
                }
                finalBorderPoints.push(newPoint)
                currentPoint = newPoint

                facesDone.push("F")
            }

        }
        // for (let i in finalBorderPoints) {
        //     this.diedric.createStaticLabel(i, finalBorderPoints[i])
        // }

        // Create a new geometry
        const vertices = []

        for (let face = 0; face < finalBorderPoints.length - 2; face++) {
            vertices.push(finalBorderPoints[0].x, finalBorderPoints[0].y, finalBorderPoints[0].z)
            for (let vertice = 0; vertice < 2; vertice++) {
                vertices.push(finalBorderPoints[vertice + face + 1].x, finalBorderPoints[vertice + face + 1].y, finalBorderPoints[vertice + face + 1].z)
            }
        }
        if (!vertices) {
            console.error("No vertices")
            this.hidden = true
        } else {
            const Float32Vertices = new Float32Array(vertices);
            this.hidden = false

            // Set the positions to the geometry
            this.geometry.setAttribute('position', new THREE.BufferAttribute(Float32Vertices, 3));
        }

        this.children.map(child => child.update())

        // return vertices
    }

    remove() {
        this.diedric.scene.remove(this.plane)
        this.diedric.scene.remove(this.horizontalProjectionLine)
        this.diedric.scene.remove(this.verticalProjectionLine)
    }
    getSuper() {
        return this
    }

    set d(d: number | undefined) {
        this._d = d

        this.calc()

        // let vertices = this.calc()
        // if (!vertices) {
        //     this.hidden = true
        //     console.error("No vertices")
        // } else {
        //     this.hidden = false
        //     const Float32Vertices = new Float32Array(vertices);

        //     // Set the positions to the geometry
        //     this.geometry.setAttribute('position', new THREE.BufferAttribute(Float32Vertices, 3));
        // }
    }

    get d(): number | undefined {
        return this._d
    }

    set normal(normal: THREE.Vector3 | undefined) {
        this._normal = normal


        this.calc()
        // let vertices = this.calc()
        // if (!vertices) {
        //     this.hidden = true
        //     console.error("No vertices")
        // } else {
        //     this.hidden = false
        //     const Float32Vertices = new Float32Array(vertices);

        //     // Set the positions to the geometry
        //     this.geometry.setAttribute('position', new THREE.BufferAttribute(Float32Vertices, 3));
        // }
    }

    get normal(): THREE.Vector3 | undefined {
        return this._normal
    }

    set hidden(value: boolean) {
        if (value) {
            this.diedric.scene.remove(this.horizontalProjectionLine)
            this.diedric.scene.remove(this.verticalProjectionLine)
            this.diedric.scene.remove(this.plane)
        } else {
            this.diedric.scene.add(this.horizontalProjectionLine)
            this.diedric.scene.add(this.verticalProjectionLine)
            this.diedric.scene.add(this.plane)
        }
    }

}




// export class DiedridPlaneOAC extends DiedricPlane {
//     constructor(diedric: Diedric, o: number, a: number, c: number) {

//         let point1: THREE.Vector3;
//         let point2: THREE.Vector3;
//         let point3: THREE.Vector3;

//         if (o == null && a == null && c == null) {
//             console.error("Unable to create plane")
//             return
//         } else if (o == null && a == null) { // Horizontal plane
//             c = c as number
//             point1 = new THREE.Vector3(2, c, 0)
//             point2 = new THREE.Vector3(0, c, 2)
//             point3 = new THREE.Vector3(-2, c, 0)
//         } else if (a == null && c == null) { // Profile plane
//             o = o as number
//             point1 = new THREE.Vector3(o, 0, 0)
//             point2 = new THREE.Vector3(o, 0, 50)
//             point3 = new THREE.Vector3(o, 50, 0)
//         } else if (o == null && c == null) { // Vertical plane
//             a = a as number
//             point1 = new THREE.Vector3(2, 0, a)
//             point2 = new THREE.Vector3(0, 2, a)
//             point3 = new THREE.Vector3(-2, 0, a)
//         } else if (o == null) { // Parallel  LT
//             a = a as number
//             c = c as number
//             point1 = new THREE.Vector3(0, 0, a)
//             point2 = new THREE.Vector3(0, c, 0)
//             point3 = new THREE.Vector3(-50, 0, a)
//         } else if (a == null) { // Perpendicular to vertical plane
//             o = o as number
//             c = c as number
//             point1 = new THREE.Vector3(o, 0, 0)
//             point2 = new THREE.Vector3(o, 0, 10)
//             point3 = new THREE.Vector3(0, c, 0)
//         } else if (c == null) { // Perpendicular to horizontal plane
//             o = o as number
//             a = a as number
//             point1 = new THREE.Vector3(o, 0, 0)
//             point2 = new THREE.Vector3(o, 10, 0)
//             point3 = new THREE.Vector3(0, 0, a)
//         } else {
//             o = o as number
//             a = a as number
//             c = c as number
//             point1 = new THREE.Vector3(o, 0, 0)
//             point2 = new THREE.Vector3(0, c, 0)
//             point3 = new THREE.Vector3(0, 0, a)
//         }

//         point1 = point1 as THREE.Vector3
//         point2 = point2 as THREE.Vector3
//         point3 = point3 as THREE.Vector3

//     }

// }
