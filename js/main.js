var currentpage=1;	
var apiurl="http://cnodejs.org/api/v1/topics/?";
var currenttaburl=apiurl;
$().ready(function(){
	/*启动轮播图*/
	$('#carousel').carousel({
		interval: 3000
	});
	/*加载首页数据*/
	loading();
	getIndexPage(apiurl,currentpage);
	getPageNum(currentpage);
		/*监听分页信息，且改变页面话题*/	
		$(document).on('click',".pagination li a",function(){
			
			var activepage;
//			$(this).parent().addClass("active").addClass("active").siblings().removeClass("active");
			var nowpage=Number.parseInt($(this).attr("data-page"));
			if(!($(this).is(".prevpage")||$(this).is(".nextpage"))){
				var currp=$(this).parent().next().children()[0].innerHTML;
				var currn=$(this).parent().prev().children()[0].innerHTML;
				currentpage=nowpage;
				if(currp=="..."){
					activepage=$(this).html();
					getPageNum(nowpage-1)
				}
				else if(typeof currn=="string"&&nowpage>1){
					activepage=$(this).html();
					getPageNum(nowpage-1);
				}
			}else if($(this).is(".prevpage")){
				if (currentpage>1) {
					currentpage=currentpage-1;
					getPageNum(currentpage);
				}
				event.stopPropagation();
			}else if($(this).is(".nextpage")){
				currentpage=currentpage+1;
				getPageNum(currentpage);
			}
			loading();
			slider();
			getIndexPage(currenttaburl,currentpage);
			for(var i=0;i<8;i++){
				var ap=$(".pagination").children(':eq('+i+')').children().html();
				if(ap==activepage){
					$(".pagination").children(':eq('+i+')').addClass("active").siblings().remove("active");
				}
			}
		});
		/*话题分类监听*/
		$(".topic").children().bind("click",function(){
			getTab($(this));
			$(this).addClass("current_tab").siblings(".current_tab").removeClass("current_tab");
		});
		/*窗口滚动监听*/
		$(window).scroll(function(){
			var nheight=$(window).scrollTop();
			if($(window).width()>770){
				if (nheight>200) {
					$("#toTop").fadeIn(500);
				}else{
					$("#toTop").fadeOut(500);
				}
			}
		});
		/*返回顶部监听*/
		$("#toTop").bind("click",slider);
		var i = 0;
		//手机端双击导航，返回顶部，双击事件的监听
		if($(window).width()<770){
			$("#navbar_header").bind("click",function(){
	      		i++;
	        	setTimeout(function () {
	            	i = 0;
	        	}, 500);
	        	if (i > 1) {
	            	slider();
	            	i = 0;
	        	}
    		});
		}
		//调整窗口大小时触发
		$(window).resize(function(){
			if($(window).width()>770){
				if($(document).scrollTop()>200){
					$("#toTop").fadeIn(500);
				}
				$("#navbar_header").unbind("click");
			}else{
				$("#toTop").fadeOut(500);
				$("#navbar_header").unbind("click");
				$("#navbar_header").bind("click",function(){
		      		i++;
		        	setTimeout(function () {
		            	i = 0;
		        	}, 500);
		        	if (i > 1) {
		            	slider();
		            	i = 0;
		        	}
	    		});
			}
		});
});
/*加载首页的数据*/
function getIndexPage(url,page){
	$.get(url+'page='+page,function(data){
		var items=[];
		if(data.success==true){
			$.each(data["data"],function(key,val){
				var str="";
				if (val["top"]==true) {
					str='<span class="put_top"><span>置顶</span></span>';
				}else if(val["top"]!=true&&val["good"]==true){
					str='<span class="put_top"><span>精华</span></span>';
				}else if(val["top"]!=true&&val["good"]!=true&&val["tab"]!=undefined){
					var tab="";
					if (val["tab"]=="ask") {
						tab="问答";
					}else if(val["tab"]=="share"){
						tab="分享";
					}else if(val["tab"]=="job"){
						tab="招聘";
					}
					str='<span class="topiclist-tab"><span>'+tab+'</span></span>';
				}
				items.push('<li class="cell clearfloat"><a class="user_icon fl" href=""><img src="'+val.author.avatar_url+'" alt="'
					+val["author"]["loginname"]+'"></a><span class="visit_num fl"><span >'+val.reply_count+'</span><span>/</span><span>'
					+val["visit_count"]+'</span></span><div class="fl topic_titles">'+str+'<a href="http://cnodejs.org/topic/'+val["id"]+'">'
					+val["title"]+'</a></div><a class="visit_time fr" href=""><img src="'+val["author"]["avatar_url"]+'" alt=""><span>'
					+formatTime(val["create_at"])+'</span></a></li>');
			});
			$("#topic_list").children().remove();
			$("#topic_list").append(items);
		}
	});
}

/*计算时间*/
function formatTime(time){
	var nowTime=new Date();
	var second=Math.round((nowTime-new Date(time))/1000);
	var minute=Math.round(second/60);
	var hour=Math.round(minute/60);
	var day=Math.round(hour/24);
	var month=Math.round(day/30);
	var year=Math.round(month/12);
	if (second<60) {
		return second+'秒前';
	}else if (minute<60) {
		return minute+'分钟前';
	}else if (hour<24) {
		return hour+'小时前';
	}else if (day<30) {
		return day+'天前';
	}else if(month<12){
		return month+'月前';
	}else{
		return year+'年前';
	}
}

/*动态分页效果*/
function getPageNum(currentpage){
	var temppage='<ul class="pagination"><li><a class="prevpage" href="javascript:void(0)">&laquo;</a></li>';
	var pagenum=currentpage;
	var flag=true;
	while(flag&&(pagenum-currentpage)<5){
		$.get("http://cnodejs.org/api/v1/topics?page="+pagenum,function(data){
			flag=(data.data==""?false:true)
		});
		pagenum++;
	}
	for (var i = 5; i > 0; i--) {
		temppage+='<li><a href="javascript:void(0)" data-page="'+(pagenum-i)+'">'+(pagenum-i)+'</a></li>'
	}
		temppage+='<li class="disabled"><a>...</a></li>'
                +'<li><a class="nextpage" href="javascript:void(0)">&raquo;</a></li>'
              	+'</ul>';
              // console.log(pagenum);
    $("#topic_list").next().remove();
	$("#topic_list").after(temppage);
//	$(".pagination li").eq(currentpage).addClass("active").siblings().removeClass("active");
//	console.log(currentpage)
}

/*分类按钮*/
function getTab(tab){
	currenttaburl=apiurl+tab.attr("data-link")+'&';
	currentpage=1;
	getIndexPage(currenttaburl,currentpage);
}
/*页面滑动*/
function slider(){
	var top=$(window).scrollTop(top);
	$('body,html').animate({scrollTop:"100rem"},500);
}
/*加载条*/
function loading(){
	$("#floor").fadeIn(2000);
	$("#floor").fadeOut(2000);
}