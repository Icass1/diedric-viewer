import * as THREE from 'three';

export class StaticLabel {

    mesh: THREE.Mesh<THREE.BoxGeometry, (THREE.MeshPhongMaterial | THREE.MeshBasicMaterial)[], THREE.Object3DEventMap>

    constructor(scene: THREE.Scene, text: string, position: THREE.Vector3) {

        const cv = document.createElement('canvas');
        cv.width = 50
        cv.height = 100;
        const ctx = cv.getContext('2d') as CanvasRenderingContext2D;

        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.font = '5vh Arial';
        ctx.fillText(text, cv.width / 2, 0);

        const txtGeometry = new THREE.BoxGeometry(cv.width / 5, cv.height / 5, 0); // w 3 : h 1
        const cvTexture = new THREE.Texture(cv);
        cvTexture.needsUpdate = true; // otherwise all black only
        const spineMat = new THREE.MeshPhongMaterial({ color: 0xa5800e, transparent: true, opacity: 0.1 });
        const cvMaterial = new THREE.MeshBasicMaterial({ map: cvTexture, transparent: true, opacity: 1 });
        const cvMaterials = [spineMat, spineMat, spineMat, spineMat, cvMaterial, cvMaterial];
        const cvTxtMesh = new THREE.Mesh(txtGeometry, cvMaterials);
        cvTxtMesh.position.copy(position);
        scene.add(cvTxtMesh);

        this.mesh = cvTxtMesh
    }
    get position() {
        return this.mesh.position
    }

    set position(position: THREE.Vector3) {
        this.mesh.position.copy(position)
    }
    set rotation(rotation: THREE.Vector3) {
        this.mesh.rotation.x = rotation.x
        this.mesh.rotation.y = rotation.y
        this.mesh.rotation.z = rotation.z
    }

}
