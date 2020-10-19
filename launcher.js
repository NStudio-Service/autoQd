"ui";
engines.myEngine().setTag("isMain", true);
importClass(android.animation.ObjectAnimator);
importClass(android.animation.AnimatorSet);
importClass(android.animation.ValueAnimator);
importClass(android.view.MotionEvent);
importClass(android.view.View);
importClass(android.webkit.CookieManager);
importClass(android.text.Html);
importPackage(java.io);

let tabs_view = [];
let selectView = 0;
let Tabs_btn_layout = function () {
	util.extend(Tabs_btn_layout, ui.Widget);

	function Tabs_btn_layout() {
		ui.Widget.call(this);
		this.defineAttr("data", (view, attr, value, defineSetter) => {
			arr = tabs_data.data[value];
			view._text.setText(arr[0]);
			view._src.attr("src", arr[1]);
			tabs_view[tabs_view.length] = view;
			if (value == selectView) {
				view._src.attr("tint", tabs_data.selectColor.on);
				view._text.setTextColor(colors.parseColor(tabs_data.selectColor.on));
			}
		});
	}

	Tabs_btn_layout.prototype.render = function () {
		return (
			<vertical id="_bg" w="*" bg="{{tabs_data.bg}}" padding="0 5" gravity="center">
				<img w="{{tabs_data.srcSize}}" id="_src" tint="{{tabs_data.selectColor.off}}"/>
				<text w="auto" id="_text" textSize="{{tabs_data.textSize}}" textColor="{{tabs_data.selectColor.off}}"/>
			</vertical>
		)
	}
	ui.registerWidget("tabs_btn-layout", Tabs_btn_layout);
	return Tabs_btn_layout;
}();
var Tabs_layout = function () {
	util.extend(Tabs_layout, ui.Widget);

	function Tabs_layout() {
		ui.Widget.call(this);
		this.defineAttr("data", (view, attr, value, defineSetter) => {
			for (var i = 0; i < tabs_data.data.length; i++) {
				time = i;
				ui.inflate(<tabs_btn-layout data="{{time}}" layout_weight="1"/>, view._tabs, true);
			}
			tabs_data.tabs_h ? _color = tabs_data.selectColor.on : _color = "#00000000";
			view.tabs.selectedTabIndicatorColor = colors.parseColor(_color);
		});
	}

	Tabs_layout.prototype.render = function () {
		return (
			<card w="*" h="auto" cardElevation="10" foreground="?selectableItemBackground">
				<horizontal id="_tabs"/>
				<tabs id="tabs"/>
				<horizontal weightSum="2" h="20" layout_gravity="center_vertical">
					<frame layout_weight="1">
						<View bg="#e8e8e8" w="1" layout_gravity="right"/>
					</frame>
					<frame layout_weight="1">
						<View bg="#e8e8e8" w="1" layout_gravity="right"/>
					</frame>
				</horizontal>
			</card>
		)
	}
	ui.registerWidget("tabs-layout", Tabs_layout);
	return Tabs_layout;
}();
let tabs_data = {
	bg: "#ffffff",
	selectColor: {
		on: "#005B0C",
		off: "#a0a0a0"
	},
	srcSize: 25,
	textSize: 14,
	tabs_h: true,
	data: [
		["主页", "@drawable/ic_home_black_48dp"],
		["应用", "@drawable/ic_widgets_black_48dp"]
	],
}

function getQrCode() {
	let cookieManager = CookieManager.getInstance();
	let cookie = cookieManager.getCookie("ijg.xujc.com");
	if (!cookie) {
		cookie = "";
	}
	let infoJson = http.get("http://ijg.xujc.com/api/schoolcustom/JGqrCode", {
		headers: {
			"Host": "ijg.xujc.com",
			"Cookie": cookie
		}
	}).body.json();
	let healthColor;
	switch (infoJson.data.color) {
		case "绿":
			healthColor = "#26AE64";
			break;
		case "黄":
			healthColor = "#FFB01E";
			break;
		case "红":
			healthColor = "#E64340";
			break;
		default:
			healthColor = "#808080";
	}
	ui.userState.setText(Html.fromHtml("<font color=\"" + healthColor + "\"><b>◉</b> 连续打卡" + parseInt(infoJson.data.clockDay) + "天</font>"));
}

function checkLogin() {
	try {
		let cookieManager = CookieManager.getInstance();
		let cookie = cookieManager.getCookie("ijg.xujc.com");
		if (!cookie) {
			cookie = "";
		}
		let infoJson = http.get("http://ijg.xujc.com/login/check", {
			headers: {
				"Host": "ijg.xujc.com",
				"Cookie": cookie
			}
		}).body.json();
		threads.start(getQrCode);
		ui.run(function () {
			ui.userName.setText(infoJson.data.name);
			ui.userNo.setText(infoJson.data.userNo);
			ui.hasLogin.setVisibility(0);
			ui.operation.setVisibility(0);
			ui.noInternet.setVisibility(8);
			ui.hasLogout.setVisibility(8);
			ui.logining.setVisibility(8);
		});
		return true;
	} catch (e) {
		e = e.toString();
		log(e);
		if (e.indexOf("SyntaxError: JSON.parse") !== -1) {
			//未登录
			ui.run(function () {
				ui.hasLogout.setVisibility(0);
				ui.noInternet.setVisibility(8);
				ui.hasLogin.setVisibility(8);
				ui.operation.setVisibility(8);
				ui.logining.setVisibility(8);
			});
			return false;
		} else if (e.indexOf("java.io.IOException: unexpected end of stream on Connection") !== -1) {
			//中断连接
			return checkLogin();
		} else {
			//网络错误
			ui.run(function () {
				ui.noInternet.setVisibility(0);
				ui.hasLogout.setVisibility(8);
				ui.hasLogin.setVisibility(8);
				ui.operation.setVisibility(8);
				ui.logining.setVisibility(8);
			});
			toast("网络异常，请检查网络连接");
			return;
		}
	}
}

function getPoem() {
	threads.start(function () {
		try {
			let poemJson = http.get("https://v1.jinrishici.com/all").body.json();
			let poem = poemJson.content;
			poemAuthor = poemJson.author;
			poemTitle = poemJson.origin;
			ui.run(function () {
				ui.poemTxt.setText(poem);
			});
		} catch (e) {
			poemAuthor = "Mojang";
			poemTitle = "Minecraft成就";
			ui.run(function () {
				ui.poemTxt.setText("抱歉，今天不行。");
			});
		}
		changingPoem = false;
	});
}

function clickPoemAnimation(view) {
	animatorSetPeople = new AnimatorSet();
	animatorSetPeople.setDuration(500);
	scaleX = ObjectAnimator.ofFloat(view, "scaleX", 1, 1.5, 1, 1.2, 1, 1.1, 1, 1.03, 1, 1.01, 1);
	scaleY = ObjectAnimator.ofFloat(view, "scaleY", 1, 1.5, 1, 1.2, 1, 1.1, 1, 1.03, 1, 1.01, 1);
	animatorSetPeople.play(scaleX).with(scaleY);
	animatorSetPeople.start();
}

events.broadcast.on("loginRes", function () {
	threads.start(checkLogin);
});

ui.useAndroidResources();
ui.layout(
	<frame>
		<vertical fitsSystemWindows="true">
			<appbar w="*">
				<linear w="*" gravity="bottom">
					<toolbar h="{{parseInt(0.02*device.height)}}" id="toolbar" title="健康打卡"/>
				</linear>
			</appbar>
			<vertical>
				<viewpager id="viewpager" bg="#F1F6EB">
					<frame id="index">
						<card layout_gravity="center|top" marginBottom="60" w="*" h="auto" cardElevation="0dp"
							  cardCornerRadius="0dp">
							<ScrollView clickable="true" scrollbars="vertical" fadingEdge="vertical">
								<vertical bg="#F1F6EB">
									<vertical id="poem" gravity="center" padding="15 10 15 0">
										<text id="poemTxt" w="*" gravity="center" singleLine="true" ellipsize="marquee"
											  focusable="true" textSize="15sp" textColor="#005B0C" textStyle="bold"
											  background="@drawable/white_background"/>
									</vertical>
									<vertical gravity="center" padding="15 10 15 0">
										<linear gravity="center_vertical" background="@drawable/white_background">
											<img src="file://./res/header.png" h="100dp" w="100dp" scaleType="fitCenter"
												 padding="10 10 5 10"/>
											<linear id="logining" w="*" gravity="center_vertical">
												<text textSize="25" text="正在登录……" padding="10"/>
											</linear>
											<linear visibility="gone" id="hasLogin" w="*" gravity="center_vertical">
												<vertical w="auto" padding="10">
													<text id="userName" w="*" textSize="25" textColor="#005B0C"
														  text="屑博易"/>
													<text id="userNo" w="*" textSize="15" text="WWW00000"/>
													<text id="userState" w="*" text="◉ 连续打卡▒▒天"/>
												</vertical>
												<linear w="*" paddingRight="20" gravity="right|center_vertical">
													<vertical id="logout" background="@drawable/ripple"
															  gravity="center">
														<img gravity="center" tint="#005B0C"
															 src="@drawable/ic_exit_to_app_black_48dp"
															 paddingBottom="10"/>
														<text w="*" gravity="center" textSize="15" text="注销"/>
													</vertical>
												</linear>
											</linear>
											<linear visibility="gone" id="hasLogout" w="*" gravity="center_vertical">
												<text textSize="25" textColor="#005B0C" text="未登录" padding="10"/>
												<linear w="*" paddingRight="20" gravity="right|center_vertical">
													<vertical id="login" background="@drawable/ripple" gravity="center">
														<img gravity="center" tint="#005B0C"
															 src="@drawable/ic_account_circle_black_48dp"
															 paddingBottom="10"/>
														<text w="*" gravity="center" textSize="15" text="登录"/>
													</vertical>
												</linear>
											</linear>
											<linear visibility="gone" id="noInternet" w="*" gravity="center_vertical">
												<text textSize="25" textColor="#005B0C" text="连接失败" padding="10"/>
												<linear w="*" paddingRight="20" gravity="right|center_vertical">
													<vertical id="retry" background="@drawable/ripple" gravity="center">
														<img gravity="center" tint="#005B0C"
															 src="@drawable/ic_autorenew_black_48dp"
															 paddingBottom="10"/>
														<text w="*" gravity="center" textSize="15" text="重试"/>
													</vertical>
												</linear>
											</linear>
										</linear>
									</vertical>
									<vertical visibility="gone" id="notice" gravity="center" padding="15 10 15 0">
										<text w="*" gravity="center" textSize="18sp" textColor="#005B0C"
											  textStyle="bold"
											  paddingBottom="5" text="公告"/>
										<vertical background="@drawable/white_background" w="*" padding="10">
											<text w="*" id="noticeTxt" paddingLeft="10"/>
										</vertical>
									</vertical>
									<vertical visibility="gone" id="operation" gravity="center" padding="15 10 15 0">
										<text w="*" gravity="center" textSize="18sp" textColor="#005B0C"
											  textStyle="bold"
											  paddingBottom="5" text="快捷菜单"/>
										<vertical background="@drawable/white_background">
											<linear gravity="center">
												<vertical id="httpStart" background="@drawable/ripple" gravity="center"
														  padding="10">
													<img gravity="center" tint="#005B0C"
														 src="@drawable/ic_touch_app_black_48dp"
														 paddingBottom="10"/>
													<text gravity="center" w="*" textSize="15" text="一键打卡"/>
												</vertical>
												<vertical id="handStart" background="@drawable/ripple" gravity="center"
														  padding="10">
													<img gravity="center" tint="#005B0C"
														 src="@drawable/ic_create_black_48dp"
														 paddingBottom="10"/>
													<text gravity="center" w="*" textSize="15" text="手动打卡"/>
												</vertical>
												<vertical visibility="gone" id="update" background="@drawable/ripple"
														  gravity="center" padding="10">
													<img gravity="center" tint="#005B0C"
														 src="@drawable/ic_system_update_alt_black_48dp"
														 paddingBottom="10"/>
													<text gravity="center" w="*" textSize="15" text="软件更新"/>
												</vertical>
											</linear>
										</vertical>
									</vertical>
									<vertical id="warning" gravity="center" padding="15 10 15 10">
										<text w="*" gravity="center" textSize="18sp" textColor="#005B0C"
											  textStyle="bold"
											  paddingBottom="5" text="提醒"/>
										<vertical background="@drawable/white_background" w="*" padding="10">
											<text w="*" id="warningTxt" paddingLeft="10"/>
										</vertical>
									</vertical>
								</vertical>
							</ScrollView>
						</card>
					</frame>
					<frame id="apps">
						<card layout_gravity="center|top" marginBottom="60" w="*" h="auto" cardElevation="0dp"
							  cardCornerRadius="0dp">
							<vertical bg="#F1F6EB">
								<vertical gravity="center" padding="15 10 15 0">
									<text w="*" gravity="center" textSize="15sp" textColor="#005B0C"
										  textStyle="bold" background="@drawable/white_background" text="应用列表"/>
								</vertical>
								<vertical gravity="center" h="*" padding="15 10 15 0">
									<grid id="app" background="@drawable/white_background" spanCount="3" h="*">
										<vertical background="?selectableItemBackground" gravity="center"
												  padding="10">
											<img gravity="center" tint="#005B0C" src="@drawable/{{icon}}"
												 paddingBottom="10"/>
											<text minLines="2" maxlines="2" ellipsize="end" gravity="center" w="*"
												  textSize="15" text="{{title}}"/>
										</vertical>
									</grid>
								</vertical>
							</vertical>
						</card>
					</frame>
				</viewpager>
			</vertical>
		</vertical>
		<vertical gravity="bottom">
			<tabs-layout data="" layout_gravity="bottom"/>
		</vertical>
	</frame>
);

let changingPoem = false, checking = false, starting = false;
let poemTokenpoemArr = [], poemAuthor = "Minecraft", poemTitle = "虚空";
let startTouchPoemTime;
let checkLoginService = threads.start(checkLogin);
let updateService = threads.start(function () {
	let storage = storages.create("autoQd");
	let notice = storage.get("notice", null);
	let warning = storage.get("warning", null);
	let versions = storage.get("versions", {
		noticeVersion: 0,
		warningVersion: 0
	});

	if (notice) {
		ui.run(function () {
			ui.notice.setVisibility(0);
			ui.noticeTxt.setText(Html.fromHtml(notice));
		});
	} else {
		ui.run(function () {
			ui.notice.setVisibility(8);
		});
	}
	if (warning) {
		ui.run(function () {
			ui.warning.setVisibility(0);
			ui.warningTxt.setText(Html.fromHtml(warning));
		});
	} else {
		ui.run(function () {
			ui.warning.setVisibility(8);
		});
	}

	let versionData = http.get("https://gitee.com/NStudio-Service/autoQd/raw/main/versionData").body.json();
	if (versionData.packVersion > app.versionCode) {
		toast("发现新版本(" + versionData.packVersion + "/" + app.versionCode + ")");
		ui.run(function () {
			ui.update.setVisibility(0);
			animator = ObjectAnimator.ofFloat(ui.update, "alpha", 1, 0.3, 1, 1, 1);
			animator.setRepeatCount(ValueAnimator.INFINITE);
			animator.setRepeatMode(ValueAnimator.RESTART);
			animator.setDuration(2000);
			animator.start();
		});
	}
	if (versionData.noticeVersion > versions.noticeVersion) {
		notice = http.get("https://gitee.com/NStudio-Service/autoQd/raw/main/notice").body.string().replace(/\n/g, "<br>");
		notice = notice.slice(0, notice.lastIndexOf("<br>"));
		versions.noticeVersion = versionData.noticeVersion;
		storage.put("notice", notice);

		if (notice) {
			ui.run(function () {
				ui.notice.setVisibility(0);
				ui.noticeTxt.setText(Html.fromHtml(notice));
			});
		} else {
			ui.run(function () {
				ui.notice.setVisibility(8);
			});
		}
	}
	if (versionData.warningVersion > versions.warningVersion) {
		warning = http.get("https://gitee.com/NStudio-Service/autoQd/raw/main/warning").body.string().replace(/\n/g, "<br>");
		warning = warning.slice(0, warning.lastIndexOf("<br>"));
		versions.warningVersion = versionData.warningVersion;
		storage.put("warning", warning);

		if (warning) {
			ui.run(function () {
				ui.warning.setVisibility(0);
				ui.warningTxt.setText(Html.fromHtml(warning));
			});
		} else {
			ui.run(function () {
				ui.warning.setVisibility(8);
			});
		}
	}
	storage.put("versions", versions);
});
getPoem();

let apps = [
	{icon: "ic_touch_app_black_48dp", title: "一键打卡", id: "QdByHttp"},
	{icon: "ic_create_black_48dp", title: "手动打卡", id: "QdByHand"},
	{icon: "ic_blur_on_black_48dp", title: "健康码展示", id: "ShowQrCode"},
	{icon: "ic_transfer_within_a_station_black_48dp", title: "切换在校状态", id: "ChangeLocationState"},
	{icon: "ic_color_lens_black_48dp", title: "健康码调色", id: "ChangeQrCodeState"}
];
ui.app.setDataSource(apps);
ui.app.on("item_click", function (item) {
	if (starting) {
		toast("请不要频繁启动应用");
		return;
	}
	if (checking) {
		toast("请等待登录状态检查");
		return;
	}
	checking = true;
	threads.start(function () {
		let loginState = checkLogin();
		checking = false;
		if (loginState == false) {
			toast("您未登录，请先登录");
			return;
		}
		if (loginState == null) {
			return;
		}
		starting = true;
		switch (item.id) {
			case "QdByHttp":
				engines.execScriptFile("apps/QdByHttp.js");
				break;
			case "QdByHand":
				engines.execScriptFile("apps/QdByHand.js");
				break;
			case "ChangeLocationState":
				engines.execScriptFile("apps/ChangeLocationState.js");
				break;
			case "ChangeQrCodeState":
				engines.execScriptFile("apps/ChangeQrCodeState.js");
				break;
			case "ShowQrCode":
				engines.execScriptFile("apps/ShowQrCode.js");
				break;
			default:
				toast("该应用未定义");
		}
		sleep(1000);
		starting = false;
	});
});
ui.tabs.setupWithViewPager(ui.viewpager);
ui.viewpager.setOnPageChangeListener({
	onPageSelected: function (index) {
		tabs_view[selectView]._src.attr("tint", tabs_data.selectColor.off);
		tabs_view[selectView]._text.setTextColor(colors.parseColor(tabs_data.selectColor.off));
		tabs_view[index]._src.attr("tint", tabs_data.selectColor.on);
		tabs_view[index]._text.setTextColor(colors.parseColor(tabs_data.selectColor.on));
		selectView = index;
	}
});
ui.poem.setOnTouchListener({
	onTouch: function (v, event) {
		if (event.getAction() == MotionEvent.ACTION_DOWN) {
			startTouchPoemTime = new Date().getTime();
		}
		if (event.getAction() == MotionEvent.ACTION_UP) {
			if (new Date().getTime() - startTouchPoemTime < 400) {
				clickPoemAnimation(ui.poem);
				if (!changingPoem) {
					changingPoem = true;
					getPoem();
				}
			}
		}
		return false;
	}
});
ui.poem.on("long_click", () => {
	toast("出自" + poemAuthor + "的《" + poemTitle + "》");
});
ui.login.on("click", () => {
	if (starting) {
		toast("请不要频繁启动应用");
		return;
	}
	if (checking) {
		toast("请等待登录状态检查");
		return;
	}
	checking = true;
	threads.start(function () {
		let loginState = checkLogin();
		checking = false;
		if (loginState) {
			toast("您已登录，如需切换账号请先注销");
		}
		if (loginState != false) {
			return;
		}
		starting = true;
		engines.execScriptFile("apps/Login.js");
		sleep(1000);
		starting = false;
	});
});
ui.retry.on("click", () => {
	ui.logining.setVisibility(0);
	ui.noInternet.setVisibility(8);
	threads.start(function () {
		checkLogin();
	});
});
ui.httpStart.on("click", () => {
	if (starting) {
		toast("请不要频繁启动应用");
		return;
	}
	if (checking) {
		toast("请等待登录状态检查");
		return;
	}
	checking = true;
	threads.start(function () {
		let loginState = checkLogin();
		checking = false;
		if (loginState == false) {
			toast("您未登录，请先登录");
			return;
		}
		if (loginState == null) {
			return;
		}
		starting = true;
		engines.execScriptFile("apps/QdByHttp.js");
		sleep(1000);
		starting = false;
	});
});
ui.handStart.on("click", () => {
	if (starting) {
		toast("请不要频繁启动应用");
		return;
	}
	if (checking) {
		toast("请等待登录状态检查");
		return;
	}
	checking = true;
	threads.start(function () {
		let loginState = checkLogin();
		checking = false;
		if (loginState == false) {
			toast("您未登录，请先登录");
			return;
		}
		if (loginState == null) {
			return;
		}
		starting = true;
		engines.execScriptFile("apps/QdByHand.js");
		sleep(1000);
		starting = false;
	});
});
ui.update.on("click", () => {
	if (starting) {
		toast("请不要频繁启动应用");
		return;
	}
	if (checking) {
		toast("请等待登录状态检查");
		return;
	}
	starting = true;
	threads.start(function () {
		engines.execScriptFile("apps/UpdatePack.js");
		sleep(1000);
		starting = false;
	});
});
ui.logout.on("click", () => {
	let cookieManager = CookieManager.getInstance();
	cookieManager.removeAllCookie();
	checkLogin();
});
