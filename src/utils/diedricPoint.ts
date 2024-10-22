import * as THREE from 'three';
import { Diedric } from './diedric';
import { DiedricLine2Point } from './diedricLine2Point';
import { DiedricLinePointParallelLine } from './diedricLinePointParallelLine';
import { DiedricPlane3Point } from './diedricPlane3Point';
import { DiedricPlanePointLine } from './diedricPlanePointLine';

import * as TWO from "./two";
import { DiedricPointMidLinePoint } from './diedricPointMidLinePoint';
import { DiedricLinePointPerpendicularPlane } from './diedricLinePointPerpendicularPlane';
import { DiedricCircle3Point } from './diedricCircle3Point';
import { DiedricPointMid2Point } from './diedricPointMid2Point';
import { DiedricPlanePointPerpendicularLine } from './diedricPlanePointPerpendicularLine';
import { DiedricLinePointPlaneLineAngle } from './diedricLinePointPlaneLineAngle';
import { DiedricPointUnfold } from './diedricPointUnfold';

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
    private horizontalProjectionLabel: TWO.Label
    private verticalProjectionLabel: TWO.Label

    private _o: number | undefined
    private _a: number | undefined
    private _c: number | undefined

    private _color: THREE.ColorRepresentation
    children: (
        DiedricPlane3Point |
        DiedricLine2Point |
        DiedricPlanePointLine |
        DiedricLinePointParallelLine |
        DiedricPointMidLinePoint |
        DiedricLinePointPerpendicularPlane |
        DiedricCircle3Point |
        DiedricPointMid2Point |
        DiedricPlanePointPerpendicularLine |
        DiedricLinePointPlaneLineAngle |
        DiedricPointUnfold
    )[] = []

    static params: any = { "o": "number", "a": "number", "c": "number" }
    static type = "point"
    public type = "point"

    private _hidden = false;
    private _exists = false;

    private _name: string

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

        this._name = ""

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

        this.verticalProjection = new TWO.Point({ radius: 3, color: color.toString() })
        this.horizontalProjection = new TWO.Point({ radius: 3, color: color.toString() })

        this.diedric.canvas2d.add(this.verticalProjection)
        this.diedric.canvas2d.add(this.horizontalProjection)

        this.verticalProjectionLabel = new TWO.Label({ text: "", color: "black" })
        this.horizontalProjectionLabel = new TWO.Label({ text: "", color: "black" })

        this.diedric.canvas2d.add(this.verticalProjectionLabel)
        this.diedric.canvas2d.add(this.horizontalProjectionLabel)

    }
    update() {
        this.calc()
    }

    calc() {
        this.diedric.log("DiedricPoint calc")

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

            this.verticalProjectionLabel.pos = new THREE.Vector2(this._o, -this._c)
            this.horizontalProjectionLabel.pos = new THREE.Vector2(this._o, this._a)

            this.children.map((child => child.update()))
        } else {
            this._exists = false
        }
        this.updateView()


    }

    updateView() {
        if (this._exists && !this._hidden) {
            this.diedric.scene.add(this.bPoint)
            this.diedric.scene.add(this.lineToX0Line)
            this.diedric.scene.add(this.lineToY0Line)
            this.diedric.scene.add(this.lineToZ0Line)

            this.diedric.canvas2d.add(this.verticalProjection)
            this.diedric.canvas2d.add(this.horizontalProjection)

            this.diedric.canvas2d.add(this.verticalProjectionLabel)
            this.diedric.canvas2d.add(this.horizontalProjectionLabel)
        } else {
            this.diedric.scene.remove(this.bPoint)
            this.diedric.scene.remove(this.lineToX0Line)
            this.diedric.scene.remove(this.lineToY0Line)
            this.diedric.scene.remove(this.lineToZ0Line)

            this.diedric.canvas2d.remove(this.verticalProjection)
            this.diedric.canvas2d.remove(this.horizontalProjection)

            this.diedric.canvas2d.remove(this.verticalProjectionLabel)
            this.diedric.canvas2d.remove(this.horizontalProjectionLabel)
        }
    }

    setAttributes(attr: { o?: number, a?: number, c?: number, color?: THREE.ColorRepresentation }) {
        if (attr.o == this.o && attr.a == this.a && attr.c == this.c && attr.color == this._color) { return }
        Object.entries(attr).map(attrEntry => {
            // @ts-ignore
            this[attrEntry[0]] = attrEntry[1]
        })
        this.update()
    }

    remove() {
        this.diedric.scene.remove(this.bPoint)
        this.diedric.scene.remove(this.lineToX0Line)
        this.diedric.scene.remove(this.lineToY0Line)
        this.diedric.scene.remove(this.lineToZ0Line)

        this.diedric.canvas2d.remove(this.horizontalProjection)
        this.diedric.canvas2d.remove(this.horizontalProjectionLabel)
        this.diedric.canvas2d.remove(this.verticalProjection)
        this.diedric.canvas2d.remove(this.verticalProjectionLabel)

        this.children.map((child => child.removeParent(this)))
    }

    set hidden(value: boolean) {
        this._hidden = value
        this.updateView()
    }

    set o(o: number | undefined) {
        this._o = o
    }
    set a(a: number | undefined) {
        this._a = a
    }
    set c(c: number | undefined) {
        this._c = c
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
        this.horizontalProjection.color = color
        this.verticalProjection.color = color
        this.verticalProjectionLabel.color = color
        this.horizontalProjectionLabel.color = color
    }

    get color(): THREE.ColorRepresentation {
        return this._color
    }

    set name(name: string) {
        this.verticalProjectionLabel.text = name + "''"
        this.horizontalProjectionLabel.text = name + "'"
        this._name = name
    }
    get name() {
        return this._name
    }

}