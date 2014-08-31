var nodes = new Array();
var allData, me, friends;
var mq = {q:
    {
    'q1':'SELECT uid1, uid2 FROM friend WHERE uid1 = me() ORDER BY rand()',
    'q2':'SELECT uid1, uid2 FROM friend WHERE uid1 IN (SELECT uid2 FROM #q1) and uid2 IN (SELECT uid2 FROM #q1)',
    'q3':'SELECT uid, name FROM user WHERE uid IN ( SELECT uid2 FROM #q1 )'
    }
};

window.fbAsyncInit = function() {
    FB.init({
      appId      : '164365930266900',
      xfbml      : true,
      version    : 'v1.0'
    });

    FB.getLoginStatus(function(response) {
        if (response.status === 'connected') {
                $('#buttons').show();
                $('#fbLogin').hide();
                
                //var uid = response.authResponse.userID;
                //var accessToken = response.authResponse.accessToken;

                me = sys.addNode('me',{mass:1,fixed:true, x:10, y:10, color:'#900', shape:'dot', label:'Me', isLive:1});
                friends = sys.addNode('fri',{color:'#009', shape:'dot', label:'Friends', isLive:1});
                //sys.addEdge( me, friends );
                //sys.pruneNode(friends);

                FB.api('/fql', mq, function(data){		
                    allData = data;
                });

        } else if (response.status === 'not_authorized') {
            console.log("No connection");
        }
    });	
    
    FB.Event.subscribe('auth.login', function(){
        location.reload();
        console.log("log in click");
    });
	
};

function vlog(action, txt){
    $('#log').prepend( "> <B>" + action + "</B>" + ": " + txt + "<BR>");
}

function addConnections(){
    var connections = allData.data[1]['fql_result_set'];
    for ( var i=0; i< connections.length; i++ ){
            if  ( nodes[ connections[i].uid1 ] !== undefined && nodes[ connections[i].uid2 ] !== undefined ){
                sys.addEdge( nodes[ connections[i].uid1 ] , nodes[ connections[i].uid2 ], {color:'#993', mass:1} ) ; 
                nodes[ connections[i].uid1 ].mass++;
                nodes[ connections[i].uid2 ].mass++;
                vlog("Arc" , nodes[ connections[i].uid1 ].data.label + '-' + nodes[ connections[i].uid2 ].data.label );
            }
    }
}

function addMe(){
    me = sys.addNode('me',{fixed:true, x:10, y:10, color:'#900', shape:'dot', label:'Me', isLive:1});
    for ( var i in nodes){
        sys.addEdge( me, nodes[i] );
    }
    me.data.isLive = true;
}

function addFriends(){
    sys.pruneNode(friends);
    var myFriends = allData.data[2]['fql_result_set'];
    var limit = parseInt( $('#addFri').val() );
    for ( var i in myFriends ){
        console.log(limit);
        if ( i==limit ) return;
        nodes[ myFriends[i].uid ] = sys.addNode( "id"+myFriends[i].uid ,{mass:1,color:'#099', shape:'dot', label:myFriends[i].name})
        vlog("adding" , myFriends[i].name);
        if ( me.data.isLive ) sys.addEdge( me, nodes[ myFriends[i].uid ] );
    }
}

function removeMe(){
    sys.pruneNode(friends);
    sys.pruneNode(me);
    friends.data.isLive = 0;
    me.data.isLive = 0;
}

function removeLonlyFriends(){
    for ( var i in nodes ){
            if ( sys.getEdgesFrom( nodes[i] ).length < parseInt( $('#connections').val() ) ){
                    sys.pruneNode(nodes[i]);
                    vlog('removing', nodes[i].data.label);        
                    delete nodes[i];
            }
    }
}

function highlight(){
    var conn = $('#highlight').val();
    for ( var i in nodes ){
            if ( sys.getEdgesFrom( nodes[i] ).length > conn ){
                    nodes[i].data.color = '#009';
            }
    }    
}

function removeHighlights(){
    for ( var i in nodes ){
        nodes[i].data.color = '#099';
    }        
}

function fql(q){
    FB.api('/fql', q, function(data){
            console.log("query done.");
            console.log(data);
    });
}

function showNhide(show, hide){
    $('#'+show).show();
    $(hide).hide();
}

(function(d, s, id){
 var js, fjs = d.getElementsByTagName(s)[0];
 if (d.getElementById(id)) {return;}
 js = d.createElement(s); js.id = id;
 js.src = "//connect.facebook.net/en_US/sdk.js";
 fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
