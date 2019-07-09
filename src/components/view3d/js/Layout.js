import constants from '../constants';
import config from '../config';
import * as THREE from 'three';
import Utils from './Utils';

class Node {
	constructor() {
		this.radius = 0;
		this.position = [0, 0, 0];
		this.children = [];
	}
}

class Layout {

	static calBox3HorizontalRadius (box3) {
    const size = box3.getSize(new THREE.Vector3());
    return Math.sqrt(size.x * size.x + size.z * size.z) / 2;
  }

  // 计算最小方格矩阵（传入总数，返回最小行列数）
	static calMinRectMatrix (count) {
		var side = Math.sqrt(count);
		var sideBigger = Math.ceil(side);
		var sideSmaller = (side % 1 > 0.5) ? sideBigger : Math.floor(side);
		return { row: sideSmaller, col: sideBigger, count: sideSmaller*sideBigger };
	}

  static relayoutNodeRect (node) {
    const children = node.children.filter(e => e.userData.isNode);
    const nodeCount = children.length;

    let maxR = 0;
    const box3 = new THREE.Box3();
    for (let i = 0; i < nodeCount; i++) {
      box3.setFromObject(children[i]);
      const r = Layout.calBox3HorizontalRadius(box3);
      if (r > maxR) maxR = r;
    }

    if (nodeCount <= 1) {
      if (nodeCount === 1) {
        children[0].position.set(0, -config.layout.levelHeight, 0);
        if (children[0].userData.connect) {
          children[0].userData.connect.updateEnd(children[0].position);
        }
      }
    } else if (nodeCount < 4) {
      let radius = (maxR + config.layout.nodeSpace) / 2;
      radius = Math.sqrt(radius * radius + radius * radius); // 将边距离转换为对角位置，防止对角方向碰撞。
      const radianPerNode = Math.PI * 2 / nodeCount;
      for (let i = 0; i < nodeCount; i += 1) {
        children[i].position.set(radius * Math.cos(radianPerNode * i), -config.layout.levelHeight, radius * Math.sin(radianPerNode * i));
        // children[i].lookAt(new THREE.Vector3(children[i].position.x * 2, children[i].position.y, children[i].position.z * 2));
        if (children[i].userData.connect) {
          children[i].userData.connect.updateEnd(children[i].position);
        }
      }
    } else {
      const matrix = Layout.calMinRectMatrix(nodeCount);

      const rowMid = (matrix.row + 1) / 2;
      const colMid = (matrix.col + 1) / 2;
      let i = 0;
      for (let col = 1 - colMid; col <= matrix.col - colMid && i < nodeCount; col += 1) {
        for (let row = 1 - rowMid; row <= matrix.row - rowMid && i < nodeCount; row += 1) {
          children[i].position.set((maxR + config.layout.nodeSpace) * col, -config.layout.levelHeight, (maxR + config.layout.nodeSpace) * row);
          if (children[i].userData.connect) {
            children[i].userData.connect.updateEnd(children[i].position);
          }
          i += 1;
        }
      }
    }
  }

  static relayoutNodeStar (node) {
    const children = node.children.filter(e => e.userData.isNode);
    const nodeCount = children.length;

    if (nodeCount === 1) {
      const nodec = children[0];
      nodec.position.set(0, -config.layout.levelHeight, 0);
      if (nodec.userData.connect) {
        nodec.userData.connect.updateEnd(nodec.position);
      }

      return;
    }
    
    const nodeRange = config.layout.modelMaxSize + config.layout.nodeSpace; // 节点加边距所需平均空间范围
    let lastCircleRadius = config.layout.star_radius_min - config.layout.star_radius_inc; // may be negative for first add
    let nodeIndex = 0;
    const box3 = new THREE.Box3();
    while (nodeIndex < nodeCount) {
      const radiusThisCircle = lastCircleRadius + config.layout.star_radius_inc; // 本圈预测半径
      const perimeterThisCircle = radiusThisCircle * Math.PI * 2; // 本圈周长
      const nodeCountThisCircle = Math.min(nodeCount - nodeIndex, Math.ceil(perimeterThisCircle / nodeRange)); // 该圆需放置的节点数（取大数，防止最后一圈放不下；同时也使最后一圈稍微宽裕一点；也可从外圈开始，使最内圈宽裕。）
      let maxRadiusThisCircle = config.layout.star_radius_inc;
      let radiusSumTHisCircle = 0;
      for (let i = nodeIndex; i < nodeIndex + nodeCountThisCircle; i ++) {
        const nodec = children[i];
        box3.setFromObject(nodec);
        const r = Math.max(Layout.calBox3HorizontalRadius(box3), nodeRange / 2);
        nodec.r = r;
        radiusSumTHisCircle += r;
        if (r > maxRadiusThisCircle) maxRadiusThisCircle = r;
      }
      const realRadiusThisCircle = radiusSumTHisCircle * 2 / (Math.PI * 2);
      let radiusSum = 0;
      let lastRadiusHalf = 0;
      for (let i = nodeIndex; i < nodeIndex + nodeCountThisCircle; i ++) {
        const nodec = children[i];
        radiusSum += lastRadiusHalf + nodec.r / 2;
        lastRadiusHalf = nodec.r / 2;
        const radian = radiusSum / radiusSumTHisCircle * Math.PI * 2; 
        const radius = lastCircleRadius + realRadiusThisCircle;
        nodec.position.set(radius * Math.cos(radian), -config.layout.levelHeight, radius * Math.sin(radian));
        if (nodec.userData.connect) {
          nodec.userData.connect.updateEnd(nodec.position);
        }
      }

      lastCircleRadius = lastCircleRadius + realRadiusThisCircle * 2;
      nodeIndex += nodeCountThisCircle;
    }
  }

}

export default Layout;
