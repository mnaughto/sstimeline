

function ssft(id) {
	var about = {
		version: 0.1,
		Author: 'StickShift LLC',
		Created: 'December 2013',
		Updated: '09 December 2013'
	};
    
		
	if (id) {
		if (window === this) {
			return new ssft(id);
		}
		this.e = document.getElementById(id);
		this.sshtml = '<div class=stickShift>\
			<div class="display" id="display">\
               </div>\
               <div id="stickshift">\
               <div id="left">\
                    <div class="row" id="0-0"></div>\
                    <div class="row" id="0-1"></div>\
                    <div class="row" id="0-2"></div>\
                    <div class="row" id="0-3"></div>\
                    <div class="row" id="0-4"></div>\
                    <div class="row" id="0-5"></div>\
                    <div class="row" id="0-6"></div>\
                    <div class="row" id="0-7"></div>\
                    <div class="row" id="0-8"></div>\
               </div>\
               <div id="dot"></div>\
               <div id="right">\
                    <div class="row" id="1-0"></div>\
                    <div class="row" id="1-1"></div>\
                    <div class="row" id="1-2"></div>\
                    <div class="row" id="1-3"></div>\
                    <div class="row" id="1-4"></div>\
                    <div class="row" id="1-5"></div>\
                    <div class="row" id="1-6"></div>\
                    <div class="row" id="1-7"></div>\
                    <div class="row" id="1-8"></div>\
               </div>\
				<div id="vLine"></div>\
				</div>\
          </div>';
		return _.extend(this, Backbone.Events);
	}else{
		return about;
	}
};	

ssft.prototype = {
	reloadTree: function() {
			if(!this.trees){ return;}
			if(!this.addr){return;}
          	var page = this.addr.page,
          		treeData = this.trees[this.addr.tree].menuItems,
          		item,
          		cell;
          	ss$(this.e).find('.row').html('');
          	ss$(this.e).find('.row').css('visibility','hidden');
    		for(var i = 0; i < _.size(treeData); i++){
    			item = treeData[i];
    			if(item){if(item.page == page){
          			cell = ss$('#' + item.column + '-' + item.row);
          			cell.html(item.text);
          			cell.css({color: 'rgba(' + item.color.r + ', ' + item.color.g + ', ' + item.color.b + ', ' + item.color.a + ')'});
          			cell.css({'background-color': 'rgba(' + item.bgColor.r + ', ' + item.bgColor.g + ', ' + item.bgColor.b + ', ' + item.bgColor.a + ')'});
    				cell.css({'visibility':item.visibility});
      			}}
      		};
      	return this;	
      	},
	hide: function () {
		this.e.stype.display = 'none';
		return this;
	},	
	show: function () {
		this.e.stype.display = 'inherit';
		return this;
	},
	toggle: function () {
		return this;
	},
	turnOffUpdates: function() {  //don't delete appUser updates
		if(this.locUpdate){this.locUpdate.off('value');}
		if(this.locSocketUpdate){this.locSocketUpdate.off('value');}
		if(this.locSocket){this.locSocket.close();}
		if(this.dataUpdate){this.dataUpdate.off('value');}
		if(this.treeUpdate){this.treeUpdate.off('value');}
		if(this.f){this.f.off('value');}
		if(this.commandUpdate){this.commandUpdate.off('value');}
		
	},
	turnOnUpdates: function (){
		  var self = this;
		  if (this.sessionList){
        	this.sessionList.on('value', function(snapshot){
        		var sessions = snapshot.val();
        		if (!sessions){ console.log('sessions error'); return;};
        		ss$('#sessionList').html('');
        		for(var key in sessions){
          			item = sessions[key];
						ss$('#sessionList').append('<li class="session" id="'+key+'"><a href="#">'+key+'</a></li>');
				}
    		});
    		}
    		if (this.f){
    		this.f.on('value', function(snapshot){
    			self.trees = snapshot.child('menus').val();
        		self.reloadTree();
    		});
    		}
    		if (this.dataUpdate) {
    		this.dataUpdate.on('value', function(snapshot){
    			var event;
    			objDiv = ss$('#display');
        		objDiv.append('<br/>' + snapshot.val());
        		if (objDiv.length > 0){
        			objDiv[0].scrollTop = objDiv[0].scrollHeight;
        		};
        		ss$(self.e).trigger('dataUpdate', {
        			val: snapshot.val(),
        			time: new Date()
        			});
    		});
    		}
    		if (this.locUpdate){
    		    		this.locUpdate.on('value', function(snapshot){
    			var coords = snapshot.val();
        		if(coords && !self.locSocket){
        			ss$('#screen').css({'visibility':'visible'});
        		  	ss$('#dot').transit({y:coords.y, x:coords.x, duration: 0});
        		}
    		});
}
    		
//     		if (this.locSocketUpdate) {
//         this.locSocketUpdate.on('value', function(snapshot){
//           var info = snapshot.val();
//           if(info){
//             self.locSocket = new WebSocket('ws://' + info.ip + ':' + info.port);
//             self.locSocket.onerror = self.locSocket.onclose = function(){
//               self.locSocket = false;
//               if (this.locUpdate) {
//     		}
//             };
//             self.locSocket.onmessage = function(message){
//               var nextLoc = JSON.parse(message.data);
//               ss$('#dot').transit({y:nextLoc.y - 17, x:nextLoc.x, duration:0});
//             };
//           }
//         });
//         }
        if (this.treeUpdate) {
    		this.treeUpdate.on('value', function(snapshot){
        	//update the tree
        		self.addr = snapshot.val();
        		if(!self.addr) return;
        	self.reloadTree();
        });
        }
        if (this.commandUpdate){
        this.commandUpdate.on('value', function(snapshot){
          var data = snapshot.val();
          if(data){
            if(data['Args']){
              self.trigger(data['Type'], _.values(data['Args']));
            } else {
              self.trigger(data['Type']);
            }
          }
        });
        }
    		return this;
          },
	stickShiftView: function(appID) {
		console.log("Initializing StickShiftView");
			this.fbRoot = new Firebase('https://stickshift.firebaseio.com/');
			var that = this;
			var auth = new FirebaseSimpleLogin(this.fbRoot, function(error, user){
				if (error){
					console.log(error);
				}else if (user){
					console.log('User ID: '+user.id+', Provider: '+user.provider);
					that.sessionList = that.fbRoot.child('sessions');
					that.sessionID = user.id;
					console.log(that.sessionID);
					that.appData = that.sessionList.child(user.id);
					that.appData.onDisconnect().remove();
					that.appData.child('appID').set(appID);
					that.showQRCode();

					var self = that;
					that.appData.on('child_added',function(snapshot){
						if(snapshot.name() == 'outputs'){
							that.updateStickShiftView(appID);
							ss$('#qr').hide();
							ss$('#blank').show();

						}
					});
					that.appData.on('child_removed',function(snapshot){
						if(snapshot.name() == 'outputs'){
							that.showQRCode();
							ss$('#qr').show();
							ss$('#blank').hide();


						}

					});

					ss$(window).bind('beforeunload', function() {
						if (!self.watching){
      						self.appData.remove();
      					}
      				});
					
					

				}else{
					auth.login('anonymous');
					console.log('new login');
				}
			});
			this.watching = false;
      return this;
	},
	showQRCode: function () {
		this.tokenRef = this.appData.child('token');
		this.tokenRef.on('value', function(snapshot){
			ss$('#qr').html('');
			//+"&node="+snapshot.parent().child('rand').val()
			ss$('#qr').qrcode({ text: "http://usestickshift.com/?token="+snapshot.val()});
			//this.turnOffUpdates()
			if(this.locUpdate){delete this.locUpdate;};
			if(this.locSocketUpdate){delete this.locSocketUpdate;};
			if(this.dataUpdate){delete this.dataUpdate;};
			if(this.treeUpdate){delete this.treeUpdate;};

		});

		
	},

	updateStickShiftView: function(appID){
		if(this.tokenRef){this.tokenRef.off('value');}
			console.log("Updating StickShift to appID: "+appID);
			
			if (this.appID != appID|| !this.f){
				this.appID = appID;
				this.f = this.fbRoot.child('trees/v1/'+appID);
				var outputTree = this.appData.child('outputs');
		    	this.treeUpdate = outputTree.child('Tree'); // current tree for user
          		this.locUpdate = outputTree.child('Dot'); // dot coordinates
            	this.locSocketUpdate = outputTree.child('SocketInfo'); //socket information
          		this.dataUpdate = outputTree.child('data') // commands from user
          		this.turnOffUpdates;
          		this.turnOnUpdates();
			}
			
			ss$('#display').html('');
			ss$(this.e).html(this.sshtml);
          return this;
	},
	watchSession: function(sessionID){
		if(self.appData){
			self.appData.remove();
		}
		this.appData = this.sessionList.child(sessionID);
		this.appID = this.sessionList.child('appID');
		this.updateStickShiftView(this.appID)
		
		this.watching = true;

	}
};