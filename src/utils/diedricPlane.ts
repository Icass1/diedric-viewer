import * as THREE from 'three';
import { Diedric } from './diedric';
import { DiedricPoint } from './diedricPoint';
import { DiedricLine } from './diedricLine';

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

    children = []

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
        // let vertices = this.calc()
        // if (!vertices) {
        //     console.error("No vertices")
        // } else {
        //     const Float32Vertices = new Float32Array(vertices);

        //     // Set the positions to the geometry
        //     this.geometry.setAttribute('position', new THREE.BufferAttribute(Float32Vertices, 3));
        // }

        // Create a material
        this.material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide, transparent: true, opacity: 0.3 });

        // Create a mesh with the geometry and material
        this.plane = new THREE.Mesh(this.geometry, this.material);

        // Add the plane to the scene
        this.diedric.scene.add(this.plane);
    }

    calc() {
        console.log("AAAAAAAAAAAAAAAAA", this._d, this._normal)
        if (!(this._d && this._normal)) {
            this.hidden = true

            return
        } 
        console.log("BBBBBBBBBBBBBB")

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
        let closestPoints: THREE.Vector3[] = []

        finalBorderPoints.push(currentPoint)

        let facesDone: string[] = []

        for (let i = 0; i < borderPoints.length - 1; i++) {
            // closestPoints = borderPoints.sort((a, b) => {
            //     return currentPoint.distanceTo(a) - currentPoint.distanceTo(b)
            // }).filter(a => !finalBorderPoints.includes(a))
            // finalBorderPoints.push(closestPoints[0])
            // currentPoint = closestPoints[0]


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


        // return vertices
    }

    remove() {
        this.diedric.scene.remove(this.plane)
        this.diedric.scene.remove(this.horizontalProjectionLine)
        this.diedric.scene.remove(this.verticalProjectionLine)
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

export class DiedricPlane3Points extends DiedricPlane {
    private _color: THREE.ColorRepresentation
    private _point1: DiedricPoint | undefined
    private _point2: DiedricPoint | undefined
    private _point3: DiedricPoint | undefined

    constructor(diedric: Diedric, point1: DiedricPoint | undefined, point2: DiedricPoint | undefined, point3: DiedricPoint | undefined, color: THREE.ColorRepresentation) {
        super(diedric, undefined, undefined, color)

        this._color = color
        this._point1 = point1
        this._point2 = point2
        this._point3 = point3

        this._point1?.children.push(this)
        this._point2?.children.push(this)
        this._point3?.children.push(this)
        this.update()
    }

    removeParent(parent: DiedricPoint) {
        if (this._point1 === parent) {
            this.point1 = undefined
        } else if (this._point2 == parent) {
            this.point2 = undefined
        } else if (this._point3 == parent) {
            this.point3 = undefined            
        }
        this.update()
    }
    remove() {

        this._point1 = undefined
        this._point2 = undefined
        this._point3 = undefined
        super.remove()
    }

    update() {
        console.log(this._point1, this._point2, this._point3)
        if (this._point1 && this._point2 && this._point3) {
            console.log("A")
            const pointA = new THREE.Vector3(this._point1.o, this._point1.c, this._point1.a)
            const pointB = new THREE.Vector3(this._point2.o, this._point2.c, this._point2.a)
            const pointC = new THREE.Vector3(this._point3.o, this._point3.c, this._point3.a)

            const vector1 = new THREE.Vector3().subVectors(pointB, pointA);
            const vector2 = new THREE.Vector3().subVectors(pointC, pointA);

            super.normal = new THREE.Vector3().crossVectors(vector1, vector2).normalize();

            super.d = super.normal.x * pointA.x + super.normal.y * pointA.y + super.normal.z * pointA.z

        } else {
            console.log("B")
            super.normal = undefined
            super.d = undefined
        }
    }
    get color(): THREE.ColorRepresentation {
        return this._color
    }
    set point1(point: DiedricPoint | undefined) {


        if (this._point1) {
            let indexInChildren = this._point1.children.indexOf(this)
            if (indexInChildren == -1) {
                console.error("This should never happen", this, "is not in point1 children")
            } else {
                this._point1.children.splice(indexInChildren, 1)
            }
        }


        this._point1 = point
        this.update()

        if (this._point1) {
            this._point1.children.push(this)
        }
    }
    set point2(point: DiedricPoint | undefined) {

        if (this._point2) {
            let indexInChildren = this._point2.children.indexOf(this)
            if (indexInChildren == -1) {
                console.error("This should never happen", this, "is not in point2 children")
            } else {
                this._point2.children.splice(indexInChildren, 1)
            }
        }


        this._point2 = point
        this.update()

        if (this._point2) {
            this._point2.children.push(this)
        }
    }
    set point3(point: DiedricPoint | undefined) {
        if (this._point3) {
            let indexInChildren = this._point3.children.indexOf(this)
            if (indexInChildren == -1) {
                console.error("This should never happen", this, "is not in point3 children")
            } else {
                this._point3.children.splice(indexInChildren, 1)
            }
        }


        this._point3 = point
        this.update()

        if (this._point3) {
            this._point3.children.push(this)
        }
    }
}

export class DiedricPlanePointLine extends DiedricPlane {

    private _color: THREE.ColorRepresentation
    private _point: DiedricPoint | undefined
    private _line: DiedricLine | undefined

    constructor(diedirc: Diedric, point: DiedricPoint | undefined, line: DiedricLine | undefined, color: THREE.ColorRepresentation) {
        super(diedirc, undefined, undefined, color)

        this._color = color
        this._point = point
        this._line = line

        this._point?.children.push(this)
        this._line?.children.push(this)
        this.update()

    }
    removeParent(parent: DiedricPoint | DiedricLine) {
        if (this._point === parent) {
            this._point = undefined
        } else if (this._line == parent) {
            this._line = undefined
        }
        this.update()
    }
    remove() {
        this._point = undefined
        this._line = undefined

        super.remove()
    }

    update() {

        if (this._point && this._line?.vector && this._line?.point) {

            const pointA = new THREE.Vector3(this._point.o, this._point.c, this._point.a)
            const pointB = this._line.point
            const pointC = new THREE.Vector3().copy(this._line.point).add(this._line.vector)

            const vector1 = new THREE.Vector3().subVectors(pointB, pointA);
            const vector2 = new THREE.Vector3().subVectors(pointC, pointA);

            super.normal = new THREE.Vector3().crossVectors(vector1, vector2).normalize();

            super.d = super.normal.x * pointA.x + super.normal.y * pointA.y + super.normal.z * pointA.z

        } else {
            super.normal = undefined
            super.d = undefined
        }
    }
    get color() {
        return this._color
    }
    set point(point: DiedricPoint | undefined) {
        if (this._point) {
            let indexInChildren = this._point.children.indexOf(this)
            if (indexInChildren == -1) {
                console.error("This should never happen", this, "is not in point3 children")
            } else {
                this._point.children.splice(indexInChildren, 1)
            }
        }


        this._point = point
        this.update()

        if (this._point) {
            this._point.children.push(this)
        }
    }
    set line(line: DiedricLine | undefined) {
        if (this._line) {
            let indexInChildren = this._line.children.indexOf(this)
            if (indexInChildren == -1) {
                console.error("This should never happen", this, "is not in point3 children")
            } else {
                this._line.children.splice(indexInChildren, 1)
            }
        }

        this._line = line
        this.update()

        if (this._line) {
            this._line.children.push(this)
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
