import * as THREE from 'three';
import * as TWO from "./two";

import { Diedric } from './diedric';
import { DiedricLine2Plane } from './diedricLine2Plane';
import { DiedricLinePointPerpendicularPlane } from './diedricLinePointPerpendicularPlane';
import { DiedricPointIntersectLinePlane } from './diedricPointIntersectLinePlane';

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

    children: (DiedricLine2Plane | DiedricLinePointPerpendicularPlane | DiedricPointIntersectLinePlane)[] = []

    static type = "plane"
    public type = "plane"

    private _hidden = false
    private _exists = false

    private horizontalProjectionLine2d: TWO.Line
    private verticalProjectionLine2d: TWO.Line

    private horizontalProjectionLine2dDashed: TWO.Line
    private verticalProjectionLine2dDashed: TWO.Line

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

        // Create a material.
        this.material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide, transparent: true, opacity: 0.1 });

        // Create a mesh with the geometry and material.
        this.plane = new THREE.Mesh(this.geometry, this.material);

        // Add the plane to the scene.
        this.diedric.scene.add(this.plane);

        this.horizontalProjectionLine2d = new TWO.Line({ color: color.toString(), width: 2 })
        this.verticalProjectionLine2d = new TWO.Line({ color: color.toString(), width: 2 })
        this.horizontalProjectionLine2dDashed = new TWO.Line({ color: color.toString(), width: 2, dashed: true })
        this.verticalProjectionLine2dDashed = new TWO.Line({ color: color.toString(), width: 2, dashed: true })

        this.diedric.canvas2d.add(this.horizontalProjectionLine2d)
        this.diedric.canvas2d.add(this.verticalProjectionLine2d)

        this.diedric.canvas2d.add(this.horizontalProjectionLine2dDashed)
        this.diedric.canvas2d.add(this.verticalProjectionLine2dDashed)
    }


    calc() {
        console.log("DiedricPlane calc")
        if (this._d !== undefined && this._normal?.x !== undefined && this._normal?.y !== undefined && this._normal?.z !== undefined) {
            this._exists = true

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
                    if (x <= size && x >= -size) {
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
                    if (y <= size && y >= -size) {
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
                    if (z <= size && z >= -size) {
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

            let m = (horizontalProjectionPoints[1].z - horizontalProjectionPoints[0].z) / (horizontalProjectionPoints[1].x - horizontalProjectionPoints[0].x)
            let n = horizontalProjectionPoints[0].z - m * horizontalProjectionPoints[0].x

            let x = -n / m

            if (horizontalProjectionPoints[0].z > 0) {
                this.horizontalProjectionLine2d.start = new THREE.Vector2(horizontalProjectionPoints[0].x, horizontalProjectionPoints[0].z)
                this.horizontalProjectionLine2d.end = new THREE.Vector2(x, 0)

                this.horizontalProjectionLine2dDashed.start = new THREE.Vector2(x, 0)
                this.horizontalProjectionLine2dDashed.end = new THREE.Vector2(horizontalProjectionPoints[1].x, horizontalProjectionPoints[1].z)

            } else if (horizontalProjectionPoints[0].z < 0) {
                console.warn("Implementation missing 1")
                this.horizontalProjectionLine2d.start = new THREE.Vector2(x, 0)
                this.horizontalProjectionLine2d.end = new THREE.Vector2(horizontalProjectionPoints[1].x, horizontalProjectionPoints[1].z)

                this.horizontalProjectionLine2dDashed.start = new THREE.Vector2(horizontalProjectionPoints[0].x, horizontalProjectionPoints[0].z)
                this.horizontalProjectionLine2dDashed.end = new THREE.Vector2(x, 0)

            } else {
                console.warn("Implementation missing 2")
                this.horizontalProjectionLine2d.start = new THREE.Vector2(horizontalProjectionPoints[0].x, horizontalProjectionPoints[0].z)
                this.horizontalProjectionLine2d.end = new THREE.Vector2(horizontalProjectionPoints[1].x, horizontalProjectionPoints[1].z)

                this.horizontalProjectionLine2dDashed.start = new THREE.Vector2(0, 0)
                this.horizontalProjectionLine2dDashed.end = new THREE.Vector2(0, 0)
            }

            if (-verticalProjectionPoints[0].y > 0) {
                console.warn("Implementation missing 3")
                this.verticalProjectionLine2d.start = new THREE.Vector2(verticalProjectionPoints[0].x, -verticalProjectionPoints[0].y)
                this.verticalProjectionLine2d.end = new THREE.Vector2(verticalProjectionPoints[1].x, -verticalProjectionPoints[1].y)

                this.verticalProjectionLine2dDashed.start = new THREE.Vector2(0, 0)
                this.verticalProjectionLine2dDashed.end = new THREE.Vector2(0, 0)

            } else if (-verticalProjectionPoints[0].y < 0) {
                this.verticalProjectionLine2d.start = new THREE.Vector2(verticalProjectionPoints[0].x, -verticalProjectionPoints[0].y)
                this.verticalProjectionLine2d.end = new THREE.Vector2(x, 0)

                this.verticalProjectionLine2dDashed.start = new THREE.Vector2(x, 0)
                this.verticalProjectionLine2dDashed.end = new THREE.Vector2(verticalProjectionPoints[1].x, -verticalProjectionPoints[1].y)

            } else {
                console.warn("Implementation missing 4")
                this.verticalProjectionLine2d.start = new THREE.Vector2(verticalProjectionPoints[0].x, -verticalProjectionPoints[0].y)
                this.verticalProjectionLine2d.end = new THREE.Vector2(verticalProjectionPoints[1].x, -verticalProjectionPoints[1].y)

                this.verticalProjectionLine2dDashed.start = new THREE.Vector2(0, 0)
                this.verticalProjectionLine2dDashed.end = new THREE.Vector2(0, 0)
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
                this._exists = false
            } else {
                const Float32Vertices = new Float32Array(vertices);
                this._exists = true

                // Set the positions to the geometry
                this.geometry.setAttribute('position', new THREE.BufferAttribute(Float32Vertices, 3));
            }

            this.children.map(child => child.update())









        } else {
            this._exists = false
        }

        this.updateView()

    }

    remove() {
        this.diedric.scene.remove(this.plane)
        this.diedric.scene.remove(this.horizontalProjectionLine)
        this.diedric.scene.remove(this.verticalProjectionLine)
    }
    getSuper() {
        return this
    }
    updateView() {
        if (this._exists && !this._hidden) {
            this.diedric.scene.add(this.horizontalProjectionLine)
            this.diedric.scene.add(this.verticalProjectionLine)
            this.diedric.scene.add(this.plane)

            this.diedric.canvas2d.add(this.horizontalProjectionLine2d)
            this.diedric.canvas2d.add(this.verticalProjectionLine2d)

        } else {
            this.diedric.scene.remove(this.horizontalProjectionLine)
            this.diedric.scene.remove(this.verticalProjectionLine)
            this.diedric.scene.remove(this.plane)

            this.diedric.canvas2d.remove(this.horizontalProjectionLine2d)
            this.diedric.canvas2d.remove(this.verticalProjectionLine2d)
        }
    }
    set d(d: number | undefined) {
        this._d = d
    }

    get d(): number | undefined {
        return this._d
    }

    set normal(normal: THREE.Vector3 | undefined) {
        this._normal = normal
    }

    get normal(): THREE.Vector3 | undefined {
        return this._normal
    }

    set hidden(value: boolean) {
        this._hidden = value
        this.updateView()
    }
}
