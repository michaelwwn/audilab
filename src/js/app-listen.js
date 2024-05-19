App = {
  web3Provider: null,
  contracts: {},
  purchaseList: [],
  audioCountG:0,
  init: async function () {
    //const ipfs = window.IpfsHttpClient({ host: 'ipfs.infura.io', port: 5001 })
    // Load pets.
    /*$.getJSON("../pets.json", function (data) {
      var petsRow = $("#petsRow");
      var audioTemplate = $("#audioTemplate");

      for (i = 0; i < data.length; i++) {
        audioTemplate.find(".card-title").text(data[i].name);
        audioTemplate.find("img").attr("src", data[i].picture);
        audioTemplate.find(".card-text").text(data[i].breed); // song title
        //audioTemplate.find(".pet-age").text(data[i].age);
        //audioTemplate.find(".pet-location").text(data[i].location);
        audioTemplate.find(".btn-adopt").attr("data-id", data[i].id);
        petsRow.append(audioTemplate.html());
      }
    });*/

    return await App.initWeb3();
  },

  initWeb3: async function () {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.request({ method: "eth_requestAccounts" });
      } catch (error) {
        // User denied account access...
        console.error("User denied account access");
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider(
        "http://localhost:7545"
      );
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function () {
    $.getJSON("Audilab.json", function (data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var AudilabArtifact = data;
      App.contracts.Audilab = TruffleContract(AudilabArtifact);
      // Set the provider for our contract
      App.contracts.Audilab.setProvider(App.web3Provider);
      // Use our contract to retrieve and mark the adopted pets
      //App.fetchLogin();
      return App.fetchMusic();
    });

    return App.bindEvents();
  },

  bindEvents: function () {
    //$(document).on("click", ".btn-adopt", App.handleAdopt);
    $(document).on("click", "#btn-purchase", App.handlePurchase);
    $(document).on("click", "#btn-deposit", App.handleDeposit);
    $(document).on("submit", "#create-account", App.handleLogin);
    $(document).on("click", ".btn-audio-submit", function (e) {
      //e.preventDefault();
      //document.getElementById("audio-upload").submit();
    });
    //$("#audio-upload").submit(App.handleUpload);
  },
  
  
  fetchMusic: function () {
    App.fetchLogin();
    
    var petsRow = $("#petsRow");
    var audioTemplate = $("#audioTemplate");
    petsRow.empty();

    var audioInstance;
    var audioStruct;
    web3.eth.getAccounts(function (error, accounts) {
    App.contracts.Audilab.deployed()
      .then(function (instance) {
        //console.log("fetchMusic22");
        audioInstance = instance;
        // return audioInstance.getAudio.call();
        return audioInstance.getAudioCount.call();
      })
      .then(function (audioCount) {
        if(parseInt(audioCount) > 0){

        console.log("audioCount" + audioCount);
        App.audioCountG = audioCount
        //audioCountG
          
          /*
              $("div").find(`[data-aid='2']`).find("button")
              .text("Purchased")
              .attr("disabled", true);
              //$('.panel-audio').eq(i).find("button").text("Purchased").attr("disabled", true);
            */
          for (i = 0; i < audioCount; i++) { 
            // Append if uploader addresss == msg.sender
            audioStruct = audioInstance.getAudio.call(i).then(function(e){
              audioTemplate.find(".card-title").text(e[2]);
              audioTemplate.find("img").attr("src", e[4]);
              audioTemplate.find(".card-text").text(e[1]);
              audioTemplate.find("#music-src").attr("src", e[5]);
              // TODO: change to tier
              console.log("price:" + e[2])
              audioTemplate.find("#btn-purchase").attr("data-id", e[0]);
              audioTemplate.find("#btn-purchase").attr("data-price", e[3]/1000000000000000000);
              audioTemplate.find("#btn-purchase").text("Buy " + e[3]/1000000000000000000 + " ETH");
              petsRow.append(audioTemplate.html());
            });
          }
          return audioCount;

        }
      }).then(function(audioCount){
        var account = accounts[0];
        console.log(account);
        if(parseInt(audioCount) > 0){
          for (i = 0; i < audioCount; i++) { 
            console.log(i-1);
            audioStruct = audioInstance.checkPurchased.call(account,i).then(function(e){
                if(e[0]== true){
                  $('.panel-audio').eq(e[1]).find("button").text("Purchased").attr("disabled", true);
                }
            });
          }
        }

      })
      .catch(function (err) {
        console.log(err.message);
      });
    });
  },  
  fetchLogin: function () {
    var audioInstance;
    var audioStruct;
    web3.eth.getAccounts(function (error, accounts) {
    App.contracts.Audilab.deployed()
      .then(function (instance) {
        audioInstance = instance;
        var account = accounts[0];
        return audioInstance.getUser.call(account);
      })
      .then(function (user) {
        if(user[0] == true){

          for(var i = 0; i < user[2].length; i++){
            App.purchaseList.push(user[2][i].c[0]);
          }
          console.log("====INIT=====");
          console.log(App.purchaseList);
          console.log("====INIT=====");

          $("#btn-login").text("Welcome " + user[1]).attr("disabled", true);
          $("#artist-name").attr("value", user[1]);
        }
        console.log(user);
      })
      .catch(function (err) {
        console.log(err.message);
      });
    });
  },
  markUploaded: function () {
    console.log("uploaded");
    return;
    var audioInstance;
    App.contracts.Adoption.deployed()
      .then(function (instance) {
        audioInstance = instance;
        return audioInstance.getAdopters.call();
      })
      .then(function (adopters) {
        for (i = 0; i < adopters.length; i++) {
          if (adopters[i] !== "0x0000000000000000000000000000000000000000") {
            $(".panel-pet")
              .eq(i)
              .find("button")
              .text("Success")
              .attr("disabled", true);
          }
        }
      })
      .catch(function (err) {
        console.log(err.message);
      });
  },
  handleUpload: function (e) {
    e.preventDefault();
    var artist = $("#artist-name").val();
    var name = $("#name").val();
    var desc = $("#desc").val();
    var price = parseInt($("#price").val() * 1000000000000000000);
    //var coverImg = $("#coverImg").val();
    //var audio = $("#audio").val();
    console.log(artist + "|" + name)
    var coverImg = "https://i.scdn.co/image/ab67616d0000b273820d2eaac8a8c7766a9dfe17";
    var audio = "https://i.scdn.co/image/audio";
    var audioTrial = "https://i.scdn.co/image/audio";

    var audioInstance;
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      App.contracts.Audilab.deployed()
        .then(function (instance) {
          audioInstance = instance;
          // Execute adopt as a transaction by sending account
          return audioInstance.storeMusic(artist, name, desc, price, coverImg, audio, audioTrial, {
            from: account,
          });
        })
        .then(function (result) {
          $('#upload-success').show();
          $('#uploadModal').modal('hide')
          return App.fetchMusic();
        })
        .catch(function (err) {
          console.log(err.message);
        });
    });
    console.log(name);
  },
  handlePurchase: function (e) {
    e.preventDefault();
    var audioIndex = parseInt($(e.target).data("id"));
    var audioPrice = parseInt($(e.target).data("price"));
    console.log(audioIndex + "---" + audioPrice);
    var audioInstance;
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      App.contracts.Audilab.deployed()
        .then(function (instance) {
          audioInstance = instance;
          // Execute adopt as a transaction by sending account
          return audioInstance.purchase(audioIndex, {
            from: account,
            value:web3.toWei(audioPrice, "ether")
          });
        })
        .then(function (result) {
          $('#upload-success').show();
          $('#loginModal').modal('hide');
          return App.fetchMusic();
        })
        .catch(function (err) {
          console.log(err.message);
        });
    });
    console.log(name);
  },
  handleLogin: function (e) {
    e.preventDefault();
    console.log("triggered login")
    var name = $("#full-name").val();
    console.log(name )
    var audioInstance;
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      App.contracts.Audilab.deployed()
        .then(function (instance) {
          audioInstance = instance;
          // Execute adopt as a transaction by sending account
          return audioInstance.createUser(name, {
            from: account,
          });
        })
        .then(function (result) {
          $('#create-success').show();
          $('#loginModal').modal('hide')
          return App.fetchLogin();
        })
        .catch(function (err) {
          console.log(err.message);
        });
    });
    console.log(name);
  },
  handleDeposit: function (e) {
    e.preventDefault();
    console.log("triggered deposit")
    var audioInstance;
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      App.contracts.Audilab.deployed()
        .then(function (instance) {
          audioInstance = instance;
          // Execute adopt as a transaction by sending account
          return audioInstance.deposit({
            from: account,
            value:web3.toWei("10", "ether")
          });
        })
        .then(function (result) {
          return App.fetchLogin();
        })
        .catch(function (err) {
          console.log(err.message);
        });
    });
    console.log(name);
  },
  handleAdopt: function (event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data("id"));
    var adoptionInstance;
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      App.contracts.Adoption.deployed()
        .then(function (instance) {
          adoptionInstance = instance;
          // Execute adopt as a transaction by sending account
          return adoptionInstance.adopt(petId, { from: account });
        })
        .then(function (result) {
          return App.fetchMusic();
        })
        .catch(function (err) {
          console.log(err.message);
        });
    });
  },
  handleSetPrice: function (event) {
    event.preventDefault();

    var musicId = parseInt($(event.target).data("id"));
    var audioInstance;
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      App.contracts.Audilab.deployed()
        .then(function (instance) {
          audioInstance = instance;
          // Execute adopt as a transaction by sending account
          // a bug with number
          return audioInstance.updatePrice(musicId, { from: account });
        })
        .then(function (result) {
          return App.fetchMusic();
        })
        .catch(function (err) {
          console.log(err.message);
        });
    });
  },
  handleClaim: function (event) {
    event.preventDefault();

    var musicId = parseInt($(event.target).data("id"));
    var audioInstance;
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      App.contracts.Audilab.deployed()
        .then(function (instance) {
          audioInstance = instance;
          // Execute adopt as a transaction by sending account
          return audioInstance.claimReward(musicId, { from: account });
        })
        .then(function (result) {
          return App.fetchMusic();
        })
        .catch(function (err) {
          console.log(err.message);
        });
    });
  },
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
