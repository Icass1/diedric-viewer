import { Diedric } from "./diedric";
import { DiedricPlanePointLine } from "./diedricPlane";
import { DiedricPoint } from "./diedricPoint";

import * as THREE from 'three';

export class DiedricLine {
    private diedric: Diedric
    private cylinder: THREE.Mesh<THREE.CylinderGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>
    private _point: THREE.Vector3 | undefined
    private _vector: THREE.Vector3 | undefined

    children: (DiedricPlanePointLine)[] = []

    constructor(diedric: Diedric, point: THREE.Vector3 | undefined, vector: THREE.Vector3 | undefined, color: THREE.ColorRepresentation) {

        this.diedric = diedric
        this._point = point
        this._vector = vector

        const geometry = new THREE.CylinderGeometry()

        // Create the cylinder material
        const material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide, transparent: true, opacity: 0.3 });

        // Create the cylinder mesh
        this.cylinder = new THREE.Mesh(geometry, material);

        // Add the cylinder to the scene
        this.diedric.scene.add(this.cylinder);
        this.calc()
    }
    calc() {

        if (!(this._vector && this._point)) {
            this.hidden = true
            this.children.map((child => child.update()))
            return
        }
        this.hidden = false

        let lambda1
        let lambda2

        let points: THREE.Vector3[] = []
        if (this._vector.x != 0) {
            lambda1 = (this.diedric.size - this._point.x) / this._vector.x
            lambda2 = (-this.diedric.size - this._point.x) / this._vector.x

            let x
            let y
            let z

            x = this.diedric.size
            y = this._vector.y * lambda1 + this._point.y
            z = this._vector.z * lambda1 + this._point.z
            if (y >= -this.diedric.size && y <= this.diedric.size && z >= -this.diedric.size && z <= this.diedric.size) {
                points.push(new THREE.Vector3(x, y, z))
            }

            x = -this.diedric.size
            y = this._vector.y * lambda2 + this._point.y
            z = this._vector.z * lambda2 + this._point.z
            if (y >= -this.diedric.size && y <= this.diedric.size && z >= -this.diedric.size && z <= this.diedric.size) {
                points.push(new THREE.Vector3(x, y, z))
            }

        }
        if (this._vector.y != 0) {
            lambda1 = (this.diedric.size - this._point.y) / this._vector.y
            lambda2 = (-this.diedric.size - this._point.y) / this._vector.y

            let x
            let y
            let z

            x = this._vector.x * lambda1 + this._point.x
            y = this.diedric.size
            z = this._vector.z * lambda1 + this._point.z
            if (x >= -this.diedric.size && x <= this.diedric.size && z >= -this.diedric.size && z <= this.diedric.size) {
                points.push(new THREE.Vector3(x, y, z))
            }

            x = this._vector.x * lambda2 + this._point.x
            y = -this.diedric.size
            z = this._vector.z * lambda2 + this._point.z
            if (x >= -this.diedric.size && x <= this.diedric.size && z >= -this.diedric.size && z <= this.diedric.size) {
                points.push(new THREE.Vector3(x, y, z))
            }
        }
        if (this._vector.z != 0) {
            lambda1 = (this.diedric.size - this._point.z) / this._vector.z
            lambda2 = (-this.diedric.size - this._point.z) / this._vector.z

            let x
            let y
            let z

            x = this._vector.x * lambda1 + this._point.x
            y = this._vector.y * lambda1 + this._point.y
            z = this.diedric.size
            if (x >= -this.diedric.size && x <= this.diedric.size && z >= -this.diedric.size && z <= this.diedric.size) {
                points.push(new THREE.Vector3(x, y, z))
            }

            x = this._vector.x * lambda2 + this._point.x
            y = this._vector.y * lambda2 + this._point.y
            z = - this.diedric.size
            if (x >= -this.diedric.size && x <= this.diedric.size && y >= -this.diedric.size && y <= this.diedric.size) {
                points.push(new THREE.Vector3(x, y, z))
            }
        }

        const pointA = points[0]
        const pointB = points[1]

        // Calculate the midpoint between the two points
        const midpoint = new THREE.Vector3().addVectors(pointA, pointB).multiplyScalar(0.5);

        // Calculate the direction vector from pointA to pointB
        const direction = new THREE.Vector3().subVectors(pointB, pointA);

        const length = direction.length();

        // Create the cylinder geometry
        const radiusTop = 0.5; // Set the top radius
        const radiusBottom = 0.5; // Set the bottom radius
        const radialSegments = 32; // Set the number of radial segments
        const heightSegments = 1; // Set the number of height segments
        const openEnded = false; // Set whether the ends are open or capped
        const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, length, radialSegments, heightSegments, openEnded);

        this.cylinder.geometry = geometry

        // Position the cylinder at the midpoint
        this.cylinder.position.copy(midpoint);

        // Align the cylinder with the direction vector
        this.cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
        this.children.map((child => child.update()))

    }
    remove() {

    }

    set hidden(value: boolean) {
        if (value == true) {
            this.diedric.scene.remove(this.cylinder)
        } else {
            this.diedric.scene.add(this.cylinder)
        }
    }

    set point(point: THREE.Vector3 | undefined) {
        this._point = point
        this.calc()
    }
    set vector(vector: THREE.Vector3 | undefined) {
        this._vector = vector
        this.calc()
    }
    get point(): THREE.Vector3 | undefined {
        return this._point
    }
    get vector(): THREE.Vector3 | undefined {
        return this._vector
    }


}


export class DiedricLine2Points extends DiedricLine {
    private _color: THREE.ColorRepresentation
    private _point1: DiedricPoint | undefined
    private _point2: DiedricPoint | undefined
    constructor(diedric: Diedric, point1: DiedricPoint | undefined, point2: DiedricPoint | undefined, color: THREE.ColorRepresentation) {

        if (point1 && point2) {
            super(diedric, new THREE.Vector3(point1.o, point1.c, point1.a), new THREE.Vector3(point1.o - point2.o, point1.c - point2.c, point1.a - point2.a), color)

        } else {
            super(diedric, undefined, undefined, color)
        }


        this._point1 = point1
        this._point2 = point2
        this._color = color

        this._point1?.children.push(this)
        this._point2?.children.push(this)
    }
    removeParent(parent: DiedricPoint) {
        if (this._point1 === parent) {
            this._point1 = undefined
        } else if (this._point2 == parent) {
            this._point2 = undefined
        }
        this.update()
    }

    remove() {

        this.point1 = undefined
        this.point2 = undefined
        super.remove()
    }
    update() {
        if (this._point1 && this._point2) {

            super.point = new THREE.Vector3(this._point1.o, this._point1.c, this._point1.a)
            super.vector = new THREE.Vector3(this._point1.o - this._point2.o, this._point1.c - this._point2.c, this._point1.a - this._point2.a)
        } else {
            super.point = undefined
            super.vector = undefined
        }
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
        if (this._point1 && this._point2) {
            super.point = new THREE.Vector3(this._point1.o, this._point1.c, this._point1.a)
            super.vector = new THREE.Vector3(this._point1.o - this._point2.o, this._point1.c - this._point2.c, this._point1.a - this._point2.a)
        } else {
            super.point = undefined
            super.vector = undefined
        }

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
        if (this._point1 && this._point2) {
            super.point = new THREE.Vector3(this._point1.o, this._point1.c, this._point1.a)
            super.vector = new THREE.Vector3(this._point1.o - this._point2.o, this._point1.c - this._point2.c, this._point1.a - this._point2.a)
        } else {
            super.point = undefined
            super.vector = undefined
        }

        if (this._point2) {
            this._point2.children.push(this)
        }
    }

    get point1() {
        return this._point1
    }

    get point2() {
        return this._point2
    }

    get color() {
        return this._color
    }
}

// export class DiedricLine2Planes extends DiedricLine {
//     constructor(diedric: Diedric, plane1: DiedricPlane, plane2: DiedricPlane, color: THREE.ColorRepresentation) {

//     }
// }