var player = jwplayer('videoPlayer');
var rgi = $('#rgi').val(); //'<?php print rapgrid_paypal_email($user->uid, $nid); ?>';
var rgp = $('#rgp').val(); //'<?php print $node->field_liveppv_url[0]['value'] . $token; ?>';
var live_ppv_nid = $('#live_ppv_nid').val(); //'<?php print $node->nid; ?>';
var live_ppv_title = $('#live_ppv_title').val(); //'<?php print $node->title; ?>';
var rguid = $('#rguid').val();

function refreshPlayer(filename) {
    player.setup({
        'id': 'liveEventPlayer',
        'width': '100%',
        'aspectratio': "16:9",
        'file': filename || rgp,
        'image': '',
        'skin': {
          'name': 'rapgrid'
        },
        'modes': [
            {type: 'html5'},
            {type: 'flash', src: 'player.swf'}
        ]
    });
    // setup pause/play listeners
    refreshPlay();
    // Custom Spinner
    rgBuffer();
    // display user overlay
    userCaption();
    // listen for metadata 
    metaHandler();
}
function refreshPlay(){
    jwplayer().on("pause", function () {
        jwplayer().on("play", function () {
            $.ajax({
                type: "POST",
                url: "/live/auth/ajax/" + live_ppv_nid,
                dataType: 'text', // could be JSON, XML, SCRIPT or HTML
                success: function(data) {
                    refreshPlayer(data);
                    //console.log(data);
                    //jwplayer.off("play");
                    //_gaq.push(['_trackEvent', 'Live PPV', 'vidRefresh', live_ppv_title]);
                    //console.log("success");
                }
            });
        });
    });
}

// Custom Spinner
function rgBuffer() {
      jwplayer().on('buffer', function(){
        $('.jw-display-icon-container').html('<div class="rg-cubes"><div class="cube cube-1"></div><div class="cube cube-2"></div><div class="cube cube-3"></div><div class="cube cube-4"></div><div class="cube cube-5"></div><div class="cube cube-6"></div><div class="cube cube-7"></div><div class="cube cube-8"></div><div class="cube cube-9"></div></div>');
        console.log("video buffering");
    });
    
}

function userCaption(strCaption){
    jwplayer().on('ready', function() {
        var txt = document.createElement('div');
        txt.setAttribute('id', 'txt');

        if (jwplayer().getRenderingMode() == "html5"){
            var theBody = document.getElementById(player.id);
        } else {
            var theBody = document.getElementById(player.id+"_wrapper");
        }

        var message = strCaption || rgi;
        txt.innerHTML = message;
        txt.style.fontSize = "16px";
        txt.style.color = "rgba(255, 255, 255, 0.4)";
        txt.style.position = "absolute";
        txt.style.fontFamily = "arial,_sans";
        txt.style.zIndex = "999";
        txt.style.bottom = "24%";
        txt.style.left = "50%";
        txt.style.transform = "translate(-50%, 0)"
        theBody.appendChild(txt);
    });
}
function showProductDiv(productJSON, expiration) {
    var modal = document.createElement('div');
    modal.setAttribute('id', 'modal');
    modal.style.zIndex = "999";
    $(modal).addClass("desktop-content");
    var modalContent = document.createElement('div');
    modalContent.setAttribute('id', 'modalContent');
    modalContent.setAttribute('class', 'modal-content');

    var close = document.createElement('div');
    close.setAttribute('id', 'close-overlay');
    var closeSpan = document.createElement('span');
    closeSpan.setAttribute('class','close');
    close.appendChild(closeSpan);

    if (jwplayer().getRenderingMode() == "html5"){
        var theBody = document.getElementById(player.id);
    } else {
        var theBody = document.getElementById(player.id+"_wrapper");
    }
    var theBody = document.getElementById('videoPlayer');
    modal.appendChild(close);
    $(modal).hide()
    theBody.appendChild(modal);
    modal.appendChild(modalContent);
    var mobileModal = $(modal).clone().removeClass("desktop-content").addClass("mobile-content");
    $("#videoArea").append(mobileModal);
    $(".close").on('click', function() {
      $("#modal.desktop-content, #modal.mobile-content").fadeOut(1000, function() {
        $(this).remove();
      });
    });
    
    //console.log(productJSON);
    var productImage = 'https://www.rapgrid.com/' + productJSON.image_path, //'https://placehold.it/116x116',
        productTitle = productJSON.title, //'RBE PRESENTS: Blood Sweat & Tiers 5',
        productDescription = '', //'AVAILABLE: 05/06/2017',
        productPrice = "$" + (Number(productJSON.sell_price)).toFixed(2), //'$19.99',
        productLink = '/cart/add/p' + productJSON.nid + '_q1-pay_per_view'; //'#',
        countdownDefault = expiration || 35;

    var productTemplate = '<div class="prodAd">' +
          '<img src="' + productImage + '" alt="' + productTitle + '"/>' +
          '<div class="product-info">' +
      '<h3>' + productTitle + '</h3>' +
            '<div class="description">' + productDescription + '</div>' +
            '<div class="price">' + productPrice + '</div>' +
    '</div>' +
          '<div class="vote">' +
            '<a style="color: #000000;" class="btn btn1" href="javascript:void(0);" onClick="addToCart('+"\'" + productJSON.nid.trim() + "\'" + ');">Add To Cart</a>' +
            '<span class="countdown">Gone in <span class="countdown-count">' + countdownDefault + '</span> seconds...</span>' +
          '</div>' +
      '</div>';
    
    $(".modal-content").append(productTemplate);
    $(modal).fadeIn(1000);
    $(mobileModal).fadeIn(1000);
    
    var countdown = setInterval(function() {
      countdownDefault--;
      $(".countdown-count").text(countdownDefault);
      if(countdownDefault === 0) {
        clearInterval(countdown);
        $("#modal.desktop-content, #modal.mobile-content").fadeOut(1000, function() {
          $(this).remove();
        });
      }
    }, 1000);
}
/*
function getProductJSON(nid){
  $.ajax({
    url: "/live/product/ajax/" + nid,
    type: "post",
    data: '{}',
    dataType: 'json',
    success: function(data){
      //console.log(data);
      showProductDiv(data, 35);
    }
  });
}
*/
function getProductJSON(inVar){
   var jsonData = JSON.parse(urldecode(inVar));
   //console.log("should be a json object");
   //console.log(jsonData);
   showProductDiv(jsonData[0], 35);
}
function urldecode(url) {
  return decodeURIComponent(url.replace(/\+/g, ' '));
}
function showVoteDiv(nid){
    var modal = document.createElement('div');
    modal.setAttribute('id', 'modal');
    modal.style.zIndex = "999";
    $(modal).addClass("desktop-content");
    var modalContent = document.createElement('div');
    modalContent.setAttribute('id', 'modalContent');
    modalContent.setAttribute('class', 'modal-content');

    var close = document.createElement('div');
    close.setAttribute('id', 'close-overlay');
    var closeSpan = document.createElement('span');
    closeSpan.setAttribute('class','close');
    close.appendChild(closeSpan);

    if (jwplayer().getRenderingMode() == "html5"){
        var theBody = document.getElementById(player.id);
    } else {
        var theBody = document.getElementById(player.id+"_wrapper");
    }
    var theBody = document.getElementById('videoPlayer');

    modal.appendChild(close);
    $(modal).hide();
    theBody.appendChild(modal);
    modal.appendChild(modalContent);
    var mobileModal = $(modal).clone().removeClass("desktop-content").addClass("mobile-content");

    $("#videoArea").append(mobileModal);
    $(".close").on('click', function() {
      $("#modal.desktop-content, #modal.mobile-content").fadeOut(1000, function() {
        $(this).remove();
      });
    });

    var blah = '<div id="message">' +
        '<h3>Who won ' + document.getElementById('event_battle_' + nid).textContent + '?</h3></div>' +
        '<div class="vote-wrapper">' +
          '<div class="vote-item">' +
            '<a style="color: #000000;" class="btn btn1" onClick="sendVote('+"\'" + nid + "\'" + ',' + "\'" + document.getElementById(nid + '_0').value + "\'" + ');return false;">' +
              document.getElementById(nid + '_0_name').value +
            '</a>' +
          '</div>' +
          '<div class="vote-item">' +
            '<a style="color: #000000;" class="btn btn1" onClick="sendVote('+"\'" + nid + "\'" + ',' + "\'" + document.getElementById(nid + '_1').value + "\'" + ');return false;">' +
              document.getElementById(nid + '_1_name').value +
            '</a>' +
          '</div>' +
        '</div>' +
      '</div>';
    $( ".modal-content" ).append( blah );
    $(modal).fadeIn(1000);
    $(mobileModal).fadeIn(1000);
}
function addToCart(product_nid){
  $("#modal.desktop-content, #modal.mobile-content").html('<div class="vote-result">Please wait..</div>');
  var productLink = '/cart/add/p' + product_nid + '_q1-pay_per_view';
  $.ajax({
    url:  productLink,
    type: "post",
    data: '{}',
    dataType: 'HTML',
    success: function(data){
      //console.log(data);
      $('#modal.desktop-content, #modal.mobile-content').html('<div class="vote-result">Item has been added to your cart.</div>');
      //console.log(data);
      //_gaq.push(['_trackEvent', 'Live PPV', 'addToCart' + product_nid, live_ppv_title]);
      $(".close").hide();
      setTimeout(function(){
        $("#modal.desktop-content, #modal.mobile-content").fadeOut(1000, function() {
          $(this).remove();
        });
      }, 2000);
    }
  });
}

function sendVote(in_nid, voteSelection) {
  var voteAction = 'add';
  var leftRapperName = document.getElementById(in_nid + '_0_name').value;
  var voteIdLeft = document.getElementById(in_nid + '_0').value;
  var rightRapperName = document.getElementById(in_nid + '_1_name').value;
  var voteIdRight = document.getElementById(in_nid + '_1').value;
  //alert('Form Vars done');
  // POST String = Pass a key/value pair.
  var dataString = 'js=1&vote-selection=' + voteSelection + '&update=' + voteAction + '&left-rapper-name=' + leftRapperName + '&left-rapper-id=' + voteIdLeft + '&right-rapper-name=' + rightRapperName + '&right-rapper-id=' + voteIdRight; 
  //alert('POST String done');
  //
  //
  //document.getElementById("modalContent").remove()
  //var modalContent = document.createElement('div');
  //modalContent.setAttribute('id', 'modalContent');
  //document.getElementById("modal").appendChild(modalContent);
  
  $("#modal.desktop-content, #modal.mobile-content").html('<div class="vote-result">Updating your vote - one moment please.</div>');
  $.ajax({
    type: "POST",
    url: "/battle-poll/" + in_nid,
    data: dataString,
    dataType: 'HTML', // could be JSON, XML, SCRIPT or HTML
    success: function(data) {
      //alert('Left = ' + data.resultLeft + ' and Right = ' + data.resultRight + ' and Update = ' + data.update);
      $("#modal.desktop-content, #modal.mobile-content").html('<div class="vote-result">Vote Submitted!</div>');
      //console.log(data);
      //_gaq.push(['_trackEvent', 'Live PPV', 'voteSent', live_ppv_title]);
      $(".close").hide();
      setTimeout(function(){
        $("#modal.desktop-content, #modal.mobile-content").fadeOut(1000, function() {
          $(this).remove();
        });
      }, 2000);
    }
  }); // End AJAX
}
function metaHandler(){
    player.on('meta', function(e) {
        var rg_cmd = null;
        for (var key in e.metadata) {
            if (key.toUpperCase() == "TITLE" && e.metadata[ key ].indexOf("LAST-CHUNK-TIME") == -1) {
                // it contains "rapgrid" as prefix
                if (e.metadata[ key ].indexOf("rapgrid") === 0) {
                    var rg_cmd = [];
                    var rg_str = e.metadata[ key ].replace("rapgrid", "");
                    if(rg_str.startsWith("product-")){
                      rg_cmd[0] = "product";
                      rg_cmd[1] = rg_str.replace("product-", "");
                    }else if(rg_str.startsWith("battle-")){
                      rg_cmd[0] = "battle";
                      rg_cmd[1] = rg_str.replace("battle-", "");
                    }else if(rg_str.startsWith("reload-")){
                      rg_cmd[0] = "reload";
                      rg_cmd[1] = rg_str.replace("reload-", "");
                    }
                    //console.log('rg_cmd[0]:' + rg_cmd[0]);
                    //console.log('rg_cmd[1]:' + rg_cmd[1]);
                }
            }
        }
        if(rg_cmd !== null){
            // generate random number of seconds to wait
            var randDelay = Math.floor(Math.random() * 10000) + 1000;
            if(rg_cmd[0] && rg_cmd[1]){
                setTimeout(function () {
                  //console.log(rg_cmd);
                  switch(rg_cmd[0]) {
                    case "battle":
                      // display vote
                      showVoteDiv(rg_cmd[1]);
                      document.querySelector('.close').addEventListener('click', function() {
                        //console.log('click!');
                        closeModal();
                      });
                      break;
                    case "product":
                      // diaplay product
                      getProductJSON(rg_cmd[1]);
                      //console.log('product action' + rg_cmd);
                      break;
                    case "reload":
                      // reload the page if UID matches
                      if(rg_cmd[1] == $('#rguid').val()){
                        //console.log('reload action' + rg_cmd);
                        window.location.reload(true);
                      }
                      break;
                    default:
                      //console.log("default");
                  }
                }, randDelay);
            }

        }
    })
}
function closeModal(){
    $("#modal").remove();
}
refreshPlayer();
