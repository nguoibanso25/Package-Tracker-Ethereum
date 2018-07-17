App = {
  web3Provider: null,
  contracts: {},
  account: 0x0,
  loading: false,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // initialize web3
    if(typeof web3 !== 'undefined') {
      //reuse the provider of the Web3 object injected by Metamask
      App.web3Provider = web3.currentProvider;
    } else {
      //create a new provider and plug it directly into our local node
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    App.displayAccountInfo();

    return App.initContract();
  },

  displayAccountInfo: function() {
    web3.eth.getCoinbase(function(err, account) {
      if(err === null) {
        App.account = account;
        $('#account').text(account);
        web3.eth.getBalance(account, function(err, balance) {
          if(err === null) {
            $('#accountBalance').text(web3.fromWei(balance, "ether") + " ETH");
          }
        })
      }
    });
  },
  
  initContract: function() {
    $.getJSON("packageTracker.json", function(contractArtifact) {
      App.contracts.packageTracker = TruffleContract(contractArtifact);
      App.contracts.packageTracker.setProvider(App.web3Provider);
      App.listPackage();
      return App.reloadMember();
    });
  },

  reloadMember: function() {
    App.displayAccountInfo();
    if(App.loading) {
      return;
    }
    App.loading = true;
    $('#memberRow').empty()
    let contractInstance;
    App.contracts.packageTracker.deployed().then(function(instance) {
      contractInstance = instance;
      contractInstance.memberList(App.account).then(function(member){     
        if(member[5] == true) {
          App.displayMember(member[0], member[1], member[2]);
        } else {
          App.displayMember("Chưa là thành viên", "Xin mời đăng ký", "Nhấn nút Create Member");
        }
      });
      App.loading = false;
    }).catch(function(err) {
      console.log(err.message);
      App.loading = false;
    });
  },

  displayMember: function(_typeName, _name, _info) {
    let memberTemplate = $("#memberTemplate");
    let memberRow = $("#memberRow");
    memberTemplate.find('.type-member').text(_typeName);
    memberTemplate.find('.name-member').text(_name);
    memberTemplate.find('.discription-member').text(_info);
    memberRow.append(memberTemplate.html());
  },

  addMember: function() {
    let _memberType = $("#memberType").val();
    let _memberName = $("#memberName").val();
    let _memberInfo = $("#memberInfo").val();
    App.contracts.packageTracker.deployed().then(function(instance) {
      return instance.createMember(App.account, _memberType, _memberName, _memberInfo, {
        from: App.account,
        gas: 500000
      });
    }).then(function(result) {
      App.reloadMember();
    }).catch(function(err) {
      console.error(err);
    });
  },

  addPackage: function() {
    let _packId = Number($("#packageId").val());
    let _packName = $("#packageName").val();
    let _packInfo = $("#packageInfo").val();
    App.contracts.packageTracker.deployed().then(function(instance) {
      return instance.createPackage(_packId, _packName, _packInfo, {from: App.account, gas: 500000});
    }).then(function(){
      return App.searchPack();
    }).catch(function(err) {
      console.error(err);
    });
  },

  searchPack: function() {
    let _packId = Number($("#searchPackage").val());
    $('#packageRow').empty();
    App.contracts.packageTracker.deployed().then(function(instance) {
      return instance.packageList(_packId);
    }).then(function(pack) {
      if(pack[8] == true) {
        App.detailPackage(_packId);
        $("#changeState").show();
      } else {
        $('#packageRow').append("<div><strong >Không có gói hàng này</strong></div>");
      }      
    })
  },

  detailPackage: function(_pId) {
    let packTemplate = $("#packTemplate");
    let packRow = $("#packageRow");
    let contractInstance;
    let _state;
    App.contracts.packageTracker.deployed().then(function(instance) {
      contractInstance = instance;
      return contractInstance.getLastState(_pId);
    }).then(function(lastState) {
      return contractInstance.stateList(lastState);      
    }).then(function(data) {
      _state = data[1];
      return contractInstance.packageList(_pId);
    }).then(function(data) {
      // $('.pId-pack');
      packTemplate.find('.pId-pack').text(_pId);
      if (data[0] == App.account) {
        packTemplate.find('.owner-pack').text("You");
      } else {
        packTemplate.find('.owner-pack').text(data[0]);
      }
      packTemplate.find('.name-pack').text(data[3]);
      packTemplate.find('.discription-pack').text(data[4]);
      packTemplate.find('.state-pack').text(_state);
      packRow.append(packTemplate.html());
    }).catch(function(err) {
      console.error(err);
    });  
  },

  listPackage: function() {
    let contractInstance;
    let packages =[];
    App.contracts.packageTracker.deployed().then(function(instance) {
      contractInstance = instance;
      return contractInstance.getPackOfOwner(App.account);
    }).then(function(packs) {
      if(packs.length != 0) {
        for(let i = 0; i < packs.length; i++) {
            packages[i]=packs[i];
            $("#listPackOfOwner").append('<li class="list-group-item">' + packs[i] + '</li>');
            //App.detailPackage(packs[i]);
        }
      } else {
        $("#listPack").text("Không có Gói hàng");
      }   
    }).catch(function(err) {
      console.error(err);
    });
  },

  detailListPack: function() {
    let contractInstance;
    $('#packageRow').empty()
    $('#packageRow').append("<div><strong >Danh sách gói tin:</strong></div>");
    
    App.contracts.packageTracker.deployed().then(function(instance) {
      contractInstance = instance;
      return contractInstance.getPackOfOwner(App.account);
    }).then(function(packs) {
      if(packs.length != 0) {
        for(let i = 0; i < packs.length; i++) {
            App.detailPackage(packs[i]);
            $("#changeState").hide();
        }
      } else {
        $("#listPack").text("Không có Gói hàng");
      }   
    }).catch(function(err) {
      console.error(err);
    });
  },

  tranferPack: function() {
    let _pId = Number($("#searchPackage").val());
    // let packTemplate = $("#packTemplate");
    // let _pId = Number(packTemplate.find('.pId-pack').val());
    App.contracts.packageTracker.deployed().then(function(instance) {
      return instance.changeState(_pId, "Đang vận chuyển" );
    }).catch(function(err) {
      console.error(err);
    });
  },

  auditStatePack: function() {
    let _pId = Number($("#searchPackage").val());
    App.contracts.packageTracker.deployed().then(function(instance) {
      return instance.changeState(_pId, "Đang kiểm tra" );
    }).catch(function(err) {
      console.error(err);
    });
  },

  storageStatePack: function() {
    let _pId = Number($("#searchPackage").val());
    App.contracts.packageTracker.deployed().then(function(instance) {
      return instance.changeState(_pId, "Đang lưu trữ" );
    }).catch(function(err) {
      console.error(err);
    });
  },

  historyPack: function() {
    let contractInstance;
    let _pId = Number($("#searchPackage").val());
    App.contracts.packageTracker.deployed().then(function(instance) {
      contractInstance = instance;
      return contractInstance.getStatesOfPack(_pId);
    }).then(function(dataSate) {
      if(dataSate.length != 0) {
        for (let i = 0; i < dataSate.length; i++) {
          App.showState(dataSate[i]);        
        }
      } else {
        $("#listState").text("Không có sự kiện");
      }   
    }).catch(function(err) {
      console.error(err);
    });
  },

  showState: function(_idSate) {
    let detailState = $("#detailState");
    let listState = $("#listState");
    App.contracts.packageTracker.deployed().then(function(instance) {
      return instance.stateList(_idSate);
    }).then(function(data) {
      detailState.find('.state-name').text(data[1]);
      if(data[3] != 0) {
        detailState.find('.state-start').text(data[2]);
        detailState.find('.state-end').text(data[3]);
        detailState.find('.last-state').hide();
      } else {
        detailState.find('.time-sate').hide();
        detailState.find('.last-state').show();
      }
      detailState.find('.state-who').text(data[4]);
      listState.append(detailState.html());
    })
  }


};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
