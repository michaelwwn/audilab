App = {
  web3Provider: null,
  contracts: {},

  init: async function () {
    // Load pets.
    /*$.getJSON("../pets.json", function (data) {
      var petsRow = $("#petsRow");
      var petTemplate = $("#petTemplate");

      for (i = 0; i < data.length; i++) {
        petTemplate.find(".card-title").text(data[i].name);
        petTemplate.find("img").attr("src", data[i].picture);
        petTemplate.find(".card-text").text(data[i].breed); // song title
        //petTemplate.find(".pet-age").text(data[i].age);
        //petTemplate.find(".pet-location").text(data[i].location);
        petTemplate.find(".btn-adopt").attr("data-id", data[i].id);
        petsRow.append(petTemplate.html());
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
      return App.fetchMusic();
    });

    return App.bindEvents();
  },

  bindEvents: function () {
    //$(document).on("click", ".btn-adopt", App.handleAdopt);
    $(document).on("click", "#btn-claim", App.handleClaim);
    $(document).on("click", "#btn-set-price", App.handleSetPrice);
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
    var petTemplate = $("#petTemplate");
    petsRow.empty();

    var audioInstance;
    var audioStruct;
    App.contracts.Audilab.deployed()
      .then(function (instance) {
        //console.log("fetchMusic22");
        audioInstance = instance;
        // return audioInstance.getAudio.call();
        return audioInstance.getAudioCount.call();
      })
      .then(function (audioCount) {
        console.log(audioCount);
        if(parseInt(audioCount) > 0){
          for (i = 0; i < audioCount; i++) { 
            // Append if uploader addresss == msg.sender
            audioStruct = audioInstance.getAudio.call(i).then(function(e){
              petTemplate.find(".card-title").text(e[0]);
              petTemplate.find("img").attr("src", e[3]);
              petTemplate.find(".card-text").text(e[1]);
              petTemplate.find("#btn-claim").attr("data-id", i-1);
              petTemplate.find("#btn-set-price").attr("data-id", i-1);
              petsRow.append(petTemplate.html());
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
    var name = $("#name").val();
    var desc = $("#desc").val();
    var price = parseInt($("#price").val());
    //var coverImg = $("#coverImg").val();
    //var audio = $("#audio").val();
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
          return audioInstance.storeMusic(name, desc, price, coverImg, audio, audioTrial, {
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
    var name = $("#name").val();

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
          return App.fetchMusic();
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
          return audioInstance.updatePrice(musicId, "350", { from: account });
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
