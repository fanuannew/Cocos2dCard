cc.Class({
    extends: cc.Component,

    properties: {
        // nodes
        point: cc.Label,
        suit: cc.Sprite,
        mainPic: cc.Sprite,
        cardBG: cc.Sprite,
        number: cc.Label,
        // resources
        redTextColor: cc.Color.WHITE,
        blackTextColor: cc.Color.WHITE,
        texFrontBG: cc.SpriteFrame,
        texBackBG: cc.SpriteFrame,
        texFaces: {
            default: [],
            type: cc.SpriteFrame
        },
        texSuitBig: {
            default: [],
            type: cc.SpriteFrame
        },
        texSuitSmall: {
            default: [],
            type: cc.SpriteFrame
        }
    },

    // use this for initialization
    init: function (card) {
        var isFaceCard = card.point > 10;
        this.number.string = card.point; //傳入隱藏的label保存數字

        if (isFaceCard) {
            this.mainPic.spriteFrame = this.texFaces[card.point - 10 - 1];
        }
        else {
            this.mainPic.spriteFrame = this.texSuitBig[card.suit - 1];
        }

        // for jsb
        this.point.string = card.pointName;

        if (card.suit == 2 || card.suit == 4) { //原card.isRedSuit
            this.point.node.color = this.redTextColor;
        }
        else {
            this.point.node.color = this.blackTextColor;
        }

        this.suit.spriteFrame = this.texSuitSmall[card.suit - 1];
    },

    reveal: function (isFaceUp) {
        this.point.node.active = isFaceUp;
        this.suit.node.active = isFaceUp;
        this.mainPic.node.active = isFaceUp;
        this.cardBG.spriteFrame = isFaceUp ? this.texFrontBG : this.texBackBG;
    },
});
