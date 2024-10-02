import * as THREE from 'three';
import { Diedric } from './diedric';
import { DiedricLine2Point } from './diedricLine2Point';
import { DiedricLinePointParallelLine } from './diedricLinePointParallelLine';
import { DiedricPlane3Point } from './diedricPlane3Point';
import { DiedricPlanePointLine } from './diedricPlanePointLine';

import * as TWO from "./two";
import { DiedricPointMidLinePoint } from './diedricPointMidPlanePoint';
import { DiedricLinePointPerpendicularPlane } from './diedricLinePointPerpendicularPlane';

export class DiedricPoint {
    private bPoint: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>
    private material: THREE.MeshBasicMaterial
    private diedric: Diedric
    private lineToY0Line: THREE.Line<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.LineBasicMaterial, THREE.Object3DEventMap>
    private lineToX0Line: THREE.Line<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.LineBasicMaterial, THREE.Object3DEventMap>
    private lineToZ0Line: THREE.Line<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.LineBasicMaterial, THREE.Object3DEventMap>

    private lineToY0Geometry;
    private lineToX0Geometry;
    private lineToZ0Geometry;

    private horizontalProjection: TWO.Point
    private verticalProjection: TWO.Point

    private _o: number | undefined
    private _a: number | undefined
    private _c: number | undefined

    private _color: THREE.ColorRepresentation
    children: (DiedricPlane3Point | DiedricLine2Point | DiedricPlanePointLine | DiedricLinePointParallelLine | DiedricPointMidLinePoint | DiedricLinePointPerpendicularPlane)[] = []

    static params: any = { "o": "number", "a": "number", "c": "number" }
    static type = "point"
    public type = "point"

    private _hidden = false;
    private _exists = false;

    constructor({ diedric, o, a, c, color }: { diedric: Diedric, o: number | undefined, a: number | undefined, c: number | undefined, color: THREE.ColorRepresentation }) {

        this.diedric = diedric
        this._color = color

        const lineMaterial = new THREE.LineDashedMaterial({
            color: 'black',
            linewidth: 1,
            scale: 1,
            dashSize: 3,
            gapSize: 3,
        });

        this.lineToY0Geometry = new THREE.BufferGeometry().setFromPoints([]);
        this.lineToY0Line = new THREE.Line(this.lineToY0Geometry, lineMaterial);

        this.lineToX0Geometry = new THREE.BufferGeometry().setFromPoints([]);
        this.lineToX0Line = new THREE.Line(this.lineToX0Geometry, lineMaterial);

        this.lineToZ0Geometry = new THREE.BufferGeometry().setFromPoints([]);
        this.lineToZ0Line = new THREE.Line(this.lineToZ0Geometry, lineMaterial);

        const geometry = new THREE.SphereGeometry(1)
        this.material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });

        this.bPoint = new THREE.Mesh(geometry, this.material);

        this._o = o
        this._a = a
        this._c = c

        this.diedric.scene.add(this.bPoint);
        this.diedric.scene.add(this.lineToX0Line);
        this.diedric.scene.add(this.lineToY0Line);
        this.diedric.scene.add(this.lineToZ0Line);

        this.horizontalProjection = new TWO.Point({ radius: 3, color: color.toString() })
        this.verticalProjection = new TWO.Point({ radius: 3, color: color.toString() })

        this.diedric.canvas2d.add(this.horizontalProjection)
        this.diedric.canvas2d.add(this.verticalProjection)

        this.calc()
    }
    update() {
        this.calc()
    }

    calc() {
        if (this._o !== undefined && this._a !== undefined && this._c !== undefined) {
            this._exists = true

            this.bPoint.position.x = this._o
            this.bPoint.position.y = this._c
            this.bPoint.position.z = this._a

            this.lineToY0Geometry.setFromPoints([this.bPoint.position, new THREE.Vector3(this._o, 0, this._a)])
            this.lineToX0Geometry.setFromPoints([new THREE.Vector3(this._o, 0, this._a), new THREE.Vector3(0, 0, this._a)])
            this.lineToZ0Geometry.setFromPoints([new THREE.Vector3(this._o, 0, this._a), new THREE.Vector3(this._o, 0, 0)])
            this.lineToX0Line.computeLineDistances()
            this.lineToY0Line.computeLineDistances()
            this.lineToZ0Line.computeLineDistances()

            this.verticalProjection.pos = new THREE.Vector2(this._o, -this._c)
            this.horizontalProjection.pos = new THREE.Vector2(this._o, this._a)

            this.children.map((child => child.update()))
        } else {
            this._exists = false
        }

        if (this._exists && !this._hidden) {
            this.diedric.scene.add(this.bPoint)
            this.diedric.scene.add(this.lineToX0Line)
            this.diedric.scene.add(this.lineToY0Line)
            this.diedric.scene.add(this.lineToZ0Line)

            this.diedric.canvas2d.add(this.verticalProjection)
            this.diedric.canvas2d.add(this.horizontalProjection)

        } else {
            this.diedric.scene.remove(this.bPoint)
            this.diedric.scene.remove(this.lineToX0Line)
            this.diedric.scene.remove(this.lineToY0Line)
            this.diedric.scene.remove(this.lineToZ0Line)

            this.diedric.canvas2d.remove(this.verticalProjection)
            this.diedric.canvas2d.remove(this.horizontalProjection)

        }
    }

    setAttributes(attr: { o?: number, a?: number, c?: number, color?: THREE.ColorRepresentation }) {
        Object.entries(attr).map(attrEntry => {
            // @ts-ignore
            this[attrEntry[0]] = attrEntry[1]
        })
    }

    remove() {
        console.warn("Remove from 2d canvas")
        this.diedric.scene.remove(this.bPoint)
        this.diedric.scene.remove(this.lineToX0Line)
        this.diedric.scene.remove(this.lineToY0Line)
        this.diedric.scene.remove(this.lineToZ0Line)

        this.children.map((child => child.removeParent(this)))
    }

    set hidden(value: boolean) {

        this._hidden = value
        this.calc()
    }

    set o(o: number | undefined) {
        this._o = o
        if (this.type == "point") {
            this.update()
        } else {
            this.calc()
        }
    }
    set a(a: number | undefined) {
        this._a = a
        if (this.type == "point") {
            this.update()
        } else {
            this.calc()
        }
    }
    set c(c: number | undefined) {
        this._c = c
        if (this.type == "point") {
            this.update()
        } else {
            this.calc()
        }
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

    set color(color: string) {
        this.material.color = new THREE.Color(color)
    }

    get color(): THREE.ColorRepresentation {
        return this._color
    }
}