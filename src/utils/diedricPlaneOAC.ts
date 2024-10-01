import * as THREE from 'three';
import { DiedricLine } from './diedricLine';
import { DiedricPlane } from './diedricPlane';
import { Diedric } from './diedric';
import { DiedricPoint } from './diedricPoint';

export class DiedricPlaneOAC extends DiedricPlane {
    private _color: THREE.ColorRepresentation
    private _o: number | undefined
    private _a: number | undefined
    private _c: number | undefined

    static type = 'plane-oac'
    static params = {
        'o': "number",
        'a': "number",
        'c': "number",
    }

    constructor({ diedric, o, a, c, color }: { diedric: Diedric, o: number | undefined, a: number | undefined, c: number | undefined, color: THREE.ColorRepresentation }) {
        super(diedric, undefined, undefined, color)

        this._color = color
        this._o = o
        this._a = a
        this._c = c

        this.update()
    }

    remove() {
        super.remove()
    }

    update() {


        // if (this._line1?.bVector && this._line2?.bVector && this._line1.bPoint) {
        //     super.normal = new THREE.Vector3().crossVectors(this._line1.bVector, this._line2.bVector).normalize();
        //     super.d = super.normal.x * this._line1.bPoint.x + super.normal.y * this._line1.bPoint.y + super.normal.z * this._line1.bPoint.z
        // } else {
        //     super.normal = undefined
        //     super.d = undefined
        // }
    }
    get color() {
        return this._color
    }
    set o(o: number | undefined) {
        // if (this._line1) {
        //     let indexInChildren = this._line1.children.indexOf(this)
        //     if (indexInChildren == -1) {
        //         console.error("This should never happen", this, "is not in point3 children")
        //     } else {
        //         this._line1.children.splice(indexInChildren, 1)
        //     }
        // }

        // this._line1 = line
        // this.update()

        // if (this._line1) {
        //     this._line1.children.push(this)
        // }
    }
    set a(a: number | undefined) {
        // if (this._line2) {
        //     let indexInChildren = this._line2.children.indexOf(this)
        //     if (indexInChildren == -1) {
        //         console.error("This should never happen", this, "is not in point3 children")
        //     } else {
        //         this._line2.children.splice(indexInChildren, 1)
        //     }
        // }

        // this._line2 = line
        // this.update()

        // if (this._line2) {
        //     this._line2.children.push(this)
        // }
    }
    set c(c: number | undefined) {
    }
}
