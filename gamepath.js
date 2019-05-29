// 中竞教育A星寻路教程-寻路模块代码
// 作者：胡亚雷
// 2019年2月25日

function PathNode(index) {
    this.index = index;
    this.F = -1;
    this.G = -1;
    this.H = -1;
    this.parent = -1;
    this.inOpenList = false;
    this.inCloseList = false;
    this.inPath = false;
    this.inAffectedList = false;
}

function OpenList() {
    this.list = [];
    this.isEmpty = function () {
        return this.list.length <= 0;
    };
    this.push = function (node) {
        if (!node.inOpenList) {
            node.inOpenList = true;
            node.inCloseList = false;
            this.list.push(node);
        }
    };

    this.pop = function () {
        if (this.list.length <= 0) {
            return null;
        }
        else {
            var index = 0;
            for (var i = 1; i < this.list.length; ++i) {
                if (this.list[index].F > this.list[i].F) {
                    index = i;
                }
            }
            var ret = this.list[index];
            this.list.splice(index, 1);
            ret.inOpenList = false;
            ret.inCloseList = true;
            return ret;
        }
    };
    this.clear = function () {
        this.list.splice(0, this.list.length);
    }
}

function CloseList() {
    this.push = function (node) {
        node.inOpenList = false;
        node.inCloseList = true;
    };
    this.clear = function () {
    }
}

function GamePath() {
    this.gamemap = null;
    this.affectedlist = [];
    this.openlist = new OpenList();
    this.closelist = new CloseList();

    this.start = null;
    this.end = null;
    this.findend = false;

    this.setDirty = function () {
        this.gamemap.setDirty();
    };

    this.init = function (gamemap) {
        this.gamemap = gamemap;
        this.reset();
        this.start = null;
        this.end = null;
        this.findend = false;
        this.setDirty();
    };

    this.reset = function () {
        this.findend = false;
        this.openlist.clear();
        this.closelist.clear();
        for (var i = 0; i < this.affectedlist.length; ++i) {
            var mapnode = this.gamemap.getNodeByIndex(this.affectedlist[i]);
            if(mapnode != null){
                mapnode.pathnode = null;
            }
        }
        this.affectedlist.splice(0, this.affectedlist.length);

        this.setDirty();
    };

    this.getNode = function (x,y) {
        var mapnode =this.gamemap.getNode(x,y);
        if(mapnode != null && mapnode.type == 0){
            if(mapnode.pathnode == null){
                mapnode.pathnode = new PathNode(mapnode.index);
                this.affect(mapnode.pathnode);
            }
            return mapnode.pathnode;
        }
        return null;
    };

    this.affect = function (node) {
        if (!node.inAffectedList) {
            this.affectedlist.push(node.index);
            node.inAffectedList = true;
        }
    };

    this.setStart = function (x, y) {
        this.reset();
        this.start = {x: x, y: y};
        this.setDirty();
    };

    this.setEnd = function (x, y) {
        this.reset();
        this.end = {x: x, y: y};
        this.setDirty();
    };

    this.getHManhattan = function(dx,dy){
        return (dx + dy)*10;
    };
    this.getHPath = function (dx,dy) {
        var a = dx > dy ? dx - dy : dy - dx;
        var b = (dx + dy - a)/2 ;
        return a * 10 + b * 14;
    };
    this.getHDistance = function(dx,dy){
        return (Math.sqrt(dx*dx + dy*dy)*10);
    };

    this.getH = function (x,y) {
        var dx = x - this.end.x;
        dx = dx > 0 ? dx : -dx;
        var dy = y - this.end.y;
        dy = dy > 0 ? dy : -dy;
        return this.getHPath(dx,dy);
    };
    this.getF = function (node) {
        return node.H;
    };

    this.pathStart = function () {
        if(this.start != null && this.end != null){
            var start = this.getNode(this.start.x,this.start.y);
            if(start != null){
                start.G = 0;
                start.H = 0;
                start.F = 0;
                this.openlist.push(start);
                this.setDirty();
            }
        }
    };

    var aroundpos = [
        {x:0,y:-1},{x:1,y:0},{x:0,y:1},{x:-1,y:0},
        {x:-1,y:-1,check:[0,3]},
        {x:1,y:-1,check:[0,1]},
        {x:1,y:1,check:[1,2]},
        {x:-1,y:1,check:[2,3]}
    ];
    this.pathStep = function () {
        if(!this.findend && !this.openlist.isEmpty()){
            this.setDirty();
            var node = this.openlist.pop();
            var npos = this.gamemap.index2Position(node.index);
            if(npos.x == this.end.x && npos.y == this.end.y){
                this.findend = true;
                while(node.parent != -1){
                    node.inPath = true;
                    node = this.gamemap.getNodeByIndex(node.parent).pathnode;
                }
                return;
            }
            var block = [];
            for(var i = 0; i< 4; ++i){
                var aroundnode = this.getNode(npos.x + aroundpos[i].x,npos.y + aroundpos[i].y);
                if(aroundnode != null){
                    block.push(true);
                    if(!aroundnode.inCloseList){
                        if(!aroundnode.inOpenList){
                            aroundnode.G = node.G + 10;
                            aroundnode.H = this.getH(npos.x + aroundpos[i].x,npos.y + aroundpos[i].y);
                            aroundnode.F = this.getF(aroundnode);
                            aroundnode.parent = node.index;
                            this.openlist.push(aroundnode);
                        }
                        else{
                            var newG = node.G + 10;
                            if(newG < aroundnode.G){
                                aroundnode.G = newG;
                                aroundnode.F = this.getF(aroundnode);
                                aroundnode.parent = node.index;
                            }
                        }
                    }
                    else{
                        var newG = node.G + 10;
                        if(newG < aroundnode.G){
                            aroundnode.G = newG;
                            aroundnode.F = this.getF(aroundnode);
                            aroundnode.parent = node.index;
                            this.openlist.push(aroundnode);
                        }
                    }
                }
                else{
                    block.push(false);
                }
            }

            for(i = 4; i < 8; ++i){
                var aroundnode = this.getNode(npos.x + aroundpos[i].x,npos.y + aroundpos[i].y);
                if(aroundnode != null && block[aroundpos[i].check[0]]&& block[aroundpos[i].check[1]]){
                    if(!aroundnode.inCloseList){
                        if(!aroundnode.inOpenList){
                            aroundnode.G = node.G + 14;
                            aroundnode.H = this.getH(npos.x + aroundpos[i].x,npos.y + aroundpos[i].y);
                            aroundnode.F = this.getF(aroundnode);
                            aroundnode.parent = node.index;
                            this.openlist.push(aroundnode);
                        }
                        else{
                            var newG = node.G + 14;
                            if(newG < aroundnode.G){
                                aroundnode.G = newG;
                                aroundnode.F = this.getF(aroundnode);
                                aroundnode.parent = node.index;
                            }
                        }
                    }
                    else{
                        var newG = node.G + 10;
                        if(newG < aroundnode.G){
                            aroundnode.G = newG;
                            aroundnode.F = this.getF(aroundnode);
                            aroundnode.parent = node.index;
                            this.openlist.push(aroundnode);
                        }
                    }
                }
            }
        }
    };

    var aroundpos1 = [
        {x:0,y:-1},{x:1,y:0},{x:0,y:1},{x:-1,y:0},
        {x:-1,y:-1,check:[0,3]},
        {x:1,y:-1,check:[0,1]},
        {x:1,y:1,check:[1,2]},
        {x:-1,y:1,check:[2,3]}
    ];

    this.pathStep1 = function () {
        if(!this.findend && !this.openlist.isEmpty()){
            this.setDirty();
            var node = this.openlist.pop();
            var npos = this.gamemap.index2Position(node.index);
            if(npos.x == this.end.x && npos.y == this.end.y){
                this.findend = true;
                while(node != null && node.parent != -1){
                    node.inPath =true;
                    var mapnode = this.gamemap.getNodeByIndex(node.parent);
                    if(mapnode != null){
                        node = mapnode.pathnode;
                    }
                }
                return;
            }
            var check = [];
            for(var i = 0; i < 4; ++i){
                var aroundnodepos = {x:npos.x + aroundpos[i].x,y:npos.y + aroundpos[i].y};
                var aroundnode = this.getNode(aroundnodepos.x,aroundnodepos.y);
                if(aroundnode != null){
                    check.push(true);
                    if(!aroundnode.inCloseList){
                        if(!aroundnode.inOpenList){
                            aroundnode.G = node.G + 10;
                            aroundnode.H = this.getH(aroundnodepos.x,aroundnodepos.y);
                            aroundnode.F = this.getF(aroundnode);
                            aroundnode.parent = node.index;
                            this.openlist.push(aroundnode);
                        }
                        else{
                            var newG = node.G + 10;
                            if(newG < aroundnode.G){
                                aroundnode.G = newG;
                                aroundnode.F = this.getF(aroundnode);
                                aroundnode.parent = node.index;
                            }
                        }
                    }
                }
                else{
                    check.push(false);
                }
            }

            for(i = 4; i < 8; ++i){
                var aroundnodepos = {x:npos.x + aroundpos[i].x,y:npos.y + aroundpos[i].y};
                var aroundnode = this.getNode(aroundnodepos.x,aroundnodepos.y);
                if(aroundnode != null && check[aroundpos[i].check[0]] && check[aroundpos[i].check[1]]){
                    if(!aroundnode.inCloseList){
                        if(!aroundnode.inOpenList){
                            aroundnode.G = node.G + 14;
                            aroundnode.H = this.getH(aroundnodepos.x,aroundnodepos.y);
                            aroundnode.F = this.getF(aroundnode);
                            aroundnode.parent = node.index;
                            this.openlist.push(aroundnode);
                        }
                        else{
                            var newG = node.G + 14;
                            if(newG < aroundnode.G){
                                aroundnode.G = newG;
                                aroundnode.F = this.getF(aroundnode);
                                aroundnode.parent = node.index;
                            }
                        }
                    }
                }
            }
        }
        else{
            this.findend = true;
        }
    };

    this.render = function (c, ctx) {
        var gridsize = this.gamemap.getGridSize(c);
        var offset = 1;

        if (this.start != null) {
            var sx = this.start.x * gridsize;
            var sy = this.start.y * gridsize;
            ctx.fillStyle = "#bcffb6";
            ctx.fillRect(sx + offset, sy + offset, gridsize - offset * 2, gridsize - offset * 2);
        }

        var fontsize = Math.floor(gridsize * 0.2);
        var fontoff = gridsize * 0.08;
        ctx.font = fontsize.toString() + "px 微软雅黑";
        for (var i = 0; i < this.affectedlist.length; ++i) {
            var gridindex = this.affectedlist[i];
            var grid = this.gamemap.getNodeByIndex(gridindex).pathnode;
            var pos = this.gamemap.index2Position(gridindex);

            var gx = pos.x * gridsize;
            var gy = pos.y * gridsize;
            if(grid.inPath){
                ctx.fillStyle = "#20ff0b";
                ctx.fillRect(gx + offset, gy + offset, gridsize - offset * 2, gridsize - offset * 2);
            }
            else if (grid.inOpenList) {
                ctx.fillStyle = "#ffabae";
                ctx.fillRect(gx + offset, gy + offset, gridsize - offset * 2, gridsize - offset * 2);
            }
            else if (grid.inCloseList) {
            //    ctx.fillStyle = "#eeeeee";
            //    ctx.fillRect(gx + offset, gy + offset, gridsize - offset * 2, gridsize - offset * 2);
            }

            ctx.fillStyle = "#FF0000";
            ctx.fillText(grid.F, gx + fontoff, gy + fontsize + fontoff);

            ctx.fillStyle = "#008d00";
            ctx.fillText(grid.G, gx + fontoff, gy + gridsize - fontoff);

            ctx.fillStyle = "#0000FF";
            ctx.fillText(grid.H, gx + fontsize * 2 + fontoff, gy + gridsize - fontoff);
        }

        if (this.end != null) {
            var ex = this.end.x * gridsize;
            var ey = this.end.y * gridsize;
            ctx.fillStyle = "#ff2a31";
            ctx.fillRect(ex + offset, ey + offset, gridsize - offset * 2, gridsize - offset * 2);
        }

        for (var i = 0; i < this.affectedlist.length; ++i) {
            var gridindex = this.affectedlist[i];
            var grid = this.gamemap.getNodeByIndex(gridindex).pathnode;
            var pos = this.gamemap.index2Position(gridindex);
            var gx = pos.x * gridsize;
            var gy = pos.y * gridsize;
            if(grid.parent != -1){
                var ppos = this.gamemap.index2Position(grid.parent);
                var px = ppos.x * gridsize;
                var py = ppos.y * gridsize;
                ctx.beginPath();
                ctx.arc(gx * 0.8 + px * 0.2 + gridsize/2,gy*0.8 + py * 0.2 + gridsize/2,gridsize*0.1,0,Math.PI*2);
                ctx.moveTo(gx * 0.8 + px * 0.2 + gridsize/2,gy*0.8 + py * 0.2 + gridsize/2);
                ctx.lineTo(px + gridsize/2,py + gridsize/2);
                ctx.stroke();
            }
        }
    }
}