import { BufferGeometry } from "three/webgpu";
import { Diedric } from "./diedric";
import { DiedricPlane } from "./diedricPlane";
import { DiedricPoint } from "./diedricPoint";

import * as THREE from 'three';

export class DiedricLine {
    private diedric: Diedric
    private cylinder: THREE.Mesh<THREE.CylinderGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>
    private _point: THREE.Vector3
    private _vector: THREE.Vector3

    constructor(diedric: Diedric, point: THREE.Vector3, vector: THREE.Vector3, color: THREE.ColorRepresentation) {

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
    }
    set hidden(value: boolean) {
        if (value == true) {
            this.diedric.scene.remove(this.cylinder)
        } else {
            this.diedric.scene.add(this.cylinder)
        }
    }

    set point(point: THREE.Vector3) {
        this._point = point
        this.calc()
    }
    set vector(vector: THREE.Vector3) {
        this._vector = vector
        this.calc()
    }
}


export class DiedricLine2Points extends DiedricLine {
    private _color: THREE.ColorRepresentation
    private _point1: DiedricPoint
    private _point2: DiedricPoint
    constructor(diedric: Diedric, point1: DiedricPoint, point2: DiedricPoint, color: THREE.ColorRepresentation) {
        super(diedric, new THREE.Vector3(point1.o, point1.c, point1.a), new THREE.Vector3(point1.o - point2.o, point1.c - point2.c, point1.a - point2.a), color)

        this._point1 = point1
        this._point2 = point2
        this._color = color
    }
    remove() {
        super.remove()
    }
    update() {
        super.point = new THREE.Vector3(this._point1.o, this._point1.c, this._point1.a)
        super.vector = new THREE.Vector3(this._point1.o - this._point2.o, this._point1.c - this._point2.c, this._point1.a - this._point2.a)
    }
    set point1(point: DiedricPoint) {
        this._point1 = point
        super.point = new THREE.Vector3(this._point1.o, this._point1.c, this._point1.a)
        super.vector = new THREE.Vector3(this._point1.o - this._point2.o, this._point1.c - this._point2.c, this._point1.a - this._point2.a)
    }

    set point2(point: DiedricPoint) {
        this._point2 = point
        super.point = new THREE.Vector3(this._point1.o, this._point1.c, this._point1.a)
        super.vector = new THREE.Vector3(this._point1.o - this._point2.o, this._point1.c - this._point2.c, this._point1.a - this._point2.a)
    }

    get color() {
        return this._color
    }
}

export class DiedricLine2Planes extends DiedricLine {
    constructor(diedric: Diedric, plane1: DiedricPlane, plane2: DiedricPlane, color: THREE.ColorRepresentation) {

    }
}