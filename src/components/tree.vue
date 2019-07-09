<template>
	<li v-if="tree_filter||fxTree.show">
		<div class="Checkbox_button" :class="fxTree.visible" :showtree="!open" :ischildren="fxTree.children&&fxTree.children.length>0" @click='toggle'>
			<button @click='node_visabled($event)'></button>
			<label v-html="fxTree.name"></label>
		</div>

		<ul v-show="open" v-if='isFolder'>
			<items v-for='cel in fxTree.children' :fxTree='cel' :filterTxt="filterTxt" :nodeDisplay="nodeDisplay"></items>
		</ul>
	</li>
</template>
<script>
  import Enumerable from "linq";
  export default {
		name: 'items',
		props: ['fxTree','filterTxt','nodeDisplay'],
		components: {
		},
		data() {
			return {
				open: true
			}
		},
		mounted(){

		},
		computed: {
			isFolder() {
        if(this.fxTree.children)
          for(var i = 0 ;i<this.fxTree.children.length;i++){
            this.fxTree.children[i].parent = this.fxTree;
          }
				return this.fxTree.children && this.fxTree.children.length
			},
			get_check(){
				return !this.fxTree.visible;
			},
			select(){
				return this.fxTree.visible=this.fxTree.visible=='selected'?'':'selected';
      },
			tree_filter(node){
        this.filterTxt = this.filterTxt.toString();
        node.fxTree.name = node.fxTree.name.replace(/<i>/g,"").replace(/<\/i>/g,"");
        if(!node.fxTree.parent && this.filterTxt !=this.prev_filterTxt){
          node.fxTree.show = false;
        }
        this.prev_filterTxt = this.filterTxt;
        if(node.fxTree.name.indexOf(this.filterTxt)>-1||this.filterTxt==""){
          if(this.filterTxt){
            var reg=new RegExp(this.filterTxt,"gmi");
            node.fxTree.name = node.fxTree.name.replace(reg,"<i>"+this.filterTxt+"</i>");
          }
          return true;
        }
				else{
          if(node.fxTree.children && node.fxTree.children.length > 0){
            var filterTxt = this.filterTxt.toString();
            var bb = Enumerable.from(node.fxTree.children).select(function(iter){
              var name = iter.name;
              name = name.replace(/<i>/g,"").replace(/<\/i>/g,"");
              if(name.toString().indexOf(filterTxt)>-1)
                return iter;
            }).toArray();
            var query_item = Enumerable.from(bb).where("$!=undefined").toArray();
            if(bb.length>0 && query_item.length>0){
              bb = query_item[0];
              bb.name = bb.name.replace(reg,"<i>"+this.filterTxt+"</i>");
              bb.parent.show = true;
            }
          }
          return false;
        }
			}
		},
		methods: {
			toggle: function(obj) {
				if(this.isFolder) {
					this.open = !this.open
				}
			},
			node_visabled_children(node,className,nodeParent){
				this.nodeDisplay(node,className,nodeParent);
				for (var i = 0; i < node.length; i++) {
					node[i].visible=className;
					if(nodeParent)
					  node[i].parent = nodeParent;
					if(node[i].children)
						this.node_visabled_children(node[i].children,className,node[i]);
				}
			},
			node_query_parent_node(node){
        if(node.parent){
					var count=node.parent.children.filter(function(item){return item.visible==='selected';}).length;
					if(count===node.parent.children.length)
						node.parent.visible='selected';
					else
						node.parent.visible='';
					if(node.parent.parent)
						this.node_query_parent_node(node.parent);
				}
			},
			node_visabled:function(ev){
        ev.cancelBubble = true;
				var item=this.fxTree;
				item.visible=item.visible==="selected"?'':'selected';
				if(item.children){
					this.node_visabled_children(item.children,item.visible,item);
        }
				else
					this.nodeDisplay([item],item.visible);
				this.node_query_parent_node(item);
			}
		}
	}
</script>
