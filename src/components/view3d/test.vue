<template>
  <div>
    <div id="container">
    </div>
  </div>
</template>

<script>
import * as THREE from 'three';
require('three/examples/js/lines/LineSegmentsGeometry');
require('three/examples/js/lines/LineGeometry');
require('three/examples/js/lines/WireframeGeometry2');
require('three/examples/js/lines/LineMaterial');
require('three/examples/js/lines/LineSegments2');
require('three/examples/js/lines/Line2');
require('three/examples/js/lines/Wireframe');
import Detector from 'three/examples/js/Detector';
import dat from 'three/examples/js/libs/dat.gui.min';

export default {
  name: 'test',
  data () {
    return {
    }
  },
  mounted () {
    this.init();
  },
  methods: {
    init () {
      

			if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

			var line, renderer, scene, camera, controls;
			var line1;
			var matLine, matLineBasic, matLineDashed;
			var stats;
			var gui;

			// viewport
			var insetWidth;
			var insetHeight;

			init();
			animate();

			function init() {

				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setClearColor( 0x000000, 0.0 );
				renderer.setSize( window.innerWidth, window.innerHeight );
				document.getElementById('container').appendChild( renderer.domElement );

				scene = new THREE.Scene();

				camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 1000 );
				camera.position.set( - 40, 0, 60 );

				controls = new THREE.OrbitControls( camera, renderer.domElement );
				controls.minDistance = 10;
				controls.maxDistance = 500;


				// Position and Color Data

				var positions = [0, 0, 0, 10, 10, 0, 10, 0, 0];
				var colors = [1.0, 0, 0, 0, 1, 0, 0, 0, 1];


				// THREE.Line2 ( LineGeometry, LineMaterial )

							
				var arcShape = new THREE.Shape();
				arcShape.moveTo( 0, 0 );
				arcShape.absarc( 0, 0, 20, 0, Math.PI*2, false );
				// line
				var geo = arcShape.createPointsGeometry(12);
				geo.rotateX(-Math.PI / 2);
				geo.vertices.push( geo.vertices[ 0 ].clone() );
				matLine = new THREE.LineMaterial( { linewidth: 2, color: 0x00ff00, dashed: true} );
				matLine.defines.USE_DASH = true;
				var geometry = new THREE.LineGeometry();
				var positions = [];
				geo.vertices.forEach(v => {
				positions.push(v.x, v.y, v.z);
				}); 
				geometry.setPositions( positions );
				line = new THREE.Line2( geometry, matLine );
				line.computeLineDistances();
				scene.add(line);


				// THREE.Line ( BufferGeometry, LineBasicMaterial ) - rendered with gl.LINE_STRIP

				var geo = new THREE.BufferGeometry();
				geo.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
				geo.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

				matLineBasic = new THREE.LineBasicMaterial( { vertexColors: THREE.VertexColors } );
				matLineDashed = new THREE.LineDashedMaterial( { vertexColors: THREE.VertexColors, scale: 2, dashSize: 1, gapSize: 1 } );

				line1 = new THREE.Line( geo, matLineBasic );
				line1.computeLineDistances();
				line1.visible = false;
				scene.add( line1 );

				//

				window.addEventListener( 'resize', onWindowResize, false );
				onWindowResize();

				stats = new Stats();
				document.body.appendChild( stats.dom );

				initGui();

			}

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

				insetWidth = window.innerWidth / 4;
				insetHeight = window.innerHeight / 4;

			}

			function animate() {

				requestAnimationFrame( animate );

				stats.update();

				// main scene

				// renderer will set this eventually
				matLine.resolution.set( window.innerWidth, window.innerHeight );

				renderer.setViewport( 0, 0, window.innerWidth, window.innerHeight );

				renderer.render( scene, camera );

			}

			//

			function initGui() {

				gui = new dat.GUI();

				var param = {
					'line type': 0,
					'width (px)': 5,
					'dashed': false,
					'dash scale': 1,
					'dash / gap': 1
				};


				gui.add( param, 'line type', { 'LineGeometry': 0, 'gl.LINE': 1 } ).onChange( function ( val ) {

					switch ( val ) {

						case '0':
							line.visible = true;

							line1.visible = false;

							break;

						case '1':
							line.visible = false;

							line1.visible = true;

							break;

					}

				} );

				gui.add( param, 'width (px)', 1, 10, 1 ).onChange( function ( val ) {

					matLine.linewidth = val;

				} );

				gui.add( param, 'dashed' ).onChange( function ( val ) {

					matLine.dashed = val;

					// dashed is implemented as a defines -- not as a uniform. this could be changed.
					// ... or LineDashedMaterial could be implemented as a separate material
					// temporary hack - renderer should do this eventually
					if ( val ) matLine.defines.USE_DASH = ""; else delete matLine.defines.USE_DASH;
					matLine.needsUpdate = true;

					line1.material = val ? matLineDashed : matLineBasic;

				} );

				gui.add( param, 'dash scale', 0.5, 2, 0.1 ).onChange( function ( val ) {

					matLine.dashScale = val;
					matLineDashed.scale = val;

				} );

				gui.add( param, 'dash / gap', { '2 : 1': 0, '1 : 1': 1, '1 : 2': 2 } ).onChange( function ( val ) {

					switch ( val ) {

						case '0':
							matLine.dashSize = 2;
							matLine.gapSize = 1;

							matLineDashed.dashSize = 2;
							matLineDashed.gapSize = 1;

							break;

						case '1':
							matLine.dashSize = 1;
							matLine.gapSize = 1;

							matLineDashed.dashSize = 1;
							matLineDashed.gapSize = 1;

							break;

						case '2':
							matLine.dashSize = 1;
							matLine.gapSize = 2;

							matLineDashed.dashSize = 1;
							matLineDashed.gapSize = 2;

							break;

					}

				} );

			}
    }
  }
}
</script>

<style scoped>
  div#container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
</style>