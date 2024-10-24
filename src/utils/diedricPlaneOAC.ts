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

    private _o: number | undefined
    private _a: number | undefined
    private _c: number | undefined

    private __diedric: Diedric

    static params: any = {
        'o': "number",
        'a': "number",
        'c': "number",
    }

    constructor({ diedric, o, a, c, color }: { diedric: Diedric, o: number | undefined, a: number | undefined, c: number | undefined, color: THREE.ColorRepresentation }) {
        super({ diedric: diedric, point1: undefined, point2: undefined, point3: undefined, color: color })

        this.__diedric = diedric

        this._pointO = new DiedricPoint({ diedric: diedric, o: o, a: 0, c: 0, color: color })
        this._pointO.hidden = true
        super.point1 = this._pointO

        this._pointA = new DiedricPoint({ diedric: diedric, o: 0, a: a, c: 0, color: color })
        this._pointA.hidden = true
        super.point2 = this._pointA

        this._pointC = new DiedricPoint({ diedric: diedric, o: 0, a: 0, c: c, color: color })
        this._pointC.hidden = true
        super.point3 = this._pointC

        this._o = o
        this._a = a
        this._c = c
    }

    setAttributes(attr: { o: number | undefined, a: number | undefined, c: number | undefined, color: THREE.ColorRepresentation }) {
        this._pointO.o = attr.o
        this._pointA.a = attr.a
        this._pointC.c = attr.c

        this._o = attr.o
        this._a = attr.a
        this._c = attr.c

        super.update()
        super.calc()
    }

    remove() {
        super.remove()
    }

    update() {
        this.__diedric.log("DiedricPlaneOAC update")
        super.update()
        super.calc()
    }


    get o() {
        return this._o
    }
    get a() {
        return this._a
    }
    get c() {
        return this._c
    }
}
