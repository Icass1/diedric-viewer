import * as THREE from 'three';
import { Diedric } from './diedric';
import { DiedricPlane3Point } from './diedricPlane3Point';
import { DiedricPoint } from './diedricPoint';

export class DiedricPlaneOAC extends DiedricPlane3Point {
    private _pointO: DiedricPoint
    private _pointA: DiedricPoint
    private _pointC: DiedricPoint

    static type = 'plane-oac'
    public type = 'plane-oac'
    static params: any = {
        'o': "number",
        'a': "number",
        'c': "number",
    }

    constructor({ diedric, o, a, c, color }: { diedric: Diedric, o: number | undefined, a: number | undefined, c: number | undefined, color: THREE.ColorRepresentation }) {
        super({ diedric: diedric, point1: undefined, point2: undefined, point3: undefined, color: color })

        this._pointO = new DiedricPoint({ diedric: diedric, o: o, a: 0, c: 0, color: color })
        this._pointO.hidden = true
        super.point1 = this._pointO

        this._pointA = new DiedricPoint({ diedric: diedric, o: 0, a: a, c: 0, color: color })
        this._pointA.hidden = true
        super.point2 = this._pointA

        this._pointC = new DiedricPoint({ diedric: diedric, o: 0, a: 0, c: c, color: color })
        this._pointC.hidden = true
        super.point3 = this._pointC

        console.log("DiedricPlaneOAC constructor")
    }

    setAttributes(attr: { o: number | undefined, a: number | undefined, c: number | undefined, color: THREE.ColorRepresentation }) {

        this._pointO.o = attr.o
        this._pointA.a = attr.a
        this._pointC.c = attr.c

        super.update()
    }

    remove() {
        super.remove()
    }

    update() {
        console.log("DiedricPlaneOAC update")
        super.update()
    }
    get color() {
        return super.color
    }

}
