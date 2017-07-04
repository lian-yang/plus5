/*HTML5+*/ ;
(function() {

	window.$ = {

		/*
		 * 初始化
		 */
		ready: function(callback) {
			document.addEventListener('touchstart', $.empty(), false); //取消浏览器的所有事件
			document.oncontextmenu = $.empty(); //屏蔽选择函数
			document.addEventListener('plusready', function() {
				$.back();
				callback();
			}, false);
		},

		/*
		 * 空函数
		 */
		empty: function() {
			return false;
		},

		/*
		 * 返回键触发事件
		 */
		back: function() {
			var currentView = plus.webview.currentWebview();
			var backs = $.className('title');
			if(backs.length){
				for (var i = 0; i < backs.length; i++) {
					backs[i].addEventListener('click',function(){
						currentView.close('auto');
					});
				}
			}
			plus.key.addEventListener("backbutton", function() {
				currentView.close('auto');
			}, false);
		},
		
		
		/*
		 * 双击退出  必须重写back方法
		 */
		exit: function(){
			var first = null;
			plus.key.addEventListener("backbutton", function(){
				if (!first) {
                    first = new Date().getTime();
                    $.prompt('再按一次退出应用');
                    setTimeout(function() {
                        first = null;
                    }, 1000);
                } else {
                    if (new Date().getTime() - first < 1000) {
                        plus.runtime.quit();
                    }
	            }
			});
		},

		/**
		 * 获得Runtime信息
		 */
		runTime: function(name) {
			if(name) {
				return plus.runtime[name];
			} else {
				return plus.runtime;
			}
		},

		/**
		 * 设备信息
		 */
		deviceInfo: function(callback) {
			var json = {};
			json.model = plus.device.model;
			json.vendor = plus.device.vendor;
			json.imei = plus.device.imei;
			json.uuid = plus.device.uuid;
			var str = '';
			for(i = 0; i < plus.device.imsi.length; i++) {
				str += plus.device.imsi[i];
			}
			json.imsi = str;
			json.resolution = plus.screen.resolutionWidth * plus.screen.scale + " x " + plus.screen.resolutionHeight * plus.screen.scale;
			json.pixel = plus.screen.dpiX + " x " + plus.screen.dpiY;
			callback(json);
		},

		/**
		 * 手机信息 
		 */
		mobileInfo: function(callback) {
			var json = {};
			json.name = plus.os.name;
			json.version = plus.os.version;
			json.language = plus.os.language;
			json.vendor = plus.os.vendor;
			var types = {};
			types[plus.networkinfo.CONNECTION_UNKNOW] = "未知";
			types[plus.networkinfo.CONNECTION_NONE] = "未连接网络";
			types[plus.networkinfo.CONNECTION_ETHERNET] = "有线网络";
			types[plus.networkinfo.CONNECTION_WIFI] = "WiFi";
			types[plus.networkinfo.CONNECTION_CELL2G] = "2G";
			types[plus.networkinfo.CONNECTION_CELL3G] = "3G";
			types[plus.networkinfo.CONNECTION_CELL4G] = "4G";
			json.network = types[plus.networkinfo.getCurrentType()];
			callback(json);
		},

		/**
		 * 扫描二维码
		 */
		scanQrcode: function(json) {
			json = json || {};
			json.id = json.id || 'qrcode';
			json.filters = json.filters || ['QR'];
			json.styles = json.styles || { frameColor: '#00FF00', scanbarColor: '#76EE00', background: '#000000' };
			json.setFlash = json.setFlash || false;
			var bar = new plus.barcode.Barcode(json.id, json.filters, json.styles);
			bar.setFlash(json.setFlash);
			bar.start();
			bar.onmarked = function(type, code, file) {
				json.success && json.success(code);
			}
			bar.onerror = function(error) {
				json.error && json.error(error);
				//bar.cancel(); //关闭识别
				//bar.close(); //关闭控件
			}
		},

		/*
		 * 监听设备加速度变化信息
		 */
		watchAcceleration: function(success, error) {
			plus.accelerometer.watchAcceleration(function(a) {
				var data = {};
				data.x = a.xAxis;
				data.y = a.yAxis;
				data.z = a.zAxis;
				success && success(data);
			}, function(e) {
				error && error(e.message);
			});
		},

		/** 
		 * 照相机 
		 */
		camera: function(json) {
			var camera = plus.camera.getCamera();
			camera.captureImage(function(p) {
				plus.io.resolveLocalFileSystemURL(p, function(entry) {
					var img_name = entry.name;
					var img_path = entry.toLocalURL();
					json.success && json.success(img_path, img_name);
				}, function(e) {
					json.error && json.error(e.message);
				});
			}, function(e) {
				json.error && json.error(e.message);
			}, {
				filename: '_doc/camera/',
				index: 1
			});
		},

		/**
		 * 相册
		 */
		album: function(json) {
			if(!json.multiple) {
				var multiple = false;
			} else {
				var multiple = true;
			}
			json.filter = json.filter || 'image';
			plus.gallery.pick(function(path) {
				json.success && json.success(path);
			}, function(e) {
				json.error && json.error(e.message);
			}, {
				filter: json.filter, //文件过滤类型
				multiple: multiple, //是否支持多选
				system: true
			});
		},

		/**
		 * 地理位置
		 */
		getPosition: function(json) {
			if(!json.key) {
				//BFd9490df8a776482552006c538d6b27
				console.log('请求百度地图key不存在');
			}
			plus.geolocation.getCurrentPosition(function(position) {
				var timeflag = position.timestamp;
				var codns = position.coords;
				var lat = codns.latitude;
				var longt = codns.longitude;
				var alt = codns.altitude;
				var accu = codns.accuracy;
				var altAcc = codns.altitudeAccuracy;
				var head = codns.heading;
				var sped = codns.speed;
				var baidu_api = "http://api.map.baidu.com/geocoder/v2/?output=json&ak=" + json.key + "&location=" + lat + ',' + longt;
				$.ajax({
					url: baidu_api,
					data: {},
					success: function(data) {
						json.success && json.success(data);
					}
				});
			}, function(e) {
				json.error && json.error(e.message);
			});
		},

		/**
		 * 蜂鸣
		 */
		beep: function() {
			switch(plus.os.name) {
				case "iOS":
					if(plus.device.model.indexOf("iPhone") >= 0) {
						plus.device.beep();
					} else {
						this.prompt('此设备不支持蜂鸣');
					}
					break;
				default:
					plus.device.beep();
					break;
			}
		},

		/** 
		 * 手机震动
		 */
		vibrate: function() {
			switch(plus.os.name) {
				case "iOS":
					if(plus.device.model.indexOf("iPhone") >= 0) {
						plus.device.vibrate();
					} else {
						this.prompt('此设备不支持震动');
					}
					break;
				default:
					plus.device.vibrate();
					break;
			}
		},

		/**
		 * 拨打电话
		 */
		callPhone: function(phone) {
			plus.device.dial(phone, false);
		},

		/**
		 * 发送短信
		 */
		sendSms: function(phone, content) {
			var msg = plus.messaging.createMessage(plus.messaging.TYPE_SMS);
			msg.to = phone;
			msg.body = content;
			plus.messaging.sendMessage(msg);
		},

		/** 
		 * 邮件
		 */
		sendEmail: function(email) {
			location.href = "mailto:" + email;
		},

		/*
		 * 警告框
		 */
		alert: function(msg, callback, title) {
			title = title || '提示';
			plus.nativeUI.alert(msg, callback, title);
		},

		/*
		 * 提示框
		 */
		prompt: function(msg) {
			plus.nativeUI.toast(msg);
		},

		/*
		 * 确认框
		 */
		confirm: function(msg, title, callback) {
			var buttons = ['确定', '取消'];
			plus.nativeUI.confirm(msg, function(e) {
				if(e.index == 0) {
					callback && callback(true);
				} else {
					callback && callback(false);
				}
			}, title, buttons);
		},

		/*
		 * 显示等待框
		 */
		showWaiting: function(title) {
			plus.nativeUI.showWaiting(title);
		},

		/*
		 * 显示等待框
		 */
		closeWaiting: function() {
			plus.nativeUI.closeWaiting();
		},

		/*
		 * 选择按钮框
		 */
		actionSheet: function(title, buttons, callback) {
			if(buttons[0].title == undefined) {
				var buttonArr = [];
				for(var i = 0; i < buttons.length; i++) {
					var button = {
						'title': buttons[i]
					};
					buttonArr.push(button);
				}
				buttons = buttonArr;
			}
			if(!title) {
				title = "请选择";
			}
			plus.nativeUI.actionSheet({
					title: title,
					cancel: "取消",
					buttons: buttons
				},
				function(e) {
					//返回点击button的索引
					callback && callback(e.index);
				}
			);
		},

		/**
		 * 日期选择框
		 */
		pickDate: function(json) {
			var dDate = new Date();
			dDate.setFullYear(json.defaultDate.split('-')['0'], json.defaultDate.split('-')['1'] - 1, json.defaultDate.split('-')['2']);
			var minDate = new Date();
			minDate.setFullYear(json.minDate.split('-')['0'], json.minDate.split('-')['1'] - 1, json.minDate.split('-')['2']);
			var maxDate = new Date();
			maxDate.setFullYear(json.maxDate.split('-')['0'], json.maxDate.split('-')['1'] - 1, json.maxDate.split('-')['2']);
			plus.nativeUI.pickDate(function(e) {
				var d = e.date;
				if(d.getDate() < 10) {
					var day = '0' + d.getDate();
				} else {
					var day = d.getDate();
				}
				json.callback && json.callback(d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + day);
			}, function(e) {
				json.callback && json.callback(false);
			}, {
				title: "请选择日期",
				date: dDate,
				minDate: minDate,
				maxDate: maxDate
			});
		},

		/**
		 * 时间选择框
		 */
		pickTime: function(json) {
			var dTime = new Date();
			dTime.setHours(json.defaultTime.split(':')['0'], json.defaultTime.split(':')['1']);
			plus.nativeUI.pickTime(function(e) {
				var d = e.date;
				if(d.getHours() < 10) {
					var h = '0' + d.getHours();
				} else {
					var h = d.getHours();
				}
				if(d.getMinutes() < 10) {
					var m = '0' + d.getMinutes();
				} else {
					var m = d.getMinutes();
				}
				json.callback && json.callback(h + ":" + m);
			}, function(e) {
				json.callback && json.callback(false);
			}, {
				title: "请选择时间",
				is24Hour: true,
				time: dTime
			});
		},

		/**
		 * 获得当前时间
		 * 年,月,日,时,分,秒,星期几,时间戳
		 */
		getTime: function() {
			var date = new Date();
			var dateArr = [];
			dateArr.push(date.getFullYear());
			dateArr.push(date.getMonth() + 1);
			dateArr.push(date.getDate());
			dateArr.push(date.getHours());
			dateArr.push(date.getMinutes());
			dateArr.push(date.getSeconds());
			dateArr.push(date.getDay());
			dateArr.push(date.getTime());
			return dateArr;
		},

		/**
		 * 浏览器打开网页
		 */
		openUrl: function(url) {
			this.runTime().openURL(url);
		},

		/**
		 * 通过标签获取元素
		 */
		tagName: function(parentElement, tagElement) {
			if(tagElement == undefined) {
				return document.getElementsByTagName(parentElement);
			}
			return parentElement.getElementsByTagName(tagElement);
		},

		/**
		 * 通过ID获取元素
		 */
		id: function(id_element) {
			return document.getElementById(id_element);
		},

		/**
		 * 通过Class获取元素
		 */
		className: function(parentElement, classElement) {
			if(classElement == undefined) {
				return document.getElementsByClassName(parentElement);
			}
			return parentElement.getElementsByClassName(classElement);
		},

		/**
		 * 单击事件
		 */
		click: function(element, callback) {
			element.addEventListener('click', function() {
				callback(this);
			});
		},

		/**
		 * 显示遮罩
		 */
		showMask: function(callback) {
			var ws = plus.webview.currentWebview();
			ws.setStyle({ mask: "rgba(0,0,0,0.5)" });
			callback && callback();
		},

		/**
		 * 关闭遮罩
		 */
		closeMask: function(closeId, callback) {
			var ws = plus.webview.currentWebview(); //当前窗口对象
			var opener = ws.opener(); //创建者窗口对象
			var closeId = this.id(closeId);
			closeId.addEventListener("click", function() {
				opener.setStyle({ mask: "none" });
				ws.close();
				callback && callback();
			}, false);
		},

		/**
		 * 禁止界面弹动
		 */
		stopBounce: function() {
			var self = plus.webview.currentWebview();
			self.setStyle({
				setBounce: 'none'
			});
		},

		/**
		 * 隐藏界面滚动条
		 */
		hiddenScroll: function() {
			var self = plus.webview.currentWebview();
			self.setStyle({
				scrollIndicator: 'none'
			});
		},

		/**
		 * 获得屏幕的宽度高度
		 */
		getScreenSize: function(element) {
			if(element == 'width') {
				return document.documentElement.clientWidth || document.body.clientWidth;
			} else {
				return document.documentElement.clientHeight || document.body.clientHeigth;
			}
		},

		/**
		 * 获得随机数
		 */
		random: function(length) {
			if(length == undefined) {
				length = 4;
			}
			var pow = Math.pow(10, length);
			var number = Math.floor(Math.random() * pow + pow / 10).toString();
			return number.substr(0, length);
		},

		/*
		 * 跨域请求
		 */
		ajax: function(json) {
			$.showWaiting();
			if(!json.url) {
				this.prompt('请求url不存在');
				return;
			}
			json.type = json.type || 'GET';
			json.data = json.data || {};
			json.timeout = json.timeout || 30000;
			var xhr = new plus.net.XMLHttpRequest();
			xhr.timeout = json.timeout;
			xhr.onreadystatechange = function() {
				if(xhr.readyState == 4) {
					$.closeWaiting();
					if((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
						json.success && json.success(xhr.responseText);
					} else {
						json.error && json.error(xhr.status);
					}
				}
			}
			if(json.type.toUpperCase() == 'GET') {
				xhr.open('GET', json.url);
				xhr.send();
			}
			if(json.type.toUpperCase() == 'POST') {
				xhr.open('POST', json.url);
				xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
				xhr.send(jsonToUrl(json.data));
			}
			xhr.ontimeout = function() {
				$.prompt('请求超时');
			}
			//json对象转url参数
			function jsonToUrl(json) {
				var arr = [];
				for(var name in json) {
					arr.push(name + '=' + json[name]);
				}
				return arr.join('&');
			}
		},

		/*
		 * GET请求
		 */
		get: function(url, callback) {
			this.ajax({
				url: url,
				success: callback,
				type: 'GET'
			});
		},

		/*
		 * POST请求
		 */
		post: function(url, data, success, error) {
			this.ajax({
				url: url,
				data: data,
				success: success,
				error: error,
				type: 'POST'
			});
		},

		/*
		 * 获取通讯录
		 */
		getAddressBook: function(type, callback) {
			var length = 0;
			if(type == 'phone') {
				var getType = 'plus.contacts.ADDRESSBOOK_PHONE';
			} else {
				var getType = 'plus.contacts.ADDRESSBOOK_SIM';
			}
			plus.contacts.getAddressBook(getType, function(addressbook) {
				addressbook.find(null, function(contacts) {
					$.showWaiting();
					if(contacts.length < 1) {
						$.prompt('没有发现通讯录内容');
						$.closeWaiting();
					} else {
						length = contacts.length;
						var bookArr = [];
						for(var i = 0; i < length; i++) {
							var news = {};
							news.displayName = contacts[i].displayName;
							news.note = contacts[i].note;
							if(contacts[i].phoneNumbers[0]) {
								news.phone = contacts[i].phoneNumbers[0].value;
							} else {
								continue;
							}
							bookArr.push(news);
						}
						$.closeWaiting();
						callback(bookArr);
					}
				}, function(e) {
					console.log(e.message);
				}, {});
			}, function(e) {
				console.log(e.message);
			});

		},

		/*
		 * 注册事件
		 */
		fire: function(webview, event, data) {
			if(webview) {
				if(typeof data === 'undefined') {
					data = '';
				} else if(typeof data === 'boolean' || typeof data === 'number') {
					webview.evalJS("typeof $!=='undefined'&&$.trigger('" + event + "'," + data + ")");
					return;
				} else if(typeof data === 'object') {
					data = JSON.stringify(data || {}).replace(/\'/g, "\\u0027").replace(/\\/g, "\\u005c");
				}
				webview.evalJS("typeof $!=='undefined'&&$.trigger('" + event + "','" + data + "')");
			}
		},

		/*
		 * 触发事件
		 */
		trigger: function(event, data) {
			if(event) {
				if(data && typeof data === 'string') {
					data = JSON.parse(data);
				}
				document.dispatchEvent(new CustomEvent(event, {
					detail: data,
					bubbles: true,
					cancelable: true
				}));

				return this;
			}
		},

		/*
		 * 创建新页面
		 */
		createView: function(json) {
			if(json.id == undefined) {
				throw new Error('请填写创建页面id');
			}
			$.showWaiting();
			var extras = json.extras || {};
			var styles = {};
			styles.popGesture = 'none';
			styles.top = json.styles.top || '0px';
			styles.bottom = json.styles.bottom || '0px';
			styles.width = json.styles.width || '100%';
			styles.height = json.styles.height || '100%';
			//开启硬件加速
			if(!plus.webview.defaultHardwareAccelerated() && parseInt(plus.os.version) >= 5) {
				styles.hardwareAccelerated = true;
			}
			var newView = plus.webview.create(json.url, json.id, styles, extras);
			if(json.show == undefined) {
				newView.addEventListener( "loaded", function(){
					newView.show('fade-in');
					$.closeWaiting();
				}, false );
			}
			$.closeWaiting();
		},
		
		/*
		 * 创建子页面
		 */
		createChildView: function(){
			
		}

	}

})();