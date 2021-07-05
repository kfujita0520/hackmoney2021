const dotenv = require('dotenv');
const BitGoHandler = require('../handler/BitGoHandler.js').BitGoHandler;
const BitGoSmartContract = require('@bitgo/smart-contracts');
const Compound = require('@compound-finance/compound-js');
const Web3 = require('web3');

const cDAI = BitGoSmartContract.getContractsFactory('eth').getContract('Compound').instance('cDAI');
const cETH = BitGoSmartContract.getContractsFactory('eth').getContract('Compound').instance('cETH');
const decoder = BitGoSmartContract.getContractsFactory('eth').getDecoder();
const erc20json = require('../abi/erc20Abi.json');

class BitgoController {

    constructor(){
        dotenv.config();
        this.bitgo = new BitGoHandler();
        this.web3 = new Web3(new Web3.providers.HttpProvider(process.env.INFURA_URL));
    }

    //Use this method only once in order to get contract interaction approval for DAI from Compound.
    async approveCompound(){
        let spender = Compound.util.getAddress(Compound.cDAI, process.env.ETH_NETWORK);
        //spender = '0xF0d0EB522cfa50B716B3b1604C4F0fA6f04376AD'; //cDAI
        console.log('spender: ' + spender);
        let param = cDAI.methods().approve.call({ spender: spender, amount: '3000000000000000000' });
        //let address = '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa';//DAI
        let address = Compound.util.getAddress(Compound.DAI, process.env.ETH_NETWORK);
        console.log('address: ' + address);
        console.log(param);
        this.printInputData(param.data);
        console.log('data: ' + param.data);

        let parameter = {
            address: address,
            amount: param.amount,
            data: param.data
        };

        let currency = process.env.ETH;
        console.log('Start Bitgo SDK interaction');
        await this.bitgo.unlock();
        let transaction = await this.bitgo.sendBitGoTx([parameter], currency);
        await this.bitgo.lock();
        return transaction;
    }

    async supplyAsset(amount, asset){
        if(asset == 'ETH'){
            await this.supplyETH(amount);
        }else if(asset == 'DAI'){
            await this.supplyDai(amount);
        }
    }

    async supplyETH(amount){
        let param = cETH.methods().mint.call({ mintAmount: '3000000000000000000' });
        let address = Compound.util.getAddress(Compound.cETH, process.env.ETH_NETWORK);
        //let address = '0x41B5844f4680a8C38fBb695b7F9CFd1F64474a72';//cETH
        console.log('address: ' + address);
        console.log(param);
        amount = (amount * Math.pow(10, 18)).toFixed();
        console.log('amount: ' + amount);
        this.printInputData(param.data);
        console.log('data: ' + param.data);

        let parameter = {
            address: address,
            amount: amount,
            data: param.data
        };

        let currency = process.env.ETH;

        console.log('Start Bitgo SDK interaction');
        console.log('Start Bitgo SDK interaction');
        await this.bitgo.unlock();
        let transaction = await this.bitgo.sendBitGoTx([parameter], currency);
        console.log(JSON.stringify(transaction));
        await this.bitgo.lock();
        return "Success";
    }

    async supplyDai(amount){
        amount = (amount * Math.pow(10, 18)).toFixed();
        let param = cDAI.methods().mint.call({ mintAmount: amount });
        let address = Compound.util.getAddress(Compound.cDAI, process.env.ETH_NETWORK);
        //let address = '0xF0d0EB522cfa50B716B3b1604C4F0fA6f04376AD';//cDAI
        console.log('address: ' + address);
        console.log(param);
        console.log('amount: ' + amount);
        this.printInputData(param.data);
        console.log('data: ' + param.data);

        let parameter = {
            address: address,
            amount: param.amount,
            data: param.data
        };

        let currency = process.env.ETH;

        console.log('Start Bitgo SDK interaction');
        this.bitgo.unlock().then(result =>{
            console.log(JSON.stringify(result));
            this.bitgo.sendBitGoTx([parameter], currency).then(result => {
                console.log(JSON.stringify(result));
                this.bitgo.lock().then(result => {
                    console.log(JSON.stringify(result));
                });
            });
        }).catch(error => {
            console.log('Error: ' + error);
        });
    }

    printInputData(data){
        let PREFIX = '0x';
        let data2;
        if (data.indexOf(PREFIX) == 0) {
            // PREFIX is exactly at the beginning
            data = data.slice(PREFIX.length);
        }
        let result = decoder.decode(Buffer.from(data, 'hex'));
        console.log(result);
    }

    async getBalance(asset){
        if(asset == 'ETH'){
            let balance = await this.web3.eth.getBalance(this.getBaseAddress()).then(balance =>{
                return Number(this.web3.utils.fromWei(balance)).toFixed(3);
            });
            console.log(balance);
            return balance;
        } else if(['cETH', 'DAI', 'cDAI'].includes(asset)){
            let tokenAddress = Compound.util.getAddress(asset, process.env.ETH_NETWORK);
            console.log(tokenAddress);
            let balance = await this.getTokenBalance(tokenAddress, this.getBaseAddress());
            console.log(balance);
            return balance;
        }

    }

    getBaseAddress(){
        return this.bitgo.getWalletBaseAddress();
    }

    async getTokenBalance(tokenAddress, accountAddress) {
        let contract = new this.web3.eth.Contract(erc20json, tokenAddress);
        let balance = await contract.methods.balanceOf(accountAddress).call();
        let unit = await contract.methods.decimals().call();
        let tokenBal = (balance/Math.pow(10, unit)).toFixed(3);
        console.log(tokenBal);
        return tokenBal;
    }

    async calculateApy(asset){
        let address = Compound.util.getAddress('c' + asset, process.env.ETH_NETWORK);
        let infuraURL = process.env.INFURA_URL;

        let srpb = await Compound.eth.read(
            address,
            'function supplyRatePerBlock() returns (uint256)',
            [],
            { provider: infuraURL}
        ).catch(console.error);
        //console.log(srpb);

        const mantissa = Math.pow(10, 18);
        const blocksPerDay = parseInt(60 * 60 * 24 / 13.15); // ~13.15 second block time
        const daysPerYear = 365;

        const supplyApy = (((Math.pow((+(srpb.toString()) / mantissa * blocksPerDay) + 1, daysPerYear))) - 1) * 100
        console.log('Result: ' + supplyApy);
        return supplyApy;
    }

    async redeemAsset(amount, asset){
        if(asset == 'cETH'){
            await this.redeemETH(amount);
        }else if(asset == 'cDAI'){
            await this.redeemDAI(amount);
        }
    }

    async redeemETH(amount){
        //TODO
    }

    async redeemDAI(amount){
        //TODO
    }


}


module.exports.BitgoController = BitgoController;