//Проводим первоначальную настройку
function init() {

    var $back = $('#back');
    $back.on('click', toBack);
    $back.css('display','none');

    $('.box.player .imgSize').each(function () {
        let $this = $(this);
        const imgName = $this.attr('name');
        $this.on('click', function () {
            let src = null;
            switch (imgName) {
                case 'rock': src = 'images/Л_Камень.png'; break;
                case 'scissors': src = 'images/Л_Ножницы.png'; break;
                case 'paper': src = 'images/Л_Бумага.png'; break;
            }

            if(src) {
                $('#playerSelectedType').attr('src', src);
                $('#myHands').css('display', 'none');
                $('#playerSide').removeClass('heightBottom');
            }else{
                $('#playerSelectedType').attr('src','');
            }

            $('#back').css('display','block');
        });
    });

    let $enemyAddress = $('#enemyAddress input');
    $enemyAddress.keyup(function (event) {
        if(event.which == 13){
            const address = $enemyAddress.val();
            setWaiting();
            getEnemy(address);
        }
    });

    let table = $(document.createElement("table")).append($(document.createElement("tbody")));

    const rows = getAddresses();
    for(let i=0; i<rows.length; i++){
        const row = rows[i];
        const index = i + ".";

        let $tr = $(document.createElement("tr"));
        $tr.html(
            "<td class='index'>" + index + "</td>" +
            "<td class='address'>" + row.address + "</td>" +
            "<td class='price'>" + row.price + "</td>"
        );
        $tr.addClass("row");
        $tr.on('click', function () {
            setWaiting();
            getEnemy(row.address);
            $('#addresses').css('display', 'none');
        });

        table.append($tr);
    }

    $('#addresses').append(table);
}

function toBack() {
    $('#back').css('display','none');
    $('#playerSelectedType').attr('src','');
    $('#myHands').css('display', 'block');

    $('#playerSelectedType').css('vertical-align','bottom')
}

//Отсылаем на сервер в 6 ячейке пару цифр, соответствующих выбору игрока
function sendData(type) {

    let num = '00';
    switch (type) {
        case 'rock': num = '01'; break;
        case 'scissors': num = '02'; break;
        case 'paper': num = '03'; break;
    }

    const data = '090807060504'+num+'0201';

    //тут отправка data

}

//Показываем выбор соперника, в соответствии с num
function enemyChoice(num) {
    let $enemySelectedType = $('#enemySelectedType');
    switch (num) {
        case '01': $enemySelectedType.attr('src', 'images/П_Камень.png'); break;
        case '02': $enemySelectedType.attr('src', 'images/П_Ножницы.png'); break;
        case '03': $enemySelectedType.attr('src', 'images/П_Бумага.png'); break;
    }
    $('#enemyHand').css('display', 'block');
}

//Ожидаем загрузки соперника, ставим многоточие
function setWaiting() {
    $('#enemyAddress').css('display', 'none');
    $('#enemyHand').css('display', 'block');
    $('#enemySelectedType').attr('src', 'images/Точки.png');
}

//Соперник выбрал что-то, ставим вопрос
function setEnemyChoiced() {
    $('#enemySelectedType').attr('src', 'images/Вопрос.png');
}

function getEnemy(address) {
    //грузим противника по адресу
}

function getAddresses() {
    //получаем 10 адресов для вывода
    return [
        {address:"0x3ca4917f37360574d8dc0c333333333ce27f54e8", price:"3 ETH"},
        {address:"0x3ca4917f37360574d8dc0c333333333ce27f54e8", price:"3 ETH"},
        {address:"0x3ca4917f37360574d8dc0c333333333ce27f54e8", price:"3 ETH"},
        {address:"0x3ca4917f37360574d8dc0c333333333ce27f54e8", price:"3 ETH"},
        {address:"0x3ca4917f37360574d8dc0c333333333ce27f54e8", price:"3 ETH"},
        {address:"0x3ca4917f37360574d8dc0c333333333ce27f54e8", price:"3 ETH"},
        {address:"0x3ca4917f37360574d8dc0c333333333ce27f54e8", price:"3 ETH"},
        {address:"0x3ca4917f37360574d8dc0c333333333ce27f54e8", price:"3 ETH"},
        {address:"0x3ca4917f37360574d8dc0c333333333ce27f54e8", price:"3 ETH"},
        {address:"0x3ca4917f37360574d8dc0c333333333ce27f54e8", price:"3 ETH"},
        ];
}

init();