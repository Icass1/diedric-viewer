import * as THREE from 'three';
import { DiedricPoint } from './diedricPoint';
import { Diedric } from './diedric';
import { DiedricLine } from './diedricLine';

export class DiedricLine2Point extends DiedricLine {

    private _point1: DiedricPoint | undefined
    private _point2: DiedricPoint | undefined
    private _diedric: Diedric

    static params: any = { 'point1': DiedricPoint, 'point2': DiedricPoint }
    static type = "line-2-pto"
    public type = "line-2-pto"

    constructor({ diedric, point1, point2, color }: { diedric: Diedric, point1: DiedricPoint | undefined, point2: DiedricPoint | undefined, color: THREE.ColorRepresentation }) {

        super(diedric, undefined, undefined, color)

        this._diedric = diedric

        this._point1 = point1
        this._point2 = point2

        this._point1?.children.push(this)
        this._point2?.children.push(this)
    }
    removeParent(parent: DiedricPoint) {
        this._diedric.log("DiedricLine2Point removeParent", parent)
        if (this._point1 === parent) {
            this._diedric.log("Parent is point1")
            this._point1 = undefined
        } else if (this._point2 == parent) {
            this._diedric.log("Parent is point2")
            this._point2 = undefined
        }
        this.update()
    }

    remove() {
        this.point1 = undefined
        this.point2 = undefined
        super.remove()
    }
    update() {
        this._diedric.log("DiedricLine2Point update")
        if (this._point1?.o !== undefined && this._point1?.a !== undefined && this._point1?.c !== undefined && this._point2?.o !== undefined && this._point2?.a !== undefined && this._point2?.c !== undefined) {
            super.bPoint = new THREE.Vector3(this._point1.o, this._point1.c, this._point1.a)
            super.bVector = new THREE.Vector3(this._point1.o - this._point2.o, this._point1.c - this._point2.c, this._point1.a - this._point2.a)
            super.calc()
        } else {
            super.bPoint = undefined
            super.bVector = undefined
            super.calc()
        }
    }
    set point1(point: DiedricPoint | undefined) {

        if (this._point1) {
            let indexInChildren = this._point1.children.indexOf(this)
            if (indexInChildren == -1) {
                console.error("This should never happen", this, "is not in point1 children")
            } else {
                this._point1.children.splice(indexInChildren, 1)
            }
        }
        this._point1 = point

        if (this._point1) {
            this._point1.children.push(this)
        }
    }

    set point2(point: DiedricPoint | undefined) {
        if (this._point2) {
            let indexInChildren = this._point2.children.indexOf(this)
            if (indexInChildren == -1) {
                console.error("This should never happen", this, "is not in point2 children")
            } else {
                this._point2.children.splice(indexInChildren, 1)
            }
        }
        this._point2 = point

        if (this._point2) {
            this._point2.children.push(this)
        }
    }

    get point1() {
        return this._point1
    }

    get point2() {
        return this._point2
    }
}