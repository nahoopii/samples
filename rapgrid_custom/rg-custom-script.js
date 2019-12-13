$(document).ready(function() {
    var basePath = Drupal.settings.basePath;
    /*
    // Video JS Loader
    function loadVideo() {
        var video = videojs('videoPlayer');
        video_wrapper = video.caption({
            data: sami_data.rows,
            setting: {
                onCaptionChange: function(id){
                    console.log("I'm the id of the caption: " + id);
                },
                captionSize: 2.5,
                captionStyle: {
                    'background': 'rgba(0, 20, 140, 0) none repeat scroll 0 0',
                    'color': 'rgba(255, 255, 255, 0.40)',
                    'font-size': '20px',
                    'z-index':2147483647
                }
            }
        });
        $("#decrease-font").click(function () {
            video.caption.decreaseFontSize();
        });
    }

    // Load the Video
    loadVideo();
    */

    // Live Event Info
    $(".live-event-info").click(function () {
        $(this).toggleClass('open');
        if ($(this).hasClass("open")) {
            $(this).find("span").text('Show Less');
        } else {
            $(this).find("span").text('Show More');
        }
        // Reveal Overlay
        $( "#liveEventInfoContent" ).slideToggle( "slow", function() {
            // Animation complete.

        });
        return false;
    });
    
    $("#ytSubscribeLeague").click(function () {
        var live_ppv_title = $('#videoPlayer').data('title');
        _gaq.push(['_trackEvent', 'Live PPV', 'ytSubscribeLeague', live_ppv_title]); 
    });

    /*
    var myPlayer = videojs('videoPlayer');
    myPlayer.on("pause", function () {
        $(".subscribe-league-youtube").slideDown("fast");
    });

    // refresh token on pause/play
    videojs("videoPlayer").ready(function(){
      var myPlayer = this;
      myPlayer.on("pause", function () {
        myPlayer.on("play", function () {
          var live_ppv_nid = $('#videoPlayer').data('nid');
          var live_ppv_title = $('#videoPlayer').data('title');
          $.ajax({
            type: "POST",
            url: "/live/auth/ajax/" + live_ppv_nid,
            dataType: 'text', // could be JSON, XML, SCRIPT or HTML
            success: function(data) {
                myPlayer.src({type: 'application/x-mpegURL', src: data, withCredentials: true });
                myPlayer.off("play");
                _gaq.push(['_trackEvent', 'Live PPV', 'vidRefresh', live_ppv_title]);
                console.log("success");
            }
          });
        });
      });
    });
    */

}); // End DOM Load
