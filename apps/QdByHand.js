"ui";
ui.statusBarColor("#FFFFFF");
activity.getWindow().getDecorView().setSystemUiVisibility(android.view.View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);

ui.layout(
	<vertical>
		<webview id="web" h="*"/>
	</vertical>
)
ui.web.getSettings().setJavaScriptEnabled(true);
ui.web.loadUrl("http://ijg.xujc.com/app/229");