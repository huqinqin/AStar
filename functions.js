// 中竞教育A星寻路教程-功能模块代码
// 作者：胡亚雷
// 2019年2月25日

var g_gameMap = new GameMap();
var g_gamePath = new GamePath();

function onLoad() {
    initMap();
    onRender();
}

function onRender() {
    var c = document.getElementById("rendertarget");
    var ctx = c.getContext("2d");
    if(g_gameMap.isDirty()){
        g_gameMap.render(c,ctx);
        g_gamePath.render(c,ctx);
    }
    requestAnimationFrame(onRender);
}

function initMap(){
    g_gameMap.init(25,25);
    g_gamePath.init(g_gameMap);
}

function pathInit() {
    pauseStep();
    g_gamePath.reset();
}
function pathStart() {
    g_gamePath.pathStart();
}
function pathStep() {
    g_gamePath.pathStep();
    if(g_gamePath.findend){
        pauseStep();
    }
}

var g_Timer = null;
function autoStep() {
    if(g_Timer != null){
        pauseStep();
    }
    g_Timer = setInterval(pathStep, 50);
}

function pauseStep() {
    clearInterval(g_Timer);
    g_Timer = null;
}

var g_mouseState = null;
function onMouseDown() {
    var a = document.getElementById("leftbutton");
    g_mouseState = a.value;
    onMouseMove();
}

function onMouseUp() {
    onMouseMove();
    g_mouseState = null;
}

function onMouseMove() {
    var c = document.getElementById("rendertarget");
    var mousex = event.pageX - c.offsetLeft;
    var mousey = event.pageY - c.offsetTop;
    var gridsize = g_gameMap.getGridSize(c);
    var gx = Math.floor(mousex/gridsize);
    var gy = Math.floor(mousey/gridsize);
    if(gx >= 0 && gx < g_gameMap.width && gy >=0 && gy < g_gameMap.height){
        switch (g_mouseState){
            case "block":g_gameMap.setNode(gx,gy,1);break;
            case "clear":g_gameMap.setNode(gx,gy,0);break;
            case "start":g_gamePath.setStart(gx,gy);break;
            case "end":g_gamePath.setEnd(gx,gy);break;
        }
    }
}