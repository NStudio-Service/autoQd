"ui";
importClass(android.webkit.CookieManager);

ui.statusBarColor("#FFFFFF");
activity.getWindow().getDecorView().setSystemUiVisibility(android.view.View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);

ui.layout(
	<vertical>
		<webview id="web" h="*"/>
	</vertical>
)
ui.web.getSettings().setJavaScriptEnabled(true);
ui.web.loadUrl("http://ijg.xujc.com/login");

threads.start(function () {
	let stay = true;
	while (stay) {
		try {
			let cookieManager = CookieManager.getInstance();
			let cookie = cookieManager.getCookie("ijg.xujc.com");
			if (!cookie) {
				cookie = "";
			}
			if (cookie.indexOf("SAAS_U") !== -1 && cookie.indexOf("SAAS_S_ID") !== -1) {
				toast("登录成功");
				events.broadcast.emit("loginRes");
				stay = false;
				exit();
			}
		} catch (e) {
		}
	}
});