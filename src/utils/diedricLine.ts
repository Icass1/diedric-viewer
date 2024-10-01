import { Diedric } from "./diedric";
import { DiedricLinePointParallelLine } from "./diedricLinePointParallelLine";

import * as THREE from 'three';
import { DiedricPlane2Line } from "./diedricPlane2Line";
import { DiedricPlanePointLine } from "./diedricPlanePointLine";

import * as TWO from "./two";


export class DiedricLine {
    private diedric: Diedric
    private cylinder: THREE.Mesh<THREE.CylinderGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>
    private __point: THREE.Vector3 | undefined
    private _vector: THREE.Vector3 | undefined

    horizontalProjectionLine2d: TWO.Line
    verticalProjectionLine2d: TWO.Line

    children: (DiedricPlanePointLine | DiedricLinePointParallelLine | DiedricPlane2Line)[] = []

    constructor(diedric: Diedric, point: THREE.Vector3 | undefined, vector: THREE.Vector3 | undefined, color: THREE.ColorRepresentation) {

        this.diedric = diedric
        this.__point = point
        this._vector = vector

        const geometry = new THREE.CylinderGeometry()

        // Create the cylinder material
        const material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide, transparent: true, opacity: 1 });

        // Create the cylinder mesh
        this.cylinder = new THREE.Mesh(geometry, material);

        this.horizontalProjectionLine2d = new TWO.Line({ color: color.toString(), width: 1 })
        this.verticalProjectionLine2d = new TWO.Line({ color: color.toString(), width: 1 })

        // Add the cylinder to the scene
        this.diedric.scene.add(this.cylinder);
        this.diedric.canvas2d.add(this.horizontalProjectionLine2d)
        this.diedric.canvas2d.add(this.verticalProjectionLine2d)
        this.calc()
    }
    calc() {
        if (!(this._vector && this.__point)) {
            this.hidden = true
            this.children.map((child => child.update()))
            return
        }
        this.hidden = false

        let lambda1
        let lambda2

        let horizontalProjectionPoints = []
        let verticalProjectionPoints = []

        console.log(this._vector)
        let points: THREE.Vector3[] = []
        if (this._vector.x != 0) {
            lambda1 = (this.diedric.size - this.__point.x) / this._vector.x
            lambda2 = (-this.diedric.size - this.__point.x) / this._vector.x

            let x
            let y
            let z

            x = this.diedric.size
            y = this._vector.y * lambda1 + this.__point.y
            z = this._vector.z * lambda1 + this.__point.z
            // For 3D line
            if (y >= -this.diedric.size && y <= this.diedric.size && z >= -this.diedric.size && z <= this.diedric.size) points.push(new THREE.Vector3(x, y, z))

            // For 2D line
            if (y >= -this.diedric.size && y <= this.diedric.size) { verticalProjectionPoints.push(new THREE.Vector2(x, -y)); console.log("1") }
            if (z >= -this.diedric.size && z <= this.diedric.size) { horizontalProjectionPoints.push(new THREE.Vector2(x, z)); console.log("2") }

            x = -this.diedric.size
            y = this._vector.y * lambda2 + this.__point.y
            z = this._vector.z * lambda2 + this.__point.z
            // For 3D line
            if (y >= -this.diedric.size && y <= this.diedric.size && z >= -this.diedric.size && z <= this.diedric.size) points.push(new THREE.Vector3(x, y, z))

            // For 2D line
            if (y >= -this.diedric.size && y <= this.diedric.size) { verticalProjectionPoints.push(new THREE.Vector2(x, -y)); console.log("3") }
            if (z >= -this.diedric.size && z <= this.diedric.size) { horizontalProjectionPoints.push(new THREE.Vector2(x, z)); console.log("4") }
        }
        if (this._vector.y != 0) {
            lambda1 = (this.diedric.size - this.__point.y) / this._vector.y
            lambda2 = (-this.diedric.size - this.__point.y) / this._vector.y

            let x
            let y
            let z

            x = this._vector.x * lambda1 + this.__point.x
            y = this.diedric.size
            z = this._vector.z * lambda1 + this.__point.z
            // For 3D line
            if (x >= -this.diedric.size && x <= this.diedric.size && z >= -this.diedric.size && z <= this.diedric.size) points.push(new THREE.Vector3(x, y, z))

            // For 2D line
            if (x >= -this.diedric.size && x <= this.diedric.size) {
                if (z >= -this.diedric.size && z <= this.diedric.size) {
                    horizontalProjectionPoints.push(new THREE.Vector2(x, z))
                    console.log("5")
                }
                verticalProjectionPoints.push(new THREE.Vector2(x, -y))
                console.log("6")
            }

            x = this._vector.x * lambda2 + this.__point.x
            y = -this.diedric.size
            z = this._vector.z * lambda2 + this.__point.z
            // For 3D line
            if (x >= -this.diedric.size && x <= this.diedric.size && z >= -this.diedric.size && z <= this.diedric.size) points.push(new THREE.Vector3(x, y, z))

            // For 2D line
            if (x >= -this.diedric.size && x <= this.diedric.size) {
                if (z >= -this.diedric.size && z <= this.diedric.size) {
                    horizontalProjectionPoints.push(new THREE.Vector2(x, z))
                    console.log("7")
                }
                verticalProjectionPoints.push(new THREE.Vector2(x, -y))
                console.log("8")
            }
        }
        if (this._vector.z != 0) {
            lambda1 = (this.diedric.size - this.__point.z) / this._vector.z
            lambda2 = (-this.diedric.size - this.__point.z) / this._vector.z

            let x
            let y
            let z

            x = this._vector.x * lambda1 + this.__point.x
            y = this._vector.y * lambda1 + this.__point.y
            z = this.diedric.size
            // For 3D line
            if (x >= -this.diedric.size && x <= this.diedric.size && y >= -this.diedric.size && y <= this.diedric.size) points.push(new THREE.Vector3(x, y, z))

            // For 2D line
            if (x >= -this.diedric.size && x <= this.diedric.size) {
                if (y >= -this.diedric.size && y <= this.diedric.size) {
                    verticalProjectionPoints.push(new THREE.Vector2(x, -y))
                    console.log("9")
                }
                horizontalProjectionPoints.push(new THREE.Vector2(x, z))
                console.log("10")
            }

            x = this._vector.x * lambda2 + this.__point.x
            y = this._vector.y * lambda2 + this.__point.y
            z = - this.diedric.size
            // For 3D line
            if (x >= -this.diedric.size && x <= this.diedric.size && y >= -this.diedric.size && y <= this.diedric.size) points.push(new THREE.Vector3(x, y, z))

            // For 2D line
            if (x >= -this.diedric.size && x <= this.diedric.size) {
                if (y >= -this.diedric.size && y <= this.diedric.size) {
                    verticalProjectionPoints.push(new THREE.Vector2(x, -y))
                    console.log("11")
                }
                horizontalProjectionPoints.push(new THREE.Vector2(x, z))
                console.log("12")
            }
        }

        const pointA = points[0]
        const pointB = points[1]

        console.log(this.verticalProjectionLine2d.color, "verticalProjectionPoints", [...verticalProjectionPoints])
        console.log(this.verticalProjectionLine2d.color, "horizontalProjectionPoints", [...horizontalProjectionPoints])
        // console.log(points)

        this.verticalProjectionLine2d.start = verticalProjectionPoints[0]
        this.verticalProjectionLine2d.end = verticalProjectionPoints[1]

        this.horizontalProjectionLine2d.start = horizontalProjectionPoints[0]
        this.horizontalProjectionLine2d.end = horizontalProjectionPoints[1]

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
        console.warn("remove line")
        console.warn("implementation missing")

    }
    getSuper() {
        return this
    }
    set hidden(value: boolean) {
        if (value == true) {
            this.diedric.scene.remove(this.cylinder)
        } else {
            this.diedric.scene.add(this.cylinder)
        }
    }

    set bPoint(point: THREE.Vector3 | undefined) {
        this.__point = point
        this.calc()
    }
    set bVector(vector: THREE.Vector3 | undefined) {
        this._vector = vector
        this.calc()
    }
    get bPoint(): THREE.Vector3 | undefined {
        return this.__point
    }
    get bVector(): THREE.Vector3 | undefined {
        return this._vector
    }
}
