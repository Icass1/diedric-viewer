import { Diedric } from "./diedric";
import { DiedricLine } from "./diedricLine"
import { DiedricPoint } from "./diedricPoint"
import * as THREE from 'three';

export class DiedricLinePointParallelLine extends DiedricLine {

    private _color: THREE.ColorRepresentation
    private _point: DiedricPoint | undefined
    private _line: DiedricLine | undefined

    static type = 'line-pto-par-line'
    static params = {
        'point': DiedricPoint,
        'line': DiedricLine
    }

    constructor({ diedric, point, line, color }: { diedric: Diedric, point: DiedricPoint | undefined, line: DiedricLine | undefined, color: THREE.ColorRepresentation }) {

        super(diedric, undefined, undefined, color)

        this._point = point
        this._line = line
        this._color = color

        this._point?.children.push(this)
        this._line?.children.push(this)
        this.update()

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

        this.point = undefined
        this.line = undefined
        super.remove()
    }
    update() {
        if (this._point && this._line?.bVector) {
            super.bPoint = new THREE.Vector3(this._point.o, this._point.c, this._point.a)
            super.bVector = new THREE.Vector3().copy(this._line.bVector)
        } else {
            super.bPoint = undefined
            super.bVector = undefined
        }
    }
    set point(point: DiedricPoint | undefined) {

        if (this._point) {
            let indexInChildren = this._point.children.indexOf(this)
            if (indexInChildren == -1) {
                console.error("This should never happen", this, "is not in point1 children")
            } else {
                this._point.children.splice(indexInChildren, 1)
            }
        }

        this._point = point

        this.update()

        if (this._point) {
            this._point.children.push(this)
        }
    }

    set line(line: DiedricLine | undefined) {
        if (this._line) {
            let indexInChildren = this._line.children.indexOf(this)
            if (indexInChildren == -1) {
                console.error("This should never happen", this, "is not in point2 children")
            } else {
                this._line.children.splice(indexInChildren, 1)
            }
        }

        this._line = line
        this.update()

        if (this._line) {
            this._line.children.push(this)
        }
    }

    get point(): DiedricPoint | undefined {
        return this._point
    }

    get line() {
        return this._line
    }

    get color() {
        return this._color
    }
}