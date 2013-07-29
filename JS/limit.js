/**
 * @author xinlinqi
 */

var limit_url = "/account/rate_limit_status.json";
var limit_count = 0;

function fetchInfo(){
	setInterval(fetchLimit, 500);
	$("#export-info").html(level);
}

function fetchLimit(){
	WB2.anyWhere(function(W){
	    W.parseCMD(limit_url, function(oResult, bStatus) {
	        if(bStatus) {
	        	limit_count =  oResult.remaining_user_hits;
	        	$("#limits").html("剩余调用次数：" + limit_count + '，剩余重置秒数: ' + oResult.reset_time_in_seconds);
	        }
	    }
	    ,{}, {
	        method : 'get',
	        cache_time : 30
		});
	});
}

function format_time(t) {
	var date = new Date(t);
	var y = date.getFullYear();
	var mo = date.getMonth() + 1;
	var d = date.getDate();
	var h = date.getHours();
	var mi = date.getMinutes();
	var timeFormat = "{y}-{M}-{d} {h}:{m}";
	return timeFormat.replace("{y}", y).replace("{M}", (mo<=9)?'0'+mo:mo).replace("{d}", (d <= 9)?'0'+d:d).replace("{h}", (h<=9)?'0'+h:h).replace("{m}", (mi<=9)?'0'+mi:mi );
}
