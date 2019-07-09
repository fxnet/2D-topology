import * as THREE from 'three';
import constants from '../constants';
import Layout from './Layout';
require('three/examples/js/lines/LineSegmentsGeometry');
require('three/examples/js/lines/LineGeometry');
require('three/examples/js/lines/LineMaterial');
require('three/examples/js/lines/LineSegments2');
require('three/examples/js/lines/Line2');

import config from '../config';

let resolution;

class Utils {
  static setResolution(r) {
    resolution = r;
  }
  static createCircle(radius, color = 0xff0000, linewidth = 2, dashed = false) {
    // arc
    var arcShape = new THREE.Shape();
    arcShape.moveTo( 0, 0 );
    arcShape.absarc( 0, 0, radius, 0, Math.PI*2, false );
    // line
    var geo = (new THREE.Geometry()).setFromPoints(arcShape.extractPoints(Math.max(12, radius * Math.PI * 2)).shape);
    geo.rotateX(-Math.PI / 2);
    geo.vertices.push( geo.vertices[ 0 ].clone() );
    var material = new THREE.LineMaterial( { linewidth, color, resolution, dashed, dashScale: 0.2, dashSize: 1, gapSize: 2 } );
    material.defines.USE_DASH = dashed;
    var geometry = new THREE.LineGeometry();
    var positions = [];
    geo.vertices.forEach(v => {
      positions.push(v.x, v.y, v.z);
    }); 
    geometry.setPositions( positions );
    var circleLine = new THREE.Line2( geometry, material );
    circleLine.computeLineDistances();
    return circleLine;
  }
  static addBusinessVisual(node) {
    if (node.userData.businessVisual) {
      node.remove(node.userData.businessVisual);
      node.userData.businessVisual = null;
    }
    const box3 = new THREE.Box3();
    box3.setFromObject(node);
    const r = Layout.calBox3HorizontalRadius(box3);
    const circle = this.createCircle(r, config.appearance.business.color, config.appearance.business.linewidth, config.appearance.business.dashed );
    circle.layers.set(constants.LAYER_BUSINUSS);
    node.add(circle);
    node.userData.businessVisual = circle;
    circle.userData.radius = r;

    return circle;
  }
  static addBoundingBox(node) {
    if (node.userData.boundingBoxHelper) {
      node.remove(node.userData.boundingBoxHelper);
      node.userData.boundingBoxHelper = null;
    }
    if (node.userData.boundingCircle) {
      node.remove(node.userData.boundingCircle);
      node.userData.boundingCircle = null;
    }

    const bbh = new THREE.BoxHelper(node);
    this.scene.add(bbh);
    THREE.SceneUtils.attach(bbh, this.scene, node);
    node.userData.boundingBoxHelper = bbh;

    const box3 = new THREE.Box3();
    box3.setFromObject(node);
    const r = Layout.calBox3HorizontalRadius(box3);
    const circle = this.createCircle(r);
    node.add(circle);
    node.userData.boundingCircle = circle;
  }
};

export default Utils;