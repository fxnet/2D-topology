<style lang="less">
  @import "../assets/less/fullscreen";
</style>

<template>

  <div class='fullscreen'  @mousemove="modal_mouse($event,'move')"
       @mouseup="modal_mouse($event,'up')">
      <div class="content" id="content">
        <div class="header valign">
          <div class="cast_module">
            <div class="cast_module_tab">
              <button class="selected"><i class="three"></i><label>3D</label></button>
              <button class="" @click="cast_2d()"><i class="two"></i><label>2D</label></button>
            </div>
            <br>
            <div class="cast_module_tab">
              <button class="selected moduleReality"><i class="reality"></i><label>实际</label></button>
              <button class="moduleBusiness"><i class="business"></i><label>业务</label></button>
            </div>
          </div>
          <h3 class="title">{{window_title}}</h3>
          <div class="cast_2d valign">
            <div class="scale">
              <div class="scale_option">
                <button class="scale_zuo" data-id="left">&lt;</button>
                <button class="scale_jian" data-id="in">-</button>
                <button class="scale_jia" data-id="out">+</button>
                <button class="scale_you" data-id="right">&gt;</button>
              </div>
            </div>
            <div class="btn_other_options">
              <button class="one" v-bind:class="{selected:filter_mouse_obj.show==true}" @click="filter_mouse_obj.show=!filter_mouse_obj.show"></button>
              <i></i>
              <button class="two" v-bind:class="{selected:small_map==true}" @click="small_map=!small_map"></button>
              <i></i>
              <button class="three" v-bind:class="{selected:attack_list_mouse_obj.show==true}" @click="attack_list_mouse_obj.show=!attack_list_mouse_obj.show;attack_time_mouse_obj.show=!attack_time_mouse_obj.show;"></button>
            </div>
            <div class="search">
              <i ></i>
              <input type="text"
                     onfocus="this.parentNode.className+=' focus';"
                     onblur="if(this.value=='') this.parentNode.className=this.parentNode.className.replace(/ focus/g,'');"
                     placeholder="搜索" v-model="txtKeyWord"/>
              <i class="btnRemove" @click="clear_keyWord('global',$event)">×</i>
            </div>
          </div>
        </div>
        <div class="main_area">
          <div class='toolbar' v-if="IS_DEV">
            <span @click='getAttackDataContinuously(false)'>getAttackData</span>
            <span @click='setSceneSwitch("materialWireframe", "sceneSwitchMaterialWireframe")' title="Set scene material to wireframe. (Debug only.)">W</span>
            <span @click='setSceneSwitch("materialNormal", "sceneSwitchMaterialNormal")' title="Set scene material to normal. (Debug only.)">N</span>nodesInView
            <span @click='updateRenderSum'>{{renderSum}}</span>
            <span @click='nodesInView'>nodesInView</span>
            <span @click='viewToSelected'>viewTo</span>
          </div>
          <div id='testlist'>
            <form>
                <input type="text" placeholder="测试分组编号" v-model="groupId" @key.enter="loadTestData" style="width:60px; align-content: center;" />
                <button @click="loadTestData" title="加载测试数据">加载</button>
                <button @click="clearData" ttle="清除数据">清除</button>
              </form>
          </div>
          <view3d ref='view3d' id='container3d'></view3d>
          <div id="containerMap" v-show="small_map"></div>

        </div>
        <div class="show_node" v-show="filter_mouse_obj.show" v-bind:style="{left:filter_mouse_obj.left+'px',top:filter_mouse_obj.top+'px'}" v-bind:class="show_node_extend['filter']==false?'hide':''">
          <div class="shrink" @mousedown="modal_mouse($event,'down','filter')">
            <label class="noselect">筛选器</label>
            <button :class="show_node_extend['filter']?'extend_right':'extend_left'" @click="function(){show_node_extend['filter']=!show_node_extend['filter'];}"></button>
          </div>
          <div class="show_node_filter" v-if="show_node_extend['filter']">
            <i class="ts_ent_ic"></i>
            <input type="text" placeholder="搜索筛选条件" onfocus="this.parentNode.className+=' focus';"
                   onblur="if(this.value=='') this.parentNode.className=this.parentNode.className.replace(/ focus/g,'');" v-model="filterTxt">
            <i class="btnRemove" @click="clear_keyWord('filterTxt',$event)">×</i>
          </div>
          <ul class="node_parent" v-if="show_node_extend['filter']">
            <menuTree v-for='cel in filter_list.children' :fxTree='cel' :filterTxt='filterTxt'
                      :nodeDisplay="node_display"></menuTree>
          </ul>
        </div>
      </div>


    <div class="attack_time" v-show="attack_time_mouse_obj.show" v-bind:style="{left:attack_time_mouse_obj.left+'px',top:attack_time_mouse_obj.top+'px'}">
      <div class="shrink" @mousedown="modal_mouse($event,'down','attack_time')">
        <label class="noselect">攻击时间统计</label>
      </div>
      <div class="accack_time_content valign">
        <div class="item" id="processAttack" @click="processAttack">
          <img src="/static/img/common/3d/bulb-red.png"><br>
          <span>
            <label>正在发起攻击，<i>去处理</i></label>
            </span>
        </div>
        <div class="item">
          <label>{{attack_time_info?attack_time_info.startAttackNum:0}}</label><br>
          <label>发起攻击设备</label>
        </div>
        <div class="item">
          <label>{{attack_time_info?attack_time_info.attackedNum:0}}</label><br>
          <label>被攻击设备</label>
        </div>
      </div>
    </div>

    <div class="attack_list" v-show="attack_list_mouse_obj.show" v-bind:style="{left:attack_list_mouse_obj.left+'px',top:attack_list_mouse_obj.top+'px'}">
      <ul class="attack_list_ul attack_list_header">
        <li class="shrink" @mousedown="modal_mouse($event,'down','attack_list')">
          <label>攻击时间</label>
          <label>攻击源</label>
          <label>攻击源IP</label>
          <label>被攻击</label>
          <label>被攻击IP</label>
          <label>攻击类型</label>
          <label>端口</label>
        </li>
      </ul>
      <ul class="attack_list_ul">
        <li v-for="(item, i) in attack_list" v-bind:class="{'processingAttack': i === processingAttackIndex}">
          <label>{{Dateformat(item.dateTime,'yyyy-MM-dd hh:mm')}}</label>
          <label>{{item.source}}</label>
          <label>{{item.srcIp}}</label>
          <label>{{item.target}}</label>
          <label>{{item.destIp}}</label>
          <label>{{item.attackType}}</label>
          <label>{{item.port}}</label>
        </li>
      </ul>

    </div>

    <div class="modal edit_dev" v-if="nodeDetails"
         v-bind:style="{left:modal_mouse_obj.left+'px',top:modal_mouse_obj.top+'px'}">
      <div class="modal-header" @mousedown="modal_mouse($event,'down')">
        <label class="modal-header-title noselect">设备信息-{{nodeType_Cast(selected.userData.nodeData.nodeType)[0]}}-{{selected.userData.nodeData.nodeId}}</label>
        <button class="modal-header-close" @click="nodeSelect(selected, false)" style="top:10px;"></button>
      </div>
      <div class="modal-content" style="margin:0;">
        <div class="img valign">
          <img v-bind:src="nodeType_Cast(selected.userData.nodeData.nodeType)[2]">
        </div>
        <ul class="edit_node">
          <li class="depart">
            <label>所属部门：{{nodeDetails.nodeAttr.department}}</label>
            <label>负责人：{{nodeDetails.nodeAttr.manager}}</label>
          </li>
          <li class="status">

            <dl>
              <dt>是否安全：</dt>
              <dd>
                <div class="Checkbox_button" @click="node_change_status(true)"
                     v-bind:class="{selected:nodeDetails.nodeAttrInfo.isSafe===true}">
                  <button></button>
                  <label>安全</label><img style="margin-left: 2px;margin-top: 3px;" src="/static/img/common/ic-done-green.png"></div>
                <div class="Checkbox_button" @click="node_change_status(false)"
                     v-bind:class="{selected:nodeDetails.nodeAttrInfo.isSafe===false}">
                  <button></button>
                  <label>危险</label><img src="/static/img/common/ic-alert-yellow.png"></div>
              </dd>
            </dl>
          </li>
          <li>
            <dl>
              <dt>设备类型：</dt>
              <dd>{{nodeType_Cast(selected.userData.nodeData.nodeType)[0]}}</dd>
              <dt>IP地址：</dt>
              <dd>{{selected.userData.nodeData.nodeIp}}</dd>
              <dt>MAC：</dt>
              <dd>{{nodeDetails.nodeAttr.mac}}</dd>
            </dl>
          </li>
          <li>
            <dl>
              <dt>攻击类型：</dt>
              <dd>{{nodeDetails.nodeAttrInfo.attackType}}</dd>
              <dt>发起攻击的次数：</dt>
              <dd>23</dd>
              <dt>被攻击的次数：</dt>
              <dd>{{nodeDetails.nodeAttrInfo.attakCount}}</dd>
            </dl>
          </li>
          <li>
            <dl>
              <dt>应用信息：</dt>
              <dd>{{nodeDetails.nodeAttr.appInfo}}</dd>
              <dt>开启端口：</dt>
              <dd>{{nodeDetails.nodeAttr.enabledPorts}}</dd>
              <dt>发现时间：</dt>
              <dd>{{nodeDetails.nodeAttrInfo.detectionTime==-1?'':Dateformat(nodeDetails.nodeAttrInfo.detectionTime,'yyyy-MM-dd hh:mm')}}</dd>
              <dt>更新时间：</dt>
              <dd>{{Dateformat(nodeDetails.nodeAttrInfo.updatedTime,'yyyy-MM-dd hh:mm')}}</dd>
            </dl>
          </li>
        </ul>
      </div>
      <div class="modal-footer">
        <button @click="node_edit_status()">保存</button>
        <button @click="nodeSelect(selected, false)" class="cancal">取消</button>
      </div>
    </div>

    <div class="modal attack_info" v-if="attack_info"
         v-bind:style="{left:modal_mouse_obj.left+'px',top:modal_mouse_obj.top+'px'}">
      <div class="modal-header" @mousedown="modal_mouse($event,'down')">
        <label class="modal-header-title noselect">攻击详情</label>
        <button class="modal-header-close" @click="attack_info=false;" style="top:10px;"></button>
      </div>
      <div class="modal-content" style="margin:0;">
        <iframe style="width:100%;height:100%;border:0;margin-bottom: 30px;"></iframe>
      </div>
      <div class="modal-footer">
        <button @click="attack_info=false;" >确定</button>
        <button @click="attack_info=false;" class="cancal">取消</button>
      </div>
    </div>
    <ul id="contextmenu" v-show="contextmenu.show"
        v-bind:style="{top:contextmenu.top + 'px',left:contextmenu.left + 'px'}">
      <li>
        <a @click="contextmenu.show=false;nodeSelect(contextmenu.node, true)">节点信息</a>
      </li>
      <li>
        <a @click="contextmenu.show=false;attack_info=true;">攻击详情</a>
      </li>
    </ul>

  </div>
</template>

<script>
import config from './view3d/config';
import $ from 'jquery';
import * as THREE from 'three';
// window.THREE = THREE;
import view3d from './view3d/view3d';
import Models from './view3d/models';
import Enumerable from "linq";
import menuTree from './tree';

const IS_DEV = process.env.NODE_ENV === 'development';

export default {
  name: 'welcome',
  data () {
    return {
      small_map:true,//小地图是否显示
      attack_time_info:{startAttackNum:0,attackedNum:0},//攻击时间统计
      attack_info:false,//攻击详情页面是否显示
      contextmenu: {show: false,node:null},//右键菜单
      screenWidth: document.body.clientWidth,  // 屏幕宽度
      screenHeight: document.body.clientHeight,  // 屏幕高度
      modal1:true,
      modal_title:"",
      node_obj:{},
      attack_list:[],//攻击列表
      processingAttackIndex: null, // 当前处理索引
      attack_list_mouse_obj:{left: document.body.offsetWidth - 620, top: document.body.offsetHeight-180,show:true},//攻击列表框位置
      attack_time_mouse_obj:{left: document.body.offsetWidth - 1144, top: document.body.offsetHeight-180,show:true},//攻击时间框位置
      modal_mouse_obj: {left: document.body.offsetWidth / 2 - 250, top: 200},//模态框位置
      txtKeyWord:"",//搜索名
      filterTxt:"",//筛选条件名
      window_title:"",//标题
      filter_list: {},//筛选集合
      show_node_extend:{filter:true,hawkeye:true,nodeType:true},//筛选器，缩略图，节点类型是否展开
      filter_mouse_obj: {right: 20, left: 0, top: 90,show:true},
      node_type_mouse_obj: {left: 22, top: 22},//节点类型拖动
      sceneSwitchMaterialWireframe: false,
      sceneSwitchMaterialNormal: false,
      renderSum: 'renderSum',
      groupId: 1,
      nodeDetails: null,
      IS_DEV
    }
  },
  watch: {
    screenWidth (val) {
      if (!this.timer) {
        this.screenWidth = val
        this.timer = true
        let that = this
        setTimeout(function () {
          that.attack_list_mouse_obj.left= that.screenWidth - 620;
          that.attack_time_mouse_obj.left= that.screenWidth - 1144;
          that.modal_mouse_obj.left=that.screenWidth / 2 - 250;
          that.filter_mouse_obj.left = that.screenWidth - document.querySelector(".show_node").offsetWidth - 20;
          that.attack_list_mouse_obj.top=that.screenHeight-180;
          that.attack_time_mouse_obj.top=that.screenHeight-180;

          that.timer = false
        }, 400)
      }
    },
    screenHeight (val) {
      if (!this.timer) {
        this.screenHeight = val
        this.timer = true
        let that = this
        setTimeout(function () {
          that.attack_list_mouse_obj.left= that.screenWidth - 620;
          that.attack_time_mouse_obj.left= that.screenWidth - 1144;
          that.modal_mouse_obj.left=that.screenWidth / 2 - 250;
          that.filter_mouse_obj.left = that.screenWidth - document.querySelector(".show_node").offsetWidth - 20;
          that.attack_list_mouse_obj.top=that.screenHeight-180;
          that.attack_time_mouse_obj.top=that.screenHeight-180;
          that.timer = false
        }, 400)
      }
    }
  },
  props: ['fxTree'],
  components: { view3d ,menuTree},
  mounted () {
    this.init(() => {
      // this.loadData('/static/datatest2.json');
      // this.loadData('/static/datatestempty.json');
      // this.loadData('/static/datatestone.json');
      this.loadData();
      this.getAttackDataContinuously();
    });
    let that = this;
    window.onresize = () => {
      return (() => {
        window.screenWidth = document.body.clientWidth
        window.screenHeight = document.body.clientHeight
        that.screenWidth = window.screenWidth
        that.screenHeight = window.screenHeight
      })()
    }
  },
  methods: {
    /**
     * 设备类型转换
     * */
    nodeType_Cast(nodeType){
      switch (nodeType){
        case "JH":
          return ['交换机','/static/img/node_type/icon-swichboard.png','/static/img/node_type/icon-swichboard@2x.png'];
          break;
        case "LY":
          return ['路由器','/static/img/node_type/icon-wifi.png','/static/img/node_type/icon-wifi@2x.png'];
          break;
        case "FQ":
          return ['防火墙','/static/img/node_type/icon-firewall.png','/static/img/node_type/icon-firewall@2x.png'];
          break;
        case "PC":
          return ['电脑','/static/img/node_type/icon-pc.png','/static/img/node_type/icon-pc@2x.png'];
          break;
        case "MB":
          return ['手机','/static/img/node_type/icon-mobile.png','/static/img/node_type/icon-mobile@2x.png'];
          break;
        case "FW-DB":
          return ['数据库','/static/img/node_type/icon-database.png','/static/img/node_type/icon-database@2x.png'];
          break;
        case "FW-WEB":
          return ['网络数据','/static/img/node_type/icon-webdata.png','/static/img/node_type/icon-webdata@2x.png'];
          break;
        case "FW-WJ":
          return ['文件数据','/static/img/node_type/icon-filedata.png','/static/img/node_type/icon-filedata@2x.png'];
          break;
        case "FW-MAIL":
          return ['邮件数据','/static/img/node_type/icon-emaildata.png','/static/img/node_type/icon-emaildata@2x.png'];
          break;
        case "AQ":
          return ['安全设备','/static/img/node_type/icon-safadevice.png','/static/img/node_type/icon-safadevice@2x.png'];
          break;
        case "HJ":
          return ["核心交换机","/static/img/node_type/icon-coreex.png", "/static/img/node_type/icon-coreex@2x.png"];
          break;
        case "BJB":
          return ["笔记本","/static/img/node_type/icon-laptop.png", "/static/img/node_type/icon-laptop@2x.png"];
          break;
        case "FW":
          return ["服务器","/static/img/node_type/icon-server.png", "/static/img/node_type/icon-server@2x.png"];
          break;
        default:
          return [nodeType + "(?)","/static/img/node_type/add_node.png", "/static/img/node_type/add_node@2x.png"];
          break;

      }

    },
    /**
     * 时间转换
     * */
    Dateformat (da,format) {
      da = new Date(da);
    var date = {
      "M+": da.getMonth() + 1,
      "d+": da.getDate(),
      "h+": da.getHours(),
      "m+": da.getMinutes(),
      "s+": da.getSeconds(),
      "q+": Math.floor((da.getMonth() + 3) / 3),
      "S+": da.getMilliseconds()
    };
    if (/(y+)/i.test(format)) {
      format = format.replace(RegExp.$1, (da.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (var k in date) {
      if (new RegExp("(" + k + ")").test(format)) {
        format = format.replace(RegExp.$1, RegExp.$1.length == 1
          ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
      }
    }
    return format;
  },
    /**
     * 修改节点状态
     *  */
    node_change_status(ok) {
      this.nodeDetails.nodeAttrInfo.isSafe = ok;
    },
    /**
     * 加载右侧筛选框
     * */
    init_filter() {
      var children = [];
      var source_tree = this.source_filters.filterList;
      this.filter_list = {children: children};
      this.tree_filter = {};
      var tree_filter = this.tree_filter;

      function add_tree(tree, child) {
        for (var i = 0; i < tree.length; i++) {
          var tree_one = tree[i];
          var item = {};
          item.filterId = tree_one.filterId;
          item.visible = "selected";
          var source = Enumerable.from(source_tree).where("$.filterId==" + item.filterId).toArray()[0];
          for (var one in source) {
            item[one] = source[one];
          }
          if (item.conditionType.indexOf("3") === -1)
            continue;
          if (tree_one.items && tree_one.items.length > 0) {
            item.children = [];
            add_tree(tree_one.items, item.children);
          }
          child.push(item);
          if (!item.children)
            tree_filter[item.filterId] = item;
        }
      }

      add_tree(this.source_filters.filterTree, children);
    },
    /**
     * 显示隐藏节点
     * */
    node_display(filter, visabled, parentNode){
      var _this = this;
      var filter_txt = "";
      this.tree_filter = this.tree_filter || {};
      for (var i = 0; i < filter.length; i++) {
        var item = filter[i];

        if (!visabled)
          delete this.tree_filter[item.filterId];
        else if(!this.tree_filter[item.filterId])
          this.tree_filter[item.filterId] = item;
      }

      for (var i in this.tree_filter) {
        filter_txt += this.tree_filter[i].conditionName + "=" + this.tree_filter[i].conditionValue + "|";
      }
      filter_txt = filter_txt.substring(0, filter_txt.length - 1);
      filter_txt = "filter=" + filter_txt;
      if(this.groupId){
        if(filter_txt)
          filter_txt = "&" + filter_txt;
        filter_txt="groupId="+this.groupId + filter_txt;
      }
      console.log(filter_txt);
      this.loadData({ filter: filter_txt });
    },
    /**
     * 清空输入条件
     * */
    clear_keyWord(type, ev) {
      switch (type) {
        case "global":
          this.txtKeyWord = "";
          break;
        case "filterTxt":
          this.filterTxt = "";
          break;
      }
      ev.target.parentNode.className = ev.target.parentNode.className.replace(/ focus/g, "");

    },
    /**
     * 切换到2d视图
     * */
    cast_2d(){
      this.$router.push({path:"/"});
    },
    /**
     * 鼠标拖动模态框
     * ev 当前鼠标
     * type down 鼠标按下 move 鼠标拖动 up 鼠标抬起
     * nodeType node_type 所有设备类型集合 filter 筛选集合 Hawkeye 鹰眼 default 编辑模态框
     * @param {event} ev
     * @param {String}type
     * @param {String}nodeType
     */
    modal_mouse(ev, type, nodeType) {
      switch (type) {
        case "down":
          this.modal_mouse_obj.down = true;
          this.mouse_type = nodeType;
          this.mouse_parentNode_size = {
            top: ev.target.parentNode.offsetHeight + 1,
            left: ev.target.parentNode.offsetWidth + 1
          };
          break;
        case "move":
          if (this.modal_mouse_obj.down) {
            var max_height = document.body.offsetHeight - this.header_height;
            var max_width = document.body.offsetWidth;
            switch (this.mouse_type) {
              case "attack_list":
                var left = this.attack_list_mouse_obj.left + ev.movementX;
                var top = this.attack_list_mouse_obj.top + ev.movementY;

                if (top < 0) return this.modal_mouse_obj.down = false, this.attack_list_mouse_obj.top = 0;
                if (left < 0) return this.modal_mouse_obj.down = false, this.attack_list_mouse_obj.left = 0;

                var max_top = top + this.mouse_parentNode_size.top;
                var max_left = left + this.mouse_parentNode_size.left;
                if (max_top > max_height || max_left > max_width) {
                  this.modal_mouse_obj.down = false;
                  return;
                }

                this.attack_list_mouse_obj.left = left;
                this.attack_list_mouse_obj.top = top;
                break;
              case "attack_time":
                var left = this.attack_time_mouse_obj.left + ev.movementX;
                var top = this.attack_time_mouse_obj.top + ev.movementY;

                if (top < 0) return this.modal_mouse_obj.down = false, this.attack_time_mouse_obj.top = 0;
                if (left < 0) return this.modal_mouse_obj.down = false, this.attack_time_mouse_obj.left = 0;

                var max_top = top + this.mouse_parentNode_size.top;
                var max_left = left + this.mouse_parentNode_size.left;
                if (max_top > max_height || max_left > max_width) {
                  this.modal_mouse_obj.down = false;
                  return;
                }

                this.attack_time_mouse_obj.left = left;
                this.attack_time_mouse_obj.top = top;
                break;
              case "node_type":
                var left = parseInt(this.node_type_mouse_obj.left + ev.movementX);
                var top = parseInt(this.node_type_mouse_obj.top + ev.movementY);

                if (top < 0) return this.modal_mouse_obj.down = false, this.node_type_mouse_obj.top = 0;
                if (left < 0) return this.modal_mouse_obj.down = false, this.node_type_mouse_obj.left = 0;

                var max_top = parseInt(top + this.mouse_parentNode_size.top);
                var max_left = parseInt(left + this.mouse_parentNode_size.left);

                if (max_top > max_height || max_left > max_width) {
                  this.modal_mouse_obj.down = false;
                  return;
                }

                this.node_type_mouse_obj.left = left;
                this.node_type_mouse_obj.top = top;
                break;
              case "filter":
                var left = this.filter_mouse_obj.left + ev.movementX;
                var top = this.filter_mouse_obj.top + ev.movementY;

                if (top < 0) return this.modal_mouse_obj.down = false, this.filter_mouse_obj.top = 0;
                if (left < 0) return this.modal_mouse_obj.down = false, this.filter_mouse_obj.left = 0;

                var max_top = top + this.mouse_parentNode_size.top;
                var max_left = left + this.mouse_parentNode_size.left;
                if (max_top > max_height || max_left > max_width) {
                  this.modal_mouse_obj.down = false;
                  return;
                }

                this.filter_mouse_obj.left = left;
                this.filter_mouse_obj.top = top;
                break;
              default:
                var mouseObj = this.modal_mouse_obj;
                if (this.modal4)
                  mouseObj = this.modal_mouse_obj_modal4;

                var left = mouseObj.left + ev.movementX;
                var top = mouseObj.top + ev.movementY;

                if (top < 0) return mouseObj.down = false, mouseObj.top = 0;
                if (left < 0) return mouseObj.down = false, mouseObj.left = 0;

                mouseObj.left = left;
                mouseObj.top = top;
                break;
              case "Hawkeye":
                var left = this.Hawkeye.left + ev.movementX;
                var top = this.Hawkeye.top + ev.movementY;

                if (top < 0) return this.modal_mouse_obj.down = false, this.Hawkeye.top = 0;
                if (left < 0) return this.modal_mouse_obj.down = false, this.Hawkeye.left = 0;

                var max_top = top + this.mouse_parentNode_size.top;
                var max_left = left + this.mouse_parentNode_size.left;
                if (max_top > max_height || max_left > max_width) {
                  this.modal_mouse_obj.down = false;
                  return;
                }

                this.Hawkeye.left = left;
                this.Hawkeye.top = top;
                break;
            }
          }
          break;
        case "up":
          this.modal_mouse_obj.down = false;
          break;
      }
    },
    init (callback) {
      var _this = this;

      this.view3d = this.$refs.view3d;
      this.viewer3d = this.view3d.viewer;

      this.viewer3d.createMap(document.querySelector('#containerMap'));

      this.filter_mouse_obj.left = document.body.offsetWidth - document.querySelector(".show_node").offsetWidth - 20;
      $.ajax({
        url: `${process.env.API_BASE_URL}getBaseInfo`,
        type: 'get',
        async: true,
        dataType: 'json',
        success: (dataLoaded) => {
          if (dataLoaded && dataLoaded.resultCode == '0') {
            document.title = dataLoaded.systemName;
            _this.window_title = dataLoaded.systemName;
            _this.source_filters = dataLoaded.filters;
            const businessesNames = {};
            dataLoaded.busnList.forEach(e => businessesNames[e.busnId] = e.busnName);
            this.viewer3d.setBusinessesNames(businessesNames);
            _this.init_filter();
          }
        },
        error: (XMLHttpRequest, textStatus, errorThrown) => {
          throw errorThrown;
        }
      });

      // Mouse events

      const container = this.viewer3d.container;

      const mousedownHandler = (event) => {
        container.addEventListener('mousemove', mousemoveHandler, false);
        container.addEventListener('mouseup', mouseupHandler, false);
      };
      const mousemoveHandler = (event) => {
        const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
        if (movementX !== 0 || movementY !== 0) {
          container.removeEventListener('mousemove', mousemoveHandler, false);
          container.removeEventListener('mouseup', mouseupHandler, false);
        }
      };
      const mouseupHandler = (event) => {
        container.removeEventListener('mousemove', mousemoveHandler, false);
        container.removeEventListener('mouseup', mouseupHandler, false);

        const node = this.viewer3d.nodeFromContainerPosition(event.clientX, event.clientY);
        console.debug('nodeFromWindowPosition', node);
        this.contextmenu.show=false;
        if (node !== this.selected) {
          if (this.selected) this.nodeSelect(this.selected, false);
          if (node&& event.button===2) {
            this.contextmenu.show=true;
            this.contextmenu.left=event.x;
            this.contextmenu.top=event.y;
            this.contextmenu.node = node;
            this.modal_mouse_obj = {left: document.body.offsetWidth / 2 - 250, top: 200};//模态框位置

            // this.nodeSelect(node, true);
          }//
        }
      };

      container.addEventListener('mousedown', mousedownHandler, false);

      // document.addEventListener('keydown', event => {
      //   switch (event.key.toLowerCase()) {
      //     case 'b':
      //       if (this.contextmenu.node) this.viewer3d.addBoundingBox(this.contextmenu.node);
      //       break;
      //     case 'r':
      //       if (this.contextmenu.node) this.viewer3d.relayoutNodes(this.contextmenu.node, event.shiftKey, event.ctrlKey);
      //       else this.viewer3d.relayout(event.shiftKey, event.ctrlKey);
      //       break;
      //     case 'delete':
      //       this.viewer3d.deleteNode(this.contextmenu.node);
      //       break;
      //   }
      // }, false);

      this.nodeViews = [];
      this.nodeViewsEmpty = true;

      const moduleReality = document.querySelector(".moduleReality");
      const moduleBusiness = document.querySelector(".moduleBusiness");
      moduleReality.addEventListener('click', () => {
        moduleReality.classList.add('selected');
        moduleBusiness.classList.remove('selected');
        this.viewer3d.showBusiness(false);
      }, false);
      moduleBusiness.addEventListener('click', () => {
        moduleReality.classList.remove('selected');
        moduleBusiness.classList.add('selected');
        this.viewer3d.showBusiness(true);
      }, false);

      this.viewer3d.controls.addEventListener('zoomin', () => {
        if (this.nodesViewMode) this.nodesInView();
      }, false);

      this.viewer3d.controls.addEventListener('zoomout', () => {
        if (this.nodesViewMode) this.nodesOutView();
      }, false);

      document.addEventListener('keydown', (event) => {
        if (event.key.toLowerCase() === 'control') this.nodesViewMode = true;
      }, false);

      document.addEventListener('keyup', (event) => {
        if (event.key.toLowerCase() === 'control') this.nodesViewMode = false;
      }, false);

      Models.preload(() => {
        if (callback) callback();
      });

      $('div.scale_option button').click(function() {
        const id = $(this).attr('data-id');
        _this.viewer3d.moveCamera(id);
      });
    },
    setSceneSwitch (swtch, valueName) {
      this[valueName] = !this[valueName];
      this.viewer3d.setSceneSwitch(swtch, this[valueName]);
    },
    updateRenderSum () {
      this.renderSum = JSON.stringify(this.viewer3d.getRendererInfo());
    },
    updateNodesView (nodeIds, center) {
      console.debug('nodeIds', nodeIds);
      this.loadData({ nodeIds, center, clearOnlyData: true });
    },
    nodesInView () {
      const center = new THREE.Vector3();
      const nodeIds = this.viewer3d.nodesInView(undefined, center).map(e => e.userData.nodeData.nodeId).join(',');
      if (nodeIds.length > 0) {
        if (this.curNodeView) {
          this.nodeViews.push(this.curNodeView);
          // this.curNodeView = null;
        }
        this.curNodeView = { center, nodeIds };
        this.nodeViewsEmpty = false;
        this.updateNodesView(nodeIds, center);
      }
    },
    viewToSelected () {
      if (this.selected) this.viewer3d.viewToNodeId(this.selected.userData.nodeData.nodeId);
    },
    nodesOutView () {
      this.curNodeView = this.nodeViews.pop();
      if (this.curNodeView) this.updateNodesView(this.curNodeView.nodeIds, this.curNodeView.center);
      else if (!this.nodeViewsEmpty) {
        this.nodeViewsEmpty = true;
        this.loadData();
      }
    },
    clearData () {
      this.viewer3d.clearData();
    },
    /*
      {
        params {string | object}
        params.dataUrl
        params.groupId
        params.nodeIds
        params.filter,
        params.clearOnlyData
      }
    */
    loadData (params1) {
      if (this.getAttackDataTimer) clearTimeout(this.getAttackDataTimer);
      // this.viewer3d.clearData();

      const params = {
        dataUrl: `${process.env.API_BASE_URL}getNetworkTopology`,
        clearOnlyData: false
      };
      if (params1) {
        if (typeof params1 === 'string') params.dataUrl = params1;
        else Object.assign(params, params1);
      }

      let dataUrl = params.dataUrl;
      let firstParam = true;
      if (params.groupId) {
        dataUrl += firstParam ? process.env.API_PARAM_SEP_FIRST : '&';
        dataUrl += `groupId=${params.groupId}`;
      }
      if (params.nodeIds) {
        dataUrl += firstParam ? process.env.API_PARAM_SEP_FIRST : '&';
        dataUrl += `nodeIds=${params.nodeIds}`;
      }
      if (params.filter) {
        dataUrl += firstParam ? process.env.API_PARAM_SEP_FIRST : '&';
        dataUrl += `filter=${params.filter}`;
      }

      this.viewer3d.loadData(dataUrl, (loadedData) => {
        console.log('Data loaded: ', loadedData);
        // this.getAttackDataContinuously();
      }, params.center, params.clearOnlyData);
    },
    loadGroupData (groupId) {
      this.loadData({ groupId });
    },
    loadTestData () {
      if (/^\d+$/.test(this.groupId)) this.loadGroupData(this.groupId);
      else if (/\.json$/.test(this.groupId)) this.loadData(`/static/${this.groupId}`);
    },
    nodeSelect (node, selected) {
      this.viewer3d.highlightNode(node, selected);
      if (IS_DEV) this.viewer3d.transformNode(selected ? node : null);
      this.selected = selected ? node : null;

      this.nodeDetails = null;
      if (selected) this.getNodeDetails();
    },
    getAttackDataContinuously (continuously = true) {
      this.getAttackDataTimer = null;

      this.getAttackData((dataLoaded) => {
        if(!dataLoaded){
          if (continuously) {
            this.getAttackDataTimer = setTimeout(() => {
              if(location.hash.indexOf("view3d")>-1)
                this.getAttackDataContinuously();
            }, config.data.attackRequestInterval);
          }
          return;
        }

        if(dataLoaded.attackList.length>0){
          this.new_add_count = (this.new_add_count || 0) + dataLoaded.attackList.length/config.data.attackRequestInterval;
          if(this.new_add_count < 1 && dataLoaded.attackList.length > 0)
            this.new_add_count = 1;
          this.attack_list = this.attack_list.concat(dataLoaded.attackList.slice(0,this.new_add_count));
          if(this.attack_list.length > config.data.attackRequestCount) {
            var remove_count = this.attack_list.length -  config.data.attackRequestCount;
            this.attack_list.splice(0, remove_count);
          }
          // this.processingAttackIndex = null;
        }
        // console.log(this.attack_list.length)
        var attack_ul = document.querySelectorAll(".attack_list_ul")[1];
        var attack_li = attack_ul.querySelectorAll("li");
        attack_li = attack_li[attack_li.length-1];
        if(attack_li)
          attack_ul.scrollTop = attack_li.offsetTop;

        this.attack_time_info = dataLoaded.attackTimeStatistics;

        this.viewer3d.showAttackAnimation(dataLoaded);

        if (continuously) {
          this.getAttackDataTimer = setTimeout(() => {
            if(location.hash.indexOf("view3d")>-1)
              this.getAttackDataContinuously();
          }, config.data.attackRequestInterval);
        }
      });
    },
    getAttackData (callback) {
      $.ajax({
        url: `${process.env.API_BASE_URL}${process.env.ATTACK_DATA_METHOD}`,
        xhrFields: {
          withCredentials: true
        },
        crossDomain: true,
        type: 'get',
        async: true,
        dataType: 'json',
        success: (dataLoaded) => {
          if (dataLoaded && dataLoaded.resultCode == '0') {
            if (callback) callback(dataLoaded);
          }
        },
        error: (XMLHttpRequest, textStatus, errorThrown) => {
          if (callback) callback();
          //throw errorThrown;
        }
      });
    },
    updateStatus () {
      this.viewer3d.updateStatus();
    },
    getNodeDetails () {
      if (!this.selected) {
        console.warn('Please select node first.');
      } else if (!this.selected.userData.nodeData || !this.selected.userData.nodeData.nodeId) {
        console.warn('Node id invalid.');
      } else {
        const nodeId = this.selected.userData.nodeData.nodeId;
        $.ajax({
          url: `${process.env.API_BASE_URL}${process.env.NODE_DETAILS_METHOD}${process.env.API_PARAM_SEP_FIRST}nodeId=${nodeId}`,
          type: 'get',
          async: true,
          dataType: 'json',
          success: (dataLoaded) => {
            if (dataLoaded && dataLoaded.resultCode == '0') {
              console.log(dataLoaded,this.selected.userData.nodeData)
              this.nodeDetails = dataLoaded;
            }
          },
          error: (XMLHttpRequest, textStatus, errorThrown) => {
            throw errorThrown;
          }
        });
      }
    },
    processAttack () {
      if (this.attack_list.length > 0) {
        if (this.processingAttackIndex === null) this.processingAttackIndex = -1;
        this.processingAttackIndex = (this.processingAttackIndex + 1) % this.attack_list.length;
        const attackDestNodeId = this.attack_list[this.processingAttackIndex].destNodeId;
        this.viewer3d.viewToNodeId(attackDestNodeId);
      }
    }
  }
}
</script>

<style scoped>
  div.fullscreen {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
  div.toolbar {
    position: absolute;
    top: 130px;
    left: 20px;
    height: 30px;
    z-index: 1;
  }
  div.toolbar span {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 6px;
    padding: 10px 20px;
    color: white;
    cursor: pointer;
    transition: background-color 1s;
    -moz-transition: background-color 1s;
    -o-transition: background-color 1s;
    -webkit-transition: background-color 1s;
    -ms-transition: background-color 1s;
  }
  div.toolbar span:hover {
    background-color: rgba(200, 0, 0, 0.6);
  }
  div#testlist {
    position: absolute;
    top: 18px;
    right: 521px;
    z-index: 1222;
  }
  div#testlist input{
    border: 0;
    border-radius: 3px;
    height: 30px;
    text-indent: 10px;
  }
  div#testlist button{
    background: rgba(117, 156, 224, 0.46);
    padding: 10px 6px;
    border-radius: 6px;
  }

  div#container3d {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
  }
  div#containerMap {
    position: absolute;
    left: 10px;
    bottom: 10px;
    width: 300px;
    height: 200px;
    border: 1pt solid #666666;
    overflow: hidden;
  }
  div#nodeDetails {
    position: absolute;
    right: 10px;
    width: 300px;
    height: 500px;
    bottom: 10px;
    color: white;
    background-color: rgba(255,255,255, 0.5);
    text-align: left;
    padding: 10px 20px;
    overflow: auto;
    z-index: 2;
  }
  div#processAttack {
    cursor: pointer;
    border-radius: 10px;
  }
  div#processAttack:hover {
    background-color: #ff000026;
  }
  ul li.processingAttack label {
    color: yellow;
  }
</style>
