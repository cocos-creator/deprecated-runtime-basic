RenderContext.Graphics = function (parent) {
    var pixiGraphics = new PIXI.Graphics();
    parent.addChild(pixiGraphics);
    return pixiGraphics;
};
