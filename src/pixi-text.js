PIXI.Text.prototype.updateTransform = function () {
};

var PixiTextUtil = {};

function _getTextStyle (target) {
    if (target._renderObj || target._renderObjInScene) {
        var style = {
            fill : "#" + target.color.toHEX('#rrggbb'),
            align: Fire.Text.TextAlign[target.align].toLowerCase()
        };
        if (target.fontType !== Fire.Text.FontType.Custom){
            style.font = target.size + "px" + " " + Fire.Text.FontType[target.fontType].toLowerCase()
        }
        else{
            style.font = target.size + "px" + " " + target.customFontType
        }
        return style;
    }
    else {
        return {
            font : "30px Arial",
            fill : "white",
            align: "left"
        };
    }
}

RenderContext.prototype.setTextContent = function (target, newText) {
    if (target._renderObj) {
        target._renderObj.setText(newText);
    }
    if (this.sceneView && target._renderObjInScene) {
        target._renderObjInScene.setText(newText);
    }
};

RenderContext.prototype.setTextStyle = function (target) {
    var style = _getTextStyle(target);
    if (target._renderObj) {
        target._renderObj.setStyle(style);
    }
    if (target._renderObjInScene) {
        target._renderObjInScene.setStyle(style);
    }
};

RenderContext.prototype.addText = function (target) {
    var style = _getTextStyle(target);

    var inGame = !(target.entity._objFlags & HideInGame);
    if (inGame) {
        target._renderObj = new PIXI.Text(target.text, style);
        target.entity._pixiObj.addChildAt(target._renderObj, 0);
    }
    if (this.sceneView) {
        target._renderObjInScene = new PIXI.Text(target.text, style);
        target.entity._pixiObjInScene.addChildAt(target._renderObjInScene, 0);
    }
};

RenderContext.prototype.getTextSize = function (target) {
    var inGame = !(target.entity._objFlags & HideInGame);
    var w = 0, h = 0;
    if (inGame && target._renderObj) {
        if (target._renderObj.dirty) {
            target._renderObj.updateText();
            target._renderObj.dirty = false;
        }

        w = target._renderObj.textWidth | target._renderObj._width;
        h = target._renderObj.textHeight | target._renderObj._height;
    }
    else if (target._renderObjInScene) {
        if (target._renderObjInScene.dirty) {
            target._renderObjInScene.updateText();
            target._renderObjInScene.dirty = false;
        }

        w = target._renderObjInScene.textWidth | target._renderObjInScene._width;
        h = target._renderObjInScene.textHeight | target._renderObjInScene._height;
    }
    return new Vec2(w, h);
};

RenderContext.updateTextTransform = function (target, tempMatrix) {
    var i = 0, childrens = null, len = 0, child = null;
    var isGameView = Engine._curRenderContext === Engine._renderContext;
    if (isGameView && target._renderObj) {
        if (target._renderObj.dirty) {
            target._renderObj.updateText();
            target._renderObj.dirty = false;
        }
        target._renderObj.worldTransform = _getNewMatrix23(target._renderObj, tempMatrix);
    }
    else if (target._renderObjInScene) {
        if (target._renderObjInScene.dirty) {
            target._renderObjInScene.updateText();
            target._renderObjInScene.dirty = false;
        }
        target._renderObjInScene.worldTransform = _getNewMatrix23(target._renderObjInScene, tempMatrix);
    }
};
