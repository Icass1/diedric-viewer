import * as THREE from 'three';
import { DiedricPoint } from './diedricPoint';
import { DiedricLine } from './diedricLine';
import { Diedric } from './diedric';

export class DiedricPoint2Line extends DiedricPoint {

    private _line1: DiedricLine | undefined
    private _line2: DiedricLine | undefined

    static type = "point-2-line"
    public type = "point-2-line"
    static params: any = {
        'line1': DiedricLine,
        'line2': DiedricLine
    }

    constructor({ diedric, line1, line2, color }: { diedric: Diedric, line1: DiedricLine | undefined, line2: DiedricLine | undefined, color: THREE.ColorRepresentation }) {

        super({ diedric: diedric, o: undefined, a: undefined, c: undefined, color: color })

        this._line1 = line1
        this._line2 = line2

        this._line1?.children.push(this)
        this._line2?.children.push(this)

    }
    removeParent(parent: DiedricLine) {
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
        console.log("DiedricPoint2Line update")
        if (
            this._line1?.bPoint &&
            this._line1?.bVector &&
            this._line2?.bPoint &&
            this._line2.bVector
        ) {

            const mu = (this._line2.bPoint.y * this._line1.bVector.x - this._line1.bPoint.y * this._line1.bVector.x - this._line1.bVector.y * this._line2.bPoint.x + this._line1.bVector.y * this._line1.bPoint.x) / (this._line1.bVector.y * this._line2.bVector.x - this._line2.bVector.y * this._line1.bVector.x)
            // const lambda = (this._line2.bPoint.y + mu * this._line2.bVector.x - this._line1.bPoint.x) / (this._line1.bVector.x)
            // console.log(mu, lambda)
            const point = new THREE.Vector3().add(this._line2.bPoint).addScaledVector(this._line2.bVector, mu)

            // let result = intersectionLinePlane(this._line, this._plane)
            super.o = point.x
            super.a = point.z
            super.c = point.y
            super.calc()
        }

    }
}