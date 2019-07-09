import * as THREE from 'three';
import { NetGroup, NetConnect } from './objects';
import $ from 'jquery';
window.THREE = THREE;

require('./js/OrbitControls');
require('three/examples/js/controls/TransformControls');

require('three/examples/js/postprocessing/EffectComposer');
require('three/examples/js/postprocessing/FilmPass');
require('three/examples/js/postprocessing/MaskPass');
require('three/examples/js/postprocessing/RenderPass');
require('three/examples/js/postprocessing/ShaderPass');
require('three/examples/js/postprocessing/UnrealBloomPass');
// require('three/examples/js/postprocessing/SSAOPass');
// require('three/examples/js/shaders/ConvolutionShader');
require('three/examples/js/shaders/CopyShader');
// require('three/examples/js/shaders/DotScreenShader');
require('three/examples/js/shaders/FilmShader');
require('three/examples/js/shaders/FXAAShader');
require('three/examples/js/shaders/LuminosityHighPassShader');

import Models from './models';
import config from './config';
import constants from './constants';
import AttackAnimate from './animate';
import Layout from './js/Layout';
import Utils from './js/Utils';

const LAYOUT_STAR = 1; // 星形布局
const LAYOUT_RECT = 2; // 方形布局

const IS_DEV = process.env.NODE_ENV === 'development';

const POSTPROCESS_ENABLED = false;

// variables

const cameraFrustum = new THREE.Frustum();
const projectionMatrix = new THREE.Matrix4();
const nodesInView = [];

class Viewer3d {
  constructor (container, params) {
    this.params = {
      labelStyleClass: 'label',
      effects: {
        // FXAA: true,
        // bloom: true,
        // // film: true
      },
    };
    Object.assign(this.params, params);

    this.container = container;

    const animate = () => {
      requestAnimationFrame(animate);
      // this.logWithTime('animate');
      if (this.controls.enabled) this.controls.update();

      if (this.businessShow) {
        this.labels.forEach(label => {
          const position = label.owner.localToWorld(label.position.clone());
          this.project(position, this.camera);
          if (position.z >= 0 && position.z <= 1) {
            label.dom.style.top = `${position.y}px`;
            label.dom.style.left = `${position.x}px`;
            label.dom.classList.toggle('hide', false);
          } else {
            label.dom.classList.toggle('hide', true);
          }
        });
      }
      
      if (config.debug.showDebugText) {
        this.texts.forEach(text => {
          const position = text.owner.localToWorld(text.position.clone());
          const camreaDistance = position.distanceTo(this.camera.position);
          this.project(position, this.camera);
          if (position.z >= 0 && position.z <= 1 && camreaDistance <= config.debug.debugTextVisibleDistance) {
            text.dom.style.top = `${position.y}px`;
            text.dom.style.left = `${position.x}px`;
            text.dom.classList.toggle('hide', false);
          } else {
            text.dom.classList.toggle('hide', true);
          }
        });
      }

      if (POSTPROCESS_ENABLED) this.composer.render();
      else this.renderer.render(this.scene, this.camera);
      if (this.stats) this.stats.update();

      if (this.map) {
        if (this.sceneInfo) {
          const cameraDirection = this.camera.position.clone().sub(this.controls.target).normalize();
          let radius = this.sceneInfo.radius;
          if (this.map.camera.aspect <1) radius /= this.map.camera.aspect;
          this.map.camera.position.addVectors(this.sceneInfo.center, cameraDirection.setLength(radius));
          this.map.camera.lookAt(this.sceneInfo.center);
        }
        this.map.renderer.render(this.scene, this.map.camera);
      }

      // this.dispatchEvent( { type: 'nodesviewchange', nodes: nodesInView } );
    }

    this.init();
    animate();
  }

  handleResize () {
    const r = this.container.getBoundingClientRect();
    this.renderer.setSize(r.width, r.height);
    this.resolution.set(r.width, r.height);
    if (POSTPROCESS_ENABLED) this.composer.setSize(r.width, r.height);

    this.camera.aspect = r.width / r.height;
    // if (this.camera.aspect > 1) this.camera.zoom = this.camera.aspect;
    // else this.camera.zoom = 1;

    this.camera.updateProjectionMatrix();

    if (this.map) {
      const rm = this.map.container.getBoundingClientRect();
      this.map.renderer.setSize(rm.width, rm.height);
      this.map.camera.aspect = rm.width / rm.height;
      // if (this.map.camera.aspect > 1) this.map.camera.zoom = this.map.camera.aspect;
      // else this.map.camera.zoom = 1;
      this.map.camera .updateProjectionMatrix();

      // const box3 = new THREE.Box3();
      // box3.setFromObject(this.rootNode);
      // const size = box3.getSize();
    }
  }

  project (vector3, camera) {
    const r = this.container.getBoundingClientRect();
    vector3.project(camera);
    vector3.x = (vector3.x + 1)/2 * r.width;
    vector3.y = -(vector3.y - 1)/2 * r.height;
    return vector3;
  }

  init () {
    this.scene = new THREE.Scene();
    // this.scene.fog = new THREE.Fog(0x87ceeb, 1, 100);
    // this.scene.fog.color.setHSL(0.6, 0, 1);

    this.businessesNames = {};
    this.objects = [];
    this.labels = [];
    if (config.debug.showDebugText) this.texts = [];

    this.camera = new THREE.PerspectiveCamera(60, 1, 1, 2000);
    this.camera.position.set(40, 10, 40);

    this.raycaster = new THREE.Raycaster();

    this.scene.add(new THREE.AmbientLight(0x999999));
    const dl = new THREE.DirectionalLight(0x999999, 1);
    dl.position.set(50, 190, 50);
    this.scene.add(dl);

    if (IS_DEV) {
     this.scene.add(new THREE.AxesHelper(10));
    }

    this.renderer = new THREE.WebGLRenderer({ antialias: true }); // alpha: true
    this.renderer.setClearColor(0x000000);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.container.appendChild(this.renderer.domElement);

    this.resolution = new THREE.Vector2();
    Utils.setResolution(this.resolution);

    if (POSTPROCESS_ENABLED) this.initPostProcessing();

    this.controls = new THREE.OrbitControls(this.camera, this.container);
    // this.controls.maxPolarAngle = Math.PI * 0.45;
    this.controls.zoomSpeed = 1.0;
    this.controls.rotateSpeed = 0.1
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.1;

    if (IS_DEV) {
      this.transformControls = new THREE.TransformControls(this.camera, this.container);
      this.scene.add(this.transformControls);

      this.stats = new window.Stats();
      this.container.appendChild(this.stats.dom);
    }

    this.highlightedMaterial = new THREE.MeshPhongMaterial({emissive: 0xaa6666});

    this.handleResize();

    //
    this.rootNode = new THREE.Group();
    this.scene.add(this.rootNode);

    this.nodesDataById = {};
    this.nodesById = {};

    this.selected = null;

    if (IS_DEV) {
      console.log(this);
    }
  }
  initPostProcessing () {
    const rect = this.container.getBoundingClientRect();

    this.composer = new THREE.EffectComposer(this.renderer);
    const renderPass = new THREE.RenderPass(this.scene, this.camera);
    // renderPass.renderToScreen = true;
    this.composer.addPass(renderPass);
    this.renderer.gammaInput = true;
    this.renderer.gammaOutput = true;
    if (this.params.effects.FXAA) {
      /* eslint func-names:['off'] */
      const effectFXAA = new THREE.ShaderPass(THREE.FXAAShader);
      effectFXAA.uniforms.resolution.value.set(1 / rect.width, 1 / rect.height);
      effectFXAA.setSize = function (width, height) {
        this.uniforms.resolution.value.set(1 / width, 1 / height);
      };

      this.composer.addPass(effectFXAA);
    }

    // if (this.params.effects.ao) {
    //   const ssaoPass = new THREE.SSAOPass(this.scene, this.camera, this.renderer, new THREE.Vector2(rect.width, rect.height));
    //   this.composer.addPass(ssaoPass);
    // }

    if (this.params.effects.bloom) {
      const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(rect.width, rect.height), 1, 0.5, 0.3);
      this.composer.addPass(bloomPass);
    }

    if (this.params.effects.film) {
      const effectFilm = new THREE.FilmPass(0.15, 0.1, 1000, false);
      this.composer.addPass(effectFilm);
    }

    const copyPass = new THREE.ShaderPass(THREE.CopyShader);
    copyPass.renderToScreen = true;
    this.composer.addPass(copyPass);

    console.log(this.composer.passes[1]);
  }
  /**
  * 设置全景图背景
  * @param images 全景图6张图片
  * @param images.right {string} 右图片
  * @param images.left  {string} 左图片
  * @param images.up    {string} 上图片
  * @param images.down  {string} 下图片
  * @param images.front {string} 前图片
  * @param images.back  {string} 后图片
  * @param [basePath] {string} 基础路径
  **/
  setBackground (images, basePath = '') {
    var urls = [
      `${basePath}${images.right}`,
      `${basePath}${images.left}`,
      `${basePath}${images.up}`,
      `${basePath}${images.down}`,
      `${basePath}${images.front}`,
      `${basePath}${images.back}`
    ];

    const reflectionCube = new THREE.CubeTextureLoader().load(urls);
    reflectionCube.format = THREE.RGBFormat;
    reflectionCube.mapping = THREE.CubeReflectionMapping;

    this.scene.background = reflectionCube;
  }
  /**
  * 添加网格地面
  * @param cellSize {number} 格子大小
  * @param cellCount {number} 格子个数
  * @param color {number|cssColor} 颜色。颜色数值或CSS颜色。
  **/
  createGridGround (cellSize = 5, cellCount = 40, color = 0x111144) {
    if (this.gridGround) {
      this.scene.remove(this.gridGround);
      this.gridGround = null;
    }

    const radius = cellSize * cellCount / 2;
    this.gridGround = new THREE.GridHelper(radius * 2, cellCount, color, color);
    this.gridGround.userData.radius = radius;
    this.gridGround.userData.radius0 = radius;
    this.scene.add(this.gridGround);
  }
  /**
   * 设置网格大小（半径/边长的一般）
  * @param radius {number} 格子大小
   */
  setGridGroundSize (radius) {
    if (radius < this.gridGround.userData.radius0) radius = this.gridGround.userData.radius0;
    const scale = radius / this.gridGround.userData.radius;
    this.gridGround.userData.radius = radius;
    this.gridGround.scale.set(scale, scale, scale);
  }
  createMap (container) {
    if (!this.map) {
      this.map = {
        container
      };
      this.map.camera = this.camera.clone();
      this.map.camera.position.set(0, 50, 50);
      this.map.camera.lookAt(new THREE.Vector3());
      this.map.camera.layers.enable(constants.LAYER_MAP_ONLY);
      this.map.renderer = new THREE.WebGLRenderer({ antialias: true }); // alpha: true
      this.map.renderer.setClearColor(0x000000);
      this.map.renderer.setPixelRatio(window.devicePixelRatio);
      this.map.renderer.gammaInput = true;
      this.map.renderer.gammaOutput = true;
      this.map.container.appendChild(this.map.renderer.domElement);

      this.handleResize();
    }
  }
  setBusinessesNames (businessesNames) {
    this.businessesNames = businessesNames;

    this.labels.forEach(label => {
      if (this.businessesNames[label.busnId]) label.dom.innerText = this.businessesNames[label.busnId];
    });
  }
  showBusiness (show) {
    this.businessShow = show;
    if (show) this.camera.layers.enable(constants.LAYER_BUSINUSS);
    else this.camera.layers.disable(constants.LAYER_BUSINUSS);
    this.container.classList.toggle('businessShow', show);
  }
  rebaseNode (node, center) {
    if (center) {
      node.position.copy(center);
    } else {
      const box3 = new THREE.Box3();
      box3.setFromObject(node);
      const offset = box3.getCenter(new THREE.Vector3());
      offset.y -= box3.getSize(new THREE.Vector3()).y / 2;
      node.position.sub(offset);
      box3.setFromObject(node);

      const radius = Math.max(10, box3.getBoundingSphere(new THREE.Sphere()).radius);
      
      this.setGridGroundSize(radius * 1.1);

      this.controls.target.set(0, 0, 0);
      this.controls.maxDistance = radius * 5;
      this.camera.position.set(radius * 2, radius, radius * 2);
      this.camera.far = this.controls.maxDistance * 5;
      this.camera.updateProjectionMatrix();
    }
  }
  fitCamera (camera, target) {
    const box3 = new THREE.Box3();
    box3.setFromObject(target);
    const center = box3.getCenter(new THREE.Vector3());
    camera.lookAt(center);

    this.sceneInfo = {
      center,
      radius: Math.max(100, box3.getBoundingSphere(new THREE.Sphere()).radius / Math.sin(THREE.Math.degToRad(this.map.camera.fov / 2)))
    };
  }
  moveCamera (type) {
    if (type === 'left') this.controls.rotateLeft(1/180);
    if (type === 'right') this.controls.rotateLeft(-1/180);
    if (type === 'in') this.controls.dollyIn(0.9);
    if (type === 'out') this.controls.dollyOut(0.9);
    // this.controls.update();
  }
  logWithTime (message) {
    const time = new Date().getTime();
    const deltaTime = this.lastLogTime ? time - this.lastLogTime : undefined;
    this.lastLogTime = time;
    console.log('[logWithTime] ', message, time, deltaTime);
  }
  /**
  * 加载场景数据
  * @param data {json/url} 根据 json 数据或 url 加载场景数据。
  * @param [callback] {function()} 加载完成回调函数。
  * @param center {THREE.Vector3} 指定显示的中心位置
  * @param clearOnlyData {boolean}
  * @returns
  **/
  loadData (data, callback, center, clearOnlyData) {
    const processData = (dataLoaded) => {
      // this.logWithTime('loading block debug, 3');
      this.nodesData = dataLoaded;
      this.nodesDataById = {};
      this.nodesById = {};
      this.nodesData.nodeList.forEach(n => {
        this.nodesDataById[n.nodeId] = n;
      });
      const processTreeNodes = (nodes, pid = null) => {
        nodes.forEach(node => {
          const id = node.nodeId;
          this.addNode(id, pid, node);
          if (node.items && node.items.length > 0) processTreeNodes(node.items, id);
        });
      };
      // ...
      this.rootNode.userData = {
        nodeItem: {
          items: {
            length: dataLoaded.nodeTree.length
          }
        }
      };
      // this.logWithTime('loading block debug, 4');
      processTreeNodes(dataLoaded.nodeTree); // 500ms (to rendering frames)
      // this.logWithTime('loading block debug, 5');
      this.relayout(); // 823ms (to webworkers)
      // this.logWithTime('loading block debug, 6');
      this.rebaseNode(this.rootNode, center); // 259ms (to webworkers)
      if (this.map) this.fitCamera(this.camera, this.rootNode);
      // this.logWithTime('loading block debug, 7');
      if (callback) callback(dataLoaded);
      // this.logWithTime('loading block debug, 8');
      // firs render 2000ms (to rendering frames)
    };
    if (typeof data === 'string') {
      // this.logWithTime('loading block debug, 1');
      $.ajax({ // 6840ms
        url: data,
        type: 'get',
        async: true,
        dataType: 'json',
        success: (dataLoaded) => {
          // this.logWithTime('loading block debug, 2');
          if (dataLoaded && dataLoaded.resultCode == '0') {
            if ((!clearOnlyData) || dataLoaded.nodeTree.length > 0) this.clearData();
            processData(dataLoaded);
          }
        },
        error: (XMLHttpRequest, textStatus, errorThrown) => {
          if (callback) callback(false);

          throw errorThrown;
        }
      });
    } else processData(data);
  }
  clearData () {
    this.nodesData = null;
    this.nodesDataById = {};
    this.nodesById = {};
    this.transformNode();

    this.labels.forEach(label => {
      this.container.removeChild(label.dom);
    });
    this.labels.splice(0);
    
    if (config.debug.showDebugText) {
      this.texts.forEach(text => {
        this.container.removeChild(text.dom);
      });
      this.texts.splice(0);
    }

    while (this.rootNode.children.length > 0) this.rootNode.remove(this.rootNode.children[0]);
  }
  addNode (id, pid, nodeItem) {
    const nodeData = this.nodesDataById[id];
    Models.getModel(nodeData.nodeType, (model) => {
      if (model) {
        const layout = this.getNodeItemLayout(nodeItem);

        // const nodeGeo = layout === 'star' ? new THREE.CylinderGeometry(0.4, 0.4, 0.1, 16, 1) : new THREE.BoxGeometry(0.4, 0.1, 0.6);
        // const nodeMat = new THREE.MeshPhongMaterial({ color, emissive: 0x111111 });
        // const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
        const nodeMesh = model;
        nodeMesh.userData.nodeItem = nodeItem;
        nodeMesh.userData.nodeData = nodeData;
        nodeMesh.userData.pnodeid = pid;
        const pnode = this.nodesById[pid] || this.rootNode;
        nodeMesh.userData.isNode = true;
        nodeMesh.pickable = true;
        pnode.add(nodeMesh);
        // Utils.addBusinessVisual(pnode);
        this.nodesById[id] = nodeMesh;

        if (IS_DEV || pnode !== this.rootNode) {
          const connect = new NetConnect(new THREE.Vector3(), new THREE.Vector3(), config.appearance.connect.size || 3, pnode === this.rootNode ? 0xff9999 : (config.appearance.connect.color || undefined));
          nodeMesh.userData.connect = connect;
          pnode.add(connect);
        }

        const itemsLength = pnode === this.rootNode ? this.nodesData.nodeTree.length : pnode.userData.nodeItem.items.length;

        this.objects.push(nodeMesh);

        // Add ip as text for debug
        if (config.debug.showDebugText) {
          const domText = document.createElement('span');
          domText.className = 'text';
          domText.innerText = nodeData.nodeIp;
          this.container.appendChild(domText);
          const box3 = new THREE.Box3();
          box3.setFromObject(nodeMesh);
          const bottom = new THREE.Vector3(0, -box3.getSize(new THREE.Vector3()).y / 2, 0);
          this.texts.push({
            owner: nodeMesh,
            nodeIp: nodeData.nodeIp,
            dom: domText,
            position: bottom
          });
        }
      }
    })
  }
  deleteNode(node) {
    const pnode = this.nodesById[node.userData.pnodeid];
    if (pnode) {
      if (node.userData.connect) pnode.remove(node.userData.connect);
      pnode.remove(node);
    }
  }
  // 按星形布局
  /*
    问题：
      包围盒计算不对
      绘制不对
      // 连线影响包围圈
      问题节点分析
  */
  relayoutNodeStar (node) {
    Layout.relayoutNodeStar(node);
  }
  // 按方形布局
  relayoutNodeRect (node) {
    Layout.relayoutNodeRect(node);
  }
  // 布局节点（下子节点）
  relayoutChildrenNodes (node) {
    const layout = this.getNodeItemLayout(node.userData.nodeItem);
    switch (layout) {
      case LAYOUT_STAR:
        this.relayoutNodeStar(node);
        break;
      case LAYOUT_RECT:
        this.relayoutNodeRect(node);
        break;
    }
  }
  // 布局节点（或包含所有子孙节点）
  relayoutNodes (node, rescurse = false) {
    const children = node.children.filter(e => e.userData.isNode);
    if (rescurse) {
      children.forEach(c => {
        this.relayoutNodes(c, rescurse);
      });
    }
    this.relayoutChildrenNodes(node);
    children.forEach(c => {
      if(!this.nodeItemIsLeaf(c.userData.nodeItem)) {
        const bv = Utils.addBusinessVisual(c);
        bv.position.setY(-config.layout.levelHeight);
        const busnName = this.businessesNames[c.userData.nodeData.busnId] || '(未知)';
        const domLabel = document.createElement('span');
        domLabel.className = 'label';
        domLabel.innerText = busnName;
        this.container.appendChild(domLabel);
        const alignment = config.appearance.business.alignment || [0, 0];
        this.labels.push({
          owner: bv,
          busnId: c.userData.nodeData.busnId,
          dom: domLabel,
          position: new THREE.Vector3(bv.userData.radius * alignment[0], 0, -bv.userData.radius * alignment[1])
        });
        if (c.userData.childrenOffset) bv.position.add(c.userData.childrenOffset);
      }
    });
  }
  // 重新布节点
  relayout (rescurse = true, opt = true) {
    // this.relayoutNodes(this.rootNode, rescurse, false);
    this.relayoutNodes(this.rootNode, rescurse, opt);
  }
  nodeItemIsLeaf (nodeItem) {
    return nodeItem && (!nodeItem.items || nodeItem.items.length === 0);
  }
  getNodeItemLayout (nodeItem) {
    if (!nodeItem) return LAYOUT_STAR;

    let layout = LAYOUT_RECT;

    if (!this.nodeItemIsLeaf(nodeItem)) {
      for (let i = 0, l = nodeItem.items.length; i < l; i += 1) {
        if (!this.nodeItemIsLeaf(nodeItem.items[i])) {
          layout = LAYOUT_STAR;
          break;
        }
      }
    }

    return layout;
  }
  nodesInView ( optionalTargetResultArray, optionalCenter) {
    const result = optionalTargetResultArray || [];
    result.splice(0);

    projectionMatrix.multiplyMatrices( this.camera.projectionMatrix, this.camera.matrixWorldInverse );
    cameraFrustum.setFromMatrix(projectionMatrix);
    const worldPosition = new THREE.Vector3();
    const box3 = new THREE.Box3();
    this.rootNode.traverse(node => {
      if (node.type === 'Mesh' && node.ownerNode && node.ownerNode.userData.isNode) {
        if ((!result.includes(node.ownerNode)) && cameraFrustum.intersectsObject(node)
          && node.getWorldPosition(worldPosition).distanceTo(this.camera.position) < config.data.nodesInViewDistance) {
          result.push(node.ownerNode);
          box3.expandByPoint(worldPosition);
        }
      }
    });

    if (optionalCenter) box3.getCenter(optionalCenter);

    return result;
  }
  /**
  * 根据条件显示或隐藏节点
  * @param node {string/json} 筛选节点ID或属性条件。要被处理（如显示或隐藏）的节点条件。
  * @param show {boolean/function(node)} 符合条件的节点将会被根据此值根据函数返回值决定是否显示或隐藏。
  * @reutrns
  **/
  showNode (node, show) {
    // todo
    console.warn('showNode: todo');
  }
  /**
  * 节点是否高亮
  * @param node {Node} 要被查询的节点。
  * @reutrns {boolean} 是否高亮。
  **/
  nodeIsHighlight (node) {
    return node.userData.highlighted;
  }
  /**
  * 为指定节点开启变换工具。用于调试使用。
  * @param node {Node} 要开启变换的节点。如果为空，则关闭变换。
  **/
  transformNode (node) {
    if (!IS_DEV) return;

    if (node) {
      this.transformControls.attach(node);
      this.transformControls.visible = true;
    } else {
      this.transformControls.detach();
      this.transformControls.visible = false;
    }
  }
  /**
  * 高亮节点
  * @param node {Node} 要被处理（如高亮或恢复）的节点。
  * @param show {boolean} 是否高亮。
  * @param naturalOnly {boolean} 是否只高亮亲生子节点。
  * @reutrns
  **/
  highlightNode (node, highlight = true, naturalOnly = true, material) {
    node.userData.highlighted = highlight;

    node.traverse(child => {
      if (naturalOnly && child.ownerNode !== node) return;

      if (child.material) {
        if (highlight) {
          if (!child.userData.materialSaved) child.userData.materialSaved = child.material;
          child.material = material || this.highlightedMaterial;
        } else {
          if (child.userData.materialSaved) child.material = child.userData.materialSaved;
          child.userData.materialSaved = undefined;
        }
      }
    });
  }
  /**
  * 返回容器在当前坐标位置拾取到的第一个节点
  * @param x {number} 窗口的 x 坐标。相对于三维区域的相对坐标。
  * @param y {number} 窗口的 y 坐标。相对于三维区域的相对坐标。
  * @returns {Node}
  **/
  nodeFromContainerPosition (clientX, clientY) {
    const rect = this.container.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;

    const vector = new THREE.Vector2(x, y);
    this.raycaster.setFromCamera(vector, this.camera);

    const intersects = this.raycaster.intersectObjects(this.objects, true).map(e => e.object).map(e => e.ownerNode || e).filter(e => e.pickable);
    if (intersects.length > 0) {
      return intersects[0];
    }
  }
  /**
  * 显示攻击动画
  * @param attackData {object} 攻击数据
  **/
  showAttackAnimation (attackData) {
    const animaTime = attackData.attackAnima.animaTime;
    const lineColor = attackData.attackAnima.lineColor;
    attackData.attackList.forEach(attack => {
      // const srcNode = this.nodesById[attack.srcNodeId];
      // const destNode = this.nodesById[attack.destNodeId];
      // if (srcNode) this.highlightNode(srcNode);
      // if (destNode) this.highlightNode(destNode);
      const attackRouteNodes = attack.attackRoute.split(/[-,]/).map(e => this.nodesById[e]).filter(e => e);
      if (attackRouteNodes.length > 1) {
        new AttackAnimate(this, attackRouteNodes, animaTime, lineColor);
      }
    });
  }
  viewToNodeId (nodeId) {
    const node = this.nodesById[nodeId];
    if (!node) return;

    const destDistance = config.layout.modelMaxSize * 3;
    const destCenter = node.getWorldPosition();
    // console.log("Viewing to nodeId ", nodeId, destCenter);
    const cameraDestPosition = node.localToWorld(new THREE.Vector3(0, 0, destDistance)); // .setY(destDistance);
    const cameraInitQuaternion = this.camera.getWorldQuaternion();
    const cameraDestQuaternion = node.getWorldQuaternion().inverse();
    this.controls.enabled = false;
    this.controls.clearDamping();

    // {
    //   // Add path
    //   const geometry = new THREE.Geometry();
    //   const time = Math.max((1 - this.camera.quaternion.dot(cameraDestQuaternion)) * 3000, this.camera.position.distanceTo(cameraDestPosition) / 10 * 1000, 2000);
    //   // const pathRadiusOuter = destDistance * 3;
    //   // const pathRadiusInner = destDistance;
    //   // const raduisDirection = new THREE.Vector3();
    //   // const raduisPositionOuter = new THREE.Vector3();
    //   // const raduisPositionOuter = new THREE.Vector3();
    //   const sphericalStart = new THREE.Spherical().setFromVector3(this.camera.position.clone().sub(destCenter));
    //   const sphericalEnd = new THREE.Spherical().setFromVector3(cameraDestPosition.clone().sub(destCenter));
    //   const spherical = new THREE.Spherical();
    //   for (let t = 0; t < time; t += 100) {
    //     const progress = t / time;
    //     // spherical.set(pathRadiusOuter * progress + pathRadiusInner * (1 - progress), sphericalStart.phi * progress + sphericalEnd.phi * (1 - progress), sphericalStart.theta * progress + sphericalEnd.theta * (1 - progress));
    //     spherical.set(sphericalStart.radius * progress + sphericalEnd.radius * (1 - progress), sphericalStart.phi * progress + sphericalEnd.phi * (1 - progress), sphericalStart.theta * progress + sphericalEnd.theta * (1 - progress));
    //     // raduisDirection.subVectors();
    //     // raduisPositionInner.lerp();
    //     // const raduisPositionOuter;
    //     // geometry.vertices.push((new THREE.Vector3().lerpVectors(raduisPositionOuter, raduisPositionInner, t / time));
    //     geometry.vertices.push(new THREE.Vector3().setFromSpherical(spherical).add(destCenter));
    //   }
    //   var material = new THREE.LineBasicMaterial( { linewidth: 1, color:0x00ff00} );
    //   var pathLine = new THREE.Line( geometry, material );
    //   this.scene.add(pathLine);

    //   return;
    // }


    var aniMeshHolder = new THREE.Mesh();
    aniMeshHolder.frustumCulled = false;
    const sphericalStart = new THREE.Spherical().setFromVector3(this.camera.position.clone().sub(destCenter));
    const sphericalEnd = new THREE.Spherical().setFromVector3(cameraDestPosition.clone().sub(destCenter));
    const spherical = new THREE.Spherical();
		aniMeshHolder.clock = new THREE.Clock();
    const time = THREE.Math.clamp(this.camera.position.distanceTo(cameraDestPosition) / config.animation.viewToSpeed,
      config.animation.viewToMinTime, config.animation.viewToMaxTime);
    aniMeshHolder.onBeforeRender = () => {
      const progress = aniMeshHolder.clock.getElapsedTime() / time;
      if (progress <= 1) {
        const progressLeft = 1 - progress;
        spherical.set(sphericalStart.radius * progressLeft + sphericalEnd.radius * progress, sphericalStart.phi * progressLeft + sphericalEnd.phi * progress, sphericalStart.theta * progressLeft + sphericalEnd.theta * progress);
        this.camera.position.setFromSpherical(spherical).add(destCenter);
        THREE.Quaternion.slerp(cameraInitQuaternion, cameraDestQuaternion, this.camera.quaternion, progress);
      } else {
        this.scene.remove(aniMeshHolder);

        this.controls.target.copy(destCenter);
        this.controls.enabled = true;
      }
    };
    this.scene.add(aniMeshHolder);
  }
  setSceneSwitch (swtch, value) {
    if (swtch === 'materialWireframe') {
      this.scene.overrideMaterial = value ? new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true }) : null;
    } else if (swtch === 'materialNormal') {
      this.scene.overrideMaterial = value ?  new THREE.MeshNormalMaterial() : null;
    }
  }
  /**
  * 获取渲染信息（调试用）
  **/
  getRendererInfo () {
    const info = this.renderer.info;
    return {
      geo: info.memory.geometries,
      tex: info.memory.textures,
      call: info.render.calls,
      vert: info.render.vertices,
      face: info.render.faces,
      point: info.render.points,
      prog: info.programs.length
    };
  }
}

export default Viewer3d;
