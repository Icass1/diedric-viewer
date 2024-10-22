import * as THREE from 'three';
import { DiedricPoint } from './diedricPoint';
import { DiedricPlane } from './diedricPlane';
import { Diedric } from './diedric';

export class DiedricPlane3Point extends DiedricPlane {
    private _color: THREE.ColorRepresentation
    private _point1: DiedricPoint | undefined
    private _point2: DiedricPoint | undefined
    private _point3: DiedricPoint | undefined
    private _diedric: Diedric

    static params: any = { 'point1': DiedricPoint, 'point2': DiedricPoint, 'point3': DiedricPoint }
    static type = "plane-3-pto"
    public type = "plane-3-pto"


    constructor({ diedric, point1, point2, point3, color }: { diedric: Diedric, point1: DiedricPoint | undefined, point2: DiedricPoint | undefined, point3: DiedricPoint | undefined, color: THREE.ColorRepresentation }) {
        diedric.log("constructor DiedricPlane3Point")
        
        super(diedric, undefined, undefined, color)
        
        this._diedric = diedric

        this._color = color
        this._point1 = point1
        this._point2 = point2
        this._point3 = point3

        this._point1?.children.push(this)
        this._point2?.children.push(this)
        this._point3?.children.push(this)


        this.update()
        this.calc()
    }

    removeParent(parent: DiedricPoint) {
        if (this._point1 === parent) {
            this.point1 = undefined
        } else if (this._point2 == parent) {
            this.point2 = undefined
        } else if (this._point3 == parent) {
            this.point3 = undefined
        }
    }
    remove() {

        this._point1 = undefined
        this._point2 = undefined
        this._point3 = undefined
        super.remove()
    }

    update() {
        this._diedric.log("DiedricPlane3Point update")

        if (this._point1 && this._point2 && this._point3) {
            const pointA = new THREE.Vector3(this._point1.o, this._point1.c, this._point1.a)
            const pointB = new THREE.Vector3(this._point2.o, this._point2.c, this._point2.a)
            const pointC = new THREE.Vector3(this._point3.o, this._point3.c, this._point3.a)

            const vector1 = new THREE.Vector3().subVectors(pointB, pointA);
            const vector2 = new THREE.Vector3().subVectors(pointC, pointA);

            super.normal = new THREE.Vector3().crossVectors(vector1, vector2).normalize();

            super.d = super.normal.x * pointA.x + super.normal.y * pointA.y + super.normal.z * pointA.z
            super.calc()
        } else {
            super.normal = undefined
            super.d = undefined
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
        this.update()
        this.calc()
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
        this.update()
        this.calc()
    }
    set point3(point: DiedricPoint | undefined) {
        if (this._point3) {
            let indexInChildren = this._point3.children.indexOf(this)
            if (indexInChildren == -1) {
                console.error("This should never happen", this, "is not in point3 children")
            } else {
                this._point3.children.splice(indexInChildren, 1)
            }
        }

        this._point3 = point

        if (this._point3) {
            this._point3.children.push(this)
        }
        this.update()
        this.calc()
    }
}