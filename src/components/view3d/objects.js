import * as THREE from 'three';

window.THREE = THREE;

class NetGroup extends THREE.LineSegments {
  constructor (height, x, y) {
    const indices = new Uint16Array([ 0, 1, 1, 2, 2, 3, 3, 0 ]);
    const positions = new Float32Array(4 * 3);

    const geometry = new THREE.BufferGeometry();
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));

    super(geometry, new THREE.LineBasicMaterial({ color: 0x0000ff }));

    // this.matrixAutoUpdate = false;

    this.height = height;
    this.setSize(x, y);
  }
  setSize (x, y) {
    this.x = x;
    this.y = y;

    const position = this.geometry.attributes.position;
    const array = position.array;

    const halfX = this.x / 2;
    const halfY = this.y / 2;

    array[ 0 ] = -halfX;
    array[ 1 ] = this.height;
    array[ 2 ] = -halfY;

    array[ 3 ] = -halfX;
    array[ 4 ] = this.height;
    array[ 5 ] = halfY;

    array[ 6 ] = halfX;
    array[ 7 ] = this.height;
    array[ 8 ] = halfY;

    array[ 9 ] = halfX;
    array[ 10 ] = this.height;
    array[ 11 ] = -halfY;

    position.needsUpdate = true;

    this.geometry.computeBoundingSphere();
  }
}

class NetConnect extends THREE.Object3D {
  constructor (start, end, size, color = 0x00ff00) {
    super();

    this.start = start;
    this.end = end;

    let line = new THREE.CylinderGeometry(size, size, 1, 8, 1, false);
    let matrix1 = new THREE.Matrix4();
    matrix1.makeTranslation(0, 1 / 2, 0);
    line.applyMatrix(matrix1);

    let matrix2 = new THREE.Matrix4();
    matrix2.makeRotationX(Math.PI / 2);
    line.applyMatrix(matrix2);

    const material = new THREE.MeshBasicMaterial({ color });

    this.line = new THREE.Mesh(line, material);
    this.add(this.line);

    this.update();
  }
  updateStart (point) {
    this.start = point;
    this.update();
  }
  updateEnd (point) {
    this.end = point;
    this.update();
  }
  update () {
    const length = this.end.distanceTo(this.start);
    if (length === 0) {
        this.line.visible = false;
    } else {
        this.line.position.copy(this.start);
        this.line.scale.z = length;
        this.line.lookAt(this.end);
        this.line.visible = true;
    }
  }
}

export { NetGroup, NetConnect };
