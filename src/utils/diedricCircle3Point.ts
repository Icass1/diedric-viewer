import * as THREE from 'three';
import { Diedric } from "./diedric"
import { DiedricPoint } from "./diedricPoint"
import { Ellispe } from './two/elipse';

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

    private horizontalProjection: Ellispe

    constructor({ diedric, point1, point2, point3, color }: { diedric: Diedric, point1: DiedricPoint | undefined, point2: DiedricPoint | undefined, point3: DiedricPoint | undefined, color: THREE.ColorRepresentation }) {

        this.diedric = diedric

        this.geometry = new THREE.CircleGeometry(5, 32);
        this.material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide, transparent: true, opacity: 0.1 });
        this.circle = new THREE.Mesh(this.geometry, this.material);
        diedric.scene.add(this.circle);

        this._point1 = point1
        this._point2 = point2
        this._point3 = point3


        this.horizontalProjection = new Ellispe({ color: color.toString() })
        this.diedric.canvas2d.add(this.horizontalProjection)

        this.update()
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

        let circumcenter = new THREE.Vector3();
        circumcenter.addScaledVector(midAB, 1);
        circumcenter.addScaledVector(midBC, 1);

        circumcenter.divideScalar(2);  // Averaging for approximation

        const radius = circumcenter.distanceTo(p1);

        this.geometry = new THREE.CircleGeometry(radius, 32)
        this.circle.geometry = this.geometry

        // 6. Position the circle at the circumcenter
        this.circle.position.copy(circumcenter);

        // 7. Align the circle to the plane by applying the quaternion derived from the normal
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
        this.circle.quaternion.copy(quaternion);





        // Given three 2D points
        const pointA = { x: this._point1?.o, y: this._point1?.a };
        const pointB = { x: this._point2?.o, y: this._point2?.a };
        const pointC = { x: this._point3?.o, y: this._point3?.a };

        // Get distances between the points
        const distAB = getDistance(pointA, pointB);
        const distBC = getDistance(pointB, pointC);
        const distCA = getDistance(pointC, pointA);

        // 1. Calculate the center of the ellipse
        function getEllipseCenter(p1, p2, p3) {
            const centerX = (p1.x + p2.x + p3.x) / 3;
            const centerY = (p1.y + p2.y + p3.y) / 3;
            return { x: centerX, y: centerY };
        }

        const center = getEllipseCenter(pointA, pointB, pointC);
        // 2. Calculate the lengths of the semi-major and semi-minor axes
        function getDistance(p1, p2) {
            return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
        }

        // Semi-major axis is the longest distance between two points
        const semiMajor = Math.max(distAB, distBC, distCA) ;
        // Semi-minor axis can be the shortest distance divided by 2 for simplicity
        const semiMinor = Math.min(distAB, distBC, distCA) 

        // 3. Calculate the rotation of the ellipse
        // Use the angle between the longest axis (semi-major) and the horizontal axis
        let angle;
        if (semiMajor === distAB) {
            angle = Math.atan2(pointB.y - pointA.y, pointB.x - pointA.x);
        } else if (semiMajor === distBC) {
            angle = Math.atan2(pointC.y - pointB.y, pointC.x - pointB.x);
        } else {
            angle = Math.atan2(pointA.y - pointC.y, pointA.x - pointC.x);
        }



        this.horizontalProjection.angle = angle
        this.horizontalProjection.semiMinor = semiMinor
        this.horizontalProjection.semiMajor = semiMajor
        this.horizontalProjection.pos = new THREE.Vector2(center.x, center.y)





    }
}