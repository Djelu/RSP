let myFullFigure;
let myFigureKeccak256;
const contractAddress = "0xbd277B22F502a60C49f3F88C9B317ac987f0c861";
const contractAbi = [
    {
        "constant": false,
        "inputs": [
            {
                "name": "_figure_hash",
                "type": "bytes32"
            },
            {
                "name": "_opponent",
                "type": "address"
            }
        ],
        "name": "Add_Figure",
        "outputs": [],
        "payable": true,
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [],
        "name": "Return_My_Eth",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_figure_full",
                "type": "bytes"
            }
        ],
        "name": "Start_Fighting_Figures",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "address_list",
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "name": "block_number",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "name": "figure_hash",
        "outputs": [
            {
                "name": "",
                "type": "bytes32"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "name": "opponent",
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "name": "rate_amount",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
];
let contract;
let metamaskExists = false;

function metamaskCheck(){
    //Проверка наличия метамаска
    if (typeof web3 !== "undefined") {
        window.web3 = new Web3(web3.currentProvider);
        contract = web3.eth.contract(contractAbi).at(contractAddress);
        metamaskExists = true;
        input.bet.value = "0.01";
        input.enemyAddress.value = "0x3E61878F2F8CcBA83345E1f92eE11822eB62A166";
    } else { alert("Need MetaMask!"); }
}

function jsAddFigure(){
    if (metamaskExists){
        web3.eth.getAccounts(function(error, accounts){
            if (!error) {
                web3.eth.getBalance(accounts[0], function(error, balance){
                    if (!error) {
                        if(balance.toNumber()/1000000000000000000 >= input.bet.value){
                            contract.Add_Figure(myFigureKeccak256, input.enemyAddress.value,{from: web3.eth.accounts[0], value: input.bet.value * 1000000000000000000}, function(err, res){});
                        }else {
                            alert(
                                "Номер кошелька: " + accounts[0] +
                                "\n\nБаланс: " + balance.toNumber()/1000000000000000000 + " ETH" +
                                "\n\nСредств не достаточно. На балансе менее " + input.bet.value + " ETH"
                            );
                        }

                    } else {
                        alert(error);
                    }
                });
            }else {
                alert(error);
            }
        });
    }
}

function confirmChoice(){//подтвердить
    let result = false;
    if (metamaskExists){
        contract.Start_Fighting_Figures( myFullFigure, {from: web3.eth.accounts[0], gasPrice: 2000000000, value: 0}, function(err, res){
            if(!err){
                result = true;
            }else{
                alert(err);
            }
        });
    }
    return result;
}

function refundChoice(){//возврат
    clearInterval(checkInterval);//Очищаем таймер проверки
    let result = false;
    if (metamaskExists){
        contract.Return_My_Eth( {from: web3.eth.accounts[0], gasPrice: 2000000000, value: 0}, function(err, res){
            if(!err){
                result = true;
            }else{
                alert(err);
            }
        });
    }
    return result;
}

function blockNumber() {
    let result = null;
    if (metamask_exists == true) {
        contract.block_number(web3.eth.accounts[0],function(err,res){
            result = res;
            console.log(res);
        });
    }
    return result;
}

function webBlockNumber() {
    let result = null;
    if (metamask_exists == true) {
        web3.eth.getBlockNumber(function (error, res) {
            if(!error) {
                result = res;
                console.log(res);
            }else{
                alert(error);
            }
        });
    }
    return result;
}

