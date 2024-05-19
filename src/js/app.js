App = {
  web3Provider: null,
  contracts: {},

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
      App.fetchLogin();
      return App.fetchMusic();
    });

    return App.bindEvents();
  },

  bindEvents: function () {
    //$(document).on("click", ".btn-adopt", App.handleAdopt);
    $(document).on("click", "#btn-claim", App.handleClaim);
    $(document).on("click", "#btn-set-price", App.handleSetPrice);
    $(document).on("click", "#btn-deposit", App.handleDeposit);
    $(document).on("submit", "#audio-upload", App.handleUpload);
    $(document).on("submit", "#create-account", App.handleLogin);
    $(document).on("click", ".btn-audio-submit", function (e) {
      //e.preventDefault();
      //document.getElementById("audio-upload").submit();
    });
    //$("#audio-upload").submit(App.handleUpload);
  },
  
  markAdopted: function () {
    /*
    var adoptionInstance;
    App.contracts.Adoption.deployed()
      .then(function (instance) {
        adoptionInstance = instance;
        return adoptionInstance.getAdopters.call();
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
      */
  },
  fetchMusic: function () {
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
          console.log(audioCount);
          var account = accounts[0];
          if(parseInt(audioCount) > 0){
            for (i = 0; i < audioCount; i++) { 
              // Append if uploader addresss == msg.sender
              audioStruct = audioInstance.getAudio.call(i).then(function(e){
                if(account == e[6]){
                  audioTemplate.find(".card-title").text(e[2]);
                  audioTemplate.find("img").attr("src", e[4]);
                  audioTemplate.find(".card-text").text(e[1]);
                  audioTemplate.find("#btn-claim").attr("data-id", e[0]);
                  audioTemplate.find("#btn-set-price").attr("data-id", e[0]);
                  audioTemplate.find("#music-src").attr("src", e[5]);
                  audioTemplate.find("#btn-set-price").text("Mark Up 1 ETH (" + e[3]/1000000000000000000 + " ETH)");
                  petsRow.append(audioTemplate.html());
                }
              });
            }
          }
          // for (i = 0; i < audio.length; i++) {
          //   console.log(audio);
          //   if (audio[i] !== "0x0000000000000000000000000000000000000000") {
          //     console.log(audio);
          //     /*$(".panel-pet")
          //       .eq(i)
          //       .find("button")
          //       .text("Success")
          //       .attr("disabled", true);*/
          //   }
          // }
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
    
    var coverImgs = [
      "https://i.scdn.co/image/ab67616d0000b273820d2eaac8a8c7766a9dfe17",
      "https://i.scdn.co/image/ab67616d00001e02831f99bf6eb5be7b8eac0b48",
      "https://i.scdn.co/image/ab67616d0000b2738d6808a9ad147da7c9ea5f2d",
      "https://i.scdn.co/image/ab67616d0000b273f3ad488473829f3877e3aa47",
      "https://i.scdn.co/image/ab67616d0000b273fc5ca3abfe1eed2b4a6dfb42",
      "https://i.scdn.co/image/ab67616d0000b27360624c0781fd787c9aa4699c",
      "https://i.scdn.co/image/ab67616d0000b2734acaf50f8a03a6972b555d7e",
      "https://i.scdn.co/image/ab67616d0000b273c6b577e4c4a6d326354a89f7"
    ];
    var coverImg = coverImgs[Math.floor(Math.random()*coverImgs.length)];

    var audio = "drop-to-me-11154.mp3";
    var audioTrial = "drop-to-me-11154.mp3";

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
