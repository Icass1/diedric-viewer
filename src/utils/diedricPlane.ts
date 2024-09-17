import * as THREE from 'three';
import { Diedric } from './diedric';
import { DiedricPoint } from './diedricPoint';
import { DiedricLine } from './diedricLine';

export class DiedricPlane {
    private size: number
    private geometry: THREE.BufferGeometry<THREE.NormalBufferAttributes>

    private _normal: THREE.Vector3
    private _d: number

    private material: THREE.MeshBasicMaterial
    private diedric: Diedric

    private horizontalProjectionGeometry;
    private verticalProjectionGeometry;

    private verticalProjectionLine: THREE.Line<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.LineBasicMaterial, THREE.Object3DEventMap>
    private horizontalProjectionLine: THREE.Line<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.LineBasicMaterial, THREE.Object3DEventMap>
    private plane: THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.MeshBasicMaterial, THREE.Object3DEventMap>

    constructor(diedric: Diedric, normal: THREE.Vector3, d: number, color: THREE.ColorRepresentation) {

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

        let vertices = this.calc()
        if (!vertices) {
            console.error("No vertices")
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

    intersect(other: DiedricPlane) {

        let cross = new THREE.Vector3()
        cross.copy(this.normal)
        cross.cross(other.normal)

        // let cross = this.normal.copy(this.normal)
        // cross.cross(other.normal)

        console.log("cross", cross)
        console.log("this.normal", this.normal)
        console.log("other.normal", other.normal)

    }

    set d(d: number) {
        this._d = d

        let vertices = this.calc()
        if (!vertices) {
            console.error("No vertices")
        } else {
            const Float32Vertices = new Float32Array(vertices);

            // Set the positions to the geometry
            this.geometry.setAttribute('position', new THREE.BufferAttribute(Float32Vertices, 3));
        }

    }

    get d(): number {
        return this._d
    }

    set normal(normal: THREE.Vector3) {
        this._normal = normal

        let vertices = this.calc()
        if (!vertices) {
            console.error("No vertices")
        } else {
            const Float32Vertices = new Float32Array(vertices);

            // Set the positions to the geometry
            this.geometry.setAttribute('position', new THREE.BufferAttribute(Float32Vertices, 3));
        }

    }

    get normal(): THREE.Vector3 {
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

export class DiedricPlane3Points extends DiedricPlane {
    private _color: THREE.ColorRepresentation
    private _point1: DiedricPoint
    private _point2: DiedricPoint
    private _point3: DiedricPoint

    constructor(diedric: Diedric, point1: DiedricPoint, point2: DiedricPoint, point3: DiedricPoint, color: THREE.ColorRepresentation) {
        const pointA = new THREE.Vector3(point1.o, point1.c, point1.a)
        const pointB = new THREE.Vector3(point2.o, point2.c, point2.a)
        const pointC = new THREE.Vector3(point3.o, point3.c, point3.a)

        const vector1 = new THREE.Vector3().subVectors(pointB, pointA);
        const vector2 = new THREE.Vector3().subVectors(pointC, pointA);

        const normal = new THREE.Vector3().crossVectors(vector1, vector2).normalize();

        const d = normal.x * pointA.x + normal.y * pointA.y + normal.z * pointA.z
        super(diedric, normal, d, color)

        this._color = color
        this._point1 = point1
        this._point2 = point2
        this._point3 = point3

    }
    update() {
        const pointA = new THREE.Vector3(this._point1.o, this._point1.c, this._point1.a)
        const pointB = new THREE.Vector3(this._point2.o, this._point2.c, this._point2.a)
        const pointC = new THREE.Vector3(this._point3.o, this._point3.c, this._point3.a)

        const vector1 = new THREE.Vector3().subVectors(pointB, pointA);
        const vector2 = new THREE.Vector3().subVectors(pointC, pointA);

        super.normal = new THREE.Vector3().crossVectors(vector1, vector2).normalize();

        super.d = super.normal.x * pointA.x + super.normal.y * pointA.y + super.normal.z * pointA.z

    }
    get color(): THREE.ColorRepresentation {
        return this._color
    }
    set point1(point: DiedricPoint) {
        this._point1 = point
        this.update()
    }
    set point2(point: DiedricPoint) {
        this._point2 = point
        this.update()
    }
    set point3(point: DiedricPoint) {
        this._point3 = point
        this.update()
    }
}

export class DiedridPlaneOAC extends DiedricPlane {
    constructor(diedric: Diedric, o: number, a: number, c: number) {

        let point1: THREE.Vector3;
        let point2: THREE.Vector3;
        let point3: THREE.Vector3;

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

    }

}
