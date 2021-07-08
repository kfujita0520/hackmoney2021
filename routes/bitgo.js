const express = require('express');
const router = express.Router();
const path = require('path');
const BitgoController = require('../src/controller/BitgoController.js').BitgoController;

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log('test');
    res.sendFile(path.join(__dirname,'../web/bitgo.html'));

});

router.post('/supply', function(req, res, next){

    console.log('/bitgo/supply POST: ' + JSON.stringify(req.body));

    let ipaddr = req.socket.remoteAddress;
    let amount = req.body.amount;
    let asset = req.body.asset;

    console.log("IP is: " + ipaddr);

    let bitgoCtl = new BitgoController();
    bitgoCtl.supplyAsset(amount, asset).then(result => {
        let param = {
            result: result
        }
        console.log(JSON.stringify(param));
        res.json(param);
    }).catch(error => {
        console.log('Error: ' + JSON.stringify(error));
        let param = {
            result: 'Error'
        }
        console.log(JSON.stringify(param));
        res.json(param);
    });

});

router.post('/redeem', function(req, res, next){

    console.log('/bitgo/redeem POST: ' + JSON.stringify(req.body));

    let ipaddr = req.socket.remoteAddress;
    let amount = req.body.amount;
    let asset = req.body.asset;

    console.log("IP is: " + ipaddr);

    let bitgoCtl = new BitgoController();
    bitgoCtl.redeemAsset(amount, asset).then(result => {
        let param = {
            result: result
        }
        console.log(JSON.stringify(param));
        res.json(param);
    }).catch(error => {
        console.log('Error: ' + JSON.stringify(error));
        let param = {
            result: 'Error'
        }
        console.log(JSON.stringify(param));
        res.json(param);
    });

});

router.post('/fetchAPY', function(req, res, next){

    console.log('/bitgo/getAPY POST: ' + JSON.stringify(req.body));

    let ipaddr = req.socket.remoteAddress;
    let asset = req.body.asset;
    console.log("IP is: " + ipaddr);
    console.log("Asset is: " + asset);


    let bitgoCtl = new BitgoController();
    bitgoCtl.calculateApy(asset).then(apy => {
        let param = {
            apy : apy
        }
        res.json(param);
    });


});

router.post('/approve', function(req, res, next){

    console.log('/bitgo/approve POST: ' + JSON.stringify(req.body));

    let ipaddr = req.socket.remoteAddress;
    let asset = req.body.asset;
    console.log("IP is: " + ipaddr);


    let bitgoCtl = new BitgoController();
    bitgoCtl.approveCompound().then(result => {

    });

});

router.post('/getBalance', function(req, res, next){

    console.log('/bitgo/getBaseAddress POST: ' + JSON.stringify(req.body));

    let ipaddr = req.socket.remoteAddress;
    let asset = req.body.asset;
    console.log("IP is: " + ipaddr);


    let bitgoCtl = new BitgoController();
    bitgoCtl.getBalance(asset).then(balance => {
        let param = {
            balance : balance
        }
        res.json(param);
    });

});


module.exports = router;