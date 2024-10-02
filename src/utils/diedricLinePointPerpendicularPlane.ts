import { Diedric } from "./diedric";
import { DiedricLine } from "./diedricLine"
import { DiedricPlane } from "./diedricPlane";
import { DiedricPoint } from "./diedricPoint"
import * as THREE from 'three';

export class DiedricLinePointPerpendicularPlane extends DiedricLine {

    private _color: THREE.ColorRepresentation
    private _point: DiedricPoint | undefined
    private _plane: DiedricPlane | undefined

    static type = 'line-pto-per-plane'
    public type = 'line-pto-per-plane'
    static params: any = {
        'point': DiedricPoint,
        'plane': DiedricPlane
    }

    constructor({ diedric, point, plane, color }: { diedric: Diedric, point: DiedricPoint | undefined, plane: DiedricPlane | undefined, color: THREE.ColorRepresentation }) {

        super(diedric, undefined, undefined, color)

        this._point = point
        this._plane = plane
        this._color = color

        this._point?.children.push(this)
        this._plane?.children.push(this)
        this.update()

    }
    removeParent(parent: DiedricPoint | DiedricPlane) {
        if (this._point === parent) {
            this._point = undefined
        } else if (this._plane == parent) {
            this._plane = undefined
        }
        this.update()
    }

    remove() {

        this.point = undefined
        this.plane = undefined
        super.remove()
    }
    update() {

        if (this._point?.o !== undefined && this._point?.a !== undefined && this._point?.c !== undefined && this._plane?.normal) {

            if (super.bVector) {
                super.bVector.copy(this._plane.normal)
            } else {
                super.bVector = new THREE.Vector3().copy(this._plane.normal)
            }

            super.bPoint = new THREE.Vector3(this._point.o, this._point.c, this._point.a)

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

    set plane(plane: DiedricPlane | undefined) {
        if (this._plane) {
            let indexInChildren = this._plane.children.indexOf(this)
            if (indexInChildren == -1) {
                console.error("This should never happen", this, "is not in point2 children")
            } else {
                this._plane.children.splice(indexInChildren, 1)
            }
        }

        this._plane = plane
        this.update()

        if (this._plane) {
            this._plane.children.push(this)
        }
    }

    get point(): DiedricPoint | undefined {
        return this._point
    }

    get plane() {
        return this._plane
    }

    get color() {
        return this._color
    }
}