import * as THREE from 'three';
import { Diedric } from "./diedric"
import { DiedricPoint } from "./diedricPoint"
import { Path } from './two/path';

export class DiedricCircle3Point {

    private _point1: DiedricPoint | undefined
    private _point2: DiedricPoint | undefined
    private _point3: DiedricPoint | undefined

    private diedric: Diedric

    static params: any = {
        'point1': DiedricPoint,
        'point2': DiedricPoint,
        'point3': DiedricPoint
    }

    static type = "circle-3-point"
    public type = "circle-3-point"

    private geometry: THREE.CircleGeometry
    private material: THREE.MeshBasicMaterial
    private circle: THREE.Mesh<THREE.CircleGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>

    children = []

    private horizontalProjection: Path
    private verticalProjection: Path

    ellipseResolution = 100


    constructor({ diedric, point1, point2, point3, color }: { diedric: Diedric, point1: DiedricPoint | undefined, point2: DiedricPoint | undefined, point3: DiedricPoint | undefined, color: THREE.ColorRepresentation }) {

        this.diedric = diedric

        this.geometry = new THREE.CircleGeometry(5, 32);
        this.material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide, transparent: true, opacity: 0.1 });
        this.circle = new THREE.Mesh(this.geometry, this.material);
        diedric.scene.add(this.circle);

        this._point1 = point1
        this._point2 = point2
        this._point3 = point3

        this._point1?.children.push(this)
        this._point2?.children.push(this)
        this._point3?.children.push(this)

        this.horizontalProjection = new Path({ color: color.toString(), width: 1 })
        this.diedric.canvas2d.add(this.horizontalProjection)

        this.verticalProjection = new Path({ color: color.toString(), width: 1 })
        this.diedric.canvas2d.add(this.verticalProjection)

        this.update()
    }

    removeParent(parent: DiedricPoint) {
        if (this._point1 === parent) {
            this._point1 = undefined
        } else if (this._point2 == parent) {
            this._point2 = undefined
        } else if (this._point3 == parent) {
            this._point3 = undefined
        }
    }
    update() {
        let p1 = new THREE.Vector3(this._point1?.o, this._point1?.c, this._point1?.a)
        let p2 = new THREE.Vector3(this._point2?.o, this._point2?.c, this._point2?.a)
        let p3 = new THREE.Vector3(this._point3?.o, this._point3?.c, this._point3?.a)

        const midAB = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
        const midBC = new THREE.Vector3().addVectors(p2, p3).multiplyScalar(0.5);

        const dirAB = new THREE.Vector3().subVectors(p2, p1);
        const dirBC = new THREE.Vector3().subVectors(p3, p2);

        const normal = new THREE.Vector3().crossVectors(dirAB, dirBC).normalize();

        let dir1 = new THREE.Vector3().crossVectors(dirAB, normal)
        let dir2 = new THREE.Vector3().crossVectors(dirBC, normal)

        let r1 = midAB.x;
        let r2 = midAB.y;
        let v1 = dir1.x;
        let v2 = dir1.y;

        let s1 = midBC.x;
        let s2 = midBC.y;
        let u1 = dir2.x;
        let u2 = dir2.y;

        let t = (r2 * u1 - s2 * u1 - r1 * u2 + s1 * u2) / (v1 * u2 - v2 * u1)

        let circumcenter = new THREE.Vector3().addScaledVector(midAB, 1).addScaledVector(dir1, t);

        const radius = circumcenter.distanceTo(p1);

        this.geometry = new THREE.CircleGeometry(radius, 32)
        this.circle.geometry = this.geometry

        // 6. Position the circle at the circumcenter
        this.circle.position.copy(circumcenter);

        // 7. Align the circle to the plane by applying the quaternion derived from the normal
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
        this.circle.quaternion.copy(quaternion);

        this.horizontalProjection.points = []
        this.verticalProjection.points = []

        for (let i = 0; i < this.ellipseResolution; i++) {
            let horizontal = new THREE.Vector3(Math.cos(i / this.ellipseResolution * 2 * Math.PI), Math.sin(i / this.ellipseResolution * 2 * Math.PI), 0)

            let point = new THREE.Vector3().crossVectors(horizontal, normal).normalize().multiplyScalar(radius).addScaledVector(circumcenter, 1)

            this.horizontalProjection.points.push(new THREE.Vector2(point.x, -point.y))
            this.verticalProjection.points.push(new THREE.Vector2(point.x, point.z))

        }
    }
}