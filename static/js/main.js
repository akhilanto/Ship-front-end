var multisel=false;
var last_sel='';

function beautify(){
	var i=0,last_cell='A0',max_cells=1,tmax_cells=1,patt=t_patt=Array();
			$('.scroller .column').each(function(){
				var c=$(this).attr('id').replace('c-','');
				var a=c.replace(/\d+/g, '');
				var b=last_cell.replace(/\d+/g, '');
			
				var a_n = c.match(/\d/g); a_n = parseInt(a_n.join(""));
				var b_n = last_cell.match(/\d/g); b_n = parseInt(b_n.join(""));
				
				var takeme=Array();
				
				var set_long=false;
				var r=true;
				var c_current=a;
				tmax_cells++;
				if(a>b && a_n==b_n){
					r=false;
				}
				if(a.length>b.length){
					r=false;
				}
				if(a.length<b.length){
					r=true;
				}
				if(r){
					if(tmax_cells>max_cells){
						max_cells=tmax_cells;
						set_long=true;
					}
					tmax_cells=1;
					
					
					$(this).before('<div id="r-'+(b_n)+'" class="row ren"></div><div class="margin-row mar ren"><div>'+(a_n)+'</div></div>');	
					$('.scroller').css('width',(100*(max_cells-1))+31);	
					b='';
				}
					
				var col_em=missingcells(b,a);
				for(var i in col_em){
					tmax_cells++;
					$(this).before('<div id="c-'+col_em[i]+a_n+'" class="column  ren c-'+col_em[i]+a_n+' cl'+col_em[i]+' r'+a_n+'"><div class="dropdown"><div class="cover"><span></span></div><div class="print"></div></div></div>');
					//console.log(b+','+a+'___'+col_em[i]);
					takeme.push(col_em[i]);
				}
				if(b==''){
					//t_patt.unshift(a);
					// console.log('Zold '+t_patt);
					}
				else{		
					//console.log('takeme '+takeme);
					//console.log('old '+t_patt);
					t_patt= t_patt.concat(takeme);
					t_patt.push(a);
					//console.log('new '+t_patt);
					
				}
				
				if(r){
					
					//console.log('--->'+a_n);
					//console.log(t_patt);
					if(set_long){
						
						patt=Array();
						if(t_patt.length>0){
						var full=missingcells('Z',t_patt[0]);
						for(var i in full){
							patt.push(full[i]);
						} }
						patt=patt.concat(t_patt); 
					}
					//console.log('CUR '+patt);
					t_patt=Array();
				}
				last_cell=c;		
				
			});
			//one row is left. adding manually
			var b_n = last_cell.match(/\d/g); b_n = parseInt(b_n.join(""));
			$('.scroller').find('.clear').before('<div id="r-'+b_n+'" class="row ren"></div>');
			//console.log(patt);
			
			$('.scroller .row').each(function(){
					var ap=$(this).attr('id').replace('r-','');
					var apn = ap.match(/\d/g); apn = parseInt(apn.join(""));
					if(apn>0){
					//	console.log(ap+'-'+$('.'+ap).length);
					for(var i=$('.r'+ap).length;i<max_cells-1;i++){
						$('.scroller #r-'+ap).before('<div id="c-'+patt[i]+ap+'" class="column  ren c-'+patt[i]+ap+' cl'+patt[i]+' r'+ap+'"><div class="dropdown"><div class="cover"><span></span></div><div class="print"></div></div></div>');
						
					} }
					
				});
				
			for(var i in patt){
				$('#head-col').append('<div class="mar margin-col ren" id="cl-'+patt[i]+'"><div>'+patt[i]+'</div></div>');
			}			
				
			$('.scroller').show();
			$('.workspace').show();
	return true;
}


function missingcells_a(a,b) {
	if(a==b)
	{	
		return [];
	}
	var r='ZABCDEFGHIJKLMNOPQRSTUVWXYZ';
	var m=r.match(new RegExp(a + "(.*)" + b));
	if(m){
		return m[1].split("");
	} else{
		return [];
	}
	
}

function missingcells(a,b) {
	if(a==b || a==null || b==null)
	{	
		return [];
	}
	
	var chars='ABCDEFGHIJKLMNOPQRSTUVWXYZ'; chars=chars.split('');
	var res=Array();
	var t=b.split('');
	var f=false;
    while(t.length>0 && !f){
		var l=t.length-1;
		var c=chars.indexOf(t[l]);
		for(var i=c;i>=0;i--){
			t[l]=chars[i];
            var v=t.join('')
            if(v==a){
            	f=true; break;
            }
			
			res.push(v);
		}
		var s=true;
		for(var r=l-1;r>=0;r--){
      		var q=chars.indexOf(t[r]);
			var q=chars[q-1];
			t[r]=q;
			if(q){
                s=false;
				break;
			}
            t[r]='Z';
            t=t.join('').split('');
        }
		t[t.length-1]='Z';
        if(s){ t.shift(); }
        
    }
	res.reverse();
	res.pop();
    return res;
	
}


function activecell(cells){
	$('.pickup div.column').removeClass('s');
	for(var i in cells){ 
		$('.pickup div.c-'+cells[i]).addClass('s');
	}
}

	
	$('.show-dropdown .column').live('click',function(){
		$('.show-dropdown .column').find('.dropdown').removeClass('open');
		$(this).find('.dropdown').toggleClass('open');
		
	});
$(document).keydown(function(e) {
	if(e.shiftKey) { 
		multisel=true;
	}
});
$(document).keyup(function(e) {
	multisel=false;
	
});
		
$('.pickup .column').live('click',function(){
		if($(this).hasClass('s')){
			$(this).removeClass('s');
		}
		else{
			var this_sel=$(this).attr('id').replace('c-','');		
			mark_single(this_sel);
					
			if(multisel){
				mark(last_sel,this_sel);			
			} else{
				last_sel=this_sel;
			}
		}
	});

function mark_single(c1){
	$('.pickup #c-'+c1).addClass('s');
}

function remove_mark(){
	$('.pickup .column').removeClass('s');
}
function mark(c1,c2){
	var cells=Array();		
			cells.push(c1);		
			cells.push(c2);		
			
			var a=cells[0].replace(/\d+/g, '');
			var b=cells[1].replace(/\d+/g, '');
			
			
			var a_n = cells[0].match(/\d/g); a_n = parseInt(a_n.join(""));
			var b_n = cells[1].match(/\d/g); b_n = parseInt(b_n.join(""));
			
			if(b>a){
				var n = missingcells(a,b); 
			} else{
				var n = missingcells(b,a); 
			}
			if(a.length>b.length){
				var n = missingcells(b,a); 
			} else if(a.length<b.length){				
				var n = missingcells(a,b);
			}
			
			if(a_n>b_n){
				var t= a_n;
				a_n=b_n;
				b_n=t;
			}
			
			n.push(a);
			n.push(b);
			
			
			for(var j in n){				
				for(var i=a_n;i<=b_n;i++){
					//console.log(n[j]+i);
					$('.pickup #c-'+n[j]+i).addClass('s');
				}
			}
		
		console.log(cells);
}

function printable(){
	var table = $("#print table"),

					tableWidth = table.outerWidth(),

					pageWidth = 600,

					pageCount = Math.ceil(tableWidth / pageWidth),

					printWrap = $("<div></div>").insertAfter(table),

					i,

					printPage;

				for (i = 0; i < pageCount; i++) {

					printPage = $("<div class='keep-close'></div>").css({

						"overflow": "hidden",

						"width": pageWidth,

						"page-break-before": i === 0 ? "auto" : "always"

					}).appendTo(printWrap);

					table.clone().removeAttr("id").appendTo(printPage).css({

						"position": "relative",

						"left": -i * pageWidth

					});

				}

				table.hide();

				$(this).prop("disabled", true);
	
}
function trimmed(t)
{
	return t.toString().substr(0,25);
	//return t.substr(0, 50);
}
