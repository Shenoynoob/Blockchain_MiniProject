App = {
    web3Provider: null,
    contracts: {},

    init: async function() {
        return await App.initWeb3();
    },

    initWeb3: async function() {
        if(window.ethereum) {
            App.web3Provider = window.ethereum;  // Updated to use window.ethereum
            await window.ethereum.request({ method: 'eth_requestAccounts' }); // Request account access
        } else if(window.web3) {
            App.web3Provider = window.web3.currentProvider;
        } else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }

        web3 = new Web3(App.web3Provider);
        return App.initContract();
    },

    initContract: function() {
        $.getJSON('product.json', function(data) {
            var productArtifact = data;
            App.contracts.product = TruffleContract(productArtifact);
            App.contracts.product.setProvider(App.web3Provider);
        });

        return App.bindEvents();
    },

    bindEvents: function() {
        $(document).on('click', '.btn-register', App.getData);
    },

    getData: async function(event) {
        event.preventDefault();
        var sellerCode = document.getElementById('sellerCode').value;

        var productInstance;
        try {
            const accounts = await web3.eth.getAccounts();
            const account = accounts[0];
            const instance = await App.contracts.product.deployed();

            productInstance = instance;
            const result = await productInstance.queryProductsList(web3.utils.asciiToHex(sellerCode), { from: account });

            let productIds = [];
            let productSNs = [];
            let productNames = [];
            let productBrands = [];
            let productPrices = [];
            let productStatus = [];

            for (let k = 0; k < result[0].length; k++) {
                productIds[k] = result[0][k];
            }

            for (let k = 0; k < result[1].length; k++) {
                productSNs[k] = web3.utils.toAscii(result[1][k]);
            }

            for (let k = 0; k < result[2].length; k++) {
                productNames[k] = web3.utils.toAscii(result[2][k]);
            }

            for (let k = 0; k < result[3].length; k++) {
                productBrands[k] = web3.utils.toAscii(result[3][k]);
            }

            for (let k = 0; k < result[4].length; k++) {
                productPrices[k] = result[4][k];
            }

            for (let k = 0; k < result[5].length; k++) {
                productStatus[k] = web3.utils.toAscii(result[5][k]);
            }

            let t = "";
            document.getElementById('logdata').innerHTML = t;

            for (let i = 0; i < result[0].length; i++) {
                let temptr = "<td>" + productPrices[i] + "</td>";
                if (temptr === "<td>0</td>") {
                    break;
                }

                let tr = "<tr>";
                tr += "<td>" + productIds[i] + "</td>";
                tr += "<td>" + productSNs[i] + "</td>";
                tr += "<td>" + productNames[i] + "</td>";
                tr += "<td>" + productBrands[i] + "</td>";
                tr += "<td>" + productPrices[i] + "</td>";
                tr += "<td>" + productStatus[i] + "</td>";
                tr += "</tr>";
                t += tr;
            }

            document.getElementById('logdata').innerHTML += t;
            document.getElementById('add').innerHTML = account;

        } catch (error) {
            console.error("Error fetching data: ", error.message);
        }
    }
};

$(function() {
    $(window).on('load', function() {
        App.init();
    });
});
