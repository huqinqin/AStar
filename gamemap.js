// 中竞教育A星寻路教程-地图模块代码
// 作者：胡亚雷
// 2019年2月25日

function MapNode(index) {
    this.index = index;
    this.type = 0; // 0表示空地，1表示阻挡
    this.pathnode = null;
}

function GameMap(){
    this.nodes = [];
    this.width = 0;
    this.height = 0;
    this.init = function (w,h) {
        this.nodes.splice(0,this.nodes.length);
        this.width = w;
        this.height = h;
        var count = w*h;
        for(var i = 0; i < count; ++i){
            this.nodes.push(new MapNode(i));
        }
        this.setDirty();
    };

    this.getNodeByIndex = function (index) {
        if(index >= 0 && index < this.nodes.length){
            return this.nodes[index];
        }
        return null;
    };

    this.getNode = function (x,y) {
      if(x >= 0 && x < this.width && y >=0 && y < this.width){
          var index = y * this.width + x;
          return this.nodes[index];
      }
      return null;
    };

    this.setNode = function (x,y,type) {
        var node = this.getNode(x,y);
        if(node != null){
            node.type = type;
            this.setDirty();
        }
    };
    
    this.index2Position = function (index) {
        if(index >= 0 && index < this.nodes.length){
            var x = index % this.width;
            var y = (index - x) / this.width;
            return {x:x,y:y};
        }
        return null;
    };

    this.dirty = true;
    this.setDirty = function () {
        this.dirty = true;
    };
    this.isDirty = function () {
        return this.dirty;
    };
    this.getGridSize = function (c) {
        return Math.min(c.width/this.width,c.height/this.height);
    };
    this.render = function (c,ctx) {
        if(this.isDirty()){
            this.dirty = false;

            ctx.clearRect(0,0,c.width,c.height);
            var gridsize = this.getGridSize(c);
            var count = this.width*this.height;
            for(var i = 0; i < count; ++i){
                var node = this.nodes[i];
                var pos = this.index2Position(i);
                var gx = pos.x * gridsize;
                var gy = pos.y * gridsize;
                ctx.fillStyle = "white";
                switch (node.type){
                    case 0:
                       // ctx.fillStyle = "white";
                        break;
                    case 1:ctx.fillStyle = "darkgray";
                        ctx.fillRect(gx+1,gy+1,gridsize-2,gridsize-2);
                    break;
                }
                ctx.strokeRect(gx,gy,gridsize,gridsize);

            }
        }
    }
}