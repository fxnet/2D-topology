import config from './config';

class AttackAnimate {
	constructor (viewer, routeNodes, animaTime, lineColor) {
		const rootNode = viewer.rootNode;
		this.animaPath = [];
		this.length = 0;
		routeNodes.forEach((node, index) => {
			this.animaPath.push(rootNode.worldToLocal(node.getWorldPosition(new THREE.Vector3())));
			if (index > 0) this.length += this.animaPath[index].distanceTo(this.animaPath[index - 1]);
		});
		this.speed = this.length / animaTime;
		const bulletGeo = new THREE.CylinderBufferGeometry(0, config.appearance.attack.radius || 0.1, config.appearance.attack.length || 1, 8, 1, false);
		const m4= new THREE.Matrix4();
		m4.makeRotationX(-Math.PI / 2);
		bulletGeo.applyMatrix(m4);
		this.attackBullet = new THREE.Mesh(bulletGeo, new THREE.MeshBasicMaterial({ color: config.appearance.attack.color || 0xff3333 }));
		this.attackBullet.isAnimation = true;
		this.clock = new THREE.Clock();
		this.position = 0;

		this.attackBullet.onBeforeRender = () => {
			this.position += this.speed * this.clock.getDelta();
			if (this.position >= this.length) {
				rootNode.remove(this.attackBullet);
				// console.log(this.attackBullet.id, 'finish');
			} else {
				// console.log(this.attackBullet.id, this.speed, '=', this.position, this.length);
				let distance = 0;
				for (let i = 1, l = this.animaPath.length; i < l; i += 1) {
					const d = this.animaPath[i].distanceTo(this.animaPath[i - 1]);
					const distance1 = distance + d;
					if (distance1 >= this.position) {
						this.attackBullet.position.lerpVectors(this.animaPath[i - 1], this.animaPath[i], (this.position - distance) / d);
						this.attackBullet.lookAt(this.animaPath[i]);
						break;
					}
					distance = distance1;
				}
			}
		};
		rootNode.add(this.attackBullet);
	}
}

export default AttackAnimate;