let myFullFigure;
let myFigureKeccak256;
const contractAddress = "0xbb69Fd88251b2658792b4E2681025C809E66Bc9C";
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
        input.enemyAddress.value = "0x7d26358bacbB5a1F5aaBbC01d67B7Ff6eEAC5F9C";
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
    if (metamaskExists){
        contract.Start_Fighting_Figures( myFullFigure, {from: web3.eth.accounts[0], gasPrice: 2000000000, value: 0}, function(err, res){});
    }
}

function refundChoice(){//возврат
    if (metamaskExists){
        contract.Return_My_Eth( {from: web3.eth.accounts[0], gasPrice: 2000000000, value: 0}, function(err, res){} );
    }
}

