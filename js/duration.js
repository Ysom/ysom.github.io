!(function() {
	var isGithub = window.location.hostname.includes('github')
	var githubT = new Date("2019-09-24 16:00:00");  /** 此处是github计时的起始时间 **/
	var giteeT = new Date("2020-12-13 14:00:00");  /** 此处是gitee计时的起始时间 **/
	var gTime = isGithub ? githubT : giteeT
  function update() {
    var now = new Date();
    now.setTime(now.getTime()+250);
    days = (now - gTime ) / 1000 / 60 / 60 / 24;
    dnum = Math.floor(days);
    hours = (now - gTime ) / 1000 / 60 / 60 - (24 * dnum);
    hnum = Math.floor(hours);
    if(String(hnum).length === 1 ){
      hnum = "0" + hnum;
    }
    minutes = (now - gTime ) / 1000 /60 - (24 * 60 * dnum) - (60 * hnum);
    mnum = Math.floor(minutes);
    if(String(mnum).length === 1 ){
      mnum = "0" + mnum;
    }
    seconds = (now - gTime ) / 1000 - (24 * 60 * 60 * dnum) - (60 * 60 * hnum) - (60 * mnum);
    snum = Math.round(seconds);
    if(String(snum).length === 1 ){
      snum = "0" + snum;
    }
    document.getElementById("timeDate").innerHTML = "本站已安全运行&nbsp"+dnum+"&nbsp天";
    document.getElementById("times").innerHTML = hnum + "&nbsp小时&nbsp" + mnum + "&nbsp分&nbsp" + snum + "&nbsp秒";
  }
  setInterval(update, 1000);
})();