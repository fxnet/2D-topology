<style lang="less">
  @import "../assets/less/default";
</style>
<template>
  <div class="default" @mousedown="clear_node_select($event)"
       @mousemove="modal_mouse($event,'move')"
       @mouseup="modal_mouse($event,'up')">
    <div class="shield" v-show="Shield"></div>
    <div class="mark" v-show="mark"></div>
    <div class="header valign">
      <div class="cast_module">
        <div class="cast_module_tab">
          <button class="" @click="cast_3d()"><i class="three"></i><label>3D</label></button>
          <button class="selected"><i class="two"></i><label>2D</label></button>
        </div>
        <div class="cast_module_tab">
          <button :class="View_Type=='default'?'selected':''" @click="Init_Business('del')"><i
            class="reality"></i><label>实际</label></button>
          <button :class="View_Type=='business'?'selected':''" @click="Init_Business('add')"><i
            class="business"></i><label>业务</label></button>
          <input type="checkbox" name="" v-show="false" @click="node_select_type()">
        </div>
      </div>
      <h3 class="title">{{window_title}}</h3>
      <div class="cast_2d valign">

        <div class="scale">
          <button class="scale_title" @click="change_scale('reduction')">100% 显示</button>
          <div class="scale_option">
            <button class="scale_jian" @click="change_scale('jian')">-</button>
            <label>{{Scale_Number}}%</label>
            <button class="scale_jia" @click="change_scale('jia')">+</button>
          </div>
        </div>
        <button @click="Update_jtop('Manual')" class="update">刷新</button>
        <div class="search">
          <i @click="node_Search()"></i>
          <input type="text" v-model="txtKeyWord" @keydown="node_search_keyDown($event)"
                 onfocus="this.parentNode.className+=' focus';"
                 onblur="if(this.value=='') this.parentNode.className=this.parentNode.className.replace(/ focus/g,'');"
                 placeholder="搜索"/>
          <i class="btnRemove" @click="clear_keyWord('global',$event)">×</i>
        </div>
      </div>
    </div>
    <div class="content" id="content">
      <div class="left module_type_list"
           v-bind:style="{left:node_type_mouse_obj.left+'px',top:node_type_mouse_obj.top+'px'}"
           v-bind:class="show_node_extend['nodeType']==false?'hide':''"
           @mousemove="mouse_obj=undefined;node_drag=false;">
        <div class="shrink" @mousedown="modal_mouse($event,'down','node_type')">
          <label class="noselect">添加</label>
          <button :class="show_node_extend['nodeType']?'extend_left':'extend_right'"
                  @click="function(){show_node_extend['nodeType']=!show_node_extend['nodeType'];}"></button>
        </div>
        <ul v-if="show_node_extend['nodeType']">
          <li v-for="one in node_type_list" class="valign">
            <img draggable="false" v-bind:src="one.img" @mousedown="drag($event,one,'down')"  @mouseover="drag($event,one,'over')" />
            <label>{{one.name}}</label>
          </li>
          <li class="valign">
            <img draggable="false"
                 @mousedown="drag($event,{nodeType:'TY',img:'/static/img/node_type/add_node.png'},'down','custom')"
                 src="/static/img/node_type/add_node.png"/>
            <label>通用格式</label>
          </li>
        </ul>
      </div>
      <div class="main_area">
        <div class="Hawkeye noselect" v-bind:style="{left:Hawkeye.left+'px',top:Hawkeye.top+'px'}"
             v-bind:class="show_node_extend['hawkeye']==false?'hide':''">
          <div class="shrink" @mousedown="modal_mouse($event,'down','Hawkeye')">
            <label class="noselect">缩略图</label>
            <button :class="show_node_extend['hawkeye']?'extend_left':'extend_right'"
                    @click="function(){show_node_extend['hawkeye']=!show_node_extend['hawkeye'];}"></button>
          </div>
          <div class="Hawkeye_content" v-if="show_node_extend['hawkeye']" @mousemove="Hawkeye_Mouse($event,'move')"
               @mouseup="Hawkeye_Mouse($event,'up')">
            <div class="border"
                 v-bind:style="{left:Hawkeye.border.x+'px',top:Hawkeye.border.y+'px',width:Hawkeye.width+'px',height:Hawkeye.height+'px'}"
                 @mousedown="Hawkeye_Mouse($event,'down')" ></div>
            <img src="" draggable="false" v-bind:src="Hawkeye.Hawkeye_Src" v-bind:style="{width:Hawkeye.img_width+'px',height:Hawkeye.img_height+'px'}" onerror="this.src='/static/img/suoluetu.png'">
          </div>
        </div>
        <canvas id="canvas" width="1200" height="800" @dragover="allowDrop($event)"></canvas>
        <div class="no_node" @dragover="allowDrop($event)" v-if="dev_count<=0">
          <img src="/static/img/common/default/img-no-device.png"/>
          <div class="no_node_txt">
            <p>当前状态无设备信息</p>
            <p>请点击左侧栏图标添加设备</p>
          </div>
        </div>
      </div>
      <div class="show_node" v-bind:style="{left:filter_mouse_obj.left+'px',top:filter_mouse_obj.top+'px'}"
           v-bind:class="show_node_extend['filter']==false?'hide':''">
        <div class="shrink" @mousedown="modal_mouse($event,'down','filter')">
          <label class="noselect">筛选器</label>
          <button :class="show_node_extend['filter']?'extend_left':'extend_right'"
                  @click="function(){show_node_extend['filter']=!show_node_extend['filter'];}"></button>
        </div>
        <div class="show_node_filter" v-if="show_node_extend['filter']">
          <i class="ts_ent_ic"></i>
          <input type="text" placeholder="搜索筛选条件" onfocus="this.parentNode.className+=' focus';"
                 onblur="if(this.value=='') this.parentNode.className=this.parentNode.className.replace(/ focus/g,'');"
                 v-model="filterTxt">
          <i class="btnRemove" @click="clear_keyWord('filterTxt',$event)">×</i>
        </div>
        <ul class="node_parent" v-if="show_node_extend['filter']">
          <menuTree v-for='cel in filter_list.children' :fxTree='cel' :filterTxt='filterTxt'
                    :nodeDisplay="node_display"></menuTree>
        </ul>
      </div>
    </div>
    <button @click="get_brand()" style="display:none;">获取元素位置</button>
    <ul id="contextmenu" v-show="contextmenu.show"
        v-bind:style="{top:contextmenu.top + 'px',left:contextmenu.left + 'px'}">
      <li>
        <a @click="node_edit_open()">编辑设备信息</a>
      </li>
      <li>
        <a @click="node_change_img();mark=true;">替换图标</a>
      </li>
      <li>
        <a
          @click="node_remove_star();">删除</a>
      </li>
    </ul>
    <div class="modal common_title" v-for='item in common_title_list' v-bind:class="{lk_close:item.type==='default'}">
      <div class="modal-content" style="margin:0;">
        <label v-bind:title="item.title">{{item.title}}</label>
        <div class="common_title_buttons">
          <button @click="common_title_next(item)" v-show="item.type!='default'">下一个</button>
          <button @click="common_title_close(item)">关闭提示</button>
        </div>
      </div>
    </div>
    <div class="modal add_dev" v-show="modal3"
         v-bind:style="{left:modal_mouse_obj.left+'px',top:modal_mouse_obj.top+'px'}">
      <div class="modal-header" @mousedown="modal_mouse($event,'down')">
        <label class="modal-header-title noselect">编辑节点</label>
      </div>
      <div class="modal-content" style="margin:0;">
        <div class="img valign">
          <img v-bind:src="node_obj.img" @click="modal4=true;mark=true;">
        </div>
        <dl class="edit_node">
          <dt>节点ID：</dt>
          <dd><input type="text" v-model="node_obj.nodeId"/></dd>
          <dt>名称：</dt>
          <dd><input type="text" v-model="node_obj.name"/></dd>
          <dt>设备类型：</dt>
          <dd>
            <select v-model="node_obj.nodeType" @change="nodeType_Change()">
              <option v-for="item in node_type_list" v-bind:value="item.nodeType">{{item.name}}</option>
            </select>
          </dd>
          <dt>IP地址：</dt>
          <dd><input type="text" v-model="node_obj.nodeIp"/></dd>
          <dt>所属业务区域：</dt>
          <dd>
            <select v-model="node_obj.area">
              <option v-for="area in this.area_list" v-bind:selected="node_obj.area==area.busnId"
                      v-bind:value="area.busnId">{{area.busnName}}
              </option>
            </select>
          </dd>
          <dt>备注：</dt>
          <dd>
            <textarea class="textdesp" v-model="node_obj.nodeRemark"></textarea>
          </dd>
        </dl>
      </div>
      <div class="modal-footer">
        <button @click="node_edit()">确定</button>
        <button @click="modal3=false;mark=false;" class="cancal">取消</button>
      </div>
    </div>
    <div class="modal edit_dev" v-show="modal1"
         v-bind:style="{left:modal_mouse_obj.left+'px',top:modal_mouse_obj.top+'px'}">
      <div class="modal-header" @mousedown="modal_mouse($event,'down')">
        <label class="modal-header-title noselect">{{modal_title || "编辑节点"}}</label>
        <button class="modal-header-close" @click="modal1=false;mark=false;" style="top:10px;"></button>
      </div>
      <div class="modal-content" style="margin:0;">
        <div class="img valign">
          <img v-bind:src="node_obj.img">
        </div>
        <ul class="edit_node">
          <li class="depart">
            <label>所属部门：财务部</label>
            <label>负责人：王经理</label>
          </li>
          <li class="status">

            <dl>
              <dt>是否安全：</dt>
              <dd>
                <div class="Checkbox_button checkbox_style2" @click="node_change_status('ok')"
                     v-bind:class="{selected:node_obj.status=='ok'}">
                  <button></button>
                  <label>安全</label><img></div>
                <div class="Checkbox_button checkbox_style2" @click="node_change_status('no')"
                     v-bind:class="{selected:node_obj.status=='no'}">
                  <button></button>
                  <label>危险</label><img></div>
              </dd>
            </dl>
          </li>
          <li>
            <dl>
              <dt>设备类型：</dt>
              <dd>路由器</dd>
              <dt>IP地址：</dt>
              <dd>192.168.1.103</dd>
              <dt>MAC：</dt>
              <dd>40-8D-5C-56-4F-D4</dd>
            </dl>
          </li>
          <li>
            <dl>
              <dt>攻击类型：</dt>
              <dd>漏洞扫描</dd>
              <dt>发起攻击的次数：</dt>
              <dd>23</dd>
              <dt>被攻击的次数：</dt>
              <dd>0</dd>
            </dl>
          </li>
          <li>
            <dl>
              <dt>应用信息：</dt>
              <dd>用友软件</dd>
              <dt>开启端口：</dt>
              <dd>90，90，143</dd>
              <dt>发现时间：</dt>
              <dd>2017-07-20 10:24:11</dd>
              <dt>更新时间：</dt>
              <dd>2017-07-20 10:24:11</dd>
            </dl>
          </li>
        </ul>
      </div>
      <div class="modal-footer">
        <button @click="node_edit_status()">保存</button>
        <button @click="modal1=false;mark=false;" class="cancal">取消</button>
      </div>
    </div>
    <div class="modal node_add_upload node_add_ty" v-show="modal2"
         v-bind:style="{left:modal_mouse_obj.left+'px',top:modal_mouse_obj.top+'px'}">
      <div class="modal-header" @mousedown="modal_mouse($event,'down')">
        <label class="modal-header-title noselect">新增节点</label>
        <button class="modal-header-close" @click="modal2=false;mark=false;"></button>
      </div>
      <div class="modal-content">
        <dl>
          <dt>节点名称：</dt>
          <dd>
            <input type="text" v-model="modal_node_add.nodeName" />
          </dd>
          <dt>节点IP：</dt>
          <dd>
            <input type="text" v-model="modal_node_add.nodeIp" />
          </dd>
          <dt class="dtImportImg">选择图片文件：</dt>
          <input type="text" readonly="readonly" v-model="node_add_img_src" v-bind:title="node_add_img_src">
          <button @click="open_node_add_upload()">选择</button>
        </dl>

        <input type="file" id="fileUpload" @change="onFileChange_Upload" v-show="false"/>
      </div>
      <div class="modal-footer">
        <button @click="save_node(modal_node_add,modal_node_add.callback,true)">确定</button>
        <button @click="modal2=false;mark=false;" class="cancal">取消</button>
      </div>
    </div>

    <div class="modal node_add_upload node_add" v-show="modal_node_add.show"
         v-bind:style="{left:modal_mouse_obj.left+'px',top:modal_mouse_obj.top+'px'}">
      <div class="modal-header" @mousedown="modal_mouse($event,'down')">
        <label class="modal-header-title noselect">新增节点</label>
        <button class="modal-header-close" @click="modal_node_add.show=false;mark=false;"></button>
      </div>
      <div class="modal-content">
        <div class="img">
          <img v-bind:src="modal_node_add.img" />
        </div>
        <dl>
          <dt>节点名称：</dt>
          <dd>
            <input type="text" v-model="modal_node_add.nodeName" />
          </dd>
          <dt>节点IP：</dt>
          <dd>
            <input type="text" v-model="modal_node_add.nodeIp" />
          </dd>
        </dl>
      </div>
      <div class="modal-footer">
        <button @click="save_node(modal_node_add,modal_node_add.callback,true)">确定</button>
        <button @click="modal_node_add.show=false;mark=false;" class="cancal">取消</button>
      </div>
    </div>

    <div class="modal node_add_upload" v-show="modal4"
         v-bind:style="{left:modal_mouse_obj_modal4.left+'px',top:modal_mouse_obj_modal4.top+'px'}">
      <div class="modal-header" @mousedown="modal_mouse($event,'down')">
        <label class="modal-header-title noselect">上传新图标</label>
        <button class="modal-header-close" @click="modal4=false;mark=false;"></button>
      </div>
      <div class="modal-content">
        <input type="text" readonly="readonly" v-model="node_add_img_src" v-bind:title="node_add_img_src">
        <button @click="open_node_add_upload()">选择</button>
        <input type="file" id="fileUpload4" @change="onFileChange_Upload" v-show="false"/>
      </div>
      <div class="modal-footer">
        <button @click="node_upload_img()">上传</button>
        <button @click="modal4=false;mark=false;" class="cancal">取消</button>
      </div>
    </div>

    <div class="modal confirm noline" v-show="modal_confirm"
         v-bind:style="{left:modal_mouse_obj.left+'px',top:modal_mouse_obj.top+'px'}">
      <div class="modal-header" @mousedown="modal_mouse($event,'down')">
        <label class="modal-header-title noselect">删除节点确认</label>
        <button class="modal-header-close" @click="modal_confirm=false;mark=false;node_remove_list=[];"></button>
      </div>
      <div class="modal-content">
        <div class="desp">
          <label v-show="remove_node_is_children" style="margin-bottom: 12px;float: left;width: 100%;">删除该节点时，相应的子节点也会删除<br></label>
          <img src="/static/img/common/ic-alert-yellow.png"><label>慎重操作</label>
        </div>
      </div>
      <div class="modal-footer">
        <button @click="node_remove_fun();modal_confirm=false;mark=false;">确定</button>
        <button @click="modal_confirm=false;mark=false;node_remove_list=[];" class="cancal">取消</button>
      </div>
    </div>
    <div class="test_remove_title_width" id="test_remove_title_width"></div>

    <div v-show="drag_nodeType.down" class="drag_node_style"
         v-bind:style="{left:drag_nodeType.mouse_point.x+'px',top:drag_nodeType.mouse_point.y+'px'}"
         @mouseup="drag($event,'','up')"><img draggable="false" v-bind:src="drag_nodeType.big_img"><div><label>{{drag_nodeType.nodeType_Name}}</label></div></div>
    <div style="position: fixed;width: 100%;height: 100%;left:0;top:0;z-index: 2" v-show="drag_nodeType.down"></div>
  </div>
</template>

<script>
  import $ from "jquery";
  import Enumerable from "linq";
  import axios from 'axios';

  require("../../static/jtopo/jtopo-0.4.8-min.js");
  import menuTree from './tree';
  import config from './config';

  export default {
    props: ['fxTree'],
    components: {
      menuTree
    },

    data() {
      return {
        drag_nodeType: {mouse_point: {x: 0, y: 0}, down: false},//拖动的节点
        screenWidth: document.body.clientWidth,  // 屏幕宽度
        screenHeight: document.body.clientHeight,  // 屏幕高度
        remove_node_is_children: false,//是否有子节点
        show_node_extend: {filter: true, hawkeye: true, nodeType: true},//筛选器，缩略图，节点类型是否展开
        window_title: "",//系统标题
        dev_count: 0,//设备数量
        common_title_list: [],//提示集合
        mark: false,//页面遮罩层
        Shield: false,//显示屏蔽元素，模仿一个组织冒泡事件
        node_select_down: true,
        node_select_list: [],//右键选中的节点集合
        View_Type: "default",//当前视图是否是业务视图
        filterTxt: "",//筛选器的筛选条件
        Scale_Number: 100,//拓扑图显示比例数值
        Hawkeye: {Hawkeye_Src: "", border: {x: 20, y: 10}, width: 240, height: 158, left: 120, top: 0,sum_height:182},//鹰眼对象
        node_size: {width: 92, height: 99, tree_width: 180, tree_height: 160,lineWidth:3,drag_lineWidth:50,lineColor:"249,210,56",drag_lineColor:"255,61,61"},//节点大小
        node_mouse_dom: {show: false, left: 0, top: 0},//拖动节点样式
        node_inside_change: {down: false},//布局内修改节点层级
        filter_mouse_obj: {right: 20, left: 0, top: 22},
        node_type_mouse_obj: {left: 22, top: 22},//节点类型拖动
        filter_list: {},//筛选集合
        //左边节点类型
        node_type_list: [
          {img: "/static/img/node_type/icon-swichboard.png", name: "交换机", nodeType: "JH"},
          {name: "路由器", img: "/static/img/node_type/icon-wifi.png", nodeType: "LY"},
          {name: "防火墙", img: "/static/img/node_type/icon-firewall.png", nodeType: "FQ"},
          {name: "电脑", img: "/static/img/node_type/icon-pc.png", nodeType: "PC"},
          {name: "手机", img: "/static/img/node_type/icon-mobile.png", nodeType: "MB"},
          {name: "数据库", img: "/static/img/node_type/icon-database.png", nodeType: "FW-DB"},
          {name: "网络数据", img: "/static/img/node_type/icon-webdata.png", nodeType: "FW-WEB"},
          {name: "文件数据", img: "/static/img/node_type/icon-filedata.png", nodeType: "FW-WJ"},
          {name: "邮件数据", img: "/static/img/node_type/icon-emaildata.png", nodeType: "FW-MAIL"},
          {name: "安全设备", img: "/static/img/node_type/icon-safadevice.png", nodeType: "AQ"},
          {name: "核心交换机", img: "/static/img/node_type/icon-coreex.png", nodeType: "HJ"},
          {name: "笔记本", img: "/static/img/node_type/icon-laptop.png", nodeType: "BJB"},
          {name: "服务器", img: "/static/img/node_type/icon-server.png", nodeType: "FW"},

        ],//节点类型
        node_add_img_src: "",//新增节点的图片名称
        node_select_dom: {show: false},
        txtKeyWord: "",//搜索节点名
        node_obj: {},//编辑的节点
        contextmenu: {show: false},//右键菜单
        node_remove_fun: function () {
        },//删除方法
        modal_title: "",//模态框标题
        modal_mouse_obj: {left: document.body.offsetWidth / 2 - 250, top: 200},//模态框位置
        modal_mouse_obj_modal4: {left: document.body.offsetWidth / 2 - 250, top: 200},//模态框位置 编辑节点时的选择文件位置
        modal_confirm_message: "删除节点确认",//confirm提示文字
        modal_confirm: false,//confirm框
        modal1: false,//弹出框
        modal2: false,
        modal3: false,
        modal4: false,
        modal_node_add:{show:false},//添加节点信息
        stage: null,//布局
        scene: null,//Layer布局
        canvas: null,
        header_height: 70.01,//头部所占高度
        left_right_width: 430,//左右所占宽度，为计算中间内容部分宽度
        mouse_obj: null,//拖动添加节点的节点对象
        nobulle: false,//鼠标是否在节点上落下
        currentNode: null,//鼠标右键节点
        container: {},//分组集合
        area_list: [
          {name: "总部", id: 1},
          {name: "软件部门", id: 2},
          {name: "财务服务区", id: 3},
        ], // 业务区域列表。
        data_list: {//数据源 data 节点 lines 节点间关系
          nodes: [
            {id: 1, name: "aaa", img: ""},
            {id: 2, name: "aaa", img: ""},
            {id: 3, name: "aaa", img: ""},
            {id: 4, name: "aaa", img: ""},
            {id: 5, name: "aaa", img: ""},
            {id: 6, name: "aaa", img: ""},
          ],
          lines: [
            {from: 1, to: 2},
            {from: 1, to: 3},
            {from: 1, to: 4},
            {from: 4, to: 5},
            {from: 4, to: 6},
          ]
        },
        node_arr: {},//节点集合
        line_arr: {},// 关系集合 todo:这里的关系集合和data_list.lines中的节点连线有什么不同呢？ data_list是原始数据集，这里是jtop连接线对象集合
        max_node_id: 1,//最大节点编号
        server_url: `${process.env.API_BASE_URL}`//"http://118.89.236.164:8080/3dapi/"
      }
    },
    computed: {}, // todo:这个是干什么用的？ 这是vue的函数，里边可以定义用来计算的变量，比如：1+1 这种运算
    mounted() {
      this.inits();
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
    watch: {
      screenWidth(val) {
        if (!this.timer) {
          this.screenWidth = val
          this.timer = true
          let that = this
          setTimeout(function () {
            //右边筛选条件位置
            that.filter_mouse_obj.left = that.screenWidth - document.querySelector(".show_node").offsetWidth;
            that.Hawkeye.top = that.screenHeight - that.Hawkeye.sum_height - 100;
            that.canvas.width = that.screenWidth;
            that.canvas.height = that.screenHeight - that.header_height + 3;
            that.timer = false
          }, 400)
        }
      },
      screenHeight(val) {
        if (!this.timer) {
          this.screenHeight = val
          this.timer = true
          let that = this
          setTimeout(function () {
            //右边筛选条件位置
            that.filter_mouse_obj.left = that.screenWidth - document.querySelector(".show_node").offsetWidth;
            that.Hawkeye.top = that.screenHeight -  that.Hawkeye.sum_height - 100;
            that.canvas.width = that.screenWidth;
            that.canvas.height = that.screenHeight - that.header_height + 3;
            that.timer = false
          }, 400)
        }
      }
    },
    methods: {
      /**
       * 节点类型修改 不保存
       * */
      nodeType_Change() {
        var img = this.node_get_nodeType_url(this.node_obj.nodeType);
        this.node_obj.img = img[1];
      },
      /**
       * 切换到3d视图
       * */
      cast_3d() {
        console.log(this)
        this.$router.push({path: "view3d"});
      },
      /**
       * 跳到下一个提示
       * */
      common_title_next(node) {
        //this.common_title_list.splice(this.common_title_list.indexOf(node), 1);
       /*for (var one in this.node_arr) {
          var e = this.node_arr[one].node;
          if (e.remove_node)
            e.remove_node.visible = false;
          delete e.is_selected;

          this.set_node_style(e, "default");
        }*/

        if(this.common_title_list.length==0) {
          this.stage.setCenter(document.body.offsetWidth/2, (document.body.offsetHeight-this.header_height)/2);
          return;
        }
        var item = this.common_title_list[0].node[this.common_title_now_id];
        if(!item) {
          this.stage.setCenter(document.body.offsetWidth/2, (document.body.offsetHeight-this.header_height)/2);
          return;
        }
        this.stage.setCenter(item.x, item.y + this.header_height);
        if(this.common_title_now_id + 1 == this.common_title_list[0].node.length)
          this.common_title_now_id = 0;
        else
          this.common_title_now_id++;
        var e = this.node_arr[item.id].node;
        e.is_selected = true;
        this.node_query_list[e.id] = e;
        if (e.remove_node)
          e.remove_node.visible = false;
        this.set_node_style(e, "focus");
      },
      common_title_close(item) {
        this.common_title_list.splice(this.common_title_list.indexOf(item), 1);
      },
      /**
       * 添加提示
       * */
      common_title_add(title, type, s,node) {
        var _this = this;
        var Index = this.common_title_list.length;
        var item = {Index: Index, title: title, type: type || "default",node:node};
        this.common_title_list.push(item);
        if (s && s === "no_close") {
          this.common_title_now_id = 0;
          if(this.common_title_list.length>1)
            this.common_title_list.splice(this.common_title_list[0], 1);
          return;
        }

        (function (row) {
          setTimeout(function () {
            _this.common_title_list.splice(_this.common_title_list.indexOf(row), 1);
          }, s || 2000);
        })(item);
      },
      //编辑图片地址
      change_img_url(img, name) {
        var url = img;
        var img = url.toString().split('/');
        var extend = img[img.length - 1];
        extend = extend.split('.');
        var url = "";
        for (var i = 0; i < img.length - 1; i++) {
          url += img[i] + "/";
        }
        url = url + extend[0];
        if (name) {
          return url + name + "." + extend[1];
        } else
          return url + "." + extend[1];
      },
      /**
       * 当点击页面时清除所有选中节点状态
       * */
      clear_node_select(ev) {
        if (ev.target.tagName == "CANVAS") {
          if (!this.node_select_down) {
            if (this.scene.selectedElements.length === 0) {
              this.remove_node_mark("reset_node_source");
            }
            this.currentNode = null;
            this.node_select_dom.show = false;
            this.contextmenu = {show: false};
          }
        }
        this.node_select_down = undefined;
      },
      /**
       * 去掉节点遮罩
       * */
      remove_node_mark(type, source) {
        if (source) {
          if (source.is_selected) {
            if (source.remove_node) {
              source.remove_node.visible = false;
              if (source.remove_node.textNode)
                source.remove_node.textNode.visible = false;
            }
            return;
          }

          if (Enumerable.from(this.scene.selectedElements).where("$.id=='" + source.id + "'").toArray().length === 0) {
            if (source.remove_node)
              source.remove_node.visible = false;
            if (type == "reset_node_source")
              this.set_node_style(source, "default");
          }
          if (source.remove_node && source.remove_node.textNode)
            source.remove_node.textNode.visible = false;
        } else {
          var node_list = this.node_arr;
          for (var one in node_list) {
            var node = node_list[one].node;
            if (node.is_selected) {
              continue;
            }
            ;
            if (node.remove_node) {
              node.remove_node.visible = false;
              if (node.remove_node.textNode)
                node.remove_node.textNode.visible = false;
            }
            if (type == "reset_node_source")
              this.set_node_style(node, "default");
          }
        }
      },
      /**
       * 为节点添加遮罩
       * node 要添加遮罩的节点
       * {object}node
       * */
      add_node_mark(source, ev, mouseType) {
        var _this = this;
        if (source) {
          opt_node(source);
        } else {
          var select_nodes = this.scene.selectedElements;
          for (var i = 0; i < select_nodes.length; i++) {
            var node = select_nodes[i];
            opt_node(node);
          }
        }

        function opt_node(node) {
          //node.selected = true;
          if (node.show_type === 'disabled') return;
          _this.set_node_style(node, mouseType || 'selected')
          var node_child = node.remove_node || new JTopo.Node();
          return;
        }
      },
      /**
       * 点击增加、缩放比例
       * @param {String} type
       * jian 缩小 jia 放大
       */
      change_scale(type) {
        if (type == "jian") {
          if(parseInt(100 * (this.scene.scaleX / 1.2))>parseInt(config.layout.scale.min)) {
            this.scene.scaleX /= 1.2;
            this.scene.scaleY /= 1.2;
          }
        } else if (type == "reduction") {
          this.scene.scaleX = 1;
          this.scene.scaleY = 1;
        } else {
          if(parseInt(100 * (this.scene.scaleX * 1.2))>=parseInt(config.layout.scale.max)){
            if(!this.now_scale_max)
              this.now_scale_max = this.scene.scaleX*1.2;
            this.scene.scaleX = this.now_scale_max;
            this.scene.scaleY = this.now_scale_max;
          }else{
            this.scene.scaleX *= 1.2;
            this.scene.scaleY *= 1.2;
          }
        }
        this.Scale_Number = parseFloat(100 * this.scene.scaleX).toFixed(0);

        this.stage.eagleEye.eagleImageDatas = this.stage.eagleEye.getData(this.stage);
        this.init_egle(this.stage.eagleEye);

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
            if (this.drag_nodeType.down) {
              return this.drag(ev, this.drag_nodeType.src, 'move');
            }
            if (this.modal_mouse_obj.down) {
              var max_height = document.body.offsetHeight - this.header_height;
              var max_width = document.body.offsetWidth;
              switch (this.mouse_type) {
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
      edit() {

      },
      /**
       * 鼠标在canvas上拖动
       * ev 当前鼠标对象
       * @param {event}ev
       */
      allowDrop(ev) {
        ev.preventDefault();
      },
      build_drag_node(ev,type){
        var _this = this;
        var item = {img:type.img,name:_this.node_get_nodeType_url(type.nodeType)[2],nodeType:type.nodeType,add_nodeIng:true,nodeId:"add_nodeIng"};
        var node;
        node = new JTopo.Node();
        node.showSelected = false;
        node.setImage(type.img);
        node.paint = function (context) {
          _this.draw_node('default', item, context);
        }
        node.width = this.node_size.width;
        node.height = this.node_size.height;
        node.zIndex = 999999;
        this.scene.add(node);
        this.drag_nodeType.add_node = node;
        this.drag_nodeType.add_data = item;
        node.visible = false;
        node.show = true;
        node.alpha = 0.6;
        node.setLocation(ev.x,ev.y);
      },
      /**
       * 拖动一个节点添加到canvas上，开始拖动
       * ev 鼠标对象
       * type 要添加节点的类型 custom 自定义节点 需要上传图片 默认为定义好的节点
       * @param ev
       * @param type
       */
      drag(ev, type, mouseType, custom) {//类型拖动
        var _this = this;
        switch (mouseType) {
          case "down":
            this.drag_nodeType.img_width = 72 / 2;
            this.drag_nodeType.img_height = 80 / 2;
            this.drag_nodeType.mouse_point = {
              x: ev.x - this.drag_nodeType.img_width,
              y: ev.y - this.drag_nodeType.img_height
            };
            this.drag_nodeType.down = true;
            this.drag_nodeType.src = type.img;
            this.drag_nodeType.mouse_obj = ev;
            this.drag_nodeType.mouse_obj.drap_type = type.img;
            this.drag_nodeType.mouse_obj.nodeType = type.nodeType;
            this.drag_nodeType.mouse_down_node = "no_id";
            var drag_node_img = this.node_get_nodeType_url(type.nodeType);
            this.drag_nodeType.big_img = drag_node_img[1];
            this.drag_nodeType.nodeType_Name = drag_node_img[2];
            this.drag_nodeType.type = type;
            if (custom == "custom")
              this.drag_nodeType.mouse_obj.drap_type = "custom";
            this.drag_nodeType.node_arr = this.scene.childs.filter(function (e) {
              return e instanceof JTopo.Node;
            });
            this.drag_nodeType.line_arr = this.scene.childs.filter(function (e) {
              return e instanceof JTopo.Link && e.id!='new_line';
            });
            this.drag_nodeType.node_focus = [];
            this.drag_nodeType.line_focus = [];
            this.build_drag_node(ev,type);

            break;
          case "move":
            if (this.drag_nodeType.down) {
              if(ev.x <= this.node_type_mouse_obj.left || ev.x >= this.node_type_mouse_obj.left + 77) {
                this.drag_nodeType.down = false;
                if(!this.drag_nodeType.add_node)
                  this.build_drag_node(ev,this.drag_nodeType.type);
              }
              this.drag_nodeType.mouse_point.x = ev.x - this.drag_nodeType.img_width;
              this.drag_nodeType.mouse_point.y = ev.y - this.drag_nodeType.img_height;
            }
            break;
          case "up":
            this.mouse_obj = this.drag_nodeType.mouse_obj;
            this.drag_nodeType.down = false;
            this.drag_nodeType.upTime = new Date().getTime();
            if(this.drag_nodeType.add_node){
              this.scene.remove(this.drag_nodeType.add_node);
              this.drag_nodeType.add_node = undefined;
            }
            break;
          case "over":
            if(this.drag_nodeType.add_node){
              this.scene.remove(this.drag_nodeType.add_node);
              this.drag_nodeType.add_node = undefined;
              this.drag_nodeType.down = true;
            }
            break;
        }
      },
      get_brand() {
        console.log(this.scene.getDisplayedElements())
      },
      /**
       * 重置布局并重置移动鼠标拖动的节点
       */
      reset_layout(id) {
        this.mouse_obj = undefined;
        this.nobulle = false;
        //this.scene.doLayout(JTopo.layout.TreeLayout('down', this.node_size.tree_width, this.node_size.tree_height));

        JTopo.layout.layoutNode(this.scene, id || this.node_arr[1].node, true);


        return;
        var node_list = [];
        for (var one in this.node_arr) {
          var node = this.node_arr[one].node;
          node_list.push({x: node.x, y: node.y, id: node.id, parent_id: node.parent_id});
        }

        var node_now_level = [];
        if (!this.line_arr[id.id]) return;
        var from_id = this.line_arr[id.id].data.from;
        for (var one in this.line_arr) {
          var link = this.line_arr[one].data;
          if (link.from === from_id) {
            var node = this.node_arr[link.to].node;
            node_now_level.push({x: node.x, y: node.y, id: node.id});
          }
        }
        for (var i = 0; i < node_now_level.length; i++) {
          var node = node_now_level[i];
          var child_node = Enumerable.from(node_list).where("$.parent_id==" + node.id).toArray();
          if (child_node.length > 0) {
            var now_node;
            if (i + 1 < node_now_level.length) {
              now_node = this.node_arr[node_now_level[i + 1].id];
              now_node = now_node.node;
              if (child_node.length > 2) {
                var star_x = Enumerable.from(child_node).max("$.x");
                now_node.setLocation(star_x + this.node_size.width, now_node.y);
              }
            } else {
              var prev_node = this.node_arr[node_now_level[i - 1].id];
              now_node = this.node_arr[node_now_level[i].id].node;

              if (prev_node) {
                prev_node = prev_node.node;
                child_node = Enumerable.from(node_list).where("$.parent_id==" + prev_node.id).toArray();
                var star_x = Enumerable.from(child_node).max("$.x") + this.node_size.width + Enumerable.from(node_list).where("$.parent_id==" + now_node.id).toArray().length * this.node_size.tree_width;
                now_node.setLocation(star_x, now_node.y);
              }

            }
          }
        }
        return;
        var line_list = [];
        for (var one in this.line_arr) {
          var link = this.line_arr[one].link;
          line_list.push({from: link.from, to: link.to});
        }
        var distinct_node = {};
        for (var i = 0; i < node_list.length; i++) {
          var node = node_list[i];
          if (!this.line_arr[node.id])
            continue;
          var parent_list = Enumerable.from(line_list).where("$.from==" + this.line_arr[node.id].data.from).toArray();
          if (parent_list.length > 2) {
            var aa = Enumerable.from(node_list).where("$.x>=" + node.x).toArray()[0];
            if (aa)
              distinct_node[aa.id] = this.node_arr[aa.id].node;
          }

        }
        for (var one in distinct_node) {
          var node = distinct_node[one];
          if (one == 3)
            distinct_node[one].setLocation(node.x + this.node_size.width, node.y);
        }

      },
      //保存节点到数据库
      save_node(node, cb,type) {
        if(!type){
          if(node.nodeType==="TY")
            this.modal2 = true;
          else{
            this.modal_node_add.show = true;
            this.modal_node_add.img = this.node_get_nodeType_url(this.mouse_obj.nodeType)[1];
          }
          for(var one in node){
            this.modal_node_add[one] = node[one];
          }
          this.modal_node_add.callback = cb;
          return
        }
        var _this = this;
        var parent_id = node.parent_id;
        if(node.parent_id){
          parent_id = this.node_arr[node.parent_id].data.sourceId;
        }
        if(!node.file && node.nodeType === 'TY'){
          _this.common_title_add("请上传图片！", "default");
          return;
        }
        var config = {
          method: 'get',
          url: _this.server_url + 'addNode',
          params: {
            nodePid: parent_id,
            nodeCid: node.sourceId,
            nodeType: node.nodeType,
            nodeIp:node.nodeIp,
            nodeName:node.nodeName
          },
          requestHeader: {'Content-Type': 'application/json'},
        };

       // axios(config).then(function (data) {
          //data = data.data;
          var data = {resultCode:0,resultCont:1};
          if (data.resultCode == "0") {
            if (data.resultCont == 1){
              data.nodeName = node.nodeName;
              data.file = node.file;
              data.nodeId = "10_222_"+ Math.random() * 100;
              _this.modal_node_add.show = false;
              cb(data);
            }else
              _this.common_title_add("添加" + _this.node_get_nodeType_url(node.nodeType)[2] + "失败，原因为："+data.resultMsg, "default");
          }else
            _this.common_title_add("添加" + _this.node_get_nodeType_url(node.nodeType)[2] + "失败，原因为："+data.resultMsg, "default");
       // });
      },
      //绘制节点图片以及文字
      draw_node(type, item, context) {
        var _this = this;
        var x = 0;
        var y = 0;
        var width = _this.node_size.width;
        var height = _this.node_size.height;

        if (!_this.node_arr[item.nodeId] && !item.add_nodeIng) return;
        var node;
        if(_this.drag_nodeType.add_node && _this.drag_nodeType.add_node.visible)
          node = _this.drag_nodeType.add_node;
        else
          node = _this.node_arr[item.nodeId].node;
        if (type != 'add_node')
          type = node.mouse_option || type;
        if(item.nodeId === 'add_nodeIng') {
          item = this.drag_nodeType.add_data;
          context.globalAlpha = 0.6;
        }

        //画一个删除按钮
        function draw_button_del() {
          //画删除按钮上的文字
          if (node.node_remove_show) {
            var remove_x = -width + 30;
            var remove_y = -height / 2 - 9;
            var sel_count = _this.scene.selectedElements.length;
            if (sel_count === 0 || Enumerable.from(_this.scene.selectedElements).where("$.id=='" + node.id + "'").toArray().length === 0)
              sel_count = sel_count + 1;

            var message = "删除 " + sel_count + " 台设备";
            var remove_width = context.measureText(message).width;

            var rect = Rect(remove_x, remove_y, remove_width + 40, 28);
            drawRoundedRect(rect, 15, context, "#ff3d3d", "#ff3d3d");
          }

          var img = new Image();
          img.src = "/static/img/common/node/remove.png";
          if (img.complete) {
            draw_remove_img(img);
          } else {
            img.onload = function () {
              draw_remove_img(img);
            };
          }

          function draw_remove_img(img) {
            var img_w = img.width;
            var img_h = img.height;
            if(node.node_remove_show)
              context.drawImage(img, -width+30, -height / 2 - 10, 28, 28);
            else
              context.drawImage(img, width / 2 - 15, -height / 2 - 10, 28, 28);
          }

          if (node.node_remove_show) {
            context.font = "14px 微软雅黑";
            //设置字体填充颜色
            context.fillStyle = "#ffffff";
            context.textAlign = "center";
            context.fillText(message, remove_x + 68, remove_y + 18);
          }
        }

        //开始画一个矩形
        function draw_jx(jx_type) {
          var j_x = x - width / 2;
          var j_y = y - height / 2;

          //画文字背景
          var rect = Rect(j_x, j_y, width, height);
          context.lineWidth = 2;
          var strokeStyle;
          var fillStyle;
          switch (type) {
            case "focus":
              strokeStyle = "#ff3d3d";
              fillStyle = "#1e2d3e";
              break;
            case "selected":
              strokeStyle = "#ff3d3d";
              fillStyle = "#1e2d3e";
              break;
            case "hover":
              strokeStyle = "#ff3d3d";
              fillStyle = "#1e2d3e";
              break;
            case "default":
              strokeStyle = "transparent";
              if (_this.View_Type === "business")
                fillStyle = "#184e4e";
              else
                fillStyle = "#26384c";
              break;
            case "disabled":
              strokeStyle = "transparent";
              if (jx_type === "two")
                fillStyle = "#26384d";
              else
                fillStyle = "rgba(38, 56, 77, 0.8)";
              break;
            case "add_node":
              strokeStyle = "transparent";
              fillStyle = "rgba(38,56,76,0.5)";
              break;
          }
          drawRoundedRect(rect, 4, context, strokeStyle, fillStyle);
        }

        //画图
        function draw_img(img) {
          var img_w = img.width;
          var img_h = img.height;
          x = 0;
          y = 0;
          var width = 0;
          var height = 0;
          var img_x = x / 2 + (x + width - img_w ) / 2;
          var img_y = y / 2 + (y + height - img_h ) / 2 - 15;
          context.drawImage(img, img_x, img_y);
        }

        function Rect(x, y, w, h) {
          return {x: x, y: y, width: w, height: h};
        }

        //画一个圆角
        var Point = function (x, y) {
          return {x: x, y: y};
        };

        function drawRoundedRect(rect, r, ctx, strokeStyle, fillStyle) {
          var ptA = Point(rect.x + r, rect.y);
          var ptB = Point(rect.x + rect.width, rect.y);
          var ptC = Point(rect.x + rect.width, rect.y + rect.height);
          var ptD = Point(rect.x, rect.y + rect.height);
          var ptE = Point(rect.x, rect.y);

          ctx.beginPath();

          ctx.moveTo(ptA.x, ptA.y);
          ctx.arcTo(ptB.x, ptB.y, ptC.x, ptC.y, r);
          ctx.arcTo(ptC.x, ptC.y, ptD.x, ptD.y, r);
          ctx.arcTo(ptD.x, ptD.y, ptE.x, ptE.y, r);
          ctx.arcTo(ptE.x, ptE.y, ptA.x, ptA.y, r);
          ctx.fillStyle = fillStyle || "#d1e5ff";   //选择油漆桶的颜色
          ctx.strokeStyle = strokeStyle || "#d1e5ff";
          if(item.nodeId === 'add_nodeIng') {
            ctx.strokeStyle = "#8c9fb7";
          }
            ctx.fill();                 //确定填充
          ctx.stroke();
        }

        //画一段文本
        function draw_txt() {
          var txt_back_point = {
            x: -41,
            y: 22,
            width: width - 10,
            height: 20
          };
          //画文字背景
          var rect = Rect(txt_back_point.x, txt_back_point.y, txt_back_point.width, txt_back_point.height);
          drawRoundedRect(rect, 6, context);

          context.font = "12px Courier New";
          //设置字体填充颜色
          context.fillStyle = "#232f3d";
          context.textAlign = "center";
          var t_x = 0;
          var t_y = txt_back_point.y + 14;
          var str = item.name || "";
          var lineWidth = 0;
          var canvasWidth = txt_back_point.width - 30;//计算canvas的宽度
          var lastSubStrIndex = 0; //每次开始截取的字符串的索引
          var msg = "";
          if (context.measureText(item.name).width > canvasWidth) {
            for (let i = 0; i < str.length; i++) {
              lineWidth += context.measureText(str[i]).width;
              if (lineWidth > canvasWidth) {
                msg += str.substring(lastSubStrIndex, i);
                lastSubStrIndex = i + 1;
              }
            }
            if (msg != item.name)
              msg += "...";
          } else
            msg = item.name;
          context.fillText(msg, t_x, t_y);

        }

        //开始画一张图
        function drag_star() {
          //画边框
          if (type != "add_node" && item.nodeId !== 'add_nodeIng') {
            if (type !== "disabled")
              draw_jx();
            else
              draw_jx("two");
          }

          //把图片画上
          var img = new Image();
          var url = _this.change_img_url(item.img, "@2x")
          img.src = url;
          if (img.complete) {
            draw_img(img);
          } else {
            img.onload = function () {
              draw_img(img);
            };
          }
          ;
          //然后画文字
          draw_txt()
          if (type === "disabled" || type == "add_node")
            draw_jx();
          if (type === "hover" && node.mouse_type == "hover" || type === "selected") {
            draw_button_del();
          }
        }

        drag_star();
      },
      /**
       * 设置节点属性
       * @params {object}node
       * */
      set_node_attribute(node_child, item, ev, type,cb) {
        var _this = this;
        function add_node() {
          node_child.text = item.name;
          node_child.id = item.id;
          node_child.sourceId = item.sourceId;
          if (item.parent_id && item.parent_id > 0 && item.id >= 0) {
            node_child.parent_id = item.parent_id;
            _this.node_arr[item.parent_id].node.children = _this.node_arr[item.parent_id].node.children || [];
            _this.node_arr[item.parent_id].node.children.push(node_child);
          }
          node_child.setSize(_this.node_size.width, _this.node_size.height);
          if (ev) {
            node_child.setLocation(ev.x, ev.y);
          }
          if(!(item.id<=0)){
            node_child.fontColor = "35,47,61";
            node_child.textOffsetY = -20;
            node_child.showSelected = false; // 不显示选中矩形
            node_child.fillColor = "35,47,61";
            node_child.area = item.area;
            node_child.dragable = false;
            //鼠标在节点上操作
            node_child.mouseover(function (ev) {
              _this.add_node_mark(this, ev, "hover");
            });
            node_child.mousemove(function (ev) {
              var node = this;
              var x_star = node.x + node.width - 15;
              var x_end = node.x + node.width + 15;
              var y_star = node.y - 15;
              var y_end = node.y + 15;
              if ((ev.x > x_star ||  this.node_remove_show)&& ev.x < x_end && ev.y > y_star && ev.y < y_end) {
                this.node_remove_show = true;
                ev.currentTarget.style.cursor = "pointer";
              }
              else {
                  this.node_remove_show = false;
              }
            });
            node_child.mouseout(function (ev) {
              var node = this;
              if (this.show_type != "selected")
                node.mouse_type = "";
              node.node_remove_show = false;
              setTimeout(function () {
                if (!_this.node_remove_mouse_now) {
                  _this.remove_node_mark("reset_node_source", node);
                }
                _this.node_remove_mouse_now = false;
              }, 10);
            });

            _this.node_drag_star(node_child);
            node_child.paint = function (context) {
              _this.draw_node('default', item, context);
            }
          }
          _this.scene.add(node_child);
          _this.node_arr[item.id] = {data: item, node: node_child};
        }

        if (type != "init") {
          var drap_type = _this.mouse_obj.drap_type;
          _this.save_node({parent_id: item.parent_id, id: item.id, nodeType: item.nodeType,nodeIp:item.nodeIp,nodeName:item.name}, function (data) {
            item.id = parseInt(data.nodeId.replace(/_/g,""));
            item.sourceId = data.nodeId;
            item.nodeId = item.id;
            if (drap_type === "custom") {
              _this.currentNode = node_child;
              _this.modal2 = true;
              _this.node_add_img_src = "";
              var img = " /static/img/node_type/add_node.png";
              node_child.setImage(img);
              item.img = img;
              if(data.nodeName){
                item.name = data.nodeName;
                node_child.text = item.name;
              }
              _this.node_upload_img({file:data.file,sourceId:item.sourceId},function(){
                add_node();
                if(cb) cb();
                _this.common_title_add("添加" + _this.node_get_nodeType_url(item.nodeType)[2] + "成功", "default");
                _this.max_node_id++;
                _this.dev_count++;
                if (item.parent_id)
                  _this.doLayout2();
              })
            }
            else {
              var img = drap_type;
              img = img.substring(0, img.length - 4);
              img += "@2x.png";
              node_child.setImage(img);
              item.img = drap_type;
              if(data.nodeName){
                item.name = data.nodeName;
                node_child.text = item.name;
              }
              add_node();
              if(cb) cb();
              _this.common_title_add("添加" + _this.node_get_nodeType_url(item.nodeType)[2] + "成功", "default");
              _this.max_node_id++;
              _this.dev_count++;
              if (item.parent_id)
                _this.doLayout2();
            }


          });
        } else {
          add_node();
          node_child.setImage(item.img);
        }


      },
      /**
       * 当没有节点时 新增父节点
       * {object}ev
       * */
      allowDrop_End(ev) {
        var _this = this;
        if (!_this.mouse_obj) return;
        _this.nobulle = true;
        var item = {};
        item.name = _this.node_get_nodeType_url(_this.mouse_obj.nodeType)[2];
        item.id = this.max_node_id;
        item.nodeId = item.id;
        item.nodeType = _this.mouse_obj.nodeType;
        var node_child = new JTopo.Node();
        ev.x = ev.x - this.node_size.width / 2;
        ev.y = ev.y - this.node_size.height / 2;
        this.set_node_attribute(node_child, item, ev);
        _this.mouse_obj = undefined;
      },
      doLayout2() {
        var _this = this;
        var nodeList = [];
        var nodeTree = [];

        function dg2(item, tree) {
          var data = item.data;
          var node = item.node;

          if (node.children) {
            for (var i = 0; i < node.children.length; i++) {
              if (_this.node_arr[node.children[i].id]) {
                var tree_child = {nodeId: node.children[i].id, items: []};
                tree.push(tree_child);
                _this.node_arr[node.children[i].id].yes = true;
                dg2(_this.node_arr[node.children[i].id], tree_child.items);
              }
            }
          }
        }

        for (var one in _this.node_arr) {
          var item = _this.node_arr[one];
          nodeList.push(item.data);
          var tree = {nodeId: item.node.id, items: []};
          dg2(item, tree.items);
          if(!item.data.parent_id || item.data.parent_id==-1){
            nodeTree.push(tree);
          }
        }
        //加载node
        _this.line_list = [];
        //屏幕中间点位置
        var centerX = document.body.offsetWidth / 2;
        var centerY = document.body.offsetHeight / 2 - 250;
        _this.scene.clear();

        function init_nodes(nodeTree, parent_id, x, y) {
          for (var i = 0; i < nodeTree.length; i++) {
            var item_source = nodeTree[i];
            var item = Enumerable.from(nodeList).where("$.nodeId=='" + item_source.nodeId+"'").toArray()[0];
            if (!item)
              continue;
            item.id = item.nodeId;
            item.area = item.busnId;
            item.name = item.nodeName || item.name;
            item.img = _this.node_get_nodeType_url(item.nodeType);
            if (item.img)
              item.img = item.img[0];
            else
              item.img = "";

            if (parent_id)
              item.parent_id = parent_id;

            var node_child = new JTopo.Node();
            _this.set_node_attribute(node_child, item, {x: x, y: y}, "init");
            if (parent_id) {
              var line_item = {};
              line_item.from = parent_id;
              line_item.to = item.id;
              var link = _this.create_line(_this.node_arr[parent_id].node, node_child);
              link.to = line_item.to;
              link.from = line_item.from;
              _this.line_arr[line_item.to] = {data: line_item, link: link};
              _this.line_list.push(line_item);
              _this.scene.add(link);
            }
            if (item_source.items && item_source.items.length > 0) {
              init_nodes(item_source.items, item.nodeId, x, y);
            }
            _this.node_query_list[node_child.id] = node_child;
          }
        }


        var count = 0;
        this.node_arr = {};//重置节点集合
        this.line_arr = {};// 重置关系集合
        this.max_node_id = 1;//重置最大节点编号
        //清除jtop上所有元素
        this.scene.clear();
        this.container = {};
        //屏幕中间点位置
        var centerX = document.body.offsetWidth / 2;
        var centerY = document.body.offsetHeight / 2 - 250;

        _this.dev_count = nodeList.length;
        if (nodeList.length > 0) {
          if (nodeTree.length > 1) {
            //为没有子节点的父节点添加一个子节点，这样做是为了拜访布局，节点不被遮盖
            var item = {nodeId: -1, nodeName: "root"};
            nodeList.push(item);
            nodeTree = [{nodeId: item.nodeId, items: nodeTree}];

            //为没有子节点的父节点添加一个子节点，这样做是为了拜访布局，节点不被遮盖
            var count = -2;
            var surplus = [];

            init_nodes(nodeTree, undefined, centerX, centerY);
            _this.scene.doLayout(JTopo.layout.TreeLayout('down', _this.node_size.tree_width, _this.node_size.tree_height));

            //删除最顶层节点和没有子节点的父节点下的手动添加的子节点
            var outlinks=_this.node_arr[item.nodeId].node.outLinks;
            for(var i=0;i<outlinks.length;i++){
              _this.scene.remove(outlinks[i]);
            }
            _this.scene.remove(_this.node_arr[item.nodeId].node);
            delete _this.node_arr[item.nodeId];
            delete _this.node_query_list[item.nodeId];
            var node_item = Enumerable.from(nodeList).where("$.id==" + item.nodeId).toArray()[0];
            if (node_item)
              nodeList.splice(nodeList.indexOf(node_item), 1);
            for (var i = 0; i < surplus.length; i++) {
              var surp = surplus[i];
              _this.scene.remove(_this.node_arr[surp.id].node);
              delete _this.node_arr[surp.id];
              delete _this.node_query_list[surp.id];
              var node_item = Enumerable.from(nodeList).where("$.id==" + surp.id).toArray()[0];
              if (node_item)
                nodeList.splice(nodeList.indexOf(node_item), 1);
            }
          } else {

            //为没有子节点的父节点添加一个子节点，这样做是为了拜访布局，节点不被遮盖
            var count = 0;
            var surplus = [];

            function dg(node_list) {
              for (var i = 0; i < node_list.length; i++) {
                var item = node_list[i];
                if (item.items.length === 0) {
                  var data = {id: count, nodeId: count, nodeName: "aa" + count};
                  item.items.push({nodeId: count, items: []});
                  nodeList.push(data);
                  surplus.push(data);
                  count--;
                } else
                  dg(item.items);
              }
            }

            dg(nodeTree[0].items);
            init_nodes(nodeTree, undefined, centerX, centerY);
            _this.scene.doLayout(JTopo.layout.TreeLayout('down', _this.node_size.tree_width, _this.node_size.tree_height));


            for (var i = 0; i < surplus.length; i++) {
              var surp = surplus[i];
              _this.scene.remove(_this.node_arr[surp.id].node);
              delete _this.node_arr[surp.id];
              delete _this.node_query_list[surp.id];
              var node_item = Enumerable.from(nodeList).where("$.id==" + surplus[i].id).toArray()[0];
              if (node_item)
                nodeList.splice(nodeList.indexOf(node_item), 1);
            }
          }
          _this.max_node_id = parseInt(Enumerable.from(nodeList).select(function (i) {
            i.nodeId = parseInt(i.nodeId);
            return i;
          }).max("$.nodeId")) + 1;
        } else {
          _this.max_node_id = 1;
        }
        this.add_other_node();
      },
      /**
       * 新增节点 鼠标落到目标节点
       * node_parent 要落到的目标节点对象
       * @param {object}node_parent
       */
      add_node(node_parent) {//
        var _this = this;
        _this.node_drag = true;
        if (!_this.mouse_obj) return;
        _this.nobulle = true;
        var item = {};
        item.name = _this.node_get_nodeType_url(_this.mouse_obj.nodeType)[2];
        item.id = this.max_node_id;
        item.nodeId = item.id;
        item.parent_id = node_parent.id;
        item.nodeType = _this.mouse_obj.nodeType;
        var node_child = new JTopo.Node();
        this.set_node_attribute(node_child, item,null,null,function(){
          node_child.setLocation(event.x, event.y);
          var line_item = {};
          line_item.from = node_parent.id;
          line_item.to = item.id;

          var link = _this.create_line(node_parent, node_child);
          link.to = line_item.to;
          link.from = line_item.from;
          _this.line_arr[line_item.to] = {data: line_item, link: link};
          _this.scene.add(link);
          _this.mouse_obj = undefined;
        });

      },
      /**
       * 改变节点关系并添加节点
       * obj 鼠标落到的连接线
       * count 索引
       * @param {object}obj
       * @param {number}count
       */
      change_line(obj, to_node1) {
        var _this = this;
        _this.node_drag = true;
        if (!_this.mouse_obj && _this.scene.selectedElements.length == 0) return;
        _this.nobulle = true;

        if (_this.mouse_obj) {
          //创建子节点
          var item = {};
          item.name = _this.node_get_nodeType_url(_this.mouse_obj.nodeType)[2];
          item.id = this.max_node_id;
          item.nodeId = item.id;
          item.nodeType = _this.mouse_obj.nodeType;

          //修改新增节点的父节点为 当前结点的父节点
          //修改当前结点的父节点为新增节点
          item.parent_id = obj.nodeA.id;
          var nodeZ = this.node_arr[obj.nodeZ.id];
          nodeZ.data.parent_id = item.id;
          nodeZ.node.parent_id = item.id;

          var nodeZ_two;
          if(to_node1)
            nodeZ_two = this.node_arr[to_node1.nodeZ.id];

          //删除原来节点在父节点下
          var old_children = Enumerable.from(_this.node_arr[item.parent_id].node.children).where("$.id==" + nodeZ.node.id).toArray()[0];
          if (old_children) {
            _this.node_arr[item.parent_id].node.children.splice(_this.node_arr[item.parent_id].node.children.indexOf(old_children), 1);
          }
          if(to_node1){
            var old_children = Enumerable.from(_this.node_arr[item.parent_id].node.children).where("$.id==" + nodeZ_two.node.id).toArray()[0];
            if (old_children) {
              _this.node_arr[item.parent_id].node.children.splice(_this.node_arr[item.parent_id].node.children.indexOf(old_children), 1);
            }
          }

          var node_child = new JTopo.Node();
          this.set_node_attribute(node_child, item, {x: nodeZ.node.x, y: nodeZ.node.y},null,function(){
            //为新增节点添加原来节点为子节点
            node_child.children = node_child.children || [];
            node_child.children.push(nodeZ.node);
            nodeZ.node.parent = node_child;
            if(to_node1){
              node_child.children.push(nodeZ_two.node);
              nodeZ_two.node.parent = node_child;
            }

            var old_link_obj = _this.create_line(_this.node_arr[obj.nodeA.id].node, node_child);
            old_link_obj.from = obj.nodeA.id;
            old_link_obj.to = node_child.id;
            _this.scene.add(old_link_obj);
            //obj.nodeZ.setLocation(nodeZ.node.x, nodeZ.node.y + this.node_size.tree_height);
            _this.scene.remove(obj);

            if(to_node1){
              _this.scene.remove(to_node1);
            }

            var link = _this.create_line(node_child, obj.nodeZ);
            var line_obj = {data: {to: obj.nodeZ.id, from: node_child.id}, link: link};
            link.to = line_obj.data.to;
            link.from = line_obj.data.from;
            delete _this.line_arr[obj.nodeZ.id];
            _this.line_arr[link.to] = line_obj;
            _this.scene.add(link);

            if(to_node1){
              var link = _this.create_line(node_child, nodeZ_two.node);
              var line_obj = {data: {to: nodeZ_two.node.id, from: node_child.id}, link: link};
              link.to = line_obj.data.to;
              link.from = line_obj.data.from;
              delete _this.line_arr[nodeZ_two.node.id];
              _this.line_arr[link.to] = line_obj;
              _this.scene.add(link);
            }
          });
        } else {
          var node = this.node_arr[_this.scene.selectedElements[0].id].node;

          var item = _this.node_arr[node.id];
          if (item.node.children) {
            var is_parent;

            function query_parent(id, children) {
              if (Enumerable.from(children).where("$.id==" + id).toArray().length > 0) {
                is_parent = true;
                return;
              } else if (children.length) {
                for (var i = 0; i < children.length; i++) {
                  var node = children[i];
                  if (node.children)
                    query_parent(id, node.children);
                }
              }
            }

            query_parent(obj.nodeZ.id, item.node.children)
            if (is_parent)
              return;
          }

          //修改新增节点的父节点为 当前结点的父节点
          //修改当前结点的父节点为新增节点
          var item = this.node_arr[node.id].data;
          item.parent_id = obj.nodeA.id;
          var nodeZ = this.node_arr[obj.nodeZ.id];
          nodeZ.data.parent_id = item.id;
          nodeZ.node.parent_id = item.id;


          var nodeZ_two = this.node_arr[to_node1.nodeZ.id];

          //删除原来节点在父节点下
          var old_children = Enumerable.from(_this.node_arr[item.parent_id].node.children).where("$.id==" + nodeZ.node.id).toArray()[0];
          if (old_children) {
            _this.node_arr[item.parent_id].node.children.splice(_this.node_arr[item.parent_id].node.children.indexOf(old_children), 1);
          }
          var old_children = Enumerable.from(_this.node_arr[item.parent_id].node.children).where("$.id==" + nodeZ_two.node.id).toArray()[0];
          if (old_children) {
            _this.node_arr[item.parent_id].node.children.splice(_this.node_arr[item.parent_id].node.children.indexOf(old_children), 1);
          }

          var old_children = Enumerable.from(_this.node_arr[node.parent_id].node.children).where("$.id==" + node.id).toArray()[0];
          if (old_children) {
            _this.node_arr[node.parent_id].node.children.splice(_this.node_arr[node.parent_id].node.children.indexOf(old_children), 1);
          }

          var node_child = node;
          obj.nodeA.children = obj.nodeA.children || [];
          obj.nodeA.children.push(node)

          //为新增节点添加原来节点为子节点
          node_child.children = node_child.children || [];
          node_child.children.push(nodeZ.node);
          nodeZ.node.parent = node_child;
          node_child.children.push(nodeZ_two.node);
          nodeZ_two.node.parent = node_child;

          var old_link_obj = this.create_line(this.node_arr[obj.nodeA.id].node, node_child);
          old_link_obj.from = obj.nodeA.id;
          old_link_obj.to = node_child.id;
          this.scene.add(old_link_obj);
          this.scene.remove(obj);

          this.scene.remove(to_node1);

          var link = this.create_line(node_child, obj.nodeZ);
          var line_obj = {data: {to: obj.nodeZ.id, from: node_child.id}, link: link};
          link.to = line_obj.data.to;
          link.from = line_obj.data.from;
          delete this.line_arr[obj.nodeZ.id];
          this.line_arr[link.to] = line_obj;
          this.scene.add(link);

          var link = this.create_line(node_child, nodeZ_two.node);
          var line_obj = {data: {to: nodeZ_two.node.id, from: node_child.id}, link: link};
          link.to = line_obj.data.to;
          link.from = line_obj.data.from;
          delete this.line_arr[nodeZ_two.node.id];
          this.line_arr[link.to] = line_obj;
          this.scene.add(link);
          this.doLayout2();
        }
        _this.mouse_obj = undefined;

        return;
      },
      /**
       * 在节点上右键
       * node 节点
       * @param {object}node
       */
      node_contextmenu(node) {
        var _this = this;
        //节点右键
        node.addEventListener('mouseup', function (event) {
          _this.currentNode = this;
          if (event.button == 2) {// 右键
            // 当前位置弹出菜单（div）
            if (!_this.node_remove_list || _this.node_remove_list.length === 0)
              _this.node_remove_list = _this.scene.selectedElements;

            _this.contextmenu = {
              top: event.pageY,
              left: event.pageX,
              show: true
            };
          }
        });
      },
      /**
       * 删除节点 点击删除按钮 还未点击确定
       * */
      node_remove_star() {
        var _this = this;
        _this.Shield = true;
        _this.modal_confirm = true;
        _this.modal_mouse_obj.left = document.body.offsetWidth / 2 - 250;
        _this.modal_mouse_obj.top = 200;
        _this.contextmenu.show = false;
        _this.mark = true;
        var is_child = false;
        if (_this.node_remove_list[0].children && _this.node_remove_list[0].children.length > 0) {
          if (Enumerable.from(_this.node_remove_list[0].children).where("$.id>0").toArray().length > 0)
            is_child = true;
        }
        _this.remove_node_is_children = is_child;
        _this.node_remove_fun = function () {
          var nodes_list = {};
          var nodes_arr = _this.node_remove_list;
          for (var i = 0; i < nodes_arr.length; i++) {
            var node = nodes_arr[i];
            nodes_list[node.id] = node;
          }
          var id = nodes_arr[0].id;
          if (!nodes_list[id])
            nodes_list[id] = _this.node_arr[id].node;
          _this.node_remove_batch(nodes_list, function (txt) {
            _this.remove_node_mark("no_set_node_style");
            _this.common_title_add(txt || "删除设备成功", "default");
            _this.node_remove_list = [];
          });
        }
        _this.node_select_down = true;
        setTimeout(function () {
          _this.Shield = false;
        }, 500);
      },
      /**
       * 删除选中节点节点
       */
      node_remove(nodes_arr) {
        var nodes_arr = this.node_remove_list;
        var _this = this;
        this.node_remove_batch(nodes_arr, function (txt) {
          _this.currentNode = null;
          _this.contextmenu = {show: false};
          _this.nobulle = undefined;
          _this.remove_node_mark("no_set_node_style");
          _this.common_title_add(txt || "删除设备成功", "default");
        });

      },
      /**
       * 删除节点跟当前节点所有子节点
       * node 要删除的节点
       * @param {object}node
       */
      node_remove_children(nodeParent) {
        var _this = this;

        function del_method(node) {
          for (var i = 0; i < node.length; i++) {
            var source = node[i];
            var sel_node = Enumerable.from(_this.scene.selectedElements).where("$.id=='" + source.id + "'").toArray()[0];
            if (sel_node) {
              _this.scene.selectedElements.splice(_this.scene.selectedElements.indexOf(sel_node), 1);
            }

            var area = _this.container[source.area];
            if (area) {
              var area_child = area.childs;
              var area_child_node = Enumerable.from(area_child).where("$.id=='" + source.id + "'").toArray()[0];
              if (area_child_node)
                area_child.splice(area_child.indexOf(area_child_node), 1);
              if (area.childs.length === 0)
                area.visible = false;
            }

            if (source.children && source.children.length > 0) {
              del_method(source.children);
            }
            _this.scene.remove(source);

            delete _this.node_arr[source.id];
            delete _this.line_arr[source.id];


          }
        }

        if (nodeParent)
          del_method([nodeParent]);

      },
      deleteNodes(nodeIds, cb) {
        axios({
          url: this.server_url + "deleteNodes",
          method: 'get',
          params: {
            nodeIds: nodeIds
          }
        }).then(function (data) {
          data = data.data;
          if (data.resultCode == "0") {
            cb(data);
          }
        });
        // axios.get(this.server_url + "deleteNodes",{nodeIds:nodeIds}).then();
      },
      /**
       * 批量删除选中节点
       */
      node_remove_batch(node_arr, cb) {
        var _this = this;
        var nodeIds = "";
        for (var one in node_arr) {
          nodeIds += node_arr[one].sourceId + ",";
        }
        nodeIds = nodeIds.substring(0, nodeIds.length - 1);
        this.deleteNodes(nodeIds, function (data) {
          var txt = "";
          if (data.resultCont == 1) {
            for (var i in node_arr) {
              if (node_arr[i].elementType != "container") {
                _this.node_remove_children(node_arr[i]);
              }
            }
          } else
            txt = data.resultMsg;
          cb(txt);
        });
        this.node_select_dom = {show: false};
      },
      /**
       * 查询节点详细信息
       * */
      node_get_info(nodeId, cb) {
        axios.get(this.server_url + 'getNodeDetails', {params: {nodeId: nodeId}}).then(function (data) {
          data = data.data;
          if (data.resultCode == "0")
            cb(data);
        });
      },
      /**
       * 打开编辑节点模态框
       */
      node_edit_open() {
        this.modal3 = true;
        this.contextmenu = {show: false};
        var _this = this;
        var nodeId = this.currentNode.id;
        var sourceId = this.currentNode.sourceId;
        _this.node_obj = JSON.parse(JSON.stringify(this.node_arr[nodeId].data));
        var img = this.node_get_nodeType_url(this.node_obj.nodeType);
        this.node_obj.img = img[1];

        this.modal_mouse_obj.left = document.body.offsetWidth / 2 - 250;
        this.modal_mouse_obj.top = 200;
        this.node_get_info(sourceId, function (data) {
          for (var one in data) {
            _this.node_obj[one] = data[one];
          }

          for (var one in data.nodeAttr) {
            _this.node_obj[one] = data.nodeAttr[one];
          }
          _this.node_obj.nodeRemark = data.nodeAttrInfo.memo;
          _this.node_obj.area = _this.node_obj.busnId;
        });
        this.mark = true;
        this.modal_title = "设备信息-" + this.node_obj.name;
        this.remove_node_mark("reset_node_source");
        //this.common_title_add("设备信息已更新", "default")
      },
      /**
       * 修改节点状态
       *  */
      node_change_status(ok) {
        this.$set(this.node_obj, "status", ok);
      },
      /**
       * 修改节点状态(提交到数据库)
       *  */
      node_edit_status() {
        this.node_arr[this.node_obj.id].data.status = this.node_obj.status;
        this.mark = false;
        this.currentNode = null;
        this.node_obj = {};
        this.modal1 = false;
      },
      /**
       * 根据设备类型返回图片地址
       * */
      node_get_nodeType_url(nodeType) {
        switch (nodeType) {
          case "JH":
            return ["/static/img/node_type/icon-swichboard.png", "/static/img/node_type/icon-swichboard@2x.png", '交换机'];
            break;
          case "LY":
            return ["/static/img/node_type/icon-wifi.png", "/static/img/node_type/icon-wifi@2x.png", '路由器'];
            break;
          case "FQ":
            return ["/static/img/node_type/icon-firewall.png", "/static/img/node_type/icon-firewall@2x.png", '防火墙'];
            break;
          case "PC":
            return ["/static/img/node_type/icon-pc.png", "/static/img/node_type/icon-pc@2x.png", '电脑'];
            break;
          case "MB":
            return ["/static/img/node_type/icon-mobile.png", "/static/img/node_type/icon-mobile@2x.png", '手机'];
            break;
          case "FW-DB":
            return ["/static/img/node_type/icon-database.png", "/static/img/node_type/icon-database@2x.png", '数据库'];
            break;
          case "FW-WEB":
            return ["/static/img/node_type/icon-webdata.png", "/static/img/node_type/icon-webdata@2x.png", '网络数据'];
            break;
          case "FW-WJ":
            return ["/static/img/node_type/icon-filedata.png", "/static/img/node_type/icon-filedata@2x.png", '文件数据'];
            break;
          case "FW-MAIL":
            return ["/static/img/node_type/icon-emaildata.png", "/static/img/node_type/icon-emaildata@2x.png", '邮件数据'];
            break;
          case "AQ":
            return ["/static/img/node_type/icon-safadevice.png", "/static/img/node_type/icon-safadevice@2x.png", '安全设备'];
            break;
          case "TY":
            return ["/static/img/node_type/add_node.png", "/static/img/node_type/add_node@2x.png", '通用设备'];
            break;
          case "HJ":
            return ["/static/img/node_type/icon-coreex.png", "/static/img/node_type/icon-coreex@2x.png", '核心交换机'];
            break;
          case "BJB":
            return ["/static/img/node_type/icon-laptop.png", "/static/img/node_type/icon-laptop@2x.png", '笔记本'];
            break;
          case "FW":
            return ["/static/img/node_type/icon-server.png", "/static/img/node_type/icon-server@2x.png", '服务器'];
            break;
          default :
            return ["/static/img/node_type/add_node.png", "/static/img/node_type/add_node@2x.png", '其他设备'];
            break;
        }
      },
      /**
       * 编辑节点实际内容
       */
      node_edit() {
        var _this = this;
        var params = {
          nodeId: this.currentNode.sourceId,
          nodeName: this.node_obj.name,
          nodeType: this.node_obj.nodeType,
          busnId: this.node_obj.area,
          nodeRemark: this.node_obj.nodeRemark,
          ip: this.node_obj.nodeIp
        };

        //axios.get(this.server_url + 'updateNode', {params: params}).then(function (data) {
          var data = {
            data:{
              resultCode:0,
              resultCont:1
            }
          };
          data = data.data;
          if (data.resultCode == "0")
            if (data.resultCont == 1) {
              _this.currentNode.text = params.nodeName;
              var node_img = _this.node_get_nodeType_url(params.nodeType);
              _this.currentNode.setImage(node_img[1]);
              _this.node_obj.img = node_img[0];

              //没修改之前的节点
              var old_node_obj = JSON.parse(JSON.stringify(_this.node_arr[params.nodeId].data));
              //修改节点
              for (var one in _this.node_obj) {
                _this.node_arr[params.nodeId].data[one] = _this.node_obj[one];
              }

              _this.node_arr[params.nodeId].node['area'] = params.busnId;
              //判断当前是否选择了分组
              if (!_this.container[params.busnId])
                _this.add_group();
              if (params.busnId && _this.container[params.busnId]) {
                //删除节点原来的分组
                if (old_node_obj.area && _this.container[old_node_obj.area]) {
                  _this.container[old_node_obj.area].remove(_this.currentNode);
                }
                //为节点重新加入分组
                _this.container[params.busnId].add(_this.currentNode);
              }
              _this.group_hide_show();
              //this.currentNode = null;
              _this.node_obj = {};
              _this.modal3 = false;
              _this.mark = false;
              _this.common_title_add("设备信息已更新", "default")
            }
        //});


      },
      /**
       * 上传图片
       * */
      uploadNodePic(nodeId, file, cb) {
        var formdata = new FormData();
        formdata.append('file', file);
        formdata.append('action', 'test');
        axios({
          url: this.server_url + "uploadNodePic?nodeId=" + nodeId,
          method: 'post',
          data: formdata,
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then((data) => {
          data = data.data;
          if (data.resultCode == "0")
            cb(data);
        });
      },
      /**
       * 打开上传图片选择文件窗口
       */
      open_node_add_upload() {
        if (this.modal4)
          $('input#fileUpload4').trigger('click');
        else
          $('input#fileUpload').trigger('click');
      },
      /**
       * 新增节点使打开选择文件窗口
       * e 文件对象
       * @param {event}e
       */
      onFileChange_Upload(e) {
        var _this = this;
        var files = e.target.files || e.dataTransfer.files
        if (!files.length) return
        this.modal_node_add.file = files[0];
        this.node_add_img_src = files[0].name;
      },
      /**
       * 开始上传图片
       */
      node_upload_img(node,cb) {
        var _this = this;
        this.uploadNodePic(node.sourceId, node.file, function (data) {
          var id = _this.currentNode.id;
          var url = data.resultImgUrl;
          _this.node_arr[id].data.img = url;
          _this.node_obj.img = url;
          _this.currentNode.setImage(url);
          if (_this.modal4) {
            _this.modal4 = false;
          } else {
            _this.currentNode = null;
            _this.modal2 = false;
            cb();
          }
          _this.mark = false;
        });

      },
      /**
       * 替换上传图片
       */
      node_change_img() {
        this.modal2 = true;
        this.node_add_img_src = "";
        this.contextmenu.show = false;//右键菜单
        this.remove_node_mark("reset_node_source");
        this.modal_mouse_obj.left = document.body.offsetWidth / 2 - 250;
        this.modal_mouse_obj.top = 200;
      },
      /**
       * 分组显示隐藏
       * */
      group_hide_show() {
        for (var one in this.container) {
          var area = this.container[one];
          if (area.childs.length === 0 || this.View_Type !== "business")
            area.visible = false;
          else
            area.visible = true;
        }
      },
      /**
       * 分组样式
       * */
      draw_group(context, group) {
        var _this = this;

        //开始画一个矩形
        function draw_jx(jx_type) {
          var rect = Rect(0, 0, group.width, group.height);
          context.lineWidth = 2;

          var strokeStyle = "#506e91";
          var fillStyle = "#26384c";
          drawRoundedRect(rect, 4, context, strokeStyle, fillStyle, true);
        }

        function Rect(x, y, w, h) {
          return {x: x, y: y, width: w, height: h};
        }

        //画一个圆角
        var Point = function (x, y) {
          return {x: x, y: y};
        };

        function drawRoundedRect(rect, r, ctx, strokeStyle, fillStyle, borderStyle) {
          var ptA = Point(rect.x + r, rect.y);
          var ptB = Point(rect.x + rect.width, rect.y);
          var ptC = Point(rect.x + rect.width, rect.y + rect.height);
          var ptD = Point(rect.x, rect.y + rect.height);
          var ptE = Point(rect.x, rect.y);
          ctx.beginPath();
          if (borderStyle) {
            ctx.setLineDash([5, 10]);
            ctx.lineWidth = 3;
          } else
            ctx.setLineDash([0, 0]);


          ctx.moveTo(ptA.x, ptA.y);
          ctx.arcTo(ptB.x, ptB.y, ptC.x, ptC.y, r);
          ctx.arcTo(ptC.x, ptC.y, ptD.x, ptD.y, r);
          ctx.arcTo(ptD.x, ptD.y, ptE.x, ptE.y, r);
          ctx.arcTo(ptE.x, ptE.y, ptA.x, ptA.y, r);
          ctx.fillStyle = fillStyle || "#d1e5ff";   //选择油漆桶的颜色
          ctx.strokeStyle = strokeStyle || "#d1e5ff";
          ctx.fill();                 //确定填充
          ctx.stroke();
        }

        var j_x = 0;
        var j_y = 0;

        var childs = group.childs;
        if (childs.length == 0) return;
        var star_x = 0;
        var end_x = 0;
        var end_y = group.height;

        function draw_star() {
          //先画一个举行
          draw_jx();
          //然后画一个文字背景
          var t_x = star_x;
          var t_y = end_y + 5;
          var str = group.text;
          var lineWidth = 0;
          var canvasWidth = group.width;//计算canvas的宽度
          var lastSubStrIndex = 0; //每次开始截取的字符串的索引
          var msg = "";
          if (context.measureText(group.text).width > canvasWidth) {
            for (let i = 0; i < str.length; i++) {
              lineWidth += context.measureText(str[i]).width;
              if (lineWidth > canvasWidth) {
                msg += str.substring(lastSubStrIndex, i);
                lastSubStrIndex = i + 1;
              }
            }
            if (msg != group.text)
              msg += "...";
          } else
            msg = group.text;


          var rect = Rect(star_x, end_y + 10, context.measureText(group.text).width + 22, 27);

          var strokeStyle = "#506e91";
          var fillStyle = "#506e91";
          drawRoundedRect(rect, 4, context, strokeStyle, fillStyle);

          //画一段文字
          context.font = "12px 微软雅黑";
          //设置字体填充颜色
          context.fillStyle = "#232f3d";
          context.textAlign = "left";
          context.fillText(msg, 6, end_y + 28);
        }

        draw_star();


      },
      /**
       * 添加分组
       */
      add_group() {
        var _this = this;
        // 不指定布局的时候，容器的布局为自动(容器边界随元素变化）
        var count = 0;
        for (var one in this.container) {
          count++;
          break;
        }
        if (count > 0)
          return;
        for (var i = 0; i < this.area_list.length; i++) {
          var area = this.area_list[i];
          if (this.container[area.busnId]) {
            continue;
          }
          var container = new JTopo.Container(area.busnName);
          container.textPosition = config.layout.group.textPosition || 'Top_Right';
          container.fontColor = config.layout.group.fontColor || '100,255,0';//自提颜色
          container.font = config.layout.group.font || '20px 微软雅黑';
          container.borderColor = config.layout.group.borderColor || '80,110,145';
          container.borderRadius = config.layout.group.borderRadius || 10; // 圆角
          container.visible = false;
          container.strokeColor = "249,210,56";
          container.shadow = false;
          container.alpha = config.layout.group.alpha || 1;
          container.fillColor = config.layout.group.fillColor || "24,78,78";
          //container.paint=function(context){
          //   _this.draw_group(context,this);
          // }
          this.scene.add(container);
          this.container[area.busnId] = container;
        }
      },
      /**
       * 设置节点样式
       * @params {object}node
       * */
      set_node_style(node, type) {
        var _this = this;
        type = type || "selected";
        if (!_this.node_arr[node.id]) return;
        var node_data = _this.node_arr[node.id].data;
        node.mouse_option = type;
        switch (type) {
          case "hover":
            node.borderWidth = 2;
            node.borderColor = "255,61,61";
            node.borderRadius = 5; // 圆角
            node.alpha = 0.9;
            node.mouse_type = "hover";
            break;
          case "focus":
            node.borderWidth = 2;
            node.borderColor = "255,61,61";
            node.borderRadius = 5; // 圆角
            node.alpha = 0.9;
            node.show_type = "focus";
            break
          case "selected":
            node.borderWidth = 2;
            node.borderColor = "255,61,61";
            node.borderRadius = 5; // 圆角
            node.alpha = 0.9;
            node.show_type = "selected";
            break
          case "disabled":
            node.borderWidth = 0;
            node.alpha = 0.3;
            node.show_type = "disabled";
            break;
          case "default":
            node.borderWidth = 0;
            node.alpha = 1;
            node.show_type = "default";
            node.mouse_type = "";
            break;
        }
      },
      /**
       * 显示/隐藏节点
       * @param filter
       * @param visabled
       */
      node_display(filter, visabled, parentNode) {
        var _this = this;
        var filter_txt = "";
        this.tree_filter = this.tree_filter || {};
        for (var i = 0; i < filter.length; i++) {
          var item = filter[i];

          if (!visabled)
            delete this.tree_filter[item.filterId];
          else if (!this.tree_filter[item.filterId])
            this.tree_filter[item.filterId] = item;
        }

        for (var i in this.tree_filter) {
          filter_txt += this.tree_filter[i].conditionName + "=" + this.tree_filter[i].conditionValue + "|";
        }
        filter_txt = filter_txt.substring(0, filter_txt.length - 1);
        _this.Update_jtop("", filter_txt);
        return;
        var yes_count = 0;
        this.tree_filter = this.tree_filter || {};
        for (var i = 0; i < filter.length; i++) {
          var item = filter[i];
          if (this.tree_filter[item.filterId])
            delete this.tree_filter[item.filterId];
          else
            this.tree_filter[item.filterId] = item;
        }
        if (parentNode) {
          var item = {};
          for (var one in parentNode) {
            if (one != 'children')
              item[one] = parentNode[one];
          }
          if (this.tree_filter[item.filterId])
            delete this.tree_filter[item.filterId];
          else
            this.tree_filter[item.filterId] = item;
        }
        var filter_txt = "";
        var query_node = function () {
          //遍历加载节点
         // axios.get(_this.server_url + 'getNetworkTopology?filter=' + filter_txt, {}).then(function (data) {
            //data = data.data;
            var data = [];
            console.log(data)
            if (data.resultCode == "0") {
              for (var one in _this.node_query_list) {
                var e = _this.node_query_list[one];

                if (e.remove_node)
                  e.remove_node.visible = false;
                _this.set_node_style(e, "disabled");
              }
              var nodeList = data.nodeList;
              yes_count = nodeList.length;
              _this.node_query_list = {};
              for (var i = 0; i < yes_count; i++) {
                var item = nodeList[i];
                var e = _this.node_arr[item.nodeId].node;
                e.is_selected = true;
                _this.node_query_list[e.id] = e;
                if (e.remove_node)
                  e.remove_node.visible = false;
                _this.set_node_style(e, visabled ? "selected" : "disabled");
              }
              _this.common_title_add("共有 " + yes_count + " 台符合条件的设备", 'node_query', "no_close");
            } else
              _this.common_title_add("共有 " + yes_count + " 台符合条件的设备", 'node_query', "no_close");
         // });
        }
        for (var i in this.tree_filter) {
          filter_txt += this.tree_filter[i].conditionName + "=" + this.tree_filter[i].conditionValue + "|";
        }
        filter_txt = filter_txt.substring(0, filter_txt.length - 1);
        query_node();
      },
      /**
       * 清空输入条件
       * */
      clear_keyWord(type, ev) {
        switch (type) {
          case "global":
            this.txtKeyWord = "";
            this.node_Search();
            break;
          case "filterTxt":
            this.filterTxt = "";
            break;
        }
        ev.target.parentNode.className = ev.target.parentNode.className.replace(/ focus/g, "");

      },
      /**
       * 在搜索节点上回车
       * ev 文本框对象
       * @param {event}ev
       */
      node_search_keyDown(ev) {
        if (ev.keyCode === 13) {
          this.node_Search();
        }
      },
      /**
       * 查找节点
       */
      node_Search() {
        var _this = this;
        var yes_count = 0;
        var text = this.txtKeyWord.trim();
        //var nodes = stage.find('node[text="'+text+'"]');
        var scene = this.scene;
        var nodes = scene.childs.filter(function (e) {
          return e instanceof JTopo.Node;
        });

        var nodes_yes = nodes.filter(function (e) {
          if (e.remove_node)
            e.remove_node.visible = false;
          if (e.text == null) return false;
          return e.text.indexOf(text) != -1;
        });

        if (!text) {
          for (var one in _this.node_arr) {
            var e = _this.node_arr[one].node;
            if (e.remove_node)
              e.remove_node.visible = false;
            delete e.is_selected;

            _this.set_node_style(e, "default");
          }
          _this.stage.setCenter(document.body.offsetWidth/2, (document.body.offsetHeight-_this.header_height)/2);
          this.common_title_list = [];
          return;
        }
        for (var one in _this.node_arr) {
          var e = _this.node_arr[one].node;
          if (e.remove_node)
            e.remove_node.visible = false;
          e.is_selected = true;
          _this.set_node_style(e, "disabled");
        }
        var nodeList = nodes_yes;
        yes_count = nodeList.length;
        _this.node_query_list = {};
        for (var i = 0; i < yes_count; i++) {
          var item = nodeList[i];
          var e = _this.node_arr[item.id].node;
          e.is_selected = true;
          _this.node_query_list[e.id] = e;
          if (e.remove_node)
            e.remove_node.visible = false;
          _this.set_node_style(e, "focus");
        }
        var node = nodeList;
        _this.common_title_add("共有 " + yes_count + " 台符合条件的设备", 'node_query', "no_close",node);
        if(yes_count > 0)
          _this.stage.setCenter(nodeList[0].x, nodeList[0].y+_this.header_height);
        else
          _this.stage.setCenter(document.body.offsetWidth/2, (document.body.offsetHeight-_this.header_height)/2);
      },
      /**
       * 节点选择样式
       */
      node_select_type() {
        this.Stage_Mode = !this.Stage_Mode;
        this.stage.mode = this.Stage_Mode ? "select" : "normal";
      },
      filter_list_init(parent, node_list) {
        for (var one in node_list) {
          var node = node_list[one];
          if (parent)
            node.parent = parent;
          if (node.children)
            this.filter_list_init(node, node.children);
        }
      },
      changeNodes(nodePid, nodeIds, cb) {
        axios.get(this.server_url + "changeNodes", {
          params: {
            nodePid: nodePid,
            nodeIds: nodeIds
          }
        }).then(function (data) {
          data = data.data;
          if (data.resultCode == "0")
            cb(data);
        });
      },
      /**
       * 内部节点修改层级
       * childrens 子节点
       * parent 父节点
       * @param {object}childrens
       * @param {object}parent
       */
      node_inside_update(childrens, parent) {
        var _this = this;
        _this.node_drag = true;
        var change_node = function () {
          for (var i = 0; i < childrens.length; i++) {
            var item = _this.node_arr[childrens[i].id];
            var id = item.data.id;
            var old_line = _this.line_arr[id];//线上原来的子节点

            if (item.node.children) {
              var is_parent;

              function query_parent(id, children) {
                if (Enumerable.from(children).where("$.id==" + id).toArray().length > 0) {
                  is_parent = true;
                  return;
                } else if (children && children.length) {
                  for (var i = 0; i < children.length; i++) {
                    var node = children[i];
                    if(_this.node_arr[node.id])
                      query_parent(id, _this.node_arr[node.id].node.children);
                  }
                }
              }

              query_parent(parent.id, _this.node_arr[item.node.id].node.children)
              if (is_parent)
                continue;
            }
            var line_item = {to: id, from: parent.id};
            var old_link_obj = _this.create_line(parent, item.node);
            old_link_obj.to = line_item.to;
            old_link_obj.from = line_item.from;
            _this.scene.add(old_link_obj);
            if (old_line) {
              _this.scene.remove(old_line.link);
            }
            _this.line_arr[id] = {data: line_item, link: old_link_obj};
            if (item.node.parent_id) {
              if (_this.node_arr[item.node.parent_id]) {
                var parent_child = _this.node_arr[item.node.parent_id].node.children;
                if (parent_child && parent_child.length > 0) {
                  var old_children = Enumerable.from(parent_child).where("$.id==" + item.node.id).toArray()[0];
                  if (old_children) {
                    parent_child.splice(parent_child.indexOf(old_children), 1)
                  }
                }
              }
              parent.children = parent.children || [];
              parent.children.push(item.node);
            } else {
              parent.children = parent.children || [];
              parent.children.push(item.node);
            }
            item.node.parent_id = parent.id;
            item.data.parent_id = parent.id;
          }
        }
        //this.changeNodes(parent.sourceId, (Enumerable.from(childrens).select("$.sourceId").toArray()).join(','), function (data) {
          var data = {resultCont:1};
          if (data.resultCont == 1) {
            change_node();
            _this.doLayout2();
          }
        //});
        return;

      },
      /**
       * 拖动节点在canvas上滑动时
       * ev 鼠标对象
       * @param {event}ev
       */
      canvas_mousemove(ev) {
        //拖动节点移动时显示出要拖动的节点
        if (this.node_mouse_dom.down === true) {
          this.node_mouse_dom.show = true;
          if (this.node_mouse_dom.node && this.node_mousedown_point && !(this.node_mousedown_point.x === ev.x && this.node_mousedown_point.y === ev.y)) {
            var x = ev.x - this.node_mouse_dom.node.width / 2;
            var y = ev.y - this.node_mouse_dom.node.height / 2;
            //判断当前鼠标落下的位置（为了分辨鼠标是点击节点事件还是拖动事件）
            this.node_mouse_dom.node.visible = true;
            this.node_mouse_dom.node.setLocation(x, y);
          }
        }
      },
      /**
       * 拖动着节点在canvas上时
       * ev 鼠标对象
       * @param {event}ev
       */
      canvas_mouseup(ev) {
        if (ev.button === 2) return;
        var _this = this;
        if (!this.node_mouse_dom.node || !_this.node_inside_change.node_click || ( ev.x == _this.node_inside_change.node_click.x && ev.y == _this.node_inside_change.node_click.y)) {
          if (this.node_mouse_dom.node) {
            this.scene.remove(this.node_mouse_dom.node);
          }
          delete this.node_mouse_dom.node;
          return;
        }
        if (this.node_inside_change.down) {
          setTimeout(function () {
            if (_this.scene.selectedElements.length == 1 && _this.scene.selectedElements[0].elementType === "container")
              return;
            if (!_this.node_mouse_dom.change_node) {
              var new_x = _this.node_mouse_dom.node.x - _this.node_inside_change.node.x;
              var new_y = _this.node_mouse_dom.node.y - _this.node_inside_change.node.y;
              for (var i = 0; i < _this.scene.selectedElements.length; i++) {
                _this.scene.selectedElements[i].setLocation(_this.node_mouse_dom.node.x, _this.node_mouse_dom.node.y);
                var node_i = _this.scene.selectedElements[i];
                var node_remove = Enumerable.from(_this.node_select_list).where("$.id=='" + node_i.id + "'").toArray()[0];
                if (node_remove) {
                  node_remove.visible = true;
                  node_remove.setLocation(node_i.x + node_i.width - 10, node_i.y - 8);
                }
              }

              function dg(childrens, parent_node) {
                for (var i = 0; i < childrens.length; i++) {
                  var node = childrens[i];
                  node.setLocation(node.x + new_x, parent_node.y + _this.node_size.tree_height);
                  if (node.children && node.children.length > 0)
                    dg(node.children, node);
                }
              }

              if (_this.scene.selectedElements.length > 0 && _this.node_inside_change.node.children)
                dg(_this.node_inside_change.node.children, _this.node_inside_change.node);

              JTopo.layout.layoutNode(_this.scene, _this.node_inside_change.node, true);
            }
          }, 50);
          this.scene.remove(this.node_mouse_dom.node);
          var query_count = 0;
          this.scene.findElements(function (e) {
            if (e.id === "drag_node_id") {
              query_count++;
              return;
            }
          });
          setTimeout(function () {
            _this.render_layout();
          }, 50);
          if (query_count === 0)
            this.node_mouse_dom.down_time = new Date().getTime();
        }
      },
      /**
       * 添加链接线
       * from_node 连接线A点
       * to_node 连接线B点
       * @param {object}from_node
       * @param {object}to_node
       * @returns {object}
       */
      create_line(from_node, to_node) {
        var link = new JTopo.Link(from_node, to_node); // 增加连线
        link.lineWidth = this.node_size.lineWidth; // 线宽
        var _this = this;
        if(!(from_node.id<=0)) {
          var draw_line = function (context, link) {
            var nodeA = link.nodeA;
            var nodeZ = link.nodeZ;

            function draw(ctx, lineWidth) {
              ctx.lineWidth = lineWidth || _this.node_size.lineWidth;
              ctx.beginPath();

              if (nodeA.children && nodeA.children.length > 0) {
                var x = nodeA.x + nodeA.width / 2;
                var y = nodeA.y + nodeA.height;
                ctx.moveTo(x, y)
                ctx.lineTo(x, y + 30);
              }

              var s_x = nodeZ.x + nodeZ.width / 2;
              var s_y = nodeA.y + nodeA.height + 30;
              var e_x = nodeA.x + nodeA.width / 2;
              var e_y = nodeZ.y;

              var roundRect = function (number, r) {
                ctx.moveTo(s_x, s_y);           // 创建开始点
                ctx.lineTo(e_x, s_y);          // 创建水平线
                ctx.arcTo(s_x - number, s_y, s_x, s_y + 190, r); // 创建弧
                ctx.lineTo(s_x - number, e_y);         // 创建垂直线
                ctx.stroke();                // 进行绘制
              }
              //给左右两个节点的线添加圆角
              if (nodeA.children && nodeA.children.length > 1) {
                if (nodeA.children[0].id == nodeZ.id)
                  roundRect(5, 5);
                else if (nodeA.children[nodeA.children.length - 1].id == nodeZ.id)
                  roundRect(-5, 5);
                else {
                  ctx.moveTo(s_x, s_y)
                  ctx.lineTo(s_x, e_y);
                  ctx.moveTo(s_x, s_y)
                  ctx.lineTo(e_x, s_y);
                }
              } else {
                ctx.moveTo(s_x, s_y)
                ctx.lineTo(s_x, e_y);
                ctx.moveTo(s_x, s_y)
                ctx.lineTo(e_x, s_y);
              }
              ctx.stroke();
            }

            if (link.is_selected && link.new_line) {
              link.new_line.paint = function (ctx) {
                ctx.strokeStyle = _this.node_size.drag_lineColor;
                draw(ctx, _this.node_size.drag_lineWidth);
              }
            } else {
              context.strokeStyle = _this.node_size.lineColor;
              draw(context);
            }

          }
          link.paint = function (context) {
            draw_line(context, this);
          };
        }
        return link;
      },
      node_drag_star: function (nodeFrom) {
        var _this = this;
        nodeFrom.mousedown(function (ev) {
          if (ev.button === 2 || this.show_type == "disabled") {
            _this.node_inside_change.node_click = undefined;
            return;
          }

          var node = this;
          var x_star = node.x + node.width - 15;
          var x_end = node.x + node.width + 15;
          var y_star = node.y - 15;
          var y_end = node.y + 15;
          if (ev.x > x_star && ev.x < x_end && ev.y > y_star && ev.y < y_end) {
            _this.Shield = true;
            _this.modal_confirm = true;
            _this.modal_mouse_obj.left = document.body.offsetWidth / 2 - 250;
            _this.modal_mouse_obj.top = 200;
            _this.contextmenu.show = false;
            _this.mark = true;
            var id = this.id;
            var nodes_arr = _this.scene.selectedElements;
            var childs = Enumerable.from(nodes_arr).where("$.children&&$.children.length>0").toArray();
            var is_child = false;
            if (childs.length > 0) {
              for (var i = 0; i < childs.length; i++) {
                if (Enumerable.from(childs[i].children).where("$.id>0").toArray().length > 0)
                  is_child = true;
              }
            }
            _this.remove_node_is_children = is_child;
            _this.node_remove_fun = function () {
              var nodes_list = {};
              for (var i = 0; i < nodes_arr.length; i++) {
                var node = nodes_arr[i];
                nodes_list[node.id] = node;
              }
              if (!nodes_list[id])
                nodes_list[id] = _this.node_arr[id].node;
              _this.node_remove_batch(nodes_list, function (txt) {
                _this.remove_node_mark("no_set_node_style");
                _this.common_title_add(txt || "删除设备成功", "default");
              });
            }
            _this.node_select_down = true;
            setTimeout(function () {
              _this.Shield = false;
            }, 500);
            return;
          }


          //当前鼠标落下的位置（为了分辨鼠标是点击节点事件还是拖动事件）
          _this.node_mousedown_point = {x: ev.x, y: ev.y};
          if (ev.ctrlKey) {
            _this.node_mousedown_list = _this.node_mousedown_list || {};
            _this.node_mousedown_list[this.id] = this;
          } else {
            _this.node_mousedown_list = {};
            _this.node_mousedown_list[this.id] = this;
            _this.remove_node_mark("reset_node_source");
          }
          setTimeout(function () {
            _this.add_node_mark(null, ev);
          }, 50);
          _this.node_inside_change.down_time = new Date().getTime();
          _this.node_inside_change.down = true;
          _this.node_mouse_dom.down = true;
          _this.node_mouse_dom.change_node = false;
          this.selected = true;
          this.dragable = false;
          _this.node_inside_change.node = this;//要拖动的节点
          //生成一个可拖动的节点，当拖动完成后消失
          var node_obj = _this.node_mouse_dom.node || new JTopo.Node();
          node_obj.id = 'drag_node_id';
          node_obj.setLocation(this.x, this.y);
          node_obj.layout = {type: 'tree', width: _this.node_size.tree_width, height: _this.node_size.tree_height};
          if (this.image)
            node_obj.setImage(this.image.currentSrc);

          node_obj.zIndex = 99999;
          node_obj.text = this.text;
          node_obj.alpha = 0.6;
          node_obj.visible = false;
          node_obj.setSize(_this.node_size.width, _this.node_size.height);
          _this.node_mouse_dom.node = node_obj;
          _this.node_mouse_dom.node_source = this;
          _this.scene.add(node_obj);
          node_obj.paint = function (context) {
            _this.draw_node('add_node', _this.node_arr[node.id].data, context);
          }

          _this.mouse_down_node = this.id;
          _this.node_inside_change.node_click = {x: ev.x, y: ev.y};
        });
        //新增节点 鼠标落到目标节点
        nodeFrom.mouseover(function (ev) {
          return;
          if (this.show_type == "disabled") return;
          var is_drag_node;
          if (_this.node_mouse_dom.down_time) {
            if (new Date().getTime() - _this.node_mouse_dom.down_time <= 100)
              is_drag_node = true;
          }
          if (is_drag_node) {
            if (_this.scene.selectedElements.length > 0 && _this.scene.selectedElements[0].id != this.id && !this.node_select_down) {
              _this.node_mouse_dom.change_node = true;
              _this.node_inside_update(_this.scene.selectedElements, this)
              _this.node_mousedown_list = {};
              _this.remove_node_mark("reset_node_source");
            }
            return;
          }
          _this.add_node(this);
          if ((_this.mouse_down_node == this.id && is_drag_node) || _this.mouse_down_node == "no_id") {
            _this.reset_layout(this);
          }
        });
        //节点右键
        _this.node_contextmenu(nodeFrom);
      },
      /**
       * 鼠标在鹰眼部分操作时
       * ev 鼠标对象
       * type down 鼠标落下  move 鼠标拖动 up 鼠标抬起
       * @param {event}ev
       * @param {String}type
       * @constructor
       */
      Hawkeye_Mouse(ev, type) {
        switch (type) {
          case "down":
            this.Hawkeye.down = true;
            break;
          case "move":
            if (!this.Hawkeye.down) return;

            //大图移动像素
            var st_g = this.stage.getBound();
            var width = st_g.left + st_g.right;
            var height = st_g.top + st_g.bottom;

            var Hawkeye_dom = document.querySelector(".Hawkeye_content .border");

            var left = width * (Math.abs(ev.movementX) / (Hawkeye_dom.offsetWidth) / this.scene.scaleX);
            var top = height * (Math.abs(ev.movementY) / (Hawkeye_dom.offsetHeight) / this.scene.scaleY);

            if (this.Hawkeye.border.x > this.Hawkeye.border.x + ev.movementX)
              this.scene.translateX = this.scene.translateX + left;
            else
              this.scene.translateX = this.scene.translateX - left;

            if (this.Hawkeye.border.y > this.Hawkeye.border.y + ev.movementY)
              this.scene.translateY = this.scene.translateY + top;
            else
              this.scene.translateY = this.scene.translateY - top;
            this.Hawkeye.border.x = this.Hawkeye.border.x + ev.movementX;
            this.Hawkeye.border.y = this.Hawkeye.border.y + ev.movementY;
            break;
          case "up":
            this.Hawkeye.down = false;
            break;
        }
      },
      /**
       * 加载业务视图
       * type add 添加分组 del 删除所有分组
       * @param {String}type
       * @constructor
       */
      Init_Business(type) {
        var _this = this;
        if (type == "add" && this.View_Type != "business") {
          this.View_Type = "business";
          //加载所有分组
          this.add_group();
          for (var one in this.node_arr) {
            var node = this.node_arr[one].node;
            var container = this.container[node.area];
            if (container) {
              container.add(node);
              //container.setLocation(container.childs[0].x, container.childs[0].y);
            }
          }
          this.group_hide_show();
        } else if (type == "del" && this.View_Type != "default") {
          this.View_Type = "default";
          for (var one in this.container) {
            this.container[one].visible = false;
          }
        }
      },
      add_other_node(){
        var _this = this;
        var size = 0;
        for(var i= 0; i<4; i++){
          var node = new JTopo.Node();
          node.shadow = false;
          node.visible = true;
          node.setSize(size, size);
          node.textPosition = "Middle_Center";
          var s = 2;
          var x =0;
          var y = 0;
          switch(i){
            case 0:
              x = 0;
              y = -size;
              break;
            case 1:
              x = 0;
              y = document.body.offsetHeight + size;
              break;
            case 2:
              x = document.body.offsetWidth;
              y = -size;
              break;
            case 3:
              x = document.body.offsetWidth;
              y = document.body.offsetHeight + size;
              break;
          }
          node.setLocation(x, y);
          node.fillColor = JTopo.util.randomColor();
          _this.scene.add(node);
        }
      },
      /**
       * 刷新 整个节点
       * @constructor
       */
      Update_jtop: function (type, filter_txt, groupId) {
        //this.Hawkeye.mouse_options.bl = false;
        //加载node
        var nodeList = [];
        var _this = this;
        _this.line_list = [];
        _this.node_query_list = {};
        //屏幕中间点位置
        var centerX = document.body.offsetWidth / 2;
        var centerY = document.body.offsetHeight / 2 - 250;
        _this.scene.clear();
        var level= 0;
        var nodecount = 0;
        function init_nodes(nodeTree, parent_id, x, y) {
          for (var i = 0; i < nodeTree.length; i++) {
            var item_source = nodeTree[i];
            var item = Enumerable.from(nodeList).where("$.nodeId=='" + item_source.nodeId+"'").toArray()[0];
            console.log(item,item_source.nodeId,nodeList)
            if (!item)
              continue;
            item.id = item.nodeId;
            item.area = item.busnId;
            item.name = item.nodeName;
            item.img = _this.node_get_nodeType_url(item.nodeType);
            if (item.img)
              item.img = item.img[0];
            else
              item.img = "";

            if (parent_id)
              item.parent_id = parent_id;
            nodecount++;
            var node_child = new JTopo.Node();
            _this.set_node_attribute(node_child, item, {x: x, y: y}, "init");
            node_child.setLocation(500,800);
            if (parent_id) {
              var line_item = {};
              line_item.from = parent_id;
              line_item.to = item.id;
              var link = _this.create_line(_this.node_arr[parent_id].node, node_child);
              link.to = line_item.to;
              link.from = line_item.from;
              _this.line_arr[line_item.to] = {data: line_item, link: link};
              _this.line_list.push(line_item);
              _this.scene.add(link);
            }
            if (item_source.items && item_source.items.length > 0) {
              init_nodes(item_source.items, item.nodeId, x, y);
              level ++;
            }
            _this.node_query_list[node_child.id] = node_child;
          }
        }


        var count = 0;
        this.node_arr = {};//重置节点集合
        this.line_arr = {};// 重置关系集合
        this.max_node_id = 1;//重置最大节点编号
        //清除jtop上所有元素
        this.scene.clear();
        this.container = {};
        this.View_Type = "default";
        //屏幕中间点位置
        var centerX = document.body.offsetWidth / 2;
        var centerY = document.body.offsetHeight / 2 - 250;
        //遍历加载节点
        var url = this.server_url + 'getNetworkTopology';
        if (filter_txt)
          url = url + "?filter=" + encodeURIComponent(filter_txt);
       // axios.get(url, {}).then(function (data) {
          //data = data.data;
          var data = {
            resultCode:0,
            nodeList:[
              {nodeId:1,nodeName:"交换机",nodeType:"JH"},
              {nodeId:2,nodeName:"路由器",nodeType:"LY"},
              {nodeId:3,nodeName:"防火墙",nodeType:"FQ"},
              {nodeId:4,nodeName:"电脑",nodeType:"PC"},
              {nodeId:5,nodeName:"手机",nodeType:"MB"},
              {nodeId:6,nodeName:"数据库",nodeType:"FW-DB"},
              {nodeId:7,nodeName:"文件数据",nodeType:"FW-WJ"},
              {nodeId:8,nodeName:"网络数据",nodeType:"FW-WEB"},
              {nodeId:9,nodeName:"邮件数据",nodeType:"FW-WJ"},
              {nodeId:10,nodeName:"电脑",nodeType:"FW_MAIL"},
              {nodeId:11,nodeName:"手机",nodeType:"MB"},
            ],
            nodeTree:[
              {
                nodeId:1,
                nodeName:"A",
                items:[
                  {
                    nodeId:2,
                    items:[
                      {
                        nodeId:4,
                        items:[
                          {
                            nodeId:6,
                            items:[]
                          },
                          {
                            nodeId:7,
                            items:[]
                          }
                        ]
                      },
                      {
                        nodeId:5,
                        items:[
                          {
                            nodeId:8,
                            items:[]
                          },
                          {
                            nodeId:9,
                            items:[]
                          },
                        ]
                      }
                    ]
                  },
                  {
                    nodeId:3,
                    items:[
                      {
                        nodeId:10,
                        items:[]
                      },
                      {
                        nodeId:11,
                        items:[]
                      },
                    ]
                  }
                ]
              }
              ]};
          if (data.resultCode == "0") {
            nodeList = data.nodeList;
            _this.dev_count = nodeList.length;
            var nodeTree = data.nodeTree;
            console.log(data.nodeTree)

            if (nodeList.length > 0) {
              if (data.nodeTree.length > 1) {
                //为没有子节点的父节点添加一个子节点，这样做是为了拜访布局，节点不被遮盖
                var item = {nodeId: -1, nodeName: "root"};
                nodeList.push(item);
                nodeTree = [{nodeId: item.nodeId, items: data.nodeTree}];

                //为没有子节点的父节点添加一个子节点，这样做是为了拜访布局，节点不被遮盖
                var count = -2;
                var surplus = [];

                function dg(node_list) {
                  for (var i = 0; i < node_list.length; i++) {
                    var item = node_list[i];
                    var source_node = Enumerable.from(nodeList).where("$.nodeId=='" + item.nodeId + "'").toArray()[0];
                    item.sourceId = item.nodeId;
                    item.nodeId = item.nodeId.toString().replace(/_/g, "");
                    if (source_node) {
                      source_node.sourceId = source_node.nodeId;
                      source_node.nodeId = source_node.nodeId.toString().replace(/_/g, "");
                    }
                    if (item.items.length > 0) {
                      dg(item.items);
                    }
                  }
                }

                dg(nodeTree);

                init_nodes(nodeTree, undefined, centerX, centerY);
                _this.scene.doLayout(JTopo.layout.TreeLayout('down', _this.node_size.tree_width, _this.node_size.tree_height));

                //删除最顶层节点和没有子节点的父节点下的手动添加的子节点
                _this.scene.remove(_this.node_arr[item.nodeId].node);
                delete _this.node_arr[item.nodeId];
                delete _this.node_query_list[item.nodeId];
                var node_item = Enumerable.from(nodeList).where("$.id==" + item.nodeId).toArray()[0];
                if (node_item)
                  nodeList.splice(nodeList.indexOf(node_item), 1);
                for (var i = 0; i < surplus.length; i++) {
                  var surp = surplus[i];
                  _this.scene.remove(_this.node_arr[surp.id].node);
                  delete _this.node_arr[surp.id];
                  delete _this.node_query_list[surp.id];
                  var node_item = Enumerable.from(nodeList).where("$.id==" + surp.id).toArray()[0];
                  if (node_item)
                    nodeList.splice(nodeList.indexOf(node_item), 1);
                }
              } else {

                //为没有子节点的父节点添加一个子节点，这样做是为了拜访布局，节点不被遮盖
                var count = 0;
                var surplus = [];

                function dg(node_list) {
                  for (var i = 0; i < node_list.length; i++) {
                    var item = node_list[i];
                    if (item.items.length === 0) {
                      var source_node = Enumerable.from(nodeList).where("$.nodeId=='" + item.nodeId + "'").toArray()[0];
                      if (source_node) {
                        item.sourceId = item.nodeId;
                        source_node.sourceId = source_node.nodeId;
                        item.nodeId = item.nodeId.toString().replace(/_/g, "");
                        source_node.nodeId = source_node.nodeId.toString().replace(/_/g, "");
                      }
                      var data = {id: count, nodeId: count, nodeName: "aa" + count};
                      item.items.push({nodeId: count, items: []});
                      nodeList.push(data);
                      surplus.push(data);
                      count--;
                    } else
                      dg(item.items);
                  }
                }

                dg(nodeTree[0].items);
                init_nodes(nodeTree, undefined, centerX, centerY);
                _this.scene.doLayout(JTopo.layout.TreeLayout('down', _this.node_size.tree_width, _this.node_size.tree_height));


                for (var i = 0; i < surplus.length; i++) {
                  var surp = surplus[i];
                  _this.scene.remove(_this.node_arr[surp.id].node);
                  delete _this.node_arr[surp.id];
                  delete _this.node_query_list[surp.id];
                  var node_item = Enumerable.from(nodeList).where("$.id==" + surplus[i].id).toArray()[0];
                  if (node_item)
                    nodeList.splice(nodeList.indexOf(node_item), 1);
                }

              }
              _this.add_other_node();
              setTimeout(function(){
                _this.stage.eagleEye.eagleImageDatas = _this.stage.eagleEye.getData(_this.stage)
              },500);
              _this.max_node_id = parseInt(Enumerable.from(nodeList).max("$.nodeId")) + 1;
            } else {
              _this.max_node_id = 1;
            }
            if (type === "Manual") {
              _this.common_title_add("已刷新，成功更新设备状态")
            }
          }
          setTimeout(function () {
            _this.render_layout();
          }, 50);
      //  });

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
            var source = Enumerable.from(source_tree).where("$.filterId=='" + item.filterId+"'").toArray()[0];
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
       * 获取系统基本信息
       * */
      init_baseinfo(cb) {



        var data = {
          resultCode:0,
          busnList:[],
          systemName:"中睿天下3D网络拓扑可视化系统",
          picOptions:{},
          filters:{
            filterTree:[],
            filterList:[]
          }
        };
        cb(data);
        return;
        axios.get(this.server_url + "getBaseInfo", {}).then(function (data) {
          data = data.data;
          cb(data);
        });
      },
      /**
       * 渲染布局
       * */
      render_layout() {
        //this.stage.paint();
      },
      option_newLine(link,type){
        if(type==="add"){
          var line = new JTopo.Link(link.nodeA,link.nodeZ);
          line.id = "new_line";
          link.new_line = line;
          link.is_selected = true;
          this.scene.add(line);
        }else if (type==="del" && link.new_line){
          link.is_selected = false;
          this.scene.remove(link.new_line);
          delete link.new_line;
        }
      },
      /**
       * 拖动节点样式
       * */
      drag_node_style(ev,drag_node){
        var _this = this;
        //节点进入可添加区域
        if(_this.drag_nodeType.add_node && _this.drag_nodeType.add_node.show){
          _this.drag_nodeType.add_node.setLocation(ev.x - _this.node_size.width / 2,ev.y - _this.node_size.height / 2);
          _this.drag_nodeType.add_node.visible = true;

          var x = ev.x;
          var y = ev.y;
          var end_w = _this.node_size.width;
          var end_h = _this.node_size.height;
          //节点可添加区域
          var nodes = Enumerable.from(_this.drag_nodeType.node_arr).where(x+">=$.x&&"+x+"<=$.x+"+end_w+"&&"+y+">=$.y&&"+y+"<=$.y+"+end_h).toArray();
          if(nodes.length === 0){
            //连线可添加区域
            var link_end_w = _this.node_size.tree_width;
            var link_end_h = _this.node_size.tree_height;
            var where_x = "(("+x+">=$.nodeZ.x&&"+x+"<=$.nodeA.x))";
            var where_y = "&&"+y+">=$.nodeA.y&&"+y+"<=$.nodeZ.y";
            var link_arr = Enumerable.from(_this.drag_nodeType.line_arr).where(where_x + where_y).orderByDescending("$.nodeZ.x").toArray();
            if(link_arr.length>0)
              link_arr = [link_arr[0]];
            else {
              where_x = "(("+x+">=$.nodeA.x&&"+x+"<=$.nodeZ.x+"+_this.node_size.width+"))";
              link_arr = Enumerable.from(_this.drag_nodeType.line_arr).where(where_x + where_y).orderBy("$.nodeZ.x").toArray();
              if(link_arr.length > 0){
                link_arr = [link_arr[0]];
              }
            }

            for(var i = 0;i<_this.drag_nodeType.line_focus.length;i++){
              _this.option_newLine(_this.drag_nodeType.line_focus[i],"del")
            }
            //去掉节点上一次的选中状态
            for(var i = 0;i<_this.drag_nodeType.node_focus.length;i++){
              var now_node = _this.drag_nodeType.node_focus[i];
              if(nodes.length>0 && nodes[0].id == now_node.id) continue;
              now_node.paint = function (context) {
                var item = _this.node_arr[this.id].data;
                _this.draw_node('default', item, context);
              }
            }
            _this.drag_nodeType.node_focus = [];
            if(link_arr.length>0){
              for(var i=0;i<link_arr.length;i++){
                _this.option_newLine(link_arr[i],"add")

              }
              _this.drag_nodeType.line_focus = link_arr;
            }else {
              _this.drag_nodeType.line_focus = [];
              /*var star_link = Enumerable.from(_this.drag_nodeType.line_arr).where("$.nodeZ.x<="+x+"&&($.nodeA.y<="+(y)+"&&$.nodeZ.y>="+y+")").orderByDescending("$.nodeZ.x").toArray()[0];
              if(star_link){
                var end_link = Enumerable.from(_this.drag_nodeType.line_arr).where("$.nodeZ.x>"+star_link.nodeZ.x+"&&$.nodeZ.y<="+star_link.nodeZ.y+"&&$.nodeZ.y>="+y+"&&$.nodeA.id=="+star_link.nodeA.id).orderBy("$.nodeZ.x").toArray()[0];
                if(end_link){
                  star_link.lineWidth = _this.node_size.drag_lineWidth;
                  end_link.lineWidth = _this.node_size.drag_lineWidth;
                  _this.drag_nodeType.line_focus = [star_link,end_link];
                }
              }*/
            }
          }else{
            //去掉连接线的状态
            for(var i = 0;i<_this.drag_nodeType.line_focus.length;i++){
              _this.option_newLine(_this.drag_nodeType.line_focus[i],"del")
            }
            _this.drag_nodeType.line_focus = [];
            //去掉节点上一次的选中状态
            for(var i = 0;i<_this.drag_nodeType.node_focus.length;i++){
              var now_node = _this.drag_nodeType.node_focus[i];
              if(nodes.length>0 && nodes[0].id == now_node.id) continue;
              now_node.paint = function (context) {
                var item = _this.node_arr[this.id].data;
                _this.draw_node('default', item, context);
              }
            }
            _this.drag_nodeType.node_focus = [];
            if(nodes.length > 0 && nodes[0].show_type !=='focus'){
              var now_node = _this.node_arr[nodes[0].id];
              now_node.node.paint = function (context) {
                var item = _this.node_arr[this.id].data;
                _this.draw_node('focus', item, context);
              }
              _this.drag_nodeType.node_focus.push(now_node.node);
            }
          }
        }
      },
      /**
       * 鹰眼初始化
       * */
      init_egle(eagle){
        var a = this.stage;
        var _this = this;
        //百分比显示
        _this.Hawkeye.mouse_options.bl = _this.scene.scaleX;
        if(parseInt(100 * (_this.scene.scaleX / 1.2))<parseInt(config.layout.scale.min)){
          _this.Scale_Number=config.layout.scale.min;
          _this.scene.scaleX = _this.Scale_Number / 100;
          _this.scene.scaleY = _this.Scale_Number / 100;
        }else if(parseInt(100 * (this.scene.scaleX))>parseInt(config.layout.scale.max)) {
          _this.Scale_Number = config.layout.scale.max;
          _this.scene.scaleX = _this.Scale_Number / 100;
          _this.scene.scaleY = _this.Scale_Number / 100;
        }else
          _this.Scale_Number = parseFloat(_this.Hawkeye.mouse_options.bl * 100).toFixed(0);

        if (null != eagle.eagleImageDatas) {
          var b = a.graphics;
          var x_star = _this.Hawkeye.left;
          var x_end = _this.Hawkeye.width;
          var y_star = _this.Hawkeye.top + 22;
          a.params = {x_star : x_star,y_star : y_star,x_end:x_star + x_end,y_end:y_star + _this.Hawkeye.height}
          b.beginPath();
          b.save(),

          b.putImageData(eagle.eagleImageDatas, x_star, y_star),
            b.restore(),
            b.lineWidth = 2,
            b.strokeStyle = "#1e2d3e",
            b.rect(x_star+1, y_star, x_end-2, eagle.canvas.height),
            b.stroke(),
            b.restore(),
          b.closePath();
        } else eagle.eagleImageDatas = eagle.getData(a)
      },
      /**
       * 页面加载
       */
      inits() {
        this.node_size.tree_width = parseInt(config.layout.node.tree_width);
        this.node_size.tree_height = parseInt(config.layout.node.tree_height);
        this.node_size.width = parseInt(config.layout.node.width);
        this.node_size.height = parseInt(config.layout.node.height);
        this.node_size.lineWidth = parseInt(config.layout.node.lineWidth);
        this.node_size.drag_lineWidth = parseInt(config.layout.node.drag_lineWidth);
        this.node_size.lineColor = config.layout.node.lineColor || this.node_size.lineColor;
        this.node_size.drag_lineColor = config.layout.node.drag_lineColor || this.node_size.drag_lineColor;
        //右边筛选条件位置
        this.filter_mouse_obj.left = document.body.offsetWidth - document.querySelector(".show_node").offsetWidth - 20;
        this.Hawkeye.top = document.body.offsetHeight - this.Hawkeye.sum_height - 100;
        var _this = this;
        var canvas = document.getElementById("canvas");
        this.canvas = canvas;
        canvas.width = document.body.offsetWidth;
        canvas.height = document.body.offsetHeight - _this.header_height + 3;
        var stage = new JTopo.Stage(canvas);
        stage.wheelZoom = 1.2; // 设置鼠标缩放比例
        //stage.frames = -24;


        stage.eagleEye.visible = true;
        stage.mode = "normal";
        stage.eagleEye.paint = function() {
          if(!_this.show_node_extend['hawkeye']){
            stage.params = undefined;
            return
          };
          _this.init_egle(this);
        }

        this.stage = stage;
        /**
         * 鼠标拖放布局改变鹰眼内图像
         * star_x star_y 鼠标落下是的位置x y
         * old_x old_y 鹰眼图像原来的位置 x y
         */
        this.Hawkeye.mouse_options = {};
        this.Hawkeye.mouse_options.star_x;
        this.Hawkeye.mouse_options.star_y;
        this.Hawkeye.mouse_options.old_x;
        this.Hawkeye.mouse_options.old_y;
        stage.mousedown(function (ev) {
          if(ev.ctrlKey) {
            this.mode = "select";
          }
          _this.drag_nodeType.node_arr = _this.scene.childs.filter(function (e) {
            return e instanceof JTopo.Node;
          });
          _this.drag_nodeType.line_arr = _this.scene.childs.filter(function (e) {
            return e instanceof JTopo.Link && e.id!='new_line';
          });
          _this.drag_nodeType.line_focus = [];
          _this.drag_nodeType.node_focus = [];
          if (_this.scene.selectedElements.length === 0 && this.getBound().leftNode) {
            _this.Hawkeye.mouse_options.old_x = _this.Hawkeye.border.x;
            _this.Hawkeye.mouse_options.old_y = _this.Hawkeye.border.y;
          }
        });
        stage.mouseup(function(ev){
          this.mode = "normal";
          var nodes = Enumerable.from(_this.scene.selectedElements).where("$.elementType==='node'").toArray();
          for (var i = 0; i < nodes.length; i++) {
            var item = nodes[i];
            var e = _this.node_arr[item.id].node;
            _this.set_node_style(e, "focus");
          }
        });

        stage.mousedrag(function (ev) {
          this.cursor = "-webkit-grabbing";
          return;
        });
        //layer布局
        var scene = new JTopo.Scene(stage);
        this.scene = scene;
        this.scene.backgroundColor = '38,56,76';
        scene.alpha = 1;
        scene.areaSelect = true;

        scene.mousemove(function(ev){
          _this.drag_node_style(ev);
        });
        //鼠标拖动节点
        scene.mousedrag(function (ev) {
          var selectedNodes = _this.scene.selectedElements;
          //节点进入可添加区域
          if(selectedNodes.length>0){
            var x = ev.x;
            var y = ev.y;
            var end_w = _this.node_size.width;
            var end_h = _this.node_size.height;
            //节点可添加区域
            var nodes = Enumerable.from(_this.drag_nodeType.node_arr).where(x+">=$.x&&"+x+"<=$.x+"+end_w+"&&"+y+">=$.y&&"+y+"<=$.y+"+end_h+"&&$.id!='drag_node_id'").toArray();
            for(var i =0;i<selectedNodes.length;i++){
              nodes = Enumerable.from(nodes).where("$.id!='"+selectedNodes[i].id+"'").toArray();
            }
            if(nodes.length === 0){
              //连线可添加区域
              var link_end_w = _this.node_size.tree_width;
              var link_end_h = _this.node_size.tree_height;
              var where_x = "(("+x+">=$.nodeZ.x&&"+x+"<=$.nodeA.x))";
              var where_y = "&&"+y+">=$.nodeA.y&&"+y+"<=$.nodeZ.y";
              where_y += "&&$.nodeA.id!='"+selectedNodes[0].id+"'";

              var link_arr = Enumerable.from(_this.drag_nodeType.line_arr).where(where_x + where_y).orderByDescending("$.nodeZ.x").toArray();
              if(link_arr.length>0)
                link_arr = [link_arr[0]];
              else {
                where_x = "(("+x+">=$.nodeA.x&&"+x+"<=$.nodeZ.x+"+_this.node_size.width+"))";
                link_arr = Enumerable.from(_this.drag_nodeType.line_arr).where(where_x + where_y).orderBy("$.nodeZ.x").toArray();
                if(link_arr.length > 0){
                  link_arr = [link_arr[0]];
                }
              }

              for(var i = 0;i<_this.drag_nodeType.line_focus.length;i++){
                _this.option_newLine(_this.drag_nodeType.line_focus[i],"del")

              }
              _this.drag_nodeType.line_focus = [];
              //去掉节点上一次的选中状态
              for(var i = 0;i<_this.drag_nodeType.node_focus.length;i++){
                var now_node = _this.drag_nodeType.node_focus[i];
                if(nodes.length>0 && nodes[0].id == now_node.id) continue;
                _this.set_node_style(now_node, "default");
              }
              _this.drag_nodeType.node_focus = [];
              if(link_arr.length>0){
                for(var i=0;i<link_arr.length;i++){
                  _this.option_newLine(link_arr[i],"add")


                }
                _this.drag_nodeType.line_focus = link_arr;
              }
            }else{
              //去掉连接线的状态
              for(var i = 0;i<_this.drag_nodeType.line_focus.length;i++){
                _this.option_newLine(_this.drag_nodeType.line_focus[i],"del")

              }
              _this.drag_nodeType.line_focus = [];
              //去掉节点上一次的选中状态
              for(var i = 0;i<_this.drag_nodeType.node_focus.length;i++){
                var now_node = _this.drag_nodeType.node_focus[i];
                if(nodes.length>0 && nodes[0].id == now_node.id) continue;
                _this.set_node_style(now_node, "default");
              }
              if(nodes.length > 0 && nodes[0].show_type !=='focus'){
                var now_node = _this.node_arr[nodes[0].id];
                _this.set_node_style(now_node.node, "focus");
                _this.drag_nodeType.node_focus.push(now_node.node);
              }
            }
          }
          _this.canvas_mousemove(ev);
          //_this.node_mouse_dom.node.setLocation(ev.x,ev.y);
        });
        //鼠标抬起
        scene.mouseup(function (ev) {
          if(_this.drag_nodeType.add_node){
            _this.scene.remove(_this.drag_nodeType.add_node);
            _this.drag_nodeType.add_node = undefined;

            _this.mouse_obj = _this.drag_nodeType.mouse_obj;
            _this.drag_nodeType.down = false;
            _this.drag_nodeType.upTime = new Date().getTime();

            if(_this.drag_nodeType.node_focus.length>0){
              _this.add_node(_this.drag_nodeType.node_focus[0]);
            }else if(_this.drag_nodeType.line_focus.length > 0){
              if(_this.drag_nodeType.line_focus.length == 1){
                _this.change_line(_this.drag_nodeType.line_focus[0]);
              }else {
                _this.change_line(_this.drag_nodeType.line_focus[0],_this.drag_nodeType.line_focus[1]);
              }
            }else{
              _this.allowDrop_End(ev);
              _this.node_drag = false;
              _this.mouse_obj = undefined;
            }
            _this.scene.selectedElements = [];
            return;
          }else if(_this.scene.selectedElements.length > 0){
            if(_this.drag_nodeType.node_focus.length>0){
              var selectedNodes = Enumerable.from(_this.scene.selectedElements).where("$.id!='"+_this.drag_nodeType.node_focus[0].id+"'").toArray();
              _this.node_inside_update(selectedNodes, _this.drag_nodeType.node_focus[0]);
              _this.scene.selectedElements = [];
              return;
            }else if(_this.drag_nodeType.line_focus.length > 0){

              if(_this.drag_nodeType.line_focus.length == 1){
                _this.node_inside_update([_this.drag_nodeType.line_focus[0].nodeZ],_this.scene.selectedElements[0]);
              }
              //else {
              //  _this.change_line(_this.drag_nodeType.line_focus[0],_this.drag_nodeType.line_focus[1]);
              //}
              _this.scene.selectedElements = [];
              return;
            }
          }
          _this.canvas_mouseup(ev);
          if (scene.selectedElements.length > 0 && !_this.currentNode && ev.button === 0) {
            if (scene.selectedElements.length === 1 && scene.selectedElements[0].elementType !== "node")
              return;
            _this.node_select_dom.show = true;
            var star_node_x = Enumerable.from(scene.selectedElements).min("$.x");
            var star_node_y = Enumerable.from(scene.selectedElements).min("$.y");

            star_node_x = star_node_x + scene.translateX;
            star_node_y = star_node_y + scene.translateY;

            var can_left = document.getElementById("canvas").offsetLeft;
            var can_top = document.getElementById("canvas").offsetTop;

            var scaleX = _this.scene.scaleX;
            var scaleY = _this.scene.scaleY;
            _this.node_select_dom.left = star_node_x + can_left - 20;
            _this.node_select_dom.top = star_node_y + can_top - 20;

            var last_node_x = Enumerable.from(scene.selectedElements).max("$.x");
            var last_node_y = Enumerable.from(scene.selectedElements).max("$.y");

            last_node_x = last_node_x + scene.translateX;
            last_node_y = last_node_y + scene.translateY;

            var node_max_width = Enumerable.from(scene.selectedElements).min("$.width");
            var node_max_height = Enumerable.from(scene.selectedElements).min("$.height");

            _this.node_select_dom.width = (last_node_x - star_node_x + node_max_width + 40) * scaleX;
            _this.node_select_dom.height = (last_node_y - star_node_y + node_max_height + 40) * scaleY;
          }
        });
        this.init_baseinfo(function (data) {
          console.log(data);
          if (data.resultCode == 0) {
            _this.area_list = data.busnList;
            _this.window_title = data.systemName;
            _this.picOptions = data.picOptions;
            _this.source_filters = data.filters;
            _this.init_filter();
          }
        });
        _this.Update_jtop();
        //_this.scene.doLayout(JTopo.layout.TreeLayout('down', 170, 107));
      }
    }
  }
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  h1, h2 {
    font-weight: normal;
  }

  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    display: inline-block;
    margin: 0 10px;
  }

  a {
    color: #42b983;
  }
  .temp_btn_jz{
    background: rgba(117, 156, 224, 0.46);
    padding: 10px 6px;
    border-radius: 6px;
  }
</style>
