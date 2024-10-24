import * as THREE from 'three';
import { DiedricLine } from './diedricLine';
import { DiedricPlane } from './diedricPlane';
import { Diedric } from './diedric';
import { DiedricPoint } from './diedricPoint';

export class DiedricPlane2Line extends DiedricPlane {
    private _line1: DiedricLine | undefined
    private _line2: DiedricLine | undefined
    private _diedric: Diedric

    static type = 'plane-2-line'
    public type = 'plane-2-line'
    static params: any = {
        'line1': DiedricLine,
        'line2': DiedricLine
    }

    constructor({ diedric, line1, line2, color }: { diedric: Diedric, line1: DiedricLine | undefined, line2: DiedricLine | undefined, color: THREE.ColorRepresentation }) {
        super(diedric, undefined, undefined, color)
        this._diedric = diedric

        this._line1 = line1
        this._line2 = line2

        this._line1?.children.push(this)
        this._line2?.children.push(this)

    }
    removeParent(parent: DiedricPoint | DiedricLine) {
        if (this._line1 === parent) {
            this._line1 = undefined
        } else if (this._line2 == parent) {
            this._line2 = undefined
        }
    }
    remove() {
        this._line1 = undefined
        this._line2 = undefined

        super.remove()
    }

    update() {
        this._diedric.log("DiedricPlane2Line update")

        if (this._line1?.bVector && this._line2?.bVector && this._line1.bPoint) {
            super.normal = new THREE.Vector3().crossVectors(this._line1.bVector, this._line2.bVector).normalize();
            super.d = super.normal.x * this._line1.bPoint.x + super.normal.y * this._line1.bPoint.y + super.normal.z * this._line1.bPoint.z
        } else {
            super.normal = undefined
            super.d = undefined
        }
        super.calc()
    
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

        if (this._line2) {
            this._line2.children.push(this)
        }
    }
}
