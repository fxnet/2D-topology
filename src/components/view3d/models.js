import $ from 'jquery';

import * as THREE from 'three';
window.THREE = THREE;

require('./js/MTLLoader');
require('three/examples/js/loaders/OBJLoader');

import config from './config';

let modelIndex = null;

let models;

class Models {
  constructor () {
    this.models = {};
  }
  static preload (callback) {
    $.ajax({
      url: `${process.env.MODEL_BASE_PATH}/index.json`,
      type: 'get',
      async: true,
      dataType: 'json',
      success: (modelIndex0) => {
        modelIndex = modelIndex0;
        if (!modelIndex.alt) modelIndex.alt = [];
        const count = modelIndex.names.length;
        let loaded = 0;
        modelIndex.names.forEach(name => {
          Models.getModel(name, (model) => {
            console.log(loaded, count, ' models preloaded.');
            loaded += 1;
            if (loaded === count) {
              console.log('All models preloaded.');
              if (callback) callback(true);
            }
          }, false);
        });
      },
      error: (XMLHttpRequest, textStatus, errorThrown) => {
        // throw errorThrown;
        if (callback) callback(false, errorThrown);
      }
    });
  }
  updateModelOwnerRelations (model) {
    model.traverse((child) => {
      child.ownerNode = model;
    });

    return model;
  }
  getModel (name, callback, getNew = true) {
    const processModel = (model) => {
      if (callback) {
        let newModel = model;
        if (getNew) {
          newModel = model.clone()
          this.updateModelOwnerRelations(newModel);
        }
        callback(newModel);
      }
    };
    if (this.models[name]) processModel(this.models[name]);
    else {
      Models.loadObjMtlModel({
        path: `${process.env.MODEL_BASE_PATH}/${modelIndex.path}/`,
        name: modelIndex.alt[name] || name,
        materialsCallback: (materials) => {
          const hsl = {};
          Object.keys(materials.materials).forEach(matName => {
            const mat = materials.materials[matName];
            const mats = mat instanceof Array ? mat : [mat];
            mats.forEach(m => {
              m.specular.getHSL(hsl);
              if (hsl.l < 0.8) { // debug
                hsl.l = 0.8;
                m.specular.setHSL(hsl.h, hsl.s, hsl.l);
              }
              m.shiness = 30;
            });
          });
        },
        loadedCallback: (modelLoaded) => {
          const box3 = new THREE.Box3();
          box3.setFromObject(modelLoaded);
          const size = box3.getSize(new THREE.Vector3());
          const d = Math.max(size.x, size.y, size.z);
          if (d > config.layout.modelMaxSize) {
            const scale = config.layout.modelMaxSize / d;
            modelLoaded.children.forEach(c => {
              c.scale.set(scale, scale, scale);
            });
          }

          this.updateModelOwnerRelations(modelLoaded);

          this.models[name] = modelLoaded;

          processModel(modelLoaded);
        }
      });
    }
  }
  static getModel (name, callback) {
    if (!models) models = new Models();
    models.getModel(name, callback);
  }
  static loadObjMtlModel (params) {
    const obj = params.obj || `${params.name}.obj`;
    const mtl = params.mtl || `${params.name}.mtl`;
    const mtlLoader = new THREE.MTLLoader();
    mtlLoader.setCrossOrigin('anonymous');
    // mtlLoader.setCrossOrigin('*');
    mtlLoader.setPath(params.path);
    mtlLoader.load(mtl, (materials) => {
      materials.preload();
      if (params.materialsCallback) params.materialsCallback(materials);

      const objLoader = new THREE.OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.setPath(params.path);
      objLoader.load(
        obj,
        (object) => {
          if (params.loadedCallback) params.loadedCallback(object);
        },
        (xhr) => {
          // if (xhr.lengthComputable) {
          //   const percentComplete = xhr.loaded / xhr.total * 100;
          //   console.log(Math.round(percentComplete, 2) + '% downloaded');
          // }
        },
        (xhr) => {
        }
      );
    });
  }
}

export default Models;
