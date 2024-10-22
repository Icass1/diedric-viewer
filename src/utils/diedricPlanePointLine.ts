import * as THREE from 'three';
import { DiedricPoint } from './diedricPoint';
import { DiedricLine } from './diedricLine';
import { DiedricPlane } from './diedricPlane';
import { Diedric } from './diedric';

export class DiedricPlanePointLine extends DiedricPlane {

    private _point: DiedricPoint | undefined
    private _line: DiedricLine | undefined
    private _diedric: Diedric

    static type = "plane-point-line"
    public type = "plane-point-line"
    static params: any = { 'point': DiedricPoint, 'line': DiedricLine }

    constructor({ diedric, point, line, color }: { diedric: Diedric, point: DiedricPoint | undefined, line: DiedricLine | undefined, color: THREE.ColorRepresentation }) {

        super(diedric, undefined, undefined, color)

        this._diedric = diedric

        this._point = point
        this._line = line

        this._point?.children.push(this)
        this._line?.children.push(this)

    }
    removeParent(parent: DiedricPoint | DiedricLine) {
        if (this._point === parent) {
            this._point = undefined
        } else if (this._line == parent) {
            this._line = undefined
        }
    }
    remove() {
        this._point = undefined
        this._line = undefined

        super.remove()
    }

    update() {
        this._diedric.log("DiedricPlanePointLine update")

        if (this._point && this._line?.bPoint && this._line?.bVector) {

            const pointA = new THREE.Vector3(this._point.o, this._point.c, this._point.a)
            const pointB = this._line.bPoint
            const pointC = new THREE.Vector3().copy(this._line.bPoint).add(this._line.bVector)

            const vector1 = new THREE.Vector3().subVectors(pointB, pointA);
            const vector2 = new THREE.Vector3().subVectors(pointC, pointA);

            super.normal = new THREE.Vector3().crossVectors(vector1, vector2).normalize();

            super.d = super.normal.x * pointA.x + super.normal.y * pointA.y + super.normal.z * pointA.z

        } else {
            super.normal = undefined
            super.d = undefined
        }
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

        if (this._line) {
            this._line.children.push(this)
        }
    }
}