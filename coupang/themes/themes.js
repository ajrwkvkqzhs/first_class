
"use strict";
// One semantic mobile login prototype shared by 20 independent theme pages.
// No credential storage, network request, or real authentication.
const mount = document.getElementById("app");
if (mount) {
  const allowedScreens = ["login","reset","signup","find"];
  const headings = {login:"로그인",reset:"비밀번호 재설정",signup:"회원가입",find:"아이디 찾기"};
  const view = () => {
    const v = new URLSearchParams(location.search).get("screen") || "login";
    return allowedScreens.includes(v) ? v : "login";
  };
  const logo = '<span class="brand-logo" role="img" aria-label="쿠팡 로고"></span>';
  const decoration = '<span class="hero-deco" aria-hidden="true"><i></i><i></i><i></i></span>';
  const screenLink = (screen,label) => '<a href="?screen=' + screen + '" data-screen="' + screen + '">' + label + '</a>';
  const header = (kicker,title,sub) =>
    '<header class="app-header">' + logo +
    '<p class="hero-kicker">' + kicker + '</p><h1 class="hero-title">' + title +
    '</h1><p class="hero-sub">' + sub + '</p>' + decoration + '</header>';
  const field = (id,label,placeholder,type,autocomplete) =>
    '<div class="field"><label for="' + id + '">' + label + '</label><div class="input-wrap"><input id="' + id +
    '" type="' + type + '" placeholder="' + placeholder + '" autocomplete="' + autocomplete + '"' +
    (type === "password" ? ' class="password-input"' : "") + '>' +
    (type === "password" ? '<button type="button" class="toggle-password" data-password="' + id + '" aria-label="비밀번호 표시">보기</button>' : "") +
    '</div><p class="field-message" id="' + id + '-error" role="alert"></p></div>';
  const notice = '<p class="notice" id="form-notice" role="status" hidden></p>';
  const showLogin = () =>
    header("MEMBER ACCESS  /  COUPANG","안녕하세요,<br><em>쿠팡입니다.</em>","로그인하고 더 편리하게 쇼핑하세요.") +
    '<section class="auth-panel"><span class="section-tag">01 / SIGN IN</span>' +
    '<form id="login-form" novalidate><fieldset style="border:0;padding:0;margin:0">' +
    field("user-id","아이디(이메일)","아이디(이메일)을 입력해 주세요.","text","username") +
    field("user-pass","비밀번호","비밀번호를 입력해 주세요.","password","current-password") +
    '<div class="options"><label class="checkline"><input type="checkbox" id="auto-login" checked>자동로그인</label><label class="checkline"><input type="checkbox" id="save-id">아이디저장</label></div>' +
    '<button type="submit" class="primary-btn" id="login-submit" disabled>로그인 →</button>' +
    '</fieldset></form>' + notice + '</section>' +
    '<nav class="account-links" aria-label="계정 관리">' +
    screenLink("find","아이디 찾기") + screenLink("reset","비밀번호 재설정") + screenLink("signup","회원가입") + '</nav>' +
    '<section class="sns-login"><div class="sns-label">SNS로 간단하게 로그인</div><div class="sns-icons">' +
    '<button class="kakao" type="button" data-social="카카오" aria-label="카카오 로그인 시연">Ka</button>' +
    '<button class="naver" type="button" data-social="네이버" aria-label="네이버 로그인 시연">N</button>' +
    '<button class="apple" type="button" data-social="애플" aria-label="애플 로그인 시연">●</button>' +
    '<button type="button" data-social="삼성카드" aria-label="삼성카드 로그인 시연">S</button>' +
    '</div></section>';
  const showReset = () =>
    header("ACCOUNT SECURITY","새로운 비밀번호를<br><em>입력해주세요.</em>","8~20자, 영문·숫자·특수문자 중 3가지 이상을 조합해 주세요.") +
    '<section class="auth-panel"><span class="section-tag">02 / PASSWORD RESET</span>' +
    '<form id="reset-form" novalidate>' +
    field("new-pass","새 비밀번호","새로운 비밀번호를 입력해 주세요.","password","new-password") +
    field("confirm-pass","비밀번호 확인","동일한 비밀번호를 다시 입력해 주세요.","password","new-password") +
    '<ul class="help-list"><li>최소 8글자 이상, 최대 20글자</li><li>영어 대/소문자·숫자·특수문자 중 3개 이상 조합</li><li>반복·연속 문자 및 쉬운 번호 사용 자제</li></ul>' +
    '<button class="primary-btn" type="submit">완료</button></form>' + notice +
    '<p class="terms-intro">SNS 서비스의 비밀번호는 해당 SNS 제공 업체에서 별도로 변경해야 합니다.</p></section>' +
    '<nav class="account-links">' + screenLink("login","로그인으로 돌아가기") + '</nav>';
  const terms = [
    ["age","[필수] 만 14세 이상입니다.",true],
    ["service","[필수] 서비스 이용약관",true],
    ["privacy","[필수] 개인정보 수집·이용 동의",true],
    ["location","[필수] 위치기반 서비스 이용약관",true],
    ["marketing","[선택] 마케팅 정보 수신",false],
    ["sms","[선택] SMS 수신 동의",false],
    ["push","[선택] 서비스 혜택 알림(Push)",false],
    ["night","[선택] 야간 알림 수신 동의",false]
  ];
  const showSignup = () =>
    header("JOIN COUPANG","쿠팡 서비스 이용약관에<br><em>동의해 주세요.</em>","가입을 원하시면 이용약관에 동의 후 본인인증을 진행해 주세요.") +
    '<section class="auth-panel"><span class="section-tag">03 / MEMBERSHIP</span>' +
    '<form id="signup-form" novalidate><div class="terms-all"><label class="checkline"><input id="agree-all" type="checkbox">네, 모두 동의합니다.</label></div>' +
    '<p class="terms-intro">전체 동의에는 선택 항목이 포함됩니다. 필수 항목만 동의해도 다음 단계로 진행할 수 있습니다.</p>' +
    '<div class="terms-list">' + terms.map(([id,label,required]) =>
      '<div class="terms-item"><label class="checkline"><input type="checkbox" class="term-item" id="term-' + id + '"' +
      (required ? ' data-required="true"' : '') + '>' + label + '</label></div>'
    ).join("") + '</div>' +
    '<button class="primary-btn" id="signup-submit" type="submit" disabled>본인인증 →</button></form>' + notice + '</section>' +
    '<nav class="account-links">' + screenLink("login","로그인으로 돌아가기") + '</nav>';
  const showFind = () =>
    header("ACCOUNT RECOVERY","아이디를<br><em>찾아드릴게요.</em>","가입 시 사용한 이름과 휴대전화 번호를 입력해 주세요.") +
    '<section class="auth-panel"><span class="section-tag">04 / FIND ID</span><form id="find-form" novalidate>' +
    field("find-name","이름","이름을 입력해 주세요.","text","name") +
    field("find-phone","휴대전화 번호","010-0000-0000","tel","tel") +
    '<button class="primary-btn" type="submit">아이디 찾기</button></form>' + notice + '</section>' +
    '<nav class="account-links">' + screenLink("login","로그인으로 돌아가기") + screenLink("signup","회원가입") + '</nav>';
  function render() {
    const v=view();
    document.getElementById("screen-heading").textContent=headings[v];
    mount.classList.toggle("screen-page",v!=="login");
    mount.innerHTML=({login:showLogin,reset:showReset,signup:showSignup,find:showFind})[v]();
    document.title=headings[v]+" | Coupang UI Lab";
    window.scrollTo(0,0);
  }
  function navigate(screen) {
    const u = new URL(location.href);
    if(screen==="login") u.searchParams.delete("screen");
    else u.searchParams.set("screen",screen);
    history.pushState({screen},"",u);
    render();
  }
  const notify = (message) => {
    const n=document.getElementById("form-notice");
    if(n){n.textContent=message;n.hidden=false;}
  };
  const setError=(id,msg)=>{
    const el=document.getElementById(id),error=document.getElementById(id+"-error");
    if(el)el.setAttribute("aria-invalid",String(Boolean(msg)));
    if(error)error.textContent=msg || "";
  };
  mount.addEventListener("click",e=>{
    const a=e.target.closest("[data-screen]");
    if(a){e.preventDefault();navigate(a.dataset.screen);return;}
    const pw=e.target.closest("[data-password]");
    if(pw){
      const el=document.getElementById(pw.dataset.password);
      if(!el)return;
      const showing=el.type==="password";
      el.type=showing?"text":"password";pw.textContent=showing?"숨기기":"보기";
      pw.setAttribute("aria-label",showing?"비밀번호 숨기기":"비밀번호 표시");
      return;
    }
    const social=e.target.closest("[data-social]");
    if(social)notify(social.dataset.social+" 로그인은 UI 시연만 제공합니다. 실제 인증 서버는 연결되지 않았습니다.");
  });
  mount.addEventListener("input",e=>{
    if(view()==="login"){
      const id=document.getElementById("user-id"),pw=document.getElementById("user-pass"),btn=document.getElementById("login-submit");
      btn.disabled=!(id.value.trim() && pw.value);
      if(e.target.id==="user-id")setError("user-id","");
      if(e.target.id==="user-pass")setError("user-pass","");
    }
    if(view()==="signup")updateTerms();
  });
  mount.addEventListener("change",e=>{
    if(view()!=="signup")return;
    if(e.target.id==="agree-all"){
      mount.querySelectorAll(".term-item").forEach(x=>x.checked=e.target.checked);
    }
    updateTerms();
  });
  function updateTerms(){
    const all=[...mount.querySelectorAll(".term-item")];
    const required=all.filter(x=>x.dataset.required==="true");
    const btn=document.getElementById("signup-submit");
    const allBox=document.getElementById("agree-all");
    if(allBox)allBox.checked=all.length>0&&all.every(x=>x.checked);
    if(btn)btn.disabled=!required.every(x=>x.checked);
  }
  mount.addEventListener("submit",e=>{
    e.preventDefault();
    if(e.target.id==="login-form"){
      const id=document.getElementById("user-id").value.trim();
      const pw=document.getElementById("user-pass").value;
      let valid=true;
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(id)){setError("user-id","이메일 형식으로 입력해 주세요.");valid=false;}
      if(!pw){setError("user-pass","비밀번호를 입력해 주세요.");valid=false;}
      if(valid)notify("입력 확인 완료: 실제 쿠팡 계정 서버에 로그인하지 않는 디자인 시연입니다.");
    }else if(e.target.id==="reset-form"){
      const p=document.getElementById("new-pass").value,c=document.getElementById("confirm-pass").value;
      const categories=[/[a-z]/.test(p),/[A-Z]/.test(p),/[0-9]/.test(p),/[^A-Za-z0-9]/.test(p)].filter(Boolean).length;
      const valid=p.length>=8&&p.length<=20&&categories>=3;
      setError("new-pass",valid?"":"8~20자이며 영문 대·소문자, 숫자, 특수문자 중 3가지 이상을 조합해 주세요.");
      setError("confirm-pass",p===c?"":"비밀번호가 서로 일치하지 않습니다.");
      if(valid&&p===c)notify("비밀번호 형식 검사 완료. 실제 계정 변경은 수행되지 않습니다.");
    }else if(e.target.id==="signup-form"){
      updateTerms();
      if(!document.getElementById("signup-submit").disabled)notify("필수 약관 동의를 확인했습니다. 본인인증은 연결되지 않은 시연입니다.");
    }else if(e.target.id==="find-form"){
      const name=document.getElementById("find-name").value.trim(),phone=document.getElementById("find-phone").value.replace(/[^0-9]/g,"");
      setError("find-name",name?"":"이름을 입력해 주세요.");
      setError("find-phone",/^01[016789]\d{7,8}$/.test(phone)?"":"휴대전화 번호 형식을 확인해 주세요.");
      if(name&&/^01[016789]\d{7,8}$/.test(phone))notify("입력 형식을 확인했습니다. 실제 계정 조회는 수행되지 않습니다.");
    }
  });
  window.addEventListener("popstate",render);
  render();
}
