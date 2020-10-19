"ui";
importClass(android.content.Intent);
importClass(android.net.Uri);
importClass(android.webkit.DownloadListener);
ui.statusBarColor("#fff5e9");
activity.getWindow().getDecorView().setSystemUiVisibility(android.view.View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);

ui.layout(
	<vertical>
		<webview id="web" h="*"/>
	</vertical>
)
try {
	ui.web.getSettings().setJavaScriptEnabled(true);
	ui.web.loadUrl(http.get("https://gitee.com/NStudio-Service/autoQd/raw/main/downloadAppLink").body.string());
} catch (e) {
	toast("获取更新链接失败");
	exit();
}
ui.web.setDownloadListener({
	onDownloadStart: function (url, userAgent, contentDisposition, mimetype, contentLength) {
		let intent = new Intent();
		intent.setAction(Intent.ACTION_VIEW);
		intent.addCategory(Intent.CATEGORY_BROWSABLE);
		intent.setData(Uri.parse(url));
		app.startActivity(intent);
		exit();
	}
});