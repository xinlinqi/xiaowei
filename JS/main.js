/**
 * @author xinlinqi
 */

var commenturi = '/comments/show.json', statusuri = '/statuses/show.json', queryiduri = '/statuses/queryid.json', reposturi = '/statuses/repost_timeline.json';

var comment_count, repost_count, countPerPage = 10, cPageNumber = 1, rPageNumber = 1, gPageNumber = 1, lastGenPage = 0;
var wid;

var nIntervalId;

$(function(){
	// $("#w-container").hide();
	$("#s_btn").click(function(){
		var isLogin = WB2.checkLogin();
		if(isLogin){
			$("#w-container").show();
			var mid = $("#mid").val();
			WB2.anyWhere(function(W){
			    //数据交互
			    W.parseCMD(queryiduri, function(oResult, bStatus) {
			        if(bStatus) {
			        	init();
			        	$("#weibo-content .dynamic").html("");
			            wid = oResult.id;
						getWeiboInfo(wid);
						getWeiboComments(wid, cPageNumber);
						// getWeiboReposts(wid, rPageNumber, countPerPage);
						generateExportInfo(wid);
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
	$("#comment").on("click", "button", function(){
		var totalPages = Math.floor((comment_count == 0)?1:(comment_count-1)/countPerPage + 1);
		var nPageNumber = cPageNumber;
		if($(this).hasClass("previous") && cPageNumber > 1){
			nPageNumber = cPageNumber - 1;
		}else if($(this).hasClass("next") && cPageNumber < totalPages){
			nPageNumber = cPageNumber + 1;
		}
		getWeiboComments(wid, nPageNumber);
		cPageNumber = nPageNumber;
	});
	
	$("#repost").on("click", "button", function(){
		var totalPages = Math.floor((repost_count == 0)?1:(repost_count-1)/countPerPage + 1);
		var nPageNumber = rPageNumber;
		if($(this).hasClass("previous") && rPageNumber > 1){
			nPageNumber = rPageNumber - 1;
		}else if($(this).hasClass("next") && rPageNumber < totalPages){
			nPageNumber = rPageNumber + 1;
		}
		getWeiboReposts(wid, nPageNumber, countPerPage);
		rPageNumber = nPageNumber;		
	});
});

function init(){
	comment_count = 1;
	repost_count = 1;
	cPageNumber = 1;
	rPageNumber = 1;
	lastGenPage = 0;
	gPageNumber = 1;
}

function getWeiboInfo(wid){
	WB2.anyWhere(function(W){
	    W.parseCMD(statusuri, function(oResult, bStatus) {
	        if(bStatus) {
	        	console.log(oResult);
	        	$("#profile").append(genWeiboInfoDOM(oResult));
	        	if(!oResult.retweeted_status){
	        		$(".retweeted").hide();
	        	}
	        	if(oResult.pic_urls){
	        		for(var i=0; i < oResult.pic_urls.length; i++){
	        			$("#weibo_pics").append("<a class='span2' target='_blank' href='" + oResult.pic_urls[i].thumbnail_pic.replace("thumbnail", "large") + "'>" + "<img src='" + oResult.pic_urls[i].thumbnail_pic + "' />" + "</a>");
	        		}
	        	}
	        	comment_count = oResult.comments_count;
	        	repost_count = oResult.reposts_count;
	        	$("#comment-title").html("评论列表(" + comment_count + ")");
	        	$("#repost-title").html("转发列表(" + oResult.reposts_count + ")");
	        	
	        }else{
	        	console.log("no weibo Found");
	        }
	    }, {
	        id : wid
	    }, {
	        method : 'get',
	        cache_time : 30
	    });
	});
}

function genWeiboInfoDOM(weibo){
	var tpl = $("#profile-tpl").html();
	var user = weibo.user;
	tpl = tpl.replace("{profile_image_url}", user.avatar_large).replace("{follower_count}", user.followers_count).replace("{friends_count}", user.friends_count).replace("{statuses_count}", user.statuses_count).replace("{screen_name}", user.screen_name).replace("{description}", user.description);
	tpl = tpl.replace("{text}", weibo.text)
	.replace("{retweeted-text}", weibo.retweeted_status?weibo.retweeted_status.text:"").replace("{retweeter}", weibo.retweeted_status?weibo.retweeted_status.user.name:"");
	return tpl;
}

function getWeiboComments(wid, page){
	WB2.anyWhere(function(W){
	    //数据交互
	    W.parseCMD(commenturi, function(oResult, bStatus) {
	        if(bStatus) {
	           addWeiboComment(oResult.comments);
	           $("#comment .pager span").html(cPageNumber);
	        }else{
	        	console.log("no weibo Found");
	        }
	    }, {
	        id : wid,
	        count: countPerPage,
	        page: page
	    }, {
	        method : 'get',
	        cache_time : 30
	    });
	});
}

function addWeiboComment(comments){
	$("#comment").html("");
	var comment_body = $("#comment-tpl").html();
	var comment_content = "";
	for(var i=0; i < comments.length; i++){
		var tpl = $("#comment-item-tpl").html();
		tpl = tpl.replace("{comment-content}", comments[i].text).replace("{commenter}", comments[i].user.screen_name);
		comment_content = comment_content.concat(tpl);
	}
	comment_body = comment_body.replace("{content}", comment_content);
	$("#comment").append(comment_body);
}

function getWeiboReposts(wid, page, count){
	WB2.anyWhere(function(W){
	    W.parseCMD(reposturi, function(oResult, bStatus) {
	        if(bStatus) {
	           addWeiboRepost(oResult.reposts);
	           console.log(oResult.reposts);
	           $("#repost .pager span").html(rPageNumber);
	        }else{
	        	console.log("no weibo Found");
	        }
	    }, {
	        id : wid,
	        count: count,
	        page: page
	    }, {
	        method : 'get',
	        cache_time : 30
	    });
	});	
}

function addWeiboRepost(reposts){
	var comment_body = $("#comment-tpl").html();
	comment_body = comment_body.replace("{comment_count}", comment_count);
	var comment_content = "";
	for(var i=0; i < reposts.length; i++){
		var tpl = $("#repost-item-tpl").html();
		tpl = tpl.replace("{repost-content}", reposts[i].text).replace("{reposter}", reposts[i].user.screen_name);
		comment_content = comment_content.concat(tpl);
	}
	comment_body = comment_body.replace("{content}", comment_content);
	$("#repost").html(comment_body);
}

function generateExportInfo(wid){
	$("#repost").html("");
	var totalPages = Math.floor((repost_count == 0)?1:(repost_count-1)/200 + 1);
	var lastPage = 0;
	if(totalPages != 0){
		nIntervalId = setInterval(generateReposts, 1000);
	}
}

function generateReposts(){
	WB2.anyWhere(function(W){
		if(lastGenPage != gPageNumber){
		    W.parseCMD(reposturi, function(oResult, bStatus) {
		        if(bStatus) {
		        	var totalPages = Math.floor((repost_count == 0)?1:(repost_count-1)/200 + 1);
		        		//console.log(oResult.reposts);
	        		var comment_content = "";
	        		var reposts = oResult.reposts;
					for(var i=0; i < reposts.length; i++){
						var tpl = $("#repost-item-tpl").html();
						tpl = tpl.replace("{repost-content}", reposts[i].text).replace("{reposter}", reposts[i].user.screen_name).replace("{repost-date}", format_time(reposts[i].created_at));
						comment_content = comment_content.concat(tpl);
					}
					$("#repost").append(comment_content);
	        		gPageNumber++;
					if(gPageNumber > totalPages){
						clearInterval(nIntervalId);
					}
		        }else{
		        	console.log("no weibo Found");
		        }
		    },{
		        id : wid,
		        count: 200,
		        page: gPageNumber
		    }, {
		        method : 'get',
		        cache_time : 30
		    });
		    lastGenPage++;
	    }else{
	    	console.log("Waiting for Response");
	    }
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
