


var demo = {
	LAZY_MIN: 1000,
	LAZY_MAX: 6000,
	CLEAR_COLOR: '#39609B',	
	RES_PATH: 'res',
	
	lastElement: null,
	timer: null,
	
	getRes: function(file){
		return demo.RES_PATH+'/'+file;
	},

	getEnvMap: function(){
		if(!demo.defaultEnvmap){			
			demo.defaultEnvmap=[];
			var image=demo.getRes('room.jpg');
			for(var i=0;i<6;i++){
				demo.defaultEnvmap.push(image);
			}
		}
		return demo.defaultEnvmap;
	},
	
	//all registered object creaters.
	_creators: {},

	//all registered object filters.
	_filters: {},

	//all registered shadow painters.
	_shadowPainters: {},

	registerCreator: function(type, creator){
		this._creators[type] = creator;
	},
	
	getCreator: function(type){
		return this._creators[type];
	},
	
	registerFilter: function(type, filter){
		this._filters[type] = filter;
	},
	
	getFilter: function(type){
		return this._filters[type];
	},

	registerShadowPainter: function(type, painter){
		this._shadowPainters[type] = painter;
	},
	
	getShadowPainter: function(type){
		return this._shadowPainters[type];
	},
	
	
	init: function(htmlElementId){				
		var gl3dview= new mono.Gl3dview3D();
		demo.typeFinder = new mono.QuickFinder(gl3dview.getServa(), 'type', 'client');

		var gleye = new mono.PerspectiveGleye(30, 1.5, 30, 30000);		
		gl3dview.setGleye(gleye);
		
		var interaction = new mono.DefaultInteraction(gl3dview);
		interaction.yLowerLimitAngle=Math.PI/180*2;
		interaction.yUpLimitAngle=Math.PI/2;
		interaction.maxDistance=10000;
		interaction.minDistance=50;
		interaction.zoomSpeed=3;
		interaction.panSpeed=0.2;

		var editInteraction = new mono.EditInteraction(gl3dview);
		editInteraction.setShowHelpers(true);
        editInteraction.setScaleable(false);
        editInteraction.setRotateable(false);
        editInteraction.setTranslateable(true);

		gl3dview.setInteractions([interaction, new mono.SelectionInteraction(gl3dview), editInteraction]);

		gl3dview.isSelectable = function(element){
			return gl3dview.moveView && element.getClient('type') === 'rack';
		};	
		gl3dview.editableFunction = function(element){
			return gl3dview.moveView && element.getClient('type') === 'rack';
		}	
		document.getElementById(htmlElementId).appendChild(gl3dview.getRootView());
		var tooltip = new Tooltip(['BusinessId'],['000000']);
		document.body.appendChild(tooltip.getView());

		var personLoaded = false;
		
		var buttons=[{
			label: '场景复位',
			icon: 'reset.png',
			clickFunction: function(){							
				demo.resetView(gl3dview);
			},
		},{
			label: '走线管理',
			icon: 'connection.png',
			clickFunction: function(){
				var showing=gl3dview.connectionView;
				demo.resetView(gl3dview);
				if(!showing){
					demo.toggleConnectionView(gl3dview);
				}
			}
		},{
			label: '人工路径',
			icon: 'person.png',
			clickFunction: function(){
				demo.togglePersonVisible(personLoaded, gl3dview);
				personLoaded = !personLoaded;
			}
		},{
			label: '调试信息',
			icon: 'fps.png',
			clickFunction: function(){
				demo.toggleFpsView(gl3dview);
			}
		},{
			label: '拖拽机柜',
			icon: 'edit.png',
			clickFunction: function(){
				var showing=gl3dview.moveView;
				demo.resetView(gl3dview);
				if(!showing){
					demo.toggleMoveView(gl3dview);
				}
			}
		},{
			label: '温度图',
			icon: 'temperature.png',
			clickFunction: function(){				
				var showing=gl3dview.temperatureView;
				demo.resetView(gl3dview);
				if(!showing){
					demo.toggleTemperatureView(gl3dview);
				}
			}
		},{
			label: '可用空间',
			icon: 'space.png',
			clickFunction: function(){			
				var showing=gl3dview.spaceView;
				demo.resetView(gl3dview);
				if(!showing){
					demo.toggleSpaceView(gl3dview);
				}
			}
		},{
			label: '机柜利用率',
			icon: 'usage.png',
			clickFunction: function(){
				var showing=gl3dview.usageView;
				demo.resetView(gl3dview);
				if(!showing){
					demo.toggleUsageView(gl3dview);
				}
			}
		},{
			label: '空调风向',
			icon: 'air.png',
			clickFunction: function(){		
				var showing=gl3dview.airView;
				demo.resetView(gl3dview);
				if(!showing){
					demo.toggleAirView(gl3dview);
				}
			}
		},{
			label: '烟雾监控',
			icon: 'smoke.png',
			clickFunction: function(){		
				var showing=gl3dview.smokeView;
				demo.resetView(gl3dview);
				if(!showing){
					demo.toggleSmokeView(gl3dview);
				}
			}
		},{
			label: '漏水监测',
			icon: 'water.png',
			clickFunction: function(){		
				var showing=gl3dview.waterView;
				demo.resetView(gl3dview);
				if(!showing){
					demo.toggleWaterView(gl3dview);
				}
			}
		},{
			label: '防盗监测',
			icon: 'security.png',
			clickFunction: function(){			
				var showing=gl3dview.laserView;
				demo.resetView(gl3dview);
				if(!showing){
					demo.toggleLaserView(gl3dview);
				}
			}
		},{
			label: '供电电缆',
			icon: 'power.png',
			clickFunction: function(){			
				var showing=gl3dview.powerView;
				demo.resetView(gl3dview);
				if(!showing){
					demo.togglePowerView(gl3dview);
				}
			}
		},{
			label: '告警巡航',
			icon: 'alarm.png',
			clickFunction: function(){			
				if(gl3dview.inspecting){
					return;
				}
				demo.resetView(gl3dview);
				demo.resetRackPosition(gl3dview);
				gl3dview.inspecting=true;
				demo.inspection(gl3dview);
			}		
		}];
		demo.setupToolbar(buttons);

		mono.Utils.autoAdjustGl3dviewBounds(gl3dview,document.documentElement,'clientWidth','clientHeight');
		//gl3dview.getRootView().addEventListener('click', function(e){
		//	demo.handleOneClick(e, gl3dview);
		//});
		gl3dview.getRootView().addEventListener('dblclick', function(e){
			demo.handleDoubleClick(e, gl3dview);
		});	
		gl3dview.getRootView().addEventListener('mousemove',function(e){
			demo.handleMouseMove(e, gl3dview, tooltip);
		});

		demo.setupLights(gl3dview.getServa());
		gl3dview.getServa().getAlarmBox().addServaChangeListener(function(e){
			var alarm = e.data;
			if(e.kind === 'add'){
				var node = gl3dview.getServa().getDataById(alarm.getElementId());
				node.setStyle('m.alarmColor', null);
			}
		});

		gl3dview.getServa().addDataPropertyChangeListener(function(e){
			var element = e.source, property = e.property, oldValue = e.oldValue, newValue = e.newValue;
			if(property == 'position' && gl3dview.moveView){
				if(oldValue.y != newValue.y){
					element.setPositionY(oldValue.y);
				}
			}

		});
		
		gl3dview.addInteractionListener(function(e){
			if(e.kind == 'liveMoveEnd'){				
				demo.dirtyShadowMap(gl3dview);
			}
		});

		var time1=new Date().getTime();
		demo.loadData(gl3dview);
		var time2=new Date().getTime();		
		console.log('time:  ' + (time2-time1));

		demo.startSmokeAnimation(gl3dview);
		demo.startFpsAnimation(gl3dview);
		demo.resetGleye(gl3dview);
	},
	
	resetGleye: function(gl3dview){
		gl3dview.getGleye().setPosition(2000,1200,3000);
		gl3dview.getGleye().lookAt(new mono.XiangliangThree(0,0,0));
	},

	dirtyShadowMap: function(gl3dview){
		var floor = gl3dview.getServa().shadowHost;
		var floorCombo = demo.typeFinder.findFirst('floorCombo');
		demo.updateShadowMap(floorCombo, floor, floor.getId(),gl3dview.getServa());
	},

	togglePersonVisible: function(visible, gl3dview){
		var gleye = gl3dview.getGleye();
		var databox = gl3dview.getServa();
		if(!visible){
			this.loadObj(gleye, databox);
		}else{
			this.removeObj(databox);
		}
	},

	removeObj: function(box){
		var person = demo.typeFinder.find('person').get(0);
		person.animate.stop();
		box.removeByDescendant(person);

		var trail = demo.typeFinder.find('trail').get(0);
		box.removeByDescendant(trail);
	},
	
	loadObj: function(gleye, box){
		var obj=demo.getRes('worker.obj');
		var mtl=demo.getRes('worker.mtl');               
			
		var loader = new mono.OBJMTLLoader();
		loader.load(obj, mtl, {'worker': demo.getRes('worker.png'),}, function (object) {                    			
			object.setScale(3,3,3);		
			object.setClient('type', 'person');	
			box.addByDescendant(object);
			
			var updater=function(element){
				if(element && element.getChildren()){
					element.getChildren().forEach(function(child){
						child.setStyle('m.normalType', mono.NormalTypeSmooth);
						updater(child);
					});
				}
			}
			updater(object);

			var x=-650, z=600, angle=0;
			object.setPosition(x, 0, z);
			object.setRotationY(angle);
			var points=[[650, 600], [650, -300], [130, -300], [130, -600], [-650, -600], [-650, 580], [-450, 580], [-400, 550]];
			object.animate=demo.createPathAnimates(gleye, object, points);//, true);//, true, 0);
			object.animate.play();

			var path=new mono.Path();
			path.moveTo(object.getPositionX(), object.getPositionZ());
			for(var i=0;i<points.length; i++){
				path.lineTo(points[i][0], points[i][1]);
			}
			path = mono.PathNode.prototype.adjustPath(path, 20);

			var trail=new mono.PathCube(path, 10, 3);
			trail.s({
				'm.type': 'phong',
				'm.specularStrength': 30,
				'm.color': '#298A08',
				'm.ambient': '#298A08', 		
				'm.texture.image': demo.getRes('flow.jpg'),
				'm.texture.repeat': new mono.XiangliangTwo(150, 1),
			});
			trail.setRotationX(Math.PI);
			trail.setPositionY(5);
			trail.setClient('type', 'trail');
			box.add(trail);
		});
	},

	createPathAnimates: function(gleye, element, points, loop, finalAngle){
		var animates=[];		

		if(points && points.length>0){
			var x=element.getPositionX();
			var z=element.getPositionZ();
			var angle=element.getRotationY();

			var createRotateAnimate=function(gleye, element, toAngle, angle){
				if(toAngle!=angle && toAngle!=NaN){
					if(toAngle-angle > Math.PI){
						toAngle-=Math.PI*2;
					}
					if(toAngle-angle < -Math.PI){
						toAngle+=Math.PI*2;
					}
					//console.log(angle, toAngle);
					var rotateAnimate = new twaver.Animate({
						from: angle,
						to: toAngle,
						type: 'number',
						dur: Math.abs(toAngle-angle)*300,
						easing: 'easeNone',
						onUpdate: function(value){
							element.setRotationY(value);
						},
					});
					rotateAnimate.toAngle=toAngle;
					return rotateAnimate;
				}
			}

			for(var i=0;i<points.length;i++){
				var point=points[i];				
				var x1=point[0];
				var z1=point[1];
				var rotate=Math.atan2(-(z1-z), x1-x);
				
				var rotateAnimate=createRotateAnimate(gleye, element, rotate, angle);
				if(rotateAnimate){
					animates.push(rotateAnimate);
					angle=rotateAnimate.toAngle;
				}
				
				var moveAnimate = new twaver.Animate({
					from: {x: x, y: z},
					to: {x: x1, y: z1},
					type: 'point',
					dur: Math.sqrt((x1-x)*(x1-x)+(z1-z)*(z1-z))*5,
					easing: 'easeNone',
					onUpdate: function(value){
						element.setPositionX(value.x);
						element.setPositionZ(value.y);
					},
				});
				animates.push(moveAnimate);				

				x=x1;
				z=z1;
			}			

			if(finalAngle!=undefined && angle!=finalAngle){
				var rotateAnimate=createRotateAnimate(gleye, element, finalAngle, angle);
				if(rotateAnimate){
					animates.push(rotateAnimate);
				}
			}
		}
		var animate;
		for(var i=0;i<animates.length;i++){
			if(i>0){
				animates[i-1].chain(animates[i]);
				if(loop &&i==animates.length-1){
					animates[i].chain(animate);
				}
			}else{
				animate=animates[i];
			}
		}
		return animate;
	},

	toggleConnectionView: function(gl3dview){
		gl3dview.connectionView=!gl3dview.connectionView;

		var connectionView=gl3dview.connectionView;
		var box=gl3dview.getServa();
		var connections = demo.typeFinder.find('connection');
		var rails = demo.typeFinder.find('rail');
		connections.forEach(function(connection){
			connection.setVisible(connectionView);
			if(!connection.billboard){
				connection.billboard=new mono.Billboard();
				connection.billboard.s({
					'm.texture.image': demo.createConnectionBillboardImage('0'),
					'm.vertical': true,
				});
				connection.billboard.setScale(60,30,1);
				connection.billboard.setPosition(400,230,330);
				box.add(connection.billboard);
			}
			connection.billboard.setVisible(connectionView);
			if(connection.isVisible()){
				var offsetAnimate = new twaver.Animate({
					from: 0 ,
					to: 1,
					type: 'number',
					dur: 1000,
					repeat:Number.POSITIVE_INFINITY,
					reverse: false,
					onUpdate: function(value){
						connection.s({
							'm.texture.offset': new mono.XiangliangTwo(value, 0),
						});
						if(value===1){
							var text='54'+parseInt(Math.random()*10)+'.'+parseInt(Math.random()*100);
							connection.billboard.s({
								'm.texture.image': demo.createConnectionBillboardImage(text),
							});
						}
					},
				});
				offsetAnimate.play();
				connection.offsetAnimate = offsetAnimate;
			}else{
				if(connection.offsetAnimate){
					connection.offsetAnimate.stop();
				}
			}
		});
		rails.forEach(function(rail){
			rail.setVisible(connectionView);
		});
	},

	setupLights: function(box){
		var pointLight = new mono.PointLight(0xFFFFFF,0.3);
		pointLight.setPosition(0,1000,-1000);
		box.add(pointLight);     
		
		var pointLight = new mono.PointLight(0xFFFFFF,0.3);
		pointLight.setPosition(0,1000,1000);
		box.add(pointLight);        

		var pointLight = new mono.PointLight(0xFFFFFF,0.3);
		pointLight.setPosition(1000,-1000,1000);
		box.add(pointLight);        

		box.add(new mono.AmbientLight('white'));	
	},

	handleDoubleClick: function(e, gl3dview){
		var gleye=gl3dview.getGleye();
		var interaction=gl3dview.getDefaultInteraction();
		var firstClickObject=demo.findFirstObjectByMouse(gl3dview,e);
		if(firstClickObject){
			var element=firstClickObject.element;		
			var newTarget=firstClickObject.point;
			var oldTarget=gleye.getTarget();
			demo.animateGleye(gleye, interaction, oldTarget, newTarget, function(){
				if(element.getClient('animation')){
					demo.playAnimation(element, element.getClient('animation'));
				}				
			});
			if(element.getClient('dbl.func')){				
				var func=element.getClient('dbl.func');
				func();
			}
		}else{
			var oldTarget=gleye.getTarget();
			var newTarget=new mono.XiangliangThree(0,0,0);
			demo.animateGleye(gleye, interaction, oldTarget, newTarget);
		}
	},



	//鼠标移动到网元上1S后显示tooltip
    handleMouseMove: function(e, gl3dview, tooltipObj){ 
        var objects = gl3dview.getElementsByMouseEvent(e);
        //获取当前网元，如果当前鼠标下有对象并且类型为group，那么就设置currentElement为鼠标下的网元
        var currentElement = null;
        var tooltip = tooltipObj.getView();
        // var tooltip = document.getElementById('tooltip');
        if (objects.length) {           
            var first = objects[0];
            var object3d = first.element;
            if(object3d.getClient('type') === 'card' && object3d.getClient('isAlarm')){ 
                currentElement = object3d;
                tooltipObj.setValues([object3d.getClient('BID')]);
            }
        }
        //如果当前和上一次的网元不一致，先清除timer。
        //如果当前网元有值，起一个timer，2S后显示tooltip。
        //tooltip显示的位置为最近一次鼠标移动时的位置
        if (demo.lastElement != currentElement ) {
            clearTimeout(demo.timer);
            if(currentElement){
               demo.timer = setTimeout(function(){
                    tooltip.style.display = 'block';
                    tooltip.style.position = 'absolute';
                    tooltip.style.left = (window.lastEvent.pageX - tooltip.clientWidth/2) + 'px';
                    tooltip.style.top = (window.lastEvent.pageY - tooltip.clientHeight - 15) + 'px';
                },1000); 
            }     
        }
        //设置上一次的网元为当前网元
        demo.lastElement = currentElement; 
        //如果当前鼠标下没有网元，隐藏tooltip
        if(currentElement == null){
            tooltip.style.display = 'none';
        }
        //设置每次移动时鼠标的事件对象
        window.lastEvent = e;
    },

	copyProperties: function(from, to, ignores){
		if(from && to){
			for(var name in from){
				if(ignores && ignores.indexOf(name)>=0){
					//ignore.
				}else{
					to[name]=from[name];
				}
			}
		}
	},



	createCubeObject: function(json){
		var translate=json.translate || [0,0,0];
		var width=json.width;
		var height=json.height;
		var depth=json.depth;
		var sideColor=json.sideColor;
		var topColor=json.topColor;

		var object3d=new mono.Cube(width, height, depth);				
		object3d.setPosition(translate[0], translate[1]+height/2, translate[2]);					
		object3d.s({
			'm.color': sideColor,
			'm.ambient': sideColor,
			'left.m.lightmap.image': demo.getRes('inside_lightmap.jpg'),
			'right.m.lightmap.image': demo.getRes('outside_lightmap.jpg'),
			'front.m.lightmap.image': demo.getRes('outside_lightmap.jpg'),
			'back.m.lightmap.image': demo.getRes('inside_lightmap.jpg'),
			'top.m.color': topColor,
			'top.m.ambient': topColor,						
			'bottom.m.color': topColor,
			'bottom.m.ambient': topColor,						
		});

		return object3d;
	},
	
	create2DPath: function(pathData) {
		var path;
		for(var j=0;j<pathData.length;j++){
			var point=pathData[j];
			if(path){
				path.lineTo(point[0],point[1], 0);
			}else{
				path=new mono.Path();
				path.moveTo(point[0],point[1], 0);
			}
		}

		return path;
	},
	
	create3DPath: function(pathData) {
		var path;
		for(var j=0;j<pathData.length;j++){
			var point=pathData[j];
			if(path){
				path.lineTo(point[0],point[1], point[2]);
			}else{
				path=new mono.Path();
				path.moveTo(point[0],point[1], point[2]);
			}
		}

		return path;
	},

	createPathObject: function(json){
		var translate=json.translate || [0,0,0];
		var pathWidth=json.width;
		var pathHeight=json.height;		
		var pathData=json.data;					
		var path=this.create2DPath(pathData);
		var pathInsideColor=json.insideColor;
		var pathOutsideColor=json.outsideColor;
		var pathTopColor=json.topColor;
		
		var object3d=this.createWall(path, pathWidth, pathHeight, pathInsideColor, pathOutsideColor, pathTopColor);
		object3d.setPosition(translate[0], translate[1], -translate[2]);	
		object3d.shadow=json.shadow;

		return object3d;
	},

	filterJson: function(box, objects){
		var newObjects=[];

		for(var i=0; i<objects.length; i++){
			var object=objects[i];
			var type=object.type;
			var filter=this.getFilter(type);
			if(filter){
				var filteredObject=filter(box, object);
				if(filteredObject){
					if(filteredObject instanceof Array){
						newObjects=newObjects.concat(filteredObject);						
					}else{
						this.copyProperties(object, filteredObject, ['type']);
						newObjects.push(filteredObject);
					}
				}
			}else{
				newObjects.push(object);				
			}
		}
		
		return newObjects;
	},

	createCombo: function(parts){
		var children=[];		
		var ops=[];
		var ids=[];
		for(var i=0;i<parts.length;i++){
			var object=parts[i];
			var op=object.op || '+';
			var style=object.style;
			var translate=object.translate || [0,0,0];
			var rotate=object.rotate || [0,0,0];
			var object3d=null;
			if(object.type==='path'){				
				object3d=this.createPathObject(object);
			}
			if(object.type==='cube'){
				object3d=this.createCubeObject(object);
			}			
			if(object3d){
				object3d.setRotation(rotate[0], rotate[1], rotate[2]);
				if(style){
					object3d.s(style);
				}						
				children.push(object3d);
				if(children.length>1){
					ops.push(op);
				}
				ids.push(object3d.getId());
			}
		}

		if(children.length>0){
			var combo=new mono.ComboNode(children, ops);
			combo.setNames(ids);
			return combo;
		}
		return null;
	},


	
	loadData: function(gl3dview){
		var json= demo.filterJson(gl3dview.getServa(), dataJson.objects);
		var box=gl3dview.getServa();

		gl3dview.setClearColor(demo.CLEAR_COLOR);

		var children=[];
		var ops=[];
		var ids=[];
		var shadowHost;
		var shadowHostId;
		for(var i=0;i<json.length;i++){
			var object=json[i];
			var op=object.op;
			var style=object.style;
			var client=object.client;
			var translate=object.translate || [0,0,0];
			var rotate=object.rotate || [0,0,0];
			var object3d=null;

			if(object.type==='path'){				
				object3d=this.createPathObject(object);
			}
			if(object.type==='cube'){
				object3d=this.createCubeObject(object);				
			}

			if(object.shadowHost){
				shadowHost=object3d;
				shadowHostId=object3d.getId();
				box.shadowHost = shadowHost;
			}

			var creator=demo.getCreator(object.type);  												
			if(creator){
				creator(box, object);
				continue;
			}

			if(object3d){
				object3d.shadow = object.shadow;
				object3d.setRotation(rotate[0], rotate[1], rotate[2]);
				if(style){
					object3d.s(style);
				}		
				if(client){
					for(var key in client){
						object3d.setClient(key,client[key]);		
					}
				}	
				if(op){
					children.push(object3d);
					if(children.length>1){
						ops.push(op);
					}
					ids.push(object3d.getId());
				}else{						
					box.add(object3d);
				}
			}
		}
		
		if(children.length>0){
			var combo=new mono.ComboNode(children, ops);			
			combo.setNames(ids);
			combo.setClient('type', 'floorCombo');
			box.add(combo);

			//lazy load floor shadow map.
			if(shadowHost && shadowHostId){
				setTimeout(function(){demo.updateShadowMap(combo, shadowHost, shadowHostId,box)}, demo.LAZY_MAX);
			}
		}
	},

	updateShadowMap: function(combo, shadowHost, shadowHostId,box){					
		var shadowMapImage=demo.createShadowImage(box, shadowHost.getWidth(), shadowHost.getDepth());
		var floorTopFaceId=shadowHostId+'-top.m.lightmap.image';						
		combo.setStyle(floorTopFaceId, shadowMapImage);
	},

	loadRackContent: function(box, x, y, z, width, height, depth, severity, cube, cut, json, parent, oldRack){
		var positionY=10;
		var serverTall=9;
		var serverGap=2;
		var findFaultServer=false;
		while(positionY<height-20){
			var number = parseInt(Math.random()*3)+1;
			var pic='server'+number+'.jpg';
			if(number === 3 ){
				pic='server3.png';
			}
			
			var color= (number === 3 || positionY>100) && !findFaultServer && severity ? severity.color : null;
			var server=this.createServer(box, cube, cut, pic, color, oldRack);

			var size = server.getBizBox().size();
			if(color){
				findFaultServer=true;
			}
			server.setPositionY(positionY + size.y/2 - height/2);
			server.setPositionZ(server.getPositionZ()+5);	
			server.setParent(parent);
			positionY = positionY + size.y + serverGap;
			if(positionY>200){
				box.removeByDescendant(server,true);
				break;
			}

		}
	},

	createServer: function(box, cube, cut, pic, color, oldRack){
		var picMap = {
			'server1.jpg': 4.445*2,
			'server2.jpg': 4.445*3,
			'server3.png': 4.445*6,
		}
		var x=cube.getPositionX();
		var z=cube.getPositionZ();
		var width=cut.getWidth();
		var height = picMap[pic];
		var depth=cut.getDepth();

		var serverBody=new mono.Cube(width-2, height-2, depth-4);
		var bodyColor=color?color:'#5B6976';
		serverBody.s({
			'm.color': bodyColor,
			'm.ambient': bodyColor,
			'm.type':'phong',
			'm.texture.image': demo.getRes('rack_inside.jpg'),
		});
		serverBody.setPosition(0, 0.5, (cube.getDepth()-serverBody.getDepth())/2);

		var serverPanel=new mono.Cube(width+2, height+1, 0.5);
		color=color?color:'#FFFFFF';
		serverPanel.s({			
			'm.texture.image': demo.getRes('rack_inside.jpg'),
			'front.m.texture.image': demo.RES_PATH + '/' +pic,
			'front.m.texture.repeat': new mono.XiangliangTwo(1,1),
			'm.specularStrength': 100,
			'm.transparent': true,
			'm.color': color,
			'm.ambient': color,
		});
		serverPanel.setPosition(0, 0, serverBody.getDepth()/2+(cube.getDepth()-serverBody.getDepth())/2);
		if(pic == 'server3.png'){
			var serverColor = '#FFFFFF';
			serverPanel.s({
				'm.color': serverColor,
				'm.ambient': serverColor,
			});
		}

		var server=new mono.ComboNode([serverBody, serverPanel], ['+']);
		server.setRotation(0, Math.PI/180 * 90, 0);
		server.setClient('animation', 'pullOut.x');
		server.setClient('type','drawer');
		server.setClient('dbl.func', demo.showCardTable);
		server.setPosition(0.5, 0, -5);
		box.add(server);

		if(pic == 'server3.png'){
			var isRendered = false;
			var xoffset = 2.1008, yoffset = 0.9897;
			var width = width + 2;
			var height = height +1;
			var cardWidth = (width - xoffset*2)/14;
			var count = 14;

			for(var i = 0; i< count; i++){
				var cardColor = '#FFFFFF';
				if(i > 5 && !isRendered) {
					cardColor = color;
					isRendered = true;
				}
				var params={
					'height': height-yoffset*2, 
					'width': cardWidth, 
					'depth':depth*0.4, 
					'pic': demo.RES_PATH + '/'+ 'card'+(i%4+1) +'.png',
					'color': cardColor
				};
				var card=demo.createCard(params);
				//card.setRotation(0, Math.PI/180 * 180, 0);
				box.add(card);

				card.setParent(server);	
				card.setClient('type','card');
				card.setClient('dbl.func', demo.showCardTable);
				card.setClient('BID','card-'+i);	
				card.setClient('isAlarm', cardColor != '#FFFFFF');				
		  		card.p(-width/2 + xoffset + (i+0.5) * cardWidth,-height/2+yoffset,serverPanel.getPositionZ()-1);
		  		card.setClient('animation', 'pullOut.z');

				if(card.getClient('isAlarm')){
					oldRack.alarmCard=card;					
				}
		  	}
		}
		return server;
	},

	createCard: function(json){
		var translate=json.translate || [0,0,0];
		var x=translate[0],
			y=translate[1],
			z=translate[2];
		var width=json.width || 10,
			height=json.height || 50,
			depth=json.depth || 50;	
		var rotate=json.rotate || [0,0,0];
		var color = json.color || 'white';
		var pic = json.pic || demo.getRes('card1.png');

		var parts=[{
			//card panel
			type: 'cube',
			width: width,
			height: height,
			depth: 1,
			translate: [x, y, z+1],
			rotate: rotate,
			op: '+',			
			style:{
				'm.color': color,
				'm.ambient': color,
				'm.texture.image': demo.getRes('gray.png'),
				'front.m.texture.image': pic,
				'back.m.texture.image': pic,
			}
		},{
			//card body
			type: 'cube',
			width: 1,
			height: height*0.95,
			depth: depth,
			translate: [x, y, z-depth/2+1],
			rotate: rotate,
			op: '+',
			style:{
				'm.color': color,
				'm.ambient': color,
				'm.texture.image': demo.getRes('gray.png'),
				'left.m.texture.image': demo.getRes('card_body.png'),
				'right.m.texture.image': demo.getRes('card_body.png'),
				'left.m.texture.flipX': true,
				'm.transparent': true,	
				'm.lightmap.image':demo.getRes('outside_lightmap.jpg'),
			} 
		}];
		
		return demo.createCombo(parts);
	},	

	createShadowImage: function(box, floorWidth, floorHeight){			
		var canvas = document.createElement('canvas');
		canvas['width']=floorWidth;
		canvas['height']=floorHeight;
		var context = canvas.getContext('2d');
		context.beginPath();
		context.rect(0, 0, floorWidth, floorHeight);
		context.fillStyle = 'white';
		context.fill();

		var marker=function(context, text, text2, x, y){
			var color='#0B2F3A';//'#0B2F3A';//'#FE642E';
			context.font = 60+'px "Microsoft Yahei" bold';
			context.fillStyle = color;
			context.textAlign = 'center';
			context.textBaseline = 'middle';
			//context.shadowBlur = 30;
			context.fillText(text, x, y);
			context.strokeStyle=color;
			context.lineWidth=3;
			context.strokeText(text, x, y);

			if(!text2) return;
			y+=52;
			color='#FE642E';
			context.font = 26+'px "Microsoft Yahei" ';
			context.fillStyle = color;
			context.textAlign = 'center';
			context.textBaseline = 'middle';
			context.fillText(text2, x, y);
		}
		marker(context, 'Lenovo 2F Lab', '联想大厦', 2050, 1800);

		box.forEach(function(object){
			if(object instanceof mono.Entity && object.shadow){
				var translate=object.getPosition() || {x:0, y:0, z:0};	
				var rotate=object.getRotation() || {x:0, y:0, z:0};
				var rotate=-rotate[1];

				demo.paintShadow(object, context, floorWidth, floorHeight, translate, rotate);
			}
		});
		
		return canvas;
	},

	paintShadow: function(object, context, floorWidth, floorHeight, translate, rotate){
		var type=object.getClient('type');
		var shadowPainter=demo.getShadowPainter(type);

		if(shadowPainter){
			shadowPainter(object, context, floorWidth, floorHeight, translate, rotate);
		}
	},	
	
	findFirstObjectByMouse: function(gl3dview, e){
		var objects = gl3dview.getElementsByMouseEvent(e);
		if (objects.length) {
			for(var i=0;i<objects.length;i++){			
				var first = objects[i];
				var object3d = first.element;
				if(! (object3d instanceof mono.Billboard)){
					return first;
				}
			}
		}
		return null;
	},

	animateGleye: function(gleye, interaction, oldPoint, newPoint, onDone){
		//twaver.Util.stopAllAnimates(true);
		
		var offset=gleye.getPosition().sub(gleye.getTarget());
		var animation=new twaver.Animate({
			from: 0,
			to: 1,
			dur: 500,
			easing: 'easeBoth',
			onUpdate: function (value) {
				var x=oldPoint.x+(newPoint.x-oldPoint.x)*value;
				var y=oldPoint.y+(newPoint.y-oldPoint.y)*value;
				var z=oldPoint.z+(newPoint.z-oldPoint.z)*value;
				var target=new mono.XiangliangThree(x,y,z);				
				gleye.lookAt(target);
				interaction.target=target;
				var position=new mono.XiangliangThree().addVectors(offset, target);
				gleye.setPosition(position);
			},
		});
		animation.onDone=onDone;
		animation.play();
	},
	
	playAnimation: function(element, animation, done){
		var params=animation.split('.');
		if(params[0]==='pullOut'){
			var direction=params[1];
			demo.animatePullOut(element, direction, done);
		}
		if(params[0]==='rotate'){
			var anchor=params[1];
			var angle=params[2];
			var easing=params[3];
			demo.animateRotate(element, anchor, angle, easing, done);
		}		
	},

	animatePullOut: function(object, direction, done){
		//twaver.Util.stopAllAnimates(true);

		var size=object.getBizBox().size().multiply(object.getScale());

		var movement=0.8;
		
		var directionVec=new mono.XiangliangThree(0, 0, 1);
		var distance=0;
		if(direction==='x'){
			directionVec=new mono.XiangliangThree(1, 0, 0);
			distance=size.x;
		}
		if(direction==='-x'){
			directionVec=new mono.XiangliangThree(-1, 0, 0);
			distance=size.x;
		}
		if(direction==='y'){
			directionVec=new mono.XiangliangThree(0, 1, 0);
			distance=size.y;
		}
		if(direction==='-y'){
			directionVec=new mono.XiangliangThree(0, -1, 0);
			distance=size.y;
		}
		if(direction==='z'){
			directionVec=new mono.XiangliangThree(0, 0, 1);
			distance=size.z;
		}
		if(direction==='-z'){
			directionVec=new mono.XiangliangThree(0, 0, -1);
			distance=size.z;
		}

		distance=distance*movement;
		if(object.getClient('animated')){
			directionVec=directionVec.negate();
		}

		var fromPosition=object.getPosition().clone();		
		object.setClient('animated', !object.getClient('animated'));

		new twaver.Animate({
			from: 0,
			to: 1,
			dur: 2000,
			easing: 'bounceOut',			
			onUpdate: function (value) {
				//don't forget to clone new instance before use them!
				object.setPosition(fromPosition.clone().add(directionVec.clone().multiplyScalar(distance * value)));
			},
			onDone: function(){
				demo.animationFinished(object);			

				if(done) {
					done();
				}
			},
		}).play();
	},

	animateRotate: function(object, anchor, angle, easing, done){
		//twaver.Util.stopAllAnimates(true);
		easing = easing || 'easeInStrong';

		var size=object.getBizBox().size().multiply(object.getScale());
		
		var from=0;
		var to=1;
		if(object.getClient('animated')){
			to=-1;
		}
		object.setClient('animated', !object.getClient('animated'));
		
		var position;
		var axis;
		if(anchor==='left'){
			position=new mono.XiangliangThree(-size.x/2, 0, 0);
			var axis=new mono.XiangliangThree(0,1,0);
		}
		if(anchor==='right'){
			position=new mono.XiangliangThree(size.x/2, 0, 0);
			var axis=new mono.XiangliangThree(0,1,0);
		}

		var animation=new twaver.Animate({
			from: from,
			to: to,
			dur: 1500,
			easing: easing,
			onUpdate: function (value) {					
				if(this.lastValue===undefined){
					this.lastValue=0;
				}
				object.rotateFromAxis(axis.clone(), position.clone(), Math.PI/180*angle*(value-this.lastValue));
				this.lastValue=value;
			},
			onDone: function(){
				delete this.lastValue;
				demo.animationFinished(object);

				if(done) {
					done();
				}
			},
		});
		animation.play();
	},
	
	animationFinished: function(element){
		var animationDoneFuc=element.getClient('animation.done.func');
		if(animationDoneFuc){
			animationDoneFuc();
		}
	},

	getRandomInt: function(max){
		return parseInt(Math.random()*max);
	},
	
	getRandomLazyTime: function(){
		var time=demo.LAZY_MAX-demo.LAZY_MIN;
		return demo.getRandomInt(time)+demo.LAZY_MIN;
	},

	generateAssetImage: function(text){         
		var width=512, height=256;

		var canvas = document.createElement('canvas');
		canvas.width  = width;
		canvas.height = height;

		var ctx = canvas.getContext('2d');		
		ctx.fillStyle='white';
		ctx.fillRect(0,0,width,height);
		
		ctx.font = 150+'px "Microsoft Yahei" bold';
		ctx.fillStyle = 'black';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(text, width/2,height/2);
		ctx.strokeStyle='black';
		ctx.lineWidth=15;
		ctx.strokeText(text, width/2,height/2);

		return canvas;   
	},

	toggleTemperatureView: function(gl3dview){
		gl3dview.temperatureView=!gl3dview.temperatureView;

		gl3dview.getServa().forEach(function(element){						
			var type=element.getClient('type');

			if(type==='rack' || type==='rack.door'){	
				element.setVisible(!gl3dview.temperatureView);
				if(type==='rack'){
					if(!element.temperatureFake){
						var fake=new mono.Cube(element.getWidth(), element.getHeight(), element.getDepth());
						element.temperatureFake = fake;
						var sideImage=demo.createSideTemperatureImage(element, 3+Math.random()*10);
						fake.s({
							'm.texture.image': sideImage,
							'top.m.texture.image': element.getStyle('top.m.texture.image'),
							'top.m.normalmap.image':demo.getRes('metal_normalmap.jpg'),
							'top.m.specularmap.image': element.getStyle('top.m.texture.image'),
							'top.m.envmap.image': demo.getEnvMap(),
							'top.m.type':'phong',
						});								
						gl3dview.getServa().add(fake);
					}
					element.temperatureFake.setPosition(element.getPosition());
					element.temperatureFake.setVisible(gl3dview.temperatureView);
				}
			}
		});
		if(gl3dview.temperatureView){
			demo.createTemperatureBoard(gl3dview.getServa());
			demo.createTemperatureWall(gl3dview.getServa());
		}else{
			gl3dview.getServa().remove(gl3dview.getServa().temperaturePlane);
			delete gl3dview.getServa().temperaturePlane;
			gl3dview.getServa().remove(gl3dview.getServa().temperatureWall);
			delete gl3dview.getServa().temperatureWall;
		}
	},

	createTemperatureBoard: function(box){
		var floor=box.shadowHost;
		var board = new TemperatureBoard(512,512,'h', 20);

		box.forEach(function(element){						
			var type=element.getClient('type');
			if(type==='rack'){
				var x=element.getPositionX()/floor.getWidth()*512+256;
				var y=element.getPositionZ()/floor.getDepth()*512+256;
				var value=0.1+Math.random()*0.3;
				var width=element.getWidth()/floor.getWidth()*512;
				var depth=element.getDepth()/floor.getWidth()*512;

				board.addPoint(x-width/2,y+depth/2,value);
				board.addPoint(x+width/2,y+depth/2,value);
				board.addPoint(x-width/2,y-depth/2,value);
				board.addPoint(x+width/2,y-depth/2,value);
				board.addPoint(x,y,value);				
			}
		});

		var image = board.getImage();
		
		var plane=new mono.Plane(floor.getWidth(), floor.getDepth());
		plane.s({
			'm.texture.image': image,
			'm.transparent': true,
			'm.side': mono.DoubleSide,
			'm.type': 'phong',
		});
		plane.setPositionY(10);
		plane.setRotationX(-Math.PI/2);
		box.add(plane);
		
		box.temperaturePlane=plane;
	},

	createTemperatureWall: function(box){		
		var cube=new mono.Cube(990, 200, 10);
		cube.s({
			'm.visible': false,
		});
		cube.s({
			'front.m.visible': true,
			'm.texture.image': demo.getRes('temp1.jpg'),
			'm.side': mono.DoubleSide,
			'm.type': 'phong',
		});
		cube.setPosition(0, cube.getHeight()/2, 400);
		cube.setRotationX(Math.PI);
		box.add(cube);
		
		box.temperatureWall=cube;
	},	
	
	createSideTemperatureImage: function(rack, count){
		var width=2;
		var height=rack.getHeight();
		var step=height/count;
		var board = new TemperatureBoard(width,height,'v', height/count);		

		for(var i=0;i<count;i++){		
			var value=0.3+Math.random()*0.2;
			if(value<4){
				value=Math.random()*0.9;
			}
			board.addPoint(width/2,step*i,value);
		};

		return board.getImage();
	},

	toggleSpaceView: function(gl3dview){
		gl3dview.spaceView=!gl3dview.spaceView;

		gl3dview.getServa().forEach(function(element){						
			var type=element.getClient('type');

			if(type==='rack' || type==='rack.door'){	
				element.setVisible(!gl3dview.spaceView);
				if(type==='rack'){
					if(!element.spaceCubes){
						element.spaceCubes=demo.createRackSpaceCubes(gl3dview.getServa(), element);
					}
					for(var i=0;i<element.spaceCubes.length;i++){
						element.spaceCubes[i].setPosition(element.getPositionX(), 
							element.spaceCubes[i].getPositionY(),
							element.getPositionZ());
						element.spaceCubes[i].setVisible(gl3dview.spaceView);
					}
				}
			}
		});
	},

	createRackSpaceCubes: function(box, rack){	
		var cubes=[];
		var width=rack.getWidth();
		var height=rack.getHeight();
		var depth=rack.getDepth();

		var total=42;
		var step=height/total;
		var index=0;

		var colors=['#8A0808', '#088A08', '#088A85', '#6A0888','#B18904'];

		var solid=false;
		while(index<42){
			var size=parseInt(1+Math.random()*5);
			solid=!solid;
			var color=solid? colors[size-1] : '#A4A4A4';
			if(solid){
				size*=2;
			}else{
				size*=4;
			}
			if(index+size>total){
				size=total-index;
			}
			
			var cube=new mono.Cube(width, step*size-2, depth);
			var y=(index+size/2)*step;
			cube.setPosition(rack.getPositionX(), y, rack.getPositionZ());
			cube.s({
				'm.type': 'phong',
				'm.color': color,
				'm.ambient': color,
				'm.specularStrength': 50,
			});
			if(solid){
				cube.s({
					'm.transparent': true,
					'm.opacity': 0.6,
				});				
			}			
			box.add(cube);
			cubes.push(cube);

			index+=size;
		}
		return cubes;
	},

	toggleUsageView: function(gl3dview){
		gl3dview.usageView=!gl3dview.usageView;

		gl3dview.getServa().forEach(function(element){						
			var type=element.getClient('type');

			if(type==='rack' || type==='rack.door'){	
				element.setVisible(!gl3dview.usageView);
				if(type==='rack'){
					if(!element.usageFakeTotal){
						var usage=Math.random();
						var color=demo.getHSVColor((1-usage)*0.7, 0.7, 0.7);

						var usageFakeTotal=new mono.Cube(element.getWidth(), element.getHeight(), element.getDepth());
						element.usageFakeTotal = usageFakeTotal;
						usageFakeTotal.s({
							'm.wireframe': true,
							'm.transparent': true,
							'm.opacity': 0.2,
						});		
						usageFakeTotal.setPosition(element.getPosition());
						gl3dview.getServa().add(usageFakeTotal);
						
						var height=element.getHeight()*usage;

						var usageFakeUsed=new mono.Cube(element.getWidth(), 0, element.getDepth());
						element.usageFakeUsed = usageFakeUsed;						
						usageFakeUsed.s({
							'm.type': 'phong',
							'm.color': color,
							'm.ambient': color,
							'm.specularStrength': 20,
							'left.m.lightmap.image': demo.getRes('inside_lightmap.jpg'),
							'right.m.lightmap.image': demo.getRes('inside_lightmap.jpg'),
							'back.m.lightmap.image': demo.getRes('inside_lightmap.jpg'),
							'front.m.lightmap.image': demo.getRes('inside_lightmap.jpg'),
						});		
						usageFakeUsed.setPosition(element.getPosition());
						usageFakeUsed.setPositionY(0);
						gl3dview.getServa().add(usageFakeUsed);

						var usageAnimation=new twaver.Animate({
							from: 0,
							to: height,
							type: 'number',
							dur: 2000,
							delay: Math.random()*200,
							easing: 'bounceOut',
							onUpdate: function(value){
								usageFakeUsed.setHeight(value);
								usageFakeUsed.setPositionY(usageFakeUsed.getHeight()/2);
							},
						});
						element.usageAnimation=usageAnimation;
					}

					element.usageFakeTotal.setVisible(gl3dview.usageView);
					element.usageFakeUsed.setVisible(gl3dview.usageView);
					element.usageFakeTotal.setPosition(element.getPosition().clone());
					element.usageFakeUsed.setHeight(0);
					element.usageFakeUsed.setPosition(element.getPosition().clone());
					element.usageFakeUsed.setPositionY(0);

					if(gl3dview.usageView){
						element.usageAnimation.play();
					}else{
						element.usageAnimation.stop();
					}
				}
			}
		});
	},

	toggleAirView: function(gl3dview){
		gl3dview.airView=!gl3dview.airView;

		if(!gl3dview.getServa().airPlanes){
			gl3dview.getServa().airPlanes=demo.createAirPlanes();
		}

		for(var i=0;i<gl3dview.getServa().airPlanes.length;i++){
			var plane=gl3dview.getServa().airPlanes[i];
			if(gl3dview.airView){
				gl3dview.getServa().add(plane);
				plane.airAnimation.play();
			}else{
				gl3dview.getServa().remove(plane);
				plane.airAnimation.stop();
			}
		}		
	},

	toggleMoveView: function(gl3dview){
		gl3dview.getServa().getSelectionContainer().clearSelection();
		gl3dview.moveView=!gl3dview.moveView;
		gl3dview.dirtyGl3dview();
	},

	/* h, s, v (0 ~ 1) */
	getHSVColor: function (h, s, v) {
		var r, g, b, i, f, p, q, t;
		if (h && s === undefined && v === undefined) {
			s = h.s, v = h.v, h = h.h;
		}
		i = Math.floor(h * 6);
		f = h * 6 - i;
		p = v * (1 - s);
		q = v * (1 - f * s);
		t = v * (1 - (1 - f) * s);
		switch (i % 6) {
			case 0: r = v, g = t, b = p; break;
			case 1: r = q, g = v, b = p; break;
			case 2: r = p, g = v, b = t; break;
			case 3: r = p, g = q, b = v; break;
			case 4: r = t, g = p, b = v; break;
			case 5: r = v, g = p, b = q; break;
		}
		var rgb='#'+this.toHex(r * 255)+this.toHex(g * 255)+this.toHex(b * 255);
		return rgb;
	},

	toHex: function (value){
		var result=parseInt(value).toString(16);
		if(result.length==1){
			result='0'+result;
		}
		return result;
	},
	
	showDialog: function(content, title, width, height) {
		title= title || '';
		width=width || 600;
		height=height || 400;
		var div=document.getElementById('dialog');
		if(div){
			document.body.removeChild(div);
		}
		div=document.createElement('div');
		div.setAttribute('id', 'dialog');

		div.style.display = 'block';
		div.style.position = 'absolute';
		div.style.left = '100px';
		div.style.top = '100px';
		div.style.width=width+'px';
		div.style.height=height+'px';
		div.style.background='rgba(164,186,223,0.75)';						
		div.style['border-radius']='5px';
		document.body.appendChild(div);

		var span=document.createElement('span');
		span.style.display = 'block';
		span.style['color']='white';
		span.style['font-size']='13px';
		span.style.position = 'absolute';
		span.style.left = '10px';
		span.style.top = '2px';
		span.innerHTML=title;
		div.appendChild(span);

		var img=document.createElement('img');
		img.style.position = 'absolute';
		img.style.right= '4px';
		img.style.top = '4px';
		img.setAttribute('src', demo.getRes('close.png'));
		img.onclick = function () {
			document.body.removeChild(div);
		};
		div.appendChild(img);

		if(content){
			content.style.display = 'block';
			content.style.position = 'absolute';
			content.style.left = '3px';
			content.style.top = '24px';
			content.style.width=(width-6)+'px';
			content.style.height=(height-26)+'px';
			div.appendChild(content);
		}
	},

	showVideoDialog: function(title){
		var video=document.createElement('video');		
		video.setAttribute('src', demo.getRes('test.mp4'));
		video.setAttribute('controls', 'true');
		video.setAttribute('autoplay', 'true');			
		
		demo.showDialog(video, title, 610, 280);
	},

	createConnectionBillboardImage: function(value){
		var width=512, height=256;
		var text='当前网络流量';
		var canvas = document.createElement('canvas');
		canvas['width']=width;
		canvas['height']=height;
		var context = canvas.getContext('2d');
		context.fillStyle = '#FE642E';
		context.fillRect(0, 0, width, height-height/6);

		context.beginPath();
		context.moveTo(width*0.2, 0);
		context.lineTo(width/2, height);
		context.lineTo(width*0.8, 0);
		context.fill();
		
		var color='white';
		context.font = 40+'px "Microsoft Yahei" bold';
		context.fillStyle = color;
		context.textAlign = 'left';
		context.textBaseline = 'middle';		
		context.fillText(text, height/10, height/5);

		var color='white';
		text=value;
		context.font = 100+'px "Microsoft Yahei" bold';
		context.fillStyle = color;
		context.textAlign = 'left';
		context.textBaseline = 'middle';		
		context.fillText(text, height/10, height/2);
		context.strokeStyle=color;
		context.lineWidth=4;			
		context.strokeText(text, height/10, height/2);

		text='Mb/s';
		context.font = 50+'px "Microsoft Yahei" bold';
		context.fillStyle = color;
		context.textAlign = 'right';
		context.textBaseline = 'middle';		
		context.fillText(text, width-height/10, height/2+20);

		return canvas;
	},

	inspection: function(gl3dview){
		var leftDoor, rightDoor;
		var rack;
		gl3dview.getServa().forEach(function(element){
			if(element.getClient('type')==='left-door') {
				leftDoor=element;
			}
			if(element.getClient('type')==='right-door') {
				rightDoor=element;
			}
			if(element.getClient('label')==='1A04'){
				rack=element;
			}
		});

		var actions1=[
			{'px':2000, 'py':500, 'pz':2000, 'tx':0, 'ty':0, 'tz':0, }, 			
			{'px':2000,'pz':-2000},
			{'px':0,'pz':-2500},
			{'px':-2000},
			{'px':-2500,'pz':0},
			{'pz':2000},
			{'px':-1200, 'tx':-350, 'ty':170, 'tz':500}, 
			{'px': -550, 'py': 190, 'pz':1100}, 
		];

		var actions2=[
			{'px': -350, 'py': 120, 'pz':600, 'tx':-340, 'ty':150, 'tz':-300}, 
			{'py': 100, 'pz':200, }, 
			{'px': -300, 'py': 300, 'pz':150, 'ty':70}, 
		];

		var showAlarmAction=function(element){
			var card=element.alarmCard;
			var position=card.getWorldPosition();
			var actions3=[
				{'px': position.x, 'py': position.y, 'pz': position.z+120, 'tx':position.x, 'ty':position.y+10, 'tz':position.z}, 
				{'px': position.x-30, 'py': position.y+30, 'pz': position.z+90, 'ty':position.y+15}, 
			];
			mono.AniUtil.playInspection(gl3dview, actions3, function(){
				demo.playAnimation(card, card.getClient('animation'), function(){
					gl3dview.inspecting=false;
					demo.showAlarmDialog();
				});				
			});			
		}

		rack.setClient('loaded.func', showAlarmAction);

		var doorOpen=function(){			
			demo.playAnimation(leftDoor, leftDoor.getClient('animation'), function(){
				mono.AniUtil.playInspection(gl3dview, actions2, function(){
					var door=rack.door;
					demo.playAnimation(door, door.getClient('animation'));					
				});		
			});
			demo.playAnimation(rightDoor, rightDoor.getClient('animation'));
		}
		mono.AniUtil.playInspection(gl3dview, actions1, doorOpen);
	},

	showAlarmDialog: function(){
		var span=document.createElement('span');		
		span.style['background-color']='rgba(255,255,255,0.85)';
		span.style['padding']='10px';
		span.style['color']='darkslategrey';
		span.innerHTML='<b>告警描述</b>'+
			'<p>lenovoS330板卡有EPE1，LP1，OL16，CSB,SC，EPE1（2M电口）与LP1（155M光）与用户路由器连接。'+
			'EPE1上发生TU-AIS ,TU-LOP，UNEQ，误码秒告警，所配业务均出现，用户路由器上出现频繁up，down告警。'+
			'用户路由器上与1块LP1（有vc12级别的交叉）连接的cpos板卡上也有频繁up，down告警，与另一块LP1（vc4穿通）'+
			'连接的cpos卡上无告警</p>'+
			'<b>故障分析</b>'+
			'<p>情况很多。如果只是单站出现，首先判断所属环上保护，主用光路有没有告警；如果有，解决主用线路问题；'+
			'如果没有，做交叉板主备切换--当然是在晚上进行；很少出现主备交叉板都坏的情况。'+
			'还没解决的话，依次检查单板和接口板。</p>';

		demo.showDialog(span, 'SDH 2M支路板告警', 510, 250);
		span.style['width']='484px';
		span.style['height']='203px';
	},

	resetView: function(gl3dview){		
		demo.resetGleye(gl3dview);

		//reset all racks. unload contents, close door.
		var loadedRacks=[];
		gl3dview.getServa().forEach(function(element){
			if(element.getClient('type')==='rack' && element.oldRack){
				loadedRacks.push(element);
			}
		});
		for(var i=0;i<loadedRacks.length;i++){
			//restore the old rack.
			var newRack=loadedRacks[i];
			var oldRack=newRack.oldRack;

			if(newRack.alarm){
				gl3dview.getServa().getAlarmBox().remove(newRack.alarm);
			}
			gl3dview.getServa().removeByDescendant(newRack,true);

			gl3dview.getServa().add(oldRack);
			if(oldRack.alarm){
				gl3dview.getServa().getAlarmBox().add(oldRack.alarm);
			}
			oldRack.door.setParent(oldRack);
			oldRack.setClient('loaded', false);
			
			//reset door.
			var door=oldRack.door;
			gl3dview.getServa().add(door);
			if(door.getClient('animated')){
				demo.playAnimation(door, door.getClient('animation'));
			}
		}

		//reset room door.
		var doors=[];
		gl3dview.getServa().forEach(function(element){
			if(element.getClient('type')==='left-door' || element.getClient('type')==='right-door'){
				doors.push(element);
			}
		});
		for(var i=0;i<doors.length;i++){
			var door=doors[i];
			if(door.getClient('animated')){
				demo.playAnimation(door, door.getClient('animation'));
			}
		}

		//reset all views.
		if(gl3dview.temperatureView){
			demo.toggleTemperatureView(gl3dview);
		}
		if(gl3dview.spaceView){
			demo.toggleSpaceView(gl3dview);
		}
		if(gl3dview.usageView){
			demo.toggleUsageView(gl3dview);
		}
		if(gl3dview.airView){
			demo.toggleAirView(gl3dview);
		}
		if(gl3dview.moveView){
			demo.toggleMoveView(gl3dview);
		}
		if(gl3dview.connectionView){
			demo.toggleConnectionView(gl3dview);
		}
		if(gl3dview.smokeView){
			demo.toggleSmokeView(gl3dview);
		}
		if(gl3dview.waterView){
			demo.toggleWaterView(gl3dview);
		}
		if(gl3dview.laserView){
			demo.toggleLaserView(gl3dview);
		}
		if(gl3dview.powerView){
			demo.togglePowerView(gl3dview);
		}
	},

	resetRackPosition: function(gl3dview){		
		//reset all rack position
		gl3dview.getServa().forEach(function(element){
			if(element.getClient('type')==='rack'){
				element.setPosition(element.getClient('origin'));
			}
		});
		demo.dirtyShadowMap(gl3dview);
	},

	showDoorTable: function(){
		var table=document.createElement('table');
		table.setAttribute('class', 'gridtable');
		for(var k=0;k<8;k++){
			var tr=document.createElement('tr');
			table.appendChild(tr);
			for(var i=0;i<3;i++){
				var tagName= k==0 ? 'th' : 'td';
				var td=document.createElement(tagName);
				tr.appendChild(td);
				if(k==0){
					if(i==0){
						td.innerHTML='#';
					}
					if(i==1){
						td.innerHTML='Time';
					}
					if(i==2){
						td.innerHTML='Activity';
					}
				}else{
					if(i==0){
						td.innerHTML=parseInt(Math.random()*1000);
					}
					if(i==1){
						td.innerHTML=new Date().format('yyyy h:mm');
					}
					if(i==2){
						if(Math.random()>0.5){
							td.innerHTML='Door access allowed';
						}else{
							td.innerHTML='Instant Alart - Door access denied';
						}
					}
				}
			}
		}

		demo.showDialog(table, 'Door Security Records', 330, 240);
	},

	showCardTable: function(){
		var span=document.createElement('span');
		span.style['background-color']='rgba(255,255,255,0.85)';
		span.style['padding']='10px';
		span.style['color']='darkslategrey';
		span.innerHTML='<b>硬件信息</b>'+
			'<p>机器型号：System X 3650</p>'+
			'<p>机器S/N：JPO3676123</p>'+
			'<p> ...  ：  ... </p>'+
			'<b>资产信息</b>'+
			'<p>资产编号：Tools-1234</p>'+
			'<p>对接人：ITcode</p>'+
			'<b>监控信息</b>'+
			'<p>CPU：20%</p>'+
			'<p>memory：50%</p>'+
			'<p>network：10 Mb/s</p>'+
			'<p>disk：60%</p>'+
			'<p>温度：65℃</p>'+
			'<p>IMM：OK</p>'+
			'<b>操作列表</b>'+
			'<p>开/关机</p>'+
			'<p>Deploy</p>'+
			'<p></p>';
		demo.showDialog(span, '信息显示', 360, 540);
		span.style['width']='333px';
		span.style['height']='495px';
	},

	toggleSmokeView: function(gl3dview){
		gl3dview.smokeView=!gl3dview.smokeView;
		gl3dview.getServa().forEach(function(element){
			var type=element.getClient('type');
			if(type==='smoke' || type==='extinguisher_arrow'){
				element.setVisible(gl3dview.smokeView);				
			}
		});
	},

	startSmokeAnimation: function(gl3dview){
		setInterval(demo.updateSmoke(gl3dview), 200);
	},

	startFpsAnimation: function(gl3dview){
		var span=document.createElement('span');
		span.style.display = 'block';
		span.style['color']='white';
		span.style['font-size']='10px';
		span.style.position = 'absolute';
		span.style.left = '10px';
		span.style.top = '10px';
		span.style.visibility='hidden';
		document.body.appendChild(span);
		gl3dview.fpsDiv=span;		

		demo.fps=0;		
		gl3dview.setRenderCallback(function(){
			demo.fps++;
		});
		setInterval(demo.updateFps(gl3dview), 1000);		
	},
	
	toggleFpsView: function(gl3dview){							
		gl3dview.fpsView=!gl3dview.fpsView;

		if(gl3dview.fpsView){
			gl3dview.fpsDiv.style.visibility='inherit';
		}else{
			gl3dview.fpsDiv.style.visibility='hidden';
		}
	},


	updateSmoke: function(gl3dview){
		return function(){
			if(gl3dview.smokeView){
				gl3dview.getServa().forEach(function(element){
					if(element.getClient('type')==='smoke' && element.isVisible()){
						var smoke=element;
						var count = smoke.vertices.length;
						for (var i = 0; i < count; i++) {
							var point= smoke.vertices[i];
							point.y = Math.random() * 200;
							point.x = Math.random() * point.y/2-point.y/4;				
							point.z = Math.random() * point.y/2-point.y/4;
						}
						smoke.verticesNeedUpdate = true;
						gl3dview.dirtyGl3dview();
					}
				});
			}
		}
	},

	updateFps: function(gl3dview){
		return function(){
			gl3dview.fpsDiv.innerHTML='FPS:  ' + demo.fps;
			demo.fps=0;
		}
	},

	toggleWaterView: function(gl3dview){
		gl3dview.waterView=!gl3dview.waterView;
		if(gl3dview.waterView){
			demo.createWaterLeaking(gl3dview.getServa());
			gl3dview.getServa().oldAlarms=gl3dview.getServa().getAlarmBox().toDatas();
			gl3dview.getServa().getAlarmBox().clear();
		}else{
			if(gl3dview.getServa().waterLeakingObjects){
				for(var i=0;i<gl3dview.getServa().waterLeakingObjects.length;i++){
					gl3dview.getServa().remove(gl3dview.getServa().waterLeakingObjects[i]);
				}
			}
			gl3dview.getServa().oldAlarms.forEach(function(alarm){
				gl3dview.getServa().getAlarmBox().add(alarm);
			});
		}

		gl3dview.getServa().forEach(function(element){
			var type=element.getClient('type');
			if(type==='water_cable'){
				element.setVisible(gl3dview.waterView);
			}else if(type && type!=='floorCombo' && type!=='extinguisher' && type!=='glassWall'){
				if(gl3dview.waterView){		
					if(type==='rack' || type==='rack_door'){
						element.oldTransparent=element.getStyle('m.transparent');
						element.oldOpacity=element.getStyle('m.opacity');
						element.setStyle('m.transparent', true);
						element.setStyle('m.opacity', 0.1);
					}else{
						element.oldVisible=element.isVisible();
						element.setVisible(false);
					}
				}else{
					if(type==='rack' || type==='rack_door'){
						element.setStyle('m.transparent', element.oldTransparent);
						element.setStyle('m.opacity', element.oldOpacity);
					}else{
						element.setVisible(element.oldVisible);
					}
				}
			}
		});
	},

	createWaterLeaking: function(box){
		var sign=new mono.Billboard();
		sign.s({
			'm.texture.image': demo.getRes('alert.png'),
			'm.vertical': true,				
		});
		sign.setScale(80,160,1);
		sign.setPosition(50, 90, 50);
		box.add(sign);

		var ball=new mono.Sphere(30);
		ball.s({
			'm.transparent': true,
			'm.opacity': 0.8,
			'm.type': 'phong',
			'm.color': '#58FAD0',
			'm.ambient': '#81BEF7',
			'm.specularStrength': 50,
			'm.normalmap.image': demo.getRes('rack_inside_normal.jpg'),
		});	
		ball.setPosition(50, 0, 50);
		ball.setScale(1, 0.1, 0.7);
		box.add(ball);

		box.waterLeakingObjects=[sign, ball];
	},

	toggleLaserView: function(gl3dview){
		gl3dview.laserView=!gl3dview.laserView;		

		gl3dview.getServa().forEach(function(element){
			if(element.getClient('type')==='laser'){
				element.setVisible(gl3dview.laserView);
			}
		});
	},

	setupToolbar: function(buttons){		
		var count=buttons.length;
		var step=32;

		var div=document.createElement('div');
		div.setAttribute('id', 'toolbar');
		div.style.display = 'block';
		div.style.position = 'absolute';
		div.style.left = '10px';
		div.style.top = '75px';
		div.style.width='32px';
		div.style.height=(count*step+step)+'px';
		div.style.background='rgba(255,255,255,0.75)';						
		div.style['border-radius']='5px';
		document.body.appendChild(div);

		for(var i=0;i<count;i++){
			var button=buttons[i];
			var icon=button.icon;
			var img=document.createElement('img');
			img.style.position = 'absolute';
			img.style.left=  '4px';
			img.style.top = (step/2+(i * step))+'px';			
			img.style['pointer-events']='auto';
			img.style['cursor']='pointer';
			img.setAttribute('src', demo.getRes(icon));		
			img.style.width='24px';
			img.style.height='24px';
			img.setAttribute('title', button.label);
			img.onclick = button.clickFunction;
			div.appendChild(img);
		}
	},

	togglePowerView: function(gl3dview){
		if(!gl3dview.powerLineCreated){
			demo.createPowerLines(gl3dview);
		}
		gl3dview.powerView=!gl3dview.powerView;		

		gl3dview.getServa().forEach(function(element){
			var type=element.getClient('type');
			if(type==='power_line'){
				element.setVisible(gl3dview.powerView);
			}
		});
	},

	createPowerLines: function(gl3dview){
		var box=gl3dview.getServa();		

		var createRackLines=function(labels, offsetZ){
			box.forEach(function(element){
				if(element.getClient('type')==='rack'){				
					var label=element.getClient('label');
					if(labels.indexOf(label)>-1){
						var position=element.getPosition();
						var points=[];
						points.push([position.x, position.y, position.z]);
						points.push([position.x, position.y, position.z-60]);
						points.push([position.x, 240, position.z-60]);
						points.push([position.x, 240, offsetZ]);
						points.push([-550, 240, offsetZ]);
						demo.createPathLink(box, points, '#FE9A2E', 'power_line');

						var points=[];
						points.push([position.x-5, position.y, position.z]);
						points.push([position.x-5, position.y, position.z-60]);
						points.push([position.x-5, 250, position.z-60]);
						points.push([position.x-5, 250, offsetZ]);
						points.push([-550, 250, offsetZ]);
						demo.createPathLink(box, points, 'cyan', 'power_line');

						offsetZ-=5;
					}
				}
			});
		}

		createRackLines(['1A07', '1A08', '1A09', '1A10', '1A11', '1A12', '1A13'], 150);
		createRackLines(['1A00', '1A01', '1A02',], 160);
		createRackLines(['1A03', '1A04', '1A05','1A06'], -300);

		demo.createPathLink(box, [[-1000, 420, 600], [-800, 250, 500], [-550, 250, 500], [-550, 250, -315]], 'cyan', 'power_line');
		demo.createPathLink(box, [[-1000, 410, 600], [-800, 240, 500], [-550, 240, 500], [-550, 240, -315]], '#FE9A2E', 'power_line');
	},

	createPathLink: function(box, points, color, clientType){
		if(points && points.length>1){			
			color = color || 'white';
			for(var i=1;i<points.length;i++){
				var from=points[i-1];
				var to=points[i];
				
				var fromNode=new mono.Cube(0.001, 0.001, 0.001);
				fromNode.s({
					'm.color': color,
				})
				fromNode.setPosition(from[0], from[1], from[2]);
				fromNode.setClient('type', clientType);
				box.add(fromNode);

				var toNode=fromNode.clone();
				toNode.setPosition(to[0], to[1], to[2]);
				toNode.setClient('type', clientType);
				box.add(toNode);

				var link=new mono.Link(fromNode, toNode);
				link.s({
					'm.color': color,
				});
				link.setClient('type', clientType);
				box.add(link);
			}
		}
	},
}



demo.registerFilter('floor', function(box, json){
	return {
		type: 'cube',
		width: 1000,
		height: 10,
		depth: 1000,
		translate: [0, -10, 0],
		shadowHost: true,
		op: '+',
		style: {
			'm.type': 'phong',
			'm.color': '#BEC9BE',
			'm.ambient': '#BEC9BE',
			'top.m.type':'basic',
			'top.m.texture.image': demo.getRes('floor.jpg'),
			'top.m.texture.repeat': new mono.XiangliangTwo(10,10),
			'top.m.color': '#DAF0F5',
			'top.m.polygonOffset':true,
			'top.m.polygonOffsetFactor':3,
			'top.m.polygonOffsetUnits':3,
		}
	};
});

demo.registerFilter('floor_cut', function(box, json){
	return {
		type: 'cube',
		width: 100,
		height: 100,
		depth: 100,
		op: '-',
		style: {
			'm.texture.image': demo.getRes('floor.jpg'),
			'm.texture.repeat': new mono.XiangliangTwo(4,4),
			'm.color': '#DAF0F5',
			'm.lightmap.image': demo.getRes('outside_lightmap.jpg'),
			'm.polygonOffset':true,
			'm.polygonOffsetFactor':3,
			'm.polygonOffsetUnits':3,
		}
	};
});

demo.registerFilter('floor_box', function(box, json){
	return {
		type: 'cube',
		width: 100,
		height: 100,
		depth: 100,
		shadow: true,
		sideColor: '#C3D5EE',
		topColor: '#D6E4EC',
		style: {
			'm.color': 'blue',
			'top.m.texture.image': demo.getRes('ups.png'),
		}
	};
});

//demo.registerFilter('plants', function(box, json){
//	var objects=[];
//	var translates=json.translates;
//	if(translates){
//		for(var i=0;i<translates.length;i++){
//			var translate=translates[i];
//			var plant={
//				type: 'plant',
//				shadow: true,
//				translate: translate,
//			};
//			demo.copyProperties(json, plant, ['type', 'translates', 'translate']);
//			objects.push(plant);
//		}
//	}
//	return objects;
//});

demo.registerFilter('racks', function(box, json){
	var objects=[];
	var translates=json.translates;
	var severities=json.severities || [];
	var labels=json.labels || [];
	if(translates){
		for(var i=0;i<translates.length;i++){
			var translate=translates[i];
			var severity=severities[i];
			var label=labels[i] || '';
			var rack={
				type: 'rack',
				shadow: true,
				translate: translate,
				severity: severity,
				label: label,
			};
			demo.copyProperties(json, rack, ['type', 'translates', 'translate', 'severities']);
			objects.push(rack);
		}
	}
	return objects;
});

demo.registerFilter('wall', function(box, json){
	var objects=[];

	var wall = {
		type: 'path',
		op: '+',
		width: 20,
		height: 200,
		shadow: true,
		insideColor: '#B8CAD5',
		outsideColor: '#A5BDDD',		
		topColor: '#D6E4EC',
		translate: json.translate,
		data:json.data,

		client: {
			'data': json.data,
			'type': 'wall',
			'translate': json.translate,
		},
	};
			
	objects.push(wall);		

	if(json.children){	
		var children=demo.filterJson(box, json.children);				
		objects=objects.concat(children);	
	}

	var comboChildren=[];
	var returnObjects=[];
	for(var i=0;i<objects.length;i++){
		var child=objects[i];
		if(child.op){
			comboChildren.push(child);
		}else{
			returnObjects.push(child);
		}
	}
	
	var comboWall = demo.createCombo(comboChildren);
	comboWall.shadow = true;
	comboWall.setClient('data', json.data);
	comboWall.setClient('type','wall');
	comboWall.setClient('translate',json.translate);
	box.add(comboWall);

	return returnObjects;
});

demo.registerFilter('window', function(box, json){
	var translate=json.translate || [0,0,0];
	var x=translate[0],
		y=translate[1],
		z=translate[2];
	var width=json.width || 100,
		height=json.height || 100,
		depth=json.depth || 50;
	var glassDepth=2;
	var platformHeight=5,
		platformDepth=45,
		platformOffsetZ=10;
		
	var r = json.r || 0;

	return [{
		// window cut off
		type: 'cube',
		width: width,
		height: height,
		depth: depth, 
		translate: [x, y, z],
		rotate: [0, r/2, 0],
		op: '-',
		sideColor: '#B8CAD5',
		topColor: '#D6E4EC',		
		
	},{
		//window glass
		type: 'cube',
		width: width-0.5,
		height: height-0.5,
		depth: glassDepth,
		translate: [x, y, z],
		rotate: [0, r/2, 0],
		op: '+',
		style: {			
			'm.color':'#58ACFA',
			'm.ambient':'#58ACFA',
			'm.type':'phong',
			'm.specularStrength': 0.1,
			'm.envmap.image': demo.getEnvMap(),
			'm.specularmap.image': demo.getRes('rack_inside_normal.jpg'),	
			'm.texture.repeat': new mono.XiangliangTwo(10,5),
			'front.m.transparent': true,
			'front.m.opacity':0.4,
			'back.m.transparent': true,
			'back.m.opacity':0.4,
		},			
	},{
		//window bottom platform.
		type: 'cube',
		width: width,
		height: platformHeight,
		depth: platformDepth, 
		translate: [x, y, z+platformOffsetZ],
		rotate: [0, r/2, 0],
		op: '+',
		sideColor: '#A5BDDD',
		topColor: '#D6E4EC',
	}];
});

demo.registerFilter('door', function(box, json){
	var translate=json.translate || [0,0,0];
	var x=translate[0],
		y=translate[1],
		z=translate[2];
	var width=json.width || 205,
		height=json.height || 180,
		depth=json.depth || 26;	
	var frameEdge=10,
		frameBottomEdge=2;
	var r = json.rotation || 0;
	var p1 = json.p1 || 0;
	var p2 = json.p2 || 0;

	return [{
		//door frame.
		type: 'cube',
		width: width,
		height: height,
		depth: depth,
		translate: [x, y, z],
//		translate: [10 ,10, 10],
		rotate: [0, r/2, 0],
		op: '+',
		sideColor: '#C3D5EE',
		topColor: '#D6E4EC',
	},{
		//door cut off.
		type: 'cube',
		width: width-frameEdge,
		height: height-frameEdge/2-frameBottomEdge,
		depth: depth+2,
		op: '-',
		translate:[x,y+frameBottomEdge,z],
		rotate: [0, r/180*90, 0],
		sideColor: '#B8CAD5',
		topColor: '#D6E4EC',			
	},{
		//left door.
		type: 'cube',
		width: (width-frameEdge)/2-2,
		height: height-frameEdge/2-frameBottomEdge-2,
		depth: 2,
		translate:[x-(width-frameEdge)/4+p1,frameBottomEdge+1,z+p2],   // relative to door frame
//		translate:[0,0,0],
		rotate: [0, r/2, 0],
		sideColor: 'orange',
		topColor: 'orange',
		style:{
			'm.type': 'phong',
			'm.transparent': true,
			'front.m.texture.image': demo.getRes('door_left.png'),					
			'back.m.texture.image': demo.getRes('door_right.png'),					
			'm.specularStrength': 100,
			'm.envmap.image': demo.getEnvMap(),
			'm.specularmap.image': demo.getRes('white.png'),	
		},
		client:{
			'animation': 'rotate.left.-90.bounceOut',
			'type': 'left-door',
		},
	},{
		//right door.
		type: 'cube',
		width: (width-frameEdge)/2-2,
		height: height-frameEdge/2-frameBottomEdge-2,
		depth: 2,
		translate:[x+(width-frameEdge)/4-p1,frameBottomEdge+1,z-p2],
		rotate: [0, r/2, 0],
		sideColor: 'orange',
		topColor: 'orange',
		style:{
			'm.type': 'phong',
			'm.transparent': true,
			'front.m.texture.image': demo.getRes('door_right.png'),					
			'back.m.texture.image': demo.getRes('door_left.png'),					
			'm.specularStrength': 100,
			'm.envmap.image': demo.getEnvMap(),
			'm.specularmap.image': demo.getRes('white.png'),	
		},		
		client:{
			'animation': 'rotate.right.90.bounceOut',
			'type': 'right-door',
		},
	},
//	{
//		//door control.              need add dynamically
//		type: 'cube',
//		width: 15,
//		height: 32,
//		depth: depth-3,
//		translate: [x-width/2-13, height*0.6, z],
//		style:{
//			'left.m.visible': false,
//			'right.m.visible': false,
//			'top.m.visible': false,
//			'bottom.m.visible': false,
//			'm.transparent': true,
//			'm.specularStrength': 50,
//			'front.m.texture.image': demo.getRes('lock.png'),
//			'back.m.texture.image': demo.getRes('lock.png'),
//		},
//		client:{
//			'dbl.func': demo.showDoorTable,
//			'type': 'door_lock',
//		},
//	}
	];
});

//demo.registerFilter('glass_wall', function(box, json){
//	var translate=json.translate || [0,0,0];
//	var x=translate[0],
//		y=translate[1],
//		z=translate[2];
//	var width=json.width || 100,
//		height=json.height || 200,
//		depth=json.depth || 20;	
//	var glassHeight=height*0.6;
//	var rotate=json.rotate || [0,0,0];
//
//	var parts=[
//	{
//		//wall body.
//		type: 'cube',
//		width: 0,
//		height: 0,
//		depth: depth,
//		shadow: true,
//		translate: [x, y, z],
//		rotate: rotate,
//		op: '+',
//		sideColor: '#A5BDDD',
//		topColor: '#D6E4EC',
//	},
//	{
//		//wall middle cut off
//		type: 'cube',
//		width: width+2,
//		height: glassHeight,
//		depth: depth+2,
//		translate: [x, (height-glassHeight)/3*2, z],
//		rotate: rotate,
//		op: '-',
//		sideColor: '#A5BDDD',
//		topColor: '#D6E4EC',
//	},
//	{
//		
//		type: 'cube',
//		width: width,
//		height: 200,
//		depth: 4,
//		translate: [x, 0, z],
//		rotate: rotate,
//		op: '+',
//		sideColor: '#58ACFA',
//		topColor: '#D6E4EC',
//		style: {
//			'm.transparent': true,  //wall middle glass.
//			'm.opacity':0.6,
//			'm.color':'#01A9DB',
//			'm.ambient':'#01A9DB',
//			'm.type':'phong',
//			'm.specularStrength': 100,
//			'm.envmap.image': demo.getEnvMap(),
//			'm.specularmap.image': demo.getRes('rack_inside_normal.jpg'),	
//			'm.texture.repeat': new mono.XiangliangTwo(30, 5),
//		},
//	}];
//	
//	var wall=demo.createCombo(parts);
//	wall.setClient('type','glassWall');
//	wall.setClient('size', wall.getBizBox().size());
//	wall.setClient('translate',translate);
//	wall.shadow = true;
//	box.add(wall);
//});


demo.registerFilter('rail', function(box, json){		
	var params = {
		type: 'path',
		width: 50,
		height: 8,		
		data:json.data,
	};	

	var loader=function(box, params){
		box.add(demo.createRail(params));
	};

	var loaderFunc=function(box, params){
		return function(){
			loader(box, params);
		};
	};
	setTimeout(loaderFunc(box, params), demo.getRandomLazyTime());	
});

demo.createRail = function(params){
	var rail=demo.createPathObject(params);
	rail.s({
		'm.texture.image': demo.getRes('rail.png'),
		'm.type': 'phong',
		'm.transparent': true,
		'm.color': '#CEECF5',
		'm.ambient': '#CEECF5',
		'aside.m.visible': false,
		'zside.m.visible': false,
		'm.specularStrength': 50,
	});
	rail.setPositionY(263);
	rail.setClient('type', 'rail');
	rail.setVisible(false);
	
	return rail;
}

demo.registerFilter('connection', function(box, json){			
	var path = demo.create3DPath(json.data);
	path = mono.PathNode.prototype.adjustPath(path, 5);
	var color=json.color;
	var flow=json.flow;
	var y=json.y;
	
	var loader=function(box, path, color, flow, y){
		box.add(demo.createConnection(path, color, flow, y));
	};

	var loaderFunc=function(box, path, color, flow, y){
		return function(){
			loader(box, path, color, flow, y);
		};
	};
	setTimeout(loaderFunc(box, path, color, flow, y), demo.getRandomLazyTime());	
});

demo.createConnection = function(path, color, flow, y){
	var connection=new mono.PathNode(path, 100, 1);
	connection.s({
		'm.type': 'phong',
		'm.specularStrength': 30,
		'm.color': color,
		'm.ambient': color, 		
		'm.texture.image': demo.getRes('flow.jpg'),
		'm.texture.repeat': new mono.XiangliangTwo(200, 1),
		'm.texture.flipX': flow>0,
	});
	connection.setClient('flow', flow);
	connection.setStartCap('plain');
	connection.setEndCap('plain');
	connection.setPositionY(y);
	connection.setClient('type', 'connection');	
	connection.setVisible(false);
	return connection;
};

demo.registerShadowPainter('wall', function(object, context, floorWidth, floorHeight, translate, rotate){
	var translate = object.getClient('translate') || [0, 0, 0];		
	var translateX=floorWidth/2+translate[0];
	var translateY=floorHeight-(floorHeight/2+translate[2]);
	var pathData=object.getClient('data');			
	
	context.save();
	context.translate(translateX, translateY);
	context.rotate(rotate);
	context.beginPath();
	var first=true;
	for(var j=0;j<pathData.length;j++){
		var point=pathData[j];
		if(first){
			context.moveTo(point[0], -point[1]);
			first=false;
		}else{
			context.lineTo(point[0], -point[1]);
		}
	}

	context.lineWidth = object.getClient('width') || 20;		

	context.strokeStyle = 'white';
	context.shadowColor = '#222222';
	context.shadowBlur = 60;
	context.shadowOffsetX = 0;
	context.shadowOffsetY = 0;
	context.stroke();
	
	context.restore();
});

demo.registerShadowPainter('floor_box', function(object, context, floorWidth, floorHeight, translate, rotate){
	var translateX=floorWidth/2+translate.x;
	var translateY=floorHeight/2+translate.z;
	var width=object.getWidth();
	var lineWidth=object.getDepth();

	context.save();

	context.translate(translateX, translateY);
	context.rotate(rotate);

	context.beginPath();
	context.moveTo(-width/2, 0);
	context.lineTo(width/2, 0);
	
	context.lineWidth = lineWidth;
	context.strokeStyle = 'white';
	context.shadowColor = '#222222';
	context.shadowBlur = 60;
	context.shadowOffsetX = 0;
	context.shadowOffsetY = 0;						
	context.stroke();	

	context.restore();
});

demo.registerShadowPainter('rack', function(object, context, floorWidth, floorHeight, translate, rotate){
	var translateX=floorWidth/2+translate.x;
	var translateY=floorHeight/2+translate.z;
	var width=object.width || 60;
	var height=object.height || 200;
	var depth=object.depth || 80;
	var width=width*0.99;
	var lineWidth=depth*0.99;

	context.save();

	context.beginPath();
	context.moveTo(translateX-width/2, translateY);
	context.lineTo(translateX+width/2, translateY);
	
	context.lineWidth = lineWidth;
	context.strokeStyle = 'gray';
	context.shadowColor = 'black';
	context.shadowBlur = 100;
	context.shadowOffsetX = 0;
	context.shadowOffsetY = 0;						
	context.stroke();			
	
	context.restore();
});

demo.createRoundShadowPainter=function(radius){
	return function(object, context, floorWidth, floorHeight, translate, rotate){
		var translateX=floorWidth/2+translate.x;
		var translateY=floorHeight/2+translate.z;

		context.save();

		context.beginPath();
		context.arc(translateX, translateY, radius, 0, 2 * Math.PI, false);
		
		context.fillStyle='black';
		context.shadowColor = 'black';
		context.shadowBlur = 25;
		context.shadowOffsetX = 0;
		context.shadowOffsetY = 0;						
		context.fill();			

		context.restore();
	}
};

demo.registerShadowPainter('plant', demo.createRoundShadowPainter(11));
demo.registerShadowPainter('extinguisher', demo.createRoundShadowPainter(7));

demo.registerShadowPainter('glassWall', function(object, context, floorWidth, floorHeight, translate, rotate){
	var translate = object.getClient('translate');
	var size = object.getClient('size');
	var translateX=floorWidth/2+translate[0];
	var translateY=floorHeight/2+translate[2];
	var width=size.x;
	var lineWidth=size.z;
	context.save();

	context.translate(translateX, translateY);

	context.beginPath();
	context.moveTo(-width/2, 0);
	context.lineTo(width/2, 0);
	
	context.lineWidth = lineWidth;
	context.strokeStyle = 'white';
	context.shadowColor = '#222222';
	context.shadowBlur = 60;
	context.shadowOffsetX = 0;
	context.shadowOffsetY = 0;						
	context.stroke();	

	context.restore();						
});

demo.registerCreator('rack', function(box, json){
	var translate=json.translate || [0,0,0];
	var x=translate[0],
		y=translate[1],
		z=translate[2];
	var width=json.width || 60;
	var height=json.height || 200;
	var depth=json.depth || 80;
	var severity=json.severity;
	var label=json.label;
	var shadow = json.shadow;

	var rack= new mono.Cube(width, height, depth);
	rack.s({				
		'm.color': '#557E7A',
		'left.m.lightmap.image':demo.getRes('outside_lightmap.jpg'),
		'right.m.lightmap.image':demo.getRes('outside_lightmap.jpg'),
		'front.m.lightmap.image':demo.getRes('outside_lightmap.jpg'),
		'back.m.lightmap.image':demo.getRes('outside_lightmap.jpg'),
		'top.m.normalmap.image':demo.getRes('metal_normalmap.jpg'),
		'left.m.normalmap.image':demo.getRes('metal_normalmap.jpg'),
		'right.m.normalmap.image':demo.getRes('metal_normalmap.jpg'),
		'back.m.normalmap.image':demo.getRes('metal_normalmap.jpg'),
		'top.m.specularmap.image': demo.getRes('outside_lightmap.jpg'),	
		'left.m.specularmap.image': demo.getRes('outside_lightmap.jpg'),	
		'right.m.specularmap.image': demo.getRes('outside_lightmap.jpg'),	
		'back.m.specularmap.image': demo.getRes('outside_lightmap.jpg'),	
		'top.m.envmap.image': demo.getEnvMap(),
		'left.m.envmap.image': demo.getEnvMap(),
		'right.m.envmap.image': demo.getEnvMap(),
		'back.m.envmap.image': demo.getEnvMap(),
		'm.ambient': '#557E7A',
		'm.type':'phong',
		'm.specularStrength': 50,
		'front.m.texture.image':demo.getRes('rack.jpg'),
		'front.m.texture.repeat': new mono.XiangliangTwo(1,1),
		'front.m.specularmap.image':demo.getRes('white.png'),
		'front.m.color':'#666',
		'front.m.ambient':'#666',
		'front.m.specularStrength': 200,
	});
	rack.setPosition(x, height/2+1+y, z);

	var labelCanvas=demo.generateAssetImage(label);
	rack.setStyle('top.m.texture.image', labelCanvas);
	rack.setStyle('top.m.specularmap.image', labelCanvas);
	rack.setClient('label', label);
	rack.setClient('type', 'rack');
	rack.setClient('origin', rack.getPosition().clone());
	rack.setClient('loaded', false);
	rack.setRotation(0, Math.PI/180 * 90, 0);
	rack.shadow = shadow;

	var rackDoor = new mono.Cube(width, height, 2);
	rackDoor.s({
		'm.type':'phong',
		'm.color': '#A5F1B5',
		'm.ambient': '#A4F4EC',
		'front.m.texture.image': demo.getRes('rack_front_door.jpg'),
		'back.m.texture.image': demo.getRes('rack_door_back.jpg'),
		'm.envmap.image': demo.getEnvMap(),
	});
	rackDoor.setParent(rack);
	rack.door=rackDoor;
	rackDoor.setPosition(0, 0, depth/2+1);
	rackDoor.setClient('animation','rotate.right.100');
	rackDoor.setClient('type', 'rack.door');
	rackDoor.setClient('animation.done.func', function(){
		if(rack.getClient('loaded') || !rackDoor.getClient('animated')){
			return;
		}
		var fake=rack.clone();
		fake.s({
			'm.color': 'red',
			'm.ambient': 'red',
			'm.texture.image': null,
			'top.m.normalmap.image': demo.getRes('outside_lightmap.jpg'),
			'top.m.specularmap.image': demo.getRes('white.png'),
		});
		fake.setDepth(fake.getDepth()-2);
		fake.setWidth(fake.getWidth()-2);
		box.add(fake);

		rack.s({
			'm.transparent': true,
			'm.opacity': 0.5,
		});

		new twaver.Animate({
			from: 0,
			to: fake.getHeight(),
			dur: 2000,
			easing: 'easeOut',
			onUpdate: function (value) {
				fake.setHeight(value);
				fake.setPositionY(value/2);
			},
			onDone: function(){
				box.remove(fake);
				rack.s({
					'm.transparent': false,
					'm.opacity': 1,
				});
				var loader = rack.getClient('rack.loader');
				if(loader && rackDoor.getClient('animated') && !rack.getClient('loaded')){
					loader();
					rack.setClient('loaded', true);

					if(rack.getClient('loaded.func')){
						rack.getClient('loaded.func')(rack);
					}
				}
			}
		}).play();
	});

	var loader=function(box, width, height, depth, severity, rack, json){
		var cut=new mono.Cube(width*0.75, height-10, depth*0.7);
		cut.s({
			'm.color': '#333333',
			'm.ambient': '#333333',
			'm.lightmap.image': demo.getRes('inside_lightmap.jpg'),
			'bottom.m.texture.repeat': new mono.XiangliangTwo(2,2),			
			'left.m.texture.image': demo.getRes('rack_panel.jpg'),
			'right.m.texture.image': demo.getRes('rack_panel.jpg'),
			'back.m.texture.image': demo.getRes('rack_panel.jpg'),
			'back.m.texture.repeat': new mono.XiangliangTwo(1,1),
			'top.m.lightmap.image': demo.getRes('floor.jpg'),
		});
		cut.setPosition(0, 0, depth/2-cut.getDepth()/2+1);
		box.remove(rack);
		if(rack.alarm){
			box.getAlarmBox().remove(rack.alarm);
		}

		var cube = rack.clone();
		cube.p(0, 0, 0);
		
		var newRack=new mono.ComboNode([cube, cut], ['-']);
		
		var x=rack.getPosition().x;
		var y=rack.getPosition().y;
		var z=rack.getPosition().z;

		newRack.p(x, y, z);
		newRack.setClient('type', 'rack');
		newRack.oldRack=rack;
		rack.newRack=newRack;
		newRack.shadow = shadow;
		box.add(newRack);

		if(severity){
			var alarm = new mono.Alarm(newRack.getId(), newRack.getId(), severity);
			newRack.setStyle('alarm.billboard.vertical', true);
			newRack.alarm=alarm;
			box.getAlarmBox().add(alarm);
		}

		//set child for newrack
		var children = rack.getChildren();
		children.forEach(function(child){
			if(child && !(child instanceof mono.Billboard)){
				child.setParent(newRack);
			}
		});

		demo.loadRackContent(box, x, y, z, width, height, depth, severity, cube, cut, json, newRack, rack);		
	};

	box.add(rack);
	box.add(rackDoor);
	if(severity){
		var alarm = new mono.Alarm(rack.getId(), rack.getId(), severity);
		rack.setStyle('alarm.billboard.vertical', true);
		rack.alarm=alarm;
		box.getAlarmBox().add(alarm);
	}			
	var loadFunction = function(){
		loader(box, width, height, depth, severity, rack, json);
	};
	rack.setClient('rack.loader', loadFunction);
});

//------------------------------------------------------desk----------------------------------------------------//

demo.registerFilter('desks', function(box, json){
	var objects=[];
	var translates=json.translates;
	if(translates){
		for(var i=0;i<translates.length;i++){
			var translate=translates[i];
			var plant={
				type: 'desk',
				shadow: true,
				translate: translate,
			};
			demo.copyProperties(json, plant, ['type', 'translates', 'translate']);
			objects.push(plant);
		}
	}
	return objects;
});

// desk type :
demo.registerCreator('desk', function(box, json){
	var scale=json.scale || [1,1,1];
	var scaleX=scale[0], scaleY=scale[1], scaleZ=scale[2];
	var shadow = json.shadow;
	var translate=json.translate || [0,0,0];
	var x=translate[0], y=translate[1], z=translate[2];
	var loader=function(x, y, z, scaleX, scaleY, scaleZ){
//创建一个立方体
var cube = new mono.Cube(150,10,100);
cube.setStyle('m.texture.image', 'res/metal.png');
 
//创建一个圆柱体
var cylinder1 = new mono.Cylinder(5,5,100);
cylinder1.setStyle('m.texture.image', 'res/floor.jpg');
cylinder1.setPosition(-50,-50, -50);

var cylinder2 = new mono.Cylinder(5,5,100);
cylinder2.setStyle('m.texture.image', 'res/floor.jpg');
cylinder2.setPosition(50,-50, -50);

var cylinder3 = new mono.Cylinder(5,5,100);
cylinder3.setStyle('m.texture.image', 'res/floor.jpg');
cylinder3.setPosition(50,-50, 50);

var cylinder4 = new mono.Cylinder(5,5,100);
cylinder4.setStyle('m.texture.image', 'res/floor.jpg');
cylinder4.setPosition(-50,-50, 50);  // y = up/down
 
var csg1=new mono.CSG(cube); //立方体对应的运算体对象
var csg2=new mono.CSG(cylinder1);  //圆柱体对应的运算体对象
var csg3=new mono.CSG(cylinder2);
var csg4=new mono.CSG(cylinder3);
var csg5=new mono.CSG(cylinder4);

var csg=csg1.union(csg2).union(csg3).union(csg4).union(csg5).toMesh();  //立方体减去圆柱体，生成残留对象，并进行mesh处理，返回运算结果3D对象
csg.setPosition(-780, 100, -400) 
var csga=csg1.union(csg2).union(csg3).union(csg4).union(csg5).toMesh();  //立方体减去圆柱体，生成残留对象，并进行mesh处理，返回运算结果3D对象
csga.setPosition(-780, 100, -300) 
var csgb=csg1.union(csg2).union(csg3).union(csg4).union(csg5).toMesh();  //立方体减去圆柱体，生成残留对象，并进行mesh处理，返回运算结果3D对象
csgb.setPosition(-780, 100, -200)
var csgbb=csg1.union(csg2).union(csg3).union(csg4).union(csg5).toMesh();  //立方体减去圆柱体，生成残留对象，并进行mesh处理，返回运算结果3D对象
csgbb.setPosition(-780, 100, -100)
var csgc=csg1.union(csg2).union(csg3).union(csg4).union(csg5).toMesh();  //立方体减去圆柱体，生成残留对象，并进行mesh处理，返回运算结果3D对象

var aa=csg1.union(csg2).union(csg3).union(csg4).union(csg5).toMesh();  //立方体减去圆柱体，生成残留对象，并进行mesh处理，返回运算结果3D对象
aa.setPosition(-780, 100, -600)
var bb=csg1.union(csg2).union(csg3).union(csg4).union(csg5).toMesh();  //立方体减去圆柱体，生成残留对象，并进行mesh处理，返回运算结果3D对象
bb.setPosition(-780, 100, -500)



box.add(csg);
box.add(csga);
box.add(csgb);
box.add(csgbb);
box.add(aa);
box.add(bb);


//box.add(aa);
//box.add(bb);
//box.add(cc);
//box.add(dd);
//box.add(ee);
//box.add(ff);
//box.add(csge);


	};
	var loaderFunc=function(x, y, z, scaleX, scaleY, scaleZ){
		return function(){
			loader(x, y, z, scaleX, scaleY, scaleZ);
		};
	};
	setTimeout(loaderFunc(translate[0],translate[1],translate[2],scale[0],scale[1],scale[2]), demo.getRandomLazyTime());					
});



//---------------------------------------------------------------------------------------------------------//




demo.registerCreator('plant', function(box, json){
	var scale=json.scale || [1,1,1];
	var scaleX=scale[0], scaleY=scale[1], scaleZ=scale[2];
	var shadow = json.shadow;
	var translate=json.translate || [0,0,0];
	var x=translate[0], y=translate[1], z=translate[2];

	var loader=function(x, y, z, scaleX, scaleY, scaleZ){
		var plant=demo.createPlant(x, y, z, scaleX, scaleY, scaleZ);
		plant.shadow = shadow;
		box.add(plant);
	};

	var loaderFunc=function(x, y, z, scaleX, scaleY, scaleZ){
		return function(){
			loader(x, y, z, scaleX, scaleY, scaleZ);
		};
	};
	setTimeout(loaderFunc(translate[0],translate[1],translate[2],scale[0],scale[1],scale[2]), demo.getRandomLazyTime());					
});

demo.registerCreator('post', function(box, json){
	var translate=json.translate || [0,0,0];
	var x=translate[0],
		y=translate[1],
		z=translate[2];
	var width=json.width, height=json.height;
	var pic=json.pic;

	var post=new mono.Cube(width, height, 0);
	post.s({
		'm.visible': false,
	});
	post.s({
		'm.texture.image': pic,
		'front.m.visible': true,
	});
	post.setPosition(x, y, z);
	post.setClient('type', 'post');

	box.add(post);
});

demo.registerCreator('extinguisher', function(box, json){
	var translate=json.translate || [0,0,0];
	var x=translate[0], z=translate[1];
	var arrow=json.arrow;

	var loader=function(box, translate, x, z){
		var extinguisher=demo.createExtinguisher(box, translate, x, z, arrow);
		box.add(extinguisher);
	}

	var loaderFunc=function(box, translate, x, z, arrow){
		return function(){
			loader(box, translate, x, z, arrow);
		}
	}
	setTimeout(loaderFunc(box, translate, x, z, arrow), demo.getRandomLazyTime());					
});


//  demo.registerCreator
demo.registerCreator('smoke', function(box, json){

	var translate=json.translate || [0,0,0];	
	var color=json.color;

	var loader=function(box, translate, color){
		var smoke=demo.createSmoke(translate, color);
		box.add(smoke);
	}

	var loaderFunc=function(box, translate, color){
		return function(){
			loader(box, translate, color);
		}
	}
	setTimeout(loaderFunc(box, translate, color), demo.getRandomLazyTime());					
});

demo.createSmoke=function(translate, color){
	var x=translate[0], y=translate[1], z=translate[2];
	var smoke = new mono.Particle();
	var count=300;
	for (var i = 0; i < count; i++) {
		smoke.vertices.push(new mono.XiangliangThree());
	}

	smoke.verticesNeedUpdate = true;
	smoke.sortParticles = false;
	smoke.setStyle('m.size', 20);
	smoke.setStyle('m.transparent', true);
	smoke.setStyle('m.opacity', 0.5);
	smoke.setStyle('m.texture.image', demo.getRes('smoking.png'));
	smoke.setStyle('m.color', color);
	smoke.setStyle('m.depthTest',false);

	smoke.setClient('type', 'smoke');

	smoke.setVisible(false);
	smoke.setPosition(x,y,z);
	return smoke;
}


demo.createExtinguisher=function(box, translate, x, z, arrow){
	var body=new mono.Cylinder(8,8,50,20);
	body.setPositionY(body.getHeight()/2);
	body.s({
		'side.m.texture.image': demo.getRes('fire_extinguisher_side.jpg'),
		'm.type': 'phong',
		'm.specularStrength': 50,
	});
	body.shadow=true;
	body.setClient('type', 'extinguisher');
	body.setPosition(x,body.getHeight()/2,z);
	box.add(body);

	var top=new mono.Sphere(8,20);
	top.setParent(body);
	top.setPositionY(body.getHeight()/2);
	top.setScaleY(0.5);
	top.s({
		'm.color': '#DF0101',
		'm.ambient': '#DF0101',
		'm.type': 'phong',
		'm.specularStrength': 50,
	});
	box.add(top);

	var nozzle=new mono.Cylinder(2,3,10);
	nozzle.setParent(top);
	nozzle.setPositionY(top.getRadius());			
	nozzle.s({
		'm.color': 'orange',
		'm.ambient': 'orange',
		'm.type': 'phong',
	}); 
	box.add(nozzle);

	var handleA=new mono.Cube(14,1,3);
	handleA.setParent(nozzle);
	handleA.setPositionY(nozzle.getHeight()-3);	
	handleA.setPositionX(handleA.getWidth()/2-2);
	handleA.setRotationZ(Math.PI/180*45);
	handleA.s({
		'm.texture.image': demo.getRes('metal.png'),
		'm.type': 'phong',
	}); 
	box.add(handleA);

	var handleB=new mono.Cube(14,1,3);
	handleB.setParent(nozzle);
	handleB.setPositionY(nozzle.getHeight()-8);	
	handleB.setPositionX(handleB.getWidth()/2);
	handleB.setRotationZ(Math.PI/180*-10);
	handleB.s({
		'm.texture.image': demo.getRes('metal.png'),
		'm.type': 'phong',
	}); 
	box.add(handleB);

	var path=new mono.Path();
	path.moveTo(0,0,0);
	path.curveTo(-10,0,0,-15,-10,0);
	path.curveTo(-20,-20,0,-15,-55,0);
	var pipe=new mono.PathNode(path,50,2,10,'round','round');
	pipe.setParent(nozzle);
	pipe.s({
		'm.texture.image': demo.getRes('metal.png'),
		'm.type': 'phong',
	}); 
	box.add(pipe);			

	if(arrow){
		var count=6;
		var height=60;
		var planes=[];
		for(var i=0; i<count; i++){
			var plane=new mono.Plane(height/2, height);
			plane.s({
				'm.texture.image': demo.getRes('down.png'),
				'm.transparent': true,
				'm.side': mono.DoubleSide,
				'm.type': 'phong',				
			});			
			plane.setParent(nozzle);
			plane.setPositionY(height+i*height);
			plane.setVisible(false);
			plane.setClient('type', 'extinguisher_arrow');
			box.add(plane);
			planes.push(plane);

			planes.index=10000;
		}

		var func=function(){
			if(planes[0].isVisible()){		
				planes.index--;
				if(planes.index==0){
					planes.index=10000;
				}
				var offset=planes.index % count;
				for(var i=count-1;i>=0;i--){
					var plane=planes[i];
					if(i===offset){
						plane.s({
							'm.color': '#FF8000',
							'm.ambient': '#FF8000',				
						});
					}else{
						plane.s({
							'm.color': 'white',
							'm.ambient': 'white',
						});
					}
				}
			}
			setTimeout(func, 200);
		}
		setTimeout(func, 200);
	}
}

demo.registerFilter('gleye', function(box, json){
	var x=json.translate[0], y=json.translate[1], z=json.translate[2];
	var angle=json.angle || 0;
	var direction=130;

	var loader=function(box, x, y, z, angle, direction){		
		var gleye=demo.createGleye(box, x, y, z, angle, direction);
		box.add(gleye);
	}

	var loaderFunc=function(box, x, y, z, angle, direction){		
		return function(){
			loader(box, x, y, z, angle, direction);
		}
	}
	setTimeout(loaderFunc(box, x, y, z, angle, direction), demo.getRandomLazyTime());					
});

demo.createGleye=function(box, x, y, z, angle, direction){		
	var body=new mono.Cylinder(4,4,15);
	body.s({
		'm.texture.image': demo.getRes('bbb.png'),
		'top.m.texture.image': demo.getRes('camera.png'),
		'bottom.m.texture.image': demo.getRes('eee.png'),
		'm.type': 'phong',
	});
	
	var style={
		'side.m.normalType': mono.NormalTypeSmooth,
	};
	var cover1=new mono.Cylinder(6,6,20);	
	cover1.s(style);
	var cover2=new mono.Cylinder(5,5,20);
	cover2.s(style);
	var cover3=new mono.Cube(10,20,10);				
	var path=new mono.Path();
	path.moveTo(0,0,0);
	path.lineTo(0,-10,0);
	path.lineTo(0,-11,-1);
	path.lineTo(0,-12,-13);
	path.lineTo(0,-12,-30);
	
	var gleye=new mono.ComboNode([cover1,cover3,cover2, body],['+','-','+']);
	gleye.s({
		'm.type': 'phong',
		'm.color': '#2E2E2E',
		'm.ambient': '#2E2E2E',
		'm.specularStrength': 50,
	});
	gleye.setRotation(Math.PI/180*100, 0, Math.PI/180*angle);
	gleye.setPosition(x,y,z);		
	gleye.setClient('type', 'gleye');
	gleye.setClient('dbl.func', function(){
		demo.showVideoDialog('Gleye #: C300-493A  |  Status: OK');
	});
	box.add(gleye);

	var pipe=new mono.PathNode(path,10,2,10,'plain','plain');
	pipe.s({
		'm.color': '#2E2E2E',
		'm.ambient': '#2E2E2E',
		'm.type': 'phong',
		'm.specularStrength': 50,
		'm.normalType': mono.NormalTypeSmooth,
	});
	pipe.setRotationX(-Math.PI/2);		
	pipe.setParent(gleye);
	
	box.add(pipe);
};

demo.createWall = function(path, thick, height, insideColor, outsideColor, topColor){
	var wall= new mono.PathCube(path, thick, height);
	wall.s({
		'outside.m.color': outsideColor,
		'inside.m.type': 'basic',
		'inside.m.color': insideColor,
		'aside.m.color': outsideColor,
		'zside.m.color': outsideColor,
		'top.m.color': topColor,
		'bottom.m.color': topColor,
		'inside.m.lightmap.image': demo.getRes('inside_lightmap.jpg'),
		'outside.m.lightmap.image': demo.getRes('outside_lightmap.jpg'),
		'aside.m.lightmap.image': demo.getRes('outside_lightmap.jpg'),
		'zside.m.lightmap.image': demo.getRes('outside_lightmap.jpg'),
	});
	return wall;
}



demo.createPlant = function(x, y, z, scaleX, scaleY, scaleZ){
	var plant;
	if(!demo._plantInstance){
		var w=30;
		var h=120;
		var pic=demo.getRes('plant.png');
		var objects=[];

		var cylinderVase=new mono.Cylinder(w*0.6,w*0.4,h/5,20,1,false,false);
		cylinderVase.s({
			'm.type': 'phong',
			'm.color': '#845527',
			'm.ambient': '#845527',
			'm.texture.repeat': new mono.XiangliangTwo(10,4),
			'm.specularmap.image': demo.getRes('metal_normalmap.jpg'),
			'm.normalmap.image':demo.getRes('metal_normalmap.jpg'),
		});			
		var cylinderHollow=cylinderVase.clone();
		cylinderHollow.setScale(0.9,1,0.9);
		var cylinderMud=cylinderHollow.clone();
		cylinderMud.setScale(0.9,0.7,0.9);
		cylinderMud.s({
			'm.type': 'phong',
			'm.color': '#163511',
			'm.ambient': '#163511',
			'm.texture.repeat': new mono.XiangliangTwo(10,4),
			'm.specularmap.image': demo.getRes('metal_normalmap.jpg'),
			'm.normalmap.image':demo.getRes('metal_normalmap.jpg'),
		});
		var vase=new mono.ComboNode([cylinderVase,cylinderHollow,cylinderMud],['-','+']);
		objects.push(vase);

		var count=5;
		for(var i=0;i<count;i++){
			var plant=new mono.Cube(w*2,h,0.01);	

			plant.s({
				'm.visible': false,
				'm.alphaTest': 0.5,
				'front.m.visible': true,
				'front.m.texture.image': pic,
				'back.m.visible': true,
				'back.m.texture.image': pic,
			});
			plant.setParent(vase);
			plant.setPositionY(cylinderVase.getHeight()/2+plant.getHeight()/2-3);
			plant.setRotationY(Math.PI * i/count);
			objects.push(plant);
		}

		demo._plantInstance=new mono.ComboNode(objects);				
		demo._plantInstance.setClient('plant.original.y', cylinderVase.getHeight()/2);			
		plant = demo._plantInstance;
		//console.log('create plant from brand new');
	}else{
		plant = demo._plantInstance.clone();
		//console.log('create plant from instance');
	}

	plant.setPosition(x,plant.getClient('plant.original.y')+y,z);
	plant.setScale(scaleX, scaleY, scaleZ);
	plant.setClient('type', 'plant');
	return plant;
}

demo.createAirPlanes = function(){
	var planes=[];
	var wavePath= new mono.Path();
	wavePath.moveTo(0,0,0);
	wavePath.curveTo(0,80,30,0,100,150);
	wavePath.curveTo(0,120,200,0,200,230);

	var creator=function(length, x, z){
		var path = new mono.Path();
		path.moveTo(0,0,0);
		path.lineTo(length,0,0);			
		var curvePlane = new mono.CurvePlane(path, wavePath);
		curvePlane.setPosition(x, 0, z);
		curvePlane.s({
			'm.texture.image': demo.getRes('arrow.png'),
			'm.side': 'both',
			'm.texture.repeat': new mono.XiangliangTwo(parseInt(length/50), 8),				
			'm.transparent': true,
			'm.gradient': {0: '#84DF29', 0.6: '#DF6029', 1: '#DF2929'},
			'm.gradientType': 2,				
		});

		var airAnimation=new twaver.Animate({
			from: 0,
			to: 1,
			dur: 1000,
			reverse: false,
			repeat:Number.POSITIVE_INFINITY,
			onUpdate: function(value){
				curvePlane.s({
					'm.texture.offset': new mono.XiangliangTwo(0, -value),
				});
			},
		});
		curvePlane.airAnimation=airAnimation;						

		return curvePlane;
	}

	planes.push(creator(450, -10, 150));
	planes.push(creator(195, -310, 150));
	planes.push(creator(250, -400, -350));
	return planes;
}

demo.registerFilter('water_cable', function(box, json){			
	var path = demo.create3DPath(json.data);
	path = mono.PathNode.prototype.adjustPath(path, 5);
	var color=json.color;
	var size=json.size;
	var y=json.y;
	
	var loader=function(box, path, color, size, y){
		box.add(demo.createWaterCable(path, color, size, y));
	};

	var loaderFunc=function(box, path, color, size, y){
		return function(){
			loader(box, path, color, size, y);
		};
	};
	setTimeout(loaderFunc(box, path, color, size, y), demo.getRandomLazyTime());	
});

demo.createWaterCable = function(path, color, size, y){
	var cable=new mono.PathNode(path, 100, size);
	cable.s({
		'm.type': 'phong',
		'm.specularStrength': 50,
		'm.color': color,
		'm.ambient': color, 		
		'm.texture.image': demo.getRes('flow.jpg'),
		'm.texture.repeat': new mono.XiangliangTwo(100, 1),
	});
	cable.setStartCap('plain');
	cable.setEndCap('plain');
	cable.setPositionY(y);
	cable.setClient('type', 'water_cable');	
	cable.setVisible(false);
	return cable;
};


//  demo.createLaser + demo.registerFilter('laser') 

demo.registerFilter('laser', function(box, json){			
	var loader=function(box, json){
		box.add(demo.createLaser(box, json));
	};

	var loaderFunc=function(box, json){
		return function(){
			loader(box, json);
		};
	};
	setTimeout(loaderFunc(box, json), demo.getRandomLazyTime());	
});


demo.createLaser = function(box, json){

	var angle=Math.atan2(json.to[1]-json.from[1], json.to[0]-json.from[0]);
	
	var offset=1.5;
	var fromOffsetZ=offset*Math.sin(angle);
	var fromOffsetX=offset*Math.cos(angle);
	var toOffsetZ=offset*Math.sin(angle+Math.PI);
	var toOffsetX=offset*Math.cos(angle+Math.PI);

	//from side.
	var pole=new mono.Cylinder(5, 5, 170);
	pole.s({
		'm.texture.image': demo.getRes('rack_inside.jpg'),
		'm.texture.repeat': new mono.XiangliangTwo(1, 3),
		'm.color': '#A4A4A4',
		'm.ambient': '#A4A4A4',
		'm.type': 'phong',
		'm.specularStrength': 10,
	});
	pole.setPosition(json.from[0], pole.getHeight()/2, json.from[1]);
	pole.setClient('type', 'laser');
	pole.setVisible(false);
	box.add(pole);

	var glass=new mono.Cylinder(4, 4, 130);
	glass.s({			
		'm.type': 'phong',
		'm.color': '#A9F5D0',
		'm.ambient': '#A9F5D0',
		'm.envmap.image': demo.getEnvMap(),

	});
	glass.setParent(pole);
	glass.setPosition(fromOffsetX, 0, fromOffsetZ);
	glass.setClient('type', 'laser');
	glass.setVisible(false);
	box.add(glass);

	//another side.
	var pole2=pole.clone();
	pole2.setPosition(json.to[0], pole2.getHeight()/2, json.to[1]);
	pole2.setClient('type', 'laser');
	pole2.setVisible(false);
	box.add(pole2);

	var glass2=glass.clone();
	glass2.setParent(pole2);
	glass2.setPosition(toOffsetX, 0, toOffsetZ);
	glass2.setClient('type', 'laser');
	glass2.setVisible(false);
	box.add(glass2);

	//create laser lines.
	var color='red';
	for(var i=0;i<5;i++){
		var from=new mono.Cube(1,1,1);
		from.s({
			'm.color': color,
			'm.ambient': color,
		});
		from.setPosition(json.from[0], 30+i*27, json.from[1]);
		from.setClient('type', 'laser');
		from.setVisible(false);
		box.add(from);

		var to=from.clone();
		to.setPosition(json.to[0], 30+i*27, json.to[1]);
		to.setClient('type', 'laser');
		to.setVisible(false);
		box.add(to);

		var link=new mono.Link(from, to);
		link.s({
			'm.color': color,
			'm.ambient': color,
			'm.type': 'phong',
			'm.transparent': true,
			'm.opacity': 0.7,
		});
		link.setClient('type', 'laser');
		link.setVisible(false);
		box.add(link);
	}
};

Tooltip = function(keys, values) {
    this.mainContent = document.createElement('div');
    this.keys = keys;
    this.values = values;
    this.init();
}

twaver.Util.ext('Tooltip', Object, {
	init: function(){
		this.mainContent.setAttribute('class', 'tooltip');
		this.mainContent.setAttribute('id', 'tooltip');
		this.table = document.createElement('table');
		for(var i = 0; i < this.keys.length; i++){
			var tr = document.createElement('tr');
			var tdKey = document.createElement('td');
			tdKey.setAttribute('class', 'tooltip-key');
			tdKey.innerHTML = this.keys[i];
			tr.appendChild(tdKey);

			var tdValue = document.createElement('td');
			tdValue.setAttribute('class', 'tooltip-value');
			tdValue.innerHTML = this.values[i];
			tr.appendChild(tdValue);
			this.table.appendChild(tr);
		}
		this.mainContent.appendChild(this.table);
	},
	getView: function(){
		return this.mainContent;
	},
	setValues: function(values){
		this.values = values;
		var children = this.table.childNodes;
		for(var i = 0; i < this.values.length; i++){
			var value = this.values[i];
			var childGroup = children[i];
			childGroup.lastChild.innerHTML = value;
		}
	}
});


var dataJson={	
	objects: [{
		type: 'floor',
		width: 2500,
		depth: 2000,
	},{
		type: 'floor_cut',
		width: 130,
		height: 20,
		depth: 200,
		translate: [-700,0,900],
		rotate: [Math.PI/180*3, 0, 0],
	},{
		type: 'floor_box',
		width: 150,
		height: 200,
		depth: 100,
		translate: [-750, 0, 820],
	},
	{
		type: 'wall',
		height: 200,		
		translate: [-500, 0, -500],
		
		data:[[-350, -400], [1000 ,-400 ], 
		
		[ 1000,-100 ],[ 1500, -100 ],
		[1500, 1200 ] ,
		
		[1000, 1200], [1000, 1300],[-100 ,1300],
		
		[-100, 1200], [-350, 1200],[-350, -400]],
		
		children: [

//		{
//			type: 'door',
//			width: 130,
//			height: 180,
//			depth: 26,
//			translate: [-600,0,800],
//			rotation: Math.PI,
//			p1: 30,
//			p2: 30,
//			
//		},
			{
			type: 'door',
			width: 130,
			height: 180,
			depth: 26,
			translate: [-850,0,600],
			rotation: Math.PI,
			p1: 30,
			p2: 30,
			
		},
		{
			type: 'door',
			width: 130,
			height: 180,
			depth: 26,
			translate: [400,0,900],
			rotation: 0,
			p1: 0,
			p2: 0,			
		}
		
],},


	{
	type: 'wall',
		height: 200,		
		translate: [-500, 0, -500],
		
		data:[ [ 1000,-100 ],    [ 1000, 1200 ], ],
		children: [

		{
			type: 'window',
//			translate: [200, 30, 650],
			translate: [500, 0, 100],  //   -------------- ok one
			width: 1050,
			height: 200,
			depth: 50, 
			r: Math.PI,
		},
		{
			type: 'door',
			width: 130,
			height: 200,
			depth: 26,
			translate: [300,0,500],
			rotation: Math.PI,
			p1: 30,
			p2: 30,	
		},
		{
			type: 'door',
			width: 130,
			height: 200,
			depth: 26,
			translate: [500,0,100],
			rotation: Math.PI,
			p1: 30,
			p2: 30,	
		}
		

],


    },
	{
	type: 'wall',
		height: 200,		
		translate: [-500, 0, -500],
		
		data:[ [ 1000,1200 ],    [ -100, 1200 ], ],
    },
    	{
	type: 'wall',
		height: 200,		
		translate: [-500, 0, -500],
		
		data:[ [ 1000,500 ],    [ 1000, 500 ], ],
		children: [
		{
			type: 'window',
			translate: [300, 0, 100],  //---------------
			width: 1600,
			height: 200,
			depth: 50, 
			r: Math.PI,
		},
		{
			type: 'door',
			width: 130,
			height: 200,
			depth: 26,
			translate: [650,0,0],
			rotation: 0,
			p1: 0,
			p2: 0,		
		},
		{
			type: 'door',
			width: 130,
			height: 200,
			depth: 26,
			translate: [500,0,-100],
			rotation: Math.PI,
			p1: 30,
			p2: 30,		
		}
		

],
    },
    
    
    {
	type: 'wall',
		height: 200,		
		translate: [-500, 0, -500],
		
		data:[ [ 800,-400 ],    [ 800, -400 ], ],
		children: [
		{
			type: 'window',
			translate: [750, 0, 0],  //----------------
			width: 500,
			height: 200,
			depth: 50, 
			r: 0
		},

],
    },
    
        {
	type: 'wall',
		height: 200,		
		translate: [-500, 0, -500],
		
		data:[ [ 800, 1200 ],    [ 800, 1200 ], ],
		children: [
		{
			type: 'window',
			translate: [750, 0, 0],  //----------------
			width: 500,
			height: 200,
			depth: 50, 
			r: 0
		},

],
    },
    
	{
		type: 'desks',
		shadow: false,
		translates: [[-200, 10, 1200],[-100, 10, 1200],[-100, 10, 1200], ],
	},
	{
//		type: 'plants',
//		shadow: true,
//		translates: [[560, 0, 350],[560, 0, 0],[560, 0, -340],[-70, 0, 350],[-70, 0, 0],[-70, 0, -340]],
//	},{
//		type: 'plants',
//		scale: [0.5, 0.3, 0.5],
//		shadow: false,
//		translates: [[100, 30, 650],[300, 30, 650]],  // translates: number of plants
//	},{
		type: 'glass_wall',
		width: 1300,
		rotate: [0, Math.PI/180*90, 0],
		translate: [-900, 0, 0],
	},{
		type: 'glass_wall',
		width: 1300,
		rotate: [0, Math.PI/180*90, 0],
		translate: [900, 0, 0],	  // location
	},{
		type: 'racks',		
		translates: [
			[-400, 0, 500],
			[-400, 0, 500-62],
			[-400, 0, 500-62-62],
			[-400, 0, 500-62-62-62],
			[-400, 0, 500-62-62-62-62],
			[-400, 0, 500-62-62-62-62-62],
			//[-160, 0, 350-62-62-62-62-62-62],
			//[-160, 0, 350-62-62-62-62-62-62-62],
			[-400, 0, 500-62-62-62-62-62-62-62-62],
			[-400, 0, 500-62-62-62-62-62-62-62-62-62],
			[-400, 0, 500-62-62-62-62-62-62-62-62-62-62],
			[-400, 0, 500-62-62-62-62-62-62-62-62-62-62-62],
			[-400, 0, 500-62-62-62-62-62-62-62-62-62-62-62-62],
			[-400, 0, 500-62-62-62-62-62-62-62-62-62-62-62-62-62],
			[-400, 0, 500-62-62-62-62-62-62-62-62-62-62-62-62-62-62],
			[-400, 0, 500-62-62-62-62-62-62-62-62-62-62-62-62-62-62-62],
			[-150, 0, 500],
			[-150, 0, 500-62],
			[-150, 0, 500-62-62],
			[-150, 0, 500-62-62-62],
			[-150, 0, 500-62-62-62-62],
			[-150, 0, 500-62-62-62-62-62],
			[-150, 0, 500-62-62-62-62-62-62],
			[-150, 0, 500-62-62-62-62-62-62-62],
			[-150, 0, 500-62-62-62-62-62-62-62-62],
			[-150, 0, 500-62-62-62-62-62-62-62-62-62],
			[-150, 0, 500-62-62-62-62-62-62-62-62-62-62],
			[-150, 0, 500-62-62-62-62-62-62-62-62-62-62-62],
			[-150, 0, 500-62-62-62-62-62-62-62-62-62-62-62-62],
			[-150, 0, 500-62-62-62-62-62-62-62-62-62-62-62-62-62],
			[-150, 0, 500-62-62-62-62-62-62-62-62-62-62-62-62-62-62],
			[-150, 0, 500-62-62-62-62-62-62-62-62-62-62-62-62-62-62-62],
			[100, 0, 500],
			[100, 0, 500-62],
			[100, 0, 500-62-62],
			[100, 0, 500-62-62-62],
			[100, 0, 500-62-62-62-62],
			[100, 0, 500-62-62-62-62-62],
			[100, 0, 500-62-62-62-62-62-62],
			[100, 0, 500-62-62-62-62-62-62-62],
			[100, 0, 500-62-62-62-62-62-62-62-62],
			[100, 0, 500-62-62-62-62-62-62-62-62-62],
			[100, 0, 500-62-62-62-62-62-62-62-62-62-62],
			[100, 0, 500-62-62-62-62-62-62-62-62-62-62-62],
			[100, 0, 500-62-62-62-62-62-62-62-62-62-62-62-62],
			[100, 0, 500-62-62-62-62-62-62-62-62-62-62-62-62-62],
			[100, 0, 500-62-62-62-62-62-62-62-62-62-62-62-62-62-62],
			[100, 0, 500-62-62-62-62-62-62-62-62-62-62-62-62-62-62-62],
			[360, 0, 500-62-62-62-62-62-62-62-62-62-62-62-62-62-62-62],
			[760, 0, 500-62-62-62-62-62-62-62-62-62-62-62],
			[760, 0, 500-62-62-62-62-62-62-62-62-62-62-62-62],
			[760, 0, 500-62-62-62-62-62-62-62-62-62-62-62-62-62],
			[760, 0, 500-62-62-62-62-62-62-62-62-62-62-62-62-62-62],
			[760, 0, 500-62-62-62-62-62-62-62-62-62-62-62-62-62-62-62],
			[660, 0, 350],
			[660+62, 0, 350],
			[660+62+62, 0, 350],
			[660+62+62+62, 0, 350],
			[660+62+62+62+62, 0, 350],
		],
		labels: (function(){
			var labels=[];
			for(var k=1; k<58; k++){
				var label = '1A';
				if(k < 10){
 					label += '0';
				}
				labels.push(label + k);
			}
			return labels;
		})(),
		severities: [mono.AlarmSeverity.CRITICAL, null,null,mono.AlarmSeverity.WARNING,mono.AlarmSeverity.CRITICAL,null, mono.AlarmSeverity.MINOR, mono.AlarmSeverity.WARNING,mono.AlarmSeverity.WARNING,null,mono.AlarmSeverity.MINOR],
	},{
		type: 'post',
		translate: [-200, 100, -685],
		width: 70,
		height: 120,
		pic: demo.getRes('post.jpg'),
	},{
		type: 'rail',
		data:[ [-180, 250], [-400, 250], [-400, -250], [400, -250]],
	},{
		type: 'connection',
		color: '#ED5A00',
		y: 265,
		flow: 0.05,
		data:[
			[-180, -100, -250],
			[-180, -100, -150],
			[-180, -50, -150],
			[-180, -50, -250],
			[-180, 0, -250],
			[-400, 0, -250],
			[-400, 0, 250],
			[400, 0, 250],
			[400, -50, 250],
			[400, -50, 350],
			[400, -100, 350],
			[400, -100, 250],
		],
	},{
		type: 'connection',
		color: '#21CD43',
		y: 265,
		flow: -0.05,
		data:[
			[-180+3, -100, -250],
			[-180+3, -100, -150],
			[-180+3, -50, -150],
			[-180+3, -50, -250+3],
			[-180+3, 0, -250+3],
			[-400+3, 0, -250+3],
			[-400+3, 0, 250-3],
			[400+3, 0, 250-3],
			[400+3, -50, 250-3],
			[400+3, -50, 350],
			[400+3, -100, 350],
			[400+3, -100, 250],
		],
	},{
		type: 'gleye',
		translate: [80, 200, -670],
	},{
		type: 'gleye',
		translate: [970, 200, -170],
		angle: 90,
	},{
		type: 'gleye',
		translate: [-450, 200, -670],
		alarm: mono.AlarmSeverity.WARNING,
	},{
		type: 'extinguisher',
		translate: [750, -470],
	},{
		type: 'extinguisher',
		translate: [750, -450],
		arrow: true,
	},{
		type: 'extinguisher',
		translate: [750, -430],
	},{
		type: 'smoke',
		translate: [300, 180, 240],
		color: '#FAAC58',
	},{
		type: 'smoke',
		translate: [-300, 180, -240],
		color: '#B40431',
	},{
		type: 'water_cable',
		color: '#B45F04',
		y: 10,
		size: 3,
		data:[
			[50, 0, 50],
			[460, 0, 50],
			[460, 0, 450],
			[-460, 0, 450],
			[-460, 0, -450],
			[-100, 0, -450],
			[-50, 0, -400],
			[-50, 0, 0],
			[0, 0, 50],
			[50, 0, 50],
		],
		},{
		type: 'water_cable',
		color: '#04B431',
		y: 10,
		size: 3,
		data:[
			[-300, 0, 180],
			[440, 0, 180],
			[440, 0, 330],
			[-340, 0, 330],
			[-340, 0, -180],
			[-420, 0, -180],
			[-420, 0, -310],
			[-120, 0, -310],
			[-120, 0, -180],
			[-320, 0, -180],
		],
	},{
		type: 'laser',
		from: [-485, 330],
		to: [485, 330],
	},{
		type: 'laser',
		from: [-485, 0],
		to: [-20, 0],
	},{
		type: 'laser',
		from: [-80, 480],
		to: [-80, -480],
	}],
};








