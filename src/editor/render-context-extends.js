RenderContext.createSceneRenderCtx = function (width, height, canvas, transparent) {
    var sceneCtx = new RenderContext (width, height, canvas, transparent);

    var foreground = new PIXI.DisplayObjectContainer();
    var gameRoot = new PIXI.DisplayObjectContainer();
    var background = new PIXI.DisplayObjectContainer();
    sceneCtx.stage.addChild(background);
    sceneCtx.stage.addChild(gameRoot);
    sceneCtx.stage.addChild(foreground);
    sceneCtx.root = gameRoot;
    sceneCtx.isSceneView = true;

    Engine._renderContext.sceneView = sceneCtx;
    return sceneCtx;
};

RenderContext.prototype.getForegroundNode = function () {
    return this.stage.children[this.stage.children.length - 1];
};

RenderContext.prototype.getBackgroundNode = function () {
    return this.stage.children[0];
};
