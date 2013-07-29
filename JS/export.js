/**
 * @author xinlinqi
 */

var statusuri = '/statuses/show.json', queryiduri = '/statuses/queryid.json', reposturi = '/statuses/repost_timeline.json', counturi = '/statuses/count.json';

var level = 0;

var nIntervalId, lastGenPage = 0, rPageNumber = 1, gPageNumber = 1, weibos = {}, reposted = [];

$(function(){
	// $("#w-container").hide();
	doSomeInit();
	fetchInfo();
	$("#s_btn").click(function(){
		var isLogin = WB2.checkLogin();
		$(".table").show();
		reset();
		if(isLogin){
			$("#w-container").show();
			//$(".table tbody").html("");
			var mid = $("#mid").val();
			WB2.anyWhere(function(W){
			    W.parseCMD(queryiduri, function(oResult, bStatus) {
			        if(bStatus) {
			            var wid = oResult.id;
						exportWeiboInfo(wid);
						// getWeiboReposts(wid, rPageNumber, countPerPage);
						console.log(oResult);
			        }else{
			        	alert("no weibo found");
			        }
			    }, {
			        mid : mid, 
			        type: 1,
			        isBase62: 1
			    }, {
			        method : 'get',
			        cache_time : 30
			    });
			});
		}else{
			$("#w-container").html('<wb:login-button type="1,2" ></wb:login-button>');
		}
	});
	
	$("#partial-btn").click(function(){
		$("td.w-content").each(function(){
			$(this).html($(this).attr("w-content").substr(0, 10) + "...");
		});
	});
	$("#all-btn").click(function(){
		$("td.w-content").each(function(){
			$(this).html($(this).attr("w-content"));
		});
	});
	
	$("#continue-btn").click(function(){
		exportReposts();
        var btn = $(this);
        btn.button('loading');
        setTimeout(function () {
          btn.button('reset')
        }, 2000);
	});
	
		
});

function doSomeInit(){
	var isLogin = WB2.checkLogin();
	if (isLogin){
		$(".login").hide();
		$(".wrapper").show();
	}else{
		$(".login").show();
		$(".wrapper").hide();		
	}
}

function showLoginPanel(){
	$(".login").show();
	$(".wrapper").hide();	
}

function hideLoginPanel(){
	$(".login").hide();
	$(".wrapper").show();	
}

function exportWeiboInfo(wid){
	WB2.anyWhere(function(W){
	    W.parseCMD(statusuri, function(oResult, bStatus) {
	        if(bStatus) {
	        	var content = getTableRowContent(level, oResult);
	        	$(".table tbody").append(content);
	        	exportReposts();
	        }else{
	        	alert("no weibo Found");
	        }
	    }, {
	        id : wid
	    }, {
	        method : 'get',
	        cache_time : 30
	    });
	});
}

function exportReposts(){
	var mlevel = level + 1;
	$(".level_" + level).each(function(){
		if (!$(this).hasClass("success")){
			if($(this).attr("rcount") && $(this).attr("rcount") > 0){
    			generateReposts(mlevel, $(this));
			}
			$(this).addClass("success");
		}
	});
	var level_end = true;
	$(".level_" + level).each(function(){
		if(!$(this).hasClass("success")){
			level_end = false;
		}
	});
	if ($(".level_" + level).length != 0 && level_end){
		$("#export-info").html(++level);
	}
}

function generateReposts(mlevel, trdom){
	var wid = trdom.attr("wid"), reposts_count = trdom.attr("rcount");
	var totalPages = Math.floor((reposts_count == 0)?1:(reposts_count-1)/200 + 1);
	var s_page = 0, e_page = 0;
	$(".progress").show();
	for (var page = 1; page <= totalPages; page++){
		WB2.anyWhere(function(W){
		    W.parseCMD(reposturi, function(oResult, bStatus) {
		        if(bStatus) {
	        		var repost_content = "";
	        		var reposts = oResult.reposts;
					for(var i=0; i < reposts.length; i++){
						var repostId = reposts[i].id;
						if(mlevel == 1){
							reposted.push(repostId);
						}else{
							if($.inArray(repostId, reposted) != -1){
								$("#wei_" + repostId).remove();
							}
						}
						repost_content += getTableRowContent(mlevel, reposts[i], wid);
					}
					$(".table tbody").append(repost_content);
					s_page++;
					console.log("Repost Length: "+reposts.length);
		        }else{
		        	e_page++;
		        }
				$(".bar-success").css("width", s_page/totalPages * 100 + "%");
				$(".bar-danger").css("width", e_page/totalPages * 100 + "%");
		    },{
		        id : wid,
		        count: 200,
		        page: page
		    }, {
		        method : 'get',
		        cache_time : 30
		    });
		});
		setTimeout(function(){
			console.log("waiting....");
		}, 2000);

	}

}

function getTableRowContent(level, weibo, parent_id){
	var export_tpl = $("#export-tr").html();
	var user = weibo.user;
	var repost_list = "";
	export_tpl = export_tpl.replace(/{id}/g, weibo.id)
							.replace(/{level}/g, level)
							.replace("{friends_count}", user.friends_count)
							.replace("{followers_count}", user.followers_count)
							.replace("{statuses_count}", user.statuses_count)
							.replace(/{text}/g, weibo.text)
							.replace("{min-text}", weibo.text.substr(0, 10)+"...")
							.replace("{comments_count}", weibo.comments_count)
   							.replace("{screen_name}", user.screen_name)
							.replace("{attitudes_count}", weibo.attitudes_count)
							.replace(/{reposts_count}/g, weibo.reposts_count)
							.replace("{created_at}", format_time(weibo.created_at))
							.replace("{parent_id}", (parent_id)?parent_id:0);
	return export_tpl;
}

function reset(){
	level = 0;
	$(".table tbody").html("");
	reposted = [];
	$(".bar-success").css("width", 0);
	$(".bar-danger").css("width", 0);
}