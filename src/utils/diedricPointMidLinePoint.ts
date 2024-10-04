import * as THREE from 'three';
import { DiedricPoint } from './diedricPoint';
import { DiedricLine } from './diedricLine';
import { Diedric } from './diedric';

export class DiedricPointMidLinePoint extends DiedricPoint {

    private _point: DiedricPoint | undefined
    private _line: DiedricLine | undefined

    static type = "point-mid-line-point"
    public type = "point-mid-line-point"
    static params: any = {
        'point': DiedricPoint,
        'line': DiedricLine
    }

    constructor({ diedric, point, line, color }: { diedric: Diedric, point: DiedricPoint | undefined, line: DiedricLine | undefined, color: THREE.ColorRepresentation }) {

        super({ diedric: diedric, o: undefined, a: undefined, c: undefined, color: color })

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
        this.update()
    }
    remove() {
        this._point = undefined
        this._line = undefined

        super.remove()
        console.warn("Remove")
    }

    update() {
        console.log("DiedricPointMidLinePoint update")

        if (this._point?.o !== undefined && this._point?.a !== undefined && this._point?.c !== undefined && this._line?.bVector !== undefined && this._line?.bPoint !== undefined) {
            this._point.o
            this._point.a
            this._point.c

            this._line.bVector
            this._line.bPoint

            const d = this._line.bVector.x * this._point.o + this._line.bVector.y * this._point.c + this._line.bVector.z * this._point.a
            const t = (d - this._line.bVector.x * this._line.bPoint.x - this._line.bVector.y * this._line.bPoint.y - this._line.bVector.z * this._line.bPoint.z) / (this._line.bVector.x ** 2 + this._line.bVector.y ** 2 + this._line.bVector.z ** 2)

            const x = this._line.bVector.x * t + this._line.bPoint.x
            const y = this._line.bVector.z * t + this._line.bPoint.z
            const z = this._line.bVector.y * t + this._line.bPoint.y

            const midX = (this._point.o + x) / 2
            const midY = (this._point.a + y) / 2
            const midZ = (this._point.c + z) / 2

            super.o = midX
            super.a = midY
            super.c = midZ
        } else {
            super.o = undefined
            super.a = undefined
            super.c = undefined
        }
        super.calc()
    }
}