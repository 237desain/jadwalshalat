function PrayTimes(method){var
timeNames={imsak:"Imsak",subuh:"Subuh",sunrise:"Sunrise",dhuhur:"Dhuhur",ashar:"Ashar",sunset:"Sunset",maghrib:"Maghrib",isya:"Isya",midnight:"Midnight"},methods={Depag:{name:'Kementerian Agama RI',params:{subuh:20,isya:18}},MWL:{name:'Muslim World League',params:{subuh:18,isya:17}},ISNA:{name:'Islamic Society of North America (ISNA)',params:{subuh:15,isya:15}},Egypt:{name:'Egyptian General Authority of Survey',params:{subuh:19.5,isya:17.5}},Makkah:{name:'Umm Al-Qura University, Makkah',params:{subuh:18.5,isya:'90 min'}},Karachi:{name:'University of Islamic Sciences, Karachi',params:{subuh:18,isya:18}},Tehran:{name:'Institute of Geophysics, University of Tehran',params:{subuh:17.7,isya:14,maghrib:4.5,midnight:'Jafari'}},Jafari:{name:'Shia Ithna-Ashari, Leva Institute, Qum',params:{subuh:16,isya:14,maghrib:4,midnight:'Jafari'}}},defaultParams={maghrib:'0 min',midnight:'Standard'},calcMethod='Depag',setting={imsak:'10 min',dhuhur:'0 min',ashar:'Standard',highLats:'NightMiddle'},timeFormat='24h',timeSuffixes=['am','pm'],invalidTime='-----',numIterations=1,offset={},lat,lng,elv,timeZone,jDate;var defParams=defaultParams;for(var i in methods){var params=methods[i].params;for(var j in defParams)
if((typeof(params[j])=='undefined'))
params[j]=defParams[j];};calcMethod=methods[method]?method:calcMethod;var params=methods[calcMethod].params;for(var id in params)
setting[id]=params[id];for(var i in timeNames)
offset[i]=0;return{setMethod:function(method){if(methods[method]){this.adjust(methods[method].params);calcMethod=method;}},adjust:function(params){for(var id in params)
setting[id]=params[id];},tune:function(timeOffsets){for(var i in timeOffsets)
offset[i]=timeOffsets[i];},getMethod:function(){return calcMethod;},getSetting:function(){return setting;},getOffsets:function(){return offset;},getDefaults:function(){return methods;},getTimes:function(date,coords,timezone,dst,format){lat=1*coords[0];lng=1*coords[1];elv=coords[2]?1*coords[2]:0;timeFormat=format||timeFormat;if(date.constructor===Date)
date=[date.getFullYear(),date.getMonth()+1,date.getDate()];if(typeof(timezone)=='undefined'||timezone=='auto')
timezone=this.getTimeZone(date);if(typeof(dst)=='undefined'||dst=='auto')
dst=this.getDst(date);timeZone=1*timezone+(1*dst?1:0);jDate=this.julian(date[0],date[1],date[2])-lng/(15*24);return this.computeTimes();},getFormattedTime:function(time,format,suffixes){if(isNaN(time))
return invalidTime;if(format=='Float')return time;suffixes=suffixes||timeSuffixes;time=DMath.fixHour(time+0.5/60);var hours=Math.floor(time);var minutes=Math.floor((time-hours)*60);var suffix=(format=='12h')?suffixes[hours<12?0:1]:'';var hour=(format=='24h')?this.twoDigitsFormat(hours):((hours+12-1)%12+1);return hour+':'+this.twoDigitsFormat(minutes)+(suffix?' '+suffix:'');},midDay:function(time){var eqt=this.sunPosition(jDate+time).equation;var noon=DMath.fixHour(12-eqt);return noon;},sunAngleTime:function(angle,time,direction){var decl=this.sunPosition(jDate+time).declination;var noon=this.midDay(time);var t=1/15*DMath.arccos((-DMath.sin(angle)-DMath.sin(decl)*DMath.sin(lat))/(DMath.cos(decl)*DMath.cos(lat)));return noon+(direction=='ccw'?-t:t);},asharTime:function(factor,time){var decl=this.sunPosition(jDate+time).declination;var angle=-DMath.arccot(factor+DMath.tan(Math.abs(lat-decl)));return this.sunAngleTime(angle,time);},sunPosition:function(jd){var D=jd-2451545.0;var g=DMath.fixAngle(357.529+0.98560028*D);var q=DMath.fixAngle(280.459+0.98564736*D);var L=DMath.fixAngle(q+1.915*DMath.sin(g)+0.020*DMath.sin(2*g));var R=1.00014-0.01671*DMath.cos(g)-0.00014*DMath.cos(2*g);var e=23.439-0.00000036*D;var RA=DMath.arctan2(DMath.cos(e)*DMath.sin(L),DMath.cos(L))/15;var eqt=q/15-DMath.fixHour(RA);var decl=DMath.arcsin(DMath.sin(e)*DMath.sin(L));return{declination:decl,equation:eqt};},julian:function(year,month,day){if(month<=2){year-=1;month+=12;};var A=Math.floor(year/100);var B=2-A+Math.floor(A/4);var JD=Math.floor(365.25*(year+4716))+Math.floor(30.6001*(month+1))+day+B-1524.5;return JD;},computePrayerTimes:function(times){times=this.dayPortion(times);var params=setting;var imsak=this.sunAngleTime(this.eval(params.imsak),times.imsak,'ccw');var subuh=this.sunAngleTime(this.eval(params.subuh),times.subuh,'ccw');var sunrise=this.sunAngleTime(this.riseSetAngle(),times.sunrise,'ccw');var dhuhur=this.midDay(times.dhuhur);var ashar=this.asharTime(this.asharFactor(params.ashar),times.ashar);var sunset=this.sunAngleTime(this.riseSetAngle(),times.sunset);;var maghrib=this.sunAngleTime(this.eval(params.maghrib),times.maghrib);var isya=this.sunAngleTime(this.eval(params.isya),times.isya);return{imsak:imsak,subuh:subuh,sunrise:sunrise,dhuhur:dhuhur,ashar:ashar,sunset:sunset,maghrib:maghrib,isya:isya};},computeTimes:function(){var times={imsak:5,subuh:5,sunrise:6,dhuhur:12,ashar:13,sunset:18,maghrib:18,isya:18};for(var i=1;i<=numIterations;i++)
times=this.computePrayerTimes(times);times=this.adjustTimes(times);times.midnight=(setting.midnight=='Jafari')?times.sunset+this.timeDiff(times.sunset,times.subuh)/2:times.sunset+this.timeDiff(times.sunset,times.sunrise)/2;times=this.tuneTimes(times);return this.modifyFormats(times);},adjustTimes:function(times){var params=setting;for(var i in times)
times[i]+=timeZone-lng/15;if(params.highLats!='None')
times=this.adjustHighLats(times);if(this.isMin(params.imsak))
times.imsak=times.subuh-this.eval(params.imsak)/60;if(this.isMin(params.maghrib))
times.maghrib=times.sunset+this.eval(params.maghrib)/60;if(this.isMin(params.isya))
times.isya=times.maghrib+this.eval(params.isya)/60;times.dhuhur+=this.eval(params.dhuhur)/60;return times;},asharFactor:function(asharParam){var factor={Standard:1,Hanafi:2}[asharParam];return factor||this.eval(asharParam);},riseSetAngle:function(){var angle=0.0347*Math.sqrt(elv);return 0.833+angle;},tuneTimes:function(times){for(var i in times)
times[i]+=offset[i]/60;return times;},modifyFormats:function(times){for(var i in times)
times[i]=this.getFormattedTime(times[i],timeFormat);return times;},adjustHighLats:function(times){var params=setting;var nightTime=this.timeDiff(times.sunset,times.sunrise);times.imsak=this.adjustHLTime(times.imsak,times.sunrise,this.eval(params.imsak),nightTime,'ccw');times.subuh=this.adjustHLTime(times.subuh,times.sunrise,this.eval(params.subuh),nightTime,'ccw');times.isya=this.adjustHLTime(times.isya,times.sunset,this.eval(params.isya),nightTime);times.maghrib=this.adjustHLTime(times.maghrib,times.sunset,this.eval(params.maghrib),nightTime);return times;},adjustHLTime:function(time,base,angle,night,direction){var portion=this.nightPortion(angle,night);var timeDiff=(direction=='ccw')?this.timeDiff(time,base):this.timeDiff(base,time);if(isNaN(time)||timeDiff>portion)
time=base+(direction=='ccw'?-portion:portion);return time;},nightPortion:function(angle,night){var method=setting.highLats;var portion=1/2
if(method=='AngleBased')
portion=1/60*angle;if(method=='OneSeventh')
portion=1/7;return portion*night;},dayPortion:function(times){for(var i in times)
times[i]/=24;return times;},getTimeZone:function(date){var year=date[0];var t1=this.gmtOffset([year,0,1]);var t2=this.gmtOffset([year,6,1]);return Math.min(t1,t2);},getDst:function(date){return 1*(this.gmtOffset(date)!=this.getTimeZone(date));},gmtOffset:function(date){var localDate=new Date(date[0],date[1]-1,date[2],12,0,0,0);var GMTString=localDate.toGMTString();var GMTDate=new Date(GMTString.substring(0,GMTString.lastIndexOf(' ')-1));var hoursDiff=(localDate-GMTDate)/(1000*60*60);return hoursDiff;},eval:function(str){return 1*(str+'').split(/[^0-9.+-]/)[0];},isMin:function(arg){return(arg+'').indexOf('min')!=-1;},timeDiff:function(time1,time2){return DMath.fixHour(time2-time1);},twoDigitsFormat:function(num){return(num<10)?'0'+num:num;}}}
var DMath={dtr:function(d){return(d*Math.PI)/180.0;},rtd:function(r){return(r*180.0)/Math.PI;},sin:function(d){return Math.sin(this.dtr(d));},cos:function(d){return Math.cos(this.dtr(d));},tan:function(d){return Math.tan(this.dtr(d));},arcsin:function(d){return this.rtd(Math.asin(d));},arccos:function(d){return this.rtd(Math.acos(d));},arctan:function(d){return this.rtd(Math.atan(d));},arccot:function(x){return this.rtd(Math.atan(1/x));},arctan2:function(y,x){return this.rtd(Math.atan2(y,x));},fixAngle:function(a){return this.fix(a,360);},fixHour:function(a){return this.fix(a,24);},fix:function(a,b){a=a-b*(Math.floor(a/b));return(a<0)?a+b:a;}}
var prayTimes=new PrayTimes();