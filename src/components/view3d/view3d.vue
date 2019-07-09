<template>
  <div>
    <div id="container">
    </div>
  </div>
</template>

<script>
import Viewer from './viewer';
import config from './config';

export default {
  name: 'view3d',
  data () {
    return {
    }
  },
  mounted () {
    this.init();
  },
  methods: {
    init () {
      this.viewer = new Viewer(document.querySelector('#container'), {
        labelStyleClass: 'label'
      });

      this.viewer.setBackground(
        {
          right: 'right.jpg',
          left: 'left.jpg',
          up: 'top.jpg',
          down: 'bottom.jpg',
          front: 'front.jpg',
          back: 'back.jpg'
        },
        '/static/assets/background/'
      );
      this.viewer.createGridGround(config.appearance.ground.cellSize, config.appearance.ground.cellCount, config.appearance.ground.color);

      window.addEventListener('resize', () => { this.viewer.handleResize(); });

      console.log('process.env', process.env.NODE_ENV);
      if (process.env.NODE_ENV === 'development') {
        console.log('View3d', this.view3d);
      }
    },
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

<style>
  span.label {
    position: absolute;
    z-index: 99999;
    padding: 6px;
    color: blue;
    background-color: #efff00c4;
    border: 1px solid black;
    border-radius: 6px;
    /* alignment */
    -ms-transform: translate(-50%,-50%);
    -moz-transform: translate(-50%,-50%);
    -o-transform: translate(-50%,-50%);
    transform: translate(-50%,-50%); 
    display: none;
  }

  span.text {
    position: absolute;
    z-index: 99999;
    color: yellow;
    /*
    background-color: #71716cc4;
    border: 1px solid #614d4d;
    border-radius: 6px;
    display: none;
    padding: 6px;
    */
    /* alignment */
    -ms-transform: translate(-50%,0);
    -moz-transform: translate(-50%,0);
    -o-transform: translate(-50%,0);
    transform: translate(-50%,0); 
  }

  div#container.businessShow span.label, div#container span.text {
    display: inline-table;
  }

  span.label.hide, span.text.hide {
    display: none !important;
  }
</style>
