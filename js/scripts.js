let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');

let curWidth;
let curHeight;
let canvasLeft = canvas.offsetLeft;
let canvasTop = canvas.offsetTop;

const Figure = {ROCK:"Камень", SCISSORS:"Ножницы", PAPER:"Бумага"};
const Color = {ORANGE:"rgb(185,122,87)", GREEN:"rgb(104,169,139)", BLACK:"rgb(0,0,0)", YELLOW:"rgb(213,181,134)", PINK:"rgb(196,140,111)"};
const PlayerState = {FIGURE_CHOICE:1, CHOICE_IS_MADE:2, REFUND_READY:3};
const EnemyState = {ADDRESS_CHOICE:-1, WAIT_ENEMY_CHOICE:-2, CHOICE_IS_MADE:-3};
const ObjectType = {MAIN_PARTS:100, BUTTON_BACK:101, PLAYER_FIGURE:102, ENEMY_FIGURE:103, BET:104, THREE_FIGURES:105, ENEMY_ADDRESS:106, DOTS:107, ADDRESSES_LIST:108};
const Font = {TIME_NEW_ROMAN:"Times New Roman",ARIAL:"Arial",CALIBRI:"Calibri"};
let whMin = canvas.width;

let curPlayerFigure = Figure.ROCK;
let curEnemyFigure = Figure.ROCK;
let curPlayerState = PlayerState.FIGURE_CHOICE;
let curEnemyState = EnemyState.ADDRESS_CHOICE;
let input = {bet:null, enemyAddress:null};
let elements = [];
let addressesList = {enemyAddresses: [], enemyRates: []};
let timerStop = true;


let checkInterval = null;

canvas.addEventListener('click', canvasOnClick, false);
window.addEventListener('resize', resizeCanvas, false);

if(metamaskCheck()) {
    resizeCanvas();
    init();
}

function resizeCanvas() {
    canvas.width = curWidth = window.innerWidth;
    canvas.height = curHeight = window.innerHeight;
    whMin = canvas.width;
    if(whMin > canvas.height) whMin = canvas.height;
	
	
	if (input.bet != null){
		input.bet.style.width = 80;
		input.bet.style.height = 25;
		input.bet.style.left = curWidth/4-40;
		input.bet.style.top = curHeight/2;	

		input.enemyAddress.style.width = curWidth/3;
		input.enemyAddress.style.height = 25;
		input.enemyAddress.style.left = curWidth/2+curWidth/12;
		input.enemyAddress.style.top = curHeight/5;			
	}	

    draw();
}

function init() {
    input.bet = createInput(curWidth/4-40, curHeight/2, 80, 25, 0.01, ObjectType.BET);
    input.enemyAddress = createInput(curWidth/2+curWidth/12, curHeight/5, curWidth/3, 25, "", ObjectType.ENEMY_ADDRESS);

    input.bet.value = "0.01";
    input.enemyAddress.value = "0x7d26358bacbB5a1F5aaBbC01d67B7Ff6eEAC5F9C";

    timerStop = false;
    getAddressesList(10);
    let addressesUpdater = setInterval(function () {
        if(!timerStop){
            getAddressesList(10);
        }
    }, 60000);
}

function colorToHex(color) {
    function componentToHex(c) {
        const hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }
    function rgbToHex(r, g, b) {
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }
    const rgb = color.substring(4, color.length-1).split(",");
    return rgbToHex(Number(rgb[0]),Number(rgb[1]),Number(rgb[2]));
}
function fillTriangle(pars, color) {
    if(pars && pars.length==3){
        if(pars[0] && pars[0].length==2 &&
            pars[1] && pars[1].length==2 &&
            pars[2] && pars[2].length==2)
        {
            if(color) {
                context.fillStyle = color;
            }
            context.beginPath();
            context.moveTo(pars[0][0], pars[0][1]);
            context.lineTo(pars[1][0], pars[1][1]);
            context.lineTo(pars[2][0], pars[2][1]);
            context.fill();
        }
    }
}

function fillRect(pos, w, h, color) {
    if(pos.length == 2) {
        if(color) {
            context.fillStyle = color;
        }
        context.fillRect(pos[0], pos[1], w, h);
    }
}
function fillText(text, pos, options) {
    if(pos.length == 2 && text != ""){
        if(options) {
            if(options.font && Number.isInteger(options.font.px) && options.font.style){
                context.font = options.font.px + 'px ' + options.font.style;
            }
            if (options.color) {
                context.fillStyle = options.color;
            }
        }
        context.fillText(text, pos[0], pos[1]);
    }
}
function fillCircle(pos, r, color) {
    if(pos.length==2) {
        context.beginPath();
        if (color) {
            context.fillStyle = color;
        }
        context.arc(pos[0], pos[1], r, 0, Math.PI*2, true);
        context.fill();
    }
}
function createImg(src, pos, w, h) {
    if(src && src !="" && pos.length==2) {
        let img = new Image();
        img.src = src;
        img.onload = function () {
            context.drawImage(img, pos[0], pos[1], w, h);
        }
    }
}
function plusVector(pars, vector) {
    let result = pars;
    if(Array.isArray(pars[0])){
        for (let i=0; i<pars.length; i++) {
            if(pars[i].length==2 && vector.length==2){
                result[i][0] = pars[i][0]+vector[0];
                result[i][1] = pars[i][1]+vector[1];
            }
        }
    }else{
        result[0] = pars[0]+vector[0];
        result[1] = pars[1]+vector[1];
    }
    return result;
}
function getSrc(figure){
    let result;
    if(figure){
        if(figure.player){
            switch (figure.player) {
                case Figure.ROCK: result = "images/Л_Камень.png"; break;
                case Figure.SCISSORS: result = "images/Л_Ножницы.png"; break;
                default/*Figure.PAPER*/: result = "images/Л_Бумага.png"; break;
            }
        }else{
            switch (figure.enemy) {
                case Figure.ROCK: result = "images/П_Камень.png"; break;
                case Figure.SCISSORS: result = "images/П_Ножницы.png"; break;
                default/*Figure.PAPER*/: result = "images/П_Бумага.png"; break;
            }
        }
    }
    return result;
}
function setState(obj) {
    for(let key in obj){
        switch(key) {
            case "player":{
                if(obj[key].state){
                    curPlayerState = obj[key].state;
                }
                if(obj[key].figure){
                    curPlayerFigure = obj[key].figure;
                }
            }break;
            case "enemy":{
                if(obj[key].state){
                    curEnemyState = obj[key].state;
                }
                if(obj[key].figure) {
                    curEnemyFigure = obj[key].figure;
                }
            }break;
        }
    }
    draw();
}

function canvasOnClick(event) {
    let x = event.pageX - canvasLeft;
    let y = event.pageY - canvasTop;

    function checkAndWork(elements){
        elements.forEach(function(element) {
            if (y>element.pars.y && y<element.pars.y + element.pars.h
                && x>element.pars.x && x<element.pars.x + element.pars.w) {
                if(element.subElements && element.subElements.length>0){
                    checkAndWork(element.subElements);
                }else{
                    if(element.func){
                        element.func()
                    }
                }
            }
        });
    }

    checkAndWork(elements);
}

function fixText(my_text,my_width) {    
    var testWidth = context.measureText(my_text).width;
    if (testWidth > my_width) {
        
        return my_text.substring(0,my_text.length-(testWidth - my_width)/9.001)+"...";
    } else    
    return my_text;
}
function hideNonCanvasElements() {
    for(let key in input){
        if(input[key] && input[key].style){
            input[key].style.display = "none";
        }
    }
}
function showNonCanvasElement(objType) {
    let objToCheck = null;
    switch(objType) {
        case ObjectType.BET: objToCheck = input.bet; break;
        default /*ObjectType.ENEMY_ADDRESS*/: objToCheck = input.enemyAddress; break;
    }
    if(objToCheck && objToCheck.style){
        objToCheck.style.display = "block";
    }
}

function drawObject(objType, argsObj) {//Рисуем объект согласно переданному типу
    
    const halfWidth = curWidth/2;
    const halfHeight = curHeight/2;
    const mainAddressWidth = curWidth/3;//Ширина панели адреса
    const enemyBetWidth = 70;//Ширина вражеской ставки
    const mainAddressHeight = curHeight/40;//Высота панели адреса
    const indentFromCenterX = (halfWidth-mainAddressWidth)/2;//Отступ от центра для списка адресов
    const indent = 5;//отступ между адресами

    switch (objType) {
        case ObjectType.MAIN_PARTS:{
            fillRect([0,0], halfWidth, curHeight, Color.ORANGE);
            fillRect([halfWidth,0], halfWidth, curHeight, Color.GREEN);
        }break;
        case ObjectType.BUTTON_BACK:{
            const width = curWidth/13;
            const height = curHeight/15;
            const heightDiv45 = height/3;
            const widthDiv20 = width/2;
            fillRect([0,0], width, height, Color.GREEN);
            fillTriangle(plusVector([[widthDiv20,heightDiv45],[widthDiv20,heightDiv45*2],[width/3,height/2]],[widthDiv20/8, 0]), Color.BLACK);
            const onclick = function(){
                const resultIsDone = refundChoice();
                if(resultIsDone){
                    setState({player:{state:PlayerState.FIGURE_CHOICE},enemy:{state:EnemyState.ADDRESS_CHOICE}});
                }
            };
            elements.push({type:objType, pars:{x:0,y:0,w:width,h:height}, func:onclick});
        }break;
        case ObjectType.ENEMY_ADDRESS:{
            const posX = halfWidth+halfWidth/2;
            const posY = curHeight/5;
            context.font = "22px "+Font.CALIBRI;            
            context.textAlign='center';
            fillText("Enemy address", [posX, posY-indent*3]);
            showNonCanvasElement(ObjectType.ENEMY_ADDRESS);
            elements.push({type:objType, pars:{x:posX-mainAddressWidth/2-indent,y:posY-indent}});
        }break;
        case ObjectType.ADDRESSES_LIST:{
            const enemyBetIndentWidth = mainAddressWidth-enemyBetWidth;
            const mainAddressBlock = curHeight/5+6*indent;//высота панели ввода адреса
            const height = 26;
            const itemAddressBlock = height+indent;//высота панели выбора адреса с отступом
            const addresses = addressesList.enemyAddresses;
            const posX = halfWidth+indentFromCenterX;
            let pars = [];
            //Рисуем желтые прямоугольники
            context.fillStyle = Color.YELLOW;
            for(let i=0; i<addresses.length; i++) {
                if(addresses[i] && addressesList.enemyRates[i]) {
                    const pos = [posX, mainAddressBlock + (itemAddressBlock) * i];
                    fillRect(pos, mainAddressWidth, height);
                    pars.push(pos);
                }
            }
            elements.push({type:objType, pars:{x:posX,y:mainAddressBlock,w:mainAddressWidth,h:(height+indent)*addresses.length}, func:onclick, subElements:[]});
            const curElemIndex = elements.length-1;
            //Рисуем розовые прямоугольники
            context.fillStyle = Color.PINK;
            for(let i=0; i<addresses.length; i++) {
                if(addresses[i] && addressesList.enemyRates[i]) {
                    fillRect([pars[i][0] + enemyBetIndentWidth, pars[i][1]], enemyBetWidth, height);
                }
            }

            //Рисуем текст адресов
            const addressTextIndentY = height/3*2;
            const addressTextIndentX = mainAddressWidth/30;
            const betTextIndentX = enemyBetWidth/10;

            context.textAlign='left';
            context.fillStyle = Color.BLACK;
            for (let i=0; i<addresses.length; i++) {
                if(addresses[i] && addressesList.enemyRates[i]){
                    const bet = addressesList.enemyRates[i];
                    context.font = "15px COURIER NEW";
                    const address = fixText(addresses[i],mainAddressWidth-enemyBetWidth*2);
                    context.textAlign='left';
                    context.fillText((i+1)+". "+address,pars[i][0]+addressTextIndentX,pars[i][1]+addressTextIndentY);
                    context.font = "15px "+Font.CALIBRI;
                    context.textAlign='right';
                    context.fillText(bet+" eth",pars[i][0]+enemyBetIndentWidth+enemyBetWidth-betTextIndentX,pars[i][1]+addressTextIndentY);
                    const posY = mainAddressBlock+(itemAddressBlock)*i;
                    const onclick = function(){
                        input.enemyAddress.value = addresses[i];
                        input.bet.value = bet;
                    };
                    elements[curElemIndex].subElements.push({pars:{x:posX,y:posY,w:mainAddressWidth+enemyBetWidth,h:height}, func:onclick});
                }
            }
        }break;
        case ObjectType.BET:{
            const posX = halfWidth/2;
            const height = mainAddressHeight-mainAddressHeight/4;
            const betInputHalfHeight = height/2;
            const betInputPosY = halfHeight-betInputHalfHeight;
            //Рисуем текст и прямоугольник
            context.font = "22px "+Font.CALIBRI;
            context.textAlign='center';        
            context.fillStyle = Color.BLACK;
            fillText("Bet",[posX,curHeight/2-indent*2]);
            showNonCanvasElement(ObjectType.BET);
            //Рисуем кнопки
            const betLeftButtonPosX = posX-40;
            const betRightButtonPosX = posX+40;
            const betInputHeightDiv4 = 24;
            const betButtonPosY1 = curHeight/2+betInputHeightDiv4;
            const betButtonPosY2 = curHeight/2;
            const betLeftButtonPosX3 = betLeftButtonPosX-betInputHeightDiv4/2;
            const betButtonPosY3 = curHeight/2+betInputHeightDiv4/2;
            const betRightButtonPosX3 = betRightButtonPosX+betInputHeightDiv4/2;
            fillTriangle([[betLeftButtonPosX,betButtonPosY1],[betLeftButtonPosX,betButtonPosY2],[betLeftButtonPosX3,betButtonPosY3]]);
            fillTriangle([[betRightButtonPosX,betButtonPosY1],[betRightButtonPosX,betButtonPosY2],[betRightButtonPosX3,betButtonPosY3]]);

            elements.push({type:objType, pars:{x:betLeftButtonPosX3,y:betButtonPosY2,w:betRightButtonPosX3-betLeftButtonPosX3,h:betButtonPosY1-betButtonPosY2}, subElements:[]});
            const curElemIndex = elements.length-1;

            const onLeftClick = function(){
                if(!isNaN(input.bet.value)) {
                    var betValue = Number(input.bet.value);
                    if(betValue!=0) {
                        input.bet.value = betValue - 0.01;
                    }
                }
            };
            const onRightClick = function(){
                if(!isNaN(input.bet.value)) {
                    const betValue = Number(input.bet.value);
                    if(betValue!=0) {
                        input.bet.value = betValue + 0.01;
                    }
                }
            };
            elements[curElemIndex].subElements.push({pars:{x:betLeftButtonPosX3,y:betButtonPosY2,w:betLeftButtonPosX-betLeftButtonPosX3,h:betButtonPosY1-betButtonPosY2}, func:onLeftClick});
            elements[curElemIndex].subElements.push({pars:{x:betRightButtonPosX,y:betButtonPosY2,w:betRightButtonPosX3-betRightButtonPosX,h:betButtonPosY1-betButtonPosY2}, func:onRightClick});

        }break;
        case ObjectType.DOTS:{
            const startDotPosX = halfWidth+halfWidth/2;
            const indentBetweenDots = halfWidth/10;
            const radius = mainAddressHeight/2;
            context.fillStyle = Color.ORANGE;
            fillCircle([startDotPosX,halfHeight], radius);
            fillCircle([startDotPosX-indentBetweenDots,halfHeight], radius);
            fillCircle([startDotPosX+indentBetweenDots,halfHeight], radius);
        }break;
        case ObjectType.PLAYER_FIGURE:{
            const imgW = 636;
            const imgH = 338;
            const imgPosX = 0;
            const imgPosY = curHeight/3;
            //Рисуем фигуру игрока, если её выбрали
            if(argsObj.figures) {
                createImg(getSrc(argsObj.figures),[imgPosX,imgPosY], imgW, imgH);
                // const onclick = function(){
                //
                // };
                // elements.push({type:objType, pars:{x:imgPosX,y:imgPosY,w:imgW,h:imgH}, func:onclick});
            }
        }break;
        case ObjectType.ENEMY_FIGURE:{
            //Рисуем фигуру противника, если её выбрали
            if(argsObj.figures) {
                const imgW = 636;
                const imgH = 338;
                const imgPosX = curWidth-imgW;
                const imgPosY = curHeight/3;
                createImg(getSrc(argsObj.figures),[imgPosX,imgPosY], imgW, imgH);
                // const onclick = function(){
                //
                // };
                // elements.push({type:objType, pars:{x:imgPosX,y:imgPosY,w:imgW,h:imgH}, func:onclick});
            }
        }break;
        case ObjectType.THREE_FIGURES:{ 
            const imgW = 338/3000*whMin;
            const imgH = 636/3000*whMin;
            const indent = curWidth/40;
            const imgPosX1 = halfWidth/2-imgW/2;
            const imgPosX2 = imgPosX1-indent-imgW;
            const imgPosX3 = imgPosX1+indent+imgW;
            const imgPosY = curHeight-imgH;
            //Рисуем три фигуры для выбора
            createImg("images/Н_Камень.png",[imgPosX2,imgPosY], imgW, imgH);
            createImg("images/Н_Ножницы.png",[imgPosX1,imgPosY], imgW, imgH);
            createImg("images/Н_Бумага.png",[imgPosX3,imgPosY], imgW, imgH);

            elements.push({type:objType, pars:{x:imgPosX2,y:imgPosY,w:3*imgW+3*indent,h:3*imgH+3*indent}, subElements:[]});
            const curElemIndex = elements.length-1;

            const onRockClick = function(){
                setFullFigureAndKeccak(Figure.ROCK);
                confirmChoice();
                setState({player:{figure:Figure.ROCK, state:PlayerState.CHOICE_IS_MADE},enemy:{state:EnemyState.WAIT_ENEMY_CHOICE}});
            };
            elements[curElemIndex].subElements.push({pars:{x:imgPosX2,y:imgPosY,w:imgW,h:imgH}, func:onRockClick});
            const onScissorsClick = function(){
                setFullFigureAndKeccak(Figure.SCISSORS);
                confirmChoice();
                setState({player:{figure:Figure.SCISSORS, state:PlayerState.CHOICE_IS_MADE},enemy:{state:EnemyState.WAIT_ENEMY_CHOICE}});
            };
            elements[curElemIndex].subElements.push({pars:{x:imgPosX1,y:imgPosY,w:imgW,h:imgH}, func:onScissorsClick});
            const onPaperClick = function(){
                setFullFigureAndKeccak(Figure.PAPER);
                confirmChoice();
                setState({player:{figure:Figure.PAPER, state:PlayerState.CHOICE_IS_MADE},enemy:{state:EnemyState.WAIT_ENEMY_CHOICE}});
            };
            elements[curElemIndex].subElements.push({pars:{x:imgPosX3,y:imgPosY,w:imgW,h:imgH}, func:onPaperClick});
        }break;
    }


}

function setFullFigureAndKeccak(figure) {
    let num;
    switch(figure) {
        case Figure.ROCK: {myFigureKeccak256 = "0xc22ce49e70b56bd285622d75a145185a0231c75bf5a79a50c87438ac46703c82"; num="01";}break;
        case Figure.SCISSORS: {myFigureKeccak256 = "0x11b9fe42140e03d40161ed63b7d96aaef3ca187986f317cfdd556b938dccb0bd"; num="02";}break;
        default/*Figure.PAPER*/: {myFigureKeccak256 = "0xca75793d0a6b66dee4f075111947d13b5cf19a6abdf6032aeccf0fe49ace540b"; num="03";}break;
    }
    myFullFigure = "0x090807060504"+num+"0201";

    jsAddFigure();
}

function createInput(posX, posY, w, h, defText, objType){
    let inputId = null;
    switch(objType){
        case ObjectType.BET: inputId = "betInput"; break;
        default /*ObjectType.ENEMY_ADDRESS*/: inputId = "enemyAddressInput"; break;
    }
    let elem = document.createElement("input");
    elem.id = inputId;
    elem.type = "text";
    elem.style.position = "absolute";
    elem.style.top = posY+"px";
    elem.style.left = posX+"px";
    elem.style.width = w+"px";
    elem.style.height = h+"px";
    elem.value = defText;
    $('#inputs').append(elem);

    switch(objType){
        case ObjectType.BET: elem.style.backgroundColor = Color.GREEN; elem.style.textAlign = "center"; input.bet = elem; break;
        default /*ObjectType.ENEMY_ADDRESS*/: elem.style.backgroundColor = Color.ORANGE; input.enemyAddress = elem; break;
    }

    return elem;
}

function getFigure(state) {
    const isPlayer = state>0;
    let result = {figures:{}};
    isPlayer ?result.figures.player=curPlayerFigure :result.figures.enemy=curEnemyFigure;
    return result;
}

// function getEnemyAddresses(size) {
//     return {addresses: getAddressesList(size)};
// }

function checkIfRefundReady() {
    checkInterval = setInterval(function () {
        const blockNumber = getBlockNumber();
        const webBlockNumber = getWebBlockNumber();
        if(Math.abs(blockNumber-webBlockNumber) < 128){
            setState({})
        }
    }, 600000);//10минут
}

function draw() {
    if(canvas.getContext){
        elements = [];//Очищаем хандлеры
        hideNonCanvasElements();//Скрываем не канвас элементы

        //Делим просстранство на две половинки
        drawObject(ObjectType.MAIN_PARTS);

        //Половинка игрока
        switch (curPlayerState) {
            case PlayerState.FIGURE_CHOICE:{
                //ставка
                drawObject(ObjectType.BET);
                //Выбор фигуры
                drawObject(ObjectType.THREE_FIGURES);
            }break;
            case PlayerState.CHOICE_IS_MADE:{
                //Фигура игрока
                drawObject(ObjectType.PLAYER_FIGURE, getFigure(curPlayerState));
                //Запускаем таймер проверки доступности возврата
                checkIfRefundReady()
            }break;
            case PlayerState.REFUND_READY:{
                //Кнопка назад
                drawObject(ObjectType.BUTTON_BACK);
                //Фигура игрока
                drawObject(ObjectType.PLAYER_FIGURE, getFigure(curPlayerState));
            }break;
        }

        //Половинка противника
        switch (curEnemyState) {
            case EnemyState.ADDRESS_CHOICE:{
                //Место для ввода адреса противника
                drawObject(ObjectType.ENEMY_ADDRESS);
                //Список адресов
                drawObject(ObjectType.ADDRESSES_LIST);
            }break;
            case EnemyState.WAIT_ENEMY_CHOICE:{
                //многоточие
                drawObject(ObjectType.DOTS);
            }break;
            case EnemyState.CHOICE_IS_MADE:{
                //Фигура противника
                drawObject(ObjectType.ENEMY_FIGURE, getFigure(curEnemyState));
            }break;
        }
    }
}
