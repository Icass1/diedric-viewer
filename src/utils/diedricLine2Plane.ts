import * as THREE from 'three';
import { DiedricPlane } from './diedricPlane';
import { Diedric } from './diedric';
import { DiedricLine } from './diedricLine';

export class DiedricLine2Plane extends DiedricLine {

    private _color: THREE.ColorRepresentation
    private _plane1: DiedricPlane | undefined
    private _plane2: DiedricPlane | undefined

    static params = { 'plane1': DiedricPlane, 'plane2': DiedricPlane }
    static type = "line-2-plane"

    constructor({ diedric, plane1, plane2, color }: { diedric: Diedric, plane1: DiedricPlane | undefined, plane2: DiedricPlane | undefined, color: THREE.ColorRepresentation }) {

        super(diedric, undefined, undefined, color)

        this._plane1 = plane1
        this._plane2 = plane2
        this._color = color

        this._plane1?.children.push(this)
        this._plane2?.children.push(this)
        this.update()

    }
    removeParent(parent: DiedricPlane) {
        if (this._plane1 === parent) {
            this._plane1 = undefined
        } else if (this._plane2 == parent) {
            this._plane2 = undefined
        }
        this.update()
    }

    remove() {

        this.plane1 = undefined
        this.plane2 = undefined
        super.remove()
    }
    update() {
        if (this._plane1?.normal && this._plane2?.normal && this._plane1.d && this._plane2.d) {
            // super.bPoint = new THREE.Vector3(this._point.o, this._point.c, this._point.a)
            super.bVector = new THREE.Vector3().crossVectors(this._plane1?.normal, this._plane2.normal)

            if (super.bVector.x !== 0) {

                let x = 0
                let y
                let z

                z = (this._plane2.d + (this._plane2.normal.y * -this._plane1.d) / (this._plane1.normal.y)) / (this._plane2.normal.z - (this._plane1.normal.z * this._plane2.normal.y) / this._plane1.normal.y)
                y = (this._plane1.d - this._plane1.normal.z * z) / this._plane1.normal.y
                super.bPoint = new THREE.Vector3(x, y, z)

            } else {
                console.warn("Case not implemented")
                super.bPoint = new THREE.Vector3(0, 0, 0)
            }



        } else {
            super.bPoint = undefined
            super.bVector = undefined
        }
    }
    set plane1(plane: DiedricPlane | undefined) {

        if (this._plane1) {
            let indexInChildren = this._plane1.children.indexOf(this)
            if (indexInChildren == -1) {
                console.error("This should never happen", this, "is not in point1 children")
            } else {
                this._plane1.children.splice(indexInChildren, 1)
            }
        }

        this._plane1 = plane

        this.update()

        if (this._plane1) {
            this._plane1.children.push(this)
        }
    }

    set plane2(plane: DiedricPlane | undefined) {
        if (this._plane2) {
            let indexInChildren = this._plane2.children.indexOf(this)
            if (indexInChildren == -1) {
                console.error("This should never happen", this, "is not in point2 children")
            } else {
                this._plane2.children.splice(indexInChildren, 1)
            }
        }

        this._plane2 = plane
        this.update()

        if (this._plane2) {
            this._plane2.children.push(this)
        }
    }

    get plane1(): DiedricPlane | undefined {
        return this._plane1
    }

    get plane2(): DiedricPlane | undefined {
        return this._plane2
    }

    get color() {
        return this._color
    }
}