# 三维组件配置参数说明
## layout 布局
- modelMaxSize: 模型最大尺寸（用于尺寸压限）
- levelHeight: 层级高度
- levelHeightDecline: 层级高度按层级衰减系数（未使用）
- nodeSpace: 节点距离
- nodeSpaceDeclineByLevel: 节点距离按层级衰减系数
- star_radius_min: 星形最小半径
- star_radius_inc: 星形半径递增
## appearance 外观
### ground 地面网格
- color: 地面网格颜色
- cellSize: 地面格子尺寸
- cellCount: 地面格式数量
### connect 网络连线
- color: 颜色
- size: 线粗
### attack
- color: 颜色
- length: 身长度
- radius: 头半径
### business
- color: 线条颜色 (默认 #ffffff 白色)
- linewidth: 线粗（默认2),
- dashed: 是否虚线 (默认 false 否)
- position: 位置，[x, y]。水平和垂直均为 -1 到 1 之间，如水平 -1=左 0=中 1=右，垂直 -1=下 0=中 1=上。（默认 [0, 0] 水平居中，垂直居中）
## debug 调试
- showDebugText: 是否显示节点文本（ip）（默认 false）
- debugTextVisibleDistance: 节点文本可见距离（默认100）
## animation
- viewToSpeed: 节点定位速度（每秒）
- viewToMinTime: 节点定位最小时间（秒） （默认 1）
- viewToMaxTime: 节点定位最大时间（秒） （默认 3）
},
## data
- attackRequestInterval: 攻击数据请求频率(毫秒)，如2秒=2000
- attackRequestCount: 攻击数据请求失败重试次数
- nodesInViewDistance: 视野内节点判断距离值（米）