PIXI.Text.prototype.updateTransform = function () {
};

var PixiTextUtil = {};

function _getTextStyle (target) {
    if (target) {
        var style = {
            fill : "#" + target.color.toHEX('#rrggbb'),
            align: Fire.TextAlign[target.align].toLowerCase()
        };
        if (target.fontType !== Fire.FontType.Custom){
            style.font = target.size + "px" + " " + Fire.FontType[target.fontType].toLowerCase();
        }
        else{
            style.font = target.size + "px" + " " + target.customFontType;
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
    var obj = this.getRenderObj(target);
    if (obj) {
        obj.setText(newText);
    }
    // @ifdef EDITOR
    obj = this.getRenderObjInScene(target);
    if (obj) {
        obj.setText(newText);
    }
    // @endif
};

RenderContext.prototype.setTextStyle = function (target) {
    var style = _getTextStyle(target);
    var obj = this.getRenderObj(target);
    if (obj) {
        obj.setStyle(style);
    }
    // @ifdef EDITOR
    obj = this.getRenderObjInScene(target);
    if (obj) {
        obj.setStyle(style);
    }
    // @endif
};

RenderContext.prototype.addText = function (target) {
    var style = _getTextStyle(target);
    var inGame = !(target.entity._objFlags & HideInGame);
    if (inGame) {
        target._renderObj = new PIXI.Text(target.text, style);
        target.entity._pixiObj.addChildAt(target._renderObj, 0);
    }
    // @ifdef EDITOR
    if (this.sceneView) {
        target._renderObjInScene = new PIXI.Text(target.text, style);
        target.entity._pixiObjInScene.addChildAt(target._renderObjInScene, 0);
    }
    // @endif
};

function _getSize (obj) {
    if (obj) {
        if (obj.dirty) {
            obj.updateText();
            obj.dirty = false;
        }
        return new Vec2(obj.textWidth | obj._width, obj.textHeight | obj._height);
    }
    return null;
}

RenderContext.prototype.getTextSize = function (target) {
    var obj = this.getRenderObj(target);
    var size = _getSize(obj);
    // @ifdef EDITOR
    if (! size) {
        obj = this.getRenderObjInScene(target);
        size = _getSize(obj);
    }
    // @endif
    return size ? size : Vec2.zero;
};

RenderContext.prototype.updateTextTransform = function (target, tempMatrix) {
    var i = 0, childrens = null, len = 0, child = null;
    var isGameView = Engine._curRenderContext === Engine._renderContext;
    if (isGameView && target._renderObj) {
        if (target._renderObj.dirty) {
            target._renderObj.updateText();
            target._renderObj.dirty = false;
        }
        target._renderObj.worldTransform = _getNewMatrix23(target._renderObj, tempMatrix);
    }
    // @ifdef EDITOR
    else if (target._renderObjInScene) {
        if (target._renderObjInScene.dirty) {
            target._renderObjInScene.updateText();
            target._renderObjInScene.dirty = false;
        }
        target._renderObjInScene.worldTransform = _getNewMatrix23(target._renderObjInScene, tempMatrix);
    }
    // @endif
};
