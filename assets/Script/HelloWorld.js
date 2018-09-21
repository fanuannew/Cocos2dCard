var Decks = require('Decks');
var card = {
    point: 12,
    suit: 4,
    pointName: "Q"
}
var cards = new Array(52); //使用陣列儲存一副牌
var pos = 0;
var cardint = 0;
var hostCards = new Array(2);
var playerCards = new Array(2);
var nums = 4;
var gameState = 0; //遊戲狀態
cc.Class({
    extends: cc.Component,

    properties: {
        cardPrefab: cc.Prefab,
        anchorCards: cc.Node,
        hostLabel: cc.Label,
        playerLabel: cc.Label,
        restartNode: cc.Node,
        cardPrefab: {
            default: null,
            type: cc.Prefab
        },
        btnShowCard: {
            default: null,
            type: cc.Button
        },
        // 星星产生后消失时间的随机范围
        maxStarDuration: 0,
        minStarDuration: 0,
        cardint,
        // 地面节点，用于确定星星生成的高度
        numberOfDecks: {
            default: 1,
            type: 'Integer'
        }

    },



    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},
    onLoad: function () {
        //this.btnShowCard.node.on('click', this.showCard(), this);
        this.decks = new Decks(this.numberOfDecks);
        this.shuffleCard(); //初始化一副亂數牌
        gameState = 1;
        // 获取地平面的 y 轴坐标
        //this.groundY = this.ground.y + this.ground.height / 2;
        // 初始化计时器
        //this.timer = 0;

        // 初始化计分
        //this.score = 0;
    },
    gameOver: function () {
        this.player.stopAllActions(); //停止 player 节点的跳跃动作
        cc.director.loadScene('HelloWorld');
    },
    showCard: function (show) { //this.decks.draw()
        var _self = this;
        if (show != true) { show = false; }
        //this.node.addChild(newCard);
        // 为星星设置一个随机位置
        for (let i = 0; i < nums; i++) { //nums
            var newCard;
            setTimeout(function () {
                newCard = cc.instantiate(_self.cardPrefab).getComponent('Card');
                _self.anchorCards.addChild(newCard.node);
                newCard.init(_self.cardRandom()); //原傳入值card
                newCard.reveal(show);
                if (i % 2 == 0) {
                    var startPos = cc.v2(pos, -100);
                } else {
                    var startPos = cc.v2(pos, 100);
                    pos += 50;

                }
                newCard.node.setPosition(cc.v2(100, 300));
                //this.flyCard(newCard, startPos); //飛牌特效
                _self.flyCard(newCard, startPos);
            }, 500 * i);
        }

        //var index = this.actor.cards.length - 1;
        //var endPos = cc.v2(this.cardSpace * index, 0);

        //newCard.setPosition(this.getNewStarPosition());
        //newStar.getComponent('Card').game = this;
    },
    getNewStarPosition: function () {
        var randX = 0;
        // 根据地平面位置和主角跳跃高度，随机得到一个星星的 y 坐标
        var randY = this.groundY + cc.random0To1() * 5 + 50;
        // 根据屏幕宽度，随机得到一个星星 x 坐标
        var maxX = this.node.width / 2;
        randX = cc.randomMinus1To1() * maxX;
        // 返回星星坐标
        return cc.p(randX, randY);
    },
    restart: function () { //重新一局
        var _self = this;
        this.anchorCards.removeAllChildren();
        cc.find('Canvas/anchorCards').children.forEach(function (node, key) {
            _self.anchorCards.removeChild(node);
            console.log("移除子節點: " + key);
        });
        cardint = 0;
        nums = 4;
        pos = 0;
        this.shuffleCard(); //初始化一副亂數牌
        gameState = 1;
        this.restartNode.active = false;
        this.hostLabel.node.active = false;
        this.playerLabel.node.active = false;
        hostCards = new Array(2);
        playerCards = new Array(2);
    },

    update: function (dt) {


    },
    transform: function () { //翻牌
        var _self = this;
        console.log("子節點數量: " + cc.find('Canvas/anchorCards').childrenCount);
        cc.find('Canvas/anchorCards').children.forEach(function (node, key) {
            if (node.getComponent('Card').point.node.active == false) {
                let action = cc.sequence(
                    cc.rotateBy(0.5, 0, 90),
                    cc.callFunc(function (target) {
                        //var card = cc.find('cardPrefab', this.anchorCards).getComponent('Card');
                        node.scaleX = -node.scaleX
                        node.getComponent('Card').reveal(true);
                        console.log("紙牌點數: " + node.getComponent('Card').number.string + ",key值:" + key);
                    }),
                    cc.rotateBy(0.5, 0, 90),
                );
                action.easing(cc.easeExponentialInOut(2.0));
                node.runAction(action);
            }
        }); //動畫結束，使用不同步處理
        cc.find('Canvas/anchorCards').children.forEach(function (node, key) {
            if (key % 2 == 0) {
                playerCards[Math.floor(key / 2)] = node.getComponent('Card').number.string;
            } else {
                hostCards[Math.floor(key / 2)] = node.getComponent('Card').number.string; //存到莊家手裡
            }

        });
        this.anchorCards.runAction(cc.sequence( //檢查是否要補牌
            cc.delayTime(1.5),
            cc.callFunc(function (target) { _self.assertCard() }, _self)//_self.assertCard()
        ));
        //this.assertCard(); //想辦法延遲執行

    },
    assertCard: function () { //判斷莊家還是玩家需要補牌
        let gainCard = true;
        console.log("莊家牌2: " + hostCards[1]);
        console.log("莊家牌的數量: " + hostCards.length);
        let hostPoint = 0;
        let playerPoint = 0;
        for (let i = 0; i < hostCards.length; i++) {
            hostCards[i] > 10 ? (hostPoint += 10) : (hostPoint += hostCards[i]);
            //hostPoint += hostCards[i];
        }
        for (let i = 0; i < playerCards.length; i++) {
            playerCards[i] > 10 ? (playerPoint += 10) : (playerPoint += playerCards[i]);
            //playerPoint += playerCards[i];
        }
        if (playerPoint % 10 == 8 || playerPoint % 10 == 9) { //閒家8或9直接比大小
            this.playerLabel.string = "";//比大小
            this.playerLabel.node.active = true;
            gainCard = false;
            this.checkwinwin(); //直接檢查勝負
        } else if (playerPoint % 10 == 6 || playerPoint % 10 == 7) { //閒家不補牌
            gainCard = false;
            this.hostLabel.string = "莊家補牌";
            this.hostLabel.node.active = true;
        }
        if (hostPoint % 10 == 8 || hostPoint % 10 == 9) { //閒家8或9直接比大小
            this.hostLabel.string = ""; //比大小
            this.hostLabel.node.active = true;
            gainCard = false;
            this.checkwinwin();//直接檢查勝負
        }
        if (gainCard & hostCards.length < 3) {
            //nums = 1;
            //this.showCard();
            this.playerLabel.string = "玩家請翻牌";
            this.playerLabel.node.active = true;
            this.playerAddCard();

        }


    },
    playerAddCard: function () {
        nums = 1;
        this.showCard(false);
        //cc.find('Canvas/anchorCards').children.forEach(function (node, key) { node.getComponent('Card').reveal(true); });
    },
    hostAddCard: function () { //莊家補牌

    },
    checkwinwin: function () { //判斷莊家還是玩家輸贏
        var _self = this;
        let hostPoint = 0;
        let playerPoint = 0;
        for (let i = 0; i < hostCards.length; i++) {
            hostCards[i] > 10 ? (hostPoint += 10) : (hostPoint += hostCards[i]);
            //hostPoint += hostCards[i];
        }
        for (let i = 0; i < playerCards.length; i++) {
            playerCards[i] > 10 ? (playerPoint += 10) : (playerPoint += playerCards[i]);
            //playerPoint += playerCards[i];
        }
        console.log("莊家總點數: " + hostPoint + ", 玩家總點數: " + playerPoint);
        if (hostPoint % 10 > playerPoint % 10) {
            this.node.runAction(cc.sequence(
                cc.delayTime(1),
                cc.callFunc(function (target) {
                    _self.hostLabel.string = "莊家贏!!";
                    _self.hostLabel.node.active = true;
                }, _self),
                cc.delayTime(1),
                cc.callFunc(function (target) {
                    _self.restartNode.active = true;
                }, _self),
            ));

            return true; //莊家贏
        } else if (hostPoint % 10 < playerPoint % 10) {
            this.node.runAction(cc.sequence(
                cc.delayTime(1),
                cc.callFunc(function (target) {
                    _self.hostLabel.string = "玩家贏!!";
                    _self.hostLabel.node.active = true;
                }, _self),
                cc.delayTime(1),
                cc.callFunc(function (target) {
                    _self.restartNode.active = true;
                }, _self),
            ));

            return false;
        } else {
            this.node.runAction(cc.sequence(
                cc.delayTime(1),
                cc.callFunc(function (target) {
                    _self.hostLabel.string = "平局!!";
                    _self.hostLabel.node.active = true;
                }, _self)
            ));
            return "";
        }
    },
    gainScore: function () {
        this.score += 1;
        // 更新 scoreDisplay Label 的文字
        this.scoreDisplay.string = 'Score: ' + this.score.toString();
        // 播放得分音效
        cc.audioEngine.playEffect(this.scoreAudio, false);
    },
    //飛牌動畫效果
    flyCard: function (cardnew, position, endFly = false) {
        let self = this;
        //cardnew.stopAllActions();
        let action = cc.sequence(
            cc.moveTo(1, position),
            cc.callFunc(function () {
                if (endFly) {
                    //self.cardPool.put(cardnew);
                    //self.card.splice(0, 1);
                };
            })
        );
        action.easing(cc.easeElasticInOut(3.0));
        cardnew.node.runAction(action);
    },
    //卡牌亂數產生function
    cardRandom: function () {
        let rt = 0, rc = 0;
        let reString = '';

        let ci = cards[cardint];
        //產生牌數字
        //rt = Math.floor(Math.random() * (12 - 0 + 1)) + 1;//亂數產生1~13
        rt = ci % 13 + 1;
        reString = rt.toString();
        //rc = Math.floor(Math.random() * (3 - 0 + 1)) + 1;//亂數產生1~4
        rc = Math.floor(ci / 13) + 1;
        switch (rt) {
            case 1:
                reString = "A";
                break;
            case 11:
                reString = "J";
                break;
            case 12:
                reString = "Q";
                break;
            case 13:
                reString = "K";
                break;
        };
        var cardran = {
            point: rt,
            suit: rc,
            pointName: reString
        }
        cardint++;
        return cardran;
    },

    shuffleCard: function () { //洗牌
        var cardnum = new Array(52);
        var cardstr = "";
        let ci = 0;
        for (let i = 0; i < 52; i++) { //初始化一副排列整齊的牌
            cardnum[i] = i;
        }
        for (let i = 0; i < 52; i++) {
            let randomNum = Math.floor(Math.random() * 52);
            if (cardnum[randomNum] != "") {
                cards[ci] = cardnum[randomNum]; //推送到cards陣列
                cardstr += "," + cardnum[randomNum];
                cardnum[randomNum] = "";
                ci++;
            } else {
                // while (cardnum[randomNum] == "") {
                //     randomNum++; 
                // }
                // cards.push(cardnum[randomNum]); //推送到cards陣列
                // cardstr += "," + cardnum[randomNum];
                // cardnum[randomNum] = "";
            }
        }
        console.log("測試洗牌: " + cardstr); //輸入排列完的牌 偵錯
    }

});

