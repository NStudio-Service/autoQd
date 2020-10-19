"ui";
importClass(android.text.Html);
importClass(java.io.ByteArrayInputStream);
importClass(java.util.zip.GZIPInputStream);
importClass(java.util.zip.GZIPOutputStream);
importClass(java.io.ByteArrayOutputStream);
importClass(android.webkit.CookieManager);

let startTime = new Date().getTime(), finishTime;
let cookieManager = CookieManager.getInstance();
let cookie = cookieManager.getCookie("ijg.xujc.com");

function byte2arr(bytes) {
	let ori = [];
	bytes.forEach(function (value) {
		ori.push(value);
	});
	return ori;
}

function byte2string(bytes) {
	let str = "";
	for (let pos = 0; pos < bytes.length;) {
		let flag = bytes[pos];
		let unicode = 0;
		if ((flag >>> 7) === 0) {
			str += String.fromCharCode(bytes[pos]);
			pos += 1;

		} else if ((flag & 0xFC) === 0xFC) {
			unicode = (bytes[pos] & 0x3) << 30;
			unicode |= (bytes[pos + 1] & 0x3F) << 24;
			unicode |= (bytes[pos + 2] & 0x3F) << 18;
			unicode |= (bytes[pos + 3] & 0x3F) << 12;
			unicode |= (bytes[pos + 4] & 0x3F) << 6;
			unicode |= (bytes[pos + 5] & 0x3F);
			str += String.fromCharCode(unicode);
			pos += 6;

		} else if ((flag & 0xF8) === 0xF8) {
			unicode = (bytes[pos] & 0x7) << 24;
			unicode |= (bytes[pos + 1] & 0x3F) << 18;
			unicode |= (bytes[pos + 2] & 0x3F) << 12;
			unicode |= (bytes[pos + 3] & 0x3F) << 6;
			unicode |= (bytes[pos + 4] & 0x3F);
			str += String.fromCharCode(unicode);
			pos += 5;

		} else if ((flag & 0xF0) === 0xF0) {
			unicode = (bytes[pos] & 0xF) << 18;
			unicode |= (bytes[pos + 1] & 0x3F) << 12;
			unicode |= (bytes[pos + 2] & 0x3F) << 6;
			unicode |= (bytes[pos + 3] & 0x3F);
			str += String.fromCharCode(unicode);
			pos += 4;

		} else if ((flag & 0xE0) === 0xE0) {
			unicode = (bytes[pos] & 0x1F) << 12;
			unicode |= (bytes[pos + 1] & 0x3F) << 6;
			unicode |= (bytes[pos + 2] & 0x3F);
			str += String.fromCharCode(unicode);
			pos += 3;

		} else if ((flag & 0xC0) === 0xC0) { //110
			unicode = (bytes[pos] & 0x3F) << 6;
			unicode |= (bytes[pos + 1] & 0x3F);
			str += String.fromCharCode(unicode);
			pos += 2;

		} else {
			str += String.fromCharCode(bytes[pos]);
			pos += 1;
		}
	}
	return str;
}

function getFormJson(code) {
	return http.get("http://ijg.xujc.com/api/formEngine/business/" + code + "/myFormInstance", {
		headers: {
			"Host": "ijg.xujc.com",
			"Cookie": cookie
		}
	}).body.json();
}

function getAppNowJson(code) {
	return http.get("http://ijg.xujc.com/api/app/" + code + "/business/now", {
		headers: {
			"Host": "ijg.xujc.com",
			"Cookie": cookie
		}
	}).body.json();
}

function getAppJson(code) {
	return http.get("http://ijg.xujc.com/api/app/" + code + "", {
		headers: {
			"Host": "ijg.xujc.com",
			"Cookie": cookie
		}
	}).body.json();
}

function setFormData(id, location) {
	let json = [{
		name: "select_1594218144996",
		value: {
			stringValue: location
		}
	}];
	let gzipTxt = http.postJson("http://ijg.xujc.com/api/formEngine/formInstance/" + id, {
		formData: json,
		playerId: "player_1594218703852"
	}, {
		headers: {
			"Cookie": cookie,
			"Host": "ijg.xujc.com",
			"Content-Length": JSON.stringify(json).length,
			"Accept": "*/*",
			"X-Requested-With": "XMLHttpRequest",
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36",
			"Content-Type": "application/json",
			"Origin": "http://ijg.xujc.com",
			"Referer": "http://ijg.xujc.com/app/229",
			"Accept-Encoding": "gzip, deflate",
			"Accept-Language": "zh-CN,zh;q=0.9,en-CN;q=0.8,en;q=0.7"
		}
	}).body.bytes();
	out = new ByteArrayOutputStream();
	input = new ByteArrayInputStream(gzipTxt);
	ungzip = new GZIPInputStream(input);
	let buffer = util.java.array('byte', 256);
	let n = ungzip.read(buffer);
	while (n >= 0) {
		out.write(buffer, 0, n);
		n = ungzip.read(buffer);
	}
	return byte2string(byte2arr(out.toByteArray()));
}

function getValue(value) {
	switch (value.dataType) {
		case "INTEGER":
		case "INTEGER_VALUE":
			if (value.integerValue) {
				return value.integerValue.toString();
			} else {
				return "";
			}
		case "FLOAT":
		case "FLOAT_VALUE":
			if (value.floatValue) {
				return value.floatValue.toString();
			} else {
				return "";
			}
		case "STRING":
		case "STRING_VALUE":
			if (value.stringValue) {
				return value.stringValue;
			} else {
				return "";
			}
		case "ADDRESS":
		case "ADDRESS_VALUE":
			if (value.addressValue.fullValue) {
				return value.addressValue.fullValue;
			} else {
				return "";
			}
		case "TABLE_DATA":
			if (value.tableValue[0]) {
				let wholeTxt = "";
				value.tableValue.forEach(function (tableLine) {
					let lineTxt = "";
					tableLine.forEach(function (lineItem) {
						lineTxt += lineItem.title;
						lineTxt += getValue(lineItem.value);
					});
					wholeTxt += "\n" + lineTxt;
				});
				return wholeTxt.slice(3);
			} else {
				return "";
			}
		default:
			return "此类型暂不受支持(" + value.dataType + ")";
	}
}

events.broadcast.on("httpRes", function (res) {
	if (res.state) {
		ui.run(function () {
			ui.loading1.setVisibility(8);
			ui.httpRes.setVisibility(0);

			ui.stateTxt.setText("完成");
			ui.startTimeTxt.setText(res.startTime.toString());
			ui.useTimeTxt.setText(res.useTime.toString());
			if (res.editable) {
				ui.formEditableTxt.setText("可编辑");
			} else {
				ui.formEditableTxt.setText("已锁定");
			}
			ui.locationTxt.setText(res.nowLocation);
		});
	} else {
		ui.run(function () {
			ui.loading1.setVisibility(8);
			ui.httpRes.setVisibility(0);

			ui.stateTxt.setText("错误(code: " + res.code + ",error: " + res.error + ")");
			ui.startTimeTxt.setText(res.startTime.toString());
			ui.useTimeTxt.setText(res.useTime.toString());

			ui.formEditableTxt.setText("");
			ui.locationTxt.setText("");
		});
	}
	toast("切换结果已更新");
});
threads.start(function () {
//229是健康打卡的id
	let appNowJson, formCode;
//获得now数据
	try {
		appNowJson = getAppNowJson(229);
		formCode = appNowJson["data"][0]["business"]["id"];
	} catch (e) {
		finishTime = new Date().getTime();
		events.broadcast.emit("httpRes", {
			state: false,
			startTime: new Date(startTime),
			useTime: (finishTime - startTime) / 1000 + "秒",
			code: 0,
			error: e
		});
		return;
	}
	let formJson, formId, formData, location, newLocation, formEditable, editData = [];
//获得表单数据
	try {
		formJson = getFormJson(formCode);
		formId = formJson["data"]["id"];
		formData = formJson["data"]["formData"];
		formData.forEach(function (item) {
			if (item.title === "在校状态（可联系辅导员修改）") {
				location = item.value.stringValue
			}
		});
		if (location === "校内") {
			newLocation = "校外";
		} else {
			newLocation = "校内";
		}
		formEditable = formJson["data"]["editable"];
	} catch (e) {
		finishTime = new Date().getTime();
		events.broadcast.emit("httpRes", {
			state: false,
			startTime: new Date(startTime),
			useTime: (finishTime - startTime) / 1000 + "秒",
			code: 1,
			error: e
		});
		return;
	}
	ui.run(function () {
		let warning = ui.inflate(
			<vertical paddingTop="250dip" paddingLeft="30dip" paddingRight="30dip">
				<vertical background="@drawable/popup_background">
					<text padding="15" text="你将以“学工部”的身份修改在校状态，继续吗？"/>
					<linear gravity="center">
						<button style="Widget.AppCompat.Button.Borderless.Colored" id="go" textColor="@color/button"
								text="继续"/>
						<button style="Widget.AppCompat.Button.Borderless.Colored" id="no" textColor="@color/button"
								text="取消"/>
					</linear>
				</vertical>
			</vertical>, ui.toolbar, false
		);
		warningPop = new android.widget.PopupWindow(warning, device.width, android.view.ViewGroup.LayoutParams.WRAP_CONTENT);
		warningPop.setOutsideTouchable(false);
		warningPop.setFocusable(false);
		warningPop.showAsDropDown(ui.toolbar);
		warning.go.on("click", () => {
			warningPop.dismiss();
			threads.start(function () {
				//发送并返回数据
				try {
					let finalRes = JSON.parse(setFormData(formId, newLocation)), nowLocation;
					finalRes.data.formData.forEach(function (item) {
						if (item.title === "在校状态（可联系辅导员修改）") {
							nowLocation = item.value.stringValue
						}
					});
					finishTime = new Date().getTime();
					events.broadcast.emit("httpRes", {
						state: true,
						startTime: new Date(startTime).toLocaleString(),
						useTime: (finishTime - startTime) / 1000 + "秒",
						nowLocation: nowLocation,
						editable: formEditable,
						finalRes: finalRes
					});
				} catch (e) {
					finishTime = new Date().getTime();
					events.broadcast.emit("httpRes", {
						state: false,
						startTime: new Date(startTime),
						useTime: (finishTime - startTime) / 1000 + "秒",
						code: 2,
						error: e
					});
				}
			});
		});
		warning.no.on("click", () => {
			warningPop.dismiss();
			finishTime = new Date().getTime();
			events.broadcast.emit("httpRes", {
				state: false,
				startTime: new Date(startTime),
				useTime: (finishTime - startTime) / 1000 + "秒",
				code: 3,
				error: "操作被取消"
			});
		});
	});
});

engines.all().forEach(function (value) {
	if (value.getTag("isMain")) {
		engines.myEngine().getTag("execution.config").projectConfig = value.getTag("execution.config").projectConfig;
	}
});
ui.useAndroidResources();
ui.layout(
	<frame>
		<vertical fitsSystemWindows="true">
			<appbar w="*">
				<linear w="*" gravity="bottom">
					<toolbar id="toolbar" title="健康打卡" subtitle="切换在校状态"/>
					<linear w="*" gravity="right|center_vertical">
						<ImageButton scaleType="centerCrop" w="50" h="50" style="Widget.AppCompat.Button.Borderless"
									 marginRight="10" tint="white" id="back" src="@drawable/ic_close_black_48dp"/>
					</linear>
				</linear>
			</appbar>
			<vertical h="*" bg="#F1F6EB">
				<ScrollView clickable="true" scrollbars="vertical" fadingEdge="vertical">
					<vertical>
						<vertical id="introduction" gravity="center" padding="15 10 15 0">
							<text w="*" gravity="center" textSize="18sp" textColor="#005B0C"
								  textStyle="bold"
								  paddingBottom="5" text="简介"/>
							<vertical background="@drawable/white_background" w="*" padding="10">
								<text w="*" id="introductionTxt" paddingLeft="10"/>
							</vertical>
						</vertical>
						<vertical gravity="center" padding="15 10 15 0">
							<text w="*" gravity="center" textSize="18sp" textColor="#005B0C" textStyle="bold"
								  paddingBottom="5" text="切换结果"/>
							<vertical id="loading1" background="@drawable/white_background"
									  gravity="center_vertical">
								<ProgressBar layout_centerInParent="true" indeterminateTintMode="src_atop"
											 indeterminateTint="#005B0C"/>
							</vertical>
							<vertical visibility="gone" id="httpRes" background="@drawable/white_background"
									  gravity="center_vertical">
								<vertical id="state" w="*" padding="5">
									<text w="*" paddingLeft="10" text="执行结果"/>
									<input inputType="none" hint="未知" id="stateTxt" w="*"/>
								</vertical>
								<vertical id="startTime" w="*" padding="5">
									<text w="*" paddingLeft="10" text="操作时间"/>
									<input inputType="none" hint="未知" id="startTimeTxt" w="*"/>
								</vertical>
								<vertical id="useTime" w="*" padding="5">
									<text w="*" paddingLeft="10" text="耗时"/>
									<input inputType="none" hint="未知" id="useTimeTxt" w="*"/>
								</vertical>
								<vertical id="formEditable" w="*" padding="5">
									<text w="*" paddingLeft="10" text="表单状态"/>
									<input inputType="none" hint="未知" id="formEditableTxt" w="*"/>
								</vertical>
								<vertical id="location" w="*" padding="5">
									<text w="*" paddingLeft="10" text="在校状态"/>
									<input inputType="none" hint="未知" id="locationTxt" w="*"/>
								</vertical>
							</vertical>
						</vertical>
					</vertical>
				</ScrollView>
			</vertical>
		</vertical>
	</frame>
);
ui.introductionTxt.setText(Html.fromHtml(
	"修改表单中不可编辑的在校状态。<br>" +
	"<font color=\"#FF0000\">警告：该应用为<b>实验性应用</b>，仅供<b>学习</b>和<b>技术交流</b>，可能<b>无效</b>或造成<b>意料之外的后果</b>，请谨慎使用！因此功能产生的任何问题，NXY666<b>概不负责</b>！</font>"
));

ui.back.on("click", () => {
	exit();
});

/*
{
    "formData": [{
    "name": "select_1594218204519",
    "value": {
        "stringValue": "未打卡"
    },
    "hide": false,
    "readonly": false
}],
    "playerId": "owner"
}
{"data":[{"playerId":"owner","playerName":"学生","startDate":null,"endDate":"2020-10-16 22:12:06"},{"playerId":"player_1594218577392","playerName":"辅导员","startDate":null,"endDate":null},{"playerId":"player_1594218615379","playerName":"院系","startDate":null,"endDate":null},{"playerId":"player_1594218703852","playerName":"学工部","startDate":null,"endDate":null},{"playerId":"player_1600596769404","playerName":"班委","startDate":null,"endDate":null}],"state":true}
*/