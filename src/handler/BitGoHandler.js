/**
 * Wrapper for BitGo APIs
 */
const BitGoJS = require('bitgo');
const dotenv = require('dotenv');
const otplib = require('otplib');
const JSONCircular = require('flatted');

class BitGoHandler {

    constructor() {
        dotenv.config();
        this.environment =  process.env.BITGO_ENVIRONMENT;
        this.token = process.env.BITGO_ACCESSTOKEN;
        this.bitgo = new BitGoJS.BitGo({env: this.environment});
        this.otp = otplib;
    }

    async unlock() {
        let bitgo = this.bitgo;
        let accessToken = this.token;

        //Note: authenticateWithAccessToken is synchronous method
        bitgo.authenticateWithAccessToken({accessToken: accessToken});
        let response = await bitgo.unlock({otp: otplib.authenticator.generate(process.env.BITGO_OTPSECRET)})
            .then(function (unlockResponse) {
                console.log('unlock: ', unlockResponse);
                return unlockResponse;
            }).catch(error => {
                console.log('Error JSON: ' + JSONCircular.stringify(error) + '\n' + error.stack);
                return error;
            });

        return response;

    }


    async lock() {
        let bitgo = this.bitgo;

        let response = await bitgo.lock({})
            .then(function (lockResponse) {
                console.log('lock: ', lockResponse);
                return lockResponse;
            }).catch(error => {
                console.log('Error JSON: ' + JSONCircular.stringify(error) + '\n' + error.stack);
                return error;
            });
        return response;
    }

    authenticateWithAccessToken() {
        this.token = process.env.BITGO_ACCESSTOKEN;
        console.log(`try to authenticate with token`);
        return this.bitgo.authenticateWithAccessToken({accessToken: this.token});
    }


    async sendBitGoTx(param, currency) {
        let bitGo = this.bitgo;
        //let currency = 'teth';
        let walletId = process.env.BITGO_ETH_WALLET_ID;
        let walletpass = process.env.BITGO_PASSWORD;

        console.log('start send fund param: ' + JSON.stringify(param));
        const walletInstance = await bitGo.coin(currency).wallets().get({id: walletId});
        console.log('Wallet: ' + JSON.stringify(walletInstance));

        let transaction = await walletInstance.sendMany({
            recipients: param,
            walletPassphrase: walletpass
        }).then(trans => {
            console.log('SendTx: ' + JSONCircular.stringify(trans));
            return trans;
        }).catch(error => {
            console.log('SendBitgoTx Error: ' + error);
            return error;
        });
        return transaction;

    }

    getWalletBaseAddress() {
        return process.env.BITGO_ETH_BASE_ADDRESS;
    }

    async getWalletBaseAddress2() {
        let bitGo = this.bitgo;
        let currency = process.env.ETH;
        let walletId = process.env.BITGO_ETH_WALLET_ID;

        const walletInstance = await bitGo.coin(currency).wallets().get({id: walletId});
        console.log(JSON.stringify(walletInstance));

        return walletInstance.coinSpecific().baseAddress;

    }



    isValidAddress(currency, address) {
        let bitgo = this.bitgo;
        let result = bitgo.coin(currency).isValidAddress(address);//non-Promise function. cannot put yield
        console.log('Address Verification [currency: ' + currency + ' address: ' + address + ' result: ' + result);
        return result;

    }


    /**
     * generates 6digits code for one time password
     * @returns {string}
     */
    otpcode() {
        let result = this.otp.authenticator.generate(process.env.BITGO_OTPSECRET);
        console.log('generated otp code', result);
        return result;
    }


    /**
     * current session of logged in user
     */
    currentSession(callback) {
        return this.bitgo.session({}, callback);
    }

    /**
     * current user information
     */
    currentUser(callback) {
        return this.bitgo.me({}, callback);
    }


}

module.exports.BitGoHandler = BitGoHandler;
