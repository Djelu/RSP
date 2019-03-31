let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');

let curWidth;
let curHeight;

const Figure = {ROCK:"Камень", SCISSORS:"Ножницы", PAPER:"Бумага"};
const Color = {ORANGE:"rgb(185,122,87)", GREEN:"rgb(104,169,139)", BLACK:"rgb(0,0,0)", YELLOW:"rgb(213,181,134)", PINK:"rgb(196,140,111)"};
const PlayerState = {FIGURE_CHOICE:1, CHOICE_IS_MADE:2};
const EnemyState = {ADDRESS_CHOICE:-1, WAIT_ENEMY_CHOICE:-2, CHOICE_IS_MADE:-3};
const ObjectType = {MAIN_PARTS:100, BUTTON_BACK:101, PLAYER_FIGURE:102, ENEMY_FIGURE:103, BET:104, THREE_FIGURES:105, ENEMY_ADDRESS:106, DOTS:107, ADDRESSES_LIST:108};
const Font = {TIME_NEW_ROMAN:"Times New Roman",ARIAL:"Arial"};

let curPlayerFigure = Figure.ROCK;
let curEnemyFigure = Figure.ROCK;
let curPlayerState = PlayerState.FIGURE_CHOICE;
let curEnemyState = EnemyState.ADDRESS_CHOICE;
let input = {bet:null, enemyAddress:null};

window.addEventListener('resize', resizeCanvas, false);
resizeCanvas();

function resizeCanvas() {
    canvas.width = curWidth = window.innerWidth;
    canvas.height = curHeight = window.innerHeight;
    draw();
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
function clearRect(x, y, w, h){
    context.clearRect(x, y, w, h);
}
function strokeRect(x, y, w, h){
    context.strokeRect(x, y, w, h);
}
function xfillRect(x, y, w, h, rgb) {
    if(rgb && [3,4].includes(rgb.length)){
        context.fillStyle = rgb.length==3 ? 'rgb('+rgb[0]+','+rgb[1]+','+rgb[2]+')'
                                      :'rgba('+rgb[0]+','+rgb[1]+','+rgb[2]+','+rgb[3]+')';
    }
    context.fillRect(x, y, w, h);
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
function createInput(pos, w, h, options) {
    const font = options.font;
    const border = options.border;
    return !(pos.length==2&&font&&font.px&&font.style&&options.color)
        ?null
        :new CanvasInput({
            x: pos[0],
            y: pos[1],
            width: w,
            height: h,
            backgroundColor: options.color,
            canvas: canvas,
            fontSize: font.px,
            fontFamily: font.style,
            // fontColor: options.color,
            borderWidth: border&&border.width ?border.width :undefined,
            borderColor: border&&border.color ?border.color :undefined,
            borderRadius: border&&border.radius ?border.radius :undefined,
            // boxShadow: '1px 1px 0px #fff',
            // innerShadow: '0px 0px 5px rgba(0, 0, 0, 0.5)',
            // placeHolder: defText
        });
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

function drawObject(objType, argsObj) {//Рисуем объект согласно переданному типу
    
    const halfWidth = curWidth/2;
    const halfHeight = curHeight/2;
    const mainAddressWidth = curWidth/3;//Ширина панели адреса
    const enemyBetWidth = mainAddressWidth/12;//Ширина вражеской ставки
    const mainAddressHeight = curHeight/22;//Высота панели адреса
    const indentFromCenterX = (halfWidth-mainAddressWidth)/2;//Отступ от центра для списка адресов
    const indent = mainAddressHeight/3;//отступ между адресами

    switch (objType) {
        case ObjectType.MAIN_PARTS:{
            fillRect([0,0], halfWidth, curHeight, Color.ORANGE);
            fillRect([halfWidth,0], halfWidth, curHeight, Color.GREEN);
        }break;
        case ObjectType.BUTTON_BACK:{
            const widthDiv13 = curWidth/13;
            const heightDiv15 = curHeight/15;
            const heightDiv45 = heightDiv15/3;
            const widthDiv20 = widthDiv13/2;
            fillRect([0,0], widthDiv13, heightDiv15, Color.GREEN);
            fillTriangle(plusVector([[widthDiv20,heightDiv45],[widthDiv20,heightDiv45*2],[widthDiv13/3,heightDiv15/2]],[widthDiv20/8, 0]), Color.BLACK);
        }break;
        case ObjectType.ENEMY_ADDRESS:{
            const halfWidth = curWidth/2;
            const mainAddressPosX = halfWidth+indentFromCenterX;
            const mainAddressPosY = curHeight/5;
            // fillRect([mainAddressPosX,mainAddressPosY], mainAddressWidth, mainAddressHeight, Color.ORANGE);
            fillText("Адрес соперника", [mainAddressPosX+mainAddressWidth/8*3, mainAddressPosY-indent], {fontStyle:{px:20,style:Font.TIME_NEW_ROMAN},color:Color.BLACK})
            if(input.enemyAddress){
                input.enemyAddress.destroy();
                input.enemyAddress = null;
            }
            input.enemyAddress = createInput([mainAddressPosX,mainAddressPosY], mainAddressWidth-indent, mainAddressHeight-indent,
                                             {font:{px:18, style:Font.ARIAL}, color:Color.ORANGE, border:{width:1, color:Color.BLACK, radius:3}});
        }break;
        case ObjectType.ADDRESSES_LIST:{
            const enemyBetIndentWidth = mainAddressWidth-enemyBetWidth;
            const mainAddressBlock = curHeight/5+mainAddressHeight+2*indent;//высота панели ввода адреса
            const height = mainAddressHeight-mainAddressHeight/4;//высота панели выбора адреса
            const itemAddressBlock = height+indent;//высота панели выбора адреса с отступом
            if(argsObj.addresses){
                const addresses = argsObj.addresses;
                let pars = [];
                //Рисуем желтые прямоугольники
                context.fillStyle = Color.YELLOW;
                for(let i=0; i<addresses.length; i++) {
                    const pos = [halfWidth+indentFromCenterX,mainAddressBlock+(itemAddressBlock)*i];
                    fillRect(pos, mainAddressWidth, height);
                    pars.push(pos);
                }
                //Рисуем розовые прямоугольники
                context.fillStyle = Color.PINK;
                for(let i=0; i<addresses.length; i++) {
                    fillRect([pars[i][0]+enemyBetIndentWidth,pars[i][1]], enemyBetWidth, height);
                }
                //Рисуем текст адресов
                const addressTextIndentY = height/3*2;
                const addressTextIndentX = mainAddressWidth/30;
                const betTextIndentX = enemyBetWidth/10;
                context.font = "15px "+Font.TIME_NEW_ROMAN;
                context.fillStyle = Color.BLACK;
                for (let i=0; i<addresses.length; i++) {
                    if(addresses[i] && addresses[i].address){
                        context.fillText((i+1)+". "+addresses[i].address,pars[i][0]+addressTextIndentX,pars[i][1]+addressTextIndentY);
                        context.fillText(addresses[i].bet+" ETH",pars[i][0]+enemyBetIndentWidth+betTextIndentX,pars[i][1]+addressTextIndentY);
                    }else{
                        break;
                    }
                }
            }
        }break;
        case ObjectType.BET:{
            const widthDiv4 = curWidth/4;
            const widthDiv20 = curWidth/20;
            const height = mainAddressHeight-mainAddressHeight/4;
            const widthDiv40 = widthDiv20/2;
            const betInputPosX = widthDiv4-widthDiv40;
            const betInputHalfHeight = height/2;
            const betInputPosY = halfHeight-betInputHalfHeight;
            //Рисуем текст и прямоугольник
            // fillRect([betInputPosX,betInputPosY], widthDiv20, height, Color.GREEN);
            fillText("Ставка",[betInputPosX+widthDiv40/16*5,betInputPosY-indent],{font:{px:20,style:Font.TIME_NEW_ROMAN},color:Color.BLACK});
            if(input.bet){
                input.bet.destroy();
                input.bet = null;
            }
            input.bet = createInput([betInputPosX,betInputPosY], widthDiv20-indent, height-indent,
                {font:{px:18, style:Font.ARIAL}, color:Color.GREEN, border:{width:1, color:Color.BLACK, radius:3}});

            //Рисуем кнопки
            const widthDiv160 = widthDiv20/8;
            const betLeftButtonPosX = betInputPosX-widthDiv160;
            const betRightButtonPosX = betInputPosX+widthDiv20+widthDiv160;
            const betInputHeightDiv4 = betInputHalfHeight/3;
            const betButtonPosY1 = betInputPosY+betInputHeightDiv4;
            const betButtonPosY2 = betInputPosY+height-betInputHeightDiv4;
            const betLeftButtonPosX3 = betLeftButtonPosX-betInputHalfHeight;
            const betButtonPosY3 = betInputPosY+betInputHalfHeight;
            const betRightButtonPosX3 = betRightButtonPosX+betInputHalfHeight;
            fillTriangle([[betLeftButtonPosX,betButtonPosY1],[betLeftButtonPosX,betButtonPosY2],[betLeftButtonPosX3,betButtonPosY3]]);
            fillTriangle([[betRightButtonPosX,betButtonPosY1],[betRightButtonPosX,betButtonPosY2],[betRightButtonPosX3,betButtonPosY3]]);
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
            }
        }break;
        case ObjectType.THREE_FIGURES:{
            const imgW = 338/3;
            const imgH = 636/3;
            const indent = curWidth/40;
            const imgPosX1 = halfWidth/2-imgW/2;
            const imgPosX2 = imgPosX1-indent-imgW;
            const imgPosX3 = imgPosX1+indent+imgW;
            const imgPosY = curHeight-imgH;
            //Рисуем три фигуры для выбора
            createImg("images/Н_Камень.png",[imgPosX2,imgPosY], imgW, imgH);
            createImg("images/Н_Ножницы.png",[imgPosX1,imgPosY], imgW, imgH);
            createImg("images/Н_Бумага.png",[imgPosX3,imgPosY], imgW, imgH);
        }break;
    }
}

function getFigure(state) {
    const isPlayer = state>0;
    let result = {figures:{}};
    isPlayer ?result.figures.player=curPlayerFigure :result.figures.enemy=curEnemyFigure;
    return result;
}

function getEnemyAddresses() {
    return {addresses:[
        {address:"0x3ca4917f37360574d8dc0c65e0d0930ce27f54e8",bet:0},
        {address:"0x3ca4917f37360574d8dc0c65e0d0930ce27f54e8",bet:5},
        {address:"0x3ca4917f37360574d8dc0c65e0d0930ce27f54e8",bet:3}
    ]}
}

function draw() {
    if(canvas.getContext){
        //Делим просстранство две половинки
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
                drawObject(ObjectType.ADDRESSES_LIST,getEnemyAddresses());
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
