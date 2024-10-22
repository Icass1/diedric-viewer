import { degToRad } from "three/src/math/MathUtils.js";
import { Diedric } from "./diedric";
import { DiedricLine } from "./diedricLine"
import { DiedricPlane } from "./diedricPlane";
import { DiedricPoint } from "./diedricPoint"
import * as THREE from 'three';

export class DiedricLinePointPlaneLineAngle extends DiedricLine {

    private _point: DiedricPoint | undefined
    private _plane: DiedricPlane | undefined
    private _line: DiedricLine | undefined
    private _angle: number | undefined
    private _diedric: Diedric

    static type = 'line-pto-plane-line-angle'
    public type = 'line-pto-plane-line-angle'
    static params: any = {
        'point': DiedricPoint,
        'plane': DiedricPlane,
        'line': DiedricLine,
        'angle': 'number',
    }

    constructor({ diedric, point, plane, line, angle, color }: { diedric: Diedric, point: DiedricPoint | undefined, plane: DiedricPlane | undefined, line: DiedricLine | undefined, angle: number | undefined, color: THREE.ColorRepresentation }) {

        super(diedric, undefined, undefined, color)
        
        this._diedric = diedric

        this._point = point
        this._plane = plane
        this._line = line
        this._angle = angle

        this._point?.children.push(this)
        this._plane?.children.push(this)
        this._line?.children.push(this)

    }
    removeParent(parent: DiedricPoint | DiedricPlane | DiedricLine) {
        if (this._point === parent) {
            this._point = undefined
        } else if (this._plane == parent) {
            this._plane = undefined
        } else if (this._line == parent) {
            this._line = undefined
        }
    }

    remove() {
        this.point = undefined
        this.plane = undefined
        this.line = undefined
        super.remove()
    }
    update() {
        this._diedric.log("DiedricLinePointPerpendicularPlane update")

        if (
            this._point?.o !== undefined &&
            this._point?.a !== undefined &&
            this._point?.c !== undefined &&
            this._plane?.normal !== undefined &&
            this._plane?.d !== undefined &&
            this._line?.bPoint !== undefined &&
            this._line?.bVector !== undefined &&
            this._angle !== undefined
        ) {

            // Define the point you want to rotate.
            const _point = new THREE.Vector3().copy(this._line.bVector).add(new THREE.Vector3(this._point.o, this._point.c, this._point.a)); // Replace x, y, z with your point coordinates

            // Define a point on the line (A) and the line's direction (L).
            const linePoint = new THREE.Vector3(this._point.o, this._point.c, this._point.a); // Replace ax, ay, az with line point coordinates

            const lineDirection = new THREE.Vector3().copy(this._plane.normal)

            // Step 1: Translate point to the origin relative to the line.
            _point.sub(linePoint);

            // Step 2: Create a quaternion for rotation around the line direction.
            const quaternion = new THREE.Quaternion();
            quaternion.setFromAxisAngle(lineDirection, degToRad(this._angle));

            // Step 3: Apply the rotation to the point.
            _point.applyQuaternion(quaternion);

            // Step 4: Translate the point back to the original position.
            _point.add(linePoint);

            super.bPoint = new THREE.Vector3(this._point.o, this._point.c, this._point.a)
            super.bVector = _point.addScaledVector(super.bPoint, -1)

        } else {
            super.bPoint = undefined
            super.bVector = undefined
        }
        super.calc()

    }
    set point(point: DiedricPoint | undefined) {

        if (this._point) {
            let indexInChildren = this._point.children.indexOf(this)
            if (indexInChildren == -1) {
                console.error("This should never happen", this, "is not in point1 children")
            } else {
                this._point.children.splice(indexInChildren, 1)
            }
        }

        this._point = point

        if (this._point) {
            this._point.children.push(this)
        }
    }

    set plane(plane: DiedricPlane | undefined) {
        if (this._plane) {
            let indexInChildren = this._plane.children.indexOf(this)
            if (indexInChildren == -1) {
                console.error("This should never happen", this, "is not in point2 children")
            } else {
                this._plane.children.splice(indexInChildren, 1)
            }
        }

        this._plane = plane

        if (this._plane) {
            this._plane.children.push(this)
        }
    }

    set line(line: DiedricLine | undefined) {
        if (this._line) {
            let indexInChildren = this._line.children.indexOf(this)
            if (indexInChildren == -1) {
                console.error("This should never happen", this, "is not in point2 children")
            } else {
                this._line.children.splice(indexInChildren, 1)
            }
        }

        this._line = line

        if (this._line) {
            this._line.children.push(this)
        }
    }

    get point(): DiedricPoint | undefined {
        return this._point
    }

    get plane() {
        return this._plane
    }
}