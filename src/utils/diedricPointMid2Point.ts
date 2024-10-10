import * as THREE from 'three';
import { DiedricPoint } from './diedricPoint';
import { Diedric } from './diedric';

export class DiedricPointMid2Point extends DiedricPoint {

    private _point1: DiedricPoint | undefined
    private _point2: DiedricPoint | undefined

    static type = "point-mid-2-point"
    public type = "point-mid-2-point"
    static params: any = {
        'point1': DiedricPoint,
        'point2': DiedricPoint
    }

    constructor({ diedric, point1, point2, color }: { diedric: Diedric, point1: DiedricPoint | undefined, point2: DiedricPoint | undefined, color: THREE.ColorRepresentation }) {

        super({ diedric: diedric, o: undefined, a: undefined, c: undefined, color: color })

        this._point1 = point1
        this._point2 = point2

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
        this._point1 = undefined
        this._point2 = undefined

        super.remove()
        console.warn("Remove")
    }

    update() {
        console.log("DiedricPointMid2Point update")

        if (this._point1?.o !== undefined && this._point1?.a !== undefined && this._point1?.c !== undefined && this._point2?.o !== undefined && this._point2?.a !== undefined && this._point2?.c !== undefined) {


            console.log((this._point1.o + this._point2.o) / 2)
            console.log((this._point1.a + this._point2.a) / 2)
            console.log((this._point1.c + this._point2.c) / 2)

            super.o = (this._point1.o + this._point2.o) / 2
            super.a = (this._point1.a + this._point2.a) / 2
            super.c = (this._point1.c + this._point2.c) / 2
            super.update()
            super.calc()
        } else {
            super.o = undefined
            super.a = undefined
            super.c = undefined
        }
        super.calc()
    }
}