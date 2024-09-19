import * as THREE from 'three';
import { DiedricLine } from './diedricLine';
import { DiedricPlane } from './diedricPlane';
import { Diedric } from './diedric';
import { DiedricPoint } from './diedricPoint';

export class DiedricPlane2Line extends DiedricPlane {
    private _color: THREE.ColorRepresentation
    private _line1: DiedricLine | undefined
    private _line2: DiedricLine | undefined

    constructor(diedirc: Diedric, line1: DiedricLine | undefined, line2: DiedricLine | undefined, color: THREE.ColorRepresentation) {
        super(diedirc, undefined, undefined, color)

        this._color = color
        this._line1 = line1
        this._line2 = line2

        this._line1?.children.push(this)
        this._line2?.children.push(this)
        this.update()

    }
    removeParent(parent: DiedricPoint | DiedricLine) {
        if (this._line1 === parent) {
            this._line1 = undefined
        } else if (this._line2 == parent) {
            this._line2 = undefined
        }
        this.update()
    }
    remove() {
        this._line1 = undefined
        this._line2 = undefined

        super.remove()
    }

    update() {

        if (this._line1?.bVector && this._line2?.bVector && this._line1.bPoint) {
            super.normal = new THREE.Vector3().crossVectors(this._line1.bVector, this._line2.bVector).normalize();
            super.d = super.normal.x * this._line1.bPoint.x + super.normal.y * this._line1.bPoint.y + super.normal.z * this._line1.bPoint.z
        } else {
            super.normal = undefined
            super.d = undefined
        }
    }
    get color() {
        return this._color
    }
    set line1(line: DiedricLine | undefined) {
        if (this._line1) {
            let indexInChildren = this._line1.children.indexOf(this)
            if (indexInChildren == -1) {
                console.error("This should never happen", this, "is not in point3 children")
            } else {
                this._line1.children.splice(indexInChildren, 1)
            }
        }


        this._line1 = line
        this.update()

        if (this._line1) {
            this._line1.children.push(this)
        }
    }
    set line2(line: DiedricLine | undefined) {
        if (this._line2) {
            let indexInChildren = this._line2.children.indexOf(this)
            if (indexInChildren == -1) {
                console.error("This should never happen", this, "is not in point3 children")
            } else {
                this._line2.children.splice(indexInChildren, 1)
            }
        }

        this._line2 = line
        this.update()

        if (this._line2) {
            this._line2.children.push(this)
        }
    }
}
