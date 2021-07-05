const ethApyElement = document.getElementById('eth-apy');
const ethSupplyInput = document.getElementById('eth-supply');
const ethSupplyButton = document.getElementById('eth-supply-button');
const ethRedeemInput = document.getElementById('eth-redeem');
const ethRedeemButton = document.getElementById('eth-redeem-button');
const daiApyElement = document.getElementById('dai-apy');
const daiSupplyInput = document.getElementById('dai-supply');
const daiSupplyButton = document.getElementById('dai-supply-button');
const daiRedeemInput = document.getElementById('dai-redeem');
const daiRedeemButton = document.getElementById('dai-redeem-button');
const enableButton = document.getElementById('enable-button');
const fetchBalanceButton = document.getElementById('balance-button');
let accounts;

enableButton.onclick = async () => {
  let data = {
    asset: 'DAI'
  };
  let response = await $.ajax({
    type: "POST",
    url: '/bitgo/approve',
    data: data,
    dataType: "json"
  }).catch(err =>{
    alert(JSON.stringify(err));
  });
};

fetchBalanceButton.onclick = async () => {

  getBalance('ETH').then(bal =>{
    document.getElementById('eth-balance').innerHTML = bal;
  });

  getBalance('cETH').then(bal =>{
    document.getElementById('ceth-balance').innerHTML = bal;
  });

  getBalance('DAI').then(bal =>{
    document.getElementById('dai-balance').innerHTML = bal;
  });

  getBalance('cDAI').then(bal =>{
    document.getElementById('cdai-balance').innerHTML = bal;
  });

};

async function getBalance(asset){
  let data = {
    asset: asset
  };
  let response = await $.ajax({
    type: "POST",
    url: '/bitgo/getBalance',
    data: data,
    dataType: "json"
  }).catch(err =>{
    alert(JSON.stringify(err));
  });
  return response.balance;
}


async function supply(asset, amount) {
  let url = '/bitgo/supply';
  let data = {
    asset: asset,
    amount: amount
  };

  let response = await $.ajax({
    type: "POST",
    url: url,
    data: data,
    dataType: "json"
  }).catch(err =>{
    alert(JSON.stringify(err));
  });
  return response;
}


async function redeem(asset, amount) {
  let url = '/bitgo/redeem';
  let data = {
    asset: asset,
    amount: amount
  };

  let response = await $.ajax({
    type: "POST",
    url: url,
    data: data,
    dataType: "json"
  }).catch(err =>{
    alert(JSON.stringify(err));
  });
  return response;
}

ethSupplyButton.onclick = async () => {
  await supply(Compound.ETH, ethSupplyInput.value).then(response =>{
    ethSupplyInput.value = "Done";
  });
};

ethRedeemButton.onclick = async () => {
  await redeem(Compound.cETH, ethRedeemInput.value);
};

daiSupplyButton.onclick = async () => {
  await supply(Compound.DAI, daiSupplyInput.value).then(response =>{
    daiSupplyInput.value = "Done";
  });
};

daiRedeemButton.onclick = async () => {
  await redeem(Compound.cDAI, daiRedeemInput.value);
};



async function calculateApy(asset) {
  let url = '/bitgo/fetchAPY';
  let data = {
    asset: asset
  };

  let response = await $.ajax({
    type: "POST",
    url: url,
    data: data,
    dataType: "json"
  });
  return response.apy;

}

window.addEventListener('load', async (event) => {

  calculateApy('ETH').then(apy => {
    ethApyElement.innerText = apy.toFixed(2);
  })
  calculateApy('DAI').then(apy => {
    daiApyElement.innerText = apy.toFixed(2);
  })
  console.log('Loading');

});
