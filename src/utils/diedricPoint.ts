import * as THREE from 'three';
import { Diedric } from './diedric';
import { DiedricPlane3Points, DiedricPlanePointLine } from './diedricPlane';
import { DiedricLine2Points } from './diedricLine';

export class DiedricPoint {
    private point: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>
    private material: THREE.MeshBasicMaterial
    private diedric: Diedric
    private lineToY0Line: THREE.Line<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.LineBasicMaterial, THREE.Object3DEventMap>
    private lineToX0Line: THREE.Line<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.LineBasicMaterial, THREE.Object3DEventMap>
    private lineToZ0Line: THREE.Line<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.LineBasicMaterial, THREE.Object3DEventMap>

    private lineToY0Geometry;
    private lineToX0Geometry;
    private lineToZ0Geometry;

    private _color: THREE.ColorRepresentation
    children: (DiedricPlane3Points | DiedricLine2Points | DiedricPlanePointLine)[] = []

    constructor(diedric: Diedric, o: number, a: number, c: number, color: THREE.ColorRepresentation) {

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

        this.point = new THREE.Mesh(geometry, this.material);

        this.point.position.x = o
        this.point.position.y = c
        this.point.position.z = a
        this.update()

        this.diedric.scene.add(this.point);
        this.diedric.scene.add(this.lineToX0Line);
        this.diedric.scene.add(this.lineToY0Line);
        this.diedric.scene.add(this.lineToZ0Line);
    }

    update() {
        this.lineToY0Geometry.setFromPoints([this.point.position, new THREE.Vector3(this.point.position.x, 0, this.point.position.z)])
        this.lineToX0Geometry.setFromPoints([new THREE.Vector3(this.point.position.x, 0, this.point.position.z), new THREE.Vector3(0, 0, this.point.position.z)])
        this.lineToZ0Geometry.setFromPoints([new THREE.Vector3(this.point.position.x, 0, this.point.position.z), new THREE.Vector3(this.point.position.x, 0, 0)])
        this.lineToX0Line.computeLineDistances()
        this.lineToY0Line.computeLineDistances()
        this.lineToZ0Line.computeLineDistances()

        this.children.map((child => child.update()))
    }

    remove() {
        this.diedric.scene.remove(this.point)
        this.diedric.scene.remove(this.lineToX0Line)
        this.diedric.scene.remove(this.lineToY0Line)
        this.diedric.scene.remove(this.lineToZ0Line)

        this.children.map((child => child.removeParent(this)))


    }

    set hidden(value: boolean) {
        if (value) {
            this.diedric.scene.remove(this.point)
            this.diedric.scene.remove(this.lineToX0Line)
            this.diedric.scene.remove(this.lineToY0Line)
            this.diedric.scene.remove(this.lineToZ0Line)
        } else {
            this.diedric.scene.add(this.point)
            this.diedric.scene.add(this.lineToX0Line)
            this.diedric.scene.add(this.lineToY0Line)
            this.diedric.scene.add(this.lineToZ0Line)
        }
    }

    set o(o: number) {
        this.point.position.x = o
        this.update()
    }
    set a(a: number) {
        this.point.position.z = a
        this.update()
    }
    set c(c: number) {
        this.point.position.y = c
        this.update()
    }
    get o() {
        return this.point.position.x
    }
    get a() {
        return this.point.position.z
    }
    get c() {
        return this.point.position.y
    }

    set color(color: string) {
        this.material.color = new THREE.Color(color)
    }

    get color(): THREE.ColorRepresentation {
        return this._color
    }
}