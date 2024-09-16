import * as THREE from 'three';
import { Diedric } from './diedric';


export class DiedricPlane {
    size: number
    geometry: THREE.BufferGeometry<THREE.NormalBufferAttributes>

    private _o: number | null
    private _a: number | null
    private _c: number | null
    private _color: THREE.ColorRepresentation

    status: string
    material: THREE.MeshBasicMaterial
    private diedric: Diedric

    private horizontalProjectionGeometry;
    private verticalProjectionGeometry;

    private verticalProjectionLine: THREE.Line<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.LineBasicMaterial, THREE.Object3DEventMap>
    private horizontalProjectionLine: THREE.Line<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.LineBasicMaterial, THREE.Object3DEventMap>
    private plane: THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.MeshBasicMaterial, THREE.Object3DEventMap>

    constructor(diedric: Diedric, o: number | null, a: number | null, c: number | null, color: THREE.ColorRepresentation) {

        this.status = ""
        this.diedric = diedric
        this._o = o
        this._a = a
        this._c = c
        this._color = color
        this.size = diedric.size
        this.geometry = new THREE.BufferGeometry();

        const projectionMaterial = new THREE.LineBasicMaterial({ color: this._color, });

        this.horizontalProjectionGeometry = new THREE.BufferGeometry().setFromPoints([]);
        this.horizontalProjectionLine = new THREE.Line(this.horizontalProjectionGeometry, projectionMaterial);
        this.diedric.scene.add(this.horizontalProjectionLine);

        this.verticalProjectionGeometry = new THREE.BufferGeometry().setFromPoints([]);
        this.verticalProjectionLine = new THREE.Line(this.verticalProjectionGeometry, projectionMaterial);
        this.diedric.scene.add(this.verticalProjectionLine);

        let vertices = this.calc()
        if (!vertices) {
            this.status = "Error"
        } else {
            const Float32Vertices = new Float32Array(vertices);

            // Set the positions to the geometry
            this.geometry.setAttribute('position', new THREE.BufferAttribute(Float32Vertices, 3));
        }

        // Create a material
        this.material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide, transparent: true, opacity: 0.3 });

        // Create a mesh with the geometry and material
        this.plane = new THREE.Mesh(this.geometry, this.material);

        // Add the plane to the scene
        this.diedric.scene.add(this.plane);
    }

    calc() {

        let point1: THREE.Vector3;
        let point2: THREE.Vector3;
        let point3: THREE.Vector3;

        const size = this.size
        let o = this._o
        let a = this._a
        let c = this._c


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




        const vector1 = new THREE.Vector3().subVectors(point2, point1);
        const vector2 = new THREE.Vector3().subVectors(point3, point1);
        const normal = new THREE.Vector3().crossVectors(vector1, vector2).normalize();

        const d = normal.x * point1.x + normal.y * point1.y + normal.z * point1.z
        const borderPoints: THREE.Vector3[] = []

        let horizontalProjectionPoints = []
        let verticalProjectionPoints = []


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

            z = size
            y = 0
            x = (d - normal.z * z) / normal.x
            if (x <= size && x >= -size) {
                horizontalProjectionPoints.push(new THREE.Vector3(x, y, z))
            }

            z = -size
            x = (d - normal.z * z) / normal.x
            if (x <= size && x >= -size) {
                horizontalProjectionPoints.push(new THREE.Vector3(x, y, z))
            }

            z = 0
            y = size
            x = (d - normal.y * y) / normal.x
            if (x <= size && x >= -size) {
                verticalProjectionPoints.push(new THREE.Vector3(x, y, z))
            }

            y = -size
            x = (d - normal.y * y) / normal.x
            if (x <= size && x >= -size) {
                verticalProjectionPoints.push(new THREE.Vector3(x, y, z))
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
            z = 0
            x = size
            y = (d - normal.x * x) / normal.y
            if (y <= size && y >= -size) {
                verticalProjectionPoints.push(new THREE.Vector3(x, y, z))
            }

            x = -size
            y = (d - normal.x * x) / normal.y
            if (y <= size && y >= -size) {
                verticalProjectionPoints.push(new THREE.Vector3(x, y, z))
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
            y = 0;
            x = size
            z = (d - normal.x * x) / normal.z
            if (z <= size && z >= -size) {
                horizontalProjectionPoints.push(new THREE.Vector3(x, y, z))
            }

            x = -size
            z = (d - normal.x * x) / normal.z
            if (z <= size && z >= -size) {
                horizontalProjectionPoints.push(new THREE.Vector3(x, y, z))
            }
        }



        this.horizontalProjectionGeometry.setFromPoints(horizontalProjectionPoints)
        this.verticalProjectionGeometry.setFromPoints(verticalProjectionPoints)

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
        const vertices = []

        for (let face = 0; face < finalBorderPoints.length - 2; face++) {
            vertices.push(finalBorderPoints[0].x, finalBorderPoints[0].y, finalBorderPoints[0].z)
            for (let vertice = 0; vertice < 2; vertice++) {
                vertices.push(finalBorderPoints[vertice + face + 1].x, finalBorderPoints[vertice + face + 1].y, finalBorderPoints[vertice + face + 1].z)
            }
        }

        return vertices
    }

    remove() {
        this.diedric.scene.remove(this.plane)
        this.diedric.scene.remove(this.horizontalProjectionLine)
        this.diedric.scene.remove(this.verticalProjectionLine)

    }

    set o(o: number) {
        this._o = o
        const vertices = this.calc()
        if (vertices == undefined) {
            return
        }
        const Float32Vertices = new Float32Array(vertices);

        // Set the positions to the geometry
        this.geometry.setAttribute('position', new THREE.BufferAttribute(Float32Vertices, 3));

    }
    set a(a: number) {
        this._a = a
        const vertices = this.calc()
        if (vertices == undefined) {
            return
        }
        const Float32Vertices = new Float32Array(vertices);

        // Set the positions to the geometry
        this.geometry.setAttribute('position', new THREE.BufferAttribute(Float32Vertices, 3));
    }
    set c(c: number) {
        this._c = c
        const vertices = this.calc()
        if (vertices == undefined) {
            return
        }
        const Float32Vertices = new Float32Array(vertices);

        // Set the positions to the geometry
        this.geometry.setAttribute('position', new THREE.BufferAttribute(Float32Vertices, 3));
    }

    get o(): number | null {
        return this._o
    }
    get a(): number | null {
        return this._a
    }
    get c(): number | null {
        return this._c
    }
    get color(): THREE.ColorRepresentation {
        return this._color
    }
    set color(color: string) {
        this.material.color = new THREE.Color(color)
        this._color = color
    }
}