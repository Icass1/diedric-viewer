import * as THREE from 'three';
import { DiedricPoint } from './diedricPoint';
import { DiedricLine } from './diedricLine';
import { Diedric } from './diedric';
import { DiedricPlane } from './diedricPlane';
import { intersectionLinePlane } from './intersections';

export class DiedricPointIntersectLinePlane extends DiedricPoint {

    private _plane: DiedricPlane | undefined
    private _line: DiedricLine | undefined

    static type = "point-intersect-line-plane"
    public type = "point-intersect-line-plane"
    static params: any = {
        'plane': DiedricPlane,
        'line': DiedricLine
    }

    constructor({ diedric, line, plane, color }: { diedric: Diedric, plane: DiedricPlane | undefined, line: DiedricLine | undefined, color: THREE.ColorRepresentation }) {

        super({ diedric: diedric, o: undefined, a: undefined, c: undefined, color: color })

        this._plane = plane
        this._line = line

        this._plane?.children.push(this)
        this._line?.children.push(this)

    }
    removeParent(parent: DiedricPlane | DiedricLine) {
        if (this._plane === parent) {
            this._plane = undefined
        } else if (this._line == parent) {
            this._line = undefined
        }
    }
    remove() {
        this._plane = undefined
        this._line = undefined

        super.remove()
    }

    update() {
        console.log("DiedricPointIntersectLinePlane update")
        if (this._plane?.normal && this._plane?.d && this._line?.bPoint && this._line.bVector) {

            let result = intersectionLinePlane(this._line, this._plane)
            super.o = result.o
            super.a = result.a
            super.c = result.c
            super.calc()
        }

    }
}