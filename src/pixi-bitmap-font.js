PIXI.BitmapText.prototype.updateTransform = function () {
};

// unload asset
Fire.BitmapFont.prototype._onPreDestroy = function () {
    Fire.Asset.prototype._onPreDestroy.call(this);
    if (this._uuid) {
        PIXI.BitmapText.fonts[this._uuid] = null;
    }
};

var defaultFace = "None";

function _getStyle (target) {
    if (target.bitmapFont && target.bitmapFont._uuid) {
        return {
            font : target.bitmapFont.size + " " + target.bitmapFont._uuid,
            align: Fire.TextAlign[target.align].toLowerCase(),
        };
    }
    else {
        return {
            font : 1 + " " + defaultFace,
            align: "left",
        };
    }
}

function _setStyle (target) {
    var style = _getStyle(target);
    var obj = Fire.Engine._renderContext.getRenderObj(target);
    if (obj) {
        obj.setStyle(style);
    }
    // @ifdef EDITOR
    obj = Fire.Engine._renderContext.getRenderObjInScene(target);
    if (obj) {
        obj.setStyle(style);
    }
    // @endif
}

function _getNewMatrix23 (child, tempMatrix) {
    var mat = new Fire.Matrix23();
    mat.a = child.scale.x;
    mat.b = 0;
    mat.c = 0;
    mat.d = child.scale.y;
    mat.tx = child.position.x;
    mat.ty = -child.position.y;

    mat.prepend(tempMatrix);

    mat.b = -mat.b;
    mat.c = -mat.c;
    mat.ty = Fire.Engine._curRenderContext.renderer.height - mat.ty;
    return mat;
}
var tempData = {
    face      : defaultFace,
    size      : 1,
    chars     : {},
    lineHeight: 1
};

function _registerFont (bitmapFont) {
    var data = {};
    if (bitmapFont && bitmapFont._uuid) {
        data.face = bitmapFont._uuid;
        data.size = bitmapFont.size;
        data.lineHeight = bitmapFont.lineHeight;
        data.chars = {};

        if (bitmapFont.texture) {
            var img = new PIXI.BaseTexture(bitmapFont.texture.image);

            var charInfos = bitmapFont.charInfos, len = charInfos.length;
            for (var i = 0; i < len; i++) {
                var charInfo = charInfos[i];
                var id = charInfo.id;
                var textureRect = new PIXI.Rectangle(
                    charInfo.x,
                    charInfo.y,
                    charInfo.width,
                    charInfo.height
                );

                if ((textureRect.x + textureRect.width) > img.width || (textureRect.y + textureRect.height) > img.height) {
                    Fire.error('Character in %s does not fit inside the dimensions of texture %s', bitmapFont.name, bitmapFont.texture.name);
                    break;
                }

                var texture = new PIXI.Texture(img, textureRect);

                data.chars[id] = {
                    xOffset : charInfo.xOffset,
                    yOffset : charInfo.yOffset,
                    xAdvance: charInfo.xAdvance,
                    kerning : {},
                    texture : texture
                };
            }
        }
        else {
            Fire.error('Invalid texture of bitmapFont: %s', bitmapFont.name);
        }

        var kernings = bitmapFont.kernings;
        for (var j = 0; j < kernings.length; j++) {
            var kerning = kernings[j];
            var first = kerning.first;
            var second = kerning.second;
            var amount = kerning.amount;
            data.chars[second].kerning[first] = amount;
        }
    }
    else {
        data = tempData;
    }
    PIXI.BitmapText.fonts[data.face] = data;
}

var _hasPixiBitmapFont = function (bitmapFont) {
    if (bitmapFont) {
        return PIXI.BitmapText.fonts[bitmapFont._uuid];
    }
    return null;
};

function _getSize (obj) {
    if (obj) {
        if (obj.dirty) {
            obj.updateText();
            obj.dirty = false;
        }
        return new Vec2(obj.textWidth, obj.textHeight);
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

RenderContext.prototype.setText = function (target, newText) {
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

RenderContext.prototype.setAlign = function (target) {
    _setStyle(target);
};

RenderContext.prototype.updateBitmapFont = function (target) {
    _registerFont(target.bitmapFont);
    _setStyle(target);
};

RenderContext.prototype.addBitmapText = function (target) {
    _registerFont(target.bitmapFont);

    var style = _getStyle(target);

    var inGame = !(target.entity._objFlags & HideInGame);
    if (inGame) {
        target._renderObj = new PIXI.BitmapText(target.text, style);
        target.entity._pixiObj.addChildAt(target._renderObj, 0);
    }
    if (this.sceneView) {
        target._renderObjInScene = new PIXI.BitmapText(target.text, style);
        target.entity._pixiObjInScene.addChildAt(target._renderObjInScene, 0);
    }
};

RenderContext.prototype.updateBitmapTextTransform = function (target, tempMatrix) {
    var i = 0, childrens = null, len = 0, child = null;
    var isGameView = Engine._curRenderContext === Engine._renderContext;
    if (isGameView && target._renderObj) {
        if (target._renderObj.dirty) {
            target._renderObj.updateText();
            target._renderObj.dirty = false;
        }
        childrens = target._renderObj.children;
        for (len = childrens.length; i < len; i++) {
            child = childrens[i];
            child.worldTransform = _getNewMatrix23(child, tempMatrix);
        }
    }
    // @ifdef EDITOR
    else if (target._renderObjInScene) {
        if (target._renderObjInScene.dirty) {
            target._renderObjInScene.updateText();
            target._renderObjInScene.dirty = false;
        }
        childrens = target._renderObjInScene.children;
        for (i = 0, len = childrens.length; i < len; i++) {
            child = childrens[i];
            child.worldTransform = _getNewMatrix23(child, tempMatrix);
        }
    }
    // @endif
};
